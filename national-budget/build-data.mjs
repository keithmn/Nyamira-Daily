// Build data.json for the national budget tool.
//
// Every figure carries: value, unit, stage, label, source id, page/table, and (for our own arithmetic) a 'calc' note.
// National figures are typed in from the Treasury/CRA documents listed in SOURCES; Nyamira and county figures are read
// from the Nyamira Daily repo (src/data/*.json) so a correction there flows here on the next build.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const B = 'KSh bn';

function fig(value, unit, src, where, { label = 'official', stage, calc, note } = {}) {
  const d = { v: value, unit, src, where, label };
  if (stage) d.stage = stage;
  if (calc) d.calc = calc;
  if (note) d.note = note;
  return d;
}

const CRA = `Baringo 7084 7845|Bomet 7447 8270|Bungoma 11838 13110|Busia 7957 8798|Elgeyo/Marakwet 5515 6118|Embu 6077 6717|Garissa 8878 9996|Homa Bay 8646 9554|Isiolo 5631 6271|Kajiado 8894 9941|Kakamega 13675 14999|Kericho 7179 8017|Kiambu 13072 14556|Kilifi 12813 14040|Kirinyaga 6152 6782|Kisii 9820 10799|Kisumu 8902 9849|Kitui 11504 12681|Kwale 9079 9942|Laikipia 6104 6762|Lamu 3858 4298|Machakos 10179 11288|Makueni 8976 9889|Mandera 12265 13259|Marsabit 8106 9073|Meru 10554 11716|Migori 8884 9835|Mombasa 8383 9305|Murang'a 7969 8842|Nairobi City 21417 23781|Nakuru 14455 15958|Nandi 7772 8583|Narok 9770 10777|Nyamira 6073 6724|Nyandarua 6663 7338|Nyeri 6896 7615|Samburu 6337 6988|Siaya 7754 8618|Taita Taveta 5760 6374|Tana River 7222 7979|Tharaka Nithi 5058 5605|Trans Nzoia 7991 8850|Turkana 13893 15186|Uasin Gishu 8977 9939|Vihiga 6009 6664|Wajir 10508 11659|West Pokot 7002 7750`;

// Mwananchi Guide p.14, printed as a picture, so typed by hand. KSh billion, rounded to one decimal place by the Treasury.
const GUIDE_P14 = `Baringo 7.3|Bomet 7.7|Bungoma 12.2|Busia 8.2|Elgeyo/Marakwet 5.7|Embu 6.3|Garissa 9.2|Homa Bay 8.9|Isiolo 5.8|Kajiado 9.2|Kakamega 14.1|Kericho 7.4|Kiambu 13.5|Kilifi 13.2|Kirinyaga 6.3|Kisii 10.1|Kisumu 9.2|Kitui 11.9|Kwale 9.3|Laikipia 6.3|Lamu 4.0|Machakos 10.5|Makueni 9.2|Mandera 12.6|Marsabit 8.4|Meru 10.9|Migori 9.2|Mombasa 8.7|Murang'a 8.2|Nairobi City 22.1|Nakuru 14.9|Nandi 8.0|Narok 10.1|Nyamira 6.3|Nyandarua 6.9|Nyeri 7.1|Samburu 6.5|Siaya 8.0|Taita Taveta 5.9|Tana River 7.4|Tharaka Nithi 5.2|Trans Nzoia 8.2|Turkana 14.3|Uasin Gishu 9.3|Vihiga 6.2|Wajir 10.8|West Pokot 7.2`;

