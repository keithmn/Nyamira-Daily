import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegistry, children, staleSources } from './registry.js';

const source = { id: 's', title: 'Budget Guide (Treasury)', issuer: 'Treasury', docType: 'guide', fy: '2026/27', stage: 'statement', date: '2026-06-11', url: 'https://example.org/a.pdf', archive: null, sha256: null, file: null, pageOffset: 0, tolerance: { 'KSh bn': 0.1 }, nextExpected: null };
const P = 'ke.fy2026-27.statement';
const fig = (id, value, extra = {}) => ({ id: `${P}.${id}`, name: id, value, unit: 'KSh bn', fy: '2026/27', stage: 'statement', level: 'sector', grouping: 'g', money: 'national', label: 'official', source: 's', page: 'p.3', pdfPage: 3, checkedOn: '2026-11-02', checkedBy: 'claude-code', ...extra });
const build = (...figures) => buildRegistry({ rawSources: [source], rawFigures: figures.map((figure) => ({ file: 'test.json', figure })) });
const run = (...figures) => build(...figures).problems;
const rejects = (pattern, ...figures) => { const p = run(...figures); assert.ok(p.some((x) => pattern.test(x)), `expected ${pattern}, got: ${p.join(' | ') || 'no problems'}`); };
const without = (f, key) => { const { [key]: _, ...rest } = f; return rest; };

test('a clean set of figures has no problems', () => {
  assert.deepEqual(run(fig('total', 10), fig('a', 6, { parent: `${P}.total` }), fig('b', 4, { parent: `${P}.total` })), []);
});

for (const key of ['source', 'page', 'stage', 'label']) {
  test(`a figure with no ${key} is rejected`, () => { rejects(new RegExp(key), without(fig('a', 1), key)); });
}

test('a figure from an unknown source is rejected', () => { rejects(/unknown source/, fig('a', 1, { source: 'nowhere' })); });
test('a duplicate id is rejected', () => { rejects(/appears twice/, fig('a', 1), fig('a', 2)); });
test('an id whose year differs from the figure is rejected', () => { rejects(/the id says 2026\/27/, fig('a', 1, { fy: '2025/26' })); });

test('children must add up to their parent', () => {
  rejects(/parts add to 9/, fig('total', 10), fig('a', 5, { parent: `${P}.total` }), fig('b', 4, { parent: `${P}.total` }));
});
test('children may differ from their parent by the document\'s tolerance, and no more', () => {
  assert.deepEqual(run(fig('total', 10), fig('a', 5.9, { parent: `${P}.total` }), fig('b', 4, { parent: `${P}.total` })), []);
  rejects(/parts add to 9\.8/, fig('total', 10), fig('a', 5.8, { parent: `${P}.total` }), fig('b', 4, { parent: `${P}.total` }));
});
test('a parent that does not exist is rejected', () => { rejects(/unknown parent/, fig('a', 1, { parent: `${P}.nothing` })); });

test('printed parts must add up', () => {
  rejects(/parts add to 3, not 4/, fig('t', 4, { parts: [`${P}.a`, `${P}.b`] }), fig('a', 1), fig('b', 2));
  rejects(/unknown parts/, fig('t', 4, { parts: [`${P}.a`, `${P}.b`] }), fig('a', 1));
});

test('a calc must reproduce the stored value', () => {
  assert.deepEqual(run(fig('t', 3, { calc: { formula: 'a + b', inputs: [`${P}.a`, `${P}.b`], round: 1 } }), fig('a', 1), fig('b', 2)), []);
  rejects(/calc gives 3, stored value is 4/, fig('t', 4, { calc: { formula: 'a + b', inputs: [`${P}.a`, `${P}.b`], round: 1 } }), fig('a', 1), fig('b', 2));
});
test('a calc that names a missing input is rejected', () => {
  rejects(/unknown calc inputs/, fig('t', 3, { calc: { formula: 'a', inputs: [`${P}.a`], round: 1 } }));
});

