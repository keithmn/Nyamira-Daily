// Site navigation, used by Base.astro.
// The primary bar shows the six sections; tapping one opens a list of everything in it: first the
// section's own page (`overview`, its title), then its pages, some with pages of their own.
// Labels are kept short for the lists; each section's index page keeps the longer titles and descriptions.
// Add a new page to its section's `pages` here so readers can reach it from the menu.
import { topics } from './data/topics.js';
import wards from './data/wards.json';
import { planned } from './config.js';

export const subCounties = ['Borabu', 'Kitutu Masaba', 'North Mugirango', 'West Mugirango'];
export const anchorFor = (name) => name.toLowerCase().split(' ').join('-');

// Data topics in their usual order, planned ones last (as on the Data page)
const dataPages = topics.map((t) => ({ href: `/data/${t.slug}/`, label: t.title }));

export const sections = [
  { href: '/', label: 'Today', overview: 'Nyamira at a glance', pages: [
    { href: '/alerts/', label: 'Alerts' },
    { href: '/number-of-the-week/', label: 'Number of the week' },
    { href: '/opportunities/', label: 'Opportunities' },
  ] },
  // Wards: the four constituencies; each opens to show its wards (decision #30)
  { href: '/ward/', label: 'Wards', overview: 'All 20 wards', pages: [{ href: '/maps/', label: 'Map' }, ...subCounties.map((s) => ({
    href: `/constituency/${anchorFor(s)}/`, label: `${s} Constituency`,
    pages: wards.filter((w) => w.subCounty === s).map((w) => ({ href: `/ward/${w.slug}/`, label: w.name })),
  }))] },
  { href: '/data/', label: 'Data', overview: 'Nyamira in numbers', pages: [...dataPages, { href: '/state-of-nyamira/', label: 'State of Nyamira' }] },
  { href: '/take-part/', label: 'Take part', overview: 'Take part', pages: [
    { href: '/ask/', label: 'Ask Nyamira' },
    { href: '/report/', label: 'Is it working?', pages: [{ href: '/report/clinic/', label: 'Clinic check' }] },
    { href: '/adopt/', label: 'Adopt a project' },
    { href: '/take-part/submission/', label: 'Submission helper' },
    { href: '/tools/budget-simulator/', label: 'Budget simulator' },
    { href: '/tools/what-it-builds/', label: 'What could it build?' },
    { href: '/have-your-say/', label: 'Have your say' },
    { href: '/diaspora/', label: 'For the diaspora' },
    { href: '/fellowship/', label: 'Fellowship' },
  ] },
  { href: '/stories/', label: 'Stories', overview: 'Stories from Nyamira', pages: [
    { href: '/stories/nyamira-since-2013/', label: 'Nyamira since 2013' },
    { href: '/whats-working/', label: "What's working" },
    { href: '/people/', label: "Nyamira's people" },
    { href: '/heritage/', label: 'Heritage' },
    { href: '/fact-check/', label: 'Myth or fact' },
    { href: '/explainers/', label: 'Explainers' },
  ] },
  { href: '/government/', label: 'Government', overview: 'How Nyamira is run', pages: [
    { href: '/government/whos-in-charge/', label: "Who's in charge?" },
    { href: '/government/leaders/', label: 'Leaders' },
    { href: '/government/elections/', label: 'Elections' },
    { href: '/government/executive/', label: 'The Executive' },
    { href: '/government/assembly/', label: 'The Assembly', pages: [
      { href: '/government/assembly/sittings/', label: 'Sittings' },
      { href: '/government/assembly/bills/', label: 'Bills and Acts' },
      { href: '/government/assembly/committees/', label: 'Committees' },
      { href: '/government/assembly/petitions/', label: 'Petitions and motions' },
      { href: '/government/assembly/mcas/', label: 'MCA pages' },
    ] },
    { href: '/government/watchdogs/', label: 'Watchdogs' },
  ] },
  // Learn includes the Constitution pages (decision #25: seven sections fit one row on phones)
  { href: '/learn/', label: 'Learn', overview: 'Learn how Nyamira works', pages: [
    { href: '/constitution/', label: 'The Constitution', pages: [
      { href: '/constitution/devolution/', label: 'Devolution', also: ['/constitution/article/'] },
      { href: '/constitution/fourth-schedule/', label: 'What the county must do' },
      { href: '/constitution/your-rights/', label: 'Your rights' },
      { href: '/constitution/county-laws/', label: 'County laws' },
    ] },
    { href: '/learn/how-it-works/', label: 'How the county works' },
    { href: '/learn/budget-calendar/', label: 'Budget calendar' },
    { href: '/learn/taking-part/', label: 'Taking part' },
    { href: '/learn/fees/', label: 'Fees you pay' },
    { href: '/learn/glossary/', label: 'Glossary' },
    { href: '/learn/episodes/', label: 'Show episodes' },
    { href: '/schools-programme/', label: 'Schools programme' },
  ] },
];

// Highlands colour for each section (brand kit v1.1, decision #31). Data sector pages set their own.
export const sectionTone = { Today: 'harvest', Wards: 'tea', Data: 'tea', 'Take part': 'dusk', Stories: 'earth', Government: 'rain', Learn: 'mist' };
export function toneFor(path) {
  if (path.startsWith('/alerts/')) return 'mist';
  if (path.startsWith('/projects/') || path.startsWith('/constituency/')) return 'tea';
  const s = sectionFor(path);
  return s ? sectionTone[s.label] : 'mist';
}

// aria-current for a menu entry on this page: "page" if it is this page, "true" if it contains it
// (a page listed under it, or an address it covers, like the articles under Devolution).
export function stateFor(item, path) {
  if (item.href === path) return 'page';
  if ((item.pages ?? []).some((p) => stateFor(p, path))) return 'true';
  if ((item.also ?? []).some((href) => path.startsWith(href))) return 'true';
  return undefined;
}

// The section a page belongs to: by its address, or because it is listed in the section
// (Opportunities and Have your say sit under Today).
export function sectionFor(path) {
  return sections.find((s) => (s.href === '/' ? path === '/' : path.startsWith(s.href)) || s.pages.some((p) => stateFor(p, path)));
}
