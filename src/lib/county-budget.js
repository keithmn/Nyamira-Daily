// Nyamira's budget for one year, its 24 departments and their programmes, and what each spent (decision #105).
// Everything comes from the figure registry; this file only adds up and compares, and is tested.
import { departmentsHistory, fig, hasFig, maybe, structure, wardspend } from './county-registry.js';

export const FY = structure.fy; // "2025/26"
export const FY_PATH = FY.replace('/', '-');
const PBB = `ke.fy${FY_PATH}.estimates.county.nyamira`;
const Q4 = `ke.fy${FY_PATH}.spent.county.nyamira.q4`;
const COB = `ke.fy${FY_PATH}.spent.county.nyamira`;
// The question rule the national product uses for votes (decision #104): a department that spent under three quarters.
export const QUESTION_BELOW = 75;

// A share as the reports print it, to one decimal: 4.0%, not 4%.
export const pct = (v) => (v == null ? '–' : `${Number(v).toFixed(1)}%`);

const sum = (ids) => ids.reduce((a, id) => a + (maybe(id) ?? 0), 0);
const share = (part, whole) => (whole ? (part / whole) * 100 : null);

export function slugify(name) {
  return name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-').slice(0, 8).join('-');
}

export const yearPath = (fy = FY_PATH) => `/data/money/${fy}/`;
export const departmentPath = (vote) => `${yearPath()}departments/${vote}/`;
export const programmePath = (vote, slug) => `${departmentPath(vote)}${slug}/`;

// Where each KSh 100 goes and comes from. The parts are printed figures; only the shares are worked out.
export function budgetYear() {
  const total = fig(`${PBB}.total`);
  const staff = sum([`${PBB}.compensation.employees`, `${PBB}.compensation.social`]);
  const running = sum([`${PBB}.operations.grants`, `${PBB}.operations.funds`, `${PBB}.operations.om`]);
  const development = fig(`${PBB}.development`).value;
  const out = [
    { key: 'staff', label: 'Staff pay', value: staff, note: 'Salaries and the employer\'s contributions, the budget\'s own wage-bill measure.' },
    { key: 'running', label: 'Other running costs', value: running, note: 'Operations and maintenance, recurrent grants and funds.' },
    { key: 'development', label: 'Development', value: development, note: 'Building and buying things that last: roads, water, health and school buildings.' },
  ];
  const osr = sum(['osr-departments', 'osr-fif', 'osr-keroka', 'osr-nyamira-municipality'].map((k) => `${PBB}.revenue.${k}`));
  const into = [
    { key: 'equitable', label: 'Equitable share from the national government', value: fig(`${PBB}.revenue.equitable-share`).value },
    { key: 'grants', label: 'Grants from the national government and partners', value: sum([`${PBB}.revenue.grants-national`, `${PBB}.revenue.grants-partners`]) },
    { key: 'osr', label: 'Raised locally: fees, rates and hospital charges', value: osr },
    { key: 'balances', label: 'Unspent money from earlier years', value: fig(`${PBB}.revenue.balances`).value },
  ];
  const outTotal = out.reduce((a, p) => a + p.value, 0), inTotal = into.reduce((a, p) => a + p.value, 0);
  for (const p of out) p.share = share(p.value, outTotal);
  for (const p of into) p.share = share(p.value, inTotal);
  return { fy: FY, total, out, into, wageShare: fig(`${PBB}.wage-share`), revenueTotal: fig(`${PBB}.revenue.total`), source: total.doc };
}

// The FY2025/26 ward projects each department's development money lists (Table 18 of the same budget).
const WARD_DEPARTMENTS = {
  'Crop Development Services': '5264', 'Education and Vocational training': '5266', 'Environment and natural resources': '5265',
  'Lands, Housing and Urban Development': '5268', 'Livestock and Fisheries development': '5278', 'Primary Healthcare': '5279',
  'Roads, Transport and Public Works': '5270', Trade: '5271', 'Water and Sanitation': '5269', 'Youth, Gender, Culture & Social Services (Sports)': '5272',
};

export function wardProjects(vote) {
  const list = wardspend.projects.filter((p) => p.fy === FY && p.kind === 'budgeted' && WARD_DEPARTMENTS[p.department] === vote);
  const byWard = new Map();
  for (const p of list) {
    const w = byWard.get(p.ward) ?? { ward: p.ward, lines: 0, amount: 0, zero: 0 };
    w.lines++;
    w.amount += p.amount ?? 0;
    if (!p.amount) w.zero++;
    byWard.set(p.ward, w);
  }
  return { lines: list.length, amount: list.reduce((a, p) => a + (p.amount ?? 0), 0), wards: [...byWard.values()].sort((a, b) => b.amount - a.amount) };
}

function spending(vote) {
  const at = (kind, what) => maybe(`${Q4}.vote.${vote}.${kind}.${what}`);
  const row = (kind) => ({ budget: at(kind, 'target'), spent: at(kind, 'actual') ?? (at(kind, 'target') ? 0 : null), share: at(kind, 'share') });
  return { total: row('total'), recurrent: row('recurrent'), development: row('development'), source: fig(`${Q4}.vote.${vote}.total.target`) };
}

