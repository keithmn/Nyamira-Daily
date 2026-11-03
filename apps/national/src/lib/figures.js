// The figure registry, read once at build time. Any broken rule stops the build here, and the message names the figure
// and its source page (build brief 7.6). Pages ask for figures by id and hold no arithmetic of their own.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { citation, shortenTitle } from '@kbe/engine/citation';
import { buildRegistry, readRegistry } from '@kbe/engine/registry';
import { site } from '../site.js';

const DATA = typeof __KBE_DATA__ === 'undefined' ? fileURLToPath(new URL('../../../../data/national', import.meta.url)) : __KBE_DATA__;

const { sources, figures, problems } = buildRegistry(readRegistry(DATA));
if (problems.length) throw new Error(`The figure registry has ${problems.length} problems:\n${problems.join('\n')}`);

const RELEASES = readdirSync(join(DATA, 'releases')).filter((f) => f.endsWith('.json')).sort();
export const release = RELEASES.at(-1).replace('.json', '');
// Every data release, newest first, as written by scripts/national/release.mjs
export const allReleases = () => RELEASES.toReversed().map((f) => JSON.parse(readFileSync(join(DATA, 'releases', f), 'utf8')));
const corrections = JSON.parse(readFileSync(join(DATA, 'corrections.json'), 'utf8'));
export const allCorrections = () => corrections;
export const sectorMap = JSON.parse(readFileSync(join(DATA, 'sectors.json'), 'utf8'));
export const outcomes = JSON.parse(readFileSync(join(DATA, 'outcomes.json'), 'utf8'));

export const FY = 'FY2026/27';
export const PREFIX = 'ke.fy2026-27.';

// A figure with its source document. An unknown id stops the build: a page never shows a gap by accident.
export function fig(id) {
  const full = id.startsWith('ke.') ? id : PREFIX + id;
  const f = figures.get(full);
  if (!f) throw new Error(`Unknown figure ${full}`);
  return { ...f, doc: sources.get(f.source) };
}

export const hasFigure = (id) => figures.has(id.startsWith('ke.') ? id : PREFIX + id);
export const allFigures = () => [...figures.values()];
export const sourceDoc = (id) => sources.get(id);
export const shortTitle = (doc) => shortenTitle(doc.title);
export const citationFor = (f) => citation(f, f.doc, release, site.name);
export const correctionFor = (id) => corrections.filter((c) => c.id === id).at(-1) ?? null;
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
