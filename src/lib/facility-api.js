import { latestFacilityCapabilities, observationsForFacility, validateFacilityObservations } from './facility-observations.js';

export function facilityApiRecords(facilities, wards, site, observations = []) {
  if (!site) throw new Error('Facility API records require a configured site URL.');
  const reviewedObservations = validateFacilityObservations(observations, facilities);
  const wardBySlug = new Map(wards.map((ward) => [ward.slug, ward]));
  return facilities.map((facility) => {
    const ward = wardBySlug.get(facility.ward);
    if (!ward) throw new Error(`Facility ${facility.id} references unknown ward ${facility.ward}.`);
    const capabilities = latestFacilityCapabilities(reviewedObservations, facility.id);
    return {
      id: facility.id,
      profileUrl: new URL(`/facility/${facility.id.toLowerCase()}/`, site).toString(),
      name: facility.name,
      category: facility.category,
      subtype: facility.subtype,
      level: facility.level,
      owner: facility.owner,
      source: facility.source,
      sourceRef: facility.sourceRef,
      sourceDate: null,
      observationDate: null,
      evidence: facility.evidence,
      evidenceNote: facility.evidenceNote,
      capabilities: capabilities.length ? capabilities : null,
      history: observationsForFacility(reviewedObservations, facility.id),
      ward: { slug: ward.slug, name: ward.name, subCounty: ward.subCounty },
    };
  });
}
