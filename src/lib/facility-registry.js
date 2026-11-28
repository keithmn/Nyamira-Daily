// Derive each ward's facility list from the ward field on each facility record.
// Before the flattening (decision #130), wards.json carried facilityIds[]; now facilities.json
// is the single source and this function groups them by ward at build time.
export function resolveWards(wards, records) {
  const facilityById = new Map();
  for (const facility of records) {
    if (!facility.id || facilityById.has(facility.id)) {
      throw new Error(`Facility registry has a missing or duplicate ID: ${facility.id ?? '(missing)'}`);
    }
    if (!facility.name || !facility.category || !facility.subtype || !facility.source || !facility.evidence) {
      throw new Error(`Facility ${facility.id} is missing required identity or evidence fields.`);
    }
    facilityById.set(facility.id, facility);
  }

  const wardSlugs = new Set(wards.map((w) => w.slug));
  const byWard = new Map(wards.map((w) => [w.slug, []]));

  for (const facility of records) {
    if (!facility.ward || !wardSlugs.has(facility.ward)) {
      throw new Error(`Facility ${facility.id} names unknown ward "${facility.ward}".`);
    }
    byWard.get(facility.ward).push(facility);
  }

  const resolvedWards = wards.map((ward) => {
    if (!ward.slug) {
      throw new Error(`Ward registry has a missing slug.`);
    }
    const wardFacilities = byWard.get(ward.slug);
    const counts = {};
    for (const facility of wardFacilities) {
      counts[facility.category] = (counts[facility.category] ?? 0) + 1;
    }
    return { ...ward, facilities: wardFacilities, counts };
  });

  return resolvedWards;
}
