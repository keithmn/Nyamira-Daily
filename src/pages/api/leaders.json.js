// Popolo-compliant leaders endpoint.
// Spec: https://www.popoloproject.com/specs/
// Maps Nyamira Daily's leaders.json to Popolo persons, organizations and memberships.
import L from '../../data/leaders.json' with { type: 'json' };
import { json } from '../../lib/api.js';

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

function personFromEntry(entry, area) {
  const id = `person/${slugify(entry.name)}`;
  return {
    id,
    name: entry.name,
    role: entry.office,
    area: area || null,
    source: entry.src || null,
    since: entry.since || null,
    note: entry.note || null,
  };
}

function membershipFromEntry(entry, personId, orgId) {
  return {
    person_id: personId,
    organization_id: orgId,
    role: entry.office,
    start_date: entry.since || null,
    on_behalf_of: entry.party || null,
  };
}

export function GET({ site }) {
  const persons = [];
  const memberships = [];
  const organizations = [
    { id: 'org/county-executive', name: 'Nyamira County Executive', classification: 'executive' },
    { id: 'org/county-assembly', name: 'Nyamira County Assembly', classification: 'legislature' },
    { id: 'org/national-assembly', name: 'National Assembly (Nyamira constituencies)', classification: 'legislature' },
    { id: 'org/senate', name: 'Senate (Nyamira)', classification: 'legislature' },
  ];

  for (const entry of L.county) {
    const person = personFromEntry(entry, 'Nyamira County');
    persons.push(person);
    const orgId = entry.office.includes('Speaker') || entry.office.includes('Assembly')
      ? 'org/county-assembly' : 'org/county-executive';
    memberships.push(membershipFromEntry(entry, person.id, orgId));
  }

  for (const entry of L.national) {
    const person = personFromEntry(entry, 'Nyamira County');
    persons.push(person);
    const orgId = entry.office === 'Senator' || entry.office === 'Woman Representative'
      ? 'org/senate' : 'org/national-assembly';
    memberships.push(membershipFromEntry(entry, person.id, orgId));
  }

  for (const [ward, mca] of Object.entries(L.mcas)) {
    const entry = { office: `MCA, ${ward}`, name: mca.name, party: mca.party, since: mca.since, src: mca.src || L.mcaSource, note: mca.note || null };
    const person = personFromEntry(entry, `${ward} ward`);
    persons.push(person);
    memberships.push(membershipFromEntry(entry, person.id, 'org/county-assembly'));
  }

  return json({
    description: 'Nyamira County leaders in Popolo format (https://www.popoloproject.com/specs/). Persons, organizations and memberships for the county executive, county assembly (including 20 ward MCAs), constituency MPs and senator. Party affiliations are as gazetted; the MCA roster is not fully verified (see mcaGazetteChecked).',
    standard: 'Popolo (https://www.popoloproject.com/)',
    updated: L.updated,
    mcaGazetteChecked: L.mcaGazetteChecked,
    persons,
    organizations,
    memberships,
  }, site);
}
