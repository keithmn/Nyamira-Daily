// The search index for each language. It loads only on the search page.
import { LANGS } from '../../lib/routes.js';
import { searchIndex } from '../../lib/search.js';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export function GET({ params }) {
  return new Response(JSON.stringify(searchIndex(params.lang)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
