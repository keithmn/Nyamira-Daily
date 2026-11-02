// Reads Table 2.5 of the Controller of Budget's county report twice: `pdftotext -raw` into extract.csv and `-layout` into
// typed.csv. Unlike the Act, this PDF has a real text layer, but -layout scrambles the county names on its first page, so
// the second reading is matched by row order and compares amounts. Needs pdftotext and the stored PDF.
//   node scripts/national/extract-cob-counties.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pdf = join(root, 'data-src/national/pdfs/cob-county-birr-2024-25.pdf');
const out = join(root, 'data-src/national/cob-county-2024-25');
const AMOUNTS = ['rec_budget', 'dev_budget', 'total_budget', 'rec_spent', 'dev_spent', 'total_spent'];
const PERCENTS = ['rec_pct', 'dev_pct', 'overall_pct'];
const money = String.raw`([\d,]+\.\d{2})`;

export const RAW_ROW = new RegExp(String.raw`^([A-Z][A-Za-z' -]+?)\s+${Array(6).fill(money).join(String.raw`\s+`)}\s+(\d+)\s+(\d+)\s+(\d+)\s*$`);
export const LAYOUT_ROW = new RegExp(Array(6).fill(money).join(String.raw`\s+`));
const clean = (s) => s.replaceAll(',', '');
const text = (mode, page) => execFileSync('pdftotext', [mode, '-f', String(page), '-l', String(page), pdf, '-'], { encoding: 'utf8', maxBuffer: 1e8 });

// The table starts on PDF p.52 and ends on p.53
export function rawRows(pages) {
  const rows = [];
  for (const [page, body] of pages) {
    const from = body.indexOf('Table 2.5: County Budget');
    for (const line of body.slice(Math.max(0, from)).split('\n')) {
      const m = line.trim().match(RAW_ROW);
      if (m && m[1] !== 'Total') rows.push({ county: m[1], ...Object.fromEntries(AMOUNTS.map((k, i) => [k, clean(m[i + 2])])), ...Object.fromEntries(PERCENTS.map((k, i) => [k, m[i + 8]])), pdf_page: page });
      if (m?.[1] === 'Total') rows.push({ county: 'Total', ...Object.fromEntries(AMOUNTS.map((k, i) => [k, clean(m[i + 2])])), ...Object.fromEntries(PERCENTS.map((k, i) => [k, m[i + 8]])), pdf_page: page });
    }
  }
  return rows;
}

export function layoutRows(pages) {
  const rows = [];
  for (const [, body] of pages) {
    const from = body.indexOf('Table 2.5: County Budget'), to = body.indexOf('Source: CoB and County Treasuries', Math.max(0, from));
    const part = body.slice(Math.max(0, from), to < 0 ? undefined : to);
    for (const line of part.split('\n')) {
      const m = line.match(LAYOUT_ROW);
      if (m) rows.push(Object.fromEntries(AMOUNTS.map((k, i) => [k, clean(m[i + 1])])));
    }
  }
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(out, { recursive: true });
  const pages = [52, 53];
  const first = rawRows(pages.map((p) => [p, text('-raw', p)]));
  const second = layoutRows(pages.map((p) => [p, text('-layout', p)]));
  const head = ['county', ...AMOUNTS, ...PERCENTS, 'pdf_page'];
  writeFileSync(join(out, 'extract.csv'), `${[head, ...first.map((r) => head.map((k) => r[k]))].map(csvLine).join('\n')}\n`);
  writeFileSync(join(out, 'typed.csv'), `${[['row', ...AMOUNTS], ...second.map((r, i) => [i + 1, ...AMOUNTS.map((k) => r[k])])].map(csvLine).join('\n')}\n`);
  console.log(`First reading ${first.length} rows, second reading ${second.length} rows`);
}
