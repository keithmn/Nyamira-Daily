// Adds editor-accepted facility observations from a review export
// (/api/review-facilities-export) to src/data/facility-observations.json.
// Dry run by default; pass --write to change the file. publishedAt records when
// the observation entered the public data; readers see it after the next deploy.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { validateFacilityObservations } from '../src/lib/facility-observations.js';

const dataPath = fileURLToPath(new URL('../src/data/facility-observations.json', import.meta.url));
const require = createRequire(import.meta.url);
const facilities = require('../src/data/facilities.json');
const exportFields = [
  'id', 'facilityId', 'category', 'capability', 'scope', 'status',
  'observedOn', 'source', 'sourceRef', 'evidence', 'reviewedAt',
];

export function mergeFacilityObservations(existing, exported, publishedAt) {
  if (!exported || !Array.isArray(exported.items)) throw new Error('The export must contain an items array.');
  const byId = new Map(existing.map((record) => [record.id, record]));
  const added = [];
  for (const item of exported.items) {
    const current = byId.get(item?.id);
    if (current) {
      if (exportFields.some((field) => current[field] !== item[field])) {
        throw new Error(`Observation ${item.id} is already published with different values; correct it by hand.`);
      }
      continue;
    }
    // Copy only the public fields, so nothing else in an export reaches the site.
    const record = Object.fromEntries(exportFields.map((field) => [field, item[field]]));
    record.publishedAt = publishedAt;
    added.push(record);
    byId.set(record.id, record);
  }
  const merged = [...existing, ...added];
  validateFacilityObservations(merged, facilities);
  return { merged, added };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [exportPath, mode] = process.argv.slice(2);
  if (!exportPath || (mode && mode !== '--write')) {
    throw new Error('Usage: node scripts/import-facility-observations.js <export.json> [--write]');
  }
  const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const publishedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const { merged, added } = mergeFacilityObservations(existing, exported, publishedAt);
  for (const skipped of exported.skipped || []) {
    console.warn(`Skipped report ${skipped.reference}: ${skipped.reason}`);
  }
  for (const record of added) {
    console.log(`${mode ? 'Added' : 'Would add'} ${record.id}: ${record.facilityId} · ${record.capability} · ${record.status} on ${record.observedOn}`);
  }
  if (!added.length) console.log('No new observations to add.');
  if (mode === '--write' && added.length) fs.writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`);
}
