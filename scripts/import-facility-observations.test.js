import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { mergeFacilityObservations } from './import-facility-observations.js';

const require = createRequire(import.meta.url);
const facility = require('../src/data/facilities.json')[0];

function exportedItem(id, overrides = {}) {
  return {
    id,
    facilityId: facility.id,
    category: facility.category,
    capability: 'Outpatient clinic',
    scope: 'One visit by a resident; the clinic on that day only',
    status: 'reported-available',
    observedOn: '2026-10-20',
    source: 'Resident report',
    sourceRef: 'Reader report reviewed by Nyamira Daily',
    evidence: 'unverified',
    reviewedAt: '2026-10-28T09:15:00Z',
    ...overrides,
  };
}

test('imported observations are stamped with publishedAt and keep existing history', () => {
  const existing = [{
    ...exportedItem('fo-old', { observedOn: '2026-09-01', reviewedAt: '2026-09-02T07:00:00Z' }),
    publishedAt: '2026-09-02T08:00:00Z',
  }];
  const { merged, added } = mergeFacilityObservations(existing, { items: [exportedItem('fo-new')] }, '2026-10-29T08:00:00Z');
  assert.deepEqual(merged.map(({ id }) => id), ['fo-old', 'fo-new']);
  assert.equal(added[0].publishedAt, '2026-10-29T08:00:00Z');
});

test('re-importing the same export adds nothing, but a changed record is refused', () => {
  const { merged } = mergeFacilityObservations([], { items: [exportedItem('fo-a')] }, '2026-10-29T08:00:00Z');
  assert.equal(mergeFacilityObservations(merged, { items: [exportedItem('fo-a')] }, '2026-10-30T08:00:00Z').added.length, 0);
  assert.throws(
    () => mergeFacilityObservations(merged, { items: [exportedItem('fo-a', { status: 'unknown' })] }, '2026-10-30T08:00:00Z'),
    /already published with different values/,
  );
});

test('only public fields are imported, and invalid records stop the import', () => {
  const { added } = mergeFacilityObservations([], { items: [exportedItem('fo-a', { details: 'Reporter words' })] }, '2026-10-29T08:00:00Z');
  assert.equal('details' in added[0], false);
  assert.throws(
    () => mergeFacilityObservations([], { items: [exportedItem('fo-b', { facilityId: 'NYM-F9999' })] }, '2026-10-29T08:00:00Z'),
    /unknown facility/,
  );
  assert.throws(() => mergeFacilityObservations([], {}, '2026-10-29T08:00:00Z'), /items array/);
});
