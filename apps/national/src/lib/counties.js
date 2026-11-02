// One row per county at the law stage, in shillings, from the County Allocation of Revenue Act (registry ids only).
import { compareFigures } from '@kbe/engine/compare';
import { COUNTIES } from '@kbe/engine/counties';
import { money } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { fig } from './figures.js';

export function countyRows() {
  const rows = COUNTIES.map((c) => {
    const now = fig(`law.county.${c.slug}.equitable-share`), last = fig(`ke.fy2025-26.law.county.${c.slug}.equitable-share`);
    return { ...c, figure: now, value: now.value, last: last.value, change: compareFigures(last, now).percent };
  });
  const order = [...rows].sort((a, b) => b.value - a.value);
  return rows.map((r) => ({ ...r, rank: order.indexOf(r) + 1 }));
}

export function changeWords(change, lang) {
  const p = Math.abs(change).toFixed(1);
  if (p === '0.0') return t(lang, 'county.flat');
  return t(lang, change > 0 ? 'county.up' : 'county.down', { p });
}

// What the My county card needs in the browser. Everything is already worded, so the page ships no number formatting.
export const cardData = (lang) => countyRows().map((r) => ({ s: r.slug, n: r.name, m: money(r.value, 'KSh', lang), c: changeWords(r.change, lang) }));
