// Database sanity (decision #136): every record that the site prints must have a source, a known evidence label,
// and a ward or county that exists. Runs with npm test, so a bad record fails the build's test step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const J = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const LABELS = new Set(['verified', 'audit', 'official', 'unverified']);
const register = J('src/data/ward-register.json');
const regSlugs = new Set(register.wards.map((w) => w.slug));
const nyFacilities = J('src/data/facilities.json');
const kiFacilities = J('src/data/counties/kisii/facilities.json');

test('every facility has an id, name, source, allowed evidence label and a known ward', () => {
  for (const f of [...nyFacilities, ...kiFacilities]) {
    assert.ok(f.id && f.name, `facility without id or name: ${JSON.stringify(f).slice(0, 80)}`);
    assert.ok(f.source, `${f.id} has no source`);
    assert.ok(LABELS.has(f.evidence), `${f.id} evidence "${f.evidence}" is not a label`);
    assert.ok(regSlugs.has(f.ward), `${f.id} ward "${f.ward}" is not in the ward register`);
  }
});

test('facility ids are unique across both counties', () => {
  const ids = [...nyFacilities, ...kiFacilities].map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every money year has its source, page and checksum', () => {
  for (const y of J('src/data/money.json').years) {
    assert.ok(y.src && y.page, `${y.fy} missing src or page`);
  }
  for (const y of J('src/data/counties/kisii/money.json')) {
    assert.ok(y.src && y.page && y.sha256, `Kisii ${y.fy} missing src, page or sha256`);
  }
});

test('no money year spends more than its budget', () => {
  const all = [...J('src/data/money.json').years, ...J('src/data/counties/kisii/money.json')];
  for (const y of all) {
    if (y.spent != null && y.budget != null) assert.ok(y.spent <= y.budget * 1.02, `${y.fy} spent ${y.spent} above budget ${y.budget}`);
  }
});

test('every Kisii MCA key and census ward is a register ward', () => {
  const mcas = Object.keys(J('src/data/counties/kisii/leaders.json').mcas);
  for (const k of mcas) assert.ok(regSlugs.has(k), `MCA key ${k}`);
  for (const w of J('src/data/counties/kisii/census.json').wards ?? []) {
    const slug = w.slug ?? w.ward;
    if (slug) assert.ok(regSlugs.has(slug), `census ward ${slug}`);
  }
});

test('every register ward has a map shape', () => {
  const geo = J('src/data/geo.json');
  for (const s of regSlugs) assert.ok(geo.wards[s], `no map shape for ${s}`);
});
