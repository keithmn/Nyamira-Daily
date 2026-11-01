import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildFacts, moneyFacts, wardFacts } from './facts.js';

const money = JSON.parse(readFileSync(new URL('../data/money.json', import.meta.url), 'utf8'));
const labels = new Set(['verified', 'audit', 'official', 'unverified']);

test('every money fact carries a source link, a period and a known evidence label', () => {
  const rows = moneyFacts(money);
  assert.ok(rows.length > 0);
  for (const r of rows) {
    assert.ok(r.source.url?.startsWith('https://'), r.id);
    assert.ok(r.period?.startsWith('FY'), r.id);
    assert.ok(labels.has(r.evidence), r.id);
    assert.equal(typeof r.value, 'number', r.id);
  }
});

test('unknown values get no row instead of a guess', () => {
  const rows = moneyFacts({ years: [{ fy: '2013/14', budget: 1, pending: null, src: 'https://example.org' }] });
  assert.deepEqual(rows.map((r) => r.id), ['money.2013/14.budget']);
});

test('ward facts keep their evidence labels and ids are unique', () => {
  const receipts = [{ slug: 'esise', name: 'Esise', services: { total: 3, evidence: 'unverified' }, wardProjects2526: { amount: 10, lines: 2, evidence: 'official', source: 'PBB' }, roadContracts2324: null }];
  const rows = buildFacts({ money, receipts });
  const ward = wardFacts(receipts);
  assert.equal(ward.find((r) => r.id === 'ward.esise.services').evidence, 'unverified');
  assert.equal(new Set(rows.map((r) => r.id)).size, rows.length);
});
