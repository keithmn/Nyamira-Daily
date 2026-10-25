import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicEntry } from './publication.js';

const now = new Date('2026-10-25T12:00:00Z');

test('drafts stay out of public outputs unless local draft preview is explicitly enabled', () => {
  assert.equal(isPublicEntry({ draft: true }, 'stories', now), false);
  assert.equal(isPublicEntry({ draft: true }, 'stories', now, true), true);
});

test('scheduled entries stay out until their publication instant', () => {
  const entry = { draft: false, publishAt: new Date('2026-10-25T13:00:00Z') };
  assert.equal(isPublicEntry(entry, 'alerts', now), false);
  assert.equal(isPublicEntry(entry, 'alerts', new Date('2026-10-25T13:00:00Z')), true);
});

test('a future number-of-the-week date is not published early', () => {
  assert.equal(isPublicEntry({ draft: false, week: new Date('2026-10-26T00:00:00Z') }, 'numbers', now), false);
});

test('past scheduled entries and ordinary published entries remain public', () => {
  assert.equal(isPublicEntry({ draft: false, publishAt: new Date('2026-10-24T00:00:00Z') }, 'stories', now), true);
  assert.equal(isPublicEntry({ draft: false }, 'stories', now), true);
});
