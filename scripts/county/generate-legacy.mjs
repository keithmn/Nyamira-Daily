// Generate src/data/money.json and src/data/budget-sectors.json from the county figure registry.
// The numeric values come from the registry (source of truth); editorial annotations (notes, caveats,
// source text, checks prose) come from annotations files that a person maintains.
//   node scripts/county/generate-legacy.mjs
//
// The generated files must pass `npm run check:county` (legacyAgrees), which compares every number
// against the registry. This script guarantees that by reading those numbers from the same registry.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, readRegistry } from '@kbe/engine/registry';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const write = (p, data) => writeFileSync(join(root, p), JSON.stringify(data, null, 2) + '\n', 'utf8');

// Load the registry (same as check-county.mjs)
const national = readRegistry(join(root, 'data/national'));
const county = readRegistry(join(root, 'data/county/nyamira'));
const { sources, figures } = buildRegistry({
  rawSources: [...national.rawSources, ...county.rawSources],
  rawFigures: [...national.rawFigures, ...county.rawFigures],
});
const val = (id) => figures.get(id)?.value ?? null;
const src = (id) => sources.get(figures.get(id)?.source);
const note = (id) => figures.get(id)?.note ?? null;

// ── money.json ──────────────────────────────────────────────────────────────
// The existing money.json is treated as an annotations file: its per-year notes (osrNote, pendingNote,
// src, page) and top-level metadata (note, caveats) are editorial prose that the registry doesn't hold.
// We read the existing file, replace its numeric values from the registry, and write it back.
const money = read('src/data/money.json');
const notes = read('data/county/nyamira/notes.json');
money.updated = notes.updated;
money.note = notes.note;
money.caveats = notes.caveats;

const MONEY_FIELDS = { budget: 'budget', spent: 'spent', dev: 'dev-spent', rec: 'rec-spent', devAbs: 'dev-absorption', osrTarget: 'osr-target', osr: 'osr-actual', pending: 'pending-bills' };

for (const y of money.years) {
  const base = `ke.fy${y.fy.replace('/', '-')}.spent.county.nyamira`;
  for (const [col, field] of Object.entries(MONEY_FIELDS)) {
    y[col] = val(`${base}.${field}`);
  }
  // Equitable share: money.json uses a single eqShare column that may match either allocated or received.
  // Prefer allocated (the original convention for most years), fall back to received.
  const alloc = val(`${base}.equitable-share-allocated`);
  const recv = val(`${base}.equitable-share-received`);
  y.eqShare = alloc ?? recv;
  // Source URL and page from the 'spent' figure's source document
  const doc = src(`${base}.spent`);
  if (doc) {
    y.src = doc.url;
    y.page = figures.get(`${base}.spent`).page;
  }
}

write('src/data/money.json', money);
console.log(`money.json: ${money.years.length} years written`);

// ── budget-sectors.json ─────────────────────────────────────────────────────
// Same approach: read the existing file for its editorial annotations (notes, developmentNote, checks,
// definitions, wageBill, countyTotal, source metadata), replace numeric values from the registry.
const sectors = read('src/data/budget-sectors.json');
const structure = read('data/county/nyamira/structure-2025-26.json');
const PBB = `ke.fy${structure.fy.replace('/', '-')}.estimates.county.nyamira`;

// budget-sectors.json uses swapped vote codes for Keroka/Disability (follows T17; registry follows T9/T11/T12).
const SWAP = { 5280: '5282', 5282: '5280' };

for (const d of sectors.departments) {
  const regVote = SWAP[d.vote] ?? d.vote;
  const V = `${PBB}.vote.${regVote}`;
  d.total = val(V) ?? 0;
  d.recurrent = val(`${V}.recurrent`) ?? 0;
  d.development = val(`${V}.development`) ?? 0;
  d.compensation = val(`${V}.compensation`) ?? 0;
  d.operations = val(`${V}.operations`) ?? 0;
  // Compensation detail
  d.compensationDetail = {
    compensationToEmployees_T13: val(`${V}.compensation.employees`) ?? 0,
    socialContributions_T14: val(`${V}.compensation.social`) ?? 0,
  };
  // Operations detail: om is always present; funds and grants may be absent (= 0)
  const om = val(`${V}.operations.om`) ?? 0;
  const funds = val(`${V}.operations.funds`) ?? 0;
  const grants = val(`${V}.operations.grants`) ?? 0;
  d.operationsDetail = {
    operationsAndMaintenance_T17: om,
    recurrentFunds_T16: funds,
    recurrentConditionalGrants_T15: grants,
  };
  // Wage share of department total
  d.wageSharePctOfDeptTotal = d.total ? Math.round((d.compensation / d.total) * 1000) / 10 : 0;
}

// County totals
const ct = sectors.countyTotal;
ct.compensation = val(`${PBB}.compensation.employees`) + val(`${PBB}.compensation.social`);
ct.compensationToEmployees_T13 = val(`${PBB}.compensation.employees`);
ct.socialContributions_T14 = val(`${PBB}.compensation.social`);
ct.operations = val(`${PBB}.operations.om`) + val(`${PBB}.operations.funds`) + val(`${PBB}.operations.grants`);
ct.operationsAndMaintenance_T17 = val(`${PBB}.operations.om`);
ct.recurrentFunds_T16 = val(`${PBB}.operations.funds`);
ct.recurrentConditionalGrants_T15 = val(`${PBB}.operations.grants`);
ct.recurrent = val(`${PBB}.recurrent`);
ct.development = val(`${PBB}.development`);
ct.total = val(`${PBB}.total`);

// Wage bill amount from registry
sectors.wageBill.amount = ct.compensation;
const wsReg = val(`${PBB}.wage-share`);
if (wsReg != null) sectors.wageBill.sharePct = wsReg;

write('src/data/budget-sectors.json', sectors);
console.log(`budget-sectors.json: ${sectors.departments.length} departments written`);

// Verify by running the same legacyAgrees check
import { legacyAgrees } from './check-county.mjs';
const { figures: regFigs } = buildRegistry({
  rawSources: [...national.rawSources, ...county.rawSources],
  rawFigures: [...national.rawFigures, ...county.rawFigures],
});
const problems = legacyAgrees(regFigs);
if (problems.length) {
  console.error('Generated files do not agree with the registry:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('✓ Generated files agree with the registry');
