import { eat } from './alerts.js';
// Plain alert objects for the API (no Markdown body; the update log is in `updates`)
export function plain(a, site) {
  const { body, slug, draft, ...rest } = a;
  return { ...rest, url: new URL(`/alerts/${a.id.toLowerCase()}/`, site).toString(), updates: body.split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean) };
}
export function shortText(list, site) {
  if (!list.length) return 'No active alerts in Nyamira County. Nyamira Daily.';
  return list.map((a) => `${a.level.toUpperCase()}: ${a.title}. ${a.advice ?? ''} Updated ${eat(a.updatedAt)}. ${new URL(`/alerts/${a.id.toLowerCase()}/`, site)}`.split('  ').join(' ')).join('\n\n');
}
