import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, t } from '../i18n/index.js';
import { hash, headersFile, inlineScripts, policy } from '../../integrations/headers.mjs';
import { fitsAboveBar, inflows, outflows, perHundred, sectors } from './budget.js';
import { barWidths, endLabelY, linePoints, ticks } from './charts.js';
import { cardData, changeWords, countyRows } from './counties.js';
import { fig, release } from './figures.js';
import { PLANNED, SECTIONS, href, isPlanned, sectionOf, twin } from './routes.js';
import { timeline } from './stages.js';

const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('English and Kiswahili have the same keys and the same placeholders', () => {
  const { en, sw } = dictionaries;
  assert.deepEqual(Object.keys(sw).sort(), Object.keys(en).sort());
  for (const key of Object.keys(en)) assert.deepEqual(vars(sw[key]), vars(en[key]), key);
});

test('a missing key or value stops the build', () => {
  assert.throws(() => t('en', 'no.such.key'), /No en text/);
  assert.throws(() => t('sw', 'county.up'), /needs \{p\}/);
  assert.equal(t('en', 'county.up', { p: '3.2' }), 'up 3.2% on last year');
});

test('every page in the navigation has a name in both languages', () => {
  for (const p of PLANNED.filter((x) => x !== '/search/')) for (const lang of ['en', 'sw']) assert.ok(t(lang, `page.${p}`), p);
  for (const s of SECTIONS) for (const lang of ['en', 'sw']) assert.ok(t(lang, `nav.${s.key}`));
});

test('the five sections, in the approved order', () => {
  assert.deepEqual(SECTIONS.map((s) => s.key), ['budget', 'counties', 'track', 'learn', 'data']);
});

test('routes carry the language and find their twin', () => {
  assert.equal(href('en', '/budget/'), '/budget/');
  assert.equal(href('sw', '/budget/'), '/sw/budget/');
  assert.equal(twin('en', '/budget/'), '/sw/budget/');
  assert.equal(twin('sw', '/budget/'), '/budget/');
  assert.equal(sectionOf('/learn/glossary/'), 'learn');
  assert.equal(sectionOf('/'), null);
});

test('only known routes count as planned', () => {
  assert.ok(isPlanned('/budget/2026-27/sectors/'));
  assert.ok(isPlanned('/sw/counties/nyamira/'));
  assert.ok(isPlanned('/search/'));
  assert.equal(isPlanned('/nowhere/'), false);
});

test('the two notes hold every shilling, with debt first', () => {
  for (const { parts } of [outflows(), inflows()]) assert.equal(parts[0].slot, 'debt');
  const out = outflows();
  assert.deepEqual(out.parts.map((p) => p.slot), ['debt', '1', '2', '3', 'rest']);
  assert.ok(Math.abs(out.parts.reduce((a, p) => a + p.share, 0) - 100) < 0.01);
  const into = inflows();
  assert.equal(into.parts[1].value.toFixed(1), '2862.3');
  assert.equal(into.parts[2].value.toFixed(1), '768.2');
  assert.ok(Math.abs(into.parts.reduce((a, p) => a + p.share, 0) - 100) < 0.01);
});

test('small shares are written in cents, and the smallest is never rounded to zero', () => {
  assert.deepEqual(perHundred(31.14), { kind: 'shillings', n: 31 });
  assert.deepEqual(perHundred(0.9), { kind: 'cents', n: 90 });
  assert.deepEqual(perHundred(0.02), { kind: 'under', n: null });
});

test('a slice too small for its label is named in the list instead', () => {
  const labels = outflows().parts.map((p) => fitsAboveBar(p.share));
  assert.deepEqual(labels, [true, true, true, false, false]);
});

test('sectors run from the largest down', () => {
  const list = sectors();
  assert.equal(list.length, 10);
  assert.equal(list[0].slug, 'education');
  assert.ok(list.every((s, i) => !i || list[i - 1].figure.value >= s.figure.value));
});

