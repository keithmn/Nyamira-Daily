import O from '../../data/opportunities.json';
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: 'County jobs, tenders, bursaries and programmes, each with its official notice (url). Always confirm with the office named.', ...O }, site);
}
