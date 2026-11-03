// Reads Table 2.5 of the Controller of Budget's county reports. `pdftotext -raw` gives the rows for extract.csv. `-layout`
// scrambles the rows, so the second reading is every amount in the table, in typed.csv, and the two must hold the same
// amounts. Each row must also pass its own arithmetic (see cobChecks). Needs pdftotext and the stored PDFs.
//   node scripts/national/extract-cob-counties.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const COB_YEARS = [
  { year: '2024-25', file: 'cob-county-birr-2024-25.pdf', pages: [52, 53] },
  { year: '2025-26', file: 'cob-county-birr-2025-26.pdf', pages: [43, 44] },
];
const AMOUNTS = ['rec_budget', 'dev_budget', 'total_budget', 'rec_spent', 'dev_spent', 'total_spent'];
const PERCENTS = ['rec_pct', 'dev_pct', 'overall_pct'];
const money = String.raw`([\d,]+\.\d{2})`, pct = String.raw`([\d.]+)`, gap = String.raw`\s+`;

export const RAW_ROW = new RegExp(String.raw`^([A-Z][A-Za-z' -]+?)${gap}${Array(6).fill(money).join(gap)}${gap}${pct}${gap}${pct}${gap}${pct}\s*$`);
const clean = (s) => s.replaceAll(',', '');

export function rawRows(pages) {
  const rows = [];
  for (const [page, body] of pages) {
    const at = body.indexOf('Table 2.5: County Budget'), part = body.slice(Math.max(0, at));
    for (const line of part.split('\n')) {
      const m = line.trim().match(RAW_ROW);
      if (!m) continue;
      rows.push({ county: m[1], ...Object.fromEntries(AMOUNTS.map((k, i) => [k, clean(m[i + 2])])), ...Object.fromEntries(PERCENTS.map((k, i) => [k, m[i + 8]])), pdf_page: page });
      if (m[1] === 'Total') return rows;
    }
  }
  return rows;
}

// Every amount in the table, whatever order -layout leaves it in
export function layoutAmounts(pages) {
  const found = [];
  for (const [, body] of pages) {
    const at = body.indexOf('Table 2.5: County Budget'), end = body.indexOf('Source:', Math.max(0, at));
    const part = body.slice(Math.max(0, at), end < 0 ? undefined : end);
    // Four or more characters before the point: a percentage above 100, such as 100.18, is not an amount
    for (const m of part.matchAll(/(?<![\d.,])[\d,]{4,}\.\d{2}(?![\d%])/g)) found.push(clean(m[0]));
  }
  return found;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const { year, file, pages } of COB_YEARS) {
    const out = join(root, `data-src/national/cob-county-${year}`), pdf = join(root, 'data-src/national/pdfs', file);
    mkdirSync(out, { recursive: true });
    const text = (mode, page) => execFileSync('pdftotext', [mode, '-f', String(page), '-l', String(page), pdf, '-'], { encoding: 'utf8', maxBuffer: 1e8 });
    const first = rawRows(pages.map((p) => [p, text('-raw', p)]));
    const second = layoutAmounts(pages.map((p) => [p, text('-layout', p)]));
    const head = ['county', ...AMOUNTS, ...PERCENTS, 'pdf_page'];
    writeFileSync(join(out, 'extract.csv'), `${[head, ...first.map((r) => head.map((k) => r[k]))].map(csvLine).join('\n')}\n`);
    writeFileSync(join(out, 'typed.csv'), `${[['amount'], ...second.map((a) => [a])].map(csvLine).join('\n')}\n`);
    console.log(`${year}: ${first.length} rows, ${second.length} amounts in the second reading`);
  }
}
