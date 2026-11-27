import { alertItems } from '../../lib/alerts.js';
import { json } from '../../lib/api.js';

export async function GET({ site }) {
  const all = await alertItems();
  return json({
    description: 'All alerts and incidents recorded by Gusii Daily, newest first.',
    total: all.length,
    alerts: all.map(fmt),
  }, site);
}

function fmt(e) {
  const d = e.data;
  return {
    id: e.id, type: d.type, level: d.level, title: d.title, summary: d.summary,
    status: d.status, wards: d.wards, place: d.place ?? null,
    lat: d.lat ?? null, lon: d.lon ?? null,
    startedAt: d.startedAt.toISOString().slice(0, 10),
    updatedAt: d.updatedAt.toISOString().slice(0, 10),
    resolvedAt: d.resolvedAt?.toISOString().slice(0, 10) ?? null,
    evidenceLabel: d.evidenceLabel,
    sources: d.sources.map((s) => ({ name: s.name, url: s.url || undefined })),
  };
}
