import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegister } from './build-ward-register.mjs';
import { counties, countyBySlug } from '../src/county.js';

const register = JSON.parse(readFileSync(new URL('../src/data/ward-register.json', import.meta.url), 'utf8'));
const wards = JSON.parse(readFileSync(new URL('../src/data/wards.json', import.meta.url), 'utf8'));

test('ward-register.json is rebuilt from the IEBC source', () => {
  assert.deepEqual(register, buildRegister());
});

test('every county in county.js has its wards and constituencies in the register', () => {
  for (const c of counties) {
    const fromRegister = register.constituencies.filter((k) => k.county === c.slug).map((k) => k.name).sort();
    assert.deepEqual([...c.constituencies].sort(), fromRegister, c.slug);
    assert.equal(register.counties[c.slug].iebcCode, c.iebcCode, c.slug);
  }
  assert.equal(register.counties.kisii.wards, 45);
  assert.equal(register.counties.nyamira.wards, 20);
});

test('every civic ward record names a known county and a register ward', () => {
  for (const w of wards) {
    assert.ok(countyBySlug[w.county], `${w.slug} has county ${w.county}`);
    assert.ok(register.wards.some((r) => r.slug === w.slug && r.county === w.county), w.slug);
  }
});
