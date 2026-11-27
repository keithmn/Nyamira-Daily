import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { resolveWards } from '../lib/facility-registry.js';

const require = createRequire(import.meta.url);
const facilities = require('./facilities.json');
const wardRecords = require('./wards.json');
const wardPlaces = require('./ward-places.json');
const resolvedWards = resolveWards(wardRecords, facilities);

test('every facility has one stable ID and a ward that exists in wards.json', () => {
  const ids = facilities.map((facility) => facility.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(ids.every((id) => /^NYM-F\d{4}$/.test(id)));
  const slugs = new Set(wardRecords.map((w) => w.slug));
  for (const f of facilities) assert.ok(slugs.has(f.ward), `facility ${f.id} names unknown ward ${f.ward}`);
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

test('resolver rejects duplicate IDs', () => {
  const ward = { slug: 'one' };
  const facility = { id: 'F-1', ward: 'one', name: 'One', category: 'Health', subtype: 'clinic', source: 'source', evidence: 'unverified' };
  assert.throws(() => resolveWards([ward], [facility, facility]), /duplicate ID/);
});

test('resolver rejects facilities with unknown ward', () => {
  const ward = { slug: 'one' };
  const facility = { id: 'F-1', ward: 'two', name: 'One', category: 'Health', subtype: 'clinic', source: 'source', evidence: 'unverified' };
  assert.throws(() => resolveWards([ward], [facility]), /unknown ward/);
});

test('all 247 facilities are assigned to wards', () => {
  assert.equal(facilities.length, 247);
  assert.equal(resolvedWards.reduce((total, ward) => total + ward.facilities.length, 0), 247);
});

test('ward-places.json entries all reference valid ward slugs', () => {
  const slugs = new Set(wardRecords.map((w) => w.slug));
  for (const p of wardPlaces) assert.ok(slugs.has(p.ward), `place ${p.id} names unknown ward ${p.ward}`);
});

test('wards.json is a pure identity lookup (slug, name, county, subCounty only)', () => {
  for (const w of wardRecords) {
    assert.deepEqual(Object.keys(w).sort(), ['county', 'name', 'slug', 'subCounty']);
  }
});
