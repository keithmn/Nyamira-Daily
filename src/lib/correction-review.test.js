import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequestPost } from '../../functions/api/corrections.js';
import { onRequestGet } from '../../functions/api/review.js';
import {
  acceptedCorrectionFromRow,
  authorizeReviewer,
  consumeSubmissionLimit,
  jsonResponse,
  parseForm,
  readBoundedText,
  readRetentionDays,
  readReviewDecision,
  sameOrigin,
  validIsoDate,
  validPagePath,
  validSourceUrl,
} from '../../functions/_shared/corrections.js';

test('correction page paths must stay on the public site', () => {
  assert.equal(validPagePath('/data/health/'), true);
  assert.equal(validPagePath('/how-we-work/#corrections'), true);
  assert.equal(validPagePath('https://attacker.example/'), false);
  assert.equal(validPagePath('//attacker.example/'), false);
  assert.equal(validPagePath('/'.padEnd(502, 'x')), false);
});

test('public evidence links must be credential-free HTTPS URLs', () => {
  assert.equal(validSourceUrl('https://example.org/report.pdf'), 'https://example.org/report.pdf');
  assert.equal(validSourceUrl('http://example.org/report.pdf'), null);
  assert.equal(validSourceUrl('https://user:password@example.org/'), null);
  assert.equal(validSourceUrl('', { optional: true }), null);
});

test('source dates must be real ISO calendar dates', () => {
  assert.equal(validIsoDate('2026-10-26'), true);
  assert.equal(validIsoDate('2026-02-29'), false);
  assert.equal(validIsoDate('2026-1-2'), false);
});

test('retention is required and must be a bounded whole number of days', () => {
  assert.equal(readRetentionDays(undefined), null);
  assert.equal(readRetentionDays('0'), null);
  assert.equal(readRetentionDays('30'), 30);
  assert.equal(readRetentionDays('1.5'), null);
  assert.equal(readRetentionDays('3651'), null);
});

test('review acceptance requires independently entered source provenance', () => {
  const decision = {
    status: 'accepted',
    note: 'Source checked by editor',
    page: '/data/health/',
    changed: 'Updated the reported facility count',
    reason: 'The current official report gives the corrected figure.',
    source: 'https://example.org/report.pdf',
    sourceDate: '2026-10-01',
  };
  assert.equal(readReviewDecision(decision).decision.status, 'accepted');
  assert.match(readReviewDecision({ ...decision, sourceDate: '' }).error, /source date/);
  assert.match(readReviewDecision({ ...decision, source: 'http://example.org/report.pdf' }).error, /HTTPS source/);
});

test('rejected reports require an internal review note and export no public claim', () => {
  assert.deepEqual(readReviewDecision({ status: 'rejected', note: 'Not supported' }).decision, {
    status: 'rejected',
    note: 'Not supported',
  });
  assert.equal(readReviewDecision({ status: 'rejected', note: '' }).error, 'Add a short review note.');
});

test('same-origin checking rejects missing or cross-origin browser requests', () => {
  const makeRequest = (origin) => new Request('https://nyamiradaily.org/api/corrections', {
    method: 'POST',
    headers: origin ? { origin } : {},
  });
  assert.equal(sameOrigin(makeRequest('https://nyamiradaily.org'), 'https://nyamiradaily.org'), true);
  assert.equal(sameOrigin(makeRequest('https://attacker.example'), 'https://nyamiradaily.org'), false);
  assert.equal(sameOrigin(makeRequest(null), 'https://nyamiradaily.org'), false);
});

test('disabled public intake fails closed instead of returning a success-shaped response', async () => {
  const response = await onRequestPost({
    request: new Request('https://nyamiradaily.org/api/corrections', { method: 'POST' }),
    env: { CORRECTION_INTAKE_ENABLED: 'false' },
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'Correction submissions are not enabled.' });
});

test('review API denies unauthenticated requests before querying the database', async () => {
  const response = await onRequestGet({
    request: new Request('https://nyamiradaily.org/api/review'),
    env: {
      DB: {},
      CORRECTION_RETENTION_DAYS: '30',
      CF_ACCESS_TEAM_DOMAIN: 'nyamira.cloudflareaccess.com',
      CF_ACCESS_AUD: 'review-app',
      CORRECTION_REVIEWER_EMAILS: 'editor@example.org',
    },
  });
  assert.equal(response.status, 401);
});

test('reviewer authorization rejects missing or malformed Access assertions', async () => {
  const env = {
    CF_ACCESS_TEAM_DOMAIN: 'nyamira.cloudflareaccess.com',
    CF_ACCESS_AUD: 'review-app',
    CORRECTION_REVIEWER_EMAILS: 'editor@example.org',
  };
  assert.equal(await authorizeReviewer(new Request('https://site.example'), env), null);
  const malformed = new Request('https://site.example', {
    headers: { 'cf-access-jwt-assertion': 'not.a.valid.jwt' },
  });
  assert.equal(await authorizeReviewer(malformed, env), null);
});

