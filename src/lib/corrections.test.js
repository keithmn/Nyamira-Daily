import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const corrections = JSON.parse(readFileSync(new URL('../data/corrections.json', import.meta.url), 'utf8'));

test('accepted correction records have a date, affected page, change, reason, and source', () => {
  for (const item of corrections.items) {
    assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(item.page);
    assert.ok(item.changed);
    assert.ok(item.reason);
    assert.ok(item.source);
  }
});
