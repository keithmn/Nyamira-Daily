import wardRecords from './wards.json' with { type: 'json' };
import facilities from './facilities.json' with { type: 'json' };
import wardPlaces from './ward-places.json' with { type: 'json' };
import { resolveWards } from '../lib/facility-registry.js';

export { facilities, wardRecords };

const resolved = resolveWards(wardRecords, facilities);

// Attach named places (trading centres, markets, etc.) from the extracted ward-places registry.
const placesByWard = new Map(wardRecords.map((w) => [w.slug, []]));
for (const p of wardPlaces) {
  const list = placesByWard.get(p.ward);
  if (list) list.push(p);
}
const wards = resolved.map((w) => ({ ...w, places: placesByWard.get(w.slug) ?? [] }));

export default wards;
