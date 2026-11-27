#!/usr/bin/env node
/**
 * Geocode facilities using Nominatim (OpenStreetMap's free geocoder).
 *
 * Usage:
 *   node scripts/geo/geocode-nominatim.mjs
 *   node scripts/geo/geocode-nominatim.mjs --dry-run
 *   node scripts/geo/geocode-nominatim.mjs --limit 10
 *
 * No API key needed. No billing. No account.
 *
 * Nominatim's usage policy: max 1 request per second, include a
 * User-Agent with contact info. We pause 1.1s between requests.
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * Set ND_CONTACT_EMAIL in your environment for the User-Agent header
 * (Nominatim policy requests a valid contact). Falls back to a
 * generic project name if unset.
 *
 * For each facility without coordinates, searches by name + ward +
 * "Nyamira County Kenya". Writes candidate coordinates with a note
 * that they are unverified.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FACILITIES_PATH = resolve(ROOT, 'src/data/facilities.json');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10)
  : Infinity;

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const contactEmail = process.env.ND_CONTACT_EMAIL || '';
const userAgent = contactEmail
  ? `GusiiDailyMapping/1.0 (${contactEmail})`
  : 'GusiiDailyMapping/1.0 (civic data project)';

// Nyamira County bounding box (approximate)
const NYAMIRA_BBOX = {
  south: -0.90,
  north: -0.45,
  west: 34.75,
  east: 35.10,
};

async function searchNominatim(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '3',
    viewbox: `${NYAMIRA_BBOX.west},${NYAMIRA_BBOX.north},${NYAMIRA_BBOX.east},${NYAMIRA_BBOX.south}`,
    bounded: '1',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': userAgent },
  });

  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}: ${await res.text().then(t => t.slice(0, 200))}`);
  }
  return res.json();
}

function wardDisplayName(slug) {
  const names = {
    esise: 'Esise', mekenene: 'Mekenene', kiabonyoru: 'Kiabonyoru',
    nyansiongo: 'Nyansiongo', rigoma: 'Rigoma', gachuba: 'Gachuba',
    kemera: 'Kemera', magombo: 'Magombo', manga: 'Manga', gesima: 'Gesima',
    nyamaiya: 'Nyamaiya', bogichora: 'Bogichora', bosamaro: 'Bosamaro',
    bonyamatuta: 'Bonyamatuta', township: 'Township', itibo: 'Itibo',
    bomwagamo: 'Bomwagamo', bokeira: 'Bokeira', magwagwa: 'Magwagwa',
    ekerenyo: 'Ekerenyo',
  };
  return names[slug] || slug;
}

function isInNyamira(lat, lon) {
  return lat >= NYAMIRA_BBOX.south && lat <= NYAMIRA_BBOX.north &&
         lon >= NYAMIRA_BBOX.west && lon <= NYAMIRA_BBOX.east;
}

async function run() {
  const facilities = JSON.parse(readFileSync(FACILITIES_PATH, 'utf8'));
  const targets = facilities.filter((f) => !f.coordinates?.lat);

  console.log(`Facilities without coordinates: ${targets.length}`);
  const batch = targets.slice(0, LIMIT);
  console.log(`Will geocode: ${batch.length}${LIMIT < Infinity ? ` (--limit ${LIMIT})` : ''}`);

  if (DRY_RUN) {
    console.log('\nDry run — would search for:');
    for (const f of batch) {
      console.log(`  ${f.id} ${f.name} (${wardDisplayName(f.ward)})`);
    }
    console.log(`\nEstimated time: ~${Math.ceil(batch.length * 1.2)} seconds (1 req/sec)`);
    return;
  }

  if (!contactEmail) {
    console.log('Tip: set ND_CONTACT_EMAIL for a better User-Agent (Nominatim policy).\n');
  }

  let updated = 0;
  let noResult = 0;
  let outOfBounds = 0;
  const results = [];

  for (let i = 0; i < batch.length; i++) {
    const f = batch[i];
    const ward = wardDisplayName(f.ward);
    const queries = [
      `${f.name}, ${ward}, Nyamira County, Kenya`,
      `${f.name}, Nyamira, Kenya`,
    ];

    let found = false;
    for (const query of queries) {
      try {
        const hits = await searchNominatim(query);
        if (hits.length > 0) {
          const best = hits[0];
          const lat = parseFloat(best.lat);
          const lon = parseFloat(best.lon);

          if (!isInNyamira(lat, lon)) {
            outOfBounds++;
            results.push({ id: f.id, name: f.name, status: 'out-of-bounds', lat, lon, query });
            console.log(`  · ${f.id} ${f.name} → outside Nyamira (${lat.toFixed(4)}, ${lon.toFixed(4)}), skipped`);
            found = true;
            break;
          }

          f.coordinates = {
            lat: Math.round(lat * 100000) / 100000,
            lon: Math.round(lon * 100000) / 100000,
          };
          f.evidenceNote = (f.evidenceNote || '') +
            (f.evidenceNote ? '; ' : '') +
            'Candidate coordinates from Nominatim (OSM geocoder), not verified';
          updated++;
          results.push({ id: f.id, name: f.name, status: 'found', lat, lon, query, osmType: best.type });
          console.log(`  ✓ ${f.id} ${f.name} → ${lat.toFixed(5)}, ${lon.toFixed(5)} (${best.type})`);
          found = true;
          break;
        }
      } catch (err) {
        console.log(`  ✗ ${f.id} ${f.name} → ${err.message}`);
        found = true;
        break;
      }

      // 1.1s pause between requests (Nominatim policy)
      await new Promise((r) => setTimeout(r, 1100));
    }

    if (!found) {
      noResult++;
      results.push({ id: f.id, name: f.name, status: 'not-found' });
      console.log(`  · ${f.id} ${f.name} → no results`);
    }

    // Progress
    if ((i + 1) % 20 === 0) {
      console.log(`  ... ${i + 1}/${batch.length} done (${updated} found, ${noResult} missing)`);
    }

    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log(`\nDone. Found: ${updated}, No result: ${noResult}, Out of bounds: ${outOfBounds}`);

  if (updated > 0) {
    writeFileSync(FACILITIES_PATH, JSON.stringify(facilities, null, 1) + '\n');
    console.log(`Updated ${FACILITIES_PATH}`);
  }

  // Write a log
  const logPath = resolve(ROOT, 'data-src/nominatim-log.json');
  writeFileSync(logPath, JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    source: 'Nominatim (OpenStreetMap geocoder)',
    total: batch.length,
    found: updated,
    notFound: noResult,
    outOfBounds,
    results,
  }, null, 2) + '\n');
  console.log(`Log written to ${logPath}`);
}

run().catch((err) => { console.error(err); process.exit(1); });
