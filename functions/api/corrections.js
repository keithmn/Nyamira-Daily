import {
  consumeSubmissionLimit,
  jsonResponse,
  parseForm,
  purgeExpired,
  readRetentionDays,
  sameOrigin,
  validPagePath,
  validSourceUrl,
  verifyTurnstile,
} from '../_shared/corrections.js';

export async function onRequestPost({ request, env }) {
  if (env.CORRECTION_INTAKE_ENABLED !== 'true') {
    return jsonResponse({ error: 'Correction submissions are not enabled.' }, 503);
  }
  const retentionDays = readRetentionDays(env.CORRECTION_RETENTION_DAYS);
  if (!env.DB || !env.TURNSTILE_SECRET_KEY || !env.CORRECTION_RATE_SALT ||
      !env.CORRECTION_SITE_ORIGIN || !env.CORRECTION_SITE_HOST || retentionDays === null) {
    return jsonResponse({ error: 'Correction intake is not fully configured.' }, 503);
  }
  if (request.method !== 'POST' || !sameOrigin(request, env.CORRECTION_SITE_ORIGIN)) {
    return jsonResponse({ error: 'This request is not allowed.' }, 403);
  }

  let submission;
  try {
    submission = await parseForm(request);
  } catch {
    return jsonResponse({ error: 'Could not read the submission. Check the form and try again.' }, 400);
  }
  if (submission.error) return jsonResponse({ error: submission.error }, 400);
  const { fields } = submission;
  if (fields.website) return jsonResponse({ error: 'The submission could not be accepted.' }, 400);
  if (!validPagePath(fields.page)) return jsonResponse({ error: 'Enter a valid Nyamira Daily page path.' }, 400);
  if (fields.details.length < 10) return jsonResponse({ error: 'Please describe the issue in at least 10 characters.' }, 400);
  const source = validSourceUrl(fields.source, { optional: true });
  if (fields.source && !source) return jsonResponse({ error: 'The source link must be a valid HTTPS URL.' }, 400);
  if (!fields['cf-turnstile-response']) {
    return jsonResponse({ error: 'Complete the anti-spam check before submitting.' }, 400);
  }

  const clientIp = request.headers.get('cf-connecting-ip');
  if (!clientIp) return jsonResponse({ error: 'The trusted client address is unavailable.' }, 503);

  try {
    await purgeExpired(env.DB, retentionDays);
    if (!(await verifyTurnstile(fields['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, env.CORRECTION_SITE_HOST))) {
      return jsonResponse({ error: 'The anti-spam check did not pass. Try again.' }, 400);
    }
    const withinLimit = await consumeSubmissionLimit(env.DB, clientIp, env.CORRECTION_RATE_SALT);
    if (withinLimit === null) return jsonResponse({ error: 'Submission protection is not configured.' }, 503);
    if (!withinLimit) return jsonResponse({ error: 'Too many submissions. Please try again later.' }, 429);

    const id = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare(`
      INSERT INTO correction_submissions (id, page_path, details, source_url, status)
      VALUES (?, ?, ?, ?, 'pending')
      `).bind(id, fields.page, fields.details, source),
      env.DB.prepare(`
      INSERT INTO correction_events (submission_id, event_type, actor, note)
      VALUES (?, 'submitted', 'public', 'Correction report received for review')
      `).bind(id),
    ]);
    return jsonResponse({ received: true, reference: id }, 201);
  } catch (error) {
    console.error('Correction submission failed:', error);
    return jsonResponse({ error: 'The report could not be saved. Please try again later.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}
