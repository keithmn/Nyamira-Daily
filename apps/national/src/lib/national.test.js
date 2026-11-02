import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, t } from '../i18n/index.js';
import { hash, headersFile, inlineScripts, policy } from '../../integrations/headers.mjs';
import { fitsAboveBar, inflows, outflows, perHundred, sectors } from './budget.js';
import { barWidths, endLabelY, linePoints, ticks } from './charts.js';
import { allCountyDev, cardData, changeWords, countyBySlug, countyRows, shareParts } from './counties.js';
import { citationFor, fig, release, shortTitle } from './figures.js';
import { PLANNED, SECTIONS, href, isPlanned, sectionOf, twin } from './routes.js';
import { countOf, rulesFor } from './rules.js';
import { searchIndex } from './search.js';
import { amountSentence, countyQuestions, whatsappHref } from './sentences.js';
import { nextDeadline, timeline } from './stages.js';
import { allSectors, allVotes, sectorBySlug, voteByCode } from './votes.js';

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
  for (const p of PLANNED) for (const lang of ['en', 'sw']) assert.ok(t(lang, `page.${p}`), p);
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
  assert.ok(isPlanned('/revenue/'));
  assert.ok(isPlanned('/sw/learn/glossary/'));
  assert.equal(isPlanned('/counties/'), false);
  assert.equal(isPlanned('/nowhere/'), false);
});

test('the note on the two totals says only what the figures show', () => {
  const gap = fig('statement.total.with-levy').value - fig('statement.total.expenditure').value;
  assert.equal(gap.toFixed(1), fig('statement.total.securitised-levy').value.toFixed(1));
  assert.doesNotMatch(dictionaries.en['budget.disputed'], /ministries/);
});

test('a sum cites all the pages it draws on', () => {
  const v = voteByCode('1066');
  assert.equal(v.first.page.split('p.').length - 1, 2);
  assert.equal(sectorBySlug('health').first.page, 'Schedule');
});

test('a document\'s short title drops only the bracket at its end', () => {
  assert.equal(shortTitle(fig('ke.fy2025-26.law.rule.wage-maximum').doc), 'Public Finance Management (County Governments) Regulations, 2015');
  assert.equal(shortTitle(fig('approved.total.supply').doc), 'Appropriation Act, 2026');
  assert.equal(shortTitle({ title: 'No bracket here' }), 'No bracket here');
  assert.match(citationFor(fig('approved.total.supply')), /from the Appropriation Act, 2026, Schedule/);
});

test('the rules use the law\'s own numbers, and report what the arithmetic says', () => {
  const pick = (slug, key) => rulesFor(slug).find((r) => r.key === key);
  assert.equal(pick('nyamira', 'development').limit.value, 30);
  assert.equal(pick('nyamira', 'wages').limit.value, 35);
  assert.equal(pick('nyamira', 'development').result, 'meets');
  assert.equal(pick('nyamira', 'wages').result, 'misses');
  assert.equal(pick('kajiado', 'development').result, 'misses');
  assert.equal(pick('mombasa', 'wages').result, 'meets');
  const slugs = countyRows().map((c) => c.slug);
  assert.equal(countOf(slugs, 'wages', 'misses'), 39);
  assert.equal(countOf(slugs, 'development', 'misses'), 1);
});

test('the rule wording keeps the law\'s qualifier, and no rule text assigns blame', () => {
  assert.match(dictionaries.en['rule.development.law'], /over the medium term/);
  assert.match(dictionaries.en['rule.development.law'], /one year alone does not settle it/);
  for (const key of Object.keys(dictionaries.en).filter((k) => k.startsWith('rule.'))) assert.doesNotMatch(dictionaries.en[key], /breach|violat|illegal|fail/i, key);
});

test('all counties\' wage share matches the report to two decimals', () => {
  assert.equal(fig('ke.fy2025-26.spent.county-total.wage-share').value, 39.54);
});

test('a county that reported no trade payables has no figure, not a zero', () => {
  assert.equal(countyBySlug('nandi').payables, null);
  assert.ok(countyQuestions(countyBySlug('nandi'), 'en').every((q) => !/owed suppliers/.test(q)));
  assert.match(countyQuestions(countyBySlug('nyamira'), 'en').join(' '), /owed suppliers KSh 357\.7 million at 30 June 2026/);
});

test('the next deadline follows the law, and rolls over after it passes', () => {
  assert.equal(nextDeadline('en', '2026-11-02').date, '2027-02-15');
  assert.equal(nextDeadline('en', '2027-02-15').date, '2027-02-15');
  assert.equal(nextDeadline('en', '2027-02-16').date, '2028-02-15');
  assert.match(nextDeadline('en', '2026-11-02').text, /Budget Policy Statement 2027, due in Parliament by 15 February 2027/);
  assert.equal(nextDeadline('en').doc.id, 'pfm-act-2012');
});

test('all 87 votes and 201 programmes are in, each vote in one sector', () => {
  const votes = allVotes();
  assert.equal(votes.length, 87);
  assert.equal(new Set(votes.map((v) => v.code)).size, 87);
  assert.equal(votes.reduce((n, v) => n + v.programmes.length, 0), 201);
  assert.equal(allSectors().length, 12);
});

