// Builds the generated figure files in data/national/figures/ from the checked CSVs in data-src/national/.
// Never edit those JSON files by hand: correct the CSV, then run this. budget-2026-27.json is typed, not generated.
//   node scripts/national/build-figures.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '@kbe/engine/csv';
import { COUNTIES, countySlug } from '@kbe/engine/counties';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const csv = (p) => parseCsv(readFileSync(join(root, 'data-src/national', p), 'utf8'));
const CHECKED = { checkedOn: '2026-11-02', checkedBy: 'claude-code' };

export function appropriationFigures() {
  const rows = csv('appropriation-act-2026/extract.csv');
  const totals = csv('appropriation-act-2026/totals.csv');
  const P = 'ke.fy2026-27.approved';
  const page = (pdf) => ({ page: `Schedule, p.${Number(pdf) + 385}`, pdfPage: Number(pdf) });
  const out = [];
  const add = (id, name, value, level, parent, pdf, extra = {}) => out.push({ id, name, value, level, parent, ...page(pdf), ...extra });
  const money = (base, name, row, level, parent) => {
    for (const [col, label] of [['supply', 'Supply'], ['aia', 'Appropriations-in-Aid']]) {
      if (row[col] === '') continue; // the Act prints a dash: no figure, never a zero
      add(`${base}.${col}`, `${name} (${label})`, Number(row[col]), level, parent ? `${parent}.${col}` : null, row.pdf_page, row.corrected === 'yes' ? { note: 'Text layer misread; value read from the page image. See corrections.csv.' } : {});
    }
  };
  const [cc1, cc2, cluster1, cc3, cc4, cluster2, grand] = totals;
  money(`${P}.total`, 'All votes', grand, 'total', null);
  money(`${P}.cluster.central`, 'Central Government', cluster1, 'total', `${P}.total`);
  money(`${P}.cluster.commissions`, 'Commissions and independent offices', cluster2, 'total', `${P}.total`);
  money(`${P}.class.central-recurrent`, 'Central Government, recurrent', cc1, 'total', `${P}.cluster.central`);
  money(`${P}.class.central-development`, 'Central Government, development', cc2, 'total', `${P}.cluster.central`);
  money(`${P}.class.commissions-recurrent`, 'Commissions, recurrent', cc3, 'total', `${P}.cluster.commissions`);
  money(`${P}.class.commissions-development`, 'Commissions, development', cc4, 'total', `${P}.cluster.commissions`);
  for (const r of rows) {
    const kind = r.kind === 'R' ? 'recurrent' : 'development';
    const vote = `${P}.vote.${r.vote}.${kind}`;
    if (!r.programme) money(vote, `${r.name}, ${kind}`, r, 'vote', `${P}.class.${r.class}`);
    else money(`${vote}.programme.${r.programme}`, `${r.name}, ${kind}`, r, 'programme', vote);
  }
  return { defaults: { fy: '2026/27', stage: 'approved', unit: 'KSh', grouping: 'vote', money: 'national', label: 'official', source: 'appropriation-act-2026', ...CHECKED }, figures: out };
}

