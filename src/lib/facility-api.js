export function facilityApiRecords(facilities, wards, site) {
  if (!site) throw new Error('Facility API records require a configured site URL.');
  const wardBySlug = new Map(wards.map((ward) => [ward.slug, ward]));
  return facilities.map((facility) => {
    const ward = wardBySlug.get(facility.ward);
    if (!ward) throw new Error(`Facility ${facility.id} references unknown ward ${facility.ward}.`);
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
      capabilities: null,
      ward: { slug: ward.slug, name: ward.name, subCounty: ward.subCounty },
    };
  });
}
