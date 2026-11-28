// One place model (decision #110, phase R3): every facility, road and county project is a place, with one
// address, /place/<id>/. A county project is a place being built; a road is a place you travel on.
//
// Two kinds of data meet here:
// - static: what the documents say (the facility lists, the county's project and road records). Never edited.
// - living: dated events in src/data/living/events.json (a visit, a resident's report, a new document). Each change
//   is a new event; the current state is the latest *reviewed* event for that place and field. Phase R4 fills the
//   file from KoboToolbox and Google Sheets.
import { facilities } from '../data/wards.js';
import wards from '../data/wards.json' with { type: 'json' };
import { roads } from './roads.js';
import { byProject, statusShort, sources } from './projects.js';
import events from '../data/living/events.json' with { type: 'json' };

export const placePath = (id) => `/place/${id.toLowerCase()}/`;
const wardName = (slug) => wards.find((w) => w.slug === slug)?.name ?? slug;

// The Constitution's Fourth Schedule, Part 2 (src/data/constitution.json): the county's functions, by item number.
const county = (item, what) => ({ who: 'Nyamira County Government', why: `${what} is a county function (Constitution, Fourth Schedule, Part 2, item ${item}).` });
const NOT_ESTABLISHED = { who: null, why: 'We have not yet established who is responsible for this place.' };
const privately = (owner) => /private|company|christian|catholic|episcopal|church|mission/i.test(owner ?? '');

export function responsibleFor(place) {
  if (place.kind === 'road') return county(5, 'County roads');
  if (place.kind === 'project') return { who: 'Nyamira County Government', why: 'The county planned or paid for this work, as its own documents show.' };
  const f = place.facility;
  if (privately(f.owner)) return { who: f.owner, why: 'The listing names a private or faith-based owner.' };
  switch (f.category) {
    case 'Health': return county(2, 'County health services, including county health facilities,');
    case 'Market': return county(7, 'Trade development, including markets,');
    case 'Agriculture': return county(1, 'Agriculture');
    case 'Water': return county(11, 'County public works and services, including water and sanitation,');
    case 'Education': {
      if (/pre-?primary|ecde|nursery|polytechnic/i.test(f.subtype ?? '')) return county(9, 'Pre-primary education and village polytechnics');
      if (/primary|secondary/i.test(f.subtype ?? '')) return { who: 'The national government (Ministry of Education)', why: 'Primary and secondary schools are not on the county\'s list in the Fourth Schedule, Part 2; pre-primary education is (item 9).' };
      return NOT_ESTABLISHED;
    }
    case 'Worship': return { who: 'Its religious community', why: 'A place of worship is run by its own community.' };
    default: return NOT_ESTABLISHED;
  }
}

// Static records -> places
const facilityPlaces = facilities.map((f) => ({
  id: f.id.toLowerCase(), code: f.id, kind: 'facility', name: f.name, type: f.category, subtype: f.subtype,
  wards: [f.ward], owner: f.owner ?? null, coordinates: f.coordinates ?? null, evidence: f.evidence, facility: f,
}));
const roadPlaces = roads.map((r) => ({
  id: r.id.toLowerCase(), code: r.id, kind: 'road', name: r.name, type: 'Road', subtype: r.subtype,
  wards: r.wards, owner: null, coordinates: null, evidence: 'official', road: r,
}));
const roadOfProject = new Map(roads.flatMap((r) => r.projectIds.map((pid) => [pid, r])));
const projectPlaces = [...byProject().entries()].map(([pid, list]) => ({
  id: pid.toLowerCase(), code: pid, kind: 'project', name: list[0].name, type: 'County project', subtype: list[0].department,
  wards: list[0].ward ? [list[0].ward] : [], owner: 'Nyamira County Government', coordinates: null, evidence: 'official',
  records: list, partOf: roadOfProject.get(pid) ? { id: roadOfProject.get(pid).id.toLowerCase(), name: roadOfProject.get(pid).name } : null,
}));
export const places = [...facilityPlaces, ...roadPlaces, ...projectPlaces];
export const placeById = new Map(places.map((p) => [p.id, p]));
export const placesInWard = (slug) => places.filter((p) => p.wards.includes(slug));

// Living events
export const FIELDS = ['status', 'condition'];
export const statusLabel = { open: 'Open', closed: 'Closed', 'under-construction': 'Under construction', stalled: 'Stalled', unknown: 'Not yet checked' };
export const conditionLabel = { good: 'Good', fair: 'Fair', poor: 'Poor', impassable: 'Impassable (roads)', unknown: 'Not yet checked' };
const METHODS = new Set(['visit', 'resident-report', 'document']);

const ALERT_STATUSES = new Set(['active', 'monitoring', 'resolved']);
export function validateEvents(list) {
  for (const [i, e] of list.entries()) {
    const at = `living event ${i}`;
    const isAlert = String(e.place).startsWith('alert:');
    if (!isAlert && !placeById.has(String(e.place).toLowerCase())) throw new Error(`${at}: unknown place ${e.place}`);
    if (isAlert && e.field !== 'status') throw new Error(`${at}: alert events only support the status field`);
    if (!isAlert && !/^(status|condition|service:.+)$/.test(e.field)) throw new Error(`${at}: unknown field ${e.field}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.observed_on)) throw new Error(`${at}: observed_on must be YYYY-MM-DD`);
    if (!METHODS.has(e.method)) throw new Error(`${at}: method must be visit, resident-report or document`);
    if (!e.source) throw new Error(`${at}: a source is required`);
    if (!['verified', 'audit', 'official', 'unverified'].includes(e.evidence)) throw new Error(`${at}: unknown evidence label`);
    if (isAlert && !ALERT_STATUSES.has(e.value)) throw new Error(`${at}: unknown alert status ${e.value}`);
    if (!isAlert && e.field === 'status' && !statusLabel[e.value]) throw new Error(`${at}: unknown status ${e.value}`);
    if (e.field === 'condition' && !conditionLabel[e.value]) throw new Error(`${at}: unknown condition ${e.value}`);
  }
  return list;
}
const reviewed = validateEvents(events).filter((e) => e.reviewed_by);
export const historyOf = (id) => reviewed.filter((e) => e.place.toLowerCase() === id).sort((a, b) => b.observed_on.localeCompare(a.observed_on));

// The current state of a place: the latest reviewed event per field. A county project with no event shows the
// status the county's own latest report gives, labelled as the county's claim.
export function currentState(place) {
  const h = historyOf(place.id);
  const latest = (field) => h.find((e) => e.field === field) ?? null;
  const state = {};
  for (const field of FIELDS) state[field] = latest(field);
  if (!state.status && place.kind === 'project') {
    const withStatus = place.records.find((r) => statusShort(r.status));
    if (withStatus) {
      const src = sources[withStatus.sourceId];
      state.status = { field: 'status', text: statusShort(withStatus.status), method: 'document', evidence: 'official', observed_on: null, source: src?.title ?? withStatus.sourceId, fy: withStatus.fy };
    }
  }
  state.services = h.filter((e) => e.field.startsWith('service:'));
  state.lastChecked = h.find((e) => e.method === 'visit')?.observed_on ?? null;
  return state;
}
// Alert status events (alert:<id> in the living events log)
export const alertEvents = reviewed.filter((e) => e.place.startsWith('alert:'));
export { wardName };
