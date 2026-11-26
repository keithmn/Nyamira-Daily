#!/usr/bin/env node
/**
 * Generate a clickable HTML page of Google Maps lookup links for every
 * facility that needs coordinates.
 *
 * Usage:  node scripts/geo/make-lookup-links.mjs
 *
 * Opens in a browser. Click a link → Google Maps opens with that facility.
 * If the pin is correct, copy the coordinates from the URL bar or
 * right-click the pin → "What's here?" and paste them into the form
 * on the page. The page collects your entries and exports a JSON file
 * you feed to geo:apply.
 *
 * No API key. No billing. No account. Just your browser.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FACILITIES_PATH = resolve(ROOT, 'src/data/facilities.json');

const facilities = JSON.parse(readFileSync(FACILITIES_PATH, 'utf8'));
const targets = facilities.filter((f) => !f.coordinates?.lat);

console.log(`Facilities without coordinates: ${targets.length}`);

// Group by ward
const byWard = {};
for (const f of targets) {
  const w = f.ward || 'unknown';
  if (!byWard[w]) byWard[w] = [];
  byWard[w].push(f);
}

const wardNames = {
  esise: 'Esise', mekenene: 'Mekenene', kiabonyoru: 'Kiabonyoru',
  nyansiongo: 'Nyansiongo', rigoma: 'Rigoma', gachuba: 'Gachuba',
  kemera: 'Kemera', magombo: 'Magombo', manga: 'Manga', gesima: 'Gesima',
  nyamaiya: 'Nyamaiya', bogichora: 'Bogichora', bosamaro: 'Bosamaro',
  bonyamatuta: 'Bonyamatuta', township: 'Township', itibo: 'Itibo',
  bomwagamo: 'Bomwagamo', bokeira: 'Bokeira', magwagwa: 'Magwagwa',
  ekerenyo: 'Ekerenyo', unknown: 'Unknown ward',
};

function mapsSearchUrl(name, ward) {
  const q = encodeURIComponent(`${name}, ${wardNames[ward] || ward}, Nyamira County, Kenya`);
  return `https://www.google.com/maps/search/${q}`;
}

function mapsPlaceUrl(placeId) {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}

let rows = '';
let total = 0;
const wardOrder = Object.keys(byWard).sort();

for (const ward of wardOrder) {
  const facs = byWard[ward];
  rows += `<tr class="ward-header"><td colspan="5">${wardNames[ward] || ward} (${facs.length})</td></tr>\n`;
  for (const f of facs) {
    total++;
    const placeId = f.sourceRef?.startsWith('google ') ? f.sourceRef.replace('google ', '') : null;
    const searchUrl = mapsSearchUrl(f.name, f.ward);
    const placeUrl = placeId ? mapsPlaceUrl(placeId) : null;
    const link = placeUrl
      ? `<a href="${placeUrl}" target="_blank">Place ID</a> · <a href="${searchUrl}" target="_blank">Search</a>`
      : `<a href="${searchUrl}" target="_blank">Search</a>`;

    rows += `<tr data-id="${f.id}">
  <td>${f.id}</td>
  <td><strong>${f.name}</strong><br><small>${f.category} · ${f.source}</small></td>
  <td>${link}</td>
  <td><input type="text" class="coord-input" placeholder="-0.5577, 34.929" data-id="${f.id}" data-name="${f.name.replace(/"/g, '&quot;')}" data-ward="${f.ward}"></td>
  <td class="status-cell"></td>
</tr>\n`;
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Coordinate Lookup — Nyamira Daily</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; padding: 16px; max-width: 1000px; margin: 0 auto; background: #fafaf8; color: #1a1a1a; }
  h1 { font-size: 1.3rem; margin-bottom: 4px; }
  .subtitle { color: #666; margin-bottom: 16px; }
  .stats { background: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
  .stats strong { font-size: 1.1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { text-align: left; padding: 8px; border-bottom: 2px solid #333; position: sticky; top: 0; background: #fafaf8; }
  td { padding: 6px 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .ward-header td { background: #333; color: #fff; font-weight: 700; padding: 8px; }
  a { color: #2e7d32; }
  .coord-input { width: 100%; padding: 4px 6px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; font-size: 0.85rem; }
  .coord-input.valid { border-color: #2e7d32; background: #e8f5e9; }
  .coord-input.invalid { border-color: #c62828; background: #ffebee; }
  .status-cell { font-size: 0.8rem; min-width: 20px; }
  .actions { margin: 16px 0; display: flex; gap: 8px; flex-wrap: wrap; }
  button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-export { background: #2e7d32; color: #fff; }
  .btn-export:hover { background: #1b5e20; }
  .btn-clear { background: #eee; color: #333; }
  .instructions { background: #fff3e0; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; line-height: 1.5; }
  .instructions ol { padding-left: 20px; }
</style>
</head>
<body>
<h1>Coordinate Lookup</h1>
<p class="subtitle">${total} facilities in Nyamira County need coordinates</p>

<div class="instructions">
<strong>How to use:</strong>
<ol>
<li>Click a <strong>Search</strong> or <strong>Place ID</strong> link — Google Maps opens</li>
<li>Find the correct pin. Right-click it → <strong>"What's here?"</strong> — coordinates appear at the bottom</li>
<li>Copy the coordinates (e.g. <code>-0.5577, 34.929</code>) and paste them into the input box</li>
<li>When done, click <strong>Export JSON</strong> to save your work</li>
</ol>
<p style="margin-top:8px">Your entries are saved in your browser as you type. The exported JSON can be applied with <code>npm run geo:apply</code>.</p>
</div>

<div class="stats">
  <strong id="count">0</strong> of ${total} coordinates entered
</div>

<div class="actions">
  <button class="btn-export" onclick="exportJSON()">Export JSON</button>
  <button class="btn-clear" onclick="clearAll()">Clear all</button>
</div>

<table>
<thead><tr><th>ID</th><th>Facility</th><th>Map</th><th>Coordinates</th><th></th></tr></thead>
<tbody>
${rows}
</tbody>
</table>

<div class="actions" style="margin-top: 16px;">
  <button class="btn-export" onclick="exportJSON()">Export JSON</button>
</div>

<script>
const KEY = 'nd-coord-lookup';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}

document.querySelectorAll('.coord-input').forEach(input => {
  const id = input.dataset.id;
  if (saved[id]) { input.value = saved[id]; validate(input); }

  input.addEventListener('input', () => {
    validate(input);
    saved[id] = input.value.trim();
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
    updateCount();
  });
});

function validate(input) {
  const val = input.value.trim();
  const cell = input.closest('tr').querySelector('.status-cell');
  if (!val) { input.className = 'coord-input'; cell.textContent = ''; return false; }
  const parts = val.split(/[,\\s]+/).map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) &&
      parts[0] >= -1.0 && parts[0] <= 0.0 && parts[1] >= 34.5 && parts[1] <= 35.5) {
    input.className = 'coord-input valid';
    cell.textContent = '\\u2713';
    cell.style.color = '#2e7d32';
    return true;
  }
  input.className = 'coord-input invalid';
  cell.textContent = '?';
  cell.style.color = '#c62828';
  return false;
}

function updateCount() {
  const valid = document.querySelectorAll('.coord-input.valid').length;
  document.getElementById('count').textContent = valid;
}
updateCount();

function exportJSON() {
  const entries = [];
  document.querySelectorAll('.coord-input.valid').forEach(input => {
    const parts = input.value.trim().split(/[,\\s]+/).map(Number);
    entries.push({
      facilityId: input.dataset.id,
      facilityName: input.dataset.name,
      ward: input.dataset.ward,
      lat: Math.round(parts[0] * 100000) / 100000,
      lon: Math.round(parts[1] * 100000) / 100000,
      source: 'Google Maps manual lookup',
      approve: true,
    });
  });
  if (entries.length === 0) { alert('No valid coordinates entered yet.'); return; }
  const output = {
    generated: new Date().toISOString().slice(0, 10),
    source: 'Manual Google Maps coordinate lookup',
    coordinateEnrichment: entries,
    newCandidates: [],
    ambiguous: [],
  };
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'manual-coords.json';
  a.click();
}

function clearAll() {
  if (!confirm('Clear all entered coordinates?')) return;
  document.querySelectorAll('.coord-input').forEach(i => { i.value = ''; i.className = 'coord-input'; });
  document.querySelectorAll('.status-cell').forEach(c => { c.textContent = ''; });
  saved = {};
  try { localStorage.setItem(KEY, '{}'); } catch {}
  updateCount();
}
</script>
</body>
</html>`;

const outPath = resolve(ROOT, 'data-src/coord-lookup.html');
writeFileSync(outPath, html);
console.log(`Written to ${outPath}`);
console.log(`Open in your browser: file://${outPath}`);
console.log(`\nFacilities by ward:`);
for (const w of wardOrder) {
  console.log(`  ${wardNames[w] || w}: ${byWard[w].length}`);
}