export function countyActFigures() {
  const rows = csv('county-allocation-act-2026/typed.csv');
  const T = 'ke.fy2026-27.law.county-total', PREV = 'ke.fy2025-26.law.county-total';
  const pageFor = (i) => { const p = i < 18 ? 459 : i < 39 ? 460 : 461; return { page: `First Schedule, p.${p}`, pdfPage: p - 452 }; };
  const total = (id, name, value, extra = {}) => ({ id, name, value, level: 'total', parent: null, page: 'First Schedule, p.461, Total row', pdfPage: 9, ...extra });
  const figures = [
    total(`${T}.equitable-share`, 'All 47 counties: total equitable share', 428000000000, { parts: [`${T}.baseline`, `${T}.affirmative-action`, `${T}.formula`] }),
    total(`${T}.baseline`, 'All 47 counties: baseline allocation', 387425000000),
    total(`${T}.affirmative-action`, 'All 47 counties: affirmative action allocation', 4460000000),
    total(`${T}.formula`, 'All 47 counties: additional equitable share (weighted formula)', 36115000000),
    total(`${PREV}.equitable-share`, 'All 47 counties: total equitable share, FY2025/26', 415000000000, { fy: '2025/26' }),
  ];
  rows.forEach((r, i) => {
    const slug = countySlug(r.county), C = `ke.fy2026-27.law.county.${slug}`, at = pageFor(i);
    const row = (id, name, value, parent, extra = {}) => figures.push({ id, name: `${r.county}: ${name}`, value: Number(value), level: 'county', parent, ...at, ...extra });
    const parts = [`${C}.baseline`, ...(Number(r.d) ? [`${C}.affirmative-action`] : []), `${C}.formula`];
    row(`${C}.equitable-share`, 'total equitable share', r.g, `${T}.equitable-share`, { parts });
    row(`${C}.baseline`, 'baseline allocation', r.c, `${T}.baseline`);
    if (Number(r.d)) row(`${C}.affirmative-action`, 'affirmative action allocation', r.d, `${T}.affirmative-action`);
    row(`${C}.formula`, 'additional equitable share (weighted formula)', r.f, `${T}.formula`);
    row(`ke.fy2025-26.law.county.${slug}.equitable-share`, 'total equitable share, FY2025/26', r.a, `${PREV}.equitable-share`, { fy: '2025/26' });
  });
  for (const [key, name, value] of [['population', 'Population', 45], ['equal-share', 'Equal share', 35], ['poverty', 'Poverty', 12], ['geographical-size', 'Geographical size', 8]]) {
    figures.push({ id: `ke.fy2026-27.law.formula-weight.${key}`, name: `Formula weight: ${name}`, value, unit: '%', level: 'measure', parent: null, page: 'First Schedule, note ***, p.461', pdfPage: 9 });
  }
  return { defaults: { fy: '2026/27', stage: 'law', unit: 'KSh', grouping: 'county-allocation', money: 'county', label: 'official', source: 'county-allocation-act-2026', ...CHECKED, note: 'Typed from a picture of the table; a person should check it first.' }, figures };
}

export function craFigures() {
  const rows = csv('cra-recommendation-2026-27/typed.csv');
  const T = 'ke.fy2026-27.recommendation.county-total.equitable-share';
  const figures = [{ id: T, name: 'All 47 counties: CRA recommended share', value: 458940, level: 'total', parent: null, page: 'Table 6.2, p.45', pdfPage: 52 }];
  rows.forEach((r, i) => figures.push({ id: `ke.fy2026-27.recommendation.county.${countySlug(r.county)}.equitable-share`, name: `${r.county}: CRA recommended share`, value: Number(r.recommended), level: 'county', parent: T, page: `Table 6.2, p.${i < 14 ? 44 : 45}`, pdfPage: i < 14 ? 51 : 52 }));
  return { defaults: { fy: '2026/27', stage: 'recommendation', unit: 'KSh m', grouping: 'county-allocation', money: 'county', label: 'official', source: 'cra-recommendation-2026-27', checkedOn: '2026-11-01', checkedBy: 'claude-code' }, figures };
}

export function guideCountyFigures() {
  const rows = csv('mwananchi-guide-2026-27/typed.csv');
  return {
    defaults: { fy: '2026/27', stage: 'statement', unit: 'KSh bn', grouping: 'county-allocation', money: 'county', label: 'official', source: 'mwananchi-2026-27', level: 'county', parent: 'ke.fy2026-27.statement.county.equitable-share', page: 'p.14, table', pdfPage: 14, checkedOn: '2026-11-01', checkedBy: 'claude-code', note: 'Rounded by the Treasury and printed as a picture. The exact amount at the law stage is in the County Allocation of Revenue Act.' },
    figures: rows.map((r) => ({ id: `ke.fy2026-27.statement.county.${countySlug(r.county)}.equitable-share`, name: `${r.county}: equitable share, rounded`, value: Number(r.billion) })),
  };
}

// Each vote's total from the Parliamentary Budget Office's tables, in one grouping for both years, so a vote can be
// compared with last year like for like. The Act stays the record of this year's money; these exist to be compared.
function pboVoteFigures(file, year, fy, source) {
  const rows = csv(`pbo-explainer/${file}`);
  return {
    defaults: { fy, stage: 'approved', unit: 'KSh m', level: 'vote', grouping: 'pbo-vote', money: 'national', label: 'official', source, parent: null, ...CHECKED },
    figures: rows.map((r) => ({ id: `ke.fy${year}.approved.pbo.vote.${r.code}.total`, name: `${r.name}: total`, value: Number(r.total), page: `Table ${r.table}, PDF p.${r.pdf_page}`, pdfPage: Number(r.pdf_page) })),
  };
}

// The Controller of Budget's Table 2.5. Nairobi is printed as Nairobi; the Act and the URLs call it Nairobi City.
const cobSlug = (county) => (county === 'Nairobi' ? 'nairobi-city' : countySlug(county).replaceAll('-', ' ').replaceAll(' ', '-'));
const COB = [['budget', 'total_budget', 'budget'], ['spent', 'total_spent', 'spending'], ['dev-budget', 'dev_budget', 'development budget'], ['dev-spent', 'dev_spent', 'development spending']];

