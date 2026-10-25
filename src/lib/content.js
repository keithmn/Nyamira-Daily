// Published entries of a content collection. Draft preview is only allowed in a local preview build.
import { getCollection } from 'astro:content';
import { isPublicEntry, publicationTime } from './publication.js';
export const showDrafts = process.env.ND_DRAFTS === '1';
export async function entries(name, now = publicationTime) {
  return (await getCollection(name)).filter((e) => isPublicEntry(e.data, name, now, showDrafts));
}
