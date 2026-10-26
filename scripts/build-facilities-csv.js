import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolveWards } from '../src/lib/facility-registry.js';

const outputPath = fileURLToPath(new URL('../public/files/facilities-v1.csv', import.meta.url));
const v2OutputPath = fileURLToPath(new URL('../public/files/facilities-v2.csv', import.meta.url));
const columns = ['id', 'name', 'category', 'subtype', 'ward', 'sub_county', 'owner', 'level', 'source', 'source_ref', 'lat', 'lon', 'evidence'];
const v2Columns = ['id', 'name', 'profile_url', 'category', 'subtype', 'ward', 'sub_county', 'owner', 'level', 'source', 'source_ref', 'evidence', 'evidence_note'];
const require = createRequire(import.meta.url);
const facilities = require('../src/data/facilities.json');
const wardRecords = require('../src/data/wards.json');
resolveWards(wardRecords, facilities);

function csvValue(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function renderFacilitiesCsv(records = facilities, wards = wardRecords) {
  const wardBySlug = new Map(wards.map((ward) => [ward.slug, ward]));
  const rows = records.map((facility) => {
    const ward = wardBySlug.get(facility.ward);
    if (!ward) throw new Error(`Facility ${facility.id} references unknown ward ${facility.ward}.`);
    return [
      facility.id,
      facility.name,
      facility.category,
      facility.subtype,
      ward.name,
      ward.subCounty,
      facility.owner,
      facility.level,
      facility.source,
      facility.sourceRef,
      facility.coordinates?.lat,
      facility.coordinates?.lon,
      facility.evidenceNote,
    ].map(csvValue).join(',');
  });
  return `${columns.join(',')}\r\n${rows.join('\r\n')}\r\n`;
}

export function renderFacilitiesV2Csv(records = facilities, wards = wardRecords) {
  const wardBySlug = new Map(wards.map((ward) => [ward.slug, ward]));
  const rows = records.map((facility) => {
    const ward = wardBySlug.get(facility.ward);
    if (!ward) throw new Error(`Facility ${facility.id} references unknown ward ${facility.ward}.`);
    return [
      facility.id,
      facility.name,
      `/facility/${facility.id.toLowerCase()}/`,
      facility.category,
      facility.subtype,
      ward.name,
      ward.subCounty,
      facility.owner,
      facility.level,
      facility.source,
      facility.sourceRef,
      facility.evidence,
      facility.evidenceNote,
    ].map(csvValue).join(',');
  });
  return `${v2Columns.join(',')}\r\n${rows.join('\r\n')}\r\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputs = [
    [outputPath, renderFacilitiesCsv()],
    [v2OutputPath, renderFacilitiesV2Csv()],
  ];
  const mode = process.argv[2] ?? '--write';
  if (mode === '--check') {
    for (const [filePath, output] of outputs) {
      if (fs.readFileSync(filePath, 'utf8') !== output) {
        throw new Error(`${path.basename(filePath)} is out of date; run node scripts/build-facilities-csv.js --write.`);
      }
    }
  } else if (mode === '--write') {
    for (const [filePath, output] of outputs) fs.writeFileSync(filePath, output);
  } else {
    throw new Error('Usage: node scripts/build-facilities-csv.js [--check|--write]');
  }
}
