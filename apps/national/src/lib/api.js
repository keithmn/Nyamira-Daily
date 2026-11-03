// What every national JSON file carries, after the main site's envelope (src/lib/api.js): licence, credit, the data release
// and the documents behind the figures (build brief 5.13). Figures go out as the registry holds them, without page objects.
import { site } from '../site.js';
import { release, sourceDoc, today } from './figures.js';

export const LICENCE = { name: 'CC-BY-4.0', title: 'Creative Commons Attribution 4.0', path: 'https://creativecommons.org/licenses/by/4.0/' };

const plain = ({ doc, ...f }) => f;
const sourceOf = (id) => { const { id: sid, title, issuer, date, url, archive, sha256 } = sourceDoc(id); return { id: sid, title, issuer, date, url, archive, sha256 }; };

export function envelope(body, figures = []) {
  const list = figures.map(plain);
  return {
    licence: `${LICENCE.title} (${LICENCE.path}): free to reuse with credit to ${site.name} and a link to the page.`,
    credit: `Source: ${site.name}`, release, generated: today(), ...body,
    ...(list.length ? { figures: list, sources: [...new Set(list.map((f) => f.source))].sort().map(sourceOf) } : {}),
  };
}

export const json = (body) => new Response(JSON.stringify(body, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