export function cobCountyFigures(year, source, offset) {
  const fy = year.replace('-', '/'), rows = csv(`cob-county-${year}/extract.csv`);
  const T = `ke.fy${year}.spent.county-total`;
  const page = (r) => ({ page: `Table 2.5, p.${Number(r.pdf_page) + offset}`, pdfPage: Number(r.pdf_page) });
  const figures = [];
  for (const r of rows) {
    const total = r.county === 'Total', slug = total ? null : cobSlug(r.county), who = total ? 'All 47 counties' : r.county === 'Nairobi' ? 'Nairobi City' : r.county;
    if (!total && !COUNTIES.some((c) => c.slug === slug)) throw new Error(`Unknown county in the CoB table: ${r.county}`);
    const base = total ? T : `ke.fy${year}.spent.county.${slug}`;
    for (const [key, column, words] of COB) figures.push({ id: `${base}.${key}`, name: `${who}: ${words}, FY${fy}`, value: Number(r[column]), level: total ? 'total' : 'county', parent: total ? null : `${T}.${key}`, ...page(r) });
    figures.push({ id: `${base}.dev-absorption`, name: `${who}: share of the development budget spent, FY${fy}`, value: Number(r.dev_pct), unit: '%', level: 'measure', parent: null, ...page(r) });
    figures.push({ id: `${base}.absorption`, name: `${who}: share of the budget spent, FY${fy}`, value: Number(r.overall_pct), unit: '%', level: 'measure', parent: null, ...page(r) });
  }
  return { defaults: { fy, stage: 'spent', unit: 'KSh m', grouping: 'county-spending', money: 'county', label: 'official', source, ...CHECKED }, figures };
}

// Own-source revenue, wages, trade payables and total revenue for FY2025/26. A dash in the report gives no figure: Nandi reported
// no trade payables, so it has none here. The notes repeat the report's own warnings, so they stay with the figures.
const NOTES = {
  nyeri: 'Nyeri reported hospital (FIF) revenue inconsistently, so the Controller of Budget left it out of this table.',
  wages: 'Several counties did not pay their full wage bill for the year, which the Controller of Budget says understates their ratios.',
  payables: 'The Controller of Budget marks this county: its total here does not agree with its ageing table in the same report.',
  sums: 'The report prints this row with parts that do not add to its recurrent total. Shown as printed.',
};
export function cobDetailFigures() {
  const Y = 'ke.fy2025-26.spent', fy = 'FY2025/26', out = [];
  const read = (file) => new Map(csv(`cob-county-2025-26/${file}`).map((r) => [r.county === 'Total' ? 'total' : cobSlug(r.county), r]));
  const osr = read('osr.csv'), wages = read('wages.csv'), payables = read('payables.csv'), annex = read('annex.csv');
  const off = (table, r) => ({ page: `${table}, p.${Number(r.pdf_page) - 34}`, pdfPage: Number(r.pdf_page) });
  const summedIssue = new Set(csv('cob-county-2025-26/known-issues.csv').filter((k) => k.table === 'wages').map((k) => cobSlug(k.county)));
  for (const slug of [...COUNTIES.map((c) => c.slug), 'total']) {
    const all = slug === 'total', name = all ? 'All 47 counties' : COUNTIES.find((c) => c.slug === slug).name, base = all ? `${Y}.county-total` : `${Y}.county.${slug}`;
    const add = (key, words, value, grouping, at, extra = {}) => out.push({ id: `${base}.${key}`, name: `${name}: ${words}, ${fy}`, value: Number(value), grouping, level: all ? 'total' : 'county', parent: all ? null : `${Y}.county-total.${key}`, ...at, ...extra });
    const o = osr.get(slug), w = wages.get(slug), p = payables.get(slug), a = annex.get(slug);
    const note = (text) => (text ? { note: text } : {});
    add('osr-target', 'own-source revenue target', o.total_target, 'county-revenue-osr', off('Table 2.1', o), note(slug === 'nyeri' && NOTES.nyeri));
    add('osr-actual', 'own-source revenue reported', o.total_actual, 'county-revenue-osr', off('Table 2.1', o), note(slug === 'nyeri' && NOTES.nyeri));
    add('revenue', 'total revenue reported', a.total_actual, 'county-revenue', off('Annex I', a));
    add('grants-target', 'additional allocations budgeted', a.additional_target, 'county-grants', off('Annex I', a));
    add('grants-actual', 'additional allocations received', a.additional_actual, 'county-grants', off('Annex I', a));
    add('wages', 'compensation to employees', w.compensation, 'county-wages', off('Table 2.4', w), note(summedIssue.has(slug) && NOTES.sums));
    if (p.total) add('payables', 'trade payables at 30 June 2026', p.total, 'county-payables', off('Table 2.10', p), note(p.starred && NOTES.payables));
    out.push({ id: `${base}.wage-share`, name: `${name}: wages as a share of total revenue, ${fy}`, value: Number((Number(w.compensation) / Number(a.total_actual) * 100).toFixed(all ? 2 : 1)), unit: '%', grouping: 'county-measure', level: 'measure', parent: null, ...off('Table 2.4 and Annex I', w), page: `Table 2.4, p.${Number(w.pdf_page) - 34}, and Annex I, p.${Number(a.pdf_page) - 34}`, calc: { formula: 'a / b * 100', inputs: [`${base}.wages`, `${base}.revenue`], round: all ? 2 : 1 }, note: NOTES.wages });
    if (!all) out.push({ id: `${base}.dev-share`, name: `${name}: development as a share of the budget, ${fy}`, value: Number((Number(fig25(slug).dev_budget) / Number(fig25(slug).total_budget) * 100).toFixed(1)), unit: '%', grouping: 'county-measure', level: 'measure', parent: null, page: `Table 2.5, p.${Number(fig25(slug).pdf_page) - 34}`, pdfPage: Number(fig25(slug).pdf_page), calc: { formula: 'a / b * 100', inputs: [`${base}.dev-budget`, `${base}.budget`], round: 1 } });
  }
  return { defaults: { fy: '2025/26', stage: 'spent', unit: 'KSh m', money: 'county', label: 'official', source: 'cob-county-birr-2025-26', ...CHECKED }, figures: out };
}
const fig25 = (slug) => csv('cob-county-2025-26/extract.csv').find((r) => cobSlug(r.county) === slug);

