#!/usr/bin/env node
/**
 * Apply a reviewed geo-review.json to facilities.json.
 *
 * Usage:  node scripts/geo/apply-review.mjs [--review data-src/geo-review.json] [--dry-run]
 *
 * A person must have set approve: true/false on each coordinate enrichment and new candidate,
 * and matchTo: "<id>" or "new" or "skip" on each ambiguous entry. This script reads those
 * decisions and:
 *   - Adds coordinates to matched facilities (where approve: true)
 *   - Adds new facility records (where approve: true)
 *   - Resolves ambiguous matches (where matchTo is a facility ID)
 *   - Skips everything else
 *
 * Run with --dry-run first to see what would change without writing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const reviewPath = process.argv.includes('--review')
  ? resolve(process.argv[process.argv.indexOf('--review') + 1])
  : resolve(ROOT, 'data-src/geo-review.json');

const dryRun = process.argv.includes('--dry-run');

const facilities = JSON.parse(readFileSync(resolve(ROOT, 'src/data/facilities.json'), 'utf8'));
const review = JSON.parse(readFileSync(reviewPath, 'utf8'));

const byId = new Map(facilities.map((f) => [f.id, f]));

let coordsAdded = 0;
let newAdded = 0;
let ambiguousResolved = 0;
let skipped = 0;

// 1. Coordinate enrichment
for (const entry of review.coordinateEnrichment || []) {
  if (entry.approve !== true) { skipped++; continue; }
  const f = byId.get(entry.id);
  if (!f) { console.warn(`  Facility ${entry.id} not found — skipping`); skipped++; continue; }
  if (f.coordinates?.lat) { console.log(`  ${entry.id} already has coordinates — skipping`); skipped++; continue; }
  f.coordinates = { lat: entry.lat, lon: entry.lon };
  f.coordinateSource = `OSM ${entry.osmId}`;
  f.coordinateEvidence = 'unverified';
  coordsAdded++;
  if (dryRun) console.log(`  [dry-run] Would add coords to ${entry.id} (${entry.name}): ${entry.lat}, ${entry.lon}`);
}

// 2. New candidates
let nextId = Math.max(...facilities.map((f) => parseInt(f.id.replace('NYM-F', ''), 10) || 0)) + 1;
for (const entry of review.newCandidates || []) {
  if (entry.approve !== true) { skipped++; continue; }
  const id = `NYM-F${String(nextId).padStart(4, '0')}`;
  nextId++;
  const newFacility = {
    id,
    ward: entry.ward,
    name: entry.name,
    category: entry.category,
    subtype: entry.subtype,
    level: null,
    owner: null,
    source: 'OpenStreetMap (ODbL)',
    sourceRef: `osm ${entry.osmId}`,
    coordinates: entry.lat ? { lat: entry.lat, lon: entry.lon } : null,
    evidence: 'unverified',
    evidenceNote: `Added from OSM ${review.generated}; not yet verified`,
  };
  facilities.push(newFacility);
  byId.set(id, newFacility);
  newAdded++;
  if (dryRun) console.log(`  [dry-run] Would add new ${id}: ${entry.name} (${entry.category}) in ${entry.ward}`);
}

// 3. Ambiguous — resolve where matchTo is set
for (const entry of review.ambiguous || []) {
  if (!entry.matchTo || entry.matchTo === 'skip') { skipped++; continue; }
  if (entry.matchTo === 'new') {
    const id = `NYM-F${String(nextId).padStart(4, '0')}`;
    nextId++;
    const newFacility = {
      id,
      ward: entry.ward,
      name: entry.osmName,
      category: entry.category,
      subtype: entry.subtype || null,
      level: null,
      owner: null,
      source: 'OpenStreetMap (ODbL)',
      sourceRef: `osm ${entry.osmId}`,
      coordinates: entry.lat ? { lat: entry.lat, lon: entry.lon } : null,
      evidence: 'unverified',
      evidenceNote: `Added from OSM ${review.generated}; not yet verified`,
    };
    facilities.push(newFacility);
    newAdded++;
    if (dryRun) console.log(`  [dry-run] Would add ambiguous-as-new ${id}: ${entry.osmName}`);
  } else {
    const f = byId.get(entry.matchTo);
    if (!f) { console.warn(`  Ambiguous matchTo ${entry.matchTo} not found — skipping`); skipped++; continue; }
    if (!f.coordinates?.lat && entry.lat) {
      f.coordinates = { lat: entry.lat, lon: entry.lon };
      f.coordinateSource = `OSM ${entry.osmId}`;
      f.coordinateEvidence = 'unverified';
      coordsAdded++;
    }
    ambiguousResolved++;
    if (dryRun) console.log(`  [dry-run] Would match ${entry.osmName} → ${entry.matchTo} (${f.name})`);
  }
}

console.log(`\nSummary:`);
console.log(`  Coordinates added: ${coordsAdded}`);
console.log(`  New facilities: ${newAdded}`);
console.log(`  Ambiguous resolved: ${ambiguousResolved}`);
console.log(`  Skipped (not approved): ${skipped}`);

if (dryRun) {
  console.log('\n[dry-run] No files changed.');
} else {
  // Sort by ID for stability
  facilities.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(resolve(ROOT, 'src/data/facilities.json'), JSON.stringify(facilities, null, 2) + '\n');
  console.log(`\nWritten ${facilities.length} facilities to src/data/facilities.json`);
}
