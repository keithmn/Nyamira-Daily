#!/usr/bin/env node
/**
 * Cross-reference OSM roads against budget-document roads.
 *
 * Usage:  node scripts/geo/reconcile-roads.mjs
 *
 * Reads roads.json (90 budget roads, no coordinates) and osm-fresh.json
 * (122 named OSM roads with coordinates and classifications), then:
 *   1. Tries to match budget road names to OSM road names
 *   2. Lists OSM roads not in the budget (the classified network)
 *   3. Lists budget roads not on OSM (ward-level roads, often unnamed)
 *   4. Writes data-src/road-review.json for human review
 *
 * Budget roads are specific projects: "Kiabonyoru Girls - Ndurumo - Legio Maria"
 * OSM roads are classified highways: "Chabera-Ikonge Road" (primary), "A1 Kisii-Keroka..." (trunk)
 * Most won't match, and that's fine — they're different layers.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const roadsData = JSON.parse(readFileSync(resolve(ROOT, 'src/data/roads.json'), 'utf8'));
const budgetRoads = roadsData.roads || [];
const osm = JSON.parse(readFileSync(resolve(ROOT, 'data-src/osm-fresh.json'), 'utf8'));
const osmRoads = (osm.features || []).filter((f) => f.category === 'Road');

console.log(`Budget roads: ${budgetRoads.length}`);
console.log(`OSM roads: ${osmRoads.length}`);
const namedOsm = osmRoads.filter((r) => r.name);
console.log(`  Named: ${namedOsm.length}`);
console.log(`  Unnamed: ${osmRoads.length - namedOsm.length}`);

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\b(road|rd|pri|sch|school|junction|centre|center)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function extractPlaceNames(roadName) {
  return (roadName || '')
    .split(/[-–—\/\\,]/)
    .map((s) => s.trim().toLowerCase().replace(/[^a-z]/g, ''))
    .filter((s) => s.length > 3);
}

// Try matching
const matches = [];
const unmatchedBudget = [];

for (const br of budgetRoads) {
  const brNorm = normalize(br.name);
  const brPlaces = extractPlaceNames(br.name);
  let bestMatch = null;
  let bestScore = 0;

  for (const or of namedOsm) {
    const orNorm = normalize(or.name);
    const orPlaces = extractPlaceNames(or.name);

    // Exact normalized match
    if (brNorm === orNorm) {
      bestMatch = or;
      bestScore = 1.0;
      break;
    }

    // Place name overlap
    let overlap = 0;
    for (const bp of brPlaces) {
      for (const op of orPlaces) {
        if (bp === op || bp.includes(op) || op.includes(bp)) overlap++;
      }
    }
    if (brPlaces.length > 0 && overlap > 0) {
      const score = overlap / Math.max(brPlaces.length, orPlaces.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = or;
      }
    }
  }

  if (bestMatch && bestScore >= 0.3) {
    matches.push({
      budgetRoad: br.name,
      budgetId: br.id,
      budgetWards: br.wards,
      osmRoad: bestMatch.name,
      osmType: bestMatch.subtype,
      osmWard: bestMatch.ward,
      lat: bestMatch.lat,
      lon: bestMatch.lon,
      confidence: Math.round(bestScore * 100) / 100,
      approve: null,
    });
  } else {
    unmatchedBudget.push({
      id: br.id,
      name: br.name,
      wards: br.wards,
      lengthKm: br.lengthKm,
    });
  }
}

// OSM roads not in budget
const matchedOsmNames = new Set(matches.map((m) => m.osmRoad));
const osmOnly = namedOsm
  .filter((r) => !matchedOsmNames.has(r.name))
  .map((r) => ({
    osmId: r.osmId,
    name: r.name,
    type: r.subtype,
    ward: r.ward,
    lat: r.lat,
    lon: r.lon,
  }));

console.log(`\nMatches found: ${matches.length}`);
console.log(`Budget-only roads: ${unmatchedBudget.length}`);
console.log(`OSM-only roads: ${osmOnly.length}`);

if (matches.length > 0) {
  console.log('\n--- MATCHES ---');
  for (const m of matches) {
    console.log(`  ${m.budgetRoad} ↔ ${m.osmRoad} (${m.osmType}, conf: ${m.confidence})`);
  }
}

// OSM roads by classification
console.log('\n--- OSM CLASSIFIED NETWORK ---');
const byType = {};
for (const r of namedOsm) {
  byType[r.subtype] = byType[r.subtype] || [];
  byType[r.subtype].push(r);
}
for (const [type, roads] of Object.entries(byType).sort((a, b) => {
  const order = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential'];
  return order.indexOf(a[0]) - order.indexOf(b[0]);
})) {
  console.log(`  ${type} (${roads.length}):`);
  for (const r of roads) {
    console.log(`    ${r.name} (ward: ${r.ward || '?'})`);
  }
}

const output = {
  generated: new Date().toISOString().slice(0, 10),
  summary: {
    budgetRoads: budgetRoads.length,
    osmRoads: osmRoads.length,
    osmNamed: namedOsm.length,
    matches: matches.length,
    budgetOnly: unmatchedBudget.length,
    osmOnly: osmOnly.length,
  },
  matches,
  budgetOnly: unmatchedBudget,
  osmClassifiedNetwork: osmOnly,
};

const outPath = resolve(ROOT, 'data-src/road-review.json');
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`\nWritten to ${outPath}`);
