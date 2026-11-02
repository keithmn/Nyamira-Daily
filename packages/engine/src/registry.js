// Loads the figure registry and enforces its rules. The build fails on any problem, and every problem names the
// figure and its source page, so the fix can start from the document (build brief 4.1).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLAUDE, Figure, Source } from './schema.js';
import { evaluate } from './formula.js';

export function readRegistry(dir) {
  const rawSources = JSON.parse(readFileSync(join(dir, 'sources.json'), 'utf8'));
  const rawFigures = [];
  for (const file of readdirSync(join(dir, 'figures')).filter((f) => f.endsWith('.json')).sort()) {
    const { defaults = {}, figures } = JSON.parse(readFileSync(join(dir, 'figures', file), 'utf8'));
    for (const f of figures) rawFigures.push({ file, figure: { ...defaults, ...f } });
  }
  return { rawSources, rawFigures };
}

const where = (f) => `${f.id} (${f.source}, ${f.page})`;

export function buildRegistry({ rawSources, rawFigures }) {
  const problems = [];
  const sources = new Map(), figures = new Map();
  for (const raw of rawSources) {
    const r = Source.safeParse(raw);
    if (!r.success) { problems.push(`Source ${raw.id ?? '(no id)'}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`); continue; }
    if (sources.has(r.data.id)) problems.push(`Source ${r.data.id} appears twice`);
    sources.set(r.data.id, r.data);
  }
  for (const { file, figure } of rawFigures) {
    const r = Figure.safeParse(figure);
    if (!r.success) { problems.push(`${figure.id ?? '(no id)'} in ${file}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`); continue; }
    if (figures.has(r.data.id)) problems.push(`${where(r.data)} appears twice`);
    figures.set(r.data.id, r.data);
  }
  problems.push(...checkRules(sources, figures));
  return { sources, figures, problems };
}

const tolerance = (sources, f) => sources.get(f.source)?.tolerance?.[f.unit] ?? 0;
const close = (a, b, tol) => Math.abs(a - b) <= tol + 1e-9;

// Figures may be added together only when they match on all of these. A listing `within` a figure may cut the money
// a different way, so it leaves out the grouping.
const COMPARABLE = ['fy', 'stage', 'unit', 'money'];
const SAME = [...COMPARABLE, 'grouping'];
function mismatch(a, b, keys = SAME) { return keys.filter((k) => a[k] !== b[k]); }
// A formula that only adds. Multiplying or dividing one figure by another is a ratio, so may cross groupings.
const isSum = (formula) => !/[a-z)]\s*[*/]\s*[a-z(]/.test(formula);
const idYear = (id) => id.split('.')[1].slice(2).replace('-', '/');

export function checkRules(sources, figures) {
  const problems = [];
  const kids = new Map(), listed = new Map();
  for (const f of figures.values()) {
    const source = sources.get(f.source);
    if (!source) problems.push(`${where(f)}: unknown source`);
    if (idYear(f.id) !== f.fy) problems.push(`${where(f)}: the id says ${idYear(f.id)}, the figure says ${f.fy}`);
    const printed = f.page.match(/\bp\.(\d+)/);
    if (source?.pageOffset != null && f.pdfPage != null && printed && Number(printed[1]) !== f.pdfPage + source.pageOffset) problems.push(`${where(f)}: PDF p.${f.pdfPage} does not fit printed p.${printed[1]} (offset ${source.pageOffset})`);
    if (f.label === 'verified' && f.checkedBy === CLAUDE) problems.push(`${where(f)}: only a person's check earns "verified" (checkedBy is ${CLAUDE})`);
    if (f.within) {
      const t = figures.get(f.within);
      if (!t) problems.push(`${where(f)}: "within" points to unknown ${f.within}`);
      else {
        const bad = mismatch(f, t, COMPARABLE);
        if (bad.length) problems.push(`${where(f)}: cannot sit within ${t.id}: different ${bad.join(', ')}`);
        if (!listed.has(t.id)) listed.set(t.id, []);
        listed.get(t.id).push(f);
      }
    }
    if (f.parent) {
      const p = figures.get(f.parent);
      if (!p) { problems.push(`${where(f)}: unknown parent ${f.parent}`); continue; }
      const bad = mismatch(f, p);
      if (bad.length) problems.push(`${where(f)}: cannot be part of ${p.id}: different ${bad.join(', ')}`);
      if (!kids.has(p.id)) kids.set(p.id, []);
      kids.get(p.id).push(f);
    }
  }
  for (const [id, list] of kids) {
    const p = figures.get(id), sum = list.reduce((a, c) => a + c.value, 0), tol = tolerance(sources, p);
    if (!close(sum, p.value, tol)) problems.push(`${where(p)}: its ${list.length} parts add to ${sum}, not ${p.value} (tolerance ${tol})`);
  }
  for (const [id, list] of listed) {
    const t = figures.get(id), sum = list.reduce((a, c) => a + c.value, 0);
    if (sum > t.value + tolerance(sources, t) + 1e-9) problems.push(`${where(t)}: the ${list.length} amounts listed within it add to ${sum}, more than ${t.value}`);
  }
  for (const f of figures.values()) {
    if (f.parts) {
      const parts = f.parts.map((i) => figures.get(i));
      const missing = f.parts.filter((i) => !figures.has(i));
      if (missing.length) { problems.push(`${where(f)}: unknown parts ${missing.join(', ')}`); continue; }
      for (const c of parts) { const bad = mismatch(f, c); if (bad.length) problems.push(`${where(f)}: cannot add ${c.id}: different ${bad.join(', ')}`); }
      const sum = parts.reduce((a, c) => a + c.value, 0), tol = tolerance(sources, f);
      if (!close(sum, f.value, tol)) problems.push(`${where(f)}: parts add to ${sum}, not ${f.value} (tolerance ${tol})`);
    }
    if (f.calc) {
      const inputs = f.calc.inputs.map((i) => figures.get(i));
      const missing = f.calc.inputs.filter((i) => !figures.has(i));
      if (missing.length) { problems.push(`${where(f)}: unknown calc inputs ${missing.join(', ')}`); continue; }
      for (const c of inputs) {
        if (c.fy !== f.fy || c.stage !== f.stage) problems.push(`${where(f)}: calc mixes ${c.id}: different stage or year`);
        if (c.money !== f.money) problems.push(`${where(f)}: calc mixes ${c.id}: ${c.money} and ${f.money} money`);
      }
      if (isSum(f.calc.formula)) for (const c of inputs) {
        const bad = mismatch(inputs[0], c, ['unit', 'grouping']);
        if (bad.length) problems.push(`${where(f)}: calc adds ${c.id}: different ${bad.join(', ')}`);
      }
      const got = evaluate(f.calc.formula, inputs.map((c) => c.value));
      const rounded = Number(got.toFixed(f.calc.round));
      if (rounded !== f.value) problems.push(`${where(f)}: calc gives ${rounded}, stored value is ${f.value}`);
    }
  }
  return problems;
}

// Sources whose next document is overdue: a warning, never a build failure (build brief 4.6).
export function staleSources(sources, today) {
  return [...sources.values()].filter((s) => s.nextExpected && s.nextExpected.date < today).map((s) => ({ id: s.id, ...s.nextExpected }));
}

export const children = (figures, id) => [...figures.values()].filter((f) => f.parent === id);
