// The dates the law fixes for the national budget every year, each read from the PFM Act's own text (VERIFICATION.md,
// Phase 5). None is a date someone announced: a hearing is listed only when an official notice gives it.
import { longDate } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { sourceDoc, today } from './figures.js';

export const LEGAL_DATES = [
  { key: 'bps', day: '02-15', page: 's.25(2), p.908' },
  { key: 'estimates', day: '04-30', page: 's.37(2), p.916' },
  { key: 'appropriation', day: '06-30', page: 's.39(1), p.919' },
];

export const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 864e5);

// Each date's next occurrence on or after `now`, soonest first
export function nextDates(now) {
  const year = Number(now.slice(0, 4)), md = now.slice(5);
  return LEGAL_DATES.map((d) => {
    const date = `${md > d.day ? year + 1 : year}-${d.day}`;
    return { ...d, date, days: daysBetween(now, date) };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function legalCalendar(lang, now = today()) {
  const doc = sourceDoc('pfm-act-2012');
  return nextDates(now).map((d) => ({ ...d, doc, when: longDate(d.date, lang), name: t(lang, `cal.${d.key}`), what: t(lang, `cal.${d.key}.what`), daysText: t(lang, 'cal.days', { n: '{n}' }) }));
}
