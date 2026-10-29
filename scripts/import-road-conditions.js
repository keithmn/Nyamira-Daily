// Adds editor-accepted road condition reports from a review export (/api/review-roads-export)
// to src/data/road-conditions.json. Dry run by default; pass --write to change the file.
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { validateRoadConditions } from '../src/lib/road-conditions.js';
import { mergeReviewed, runImport } from './import-reviewed.js';

const dataPath = fileURLToPath(new URL('../src/data/road-conditions.json', import.meta.url));
const require = createRequire(import.meta.url);
const roads = require('../src/data/roads.json').roads;
const exportFields = ['id', 'roadId', 'grade', 'scope', 'observedOn', 'source', 'sourceRef', 'evidence', 'reviewedAt', 'checks'];

export function mergeRoadConditions(existing, exported, publishedAt) {
  return mergeReviewed({ existing, exported, publishedAt, fields: exportFields,
    validate: (records) => validateRoadConditions(records, roads) });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runImport({ script: 'scripts/import-road-conditions.js', dataPath, merge: mergeRoadConditions,
    describe: (r) => `${r.roadId} · ${r.grade} on ${r.observedOn}${r.checks.length ? ` · ${r.checks.length} check(s)` : ''}` });
}
