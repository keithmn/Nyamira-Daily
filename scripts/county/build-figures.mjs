// Builds Nyamira's figure files in data/county/nyamira/figures/, and the list of departments and programmes in
// data/county/nyamira/structure-2025-26.json, from the checked CSVs in data-src/county/nyamira/.
// Never edit the JSON by hand: correct the CSV, then run this (decision #105).
//   node scripts/county/build-figures.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const csv = (p) => parseCsv(readFileSync(join(root, 'data-src/county/nyamira', p), 'utf8'));
const out = (p, data) => writeFileSync(join(root, 'data/county/nyamira', p), JSON.stringify(data, null, 2) + '\n');
const fyId = (fy) => fy.replace('/', '-');

// --- Programme Based Budget 2025/26: the 24 votes and their programmes -------------------------------------------
// Printed page numbers equal PDF page numbers in this document.
const PBB = 'ke.fy2025-26.estimates.county.nyamira';
const PAGES = { total: 'Table 8, p.19-20', recurrent: 'Table 12, p.37-38', development: 'Table 19, p.51-52', employees: 'Table 13, p.38-39', social: 'Table 14, p.39-40', grants: 'Table 15, p.40-41', funds: 'Table 16, p.41', om: 'Table 17, p.41-42' };
const firstPage = (page) => Number(page.match(/p\.(\d+)/)[1]);

