// Every published figure with its source, period and evidence label (decision #78). Documented on /data/open-data/.
import money from '../../data/money.json';
import { json } from '../../lib/api.js';
import { buildFacts } from '../../lib/facts.js';
import { receipt, allWards } from '../../lib/ward.js';
export function GET({ site }) {
  const facts = buildFacts({ money, receipts: allWards.map((w) => receipt(w.slug, site)) });
  return json({
    description: 'Every published figure as one row: what it measures, the place and period, the value and unit, its evidence label and its source. Unknown values have no row. County and national money are never added together.',
    count: facts.length,
    facts,
  }, site);
}
