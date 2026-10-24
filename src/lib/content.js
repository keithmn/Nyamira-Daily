// Published entries of a content collection. Drafts (the EXAMPLE entries) are shown only when
// the site is built with ND_DRAFTS=1, e.g. `ND_DRAFTS=1 npm run build` to check layouts.
import { getCollection } from 'astro:content';
export const showDrafts = process.env.ND_DRAFTS === '1';
export async function entries(name) {
  return (await getCollection(name)).filter((e) => showDrafts || !e.data.draft);
}