test('a missing bar stays missing, and a real zero stays zero', () => {
  assert.deepEqual(barWidths([200, 100, null, 0]), [100, 50, null, 0]);
  assert.deepEqual(barWidths([null]), [null]);
});

test('axes start at zero and reach past the top value', () => {
  const axis = ticks(87);
  assert.equal(axis[0], 0);
  assert.ok(axis.at(-1) >= 87);
  assert.deepEqual(ticks(0), [0]);
});

test('a line breaks at a missing year instead of joining across it', () => {
  const line = linePoints([50, 60, null, 80, 90]);
  assert.equal(line.points[2], null);
  assert.equal(line.path.match(/M/g).length, 2);
  assert.equal(line.base, line.grid[0].y);
});

test('the end label moves below a line that comes down into it', () => {
  assert.equal(endLabelY([{ x: 0, y: 50 }, { x: 10, y: 80 }]), 100);
  assert.equal(endLabelY([{ x: 0, y: 80 }, { x: 10, y: 50 }]), 40);
  assert.equal(endLabelY([{ x: 0, y: 50 }]), 40);
});

test('all 47 counties, ranked once each, from the Act', () => {
  const rows = countyRows();
  assert.equal(rows.length, 47);
  assert.deepEqual([...new Set(rows.map((r) => r.rank))].sort((a, b) => a - b), Array.from({ length: 47 }, (_, i) => i + 1));
  const nyamira = rows.find((r) => r.slug === 'nyamira');
  assert.equal(nyamira.value, 6265653089);
  assert.equal(nyamira.rank, 41);
  assert.equal(nyamira.change.toFixed(1), '3.2');
});

test('the county card data is already worded in each language', () => {
  const en = cardData('en').find((r) => r.s === 'nyamira'), sw = cardData('sw').find((r) => r.s === 'nyamira');
  assert.deepEqual(en, { s: 'nyamira', n: 'Nyamira', m: 'KSh 6.27 billion', c: 'up 3.2% on last year' });
  assert.equal(sw.m, 'KSh bilioni 6.27');
  assert.equal(changeWords(0.01, 'en'), 'the same as last year');
  assert.equal(changeWords(-2, 'en'), 'down 2.0% on last year');
});

test('the timeline has one stage now, and gives only dates a loaded document supports', () => {
  const stages = timeline('en');
  assert.equal(stages.filter((s) => s.state === 'now').length, 1);
  assert.equal(stages.find((s) => s.state === 'now').stage, 'spending');
  assert.equal(stages.find((s) => s.stage === 'statement').sub, '11 June 2026');
  assert.equal(stages.find((s) => s.stage === 'bps').sub, 'Parliament');
  assert.equal(stages.find((s) => s.stage === 'audited').sub, 'Auditor-General');
});

test('an unknown figure stops the build', () => {
  assert.throws(() => fig('statement.no.such.figure'), /Unknown figure/);
  assert.equal(fig('statement.total.expenditure').value, 4820.4);
  assert.equal(release, '2026-11-02');
});

test('only inline scripts that run are hashed', () => {
  const html = '<script>a()</script><script src="/x.js"></script><script type="application/json">{"a":1}</script><script type="module" src="/y.js"></script>';
  assert.deepEqual(inlineScripts(html), ['a()']);
  assert.match(hash('a()'), /^'sha256-[A-Za-z0-9+/]+=*'$/);
});

test('the content security policy matches the design document', () => {
  const strict = policy(["'sha256-x'"]);
  assert.match(strict, /default-src 'none'/);
  assert.match(strict, /script-src 'self' 'sha256-x'/);
  assert.match(strict, /style-src 'self'; style-src-attr 'unsafe-inline'/);
  assert.match(strict, /frame-ancestors 'none'/);
  assert.doesNotMatch(strict, /unsafe-eval|https?:/);
  assert.match(policy([], true), /frame-ancestors \*/);
  assert.match(headersFile([]), /X-Content-Type-Options: nosniff/);
});
