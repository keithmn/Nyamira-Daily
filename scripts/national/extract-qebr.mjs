// Reads Table 6 of the Treasury's Quarterly Economic and Budgetary Review: each vote's recurrent, development and total
// spending against target, with the printed share spent. The -raw reading gives the rows; the -layout reading gives every
// amount a second time, and the two are compared as sets, because -layout scrambles the columns. Needs pdftotext.
//   node scripts/national/extract-qebr.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const QEBR = { file: 'qebr-2025-26-q4.pdf', dir: 'qebr-2025-26-q4' };
const TOKEN = String.raw`(?:[\d,]+|\([\d,]+\)|-)`;
const ROW = new RegExp(String.raw`^(.*?)\s*((?:${TOKEN}\s+){8}${TOKEN})(?:\s+([\d.]+))?$`);
// A dash prints no amount, so it is kept empty, never as zero
export const amount = (s) => (s === '-' ? '' : (s.startsWith('(') ? -1 : 1) * Number(s.replace(/[(),]/g, '')));
const COLUMNS = ['rec_actual', 'rec_target', 'rec_variance', 'dev_actual', 'dev_target', 'dev_variance', 'total_actual', 'total_target', 'total_variance'];

// From the "Table 6" heading to the Total row. A vote's name can wrap onto lines of its own before its amounts.
export function readTable6(text) {
  const lines = text.split(/\r?\n/), start = lines.findIndex((l) => /^Table 6: National Government Expenditures/.test(l));
  const out = [];
  let label = null;
  for (const raw of lines.slice(start)) {
    const line = raw.trim();
    if (/^\d{4} /.test(line) || /^Total /.test(line)) label = '';
    if (label == null) continue;
    const joined = `${label} ${line}`.trim(), m = joined.match(ROW);
    if (!m || !/^(\d{4} |Total)/.test(joined)) { label = joined; continue; }
    const values = m[2].split(/\s+/), head = m[1].trim(), total = head === 'Total';
    out.push({ vote: total ? '' : head.slice(0, 4), name: total ? 'Total' : head.slice(5).replace(/(\s+-)+$/, '').trim(), ...Object.fromEntries(COLUMNS.map((c, i) => [c, amount(values[i])])), pct_spent: m[3] ?? '' });
    label = null;
    if (total) break;
  }
  return out;
}

// Every amount on the table's pages in the -layout reading, as a multiset of printed strings
export function layoutAmounts(text) {
  const counts = new Map();
  for (const s of text.match(/\(?\d{1,3}(?:,\d{3})+\)?|\(?\d{1,3}\)?(?=\s)/g) ?? []) counts.set(s, (counts.get(s) ?? 0) + 1);
  return counts;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pdf = join(root, 'data-src/national/pdfs', QEBR.file);
  const rows = readTable6(execFileSync('pdftotext', ['-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 2e8 }));
  const out = join(root, 'data-src/national', QEBR.dir);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'votes.csv'), `${[['vote', 'name', ...COLUMNS, 'pct_spent'], ...rows.map((r) => [r.vote, r.name, ...COLUMNS.map((c) => r[c]), r.pct_spent])].map(csvLine).join('\n')}\n`);
  const layout = layoutAmounts(execFileSync('pdftotext', ['-layout', '-f', '26', '-l', '26', pdf, '-'], { encoding: 'utf8', maxBuffer: 2e8 }));
  writeFileSync(join(out, 'votes-second.csv'), `${[['printed', 'count'], ...[...layout].sort()].map(csvLine).join('\n')}\n`);
  console.log(`${rows.length - 1} votes and the total row; ${layout.size} distinct amounts in the second reading`);
}
