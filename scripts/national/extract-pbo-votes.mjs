// Reads the "Votes under the ... sector" tables from the Parliamentary Budget Office's Budget Explainers into CSV. The
// 2026 edition prints vote codes; the 2025 edition prints only names, so those are matched to this year's votes by name,
// and any name that does not match stays unmatched rather than being guessed. Needs pdftotext and the stored PDFs.
//   node scripts/national/extract-pbo-votes.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine, parseCsv } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = join(root, 'data-src/national');
const out = join(src, 'pbo-explainer');
const num = (s) => (s === '-' ? 0 : Number(s.replaceAll(',', '')));
const ROW_END = /(?:^|\s)([\d,]+|-)\s+([\d,]+|-)\s+([\d,]+)\s*$/;
const TITLE = /^TABLE \d+:? VOTES UNDER (?:THE )?(.+)$/i;
// Whole lines only: a wrapped name can start with "Development"
const SKIP = /^(MDA.*|(Sub-?)?Total\b.*|\(Kshs.*|Recurrent.*|Development(\s+Total)?|Vote(\s+Recurrent.*)?|\d+|(?:[A-Z]+\s+)*SECTOR)$/;

export const SLUGS = [
  ['AGRICULTURE', 'agriculture-rural-urban-development'], ['EDUCATION', 'education'], ['ENERGY', 'energy-infrastructure-ict'], ['ENVIRONMENT', 'environment-water-natural-resources'],
  ['GENERAL ECONOMIC', 'general-economics-commercial-affairs'], ['GOVERNANCE', 'governance-justice-law-order'], ['HEALTH', 'health'], ['NATIONAL SECURITY', 'national-security'],
  ['PUBLIC ADMINISTRATION', 'public-administration-international-relations'], ['SOCIAL PROTECTION', 'social-protection-culture-recreation'], ['PARLIAMENT', 'parliament'], ['JUDICIARY', 'judiciary'],
];
export const slugOf = (title) => SLUGS.find(([word]) => title.toUpperCase().includes(word))?.[1] ?? null;

export function normalise(name) {
  return name.toLowerCase().replaceAll('&', ' and ').replace(/\bstate department for\b/g, ' ').replace(/\bthe\b/g, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// One row of a table: a name, then recurrent, development and total, wrapped over up to three lines
export function parseTables(text) {
  // pdftotext marks each new page with a form feed, so a row knows which page of the PDF it came from
  const pageOf = [];
  let page = 1;
  const lines = text.split('\n').map((l) => { page += l.split('\f').length - 1; pageOf.push(page); return l.replaceAll('\f', '').trim(); });
  const rows = [], problems = [];
  let sector = null, title = null, table = null;
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(TITLE);
    if (head) { sector = slugOf(head[1]); title = head[1]; table = lines[i].match(/\d+/)[0]; continue; }
    if (!sector) continue;
    if (/^Source:/i.test(lines[i])) { sector = null; continue; }
    if (!lines[i] || SKIP.test(lines[i])) continue;
    // A name can wrap, and a table can break across a page, so page numbers and repeated headers are stepped over
    let textRow = lines[i], j = i;
    while (!ROW_END.test(textRow) && j < i + 8) {
      j++;
      if (/^(Total\b|Sub-?Total\b|Source:)/i.test(lines[j] ?? '')) break;
      if (lines[j] && !SKIP.test(lines[j])) textRow += ` ${lines[j]}`;
    }
    const m = textRow.match(ROW_END);
    if (!m) continue;
    i = j;
    const [recurrent, development, total] = [num(m[1]), num(m[2]), num(m[3])];
    const label = textRow.slice(0, m.index).trim(), coded = label.match(/(?:^|\s)([12]\d{3})\s+(.*)$/);
    const code = coded?.[1] ?? '', name = coded?.[2] ?? label;
    if (Math.abs(recurrent + development - total) > 2) problems.push(`${title}: ${name} ${recurrent} + ${development} is not ${total}`);
    rows.push({ code, name, sector, recurrent, development, total, table, pdf_page: pageOf[j] });
  }
  return { rows, problems };
}

const head = ['code', 'name', 'sector', 'recurrent', 'development', 'total', 'table', 'pdf_page'];
const write = (file, rows) => writeFileSync(join(out, file), `${[head, ...rows.map((r) => head.map((k) => r[k]))].map(csvLine).join('\n')}\n`);
const raw = (pdf) => execFileSync('pdftotext', ['-raw', join(src, 'pdfs', pdf), '-'], { encoding: 'utf8', maxBuffer: 1e8 });

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(out, { recursive: true });
  const now = parseTables(raw('pbo-budget-explainer-2026.pdf'));
  const last = parseTables(raw('pbo-budget-explainer-2025.pdf'));
  for (const p of [...now.problems, ...last.problems]) console.error(`  PROBLEM ${p}`);
  const manual = new Map(parseCsv(readFileSync(join(out, 'names-2025-26.csv'), 'utf8')).map((r) => [normalise(r.name_2025_26), r]));
  const byName = new Map(now.rows.map((r) => [normalise(r.name), r.code]));
  const unmatched = [];
  for (const r of last.rows) {
    const key = normalise(r.name), set = manual.get(key);
    r.code = set ? set.code : byName.get(key) ?? '';
    if (!set && !r.code) unmatched.push(`${r.name} (${r.total})`);
  }
  write('votes-2026-27.csv', now.rows);
  write('votes-2025-26.csv', last.rows);
  const missing = now.rows.filter((r) => !r.code || !last.rows.some((l) => l.code === r.code));
  console.log(`2026/27: ${now.rows.length} votes. 2025/26: ${last.rows.length} votes, ${last.rows.filter((r) => r.code).length} matched by code.`);
  console.log('Last year, not matched:', unmatched);
  console.log('This year, no match last year:', missing.map((r) => `${r.code} ${r.name}`));
}
