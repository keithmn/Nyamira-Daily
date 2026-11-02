// npm run check:national, the data part (build brief 4). Fails on a broken rule, a table whose readings disagree, a
// generated file out of step with its CSV, a figure missing from the latest release, or a stored PDF that has changed.
// Warnings never fail: an overdue document, a source with no archive copy, or a table waiting for a person's check.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '@kbe/engine/csv';
import { buildRegistry, readRegistry, staleSources } from '@kbe/engine/registry';
import { diffValues, valuesOf } from '@kbe/engine/release';
import { GENERATED } from './build-figures.mjs';
import { runDoubleEntry } from './double-entry.mjs';
import { readReleases } from './release.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(root, 'data/national');

export function checkNational(today) {
  const errors = [], warnings = [];
  const { sources, figures, problems } = buildRegistry(readRegistry(dir));
  errors.push(...problems);

  for (const [file, make] of Object.entries(GENERATED)) {
    const stored = JSON.parse(readFileSync(join(dir, 'figures', file), 'utf8'));
    if (JSON.stringify(stored) !== JSON.stringify(make())) errors.push(`${file} does not match its CSV: run node scripts/national/build-figures.mjs`);
  }

  const { act, county } = runDoubleEntry();
  errors.push(...act.unresolved.map((r) => `Appropriation Act ${r.key}: readings disagree, ${r.first} against ${r.second}`), ...county.map((p) => `County Act: ${p}`));

  const latest = readReleases().at(-1);
  if (!latest) errors.push('No data release yet: run npm run release:national');
  else {
    const { added, changed, removed } = diffValues(latest.values, valuesOf(figures));
    if (added.length || changed.length || removed.length) errors.push(`${added.length + changed.length + removed.length} figures differ from release ${latest.date}: run npm run release:national`);
  }

  let held = 0;
  for (const s of sources.values()) {
    if (!s.file) continue;
    const path = join(root, 'data-src/national/pdfs', s.file);
    if (!existsSync(path)) continue;
    held++;
    if (createHash('sha256').update(readFileSync(path)).digest('hex') !== s.sha256) errors.push(`${s.file} is not the document the registry recorded`);
  }

  for (const s of staleSources(sources, today)) warnings.push(`Overdue: ${s.what} was expected by ${s.date} (${s.id})`);
  for (const s of sources.values()) if (s.docType !== 'press' && !s.archive) warnings.push(`No archive copy: ${s.id}`);
  for (const c of parseCsv(readFileSync(join(root, 'data-src/national/person-checks.csv'), 'utf8'))) {
    if (c.status === 'waiting') warnings.push(`Waiting for a person: ${c.what} (${c.rows} rows, ${c.table})`);
  }
  return { errors, warnings, figures: figures.size, sources: sources.size, held, act };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
  const { errors, warnings, figures, sources, held, act } = checkNational(today);
  console.log(`${figures} figures from ${sources} sources. ${held} stored PDFs matched their SHA-256.`);
  console.log(`Appropriation Act double entry: ${act.agree} agree, ${act.otherColumn.length} same digits in another column, ${act.resolved.length} resolved, ${act.unresolved.length} unresolved.`);
  for (const w of warnings) console.log(`  warning: ${w}`);
  for (const e of errors) console.error(`  ERROR: ${e}`);
  console.log(errors.length ? `check:national failed with ${errors.length} errors` : 'check:national passed');
  process.exitCode = errors.length ? 1 : 0;
}
