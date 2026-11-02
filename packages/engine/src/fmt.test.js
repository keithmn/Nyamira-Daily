import test from 'node:test';
import assert from 'node:assert/strict';
import { full, ksh, longDate, money, num, ordinal, percent, toShillings } from './fmt.js';

test('the main site formats stay as they were', () => {
  assert.equal(ksh(6265653089), 'KSh 6.27B');
  assert.equal(ksh(371666667), 'KSh 371.7M');
  assert.equal(ksh(null), '—');
  assert.equal(num(1234567), '1,234,567');
});

test('money uses words, and the unit limits the decimals', () => {
  assert.equal(money(4820.4, 'KSh bn'), 'KSh 4.82 trillion');
  assert.equal(money(43.6, 'KSh bn'), 'KSh 43.6 billion');
  assert.equal(money(1, 'KSh bn'), 'KSh 1.0 billion');
  assert.equal(money(6265653089), 'KSh 6.27 billion');
  assert.equal(money(371666667), 'KSh 371.7 million');
  assert.equal(money(458940, 'KSh m'), 'KSh 458.9 billion');
  assert.equal(money(950000), 'KSh 950,000');
});

test('one amount reads the same whichever unit its document used', () => {
  assert.equal(money(428, 'KSh bn'), 'KSh 428.0 billion');
  assert.equal(money(428000000000), 'KSh 428.0 billion');
});

test('money in Kiswahili puts the word first', () => {
  assert.equal(money(4820.4, 'KSh bn', 'sw'), 'KSh trilioni 4.82');
  assert.equal(money(6265653089, 'KSh', 'sw'), 'KSh bilioni 6.27');
  assert.equal(money(371666667, 'KSh', 'sw'), 'KSh milioni 371.7');
});

test('money refuses anything that is not money', () => {
  assert.throws(() => money(42, '%'), /Not a money unit/);
  assert.throws(() => toShillings(3, 'count'), /Not a money unit/);
});

test('full amounts and percentages', () => {
  assert.equal(full(6265653089), 'KSh 6,265,653,089');
  assert.equal(percent(3.164), '3.2%');
  assert.equal(percent(69.75, 0), '70%');
});

test('ordinals', () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 41].map((n) => ordinal(n)), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '41st']);
  assert.equal(ordinal(41, 'sw'), 'ya 41');
});

test('dates keep the precision the document gives', () => {
  assert.equal(longDate('2026-06-11'), '11 June 2026');
  assert.equal(longDate('2026-06'), 'June 2026');
  assert.equal(longDate('2026-06-11', 'sw'), '11 Juni 2026');
  assert.equal(longDate('2026-02', 'sw'), 'Februari 2026');
});
