// Reads the approved Programme Based Budget FY2026/27 (Treasury, June 2026): sub-programme amounts (Part F), spending by
// economic classification (Part G) and each programme's stated outcome (Part E). Its grand total equals the Appropriation
// Act's, and each programme must equal the Act's recurrent plus development, so the Act checks this reading line by line.
// The key-output targets in Part E do not line up reliably as text, so they are not read: a person types those.
// Needs pdftotext and the stored PDF.   node scripts/national/extract-pbb.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pdf = join(root, 'data-src/national/pdfs/pbb-2026-27-approved.pdf');
const out = join(root, 'data-src/national/pbb-2026-27');
const YEARS = ['y2025_26', 'y2026_27', 'y2027_28', 'y2028_29'];
const ROW_END = /\s((?:[\d,]+|-)\s+(?:[\d,]+|-)\s+(?:[\d,]+|-)\s+(?:[\d,]+|-))\s*$/;
const amount = (s) => (s === '-' ? '' : s.replaceAll(',', ''));

// A row is a label, wrapped over as many lines as it needs, then four amounts
export function rows(block, starts) {
  const out = [];
  let label = null;
  for (const line of block.split('\n').map((l) => l.trim())) {
    if (starts.test(line)) label = '';
    if (label == null) continue;
    const text = `${label} ${line}`.trim(), m = text.match(ROW_END);
    if (m) { out.push({ label: text.slice(0, m.index).trim(), values: m[1].split(/\s+/).map(amount) }); label = null; } else label = text;
  }
  return out;
}

// Most codes have 7 digits, and the book prints a few with 6 or 8 (075000, 07710010): they are read as printed
const PROGRAMME_START = /^(\d{6,8}\s|Total Expenditure for Vote)/;
const ECONOMIC_START = /^(\d{7}\s|Current Expenditure|Capital Expenditure|Total Expenditure)/;

export function readBook(pages) {
  const votes = [];
  pages.forEach((page, index) => {
    for (const [part, re] of [['F', /PART F: Summary of Expenditure by Programmes/], ['G', /PART G: Summary of Expenditure by Vote and Economic/]]) {
      if (!re.test(page)) continue;
      const end = part === 'F' ? page.search(/PART G:/) : page.search(/PART H:/);
      const block = page.slice(page.search(re), end > 0 ? end : undefined), next = pages[index + 1] ?? '';
      const text = end > 0 ? block : `${block}\n${next.slice(0, next.search(/PART [GH]:/) > 0 ? next.search(/PART [GH]:/) : 0)}`;
      votes.push({ part, pdf_page: index + 1, rows: rows(text, part === 'F' ? PROGRAMME_START : ECONOMIC_START) });
    }
  });
  return votes;
}

// Each programme's stated outcome, from the layout text of Part E
export function outcomes(layout) {
  // pdftotext ends lines with \r\n on Windows, and `.` does not match \r
  const found = new Map(), lines = layout.split(/\r?\n/);
  lines.forEach((line, i) => {
    const p = line.match(/^\s*Programme:\s+(\d{6,8})\s/);
    if (!p) return;
    const o = lines[i + 1]?.match(/^Outcome:\s+(.+)$/);
    if (!o) return;
    let text = o[1].trim();
    for (let j = i + 2; j < i + 5 && lines[j]?.trim() && !/^(Sub Programme|Programme|Delivery)/.test(lines[j].trim()); j++) text += ` ${lines[j].trim()}`;
    if (!found.has(p[1])) found.set(p[1], text.replace(/\s+/g, ' '));
  });
  return found;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const raw = execFileSync('pdftotext', ['-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 4e8 }).split('\f');
  const layout = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 4e8 });
  const parts = readBook(raw);
  const programmes = [], economic = [];
  for (let i = 0; i < parts.length; i++) {
    const { part, rows: list, pdf_page } = parts[i];
    const total = list.find((r) => /^Total Expenditure/.test(r.label));
    const vote = part === 'F' ? total?.label.match(/Vote (\d{4})/)?.[1] : parts.slice(0, i).reverse().find((p) => p.part === 'F')?.vote;
    parts[i].vote = vote;
    for (const r of list) {
      const code = r.label.match(/^(\d{6,8})\s/)?.[1] ?? '';
      const name = code ? r.label.slice(code.length + 1).trim() : r.label;
      if (part === 'F') programmes.push([vote, code, code ? (code.endsWith('000') ? 'programme' : 'subprogramme') : 'total', code ? name : 'Total', ...r.values, pdf_page]);
      else economic.push([vote, code, code ? 'item' : name.split(' ')[0].toLowerCase(), name, ...r.values, pdf_page]);
    }
  }
  const map = outcomes(layout);
  mkdirSync(out, { recursive: true });
  const head = (first) => [...first, ...YEARS, 'pdf_page'];
  writeFileSync(join(out, 'programmes.csv'), `${[head(['vote', 'code', 'kind', 'name']), ...programmes].map(csvLine).join('\n')}\n`);
  writeFileSync(join(out, 'economic.csv'), `${[head(['vote', 'code', 'block', 'name']), ...economic].map(csvLine).join('\n')}\n`);
  writeFileSync(join(out, 'outcomes.csv'), `${[['programme', 'outcome'], ...[...map].sort()].map(csvLine).join('\n')}\n`);
  const votes = new Set(programmes.map((r) => r[0]));
  console.log(`Part F ${programmes.length} rows across ${votes.size} votes, Part G ${economic.length} rows, ${map.size} outcomes`);
}
