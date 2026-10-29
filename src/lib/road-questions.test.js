import assert from 'node:assert/strict';
import test from 'node:test';
import { contractorOf, expenditureOf, roadQuestions, statusText } from './road-questions.js';

const docOf = (r) => ({ title: r.sourceId, url: 'https://example.org/', page: r.page });
const findingDoc = (f) => ({ title: 'Auditor-General', url: 'https://example.org/oag', page: f.id });
const road = { confirmedGroup: false };
const record = (overrides) => ({ projectId: 'P-1', sourceId: 'adp2526', page: 'p.76', fy: '2023/24', kind: 'contract', amount: 4955300, status: null, ...overrides });

test('status parts are read without changing their wording', () => {
  const status = '15% – Works in progress | Contractor: Mkomani Ventures Limited; table section A; expenditure to date KSh 0.00';
  assert.equal(statusText(status), '15% – Works in progress');
  assert.equal(contractorOf(status), 'Mkomani Ventures Limited');
  assert.equal(expenditureOf(status), 0);
  assert.equal(statusText('expenditure to date as reported; 100% – Completed. Payment made'), '100% – Completed. Payment made');
});

test('a reported completion becomes a site-visit question, never a verdict', () => {
  const [q] = roadQuestions({ road, docOf, findingDoc, records: [record({ status: '100% – Completed. Await payment | Contractor: X' })] });
  assert.equal(q.siteVisit, true);
  assert.match(q.text, /Reported complete .*payment still awaited.*no inspection date/);
  assert.doesNotMatch(q.text, /corrupt|stole|loot|ghost/i);
});

test('progress with zero reported expenditure is stated as reported and asked about', () => {
  const [q] = roadQuestions({ road, docOf, findingDoc,
    records: [record({ status: '15% – Works in progress | Contractor: Y; expenditure to date KSh 0.00' })] });
  assert.match(q.text, /Reported 15% done.*no date for this figure.*KSh 0/);
});

test('budget lines, terminated contracts and audit findings each give one question with their source', () => {
  const questions = roadQuestions({ road, docOf, findingDoc,
    records: [
      record({ projectId: 'P-2', fy: '2025/26', kind: 'budgeted', sourceId: 'pbb2526', amount: 2400000 }),
      record({ status: '40% – Terminated (Retendered) | Contractor: Z' }),
    ],
    findings: [{ id: 'exec-201617-13', fy: '2016/17', title: 'Poorly installed culverts on Bokimo-Masare road', amountKsh: 9969272 }] });
  assert.equal(questions.length, 3);
  assert.match(questions[0].text, /KSh 2\.4M was budgeted .*FY2025\/26/);
  assert.match(questions[1].text, /Terminated \(Retendered\).*who holds the contract now/);
  assert.match(questions[2].text, /Auditor-General reported "Poorly installed culverts/);
  assert.ok(questions.every((q) => q.docs.length));
});

test('a contract and its payment from the same document make one question', () => {
  const questions = roadQuestions({ road, docOf, findingDoc, records: [
    record({ kind: 'contract', sourceId: 'cob2425', fy: '2024/25', status: 'implementation 100%' }),
    record({ kind: 'spent', sourceId: 'cob2425', fy: '2024/25', status: 'amount paid to date; implementation 100%' }),
  ] });
  assert.equal(questions.length, 1);
});

test('money across years is raised only for an editor-confirmed group', () => {
  const records = [
    record({ projectId: 'P-1', fy: '2024/25', sourceId: 'cob2425', status: 'implementation 100%' }),
    record({ projectId: 'P-2', fy: '2023/24', sourceId: 'adp2526', amount: 3000000, status: '100% – Completed. Payment made' }),
  ];
  const unconfirmed = roadQuestions({ road: { confirmedGroup: false }, records, docOf, findingDoc });
  const confirmed = roadQuestions({ road: { confirmedGroup: true }, records, docOf, findingDoc });
  assert.equal(unconfirmed.some((q) => /years of records/.test(q.text)), false);
  assert.match(confirmed.at(-1).text, /appears in 2 years of records \(FY2024\/25, FY2023\/24\)/);
});

test('one contract reported in two documents is one question citing both, not two allocations', () => {
  const records = [
    record({ projectId: 'P-80c4d87', fy: '2024/25', sourceId: 'cob2425', page: 'Table 3.416', amount: 4955300, status: 'implementation 100%' }),
    record({ projectId: 'P-80c4d87', fy: '2024/25', sourceId: 'cob2425', page: 'Table 3.416', amount: 4955300, kind: 'spent', status: 'amount paid to date; implementation 100%' }),
    record({ projectId: 'P-941cc00', fy: '2023/24', sourceId: 'adp2526', page: 'p.76', amount: 4955299.6, status: '100% – Completed. Await payment | Contractor: Gwasmo Limited' }),
  ];
  const questions = roadQuestions({ road: { confirmedGroup: true }, records, docOf, findingDoc });
  assert.equal(questions.length, 1);
  assert.equal(questions[0].docs.length, 2);
  assert.doesNotMatch(questions[0].text, /years of records/);
});
