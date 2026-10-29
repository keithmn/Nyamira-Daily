// Builds src/data/roads.json: one record per road or road structure named in the county's
// road-works records (wardspend.json) or in an Auditor-General finding, using the reviewed
// classification in data-src/road-identities.json. Existing road IDs are kept; records are
// grouped into one road only through the reviewed sameRoad list.
//   node scripts/build-roads.js --write | --check
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const outputPath = fileURLToPath(new URL('../src/data/roads.json', import.meta.url));
const fyOrder = ['2025/26', 'as at 30 Jun 2025', '2024/25', '2023/24', '2022/23'];
const namePrefixes = [
  'Road routine maintenance: ', 'Routine maintenance of the ', 'Routine maintenance of ', 'Road maintenance of ',
  'Grading & gravelling of ', 'Grading and Gravelling ', 'Grading & Murraming ', 'Opening and Grading of ',
  'Construction of ', 'Repair of ', 'Completion of ',
];

export function isRoadWorks(project) {
  return /^Roads, Transport/.test(project.department || '');
}

// "Road routine maintenance: A – B (3.1 km)" → { name: "A – B", lengthKm: 3.1 }
export function roadName(sourceName) {
  let name = sourceName.trim();
  const prefix = namePrefixes.find((p) => name.toLowerCase().startsWith(p.toLowerCase()));
  if (prefix) name = name.slice(prefix.length);
  const length = name.match(/\s*\((\d+(?:\.\d+)?)\s*km\)\s*$/i);
  if (length) name = name.slice(0, length.index);
  name = name.trim();
  return { name: name.charAt(0).toUpperCase() + name.slice(1), lengthKm: length ? Number(length[1]) : null };
}

export function buildRoads({ projects, findings, identities, existing = { roads: [], retired: {} }, wardOrder }) {
  const records = new Map();
  for (const project of projects) {
    (records.get(project.projectId) ?? records.set(project.projectId, []).get(project.projectId)).push(project);
  }
  for (const list of records.values()) list.sort((a, b) => fyOrder.indexOf(a.fy) - fyOrder.indexOf(b.fy));

  const reviewed = [...Object.keys(identities.notRoads), ...Object.keys(identities.subtypes),
    ...identities.sameRoad.flatMap((g) => g.projectIds), ...identities.candidateSameRoad.flatMap((c) => c.projectIds)];
  for (const group of identities.sameRoad) {
    if (!group.evidence || !group.confirmed) throw new Error(`Road group ${group.projectIds.join('+')} needs its evidence and who confirmed it.`);
  }
  for (const id of reviewed) if (!records.has(id)) throw new Error(`Road identity file names unknown project ${id}.`);
  const findingIds = new Set(findings.map((f) => f.id));
  for (const road of identities.auditRoads) {
    for (const id of road.auditIds) if (!findingIds.has(id)) throw new Error(`Audit road ${road.key} names unknown finding ${id}.`);
  }

  const roadProjectIds = [...records.keys()].filter((id) =>
    records.get(id).some(isRoadWorks) && !(id in identities.notRoads));
  const grouped = new Set(identities.sameRoad.flatMap((g) => g.projectIds));
  const groups = [
    ...identities.sameRoad.map((g) => [...g.projectIds].sort()),
    ...roadProjectIds.filter((id) => !grouped.has(id)).map((id) => [id]),
  ];

  const built = groups.map((ids) => {
    const list = ids.flatMap((id) => records.get(id)).sort((a, b) => fyOrder.indexOf(a.fy) - fyOrder.indexOf(b.fy));
    const { name, lengthKm } = roadName(list[0].name);
    const withLength = list.map((p) => roadName(p.name).lengthKm).find((km) => km != null) ?? lengthKm;
    return {
      key: ids.join('+'),
      name,
      subtype: ids.map((id) => identities.subtypes[id]).find(Boolean) ?? 'road',
      wards: [...new Set(list.map((p) => p.ward).filter(Boolean))],
      projectIds: ids,
      auditIds: [],
      lengthKm: withLength ?? null,
      confirmedGroup: ids.length > 1,
    };
  });
  for (const road of identities.auditRoads) {
    built.push({ key: road.key, name: road.name, subtype: 'road', wards: road.ward ? [road.ward] : [],
      projectIds: [], auditIds: road.auditIds, lengthKm: null, confirmedGroup: false });
  }

  // Keep every existing ID. A newly confirmed group keeps the lowest ID of the roads it absorbs;
  // the others are retired and redirect to it.
  const idByKey = new Map(existing.roads.map((r) => [r.key, r.id]));
  const retired = { ...(existing.retired || {}) };
  let next = Math.max(0, ...existing.roads.map((r) => Number(r.id.slice(5))), ...Object.keys(retired).map((id) => Number(id.slice(5)))) + 1;
  const wardRank = (road) => (road.wards.length ? wardOrder.indexOf(road.wards[0]) : wardOrder.length);
  const ordered = [...built].sort((a, b) => wardRank(a) - wardRank(b) || a.name.localeCompare(b.name, 'en'));
  for (const road of ordered) {
    if (idByKey.has(road.key)) { road.id = idByKey.get(road.key); continue; }
    const absorbed = existing.roads.filter((r) => r.projectIds.length && r.projectIds.every((id) => road.projectIds.includes(id)))
      .map((r) => r.id).sort();
    if (absorbed.length) {
      road.id = absorbed[0];
      for (const old of absorbed.slice(1)) retired[old] = road.id;
    } else {
      road.id = `NYM-R${String(next++).padStart(4, '0')}`;
    }
  }
  const ids = new Set();
  for (const road of built) {
    if (ids.has(road.id)) throw new Error(`Duplicate road ID ${road.id}.`);
    ids.add(road.id);
  }
  const roads = built.sort((a, b) => a.id.localeCompare(b.id))
    .map(({ id, key, name, subtype, wards, projectIds, auditIds, lengthKm, confirmedGroup }) =>
      ({ id, key, name, subtype, wards, projectIds, auditIds, lengthKm, confirmedGroup }));
  return { generated: 'scripts/build-roads.js from data-src/road-identities.json; do not edit by hand', roads, retired };
}

export function renderRoads(existing) {
  const data = require('../src/data/wardspend.json');
  return `${JSON.stringify(buildRoads({
    projects: data.projects,
    findings: require('../src/data/audit.json').findings,
    identities: require('../data-src/road-identities.json'),
    existing,
    wardOrder: require('../src/data/wards.json').map((w) => w.slug),
  }), null, 2)}\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : null;
  const output = renderRoads(current ? JSON.parse(current) : undefined);
  const mode = process.argv[2] ?? '--write';
  if (mode === '--check') {
    if (current !== output) throw new Error('roads.json is out of date; run node scripts/build-roads.js --write.');
  } else if (mode === '--write') {
    fs.writeFileSync(outputPath, output);
  } else {
    throw new Error('Usage: node scripts/build-roads.js [--check|--write]');
  }
}
