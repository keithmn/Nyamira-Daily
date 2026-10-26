import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderFacilitiesCsv } from './build-facilities-csv.js';

test('facility CSV remains a reproducible export of the canonical registry', () => {
  const csvPath = fileURLToPath(new URL('../public/files/facilities-v1.csv', import.meta.url));
  assert.equal(renderFacilitiesCsv(), fs.readFileSync(csvPath, 'utf8'));
});
