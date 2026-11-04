// Searches each stored Controller of Budget annual report for the Nyamira figures in cob-history/history.csv, and
// records where each was found in cob-history/checked.json. A figure found keeps the label "official": the check is
// recorded, but only a person's check earns "verified". Runs on the laptop: it needs pdftotext and the stored PDFs.
//   node scripts/county/verify-history.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '@kbe/engine/csv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(root, 'data-src/county/nyamira');
const TODAY = new Date().toISOString().slice(0, 10);
const FIELDS = { budget: 'budget', spent: 'spent', dev: 'dev-spent', rec: 'rec-spent', devAbs: 'dev-absorption', osrTarget: 'osr-target', osr: 'osr-actual', eqShare: 'equitable-share', pending: 'pending-bills' };

// The ways a report may print a value given in KSh million: "4.23 billion", "5.60 billion", "96.62 million", or a
// table cell such as "5,135.34". Bare cells are searched only for values with decimals, so that a round number
// such as 100 cannot match a page number or a count.
export function printedForms(million, isPercent) {
  if (isPercent) return [`${million} per cent`, `${million}%`, `${million} percent`];
  const forms = new Set();
  const trim = (s) => s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  if (million >= 1000) for (const d of [2, 1]) {
    const b = million / 1000;
    if (Number(b.toFixed(d)) === Number(b.toFixed(4))) { forms.add(`${b.toFixed(d)} billion`); forms.add(`${trim(b.toFixed(d))} billion`); }
  }
  const m = million.toLocaleString('en-US', { maximumFractionDigits: 2 });
  forms.add(`${m} million`);
  if (Number.isInteger(million)) { forms.add(`${million.toLocaleString('en-US')}.0 million`); forms.add(`${million.toLocaleString('en-US')}.00 million`); }
  else if (String(million).split('.')[1]?.length === 1) forms.add(`${m}0 million`);
  if (!Number.isInteger(million)) forms.add(million.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  return [...forms];
}

// A table may print the same value in whole shillings: 5,334.2 million is printed as 5,334,198,486. Accepts a
// whole-shilling amount that rounds to the value at the value's own precision.
export function findShillings(pages, million) {
  const places = (String(million).split('.')[1] ?? '').length;
  if (!places) return null; // a round number of millions could match too much
  for (const [i, text] of pages.entries()) {
    for (const m of text.matchAll(/(?<![\d,.])\d{1,3}(?:,\d{3}){2,}(?![\d,]*\d)/g)) {
      const n = Number(m[0].replace(/,/g, '')) / 1e6;
      if (Number(n.toFixed(places)) === million) return { index: i, form: m[0] };
    }
  }
  return null;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function findIn(pages, forms) {
  for (const [i, text] of pages.entries()) {
    const flat = text.replace(/\s+/g, ' ');
    for (const f of forms) {
      // Not inside a longer number; "Kshs.6.11 billion" puts a full stop before the figure, so only digits count.
      const re = f instanceof RegExp ? f : new RegExp(`(?<![\\d,])(?<!\\d\\.)${escape(f).replace(/ /g, '\\s*')}`, 'i');
      const hit = flat.match(re);
      if (hit) return { index: i, form: f instanceof RegExp ? hit[0] : f };
    }
  }
  return null;
}

// Nyamira's section runs from its heading to the next county's (Nyandarua comes next in every report). Some reports
// have no clean heading in their text layer, so the section is also found as the run of pages that mention Nyamira
// most, around the page that mentions it most.
const heading = (name) => new RegExp(`^\\s*\\d+\\.\\d+\\.?\\s+(${name} County|County Government of ${name})\\s*$`, 'im');
function section(pages) {
  let start = pages.findIndex((t, i) => i > 15 && heading('Nyamira').test(t));
  if (start >= 0) {
    let end = pages.findIndex((t, i) => i > start && heading('Nyandarua').test(t));
    if (end < 0) end = Math.min(pages.length - 1, start + 12);
    return { start, end: end + 1, how: 'heading' };
  }
  const count = pages.map((t, i) => (i > 15 ? (t.match(/Nyamira/g) ?? []).length : 0));
  const peak = count.indexOf(Math.max(...count));
  if (count[peak] < 3) return null;
  start = peak;
  while (start > 16 && count[start - 1] >= 1) start--;
  let end = peak;
  while (end < pages.length - 1 && count[end + 1] >= 1 && !heading('Nyandarua').test(pages[end + 1])) end++;
  return { start, end: end + 1, how: 'mentions' };
}

// Pending bills are often printed in parts (recurrent and development) that add up to the figure. Looks for two or
// three amounts within 400 characters after "pending bills" on one page that add up to the value to the cent.
export function findSum(pages, million) {
  for (const [i, text] of pages.entries()) {
    const flat = text.replace(/\s+/g, ' ');
    for (const m of flat.matchAll(/pending bills/gi)) {
      const near = flat.slice(m.index, m.index + 400);
      const amounts = [...near.matchAll(/Kshs?\.?\s*([\d,]+(?:\.\d+)?)\s*(million|billion)/gi)].map((a) => Number(a[1].replace(/,/g, '')) * (/billion/i.test(a[2]) ? 1000 : 1));
      for (let a = 0; a < amounts.length; a++) for (let b = a + 1; b < amounts.length; b++) {
        if (Math.abs(amounts[a] + amounts[b] - million) < 0.005) return { index: i, form: `${amounts[a]} + ${amounts[b]} million` };
        for (let c = b + 1; c < amounts.length; c++) if (Math.abs(amounts[a] + amounts[b] + amounts[c] - million) < 0.005) return { index: i, form: `${amounts[a]} + ${amounts[b]} + ${amounts[c]} million` };
      }
    }
  }
  return null;
}

const footer = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const l of [...lines.slice(-3), ...lines.slice(0, 2)]) if (/^\d{1,4}$/.test(l)) return Number(l);
  return null;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const checked = {};
  const offsets = {};
  for (const y of parseCsv(readFileSync(join(dir, 'cob-history/history.csv'), 'utf8'))) {
    const fy = y.fy.replace('/', '-');
    const pdf = join(dir, `pdfs/cob-county-annual-${fy}.pdf`);
    if (!existsSync(pdf)) continue;
    const pages = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\f');
    const s = section(pages);
    if (!s) { console.log(`${y.fy}: Nyamira's section not found`); continue; }
    const within = pages.slice(s.start, s.end);
    // The printed page is the PDF page plus the offset most of the section's footers agree on. A single page's
    // footer cannot be trusted: a table's last number can look like one.
    const seen = within.map((t, i) => footer(t) - (s.start + i + 1)).filter((v) => !Number.isNaN(v));
    const votes = seen.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map());
    const [best, agree] = [...votes.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
    const offset = agree >= 2 ? best : null;
    const fields = {}, missing = [];
    for (const [col, key] of Object.entries(FIELDS)) {
      if (y[col] === '') continue;
      const value = Number(y[col]), pct = key === 'dev-absorption';
      const hit = findIn(within, printedForms(value, pct)) ?? (key === 'pending-bills' ? findSum(within, value) : null) ?? (pct ? null : findShillings(within, value));
      if (!hit) { missing.push(`${key} ${y[col]}`); continue; }
      const pdfPage = s.start + hit.index + 1;
      fields[key] = { page: offset != null ? `Nyamira section, p.${pdfPage + offset}` : `Nyamira section, PDF page ${pdfPage}`, pdfPage, printedAs: hit.form };
    }
    offsets[y.fy] = offset;
    checked[y.fy] = { checkedOn: TODAY, method: 'pdftotext -layout, value searched in the Nyamira section', fields };
    console.log(`${y.fy} (pp.${s.start + 1}-${s.end}, by ${s.how}): found ${Object.keys(fields).length}, not found: ${missing.join('; ') || 'none'} (printed page = PDF page ${offset >= 0 ? '+' : ''}${offset})`);
  }
  writeFileSync(join(dir, 'cob-history/checked.json'), JSON.stringify(checked, null, 2) + '\n');
  writeFileSync(join(dir, 'cob-history/page-offsets.json'), JSON.stringify(offsets, null, 2) + '\n');
}
