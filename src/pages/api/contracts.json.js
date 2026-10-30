import D from '../../data/contracts.json';
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: "Project tracker (decision #71): county and national contracts and project allocations in Nyamira, each field exactly as printed in the cited source (sources below; `page` gives the place in the source). null means the source does not print it. amountLabel says whether an amount is a contract sum, an allocation or a total project cost. County and national money are separate sets (group, national). Contract period dates are not evidence of progress. Companies only: records naming a private person have contractor null.", groups: D.groups, sources: D.sources, contracts: D.contracts }, site);
}
