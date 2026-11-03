// One county: its equitable share at each stage and what the Controller of Budget reports it spent, never added together
import { COUNTIES } from '@kbe/engine/counties';
import { envelope, json } from '../../../../lib/api.js';
import { allFigures } from '../../../../lib/figures.js';

export const getStaticPaths = () => COUNTIES.map((c) => ({ params: { county: c.slug } }));

export function GET({ params }) {
  const c = COUNTIES.find((x) => x.slug === params.county);
  const own = allFigures().filter((f) => f.id.includes(`.county.${c.slug}.`));
  return json(envelope({ county: c.slug, name: c.name, what: 'Figures of different stages and years are listed side by side. Never add them.' }, own));
}
