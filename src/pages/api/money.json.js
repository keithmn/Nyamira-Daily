import money from '../../data/money.json';
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: 'Nyamira County budget, spending, revenue and pending bills by financial year. Amounts in KSh million. Each year carries its source (src) and page.', ...money }, site);
}
