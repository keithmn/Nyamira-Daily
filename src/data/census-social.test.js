import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const published = require('./census-social.json');
const research = require('../../data-src/research-notes/social/census-social.json');

test('published census figures are exactly the checked extraction, with sources', () => {
  assert.ok(published.source.url.startsWith('https://www.knbs.or.ke/'));
  for (const table of published.tables) {
    const original = research.tables.find((t) => t.id === table.id);
    assert.ok(original, `${table.id} is not in the research extraction`);
    assert.equal(table.rows.length, original.rows.length, `${table.id}: row count changed`);
    table.rows.forEach((row, i) => {
      const o = original.rows[i];
      assert.deepEqual([row.area, row.category, row.printed, row.pagePrinted], [o.area, o.category, o.printed, o.pagePrinted], `${table.id} row ${i}`);
      // KNBS prints a dash where there is nothing to report; that stays empty, never zero
      if (row.printed === '-') assert.equal(row.value, null, `${table.id} row ${i}: a dash must stay empty`);
      else assert.equal(row.value, Number(row.printed.replaceAll(',', '')), `${table.id} row ${i}: value and printed text disagree`);
    });
    for (const area of published.areas) assert.ok(table.rows.some((r) => r.area === area), `${table.id}: no ${area}`);
  }
});
