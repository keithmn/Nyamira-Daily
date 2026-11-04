// After a build, checks the county budget pages in dist/ (decision #105, phase C4): every department and programme
// in the registry has its page, no internal link on a money page is broken, and no page's HTML is heavier than the
// limit once compressed. Needs no browser, so it can run anywhere the site builds.
//   ND_SITE_URL=https://nyamiradaily.org npm run build && npm run check:county:pages
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { departments, departmentPath, programmePath } from '../../src/lib/county-budget.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(root, 'dist');
// Readers are on cheap phones and expensive data (AGENTS.md). The national product allows 60 KB of HTML per page.
export const HTML_LIMIT_KB = 60;

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const built = (path) => existsSync(join(DIST, path, 'index.html'));

export function checkPages() {
  const problems = [];
  if (!existsSync(join(DIST, 'data/money/index.html'))) return { problems: ['No build found: run the build first'], pages: 0 };
  // The pages' own address functions, so this check cannot drift from what the site builds
  for (const d of departments()) {
    if (!built(departmentPath(d.vote))) problems.push(`No page for vote ${d.vote} (${d.name})`);
    for (const p of d.programmes) if (!built(programmePath(d.vote, p.slug))) problems.push(`No page for programme "${p.name}" of vote ${d.vote}`);
  }
  const htmls = walk(join(DIST, 'data/money')).filter((f) => f.endsWith('.html'));
  for (const f of htmls) {
    const html = readFileSync(f);
    const where = f.replace(DIST, '').replace(/\\/g, '/');
    const kb = gzipSync(html).length / 1024;
    if (kb > HTML_LIMIT_KB) problems.push(`${where} is ${kb.toFixed(1)} KB compressed, over ${HTML_LIMIT_KB} KB`);
    for (const m of html.toString('utf8').matchAll(/href="(\/[^"#?]*)/g)) {
      const p = m[1];
      if (!existsSync(p.endsWith('/') ? join(DIST, p, 'index.html') : join(DIST, p)) && !existsSync(join(DIST, p, 'index.html'))) problems.push(`${where} links to ${p}, which is not built`);
    }
  }
  return { problems: [...new Set(problems)], pages: htmls.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { problems, pages } = checkPages();
  if (problems.length) { for (const p of problems) console.error(p); process.exit(1); }
  console.log(`County budget pages: ${pages} pages built, every department and programme has its page, no broken links, all under ${HTML_LIMIT_KB} KB.`);
}
