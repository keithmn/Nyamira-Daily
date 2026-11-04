// The budget simulator's figures, from the county figure registry (decision #105): the same 24 votes the Money pages
// show, in the shape the simulator was written for. The grouping in budget-groups.js is ours; the figures are the
// county's.
import { groups } from '../data/budget-groups.js';
import { budgetYear, departments } from './county-budget.js';

const y = budgetYear();
export const budget = {
  departments: departments().map((d) => ({ name: d.name, vote: d.vote, compensation: d.staff, operations: d.running, development: d.development, total: d.total })),
  countyTotal: { total: y.total.value, compensation: y.out.find((p) => p.key === 'staff').value },
  source: { url: y.source.url, title: y.source.title },
};

export function grouped() {
  const B = budget;
  const used = new Set();
  const gs = groups.map((g) => {
    const ds = B.departments.filter((d) => g.votes.includes(d.name));
    ds.forEach((d) => used.add(d.name));
    const sum = (k) => ds.reduce((n, d) => n + (d[k] ?? 0), 0);
    return { ...g, wage: sum('compensation'), operations: sum('operations'), development: sum('development'), total: sum('total'), movable: sum('operations') + sum('development') };
  });
  const missing = B.departments.filter((d) => !used.has(d.name)).map((d) => d.name);
  if (missing.length) throw new Error('Budget votes not grouped: ' + missing.join(', '));
  return gs;
}
