// What a memorandum can be about, each with its figures already worded and cited: the whole budget, any of the 87 votes,
// or any of the 47 counties. Built once per language at build time; the browser only picks one.
import { money, percent } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { outflows } from './budget.js';
import { countyRows } from './counties.js';
import { FY, shortTitle } from './figures.js';
import { amountSentence } from './sentences.js';
import { allVotes } from './votes.js';

const cite = (...figures) => figures.map((f) => `${shortTitle(f.doc)}, ${f.page}`).join('; ');

export function memoTopics(lang) {
  const { total, parts } = outflows(), cfs = parts.find((p) => p.key === 'cfs');
  const whole = {
    id: 'budget', label: t(lang, 'memo.whole'), to: t(lang, 'memo.toNa'), subject: t(lang, 'memo.subjectWhole', { fy: FY }),
    facts: [
      { text: t(lang, 'memo.factTotal', { amount: money(total.value, total.unit, lang), fy: FY }), cite: cite(total) },
      { text: t(lang, 'memo.factCfs', { amount: money(cfs.value, cfs.unit, lang), pct: percent(cfs.share, 0) }), cite: cite(cfs.first) },
    ],
  };
  const votes = allVotes().map((v) => ({
    id: `v${v.code}`, label: v.name, to: t(lang, 'memo.toNa'), subject: t(lang, 'memo.subjectVote', { name: v.name, fy: FY }),
    facts: [{ text: amountSentence({ name: v.name, amount: v.total, change: v.change, fy: FY, lang }), cite: cite(v.first, v.pboLast) }],
  })).sort((a, b) => a.label.localeCompare(b.label));
  const counties = countyRows().map((c) => {
    const y = c.spending.at(-1);
    return {
      id: `c${c.slug}`, label: c.name, to: t(lang, 'memo.toCounty', { name: c.name }), subject: t(lang, 'memo.subjectCounty', { name: c.name, fy: FY }),
      facts: [
        { text: t(lang, 'memo.factShare', { name: c.name, amount: money(c.value, 'KSh', lang), fy: FY }), cite: cite(c.figure) },
        { text: t(lang, 'memo.factDev', { name: c.name, pct: percent(y.devPct, 0), fy: `FY${y.fy}` }), cite: cite(y.figure) },
      ],
    };
  });
  return { whole, votes, counties };
}

export const memoWords = (lang) => Object.fromEntries(['to', 'from', 'date', 'subject', 'background', 'source', 'request', 'yourName', 'yourAsk', 'close'].map((k) => [k, t(lang, `memo.w.${k}`)]));
