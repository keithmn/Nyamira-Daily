import {
  consumeSubmissionLimit,
  jsonResponse,
  readFormFields,
  readRetentionDays,
  sameOrigin,
  verifyTurnstile,
} from '../_shared/corrections.js';
import {
  facilityFormFields,
  facilitySubmissionsPerHour,
  purgeExpiredFacilityObservations,
  readFacilityObservation,
} from '../_shared/facility-observations.js';

export async function onRequestPost({ request, env }) {
  if (env.FACILITY_INTAKE_ENABLED !== 'true') {
    return jsonResponse({ error: 'Facility reports are not enabled.' }, 503);
  }
  const retentionDays = readRetentionDays(env.CORRECTION_RETENTION_DAYS);
  if (!env.DB || !env.TURNSTILE_SECRET_KEY || !env.CORRECTION_RATE_SALT ||
      !env.CORRECTION_SITE_ORIGIN || !env.CORRECTION_SITE_HOST || retentionDays === null) {
    return jsonResponse({ error: 'Facility report intake is not fully configured.' }, 503);
  }
  if (request.method !== 'POST' || !sameOrigin(request, env.CORRECTION_SITE_ORIGIN)) {
    return jsonResponse({ error: 'This request is not allowed.' }, 403);
  }

  let submission;
  try {
    submission = await readFormFields(request, facilityFormFields);
  } catch {
    return jsonResponse({ error: 'Could not read the report. Check the form and try again.' }, 400);
  }
  if (submission.error) return jsonResponse({ error: submission.error }, 400);
  const { fields } = submission;
  if (fields.website) return jsonResponse({ error: 'The report could not be accepted.' }, 400);
  const parsed = readFacilityObservation(fields);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);
  if (!fields['cf-turnstile-response']) {
    return jsonResponse({ error: 'Complete the anti-spam check before submitting.' }, 400);
  }

  const clientIp = request.headers.get('cf-connecting-ip');
  if (!clientIp) return jsonResponse({ error: 'The trusted client address is unavailable.' }, 503);

  try {
    await purgeExpiredFacilityObservations(env.DB, retentionDays);
    if (!(await verifyTurnstile(fields['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, env.CORRECTION_SITE_HOST))) {
      return jsonResponse({ error: 'The anti-spam check did not pass. Try again.' }, 400);
    }
    const withinLimit = await consumeSubmissionLimit(env.DB, clientIp, env.CORRECTION_RATE_SALT, {
      table: 'facility_observation_rate_limits',
      perHour: facilitySubmissionsPerHour,
    });
    if (withinLimit === null) return jsonResponse({ error: 'Submission protection is not configured.' }, 503);
    if (!withinLimit) return jsonResponse({ error: 'Too many reports. Please try again later.' }, 429);

    const id = crypto.randomUUID();
    const { observation } = parsed;
    await env.DB.batch([
      env.DB.prepare(`
      INSERT INTO facility_observation_submissions
        (id, facility_id, capability, reported_status, observed_on, source_category, details, source_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).bind(
        id,
        observation.facilityId,
        observation.capability,
        observation.status,
        observation.observedOn,
        observation.sourceCategory,
        observation.details,
        observation.source,
      ),
      env.DB.prepare(`
      INSERT INTO facility_observation_events (submission_id, event_type, actor, note)
      VALUES (?, 'submitted', 'public', 'Facility report received for review')
      `).bind(id),
    ]);
    return jsonResponse({ received: true, reference: id }, 201);
  } catch (error) {
    console.error('Facility report submission failed:', error);
    return jsonResponse({ error: 'The report could not be saved. Please try again later.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}
