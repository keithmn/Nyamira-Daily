// Each vote's spending against target in FY2025/26, as the Treasury's quarterly review prints it (Table 6)
import { csvLine } from '@kbe/engine/csv';
import { release } from '../../lib/figures.js';
import { voteSpending } from '../../lib/track.js';

export function GET() {
  const lines = [
    ['vote', 'name', 'spent_ksh_m', 'target_ksh_m', 'percent_of_target_spent', 'development_spent_ksh_m', 'development_target_ksh_m', 'fy', 'stage', 'label', 'source', 'data_release'],
    ...voteSpending().map((v) => [v.code, v.name, v.actual.value, v.target.value, v.pct.value, v.devActual?.value ?? '', v.devTarget?.value ?? '', '2025/26', 'spent', 'official', `${v.actual.source} ${v.actual.page}`, release]),
  ];
  return new Response(`${lines.map(csvLine).join('\n')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
