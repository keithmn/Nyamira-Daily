import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildData } from './build-data.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

test('data.json is reproducible from build-data.mjs and src/data', () => {
  const built = buildData(join(HERE, '..', 'src', 'data'));
  assert.deepEqual(built, JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8')));
});

test('kenya-budget.html embeds the current data.json', () => {
  const html = readFileSync(join(HERE, 'kenya-budget.html'), 'utf8');
  const m = html.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/);
  assert.deepEqual(JSON.parse(m[1]), JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8')));
});
