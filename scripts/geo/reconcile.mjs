#!/usr/bin/env node
/**
 * Reconcile fresh OSM data against the existing facility registry.
 *
 * Usage:  node scripts/geo/reconcile.mjs [--osm data-src/osm-fresh.json]
 *
 * What it does:
 *   1. Loads the current facilities.json (247 records) and the fresh OSM pull.
 *   2. For each OSM feature in categories we track (Health, Education, Market, Water,
 *      Public office, Worship, Community centre), tries to match it to an existing
 *      facility by:
 *        a. Exact sourceRef match (osm node/way/relation ID)
 *        b. Fuzzy name match within the same ward (Levenshtein distance ≤ 3, or
 *           one name contains the other)
 *   3. Produces three lists:
 *        - matched: existing facility + OSM coordinates (coordinate enrichment)
 *        - new: OSM features with no match (candidates to add)
 *        - ambiguous: multiple possible matches (needs a person)
 *   4. Writes a review file for a person to approve before anything changes.
 *
 * This script NEVER edits facilities.json. It produces a review file.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const osmPath = process.argv.includes('--osm')
  ? resolve(process.argv[process.argv.indexOf('--osm') + 1])
  : resolve(ROOT, 'data-src/osm-fresh.json');

const facilities = JSON.parse(readFileSync(resolve(ROOT, 'src/data/facilities.json'), 'utf8'));
const osm = JSON.parse(readFileSync(osmPath, 'utf8'));
const osmFeatures = osm.features || osm;

console.log(`Existing facilities: ${facilities.length}`);
console.log(`OSM features: ${osmFeatures.length}`);

// Categories we want to reconcile (skip roads, places, waterways — different registries)
const TRACK_CATEGORIES = new Set(['Health', 'Education', 'Market', 'Water', 'Public office', 'Worship', 'Community centre', 'NGO', 'Leisure']);
const trackable = osmFeatures.filter((f) => TRACK_CATEGORIES.has(f.category) && f.name);
console.log(`Trackable OSM features (named, in tracked categories): ${trackable.length}`);

// Index existing facilities
const byRef = new Map();
const byWardName = new Map(); // ward -> [{ facility, normName }]

for (const f of facilities) {
  if (f.sourceRef) byRef.set(f.sourceRef, f);
  const ward = f.ward;
  if (!byWardName.has(ward)) byWardName.set(ward, []);
  byWardName.get(ward).push({ facility: f, normName: normalize(f.name) });
}

const matched = [];
const newFeatures = [];
const ambiguous = [];

for (const osf of trackable) {
  // 1. Exact ref match
  const refKey = `osm ${osf.osmId}`;
  if (byRef.has(refKey)) {
    matched.push({ facility: byRef.get(refKey), osm: osf, matchType: 'ref' });
    continue;
  }
  // Also check without the leading slash variant
  const altRef = `osm /${osf.osmId}`;
  if (byRef.has(altRef)) {
    matched.push({ facility: byRef.get(altRef), osm: osf, matchType: 'ref' });
    continue;
  }

  // 2. Fuzzy name match within ward
  const ward = osf.ward;
  if (!ward) {
    newFeatures.push({ osm: osf, reason: 'no ward assigned' });
    continue;
  }

  const wardFacilities = byWardName.get(ward) || [];
  const osmNorm = normalize(osf.name);
  const candidates = [];

  for (const { facility, normName } of wardFacilities) {
    const dist = levenshtein(osmNorm, normName);
    const contains = normName.includes(osmNorm) || osmNorm.includes(normName);
    const shortMatch = osmNorm.length >= 4 && normName.length >= 4 && (
      normName.startsWith(osmNorm.slice(0, Math.max(4, Math.floor(osmNorm.length * 0.6)))) ||
      osmNorm.startsWith(normName.slice(0, Math.max(4, Math.floor(normName.length * 0.6))))
    );
    if (dist <= 3 || contains || shortMatch) {
      candidates.push({ facility, distance: dist, contains, shortMatch });
    }
  }

  if (candidates.length === 0) {
    newFeatures.push({ osm: osf, reason: 'no name match in ward' });
  } else if (candidates.length === 1) {
    matched.push({ facility: candidates[0].facility, osm: osf, matchType: 'name', distance: candidates[0].distance });
  } else {
    // Sort by distance, take the best
    candidates.sort((a, b) => a.distance - b.distance);
    if (candidates[0].distance === 0 || (candidates[0].distance <= 1 && candidates[1].distance > 2)) {
      matched.push({ facility: candidates[0].facility, osm: osf, matchType: 'name-best', distance: candidates[0].distance });
    } else {
      ambiguous.push({ osm: osf, candidates: candidates.map((c) => ({ id: c.facility.id, name: c.facility.name, distance: c.distance })) });
    }
  }
}

console.log(`\nResults:`);
console.log(`  Matched (coordinate enrichment): ${matched.length}`);
console.log(`  New (candidates to add): ${newFeatures.length}`);
console.log(`  Ambiguous (needs a person): ${ambiguous.length}`);

// Coordinate enrichment summary
const enrichable = matched.filter((m) => !m.facility.coordinates && m.osm.lat);
console.log(`  → Facilities that gain coordinates: ${enrichable.length}`);

// New features by category
const newByCat = {};
for (const n of newFeatures) {
  const c = n.osm.category;
  newByCat[c] = (newByCat[c] || 0) + 1;
}
console.log(`\nNew features by category:`);
for (const [cat, count] of Object.entries(newByCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

// New features by ward
const newByWard = {};
for (const n of newFeatures) {
  const w = n.osm.ward || '(unknown)';
  newByWard[w] = (newByWard[w] || 0) + 1;
}

// Write review file
const review = {
  generated: new Date().toISOString().slice(0, 10),
  summary: {
    existingFacilities: facilities.length,
    osmTracked: trackable.length,
    matched: matched.length,
    coordinateEnrichment: enrichable.length,
    newCandidates: newFeatures.length,
    ambiguous: ambiguous.length,
  },
  coordinateEnrichment: enrichable.map((m) => ({
    id: m.facility.id,
    name: m.facility.name,
    ward: m.facility.ward,
    osmId: m.osm.osmId,
    osmName: m.osm.name,
    lat: m.osm.lat,
    lon: m.osm.lon,
    matchType: m.matchType,
    distance: m.distance ?? 0,
    approve: null, // Person sets true/false
  })),
  newCandidates: newFeatures.map((n) => ({
    osmId: n.osm.osmId,
    name: n.osm.name,
    category: n.osm.category,
    subtype: n.osm.subtype,
    ward: n.osm.ward,
    lat: n.osm.lat,
    lon: n.osm.lon,
    reason: n.reason,
    approve: null, // Person sets true/false
  })),
  ambiguous: ambiguous.map((a) => ({
    osmId: a.osm.osmId,
    osmName: a.osm.name,
    category: a.osm.category,
    ward: a.osm.ward,
    lat: a.osm.lat,
    lon: a.osm.lon,
    candidates: a.candidates,
    matchTo: null, // Person sets the facility ID, or "new"
  })),
};

const reviewPath = resolve(ROOT, 'data-src/geo-review.json');
writeFileSync(reviewPath, JSON.stringify(review, null, 2) + '\n');
console.log(`\nReview file written to ${reviewPath}`);
console.log('A person must review and set approve/matchTo before running apply.');

// --- Utilities ---

function normalize(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\b(pri|primary)\b\.?\s*school/g, 'primary school')
    .replace(/\b(sec|secondary)\b\.?\s*school/g, 'secondary school')
    .replace(/\bdispensary\b/g, 'dispensary')
    .replace(/\bhealth\s*cent(re|er)\b/g, 'health centre')
    .replace(/\bhospital\b/g, 'hospital')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}
