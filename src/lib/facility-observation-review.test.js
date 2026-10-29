import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { onRequestPost } from '../../functions/api/facility-observations.js';
import {
  exportAcceptedFacilityObservations,
  onRequestGet,
  onRequestPatch,
} from '../../functions/api/review-facilities.js';
import { consumeSubmissionLimit } from '../../functions/_shared/corrections.js';
import {
  publicObservationFromRow,
  purgeExpiredFacilityObservations,
  readFacilityDecision,
  readFacilityObservation,
} from '../../functions/_shared/facility-observations.js';
import { mergeFacilityObservations } from '../../scripts/import-facility-observations.js';
import { validateFacilityObservations } from './facility-observations.js';

const require = createRequire(import.meta.url);
const facilities = require('../data/facilities.json');
const facility = facilities[0];
let DatabaseSync = null;
try {
  ({ DatabaseSync } = await import('node:sqlite'));
} catch {
  // Older Node 22 releases need a flag for node:sqlite; the D1 round trip is skipped there.
}

const intakeEnv = {
  FACILITY_INTAKE_ENABLED: 'true',
  CORRECTION_SITE_ORIGIN: 'https://nyamiradaily.org',
  CORRECTION_SITE_HOST: 'nyamiradaily.org',
  CORRECTION_RETENTION_DAYS: '30',
  CORRECTION_RATE_SALT: 's'.repeat(32),
  TURNSTILE_SECRET_KEY: 'test-secret',
};

function reportFields(overrides = {}) {
  return {
    facility: facility.id,
    capability: '  Outpatient   clinic ',
    status: 'reported-unavailable',
    observedOn: '2026-10-20',
    sourceCategory: 'resident',
    details: '',
    source: '',
    website: '',
    'cf-turnstile-response': 'test-token',
    ...overrides,
  };
}

function reportRequest(fields, origin = 'https://nyamiradaily.org') {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return new Request('https://nyamiradaily.org/api/facility-observations', {
    method: 'POST',
    headers: { origin, 'cf-connecting-ip': '203.0.113.25' },
    body: form,
  });
}

const acceptance = {
  decision: 'accepted',
  note: 'Checked with the facility in charge by phone',
  capability: 'Outpatient clinic',
  observationStatus: 'reported-unavailable',
  scope: 'One visit by a resident; the clinic on that day only',
  observedOn: '2026-10-20',
  sourceCategory: 'resident',
  sourceRef: 'Reader report reviewed by Nyamira Daily',
  evidence: 'unverified',
};

test('facility reports fail closed while facility intake is off, even with corrections on', async () => {
  const response = await onRequestPost({
    request: reportRequest(reportFields()),
    env: { ...intakeEnv, FACILITY_INTAKE_ENABLED: 'false', CORRECTION_INTAKE_ENABLED: 'true' },
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'Facility reports are not enabled.' });
});

test('facility intake checks request origin before reaching the database', async () => {
  const response = await onRequestPost({
    request: reportRequest(reportFields(), 'https://attacker.example'),
    env: { ...intakeEnv, DB: {} },
  });
  assert.equal(response.status, 403);
});

test('facility reports need a listed facility, a status choice, a past date and a reporter category', () => {
  const today = '2026-10-29';
  const { observation } = readFacilityObservation(reportFields(), today);
  assert.equal(observation.capability, 'Outpatient clinic');
  assert.equal(observation.details, null);
  assert.match(readFacilityObservation(reportFields({ facility: 'NYM-F9999' }), today).error, /facility listed/);
  assert.match(readFacilityObservation(reportFields({ status: '' }), today).error, /Not sure/);
  assert.match(readFacilityObservation(reportFields({ status: 'no' }), today).error, /Not sure/);
  assert.match(readFacilityObservation(reportFields({ observedOn: '2026-10-30' }), today).error, /future/);
  assert.match(readFacilityObservation(reportFields({ observedOn: '2026-02-30' }), today).error, /date/);
  assert.match(readFacilityObservation(reportFields({ sourceCategory: '' }), today).error, /who is reporting/);
  assert.match(readFacilityObservation(reportFields({ capability: 'x' }), today).error, /2–120/);
  assert.match(readFacilityObservation(reportFields({ source: 'http://example.org/' }), today).error, /HTTPS/);
});

test('accepting a facility report requires every public field and a reader-report evidence label', () => {
  const today = '2026-10-29';
  assert.equal(readFacilityDecision(acceptance, today).decision.evidence, 'unverified');
  for (const field of ['capability', 'observationStatus', 'scope', 'observedOn', 'sourceCategory', 'sourceRef', 'evidence']) {
    assert.ok(readFacilityDecision({ ...acceptance, [field]: '' }, today).error, `${field} should be required`);
  }
  assert.ok(readFacilityDecision({ ...acceptance, evidence: 'official' }, today).error);
  assert.ok(readFacilityDecision({ ...acceptance, observedOn: '2026-10-30' }, today).error);
  assert.deepEqual(readFacilityDecision({ decision: 'rejected', note: 'Not specific' }, today).decision, {
    decision: 'rejected',
    note: 'Not specific',
  });
  assert.equal(readFacilityDecision({ decision: 'rejected', note: '' }, today).error, 'Add a short review note.');
});

