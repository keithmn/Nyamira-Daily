// Site navigation, used by Base.astro.
// Seven sections. On desktop each opens a mega menu of cards; on phones the hamburger sheet lists them all
// (src/components/SiteHeader.astro). Section pages also get a secondary bar of their pages (SectionTabs.astro).
// Labels are kept short for the lists; each section's index page keeps the longer titles and descriptions.
// Add a new page to its section's `pages` here so readers can reach it from the menu.
import { topics } from './data/topics.js';
import wards from './data/wards.json';
import { planned } from './config.js';

export const subCounties = ['Borabu', 'Kitutu Masaba', 'North Mugirango', 'West Mugirango'];
export const anchorFor = (name) => name.toLowerCase().split(' ').join('-');

// Data sectors in their usual order (People and places moved to Community, decision #58)
const dataIcon = { money: 'money', health: 'health', education: 'education', farming: 'farming', 'open-data': 'data' };
const dataDesc = {
  money: 'Budgets, spending, audits and projects',
  health: 'Mothers, children and clinics',
  education: 'Schools, learners and exams',
  farming: 'Tea bonuses and farm spending',
  'open-data': 'Download every table',
};
const dataPages = topics.map((t) => ({ href: `/data/${t.slug}/`, label: t.title, icon: dataIcon[t.slug], desc: dataDesc[t.slug],
  also: t.slug === 'money' ? ['/projects/'] : undefined }));

