import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { pct, statusCountsFor } from './project-status.js';

const { projects: sourceProjects } = JSON.parse(readFileSync(new URL('../data/wardspend.json', import.meta.url), 'utf8'));

const empty = () => ({
  done: 0,
  going: 0,
  none: 0,
  total: 0,
  undated: 0,
  conflicts: 0,
  unreported: 0,
  unidentified: 0,
  observedFrom: null,
  observedThrough: null,
  sources: [],
});

function record(overrides = {}) {
  return {
    projectId: 'P-0000001',
    ward: 'rigoma',
    name: 'Construction of a health facility',
    fy: '2024/25',
    observedOn: '2024-06-30',
    status: 'completion 50%',
    ...overrides,
  };
}

test('empty input has an empty summary', () => {
  assert.deepEqual(statusCountsFor([]), empty());
});

test('reordering observations does not change the selected status', () => {
  const records = [
    record({ observedOn: '2024-06-30', status: 'completion 0%' }),
    record({ observedOn: '2025-06-30', status: 'completion 100%' }),
  ];
  assert.deepEqual(statusCountsFor(records), statusCountsFor([...records].reverse()));
  assert.deepEqual(statusCountsFor(records), { ...empty(), done: 1, total: 1, observedFrom: '2025-06-30', observedThrough: '2025-06-30' });
});

test('repeated observations for one project count once', () => {
  assert.deepEqual(
    statusCountsFor([
      record({ status: 'completion 62%' }),
      record({ kind: 'spent', status: 'cumulative expenditure; completion 62%' }),
    ]),
    { ...empty(), going: 1, total: 1, observedFrom: '2024-06-30', observedThrough: '2024-06-30' },
  );
});

test('a changed name with the same reviewed project ID remains one project', () => {
  assert.deepEqual(
    statusCountsFor([
      record({ name: 'Construction of a health facility', observedOn: '2024-06-30', status: 'completion 50%' }),
      record({ name: 'Completion of a health facility', observedOn: '2025-06-30', status: 'completion 62%' }),
    ]),
    { ...empty(), going: 1, total: 1, observedFrom: '2025-06-30', observedThrough: '2025-06-30' },
  );
});

test('the current renamed Biticha records stay unresolved rather than counting twice or guessing a date', () => {
  const biticha = sourceProjects.filter((project) => project.projectId === 'P-5ab05f9' && project.status != null);
  assert.equal(new Set(biticha.map((project) => project.projectId)).size, 1);
  assert.deepEqual(statusCountsFor(biticha), { ...empty(), undated: 1 });
});

test('similar names with distinct IDs remain separate projects', () => {
  assert.deepEqual(
    statusCountsFor([
      record({ projectId: 'P-0000001', status: 'completion 100%' }),
      record({ projectId: 'P-0000002', name: 'Construction of a health facility phase two', status: 'completion 40%' }),
    ]),
    { ...empty(), done: 1, going: 1, total: 2, observedFrom: '2024-06-30', observedThrough: '2024-06-30' },
  );
});

test('the latest dated observation wins regardless of input order', () => {
  const records = [
    record({ observedOn: '2025-06-30', status: 'completion 25%' }),
    record({ observedOn: '2024-06-30', status: 'completion 80%' }),
  ];
  assert.deepEqual(statusCountsFor(records), { ...empty(), going: 1, total: 1, observedFrom: '2025-06-30', observedThrough: '2025-06-30' });
  assert.deepEqual(statusCountsFor(records), statusCountsFor([...records].reverse()));
});

test('financial-year labels and invalid dates do not count as observation dates', () => {
  assert.deepEqual(
    statusCountsFor([record({ fy: '2024/25', observedOn: undefined })]),
    { ...empty(), undated: 1 },
  );
  assert.deepEqual(
    statusCountsFor([record({ observedOn: '30/06/2025' })]),
    { ...empty(), undated: 1 },
  );
  assert.deepEqual(
    statusCountsFor([record({ observedOn: '2025-02-30' })]),
    { ...empty(), undated: 1 },
  );
});

test('the explicit as-at date in the existing schema is an observation date', () => {
  assert.deepEqual(
    statusCountsFor([record({ fy: 'as at 30 Jun 2025', observedOn: undefined, status: 'completion 62%', sourceId: 'cadp2627', page: 'p.55' })]),
    { ...empty(), going: 1, total: 1, observedFrom: '2025-06-30', observedThrough: '2025-06-30', sources: [{ sourceId: 'cadp2627', pages: ['p.55'] }] },
  );
});

