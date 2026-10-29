import roadData from '../../src/data/roads.json' with { type: 'json' };
import { nairobiDate, validIsoDate, validSourceUrl } from './corrections.js';
import { clean, INTAKE_EVIDENCE, SOURCE_CATEGORIES } from './facility-observations.js';

const GRADES = new Set(['good', 'fair', 'poor', 'impassable', 'unknown']);
const CHECK_STATUSES = new Set(['reported-yes', 'reported-no', 'unknown']);
const POSITIONS = [1, 2, 3];
const roadById = new Map(roadData.roads.map((road) => [road.id, road]));

export const roadSubmissionsPerHour = 10;
export const roadFormFields = [
  'road', 'grade', 'observedOn', 'sourceCategory',
  ...POSITIONS.flatMap((n) => [`check${n}`, `check${n}Status`]),
  'details', 'source', 'website', 'cf-turnstile-response',
];

// A road merged into another keeps working: retired IDs resolve to the road that replaced them.
function currentRoad(id) {
  return roadById.get(id) ?? roadById.get(roadData.retired[id]) ?? null;
}

export function roadSummary(id) {
  const road = currentRoad(id);
  return road ? { id: road.id, name: road.name, wards: road.wards } : null;
}

function readChecks(values) {
  const checks = [];
  for (const position of POSITIONS) {
    const label = clean(values[`check${position}`]);
    const status = values[`check${position}Status`] || '';
    if (!label && !status) continue;
    if (label.length < 2 || label.length > 120) return { error: `Describe check ${position} in 2–120 characters, or clear its answer.` };
    if (!CHECK_STATUSES.has(status)) return { error: `Choose Yes, No or Not sure for check ${position}.` };
    checks.push({ position, label, status });
  }
  return { checks };
}

export function readRoadReport(fields, today = nairobiDate()) {
  const road = currentRoad(fields.road);
  if (!road) return { error: 'Choose a road listed on Nyamira Daily.' };
  if (!GRADES.has(fields.grade)) return { error: 'Choose the road\'s condition, or choose "Not sure".' };
  if (!validIsoDate(fields.observedOn) || fields.observedOn > today) {
    return { error: 'Enter the date you saw this. It cannot be in the future.' };
  }
  if (!SOURCE_CATEGORIES.has(fields.sourceCategory)) return { error: 'Choose who is reporting.' };
  const { checks, error } = readChecks(fields);
  if (error) return { error };
  if (fields.details.length > 2_000) return { error: 'Keep the extra detail under 2,000 characters.' };
  const source = validSourceUrl(fields.source, { optional: true });
  if (fields.source && !source) return { error: 'The source link must be a valid HTTPS URL.' };
  return {
    report: { roadId: road.id, grade: fields.grade, observedOn: fields.observedOn,
      sourceCategory: fields.sourceCategory, details: fields.details || null, source, checks },
  };
}

// Accepting sets every public field. A check whose public label is left empty is not published.
export function readRoadDecision(value, today = nairobiDate()) {
  if (!value || typeof value !== 'object') return { error: 'Review details are required.' };
  const { decision } = value;
  const note = clean(value.note);
  if (!['accepted', 'rejected'].includes(decision)) return { error: 'Choose accept or reject.' };
  if (note.length < 3 || note.length > 1_000) return { error: 'Add a short review note.' };
  if (decision === 'rejected') return { decision: { decision, note } };

  const scope = clean(value.scope);
  const sourceRef = clean(value.sourceRef);
  const { grade, observedOn, sourceCategory, evidence } = value;
  if (!GRADES.has(grade)) return { error: 'Choose the grade to publish.' };
  if (scope.length < 3 || scope.length > 300) return { error: 'Describe what the report covers (its scope).' };
  if (!validIsoDate(observedOn) || observedOn > today) return { error: 'Accepted reports need the date it was observed.' };
  if (!SOURCE_CATEGORIES.has(sourceCategory)) return { error: 'Choose the public source category.' };
  if (sourceRef.length < 3 || sourceRef.length > 300) return { error: 'Add a public source reference without personal names.' };
  if (!INTAKE_EVIDENCE.has(evidence)) return { error: 'Choose verified (an editor checked it) or unverified.' };
  const checks = [];
  for (const position of POSITIONS) {
    const label = clean(value[`check${position}`]);
    const status = value[`check${position}Status`] || '';
    if (!label) continue;
    if (label.length < 2 || label.length > 120) return { error: `Give check ${position} a public label of 2–120 characters, or leave it empty to drop it.` };
    if (!CHECK_STATUSES.has(status)) return { error: `Choose the status to publish for check ${position}.` };
    checks.push({ position, label, status });
  }
  return { decision: { decision, note, grade, scope, observedOn, sourceCategory, sourceRef, evidence, checks } };
}

// The record kept in src/data/road-conditions.json, minus publishedAt (stamped on import).
export function publicConditionFromRows(row, checkRows) {
  const road = currentRoad(row.road_id);
  if (!road) return { skipped: { reference: row.id, reason: `Road ${row.road_id} is not in the current registry.` } };
  const reviewedAt = new Date(`${row.reviewed_at.replace(' ', 'T')}Z`);
  if (Number.isNaN(reviewedAt.valueOf())) throw new Error('Accepted road report has an invalid review timestamp.');
  return {
    item: {
      id: `rc-${row.id}`,
      roadId: road.id,
      grade: row.public_grade,
      scope: row.public_scope,
      observedOn: row.public_observed_on,
      source: SOURCE_CATEGORIES.get(row.public_source_category),
      sourceRef: row.public_source_ref,
      evidence: row.public_evidence,
      reviewedAt: reviewedAt.toISOString().replace(/\.000Z$/, 'Z'),
      checks: checkRows.filter((c) => c.public_label).sort((a, b) => a.position - b.position)
        .map((c) => ({ label: c.public_label, status: c.public_status })),
    },
  };
}

export async function purgeExpiredRoadConditions(db, retentionDays) {
  const age = `-${retentionDays} days`;
  const expired = "SELECT id FROM road_condition_submissions WHERE status != 'accepted' AND created_at < datetime('now', ?)";
  await db.prepare(`DELETE FROM road_condition_events WHERE submission_id IN (${expired})`).bind(age).run();
  await db.prepare(`DELETE FROM road_condition_checks WHERE submission_id IN (${expired})`).bind(age).run();
  await db.prepare(`DELETE FROM road_condition_submissions WHERE id IN (${expired})`).bind(age).run();
  // Accepted reports keep their reviewed public fields; the reporter's own words and link go.
  await db.prepare(`
    UPDATE road_condition_submissions SET details = NULL, source_url = NULL
    WHERE status = 'accepted' AND created_at < datetime('now', ?)
      AND (details IS NOT NULL OR source_url IS NOT NULL)
  `).bind(age).run();
  await db.prepare("DELETE FROM road_condition_rate_limits WHERE window_started < datetime('now', '-1 hour')").run();
}
