#!/usr/bin/env node
/**
 * Geocode facilities that have a Google Place ID but no coordinates.
 *
 * Usage:
 *   GOOGLE_PLACES_KEY=AIza... node scripts/geo/geocode-google.mjs
 *   GOOGLE_PLACES_KEY=AIza... node scripts/geo/geocode-google.mjs --dry-run
 *
 * Reads facilities.json, finds records where sourceRef starts with "google "
 * and coordinates are null, calls the Places API (New) to get lat/lon,
 * and writes the coordinates back. Each call uses one Place Details request.
 *
 * Cost: each call consumes one Place Details (Basic) request.
 * Free tier: $200/month credit ≈ 10,000 requests. We have 58 facilities
 * to geocode, well within the free tier.
 *
 * The script pauses 200ms between requests to avoid bursts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FACILITIES_PATH = resolve(ROOT, 'src/data/facilities.json');

const API_KEY = process.env.GOOGLE_PLACES_KEY;
if (!API_KEY) {
  console.error('Set GOOGLE_PLACES_KEY environment variable.');
  console.error('Get one at https://console.cloud.google.com/apis/credentials');
  console.error('Enable "Places API (New)" on the project.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

async function getPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'location,displayName,formattedAddress',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function run() {
  const facilities = JSON.parse(readFileSync(FACILITIES_PATH, 'utf8'));
  const targets = facilities.filter(
    (f) => f.sourceRef?.startsWith('google ') && !f.coordinates?.lat
  );

  console.log(`Facilities with Google Place ID and no coordinates: ${targets.length}`);
  if (targets.length === 0) {
    console.log('Nothing to geocode.');
    return;
  }

  if (DRY_RUN) {
    console.log('Dry run — would geocode:');
    for (const f of targets) {
      console.log(`  ${f.id} ${f.name} → ${f.sourceRef.replace('google ', '')}`);
    }
    return;
  }

  let updated = 0;
  let failed = 0;
  const errors = [];

  for (const facility of targets) {
    const placeId = facility.sourceRef.replace('google ', '');
    try {
      const details = await getPlaceDetails(placeId);
      if (details.location?.latitude && details.location?.longitude) {
        facility.coordinates = {
          lat: Math.round(details.location.latitude * 100000) / 100000,
          lon: Math.round(details.location.longitude * 100000) / 100000,
        };
        facility.evidenceNote = (facility.evidenceNote || '') +
          (facility.evidenceNote ? '; ' : '') +
          'Coordinates from Google Places API';
        updated++;
        console.log(
          `  ✓ ${facility.id} ${facility.name} → ${facility.coordinates.lat}, ${facility.coordinates.lon}`
        );
      } else {
        console.log(`  · ${facility.id} ${facility.name} → no location in response`);
        failed++;
      }
    } catch (err) {
      console.log(`  ✗ ${facility.id} ${facility.name} → ${err.message}`);
      errors.push({ id: facility.id, name: facility.name, error: err.message });
      failed++;
    }

    // Pause between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nUpdated: ${updated}, Failed: ${failed}`);

  if (updated > 0) {
    writeFileSync(FACILITIES_PATH, JSON.stringify(facilities, null, 1) + '\n');
    console.log(`Written to ${FACILITIES_PATH}`);
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const e of errors) console.log(`  ${e.id}: ${e.error}`);
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
