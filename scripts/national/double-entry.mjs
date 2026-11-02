// Double entry (build brief 4.3): compares a table's two readings and lists every disagreement. A table loads only when
// the readings agree or each disagreement is resolved. The County Act's schedule has no text to extract, so it is proved
// against the document's own columns and against two other documents instead.
//   node scripts/national/double-entry.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const csv = (p) => parseCsv(readFileSync(join(root, 'data-src/national', p), 'utf8'));

const keyOf = (r) => `${r.kind}${r.vote}${r.programme ? `/${r.programme}` : ''}`;

export function compareReadings(first, second, resolved = new Map()) {
  const other = new Map(second.map((r) => [keyOf(r), r]));
  const out = { agree: 0, otherColumn: [], resolved: [], unresolved: [] };
  for (const r of first) {
    const key = keyOf(r), s = other.get(key);
    if (s && s.supply === r.supply && s.aia === r.aia) out.agree++;
    // Same digits, read into the other column: the arithmetic in the extractor decides which column is right
    else if (s && s.supply + s.aia === r.supply + r.aia) out.otherColumn.push(key);
    else if (resolved.has(key)) out.resolved.push({ key, first: `${r.supply}/${r.aia}`, second: s ? `${s.supply}/${s.aia}` : 'missing', reason: resolved.get(key).reason });
    else out.unresolved.push({ key, first: `${r.supply}/${r.aia}`, second: s ? `${s.supply}/${s.aia}` : 'missing' });
  }
  const keys = new Set(first.map(keyOf));
  for (const r of second) if (!keys.has(keyOf(r))) out.unresolved.push({ key: keyOf(r), first: 'missing', second: `${r.supply}/${r.aia}` });
  return out;
}

const BASELINE = 387425000000, FORMULA = 36115000000;
// Half of the last printed decimal of a five-decimal percentage, in shillings
const within = (a, b, tol) => Math.abs(a - b) <= tol;

export function countyChecks(rows, cra, guide) {
  const problems = [];
  const other = new Map(cra.map((r) => [r.county, r])), rounded = new Map(guide.map((r) => [r.county, r]));
  for (const r of rows) {
    const [a, b, c, d, e, f, g] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((k) => Number(r[k]));
    if (!within(c + d + f, g, 1)) problems.push(`${r.county}: C + D + F is ${c + d + f}, G is ${g}`);
    if (!within(BASELINE * b / 100, c, BASELINE * 0.000005 / 100 + 1)) problems.push(`${r.county}: ratio B of ${b} does not give baseline C of ${c}`);
    if (!within(FORMULA * e / 100, f, FORMULA * 0.000005 / 100 + 1)) problems.push(`${r.county}: index E of ${e} does not give share F of ${f}`);
    if (Math.round(a / 1e6) !== Number(other.get(r.county)?.fy2025_26)) problems.push(`${r.county}: A of ${a} does not round to CRA's ${other.get(r.county)?.fy2025_26} million`);
    if ((g / 1e9).toFixed(1) !== Number(rounded.get(r.county)?.billion).toFixed(1)) problems.push(`${r.county}: G of ${g} does not round to the Guide's ${rounded.get(r.county)?.billion} billion`);
  }
  for (const [k, top] of [['b', 100], ['e', 100]]) {
    const sum = rows.reduce((t, r) => t + Number(r[k]), 0);
    if (!within(sum, top, 0.0005)) problems.push(`Column ${k.toUpperCase()} adds to ${sum}, not ${top}`);
  }
  return problems;
}

export function runDoubleEntry() {
  const corrections = new Map(csv('appropriation-act-2026/corrections.csv').map((r) => [r.key, r]));
  const act = compareReadings(csv('appropriation-act-2026/extract.csv'), csv('appropriation-act-2026/typed.csv'), corrections);
  const county = countyChecks(csv('county-allocation-act-2026/typed.csv'), csv('cra-recommendation-2026-27/typed.csv'), csv('mwananchi-guide-2026-27/typed.csv'));
  return { act, county };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { act, county } = runDoubleEntry();
  console.log(`Appropriation Act: ${act.agree} rows agree, ${act.otherColumn.length} same digits in another column, ${act.resolved.length} resolved from the page image, ${act.unresolved.length} unresolved`);
  for (const r of act.otherColumn) console.log(`  other column  ${r}`);
  for (const r of act.resolved) console.log(`  resolved  ${r.key}: ${r.first} against ${r.second}. ${r.reason}`);
  for (const r of act.unresolved) console.log(`  UNRESOLVED  ${r.key}: ${r.first} against ${r.second}`);
  console.log(`County Act: ${county.length} problems`);
  for (const p of county) console.log(`  ${p}`);
  process.exitCode = act.unresolved.length || county.length ? 1 : 0;
}
