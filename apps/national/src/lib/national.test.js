import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, t } from '../i18n/index.js';
import { hash, headersFile, inlineScripts, policy } from '../../integrations/headers.mjs';
import { fitsAboveBar, inflows, outflows, perHundred, sectors } from './budget.js';
import { barWidths, endLabelY, linePoints, ticks } from './charts.js';
import { allCountyDev, cardData, changeWords, countyBySlug, countyRows, shareParts } from './counties.js';
import { allNotices, citationFor, fig, release, shortTitle } from './figures.js';
import { bpsYear, recentlyClosed, upcoming } from './notices.js';
import { PLANNED, SECTIONS, href, isPlanned, sectionOf, sectionPath, twin } from './routes.js';
import { countOf, rulesFor } from './rules.js';
import { searchIndex } from './search.js';
import { amountSentence, countyQuestions, whatsappHref } from './sentences.js';
import { nextDates } from './calendar.js';
import { LOW_SHARE, headline, lowSpenders, ministries, spendingOf } from './track.js';
import { intakeSettings, reportPage } from './intake.js';
import { allInfographics, infographic } from './infographics.js';
import { explainers } from './learn.js';
import { memorandum } from './memo.js';
import { memoTopics, memoWords } from './memoTopics.js';
import { fellToZero, projectQuestions, sameNameTwoVotes } from './projects.js';
import { countByFamily, family } from './releases.js';
import { readAmount, splitAmount } from './split.js';
import { nextDeadline, timeline } from './stages.js';
import { allSectors, allVotes, economicSplit, programmeDetail, sectorBySlug, voteByCode } from './votes.js';

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
  assert.equal(isPlanned('/track/'), false);
  assert.equal(isPlanned('/revenue/'), false);
  assert.ok(isPlanned('/sw/about/'));
  assert.equal(isPlanned('/sw/learn/glossary/'), false);
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

test('with no notice, the next deadline follows the law, and rolls over after it passes', () => {
  assert.equal(nextDeadline('en', '2026-11-02', []).date, '2027-02-15');
  assert.equal(nextDeadline('en', '2027-02-15', []).date, '2027-02-15');
  assert.equal(nextDeadline('en', '2027-02-16', []).date, '2028-02-15');
  assert.match(nextDeadline('en', '2026-11-02', []).text, /Budget Policy Statement 2027, due in Parliament by 15 February 2027/);
  assert.equal(nextDeadline('en', '2026-11-02', []).doc.id, 'pfm-act-2012');
});

