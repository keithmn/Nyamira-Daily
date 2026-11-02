// The equitable share of all 47 counties as a file, so a table's CSV is a link and not a copy of its numbers in the page.
import { csvLine } from '@kbe/engine/csv';
import { countyRows } from '../../lib/counties.js';
import { release } from '../../lib/figures.js';

export function GET() {
  const rows = countyRows().sort((a, b) => a.rank - b.rank);
  const lines = [
    ['rank', 'county', 'equitable_share_fy2026_27_ksh', 'equitable_share_fy2025_26_ksh', 'change_percent_cash_terms', 'stage', 'label', 'source', 'figure_id', 'data_release'],
    ...rows.map((r) => [r.rank, r.name, r.value, r.last, r.change.toFixed(1), r.figure.stage, r.figure.label, `${r.figure.source} ${r.figure.page}`, r.figure.id, release]),
  ];
  return new Response(`${lines.map(csvLine).join('\n')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
