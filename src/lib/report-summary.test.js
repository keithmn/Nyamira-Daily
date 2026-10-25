import assert from 'node:assert/strict';
import test from 'node:test';
import { summariseClinicChecks } from './report-summary.js';

test('clinic summaries keep uncertainty distinct from no or zero reports', () => {
  const summary = summariseClinicChecks([
    {
      ward: 'gesima',
      place: 'Example Dispensary',
      reportedOn: '2026-10-24',
      clinic: { medicines: 'none', staff: 'no', openHours: 'yes', waiting: 'under 30 min' },
    },
    {
      ward: 'gesima',
      place: 'Example Dispensary',
      reportedOn: '2026-10-25',
      clinic: { medicines: 'unknown', staff: 'unknown', openHours: 'unknown', waiting: 'unknown' },
    },
  ])[0];

  assert.deepEqual(summary.medicines, { yes: 0, some: 0, none: 1, unknown: 1 });
  assert.deepEqual(summary.staff, { yes: 0, no: 1, unknown: 1 });
  assert.deepEqual(summary.openHours, { yes: 1, no: 0, unknown: 1 });
  assert.deepEqual(summary.waiting, { under30: 1, thirtyToSixty: 0, oneToTwoHours: 0, overTwoHours: 0, unknown: 1 });
});
