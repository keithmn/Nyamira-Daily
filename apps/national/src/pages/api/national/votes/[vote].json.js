// One vote: this year's money from the Act, last year's from the Budget Explainer, its programmes and its projects
import { envelope, json } from '../../../../lib/api.js';
import { allFigures } from '../../../../lib/figures.js';
import { projectsOf } from '../../../../lib/projects.js';
import { allVotes, voteByCode } from '../../../../lib/votes.js';

export const getStaticPaths = () => allVotes().map((v) => ({ params: { vote: v.code } }));

export function GET({ params }) {
  const v = voteByCode(params.vote);
  const own = allFigures().filter((f) => f.id.includes(`.vote.${v.code}.`) || f.id.endsWith(`.vote.${v.code}.total`) || f.id.includes(`.project.${v.code}`) || f.id.endsWith(`.project-vote.${v.code}`));
  return json(envelope({
    vote: v.code, name: v.name, sector: v.sector, fy: '2026/27', stage: 'approved', unit: 'KSh',
    gross: v.total, recurrent: v.recurrent, development: v.development, changeOnLastYearPercent: Number(v.change.toFixed(1)),
    programmes: v.programmes.map((p) => ({ code: p.code, name: p.name, recurrent: p.recurrent, development: p.development, gross: p.total })),
    projects: projectsOf(v.code).map((p) => ({ code: p.code, name: p.name, gross2026_27: p.current?.value ?? null, approved2025_26: p.previous?.value ?? null })),
  }, own));
}
