// Project tracker helpers (decision #71). Data: src/data/contracts.json, built by scripts/build-contracts.py.
import data from '../data/contracts.json';

export const contracts = data.contracts;
export const sources = data.sources;
export const groupOrder = ['county', 'assembly', 'roads', 'ng-cdf', 'national'];
export const groups = {
  county: { label: 'County Government', title: 'County Government contracts', blurb: 'Works, supplies and services the County Government of Nyamira awarded, as published on the national procurement portal.', who: 'County money', tone: 'tea', icon: 'government' },
  assembly: { label: 'County Assembly', title: 'County Assembly contracts', blurb: 'Contracts the County Assembly of Nyamira awarded, as published on the national procurement portal.', who: 'County money', tone: 'rain', icon: 'office' },
  roads: { label: 'National roads', title: 'National road contracts in Nyamira', blurb: 'KeRRA, KURA and KeNHA road works in Nyamira. National money, not county money.', who: 'National money', tone: 'harvest', icon: 'road' },
  'ng-cdf': { label: 'NG-CDF', title: 'NG-CDF projects in the four constituencies', blurb: 'Projects funded by the National Government Constituencies Development Fund in Borabu, Kitutu Masaba, North Mugirango and West Mugirango. National money, not county money. The sources give allocations; they rarely name a contractor.', who: 'National money', tone: 'dusk', icon: 'education' },
  national: { label: 'Other national', title: 'Other national projects in Nyamira', blurb: 'Water, schools, housing and other works by national agencies, where an award was found.', who: 'National money', tone: 'avocado', icon: 'water' },
};
export const constituencyName = { borabu: 'Borabu', 'kitutu-masaba': 'Kitutu Masaba', 'north-mugirango': 'North Mugirango', 'west-mugirango': 'West Mugirango' };

export function slugify(s) {
  return String(s).toLowerCase().split('&').join(' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
export const contractorSlug = (name) => slugify(name);

// The contract period, read only from the contract's own dates against the build date. It says nothing about
// whether work was done: "period ended" is not "completed".
export function periodState(c, today = new Date().toISOString().slice(0, 10)) {
  if (c.terminated) return { key: 'terminated', label: `Terminated ${c.terminated.date}` };
  if (!c.startDate || !c.endDate) return null;
  if (today < c.startDate) return { key: 'upcoming', label: 'Not yet started (by its dates)' };
  if (today <= c.endDate) return { key: 'running', label: 'Within its contract period' };
  return { key: 'ended', label: 'Contract period ended' };
}

export function byGroup(g) { return contracts.filter((c) => c.group === g); }
export function forWard(slug) { return contracts.filter((c) => c.wards.includes(slug)); }
export function forConstituency(slug) { return contracts.filter((c) => c.constituency === slug); }

export function contractors() {
  const m = new Map();
  for (const c of contracts) {
    if (!c.contractor) continue;
    const k = contractorSlug(c.contractor);
    const e = m.get(k) ?? { slug: k, name: c.contractor, names: new Set(), items: [] };
    e.names.add(c.contractor); e.items.push(c); m.set(k, e);
  }
  return [...m.values()].map((e) => ({ ...e, names: [...e.names], total: e.items.reduce((n, c) => n + (c.amount ?? 0), 0) }))
    .sort((a, b) => b.total - a.total);
}

export function totals(list) {
  return {
    count: list.length,
    withContractor: list.filter((c) => c.contractor).length,
    value: list.reduce((n, c) => n + (c.amount ?? 0), 0),
    withAmount: list.filter((c) => c.amount != null).length,
    years: [...new Set(list.map((c) => c.fy).filter(Boolean))].sort().reverse(),
    latestAward: list.map((c) => c.awardDate).filter(Boolean).sort().pop() ?? null,
  };
}
// Percentage helper (kept out of .astro frontmatter: the Astro compiler can misread "/" there, decision #16)
export const pctOf = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
