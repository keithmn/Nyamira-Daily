import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSchedule, reconcile, splitRunTogether } from './extract-appropriation.mjs';

const VOTE = 'R1053     The amount required in the year ending 30th June, 2027 for current expenses of the State Department for Foreign Affairs in the following programmes:';
const schedule = (rows, s = '300,000,000', a = '50,000,000') => ['Recurrent Expenditure', `${VOTE}  ${s}  ${a}`, ...rows, `CLASS SUB-TOTAL  ${s}  ${a}`, `CLUSTER SUB-TOTAL  ${s}  ${a}`, `GRAND TOTAL  ${s}  ${a}`].join('\n');
const ROWS = ['0714000 General Administration Planning and Support Services  100,000,000  50,000,000', '0715000 Foreign Relation and Diplomacy  200,000,000'];

test('reads a vote, its name, its programmes and both columns', () => {
  const { votes, totals } = parseSchedule(schedule(ROWS));
  assert.equal(votes.length, 1);
  const [v] = votes;
  assert.deepEqual([v.kind, v.code, v.name, v.supply, v.aia], ['R', '1053', 'State Department for Foreign Affairs', 300000000, 50000000]);
  assert.deepEqual(v.programmes.map((p) => [p.code, p.supply, p.aia]), [['0714000', 100000000, 50000000], ['0715000', 200000000, null]]);
  assert.equal(totals.length, 3);
});

test('a schedule that adds up has no problems', () => { assert.deepEqual(reconcile(parseSchedule(schedule(ROWS))), []); });

test('a programme that is one shilling out is reported with its page', () => {
  const bad = schedule(['0714000 General Administration  100,000,001  50,000,000', ROWS[1]]);
  const problems = reconcile(parseSchedule(bad));
  assert.ok(problems.some((p) => p.where === 'R1053' && p.diff === 1 && p.page === 1));
});

test('a printed class total that disagrees is reported', () => {
  const bad = schedule(ROWS).replace('CLASS SUB-TOTAL  300,000,000', 'CLASS SUB-TOTAL  300,000,009');
  assert.ok(reconcile(parseSchedule(bad)).some((p) => p.where.startsWith('class')));
});

test('a vote with no programmes is reported', () => {
  assert.ok(reconcile(parseSchedule(schedule([]))).some((p) => p.what === 'no programmes'));
});

test('a lone amount moves to Appropriations-in-Aid only when the printed totals say so', () => {
  const { votes } = parseSchedule(schedule(['0714000 General Administration  300,000,000', '0715000 Foreign Relation  50,000,000']));
  assert.deepEqual(votes[0].programmes.map((p) => [p.supply, p.aia]), [[300000000, null], [null, 50000000]]);
});

test('reads amounts whose commas the scan damaged', () => {
  const { votes } = parseSchedule(schedule(['0714000 General Administration  100,000 ,000  50,000,000', '0715000 Foreign Relation  200000000']));
  assert.deepEqual(votes[0].programmes.map((p) => p.supply), [100000000, 200000000]);
});

test('a correction from the page image replaces the machine reading, and is marked', () => {
  const fixes = new Map([['R1053/0715000', { supply: '200,000,000'.replace(/,/g, ''), aia: 'none' }]]);
  const { votes } = parseSchedule(schedule(['0714000 General Administration  100,000,000  50,000,000', '0715000 Foreign Relation  900,000,000  1,000']), fixes);
  const fixed = votes[0].programmes[1];
  assert.deepEqual([fixed.supply, fixed.aia, fixed.corrected], [200000000, null, true]);
});

test('a correction for a row that does not exist stops the run', () => {
  assert.throws(() => parseSchedule(schedule(ROWS), new Map([['R9999', { supply: '1', aia: '' }]])), /unknown vote/);
});

test('recurrent and development votes are told apart', () => {
  const text = `${schedule(ROWS)}\nDevelopment Expenditure\nD1053  The amount required in the year ending 30th June, 2027 for capital expenses of the State Department for Foreign Affairs in the following programmes:  5,000,000\n0742000 Foreign Policy Research  5,000,000\n`;
  assert.deepEqual(parseSchedule(text).votes.map((v) => [v.kind, v.code]), [['R', '1053'], ['D', '1053']]);
});

test('splitRunTogether separates two columns printed with no gap', () => {
  assert.equal(splitRunTogether('Research141,370,42123,832,751'), 'Research141,370,421 23,832,751');
  assert.equal(splitRunTogether('5,144,184,728 28,458,309'), '5,144,184,728 28,458,309');
});