// Which votes make up each sector, from the Budget Explainer's own tables, not from any judgment of ours (decision #93)
export function sectorMap() {
  const rows = csv('pbo-explainer/votes-2026-27.csv'), out = [];
  for (const r of rows) {
    if (!out.some((s) => s.slug === r.sector)) out.push({ slug: r.sector, table: Number(r.table), votes: [] });
    out.find((s) => s.slug === r.sector).votes.push(r.code);
  }
  return out;
}

// Five years of debt. FY2024/25 is provisional in the report. Stock and interest are national money, kept in their own groupings.
export function debtFigures() {
  const rows = csv('debt-report-2024-25/extract.csv'), figures = [];
  const names = { stock: ['Public debt stock', 'debt-stock', 'KSh m'], 'stock-external': ['External debt stock', 'debt-stock', 'KSh m'], 'stock-domestic': ['Domestic debt stock', 'debt-stock', 'KSh m'], gdp: ['Nominal GDP', 'gdp', 'KSh m'], 'stock-gdp': ['Public debt as a share of GDP', 'debt-ratio', '%'], service: ['Total debt service', 'debt-service', 'KSh m'], interest: ['Interest paid', 'debt-interest', 'KSh m'], 'interest-external': ['Interest on external debt', 'debt-interest', 'KSh m'], 'interest-domestic': ['Interest on domestic debt', 'debt-interest', 'KSh m'], revenue: ['Ordinary revenue', 'revenue-total', 'KSh m'], 'service-revenue': ['Debt service as a share of revenue', 'debt-ratio', '%'] };
  for (const fy of ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25']) {
    const year = fy.replace('/', '-');
    for (const r of rows) {
      const [name, grouping, unit] = names[r.key], base = `ke.fy${year}.spent.debt`;
      const parent = { 'stock-external': `${base}.stock`, 'stock-domestic': `${base}.stock`, 'interest-external': `${base}.interest`, 'interest-domestic': `${base}.interest` }[r.key] ?? null;
      figures.push({ id: `${base}.${r.key}`, name: `${name}, FY${fy}`, value: Number(r[fy]), unit, fy, grouping, parent, level: 'debt', page: `${r.table}, p.${r.pdf_page}`, pdfPage: Number(r.pdf_page), ...(fy === '2024/25' ? { note: 'Provisional in the report.' } : {}) });
    }
  }
  return { defaults: { stage: 'spent', money: 'national', label: 'official', source: 'annual-public-debt-report-2024-25', ...CHECKED }, figures };
}