test('votes and sectors add up to the Act, to the shilling', () => {
  const total = fig('approved.total.supply').value + fig('approved.total.aia').value;
  assert.equal(allVotes().reduce((n, v) => n + v.total, 0), total);
  assert.equal(allSectors().reduce((n, s) => n + s.total, 0), total);
  for (const v of allVotes()) assert.equal(v.programmes.reduce((n, p) => n + p.total, 0), v.total, v.code);
  for (const s of allSectors()) assert.equal(s.recurrent + s.development, s.total, s.slug);
});

test('a sector\'s change counts the same votes in both years', () => {
  const by = (slug) => sectorBySlug(slug).change.toFixed(1);
  assert.equal(by('governance-justice-law-order'), '29.7');
  assert.equal(by('public-administration-international-relations'), '12.6');
  assert.equal(by('health'), '27.6');
  assert.equal(by('energy-infrastructure-ict'), '-0.8');
});

test('names read from a scan carry none of the known damage', () => {
  const names = allVotes().flatMap((v) => [v.name, ...v.programmes.map((p) => p.name)]);
  assert.equal(names.filter((n) => /Qunifty|in- Aid|General Administration Planning/.test(n)).length, 0);
  assert.ok(voteByCode('1066').programmes.some((p) => p.name === 'Quality Assurance and Standards'));
});

test('sentences say more, less or the same, and cope with a zero or a missing year', () => {
  const base = { name: 'Vote', fy: 'FY2026/27', lang: 'en' };
  assert.equal(amountSentence({ ...base, amount: 2e9, change: 6.8 }), 'Vote gets KSh 2.00 billion in FY2026/27, 6.8% more than last year in cash terms.');
  assert.match(amountSentence({ ...base, amount: 2e9, change: -0.8 }), /0\.8% less than last year/);
  assert.match(amountSentence({ ...base, amount: 2e9, change: 0.01 }), /the same as last year/);
  assert.match(amountSentence({ ...base, amount: 2e9, change: null }), /Last year's figure is not loaded/);
  assert.match(amountSentence({ ...base, amount: 2e9, change: Infinity }), /not loaded/);
  assert.equal(amountSentence({ ...base, amount: 0, change: -100 }), 'Vote has no allocation in FY2026/27.');
  assert.match(amountSentence({ ...base, lang: 'sw', amount: 2e9, change: 6.8 }), /KSh bilioni 2\.00.*6\.8% zaidi/);
});

test('generated text uses plain words, and every county gets questions, not accusations', () => {
  const banned = /slash|balloon|starv|corrupt|stole|looted|ghost|fail|waste/i;
  for (const key of Object.keys(dictionaries.en).filter((k) => /^(sentence|question|change)\./.test(k))) assert.doesNotMatch(dictionaries.en[key], banned, key);
  for (const c of countyRows()) {
    const list = countyQuestions(c, 'en');
    assert.ok(list.length >= 2, c.slug);
    for (const q of list) { assert.match(q, /\?$/); assert.doesNotMatch(q, banned); assert.doesNotMatch(q, /NaN|undefined/); }
  }
});

test('questions follow the figures', () => {
  const q = (slug) => countyQuestions(countyBySlug(slug), 'en');
  assert.match(q('nyamira')[0], /was 59% .* \(all counties: 54%\)\. Which projects did this pay for/);
  assert.match(q('kisumu')[0], /was 26% .*Which projects were not started/);
  assert.match(q('nyamira').at(-1), /recommended KSh 6\.72 billion for Nyamira, and the Act gives KSh 6\.27 billion\. Which county plans changed/);
});

test('the county row uses the newest Controller of Budget report', () => {
  const c = countyBySlug('nyamira');
  assert.deepEqual(c.spending.map((y) => y.fy), ['2024/25', '2025/26']);
  assert.equal(c.spending.at(-1).devPct, 58.71);
  assert.equal(allCountyDev().value, 54.21);
  assert.equal(countyBySlug('nairobi-city').spending.at(-1).devPct, 28.47);
});

test('a county\'s share is built from the parts the Act prints', () => {
  assert.deepEqual(shareParts('nyamira').map((p) => p.key), ['baseline', 'affirmative', 'formula']);
  assert.deepEqual(shareParts('nairobi-city').map((p) => p.key), ['baseline', 'formula']);
});

test('a WhatsApp message carries the figure, the source and the link', () => {
  const link = decodeURIComponent(whatsappHref('Nyamira gets KSh 6.27 billion.', 'Source: the Act.', 'https://x.invalid/nyamira/'));
  assert.ok(link.startsWith('https://wa.me/?text=Nyamira gets'));
  assert.ok(link.endsWith('Source: the Act. https://x.invalid/nyamira/'));
});

test('search finds agencies by their short names, and sends unclear ones to the sector', () => {
  const index = searchIndex('en'), find = (word) => index.filter((i) => `${i[0]} ${i[3]}`.toLowerCase().includes(word.toLowerCase()));
  assert.ok(find('TSC').some((i) => i[1].endsWith('/votes/2091/')));
  assert.ok(find('KeNHA').some((i) => i[1].endsWith('/votes/1091/')));
  assert.ok(find('SHA').some((i) => i[1].endsWith('/sectors/health/')));
  assert.ok(find('Nyamira').some((i) => i[1] === '/counties/nyamira/'));
  assert.equal(index.length, 47 + 12 + 87 + 201);
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
  assert.deepEqual(en, { s: 'nyamira', n: 'Nyamira', m: 'KSh 6.27 billion', c: 'up 3.2% on last year', d: '59% of the FY2025/26 development budget was spent' });
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
