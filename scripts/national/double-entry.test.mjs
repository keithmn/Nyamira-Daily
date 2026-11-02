// The checks that hold the Act against Parliament's tables, and each Controller of Budget row against its own arithmetic.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cobChecks, pboChecks } from './double-entry.mjs';
import { normalise, parseTables, slugOf } from './extract-pbo-votes.mjs';
import { layoutAmounts, RAW_ROW, rawRows } from './extract-cob-counties.mjs';

const act = [
  { kind: 'R', vote: '1011', programme: '', supply: '6000000000', aia: '' },
  { kind: 'D', vote: '1011', programme: '', supply: '1000000000', aia: '500000000' },
];
const row = (over = {}) => ({ code: '1011', name: 'X', recurrent: '6000', development: '1500', total: '7500', ...over });

test('a vote that agrees with the Act passes', () => {
  assert.deepEqual(pboChecks(act, [row()], [row()]), []);
});
test('a figure that differs from the Act by more than the rounding fails', () => {
  assert.match(pboChecks(act, [row({ recurrent: '6002', total: '7502' })], [row()])[0], /Vote 1011 recurrent/);
});
test('a vote missing from either year fails', () => {
  assert.ok(pboChecks(act, [], [row()]).some((p) => /2026\/27 has no row for 1011/.test(p)));
  assert.ok(pboChecks(act, [row()], []).some((p) => /2025\/26 has no row for 1011/.test(p)));
});
test('a vote listed twice, or last year\'s vote with no code, fails', () => {
  assert.ok(pboChecks(act, [row(), row()], [row()]).some((p) => /repeated/.test(p)));
  assert.ok(pboChecks(act, [row()], [row({ code: '' })]).some((p) => /repeated or has no code/.test(p)));
});
test('a row whose parts do not add to its total fails', () => {
  assert.ok(pboChecks(act, [row()], [row({ total: '9000' })]).some((p) => /is not 9000/.test(p)));
});

const AMOUNTS = ['rec_budget', 'dev_budget', 'total_budget', 'rec_spent', 'dev_spent', 'total_spent'];
const county = (name, over = {}) => ({ county: name, rec_budget: '100.00', dev_budget: '50.00', total_budget: '150.00', rec_spent: '90.00', dev_spent: '25.00', total_spent: '115.00', rec_pct: '90.00', dev_pct: '50.00', overall_pct: '76.67', ...over });
function table(change = (r) => r) {
  const rows = Array.from({ length: 47 }, (_, i) => change(county(`County ${i}`), i));
  const sum = (k) => (47 * Number(county('x')[k])).toFixed(2);
  rows.push(county('Total', Object.fromEntries(AMOUNTS.map((k) => [k, sum(k)]))));
  return rows;
}
const amounts = (rows) => rows.flatMap((r) => AMOUNTS.map((k) => ({ amount: r[k] })));

test('a sound county table passes', () => {
  const rows = table();
  assert.deepEqual(cobChecks(rows, amounts(rows)), []);
});
test('a misread amount fails its row\'s sum, and the total', () => {
  const rows = table((r, i) => (i ? r : { ...r, dev_budget: '60.00' }));
  const found = cobChecks(rows, amounts(rows));
  assert.ok(found.some((p) => /County 0: recurrent and development budgets/.test(p)));
  assert.ok(found.some((p) => /dev_budget: the 47 counties do not add/.test(p)));
});
test('a printed percentage that does not fit its amounts fails', () => {
  const rows = table((r, i) => (i ? r : { ...r, dev_pct: '56.00' }));
  assert.ok(cobChecks(rows, amounts(rows)).some((p) => /County 0: dev_pct prints 56.00/.test(p)));
});
test('the two readings must hold the same amounts', () => {
  const rows = table();
  const second = amounts(rows);
  second[0] = { amount: '101.00' };
  assert.ok(cobChecks(rows, second).some((p) => /readings hold different amounts/.test(p)));
});
test('a county missing from the table fails', () => {
  const rows = table().slice(1);
  assert.ok(cobChecks(rows, amounts(rows)).some((p) => /Expected 47 counties/.test(p)));
});

test('the row pattern reads both report styles, and a number printed with no comma', () => {
  assert.equal('Kisii 12,430.45 7,730.45 20,160.90 9,594.74 3170.50 12,765.24 77.19 41.01 63.32'.match(RAW_ROW)[6], '3170.50');
  assert.equal("Murang'a 8,027.58 4,103.00 12,130.58 6,855.14 2,630.11 9,485.25 85 64 78".match(RAW_ROW)[1], "Murang'a");
});
test('rows stop at the total, and a percentage above 100 is not read as an amount', () => {
  const body = 'Table 2.5: County Budget\nBaringo 1,000.00 500.00 1,500.00 900.00 250.00 1,150.00 90 50 77\nTotal 1,000.00 500.00 1,500.00 900.00 250.00 1,150.00 90 50 77\nBomet 1,000.00 500.00 1,500.00 900.00 250.00 1,150.00 90 50 77';
  assert.equal(rawRows([[52, body]]).length, 2);
  assert.deepEqual(layoutAmounts([[52, 'Table 2.5: County Budget\n 5,708.68 100.18 Source: x']]), ['5708.68']);
});

test('tables are read across wrapped names, page breaks and sub-totals', () => {
  const text = ['TABLE 10: VOTES UNDER THE PUBLIC ADMINISTRATION AND INTERNATIONAL RELATIONS', 'SECTOR', 'MDA Recurrent Development Total', '1011 Executive Office 100 50 150',
    '1018 State Department for National Government', '12', '\fMDA Recurrent Development Total', 'Coordination 1,232 0 1,232', 'Sub-Total 1,332 50 1,382', 'Source: National Treasury'].join('\n');
  const { rows, problems } = parseTables(text);
  assert.deepEqual(problems, []);
  assert.deepEqual(rows.map((r) => [r.code, r.name, r.total, r.pdf_page]), [['1011', 'Executive Office', 150, 1], ['1018', 'State Department for National Government Coordination', 1232, 2]]);
  assert.equal(rows[0].sector, 'public-administration-international-relations');
});
test('sector titles and vote names normalise for matching', () => {
  assert.equal(slugOf('GENERAL ECONOMIC AND COMMERCIAL AFFAIRS SECTOR'), 'general-economics-commercial-affairs');
  assert.equal(slugOf('Parliament'), 'parliament');
  assert.equal(normalise('State Department for Water & Sanitation'), normalise('The State Department for Water and Sanitation'));
});
