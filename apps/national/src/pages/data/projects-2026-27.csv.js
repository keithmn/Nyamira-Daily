// Every project in the Development Estimates, with its vote and source page
import { csvLine } from '@kbe/engine/csv';
import { release } from '../../lib/figures.js';
import { allProjects } from '../../lib/projects.js';
import { voteByCode } from '../../lib/votes.js';

export function GET() {
  const lines = [
    ['code', 'name', 'vote', 'vote_name', 'gross_fy2026_27_ksh', 'approved_fy2025_26_ksh', 'stage', 'label', 'source', 'data_release'],
    ...allProjects().map((p) => [p.code, p.name, p.vote, voteByCode(p.vote)?.name ?? '', p.current?.value ?? '', p.previous?.value ?? '', 'approved', 'official', `${p.figure.source} ${p.figure.page}`, release]),
  ];
  return new Response(`${lines.map(csvLine).join('\n')}\n`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
