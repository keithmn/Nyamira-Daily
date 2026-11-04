// The county figure registry (decision #105), read once at build time together with the national one, so a county
// figure can cite a national source. Any broken rule stops the build, naming the figure and its source page.
// Pages ask for figures by id; arithmetic lives in county-money.js and county-budget.js, with tests.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, readRegistry } from '@kbe/engine/registry';

// Astro bundles this file, so the repo root comes from the build config; tests run it straight from src/lib.
const ROOT = typeof __ND_ROOT__ === 'undefined' ? fileURLToPath(new URL('../..', import.meta.url)) : __ND_ROOT__;

const national = readRegistry(join(ROOT, 'data/national'));
const county = readRegistry(join(ROOT, 'data/county/nyamira'));
const { sources, figures, problems } = buildRegistry({
  rawSources: [...national.rawSources, ...county.rawSources],
  rawFigures: [...national.rawFigures, ...county.rawFigures],
});
if (problems.length) throw new Error(`The county figure registry has ${problems.length} problems:\n${problems.join('\n')}`);

export const structure = JSON.parse(readFileSync(join(ROOT, 'data/county/nyamira/structure-2025-26.json'), 'utf8'));
export const notes = JSON.parse(readFileSync(join(ROOT, 'data/county/nyamira/notes.json'), 'utf8'));
export const departmentsHistory = JSON.parse(readFileSync(join(ROOT, 'data/county/nyamira/departments-history.json'), 'utf8'));
// Read here, not imported, so the tests can run this file without Astro.
export const wardspend = JSON.parse(readFileSync(join(ROOT, 'src/data/wardspend.json'), 'utf8'));

// A figure with its source document. An unknown id stops the build: a page never shows a gap by accident.
export function fig(id) {
  const f = figures.get(id);
  if (!f) throw new Error(`Unknown figure ${id}`);
  return { ...f, doc: sources.get(f.source) };
}

export const hasFig = (id) => figures.has(id);
export const value = (id) => fig(id).value;
// The value, or null where the document gives none: unknown stays unknown.
export const maybe = (id) => (figures.has(id) ? figures.get(id).value : null);
export const sourceDoc = (id) => sources.get(id);

// "Controller of Budget, FY2025/26 report, Table 2.5, p.9": who published it, which document, and where.
export function sourceLine(f) {
  const doc = f.doc ?? sources.get(f.source);
  return `${doc.issuer.replace(/^Office of the /, '')}, ${shortTitle(doc)}, ${f.page}`;
}

export function shortTitle(doc) {
  return doc.title.replace(/\s*\((?:[^()]*)\)\s*$/, '');
}