export function buildData(repoData) {
  const readJson = (f) => JSON.parse(readFileSync(join(repoData, f), 'utf8'));

  const SOURCES = {
    mwananchi: {
      title: 'Budget Highlights: The Mwananchi Guide for the FY 2026/27 Budget (National Treasury, June 2026)',
      url: 'https://treasury.go.ke/sites/default/files/Latest%20updates/Budget%20Highlights-The%20Mwananchi%20Guide%20for%20the%20FY-2026-27%20Budget.pdf',
      stage: 'statement', date: '2026-06-11' },
    summary: {
      title: 'Budget Summary for the FY 2026/27 Budget (National Treasury, 30 April 2026)',
      url: 'https://treasury.go.ke/sites/default/files/Budget%20summary/Budget%20Summary%20for%20the%20FY%202026_27%20Budget.pdf',
      stage: 'estimates', date: '2026-04-30' },
    revenue: {
      title: 'Estimates of Revenue, Grants and Loans for the FY 2026/27 Budget (National Treasury, June 2026)',
      url: 'https://newsite.treasury.go.ke/sites/default/files/Estimates/Estimates%20of%20Revenue%2C%20Grants%20and%20Loans%20for%20the%20FY%202026-27%20Budget.pdf',
      stage: 'statement', date: '2026-06' },
    cra: {
      title: 'CRA Recommendation on the Basis for Equitable Sharing of Revenue, FY 2026/27 (Commission on Revenue Allocation, February 2026), Table 6.2',
      url: 'https://cra.go.ke/wp-content/uploads/2026/02/CRA-Recommendation-on-The-Basis-for-Equitable-Sharing-Of-Revenue-FY-2026-27.pdf',
      stage: 'recommendation', date: '2026-02-03' },
    dora: {
      title: 'Ruto signs Division of Revenue Act, securing Sh428bn equitable share for counties (Capital FM, June 2026)',
      url: 'https://www.capitalfm.co.ke/news/2026/06/ruto-signs-division-of-revenue-act-securing-sh428bn-equitable-share-for-counties/',
      stage: 'law', date: '2026-06-15' },
    cob2425: null, // filled from repo
    nyapbb: null, // filled from repo
  };

  const data = { built: '2026-11-01', fy: '2026/27', sources: SOURCES };

  // ---- Headline fiscal framework (budget statement stage) ----
  data.headline = {
    total: fig(4820.4, B, 'mwananchi', 'p.3, Overall Budget and Financing (also p.2)', { note: 'Excludes KSh 32.7bn of securitised Road Maintenance Levy; with it the guide gives 4,853.1 (p.15).' }),
    totalGdp: fig(23.2, '% of GDP', 'mwananchi', 'p.3, Overall Budget and Financing'),
    revenue: fig(3630.5, B, 'mwananchi', 'p.3, Overall Budget and Financing: total revenue including A-I-A'),
    revenueGdp: fig(17.4, '% of GDP', 'mwananchi', 'p.3, Overall Budget and Financing'),
    grants: fig(43.6, B, 'mwananchi', 'p.3, Overall Budget and Financing'),
    deficit: fig(1146.2, B, 'mwananchi', 'p.3, Overall Budget and Financing: fiscal deficit'),
    deficitGdp: fig(5.5, '% of GDP', 'mwananchi', 'p.3, Overall Budget and Financing'),
    netForeign: fig(116.2, B, 'mwananchi', 'p.3, Deficit Financing: net foreign financing'),
    netDomestic: fig(1030.0, B, 'mwananchi', 'p.3, Deficit Financing: net domestic financing'),
    gdp: fig(20816.8, B, 'summary', 'Table 2, nominal GDP FY2026/27', { stage: 'estimates' }),
  };

  // ---- Where it goes (p.2) ----
  const goes = [
    ['recurrent', 'Running national government', 'Salaries, operations and transfers of ministries, departments and agencies', 2081.1],
    ['cfs', 'Interest and pensions', 'Consolidated Fund Services: paid before anything else, without a vote', 1501.3],
    ['development', 'Building projects', 'Ministerial development spending: roads, dams, buildings, equipment', 809.0],
    ['counties', 'Counties (equitable share)', 'The 47 counties’ unconditional share', 428.0],
    ['contingency', 'Emergencies fund', 'Contingency Fund', 1.0],
  ];
  data.goes = goes.map(([id, name, desc, v]) => ({ id, name, desc, ...fig(v, B, 'mwananchi', 'p.2, where the money goes') }));

  // ---- Where it comes from (Estimates of Revenue, June 2026; deficit from guide) ----
  const rev = [
    ['income', 'Income tax', 'PAYE 706.6 + company and other income tax 677.9, less refunds', 1383.6, 'Summary II, p.vi'],
    ['vat', 'VAT', 'Domestic VAT (net of refunds) + VAT on imports', 829.2, 'Summary II, p.vi'],
    ['excise', 'Excise duty', 'Alcohol, tobacco, fuel, airtime, betting and other excisable goods', 383.4, 'Summary II, p.vi'],
    ['import', 'Import duty', 'Customs duty on imports, net', 186.2, 'Summary II, p.vi'],
    ['othertax', 'Other taxes', 'Other import taxes 51.9, capital gains 24.6 and small taxes 3.5', 79.9, 'Summary II, p.vi', 'Our sum of four printed lines: 51.861 + 24.566 + 2.270 + 1.192. It equals total tax less the four main heads.'],
    ['nontax', 'Non-tax income', 'Dividends, rents, fines, sales of goods and services', 123.4, 'Summary II, p.vii', 'Our sum of two printed lines: other revenue 123.133 + employee social security 0.264.'],
    ['aia', 'Fees kept by agencies (A-I-A)', 'Appropriations-in-Aid: money agencies collect and spend directly', 644.8, 'Summary III, p.viii (excluding grants)'],
  ];
  data.comes = rev.map(([id, name, desc, v, where, calc]) => ({ id, name, desc, ...fig(v, B, 'revenue', where, { calc }) }));
  data.comes.push({ id: 'grants', name: 'Grants', desc: 'Gifts from foreign governments and international organisations', ...fig(43.6, B, 'mwananchi', 'p.3, Overall Budget and Financing') });
  data.comes.push({ id: 'borrow', name: 'Borrowing (net)', desc: 'The deficit: new loans after repaying old ones. Gross borrowing is larger.', ...fig(1146.2, B, 'mwananchi', 'p.3, Overall Budget and Financing: fiscal deficit') });

  // ---- Debt detail (estimates stage, April) ----
  data.cfs = {
    domesticInterest: fig(986.7, B, 'summary', 'para 66, Table 3', { stage: 'estimates' }),
    foreignInterest: fig(267.5, B, 'summary', 'para 66, Table 3', { stage: 'estimates' }),
    pensions: fig(247.1, B, 'summary', 'para 66, Table 3 (pensions, salaries and allowances of constitutional office holders)', { stage: 'estimates' }),
    total: fig(1501.3, B, 'summary', 'para 66, Table 3', { stage: 'estimates' }),
    foreignRepayments: fig(412.9, B, 'summary', 'Table 2, financing: foreign repayments', { stage: 'estimates' }),
    ordinaryRevenue: fig(2985.7, B, 'revenue', 'Summary II, p.vii, total ordinary revenue'),
  };

  // ---- Sectors (ministerial allocations, guide p.3) ----
  const sectors = [
    ['Education', 784.5, [['Teachers Service Commission', 408.5], ['HELB loans and scholarships', 96.4], ['Free primary and day secondary', 61.6], ['Junior secondary capitation', 30.9], ['Intern teachers', 8.2], ['TVET', 7.3], ['School feeding', 3.0]]],
    ['Energy, Infrastructure and ICT', 531.3, [['Roads: maintenance', 118.1], ['Roads: rehabilitation', 58.0], ['Roads and bridges: construction', 44.3], ['Railways', 38.1], ['Rural electrification', 20.2], ['National grid', 7.5]]],
    ['Public Administration and Internal Relations', 373.7, []],
    ['Governance, Justice, Law and Order', 363.9, []],
    ['National Security', 316.2, [['Police vehicle leasing', 13.0], ['Police modernisation', 7.0]]],
    ['Health', 177.2, [['Primary Healthcare Fund', 19.1], ['Global Fund: HIV, TB, malaria', 18.5], ['Health interns', 9.3], ['Universal Health Coverage', 8.6], ['Vaccines', 6.4], ['Community health promoters', 3.6], ['Emergency, Chronic and Critical Illness Fund', 3.0]]],
    ['Environment, Water and Natural Resources', 121.2, [['Clean water access', 70.4], ['Wildlife security and conservation', 15.1], ['Forests', 13.4]]],
    ['Agriculture, Rural and Urban Development', 111.7, [['Fertiliser subsidy', 18.0], ['Settling the landless', 9.4]]],
    ['Social Protection, Culture and Recreation', 94.3, [['Cash transfers: older persons', 24.6], ['Cash transfers: orphans and vulnerable children', 8.9], ['Hunger Safety Net', 4.3], ['Cash transfers: severe disability', 1.5]]],
    ['General Economics and Commercial Affairs', 49.8, []],
  ];
  data.sectors = sectors.map(([name, v, items]) => ({ name, ...fig(v, B, 'mwananchi', 'p.3, ministerial allocations by sector'), items: items.map(([n, b]) => ({ name: n, ...fig(b, B, 'mwananchi', 'pp.5–14, key allocations') })) }));
  data.sectorsNote = 'The guide lists these as key allocations, not every line. Items can sit in a different sector from where you expect: roads are inside Energy, Infrastructure and ICT.';

  // Same budget, different numbers (education)
  data.education3 = [
    { name: 'Education sector (ministerial)', ...fig(784.5, B, 'mwananchi', 'p.3'), why: 'All education votes: TSC, basic, higher and TVET.' },
    { name: 'Education thematic area', ...fig(668.3, B, 'summary', 'Table 5, p.25', { stage: 'estimates' }), why: 'A different grouping, at the April estimates stage.' },
    { name: 'Education as approved by MPs', ...fig(781.4, B, 'pd', 'reported', { label: 'unverified', stage: 'approved' }), why: 'As reported in the press after Parliament approved the estimates; we have not seen the Act.' },
  ];
  SOURCES.parl = { title: 'National Assembly approves Revenue Allocation Bill, unlocking Ksh428 billion for counties (Parliament of Kenya, 26 June 2026)',
    url: 'https://parliament.go.ke/node/26037', stage: 'law', date: '2026-06-26' };
  SOURCES.pd = { title: 'Parliament approves 2026/27 Budget as health and education take lion’s share (People Daily)',
    url: 'https://peopledaily.digital/business/parliament-approves-2026-27-budget-as-health-and-education-take-lions-share', stage: 'approved', date: '2026-06' };

  // ---- Counties ----
  const counties = CRA.split('|').map((row) => {
    const parts = row.split(' ');
    const rec = Number(parts.pop());
    const prev = Number(parts.pop());
    return { name: parts.join(' '), prev, rec };
  });
  assert.equal(counties.length, 47);
  const sums = [counties.reduce((a, c) => a + c.prev, 0), counties.reduce((a, c) => a + c.rec, 0)];
  // Printed totals are 415,000 and 458,940; per-county figures are rounded to KSh millions.
  assert.ok(Math.abs(sums[0] - 415000) <= 5 && Math.abs(sums[1] - 458940) <= 5, `CRA column sums ${sums}`);

  const cmp = readJson('compare.json');
  SOURCES.cob2425 = { title: cmp.sources[0].title, url: cmp.sources[0].landingPage, stage: 'spent', date: '2025-08' };
  const pop = Object.fromEntries(cmp.counties.map((c) => [c.county, c]));
  for (const c of counties) {
    const p = pop[c.name];
    if (p) c.cob = { budget: p.budget, spent: p.spent, devBudget: p.devBudget, devSpent: p.devSpent, devAbs: p.devAbsorptionPct, overallAbs: p.overallAbsorptionPct, pop2019: p.population2019 };
  }
  for (const row of GUIDE_P14.split('|')) {
    const i = row.lastIndexOf(' ');
    const c = counties.find((x) => x.name === row.slice(0, i));
    assert.ok(c, row);
    c.guide = Number(row.slice(i + 1));
  }
  const guideSum = counties.reduce((a, c) => a + c.guide, 0);
  // Rounded to 0.1 each, so the 47 can differ from the printed 428.0 by a little; a typing slip would show here.
  assert.ok(Math.abs(guideSum - 428) <= 0.5, `Guide p.14 sums to ${guideSum}`);
  data.counties = counties;
  data.countiesMeta = {
    unit: 'KSh million',
    prev: fig(415000, 'KSh m', 'cra', 'Table 6.2, pp.44–45, column FY2025/26', { note: 'The 2025/26 equitable share per county as given by CRA; the total equals the 2025/26 Division of Revenue Act figure of KSh 415bn.' }),
    rec: fig(458940, 'KSh m', 'cra', 'Table 6.2, pp.44–45, total FY2026/27', { stage: 'recommendation' }),
    law: fig(428.0, B, 'parl', 'National Assembly report on the County Allocation of Revenue Bill as passed', { stage: 'law' }),
    guide: fig(428.0, B, 'mwananchi', 'p.14, each county, rounded to KSh 0.1 billion', { stage: 'statement' }),
    splitBaseline: fig(387.43, B, 'parl', 'National Assembly report: Baseline Allocation', { stage: 'law' }),
    splitAffirmative: fig(4.46, B, 'parl', 'National Assembly report: Affirmative Action Allocation, 12 counties', { stage: 'law' }),
    splitFormula: fig(36.1, B, 'parl', 'National Assembly report: weighted formula', { stage: 'law' }),
    weightsSource: fig(100, '%', 'cra', 'Table 6.1, p.44', { stage: 'recommendation' }),
    estimates: fig(420.0, B, 'summary', 'para 67', { stage: 'estimates' }),
    countyTotal: fig(502.0, B, 'mwananchi', 'p.14: equitable share 428.0 + conditional allocations from national government 16.6 + from development partners 57.4'),
    equalisation: fig(10.3, B, 'mwananchi', 'p.13, Equalization Fund'),
    ngcdf: fig(61.8, B, 'mwananchi', 'p.13, NG-CDF (national money, not county money)'),
    weights: { Population: 45, 'Basic share (equal for all)': 35, Poverty: 12, 'Land area': 8 },
    national2425: Object.fromEntries(['budget', 'spent', 'devBudget', 'devSpent', 'devAbsorptionPct', 'overallAbsorptionPct'].map((k) => [k, cmp.national[k]])),
  };

  // ---- Nyamira: follow the shilling (FY2025/26) + 12 years ----
  const money = readJson('money.json');
  SOURCES.cobyears = { title: 'Controller of Budget, County Governments Budget Implementation Review Reports, FY2013/14 to FY2024/25 (Nyamira section)', url: money.years.at(-1).src, stage: 'spent', date: '2014–2025' };
  data.nyamiraYears = money.years.map((y) => ({ fy: y.fy, budget: y.budget, spent: y.spent, devAbs: y.devAbs, src: y.src, page: y.page }));

  const bs = readJson('budget-sectors.json');
  SOURCES.nyapbb = { title: bs.source.title, url: bs.source.url, stage: 'estimates', date: '2025-07' };
  const ws = readJson('wardspend.json');
  const budgeted = new Map();
  for (const p of ws.projects) {
    if (p.fy === '2025/26' && p.kind === 'budgeted') budgeted.set(p.ward, [...(budgeted.get(p.ward) ?? []), p.amount]);
  }
  const wardrows = readJson('wards.json').map((w) => {
    const a = budgeted.get(w.slug) ?? [];
    const amount = !a.length || a.some((v) => v == null) ? null : a.reduce((x, y) => x + y, 0);
    return { slug: w.slug, name: w.name, const: w.subCounty ?? null, lines: a.length, zero: a.filter((v) => v === 0).length, amount };
  });
  const wardSum = wardrows.reduce((a, r) => a + (r.amount ?? 0), 0);
  const round = (x, dp) => Number(x.toFixed(dp));
  data.shilling = {
    fy: '2025/26',
    steps: [
      { name: 'National budget', ...fig(4638.4, B, 'summary', 'Table 2, FY2025/26 Supplementary I column, p.14', { stage: 'estimates', note: 'FY2025/26 after the first supplementary budget; the original budget was 4,269.9.' }) },
      { name: 'All 47 counties’ equitable share', ...fig(415.0, B, 'summary', 'Table 2, FY2025/26: of which equitable share', { stage: 'law' }) },
      { name: 'Nyamira’s equitable share', ...fig(6.073, B, 'cra', 'Table 6.2, p.45, column FY2025/26', { stage: 'law' }) },
      { name: 'Nyamira’s whole county budget', ...fig(round(bs.countyTotal.total / 1e9, 3), B, 'nyapbb', 'Table 8 total, p.20', { stage: 'estimates', note: 'Equitable share plus conditional grants, own revenue and other sources.' }) },
      { name: 'Ward-coded projects in 20 wards', ...fig(round(wardSum / 1e9, 4), B, 'nyapbb', 'Table 18, pp.43–50: sum of ward-coded lines', { stage: 'estimates', calc: 'Sum of ward-coded budget lines by Nyamira Daily; countywide and flagship lines are not counted.' }) },
    ],
    wards: wardrows,
    wardSum,
  };

  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoData = process.env.ND_DATA ?? join(HERE, '..', 'src', 'data');
  const data = buildData(repoData);
  writeFileSync(join(HERE, 'data.json'), JSON.stringify(data, null, 1));

  // arithmetic checks
  const sum = (a) => a.reduce((x, y) => x + y.v, 0);
  console.log('CRA column sums', data.counties.reduce((a, c) => a + c.prev, 0), data.counties.reduce((a, c) => a + c.rec, 0), '(printed totals 415,000 and 458,940)');
  console.log('goes', sum(data.goes).toFixed(1), 'comes', sum(data.comes).toFixed(1), 'rev', sum(data.comes.slice(0, 7)).toFixed(1));
  console.log('sectors', sum(data.sectors).toFixed(1), 'wards', data.shilling.wardSum);
  console.log('interest/ordinary', (data.cfs.domesticInterest.v + data.cfs.foreignInterest.v) / data.cfs.ordinaryRevenue.v * 100);
}
