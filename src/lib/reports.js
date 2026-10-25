// Community reports (Phase 2): only reports our team has checked (checkedOn set) are shown,
// only the latest per place, and anything reported more than 90 days ago is flagged "may be out of date".
import R from '../data/reports.json';
import { summariseClinicChecks } from './report-summary.js';
export const categories = {
  water: 'Water point', health: 'Dispensary or health centre', streetlight: 'Streetlight',
  road: 'Road or bridge', market: 'Market facility', clinic: 'Clinic check',
};
export const statuses = ['working', 'partly', 'not working', 'closed', 'unknown'];
const plural = { water: 'water points', health: 'dispensaries or health centres', streetlight: 'streetlights', road: 'roads or bridges', market: 'market facilities' };
export const statusText = { working: 'working', partly: 'partly working', 'not working': 'not working', closed: 'closed', unknown: 'not sure or could not check' };
const OLD_DAYS = 90;
export function latest(today = new Date()) {
  const by = new Map();
  for (const r of R.reports) {
    if (!r.checkedOn) continue;
    const k = `${r.ward}|${r.category}|${r.place.trim().toLowerCase()}`;
    const prev = by.get(k);
    if (!prev || r.reportedOn > prev.reportedOn) by.set(k, r);
  }
  return [...by.values()].map((r) => ({ ...r, old: (today - new Date(r.reportedOn)) / 864e5 > OLD_DAYS }));
}
// "3 water points reported not working (1 verified)"
export function summarise(list) {
  const out = [];
  for (const [c, label] of Object.entries(categories)) {
    if (c === 'clinic') continue;
    const inCat = list.filter((r) => r.category === c);
    for (const s of statuses) {
      const rs = inCat.filter((r) => r.status === s);
      if (!rs.length) continue;
      const v = rs.filter((r) => r.evidenceLabel === 'verified').length;
      out.push({ category: c, status: s, n: rs.length, verified: v, text: `${rs.length} ${rs.length === 1 ? label.toLowerCase() : plural[c]} reported ${statusText[s]}${v ? ` (${v} verified)` : ''}` });
    }
  }
  return out;
}
export const reportsUpdated = R.updated;

// Clinic checks: every checked report from the last 90 days, grouped by facility
export function clinicSummary(ward, today = new Date()) {
  const rs = R.reports.filter((r) => r.category === 'clinic' && r.checkedOn && (!ward || r.ward === ward) && (today - new Date(r.reportedOn)) / 864e5 <= OLD_DAYS);
  return summariseClinicChecks(rs);
}
