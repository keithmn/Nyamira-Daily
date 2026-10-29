import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { onRequestPost } from '../../functions/api/road-conditions.js';
import { exportAcceptedRoadConditions, onRequestGet, onRequestPatch } from '../../functions/api/review-roads.js';
import { purgeExpiredRoadConditions, readRoadDecision, readRoadReport } from '../../functions/_shared/road-conditions.js';
import { mergeRoadConditions } from '../../scripts/import-road-conditions.js';

const require = createRequire(import.meta.url);
const road = require('../data/roads.json').roads[0];
let DatabaseSync = null;
try {
  ({ DatabaseSync } = await import('node:sqlite'));
} catch {
  // Older Node 22 releases need a flag for node:sqlite; the D1 round trip is skipped there.
}

const intakeEnv = {
  ROAD_INTAKE_ENABLED: 'true',
  CORRECTION_SITE_ORIGIN: 'https://nyamiradaily.org',
  CORRECTION_SITE_HOST: 'nyamiradaily.org',
  CORRECTION_RETENTION_DAYS: '30',
  CORRECTION_RATE_SALT: 's'.repeat(32),
  TURNSTILE_SECRET_KEY: 'test-secret',
};

function reportFields(overrides = {}) {
  return {
    road: road.id, grade: 'poor', observedOn: '2026-10-20', sourceCategory: 'resident',
    check1: 'Passable by car after rain', check1Status: 'reported-no',
    check2: '', check2Status: '', check3: '', check3Status: '',
    details: '', source: '', website: '', 'cf-turnstile-response': 'test-token',
    ...overrides,
  };
}

function reportRequest(fields, origin = 'https://nyamiradaily.org') {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return new Request('https://nyamiradaily.org/api/road-conditions', {
    method: 'POST', headers: { origin, 'cf-connecting-ip': '203.0.113.25' }, body: form,
  });
}

const acceptance = {
  decision: 'accepted', note: 'Photos and a second resident agree', grade: 'poor',
  scope: 'One visit by a resident; the whole road on that day', observedOn: '2026-10-20',
  sourceCategory: 'resident', sourceRef: 'Reader report reviewed by Nyamira Daily', evidence: 'unverified',
};

test('road reports fail closed while road intake is off, even with other intake on', async () => {
  const response = await onRequestPost({
    request: reportRequest(reportFields()),
    env: { ...intakeEnv, ROAD_INTAKE_ENABLED: 'false', FACILITY_INTAKE_ENABLED: 'true', CORRECTION_INTAKE_ENABLED: 'true' },
  });
  assert.equal(response.status, 503);
});

test('road intake checks request origin before reaching the database', async () => {
  const response = await onRequestPost({ request: reportRequest(reportFields(), 'https://attacker.example'), env: { ...intakeEnv, DB: {} } });
  assert.equal(response.status, 403);
});

test('a road report needs a listed road, a grade choice, a past date and a reporter category', () => {
  const today = '2026-10-29';
  const { report } = readRoadReport(reportFields(), today);
  assert.deepEqual(report.checks, [{ position: 1, label: 'Passable by car after rain', status: 'reported-no' }]);
  assert.match(readRoadReport(reportFields({ road: 'NYM-R9999' }), today).error, /road listed/);
  assert.match(readRoadReport(reportFields({ grade: '' }), today).error, /Not sure/);
  assert.match(readRoadReport(reportFields({ grade: 'terrible' }), today).error, /Not sure/);
  assert.match(readRoadReport(reportFields({ observedOn: '2026-10-30' }), today).error, /future/);
  assert.match(readRoadReport(reportFields({ sourceCategory: '' }), today).error, /who is reporting/);
  assert.match(readRoadReport(reportFields({ check1Status: '' }), today).error, /Yes, No or Not sure for check 1/);
  assert.match(readRoadReport(reportFields({ check1: '', check1Status: '', check2Status: 'reported-yes' }), today).error, /check 2/);
});

test('accepting a road report requires every public field; a check with no public label is dropped', () => {
  const today = '2026-10-29';
  const kept = readRoadDecision({ ...acceptance, check1: 'Passable by car after rain', check1Status: 'reported-no', check2: '' }, today);
  assert.deepEqual(kept.decision.checks, [{ position: 1, label: 'Passable by car after rain', status: 'reported-no' }]);
  for (const field of ['grade', 'scope', 'observedOn', 'sourceCategory', 'sourceRef', 'evidence']) {
    assert.ok(readRoadDecision({ ...acceptance, [field]: '' }, today).error, `${field} should be required`);
  }
  assert.ok(readRoadDecision({ ...acceptance, evidence: 'audit' }, today).error);
  assert.ok(readRoadDecision({ ...acceptance, check1: 'Something', check1Status: '' }, today).error);
});

