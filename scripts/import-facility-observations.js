// Adds editor-accepted facility observations from a review export
// (/api/review-facilities-export) to src/data/facility-observations.json.
// Dry run by default; pass --write to change the file. publishedAt records when
// the observation entered the public data; readers see it after the next deploy.
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { validateFacilityObservations } from '../src/lib/facility-observations.js';
import { mergeReviewed, runImport } from './import-reviewed.js';

const dataPath = fileURLToPath(new URL('../src/data/facility-observations.json', import.meta.url));
const require = createRequire(import.meta.url);
const facilities = require('../src/data/facilities.json');
const exportFields = [
  'id', 'facilityId', 'category', 'capability', 'scope', 'status',
  'observedOn', 'source', 'sourceRef', 'evidence', 'reviewedAt',
];

export function mergeFacilityObservations(existing, exported, publishedAt) {
  return mergeReviewed({ existing, exported, publishedAt, fields: exportFields,
    validate: (records) => validateFacilityObservations(records, facilities) });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runImport({ script: 'scripts/import-facility-observations.js', dataPath, merge: mergeFacilityObservations,
    describe: (r) => `${r.facilityId} · ${r.capability} · ${r.status} on ${r.observedOn}` });
}
