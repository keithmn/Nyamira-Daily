// Every file the site publishes for reuse, in one list, so /data/ and datapackage.json never disagree (build brief 5.13)
import { COUNTIES } from '@kbe/engine/counties';
import { allSectors, allVotes } from './votes.js';

export function downloads() {
  return [
    { name: 'figures', path: '/api/national/figures.json', format: 'json', key: 'figures' },
    { name: 'sectors-2026-27', path: '/data/sectors-2026-27.csv', format: 'csv', key: 'sectors' },
    { name: 'county-equitable-share-2026-27', path: '/data/county-equitable-share-2026-27.csv', format: 'csv', key: 'counties' },
    { name: 'projects-2026-27', path: '/data/projects-2026-27.csv', format: 'csv', key: 'projects' },
    { name: 'spending-2025-26', path: '/data/spending-2025-26.csv', format: 'csv', key: 'spending' },
    ...allSectors().map((s) => ({ name: `sector-${s.slug}-2026-27`, path: `/data/sectors/${s.slug}-2026-27.csv`, format: 'csv', key: 'sector', slug: s.slug })),
  ];
}

// Files made per vote and per county: listed as a pattern on /data/, and one by one in datapackage.json
export const perVote = () => allVotes().map((v) => ({ name: `vote-${v.code}`, path: `/api/national/votes/${v.code}.json`, format: 'json' }));
export const perCounty = () => COUNTIES.map((c) => ({ name: `county-${c.slug}`, path: `/api/national/counties/${c.slug}.json`, format: 'json' }));

export const mediatype = (format) => (format === 'csv' ? 'text/csv' : 'application/json');
