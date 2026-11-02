// Reads the Appropriation Act, 2026 Schedule from its PDF into data-src/national/appropriation-act-2026/extract.csv,
// and again through a second pdftotext mode into typed.csv, for double entry (scripts/national/double-entry.mjs).
// The PDF is a scan with a machine-read text layer, so every number is proved against the Act's own totals:
// programmes add to their vote, votes to their class, classes to their cluster, clusters to the grand total.
//   node scripts/national/extract-appropriation.mjs [path-to-pdf]
// Needs pdftotext (-table keeps each row on one line and its columns in place). Corrections read from the page images go in corrections.csv beside the output, never in the code.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvLine, parseCsv } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'data-src/national/appropriation-act-2026');
const pdf = process.argv[2] ?? join(root, 'data-src/national/pdfs/appropriation-act-2026.pdf');

// An amount in the machine-read layer: commas can be missing, doubled or spaced out ("6000,000", "1,915 ,000 ,000", "4,618,737 089").
const amount = /\d+(?:\s?,\s?\d+)+(?:\s\d{3}(?![\d,]))?|\b\d{7,}\b/g;
const toNumber = (s) => Number(s.replace(/[ ,]/g, ''));
const PROGRAMME = /^([01]\d{3})[.\s]?(\d{2,3})\s/; // the Act prints one code with six digits, 075000: kept as printed
const NOISE = /^(No\. ?20|\d{3}$|\(\s*1\s*\)|Vote No|2026|Appropriation|Aid$|KSh|Supply|Central Government|Parliament|Judiciary|Independent|Recurrent Expenditure|Development Expenditure|Service or Purpose)/i;

// The second reading can print two columns with no gap ("141,370,42123,832,751"). A group after a comma has three digits.
export const splitRunTogether = (text) => text.replace(/(,\d{3})(?=\d)/g, '$1 ');

const tokens = (line) => [...line.matchAll(amount)].map((m) => ({ value: toNumber(m[0]), end: m.index + m[0].length, raw: m[0] }));
export function parseSchedule(text, corrections = new Map()) {
  const pages = text.split('\f');
  const votes = [], totals = [];
  let vote = null, programme = null, kind = 'R';
  pages.forEach((pageText, index) => {
    const pdfPage = index + 1;
    const lines = pageText.split(/\r?\n/).filter((l) => l.trim());
    for (const raw of lines) {
      const line = raw.trim();
      if (/Recurrent Expenditure/i.test(line)) kind = 'R';
      if (/Development Expenditure/i.test(line)) kind = 'D';
      const total = line.match(/^(CLASS\s*SUB-?\s?TOTAL|CLUSTER\s*SUB-?\s?TOTAL|GRAND\s*TOTAL)/i);
      if (total) {
        const nums = tokens(raw).map((t) => t.value);
        totals.push({ type: total[1].toUpperCase().replace(/\s+/g, ' ').replace(/SUB-?\s?TOTAL/, 'SUB-TOTAL'), supply: nums[0] ?? null, aia: nums[1] ?? null, pdfPage, kind, after: votes.length });
        vote = null; programme = null;
        continue;
      }
      if (/The amount required/i.test(line)) {
        const code = line.slice(0, line.search(/The amount/i)).replace(/\D/g, '').slice(-4);
        vote = { code, kind, text: line.slice(line.search(/The amount/i)), supply: null, aia: null, programmes: [], pdfPage };
        votes.push(vote); programme = null;
        take(vote, raw);
        continue;
      }
      const p = line.match(PROGRAMME);
      if (p && vote) {
        programme = { code: p[1] + p[2], text: line.slice(p[0].length), supply: null, aia: null, pdfPage };
        vote.programmes.push(programme);
        take(programme, raw.replace(p[0].trim(), ' '.repeat(p[0].trim().length)));
        continue;
      }
      if (!vote || NOISE.test(line)) continue;
      const target = programme ?? vote;
      target.text += ' ' + line;
      take(target, raw);
    }
  });
  for (const v of votes) { clean(v); v.programmes.forEach(clean); }
  for (const [key, fix] of corrections) applyCorrection(votes, totals, key, fix);
  votes.forEach(placeLoneAmounts);
  return { votes, totals };
}

