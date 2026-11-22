import { entries } from './content.js';
import { alertEvents } from './places.js';

// Latest living-data status override per alert id, keyed by the content entry id.
const statusOverrides = new Map();
for (const ev of alertEvents) {
  const id = ev.place.replace('alert:', '');
  const prev = statusOverrides.get(id);
  if (!prev || ev.observed_on > prev.observed_on) statusOverrides.set(id, ev);
}

function resolveStatus(entry) {
  const override = statusOverrides.get(entry.id);
  if (!override) return entry;
  if (override.observed_on <= entry.data.updatedAt.toISOString().slice(0, 10)) return entry;
  return {
    ...entry,
    data: {
      ...entry.data,
      status: override.value,
      updatedAt: new Date(override.observed_on),
      _statusSource: 'living',
    },
  };
}

export async function alertItems() {
  const raw = await entries('alerts');
  return raw.map(resolveStatus).sort((a, b) => b.data.updatedAt - a.data.updatedAt);
}
export function activeAlerts(list) { return list.filter((e) => e.data.status === 'active'); }
export function monitoringAlerts(list) { return list.filter((e) => e.data.status === 'monitoring'); }
export function resolvedAlerts(list) { return list.filter((e) => e.data.status === 'resolved'); }
export function emergencies(list) { return list.filter((e) => e.data.level === 'emergency'); }
export function disruptions(list) { return list.filter((e) => e.data.level === 'disruption'); }
export function notices(list) { return list.filter((e) => e.data.level === 'notice'); }
export const levelLabel = { emergency: 'Emergency', disruption: 'Disruption', notice: 'Notice' };
export const levelIcon = { emergency: '▲', disruption: '■', notice: '●' };
