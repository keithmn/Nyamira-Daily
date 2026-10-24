// Alerts and incidents (spec item 1.8; rules in docs/EDITORIAL_RULES.md section 11).
// Levels: emergency (red triangle), disruption (amber square), notice (blue circle).
// Shapes as well as colours, so levels are told apart without colour and in black-and-white print.
import geo from '../data/geo.json';

export const alertTypes = {
  emergency: ['fire', 'flood', 'landslide', 'building collapse', 'disease outbreak', 'major accident', 'storm or hail damage'],
  disruption: ['road closure', 'bridge out', 'power outage', 'water outage', 'health facility closure', 'service strike'],
  notice: ['vaccination campaign', 'health campaign', 'county notice', 'weather advisory', 'public forum', 'exam period'],
};
export const levels = ['emergency', 'disruption', 'notice'];
export const levelLabel = { emergency: 'Emergency', disruption: 'Disruption', notice: 'Notice' };
export const statusLabel = { active: 'Active', monitoring: 'Monitoring', resolved: 'Resolved' };
export const STALE_HOURS = 72;

export function levelOf(a) {
  return a.level ?? levels.find((l) => alertTypes[l].includes(a.type)) ?? 'notice';
}
export function isStale(a, now = Date.now()) {
  return a.status === 'active' && now - new Date(a.updatedAt).getTime() > STALE_HOURS * 36e5;
}
// Map units from longitude/latitude (same projection as scripts/build-geo.py)
export function project(lon, lat) {
  const p = geo.proj;
  return [(lon - p.minx) * p.k * p.sc, (p.maxy - lat) * p.sc];
}
// Where an alert sits on the county map: its coordinates, or its first ward's centre (approximate).
// County-wide alerts (no wards, no coordinates) are not placed on the map.
export function placeOf(a) {
  if (a.lat != null && a.lon != null) { const [x, y] = project(a.lon, a.lat); return { x, y, approx: false }; }
  const w = a.wards[0] && geo.wards[a.wards[0]];
  return w ? { x: Number(w.cx), y: Number(w.cy), approx: true } : null;
}
// SVG path for a level's shape, centred on x, y with radius r
export function shapePath(level, x, y, r) {
  if (level === 'emergency') { const h = r * 1.15; return `M${x} ${y - h}L${x + h} ${y + h * 0.8}H${x - h}Z`; }
  if (level === 'disruption') return `M${x - r} ${y - r}h${2 * r}v${2 * r}h${-2 * r}Z`;
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}
// Sort: active first, then emergencies, disruptions, notices, then newest update first
const rank = { active: 0, monitoring: 1, resolved: 2 };
export function sortAlerts(list) {
  return [...list].sort((a, b) => rank[a.status] - rank[b.status] || levels.indexOf(a.level) - levels.indexOf(b.level) || new Date(b.updatedAt) - new Date(a.updatedAt));
}
export function eat(d) {
  return new Date(d).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
