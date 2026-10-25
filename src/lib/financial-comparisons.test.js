import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const compare = JSON.parse(readFileSync(new URL('../data/compare.json', import.meta.url), 'utf8'));
const money = JSON.parse(readFileSync(new URL('../data/money.json', import.meta.url), 'utf8'));

test('county revenue comparison rates use matching actual and target scopes', () => {
  for (const county of compare.counties.filter((row) => row.county !== 'Kisii')) {
    assert.equal(
      county.osrComparablePct,
      Math.round((county.osrActual / county.osrTarget) * 100),
      county.county,
    );
    assert.equal(county.osrComparablePct, county.osrPerformancePct, county.county);
  }

  const kisii = compare.counties.find((row) => row.county === 'Kisii');
  assert.equal(kisii.osrPerformancePct, 178);
  assert.equal(kisii.osrComparablePct, 64);
  assert.equal(Math.round((556_540_000 / kisii.osrTarget) * 100), kisii.osrComparablePct);
  assert.match(kisii.pages.osrComparablePct, /p\.183/);
});

test('national revenue comparison rate is based on the aggregate actual and target', () => {
  assert.equal(
    compare.national.osrComparablePct,
    Math.round((compare.national.osrActual / compare.national.osrTarget) * 100),
  );
  assert.equal(compare.national.osrComparablePct, 77);
});

test('money data distinguishes budget, expenditure, and equitable-share reporting from cash releases', () => {
  assert.match(money.note, /approved\/revised/);
  assert.match(money.note, /actual spending/);
  assert.match(money.note, /do not include a separate cash-release series/);
  for (const year of money.years) {
    assert.ok(Number.isFinite(year.budget), year.fy);
    assert.ok(Number.isFinite(year.spent), year.fy);
    assert.ok(Number.isFinite(year.eqShare), year.fy);
  }
});
