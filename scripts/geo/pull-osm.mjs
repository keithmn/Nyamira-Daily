#!/usr/bin/env node
/**
 * Pull all mapped features in Nyamira County from OpenStreetMap via the Overpass API.
 *
 * Usage:  node scripts/geo/pull-osm.mjs [--out data-src/osm-fresh.json]
 *
 * What it fetches (inside the Nyamira County boundary, admin_level=4):
 *   - amenity=* (schools, clinics, markets, worship, police, courts, banks, fuel...)
 *   - building=school|hospital|church|mosque|commercial|public
 *   - shop=* (shops and businesses)
 *   - office=government|ngo
 *   - highway=* (roads, paths, tracks — with name or ref)
 *   - place=* (villages, towns, trading centres, suburbs)
 *   - waterway=* (rivers, streams)
 *   - man_made=water_well|water_tower|water_works|reservoir_covered
 *   - landuse=reservoir (dams)
 *
 * Output: a JSON file with every feature, its coordinates (centroid for ways/relations),
 * its OSM tags, and the ward it falls in (matched against ward boundaries).
 *
 * Rate limit: Overpass API requests are heavy. Run this at most once a week.
 * Licence: data is © OpenStreetMap contributors (ODbL). Attribute in any output.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const DEFAULT_OUT = resolve(ROOT, 'data-src/osm-fresh.json');

const out = process.argv.includes('--out')
  ? resolve(process.argv[process.argv.indexOf('--out') + 1])
  : DEFAULT_OUT;

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Nyamira County: OSM relation 3486290. The area ID is relation ID + 3600000000.
const NYAMIRA_AREA_ID = 3600000000 + 3486290;
const query = `
[out:json][timeout:180];
area(${NYAMIRA_AREA_ID})->.nyamira;
(
  nwr["amenity"](area.nyamira);
  nwr["building"~"school|hospital|church|mosque|commercial|public|government"](area.nyamira);
  nwr["shop"](area.nyamira);
  nwr["office"~"government|ngo|administrative"](area.nyamira);
  way["highway"]["name"](area.nyamira);
  way["highway"]["ref"](area.nyamira);
  nwr["place"](area.nyamira);
  nwr["man_made"~"water_well|water_tower|water_works|reservoir_covered"](area.nyamira);
  nwr["waterway"~"river|stream"]["name"](area.nyamira);
  nwr["landuse"="reservoir"](area.nyamira);
  nwr["leisure"~"stadium|sports_centre|pitch"](area.nyamira);
);
out center tags;
`;

async function run() {
  console.log('Querying Overpass API for Nyamira County...');
  console.log('This may take 30–90 seconds.');

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'GusiiDailyMapping/1.0 (civic data project)',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Overpass API error ${res.status}: ${text.slice(0, 500)}`);
    process.exit(1);
  }

  const data = await res.json();
  const elements = data.elements || [];
  console.log(`Received ${elements.length} raw elements from Overpass.`);

  // Load ward boundaries for point-in-polygon matching.
  // nyamira-wards-geo.json is a dict: { WardName: { geometry: { type, coordinates } } }
  let wardBoundaries = null;
  try {
    const geoPath = resolve(ROOT, 'data-src/nyamira-wards-geo.json');
    const raw = JSON.parse(readFileSync(geoPath, 'utf8'));
    if (raw.features) {
      wardBoundaries = raw; // Standard GeoJSON FeatureCollection
    } else {
      // Convert our custom format to a FeatureCollection
      wardBoundaries = {
        type: 'FeatureCollection',
        features: Object.entries(raw).map(([name, val]) => ({
          type: 'Feature',
          properties: { shapeName: name },
          geometry: val.geometry || val,
        })),
      };
    }
    console.log(`Loaded ward boundaries (${wardBoundaries.features?.length ?? 0} wards).`);
  } catch (e) {
    console.warn(`Ward boundaries not found — ward field will be null. (${e.message})`);
  }

  // Extract centroid for each element
  const features = elements.map((el) => {
    let lat, lon;
    if (el.type === 'node') {
      lat = el.lat;
      lon = el.lon;
    } else if (el.center) {
      lat = el.center.lat;
      lon = el.center.lon;
    }
    const tags = el.tags || {};
    const category = classifyTags(tags);
    const ward = lat && lon && wardBoundaries ? findWard(lat, lon, wardBoundaries) : null;

    return {
      osmId: `${el.type}/${el.id}`,
      type: el.type,
      lat: lat ?? null,
      lon: lon ?? null,
      name: tags.name || tags['name:en'] || null,
      category: category.category,
      subtype: category.subtype,
      tags,
      ward,
    };
  }).filter((f) => f.lat !== null);

  // Deduplicate by osmId
  const seen = new Set();
  const unique = features.filter((f) => {
    if (seen.has(f.osmId)) return false;
    seen.add(f.osmId);
    return true;
  });

  // Summary
  const cats = {};
  for (const f of unique) {
    cats[f.category] = (cats[f.category] || 0) + 1;
  }
  console.log(`\nUnique features: ${unique.length}`);
  console.log('By category:');
  for (const [cat, count] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  const wardCounts = {};
  for (const f of unique) {
    const w = f.ward || '(unknown)';
    wardCounts[w] = (wardCounts[w] || 0) + 1;
  }
  console.log('\nBy ward:');
  for (const [w, count] of Object.entries(wardCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${w}: ${count}`);
  }

  const output = {
    generated: new Date().toISOString().slice(0, 10),
    source: 'OpenStreetMap via Overpass API',
    licence: '© OpenStreetMap contributors (ODbL)',
    query: query.trim(),
    count: unique.length,
    features: unique,
  };

  writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nWritten to ${out}`);
}

// --- Classification ---

function classifyTags(tags) {
  const a = tags.amenity || '';
  const b = tags.building || '';
  const s = tags.shop || '';
  const o = tags.office || '';
  const h = tags.highway || '';
  const p = tags.place || '';
  const m = tags.man_made || '';
  const w = tags.waterway || '';
  const l = tags.landuse || '';
  const le = tags.leisure || '';

  // Health
  if (/hospital|clinic|doctors|dentist|pharmacy|health/i.test(a) || b === 'hospital') {
    return { category: 'Health', subtype: a || b };
  }
  // Education
  if (/school|university|college|kindergarten|library/i.test(a) || b === 'school') {
    const name = (tags.name || '').toLowerCase();
    if (/secondary|high school/i.test(name)) return { category: 'Education', subtype: 'secondary school' };
    if (/primary/i.test(name)) return { category: 'Education', subtype: 'primary school' };
    if (/polytechnic|tvet/i.test(name)) return { category: 'Education', subtype: 'polytechnic' };
    if (/university/i.test(a) || /university/i.test(name)) return { category: 'Education', subtype: 'university' };
    if (/college/i.test(a) || /college/i.test(name)) return { category: 'Education', subtype: 'college' };
    if (/kindergarten|ecde|nursery|ecd/i.test(a) || /nursery|ecde|ecd/i.test(name)) return { category: 'Education', subtype: 'ECDE' };
    return { category: 'Education', subtype: a || 'school' };
  }
  // Worship
  if (/place_of_worship/i.test(a) || /church|mosque|chapel/i.test(b)) {
    return { category: 'Worship', subtype: tags.religion || a };
  }
  // Market / commerce
  if (/marketplace|market/i.test(a) || s || /commercial|supermarket|mall/i.test(b)) {
    return { category: 'Market', subtype: a || s || b };
  }
  // Government / public
  if (/police|courthouse|townhall|fire_station|post_office|prison/i.test(a) || /government/i.test(o) || /public|government/i.test(b)) {
    return { category: 'Public office', subtype: a || o || b };
  }
  // Water
  if (/water_well|water_tower|water_works|reservoir/i.test(m) || l === 'reservoir') {
    return { category: 'Water', subtype: m || l };
  }
  if (w) return { category: 'Waterway', subtype: w };
  // Road
  if (h) return { category: 'Road', subtype: h };
  // Place
  if (p) return { category: 'Place', subtype: p };
  // Sport / leisure
  if (le) return { category: 'Leisure', subtype: le };
  // NGO
  if (/ngo/i.test(o)) return { category: 'NGO', subtype: o };
  // Fallback
  return { category: 'Other', subtype: a || b || s || o || 'unknown' };
}

// --- Point-in-polygon (ray casting) for ward matching ---

function findWard(lat, lon, geojson) {
  if (!geojson?.features) return null;
  for (const feature of geojson.features) {
    const name = feature.properties?.shapeName || feature.properties?.name || feature.properties?.ADM3_NAME || null;
    const slug = name ? name.toLowerCase().replace(/[^a-z]+/g, '') : null;
    if (!slug) continue;
    const geom = feature.geometry;
    if (!geom) continue;
    const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    for (const polygon of polygons) {
      if (pointInPolygon(lon, lat, polygon[0])) return slug;
    }
  }
  return null;
}

function pointInPolygon(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

run().catch((err) => { console.error(err); process.exit(1); });
