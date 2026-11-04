// First reading of Table 9 of Nyamira's Programme Based Budget 2025/26 (printed pp.20-28): one row per printed
// sub-programme line, with its amounts. The text layer wraps every column, so numbers are rebuilt from the pieces
// printed below each other in the same column (pdftotext -table keeps the columns in place).
// Names and the programme each row belongs to are not trusted from this reading: they are set by hand in
// data-src/county/nyamira/pbb-2025-26/programmes.csv, and that file is what the figures are built from.
//   node scripts/county/extract-pbb-programmes.mjs > data-src/county/nyamira/pbb-2025-26/table9-reading.csv
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PDF = join(root, 'data-src/county/nyamira/pdfs/pbb-2025-26-printed.pdf');
const FIRST = 20, LAST = 28;

const isAnchor = (t) => t === '-' || /^\d{1,3}(,\d{1,3})*,?$/.test(t) && (t.includes(',') || t.length >= 4) || /^\d{5,}$/.test(t);
const isPiece = (t) => /^,?\d{1,3}(,\d{0,3})*,?$/.test(t);
const toNumber = (s) => (s === '-' || s === '' ? 0 : Number(s.replace(/,/g, '')));

function tokens(line) {
  const out = [];
  for (const m of line.matchAll(/\S+/g)) out.push({ x: m.index, t: m[0] });
  return out;
}

// The five money columns start at the same place on every line of a page; find them from the anchor numbers.
function moneyColumns(lines) {
  const starts = new Map();
  for (const line of lines) {
    // Dashes sit wherever the typist put them, so only digits mark where a column starts.
    const nums = tokens(line).filter((k) => isAnchor(k.t) && k.t !== '-');
    if (nums.length >= 3) for (const k of nums.slice(-5)) starts.set(k.x, (starts.get(k.x) ?? 0) + 1);
  }
  const xs = [...starts.entries()].filter(([, n]) => n >= 2).map(([x]) => x).sort((a, b) => a - b);
  const groups = [];
  for (const x of xs) {
    const g = groups[groups.length - 1];
    if (g && x - g[g.length - 1] <= 3) g.push(x); else groups.push([x]);
  }
  return groups.map((g) => Math.min(...g)).slice(-5);
}

// A piece belongs to the column it falls inside. Page 20 right-aligns the wrapped pieces, up to nine characters in
// from where the column starts, so nearness to the start is not enough.
const column = (cols, x) => {
  let found = -1;
  cols.forEach((c, i) => { if (x >= c - 2) found = i; });
  return found;
};

const rows = [];
let vote = '', votePiece = '';
for (let page = FIRST; page <= LAST; page++) {
  let text = execFileSync('pdftotext', ['-f', String(page), '-l', String(page), '-table', PDF, '-'], { encoding: 'utf8' });
  if (page === FIRST) text = text.slice(text.search(/Table\s+9\b/));
  if (page === LAST) text = text.slice(0, text.search(/Table\s+10\b/));
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !/Page\s+\d+\s+of/.test(l));
  const cols = moneyColumns(lines);
  const numStart = cols[0] - 2;
  let cur = null;
  for (const line of lines) {
    const ks = tokens(line);
    const money = ks.filter((k) => k.x >= numStart);
    const words = ks.filter((k) => k.x < numStart);
    const anchors = money.filter((k) => isAnchor(k.t) && !k.t.startsWith(','));
    // A vote starts where "52" sits in the first column; the next line carries the rest of its code.
    if (words[0] && words[0].x <= 2 && /^52$/.test(words[0].t)) votePiece = '52';
    else if (votePiece && words[0] && words[0].x <= 2 && /^\d{2}$/.test(words[0].t)) {
      vote = votePiece + words[0].t;
      votePiece = '';
      if (cur?.startsVote) cur.vote = vote; // the row that opened the vote was read before its code was complete
    }
    if (anchors.length >= 2) {
      cur = { page, vote, startsVote: votePiece === '52', line: line.trimEnd(), words: [], money: ['', '', '', '', ''] };
      rows.push(cur);
      for (const k of money) { const c = column(cols, k.x); if (c >= 0) cur.money[c] = k.t; }
    } else if (cur) {
      for (const k of money) {
        const c = column(cols, k.x);
        if (c >= 0 && isPiece(k.t) && cur.money[c] && cur.money[c] !== '-') cur.money[c] += k.t;
      }
    }
    if (cur) cur.words.push(words.map((k) => k.t).join(' '));
  }
}

const q = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
// The two projection columns are left out: they drift on some pages, and nothing uses them yet.
console.log('pdf_page,vote,recurrent,development,total,adds_up,text');
for (const r of rows) {
  const [rec, dev, tot] = r.money.slice(0, 3).map((m) => String(toNumber(m.replace(/,$/, ''))));
  const ok = toNumber(rec) + toNumber(dev) === toNumber(tot) ? 'yes' : 'no';
  console.log([r.page, r.vote, rec, dev, tot, ok, q(r.words.join(' | ').replace(/\s+/g, ' ').trim())].join(','));
}
