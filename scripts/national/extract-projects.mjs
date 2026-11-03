// Reads every project line from the approved Development Estimates FY2026/27 (Treasury, four volumes): code, name, last
// year's approved amount, and this year's gross, Appropriations-in-Aid and net. Each vote's project lines must add to the
// vote's printed total, and that total must equal the Act's development money for the vote. Needs pdftotext and the PDFs.
//   node scripts/national/extract-projects.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const VOLUMES = [1, 2, 3, 4].map((n) => `dev-estimates-2026-27-vol${n}.pdf`);
const SIX = /\s((?:[\d,]+|-)(?:\s+(?:[\d,]+|-)){5})\s*$/;
const amount = (s) => (s === '-' ? '' : s.replaceAll(',', ''));

// Only the vote's summary table is read: from its SUMMARY heading to TOTAL FOR VOTE. Project names can wrap onto a second line.
export function readSummaries(pages) {
  const out = [];
  let vote = null, label = null, page = 0;
  pages.forEach((text, index) => {
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (/^SUMMARY$/.test(line)) { vote = 'open'; label = null; continue; }
      if (vote == null) continue;
      if (/^\d{10}\s/.test(line) || /^TOTAL FOR VOTE/.test(line)) { label = ''; page = index + 1; }
      if (label == null) continue;
      const joined = `${label} ${line}`.trim(), m = joined.match(SIX);
      if (!m) { label = joined; continue; }
      const head = joined.slice(0, m.index).trim(), values = m[1].split(/\s+/).map(amount);
      const total = head.match(/^TOTAL FOR VOTE D(\d{4})\s*(.*)$/);
      if (total) { out.push({ vote: total[1], code: '', name: 'TOTAL', values, pdf_page: page }); vote = null; }
      else out.push({ vote: head.slice(0, 4), code: head.slice(0, 10), name: head.slice(11).trim(), values, pdf_page: page });
      label = null;
    }
  });
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rows = [];
  for (const file of VOLUMES) {
    const pdf = join(root, 'data-src/national/pdfs', file);
    if (!existsSync(pdf)) throw new Error(`Missing ${file}`);
    const pages = execFileSync('pdftotext', ['-raw', pdf, '-'], { encoding: 'utf8', maxBuffer: 6e8 }).split('\f');
    for (const r of readSummaries(pages)) rows.push([r.vote, r.code, r.name, ...r.values, file.match(/vol(\d)/)[1], r.pdf_page]);
  }
  const out = join(root, 'data-src/national/dev-estimates-2026-27');
  mkdirSync(out, { recursive: true });
  const head = ['vote', 'code', 'name', 'approved_2025_26', 'gross_2026_27', 'aia_2026_27', 'net_2026_27', 'projected_2027_28', 'projected_2028_29', 'volume', 'pdf_page'];
  writeFileSync(join(out, 'projects.csv'), `${[head, ...rows].map(csvLine).join('\n')}\n`);
  console.log(`${rows.filter((r) => r[1]).length} project lines, ${rows.filter((r) => !r[1]).length} vote totals`);
}
