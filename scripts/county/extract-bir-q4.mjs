// Reads Table 4 of Nyamira's fourth-quarter Budget Implementation Report for FY2025/26 (PDF pp.92-95, printed
// pp.82-85): each department's recurrent and development budget, the amount spent by 30 June 2026, the share spent
// and the deviation, as printed. The table names departments without vote codes; VOTES below matches them.
//   node scripts/county/extract-bir-q4.mjs > data-src/county/nyamira/bir-2025-26-q4/departments.csv
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PDF = join(root, 'data-src/county/nyamira/pdfs/bir-2025-26-q4.pdf');

// The report's department names, matched to the Programme Based Budget's votes (Tables 9, 11 and 12).
export const VOTES = [
  [/^County Assembly/i, '5261'], [/^Executive/i, '5262'], [/^Finance/i, '5263'], [/^Economic planning/i, '5277'],
  [/^Agriculture\s+Crop/i, '5264'], [/^Livestock/i, '5278'], [/^Environment/i, '5265'], [/^Education/i, '5266'],
  [/^Medical/i, '5267'], [/^Primary Health/i, '5279'], [/^Lands/i, '5268'], [/^Roads/i, '5270'], [/^Trade/i, '5271'],
  [/^Gender/i, '5272'], [/^Public Service Board/i, '5273'], [/^Public Service\s+Management/i, '5274'],
  [/^Nyamira Municipality/i, '5275'], [/^county attorney/i, '5276'], [/^Keroka/i, '5280'], [/^Nyamira\s+Revenue/i, '5281'],
  [/^Water/i, '5269'], [/^Nyamira\s+Disability/i, '5282'], [/^Nyamira\s+Investment/i, '5283'], [/^(NYAWASCO|Nyamira Water)/i, '5284'],
  [/^County Totals/i, 'total'],
];

const KIND = { recurrent: 'recurrent', development: 'development', 'sub-total': 'total', totals: 'total' };
const num = (s) => Number(s.replace(/,/g, ''));
const rows = [];
let name = [];
for (let page = 92; page <= 95; page++) {
  const text = execFileSync('pdftotext', ['-f', String(page), '-l', String(page), '-table', PDF, '-'], { encoding: 'utf8' });
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(.*?)\b(Recurrent|Development|Sub-total|Totals)\s+(-?[\d,]+)\s+(-?[\d,]+)\s+(-?[\d.]+)\s+(-?[\d,]+)\s*$/i);
    const words = (m ? m[1] : line).trim();
    // Header lines and page numbers sit between the rows; only the department column's words make the name.
    if (words && !/^\d+$/.test(words) && !/^(Department|Table|3\.\d|\(100%\)|Printed)|Estimates|30th June|Budget 2025|Details|Performance|Deviation|Amount spend|EXPENDITURE/i.test(words)) name.push(words);
    if (!m) continue;
    const kind = KIND[m[2].toLowerCase()];
    rows.push({ page, kind, budget: num(m[3]), spent: num(m[4]), pct: m[5], deviation: num(m[6]), nameSoFar: name.join(' ') });
    if (kind === 'total') {
      const full = name.join(' ').replace(/\s+/g, ' ').trim();
      const vote = VOTES.find(([re]) => re.test(full))?.[1] ?? '';
      for (const r of rows.filter((x) => x.department === undefined)) { r.department = full; r.vote = vote; }
      name = [];
    }
  }
}

const q = (s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
console.log('vote,department_as_printed,kind,budget,spent,pct_printed,deviation,pdf_page');
for (const r of rows) console.log([r.vote, q(r.department), r.kind, r.budget, r.spent, r.pct, r.deviation, r.page].join(','));
