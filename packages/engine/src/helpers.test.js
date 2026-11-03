import test from 'node:test';
import assert from 'node:assert/strict';
import { citation } from './citation.js';
import { COUNTIES, countySlug } from './counties.js';
import { csvLine, parseCsv } from './csv.js';
import { evaluate } from './formula.js';
import { correctionEntries, diffValues, reusedIds, valuesOf } from './release.js';

test('evaluate follows the order of operations', () => {
  assert.equal(evaluate('a + b * c', [1, 2, 3]), 7);
  assert.equal(evaluate('(a + b) * c', [1, 2, 3]), 9);
  assert.equal(evaluate('a / b * 100', [1254.2, 2985.7]).toFixed(1), '42.0');
  assert.equal(evaluate('-a + 2', [1]), 1);
});
test('evaluate refuses anything that is not arithmetic', () => {
  assert.throws(() => evaluate('process.exit()', [1]), /unknown symbol|Cannot read/);
  assert.throws(() => evaluate('a; b', [1, 2]), /unknown symbol/);
  assert.throws(() => evaluate('(a + b', [1, 2]), /Unclosed/);
  assert.throws(() => evaluate('a b', [1, 2]), /Cannot read/);
});
test('evaluate refuses a letter with no input', () => { assert.throws(() => evaluate('a + b', [1]), /uses b/); });

test('diffValues finds what was added, changed and removed', () => {
  assert.deepEqual(diffValues({ a: 1, b: 2, c: 3 }, { a: 1, b: 5, d: 4 }), { added: ['d'], removed: [{ id: 'c', old: 3 }], changed: [{ id: 'b', old: 2, new: 5 }] });
});
test('correctionEntries gives old value, new value, reason and date', () => {
  const diff = { changed: [{ id: 'b', old: 2, new: 5 }], removed: [{ id: 'c', old: 3 }] };
  assert.deepEqual(correctionEntries(diff, { b: 'Misread', c: 'Duplicate' }, '2026-12-01'), [
    { date: '2026-12-01', id: 'b', old: 2, new: 5, reason: 'Misread' },
    { date: '2026-12-01', id: 'c', old: 3, new: null, reason: 'Duplicate' },
  ]);
});
test('a changed or removed figure needs a reason from a person', () => {
  assert.throws(() => correctionEntries({ changed: [{ id: 'b', old: 2, new: 5 }], removed: [] }, {}, '2026-12-01'), /need a reason.*b/);
  assert.throws(() => correctionEntries({ changed: [{ id: 'b', old: 2, new: 5 }], removed: [] }, { b: '  ' }, '2026-12-01'), /need a reason/);
  assert.throws(() => correctionEntries({ changed: [], removed: [{ id: 'c', old: 3 }] }, {}, '2026-12-01'), /need a reason.*c/);
});
test('an id that was retired cannot come back', () => {
  assert.deepEqual(reusedIds([{ a: 1, b: 2 }, { a: 1 }], { a: 1, b: 9, c: 3 }), ['b']);
  assert.deepEqual(reusedIds([], { a: 1 }), []);
});
test('valuesOf lists every figure in id order', () => {
  assert.deepEqual(Object.keys(valuesOf(new Map([['b', { id: 'b', value: 2 }], ['a', { id: 'a', value: 1 }]]))), ['a', 'b']);
});

test('citation follows the brief\'s form', () => {
  const figure = { id: 'ke.fy2026-27.estimates.gdp', page: 'Table 2, p.14' };
  assert.equal(citation(figure, { title: 'Budget Summary for the FY 2026/27 Budget (National Treasury, 30 April 2026)' }, '2026-11-02', 'Kenya Budget Explained'),
    'Kenya Budget Explained, data release 2026-11-02, figure ke.fy2026-27.estimates.gdp, from the Budget Summary for the FY 2026/27 Budget, Table 2, p.14.');
});

test('there are 47 counties, each with its own slug', () => {
  assert.equal(COUNTIES.length, 47);
  assert.equal(new Set(COUNTIES.map((c) => c.slug)).size, 47);
  assert.equal(countySlug('Nyamira'), 'nyamira');
  assert.equal(countySlug("Murang'a"), 'muranga');
  assert.equal(countySlug('Elgeyo/Marakwet'), 'elgeyo-marakwet');
});

test('CSV lines survive commas and quotes', () => {
  const text = [csvLine(['key', 'name']), csvLine(['a', 'Planning, "Support"'])].join('\n');
  assert.deepEqual(parseCsv(text), [{ key: 'a', name: 'Planning, "Support"' }]);
});
