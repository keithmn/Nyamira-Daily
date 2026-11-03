// The infographics library (build brief 5.12): one card per topic, built from the registry. Each card carries its figure,
// label, stage, source and the data release in the picture itself, so a screenshot keeps its provenance.
import { money, percent } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { outflows, perHundred } from './budget.js';
import { changeWords, countyRows } from './counties.js';
import { debtYears } from './depth.js';
import { FY, fig, shortTitle } from './figures.js';
import { projectTotal } from './projects.js';
import { changeChip } from './sentences.js';
import { allSectors } from './votes.js';

const src = (f) => `${shortTitle(f.doc)}, ${f.page}`;
// A row on a card has room for a short name; the full title is on the infographic's page
const SHORT = {
  'mwananchi-2026-27': 'Mwananchi Guide', 'budget-summary-2026-27': 'Budget Summary', 'appropriation-act-2026': 'Appropriation Act, 2026',
  'county-allocation-act-2026': 'County Allocation of Revenue Act, 2026', 'annual-public-debt-report-2024-25': 'Annual Public Debt Report 2024/25',
};
const shortSrc = (f) => `${SHORT[f.source] ?? (f.source.startsWith('dev-estimates') ? 'Development Estimates' : shortTitle(f.doc))}, ${f.page.split(', our ')[0]}`;
const amount = (f, lang) => (f.unit === '%' ? `${f.value}%` : money(f.value, f.unit, lang));
const hundredWords = (share, lang) => {
  const p = perHundred(share);
  if (p.kind === 'under') return t(lang, 'ksh100.underTen');
  return p.kind === 'cents' ? t(lang, 'ksh100.cents', { n: p.n }) : t(lang, 'ksh100.tops', { n: p.n });
};

function tenNumbers(lang) {
  const debt = debtYears().at(-1);
  const act = [fig('approved.total.supply'), fig('approved.total.aia')];
  const rows = [
    ['ig.ten.total', fig('statement.total.expenditure')],
    ['ig.ten.revenue', fig('statement.total.revenue')],
    ['ig.ten.borrowing', fig('statement.financing.deficit')],
    ['ig.ten.interest', fig('estimates.debt.interest')],
    ['ig.ten.interestShare', fig('estimates.debt.interest-share-of-ordinary-revenue')],
    ['ig.ten.act', { ...act[0], value: act[0].value + act[1].value, calc: true }],
    ['ig.ten.development', fig('statement.use.development')],
    ['ig.ten.counties', fig('law.county-total.equitable-share')],
    ['ig.ten.projects', { ...fig('ke.fy2026-27.approved.project-vote.1011'), value: projectTotal(), unit: 'KSh', page: 'Volumes I to IV', calc: true }],
    ['ig.ten.debt', debt.stock],
  ].map(([key, f]) => ({ name: t(lang, key, { fy: `FY${debt.fy}` }), value: amount(f, lang), note: `${t(lang, `stage.${f.stage}`)} · ${shortSrc(f)}${f.calc ? ` · ${t(lang, 'fig.calc')}` : ''}` }));
  return {
    slug: 'budget-in-10-numbers', group: 'budget', title: t(lang, 'ig.ten.title', { fy: FY }), rows,
    line: t(lang, 'ig.ten.line', { fy: FY }), meta: { label: 'official', stage: null }, source: t(lang, 'ig.ten.sources'),
    alt: t(lang, 'ig.listAlt', { title: t(lang, 'ig.ten.title', { fy: FY }), list: rows.map((r) => `${r.name}: ${r.value}`).join('; ') }),
  };
}

function hundred(lang) {
  const { total, parts } = outflows();
  const rows = parts.map((p) => ({ name: t(lang, `ksh100.${p.key}`), value: hundredWords(p.share, lang), note: money(p.value, p.unit, lang) }));
  return {
    slug: 'ksh-100', group: 'budget', title: t(lang, 'ig.hundred.title', { fy: FY }), rows, line: t(lang, 'ig.hundred.line'),
    meta: { label: total.label, stage: total.stage, calc: true }, source: src(total),
    alt: t(lang, 'ig.listAlt', { title: t(lang, 'ig.hundred.title', { fy: FY }), list: rows.map((r) => `${r.name}: ${r.value}`).join('; ') }),
  };
}

function debtCard(lang) {
  const y = debtYears().at(-1);
  return {
    slug: 'debt', group: 'budget', title: t(lang, 'debt.title'), number: money(y.stock.value, y.stock.unit, lang),
    line: t(lang, 'debt.line', { gdp: percent(y.shareOfGdp.value), fy: `FY${y.fy}` }), meta: { label: y.stock.label, stage: y.stock.stage }, source: src(y.stock),
    alt: `${t(lang, 'debt.title')}: ${money(y.stock.value, y.stock.unit, lang)}. ${t(lang, 'debt.line', { gdp: percent(y.shareOfGdp.value), fy: `FY${y.fy}` })}`,
  };
}

function sectorCards(lang) {
  return allSectors().map((s) => {
    const name = t(lang, `sector.${s.slug}`), line = t(lang, 'ig.sector.line', { fy: FY, change: changeChip(s.change, lang).toLowerCase(), n: s.votes.length });
    return {
      slug: `sector-${s.slug}`, group: 'sector', title: name, number: money(s.total, 'KSh', lang), line,
      meta: { label: s.first.label, stage: s.first.stage, calc: true }, source: `${shortTitle(s.first.doc)}, Schedule`, alt: `${name}: ${money(s.total, 'KSh', lang)}. ${line}`,
    };
  });
}

function countyCards(lang) {
  return countyRows().map((c) => {
    const y = c.spending.at(-1);
    const line = t(lang, 'ig.county.line', { change: changeWords(c.change, lang), pct: percent(y.devPct, 0), fy: `FY${y.fy}` });
    return {
      slug: `county-${c.slug}`, group: 'county', county: c.slug, title: t(lang, 'ig.county.title', { name: c.name, fy: FY }), number: money(c.value, 'KSh', lang), line,
      meta: { label: c.figure.label, stage: c.figure.stage }, source: `${src(c.figure)}; ${src(y.figure)}`, alt: `${t(lang, 'ig.county.title', { name: c.name, fy: FY })}: ${money(c.value, 'KSh', lang)}. ${line}`,
    };
  });
}

export const allInfographics = (lang) => [tenNumbers(lang), hundred(lang), debtCard(lang), ...sectorCards(lang), ...countyCards(lang)];
export const infographic = (slug, lang) => allInfographics(lang).find((g) => g.slug === slug);

export const FORMATS = { portrait: { width: 1080, height: 1350 }, landscape: { width: 1200, height: 630 } };
// Where the image script saves each picture, and where the pages find it
export const imagePath = (slug, format, lang) => `/img/infographics/${lang}/${slug}-${format}.png`;
