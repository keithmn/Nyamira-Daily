// One sector's votes as a file: this year from the Act, last year from the Budget Explainer.
import { csvLine } from '@kbe/engine/csv';
import { release } from '../../../lib/figures.js';
import { allSectors, sectorBySlug } from '../../../lib/votes.js';

export function getStaticPaths() {
  return allSectors().map((s) => ({ params: { sector: s.slug } }));
}

export function GET({ params }) {
  const s = sectorBySlug(params.sector);
  const lines = [
    ['vote', 'name', 'recurrent_ksh', 'development_ksh', 'approved_fy2026_27_ksh', 'approved_fy2025_26_ksh_m', 'change_percent_cash_terms', 'stage', 'label', 'source', 'data_release'],
    ...s.votes.map((v) => [v.code, v.name, v.recurrent, v.development, v.total, v.pboLast.value, v.change.toFixed(1), 'approved', 'official', `${v.first.source} ${v.first.page}; ${v.pboLast.source} ${v.pboLast.page}`, release]),
  ];
  return new Response(`${lines.map(csvLine).join('\n')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
