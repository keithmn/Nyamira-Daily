// Roads in the facility network (decision #55): the generated registry (scripts/build-roads.js)
// joined to its county records, audit findings and documents. Questions: road-questions.js.
import data from '../data/roads.json';
import wards from '../data/wards.json';
import { byProject, fyOrder, kindLabel, shortTitle, sources } from './projects.js';
import { audit, sources as auditSources } from './audit.js';
import { contractorOf, roadQuestions, statusText } from './road-questions.js';
import conditionRecords from '../data/road-conditions.json';
import { conditionsForRoad, latestRoadCondition, validateRoadConditions } from './road-conditions.js';

export const roads = data.roads;
export const retiredRoads = data.retired;
export const roadPath = (id) => `/road/${id.toLowerCase()}/`;
export const roadsForWard = (slug) => roads.filter((road) => road.wards.includes(slug));
export const wardName = (slug) => wards.find((w) => w.slug === slug)?.name ?? slug;
export const subtypeLabel = {
  road: 'Road',
  bridge: 'Bridge',
  'box culvert': 'Box culvert',
  'several roads in one budget line': 'Several roads in one budget line',
};

const recordsByProject = byProject();
const reviewedConditions = validateRoadConditions(conditionRecords, data.roads);
const findingsById = new Map(audit.findings.map((f) => [f.id, f]));

export const docOf = (record) => ({
  title: shortTitle(sources[record.sourceId].title),
  url: sources[record.sourceId].url,
  page: record.page,
});
export const findingDoc = (finding) => ({
  title: auditSources[finding.sourceId]?.title ?? 'Auditor-General report',
  url: auditSources[finding.sourceId]?.url,
  page: finding.page != null ? `p.${finding.page}` : '',
});

// Departments are shown as named, with "&" and "and" spellings treated as one.
const department = (name) => name.replace(/\s*&\s*/g, ' and ').replace(/\s*\(.*\)$/, '');

export function roadDetail(road) {
  const records = road.projectIds.flatMap((id) => recordsByProject.get(id) ?? [])
    .sort((a, b) => fyOrder.indexOf(a.fy) - fyOrder.indexOf(b.fy));
  const findings = road.auditIds.map((id) => findingsById.get(id));
  const latest = records.find((r) => r.status) ?? records[0] ?? null;
  const condition = latestRoadCondition(reviewedConditions, road.id);
  return {
    condition,
    conditionHistory: conditionsForRoad(reviewedConditions, road.id),
    records,
    findings,
    latest: latest && { fy: latest.fy, kind: kindLabel[latest.kind] ?? latest.kind, amount: latest.amount, status: statusText(latest.status) },
    departments: [...new Set(records.map((r) => department(r.department)))],
    contractors: [...new Set(records.map((r) => contractorOf(r.status)).filter(Boolean))],
    questions: roadQuestions({ road, records, findings, docOf, findingDoc, condition }),
  };
}
