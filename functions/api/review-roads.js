import {
  isJsonRequest,
  jsonResponse,
  readBoundedText,
  reviewItemLimit,
} from '../_shared/corrections.js';
import {
  publicConditionFromRows,
  purgeExpiredRoadConditions,
  readRoadDecision,
  roadSummary,
} from '../_shared/road-conditions.js';
import { requireReviewer } from './review.js';

// Same Access check and reviewer allowlist as corrections; only the cleanup differs.
function requireRoadReviewer(request, env) {
  return requireReviewer(request, env, purgeExpiredRoadConditions);
}

function bySubmission(rows) {
  const map = new Map();
  for (const row of rows || []) (map.get(row.submission_id) ?? map.set(row.submission_id, []).get(row.submission_id)).push(row);
  return map;
}

export async function onRequestGet({ request, env }) {
  try {
    const access = await requireRoadReviewer(request, env);
    if (access.response) return access.response;
    const recent = `
      SELECT id FROM road_condition_submissions
      ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
      LIMIT ?`;
    const result = await env.DB.prepare(`
      SELECT id, road_id, grade, observed_on, source_category, details, source_url, status,
        created_at, reviewed_at, review_note, public_grade, public_scope, public_observed_on,
        public_source_category, public_source_ref, public_evidence
      FROM road_condition_submissions
      ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
      LIMIT ?
    `).bind(reviewItemLimit).all();
    const checks = await env.DB.prepare(`
      SELECT submission_id, position, label, reported_status, public_label, public_status
      FROM road_condition_checks WHERE submission_id IN (${recent}) ORDER BY position
    `).bind(reviewItemLimit).all();
    const events = await env.DB.prepare(`
      SELECT submission_id, event_type, actor, note, created_at
      FROM road_condition_events WHERE submission_id IN (${recent}) ORDER BY created_at, id
    `).bind(reviewItemLimit).all();
    const checksBy = bySubmission(checks.results);
    const eventsBy = bySubmission(events.results);
    const items = (result.results || []).map((item) => ({
      ...item,
      road: roadSummary(item.road_id),
      checks: checksBy.get(item.id) || [],
      events: eventsBy.get(item.id) || [],
    }));
    return jsonResponse({ reviewer: access.email, items });
  } catch (error) {
    console.error('Road review list failed:', error);
    return jsonResponse({ error: 'The road review list could not be loaded.' }, 500);
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
  const parsed = readRoadDecision(body);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);

  try {
    const access = await requireRoadReviewer(request, env);
    if (access.response) return access.response;
    const { decision } = parsed;
    const accepted = decision.decision === 'accepted';
    // Check wording is written first, only while the report is still pending; the decision
    // itself is last, so the batch reports whether this reviewer made it.
    const stillPending = "EXISTS (SELECT 1 FROM road_condition_submissions WHERE id = ? AND status = 'pending')";
    const statements = accepted ? decision.checks.map((check) => env.DB.prepare(`
      UPDATE road_condition_checks SET public_label = ?, public_status = ?
      WHERE submission_id = ? AND position = ? AND ${stillPending}
    `).bind(check.label, check.status, id, check.position, id)) : [];
    statements.push(env.DB.prepare(`
      UPDATE road_condition_submissions
      SET status = ?, reviewed_at = datetime('now'), reviewer = ?, review_note = ?,
        public_grade = ?, public_scope = ?, public_observed_on = ?, public_source_category = ?,
        public_source_ref = ?, public_evidence = ?
      WHERE id = ? AND status = 'pending'
    `).bind(
      decision.decision,
      access.email,
      decision.note,
      accepted ? decision.grade : null,
      accepted ? decision.scope : null,
      accepted ? decision.observedOn : null,
      accepted ? decision.sourceCategory : null,
      accepted ? decision.sourceRef : null,
      accepted ? decision.evidence : null,
      id,
    ));
    const results = await env.DB.batch(statements);
    if (results.at(-1).meta?.changes !== 1) {
      return jsonResponse({ error: 'This report is no longer pending or does not exist. Reload the inbox.' }, 409);
    }
    return jsonResponse({ reviewed: true, status: decision.decision });
  } catch (error) {
    console.error('Road review update failed:', error);
    return jsonResponse({ error: 'The review decision could not be saved.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}

export async function exportAcceptedRoadConditions(db) {
  const result = await db.prepare(`
    SELECT id, road_id, reviewed_at, public_grade, public_scope, public_observed_on,
      public_source_category, public_source_ref, public_evidence
    FROM road_condition_submissions WHERE status = 'accepted' ORDER BY reviewed_at DESC
  `).all();
  const checks = await db.prepare(`
    SELECT c.submission_id, c.position, c.public_label, c.public_status
    FROM road_condition_checks c
    JOIN road_condition_submissions s ON s.id = c.submission_id
    WHERE s.status = 'accepted' AND c.public_label IS NOT NULL
  `).all();
  const checksBy = bySubmission(checks.results);
  const items = [];
  const skipped = [];
  for (const row of result.results || []) {
    const mapped = publicConditionFromRows(row, checksBy.get(row.id) || []);
    if (mapped.item) items.push(mapped.item);
    else skipped.push(mapped.skipped);
  }
  return { items, skipped };
}

export { requireRoadReviewer };
