import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import money, { fiscalYears, LAST_FY } from './county-money.js';

const old = JSON.parse(readFileSync(new URL('../data/money.json', import.meta.url), 'utf8'));

test('thirteen years, FY2013/14 to FY2025/26, in order', () => {
  assert.deepEqual(fiscalYears().slice(0, 2), ['2013/14', '2014/15']);
  assert.equal(money.years.length, 13);
  assert.equal(money.years.at(-1).fy, LAST_FY);
});

test('FY2025/26 comes from the Controller of Budget figures in the registry', () => {
  const y = money.years.at(-1);
  assert.equal(y.budget, 8646.3);
  assert.equal(y.spent, 7009.26);
  assert.equal(y.dev, 1926.23);
  assert.equal(y.rec, 5083.03);
  assert.equal(y.devAbs, 58.71);
  assert.equal(y.osr, 613.01);
  assert.equal(y.eqReceived, 6073.43);
  assert.equal(y.pending, null, 'the FY2025/26 report gives trade payables, not pending bills');
  assert.match(y.osrNote, /483\.35M hospital fees/);
});

test('every year money.json had is the same here, except the equitable share, which is now split', () => {
  for (const o of old.years) {
    const y = money.years.find((x) => x.fy === o.fy);
    for (const k of ['spent', 'budget', 'dev', 'devAbs', 'osr', 'osrTarget', 'rec', 'pending']) {
      if (o[k] == null) { assert.equal(y[k], null, `${o.fy} ${k}`); continue; }
      const tol = o.fy === '2024/25' && ['budget', 'spent', 'dev'].includes(k) ? 10 : 0; // money.json rounded these
      assert.ok(Math.abs(y[k] - o[k]) <= tol, `${o.fy} ${k}: ${y[k]} against ${o[k]}`);
    }
    // money.json's one column was one measure or the other; it rounded the report's 'Kshs.4.81 billion' to 10m
    assert.ok([y.eqAllocated, y.eqReceived].some((v) => v != null && Math.abs(v - o.eqShare) <= 10), `${o.fy} equitable share`);
  }
});

test('the equitable share says which measure it is, and FY2021/22 shows both differ', () => {
  const y = money.years.find((x) => x.fy === '2021/22');
  assert.equal(y.eqAllocated, 5135.34);
  assert.equal(y.eqReceived, 4724.51);
  assert.match(y.eqNote, /4,724,512,833/);
});

test('each year cites its own report', () => {
  for (const y of money.years) assert.match(y.src, /^https:\/\/cob\.go\.ke\//, y.fy);
});
