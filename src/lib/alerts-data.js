// Loads published alerts as plain objects (used by pages, maps, banners and the API).
import { entries } from './content.js';
import { levelOf, sortAlerts } from './alerts.js';
import { isLiveAlert } from './alert-state.js';
export async function getAlerts() {
  const list = (await entries('alerts')).map((e) => ({ ...e.data, slug: e.id, body: e.body ?? '', level: levelOf(e.data) }));
  return sortAlerts(list);
}
export const isLive = isLiveAlert;
