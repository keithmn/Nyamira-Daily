// TODO(service): a WhatsApp Channel or SMS broadcast reads this file to send red alerts.
import { getAlerts } from '../../../lib/alerts-data.js';
import { shortText } from '../../../lib/alerts-api.js';
import { text } from '../../../lib/api.js';
export async function GET({ site }) {
  return text(shortText((await getAlerts()).filter((a) => a.status === 'active'), site));
}