test('exported observations carry public fields only and pass the published-record validator', () => {
  const row = {
    id: '6f1c2c58-6d0e-4a52-9a3c-0d3c1b9f4e21',
    facility_id: facility.id,
    reviewed_at: '2026-10-28 09:15:00',
    public_capability: 'Outpatient clinic',
    public_status: 'reported-unavailable',
    public_scope: 'One visit by a resident; the clinic on that day only',
    public_observed_on: '2026-10-20',
    public_source_category: 'field-reporter',
    public_source_ref: 'Field visit reviewed by Nyamira Daily',
    public_evidence: 'verified',
    details: 'Private words from the reporter',
    reviewer: 'editor@example.org',
  };
  const { item } = publicObservationFromRow(row);
  assert.equal(item.category, facility.category);
  assert.equal(item.source, 'Nyamira Daily field reporter');
  assert.equal(item.reviewedAt, '2026-10-28T09:15:00Z');
  assert.equal(JSON.stringify(item).includes('Private words'), false);
  assert.equal(JSON.stringify(item).includes('editor@example.org'), false);
  const [published] = validateFacilityObservations([{ ...item, publishedAt: '2026-10-29T08:00:00Z' }], facilities);
  assert.equal(published.id, `fo-${row.id}`);
  assert.match(publicObservationFromRow({ ...row, facility_id: 'NYM-F9999' }).skipped.reason, /not in the current registry/);
});

test('facility review API denies unauthenticated requests', async () => {
  const response = await onRequestGet({
    request: new Request('https://nyamiradaily.org/api/review-facilities'),
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

test('the rate limiter only writes to known limiter tables', async () => {
  await assert.rejects(
    consumeSubmissionLimit({}, '203.0.113.25', 's'.repeat(32), { table: 'correction_submissions' }),
    /Unknown rate-limit table/,
  );
});

// A small adapter so the real migrations and D1 queries run on node:sqlite.
function d1(database) {
  const statement = (sql, values = []) => ({
    bind: (...bound) => statement(sql, bound),
    run: async () => ({ meta: { changes: Number(database.prepare(sql).run(...values).changes) } }),
    all: async () => ({ results: database.prepare(sql).all(...values).map((row) => ({ ...row })) }),
    first: async () => {
      const row = database.prepare(sql).get(...values);
      return row ? { ...row } : null;
    },
  });
  return {
    prepare: (sql) => statement(sql),
    batch: async (statements) => {
      database.exec('BEGIN');
      try {
        const results = [];
        for (const item of statements) results.push(await item.run());
        database.exec('COMMIT');
        return results;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

async function accessToken(email) {
  const keys = await crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const signingInput = `${encode({ alg: 'RS256', kid: 'test-key' })}.${encode({
    iss: 'https://nyamira.cloudflareaccess.com',
    aud: ['review-app'],
    email,
    exp: Math.floor(Date.now() / 1_000) + 60,
  })}`;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(signingInput));
  return { token: `${signingInput}.${Buffer.from(signature).toString('base64url')}`, jwk: { ...jwk, kid: 'test-key', use: 'sig' } };
}

test('a facility report round-trips from intake to review, retention cleanup, export and import', { skip: !DatabaseSync }, async () => {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys = ON');
  for (const migration of ['0001_corrections.sql', '0002_facility_observations.sql']) {
    database.exec(fs.readFileSync(new URL(`../../migrations/${migration}`, import.meta.url), 'utf8'));
  }
  const db = d1(database);
  const access = await accessToken('editor@example.org');
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => (String(url).includes('turnstile')
    ? Response.json({ success: true, hostname: 'nyamiradaily.org' })
    : Response.json({ keys: [access.jwk] }));
  try {
    const submitted = await onRequestPost({
      request: reportRequest(reportFields({ details: 'Doors locked at 10am on a weekday.' })),
      env: { ...intakeEnv, DB: db },
    });
    assert.equal(submitted.status, 201);
    const { reference } = await submitted.json();
    assert.equal(database.prepare('SELECT COUNT(*) AS n FROM correction_submissions').get().n, 0);
    const limiter = database.prepare('SELECT ip_hash FROM facility_observation_rate_limits').get();
    assert.match(limiter.ip_hash, /^[a-f0-9]{64}$/);

    const reviewEnv = {
      DB: db,
      CORRECTION_RETENTION_DAYS: '30',
      CF_ACCESS_TEAM_DOMAIN: 'nyamira.cloudflareaccess.com',
      CF_ACCESS_AUD: 'review-app',
      CORRECTION_REVIEWER_EMAILS: 'editor@example.org',
    };
    const patch = (body) => onRequestPatch({
      request: new Request('https://nyamiradaily.org/api/review-facilities', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'cf-access-jwt-assertion': access.token },
        body: JSON.stringify(body),
      }),
      env: reviewEnv,
    });
    const reviewed = await patch({ ...acceptance, id: reference, observedOn: '2026-10-20' });
    assert.equal(reviewed.status, 200);
    assert.equal((await patch({ decision: 'rejected', note: 'Second opinion', id: reference })).status, 409);

    const listed = await onRequestGet({
      request: new Request('https://nyamiradaily.org/api/review-facilities', {
        headers: { 'cf-access-jwt-assertion': access.token },
      }),
      env: reviewEnv,
    });
    const [item] = (await listed.json()).items;
    assert.equal(item.facility.name, facility.name);
    assert.deepEqual(item.events.map(({ event_type: type }) => type), ['submitted', 'accepted']);

    // Age everything past retention: the reporter's words go, the reviewed record stays.
    database.prepare("UPDATE facility_observation_submissions SET created_at = datetime('now', '-40 days')").run();
    await purgeExpiredFacilityObservations(db, 30);
    const kept = database.prepare('SELECT details, public_capability FROM facility_observation_submissions').get();
    assert.equal(kept.details, null);
    assert.equal(kept.public_capability, 'Outpatient clinic');

    const exported = await exportAcceptedFacilityObservations(db);
    assert.equal(exported.items.length, 1);
    const { added } = mergeFacilityObservations([], exported, new Date(Date.now() + 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z'));
    assert.equal(added[0].id, `fo-${reference}`);
    assert.equal(added[0].source, 'Resident report');
  } finally {
    globalThis.fetch = originalFetch;
    database.close();
  }
});