export function budgetFigures() {
  const depts = csv('pbb-2025-26/departments.csv');
  const rows = csv('pbb-2025-26/programmes.csv');
  const figures = [];
  const add = (id, name, value, level, page, extra = {}) => {
    if (!value) return; // the budget prints a dash: no figure, never a zero
    figures.push({ id, name, value, level, page, pdfPage: firstPage(page), ...extra });
  };
  const votes = (suffix) => depts.filter((d) => Number(d[suffixKey[suffix]])).map((d) => `${PBB}.vote.${d.vote}${suffix}`);
  const suffixKey = { '': 'total_t8', '.recurrent': 'recurrent_t12', '.development': 'development_t19', '.compensation.employees': 'compensation_t13', '.compensation.social': 'social_t14', '.operations.grants': 'grants_t15', '.operations.funds': 'funds_t16', '.operations.om': 'om_t17' };

  // County totals, as printed. Each is also proved against its 24 rows.
  add(`${PBB}.total`, 'Nyamira: total budget, FY2025/26', 8646298391, 'total', 'Table 8, p.20, TOTAL row');
  add(`${PBB}.recurrent`, 'Nyamira: recurrent budget, FY2025/26', 5365307614, 'total', 'Table 12, p.38, TOTAL row', { parts: votes('.recurrent') });
  add(`${PBB}.development`, 'Nyamira: development budget, FY2025/26', 3280990777, 'total', 'Table 19, p.52, TOTAL row', { parts: votes('.development') });
  add(`${PBB}.compensation.employees`, 'Nyamira: compensation to employees, FY2025/26', 3015964703, 'economic', 'Table 13, p.39, Total row', { parts: votes('.compensation.employees') });
  add(`${PBB}.compensation.social`, 'Nyamira: social contributions (employer), FY2025/26', 385119251, 'economic', 'Table 14, p.40, Total row', { parts: votes('.compensation.social') });
  add(`${PBB}.operations.grants`, 'Nyamira: recurrent conditional grants, FY2025/26', 147679711, 'economic', 'Table 15, p.40-41, Total row', { parts: votes('.operations.grants') });
  add(`${PBB}.operations.funds`, 'Nyamira: recurrent funds, FY2025/26', 319697400, 'economic', 'Table 16, p.41, Total row', { parts: votes('.operations.funds') });
  add(`${PBB}.operations.om`, 'Nyamira: operations and maintenance, FY2025/26', 1496846550, 'economic', 'Table 17, p.42, Total row', { parts: votes('.operations.om'), note: 'The narrative on p.29 gives 1,496,846,549; Table 17 and its rows give 1,496,846,550.' });
  // The document's wage bill: compensation plus employer contributions, as a share of the whole budget (p.29).
  figures.push({ id: `${PBB}.wage-share`, name: 'Nyamira: wage bill as a share of the budget, FY2025/26', value: 39.3, unit: '%', level: 'measure', grouping: 'measure', page: 'p.29', pdfPage: 29,
    calc: { formula: '(a + b) / c * 100', inputs: [`${PBB}.compensation.employees`, `${PBB}.compensation.social`, `${PBB}.total`], round: 1 },
    note: 'Printed as 39.3% in the budget statement on p.29.' });
  // Where the money comes from: Table 3, read twice (its rows and the revenue framework on p.13 give the same
  // amounts), and its parts must add up to the whole budget.
  const revenue = csv('pbb-2025-26/revenue.csv');
  add(`${PBB}.revenue.total`, 'Nyamira: total revenue expected, FY2025/26', 8646298391, 'total', 'Table 3, p.15, TOTAL REVENUE row', { grouping: 'revenue', parts: revenue.map((r) => `${PBB}.revenue.${r.key}`) });
  for (const r of revenue) add(`${PBB}.revenue.${r.key}`, `Nyamira: ${r.name.charAt(0).toLowerCase()}${r.name.slice(1)}, FY2025/26`, Number(r.amount), 'taxhead', r.key.startsWith('grants') ? 'Table 3, p.13-14' : 'Table 3, p.13', { grouping: 'revenue',
    ...(r.key === 'equitable-share' ? { note: 'Equals the County Allocation of Revenue Act 2025\'s equitable share for Nyamira.' } : r.key === 'balances' ? { note: 'Money from earlier years not yet spent, carried into this budget.' } : {}) });

  const structure = { fy: '2025/26', stage: 'estimates', source: 'nyamira-pbb-2025-26', votes: [] };
  for (const d of depts) {
    const V = `${PBB}.vote.${d.vote}`, name = d.name.replace(/,\s*$/, '');
    add(V, `${name}: total budget, FY2025/26`, Number(d.total_t8), 'vote', PAGES.total, { parent: `${PBB}.total` });
    add(`${V}.recurrent`, `${name}: recurrent budget, FY2025/26`, Number(d.recurrent_t12), 'vote', PAGES.recurrent, { parent: V });
    add(`${V}.development`, `${name}: development budget, FY2025/26`, Number(d.development_t19), 'vote', PAGES.development, { parent: V });
    const comp = Number(d.compensation_t13) + Number(d.social_t14);
    const ops = Number(d.grants_t15) + Number(d.funds_t16) + Number(d.om_t17);
    add(`${V}.compensation`, `${name}: staff pay, FY2025/26`, comp, 'economic', PAGES.employees, { parent: `${V}.recurrent`, calc: calcOf([`${V}.compensation.employees`, `${V}.compensation.social`], [d.compensation_t13, d.social_t14]), note: 'Worked out: compensation to employees (Table 13) plus employer social contributions (Table 14), the budget\'s own wage-bill definition.' });
    add(`${V}.operations`, `${name}: other running costs, FY2025/26`, ops, 'economic', PAGES.om, { parent: `${V}.recurrent`, calc: calcOf([`${V}.operations.grants`, `${V}.operations.funds`, `${V}.operations.om`], [d.grants_t15, d.funds_t16, d.om_t17]), note: 'Worked out: conditional grants (Table 15), funds (Table 16) and operations and maintenance (Table 17).' });
    add(`${V}.compensation.employees`, `${name}: compensation to employees, FY2025/26`, Number(d.compensation_t13), 'economic', PAGES.employees, { parent: `${V}.compensation` });
    add(`${V}.compensation.social`, `${name}: social contributions (employer), FY2025/26`, Number(d.social_t14), 'economic', PAGES.social, { parent: `${V}.compensation` });
    add(`${V}.operations.grants`, `${name}: recurrent conditional grants, FY2025/26`, Number(d.grants_t15), 'economic', PAGES.grants, { parent: `${V}.operations`, ...(d.vote === '5279' && Number(d.grants_t15) ? { note: 'Table 15 prints this grant against vote 5267 (Medical Services), but it reconciles only with Primary Healthcare\'s recurrent total, so it is shown here.' } : {}) });
    add(`${V}.operations.funds`, `${name}: recurrent funds, FY2025/26`, Number(d.funds_t16), 'economic', PAGES.funds, { parent: `${V}.operations` });
    add(`${V}.operations.om`, `${name}: operations and maintenance, FY2025/26`, Number(d.om_t17), 'economic', PAGES.om, { parent: `${V}.operations` });

    const programmes = [];
    for (const r of rows.filter((x) => x.vote === d.vote)) {
      let p = programmes.find((x) => x.n === Number(r.programme));
      if (!p) programmes.push(p = { n: Number(r.programme), name: r.programme_name, rows: [] });
      const R = `${PBB}.programme.${d.vote}.p${r.programme}.r${r.row}`;
      const page = `Table 9, p.${r.pdf_page}`;
      const label = `${name}: ${r.programme_name}${r.subprogramme_name && r.subprogramme_name !== r.programme_name ? `, ${r.subprogramme_name}` : ''}`;
      const both = Number(r.recurrent) && Number(r.development);
      const extra = { grouping: 'programme', ...(r.note ? { note: r.note } : {}) };
      add(`${R}.recurrent`, `${label} (recurrent), FY2025/26`, Number(r.recurrent), 'subprogramme', page, { ...extra, within: `${V}.recurrent` });
      add(`${R}.development`, `${label} (development), FY2025/26`, Number(r.development), 'subprogramme', page, { ...extra, within: `${V}.development` });
      add(R, `${label}, FY2025/26`, Number(r.total), 'subprogramme', page, { ...extra, within: V, ...(both ? { parts: [`${R}.recurrent`, `${R}.development`] } : {}) });
      p.rows.push({ row: Number(r.row), name: r.subprogramme_name || null, printedCode: r.printed_code || null, groupedBy: r.basis, figure: Number(r.total) ? R : null, note: r.note || null });
    }
    structure.votes.push({ vote: d.vote, name, short: d.short, figure: V, programmes });
  }
  return { file: { defaults: { fy: '2025/26', stage: 'estimates', unit: 'KSh', grouping: 'vote', money: 'county', label: 'official', source: 'nyamira-pbb-2025-26', parent: null, checkedOn: '2026-11-04', checkedBy: 'claude-code' }, figures }, structure };
}

