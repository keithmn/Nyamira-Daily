const statuses = new Set(['reported-available', 'reported-unavailable', 'unknown']);
const evidenceKinds = new Set(['verified', 'audit', 'official', 'unverified']);

export function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function isUtcTimestamp(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString().replace(/\.000Z$/, 'Z') === value.replace(/\.000Z$/, 'Z');
}

function compareHistory(a, b) {
  return b.observedOn.localeCompare(a.observedOn)
    || b.publishedAt.localeCompare(a.publishedAt)
    || a.id.localeCompare(b.id);
}

function capabilityKey(value) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

export function validateFacilityObservations(records, facilities) {
  if (!Array.isArray(records)) throw new Error('Facility observations must be an array.');
  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));
  const seenIds = new Set();

  for (const observation of records) {
    if (!observation || typeof observation !== 'object' || Array.isArray(observation)) {
      throw new Error('Facility observations must be objects.');
    }
    for (const field of ['id', 'facilityId', 'category', 'capability', 'scope', 'source', 'sourceRef']) {
      if (typeof observation[field] !== 'string' || !observation[field].trim()) {
        throw new Error(`Facility observation ${observation.id ?? '(missing ID)'} requires ${field}.`);
      }
    }
    if (seenIds.has(observation.id)) throw new Error(`Duplicate facility observation ID: ${observation.id}.`);
    seenIds.add(observation.id);

    const facility = facilityById.get(observation.facilityId);
    if (!facility) throw new Error(`Facility observation ${observation.id} references unknown facility ${observation.facilityId}.`);
    if (observation.category !== facility.category) {
      throw new Error(`Facility observation ${observation.id} category does not match facility ${facility.id}.`);
    }
    if (!statuses.has(observation.status)) {
      throw new Error(`Facility observation ${observation.id} has an unsupported status.`);
    }
    if (!evidenceKinds.has(observation.evidence)) {
      throw new Error(`Facility observation ${observation.id} has an unsupported evidence label.`);
    }
    if (!isDateOnly(observation.observedOn)) {
      throw new Error(`Facility observation ${observation.id} requires a valid observedOn date (YYYY-MM-DD).`);
    }
    if (!isUtcTimestamp(observation.reviewedAt) || !isUtcTimestamp(observation.publishedAt)) {
      throw new Error(`Facility observation ${observation.id} requires UTC reviewedAt and publishedAt timestamps.`);
    }
    if (Date.parse(observation.reviewedAt) > Date.parse(observation.publishedAt)) {
      throw new Error(`Facility observation ${observation.id} cannot be published before review.`);
    }
    if (observation.observedOn > observation.publishedAt.slice(0, 10)) {
      throw new Error(`Facility observation ${observation.id} cannot be published before its observation date.`);
    }
  }

  return [...records].sort(compareHistory);
}

export function observationsForFacility(records, facilityId) {
  return records.filter((record) => record.facilityId === facilityId).sort(compareHistory);
}

export function latestFacilityCapabilities(records, facilityId) {
  const grouped = new Map();
  for (const observation of records) {
    if (observation.facilityId !== facilityId) continue;
    const key = `${observation.category}\u0000${capabilityKey(observation.capability)}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(observation);
  }

  return [...grouped.values()].map((history) => {
    history.sort(compareHistory);
    const observedOn = history[0].observedOn;
    const latestObservations = history.filter((observation) => observation.observedOn === observedOn);
    const latestStatuses = new Set(latestObservations.map((observation) => observation.status));
    const capability = [...history].map((observation) => observation.capability).sort((a, b) => a.localeCompare(b, 'en'))[0];
    return {
      category: latestObservations[0].category,
      capability,
      observedOn,
      status: latestStatuses.size === 1 ? latestObservations[0].status : 'unknown',
      conflict: latestStatuses.size > 1,
      observations: latestObservations,
    };
  }).sort((a, b) => a.category.localeCompare(b.category, 'en') || capabilityKey(a.capability).localeCompare(capabilityKey(b.capability), 'en'));
}
