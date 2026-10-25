import assert from 'node:assert/strict';
import test from 'node:test';
import { showStatusText } from './show-status.js';

test('a scheduled programme is not described as live', () => {
  const message = showStatusText({ status: 'scheduled', start: 22, end: 23 });
  assert.match(message, /scheduled/);
  assert.match(message, /does not confirm that it is live/);
  assert.doesNotMatch(message, /On air now/);
});

test('planned, confirmed-live, and recorded states are distinct', () => {
  assert.match(showStatusText({ status: 'planned' }), /planned/);
  assert.match(showStatusText({ status: 'confirmed_live', confirmedAt: '25 Oct 2026 22:00 EAT', liveUrl: 'https://example.org/live' }), /was confirmed/);
  assert.match(showStatusText({ status: 'confirmed_live' }), /not confirmed/);
  assert.match(showStatusText({ status: 'recorded', recordingUrl: 'https://example.org/episode' }), /recording is available/);
  assert.match(showStatusText({ status: 'recorded' }), /no recording link/);
});
