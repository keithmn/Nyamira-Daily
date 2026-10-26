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

  const wardSlugs = new Set();
  const referencedIds = new Set();
  const resolvedWards = wards.map((ward) => {
    if (!ward.slug || wardSlugs.has(ward.slug)) {
      throw new Error(`Ward registry has a missing or duplicate slug: ${ward.slug ?? '(missing)'}`);
    }
    wardSlugs.add(ward.slug);
    if (!Array.isArray(ward.facilityIds)) {
      throw new Error(`Ward ${ward.slug} must list facilityIds.`);
    }

    const wardFacilities = ward.facilityIds.map((id) => {
      if (referencedIds.has(id)) {
        throw new Error(`Facility ${id} is referenced more than once.`);
      }
      const facility = facilityById.get(id);
      if (!facility) {
        throw new Error(`Ward ${ward.slug} references unknown facility ${id}.`);
      }
      if (facility.ward !== ward.slug) {
        throw new Error(`Facility ${id} belongs to ${facility.ward}, not ${ward.slug}.`);
      }
      referencedIds.add(id);
      return facility;
    });

    const counts = {};
    for (const facility of wardFacilities) {
      counts[facility.category] = (counts[facility.category] ?? 0) + 1;
    }
    return { ...ward, facilities: wardFacilities, counts };
  });

  const orphaned = records.find((facility) => !referencedIds.has(facility.id));
  if (orphaned) {
    throw new Error(`Facility ${orphaned.id} is not referenced by a ward.`);
  }
  return resolvedWards;
}
