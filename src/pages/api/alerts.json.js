import { getAlerts } from '../../lib/alerts-data.js';
import { plain } from '../../lib/alerts-api.js';
import { json } from '../../lib/api.js';
export async function GET({ site }) {
  return json({ description: 'All alerts and incidents, current and past.', alerts: (await getAlerts()).map((a) => plain(a, site)) }, site);
}
