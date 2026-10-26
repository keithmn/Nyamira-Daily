import wards, { facilities } from '../../data/wards.js';
import { facilityApiRecords } from '../../lib/facility-api.js';
import { json } from '../../lib/api.js';

export function GET({ site }) {
  return json({
    description: 'Currently listed facility records with stable profile URLs. The inventory is incomplete. Null sourceDate, observationDate and capabilities mean unknown or not recorded, not none; candidate coordinates are omitted pending review.',
    facilities: facilityApiRecords(facilities, wards, site),
  }, site);
}
