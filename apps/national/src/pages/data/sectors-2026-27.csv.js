// All twelve groups for FY2026/27, with last year's same votes, so a reader can check the change.
import { csvLine } from '@kbe/engine/csv';
import { t } from '../../i18n/index.js';
import { release } from '../../lib/figures.js';
import { allSectors } from '../../lib/votes.js';

export function GET() {
  const lines = [
    ['sector', 'approved_fy2026_27_ksh', 'same_votes_fy2025_26_ksh_m', 'change_percent_cash_terms', 'votes', 'stage', 'label', 'source', 'data_release'],
    ...allSectors().map((s) => [t('en', `sector.${s.slug}`), s.total, s.last, s.change.toFixed(1), s.votes.length, 'approved', 'official', 'appropriation-act-2026; pbo-budget-explainer-2026; pbo-budget-explainer-2025', release]),
  ];
  return new Response(`${lines.map(csvLine).join('\n')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
