// All 47 counties as a file, so a table's CSV is a link and not a copy of its numbers in the page.
import { csvLine } from '@kbe/engine/csv';
import { countyRows } from '../../lib/counties.js';
import { release } from '../../lib/figures.js';

export function GET() {
  const rows = countyRows().sort((a, b) => a.rank - b.rank);
  const lines = [
    ['rank', 'county', 'equitable_share_fy2026_27_ksh', 'equitable_share_fy2025_26_ksh', 'change_percent_cash_terms', 'budget_fy2025_26_ksh_m', 'spent_fy2025_26_ksh_m', 'development_budget_fy2025_26_ksh_m', 'development_spent_fy2025_26_ksh_m', 'development_absorption_percent', 'stage', 'label', 'source', 'figure_id', 'data_release'],
    ...rows.map((r) => {
      const y = r.spending.at(-1);
      return [r.rank, r.name, r.value, r.last, r.change.toFixed(1), y.budget, y.spent, y.devBudget, y.devSpent, y.devPct, r.figure.stage, r.figure.label, `${r.figure.source} ${r.figure.page}; ${y.figure.source} ${y.figure.page}`, r.figure.id, release];
    }),
  ];
  return new Response(`${lines.map(csvLine).join('\n')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
