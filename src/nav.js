// Site navigation, used by Base.astro.
// Primary bar: the six sections. Secondary bar: the pages inside the section the reader is in.
// Labels are kept short for the bars; each section's index page keeps the longer titles and descriptions.
// Add a new page to its section's `pages` here so readers can reach it from the secondary bar.
import { topics } from './data/topics.js';
import wards from './data/wards.json';
import { planned } from './config.js';

export const subCounties = ['Borabu', 'Kitutu Masaba', 'North Mugirango', 'West Mugirango'];
export const anchorFor = (name) => name.toLowerCase().split(' ').join('-');

// Data topics in their usual order, planned ones last (as on the Data page)
const dataPages = [...topics]
  .sort((a, b) => planned.has(`/data/${a.slug}/`) - planned.has(`/data/${b.slug}/`))
  .map((t) => ({ href: `/data/${t.slug}/`, label: t.title }));

export const sections = [
  { href: '/', label: 'Today', pages: [
    { href: '/opportunities/', label: 'Opportunities' },
    { href: '/have-your-say/', label: 'Have your say' },
  ] },
  { href: '/data/', label: 'Data', pages: dataPages },
  // My Ward: jump to each sub-county's wards on the ward list
  { href: '/ward/', label: 'My Ward', pages: subCounties.map((s) => ({ href: `/ward/#${anchorFor(s)}`, label: s })) },
  { href: '/government/', label: 'Government', pages: [
    { href: '/government/whos-in-charge/', label: "Who's in charge?" },
    { href: '/government/leaders/', label: 'Leaders' },
    { href: '/government/executive/', label: 'The Executive' },
    { href: '/government/assembly/', label: 'The Assembly' },
    { href: '/government/watchdogs/', label: 'Watchdogs' },
  ] },
  { href: '/constitution/', label: 'Constitution', pages: [
    { href: '/constitution/devolution/', label: 'Devolution', also: ['/constitution/article/'] },
    { href: '/constitution/fourth-schedule/', label: 'What the county must do' },
    { href: '/constitution/your-rights/', label: 'Your rights' },
    { href: '/constitution/county-laws/', label: 'County laws' },
  ] },
  { href: '/learn/', label: 'Learn', pages: [
    { href: '/learn/how-it-works/', label: 'How the county works' },
    { href: '/learn/budget-calendar/', label: 'Budget calendar' },
    { href: '/learn/taking-part/', label: 'Taking part' },
    { href: '/learn/fees/', label: 'Fees you pay' },
    { href: '/learn/glossary/', label: 'Glossary' },
    { href: '/learn/episodes/', label: 'Show episodes' },
  ] },
];

const within = (path, page) => [page.href, ...(page.also ?? [])].some((href) => path.startsWith(href));

// The section a page belongs to: by its address, or because it is one of the section's pages
// (Opportunities and Have your say sit under Today).
export function sectionFor(path) {
  return sections.find((s) => (s.href === '/' ? path === '/' : path.startsWith(s.href)) || s.pages.some((p) => within(path, p)));
}

// The secondary-bar entry for this page, if any. A ward page counts as its sub-county.
export function currentPage(section, path) {
  if (!section) return undefined;
  const ward = wards.find((w) => path === `/ward/${w.slug}/`);
  if (ward) return `/ward/#${anchorFor(ward.subCounty)}`;
  return section.pages.find((p) => within(path, p))?.href;
}
