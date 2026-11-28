// Builds the KoboToolbox forms (XLSForm .xlsx) from the CSV sources in fieldwork/kobo/<form>/ (decision #115).
// The ward, place, road and market lists are added from the site's own data, so a form always offers today's places.
// No dependencies: a small XLSX writer (uncompressed ZIP) is included below.
// Usage: node scripts/fieldwork/build-forms.mjs [version]   (version defaults to today, YYYYMMDD01)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import wards from '../../src/data/wards.json' with { type: 'json' };
import { places } from '../../src/lib/places.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const version = process.argv[2] ?? new Date().toISOString().slice(0, 10).split('-').join('') + '01';

export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ''));
}

const wardRows = wards.map((w) => ['ward', w.slug, `${w.name} (${w.subCounty})`, '']);
const short = (s) => (s.length > 90 ? s.slice(0, 88) + '…' : s);
const list = (name, items, newLabel) => [
  ...items.map((p) => [name, p.id, short(`${p.name} · ${p.code}`), p.wards.join(' ') || 'any']),
  [name, 'new', newLabel, 'any'],
];
const generated = {
  'place-visit': [...wardRows, ...list('place', places.filter((p) => p.kind !== 'road'), 'Not on the list')],
  'road-check': [...wardRows, ...list('road', places.filter((p) => p.kind === 'road'), 'Not on the list')],
  'market-prices': [...wardRows, ...list('market', places.filter((p) => p.type === 'Market'), 'Not on the list')],
  'knowledge-survey': [...wardRows],
  'speech-recording': [...wardRows],
};
const titles = {
  'place-visit': 'Gusii Daily: place visit', 'road-check': 'Gusii Daily: road check',
  'market-prices': 'Gusii Daily: market prices', 'knowledge-survey': 'Gusii Daily: knowledge survey',
  'speech-recording': 'Gusii Daily: Ekegusii speech recording',
};

// --- minimal XLSX writer -------------------------------------------------------------------------
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(files) {
  const parts = []; const central = []; let offset = 0;
  for (const [name, content] of files) {
    const data = Buffer.from(content, 'utf8'); const nameBuf = Buffer.from(name, 'utf8'); const crc = crc32(data);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBuf.length, 26);
    parts.push(local, nameBuf, data);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nameBuf.length, 28); c.writeUInt32LE(offset, 42);
    central.push(c, nameBuf); offset += 30 + nameBuf.length + data.length;
  }
  const cd = Buffer.concat(central); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const col = (i) => { let s = ''; for (i++; i; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };
const sheetXml = (rows) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => v === '' ? '' : `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
function xlsx(sheets) {
  const names = Object.keys(sheets);
  return zip([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${names.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}</Relationships>`],
    ...names.map((n, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(sheets[n])]),
  ]);
}

// --- build ---------------------------------------------------------------------------------------
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  for (const form of Object.keys(generated)) {
    const dir = path.join(root, 'fieldwork', 'kobo', form);
    const survey = parseCsv(fs.readFileSync(path.join(dir, 'survey.csv'), 'utf8'));
    const choices = parseCsv(fs.readFileSync(path.join(dir, 'choices.csv'), 'utf8'));
    const settings = [['form_title', 'form_id', 'version', 'default_language'], [titles[form], `nd_${form.split('-').join('_')}`, version, 'English (en)']];
    const out = path.join(root, 'fieldwork', 'kobo', `${form}.xlsx`);
    fs.writeFileSync(out, xlsx({ survey, choices: [...choices, ...generated[form]], settings }));
    console.log(`${path.relative(root, out)}: ${survey.length - 1} questions, ${choices.length - 1 + generated[form].length} choices, version ${version}`);
  }
}