export function departments() {
  const countyTotal = fig(`${PBB}.total`).value;
  return structure.votes.map((v) => {
    const V = v.figure;
    const total = fig(V).value;
    const staff = maybe(`${V}.compensation`) ?? maybe(`${V}.compensation.employees`) ?? 0;
    const running = maybe(`${V}.operations`) ?? maybe(`${V}.operations.om`) ?? 0;
    const used = new Set();
    const programmes = v.programmes.map((p) => {
      let slug = slugify(p.name);
      while (used.has(slug)) slug += '-2';
      used.add(slug);
      const rows = p.rows.map((r) => {
        const id = `${PBB}.programme.${v.vote}.p${p.n}.r${r.row}`;
        return { ...r, id, total: maybe(id), recurrent: maybe(`${id}.recurrent`), development: maybe(`${id}.development`), page: hasFig(id) ? fig(id).page : null };
      });
      const amount = rows.reduce((a, r) => a + (r.total ?? 0), 0);
      return { n: p.n, name: p.name, slug, rows, total: amount, recurrent: rows.reduce((a, r) => a + (r.recurrent ?? 0), 0), development: rows.reduce((a, r) => a + (r.development ?? 0), 0), page: rows.find((r) => r.page)?.page ?? null };
    });
    return {
      vote: v.vote, name: v.name, short: v.short, figure: fig(V),
      total, recurrent: maybe(`${V}.recurrent`) ?? 0, development: maybe(`${V}.development`) ?? 0, staff, running,
      shareOfCounty: share(total, countyTotal), staffShare: share(staff, total),
      programmes, spending: spending(v.vote), wardProjects: wardProjects(v.vote),
    };
  });
}

// Questions, not accusations (decision #14): each restates printed numbers and asks what happened.
export function questionsFor(d) {
  const out = [];
  const where = `the county's fourth-quarter report for ${FY}, ${d.spending.source.page}`;
  const s = d.spending;
  if (s.development.budget && s.development.share < QUESTION_BELOW) out.push({ text: `By 30 June 2026 the ${d.name} department had spent ${s.development.share.toFixed(1)}% of its development budget: KSh ${(s.development.spent / 1e6).toFixed(1)} million of KSh ${(s.development.budget / 1e6).toFixed(1)} million. Which planned works were not paid for, and what happens to them now?`, source: where });
  if (s.recurrent.budget && s.recurrent.share < QUESTION_BELOW) out.push({ text: `The ${d.name} department spent ${s.recurrent.share.toFixed(1)}% of its recurrent budget (staff pay and running costs) by 30 June 2026. Why was the rest not used?`, source: where });
  return out;
}

// The year's spending for all departments, and the two published totals side by side.
export function track() {
  const list = departments().map((d) => ({ vote: d.vote, name: d.name, short: d.short, ...d.spending, questions: questionsFor(d) }));
  const county = { budget: fig(`${Q4}.total.target`), spent: fig(`${Q4}.total.actual`), share: fig(`${Q4}.total.share`),
    devBudget: fig(`${Q4}.development.target`), devSpent: fig(`${Q4}.development.actual`), devShare: fig(`${Q4}.development.share`) };
  const cob = { spent: fig(`${COB}.spent`), budget: fig(`${COB}.budget`), devSpent: fig(`${COB}.dev-spent`), absorption: fig(`${COB}.absorption`) };
  return { list: list.sort((a, b) => (a.total.share ?? 0) - (b.total.share ?? 0)), county, cob };
}

// Each year's printed estimates since FY2021/22, oldest first. A year is compared with today only where the department
// was the same then (scope "same"); where it was combined with others, or did not exist, the page says so instead.
export const HISTORY_YEARS = [...Object.keys(departmentsHistory).sort(), FY];

export function departmentYears(vote) {
  return HISTORY_YEARS.map((fy) => {
    if (fy === FY) {
      const V = `${PBB}.vote.${vote}`;
      return { fy, scope: 'same', recurrent: maybe(`${V}.recurrent`) ?? 0, development: maybe(`${V}.development`) ?? 0, total: fig(V).value, name: null, note: null };
    }
    const list = departmentsHistory[fy];
    const e = list.find((x) => x.votes.includes(vote));
    if (!e) return { fy, scope: 'absent' };
    const recurrent = e.recurrent ? fig(e.recurrent).value : 0, development = e.development ? fig(e.development).value : 0;
    return { fy, scope: e.scope, votes: e.votes, name: e.name, note: e.note, recurrent, development, total: recurrent + development, ids: [e.recurrent, e.development].filter(Boolean) };
  });
}

// The change on last year, only where the department was the same in both years. Both are printed estimates.
export function changeOnLastYear(vote) {
  const ys = departmentYears(vote);
  const now = ys.at(-1), before = ys.at(-2);
  if (before.scope !== 'same' || !before.total) return null;
  return { fy: before.fy, before: before.total, now: now.total, pct: ((now.total - before.total) / before.total) * 100 };
}

// The county's printed budget each year: the recurrent and development tables' own totals.
export function countyYears() {
  return HISTORY_YEARS.map((fy) => {
    const P = `ke.fy${fy.replace('/', '-')}.estimates.county.nyamira`;
    const recurrent = fig(`${P}.recurrent`), development = fig(`${P}.development`);
    return { fy, recurrent: recurrent.value, development: development.value, total: recurrent.value + development.value, note: recurrent.note ?? null };
  });
}
