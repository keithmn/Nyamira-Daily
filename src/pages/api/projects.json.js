import W from '../../data/wardspend.json';
import { json } from '../../lib/api.js';
export function GET({ site }) {
  return json({ description: "County projects by ward from the county's own plans and budgets and the Controller of Budget. Each record carries sourceId and page; sources are listed below. A budget line is planned money, not proof that work was done.", ...W }, site);
}