// A worked-out sum of printed parts, leaving out the parts printed as a dash.
function calcOf(ids, values) {
  const used = ids.filter((_, i) => Number(values[i]));
  if (used.length < 2) return undefined;
  return { formula: used.map((_, i) => String.fromCharCode(97 + i)).join(' + '), inputs: used, round: 0 };
}

// --- Controller of Budget annual reports, FY2013/14 to FY2024/25 ----------------------------------------------------
// Figures the national registry already holds for a year are read from there, never repeated (decision #105).
const NATIONAL_HAS = { '2024/25': ['budget', 'spent', 'dev-spent', 'dev-absorption'], '2025/26': ['budget', 'spent', 'dev-spent', 'dev-absorption', 'osr-target', 'osr-actual'] };
// Checked against the report's text on 4 Nov 2026: value found on the page given. Other years are carried over
// from src/data/money.json (22 Oct 2026) and wait for the same check.
const CHECKED = JSON.parse(readFileSync(join(root, 'data-src/county/nyamira/cob-history/checked.json'), 'utf8'));
const FIELDS = [
  ['budget', 'budget', 'approved/revised budget', 'county-spending'],
  ['spent', 'spent', 'spending', 'county-spending'],
  ['dev', 'dev-spent', 'development spending', 'county-spending'],
  ['rec', 'rec-spent', 'recurrent spending', 'county-spending'],
  ['devAbs', 'dev-absorption', 'share of the development budget spent', 'county-measure'],
  ['osrTarget', 'osr-target', 'own-source revenue target', 'county-revenue-osr'],
  ['osr', 'osr-actual', 'own-source revenue reported', 'county-revenue-osr'],
  ['eqShare', 'equitable-share', 'equitable share', 'county-revenue'],
  ['pending', 'pending-bills', 'pending bills at year end', 'county-pending-bills'],
];
// money.json's equitable share column is the allocation in some years and the amount received in others; each year
// is filed under what the report says it is (eqShareIs in history.csv, with the report's words).
const EQ = { allocated: 'equitable share allocated (what the county expected to receive)', received: 'equitable share received' };

