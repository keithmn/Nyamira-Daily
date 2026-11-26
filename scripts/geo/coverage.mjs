#!/usr/bin/env node
/**
 * Map coverage report: how complete is the Nyamira Daily geographic registry?
 *
 * Usage:  node scripts/geo/coverage.mjs
 *
 * Prints a ward-by-ward and category-by-category matrix showing:
 *   - Total listed facilities
 *   - With coordinates (any source)
 *   - Field-verified (evidence = "verified")
 *   - Gaps (wards × categories with zero entries)
 *
 * Also compares against known benchmarks (CRA fact sheet: ~411 primary schools,
 * ~190 secondary schools in Nyamira County) to estimate completeness.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const facilities = JSON.parse(readFileSync(resolve(ROOT, 'src/data/facilities.json'), 'utf8'));
const roads = JSON.parse(readFileSync(resolve(ROOT, 'src/data/roads.json'), 'utf8'));
const wardPlaces = JSON.parse(readFileSync(resolve(ROOT, 'src/data/ward-places.json'), 'utf8'));
const events = JSON.parse(readFileSync(resolve(ROOT, 'src/data/living/events.json'), 'utf8'));

const WARDS = [
  'esise', 'mekenene', 'kiabonyoru', 'nyansiongo',
  'rigoma', 'gachuba', 'kemera', 'magombo', 'manga', 'gesima',
  'nyamaiya', 'bogichora', 'bosamaro', 'bonyamatuta', 'township',
  'itibo', 'bomwagamo', 'bokeira', 'magwagwa', 'ekerenyo',
];

const CATEGORIES = ['Health', 'Education', 'Market', 'Water', 'Public office', 'Worship', 'Community centre', 'Agriculture'];

// Known benchmarks (CRA Nyamira County Fact Sheet, 3rd Edition)
const BENCHMARKS = {
  'Education': { label: 'CRA: ~601 schools (411 primary + 190 secondary)', expected: 601 },
  'Health': { label: 'KMHFL 2017: ~120 (likely more now)', expected: 150 },
};

console.log('═══════════════════════════════════════════════════════════');
console.log('  NYAMIRA DAILY — MAP COVERAGE REPORT');
console.log(`  Generated: ${new Date().toISOString().slice(0, 10)}`);
console.log('═══════════════════════════════════════════════════════════\n');

// --- Overall summary ---
const total = facilities.length;
const withCoords = facilities.filter((f) => f.coordinates?.lat).length;
const verified = facilities.filter((f) => f.evidence === 'verified').length;
const official = facilities.filter((f) => f.evidence === 'official').length;
const unverified = facilities.filter((f) => f.evidence === 'unverified').length;
const roadCount = roads.roads?.length ?? roads.length ?? 0;
const placeCount = wardPlaces.length;
const eventCount = Array.isArray(events) ? events.length : (events.events?.length ?? 0);

console.log('SUMMARY');
console.log('───────');
console.log(`  Facilities:    ${total}`);
console.log(`  With coords:   ${withCoords} (${pct(withCoords, total)})`);
console.log(`  Verified:      ${verified} (${pct(verified, total)})`);
console.log(`  Official:      ${official} (${pct(official, total)})`);
console.log(`  Unverified:    ${unverified} (${pct(unverified, total)})`);
console.log(`  Roads:         ${roadCount}`);
console.log(`  Places/towns:  ${placeCount}`);
console.log(`  Living events: ${eventCount}`);
console.log();

// --- By category ---
console.log('BY CATEGORY');
console.log('───────────');
const header = padR('Category', 20) + padR('Total', 8) + padR('Coords', 8) + padR('Verified', 10) + padR('Benchmark', 30);
console.log(header);
console.log('─'.repeat(76));

for (const cat of CATEGORIES) {
  const inCat = facilities.filter((f) => f.category === cat);
  const coords = inCat.filter((f) => f.coordinates?.lat).length;
  const ver = inCat.filter((f) => f.evidence === 'verified').length;
  const bench = BENCHMARKS[cat];
  const benchStr = bench ? `${bench.label} → ${pct(inCat.length, bench.expected)} listed` : '';
  console.log(padR(cat, 20) + padR(String(inCat.length), 8) + padR(String(coords), 8) + padR(String(ver), 10) + benchStr);
}
console.log();

// --- By ward ---
console.log('BY WARD');
console.log('───────');
const wHeader = padR('Ward', 16) + CATEGORIES.map((c) => padR(c.slice(0, 6), 8)).join('') + padR('Total', 8) + padR('Coords', 8);
console.log(wHeader);
console.log('─'.repeat(16 + CATEGORIES.length * 8 + 16));

for (const ward of WARDS) {
  const inWard = facilities.filter((f) => f.ward === ward);
  const cols = CATEGORIES.map((cat) => {
    const n = inWard.filter((f) => f.category === cat).length;
    return padR(n === 0 ? '·' : String(n), 8);
  }).join('');
  const coords = inWard.filter((f) => f.coordinates?.lat).length;
  console.log(padR(ward, 16) + cols + padR(String(inWard.length), 8) + padR(String(coords), 8));
}
console.log();

// --- Coverage gaps ---
console.log('COVERAGE GAPS');
console.log('─────────────');
const gaps = [];
for (const ward of WARDS) {
  for (const cat of ['Health', 'Education', 'Water', 'Market']) {
    const count = facilities.filter((f) => f.ward === ward && f.category === cat).length;
    if (count === 0) gaps.push(`${ward}: no ${cat.toLowerCase()} facility listed`);
  }
}
if (gaps.length === 0) {
  console.log('  No critical gaps (every ward has at least one health, education, water and market entry).');
} else {
  console.log(`  ${gaps.length} gaps where a ward has zero entries in a critical category:`);
  for (const g of gaps) console.log(`  · ${g}`);
}
console.log();

// --- Completeness estimate ---
console.log('COMPLETENESS ESTIMATE');
console.log('─────────────────────');
for (const [cat, bench] of Object.entries(BENCHMARKS)) {
  const have = facilities.filter((f) => f.category === cat).length;
  const missing = Math.max(0, bench.expected - have);
  console.log(`  ${cat}: ${have} of ~${bench.expected} (${bench.label})`);
  console.log(`    → ~${missing} facilities likely missing from our registry`);
}
console.log();

// --- Source breakdown ---
console.log('BY SOURCE');
console.log('─────────');
const sources = {};
for (const f of facilities) {
  const s = f.source || '(none)';
  sources[s] = (sources[s] || 0) + 1;
}
for (const [src, count] of Object.entries(sources).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${padR(src, 55)} ${count}`);
}
console.log();

// --- Action items ---
console.log('ACTION ITEMS');
console.log('────────────');
console.log(`  1. Run pull-osm.mjs to get a fresh OSM export (may add hundreds of features)`);
console.log(`  2. Run reconcile.mjs to match against existing facilities`);
console.log(`  3. Download the Kenya schools dataset and filter to Nyamira (we have ${facilities.filter(f => f.category === 'Education').length} of ~601)`);
console.log(`  4. Try kmhfr.health.go.ke for a newer KMHFL export`);
console.log(`  5. Start field visits — ${total} facilities, 0 verified`);
console.log(`  6. Add Plus Code field to KoboToolbox forms for coordinate collection`);

function pct(n, d) { return d ? `${Math.round(100 * n / d)}%` : '0%'; }
function padR(s, w) { return s + ' '.repeat(Math.max(0, w - s.length)); }
