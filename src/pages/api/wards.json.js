import { nyamiraWardCount } from '../../lib/counts.js';
import { receipt, allWards } from '../../lib/ward.js';
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: `Ward receipts for the ${nyamiraWardCount} wards of Nyamira County.`, wards: allWards.map((w) => receipt(w.slug, site)) }, site);
}