function take(node, raw) {
  const t = tokens(raw);
  if (!t.length) return;
  if (t.length >= 2) { node.supply ??= t[0].value; node.aia ??= t[1].value; node.lone = false; return; }
  if (node.supply == null) { node.supply = t[0].value; node.lone = true; } else { node.aia ??= t[0].value; node.lone = false; }
}

// A row with one amount has lost its column in the scan. It counts as Supply unless the vote's printed totals say
// otherwise: try each way of moving lone rows to Appropriations-in-Aid and keep the one where both columns add up.
function placeLoneAmounts(vote) {
  const lone = vote.programmes.filter((p) => p.lone && !p.corrected);
  if (!lone.length || lone.length > 14) return;
  const fixed = vote.programmes.filter((p) => !lone.includes(p));
  const baseS = fixed.reduce((a, p) => a + (p.supply ?? 0), 0), baseA = fixed.reduce((a, p) => a + (p.aia ?? 0), 0);
  for (let mask = 0; mask < 1 << lone.length; mask++) {
    let s = baseS, a = baseA;
    lone.forEach((p, i) => { if (mask >> i & 1) a += p.supply; else s += p.supply; });
    if (s === (vote.supply ?? 0) && a === (vote.aia ?? 0)) {
      lone.forEach((p, i) => { if (mask >> i & 1) { p.aia = p.supply; p.supply = null; } });
      return;
    }
  }
}

function clean(node) {
  node.text = node.text.replace(amount, ' ').replace(/[^\x20-\x7e’]/g, ' ').replace(/\s+/g, ' ').trim();
  const m = node.text.match(/(?:current|capital)\s+expenses\s+of\s+(?:the\s+)?(.+?)\s+in\s+the\s+following/i);
  node.name = (m ? m[1] : node.text).replace(/[.:\s]+$/, '').trim();
}

function applyCorrection(votes, totals, key, fix) {
  const [kindVote, code] = key.split('/');
  const v = votes.find((x) => x.kind + x.code === kindVote);
  if (!v) throw new Error(`Correction for unknown vote ${key}`);
  const node = code ? v.programmes.find((p) => p.code === code) : v;
  if (!node) throw new Error(`Correction for unknown programme ${key}`);
  for (const f of ['supply', 'aia']) if (fix[f] !== '') node[f] = fix[f] === 'none' ? null : Number(fix[f]);
  node.corrected = true;
}

