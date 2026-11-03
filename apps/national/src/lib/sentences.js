// Sentences written from data. The words are "more" and "less", "up" and "down", with numbers (build brief 5.2). A missing
// year, a zero and a fall each have their own wording, so no reader ever sees "NaN%" or "0 more".
import { money, percent, toShillings } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';

export function amountSentence({ name, amount, change, fy, lang }) {
  const base = { name, amount: money(amount, 'KSh', lang), fy };
  if (amount === 0) return t(lang, 'sentence.zero', base);
  if (change == null || !Number.isFinite(change)) return t(lang, 'sentence.noLast', base);
  const p = Math.abs(change).toFixed(1);
  if (p === '0.0') return t(lang, 'sentence.same', base);
  return t(lang, change > 0 ? 'sentence.more' : 'sentence.less', { ...base, p });
}

export function changeChip(change, lang) {
  if (change == null || !Number.isFinite(change)) return t(lang, 'state.notLoaded');
  const p = percent(Math.abs(change));
  if (p === '0.0%') return t(lang, 'change.same');
  return t(lang, change > 0 ? 'change.up' : 'change.down', { p });
}

// Questions from dated documents: each states the figure and asks. Nothing here concludes that anyone did wrong.
export function countyQuestions(c, lang) {
  const out = [];
  const year = c.spending.at(-1), all = c.allCounty;
  if (year) {
    const key = year.devPct < all ? 'question.devLow' : 'question.devHigh';
    out.push(t(lang, key, { name: c.name, pct: percent(year.devPct, 0), all: percent(all, 0), fy: `FY${year.fy}` }));
    const unspent = year.budget - year.spent;
    if (unspent > 0) out.push(t(lang, 'question.unspent', { name: c.name, amount: money(unspent, 'KSh m', lang), fy: `FY${year.fy}` }));
  }
  if (c.payables) out.push(t(lang, 'question.bills', { name: c.name, amount: money(c.payables, 'KSh m', lang) }));
  if (c.osrPct != null && c.osrPct < 100) out.push(t(lang, 'question.osr', { name: c.name, pct: percent(c.osrPct, 0), fy: 'FY2025/26' }));
  const key = c.value < toShillings(c.recommended, 'KSh m') ? 'question.craLess' : 'question.craMore';
  out.push(t(lang, key, { name: c.name, rec: money(c.recommended, 'KSh m', lang), law: money(c.value, 'KSh', lang) }));
  return out;
}

export { whatsappHref } from './share.js';
