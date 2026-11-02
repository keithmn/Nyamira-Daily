// One row per county at the law stage, in shillings, from the County Allocation of Revenue Act, with what the Controller
// of Budget reports it spent. Registry ids only.
import { compareFigures } from '@kbe/engine/compare';
import { COUNTIES } from '@kbe/engine/counties';
import { money, percent } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { fig, hasFigure } from './figures.js';

export const SPENT_YEARS = ['2024-25', '2025-26'];
export const LATEST_SPENT = SPENT_YEARS.at(-1);

function spendingYear(slug, year) {
  const f = (key) => fig(`ke.fy${year}.spent.county.${slug}.${key}`);
  return { fy: year.replace('-', '/'), budget: f('budget').value, spent: f('spent').value, devBudget: f('dev-budget').value, devSpent: f('dev-spent').value, devPct: f('dev-absorption').value, pct: f('absorption').value, figure: f('dev-absorption') };
}

export const allCountyDev = (year = LATEST_SPENT) => fig(`ke.fy${year}.spent.county-total.dev-absorption`);
export const allCountyOverall = (year = LATEST_SPENT) => fig(`ke.fy${year}.spent.county-total.absorption`);

export function countyRows() {
  const rows = COUNTIES.map((c) => {
    const now = fig(`law.county.${c.slug}.equitable-share`), last = fig(`ke.fy2025-26.law.county.${c.slug}.equitable-share`);
    const spending = SPENT_YEARS.map((y) => spendingYear(c.slug, y));
    return { ...c, figure: now, value: now.value, last: last.value, change: compareFigures(last, now).percent, spending, recommended: fig(`recommendation.county.${c.slug}.equitable-share`).value, allCounty: allCountyDev().value };
  });
  const order = [...rows].sort((a, b) => b.value - a.value);
  return rows.map((r) => ({ ...r, rank: order.indexOf(r) + 1 }));
}

export const countyBySlug = (slug) => countyRows().find((c) => c.slug === slug);

// How the Act builds a county's share. Twelve counties have an affirmative action allocation; the rest have no such figure.
export function shareParts(slug) {
  const f = (key) => fig(`law.county.${slug}.${key}`);
  return [['baseline', 'baseline'], ['affirmative-action', 'affirmative'], ['formula', 'formula']].filter(([key]) => hasFigure(`law.county.${slug}.${key}`)).map(([key, label]) => ({ key: label, figure: f(key) }));
}

// One county's equitable share at each stage. Never added up.
export const stageIds = (slug) => [`recommendation.county.${slug}.equitable-share`, `statement.county.${slug}.equitable-share`, `law.county.${slug}.equitable-share`];

export function changeWords(change, lang) {
  const p = Math.abs(change).toFixed(1);
  if (p === '0.0') return t(lang, 'county.flat');
  return t(lang, change > 0 ? 'county.up' : 'county.down', { p });
}

// What the My county card needs in the browser. Everything is already worded, so the page ships no number formatting.
export const cardData = (lang) => countyRows().map((r) => ({
  s: r.slug, n: r.name, m: money(r.value, 'KSh', lang), c: changeWords(r.change, lang), d: t(lang, 'county.spent', { pct: percent(r.spending.at(-1).devPct, 0), fy: r.spending.at(-1).fy }),
}));

// The rows of the compare page, worded in the page's language
export const compareData = (lang) => countyRows().map((r) => {
  const y = r.spending.at(-1);
  return { s: r.slug, n: r.name, v: [money(r.value, 'KSh', lang), percent(r.change), `${r.rank}`, percent(y.devPct, 0), percent(y.pct, 0), money(y.budget, 'KSh m', lang), money(y.spent, 'KSh m', lang)] };
});
