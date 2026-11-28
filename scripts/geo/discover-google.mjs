#!/usr/bin/env node
/**
 * Discover new facilities via Google Places Text Search (New).
 *
 * Usage:
 *   GOOGLE_PLACES_KEY=AIza... node scripts/geo/discover-google.mjs
 *   GOOGLE_PLACES_KEY=AIza... node scripts/geo/discover-google.mjs --type "primary school"
 *   GOOGLE_PLACES_KEY=AIza... node scripts/geo/discover-google.mjs --ward esise
 *
 * Searches for facilities near each ward's centroid using the Places API (New)
 * Text Search. Results are written to data-src/google-discovered.json for
 * human review before being fed through the reconcile pipeline.
 *
 * Cost: each search is one Text Search request. With 20 wards × ~3 search
 * types (primary school, secondary school, clinic) = ~60 requests, well
 * within the $200/month free credit (~5,000 Text Search requests).
 *
 * The script pauses 500ms between requests to stay well under rate limits.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const OUT = resolve(ROOT, 'data-src/google-discovered.json');

const API_KEY = process.env.GOOGLE_PLACES_KEY;
if (!API_KEY) {
  console.error('Set GOOGLE_PLACES_KEY environment variable.');
  process.exit(1);
}

const SEARCH_TYPES = [
  'primary school',
  'secondary school',
  'health clinic',
  'dispensary',
  'market',
];

// Parse args
const args = process.argv.slice(2);
const typeFilter = args.includes('--type')
  ? [args[args.indexOf('--type') + 1]]
  : SEARCH_TYPES;
const wardFilter = args.includes('--ward')
  ? args[args.indexOf('--ward') + 1]
  : null;

// Ward centroids (approximate, from ward boundary polygons)
function loadWardCentroids() {
  const geoPath = resolve(ROOT, 'data-src/nyamira-wards-geo.json');
  const raw = JSON.parse(readFileSync(geoPath, 'utf8'));
  const centroids = {};

  const entries = raw.features
    ? raw.features.map((f) => [
        f.properties?.shapeName || f.properties?.name || '',
        f.geometry,
      ])
    : Object.entries(raw).map(([name, val]) => [name, val.geometry || val]);

  for (const [name, geometry] of entries) {
    const slug = name.toLowerCase().replace(/[^a-z]+/g, '');
    if (!slug) continue;
    const coords = extractAllCoords(geometry);
    if (coords.length === 0) continue;
    let sumLat = 0, sumLon = 0;
    for (const [lon, lat] of coords) { sumLat += lat; sumLon += lon; }
    centroids[slug] = {
      lat: sumLat / coords.length,
      lon: sumLon / coords.length,
      name,
    };
  }
  return centroids;
}

function extractAllCoords(geometry) {
  if (!geometry?.coordinates) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates.flat();
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat(2);
  return [];
}

async function textSearch(query, lat, lon, radiusMeters = 8000) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lon },
        radius: radiusMeters,
      },
    },
    maxResultCount: 20,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.types',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text Search ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function classifyPlace(types, name) {
  const t = (types || []).join(' ');
  const n = (name || '').toLowerCase();
  if (/school|university|college/i.test(t) || /school|academy/i.test(n)) return 'Education';
  if (/hospital|doctor|health|pharmacy|dentist/i.test(t) || /dispensary|clinic|hospital/i.test(n)) return 'Health';
  if (/market|store|shop|supermarket/i.test(t)) return 'Market';
  if (/church|mosque|synagogue|hindu_temple/i.test(t)) return 'Worship';
  if (/police|courthouse|city_hall|post_office/i.test(t)) return 'Public office';
  return 'Other';
}

function subtypeFromName(name) {
  const n = (name || '').toLowerCase();
  if (/primary/i.test(n)) return 'primary school';
  if (/secondary|high school/i.test(n)) return 'secondary school';
  if (/polytechnic|tvet/i.test(n)) return 'polytechnic';
  if (/college/i.test(n)) return 'college';
  if (/university/i.test(n)) return 'university';
  if (/nursery|ecde|ecd/i.test(n)) return 'ECDE';
  if (/dispensary/i.test(n)) return 'dispensary';
  if (/health centre|health center/i.test(n)) return 'health centre';
  if (/hospital/i.test(n)) return 'hospital';
  return null;
}

async function run() {
  const centroids = loadWardCentroids();
  const wardSlugs = wardFilter ? [wardFilter] : Object.keys(centroids);
  console.log(`Wards: ${wardSlugs.length}, Search types: ${typeFilter.length}`);
  console.log(`Estimated API calls: ${wardSlugs.length * typeFilter.length}`);

  const allResults = [];
  const seen = new Set();

  for (const ward of wardSlugs) {
    const c = centroids[ward];
    if (!c) {
      console.log(`  Ward "${ward}" not found in boundaries, skipping.`);
      continue;
    }

    for (const searchType of typeFilter) {
      const query = `${searchType} in ${c.name} ward, Nyamira County, Kenya`;
      try {
        const result = await textSearch(query, c.lat, c.lon);
        const places = result.places || [];
        let newCount = 0;
        for (const p of places) {
          const placeId = p.id;
          if (seen.has(placeId)) continue;
          seen.add(placeId);
          const name = p.displayName?.text || '';
          allResults.push({
            googlePlaceId: placeId,
            name,
            category: classifyPlace(p.types, name),
            subtype: subtypeFromName(name),
            lat: p.location?.latitude ? Math.round(p.location.latitude * 100000) / 100000 : null,
            lon: p.location?.longitude ? Math.round(p.location.longitude * 100000) / 100000 : null,
            address: p.formattedAddress || null,
            searchWard: ward,
            searchQuery: searchType,
          });
          newCount++;
        }
        console.log(`  ${ward} / "${searchType}": ${places.length} results, ${newCount} new`);
      } catch (err) {
        console.log(`  ${ward} / "${searchType}": ERROR ${err.message}`);
      }

      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\nTotal unique places discovered: ${allResults.length}`);

  // Category breakdown
  const cats = {};
  for (const r of allResults) cats[r.category] = (cats[r.category] || 0) + 1;
  for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${c}: ${n}`);
  }

  const output = {
    generated: new Date().toISOString().slice(0, 10),
    source: 'Google Places API (New) Text Search',
    note: 'For human review. Run geo:reconcile after approving to merge into facilities.json.',
    count: allResults.length,
    features: allResults,
  };

  writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nWritten to ${OUT}`);
  console.log('Next: review the results, then convert to osm-fresh.json format and run geo:reconcile.');
}

run().catch((err) => { console.error(err); process.exit(1); });
