import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { resolveWards } from '../lib/facility-registry.js';

const require = createRequire(import.meta.url);
const facilities = require('./facilities.json');
const wardRecords = require('./wards.json');
const resolvedWards = resolveWards(wardRecords, facilities);

test('every facility has one stable ID and one matching ward reference', () => {
  const ids = facilities.map((facility) => facility.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.deepEqual(new Set(ids), new Set(wardRecords.flatMap((ward) => ward.facilityIds)));
  assert.ok(ids.every((id) => /^NYM-F\d{4}$/.test(id)));
});

test('ward counts are derived from the canonical facility records', () => {
  for (const ward of resolvedWards) {
    const expected = {};
    for (const facility of ward.facilities) {
      expected[facility.category] = (expected[facility.category] ?? 0) + 1;
    }
    assert.deepEqual(ward.counts, expected);
  }
});

test('missing owner and level values remain explicitly unknown', () => {
  assert.ok(facilities.some((facility) => facility.owner === null));
  assert.ok(facilities.some((facility) => facility.level === null));
  for (const facility of facilities) {
    assert.notEqual(facility.owner, undefined);
    assert.notEqual(facility.level, undefined);
    assert.ok(facility.owner === null || typeof facility.owner === 'string');
    assert.ok(facility.level === null || typeof facility.level === 'string');
  }
});

test('resolver rejects duplicate IDs and duplicate ward references', () => {
  const ward = { slug: 'one', facilityIds: ['F-1'] };
  const facility = { id: 'F-1', ward: 'one', name: 'One', category: 'Health', subtype: 'clinic', source: 'source', evidence: 'unverified' };
  assert.throws(() => resolveWards([ward], [facility, facility]), /duplicate ID/);
  assert.throws(() => resolveWards([{ ...ward, facilityIds: ['F-1', 'F-1'] }], [facility]), /referenced more than once/);
});

test('resolver rejects unknown, misplaced, and unreferenced facilities', () => {
  const ward = { slug: 'one', facilityIds: ['F-1'] };
  const facility = { id: 'F-1', ward: 'one', name: 'One', category: 'Health', subtype: 'clinic', source: 'source', evidence: 'unverified' };
  assert.throws(() => resolveWards([{ ...ward, facilityIds: ['F-2'] }], [facility]), /unknown facility F-2/);
  assert.throws(() => resolveWards([ward], [{ ...facility, ward: 'two' }]), /belongs to two/);
  assert.throws(() => resolveWards([{ slug: 'one', facilityIds: [] }], [facility]), /not referenced by a ward/);
});

test('all current facility IDs are represented in ward references', () => {
  assert.equal(wardRecords.reduce((total, ward) => total + ward.facilityIds.length, 0), 247);
});
