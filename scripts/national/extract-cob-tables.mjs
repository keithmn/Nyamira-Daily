// Reads three more county tables from the Controller of Budget's FY2025/26 report: own-source revenue (2.1), spending by
// economic classification (2.4) and trade payables (2.10). As with Table 2.5, `-raw` gives the rows and `-layout` every
// amount a second time. A dash in the report gives no figure, never a zero. Needs pdftotext and the stored PDF.
//   node scripts/national/extract-cob-tables.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pdf = join(root, 'data-src/national/pdfs/cob-county-birr-2025-26.pdf');
const out = join(root, 'data-src/national/cob-county-2025-26');

export const TABLES = {
  osr: { title: 'Table 2.1: Own Source Revenue', pages: [36, 37], columns: ['ord_target', 'fif_target', 'total_target', 'ord_actual', 'fif_actual', 'total_actual', 'ord_pct', 'fif_pct', 'total_pct'], percents: 3 },
  wages: { title: 'Table 2.4: Expenditure by Major', pages: [41, 42], columns: ['compensation', 'operations', 'recurrent', 'development', 'total'], percents: 0 },
  payables: { title: 'Table 2.10: Trade Payables', pages: [51, 52, 53], columns: ['exec_rec', 'exec_dev', 'exec_total', 'asm_rec', 'asm_dev', 'asm_total', 'total', 'budget', 'pct'], percents: 1 },
};

const clean = (s) => (s === '-' ? '' : s.replaceAll(',', ''));
const TOKEN = /^(?:[\d,]+(?:\.\d+)?|-)$/;
// Narok's row in Table 2.10 prints nothing at all for County Assembly development, not even a dash
const BLANKS = { Narok: 4 };

// A row is a county name, then exactly as many numbers or dashes as the table has columns
export function parseRow(line, columns) {
  const words = line.trim().split(/\s+/);
  let at = words.length;
  while (at > 0 && TOKEN.test(words[at - 1])) at--;
  const values = words.slice(at), name = words.slice(0, at).join(' ').replace(/\*+$/, '');
  if (values.length === columns.length - 1 && columns.includes('asm_dev') && name in BLANKS) values.splice(BLANKS[name], 0, '-');
  if (values.length !== columns.length || !/^[A-Z][A-Za-z' -]+$/.test(name)) return null;
  return { county: name, starred: words[at - 1]?.endsWith('*') ? 'yes' : '', ...Object.fromEntries(columns.map((c, i) => [c, clean(values[i])])) };
}

export function rawRows(spec, pages) {
  const rows = [];
  let started = false;
  for (const [page, body] of pages) {
    const at = body.indexOf(spec.title);
    if (at >= 0) started = true;
    if (!started) continue;
    for (const line of body.slice(Math.max(0, at)).split('\n')) {
      const row = parseRow(line, spec.columns);
      if (!row) continue;
      rows.push({ ...row, pdf_page: page });
      if (row.county === 'Total') return rows;
    }
  }
  return rows;
}

// Annex I gives every county's revenue by category, target then reported. Some rows leave out empty columns, so a block is
// found by its own arithmetic: the column that equals the sum of those before it is that block's total.
export const ANNEX = { pages: [933, 934], columns: ['balance', 'equitable', 'additional', 'ordinary', 'fif', 'total'] };
export function parseAnnexRow(line) {
  const words = line.trim().split(/\s+/);
  let at = words.length;
  while (at > 0 && TOKEN.test(words[at - 1])) at--;
  const name = words.slice(0, at).join(' ').replace(/\*+$/, ''), values = words.slice(at);
  if (values.length < 12 || !/^[A-Z][A-Za-z' -]+$/.test(name)) return null;
  const n = (s) => (s === '-' ? 0 : Number(s.replaceAll(',', '')));
  const block = (from) => {
    let sum = 0;
    for (let i = from; i < values.length; i++) {
      if (i >= from + 5 && Math.abs(sum - n(values[i])) <= 0.06) return { end: i, part: values.slice(from, from + 5).map(clean), total: clean(values[i]) };
      sum += n(values[i]);
    }
    return null;
  };
  const target = block(0), reported = target && block(target.end + 1);
  if (!reported) return { county: name, unread: 'yes' };
  const row = (prefix, b) => Object.fromEntries([...ANNEX.columns.slice(0, 5).map((c, i) => [`${c}_${prefix}`, b.part[i]]), [`total_${prefix}`, b.total]]);
  return { county: name, ...row('target', target), ...row('actual', reported) };
}

// Every amount with two decimals in the table, whatever order -layout leaves it in. Percentages are checked by arithmetic.
export function layoutAmounts(spec, pages) {
  const found = [];
  let started = false;
  for (const [, body] of pages) {
    const at = body.indexOf(spec.title);
    if (at >= 0) started = true;
    if (!started) continue;
    const end = body.indexOf('Source:', Math.max(0, at));
    for (const m of body.slice(Math.max(0, at), end < 0 ? undefined : end).matchAll(/(?<![\d.,])[\d,]{1,}\.\d{2}(?![\d%])/g)) found.push(clean(m[0]));
  }
  return found;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(out, { recursive: true });
  const read = (mode, page) => execFileSync('pdftotext', [mode, '-f', String(page), '-l', String(page), pdf, '-'], { encoding: 'utf8', maxBuffer: 1e8 });
  for (const [name, spec] of Object.entries(TABLES)) {
    const first = rawRows(spec, spec.pages.map((p) => [p, read('-raw', p)]));
    const second = layoutAmounts(spec, spec.pages.map((p) => [p, read('-layout', p)]));
    const head = ['county', 'starred', ...spec.columns, 'pdf_page'];
    writeFileSync(join(out, `${name}.csv`), `${[head, ...first.map((r) => head.map((k) => r[k]))].map(csvLine).join('\n')}\n`);
    writeFileSync(join(out, `${name}-second.csv`), `${[['amount'], ...second.map((a) => [a])].map(csvLine).join('\n')}\n`);
    console.log(name, first.length, 'rows,', second.length, 'amounts in the second reading');
  }
  const annex = [];
  for (const page of ANNEX.pages) {
    for (const line of read('-raw', page).split('\n')) {
      const row = parseAnnexRow(line);
      if (row) annex.push({ ...row, pdf_page: page });
    }
  }
  const names = ['county', ...['target', 'actual'].flatMap((p) => ANNEX.columns.map((c) => `${c}_${p}`)), 'pdf_page'];
  writeFileSync(join(out, 'annex.csv'), `${[names, ...annex.map((r) => names.map((k) => r[k]))].map(csvLine).join('\n')}\n`);
  console.log('annex', annex.length, 'rows,', annex.filter((r) => r.unread).length, 'unread:', annex.filter((r) => r.unread).map((r) => r.county).join(', '));
}
