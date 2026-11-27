// Build-time ward-slug validator: every ward reference in data files and content collections
// must match a civic ward record in wards.json (each of which is checked against the IEBC ward register by
// scripts/build-ward-register.test.js), or the check fails.
//   node scripts/check-ward-slugs.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'));

const wards = read('src/data/wards.json');
const VALID = new Set(wards.map((w) => w.slug));
const problems = [];
let checked = 0;

function check(slug, file, record) {
  checked++;
  if (slug && !VALID.has(slug)) {
    problems.push({ slug, file, record });
  }
}

// wardspend.json — projects[].ward
try {
  const ws = read('src/data/wardspend.json');
  for (const p of ws.projects || []) {
    check(p.ward, 'src/data/wardspend.json', `project: ${p.name || '(unnamed)'}`);
  }
} catch {}

// facilities.json — [].ward
try {
  const fac = read('src/data/facilities.json');
  for (const f of fac) {
    check(f.ward, 'src/data/facilities.json', `facility: ${f.id || f.name}`);
  }
} catch {}

// roads.json — roads[].wards[]
try {
  const rd = read('src/data/roads.json');
  for (const r of rd.roads || []) {
    for (const w of r.wards || []) {
      check(w, 'src/data/roads.json', `road: ${r.id} ${r.name || ''}`);
    }
  }
} catch {}

// audit.json — findings[].ward
try {
  const au = read('src/data/audit.json');
  for (const f of au.findings || []) {
    if (f.ward) check(f.ward, 'src/data/audit.json', `finding: ${f.id} ${f.title || ''}`);
  }
} catch {}

// contracts.json — contracts[].wards[]
try {
  const ct = read('src/data/contracts.json');
  for (const c of ct.contracts || []) {
    for (const w of c.wards || []) {
      check(w, 'src/data/contracts.json', `contract: ${c.id} ${c.title || ''}`);
    }
  }
} catch {}

// living/events.json — events may reference wards via place lookup; check direct ward fields
try {
  const ev = read('src/data/living/events.json');
  const events = Array.isArray(ev) ? ev : ev.events || [];
  for (const e of events) {
    if (e.ward) check(e.ward, 'src/data/living/events.json', `event: ${e.place || '(no place)'} ${e.field || ''}`);
  }
} catch {}

// Content collections: scan frontmatter for ward: and wards: fields
function scanContent(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanContent(full);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;
    const text = readFileSync(full, 'utf8');
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    const rel = full.replace(root + '/', '');

    // ward: single value
    const wardLine = fm.match(/^ward:\s*(.+)$/m);
    if (wardLine) {
      const slug = wardLine[1].trim().replace(/^["']|["']$/g, '');
      if (slug) check(slug, rel, entry.name);
    }

    // wards: YAML array (flow or block)
    const wardsFlow = fm.match(/^wards:\s*\[([^\]]*)\]/m);
    if (wardsFlow) {
      for (const item of wardsFlow[1].split(',')) {
        const slug = item.trim().replace(/^["']|["']$/g, '');
        if (slug) check(slug, rel, entry.name);
      }
    } else {
      const wardsBlock = fm.match(/^wards:\s*\n((?:\s+-\s+.+\n?)+)/m);
      if (wardsBlock) {
        for (const line of wardsBlock[1].split('\n')) {
          const m = line.match(/^\s+-\s+(.+)/);
          if (m) {
            const slug = m[1].trim().replace(/^["']|["']$/g, '');
            if (slug) check(slug, rel, entry.name);
          }
        }
      }
    }
  }
}

scanContent(join(root, 'src', 'content'));

// Report
if (problems.length === 0) {
  console.log(`✓ All ward slugs valid (${checked} references checked across data files and content)`);
  process.exit(0);
} else {
  console.error(`✗ Unknown ward slugs found (${problems.length} bad references out of ${checked} checked):\n`);
  for (const p of problems) {
    console.error(`  "${p.slug}" in ${p.file} — ${p.record}`);
  }
  console.error(`\nValid slugs: ${[...VALID].sort().join(', ')}`);
  process.exit(1);
}
