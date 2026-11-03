// Where the money goes and where it comes from, read from the registry. Debt is always first (DESIGN.md).
import { sumFigures } from '@kbe/engine/compare';
import { fig } from './figures.js';

const TAXES = ['statement.revenue.income-tax', 'statement.revenue.vat', 'statement.revenue.excise', 'statement.revenue.import-duty', 'statement.revenue.other-taxes'];
const OTHER_INCOME = ['statement.revenue.non-tax', 'statement.revenue.aia'];

const part = (key, slot, list) => {
  const figs = list.map(fig), one = figs.length === 1;
  return { key, slot, value: one ? figs[0].value : sumFigures(figs), unit: figs[0].unit, ids: figs.map((f) => f.id), first: figs[0], calc: !one };
};
const withShares = (parts, total) => parts.map((p) => ({ ...p, share: p.value / total * 100 }));

export function outflows() {
  const total = fig('statement.total.expenditure');
  return { total, parts: withShares([
    part('cfs', 'debt', ['statement.use.cfs']),
    part('recurrent', '1', ['statement.use.recurrent']),
    part('development', '2', ['statement.use.development']),
    part('counties', '3', ['statement.use.county-equitable-share']),
    part('contingency', 'rest', ['statement.use.contingency']),
  ], total.value) };
}

export function inflows() {
  const total = fig('statement.total.expenditure');
  return { total, parts: withShares([
    part('borrowing', 'debt', ['statement.financing.deficit']),
    part('taxes', '1', TAXES),
    part('fees', '2', OTHER_INCOME),
    part('grants', '3', ['statement.total.grants']),
  ], total.value) };
}

// The share of KSh 100 in words: whole shillings, cents below one shilling, and "under 10 cents" below that.
export function perHundred(share) {
  if (share < 0.1) return { kind: 'under', n: null };
  if (share < 1) return { kind: 'cents', n: Math.round(share * 10) * 10 };
  return { kind: 'shillings', n: Math.round(share) };
}

// A label above the bar needs room on a 320px phone. Smaller slices are named in the list below it.
export const fitsAboveBar = (share) => share >= 12;

export function sectors() {
  const ids = ['education', 'energy-infrastructure-ict', 'public-administration-international-relations', 'governance-justice-law-order', 'national-security', 'health', 'environment-water-natural-resources', 'agriculture-rural-urban-development', 'social-protection-culture-recreation', 'general-economics-commercial-affairs'];
  return ids.map((slug) => ({ slug, figure: fig(`statement.sector.${slug}`) })).sort((a, b) => b.figure.value - a.figure.value);
}
