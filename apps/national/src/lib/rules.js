// Two county fiscal rules, tested for one year. The law is quoted and the test is stated, so a reader can check it. The
// Controller of Budget's own finding is shown first on the page; these results come second (build brief 4.5). A badge
// says only what the arithmetic says: it carries no red and names no person.
import { fig, hasFigure } from './figures.js';

const Y = 'ke.fy2025-26';
export const RULE_YEAR = 'FY2025/26';

export const RULES = [
  { key: 'development', measure: 'dev-share', threshold: `${Y}.law.rule.development-minimum`, passes: (value, limit) => value >= limit },
  { key: 'wages', measure: 'wage-share', threshold: `${Y}.law.rule.wage-maximum`, passes: (value, limit) => value <= limit },
];

export function rulesFor(slug) {
  return RULES.map((r) => {
    const id = `${Y}.spent.county.${slug}.${r.measure}`, limit = fig(r.threshold);
    if (!hasFigure(id)) return { key: r.key, result: 'none', limit };
    const figure = fig(id);
    return { key: r.key, figure, value: figure.value, limit, result: r.passes(figure.value, limit.value) ? 'meets' : 'misses' };
  });
}

// How many counties meet each rule, for the counties list
export const countOf = (slugs, key, result) => slugs.filter((s) => rulesFor(s).find((r) => r.key === key).result === result).length;
