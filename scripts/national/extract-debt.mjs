// Reads five years of debt from the Annual Public Debt Management Report FY2024/25: Tables 3 and 4 give stock, interest and
// ordinary revenue. Needs pdftotext and the stored PDF.
//   node scripts/national/extract-debt.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pdf = join(root, 'data-src/national/pdfs/annual-public-debt-report-2024-25.pdf');
const out = join(root, 'data-src/national/debt-report-2024-25');
export const YEARS = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];

// label as printed, our key, the table's first line, in the order the labels first appear
export const ROWS = [
  ['Total PPG debt stock', 'stock', 'Table 3'], ['O/w External', 'stock-external', 'Table 3'], ['O/w Domestic', 'stock-domestic', 'Table 3'],
  ['Nominal GDP', 'gdp', 'Table 3'], ['Total PPG debt to GDP', 'stock-gdp', 'Table 3'],
  ['Total Debt Service', 'service', 'Table 4'], ['Total interest', 'interest', 'Table 4'], ['External Interest', 'interest-external', 'Table 4'], ['Domestic Interest', 'interest-domestic', 'Table 4'],
  ['Ordinary Revenue', 'revenue', 'Table 4'], ['Total debt services', 'service-revenue', 'Table 4'],
];

export function readRow(section, label) {
  const line = section.split('\n').find((l) => l.startsWith(`${label} `));
  const cells = line?.slice(label.length).trim().split(/\s+/) ?? [];
  return cells.length === 5 ? cells.map((c) => c.replaceAll(',', '')) : null;
}

export function readTables(pages) {
  const part = (start) => { const p = pages.findIndex((t, i) => i > 10 && t.includes(start)); return { text: pages[p].slice(pages[p].indexOf(start)), pdf: p + 1 }; };
  const sections = { 'Table 3': part('Table 3: 4.0- 1: Trends'), 'Table 4': part('Table 4: 4.1- 1: Trends') };
  return ROWS.map(([label, key, table]) => ({ key, table, pdf_page: sections[table].pdf, values: readRow(sections[table].text, label) }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pages = execFileSync('pdftotext', ['-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 2e8 }).split('\f');
  const rows = readTables(pages);
  const missing = rows.filter((r) => !r.values).map((r) => r.key);
  if (missing.length) throw new Error(`Not read: ${missing.join(', ')}`);
  mkdirSync(out, { recursive: true });
  const head = ['key', 'table', 'pdf_page', ...YEARS];
  writeFileSync(join(out, 'extract.csv'), `${[head, ...rows.map((r) => [r.key, r.table, r.pdf_page, ...r.values])].map(csvLine).join('\n')}\n`);
  console.log(rows.length, 'rows');
}
