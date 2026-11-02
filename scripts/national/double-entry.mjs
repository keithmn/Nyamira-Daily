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

// Parliament's tables are a second, independent reading of the Act. Every vote must agree with it to the rounding of the
// tables, in recurrent, development and total, and every vote must be in exactly one sector.
export function pboChecks(rows, votesNow, votesLast) {
  const problems = [], act = new Map();
  for (const r of rows.filter((x) => !x.programme)) {
    const e = act.get(r.vote) ?? { R: 0, D: 0 };
    e[r.kind] += Number(r.supply || 0) + Number(r.aia || 0);
    act.set(r.vote, e);
  }
  for (const [what, list] of [['2026/27', votesNow], ['2025/26', votesLast]]) {
    const codes = list.map((r) => r.code);
    if (new Set(codes).size !== codes.length || codes.includes('')) problems.push(`Budget Explainer ${what}: a vote is repeated or has no code`);
    const missing = [...act.keys()].filter((c) => !codes.includes(c));
    if (missing.length) problems.push(`Budget Explainer ${what} has no row for ${missing.join(', ')}`);
    for (const r of list) if (!within(Number(r.recurrent) + Number(r.development), Number(r.total), 2)) problems.push(`Budget Explainer ${what}, ${r.code}: ${r.recurrent} + ${r.development} is not ${r.total}`);
  }
  for (const r of votesNow) {
    const a = act.get(r.code);
    if (!a) { problems.push(`Budget Explainer vote ${r.code} is not in the Act`); continue; }
    for (const [column, value] of [['recurrent', a.R], ['development', a.D], ['total', a.R + a.D]]) {
      if (!within(value / 1e6, Number(r[column]), 1.01)) problems.push(`Vote ${r.code} ${column}: the Act gives ${(value / 1e6).toFixed(0)} million, the Budget Explainer ${r[column]}`);
    }
  }
  return problems;
}

// Each row of the Controller of Budget's table must agree across the two readings and with its own arithmetic: every
// amount and every printed percentage. The six counties the main site holds are a check from an earlier reading.
export function cobChecks(rows, second, earlier = []) {
  const problems = [], counties = rows.filter((r) => r.county !== 'Total'), total = rows.find((r) => r.county === 'Total');
  const AMOUNTS = ['rec_budget', 'dev_budget', 'total_budget', 'rec_spent', 'dev_spent', 'total_spent'];
  if (counties.length !== 47 || !total) problems.push(`Expected 47 counties and a total, found ${counties.length}`);
  const first = rows.flatMap((r) => AMOUNTS.map((k) => r[k])).sort(), other = second.map((r) => r.amount).sort();
  const extra = first.filter((a) => !other.includes(a)), lost = other.filter((a) => !first.includes(a));
  if (first.length !== other.length || extra.length || lost.length) problems.push(`The readings hold different amounts: ${first.length} and ${other.length}, ${[...extra, ...lost].slice(0, 6).join(', ')}`);
  for (const r of rows) {
    const [a, b, c, d, e, f] = AMOUNTS.map((k) => Number(r[k]));
    if (!within(a + b, c, 0.021)) problems.push(`${r.county}: recurrent and development budgets do not add to ${c}`);
    if (!within(d + e, f, 0.021)) problems.push(`${r.county}: recurrent and development spending do not add to ${f}`);
    for (const [pct, top, bottom] of [['rec_pct', d, a], ['dev_pct', e, b], ['overall_pct', f, c]]) {
      const tol = r[pct].includes('.') ? 0.011 : 0.51;
      if (!within(top / bottom * 100, Number(r[pct]), tol)) problems.push(`${r.county}: ${pct} prints ${r[pct]}, the amounts give ${(top / bottom * 100).toFixed(2)}`);
    }
  }
  if (total) for (const k of AMOUNTS) if (!within(counties.reduce((n, r) => n + Number(r[k]), 0), Number(total[k]), 0.5)) problems.push(`${k}: the 47 counties do not add to the printed ${total[k]}`);
  for (const c of earlier) {
    const r = rows.find((x) => x.county === c.county || (c.county === 'Nairobi City' && x.county === 'Nairobi'));
    if (r && !within(Number(r.dev_spent), c.devSpent / 1e6, 0.02)) problems.push(`${c.county}: development spending ${r.dev_spent} against the main site's ${c.devSpent / 1e6}`);
  }
  return problems;
}

export function runDoubleEntry() {
  const corrections = new Map(csv('appropriation-act-2026/corrections.csv').map((r) => [r.key, r]));
  const act = compareReadings(csv('appropriation-act-2026/extract.csv'), csv('appropriation-act-2026/typed.csv'), corrections);
  const county = countyChecks(csv('county-allocation-act-2026/typed.csv'), csv('cra-recommendation-2026-27/typed.csv'), csv('mwananchi-guide-2026-27/typed.csv'));
  const pbo = pboChecks(csv('appropriation-act-2026/extract.csv'), csv('pbo-explainer/votes-2026-27.csv'), csv('pbo-explainer/votes-2025-26.csv'));
  const earlier = JSON.parse(readFileSync(join(root, 'src/data/compare.json'), 'utf8')).counties;
  const cob = [...cobChecks(csv('cob-county-2024-25/extract.csv'), csv('cob-county-2024-25/typed.csv'), earlier).map((p) => `FY2024/25 ${p}`),
    ...cobChecks(csv('cob-county-2025-26/extract.csv'), csv('cob-county-2025-26/typed.csv')).map((p) => `FY2025/26 ${p}`)];
  return { act, county, pbo, cob };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { act, county, pbo, cob } = runDoubleEntry();
  console.log(`Budget Explainer against the Act: ${pbo.length} problems`);
  for (const p of pbo) console.log(`  ${p}`);
  console.log(`Controller of Budget Table 2.5: ${cob.length} problems`);
  for (const p of cob) console.log(`  ${p}`);
  console.log(`Appropriation Act: ${act.agree} rows agree, ${act.otherColumn.length} same digits in another column, ${act.resolved.length} resolved from the page image, ${act.unresolved.length} unresolved`);
  for (const r of act.otherColumn) console.log(`  other column  ${r}`);
  for (const r of act.resolved) console.log(`  resolved  ${r.key}: ${r.first} against ${r.second}. ${r.reason}`);
  for (const r of act.unresolved) console.log(`  UNRESOLVED  ${r.key}: ${r.first} against ${r.second}`);
  console.log(`County Act: ${county.length} problems`);
  for (const p of county) console.log(`  ${p}`);
  process.exitCode = act.unresolved.length || county.length || pbo.length || cob.length ? 1 : 0;
}
