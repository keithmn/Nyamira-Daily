import { alertItems, activeAlerts } from '../../lib/alerts.js';
import { json } from '../../lib/api.js';

export async function GET({ site }) {
  const active = activeAlerts(await alertItems());
  return json({
    description: 'Active alerts only: incidents and disruptions currently affecting Nyamira County.',
    total: active.length,
    alerts: active.map((e) => {
      const d = e.data;
      return {
        id: e.id, type: d.type, level: d.level, title: d.title, summary: d.summary,
        wards: d.wards, place: d.place ?? null,
        lat: d.lat ?? null, lon: d.lon ?? null,
        startedAt: d.startedAt.toISOString().slice(0, 10),
        updatedAt: d.updatedAt.toISOString().slice(0, 10),
        evidenceLabel: d.evidenceLabel, advice: d.advice ?? null,
        contacts: d.contacts.map((c) => ({ name: c.name, role: c.role ?? null, phone: c.phone ?? null })),
        sources: d.sources.map((s) => ({ name: s.name, url: s.url || undefined })),
      };
    }),
  }, site);
}
