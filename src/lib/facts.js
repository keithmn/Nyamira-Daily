// Facts export (decision #78): every published figure as one row with its source, page, period and evidence
// label. This is the knowledge base for the planned "Ask Nyamira Daily" assistant: it may only answer from these
// rows and must quote the source with the answer. Pure functions here; the data is passed in by
// src/pages/api/facts.json.js, so the tests can run without Astro.

const COB = 'Controller of Budget, County Governments Budget Implementation Review Report';
const moneyFields = [
  ['budget', 'County budget (approved)', 'KSh million'],
  ['spent', 'County spending (actual)', 'KSh million'],
  ['dev', 'Development spending (actual)', 'KSh million'],
  ['rec', 'Recurrent spending (actual)', 'KSh million'],
  ['devAbs', 'Share of the development budget used', 'per cent'],
  ['osrTarget', 'Own-source revenue target', 'KSh million'],
  ['osr', 'Own-source revenue collected', 'KSh million'],
  ['eqShare', 'Equitable share from the national government', 'KSh million'],
  ['pending', 'Pending bills reported', 'KSh million'],
];

export function moneyFacts(money) {
  const rows = [];
  for (const y of money.years) {
    for (const [key, label, unit] of moneyFields) {
      if (y[key] == null) continue; // unknown stays unknown: no row
      const note = key === 'osr' ? y.osrNote : key === 'pending' ? y.pendingNote : undefined;
      rows.push({
        id: `money.${y.fy}.${key}`, topic: 'money', place: 'Nyamira County', period: `FY${y.fy}`,
        label, value: y[key], unit, evidence: 'official',
        source: { title: `${COB}, FY${y.fy}`, url: y.src, page: y.page ?? null },
        ...(note ? { note } : {}),
        page: '/data/money/', updated: money.updated ?? null,
      });
    }
  }
  return rows;
}

export function wardFacts(receipts) {
  const rows = [];
  for (const r of receipts) {
    const base = { topic: 'ward', place: `${r.name} Ward`, page: `/ward/${r.slug}/`, updated: r.updated ?? null };
    if (r.wardProjects2526) rows.push({ ...base, id: `ward.${r.slug}.budget2526`, period: 'FY2025/26', label: 'Ward projects budgeted', value: r.wardProjects2526.amount, unit: 'KSh', evidence: r.wardProjects2526.evidence, source: { title: r.wardProjects2526.source, url: null, page: null }, note: `${r.wardProjects2526.lines} budget lines. A budget line is planned money, not proof that work was done.` });
    if (r.roadContracts2324) rows.push({ ...base, id: `ward.${r.slug}.roads2324`, period: 'FY2023/24', label: 'Road maintenance contracts', value: r.roadContracts2324.amount, unit: 'KSh', evidence: r.roadContracts2324.evidence, source: { title: r.roadContracts2324.source, url: null, page: null } });
    if (r.services) rows.push({ ...base, id: `ward.${r.slug}.services`, period: null, label: 'Public places and services listed', value: r.services.total, unit: 'count', evidence: r.services.evidence, source: { title: 'Nyamira Daily list, mostly not yet checked on site', url: null, page: null } });
  }
  return rows;
}

export function buildFacts({ money, receipts }) {
  const rows = [...moneyFacts(money), ...wardFacts(receipts)];
  const ids = new Set();
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`Duplicate fact id ${row.id}`);
    ids.add(row.id);
  }
  return rows;
}
