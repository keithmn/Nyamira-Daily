// One ward's receipt as plain data: used by the printable sheet, the API (/api/ward/…) and the embed.
import wards from '../data/wards.js';
import leaders from '../data/leaders.json';
import money from '../data/money.json';
import census from '../data/census.json';
import { budget2526, total, questions, lines2526 } from './projects.js';

export const updated = '2026-10-22';
const order = ['Health', 'Education', 'Worship', 'Market', 'Water', 'Public office', 'Community centre', 'Agriculture'];

export function receipt(slug, site) { // site: Astro.site (astro.config.mjs)
  const w = wards.find((x) => x.slug === slug);
  const mca = leaders.mcas[slug];
  const mp = leaders.national.find((l) => l.office === `MP, ${w.subCounty}`);
  const byCat = {};
  for (const f of w.facilities) byCat[f.category] = (byCat[f.category] ?? 0) + 1;
  const last = money.years[money.years.length - 1];
  const budgetLines = lines2526(slug);
  const b = budget2526(slug);
  const r = total(slug, '2023/24', 'contract');
  const cw = census.wards.find((x) => x.ward === slug);
  return {
    slug, name: w.name, subCounty: w.subCounty,
    url: new URL(`/ward/${slug}/`, site).toString(),
    mca: mca ? { name: mca.name, party: mca.party ?? null, note: mca.note ?? null } : null,
    mp: mp ? mp.name : null,
    services: { total: w.facilities.length, byCategory: order.filter((c) => byCat[c]).map((c) => ({ category: c, count: byCat[c] })), evidence: 'unverified' },
    wardProjects2526: budgetLines.length > 0 ? { amount: b, lines: budgetLines.length, evidence: 'official', source: 'County Programme Based Budget 2025/26, Table 18' } : null,
    roadContracts2324: r ? { amount: r.amount, evidence: 'official', source: 'County Annual Development Plan 2025/26, s.2.4.8' } : null,
    registeredVoters2018: cw?.votersRegisteredEarlier ?? null,
    county: { fy: last.fy, spentKshMillion: last.spent, budgetKshMillion: last.budget, developmentBudgetUsedPct: last.devAbs, evidence: 'official', source: 'Controller of Budget, County Governments Budget Implementation Review Report FY' + last.fy },
    questions: questions.filter((q) => q.ward === slug).map((q) => ({ title: q.title, text: q.text, sources: q.src.map((s) => s.title) })),
    updated,
  };
}
export const allWards = wards;
