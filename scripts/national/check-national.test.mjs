// Tests against the real data: the figures, as loaded, must say what the documents say.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '@kbe/engine/csv';
import { buildRegistry, children, readRegistry } from '@kbe/engine/registry';
import { compareFigures, stageChange, sumFigures } from '@kbe/engine/compare';
import { citation } from '@kbe/engine/citation';
import { COUNTIES, countySlug } from '@kbe/engine/counties';
import { checkNational } from './check-national.mjs';
import { compareReadings, countyChecks } from './double-entry.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { sources, figures, problems } = buildRegistry(readRegistry(join(root, 'data/national')));
const fig = (id) => { const f = figures.get(id); assert.ok(f, `missing ${id}`); return f; };
const value = (id) => fig(id).value;
const csv = (p) => parseCsv(readFileSync(join(root, 'data-src/national', p), 'utf8'));
const A = 'ke.fy2026-27.approved', L = 'ke.fy2026-27.law';

test('check:national passes on the committed data', () => {
  const { errors } = checkNational('2026-11-02');
  assert.deepEqual(errors, []);
});
test('the registry has no problems', () => { assert.deepEqual(problems, []); });

test('no figure is verified on Claude Code\'s check alone', () => {
  assert.equal([...figures.values()].filter((f) => f.label === 'verified' && f.checkedBy === 'claude-code').length, 0);
});

test('Appropriation Act: the grand total as printed on p.422', () => {
  assert.equal(value(`${A}.total.supply`), 2186508892628);
  assert.equal(value(`${A}.total.aia`), 736198020556);
  assert.equal(fig(`${A}.total.supply`).page, 'Schedule, p.422');
});
test('Appropriation Act: every vote and programme is loaded', () => {
  const rows = csv('appropriation-act-2026/extract.csv');
  assert.equal(rows.filter((r) => !r.programme).length, 151);
  assert.equal(rows.filter((r) => r.programme).length, 329);
  assert.equal(rows.filter((r) => !r.programme && r.kind === 'R').length, 87);
  for (const r of rows) for (const col of ['supply', 'aia']) if (r[col] !== '') {
    const kind = r.kind === 'R' ? 'recurrent' : 'development';
    assert.equal(value(`${A}.vote.${r.vote}.${kind}${r.programme ? `.programme.${r.programme}` : ''}.${col}`), Number(r[col]));
  }
});
test('Appropriation Act: votes add to their class, classes to the cluster, clusters to the total', () => {
  for (const col of ['supply', 'aia']) {
    assert.equal(children(figures, `${A}.total.${col}`).length, 2);
    for (const cluster of ['central', 'commissions']) assert.equal(children(figures, `${A}.cluster.${cluster}.${col}`).length, 2);
  }
  assert.equal(children(figures, `${A}.class.central-recurrent.supply`).reduce((t, f) => t + f.value, 0), value(`${A}.class.central-recurrent.supply`));
});
test('Appropriation Act: a dash in the Act gives no figure, never a zero', () => {
  assert.equal(figures.has(`${A}.vote.1082.development.programme.0411000.aia`), false);
  assert.equal(value(`${A}.vote.1082.development.programme.0411000.supply`), 455000000);
  assert.equal([...figures.values()].filter((f) => f.source === 'appropriation-act-2026' && f.value === 0).length, 0);
});
test('Appropriation Act: a row corrected from the page image says so', () => {
  assert.equal(value(`${A}.vote.1082.development.programme.0402000.supply`), 7007205635);
  assert.match(fig(`${A}.vote.1082.development.programme.0402000.supply`).note, /page image/);
});
test('Appropriation Act: damaged names are repaired', () => {
  assert.match(fig(`${A}.vote.1024.recurrent.supply`).name, /Immigration and Citizen Services/);
  assert.match(fig(`${A}.vote.2091.recurrent.supply`).name, /Teachers Service Commission/);
});
test('the Act agrees with the Guide on total spending, across the securitised levy', () => {
  const gross = (value(`${A}.total.supply`) + value(`${A}.total.aia`)) / 1e9;
  assert.equal(gross.toFixed(1), '2922.7');
  const guide = value('ke.fy2026-27.statement.use.recurrent') + value('ke.fy2026-27.statement.use.development');
  assert.ok(Math.abs(gross - guide - value('ke.fy2026-27.statement.total.securitised-levy')) < 0.2);
});
test('the five education votes gross 784.48bn, the Guide\'s 784.5, not the press 781.4', () => {
  const votes = [['1064', 'recurrent'], ['1064', 'development'], ['1065', 'recurrent'], ['1065', 'development'], ['1066', 'recurrent'], ['1066', 'development'], ['1067', 'recurrent'], ['1067', 'development'], ['2091', 'recurrent'], ['2091', 'development']];
  const sum = votes.flatMap(([v, k]) => ['supply', 'aia'].map((c) => figures.get(`${A}.vote.${v}.${k}.${c}`)?.value ?? 0)).reduce((a, b) => a + b, 0);
  assert.equal((sum / 1e9).toFixed(2), '784.48');
  assert.equal(value('ke.fy2026-27.statement.sector.education'), 784.5);
  const press = fig(`${A}.press.education`);
  assert.deepEqual([press.value, press.label], [781.4, 'unverified']);
  assert.match(press.note, /784\.48/);
});

