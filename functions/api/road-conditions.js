import {
  consumeSubmissionLimit,
  jsonResponse,
  readFormFields,
  readRetentionDays,
  sameOrigin,
  verifyTurnstile,
} from '../_shared/corrections.js';
import {
  purgeExpiredRoadConditions,
  readRoadReport,
  roadFormFields,
  roadSubmissionsPerHour,
} from '../_shared/road-conditions.js';

export async function onRequestPost({ request, env }) {
  if (env.ROAD_INTAKE_ENABLED !== 'true') {
    return jsonResponse({ error: 'Road condition reports are not enabled.' }, 503);
  }
  const retentionDays = readRetentionDays(env.CORRECTION_RETENTION_DAYS);
  if (!env.DB || !env.TURNSTILE_SECRET_KEY || !env.CORRECTION_RATE_SALT ||
      !env.CORRECTION_SITE_ORIGIN || !env.CORRECTION_SITE_HOST || retentionDays === null) {
    return jsonResponse({ error: 'Road report intake is not fully configured.' }, 503);
  }
  if (request.method !== 'POST' || !sameOrigin(request, env.CORRECTION_SITE_ORIGIN)) {
    return jsonResponse({ error: 'This request is not allowed.' }, 403);
  }

  let submission;
  try {
    submission = await readFormFields(request, roadFormFields);
  } catch {
    return jsonResponse({ error: 'Could not read the report. Check the form and try again.' }, 400);
  }
  if (submission.error) return jsonResponse({ error: submission.error }, 400);
  const { fields } = submission;
  if (fields.website) return jsonResponse({ error: 'The report could not be accepted.' }, 400);
  const parsed = readRoadReport(fields);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);
  if (!fields['cf-turnstile-response']) {
    return jsonResponse({ error: 'Complete the anti-spam check before submitting.' }, 400);
  }

  const clientIp = request.headers.get('cf-connecting-ip');
  if (!clientIp) return jsonResponse({ error: 'The trusted client address is unavailable.' }, 503);

  try {
    await purgeExpiredRoadConditions(env.DB, retentionDays);
    if (!(await verifyTurnstile(fields['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, env.CORRECTION_SITE_HOST))) {
      return jsonResponse({ error: 'The anti-spam check did not pass. Try again.' }, 400);
    }
    const withinLimit = await consumeSubmissionLimit(env.DB, clientIp, env.CORRECTION_RATE_SALT, {
      table: 'road_condition_rate_limits',
      perHour: roadSubmissionsPerHour,
    });
    if (withinLimit === null) return jsonResponse({ error: 'Submission protection is not configured.' }, 503);
    if (!withinLimit) return jsonResponse({ error: 'Too many reports. Please try again later.' }, 429);

    const id = crypto.randomUUID();
    const { report } = parsed;
    await env.DB.batch([
      env.DB.prepare(`
      INSERT INTO road_condition_submissions
        (id, road_id, grade, observed_on, source_category, details, source_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `).bind(id, report.roadId, report.grade, report.observedOn, report.sourceCategory, report.details, report.source),
      ...report.checks.map((check) => env.DB.prepare(`
      INSERT INTO road_condition_checks (submission_id, position, label, reported_status)
      VALUES (?, ?, ?, ?)
      `).bind(id, check.position, check.label, check.status)),
      env.DB.prepare(`
      INSERT INTO road_condition_events (submission_id, event_type, actor, note)
      VALUES (?, 'submitted', 'public', 'Road condition report received for review')
      `).bind(id),
    ]);
    return jsonResponse({ received: true, reference: id }, 201);
  } catch (error) {
    console.error('Road condition report failed:', error);
    return jsonResponse({ error: 'The report could not be saved. Please try again later.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}
