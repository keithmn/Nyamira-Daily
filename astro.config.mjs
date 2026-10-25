import { defineConfig } from 'astro/config';

// Nyamira Daily: a light, static, phone-first site.
export default defineConfig({
  site: 'https://nyamiradaily.example', // replace with the real domain
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Old data pages now live inside the sector pages (decision #30)
  redirects: {
    '/data/projects/': '/data/money/#projects',
    '/data/audit/': '/data/money/#audit',
    '/data/compare/': '/data/money/#compare',
    '/data/then-and-now/': '/stories/nyamira-since-2013/',
    '/data/elections/': '/government/elections/',
    '/data/tea-milk/': '/data/farming/',
    '/data/schools/': '/data/education/',
    '/data/sub-locations/': '/data/people/#sub-locations',
    '/data/services/': '/data/people/#services',
    '/data/prices/': '/data/farming/',
    '/data/plans/': '/data/money/',
  },
});
