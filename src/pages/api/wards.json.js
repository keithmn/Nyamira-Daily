import { receipt, allWards } from '../../lib/ward.js';
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: 'Ward receipts for all 20 wards of Nyamira County.', wards: allWards.map((w) => receipt(w.slug, site)) }, site);
}
