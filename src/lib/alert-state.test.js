import assert from 'node:assert/strict';
import test from 'node:test';
import { isLiveAlert } from './alert-state.js';

test('an old active alert remains active until a reviewer resolves it', () => {
  const alert = { status: 'active', updatedAt: '2020-01-01T00:00:00Z' };
  assert.equal(isLiveAlert(alert), true);
  assert.equal(isLiveAlert({ ...alert, status: 'monitoring' }), true);
  assert.equal(isLiveAlert({ ...alert, status: 'resolved' }), false);
});
