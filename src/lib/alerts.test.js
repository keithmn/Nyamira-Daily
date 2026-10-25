import assert from 'node:assert/strict';
import test from 'node:test';
import { alertDismissalKey } from './alert-dismissal.js';

test('a materially updated alert gets a new banner dismissal key', () => {
  const first = { id: 'ALERT-1', updatedAt: '2026-10-24T10:00:00Z' };
  const updated = { ...first, updatedAt: '2026-10-24T12:00:00Z' };
  assert.notEqual(alertDismissalKey(first), alertDismissalKey(updated));
});
