// The changelog: what each data release added, changed and removed. Added figures are counted by family, because one
// release can add thousands; the full list is the release's own JSON file.
import { allReleases } from './figures.js';

// "ke.fy2026-27.approved.project.1091100100" belongs to the family FY2026/27, approved, project
export function family(id) {
  const [, fy, stage, kind] = id.split('.');
  return { key: `${fy}.${stage}.${kind}`, fy: `FY${fy.slice(2).replace('-', '/')}`, stage, kind };
}

export function countByFamily(ids) {
  const out = new Map();
  for (const id of ids) {
    const f = family(id), e = out.get(f.key) ?? { ...f, n: 0 };
    e.n += 1;
    out.set(f.key, e);
  }
  return [...out.values()].sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
}

export const releases = () => allReleases().map((r) => ({ ...r, families: countByFamily(r.added) }));
export const releaseByDate = (date) => releases().find((r) => r.date === date);
