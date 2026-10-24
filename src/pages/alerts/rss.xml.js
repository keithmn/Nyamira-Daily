import { getAlerts } from '../../lib/alerts-data.js';
import { levelLabel } from '../../lib/alerts.js';
const esc = (s) => String(s ?? '').split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
export async function GET({ site }) {
  const list = (await getAlerts()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const items = list.map((a) => {
    const url = new URL(`/alerts/${a.id.toLowerCase()}/`, site).toString();
    return `<item><title>${esc(`${levelLabel[a.level]}: ${a.title} (${a.status})`)}</title><link>${url}</link><guid isPermaLink="false">${esc(a.id)}-${new Date(a.updatedAt).getTime()}</guid><pubDate>${new Date(a.updatedAt).toUTCString()}</pubDate><description>${esc(a.summary + (a.advice ? ' What to do: ' + a.advice : ''))}</description></item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Nyamira Daily: alerts</title><link>${new URL('/alerts/', site)}</link><description>Emergencies, disruptions and public notices affecting Nyamira County.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
