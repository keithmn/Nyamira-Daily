// Shared by the import scripts: adds editor-accepted records from a review export to a public
// data file. Copies only the listed public fields, stamps publishedAt, skips records already
// published, refuses a changed duplicate and validates the result. Dry run unless --write.
import fs from 'node:fs';

export function mergeReviewed({ existing, exported, publishedAt, fields, validate }) {
  if (!exported || !Array.isArray(exported.items)) throw new Error('The export must contain an items array.');
  const byId = new Map(existing.map((record) => [record.id, record]));
  const added = [];
  for (const item of exported.items) {
    const current = byId.get(item?.id);
    if (current) {
      if (fields.some((field) => JSON.stringify(current[field]) !== JSON.stringify(item[field]))) {
        throw new Error(`${item.id} is already published with different values; correct it by hand.`);
      }
      continue;
    }
    // Copy only the public fields, so nothing else in an export reaches the site.
    const record = Object.fromEntries(fields.map((field) => [field, item[field]]));
    record.publishedAt = publishedAt;
    added.push(record);
    byId.set(record.id, record);
  }
  const merged = [...existing, ...added];
  validate(merged);
  return { merged, added };
}

export function runImport({ script, dataPath, merge, describe }) {
  const [exportPath, mode] = process.argv.slice(2);
  if (!exportPath || (mode && mode !== '--write')) throw new Error(`Usage: node ${script} <export.json> [--write]`);
  const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const publishedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const { merged, added } = merge(existing, exported, publishedAt);
  for (const skipped of exported.skipped || []) console.warn(`Skipped report ${skipped.reference}: ${skipped.reason}`);
  for (const record of added) console.log(`${mode ? 'Added' : 'Would add'} ${record.id}: ${describe(record)}`);
  if (!added.length) console.log('No new records to add.');
  if (mode === '--write' && added.length) fs.writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`);
}
