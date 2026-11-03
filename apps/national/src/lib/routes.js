// The five sections and every route they link to (SITEMAP.md). Links work under any domain or prefix, because each one
// goes through `href`. `PLANNED` lists routes nothing has built yet; a page leaves it in the phase that builds it, and
// the link check fails on any internal link that is neither built nor planned.
const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const LANGS = ['en', 'sw'];
export const FY_PATH = '2026-27';
export const YEAR = `/budget/${FY_PATH}/`;

export const SECTIONS = [
  { key: 'budget', path: YEAR, icon: 'money', pages: ['/budget/', '/revenue/', '/debt/'] },
  { key: 'counties', path: '/counties/', icon: 'map', pages: ['/counties/', '/counties/compare/'] },
  { key: 'track', path: '/track/', icon: 'chart', pages: ['/track/', '/projects/', '/have-your-say/'] },
  { key: 'learn', path: '/learn/', icon: 'learn', pages: ['/learn/', '/infographics/', '/learn/glossary/', '/learn/calendar/', '/tools/your-taxes/'] },
  { key: 'data', path: '/data/', icon: 'data', pages: ['/data/', '/data/releases/', '/methods/', '/corrections/'] },
];

export const TRUST = ['/about/', '/who-runs-us/', '/privacy/', '/terms/', '/right-of-reply/'];

const BUILT = ['/budget/', '/counties/', '/counties/compare/', '/revenue/', '/debt/', '/projects/', '/have-your-say/', '/tools/your-taxes/', '/learn/calendar/', '/learn/', '/learn/glossary/', '/infographics/', '/data/', '/data/releases/', '/methods/', '/corrections/'];
export const PLANNED = SECTIONS.flatMap((s) => s.pages).concat(TRUST).filter((p) => !BUILT.includes(p));

export const href = (lang, path = '/') => `${BASE}${lang === 'sw' ? '/sw' : ''}${path}`;
export const countyHref = (lang, slug) => href(lang, `/counties/${slug}/`);
export const sectorHref = (lang, slug) => href(lang, `${YEAR}sectors/${slug}/`);
export const voteHref = (lang, code) => href(lang, `${YEAR}votes/${code}/`);
export const programmeHref = (lang, vote, code) => href(lang, `${YEAR}votes/${vote}/${code}/`);
export const other = (lang) => (lang === 'en' ? 'sw' : 'en');

// The same page in the other language: every route has a twin under /sw/ (SITEMAP.md)
export const twin = (lang, path) => href(other(lang), path);

// The section a path belongs to, for aria-current
export const sectionOf = (path) => SECTIONS.find((s) => s.pages.some((p) => path === p || (p !== '/' && path.startsWith(p))))?.key ?? null;

export const isPlanned = (path) => PLANNED.includes(path.replace(/^\/sw(?=\/)/, ''));
