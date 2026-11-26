#!/usr/bin/env node
/**
 * Ingest a CSV of schools into the geo reconciliation pipeline.
 *
 * Usage:
 *   node scripts/geo/ingest-schools.mjs data-src/kenya-schools.csv
 *   node scripts/geo/ingest-schools.mjs data-src/kenya-schools.csv --county-col County --name-col "School Name"
 *
 * This script reads any CSV of schools, filters to Nyamira County (or its
 * subcounties/constituencies), and outputs a file in the same format as
 * osm-fresh.json so it can be fed through geo:reconcile.
 *
 * The script auto-detects common column names for coordinates, school name,
 * county/district, and school level. Use --flags to override if auto-detection
 * picks the wrong column.
 *
 * Output: data-src/schools-ingest.json (same schema as osm-fresh.json)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const OUT = resolve(ROOT, 'data-src/schools-ingest.json');

// Nyamira subcounties, constituencies and former districts that might appear
const NYAMIRA_FILTERS = [
  'nyamira', 'manga', 'kitutu masaba', 'borabu',
  'west mugirango', 'north mugirango',
  'north mugirango borabu',
  'kitutu chache', // sometimes used for the broader area
];

// Ward slugs for point-in-polygon fallback
const WARD_SLUGS = [
  'esise', 'mekenene', 'kiabonyoru', 'nyansiongo',
  'rigoma', 'gachuba', 'kemera', 'magombo', 'manga', 'gesima',
  'nyamaiya', 'bogichora', 'bosamaro', 'bonyamatuta', 'township',
  'itibo', 'bomwagamo', 'bokeira', 'magwagwa', 'ekerenyo',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith('--'));
  if (!csvPath) {
    console.error('Usage: node scripts/geo/ingest-schools.mjs <csv-file> [options]');
    console.error('Options:');
    console.error('  --name-col "School Name"    Column for school name');
    console.error('  --county-col County          Column for county/district');
    console.error('  --lat-col Latitude           Column for latitude');
    console.error('  --lon-col Longitude          Column for longitude');
    console.error('  --level-col Level            Column for school level/type');
    process.exit(1);
  }
  const getOpt = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : null;
  };
  return {
    csvPath: resolve(csvPath),
    nameCol: getOpt('--name-col'),
    countyCol: getOpt('--county-col'),
    latCol: getOpt('--lat-col'),
    lonCol: getOpt('--lon-col'),
    levelCol: getOpt('--level-col'),
  };
}

function parseCSV(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = splitCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
  return { headers, rows };
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function findColumn(headers, candidates) {
  for (const c of candidates) {
    const match = headers.find((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === c.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (match) return match;
  }
  for (const c of candidates) {
    const match = headers.find((h) => h.toLowerCase().includes(c.toLowerCase()));
    if (match) return match;
  }
  return null;
}

function detectColumns(headers, overrides) {
  return {
    name: overrides.nameCol || findColumn(headers, ['name', 'schoolname', 'school_name', 'school', 'facility_name', 'institution', 'institution_name']),
    county: overrides.countyCol || findColumn(headers, ['county', 'county_name', 'district', 'district_name', 'sub_county', 'subcounty', 'constituency']),
    lat: overrides.latCol || findColumn(headers, ['latitude', 'lat', 'y', 'gps_latitude']),
    lon: overrides.lonCol || findColumn(headers, ['longitude', 'lon', 'lng', 'x', 'gps_longitude']),
    level: overrides.levelCol || findColumn(headers, ['level', 'school_level', 'type', 'school_type', 'category', 'level_name', 'education_level']),
  };
}

function classifyLevel(level, name) {
  const combined = `${level || ''} ${name || ''}`.toLowerCase();
  if (/primary/i.test(combined)) return 'primary school';
  if (/secondary|high school/i.test(combined)) return 'secondary school';
  if (/polytechnic|tvet|technical/i.test(combined)) return 'polytechnic';
  if (/college/i.test(combined)) return 'college';
  if (/university/i.test(combined)) return 'university';
  if (/nursery|ecde|ecd|pre.?primary|kindergarten/i.test(combined)) return 'ECDE';
  return 'school';
}

function loadWardBoundaries() {
  try {
    const geoPath = resolve(ROOT, 'data-src/nyamira-wards-geo.json');
    const raw = JSON.parse(readFileSync(geoPath, 'utf8'));
    if (raw.features) return raw;
    return {
      type: 'FeatureCollection',
      features: Object.entries(raw).map(([name, val]) => ({
        type: 'Feature',
        properties: { shapeName: name },
        geometry: val.geometry || val,
      })),
    };
  } catch { return null; }
}

function findWard(lat, lon, geojson) {
  if (!geojson?.features) return null;
  for (const feature of geojson.features) {
    const name = feature.properties?.shapeName || feature.properties?.name || '';
    const slug = name.toLowerCase().replace(/[^a-z]+/g, '');
    if (!slug) continue;
    const geom = feature.geometry;
    if (!geom) continue;
    const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    for (const polygon of polygons) {
      if (pointInPolygon(lon, lat, polygon[0])) return slug;
    }
  }
  return null;
}

function pointInPolygon(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function run() {
  const opts = parseArgs();
  const csvText = readFileSync(opts.csvPath, 'utf8');
  const { headers, rows } = parseCSV(csvText);

  console.log(`CSV: ${rows.length} rows, ${headers.length} columns`);
  console.log(`Columns: ${headers.join(', ')}`);

  const cols = detectColumns(headers, opts);
  console.log('\nDetected columns:');
  console.log(`  Name:   ${cols.name || '(not found)'}`);
  console.log(`  County: ${cols.county || '(not found)'}`);
  console.log(`  Lat:    ${cols.lat || '(not found)'}`);
  console.log(`  Lon:    ${cols.lon || '(not found)'}`);
  console.log(`  Level:  ${cols.level || '(not found)'}`);

  if (!cols.name) {
    console.error('\nCould not find a name column. Use --name-col to specify it.');
    process.exit(1);
  }

  // Filter to Nyamira
  let filtered;
  if (cols.county) {
    filtered = rows.filter((r) => {
      const val = (r[cols.county] || '').toLowerCase().trim();
      return NYAMIRA_FILTERS.some((f) => val.includes(f));
    });
    console.log(`\nFiltered to Nyamira: ${filtered.length} of ${rows.length}`);
  } else {
    console.log('\nNo county column found — including all rows.');
    console.log('Use --county-col to specify the column, or filter the CSV beforehand.');
    filtered = rows;
  }

  if (filtered.length === 0) {
    console.log('No matching rows. Check the county column values.');
    if (cols.county) {
      const vals = new Set(rows.map((r) => r[cols.county]).filter(Boolean));
      console.log('Unique county values:', [...vals].slice(0, 30).join(', '));
    }
    return;
  }

  // Load ward boundaries for point-in-polygon
  const wardGeo = loadWardBoundaries();

  // Convert to features
  const features = filtered.map((row, i) => {
    const name = row[cols.name] || '';
    const lat = cols.lat ? parseFloat(row[cols.lat]) : null;
    const lon = cols.lon ? parseFloat(row[cols.lon]) : null;
    const level = cols.level ? row[cols.level] : null;
    const ward = (lat && lon && wardGeo) ? findWard(lat, lon, wardGeo) : null;

    return {
      osmId: `csv-school-${i}`,
      type: 'csv-import',
      lat: (lat && !isNaN(lat)) ? Math.round(lat * 100000) / 100000 : null,
      lon: (lon && !isNaN(lon)) ? Math.round(lon * 100000) / 100000 : null,
      name: name.trim(),
      category: 'Education',
      subtype: classifyLevel(level, name),
      tags: { csvSource: opts.csvPath.split('/').pop(), level: level || '' },
      ward,
    };
  }).filter((f) => f.name);

  console.log(`Features generated: ${features.length}`);
  const withCoords = features.filter((f) => f.lat);
  console.log(`  With coordinates: ${withCoords.length}`);
  const withWard = features.filter((f) => f.ward);
  console.log(`  With ward match: ${withWard.length}`);

  // Subtype breakdown
  const subtypes = {};
  for (const f of features) subtypes[f.subtype] = (subtypes[f.subtype] || 0) + 1;
  console.log('  By type:');
  for (const [s, c] of Object.entries(subtypes).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${s}: ${c}`);
  }

  const output = {
    generated: new Date().toISOString().slice(0, 10),
    source: `CSV import: ${opts.csvPath.split('/').pop()}`,
    licence: 'Check the source CSV licence',
    count: features.length,
    features,
  };

  writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nWritten to ${OUT}`);
  console.log('Next: run npm run geo:reconcile to match against existing facilities.');
}

run();
