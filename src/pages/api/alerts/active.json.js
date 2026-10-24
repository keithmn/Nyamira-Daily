import { getAlerts } from '../../../lib/alerts-data.js';
import { plain } from '../../../lib/alerts-api.js';
import { json } from '../../../lib/api.js';
export async function GET({ site }) {
  return json({ description: 'Active alerts only.', alerts: (await getAlerts()).filter((a) => a.status === 'active').map((a) => plain(a, site)) }, site);
}
