import { receipt, allWards } from '../../../lib/ward.js';
import { wardText } from '../../../lib/wardtext.js';
import { text } from '../../../lib/api.js';
export function getStaticPaths() { return allWards.map((w) => ({ params: { slug: w.slug } })); }
export function GET({ params, site }) { return text(wardText(receipt(params.slug, site))); }
