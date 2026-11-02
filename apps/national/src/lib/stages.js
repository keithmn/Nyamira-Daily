// The life of the FY2026/27 budget. A date appears only when a loaded source gives it: the policy statement and the
// stages still to come show none (VERIFICATION.md). `anchor` is a figure from the document that closes each stage.
import { longDate } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { fig, sourceDoc, today } from './figures.js';

const TIMELINE = [
  { stage: 'recommendation', anchor: 'recommendation.county-total.equitable-share' },
  { stage: 'bps' },
  { stage: 'estimates', anchor: 'estimates.debt.interest' },
  { stage: 'statement', anchor: 'statement.total.expenditure' },
  { stage: 'law', anchor: 'approved.total.supply' },
  { stage: 'spending' },
  { stage: 'spent' },
  { stage: 'audited' },
];
const NOW = 'spending';

// The next date the law fixes: the Budget Policy Statement reaches Parliament by 15 February each year (PFM Act, s.25(2))
export function nextDeadline(lang, now = today()) {
  const year = Number(now.slice(0, 4)), due = now > `${year}-02-15` ? year + 1 : year, date = `${due}-02-15`;
  return { date, year: due, text: t(lang, 'stage.nextLine', { year: due, date: longDate(date, lang) }), days: t(lang, 'stage.nextDays', { n: '{n}' }), doc: sourceDoc('pfm-act-2012'), page: 's.25(2), p.908' };
}

export function timeline(lang) {
  const at = TIMELINE.findIndex((s) => s.stage === NOW);
  return TIMELINE.map((s, i) => {
    const state = i < at ? 'done' : i === at ? 'now' : 'next';
    const date = s.anchor ? longDate(fig(s.anchor).doc.date, lang) : null;
    const who = ['recommendation', 'bps', 'spent', 'audited', 'spending'].includes(s.stage) ? t(lang, `stage.who.${s.stage}`) : null;
    const name = t(lang, `stage.${s.stage}`);
    return { stage: s.stage, state, name, sub: [who, date].filter(Boolean).join(', ') || null, said: t(lang, `stage.${state}`, { stage: name }) };
  });
}
