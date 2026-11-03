// The search index: counties, sectors, votes and programmes, each with its link. Abbreviations are listed where the vote or
// sector they belong to is plain, so "TSC" or "KeNHA" finds the right page. An abbreviation that sits across several votes
// points to its sector instead of guessing a vote.
import { COUNTIES } from '@kbe/engine/counties';
import { t } from '../i18n/index.js';
import { explainers } from './learn.js';
import { countyHref, href, programmeHref, sectorHref, voteHref } from './routes.js';
import { allSectors, allVotes } from './votes.js';

const VOTE_WORDS = {
  2091: 'TSC teachers walimu', 1065: 'HELB university universities chuo kikuu', 1064: 'TVET', 1066: 'shule schools', 1091: 'KeNHA KURA KeRRA roads barabara', 1092: 'SGR railway reli',
  1025: 'NPS police polisi', 1071: 'KRA Treasury Hazina', 1041: 'KDF defence jeshi', 1281: 'NIS', 2031: 'IEBC elections uchaguzi', 1271: 'EACC', 1291: 'ODPP DPP', 1261: 'courts mahakama', 2042: 'MPs wabunge',
  2061: 'CRA', 2121: 'CoB', 2111: 'OAG', 1169: 'fertiliser mbolea', 1109: 'maji', 1152: 'KPLC electricity umeme',
};
const SECTOR_WORDS = { health: 'SHA KMTC hospitals hospitali afya', education: 'elimu', 'agriculture-rural-urban-development': 'kilimo farming' };

export function searchIndex(lang) {
  const out = [];
  for (const c of COUNTIES) out.push([c.name, countyHref(lang, c.slug), 'county', 'kaunti']);
  for (const s of allSectors()) out.push([t(lang, `sector.${s.slug}`), sectorHref(lang, s.slug), 'sector', [t('en', `sector.${s.slug}`), SECTOR_WORDS[s.slug] ?? ''].join(' ').trim()]);
  for (const v of allVotes()) {
    out.push([v.name, voteHref(lang, v.code), 'vote', `${v.code} ${VOTE_WORDS[v.code] ?? ''}`.trim()]);
    for (const p of v.programmes) out.push([p.name, programmeHref(lang, v.code, p.code), 'programme', `${v.name} ${p.code}`]);
  }
  // Explainers are written in English; the Kiswahili summary makes them findable in Kiswahili too
  for (const e of explainers()) out.push([e.title, href(lang, `/learn/${e.slug}/`), 'explainer', e.sw]);
  return out;
}
