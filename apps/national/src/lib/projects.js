// National development projects from the Development Estimates. The questions follow rules that only restate what the
// documents show: a project that had money last year and none this year, and one name under two votes. Each is a question
// with its figures, never a finding (build brief 5.7).
import { money } from '@kbe/engine/fmt';
import { t } from '../i18n/index.js';
import { allFigures, fig, hasFigure } from './figures.js';
import { voteByCode } from './votes.js';

let cache = null;
export function allProjects() {
  if (cache) return cache;
  const now = allFigures().filter((f) => f.level === 'project' && f.fy === '2026/27');
  const last = allFigures().filter((f) => f.level === 'project' && f.fy === '2025/26');
  const codes = new Set([...now, ...last].map((f) => f.id.split('.').pop()));
  cache = [...codes].map((code) => {
    const a = `ke.fy2026-27.approved.project.${code}`, b = `ke.fy2025-26.approved.project.${code}`;
    const current = hasFigure(a) ? fig(a) : null, previous = hasFigure(b) ? fig(b) : null, any = current ?? previous;
    return { code, vote: code.slice(0, 4), name: any.name, current, previous, figure: any };
  }).sort((x, y) => (y.current?.value ?? 0) - (x.current?.value ?? 0));
  return cache;
}

export const projectsOf = (vote) => allProjects().filter((p) => p.vote === vote);

const tidy = (name) => name.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
// Names so general that two votes using them are not the same project
const GENERIC = /^(general|headquarters|administration|construction of offices|refurbishment of buildings|purchase of|acquisition of|ict|pending bills|public participation|monitoring and evaluation)/;
// A name under more than three votes is a budget line many votes share, not one project
const MOST_VOTES = 3;

// Rule 1: listed this year with no money, after money last year
export const fellToZero = (list) => list.filter((p) => p.previous?.value > 0 && !(p.current?.value > 0));

// Rule 2: one specific name, funded this year under more than one vote
export function sameNameTwoVotes(list) {
  const byName = new Map();
  for (const p of list.filter((x) => x.current?.value > 0)) {
    const key = tidy(p.name);
    if (GENERIC.test(key) || key.length < 12) continue;
    byName.set(key, [...(byName.get(key) ?? []), p]);
  }
  return [...byName.values()].filter((group) => { const n = new Set(group.map((p) => p.vote)).size; return n > 1 && n <= MOST_VOTES; });
}

const voteName = (code) => voteByCode(code)?.name ?? `Vote ${code}`;

export function projectQuestions(lang, list = allProjects()) {
  const stopped = fellToZero(list).map((p) => ({ kind: 'stopped', project: p, text: t(lang, 'project.qStopped', { name: p.name, amount: money(p.previous.value, 'KSh', lang), vote: voteName(p.vote) }) }));
  const twice = sameNameTwoVotes(list).map((group) => {
    const votes = [...new Set(group.map((p) => p.vote))];
    return { kind: 'twice', project: group[0], text: t(lang, 'project.qTwice', { name: group[0].name, n: votes.length, votes: votes.map(voteName).join('; ') }) };
  });
  return [...stopped, ...twice];
}

export const projectTotal = () => allProjects().reduce((a, p) => a + (p.current?.value ?? 0), 0);
