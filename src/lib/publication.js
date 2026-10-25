export const publicationTime = new Date();

export function isPublicEntry(data, collection, now = new Date(), includeDrafts = false) {
  if (data.draft && !includeDrafts) return false;
  if (data.publishAt && new Date(data.publishAt).getTime() > now.getTime()) return false;
  if (collection === 'numbers' && data.week && new Date(data.week).getTime() > now.getTime()) return false;
  return true;
}
