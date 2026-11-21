import { alertItems, activeAlerts, monitoringAlerts, levelLabel } from '../../lib/alerts.js';

export async function GET({ site }) {
  const all = await alertItems();
  const current = [...activeAlerts(all), ...monitoringAlerts(all)];
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const items = current.map((e) => {
    const d = e.data;
    return `    <item>
      <title>${esc(d.title)}</title>
      <description>${esc(d.summary)} [${levelLabel[d.level]}${d.wards.length ? ' — ' + d.wards.join(', ') : ''}]</description>
      <link>${base}/alerts/${e.id}/</link>
      <guid isPermaLink="true">${base}/alerts/${e.id}/</guid>
      <pubDate>${d.startedAt.toUTCString()}</pubDate>
      <category>${levelLabel[d.level]}</category>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nyamira Daily Alerts</title>
    <link>${base}/alerts/</link>
    <description>Confirmed incidents and public notices affecting Nyamira County.</description>
    <language>en</language>
    <atom:link href="${base}/alerts/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
