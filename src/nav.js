// Site navigation, used by Base.astro.
// Five sections (decision #110). On desktop each opens a mega menu of cards; on phones the hamburger sheet lists them all
// (src/components/SiteHeader.astro). Section pages also get a secondary bar of their pages (SectionTabs.astro).
// Labels are kept short for the lists; each section's index page keeps the longer titles and descriptions.
// Add a new page to its section's `pages` here so readers can reach it from the menu.
import { topics } from './data/topics.js';
import wards from './data/wards.json' with { type: 'json' };
import { planned } from './config.js';
import videos from './data/living/videos.json' with { type: 'json' };

import { county } from './county.js';

// The county's constituencies (its sub-county units), from the county kit (decision #74).
export const subCounties = county.constituencies;
export const anchorFor = (name) => name.toLowerCase().split(' ').join('-');

const topic = (slug) => topics.find((t) => t.slug === slug);

// Each section: `overview` names its own page, `desc` introduces it in the menu, `icon` is from
// src/lib/icons.js. Each page has a short `desc` for the menu cards; pages can hold pages of their own.
// Five sections (decisions #110, #119, #122): the map, the money, the community, the videos, about.
// `group` puts a page under a heading in the section switcher and side list (SectionNav.astro); `groups` gives their order.
// `rail: false` keeps a section's pages full width (the switcher only): the Map pages need the whole width.
// Map pages live under /map/ and /ward/, money pages under /money/ (phase R2b).
export const sections = [
  // Gusii language and cultural knowledge — the lead section (decision #110 recast for Gusii Daily rebrand).
  { href: '/community/', label: 'Gusii', icon: 'community', overview: 'Gusii language & culture', groups: ['Language', 'Heritage'],
    desc: 'The Ekegusii language database, Abagusii cultural knowledge and community heritage — recorded with consent.', pages: [
    { href: '/community/language/', label: 'Ekegusii language', group: 'Language', icon: 'learn', desc: 'An open Ekegusii text and speech dataset', also: ['/community/share/', '/community/language/words/', '/community/language/grammar/'] },
    { href: '/community/abagusii/', label: 'The Abagusii', group: 'Heritage', icon: 'people', desc: 'History and culture, with sources' },
    { href: '/community/archive/', label: 'Culture archive', group: 'Heritage', icon: 'stories', desc: 'Recordings, stories and knowledge' },
  ] },
  { href: '/map/', label: 'Places', icon: 'map', overview: 'The county map', groups: ['Find a place', 'By sector', 'The county', 'Safety'],
    desc: 'Every ward and every public place: what is there, and how it is doing.', pages: [
    { href: '/ward/', label: 'Wards', icon: 'ward', group: 'Find a place', desc: 'All 20 wards', also: ['/place/'], pages: subCounties.map((s) => ({
      href: `/ward/#${anchorFor(s)}`, label: s,
      pages: wards.filter((w) => w.subCounty === s).map((w) => ({ href: `/ward/${w.slug}/`, label: w.name })),
    })) },
    { href: '/map/#roads', label: 'Roads', icon: 'road', group: 'Find a place', desc: 'Road money and questions to ask' },
    { href: '/map/health/', label: topic('health').title, icon: 'health', group: 'By sector', desc: 'Clinics, mothers and children' },
    { href: '/map/education/', label: topic('education').title, icon: 'education', group: 'By sector', desc: 'Schools and learners' },
    { href: '/money/farming/', label: topic('farming').title, icon: 'farming', group: 'By sector', desc: 'Tea bonuses and farm spending' },
    { href: '/about/nyamira/', label: 'About the county', group: 'The county', icon: 'map', desc: 'Facts, figures and places to know', pages: [
      { href: '/administration/duties/', label: 'How it is governed', icon: 'government', desc: 'What the county must do, and how' },
      { href: '/administration/', label: 'Who holds each seat', icon: 'people', desc: 'Each county seat and its holder, with sources' },
      { href: '/about/glossary/', label: 'Glossary', icon: 'learn', desc: 'Terms explained' },
    ] },
    { href: '/alerts/', label: 'Alerts', icon: 'source', group: 'Safety', desc: 'Incidents and public notices' },
  ] },
  { href: '/money/', label: 'Money', icon: 'money', overview: 'County money', groups: ['This year', 'Over the years', 'Follow the money'],
    desc: "County budgets and spending, the contracts signed, and how money moves.", pages: [
    { href: '/money/2025-26/', label: 'Budget 2025/26', group: 'This year', desc: 'The plan, with its key dates', also: ['/money/2025-26/departments/'] },
    { href: '/money/track/', label: 'What was spent', group: 'This year' },
    { href: '/money/revenue/', label: 'Where it comes from', group: 'This year', desc: 'Including the fees you pay' },
    { href: '/money/history/', label: 'Since 2013', group: 'Over the years' },
    { href: '/money/contracts/', label: 'Contracts', icon: 'source', group: 'Follow the money', desc: 'Every contract: who, how much, when' },
    { href: '/money/economy/', label: 'The economy', icon: 'chart', group: 'Follow the money', desc: 'Money coming in, and how it moves' },
  ] },
  // Stories (decision #127): videos, explainers, fact-checks, what's working, people, heritage and the number of the week.
  { href: '/watch/', label: 'Stories', icon: 'camera', overview: 'All stories', groups: ['By kind', 'People & places'],
    desc: 'Videos and stories from the data, each with the figures behind it.', pages: [
    ...(videos.length ? [{ href: '/watch/#video', label: 'Videos', group: 'By kind', icon: 'camera', desc: 'Field visits and updates' }] : []),
    { href: '/watch/#explainer', label: 'Explainers', group: 'By kind', icon: 'learn', desc: 'How things work, in plain words', also: ['/explainers/'] },
    { href: '/watch/#number', label: 'Number of the week', group: 'By kind', icon: 'chart', desc: 'One figure, explained', also: ['/number-of-the-week/'] },
    { href: '/fact-check/', label: 'Fact check', group: 'By kind', icon: 'source', desc: 'Claims checked against the record' },
    { href: '/whats-working/', label: "What's working", group: 'People & places', icon: 'map', desc: 'Stories backed by evidence' },
    { href: '/people/', label: 'People', group: 'People & places', icon: 'people', desc: 'People making a difference, with their consent' },
    { href: '/heritage/', label: 'Heritage', group: 'People & places', icon: 'community', desc: 'Places and traditions worth knowing' },
  ] },
  { href: '/about/', label: 'About', icon: 'source', overview: 'About Gusii Daily', groups: ['Gusii Daily', 'Take part'],
    desc: 'What Gusii Daily is, and how to reach us.', pages: [
    { href: '/about/contact/', label: 'Tell us', group: 'Gusii Daily', icon: 'question', desc: 'A place, a tip, a story or a correction', also: ['/report/'] },
    { href: '/about/careers/', label: 'Careers and volunteering', group: 'Gusii Daily', icon: 'people', desc: 'Ward correspondents and culture volunteers' },
    { href: '/about/partners/', label: 'Partner with us', group: 'Gusii Daily', icon: 'data', desc: 'Data, research and sponsorship' },
    { href: '/about/data/', label: 'Open data', group: 'Gusii Daily', icon: 'data', desc: 'CSV tables and live JSON endpoints' },
    { href: '/about/rules/', label: 'Rules and legal', group: 'Gusii Daily', icon: 'source', desc: 'How we work, right of reply, terms, privacy' },
    { href: '/ask/', label: 'Ask your county', group: 'Take part', icon: 'question', desc: 'Request information from the county' },
    { href: '/take-part/submission/', label: 'Submission helper', group: 'Take part', icon: 'learn', desc: 'Write a submission for a budget hearing' },
    { href: '/tools/budget-simulator/', label: 'Budget simulator', group: 'Take part', icon: 'chart', desc: 'Move money between sectors' },
  ] },
];

// A section's pages in their groups, in order, for the switcher and the side list (decision #119).
export function groupsOf(section) {
  const names = section.groups ?? [...new Set(section.pages.map((p) => p.group ?? ''))];
  return names.map((label) => ({ label, pages: section.pages.filter((p) => (p.group ?? '') === label) })).filter((g) => g.pages.length);
}

// Section colours are retired (decision #111): every page reads the same tokens. Kept so pages still build.
export const sectionTone = {};
export function toneFor() { return 'deep'; }

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
  // A page listed in a section belongs to it, wherever its address sits (Farming under Places, decision #127);
  // otherwise the section whose address it starts with.
  return sections.find((s) => s.pages.some((p) => p.href === path || (p.also ?? []).some((h) => path.startsWith(h))))
    ?? sections.find((s) => path.startsWith(s.href) || (s.also ?? []).some((h) => path.startsWith(h)) || s.pages.some((p) => stateFor(p, path)));
}
