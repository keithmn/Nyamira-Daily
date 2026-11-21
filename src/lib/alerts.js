import { entries } from './content.js';

export async function alertItems() {
  return (await entries('alerts')).sort((a, b) => b.data.updatedAt - a.data.updatedAt);
}
export function activeAlerts(list) { return list.filter((e) => e.data.status === 'active'); }
export function monitoringAlerts(list) { return list.filter((e) => e.data.status === 'monitoring'); }
export function resolvedAlerts(list) { return list.filter((e) => e.data.status === 'resolved'); }
export function emergencies(list) { return list.filter((e) => e.data.level === 'emergency'); }
export function disruptions(list) { return list.filter((e) => e.data.level === 'disruption'); }
export function notices(list) { return list.filter((e) => e.data.level === 'notice'); }
export const levelLabel = { emergency: 'Emergency', disruption: 'Disruption', notice: 'Notice' };
export const levelIcon = { emergency: '▲', disruption: '■', notice: '●' };
