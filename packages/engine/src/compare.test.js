import test from 'node:test';
import assert from 'node:assert/strict';
import { compareFigures, stageChange, sumFigures } from './compare.js';

const fig = (value, extra = {}) => ({ id: 'x', value, fy: '2026/27', stage: 'statement', grouping: 'g', money: 'county', unit: 'KSh bn', ...extra });

test('sumFigures adds like with like', () => { assert.equal(sumFigures([fig(1), fig(2)]), 3); });
test('sumFigures refuses an empty list', () => { assert.throws(() => sumFigures([]), /Nothing to add up/); });
for (const [key, value] of [['fy', '2025/26'], ['stage', 'estimates'], ['grouping', 'other'], ['money', 'ng-cdf'], ['unit', 'KSh m']]) {
  test(`sumFigures refuses figures with different ${key}`, () => {
    assert.throws(() => sumFigures([fig(1), fig(2, { [key]: value })]), new RegExp(`different ${key}`));
  });
}
test('sumFigures refuses county money with national money', () => {
  assert.throws(() => sumFigures([fig(1), fig(2, { money: 'national' })]), /different money/);
});

test('compareFigures gives the change between two years, like with like', () => {
  assert.deepEqual(compareFigures(fig(100, { fy: '2025/26' }), fig(110)), { from: 100, to: 110, change: 10, percent: 10 });
});
test('compareFigures gives no percentage from zero', () => { assert.equal(compareFigures(fig(0), fig(5)).percent, null); });
for (const [key, value] of [['stage', 'estimates'], ['grouping', 'other'], ['money', 'national'], ['unit', 'KSh m']]) {
  test(`compareFigures refuses different ${key}`, () => {
    assert.throws(() => compareFigures(fig(1), fig(2, { [key]: value })), new RegExp(`different ${key}`));
  });
}

test('stageChange puts stages in budget order and shows each step', () => {
  const steps = stageChange([fig(428, { stage: 'law', id: 'b' }), fig(420, { stage: 'estimates', id: 'a' })]);
  assert.deepEqual(steps.map((s) => [s.stage, s.change]), [['estimates', null], ['law', 8]]);
});
test('stageChange refuses two figures for one stage', () => {
  assert.throws(() => stageChange([fig(1), fig(2)]), /one figure per stage/);
});
test('stageChange refuses different years, groupings or money', () => {
  assert.throws(() => stageChange([fig(1), fig(2, { stage: 'law', fy: '2025/26' })]), /different fy/);
  assert.throws(() => stageChange([fig(1), fig(2, { stage: 'law', grouping: 'other' })]), /different grouping/);
  assert.throws(() => stageChange([fig(1), fig(2, { stage: 'law', money: 'national' })]), /different money/);
});
test('stageChange shows two money units side by side but works out no change between them', () => {
  const steps = stageChange([fig(6.3), fig(6265653089, { stage: 'law', unit: 'KSh' })]);
  assert.deepEqual(steps.map((s) => [s.unit, s.change]), [['KSh bn', null], ['KSh', null]]);
});
test('stageChange refuses money beside a percentage', () => {
  assert.throws(() => stageChange([fig(1), fig(2, { stage: 'law', unit: '%' })]), /different unit/);
});
