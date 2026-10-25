import data from '../data/wardspend.json';
import { amountLabel, amountStatus, sumAmounts } from './project-amounts.js';
import { pct, statusCountsFor } from './project-status.js';
export const sources = Object.fromEntries(data.sources.map((s) => [s.id, s]));
export const projects = data.projects;
export { pct };
export const kindLabel = { budgeted: 'Budgeted', contract: 'Contract sum', spent: 'Spent', planned: 'Planned' };
export function forWard(slug) { return projects.filter((p) => p.ward === slug); }
export function total(slug, fy, kind) { return data.wardTotals.find((t) => t.ward === slug && t.fy === fy && t.kind === kind); }
export function lines2526(slug) { return projects.filter((p) => p.ward === slug && p.fy === '2025/26' && p.kind === 'budgeted'); }
export function budget2526(slug) { return sumAmounts(lines2526(slug).map((project) => project.amount)); }
// FY order for display, newest first
export const fyOrder = ['2025/26', 'as at 30 Jun 2025', '2024/25', '2023/24', '2022/23'];
// Questions raised by the documents themselves (repeat budgeting, stalled works).
export const watch = [
  { ward: 'bosamaro', title: 'Nyachogochogo Primary playfield levelling', text: 'Reported 100% complete in FY2023/24 (KSh 998,300 spent), then budgeted again in FY2025/26 as "completion of levelling" (KSh 1M).', src: ['adp2526', 'pbb2526'] },
  { ward: 'rigoma', title: 'Biticha Morera Dispensary outpatient block', text: 'Budgeted in FY2023/24 (KSh 3.2M), FY2024/25 (KSh 1M) and again in FY2025/26.', src: ['adp2526', 'cadp2627', 'pbb2526'] },
  { ward: 'bokeira', title: 'Omobiro ECDE classroom', text: 'Site handed over at 0% in FY2023/24; contract termination under way by June 2025; budgeted again in FY2025/26.', src: ['adp2526', 'cadp2627', 'pbb2526'] },
  { ward: 'mekenene', title: 'Nyagacho Health Centre', text: 'Outpatient block budgeted KSh 3M in FY2024/25 at 0% progress; "completion" budgeted KSh 4M in FY2025/26.', src: ['cadp2627', 'pbb2526'] },
  { ward: 'bonyamatuta', title: "County Assembly Speaker's residence", text: 'Contract KSh 34.4M; KSh 26.6M paid. Listed by the Controller of Budget as stalled at 77% because there was no budget provision.', src: ['cob2425'] },
  { ward: 'bonyamatuta', title: 'Nyakeore twin staff house', text: 'Still under contract, and budgeted again in FY2025/26.', src: ['adp2526', 'pbb2526'] },
  { ward: 'bosamaro', title: 'Motagara staff house', text: 'Still under contract, and budgeted again in FY2025/26.', src: ['adp2526', 'pbb2526'] },
];
export const notes = data.notes;
export const checked = data.checked;

// The status line without contractor and table notes: "0% – Not procured | Contractor: …" → "0% – Not procured"
export function statusShort(status) {
  if (!status) return null;
  return status.split('|')[0].trim();
}

// Every question to ask, for the home page map: the curated list above, then projects the county's
// own reports list at 0% (deduplicated against the curated list). Each carries its sources.
const fmtM = (n) => (n >= 1e6 ? 'KSh ' + parseFloat((n / 1e6).toFixed(2)) + 'M' : amountLabel(n));
const zero = [];
const seen = new Set();
for (const p of projects) {
  const st = statusShort(p.status);
  if (!p.ward || !st || !st.startsWith('0%')) continue;
  const key = p.ward + '|' + p.name;
  if (seen.has(key)) continue;
  seen.add(key);
  const first = p.name.split(' ').find((w) => w.length > 4 && /^[A-Z]/.test(w) && !['Construction', 'Completion', 'Renovation', 'Repair', 'Fencing', 'Equipping', 'Distribution', 'Road'].includes(w));
  if (first && watch.some((x) => x.ward === p.ward && x.title.includes(first))) continue;
  zero.push({
    ward: p.ward,
    title: p.name.replace('Road routine maintenance: ', 'Road maintenance: '),
    text: `${amountStatus(p.amount) === 'unavailable' ? 'Amount not reported' : `${fmtM(p.amount)} set aside`} in FY${p.fy}. The county's own report lists it as "${st}".`,
    src: [{ id: p.sourceId, page: p.page }],
  });
}
export const questions = [
  ...watch.map((x) => ({ ward: x.ward, title: x.title, text: x.text, src: x.src.map((id) => ({ id })) })),
  ...zero,
].map((q) => ({ ...q, src: q.src.map((s) => ({ title: shortTitle(sources[s.id].title), url: sources[s.id].url, page: s.page ?? '' })) }));
// "County Government of Nyamira – Programme Based Budget 2025/2026 (July 2025), Table 18 …" → "Programme Based Budget 2025/2026"
export function shortTitle(t) {
  const parts = t.split(' – ');
  const by = parts.length > 1 ? parts[0] : '';
  const name = (parts.length > 1 ? parts.slice(1).join(' – ') : t).split(' (')[0].split(',')[0].trim();
  return by && by !== 'County Government of Nyamira' ? by + ': ' + name : 'County ' + name.replace('County ', '');
}

export function statusCounts(slug) {
  return statusCountsFor(projects, slug);
}

// Projects by stable ID (scripts/project-ids.py): all records for one project, newest year first
export function byProject() {
  const m = new Map();
  for (const p of projects) (m.get(p.projectId) ?? m.set(p.projectId, []).get(p.projectId)).push(p);
  for (const list of m.values()) list.sort((a, b) => fyOrder.indexOf(a.fy) - fyOrder.indexOf(b.fy));
  return m;
}