test('County Act: the totals as printed on p.461', () => {
  assert.equal(value(`${L}.county-total.equitable-share`), 428000000000);
  assert.equal(value('ke.fy2025-26.law.county-total.equitable-share'), 415000000000);
  assert.equal(children(figures, `${L}.county-total.equitable-share`).length, 47);
});
test('County Act: Nyamira\'s row', () => {
  assert.equal(value(`${L}.county.nyamira.equitable-share`), 6265653089);
  assert.equal(value(`${L}.county.nyamira.baseline`), 5359987994);
  assert.equal(value(`${L}.county.nyamira.affirmative-action`), 371666667);
  assert.equal(value(`${L}.county.nyamira.formula`), 533998429);
  assert.equal(value('ke.fy2025-26.law.county.nyamira.equitable-share'), 6073434356);
});
test('County Act: twelve counties get affirmative action, and the rest show none, not zero', () => {
  assert.equal(children(figures, `${L}.county-total.affirmative-action`).length, 12);
  assert.equal(figures.has(`${L}.county.baringo.affirmative-action`), false);
});
test('County Act: the formula weights add to 100', () => {
  assert.equal(['population', 'equal-share', 'poverty', 'geographical-size'].reduce((t, k) => t + value(`${L}.formula-weight.${k}`), 0), 100);
});
test('County Act: every row is marked for a person to check first', () => {
  assert.match(fig(`${L}.county.nyamira.baseline`).note, /person should check/);
  assert.ok(csv('person-checks.csv').some((c) => c.table.startsWith('county-allocation-act-2026') && c.status === 'waiting'));
});
test('County Act: one county moves through the stages, in order, with no change across units', () => {
  const steps = stageChange([fig(`${L}.county.nyamira.equitable-share`), fig('ke.fy2026-27.statement.county.nyamira.equitable-share'), fig('ke.fy2026-27.recommendation.county.nyamira.equitable-share')]);
  assert.deepEqual(steps.map((s) => s.stage), ['recommendation', 'statement', 'law']);
  assert.ok(steps.every((s) => s.change === null));
});
test('every county in the data is one of the 47, in all three documents', () => {
  const slugs = COUNTIES.map((c) => c.slug).sort();
  for (const table of ['county-allocation-act-2026', 'cra-recommendation-2026-27', 'mwananchi-guide-2026-27']) {
    assert.deepEqual(csv(`${table}/typed.csv`).map((r) => countySlug(r.county)).sort(), slugs, table);
  }
});
test('County Act: compares with last year like with like', () => {
  const { change } = compareFigures(fig('ke.fy2025-26.law.county.nyamira.equitable-share'), fig(`${L}.county.nyamira.equitable-share`));
  assert.equal(change, 192218733);
});

