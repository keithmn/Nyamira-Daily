const MAX_BODY_BYTES = 8_192;
const MAX_SUBMISSIONS_PER_HOUR = 3;
const MAX_REVIEW_ITEMS = 100;

export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export function validSourceUrl(value, { optional = false } = {}) {
  if (optional && (value === null || value === undefined || value === '')) return null;
  if (typeof value !== 'string' || value.length > 2_048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function validPagePath(value) {
  if (typeof value !== 'string' || value.length > 500 || !value.startsWith('/') || value.startsWith('//')) return false;
  try {
    const url = new URL(value, 'https://nyamiradaily.org');
    return url.origin === 'https://nyamiradaily.org' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function readRetentionDays(value) {
  if (!/^\d+$/.test(value || '')) return null;
  const days = Number(value);
  return Number.isSafeInteger(days) && days >= 1 && days <= 3_650 ? days : null;
}

export function sameOrigin(request, configuredOrigin) {
  if (!configuredOrigin) return false;
  try {
    return request.headers.get('origin') === new URL(configuredOrigin).origin;
  } catch {
    return false;
  }
}

export async function readFormFields(request, keys) {
  const rawLength = request.headers.get('content-length');
  if (rawLength && !/^\d+$/.test(rawLength)) return { error: 'The submission size could not be checked.' };
  const contentLength = Number(rawLength || 0);
  if (contentLength > MAX_BODY_BYTES) return { error: 'Submission is too large.' };
  const contentType = request.headers.get('content-type')?.split(';')[0].trim();
  if (!['multipart/form-data', 'application/x-www-form-urlencoded'].includes(contentType)) {
    return { error: 'Send the form fields in the expected format.' };
  }
  let form;
  try {
    const body = await readBoundedBytes(request, MAX_BODY_BYTES);
    if (body === null) return { error: 'Submission is too large.' };
    form = await new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': request.headers.get('content-type') },
      body,
    }).formData();
  } catch {
    return { error: 'Send the form fields in the expected format.' };
  }
  return {
    fields: Object.fromEntries(keys.map((key) => [key, String(form.get(key) || '').trim()])),
  };
}

export async function parseForm(request) {
  const parsed = await readFormFields(request, ['page', 'details', 'source', 'website', 'cf-turnstile-response']);
  if (parsed.error) return parsed;
  const { fields } = parsed;
  if (fields.details.length > 3_000 || fields.page.length > 500 || fields.source.length > 2_048) {
    return { error: 'One or more fields are too long.' };
  }
  return { fields };
}

export async function readBoundedBytes(request, maxBytes) {
  const rawLength = request.headers.get('content-length');
  if (rawLength && Number(rawLength) > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function readBoundedText(request, maxBytes) {
  const bytes = await readBoundedBytes(request, maxBytes);
  return bytes === null ? null : new TextDecoder().decode(bytes);
}

export async function purgeExpired(db, retentionDays) {
  const age = `-${retentionDays} days`;
  await db.prepare(
    "DELETE FROM correction_events WHERE created_at < datetime('now', ?)",
  ).bind(age).run();
  await db.prepare(
    "DELETE FROM correction_submissions WHERE created_at < datetime('now', ?)",
  ).bind(age).run();
  await db.prepare(
    "DELETE FROM correction_rate_limits WHERE window_started < datetime('now', '-1 hour')",
  ).run();
}

async function hmacHex(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Table names cannot be bound as SQL parameters, so only these are accepted.
const RATE_LIMIT_TABLES = new Set(['correction_rate_limits', 'facility_observation_rate_limits']);

export async function consumeSubmissionLimit(db, clientIp, secret, {
  table = 'correction_rate_limits',
  perHour = MAX_SUBMISSIONS_PER_HOUR,
} = {}) {
  if (!RATE_LIMIT_TABLES.has(table)) throw new Error(`Unknown rate-limit table: ${table}`);
  if (!clientIp || !secret || secret.length < 32) return null;
  const ipHash = await hmacHex(secret, clientIp);
  const result = await db.prepare(`
    INSERT INTO ${table} (ip_hash, window_started, submission_count)
    VALUES (?, datetime('now'), 1)
    ON CONFLICT(ip_hash) DO UPDATE SET
      submission_count = CASE
        WHEN ${table}.window_started < datetime('now', '-1 hour') THEN 1
        ELSE ${table}.submission_count + 1
      END,
      window_started = CASE
        WHEN ${table}.window_started < datetime('now', '-1 hour') THEN datetime('now')
        ELSE ${table}.window_started
      END
    RETURNING submission_count
  `).bind(ipHash).first();
  return result?.submission_count <= perHour;
}

export async function verifyTurnstile(token, secret, expectedHostname) {
  if (!token || !secret || !expectedHostname) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  if (!response.ok) throw new Error(`Turnstile verification failed with HTTP ${response.status}`);
  const result = await response.json();
  return result.success === true && result.hostname === expectedHostname;
}

function decodeBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function authorizeReviewer(request, env) {
  const token = request.headers.get('cf-access-jwt-assertion');
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN;
  const audience = env.CF_ACCESS_AUD;
  const allowedEmails = (env.CORRECTION_REVIEWER_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!token || !teamDomain || !audience || !allowedEmails.length) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header;
  let claims;
  try {
    header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
  } catch {
    return null;
  }
  if (header.alg !== 'RS256' || !header.kid) return null;

  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(teamDomain)) return null;
  const issuer = `https://${teamDomain}`;
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== issuer || !audiences.includes(audience)) return null;
  const now = Math.floor(Date.now() / 1_000);
  if (!Number.isFinite(claims.exp) || claims.exp <= now || (claims.nbf && claims.nbf > now)) return null;
  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : '';
  if (!allowedEmails.includes(email)) return null;

  const keysResponse = await fetch(`${issuer}/cdn-cgi/access/certs`);
  if (!keysResponse.ok) throw new Error(`Cloudflare Access key lookup failed with HTTP ${keysResponse.status}`);
  const keySet = await keysResponse.json();
  const jwk = keySet.keys?.find((key) => key.kid === header.kid && key.use === 'sig');
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  return valid ? email : null;
}

export function readReviewDecision(value) {
  if (!value || typeof value !== 'object') return { error: 'Review details are required.' };
  const status = value.status;
  const note = typeof value.note === 'string' ? value.note.trim() : '';
  if (!['accepted', 'rejected'].includes(status)) return { error: 'Choose accept or reject.' };
  if (note.length < 3 || note.length > 1_000) return { error: 'Add a short review note.' };
  if (status === 'rejected') return { decision: { status, note } };

  const page = typeof value.page === 'string' ? value.page.trim() : '';
  const changed = typeof value.changed === 'string' ? value.changed.trim() : '';
  const reason = typeof value.reason === 'string' ? value.reason.trim() : '';
  const source = validSourceUrl(value.source);
  const sourceDate = value.sourceDate;
  if (!validPagePath(page)) return { error: 'Accepted corrections need a valid site page path.' };
  if (!changed || changed.length > 500) return { error: 'Describe the public change in 1–500 characters.' };
  if (!reason || reason.length > 1_000) return { error: 'Describe why the correction is supported.' };
  if (!source) return { error: 'Accepted corrections need an HTTPS source URL.' };
  if (!validIsoDate(sourceDate)) return { error: 'Accepted corrections need the source date.' };
  return {
    decision: {
      status,
      note,
      page,
      changed,
      reason,
      source,
      sourceDate,
    },
  };
}

export function nairobiDate(date = new Date()) {
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function acceptedCorrectionFromRow(row) {
  const reviewedAt = new Date(`${row.reviewed_at.replace(' ', 'T')}Z`);
  if (Number.isNaN(reviewedAt.valueOf())) throw new Error('Accepted correction has an invalid review timestamp.');
  return {
    date: nairobiDate(reviewedAt),
    page: row.public_page,
    changed: row.public_changed,
    reason: row.public_reason,
    source: row.public_source,
    sourceDate: row.public_source_date,
  };
}

export function isJsonRequest(request) {
  return request.headers.get('content-type')?.split(';')[0].trim() === 'application/json';
}

export const reviewItemLimit = MAX_REVIEW_ITEMS;