test('a date the Treasury announced comes first while it is ahead, and the law takes over once it passes', () => {
  const n = nextDeadline('en', '2026-11-03');
  assert.equal(n.date, '2026-11-16');
  assert.match(n.text, /Budget Policy Statement 2027, due in Parliament by 16 November 2026.*15 February 2027/);
  assert.match(n.doc.url, /newsite\.treasury\.go\.ke/);
  assert.equal(nextDeadline('en', '2026-11-17').date, '2027-02-15');
  const notices = allNotices();
  assert.deepEqual(upcoming(notices, '2026-11-03'), []);
  assert.deepEqual(recentlyClosed(notices, '2026-11-03').map((x) => x.id), ['tnt-2026-draft-bps-comments', 'tnt-2026-public-sector-hearings']);
  assert.deepEqual(recentlyClosed(notices, '2027-03-01'), []);
  assert.equal(upcoming(notices, '2026-10-10')[0].id, 'tnt-2026-public-sector-hearings');
  assert.equal(bpsYear('2026-11-16'), 2027);
  assert.equal(bpsYear('2027-02-15'), 2027);
  for (const x of notices) assert.match(x.source.url, /^https:\/\/newsite\.treasury\.go\.ke\//);
});

test('a vote\'s economic split covers every shilling, and programmes show the book\'s sub-programmes and aim', () => {
  const e = economicSplit('1066');
  assert.equal(e.parts.reduce((a, p) => a + p.value, 0), e.total.value);
  assert.equal(e.total.value, voteByCode('1066').total);
  const d = programmeDetail('1066', '0503000');
  assert.ok(d.subs.length > 0);
  assert.equal(d.subs.reduce((a, s) => a + s.value, 0), d.book.value);
  assert.ok(d.outcome.length > 10);
  assert.equal(programmeDetail('2071', '075000').book.value, voteByCode('2071').programmes.find((p) => p.code === '075000').total);
});

test('where the budget book and the Act differ, the page shows the Act and says so', () => {
  const book = programmeDetail('1213', '0710000').book.value, act = voteByCode('1213').programmes.find((p) => p.code === '0710000').total;
  assert.equal(book - act, 40000000);
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
  assert.equal(index.length, 47 + 12 + 87 + 201 + 10);
  assert.ok(find('mgao sawa').some((i) => i[1] === '/learn/equitable-share/'));
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
  assert.match(release, /^\d{4}-\d{2}-\d{2}$/);
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
  for (const h of ['Strict-Transport-Security: max-age=31536000', 'Cross-Origin-Opener-Policy: same-origin', 'Referrer-Policy: strict-origin-when-cross-origin']) assert.ok(headersFile([]).includes(`  ${h}\n`), h);
  assert.ok(headersFile([]).includes('/api/*\n  Access-Control-Allow-Origin: *\n'));
  assert.doesNotMatch(headersFile([]).split('/api/*')[0], /Access-Control-Allow-Origin/);
});

test('project question rules ask only what the two printed years show', () => {
  const p = (code, name, now, last) => ({ code, vote: code.slice(0, 4), name, current: now == null ? null : { value: now }, previous: last == null ? null : { value: last } });
  const list = [
    p('1091100100', 'Construction of Isiolo-Mandera Road', 0, 500), p('1091100200', 'Dualling of Kisumu Bypass', null, 300),
    p('1091100300', 'New dam at Thwake', 200, null), p('1109100100', 'Thwake Multipurpose Dam Project', 900, 800),
    p('1103100100', 'Thwake Multipurpose Dam Project', 100, 50), p('1104100100', 'Headquarters office block', 10, 5),
    p('1105100100', 'Headquarters office block', 10, 5),
  ];
  assert.deepEqual(fellToZero(list).map((x) => x.code), ['1091100100', '1091100200']);
  const twice = sameNameTwoVotes(list);
  assert.equal(twice.length, 1, 'generic names are left out');
  assert.deepEqual(twice[0].map((x) => x.vote), ['1109', '1103']);
  for (const q of projectQuestions('en', list)) assert.match(q.text, /\?$/);
  for (const q of projectQuestions('sw', list)) assert.match(q.text, /\?$/);
});

test('Your taxes splits an amount into whole shillings that add back to it', () => {
  const shares = [1501.3, 2081.1, 809, 428, 1];
  for (const amount of [1, 7, 10000, 123457, 999999999]) {
    const parts = splitAmount(amount, shares);
    assert.equal(parts.reduce((a, b) => a + b, 0), amount, String(amount));
    assert.ok(parts.every((p) => Number.isInteger(p) && p >= 0));
  }
  assert.deepEqual(splitAmount(10000, shares), [3115, 4317, 1678, 888, 2]);
  assert.equal(readAmount('KSh 10,000'), 10000);
  assert.equal(readAmount('10 000'), 10000);
  for (const bad of ['', 'ten', '-5', '0', '1e13']) assert.equal(readAmount(bad), null, bad);
});

test('the calendar gives only the three dates read from the PFM Act, soonest first', () => {
  const d = nextDates('2026-11-03');
  assert.deepEqual(d.map((x) => x.date), ['2027-02-15', '2027-04-30', '2027-06-30']);
  assert.equal(d[0].days, 104);
  assert.deepEqual(nextDates('2027-03-01').map((x) => x.date), ['2027-04-30', '2027-06-30', '2028-02-15']);
  assert.equal(nextDates('2027-02-15')[0].days, 0);
  for (const x of d) assert.match(x.page, /^s\.\d+\(\d\), p\.\d+$/);
});

test('a memorandum has every part, with each figure cited, and fills gaps with prompts', () => {
  const w = memoWords('en'), topic = memoTopics('en').counties.find((c) => c.id === 'cnyamira');
  const text = memorandum({ topic, from: '', date: '3 November 2026', ask: '', w });
  for (const part of ['To: The Clerk of the Nyamira County Assembly', 'Subject:', '1. Background', '2. Request', w.yourName, w.yourAsk]) assert.ok(text.includes(part), part);
  assert.equal(text.match(/\(Source: /g).length, topic.facts.length);
  assert.ok(memorandum({ topic, from: 'Amina', date: 'x', ask: 'Publish the bills.', w }).includes('Publish the bills.'));
});

test('a release counts added figures by family', () => {
  assert.deepEqual(family('ke.fy2026-27.approved.project.1091100100'), { key: 'fy2026-27.approved.project', fy: 'FY2026/27', stage: 'approved', kind: 'project' });
  assert.deepEqual(countByFamily(['ke.fy2026-27.law.county.a', 'ke.fy2026-27.law.county.b', 'ke.fy2025-26.spent.debt.c']).map((f) => f.n), [2, 1]);
});

test('only the embeds may be framed by other sites, in both languages', () => {
  const file = headersFile([]);
  for (const path of ['/embed/*', '/sw/embed/*']) {
    const block = file.split(`\n${path}\n`)[1].split('\n/')[0];
    assert.ok(block.startsWith('  ! Content-Security-Policy\n'), path);
    assert.ok(block.trimEnd().endsWith('frame-ancestors *'), path);
  }
  assert.match(file.split('/embed/*')[0], /frame-ancestors 'none'/);
});

test('every infographic names its source and has alt text, in both languages', () => {
  for (const lang of ['en', 'sw']) {
    const all = allInfographics(lang);
    assert.equal(all.length, 3 + 12 + 47);
    assert.equal(new Set(all.map((g) => g.slug)).size, all.length);
    for (const g of all) {
      assert.ok(g.source && g.alt && g.title && g.line, g.slug);
      assert.ok(g.number || g.rows?.length, g.slug);
      if (g.rows) for (const r of g.rows) assert.ok(r.value && !r.value.includes('NaN'), `${g.slug} ${r.name}`);
    }
  }
  assert.equal(infographic('ksh-100', 'en').rows.length, 5);
});

test('the explainers use only registry figures and each has a two-question check and a Kiswahili summary', () => {
  const list = explainers();
  assert.equal(list.length, 10);
  for (const e of list) {
    assert.equal(e.check.length, 2, e.slug);
    assert.ok(e.sw.length > 40, e.slug);
    for (const p of e.body) {
      assert.doesNotMatch(p, /\bNaN\b|\bundefined\b/, e.slug);
      assert.doesNotMatch(p, /corrupt|\bstole\b|looted/i, e.slug);
    }
  }
});

test('a section tab goes to its own page once built, and to its first built page until then', () => {
  assert.equal(sectionPath(SECTIONS.find((s) => s.key === 'track')), '/track/');
  assert.equal(sectionPath({ path: '/about/', pages: ['/about/', '/learn/'] }), '/learn/', 'an unbuilt section page falls back');
  for (const s of SECTIONS) assert.equal(isPlanned(sectionPath(s)), false, s.key);
});

test('corrections intake opens only with all three settings, and only then lets Turnstile in, on that page alone', () => {
  const on = { PUBLIC_CORRECTION_INTAKE_ENABLED: 'true', PUBLIC_TURNSTILE_SITE_KEY: '0x4AAA', PUBLIC_CORRECTION_RETENTION_DAYS: '180' };
  assert.equal(intakeSettings(on).open, true);
  for (const key of Object.keys(on)) assert.equal(intakeSettings({ ...on, [key]: '' }).open, false, key);
  assert.equal(intakeSettings({ ...on, PUBLIC_CORRECTION_RETENTION_DAYS: 'forever' }).open, false);
  assert.doesNotMatch(headersFile([]), /challenges\.cloudflare\.com/);
  const open = headersFile([], { intakeOpen: true });
  assert.match(open.split('/corrections/*')[1].split('\n/')[0], /script-src 'self' https:\/\/challenges\.cloudflare\.com; frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.doesNotMatch(open.split('/corrections/*')[0], /challenges\.cloudflare\.com/);
  assert.equal(reportPage('ke.fy2026-27.law.county.nyamira.equitable-share', ''), '/corrections/?figure=ke.fy2026-27.law.county.nyamira.equitable-share');
  assert.equal(reportPage('', '/debt/'), '/debt/');
});

test('track shows the quarterly review as printed: shares from the report, gaps within one report and stage', () => {
  const m = ministries();
  assert.equal(m.pct.value, 87);
  assert.equal(m.actual.stage, m.target.stage);
  assert.deepEqual(headline().map((h) => h.shortfall.value), [60.2, 52.2, 19.3, 172.4, 115.4]);
  const low = lowSpenders();
  assert.ok(low.length > 0 && low.every((v) => v.pct.value < LOW_SHARE));
  assert.equal(spendingOf('1091').pct.value, 77.6);
  assert.equal(spendingOf('9999'), null);
});
