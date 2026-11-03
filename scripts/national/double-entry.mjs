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

// The debt report's parts must add to its totals, and its printed shares must fit its amounts, in all five years
export function debtChecks(rows) {
  const problems = [], row = (k) => rows.find((r) => r.key === k);
  for (const fy of ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25']) {
    const v = (k) => Number(row(k)?.[fy]);
    if (Math.abs(v('stock-external') + v('stock-domestic') - v('stock')) > 3) problems.push(`${fy}: external and domestic debt do not add to ${v('stock')}`);
    if (Math.abs(v('interest-external') + v('interest-domestic') - v('interest')) > 3) problems.push(`${fy}: interest does not add to ${v('interest')}`);
    if (Math.abs(v('service') / v('revenue') * 100 - v('service-revenue')) > 0.06) problems.push(`${fy}: debt service prints ${v('service-revenue')}% of revenue, the amounts give ${(v('service') / v('revenue') * 100).toFixed(2)}%`);
    if (Math.abs(v('stock') / v('gdp') * 100 - v('stock-gdp')) > 0.06) problems.push(`${fy}: debt prints ${v('stock-gdp')}% of GDP, the amounts give ${(v('stock') / v('gdp') * 100).toFixed(2)}%`);
  }
  return problems;
}

// The Programme Based Budget against the Act: every programme the Act funds must be in the book at the Act's gross amount,
// sub-programmes must add to their programme, and each vote's economic classification must add to the vote. Where the book
// and the Act disagree, the Act is the law and the difference is listed in known-issues.csv.
export function pbbChecks(book, economic, act, known = []) {
  const problems = [], n = (v) => Number(v || 0), gross = new Map();
  for (const r of act) { const k = r.programme ? `${r.vote}/${r.programme}` : r.vote; gross.set(k, (gross.get(k) ?? 0) + n(r.supply) + n(r.aia)); }
  const add = (key, text) => { if (!known.some((k) => k.key === key)) problems.push(`Programme Based Budget ${key}: ${text}`); };
  const funded = book.filter((r) => r.kind === 'programme' && r.y2026_27 !== '');
  for (const [key, value] of gross) {
    if (!key.includes('/')) { const t = book.find((r) => r.kind === 'total' && r.vote === key); if (n(t?.y2026_27) !== value) add(key, `vote total ${t?.y2026_27} against the Act's ${value}`); continue; }
    const r = funded.find((x) => `${x.vote}/${x.code}` === key);
    if (!r) add(key, 'not in the book');
    else if (n(r.y2026_27) !== value) add(key, `${r.y2026_27} against the Act's ${value}`);
  }
  for (const p of funded) {
    const subs = book.filter((r) => r.kind === 'subprogramme' && r.vote === p.vote && r.code.slice(0, 4) === p.code.slice(0, 4));
    if (Math.abs(subs.reduce((a, r) => a + n(r.y2026_27), 0) - n(p.y2026_27)) > 2) add(`${p.vote}/${p.code}`, 'sub-programmes do not add to the programme');
  }
  for (const vote of new Set(economic.map((r) => r.vote))) {
    const rows = economic.filter((r) => r.vote === vote), total = rows.find((r) => r.block === 'total'), blocks = rows.filter((r) => r.block === 'current' || r.block === 'capital');
    if (Math.abs(blocks.reduce((a, r) => a + n(r.y2026_27), 0) - n(total?.y2026_27)) > 2) add(`${vote}/economic`, 'current and capital do not add to the total');
    if (n(total?.y2026_27) !== gross.get(vote)) add(`${vote}/economic`, `total ${total?.y2026_27} against the Act's ${gross.get(vote)}`);
  }
  return problems;
}

