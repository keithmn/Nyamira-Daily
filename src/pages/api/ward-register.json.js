import register from '../../data/ward-register.json' with { type: 'json' };
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: 'The IEBC ward register for the Gusii counties: every county assembly ward in Kisii and Nyamira, with its constituency, IEBC codes and registered voters for the 2022 General Election.', ...register }, site);
}
