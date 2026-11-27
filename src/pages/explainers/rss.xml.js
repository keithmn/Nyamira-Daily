import { entries } from '../../lib/content.js';

export async function GET({ site }) {
  const all = await entries('explainers');
  const items = all.sort((a, b) => b.data.updated - a.data.updated);
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gusii Daily Explainers</title>
    <link>${base}/watch/</link>
    <description>Plain-language explainers about Nyamira County's budget, spending, health and education figures.</description>
    <language>en</language>
    <atom:link href="${base}/explainers/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map((e) => `    <item>
      <title>${esc(e.data.title)}</title>
      <description>${esc(e.data.summary)}</description>
      <link>${base}/explainers/${e.id}/</link>
      <guid isPermaLink="true">${base}/explainers/${e.id}/</guid>
      <pubDate>${e.data.updated.toUTCString()}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
