import facilityRecords from '../../src/data/facilities.json' with { type: 'json' };
import { nairobiDate, validIsoDate, validSourceUrl } from './corrections.js';

const STATUSES = new Set(['reported-available', 'reported-unavailable', 'unknown']);
// Public attribution is the source category, never the reporter's name (decision #47).
const SOURCE_CATEGORIES = new Map([
  ['resident', 'Resident report'],
  ['field-reporter', 'Nyamira Daily field reporter'],
]);
// A reader report is either checked by an editor (verified) or not (unverified);
// "official" and "audit" describe government and Auditor-General sources instead.
const INTAKE_EVIDENCE = new Set(['verified', 'unverified']);
const facilityById = new Map(facilityRecords.map((facility) => [facility.id, facility]));

export const facilitySubmissionsPerHour = 10;
export const facilityFormFields = [
  'facility', 'capability', 'status', 'observedOn', 'sourceCategory',
  'details', 'source', 'website', 'cf-turnstile-response',
];

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function facilitySummary(id) {
  const facility = facilityById.get(id);
  return facility ? { name: facility.name, category: facility.category, ward: facility.ward } : null;
}

export function readFacilityObservation(fields, today = nairobiDate()) {
  const facility = facilityById.get(fields.facility);
  if (!facility) return { error: 'Choose a facility listed on Nyamira Daily.' };
  const capability = clean(fields.capability);
  if (capability.length < 2 || capability.length > 120) {
    return { error: 'Describe what you checked in 2–120 characters.' };
  }
  if (!STATUSES.has(fields.status)) return { error: 'Choose what you found, or choose “Not sure”.' };
  if (!validIsoDate(fields.observedOn) || fields.observedOn > today) {
    return { error: 'Enter the date you saw this. It cannot be in the future.' };
  }
  if (!SOURCE_CATEGORIES.has(fields.sourceCategory)) return { error: 'Choose who is reporting.' };
  if (fields.details.length > 2_000) return { error: 'Keep the extra detail under 2,000 characters.' };
  const source = validSourceUrl(fields.source, { optional: true });
  if (fields.source && !source) return { error: 'The source link must be a valid HTTPS URL.' };
  return {
    observation: {
      facilityId: facility.id,
      capability,
      status: fields.status,
      observedOn: fields.observedOn,
      sourceCategory: fields.sourceCategory,
      details: fields.details || null,
      source,
    },
  };
}

export function readFacilityDecision(value, today = nairobiDate()) {
  if (!value || typeof value !== 'object') return { error: 'Review details are required.' };
  const { decision } = value;
  const note = clean(value.note);
  if (!['accepted', 'rejected'].includes(decision)) return { error: 'Choose accept or reject.' };
  if (note.length < 3 || note.length > 1_000) return { error: 'Add a short review note.' };
  if (decision === 'rejected') return { decision: { decision, note } };

  const capability = clean(value.capability);
  const scope = clean(value.scope);
  const sourceRef = clean(value.sourceRef);
  const { observationStatus, observedOn, sourceCategory, evidence } = value;
  if (capability.length < 2 || capability.length > 120) return { error: 'Give the public capability label in 2–120 characters.' };
  if (!STATUSES.has(observationStatus)) return { error: 'Choose the reported status to publish.' };
  if (scope.length < 3 || scope.length > 300) return { error: 'Describe what the observation covers (its scope).' };
  if (!validIsoDate(observedOn) || observedOn > today) return { error: 'Accepted reports need the date it was observed.' };
  if (!SOURCE_CATEGORIES.has(sourceCategory)) return { error: 'Choose the public source category.' };
  if (sourceRef.length < 3 || sourceRef.length > 300) return { error: 'Add a public source reference without personal names.' };
  if (!INTAKE_EVIDENCE.has(evidence)) return { error: 'Choose verified (an editor checked it) or unverified.' };
  return {
    decision: { decision, note, capability, observationStatus, scope, observedOn, sourceCategory, sourceRef, evidence },
  };
}

// Builds the record kept in src/data/facility-observations.json, minus
// publishedAt, which is stamped when the record is added to the public data.
export function publicObservationFromRow(row) {
  const facility = facilityById.get(row.facility_id);
  if (!facility) {
    return { skipped: { reference: row.id, reason: `Facility ${row.facility_id} is not in the current registry.` } };
  }
  const reviewedAt = new Date(`${row.reviewed_at.replace(' ', 'T')}Z`);
  if (Number.isNaN(reviewedAt.valueOf())) throw new Error('Accepted facility report has an invalid review timestamp.');
  return {
    item: {
      id: `fo-${row.id}`,
      facilityId: facility.id,
      category: facility.category,
      capability: row.public_capability,
      scope: row.public_scope,
      status: row.public_status,
      observedOn: row.public_observed_on,
      source: SOURCE_CATEGORIES.get(row.public_source_category),
      sourceRef: row.public_source_ref,
      evidence: row.public_evidence,
      reviewedAt: reviewedAt.toISOString().replace(/\.000Z$/, 'Z'),
    },
  };
}

export async function purgeExpiredFacilityObservations(db, retentionDays) {
  const age = `-${retentionDays} days`;
  const expired = "status != 'accepted' AND created_at < datetime('now', ?)";
  await db.prepare(`
    DELETE FROM facility_observation_events
    WHERE submission_id IN (SELECT id FROM facility_observation_submissions WHERE ${expired})
  `).bind(age).run();
  await db.prepare(`DELETE FROM facility_observation_submissions WHERE ${expired}`).bind(age).run();
  // Accepted reports keep their reviewed public fields so the public history can
  // still be exported; the reporter's own words and link are removed.
  await db.prepare(`
    UPDATE facility_observation_submissions SET details = NULL, source_url = NULL
    WHERE status = 'accepted' AND created_at < datetime('now', ?)
      AND (details IS NOT NULL OR source_url IS NOT NULL)
  `).bind(age).run();
  await db.prepare(
    "DELETE FROM facility_observation_rate_limits WHERE window_started < datetime('now', '-1 hour')",
  ).run();
}
