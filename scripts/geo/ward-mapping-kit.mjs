#!/usr/bin/env node
/**
 * Generate a printable ward mapping kit — one HTML page per ward
 * listing every facility that needs coordinates, with a checklist
 * and Google Maps search links.
 *
 * Usage:
 *   node scripts/geo/ward-mapping-kit.mjs              # all wards
 *   node scripts/geo/ward-mapping-kit.mjs --ward manga  # one ward
 *
 * Output: data-src/mapping-kits/<ward>.html (open in browser, print to PDF)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FACILITIES_PATH = resolve(ROOT, 'src/data/facilities.json');
const OUT_DIR = resolve(ROOT, 'data-src/mapping-kits');

const wardFlag = process.argv.includes('--ward')
  ? process.argv[process.argv.indexOf('--ward') + 1]
  : null;

const WARD_NAMES = {
  esise: 'Esise', mekenene: 'Mekenene', kiabonyoru: 'Kiabonyoru',
  nyansiongo: 'Nyansiongo', rigoma: 'Rigoma', gachuba: 'Gachuba',
  kemera: 'Kemera', magombo: 'Magombo', manga: 'Manga', gesima: 'Gesima',
  nyamaiya: 'Nyamaiya', bogichora: 'Bogichora', bosamaro: 'Bosamaro',
  bonyamatuta: 'Bonyamatuta', township: 'Township', itibo: 'Itibo',
  bomwagamo: 'Bomwagamo', bokeira: 'Bokeira', magwagwa: 'Magwagwa',
  ekerenyo: 'Ekerenyo',
};

const SUB_COUNTIES = {
  esise: 'Borabu', mekenene: 'Borabu', kiabonyoru: 'Borabu', nyansiongo: 'Borabu',
  rigoma: 'Kitutu Masaba', gachuba: 'Kitutu Masaba', kemera: 'Kitutu Masaba',
  magombo: 'Kitutu Masaba', manga: 'Kitutu Masaba', gesima: 'Kitutu Masaba',
  nyamaiya: 'West Mugirango', bogichora: 'West Mugirango', bosamaro: 'West Mugirango',
  bonyamatuta: 'West Mugirango', township: 'West Mugirango',
  itibo: 'North Mugirango', bomwagamo: 'North Mugirango', bokeira: 'North Mugirango',
  magwagwa: 'North Mugirango', ekerenyo: 'North Mugirango',
};

function mapsSearchUrl(name, ward) {
  const q = encodeURIComponent(`${name}, ${WARD_NAMES[ward] || ward}, Nyamira County, Kenya`);
  return `https://www.google.com/maps/search/${q}`;
}

function generateKit(ward, facilities) {
  const needCoords = facilities.filter(f => !f.coordinates?.lat);
  const haveCoords = facilities.filter(f => f.coordinates?.lat);
  const pct = facilities.length > 0 ? Math.round(haveCoords.length / facilities.length * 100) : 0;

  const byType = {};
  for (const f of needCoords) {
    const t = f.category || 'Other';
    if (!byType[t]) byType[t] = [];
    byType[t].push(f);
  }

  let rows = '';
  for (const [type, facs] of Object.entries(byType).sort((a, b) => a[0].localeCompare(b[0]))) {
    rows += `<tr class="type-header"><td colspan="4">${type} (${facs.length})</td></tr>\n`;
    for (const f of facs) {
      const mapUrl = mapsSearchUrl(f.name, ward);
      rows += `<tr>
  <td class="check">☐</td>
  <td><strong>${f.name}</strong>${f.subtype ? `<br><small>${f.subtype}</small>` : ''}</td>
  <td><small>${f.source}</small></td>
  <td><a href="${mapUrl}">Map</a></td>
</tr>\n`;
    }
  }

  let alreadyMapped = '';
  if (haveCoords.length > 0) {
    alreadyMapped = `<h3>Already mapped (${haveCoords.length})</h3>
<p class="small">These facilities already have coordinates. You can verify them by visiting and checking the GPS matches.</p>
<ul class="mapped-list">
${haveCoords.map(f => `<li><strong>${f.name}</strong> — ${f.category} (${f.coordinates.lat}, ${f.coordinates.lon})</li>`).join('\n')}
</ul>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mapping Kit: ${WARD_NAMES[ward]} Ward</title>
<style>
  @media print {
    a { text-decoration: none; color: #000; }
    .no-print { display: none; }
    @page { margin: 15mm; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; padding: 16px; max-width: 800px; margin: 0 auto; color: #1a1a1a; line-height: 1.4; }
  h1 { font-size: 1.4rem; margin-bottom: 2px; }
  h2 { font-size: 1.1rem; margin-top: 20px; margin-bottom: 8px; }
  h3 { font-size: 1rem; margin-top: 16px; margin-bottom: 6px; }
  .meta { color: #555; font-size: 0.85rem; margin-bottom: 12px; }
  .progress { background: #e0e0e0; border-radius: 8px; height: 20px; margin: 8px 0 16px; overflow: hidden; }
  .progress-bar { background: #2e7d32; height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem; font-weight: 700; min-width: 30px; }
  .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
  .stat { background: #f5f5f5; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; }
  .stat strong { font-size: 1.2rem; display: block; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 8px; }
  th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #333; }
  td { padding: 5px 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .type-header td { background: #333; color: #fff; font-weight: 700; padding: 6px 8px; }
  .check { width: 24px; text-align: center; font-size: 1.1rem; }
  a { color: #2e7d32; }
  .instructions { background: #fff3e0; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 0.85rem; }
  .instructions ol { padding-left: 20px; }
  .instructions li { margin-bottom: 4px; }
  .mapped-list { font-size: 0.8rem; padding-left: 20px; }
  .mapped-list li { margin-bottom: 2px; }
  .small { font-size: 0.8rem; color: #555; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 0.75rem; color: #888; }
</style>
</head>
<body>
<h1>Mapping Kit: ${WARD_NAMES[ward]} Ward</h1>
<p class="meta">${SUB_COUNTIES[ward]} Sub-County, Nyamira County · Generated ${new Date().toISOString().slice(0, 10)}</p>

<div class="progress"><div class="progress-bar" style="width: ${Math.max(pct, 5)}%">${pct}%</div></div>

<div class="summary">
  <div class="stat"><strong>${facilities.length}</strong> facilities total</div>
  <div class="stat"><strong>${haveCoords.length}</strong> already mapped</div>
  <div class="stat"><strong>${needCoords.length}</strong> need coordinates</div>
</div>

<div class="instructions">
<strong>At each facility:</strong>
<ol>
<li>Open <strong>KoboCollect</strong> → Place visit form</li>
<li>Select <strong>${WARD_NAMES[ward]}</strong> ward and the facility name</li>
<li>Stand at the entrance. Wait for GPS accuracy under 10 metres</li>
<li>Record: open/closed, condition, services, water, power</li>
<li>Take one photo of the outside (no people in the photo)</li>
<li>Tick the privacy box and submit</li>
<li>Tick ☐ on this sheet when done</li>
</ol>
<p style="margin-top:8px"><strong>If the facility is not on the list:</strong> choose "Not on the list" in KoboCollect, type the name as written on its sign, and select its type.</p>
</div>

<h2>Facilities needing coordinates (${needCoords.length})</h2>
${needCoords.length > 0 ? `<table>
<thead><tr><th></th><th>Facility</th><th>Source</th><th class="no-print">Map</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>` : '<p>All facilities in this ward have coordinates.</p>'}

${alreadyMapped}

<div class="footer">
  <p>Gusii Daily Community Mapping Initiative · gusiidaily.org</p>
  <p>Do not record names, faces or phone numbers. Privacy first.</p>
</div>
</body>
</html>`;
}

const facilities = JSON.parse(readFileSync(FACILITIES_PATH, 'utf8'));
mkdirSync(OUT_DIR, { recursive: true });

const wards = wardFlag ? [wardFlag] : Object.keys(WARD_NAMES);
let totalGenerated = 0;

for (const ward of wards) {
  const wardFacs = facilities.filter(f => f.ward === ward);
  if (wardFacs.length === 0) continue;
  const html = generateKit(ward, wardFacs);
  const outPath = resolve(OUT_DIR, `${ward}.html`);
  writeFileSync(outPath, html);
  totalGenerated++;
  const need = wardFacs.filter(f => !f.coordinates?.lat).length;
  console.log(`  ${WARD_NAMES[ward]}: ${wardFacs.length} facilities, ${need} need coords → ${ward}.html`);
}

console.log(`\nGenerated ${totalGenerated} mapping kits in data-src/mapping-kits/`);
console.log('Open in browser and print to PDF, or use directly on a phone.');