// The Programme Based Budget's FY2026/27 column: sub-programmes under their programmes, and each vote's economic classification.
// Programmes the Act no longer funds have no FY2026/27 amount in the book, so they are left out.
export function pbbFigures() {
  const book = csv('pbb-2026-27/programmes.csv'), economic = csv('pbb-2026-27/economic.csv'), V = 'ke.fy2026-27.approved.pbb.vote', out = [];
  const at = (r, part) => ({ page: `Part ${part}, PDF p.${r.pdf_page}`, pdfPage: Number(r.pdf_page) });
  const programmeOf = (r) => book.find((p) => p.kind === 'programme' && p.vote === r.vote && p.code.slice(0, 4) === r.code.slice(0, 4) && p.y2026_27 !== '');
  for (const r of book.filter((x) => x.y2026_27 !== '')) {
    if (r.kind === 'total') out.push({ id: `${V}.${r.vote}.total`, name: `Vote ${r.vote}: total`, value: Number(r.y2026_27), level: 'vote', grouping: 'pbb-programme', parent: null, ...at(r, 'F') });
    if (r.kind === 'programme') out.push({ id: `${V}.${r.vote}.programme.${r.code}`, name: r.name, value: Number(r.y2026_27), level: 'programme', grouping: 'pbb-programme', parent: `${V}.${r.vote}.total`, ...at(r, 'F') });
    if (r.kind === 'subprogramme') out.push({ id: `${V}.${r.vote}.subprogramme.${r.code}`, name: r.name, value: Number(r.y2026_27), level: 'subprogramme', grouping: 'pbb-programme', parent: `${V}.${r.vote}.programme.${programmeOf(r).code}`, ...at(r, 'F') });
  }
  for (const vote of new Set(economic.map((r) => r.vote))) {
    let block = null;
    for (const r of economic.filter((x) => x.vote === vote && x.y2026_27 !== '')) {
      if (r.block === 'total') out.push({ id: `${V}.${vote}.economic.total`, name: `Vote ${vote}: total by economic classification`, value: Number(r.y2026_27), level: 'economic', grouping: 'pbb-economic', parent: null, ...at(r, 'G') });
      else if (r.block === 'current' || r.block === 'capital') { block = r.block; out.push({ id: `${V}.${vote}.economic.${block}`, name: `Vote ${vote}: ${block} expenditure`, value: Number(r.y2026_27), level: 'economic', grouping: 'pbb-economic', parent: `${V}.${vote}.economic.total`, ...at(r, 'G') }); }
      else if (block) out.push({ id: `${V}.${vote}.economic.${block}.${r.code}`, name: r.name, value: Number(r.y2026_27), level: 'economic', grouping: 'pbb-economic', parent: `${V}.${vote}.economic.${block}`, ...at(r, 'G') });
    }
  }
  return { defaults: { fy: '2026/27', stage: 'approved', unit: 'KSh', money: 'national', label: 'official', source: 'pbb-2026-27', ...CHECKED }, figures: out };
}

// Each programme's stated outcome, in the book's words. Text, not figures, so it lives beside them.
export const outcomeMap = () => Object.fromEntries(csv('pbb-2026-27/outcomes.csv').map((r) => [r.programme, r.outcome]));

export const GENERATED = {
  'appropriation-act-2026.json': appropriationFigures, 'county-allocation-act-2026.json': countyActFigures, 'cra-recommendation-2026-27.json': craFigures, 'guide-counties-2026-27.json': guideCountyFigures,
  'pbo-votes-2026-27.json': () => pboVoteFigures('votes-2026-27.csv', '2026-27', '2026/27', 'pbo-budget-explainer-2026'),
  'pbo-votes-2025-26.json': () => pboVoteFigures('votes-2025-26.csv', '2025-26', '2025/26', 'pbo-budget-explainer-2025'),
  'cob-counties-2024-25.json': () => cobCountyFigures('2024-25', 'cob-county-birr-2024-25', -44),
  'cob-counties-2025-26.json': () => cobCountyFigures('2025-26', 'cob-county-birr-2025-26', -34),
  'cob-county-detail-2025-26.json': cobDetailFigures,
  'debt-2024-25.json': debtFigures,
  'pbb-2026-27.json': pbbFigures,
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (COUNTIES.length !== 47) throw new Error('Expected 47 counties');
  for (const [file, make] of Object.entries(GENERATED)) {
    const data = make();
    writeFileSync(join(root, 'data/national/figures', file), JSON.stringify(data, null, 1) + '\n');
    console.log(file, data.figures.length);
  }
  writeFileSync(join(root, 'data/national/sectors.json'), JSON.stringify(sectorMap(), null, 1) + '\n');
  writeFileSync(join(root, 'data/national/outcomes.json'), JSON.stringify(outcomeMap(), null, 1) + '\n');
}
