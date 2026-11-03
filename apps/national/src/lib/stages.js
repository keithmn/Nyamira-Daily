// The life of the FY2026/27 budget. A date appears only when a loaded source gives it: the policy statement and the
// stages still to come show none (VERIFICATION.md). `anchor` is a figure from the document that closes each stage.
import { longDate } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { allNotices, fig, sourceDoc, today } from './figures.js';
import { announced, bpsYear } from './notices.js';

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

// The next Budget Policy Statement. The law's latest date is 15 February (PFM Act, s.25(2)); when the Treasury has announced
// an earlier date in an official notice, that is the one shown, with the law's date beside it (decision #103).
export function nextDeadline(lang, now = today(), notices = allNotices()) {
  const year = Number(now.slice(0, 4)), legal = `${now > `${year}-02-15` ? year + 1 : year}-02-15`;
  const early = announced(notices, 'bps', now, legal), date = early?.dates[0] ?? legal, bps = bpsYear(date);
  const text = early ? t(lang, 'stage.nextAnnounced', { year: bps, date: longDate(date, lang), legal: longDate(legal, lang) }) : t(lang, 'stage.nextLine', { year: bps, date: longDate(date, lang) });
  const doc = early ? { title: early.source.title, url: early.source.url, archive: null } : sourceDoc('pfm-act-2012');
  return { date, year: bps, text, days: t(lang, 'stage.nextDays', { n: '{n}' }), doc, page: early ? 'p.1' : 's.25(2), p.908', sourceText: t(lang, early ? 'stage.nextNotice' : 'stage.nextSource') };
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
