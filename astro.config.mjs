import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { resolveSite } from './scripts/site-config.js';

const isBuild = process.argv.includes('build');
const site = resolveSite({ build: isBuild });
const root = fileURLToPath(new URL('.', import.meta.url));

// Nyamira Daily: a light, static, phone-first site.
export default defineConfig({
  site,
  // The county figure registry is read from the repo at build time (src/lib/county-registry.js)
  vite: { define: { __ND_ROOT__: JSON.stringify(root) } },
  trailingSlash: 'always',
  // Astro 7's default ('jsx') drops spaces between inline elements; keep the spacing the pages were written with
  compressHTML: true,
  build: { format: 'directory' },
  // Old data pages now live inside the sector pages (decision #30)
  redirects: {
    '/data/projects/': '/data/money/#projects',
    '/data/audit/': '/data/money/#audit',
    '/data/compare/': '/data/money/#compare',
    '/data/then-and-now/': '/community/nyamira-since-2013/',
    '/data/elections/': '/government/elections/',
    '/data/tea-milk/': '/data/farming/',
    '/data/schools/': '/data/education/',
    '/data/sub-locations/': '/community/people-and-places/#sub-locations',
    '/data/services/': '/community/people-and-places/#services',
    // Stories became Community, and People and places moved there from Data (decision #58)
    '/stories/': '/community/',
    '/stories/nyamira-since-2013/': '/community/nyamira-since-2013/',
    '/data/people/': '/community/people-and-places/',
    // Show episodes moved to Today as NY Watch, now a podcast (decision #63)
    '/learn/episodes/': '/ny-watch/',
    '/data/prices/': '/data/farming/',
    '/data/plans/': '/data/money/',
  },
});
