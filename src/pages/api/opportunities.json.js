import O from '../../data/opportunities.json';
import { json } from '../../lib/api.js';
import { opportunitiesAt } from '../../lib/opportunity-status.js';
import { publicationTime } from '../../lib/publication.js';
export function GET({ site }) {
  const evaluatedAt = publicationTime;
  const items = opportunitiesAt(O.items, evaluatedAt);
  const availabilityCounts = Object.fromEntries(
    ['open', 'closed', 'cancelled', 'deadline_unknown', 'unknown'].map((state) => [
      state,
      items.filter((item) => item.availability === state).length,
    ]),
  );
  return json({
    description: 'County jobs, tenders, bursaries and programmes, each with its official notice (url). availabilityCounts and item availability are calculated at evaluatedAt in Nairobi time; deadline_unknown and cancelled are not open. Always confirm with the office named.',
    ...O,
    evaluatedAt: evaluatedAt.toISOString(),
    availabilityCounts,
    items,
  }, site);
}
