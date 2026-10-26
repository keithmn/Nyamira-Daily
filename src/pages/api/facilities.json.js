import wards, { facilities } from '../../data/wards.js';
import observationRecords from '../../data/facility-observations.json';
import { facilityApiRecords } from '../../lib/facility-api.js';
import { json } from '../../lib/api.js';

export function GET({ site }) {
  return json({
    description: 'Currently listed facility records with stable profile URLs. The inventory is incomplete. Empty capabilities and history mean no dated, editor-reviewed observations are published; unknown never means unavailable. Candidate coordinates are omitted pending review.',
    facilities: facilityApiRecords(facilities, wards, site, observationRecords),
  }, site);
}
