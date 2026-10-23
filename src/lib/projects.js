import data from '../data/wardspend.json';
export const sources = Object.fromEntries(data.sources.map((s) => [s.id, s]));
export const projects = data.projects;
export const kindLabel = { budgeted: 'Budgeted', contract: 'Contract sum', spent: 'Spent', planned: 'Planned' };
export function forWard(slug) { return projects.filter((p) => p.ward === slug); }
export function total(slug, fy, kind) { return data.wardTotals.find((t) => t.ward === slug && t.fy === fy && t.kind === kind); }
export function lines2526(slug) { return projects.filter((p) => p.ward === slug && p.fy === '2025/26' && p.kind === 'budgeted'); }
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
