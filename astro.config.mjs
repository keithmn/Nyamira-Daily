import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { resolveSite } from './scripts/site-config.js';
import refocusRedirects from './redirects.json' with { type: 'json' };

// Pages removed by the refocus (decision #110, phase R2) redirect to their closest page (redirects.json).
// Older redirects that pointed at a removed page follow it to the same place, so there are no chains.
function withRefocus(old) {
  const out = {};
  for (const [from, to] of Object.entries(old)) {
    const [path, hash] = to.split('#');
    out[from] = refocusRedirects[path] ? refocusRedirects[path] + (hash && !refocusRedirects[path].includes('#') ? '#' + hash : '') : to;
  }
  return { ...out, ...refocusRedirects };
}

const isBuild = process.argv.includes('build');
const site = resolveSite({ build: isBuild });
const root = fileURLToPath(new URL('.', import.meta.url));

// Nyamira Daily: a light, static, phone-first site.
export default defineConfig({
  site,
  integrations: [sitemap({ filter: (page) => !page.includes('/review/') })],
  // The county figure registry is read from the repo at build time (src/lib/county-registry.js)
  vite: {
    define: { __ND_ROOT__: JSON.stringify(root) },
    server: { allowedHosts: true },
  },
  trailingSlash: 'always',
  // Astro 7's default ('jsx') drops spaces between inline elements; keep the spacing the pages were written with
  compressHTML: true,
  build: { format: 'directory' },
  // Old data pages now live inside the sector pages (decision #30)
  redirects: withRefocus({
    '/data/projects/': '/money/#projects',
    '/data/audit/': '/money/#audit',
    '/data/compare/': '/money/#compare',
    '/data/then-and-now/': '/community/nyamira-since-2013/',
    '/data/elections/': '/government/elections/',
    '/data/tea-milk/': '/money/farming/',
    '/data/schools/': '/map/education/',
    '/data/sub-locations/': '/community/people-and-places/#sub-locations',
    '/data/services/': '/community/people-and-places/#services',
    // Stories became Community, and People and places moved there from Data (decision #58)
    '/stories/': '/community/',
    '/stories/nyamira-since-2013/': '/community/nyamira-since-2013/',
    '/data/people/': '/community/people-and-places/',
    // Show episodes moved to Today as NY Watch, now a podcast (decision #63)
    '/learn/episodes/': '/ny-watch/',
    '/data/prices/': '/money/farming/',
    '/data/plans/': '/money/',
  }),
});