// The quarterly review's Table 6: each row's variance is actual minus target, recurrent plus development is the total,
// the printed share spent follows from the amounts, the rows add to the Total row, and every amount is in the second
// reading. Amounts are rounded to the million, so sums may differ by one per row added, and the share by what that
// rounding can move it. Printed inconsistencies are listed in known-issues.csv: they do not fail, and anything new does.
export function qebrChecks(rows, second, headline, known = []) {
  const problems = [], n = (v) => (v === '' ? 0 : Number(v)), skip = (vote) => known.some((k) => k.vote === (vote || 'Total'));
  const add = (r, text) => { if (!skip(r.vote)) problems.push(`Quarterly review Table 6 ${r.vote || 'Total'}: ${text}`); };
  for (const r of rows) {
    for (const p of ['rec', 'dev', 'total']) if (Math.abs(n(r[`${p}_actual`]) - n(r[`${p}_target`]) - n(r[`${p}_variance`])) > 1) add(r, `${p} variance is not actual minus target`);
    for (const k of ['actual', 'target', 'variance']) if (Math.abs(n(r[`rec_${k}`]) + n(r[`dev_${k}`]) - n(r[`total_${k}`])) > 1) add(r, `recurrent and development do not add to the total ${k}`);
    if (r.pct_spent !== '') {
      const a = n(r.total_actual), t = n(r.total_target), slack = (0.5 / t + 0.5 * a / t / t) * 100 + 0.05;
      if (Math.abs(a / t * 100 - Number(r.pct_spent)) > slack) add(r, `prints ${r.pct_spent}% spent, the amounts give ${(a / t * 100).toFixed(2)}%`);
    }
  }
  const votes = rows.filter((r) => r.vote), total = rows.find((r) => !r.vote);
  for (const c of Object.keys(total).filter((k) => /_(actual|target|variance)$/.test(k))) {
    if (Math.abs(votes.reduce((a, r) => a + n(r[c]), 0) - n(total[c])) > votes.length / 2) problems.push(`Quarterly review Table 6: the votes do not add to the Total row's ${c}`);
  }
  const counts = new Map(second.map((x) => [x.printed, Number(x.count)])), need = new Map();
  const printed = (v) => { const s = Math.abs(v).toLocaleString('en-US'); return v < 0 ? `(${s})` : s; };
  for (const r of rows) for (const [k, v] of Object.entries(r)) if (/_(actual|target|variance)$/.test(k) && v !== '') need.set(printed(Number(v)), (need.get(printed(Number(v))) ?? 0) + 1);
  for (const [s, c] of need) if ((counts.get(s) ?? 0) < c) problems.push(`Quarterly review Table 6: ${s} is in the first reading ${c} times but not as often in the second`);
  const h = new Map(headline.map((x) => [x.key, x]));
  if (Math.abs(n(h.get('interest-domestic').actual_bn) + n(h.get('interest-foreign').actual_bn) - n(h.get('interest').actual_bn)) > 0.15) problems.push('Quarterly review: domestic and foreign interest do not add to the interest paid');
  return problems;
}

// Each vote's projects must add to the vote's printed total, in both years, and that total must be the Act's development money
export function projectChecks(rows, act) {
  const problems = [], n = (v) => Number(v || 0), gross = new Map();
  for (const r of act.filter((x) => x.kind === 'D' && !x.programme)) gross.set(r.vote, n(r.supply) + n(r.aia));
  const totals = rows.filter((r) => !r.code);
  for (const t of totals) {
    const list = rows.filter((r) => r.code && r.vote === t.vote);
    for (const k of ['gross_2026_27', 'approved_2025_26']) if (Math.abs(list.reduce((a, r) => a + n(r[k]), 0) - n(t[k])) > 2) problems.push(`Development Estimates D${t.vote}: projects do not add to the printed ${k}`);
    if (n(t.gross_2026_27) !== gross.get(t.vote)) problems.push(`Development Estimates D${t.vote}: ${t.gross_2026_27} against the Act's ${gross.get(t.vote)}`);
  }
  const missing = [...gross.keys()].filter((v) => !totals.some((t) => t.vote === v));
  if (missing.length) problems.push(`Development Estimates: no vote total for D${missing.join(', D')}`);
  const codes = rows.filter((r) => r.code).map((r) => r.code);
  if (new Set(codes).size !== codes.length) problems.push('Development Estimates: a project code appears twice');
  return problems;
}

// The ratios the report names, which our own division must reproduce. That is what proves the method.
export const NAMED_WAGE_SHARES = { 'Homa Bay': 56, Nyeri: 52, 'Taita-Taveta': 49, Mombasa: 26, Kwale: 26, 'Tana River': 28 };

