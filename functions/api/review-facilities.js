import {
  isJsonRequest,
  jsonResponse,
  readBoundedText,
  reviewItemLimit,
} from '../_shared/corrections.js';
import {
  facilitySummary,
  publicObservationFromRow,
  purgeExpiredFacilityObservations,
  readFacilityDecision,
} from '../_shared/facility-observations.js';
import { requireReviewer } from './review.js';

// Same Access check and reviewer allowlist as corrections; only the cleanup differs.
function requireFacilityReviewer(request, env) {
  return requireReviewer(request, env, purgeExpiredFacilityObservations);
}

export async function onRequestGet({ request, env }) {
  try {
    const access = await requireFacilityReviewer(request, env);
    if (access.response) return access.response;
    const result = await env.DB.prepare(`
      SELECT id, facility_id, capability, reported_status, observed_on, source_category,
        details, source_url, status, created_at, reviewed_at, review_note,
        public_capability, public_status, public_scope, public_observed_on,
        public_source_category, public_source_ref, public_evidence
      FROM facility_observation_submissions
      ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
      LIMIT ?
    `).bind(reviewItemLimit).all();
    const events = await env.DB.prepare(`
      SELECT submission_id, event_type, actor, note, created_at
      FROM facility_observation_events
      WHERE submission_id IN (
        SELECT id FROM facility_observation_submissions
        ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
        LIMIT ?
      )
      ORDER BY created_at, id
    `).bind(reviewItemLimit).all();
    const eventsBySubmission = new Map();
    for (const event of events.results || []) {
      const history = eventsBySubmission.get(event.submission_id) || [];
      history.push(event);
      eventsBySubmission.set(event.submission_id, history);
    }
    const items = (result.results || []).map((item) => ({
      ...item,
      facility: facilitySummary(item.facility_id),
      events: eventsBySubmission.get(item.id) || [],
    }));
    return jsonResponse({ reviewer: access.email, items });
  } catch (error) {
    console.error('Facility review list failed:', error);
    return jsonResponse({ error: 'The facility review list could not be loaded.' }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  if (!isJsonRequest(request)) return jsonResponse({ error: 'Send review details as JSON.' }, 415);
  let body;
  try {
    const text = await readBoundedText(request, 8_192);
    if (text === null) return jsonResponse({ error: 'Review details are too large.' }, 413);
    body = JSON.parse(text);
  } catch {
    return jsonResponse({ error: 'Review details are not valid JSON.' }, 400);
  }
  const { id } = body || {};
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
    return jsonResponse({ error: 'A valid report ID is required.' }, 400);
  }
  const parsed = readFacilityDecision(body);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);

  try {
    const access = await requireFacilityReviewer(request, env);
    if (access.response) return access.response;
    const { decision } = parsed;
    const accepted = decision.decision === 'accepted';
    const result = await env.DB.prepare(`
      UPDATE facility_observation_submissions
      SET status = ?, reviewed_at = datetime('now'), reviewer = ?, review_note = ?,
        public_capability = ?, public_status = ?, public_scope = ?, public_observed_on = ?,
        public_source_category = ?, public_source_ref = ?, public_evidence = ?
      WHERE id = ? AND status = 'pending'
    `).bind(
      decision.decision,
      access.email,
      decision.note,
      accepted ? decision.capability : null,
      accepted ? decision.observationStatus : null,
      accepted ? decision.scope : null,
      accepted ? decision.observedOn : null,
      accepted ? decision.sourceCategory : null,
      accepted ? decision.sourceRef : null,
      accepted ? decision.evidence : null,
      id,
    ).run();
    if (result.meta?.changes !== 1) {
      return jsonResponse({ error: 'This report is no longer pending or does not exist. Reload the inbox.' }, 409);
    }
    return jsonResponse({ reviewed: true, status: decision.decision });
  } catch (error) {
    console.error('Facility review update failed:', error);
    return jsonResponse({ error: 'The review decision could not be saved.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}

export async function exportAcceptedFacilityObservations(db) {
  const result = await db.prepare(`
    SELECT id, facility_id, reviewed_at, public_capability, public_status, public_scope,
      public_observed_on, public_source_category, public_source_ref, public_evidence
    FROM facility_observation_submissions
    WHERE status = 'accepted'
    ORDER BY reviewed_at DESC
  `).all();
  const items = [];
  const skipped = [];
  for (const row of result.results || []) {
    const mapped = publicObservationFromRow(row);
    if (mapped.item) items.push(mapped.item);
    else skipped.push(mapped.skipped);
  }
  return { items, skipped };
}

export { requireFacilityReviewer };
