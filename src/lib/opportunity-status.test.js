import assert from 'node:assert/strict';
import opportunities from '../data/opportunities.json' with { type: 'json' };
import test from 'node:test';
import { deadlineAt, daysUntilDeadline, opportunityState, opportunitiesAt } from './opportunity-status.js';

test('parses an EAT deadline as the corresponding UTC instant', () => {
  assert.equal(deadlineAt('2026-10-28 10:30 EAT').toISOString(), '2026-10-28T07:30:00.000Z');
  assert.equal(
    deadlineAt('2026-06-12 10:30 EAT (extended from 2026-06-09 by Addendum No. 1)').toISOString(),
    '2026-06-12T07:30:00.000Z',
  );
  assert.equal(deadlineAt('2025-12-15 (tertiary forms available until this date)').toISOString(), '2025-12-15T20:59:59.000Z');
});

test('date-only deadlines end at the end of that date in Nairobi time', () => {
  assert.equal(deadlineAt('2026-10-28').toISOString(), '2026-10-28T20:59:59.000Z');
});

test('remaining days use Nairobi calendar days, not elapsed 24-hour blocks', () => {
  const item = { closes: '2026-10-28 10:30 EAT' };
  assert.equal(daysUntilDeadline(item, new Date('2026-10-27T20:30:00Z')), 1);
  assert.equal(daysUntilDeadline(item, new Date('2026-10-28T07:30:00Z')), 0);
});

test('rejects invalid or missing dates instead of treating them as open', () => {
  assert.equal(deadlineAt('2026-02-30 10:30 EAT'), null);
  assert.equal(deadlineAt('2026-10-28 10:30 GMT'), null);
  assert.equal(deadlineAt('unknown'), null);
  assert.equal(opportunityState({ status: 'open', closes: null }, new Date('2026-10-25T00:00:00Z')), 'deadline_unknown');
});

test('an open item changes to closed immediately after its stated deadline', () => {
  const item = { status: 'open', closes: '2026-10-28 10:30 EAT' };
  assert.equal(opportunityState(item, new Date('2026-10-28T07:30:00Z')), 'open');
  assert.equal(opportunityState(item, new Date('2026-10-28T07:30:00.001Z')), 'closed');
});

test('source cancellation and closure remain distinct from deadline-derived closure', () => {
  const now = new Date('2026-10-25T00:00:00Z');
  assert.equal(opportunityState({ status: 'cancelled', closes: '2026-10-28' }, now), 'cancelled');
  assert.equal(opportunityState({ status: 'closed', closes: null }, now), 'closed');
  assert.equal(opportunityState({ status: 'other', closes: '2026-10-28' }, now), 'unknown');
});

test('all items in one evaluation use the same supplied instant', () => {
  const items = [
    { id: 1, status: 'open', closes: '2026-10-28 10:30 EAT' },
    { id: 2, status: 'open', closes: null },
    { id: 3, status: 'cancelled', closes: null },
  ];
  assert.deepEqual(
    opportunitiesAt(items, new Date('2026-10-28T08:00:00Z')).map((item) => item.availability),
    ['closed', 'deadline_unknown', 'cancelled'],
  );
});

test('current source items do not classify an open item without a usable deadline as open', () => {
  const evaluated = opportunitiesAt(opportunities.items, new Date('2026-10-25T20:26:34Z'));
  for (const item of evaluated) {
    if (item.status === 'open') {
      assert.ok(deadlineAt(item.closes), item.title);
      assert.notEqual(item.availability, 'deadline_unknown', item.title);
    }
  }
  assert.equal(evaluated.filter((item) => item.availability === 'open').length, 3);
});