test('reviewer authorization verifies the Cloudflare Access JWT signature and allowlisted email', async () => {
  const keys = await crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  const header = { alg: 'RS256', kid: 'test-key' };
  const claims = {
    iss: 'https://nyamira.cloudflareaccess.com',
    aud: ['review-app'],
    email: 'editor@example.org',
    exp: Math.floor(Date.now() / 1_000) + 60,
    nbf: Math.floor(Date.now() / 1_000) - 5,
  };
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const signingInput = `${encode(header)}.${encode(claims)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keys.privateKey,
    new TextEncoder().encode(signingInput),
  );
  const token = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({
    keys: [{ ...jwk, kid: 'test-key', use: 'sig' }],
  });
  try {
    const request = new Request('https://nyamiradaily.org/api/review', {
      headers: { 'cf-access-jwt-assertion': token },
    });
    const env = {
      CF_ACCESS_TEAM_DOMAIN: 'nyamira.cloudflareaccess.com',
      CF_ACCESS_AUD: 'review-app',
      CORRECTION_REVIEWER_EMAILS: 'editor@example.org',
    };
    assert.equal(await authorizeReviewer(request, env), 'editor@example.org');
    assert.equal(await authorizeReviewer(request, {
      ...env,
      CORRECTION_REVIEWER_EMAILS: 'other@example.org',
    }), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rate limiting stores only a keyed IP digest, never the raw address', async () => {
  const parameters = [];
  const db = {
    prepare() {
      return {
        bind(...values) {
          parameters.push(values);
          return { first: async () => ({ submission_count: 2 }) };
        },
      };
    },
  };
  assert.equal(await consumeSubmissionLimit(db, '203.0.113.25', 's'.repeat(32)), true);
  assert.equal(parameters.length, 1);
  assert.equal(parameters[0].includes('203.0.113.25'), false);
  assert.match(parameters[0][0], /^[a-f0-9]{64}$/);
});

test('reviewed export uses public values and the Nairobi review date', () => {
  assert.deepEqual(acceptedCorrectionFromRow({
    reviewed_at: '2026-10-26 04:10:00',
    public_page: '/data/health/',
    public_changed: 'Corrected a label',
    public_reason: 'Official source checked',
    public_source: 'https://example.org/source.pdf',
    public_source_date: '2026-10-01',
  }), {
    date: '2026-10-26',
    page: '/data/health/',
    changed: 'Corrected a label',
    reason: 'Official source checked',
    source: 'https://example.org/source.pdf',
    sourceDate: '2026-10-01',
  });
});

test('reviewed correction date rolls over at Nairobi midnight', () => {
  assert.equal(acceptedCorrectionFromRow({
    reviewed_at: '2026-10-25 21:30:00',
    public_page: '/data/health/',
    public_changed: 'Corrected a label',
    public_reason: 'Official source checked',
    public_source: 'https://example.org/source.pdf',
    public_source_date: '2026-10-01',
  }).date, '2026-10-26');
});

test('review API responses are explicitly non-cacheable', async () => {
  const response = jsonResponse({ ok: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('review JSON body reader rejects oversized streamed content', async () => {
  const request = new Request('https://site.example/api/review', {
    method: 'PATCH',
    body: '0123456789',
  });
  assert.equal(await readBoundedText(request, 5), null);
});

test('correction form parsing accepts bounded URL-encoded fields without a content-length header', async () => {
  const body = new URLSearchParams({
    page: '/how-we-work/#corrections',
    details: 'The cited source may be out of date.',
  });
  const request = new Request('https://nyamiradaily.org/api/corrections', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const result = await parseForm(request);
  assert.equal(result.fields.page, '/how-we-work/#corrections');
  assert.equal(result.fields.details, 'The cited source may be out of date.');
});

test('correction intake checks request origin before reaching the database', async () => {
  const response = await onRequestPost({
    request: new Request('https://nyamiradaily.org/api/corrections', {
      method: 'POST',
      headers: { origin: 'https://attacker.example' },
    }),
    env: {
      CORRECTION_INTAKE_ENABLED: 'true',
      DB: {},
      TURNSTILE_SECRET_KEY: 'test-secret',
      CORRECTION_RATE_SALT: 'x'.repeat(32),
      CORRECTION_SITE_ORIGIN: 'https://nyamiradaily.org',
      CORRECTION_SITE_HOST: 'nyamiradaily.org',
      CORRECTION_RETENTION_DAYS: '30',
    },
  });
  assert.equal(response.status, 403);
});

test('valid correction submissions are stored atomically as pending reports', async () => {
  const statements = [];
  const db = {
    prepare(sql) {
      const statement = {
        sql,
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async run() {
          return { success: true };
        },
        async first() {
          return { submission_count: 1 };
        },
      };
      return statement;
    },
    async batch(batchStatements) {
      statements.push(...batchStatements);
      return batchStatements.map(() => ({ success: true }));
    },
  };
  const form = new FormData();
  form.set('page', '/how-we-work/#corrections');
  form.set('details', 'The source date on this page may be wrong.');
  form.set('source', 'https://example.org/report.pdf');
  form.set('cf-turnstile-response', 'test-token');
  const request = new Request('https://nyamiradaily.org/api/corrections', {
    method: 'POST',
    headers: {
      origin: 'https://nyamiradaily.org',
      'cf-connecting-ip': '203.0.113.25',
    },
    body: form,
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: true, hostname: 'nyamiradaily.org' });
  try {
    const response = await onRequestPost({
      request,
      env: {
        CORRECTION_INTAKE_ENABLED: 'true',
        CORRECTION_SITE_ORIGIN: 'https://nyamiradaily.org',
        CORRECTION_SITE_HOST: 'nyamiradaily.org',
        CORRECTION_RETENTION_DAYS: '30',
        CORRECTION_RATE_SALT: 's'.repeat(32),
        TURNSTILE_SECRET_KEY: 'test-secret',
        DB: db,
      },
    });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).received, true);
    assert.equal(statements.length, 2);
    assert.match(statements[0].sql, /INSERT INTO correction_submissions/);
    assert.deepEqual(statements[0].values.slice(1), [
      '/how-we-work/#corrections',
      'The source date on this page may be wrong.',
      'https://example.org/report.pdf',
    ]);
    assert.match(statements[1].sql, /INSERT INTO correction_events/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
