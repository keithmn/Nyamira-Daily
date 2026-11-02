// Writes a data release (build brief 4.6): data/national/releases/YYYY-MM-DD.json holds every value and what changed
// since the last release. Each changed or removed figure adds an entry to data/national/corrections.json, using the
// reason a person wrote in data/national/reasons.json.
//   node scripts/national/release.mjs [YYYY-MM-DD]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, readRegistry } from '@kbe/engine/registry';
import { correctionEntries, diffValues, reusedIds, valuesOf } from '@kbe/engine/release';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data/national');

export function readReleases(from = dir) {
  const folder = join(from, 'releases');
  return readdirSync(folder).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()
    .map((f) => JSON.parse(readFileSync(join(folder, f), 'utf8')));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const date = process.argv[2] ?? new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
  const { figures, problems } = buildRegistry(readRegistry(dir));
  if (problems.length) { console.error(`Not released: ${problems.length} problems. Run npm run check:national.`); process.exit(1); }
  const history = readReleases().filter((r) => r.date < date);
  const previous = history.at(-1) ?? null;
  const values = valuesOf(figures);
  const diff = diffValues(previous?.values ?? {}, values);
  const reused = reusedIds(history.map((r) => r.values), values);
  if (reused.length) throw new Error(`These ids were retired and cannot be reused: ${reused.join(', ')}`);
  if (previous && !diff.added.length && !diff.changed.length && !diff.removed.length) { console.log(`Nothing has changed since ${previous.date}.`); process.exit(0); }
  const entries = correctionEntries(diff, JSON.parse(readFileSync(join(dir, 'reasons.json'), 'utf8')), date);
  const release = { date, previous: previous?.date ?? null, counts: { figures: figures.size, added: diff.added.length, changed: diff.changed.length, removed: diff.removed.length }, ...diff, values };
  writeFileSync(join(dir, 'releases', `${date}.json`), JSON.stringify(release, null, 1) + '\n');
  const log = JSON.parse(readFileSync(join(dir, 'corrections.json'), 'utf8')).filter((e) => e.date !== date);
  writeFileSync(join(dir, 'corrections.json'), JSON.stringify([...log, ...entries], null, 1) + '\n');
  console.log(`Release ${date}: ${figures.size} figures, ${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed`);
}
