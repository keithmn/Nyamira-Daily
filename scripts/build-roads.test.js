import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { buildRoads, isRoadWorks, renderRoads, roadName } from './build-roads.js';

const require = createRequire(import.meta.url);
const roadsPath = new URL('../src/data/roads.json', import.meta.url);
const committed = JSON.parse(fs.readFileSync(roadsPath, 'utf8'));
const projects = require('../src/data/wardspend.json').projects;
const identities = require('../data-src/road-identities.json');

test('roads.json is reproducible from the county records and the reviewed identity file', () => {
  assert.equal(renderRoads(committed), fs.readFileSync(roadsPath, 'utf8'));
});

test('every road-works record is either part of exactly one road or excluded with a reason', () => {
  const roadWorks = new Set(projects.filter(isRoadWorks).map((p) => p.projectId));
  const inRoads = committed.roads.flatMap((r) => r.projectIds);
  assert.equal(new Set(inRoads).size, inRoads.length, 'a project belongs to more than one road');
  for (const id of roadWorks) {
    assert.ok(inRoads.includes(id) !== (id in identities.notRoads), `${id} must be a road or excluded, not both or neither`);
  }
  for (const reason of Object.values(identities.notRoads)) assert.ok(reason.length > 5);
});

test('confirmed groups record their evidence and confirmation; unconfirmed matches stay separate', () => {
  for (const group of identities.sameRoad) assert.ok(group.evidence && group.confirmed);
  const ids = committed.roads.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^NYM-R\d{4}$/.test(id)));
  for (const candidate of identities.candidateSameRoad) {
    const holders = new Set(candidate.projectIds.map((id) => committed.roads.find((r) => r.projectIds.includes(id))?.id));
    assert.equal(holders.size, candidate.projectIds.length, 'a candidate match was merged without confirmation');
  }
});

test('confirming a match keeps the lowest existing ID and retires the other', () => {
  const findings = [];
  const wardOrder = ['a'];
  const base = {
    projects: [
      { projectId: 'P-1', ward: 'a', fy: '2023/24', name: 'Road routine maintenance: X – Y (2.0 km)', department: 'Roads, Transport & Public Works' },
      { projectId: 'P-2', ward: null, fy: '2024/25', name: 'Routine maintenance of X – Y', department: 'Roads, Transport & Public Works' },
    ],
    findings,
    wardOrder,
  };
  const separate = buildRoads({ ...base, identities: { notRoads: {}, subtypes: {}, sameRoad: [], candidateSameRoad: [], auditRoads: [] } });
  assert.deepEqual(separate.roads.map((r) => r.id), ['NYM-R0001', 'NYM-R0002']);
  const merged = buildRoads({ ...base, existing: separate,
    identities: { notRoads: {}, subtypes: {}, sameRoad: [{ projectIds: ['P-1', 'P-2'], evidence: 'Same route and sum', confirmed: 'Test' }], candidateSameRoad: [], auditRoads: [] } });
  assert.equal(merged.roads.length, 1);
  assert.equal(merged.roads[0].id, 'NYM-R0001');
  assert.equal(merged.roads[0].confirmedGroup, true);
  assert.deepEqual(merged.retired, { 'NYM-R0002': 'NYM-R0001' });
});

test('road names drop the works description and keep a stated length', () => {
  assert.deepEqual(roadName('Road routine maintenance: Nyamatoki – Nyamasembe (3.1 km)'), { name: 'Nyamatoki – Nyamasembe', lengthKm: 3.1 });
  assert.deepEqual(roadName('Repair of Nyaobe bridge'), { name: 'Nyaobe bridge', lengthKm: null });
});
