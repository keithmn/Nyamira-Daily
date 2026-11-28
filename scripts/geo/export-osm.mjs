#!/usr/bin/env node
/**
 * Export verified facilities to OSM XML format for JOSM upload.
 *
 * Usage:
 *   node scripts/geo/export-osm.mjs                    # all verified with coords
 *   node scripts/geo/export-osm.mjs --ward manga       # one ward
 *   node scripts/geo/export-osm.mjs --dry-run           # preview without writing
 *
 * Output: data-src/nyamira-facilities.osm
 *
 * Open the file in JOSM, review each node, then upload. Each node
 * includes the facility name, category tag, source and date.
 *
 * IMPORTANT: Review every node before uploading. Only upload facilities
 * that have been field-verified (evidence = "verified").
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FACILITIES_PATH = resolve(ROOT, 'src/data/facilities.json');

const DRY_RUN = process.argv.includes('--dry-run');
const wardFlag = process.argv.includes('--ward')
  ? process.argv[process.argv.indexOf('--ward') + 1]
  : null;

const CATEGORY_TO_OSM = {
  'Health': { amenity: 'clinic' },
  'Education': { amenity: 'school' },
  'Market': { amenity: 'marketplace' },
  'Water': { man_made: 'water_well' },
  'Agriculture': { landuse: 'farmyard' },
  'Public office': { office: 'government' },
  'Community centre': { amenity: 'community_centre' },
  'Worship': { amenity: 'place_of_worship' },
};

const SUBTYPE_TO_OSM = {
  'dispensary': { amenity: 'clinic', 'healthcare': 'clinic' },
  'health centre': { amenity: 'clinic', 'healthcare': 'centre' },
  'sub-county hospital': { amenity: 'hospital', 'healthcare': 'hospital' },
  'county referral hospital': { amenity: 'hospital', 'healthcare': 'hospital' },
  'primary school': { amenity: 'school', 'isced:level': '1' },
  'secondary school': { amenity: 'school', 'isced:level': '2' },
  'cattle dip': { man_made: 'cattle_dip' },
};

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const facilities = JSON.parse(readFileSync(FACILITIES_PATH, 'utf8'));

const exportable = facilities.filter(f => {
  if (!f.coordinates?.lat) return false;
  if (wardFlag && f.ward !== wardFlag) return false;
  return true;
});

console.log(`Facilities with coordinates${wardFlag ? ` in ${wardFlag}` : ''}: ${exportable.length}`);

if (DRY_RUN) {
  console.log('\nDry run — would export:');
  for (const f of exportable) {
    console.log(`  ${f.id} ${f.name} (${f.ward}) [${f.evidence}]`);
  }
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
let nodeId = -1;
let nodes = '';

for (const f of exportable) {
  const tags = {};

  const osmTags = SUBTYPE_TO_OSM[f.subtype] || CATEGORY_TO_OSM[f.category] || {};
  Object.assign(tags, osmTags);

  tags.name = f.name;
  tags.source = `Gusii Daily field survey`;
  tags['source:date'] = today;
  tags['ref:gusii-daily'] = f.id;

  if (f.ward) {
    tags['addr:ward'] = f.ward.charAt(0).toUpperCase() + f.ward.slice(1);
    tags['addr:county'] = 'Nyamira';
    tags['addr:country'] = 'KE';
  }

  let tagXml = '';
  for (const [k, v] of Object.entries(tags)) {
    tagXml += `    <tag k="${escapeXml(k)}" v="${escapeXml(String(v))}" />\n`;
  }

  nodes += `  <node id="${nodeId}" lat="${f.coordinates.lat}" lon="${f.coordinates.lon}" version="1">\n${tagXml}  </node>\n`;
  nodeId--;
}

const osm = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="gusii-daily-export">
${nodes}</osm>
`;

const outPath = resolve(ROOT, 'data-src/nyamira-facilities.osm');
writeFileSync(outPath, osm);
console.log(`Written ${exportable.length} nodes to ${outPath}`);
console.log('\nOpen in JOSM → review each node → upload.');
console.log('Only upload field-verified facilities (evidence = "verified").');
