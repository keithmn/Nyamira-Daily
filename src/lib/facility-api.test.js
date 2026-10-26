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
    assert.equal(Object.hasOwn(record, 'coordinates'), false);
    assert.equal(Object.hasOwn(record, 'lat'), false);
    assert.equal(Object.hasOwn(record, 'lon'), false);
  }
});

test('facility API fails explicitly for missing site or ward records', () => {
  assert.throws(() => facilityApiRecords([], [], undefined), /configured site URL/);
  assert.throws(() => facilityApiRecords([{ id: 'F-1', ward: 'missing' }], [], 'https://nyamiradaily.org'), /unknown ward/);
});