// Each table's arithmetic and totals, its agreement with Table 2.5, and the report's named wage ratios. The report's own slips
// are listed in known-issues.csv: they do not fail, and anything new does.
export function cobDetailChecks({ osr, wages, payables, annex, spending, known = [] }) {
  const problems = [], n = (v) => Number(v || 0), norm = (c) => c.toLowerCase().replace(/[^a-z]/g, '').replace('nairobicity', 'nairobi');
  const by = (list, county) => list.find((r) => norm(r.county) === norm(county));
  const add = (table, county, text) => { if (!known.some((k) => k.table === table && norm(k.county) === norm(county))) problems.push(`Table ${table}, ${county}: ${text}`); };
  for (const r of osr) {
    if (Math.abs(n(r.ord_target) + n(r.fif_target) - n(r.total_target)) > 0.021) add('osr', r.county, 'targets do not add');
    if (Math.abs(n(r.ord_actual) + n(r.fif_actual) - n(r.total_actual)) > 0.021) add('osr', r.county, 'revenue does not add');
    if (Math.abs(n(r.total_actual) / n(r.total_target) * 100 - n(r.total_pct)) > 0.02) add('osr', r.county, `prints ${r.total_pct}%`);
  }
  for (const r of wages) {
    if (Math.abs(n(r.compensation) + n(r.operations) - n(r.recurrent)) > 0.021) add('wages', r.county, 'wages and operations do not add to recurrent');
    const t = by(spending, r.county);
    if (r.county !== 'Total' && Math.abs(n(r.development) - n(t?.dev_spent)) > 0.05) add('wages', r.county, `development ${r.development} against Table 2.5 ${t?.dev_spent}`);
  }
  for (const r of payables) {
    if (Math.abs(n(r.exec_total) + n(r.asm_total) - n(r.total)) > 0.021) add('payables', r.county, 'executive and assembly do not add');
    if (Math.abs(n(r.total) / n(r.budget) * 100 - n(r.pct)) > 0.06) add('payables', r.county, `prints ${r.pct}%`);
    if (Math.abs(n(r.budget) - n(by(spending, r.county)?.total_budget)) > 0.05) add('payables', r.county, 'budget differs from Table 2.5');
  }
  for (const [name, rows, keys] of [['osr', osr, ['total_target', 'total_actual']], ['wages', wages, ['compensation']], ['payables', payables, ['total']], ['annex', annex, ['total_actual', 'additional_actual', 'additional_target']]]) {
    const counties = rows.filter((r) => r.county !== 'Total'), total = rows.find((r) => r.county === 'Total');
    if (counties.length !== 47 || !total) problems.push(`Table ${name}: expected 47 counties and a total, found ${counties.length}`);
    if (total) for (const k of keys) if (Math.abs(counties.reduce((a, r) => a + n(r[k]), 0) - n(total[k])) > 0.5) problems.push(`Table ${name}: ${k} does not add to ${total[k]}`);
  }
  for (const [county, share] of Object.entries(NAMED_WAGE_SHARES)) {
    const got = n(by(wages, county)?.compensation) / n(by(annex, county)?.total_actual) * 100;
    if (Math.round(got) !== share) problems.push(`${county}: the report names a wage share of ${share}%, the tables give ${got.toFixed(1)}%`);
  }
  const all = n(by(wages, 'Total')?.compensation) / n(by(annex, 'Total')?.total_actual) * 100;
  if (annex.length && wages.length && Math.abs(all - 39.54) > 0.01) problems.push(`All counties: the report gives a wage share of 39.54%, the tables give ${all.toFixed(2)}%`);
  return problems;
}

export function runDoubleEntry() {
  const corrections = new Map(csv('appropriation-act-2026/corrections.csv').map((r) => [r.key, r]));
  const act = compareReadings(csv('appropriation-act-2026/extract.csv'), csv('appropriation-act-2026/typed.csv'), corrections);
  const county = countyChecks(csv('county-allocation-act-2026/typed.csv'), csv('cra-recommendation-2026-27/typed.csv'), csv('mwananchi-guide-2026-27/typed.csv'));
  const pbo = pboChecks(csv('appropriation-act-2026/extract.csv'), csv('pbo-explainer/votes-2026-27.csv'), csv('pbo-explainer/votes-2025-26.csv'));
  const earlier = JSON.parse(readFileSync(join(root, 'src/data/compare.json'), 'utf8')).counties;
  const cob = [...cobChecks(csv('cob-county-2024-25/extract.csv'), csv('cob-county-2024-25/typed.csv'), earlier).map((p) => `FY2024/25 ${p}`),
    ...cobChecks(csv('cob-county-2025-26/extract.csv'), csv('cob-county-2025-26/typed.csv')).map((p) => `FY2025/26 ${p}`),
    ...cobDetailChecks({ osr: csv('cob-county-2025-26/osr.csv'), wages: csv('cob-county-2025-26/wages.csv'), payables: csv('cob-county-2025-26/payables.csv'), annex: csv('cob-county-2025-26/annex.csv'), spending: csv('cob-county-2025-26/extract.csv'), known: csv('cob-county-2025-26/known-issues.csv') })];
  const debt = debtChecks(csv('debt-report-2024-25/extract.csv'));
  const pbb = pbbChecks(csv('pbb-2026-27/programmes.csv'), csv('pbb-2026-27/economic.csv'), csv('appropriation-act-2026/extract.csv'), csv('pbb-2026-27/known-issues.csv'));
  const projects = projectChecks(csv('dev-estimates-2026-27/projects.csv'), csv('appropriation-act-2026/extract.csv'));
  const qebr = qebrChecks(csv('qebr-2025-26-q4/votes.csv'), csv('qebr-2025-26-q4/votes-second.csv'), csv('qebr-2025-26-q4/headline.csv'), csv('qebr-2025-26-q4/known-issues.csv'));
  return { act, county, pbo: [...pbo, ...pbb, ...projects, ...qebr], cob: [...cob, ...debt.map((p) => `Debt report ${p}`)] };
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
