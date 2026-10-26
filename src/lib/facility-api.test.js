import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { facilityApiRecords } from './facility-api.js';
import { resolveWards } from './facility-registry.js';

const require = createRequire(import.meta.url);
const facilities = require('../data/facilities.json');
const rawWards = require('../data/wards.json');
const wards = resolveWards(rawWards, facilities);

test('facility API records link stable profiles and preserve explicit unknowns', () => {
  const records = facilityApiRecords(facilities, wards, new URL('https://nyamiradaily.org/'));
  assert.equal(records.length, facilities.length);
  for (const record of records) {
    assert.equal(record.profileUrl, `https://nyamiradaily.org/facility/${record.id.toLowerCase()}/`);
    assert.equal(record.sourceDate, null);
    assert.equal(record.observationDate, null);
    assert.equal(record.capabilities, null);
    assert.deepEqual(record.history, []);
    assert.equal(Object.hasOwn(record, 'coordinates'), false);
    assert.equal(Object.hasOwn(record, 'lat'), false);
    assert.equal(Object.hasOwn(record, 'lon'), false);
  }
});

test('facility API exposes reviewed observations and keeps older records in history', () => {
  const facility = facilities[0];
  const observations = [
    observation(facility, '2025-01-02', 'reported-unavailable', 'old'),
    observation(facility, '2025-04-10', 'reported-available', 'new'),
  ];
  const record = facilityApiRecords(facilities, wards, new URL('https://nyamiradaily.org/'), observations)
    .find((item) => item.id === facility.id);
  assert.equal(record.capabilities[0].status, 'reported-available');
  assert.equal(record.capabilities[0].observedOn, '2025-04-10');
  assert.equal(record.history.length, 2);
  assert.equal(record.history[1].id, 'old');
});

function observation(facility, observedOn, status, id) {
  return {
    id,
    facilityId: facility.id,
    category: facility.category,
    capability: 'Sample service',
    scope: 'Test fixture only',
    status,
    observedOn,
    source: 'Test source',
    sourceRef: `reference-${id}`,
    evidence: 'verified',
    reviewedAt: `${observedOn}T10:00:00Z`,
    publishedAt: `${observedOn}T11:00:00Z`,
  };
}

test('facility API fails explicitly for missing site or ward records', () => {
  assert.throws(() => facilityApiRecords([], [], undefined), /configured site URL/);
  assert.throws(() => facilityApiRecords([{ id: 'F-1', ward: 'missing' }], [], 'https://nyamiradaily.org'), /unknown ward/);
});
