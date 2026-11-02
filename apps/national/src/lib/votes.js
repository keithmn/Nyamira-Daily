// Votes, programmes and sectors for FY2026/27. This year's money is the Appropriation Act's, gross (Supply plus
// Appropriations-in-Aid). Last year's comparison uses the Parliamentary Budget Office's tables for both years, so it is
// approved against approved. Sector membership changed between years, so a sector's change adds the same votes in each
// year: the printed sector totals of the two years would not compare like with like.
import { compareFigures, sumFigures } from '@kbe/engine/compare';
import { allFigures, fig, hasFigure, sectorMap } from './figures.js';

const ACT = 'approved.vote.';
const COLUMNS = ['supply', 'aia'];
const nameOf = (f, kind) => f.name.split(`, ${kind}`)[0];
const add = (list) => (list.length ? sumFigures(list) : 0);

// A sum cites every page it draws on, not just the first row's. A sector's votes run across the Schedule, so it cites that.
const citing = (first, parts) => ({ ...first, page: `Schedule, ${[...new Set(parts.map((f) => f.page.replace('Schedule, ', '')))].join(', ')}` });

const money = (base) => COLUMNS.filter((c) => hasFigure(`${base}.${c}`)).map((c) => fig(`${base}.${c}`));

function programmesOf(code) {
  const seen = new Map();
  for (const f of allFigures()) {
    const m = f.level === 'programme' && f.id.match(new RegExp(`\\.vote\\.${code}\\.(recurrent|development)\\.programme\\.(\\d+)\\.(supply|aia)$`));
    if (!m) continue;
    const [, kind, programme] = m;
    const e = seen.get(programme) ?? { code: programme, vote: code, name: nameOf(f, kind), recurrent: [], development: [] };
    e[kind].push(fig(f.id));
    seen.set(programme, e);
  }
  return [...seen.values()].map((p) => {
    const parts = [...p.recurrent, ...p.development];
    return { code: p.code, vote: p.vote, name: p.name, recurrent: add(p.recurrent), development: add(p.development), total: sumFigures(parts), first: citing(parts[0], parts) };
  }).sort((a, b) => b.total - a.total);
}

function buildVote(code, sector) {
  const r = money(`${ACT}${code}.recurrent`), d = money(`${ACT}${code}.development`), parts = [...r, ...d];
  const now = fig(`approved.pbo.vote.${code}.total`), last = fig(`ke.fy2025-26.approved.pbo.vote.${code}.total`);
  return {
    code, sector, name: nameOf(parts[0], r.length ? 'recurrent' : 'development'), recurrent: add(r), development: add(d), total: sumFigures(parts),
    first: citing(parts[0], parts), parts, recurrentParts: r, developmentParts: d, pboNow: now, pboLast: last, change: compareFigures(last, now).percent, programmes: programmesOf(code),
  };
}

let votes = null;
export function allVotes() {
  votes ??= sectorMap.flatMap((s) => s.votes.map((code) => buildVote(code, s.slug)));
  return votes;
}
export const voteByCode = (code) => allVotes().find((v) => v.code === code);

// Stage figures for one sector. The Guide's ten sectors group some votes differently, so its total is shown as a note,
// never compared. Parliament and the Judiciary are listed on their own in the Budget Explainer, and have no Guide figure.
export function allSectors() {
  return sectorMap.map((s) => {
    const list = allVotes().filter((v) => v.sector === s.slug).sort((a, b) => b.total - a.total);
    const parts = list.flatMap((v) => v.parts), now = sumFigures(list.map((v) => v.pboNow)), last = sumFigures(list.map((v) => v.pboLast));
    const guide = hasFigure(`statement.sector.${s.slug}`) ? fig(`statement.sector.${s.slug}`) : null;
    return {
      slug: s.slug, table: s.table, votes: list, total: sumFigures(parts), recurrent: add(list.flatMap((v) => v.recurrentParts)), development: add(list.flatMap((v) => v.developmentParts)),
      last, change: (now - last) / last * 100, guide, first: { ...list[0].first, page: 'Schedule' },
    };
  }).sort((a, b) => b.total - a.total);
}
export const sectorBySlug = (slug) => allSectors().find((s) => s.slug === slug);

// A total we add up ourselves, in the shape of a figure, so a card can show it with its source and an "our calculation" tag
export const summed = (first, id, name, value) => ({ ...first, id, name, value, unit: 'KSh', calc: undefined });
