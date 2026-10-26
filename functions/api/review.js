import {
  acceptedCorrectionFromRow,
  authorizeReviewer,
  isJsonRequest,
  jsonResponse,
  purgeExpired,
  readBoundedText,
  readRetentionDays,
  readReviewDecision,
  reviewItemLimit,
} from '../_shared/corrections.js';

async function requireReviewer(request, env) {
  if (!env.DB) return { response: jsonResponse({ error: 'Review database is not configured.' }, 503) };
  const retentionDays = readRetentionDays(env.CORRECTION_RETENTION_DAYS);
  if (retentionDays === null) {
    return { response: jsonResponse({ error: 'Correction retention is not configured.' }, 503) };
  }
  const email = await authorizeReviewer(request, env);
  if (!email) return { response: jsonResponse({ error: 'Reviewer access is required.' }, 401) };
  await purgeExpired(env.DB, retentionDays);
  return { email };
}

export async function onRequestGet({ request, env }) {
  try {
    const access = await requireReviewer(request, env);
    if (access.response) return access.response;
    const result = await env.DB.prepare(`
      SELECT id, page_path, details, source_url, status, created_at,
        reviewed_at, review_note, public_page, public_changed, public_reason,
        public_source, public_source_date
      FROM correction_submissions
      ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
      LIMIT ?
    `).bind(reviewItemLimit).all();
    const events = await env.DB.prepare(`
      SELECT submission_id, event_type, actor, note, created_at
      FROM correction_events
      WHERE submission_id IN (
        SELECT id FROM correction_submissions
        ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
        LIMIT ?
      )
      ORDER BY created_at
    `).bind(reviewItemLimit).all();
    const eventsBySubmission = new Map();
    for (const event of events.results || []) {
      const history = eventsBySubmission.get(event.submission_id) || [];
      history.push(event);
      eventsBySubmission.set(event.submission_id, history);
    }
    const items = (result.results || []).map((item) => ({
      ...item,
      events: eventsBySubmission.get(item.id) || [],
    }));
    return jsonResponse({ reviewer: access.email, items });
  } catch (error) {
    console.error('Correction review list failed:', error);
    return jsonResponse({ error: 'The review list could not be loaded.' }, 500);
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
    return jsonResponse({ error: 'A valid submission ID is required.' }, 400);
  }
  const parsed = readReviewDecision(body);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);

  try {
    const access = await requireReviewer(request, env);
    if (access.response) return access.response;
    const { decision } = parsed;
    const update = env.DB.prepare(`
      UPDATE correction_submissions
      SET status = ?, reviewed_at = datetime('now'), reviewer = ?, review_note = ?,
        public_page = ?, public_changed = ?, public_reason = ?, public_source = ?,
        public_source_date = ?
      WHERE id = ? AND status = 'pending'
    `).bind(
      decision.status,
      access.email,
      decision.note,
      decision.status === 'accepted' ? decision.page : null,
      decision.status === 'accepted' ? decision.changed : null,
      decision.status === 'accepted' ? decision.reason : null,
      decision.status === 'accepted' ? decision.source : null,
      decision.status === 'accepted' ? decision.sourceDate : null,
      id,
    );
    const result = await update.run();
    if (result.meta?.changes !== 1) {
      return jsonResponse({ error: 'This item is no longer pending or does not exist. Reload the inbox.' }, 409);
    }
    return jsonResponse({ reviewed: true, status: decision.status });
  } catch (error) {
    console.error('Correction review update failed:', error);
    return jsonResponse({ error: 'The review decision could not be saved.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}

export async function exportAcceptedCorrections(db) {
  const result = await db.prepare(`
    SELECT reviewed_at, public_page, public_changed, public_reason,
      public_source, public_source_date
    FROM correction_submissions
    WHERE status = 'accepted'
      AND public_page IS NOT NULL
      AND public_changed IS NOT NULL
      AND public_reason IS NOT NULL
      AND public_source IS NOT NULL
      AND public_source_date IS NOT NULL
    ORDER BY reviewed_at DESC
  `).all();
  return { items: (result.results || []).map(acceptedCorrectionFromRow) };
}

export { requireReviewer };
