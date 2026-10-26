import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import {
  latestFacilityCapabilities,
  observationsForFacility,
  validateFacilityObservations,
} from './facility-observations.js';

const require = createRequire(import.meta.url);
const facilities = require('../data/facilities.json');
const facility = facilities[0];

function observation(id, observedOn, status, overrides = {}) {
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
    ...overrides,
  };
}

test('facility observations validate and keep history independent of input order', () => {
  const records = [
    observation('old', '2025-01-02', 'reported-unavailable', {
      reviewedAt: '2025-05-19T10:00:00Z',
      publishedAt: '2025-05-20T11:00:00Z',
    }),
    observation('new', '2025-04-10', 'reported-available'),
  ];
  const forward = validateFacilityObservations(records, facilities);
  const reverse = validateFacilityObservations([...records].reverse(), facilities);
  assert.deepEqual(forward.map(({ id }) => id), ['new', 'old']);
  assert.deepEqual(reverse.map(({ id }) => id), ['new', 'old']);
  assert.deepEqual(latestFacilityCapabilities(forward, facility.id), latestFacilityCapabilities(reverse, facility.id));
  assert.equal(latestFacilityCapabilities(forward, facility.id)[0].status, 'reported-available');
  assert.deepEqual(observationsForFacility(forward, facility.id).map(({ id }) => id), ['new', 'old']);
});

test('conflicting latest observations produce unknown and preserve every source', () => {
  const records = validateFacilityObservations([
    observation('available', '2025-04-10', 'reported-available'),
    observation('unavailable', '2025-04-10', 'reported-unavailable'),
    observation('older', '2025-01-02', 'reported-available'),
  ], facilities);
  const [latest] = latestFacilityCapabilities(records, facility.id);
  assert.equal(latest.status, 'unknown');
  assert.equal(latest.conflict, true);
  assert.deepEqual(latest.observations.map(({ id }) => id), ['available', 'unavailable']);
  assert.equal(observationsForFacility(records, facility.id).length, 3);
});

test('an explicit unknown observation remains unknown, not unavailable', () => {
  const records = validateFacilityObservations([
    observation('unknown', '2025-04-10', 'unknown'),
  ], facilities);
  const [latest] = latestFacilityCapabilities(records, facility.id);
  assert.equal(latest.status, 'unknown');
  assert.equal(latest.conflict, false);
});

test('facility observations reject missing identity, dates, evidence and invalid timestamps', () => {
  const valid = observation('valid', '2025-04-10', 'reported-available');
  assert.throws(() => validateFacilityObservations([{ ...valid, facilityId: 'missing' }], facilities), /unknown facility/);
  assert.throws(() => validateFacilityObservations([{ ...valid, category: 'Health' }], facilities), /category does not match/);
  assert.throws(() => validateFacilityObservations([{ ...valid, observedOn: '2025-02-30' }], facilities), /valid observedOn/);
  assert.throws(() => validateFacilityObservations([{ ...valid, sourceRef: '' }], facilities), /requires sourceRef/);
  assert.throws(() => validateFacilityObservations([{ ...valid, evidence: 'unknown' }], facilities), /unsupported evidence label/);
  assert.throws(() => validateFacilityObservations([{ ...valid, reviewedAt: '2025-04-10' }], facilities), /UTC reviewedAt and publishedAt/);
  assert.throws(() => validateFacilityObservations([{ ...valid, reviewedAt: '2025-04-10T12:00:00Z', publishedAt: '2025-04-10T11:00:00Z' }], facilities), /published before review/);
  assert.throws(() => validateFacilityObservations([{ ...valid, observedOn: '2025-04-11' }], facilities), /published before its observation date/);
});

test('facility observation IDs must be unique', () => {
  const record = observation('duplicate', '2025-04-10', 'unknown');
  assert.throws(() => validateFacilityObservations([record, record], facilities), /Duplicate facility observation ID/);
});
