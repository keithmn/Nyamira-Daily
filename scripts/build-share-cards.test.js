import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { headline } from './build-share-cards.mjs';

const wards = JSON.parse(readFileSync(new URL('../src/data/wards.json', import.meta.url), 'utf8'));

test('every ward has a committed share card (run scripts/build-share-cards.mjs after ward data changes)', () => {
  for (const w of wards) assert.ok(existsSync(new URL(`../public/brand/share/ward-${w.slug}.png`, import.meta.url)), w.slug);
});

test('a card names its evidence label and source, and says when budget lines are printed as KSh 0', () => {
  for (const w of wards) {
    const h = headline(w.slug);
    if (!h) continue;
    assert.equal(h.label, 'Official claim');
    assert.match(h.source, /Programme Based Budget 2025\/26/);
  }
  assert.match(headline('nyansiongo').note, /printed as KSh 0/);
});
