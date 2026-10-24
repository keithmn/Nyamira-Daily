import { receipt, allWards } from '../../../lib/ward.js';
import { json } from '../../../lib/api.js';
export function getStaticPaths() { return allWards.map((w) => ({ params: { slug: w.slug } })); }
export function GET({ params, site }) {
  return json({ description: 'Ward receipt.', ward: receipt(params.slug, site) }, site);
}
