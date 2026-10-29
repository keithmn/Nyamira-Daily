import assert from 'node:assert/strict';
import test from 'node:test';
import { latestRoadCondition, validateRoadConditions } from './road-conditions.js';
import { roadQuestions } from './road-questions.js';

const roads = [{ id: 'NYM-R0001' }, { id: 'NYM-R0002' }];
const report = (id, observedOn, grade, overrides = {}) => ({
  id, roadId: 'NYM-R0001', grade, scope: 'One visit', observedOn, source: 'Resident report', sourceRef: 'Reviewed report',
  evidence: 'unverified', reviewedAt: `${observedOn}T10:00:00Z`, publishedAt: `${observedOn}T11:00:00Z`, checks: [], ...overrides,
});

test('published road reports are validated and the newest date gives the condition', () => {
  const records = validateRoadConditions([report('a', '2026-09-01', 'good'), report('b', '2026-10-20', 'poor')], roads);
  const latest = latestRoadCondition(records, 'NYM-R0001');
  assert.equal(latest.grade, 'poor');
  assert.equal(latest.observedOn, '2026-10-20');
  assert.equal(latestRoadCondition(records, 'NYM-R0002'), null);
});

test('reports that disagree on the newest date show as not sure, with the conflict marked', () => {
  const latest = latestRoadCondition([report('a', '2026-10-20', 'good'), report('b', '2026-10-20', 'impassable')], 'NYM-R0001');
  assert.equal(latest.grade, 'unknown');
  assert.equal(latest.conflict, true);
});

test('invalid road reports are rejected', () => {
  assert.throws(() => validateRoadConditions([report('a', '2026-10-20', 'poor', { roadId: 'NYM-R9999' })], roads), /unknown road/);
  assert.throws(() => validateRoadConditions([report('a', '2026-10-20', 'awful')], roads), /grade/);
  assert.throws(() => validateRoadConditions([report('a', '2026-10-20', 'poor', { evidence: 'official' })], roads), /evidence/);
  assert.throws(() => validateRoadConditions([report('a', '2026-10-20', 'poor', { checks: [{ label: '', status: 'reported-no' }] })], roads), /invalid check/);
  assert.throws(() => validateRoadConditions([report('a', '2026-10-20', 'poor', { publishedAt: '2026-10-19T09:00:00Z' })], roads), /published before/);
});

test('a road reported complete but graded poor raises the gap as the first question', () => {
  const docOf = (r) => ({ title: r.sourceId, page: r.page });
  const records = [{ projectId: 'P-1', sourceId: 'adp2526', page: 'p.73', fy: '2023/24', kind: 'contract', amount: 3862742, status: '100% – Completed. Await payment' }];
  const condition = latestRoadCondition([report('b', '2026-10-20', 'poor')], 'NYM-R0001');
  const [first] = roadQuestions({ road: { confirmedGroup: false }, records, docOf, findingDoc: () => ({}), condition });
  assert.match(first.text, /Reported complete in the FY2023\/24 records, but a reviewed report from 2026-10-20 grades it Poor/);
  assert.equal(first.docs.length, 2);
  const none = roadQuestions({ road: { confirmedGroup: false }, records, docOf, findingDoc: () => ({}), condition: null });
  assert.equal(none.some((q) => /grades it/.test(q.text)), false);
});
