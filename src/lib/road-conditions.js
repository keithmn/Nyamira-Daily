// Published road condition reports (decisions #55 and #57): validation, history and the latest
// grade per road. Conflicting grades on the newest date show as "Not sure", like facilities.
import { isDateOnly, isUtcTimestamp } from './facility-observations.js';

const grades = new Set(['good', 'fair', 'poor', 'impassable', 'unknown']);
const checkStatuses = new Set(['reported-yes', 'reported-no', 'unknown']);
const evidenceKinds = new Set(['verified', 'unverified']);

export const gradeLabel = { good: 'Good', fair: 'Fair', poor: 'Poor', impassable: 'Impassable', unknown: 'Not sure' };
export const gradeMeaning = {
  good: 'A car can use it easily, in dry and wet weather.',
  fair: 'Usable by car, but potholes, ruts or rough patches slow traffic.',
  poor: 'Hard to use by car: deep potholes, gullies or washed-out sections.',
  impassable: 'Vehicles could not get through when it was seen.',
  unknown: 'The reporter could not judge it.',
};
export const checkStatusLabel = { 'reported-yes': 'Yes', 'reported-no': 'No', unknown: 'Not sure' };

const newestFirst = (a, b) => b.observedOn.localeCompare(a.observedOn) || b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id);

export function validateRoadConditions(records, roads) {
  if (!Array.isArray(records)) throw new Error('Road condition reports must be an array.');
  const roadIds = new Set(roads.map((road) => road.id));
  const seen = new Set();
  for (const report of records) {
    for (const field of ['id', 'roadId', 'scope', 'source', 'sourceRef']) {
      if (typeof report?.[field] !== 'string' || !report[field].trim()) throw new Error(`Road report ${report?.id ?? '(missing ID)'} requires ${field}.`);
    }
    if (seen.has(report.id)) throw new Error(`Duplicate road report ID: ${report.id}.`);
    seen.add(report.id);
    if (!roadIds.has(report.roadId)) throw new Error(`Road report ${report.id} references unknown road ${report.roadId}.`);
    if (!grades.has(report.grade)) throw new Error(`Road report ${report.id} has an unsupported grade.`);
    if (!evidenceKinds.has(report.evidence)) throw new Error(`Road report ${report.id} has an unsupported evidence label.`);
    if (!isDateOnly(report.observedOn)) throw new Error(`Road report ${report.id} requires a valid observedOn date (YYYY-MM-DD).`);
    if (!isUtcTimestamp(report.reviewedAt) || !isUtcTimestamp(report.publishedAt)) {
      throw new Error(`Road report ${report.id} requires UTC reviewedAt and publishedAt timestamps.`);
    }
    if (Date.parse(report.reviewedAt) > Date.parse(report.publishedAt)) throw new Error(`Road report ${report.id} cannot be published before review.`);
    if (report.observedOn > report.publishedAt.slice(0, 10)) throw new Error(`Road report ${report.id} cannot be published before its observation date.`);
    if (!Array.isArray(report.checks) || report.checks.length > 3) throw new Error(`Road report ${report.id} needs a checks list of at most 3.`);
    for (const check of report.checks) {
      if (typeof check?.label !== 'string' || !check.label.trim() || !checkStatuses.has(check.status)) {
        throw new Error(`Road report ${report.id} has an invalid check.`);
      }
    }
  }
  return [...records].sort(newestFirst);
}

export function conditionsForRoad(records, roadId) {
  return records.filter((report) => report.roadId === roadId).sort(newestFirst);
}

export function latestRoadCondition(records, roadId) {
  const history = conditionsForRoad(records, roadId);
  if (!history.length) return null;
  const observedOn = history[0].observedOn;
  const reports = history.filter((report) => report.observedOn === observedOn);
  const distinct = new Set(reports.map((report) => report.grade));
  return { observedOn, grade: distinct.size === 1 ? reports[0].grade : 'unknown', conflict: distinct.size > 1, reports };
}