test('road review API denies unauthenticated requests', async () => {
  const response = await onRequestGet({
    request: new Request('https://nyamiradaily.org/api/review-roads'),
    env: { DB: {}, CORRECTION_RETENTION_DAYS: '30', CF_ACCESS_TEAM_DOMAIN: 'nyamira.cloudflareaccess.com', CF_ACCESS_AUD: 'review-app', CORRECTION_REVIEWER_EMAILS: 'editor@example.org' },
  });
  assert.equal(response.status, 401);
});

function d1(database) {
  const statement = (sql, values = []) => ({
    bind: (...bound) => statement(sql, bound),
    run: async () => ({ meta: { changes: Number(database.prepare(sql).run(...values).changes) } }),
    all: async () => ({ results: database.prepare(sql).all(...values).map((row) => ({ ...row })) }),
    first: async () => { const row = database.prepare(sql).get(...values); return row ? { ...row } : null; },
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
  const keys = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const signingInput = `${encode({ alg: 'RS256', kid: 'test-key' })}.${encode({ iss: 'https://nyamira.cloudflareaccess.com', aud: ['review-app'], email, exp: Math.floor(Date.now() / 1_000) + 60 })}`;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(signingInput));
  return { token: `${signingInput}.${Buffer.from(signature).toString('base64url')}`, jwk: { ...jwk, kid: 'test-key', use: 'sig' } };
}

test('a road report round-trips from intake to review, retention cleanup, export and import', { skip: !DatabaseSync }, async () => {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys = ON');
  for (const migration of ['0001_corrections.sql', '0002_facility_observations.sql', '0003_road_conditions.sql']) {
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
      request: reportRequest(reportFields({ check2: 'Culvert at the junction blocked', check2Status: 'reported-yes', details: 'Water across the road.' })),
      env: { ...intakeEnv, DB: db },
    });
    assert.equal(submitted.status, 201);
    const { reference } = await submitted.json();
    assert.equal(database.prepare('SELECT COUNT(*) AS n FROM road_condition_checks').get().n, 2);
    assert.equal(database.prepare('SELECT COUNT(*) AS n FROM facility_observation_submissions').get().n, 0);

    const reviewEnv = { DB: db, CORRECTION_RETENTION_DAYS: '30', CF_ACCESS_TEAM_DOMAIN: 'nyamira.cloudflareaccess.com', CF_ACCESS_AUD: 'review-app', CORRECTION_REVIEWER_EMAILS: 'editor@example.org' };
    const patch = (body) => onRequestPatch({
      request: new Request('https://nyamiradaily.org/api/review-roads', {
        method: 'PATCH', headers: { 'content-type': 'application/json', 'cf-access-jwt-assertion': access.token }, body: JSON.stringify(body),
      }),
      env: reviewEnv,
    });
    const reviewed = await patch({ ...acceptance, id: reference, check1: 'Passable by car after rain', check1Status: 'reported-no', check2: '' });
    assert.equal(reviewed.status, 200);
    assert.equal((await patch({ decision: 'rejected', note: 'Second opinion', id: reference })).status, 409);

    const listed = await onRequestGet({
      request: new Request('https://nyamiradaily.org/api/review-roads', { headers: { 'cf-access-jwt-assertion': access.token } }),
      env: reviewEnv,
    });
    const [item] = (await listed.json()).items;
    assert.equal(item.road.name, road.name);
    assert.equal(item.checks.length, 2);
    assert.deepEqual(item.events.map(({ event_type: type }) => type), ['submitted', 'accepted']);

    database.prepare("UPDATE road_condition_submissions SET created_at = datetime('now', '-40 days')").run();
    await purgeExpiredRoadConditions(db, 30);
    const kept = database.prepare('SELECT details, public_grade FROM road_condition_submissions').get();
    assert.equal(kept.details, null);
    assert.equal(kept.public_grade, 'poor');

    const exported = await exportAcceptedRoadConditions(db);
    assert.deepEqual(exported.items[0].checks, [{ label: 'Passable by car after rain', status: 'reported-no' }]);
    const { added } = mergeRoadConditions([], exported, '2026-10-29T08:00:00Z');
    assert.equal(added[0].id, `rc-${reference}`);
    assert.equal(added[0].source, 'Resident report');
  } finally {
    globalThis.fetch = originalFetch;
    database.close();
  }
});
