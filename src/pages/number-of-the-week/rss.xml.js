import { getNumbers } from '../../lib/numbers.js';

export async function GET({ site }) {
  const all = await getNumbers();
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nyamira Daily Number of the Week</title>
    <link>${base}/number-of-the-week/</link>
    <description>A key figure about Nyamira County each week, with its source and what it means.</description>
    <language>en</language>
    <atom:link href="${base}/number-of-the-week/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${all.map((n) => `    <item>
      <title>${esc(n.data.figure + ' — ' + n.data.sentence)}</title>
      <description>${esc(n.data.explanation)}</description>
      <link>${base}/number-of-the-week/#${n.id}</link>
      <guid isPermaLink="false">${n.id}</guid>
      <pubDate>${n.data.week.toUTCString()}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
