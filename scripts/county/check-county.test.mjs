import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCounty, legacyAgrees, loadAll, programmeSums, quarterMatchesBudget } from './check-county.mjs';

const PBB = 'ke.fy2025-26.estimates.county.nyamira';

test('the county registry passes every check', () => {
  const { problems, figures } = checkCounty();
  assert.deepEqual(problems, []);
  assert.ok(figures > 500, `only ${figures} county figures`);
});

test('a programme row that does not add up to its vote is caught', () => {
  const { figures } = loadAll();
  const id = `${PBB}.programme.5266.p2.r3`; // Education: school feeding, KSh 15,000,000
  assert.equal(figures.get(id).value, 15000000);
  const broken = new Map(figures);
  broken.set(id, { ...figures.get(id), value: 15000001 });
  assert.match(programmeSums(broken).join('\n'), /Vote 5266 .*Table 9 rows add to 579165562, Table 8 prints 579165561/);
});

test('every vote has programme rows, and they add up to all three printed totals', () => {
  const { figures } = loadAll();
  for (const v of [5261, 5279, 5284]) assert.ok([...figures.keys()].some((id) => id.startsWith(`${PBB}.programme.${v}.`)), `vote ${v} has no rows`);
  assert.deepEqual(programmeSums(figures), []);
});

test('a money.json value that disagrees with the registry is caught', () => {
  const { figures } = loadAll();
  const id = 'ke.fy2017-18.spent.county.nyamira.osr-actual';
  assert.equal(figures.get(id).value, 96.62);
  const broken = new Map(figures);
  broken.set(id, { ...figures.get(id), value: 96.63 });
  assert.match(legacyAgrees(broken).join('\n'), /money\.json 2017\/18 osr is 96\.62, the registry has 96\.63/);
});

test('Keroka and the Disability Board use the vote codes of Tables 9, 11 and 12', () => {
  const { figures } = loadAll();
  assert.equal(figures.get(`${PBB}.vote.5280`).value, 48559379); // Keroka Municipality
  assert.equal(figures.get(`${PBB}.vote.5282`).value, 4998185); // Nyamira Disability Board
});

test('the wage bill share is worked out from the printed parts and matches the printed 39.3%', () => {
  const { figures } = loadAll();
  const f = figures.get(`${PBB}.wage-share`);
  assert.equal(f.value, 39.3);
  assert.equal(f.calc.formula, '(a + b) / c * 100');
});

test('figures the national registry holds are not repeated in the county registry', () => {
  const { countyIds } = loadAll();
  for (const k of ['budget', 'spent', 'dev-spent', 'dev-absorption']) {
    assert.ok(!countyIds.has(`ke.fy2024-25.spent.county.nyamira.${k}`), `${k} FY2024/25 is repeated`);
    assert.ok(!countyIds.has(`ke.fy2025-26.spent.county.nyamira.${k}`), `${k} FY2025/26 is repeated`);
  }
  assert.ok(countyIds.has('ke.fy2024-25.spent.county.nyamira.osr-actual'));
});

test('the Q4 report: Medical Services spent 4.0% of its development budget, as printed and as worked out', () => {
  const { figures } = loadAll();
  const Q4 = 'ke.fy2025-26.spent.county.nyamira.q4.vote.5267.development';
  assert.equal(figures.get(`${Q4}.actual`).value, 16845242);
  assert.equal(figures.get(`${Q4}.target`).value, 419302600);
  assert.equal(figures.get(`${Q4}.share`).value, 4);
});

test('a Q4 budget that differs from the Programme Based Budget is caught', () => {
  const { figures } = loadAll();
  const id = 'ke.fy2025-26.spent.county.nyamira.q4.vote.5266.development.target';
  const broken = new Map(figures);
  broken.set(id, { ...figures.get(id), value: figures.get(id).value + 5 });
  assert.match(quarterMatchesBudget(broken).join('\n'), /vote\.5266\.development\.target is 108900005; the Programme Based Budget prints 108900000/);
  assert.deepEqual(quarterMatchesBudget(figures), []);
});

test('the equitable share is filed as allocated or received, as each report says', () => {
  const { figures } = loadAll();
  assert.equal(figures.get('ke.fy2021-22.spent.county.nyamira.equitable-share-allocated').value, 5135.34);
  assert.equal(figures.get('ke.fy2015-16.spent.county.nyamira.equitable-share-received').value, 4150);
  assert.ok(!figures.has('ke.fy2021-22.spent.county.nyamira.equitable-share-received'));
});

test('no county figure is labelled verified without a person', () => {
  const { figures, countyIds } = loadAll();
  for (const id of countyIds) assert.notEqual(figures.get(id).label, 'verified', id);
});
