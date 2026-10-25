// NG-CDF (national money, run per constituency) — src/data/ngcdf.json. Never mixed with county figures.
import D from '../data/ngcdf.json';
export const cdf = D;
export const cdfSources = Object.fromEntries(D.sources.map((s) => [s.id, s]));
// "education - primary schools" → "Education: primary schools"
export function sectorLabel(s) {
  const [a, b] = (s ?? 'other').split(' - ');
  const head = a.charAt(0).toUpperCase() + a.slice(1);
  return b ? `${head}: ${b}` : head;
}
export const forConstituency = (name) => ({
  allocations: D.allocations.filter((x) => x.constituency === name).sort((a, b) => a.fy.localeCompare(b.fy)),
  projects: D.projects.filter((x) => x.constituency === name),
  bursaries: D.bursaries.filter((x) => x.constituency === name).sort((a, b) => a.fy.localeCompare(b.fy)),
  audit: D.audit.filter((x) => x.constituency === name).sort((a, b) => b.fy.localeCompare(a.fy)),
});
