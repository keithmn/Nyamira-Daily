import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { amountLabel, amountStatus, sumAmounts } from './project-amounts.js';

const wardspend = JSON.parse(readFileSync(new URL('../data/wardspend.json', import.meta.url), 'utf8'));

test('a reported zero stays distinct from an unavailable amount', () => {
  assert.equal(amountStatus(0), 'reported_zero');
  assert.equal(amountLabel(0), 'KSh 0');
  assert.equal(amountStatus(null), 'unavailable');
  assert.equal(amountStatus(undefined), 'unavailable');
  assert.equal(amountLabel(null), 'Amount not reported');
  assert.equal(amountLabel(undefined), 'Amount not reported');
});

test('positive project amounts are labeled as reported amounts', () => {
  assert.equal(amountStatus(125000), 'reported_amount');
  assert.equal(amountLabel(125000), 'KSh 125,000');
});

test('amount totals remain unavailable when any component amount is missing', () => {
  assert.equal(sumAmounts([100, 0, 50]), 150);
  assert.equal(sumAmounts([100, null, 50]), null);
  assert.equal(sumAmounts([]), null);
});

test('current ward budget calculations match the published ward totals', () => {
  const totals = wardspend.wardTotals.filter((total) => total.fy === '2025/26' && total.kind === 'budgeted');
  assert.equal(totals.length, 20);
  for (const total of totals) {
    const lines = wardspend.projects.filter((project) =>
      project.ward === total.ward && project.fy === total.fy && project.kind === total.kind
    );
    assert.equal(sumAmounts(lines.map((project) => project.amount)), total.amount, total.ward);
  }
});

test('invalid numeric values fail explicitly', () => {
  for (const amount of [NaN, Infinity, -1, '0']) {
    assert.throws(() => amountStatus(amount), TypeError);
  }
});