test('approved CADP source dates are explicit and cover the reviewed candidate records', () => {
  const candidateIds = new Set([
    'P-b1944f0',
    'P-610ca53',
    'P-bb6f38c',
    'P-d116175',
    'P-0493bd5',
    'P-0b87b5e',
    'P-344a863',
    'P-9e8373f',
    'P-549ea2d',
    'P-c6ee20e',
    'P-e1db09c',
    'P-ab34c05',
    'P-788a27d',
    'P-27c3a61',
    'P-bf07028',
  ]);
  const candidates = sourceProjects.filter((project) => candidateIds.has(project.projectId));

  assert.equal(new Set(candidates.map((project) => project.projectId)).size, 15);
  assert.equal(candidates.length, 25);
  assert.ok(candidates.every((project) => project.observedOn === '2025-06-30'));
  assert.ok(candidates.every((project) => project.sourceId === 'cadp2627'));
  assert.deepEqual(statusCountsFor(candidates), {
    ...empty(),
    done: 10,
    going: 4,
    none: 1,
    total: 15,
    observedFrom: '2025-06-30',
    observedThrough: '2025-06-30',
    sources: [{
      sourceId: 'cadp2627',
      pages: [
        'p.54-55 (s.2.3.2 Medical Services)',
        'p.55 (s.2.3.2 Primary Health Care budget allocation 2024/2025)',
        'p.60-61 (s.2.3.2 Water, Sanitation & Irrigation)',
      ],
    }],
  });
});

test('a missing project identity is excluded and reported', () => {
  assert.deepEqual(
    statusCountsFor([record({ projectId: '' })]),
    { ...empty(), unidentified: 1 },
  );
});

test('conflicting observations on the latest date remain unresolved', () => {
  const records = [
    record({ status: 'completion 62%' }),
    record({ kind: 'spent', status: 'completion 77%' }),
  ];
  assert.deepEqual(statusCountsFor(records), { ...empty(), conflicts: 1 });
  assert.deepEqual(statusCountsFor(records), statusCountsFor([...records].reverse()));
});

test('unsupported completion values do not count as progress', () => {
  assert.deepEqual(
    statusCountsFor([record({ status: 'completion not stated' })]),
    { ...empty(), unreported: 1 },
  );
  assert.deepEqual(
    statusCountsFor([record({ status: 'completion 150%' })]),
    { ...empty(), unreported: 1 },
  );
  assert.deepEqual(
    statusCountsFor([record({ status: '100% – Achieved; cumulative expenditure/commitment' })]),
    { ...empty(), unreported: 1 },
  );
});

test('percentage parsing rejects values outside the supported range', () => {
  assert.equal(pct('STALLED – 77% complete before stalling'), 77);
  assert.equal(pct('completion 150%'), null);
  assert.equal(pct('completion 1.5%'), null);
  assert.equal(pct('100% – Achieved; cumulative expenditure/commitment'), null);
});

test('physical progress is selected instead of an earlier expenditure percentage', () => {
  assert.equal(pct('Expenditure 100%; physical progress 50%'), 50);
});

test('financial progress is not interpreted as physical progress', () => {
  assert.equal(pct('Financial progress 100%'), null);
});

test('financial completion and negated completion claims are unsupported', () => {
  assert.equal(pct('Financial completion 100%'), null);
  assert.equal(pct('Not 100% complete'), null);
  assert.equal(pct('completion not 100%'), null);
});

test('Unicode minus signs are not discarded before percentage parsing', () => {
  assert.equal(pct('Physical progress −10%'), null);
});

test('a dated financial-only status is not counted as a completed project', () => {
  assert.deepEqual(
    statusCountsFor([record({ status: 'financial completion 100%' })]),
    { ...empty(), unreported: 1 },
  );
});

test('a target completion value is not selected over an observed physical progress value', () => {
  assert.equal(pct('Target completion 100%; current physical progress 40%'), 40);
});

test('negative physical progress is rejected rather than made positive', () => {
  assert.equal(pct('Physical progress -10%'), null);
  assert.equal(pct('Physical progress -10%; physical progress 50%'), null);
});

test('conflicting physical progress values remain unsupported', () => {
  assert.equal(pct('Physical progress 40%; physical progress 55%'), null);
});

test('decimal physical progress is rejected rather than partially parsed', () => {
  assert.equal(pct('Physical progress 1.5%'), null);
  assert.equal(pct('Physical progress 1.5%; physical progress 50%'), null);
  assert.equal(pct('Physical progress 101%; physical progress 50%'), null);
});

test('supported source status phrases remain parseable as physical progress', () => {
  assert.equal(pct('completion 62%'), 62);
  assert.equal(pct('implementation 7%'), 7);
  assert.equal(pct('100% – Completed. Payment made'), 100);
  assert.equal(pct('62% – On-going'), 62);
  assert.equal(pct('77% complete before stalling'), 77);
  assert.equal(pct("100% (phase 1) – Complete | column is 'cumulative expenditure/commitment'"), 100);
});

test('procurement-stage and mobilisation labels are not physical completion', () => {
  assert.equal(pct('0% – Not procured'), null);
  assert.equal(pct('5% – Mobilised'), null);
  assert.equal(pct('15% – Procurement process on-going'), null);
});

test('an undated percentage for a project prevents a dated status from being presented as latest', () => {
  assert.deepEqual(
    statusCountsFor([
      record({ observedOn: '2025-06-30', status: 'completion 62%' }),
      record({ fy: '2023/24', observedOn: undefined, status: 'completion 50%' }),
    ]),
    { ...empty(), undated: 1 },
  );
});