test('NG-CDF is national money and refuses to join county money', () => {
  assert.equal(fig('ke.fy2026-27.statement.fund.ng-cdf').money, 'ng-cdf');
  assert.throws(() => sumFigures([fig('ke.fy2026-27.statement.fund.ng-cdf'), fig('ke.fy2026-27.statement.county.equitable-share')]), /different money|different grouping/);
});
test('the Guide\'s county figures stay in the stage history beside the Act\'s', () => {
  assert.equal(fig('ke.fy2026-27.statement.county.nyamira.equitable-share').stage, 'statement');
  assert.equal(fig(`${L}.county.nyamira.equitable-share`).stage, 'law');
});

test('a citation comes out in the brief\'s form', () => {
  const f = fig(`${L}.county.nyamira.equitable-share`);
  assert.equal(citation(f, sources.get(f.source), '2026-11-02', 'Kenya Budget Explained'),
    `Kenya Budget Explained, data release 2026-11-02, figure ${f.id}, from the County Allocation of Revenue Act, 2026, First Schedule, p.460.`);
});

test('every source names its offset or says why not, and its stored copy has a hash', () => {
  for (const s of sources.values()) {
    if (s.file) assert.match(s.sha256, /^[0-9a-f]{64}$/);
    if (s.docType !== 'press' && s.pageOffset == null) assert.ok(s.note, `${s.id} needs a note on its page numbers`);
  }
});

const row = (programme, supply, aia) => ({ kind: 'R', vote: '1053', programme, supply, aia });
test('double entry passes rows that agree', () => {
  const r = compareReadings([row('', '5', '6')], [row('', '5', '6')]);
  assert.deepEqual([r.agree, r.unresolved.length], [1, 0]);
});
test('double entry lists a disagreement until it is resolved', () => {
  assert.equal(compareReadings([row('', '5', '6')], [row('', '9', '6')]).unresolved.length, 1);
  const r = compareReadings([row('', '5', '6')], [row('', '9', '6')], new Map([['R1053', { reason: 'The page prints 5' }]]));
  assert.deepEqual([r.unresolved.length, r.resolved[0].reason], [0, 'The page prints 5']);
});
test('double entry notes the same digits in the other column', () => {
  assert.deepEqual(compareReadings([row('p', '', '7')], [row('p', '7', '')]).otherColumn, ['R1053/p']);
});
test('double entry notices a row only one reading has', () => {
  assert.equal(compareReadings([row('', '5', '6')], []).unresolved.length, 1);
  assert.equal(compareReadings([], [row('', '5', '6')]).unresolved.length, 1);
});

test('the County Act checks catch one mistyped digit in any column', () => {
  const rows = csv('county-allocation-act-2026/typed.csv'), cra = csv('cra-recommendation-2026-27/typed.csv'), guide = csv('mwananchi-guide-2026-27/typed.csv');
  assert.deepEqual(countyChecks(rows, cra, guide), []);
  const nudge = (k, by) => countyChecks(rows.map((r, i) => (i === 34 ? { ...r, [k]: String(Number(r[k]) + by) } : r)), cra, guide);
  assert.ok(nudge('a', 2e6).length, 'column A');
  assert.ok(nudge('b', 0.01).length, 'column B');
  assert.ok(nudge('c', 1e6).length, 'column C');
  assert.ok(nudge('d', 1e6).length, 'column D');
  assert.ok(nudge('e', 0.01).length, 'column E');
  assert.ok(nudge('f', 1e6).length, 'column F');
  assert.ok(nudge('g', 1e6).length, 'column G');
});