// Each section: `overview` names its own page, `desc` introduces it in the menu, `icon` is from
// src/lib/icons.js. Each page has a short `desc` for the menu cards; pages can hold pages of their own.
export const sections = [
  { href: '/', label: 'Today', icon: 'today', overview: 'Nyamira at a glance',
    desc: "What's new in Nyamira: alerts, the number of the week and open opportunities.", pages: [
    { href: '/alerts/', label: 'Alerts', icon: 'alert', desc: 'Emergencies and disruptions by ward' },
    { href: '/number-of-the-week/', label: 'Number of the week', icon: 'chart', desc: 'One figure, explained' },
    { href: '/opportunities/', label: 'Opportunities', icon: 'calendar', desc: 'Jobs, tenders and bursaries' },
  ] },
  // Wards: the places. The map, roads, and the four constituencies with their wards (decision #30)
  { href: '/ward/', label: 'Wards', icon: 'ward', overview: 'All 20 wards',
    desc: 'Where you live: each ward and constituency, its projects, services, leaders and roads.', pages: [
    { href: '/maps/', label: 'Map', icon: 'map', desc: 'Every ward on one map', also: ['/facility/'] },
    { href: '/road/', label: 'Roads', icon: 'road', desc: 'Road money and questions to ask' },
    ...subCounties.map((s) => {
      const list = wards.filter((w) => w.subCounty === s);
      return {
        href: `/constituency/${anchorFor(s)}/`, label: `${s} Constituency`, icon: 'pin', desc: `${list.length} wards`,
        pages: list.map((w) => ({ href: `/ward/${w.slug}/`, label: w.name })),
      };
    }),
  ] },
  { href: '/data/', label: 'Data', icon: 'data', overview: 'Nyamira in numbers',
    desc: 'The county in numbers: money, health, schools and farming, with every source.',
    pages: [...dataPages, { href: '/state-of-nyamira/', label: 'State of Nyamira', icon: 'chart', desc: 'The yearly report card' }] },
  { href: '/community/', label: 'Community', icon: 'community', overview: 'The people of Nyamira',
    desc: "Who lives here, what's working, heritage and stories from across the county.", pages: [
    { href: '/community/people-and-places/', label: 'People and places', icon: 'people', desc: '2019 census and every sub-location' },
    { href: '/people/', label: "Nyamira's people", icon: 'community', desc: 'People who keep the county going' },
    { href: '/whats-working/', label: "What's working", icon: 'check', desc: 'Services that do what they promise' },
    { href: '/heritage/', label: 'Heritage', icon: 'worship', desc: 'Places, history and traditions' },
    { href: '/community/nyamira-since-2013/', label: 'Nyamira since 2013', icon: 'calendar', desc: 'What has changed since devolution' },
  ] },
  { href: '/government/', label: 'Government', icon: 'government', overview: 'How Nyamira is run',
    desc: 'Who runs Nyamira: leaders, the Executive, the Assembly and the watchdogs.', pages: [
    { href: '/government/whos-in-charge/', label: "Who's in charge?", icon: 'question', desc: 'Who does what, on one page' },
    { href: '/government/leaders/', label: 'Leaders', icon: 'people', desc: 'Every office, with sources' },
    { href: '/government/elections/', label: 'Elections', icon: 'check', desc: 'Results since 2013' },
    { href: '/government/executive/', label: 'The Executive', icon: 'office', desc: 'The Governor and departments' },
    { href: '/government/assembly/', label: 'The Assembly', icon: 'government', desc: 'Sittings, bills and MCAs', pages: [
      { href: '/government/assembly/sittings/', label: 'Sittings' },
      { href: '/government/assembly/bills/', label: 'Bills and Acts' },
      { href: '/government/assembly/committees/', label: 'Committees' },
      { href: '/government/assembly/petitions/', label: 'Petitions and motions' },
      { href: '/government/assembly/mcas/', label: 'MCA pages' },
    ] },
    { href: '/government/watchdogs/', label: 'Watchdogs', icon: 'search', desc: 'Who checks the county' },
  ] },
  { href: '/take-part/', label: 'Take part', icon: 'takepart', overview: 'Take part',
    desc: 'Ways to ask, check and speak up: information requests, reports, budgets and hearings.', pages: [
    { href: '/ask/', label: 'Ask Nyamira', icon: 'question', desc: 'Request information by letter' },
    { href: '/report/', label: 'Is it working?', icon: 'check', desc: 'Report a service problem', pages: [{ href: '/report/clinic/', label: 'Clinic check' }] },
    { href: '/adopt/', label: 'Adopt a project', icon: 'camera', desc: 'Follow a project over time' },
    { href: '/take-part/submission/', label: 'Submission helper', icon: 'source', desc: 'Comment on budgets and bills' },
    { href: '/tools/budget-simulator/', label: 'Budget simulator', icon: 'money', desc: 'Try balancing the budget' },
    { href: '/tools/what-it-builds/', label: 'What could it build?', icon: 'chart', desc: 'What money pays for' },
    { href: '/have-your-say/', label: 'Have your say', icon: 'takepart', desc: 'Public hearings and deadlines' },
    { href: '/diaspora/', label: 'For the diaspora', icon: 'map', desc: 'For Nyamira people far away' },
    { href: '/fellowship/', label: 'Fellowship', icon: 'learn', desc: 'About the fellowship' },
  ] },
  // Learn includes the Constitution pages, Myth or fact and Explainers (decision #58)
  { href: '/learn/', label: 'Learn', icon: 'learn', overview: 'Learn how Nyamira works',
    desc: 'How the county works: the Constitution, the budget calendar, fees and plain-language guides.', pages: [
    { href: '/constitution/', label: 'The Constitution', icon: 'source', desc: 'Devolution and your rights', pages: [
      { href: '/constitution/devolution/', label: 'Devolution', also: ['/constitution/article/'] },
      { href: '/constitution/fourth-schedule/', label: 'What the county must do' },
      { href: '/constitution/your-rights/', label: 'Your rights' },
      { href: '/constitution/county-laws/', label: 'County laws' },
    ] },
    { href: '/learn/how-it-works/', label: 'How the county works', icon: 'government', desc: 'The basics, in plain words' },
    { href: '/learn/budget-calendar/', label: 'Budget calendar', icon: 'calendar', desc: 'When money decisions are made' },
    { href: '/learn/taking-part/', label: 'Taking part', icon: 'takepart', desc: 'Your right to take part' },
    { href: '/learn/fees/', label: 'Fees you pay', icon: 'money', desc: 'County fees and charges' },
    { href: '/learn/glossary/', label: 'Glossary', icon: 'learn', desc: 'Terms explained' },
    { href: '/explainers/', label: 'Explainers', icon: 'stories', desc: 'Short guides to big topics' },
    { href: '/fact-check/', label: 'Myth or fact', icon: 'question', desc: 'Claims checked against sources' },
    { href: '/learn/episodes/', label: 'Show episodes', icon: 'phone', desc: 'Episodes of the show' },
    { href: '/schools-programme/', label: 'Schools programme', icon: 'education', desc: 'For schools' },
  ] },
];

// Highlands colour for each section (brand kit v1.1, decision #31). Data sector pages set their own.
export const sectionTone = { Today: 'harvest', Wards: 'tea', Data: 'tea', Community: 'bloom', Government: 'rain', 'Take part': 'dusk', Learn: 'mist' };
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
  // A page under a listed page (a road under Roads, a person under Nyamira's people) is inside it
  if (item.href !== '/' && item.href.endsWith('/') && path.startsWith(item.href)) return 'true';
  return undefined;
}

// The section a page belongs to: by its address, or because it is listed in the section
// (Opportunities and Have your say sit under Today).
export function sectionFor(path) {
  return sections.find((s) => (s.href === '/' ? path === '/' : path.startsWith(s.href)) || s.pages.some((p) => stateFor(p, path)));
}
