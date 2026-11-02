// Searches each figure's PDF page for its value, for the figures typed by hand. Run it after changing
// data/national/figures/budget-2026-27.json. Needs pdftotext and the stored PDFs, so it runs here, not in CI.
//   node scripts/national/verify-pages.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, readRegistry } from '@kbe/engine/registry';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { sources, figures } = buildRegistry(readRegistry(join(root, 'data/national')));
const typed = JSON.parse(readFileSync(join(root, 'data/national/figures/budget-2026-27.json'), 'utf8')).figures.map((f) => figures.get(f.id));
const pages = new Map();
const pageText = (file, page) => {
  const key = `${file}#${page}`;
  if (!pages.has(key)) pages.set(key, execFileSync('pdftotext', ['-layout', '-f', String(page), '-l', String(page), join(root, 'data-src/national/pdfs', file), '-'], { encoding: 'latin1' }).replace(/,/g, ''));
  return pages.get(key);
};

const scale = { 'KSh bn': 1e9, 'KSh m': 1e6, KSh: 1 };
export function findOnPage(text, f) {
  const shown = f.unit === 'KSh' ? String(f.value) : f.value.toFixed(1);
  const printed = (n) => new RegExp(`(?<![\\d.])${n.replace('.', '\\.')}(?![\\d])`).test(text);
  if (printed(shown) || (Number.isInteger(f.value) && printed(String(f.value)))) return { result: 'printed', shown };
  // The Treasury prints some lines in shillings or millions: accept a line that rounds to the value
  for (const m of text.matchAll(/\d[\d.]*/g)) for (const size of [1, 1e3, 1e6]) {
    const n = Number(m[0]) * size;
    if (scale[f.unit] > 1 && n >= 1e6 && (n / scale[f.unit]).toFixed(1) === f.value.toFixed(1)) return { result: 'rounded', shown: m[0] };
  }
  return { result: 'not found', shown };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const count = { printed: 0, rounded: 0, 'not found': 0, calculated: 0, 'no document': 0 };
  for (const f of typed) {
    const file = sources.get(f.source).file;
    if (f.calc) { count.calculated++; continue; }
    if (!file || f.pdfPage == null) { count['no document']++; continue; }
    const { result, shown } = findOnPage(pageText(file, f.pdfPage), f);
    count[result]++;
    if (result !== 'printed') console.log(`${result.padEnd(9)} ${f.id} = ${f.value} ${f.unit}, ${f.source} PDF p.${f.pdfPage}${result === 'rounded' ? `, from ${shown}` : ''}`);
  }
  console.log(`${typed.length} typed figures:`, count);
  process.exitCode = count['not found'] ? 1 : 0;
}
