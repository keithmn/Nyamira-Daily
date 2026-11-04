import { test } from 'node:test';
import assert from 'node:assert/strict';
import { budgetYear, departments, questionsFor, slugify, track } from './county-budget.js';

test('each KSh 100 goes and comes in parts that are printed figures, and the shares make 100', () => {
  const y = budgetYear();
  assert.equal(y.total.value, 8646298391);
  assert.equal(Math.round(y.out.reduce((a, p) => a + p.share, 0) * 1e6) / 1e6, 100);
  assert.equal(y.into.reduce((a, p) => a + p.value, 0), y.revenueTotal.value);
  assert.equal(y.out.find((p) => p.key === 'staff').value, 3401083954);
  assert.equal(y.into.find((p) => p.key === 'osr').value, 868710000);
});

test('24 departments, adding up to the county budget, each with programmes that add up to it', () => {
  const list = departments();
  assert.equal(list.length, 24);
  assert.equal(list.reduce((a, d) => a + d.total, 0), 8646298391);
  for (const d of list) assert.equal(d.programmes.reduce((a, p) => a + p.total, 0), d.total, d.name);
});

test('programme addresses are unique within a department and readable', () => {
  for (const d of departments()) {
    const slugs = d.programmes.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length, d.name);
    for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/);
  }
  assert.equal(slugify('Crop, agribusiness and land development'), 'crop-agribusiness-and-land-development');
});

test('questions follow the rule: under 75% spent, restated from the printed numbers', () => {
  const medical = departments().find((d) => d.vote === '5267');
  const qs = questionsFor(medical);
  assert.equal(qs.length, 1);
  assert.match(qs[0].text, /spent 4\.0% of its development budget: KSh 16\.8 million of KSh 419\.3 million/);
  const finance = departments().find((d) => d.vote === '5263');
  assert.deepEqual(questionsFor(finance), []);
  for (const q of track().list.flatMap((d) => d.questions)) assert.doesNotMatch(q.text, /corrupt|stole|loot|ghost/i);
});

test('the year\'s spending lists every department, lowest share first, with both published totals', () => {
  const t = track();
  assert.equal(t.list.length, 24);
  assert.ok(t.list[0].total.share <= t.list.at(-1).total.share);
  assert.equal(t.county.spent.value, 7105627509);
  assert.equal(t.cob.spent.value, 7009.26);
});

test('ward projects come from the same budget, mapped to departments', () => {
  const roads = departments().find((d) => d.vote === '5270');
  assert.equal(roads.wardProjects.lines, 51);
  const assembly = departments().find((d) => d.vote === '5261');
  assert.equal(assembly.wardProjects.lines, 0);
});
