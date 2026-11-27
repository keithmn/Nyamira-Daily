/**
 * Data dependency graph: scans all imports from src/data/ and data/county/,
 * builds a dependency graph (data file → library → page), and validates
 * that every referenced data file exists.
 *
 *   node scripts/check-data-deps.mjs [--graph]
 *
 * With --graph, prints the full dependency tree. Without it, just validates.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const SRC = join(ROOT, 'src');
const flag = process.argv.includes('--graph');

function walk(dir, exts) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.astro') walk(p, exts).forEach((f) => out.push(f));
    else if (e.isFile() && exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

const files = walk(SRC, ['.js', '.ts', '.mjs', '.astro']);
const importRe = /from\s+['"]([^'"]+)['"]/g;

const deps = new Map();
const dataFiles = new Set();
const missing = [];

for (const f of files) {
  if (f.includes('.test.')) continue;
  const src = readFileSync(f, 'utf8');
  const rel = relative(ROOT, f);
  let m;
  while ((m = importRe.exec(src)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
    const resolved = resolve(dirname(f), spec);
    const relResolved = relative(ROOT, resolved);
    const isData = relResolved.startsWith('src/data/') || relResolved.startsWith('data/');
    if (!isData) continue;

    if (!deps.has(rel)) deps.set(rel, []);
    deps.get(rel).push(relResolved);
    dataFiles.add(relResolved);

    const candidates = [resolved, resolved + '.js', resolved + '.mjs', resolved + '.ts', resolved + '.json'];
    const exists = candidates.some((c) => existsSync(c) && statSync(c).isFile());
    if (!exists) missing.push({ consumer: rel, dataFile: relResolved });
  }
}

const libFiles = [...deps.keys()].filter((f) => f.startsWith('src/lib/'));
const pageFiles = [...deps.keys()].filter((f) => f.startsWith('src/pages/') || f.startsWith('src/components/'));

const dataToConsumers = new Map();
for (const [consumer, dataDeps] of deps) {
  for (const d of dataDeps) {
    if (!dataToConsumers.has(d)) dataToConsumers.set(d, []);
    dataToConsumers.get(d).push(consumer);
  }
}

if (flag) {
  console.log(`\n  DATA DEPENDENCY GRAPH`);
  console.log(`  ${deps.size} source files import ${dataFiles.size} data files\n`);

  const sorted = [...dataToConsumers.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [data, consumers] of sorted) {
    const libs = consumers.filter((c) => c.startsWith('src/lib/'));
    const pages = consumers.filter((c) => c.startsWith('src/pages/') || c.startsWith('src/components/'));
    console.log(`  ${data}  (${consumers.length} consumers)`);
    for (const l of libs) console.log(`    lib  ${l}`);
    for (const p of pages) console.log(`    page ${p}`);
    console.log();
  }
}

if (missing.length) {
  console.error(`\n  ✗ ${missing.length} broken data reference(s):\n`);
  for (const { consumer, dataFile } of missing) {
    console.error(`    ${consumer} → ${dataFile} (not found)`);
  }
  process.exit(1);
} else {
  console.log(`  ✓ All ${dataFiles.size} data file references resolve (${deps.size} source files checked)`);
}
