// Reads each earlier Programme Based Budget's department tables (recurrent and development) and keeps the column
// headed "Printed", the year's own estimates. The rows must add up to the table's printed TOTAL, or the year is
// reported as not proved. Department names are as printed; data-src/county/nyamira/department-map.csv matches them
// to today's votes.
//   node scripts/county/extract-pbb-departments.mjs > data-src/county/nyamira/pbb-history/departments.csv
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const YEARS = [
  { fy: '2024/25', file: 'pbb-2024-25.pdf', recurrent: [46, 47, /Table 9:/], development: [65, 66, /Table 16:/] },
  { fy: '2023/24', file: 'pbb-2023-24.pdf', recurrent: [43, 44, /Table 10:/], development: [75, 76, /Table 17:/] },
  { fy: '2022/23', file: 'pbb-2022-23.pdf', recurrent: [39, 40, /Table 12:/], development: [51, 52, /Table 18:/] },
  { fy: '2021/22', file: 'pbb-2021-22.pdf', recurrent: [20, 21, /Table 8:/], development: [26, 27, /Table 14:/] },
];

const isNumber = (t) => t === '-' || /^\d{1,3}(,\d{3})*$/.test(t) || /^\d+$/.test(t);
const isPiece = (t) => /^,?\d{1,3}(,\d{0,3})*,?$/.test(t);
const tokens = (line) => [...line.matchAll(/\S+/g)].map((m) => ({ x: m.index, t: m[0] }));

function readTable(file, [first, last, heading]) {
  let text = execFileSync('pdftotext', ['-f', String(first), '-l', String(last), '-table', join(root, 'data-src/county/nyamira/pdfs', file), '-'], { encoding: 'utf8' });
  const at = text.search(heading);
  if (at < 0) throw new Error(`${file}: heading ${heading} not found on pp.${first}-${last}`);
  text = text.slice(at);
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !/PROGRAM+E BASED BUDGET/i.test(l));
  // A table's second page sits several characters right of its first, so positions cannot pick the column. Every
  // row ends with two projection columns, so the year's printed estimates are third from the right; the rows adding
  // up to the TOTAL row is what proves the choice.
  const rows = [];
  let cur = null, done = false;
  for (const line of lines.slice(1)) {
    if (done) break;
    const ks = tokens(line);
    // A number wrapped onto two lines leaves a piece such as "735,070," in the first column; it is a number, not a word.
    const firstNum = ks.findIndex((k) => (isNumber(k.t) || isPiece(k.t)) && k.x > 20);
    const nums = firstNum < 0 ? [] : ks.slice(firstNum).filter((k) => isNumber(k.t) || isPiece(k.t));
    const words = ks.filter((k) => firstNum < 0 || k.x < ks[firstNum].x).map((k) => k.t).filter((w) => !/^\d{4}$|^`$/.test(w)).join(' ');
    const full = nums.filter((k) => isNumber(k.t) && (k.t.includes(',') || k.t === '0' || k.t === '-'));
    if (full.length >= 3 && words && !/^(Department|Budget|Actual|Baseline|Printed|Estimate)/i.test(words)) {
      cur = { name: words, cells: full.map((k) => k.t) };
      rows.push(cur);
      if (/^total/i.test(words)) done = true;
    } else if (cur && words && !nums.length && !/^total/i.test(cur.name)) {
      cur.name += ' ' + words; // a department name wrapped onto the next line
    }
  }
  return rows.map((r) => ({ name: r.name.replace(/\s+/g, ' ').replace(/,\s*$/, '').trim(), value: r.cells.at(-3) ?? null }));
}

const num = (s) => (s == null || s === '-' ? 0 : Number(s.replace(/,/g, '')));

export function readYear(y) {
  const out = {};
  for (const kind of ['recurrent', 'development']) {
    const rows = readTable(y.file, y[kind]);
    const total = rows.find((r) => /^total/i.test(r.name));
    const body = rows.filter((r) => r !== total);
    const sum = body.reduce((a, r) => a + num(r.value), 0);
    out[kind] = { rows: body, total: total ? num(total.value) : null, sum, page: y[kind][0], proved: total != null && sum === num(total.value) };
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const q = (s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
  console.log('fy,kind,name_as_printed,value,pdf_page,table_total,rows_add_to,proved');
  for (const y of YEARS) {
    const r = readYear(y);
    for (const kind of ['recurrent', 'development']) {
      const t = r[kind];
      for (const row of t.rows) console.log([y.fy, kind, q(row.name), num(row.value), t.page, t.total, t.sum, t.proved ? 'yes' : 'no'].join(','));
      console.error(`${y.fy} ${kind}: ${t.rows.length} rows add to ${t.sum}; TOTAL row prints ${t.total}: ${t.proved ? 'proved' : 'NOT PROVED'}`);
    }
  }
}
