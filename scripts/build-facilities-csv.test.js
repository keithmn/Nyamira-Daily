import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderFacilitiesCsv, renderFacilitiesV2Csv } from './build-facilities-csv.js';

test('facility CSV remains a reproducible export of the canonical registry', () => {
  const csvPath = fileURLToPath(new URL('../public/files/facilities-v1.csv', import.meta.url));
  assert.equal(renderFacilitiesCsv(), fs.readFileSync(csvPath, 'utf8'));
});

test('facility v2 CSV links stable profiles and omits candidate coordinates', () => {
  const csvPath = fileURLToPath(new URL('../public/files/facilities-v2.csv', import.meta.url));
  const csv = renderFacilitiesV2Csv();
  assert.equal(csv, fs.readFileSync(csvPath, 'utf8'));
  const [header, firstRecord] = csv.split('\r\n');
  assert.equal(header, 'id,name,profile_url,category,subtype,ward,sub_county,owner,level,source,source_ref,evidence,evidence_note');
  assert.match(firstRecord, /^[^,]+,[^,]+,\/facility\/[^,]+\/,/);
  assert.doesNotMatch(header, /(?:^|,)(?:lat|lon|coordinates)(?:,|$)/);
});