export function historyFigures() {
  const figures = [];
  for (const y of csv('cob-history/history.csv')) {
    const base = `ke.fy${fyId(y.fy)}.spent.county.nyamira`;
    const skip = NATIONAL_HAS[y.fy] ?? [];
    const check = CHECKED[y.fy];
    for (const [col, field, label, grouping] of FIELDS) {
      if (y[col] === '' || skip.includes(field)) continue; // not reported, or held by the national registry
      const isEq = field === 'equitable-share';
      const key = isEq ? `equitable-share-${y.eqShareIs}` : field;
      const what = isEq ? EQ[y.eqShareIs] : label;
      const note = field === 'osr-actual' ? y.osrNote : field === 'pending-bills' ? y.pendingNote : isEq ? y.eqShareEvidence : '';
      const checked = check?.fields?.[field];
      figures.push({
        id: `${base}.${key}`, name: `Nyamira: ${what}, FY${y.fy}`, value: Number(y[col]), fy: y.fy,
        unit: key === 'dev-absorption' ? '%' : 'KSh m', grouping, level: key === 'dev-absorption' ? 'measure' : 'county',
        source: y.fy === '2024/25' ? 'cob-county-birr-2024-25' : `cob-county-annual-${fyId(y.fy)}`,
        page: checked?.page ?? y.page, pdfPage: checked?.pdfPage ?? null,
        checkedOn: checked ? check.checkedOn : '2026-10-22', checkedBy: checked ? 'claude-code' : 'carried over from src/data/money.json',
        ...(note ? { note } : {}),
      });
    }
  }
  // FY2025/26: the few Controller of Budget figures the national registry loaded into its CSVs but not as figures.
  for (const r of csv('cob-history/fy2025-26.csv')) {
    const what = { 'rec-spent': 'recurrent spending', 'equitable-share-allocated': EQ.allocated, 'equitable-share-received': EQ.received, 'osr-fif-actual': 'hospital fees within own-source revenue' }[r.key];
    figures.push({ id: `ke.fy2025-26.spent.county.nyamira.${r.key}`, name: `Nyamira: ${what}, FY2025/26`, value: Number(r.value), fy: '2025/26', unit: 'KSh m',
      grouping: r.key.startsWith('equitable') ? 'county-revenue' : r.key.startsWith('osr') ? 'county-revenue-osr-detail' : 'county-spending', level: 'county',
      source: 'cob-county-birr-2025-26', page: r.page, pdfPage: Number(r.pdf_page), checkedOn: '2026-11-02', checkedBy: 'claude-code', ...(r.note ? { note: r.note } : {}) });
  }
  return { defaults: { stage: 'spent', money: 'county', label: 'official', parent: null }, figures };
}

// --- The county's fourth-quarter report for FY2025/26: spending by department to 30 June 2026 --------------------
// Named like the national quarterly review's figures: "target" is the budget the report prints, "actual" the
// amount spent. Each printed share spent is kept with its formula, so the engine proves the report's arithmetic.
const Q4 = 'ke.fy2025-26.spent.county.nyamira.q4';

export function quarterFigures() {
  const rows = csv('bir-2025-26-q4/departments.csv');
  const figures = [];
  for (const r of rows) {
    if (!Number(r.budget) && !Number(r.spent)) continue; // no budget and nothing spent: printed as 0
    const base = r.vote === 'total' ? Q4 : `${Q4}.vote.${r.vote}`;
    const who = r.vote === 'total' ? 'Nyamira, all departments' : r.department_as_printed;
    const page = `Table 4, p.${Number(r.pdf_page) - 10}`;
    const id = (what) => `${base}.${r.kind}.${what}`;
    const kids = (what) => (r.kind === 'total' ? { parts: ['recurrent', 'development'].filter((k) => rows.some((x) => x.vote === r.vote && x.kind === k && Number(x[what === 'target' ? 'budget' : 'spent']))).map((k) => `${base}.${k}.${what}`) } : {});
    const parent = (what) => (r.vote === 'total' ? null : `${Q4}.${r.kind}.${what}`);
    const at = { page, pdfPage: Number(r.pdf_page) };
    const fix = (p) => (p.parts?.length >= 2 ? p : {});
    figures.push({ id: id('target'), name: `${who}: ${r.kind} budget in the Q4 report, FY2025/26`, value: Number(r.budget), level: r.vote === 'total' ? 'total' : 'vote', parent: parent('target'), ...at, ...fix(kids('target')) });
    if (Number(r.spent)) figures.push({ id: id('actual'), name: `${who}: ${r.kind} spent by 30 June 2026`, value: Number(r.spent), level: r.vote === 'total' ? 'total' : 'vote', parent: parent('actual'), ...at, ...fix(kids('actual')) });
    if (Number(r.budget)) figures.push({ id: id('share'), name: `${who}: share of the ${r.kind} budget spent, FY2025/26`, value: Number(r.pct_printed), unit: '%', level: 'measure', grouping: 'measure', parent: null, ...at,
      calc: { formula: Number(r.spent) ? 'a / b * 100' : '0 * b', inputs: Number(r.spent) ? [id('actual'), id('target')] : [id('target')], round: 1 } });
  }
  return { defaults: { fy: '2025/26', stage: 'spent', unit: 'KSh', grouping: 'vote-spending', money: 'county', label: 'official', source: 'nyamira-bir-2025-26-q4', checkedOn: '2026-11-04', checkedBy: 'claude-code' }, figures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { file, structure } = budgetFigures();
  out('figures/pbb-2025-26.json', file);
  out('structure-2025-26.json', structure);
  out('figures/cob-history.json', historyFigures());
  out('figures/bir-2025-26-q4.json', quarterFigures());
  console.log(`pbb-2025-26.json: ${file.figures.length} figures; cob-history.json: ${historyFigures().figures.length}; bir-2025-26-q4.json: ${quarterFigures().figures.length}`);
}
