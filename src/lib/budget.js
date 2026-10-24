import B from '../data/budget-sectors.json';
import { groups } from '../data/budget-groups.js';
export function grouped() {
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
export const budget = B;
