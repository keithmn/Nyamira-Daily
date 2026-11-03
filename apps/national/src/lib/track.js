// How much has actually moved: revenue and spending against target, from the Treasury's latest Quarterly Economic and
// Budgetary Review (decision #104). Every share spent and every shortfall is the report's own printed figure: nothing
// here is recomputed.
import { allFigures, fig, hasFigure } from './figures.js';

const B = 'ke.fy2025-26.spent.qebr';
export const TRACK_FY = 'FY2025/26';
export const HEADLINE = ['revenue-total', 'revenue-ordinary', 'grants', 'expenditure-total', 'recurrent-national'];

export const headline = () => HEADLINE.map((key) => {
  const actual = fig(`${B}.${key}.actual`), target = fig(`${B}.${key}.target`);
  return { key, actual, target, shortfall: fig(`${B}.${key}.shortfall`) };
});

export const ministries = () => ({ actual: fig(`${B}.ministries.total.actual`), target: fig(`${B}.ministries.total.target`), pct: fig(`${B}.ministries.pct-spent`) });
export const interest = () => ({ total: fig(`${B}.interest.actual`), domestic: fig(`${B}.interest-domestic.actual`), foreign: fig(`${B}.interest-foreign.actual`) });

// One row per vote the report lists with amounts, lowest share spent first
export function voteSpending() {
  return allFigures().filter((f) => /\.qebr\.vote\.\d{4}\.pct-spent$/.test(f.id)).map((p) => {
    const code = p.id.split('.')[5], f = (k) => (hasFigure(`${B}.vote.${code}.${k}`) ? fig(`${B}.vote.${code}.${k}`) : null);
    return { code, name: f('total.actual').name.split(', total')[0], actual: f('total.actual'), target: f('total.target'), pct: fig(p.id), devActual: f('development.actual'), devTarget: f('development.target') };
  }).sort((a, b) => a.pct.value - b.pct.value);
}

export const spendingOf = (code) => voteSpending().find((v) => v.code === code) ?? null;

// A question for each vote that spent less than three quarters of its target, in the report's own numbers
export const LOW_SHARE = 75;
export const lowSpenders = () => voteSpending().filter((v) => v.pct.value < LOW_SHARE);