export function reconcile({ votes, totals }) {
  const problems = [];
  for (const v of votes) {
    if (!v.programmes.length) { problems.push({ where: `${v.kind}${v.code}`, what: 'no programmes', page: v.pdfPage }); continue; }
    for (const f of ['supply', 'aia']) {
      const sum = v.programmes.reduce((a, p) => a + (p[f] ?? 0), 0);
      if (sum !== (v[f] ?? 0)) problems.push({ where: `${v.kind}${v.code}`, what: `${f} programmes ${sum} vote ${v[f]}`, diff: sum - (v[f] ?? 0), page: v.pdfPage, name: v.name });
    }
  }
  let from = 0, classSupply = 0, classAia = 0, clusterSupply = 0, clusterAia = 0, grandSupply = 0, grandAia = 0;
  for (const t of totals) {
    if (t.type.startsWith('CLASS')) {
      const part = votes.slice(from, t.after);
      classSupply = part.reduce((a, v) => a + (v.supply ?? 0), 0); classAia = part.reduce((a, v) => a + (v.aia ?? 0), 0);
      if (classSupply !== t.supply) problems.push({ where: `class ending p.${t.pdfPage}`, what: `supply votes ${classSupply} printed ${t.supply}`, diff: classSupply - t.supply, page: t.pdfPage });
      if (classAia !== (t.aia ?? 0)) problems.push({ where: `class ending p.${t.pdfPage}`, what: `aia votes ${classAia} printed ${t.aia}`, diff: classAia - (t.aia ?? 0), page: t.pdfPage });
      clusterSupply += t.supply ?? 0; clusterAia += t.aia ?? 0; from = t.after;
    } else if (t.type.startsWith('CLUSTER')) {
      if (clusterSupply !== t.supply) problems.push({ where: `cluster ending p.${t.pdfPage}`, what: `supply classes ${clusterSupply} printed ${t.supply}`, diff: clusterSupply - t.supply, page: t.pdfPage });
      if (clusterAia !== (t.aia ?? 0)) problems.push({ where: `cluster ending p.${t.pdfPage}`, what: `aia classes ${clusterAia} printed ${t.aia}`, diff: clusterAia - (t.aia ?? 0), page: t.pdfPage });
      grandSupply += t.supply ?? 0; grandAia += t.aia ?? 0; clusterSupply = 0; clusterAia = 0;
    } else {
      if (grandSupply !== t.supply) problems.push({ where: 'grand total', what: `supply clusters ${grandSupply} printed ${t.supply}`, diff: grandSupply - t.supply, page: t.pdfPage });
      if (grandAia !== (t.aia ?? 0)) problems.push({ where: 'grand total', what: `aia clusters ${grandAia} printed ${t.aia}`, diff: grandAia - (t.aia ?? 0), page: t.pdfPage });
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const read = (mode) => execFileSync('pdftotext', [mode, pdf, '-'], { encoding: 'latin1', maxBuffer: 64 * 1024 * 1024 });
  const text = read('-table');
  const correctionsFile = join(outDir, 'corrections.csv');
  const corrections = new Map();
  if (existsSync(correctionsFile)) for (const r of parseCsv(readFileSync(correctionsFile, 'utf8'))) corrections.set(r.key, r);
  const parsed = parseSchedule(text, corrections);
  const problems = reconcile(parsed);
  // Names the scan damaged, read from the page
  const namesFile = join(outDir, 'names.csv');
  const names = existsSync(namesFile) ? new Map(parseCsv(readFileSync(namesFile, 'utf8')).map((r) => [r.key, r.name])) : new Map();
  for (const v of parsed.votes) {
    v.name = names.get(v.kind + v.code) ?? v.name;
    for (const p of v.programmes) p.name = names.get(`${v.kind}${v.code}/${p.code}`) ?? p.name;
  }
  // The Schedule's classes, in printed order
  const classes = parsed.totals.filter((t) => t.type.startsWith('CLASS'));
  const classNames = ['central-recurrent', 'central-development', 'commissions-recurrent', 'commissions-development'];
  parsed.votes.forEach((v, i) => { v.class = classNames[classes.findIndex((t) => i < t.after)]; });
  mkdirSync(outDir, { recursive: true });
  const rows = [['class', 'kind', 'vote', 'programme', 'name', 'supply', 'aia', 'pdf_page', 'corrected']];
  for (const v of parsed.votes) {
    rows.push([v.class, v.kind, v.code, '', v.name, v.supply ?? '', v.aia ?? '', v.pdfPage, v.corrected ? 'yes' : '']);
    for (const p of v.programmes) rows.push([v.class, v.kind, v.code, p.code, p.name, p.supply ?? '', p.aia ?? '', p.pdfPage, p.corrected ? 'yes' : '']);
  }
  writeFileSync(join(outDir, 'extract.csv'), rows.map(csvLine).join('\n') + '\n');
  const totals = [['type', 'supply', 'aia', 'pdf_page'], ...parsed.totals.map((t) => [t.type, t.supply ?? '', t.aia ?? '', t.pdfPage])];
  writeFileSync(join(outDir, 'totals.csv'), totals.map(csvLine).join('\n') + '\n');
  // The second reading takes no corrections: every place it differs must show up in double entry
  const second = parseSchedule(splitRunTogether(read('-simple')));
  const typed = [['kind', 'vote', 'programme', 'supply', 'aia', 'pdf_page']];
  for (const v of second.votes) {
    typed.push([v.kind, v.code, '', v.supply ?? '', v.aia ?? '', v.pdfPage]);
    for (const p of v.programmes) typed.push([v.kind, v.code, p.code, p.supply ?? '', p.aia ?? '', p.pdfPage]);
  }
  writeFileSync(join(outDir, 'typed.csv'), typed.map(csvLine).join('\n') + '\n');
  console.log(`votes ${parsed.votes.length} (R ${parsed.votes.filter((v) => v.kind === 'R').length}, D ${parsed.votes.filter((v) => v.kind === 'D').length}), programmes ${parsed.votes.reduce((a, v) => a + v.programmes.length, 0)}, totals ${parsed.totals.length}`);
  console.log(`problems ${problems.length}`);
  for (const p of problems.slice(0, 60)) console.log(`  p.${p.page} ${p.where} ${p.what}${p.diff != null ? ` (diff ${p.diff})` : ''} ${p.name ?? ''}`);
  process.exitCode = problems.length ? 1 : 0;
}