test('no sum across stages', () => {
  rejects(/different stage/, fig('t', 3), fig('a', 3, { stage: 'estimates', parent: `${P}.t` }));
  rejects(/calc mixes/, fig('t', 3, { calc: { formula: 'a', inputs: [`${P}.a`], round: 0 } }), fig('a', 3, { stage: 'estimates' }));
});
test('no sum across years', () => {
  rejects(/different fy/, fig('t', 3), fig('a', 3, { id: 'ke.fy2025-26.statement.a', fy: '2025/26', parent: `${P}.t` }));
});
test('no sum across groupings', () => {
  rejects(/different grouping/, fig('t', 3), fig('a', 3, { grouping: 'other', parent: `${P}.t` }));
  rejects(/calc adds/, fig('t', 3, { calc: { formula: 'a + b', inputs: [`${P}.a`, `${P}.b`], round: 0 } }), fig('a', 1), fig('b', 2, { grouping: 'other' }));
});
test('a ratio may cross groupings, a sum may not', () => {
  assert.deepEqual(run(fig('t', 50, { unit: '%', calc: { formula: 'a / b * 100', inputs: [`${P}.a`, `${P}.b`], round: 0 } }), fig('a', 1), fig('b', 2, { grouping: 'other' })), []);
});
test('county money is never added to NG-CDF', () => {
  rejects(/different money/, fig('t', 3, { money: 'county' }), fig('a', 3, { money: 'ng-cdf', parent: `${P}.t` }));
  rejects(/different money/, fig('t', 3, { money: 'county', parts: [`${P}.a`, `${P}.b`] }), fig('a', 1, { money: 'county' }), fig('b', 2, { money: 'ng-cdf' }));
  rejects(/ng-cdf and county money/, fig('t', 3, { money: 'county', calc: { formula: 'a', inputs: [`${P}.a`], round: 0 } }), fig('a', 3, { money: 'ng-cdf' }));
});
test('county money is never added to national money', () => {
  rejects(/different money/, fig('t', 3), fig('a', 3, { money: 'county', parent: `${P}.t` }));
});

test('a listing within a figure cannot exceed it, and may cut the money another way', () => {
  assert.deepEqual(run(fig('t', 10), fig('a', 6, { grouping: 'key', within: `${P}.t` })), []);
  rejects(/add to 12, more than 10/, fig('t', 10), fig('a', 6, { within: `${P}.t` }), fig('b', 6, { within: `${P}.t` }));
  rejects(/"within" points to unknown/, fig('a', 6, { within: `${P}.t` }));
  rejects(/cannot sit within/, fig('t', 10), fig('a', 6, { stage: 'estimates', within: `${P}.t` }));
});

test('a printed page must fit the document\'s page offset', () => {
  rejects(/does not fit printed p\.3/, fig('a', 1, { pdfPage: 4 }));
});

test('only a person earns "verified"', () => {
  rejects(/only a person's check/, fig('a', 1, { label: 'verified' }));
  assert.deepEqual(run(fig('a', 1, { label: 'verified', checkedBy: 'MN' })), []);
});

test('a source must match the source shape', () => {
  const { problems } = buildRegistry({ rawSources: [{ ...source, url: 'not a link' }], rawFigures: [] });
  assert.ok(problems.some((p) => /Source s: url/.test(p)));
  assert.equal(buildRegistry({ rawSources: [source], rawFigures: [] }).problems.length, 0);
});

test('every problem names the figure, its source and its page', () => {
  const [problem] = run(fig('t', 3), fig('a', 4, { parent: `${P}.t` }));
  assert.match(problem, /ke\.fy2026-27\.statement\.t \(s, p\.3\)/);
});

test('children lists the figures under a parent', () => {
  const { figures } = build(fig('t', 3), fig('a', 3, { parent: `${P}.t` }));
  assert.deepEqual(children(figures, `${P}.t`).map((f) => f.name), ['a']);
});

test('staleSources lists documents past their expected date', () => {
  const sources = new Map([['s', { ...source, nextExpected: { date: '2027-06-30', what: 'Next guide' } }], ['n', { ...source, id: 'n' }]]);
  assert.deepEqual(staleSources(sources, '2027-06-30'), []);
  assert.deepEqual(staleSources(sources, '2027-07-01'), [{ id: 's', date: '2027-06-30', what: 'Next guide' }]);
});
