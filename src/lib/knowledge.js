// Abagusii Cultural Knowledge Base (docs/KNOWLEDGE_BASE.md).
// Shared helpers for all knowledge collections. Withdrawn or non-consented items never show.
// AI-training exports require the separate consentAiTraining flag.
import { entries } from './content.js';

export const visible = (list) =>
  list.filter((e) => e.data.consentPublish && !e.data.withdrawn && e.data.accessLevel !== 'restricted');

export const forTraining = (list) =>
  visible(list).filter((e) => e.data.consentAiTraining);

export const archiveOnly = (list) =>
  list.filter((e) => !e.data.withdrawn && e.data.accessLevel === 'archive');

const COLLECTIONS = ['plants', 'medicine', 'agriculture', 'livestock', 'songs', 'traditions', 'ecology', 'material', 'food', 'oralHistory'];

export async function knowledgeItems(collection) {
  return visible(await entries(collection));
}

export async function allKnowledge() {
  const all = {};
  for (const name of COLLECTIONS) {
    all[name] = await knowledgeItems(name);
  }
  return all;
}

export async function knowledgeForTraining() {
  const all = {};
  for (const name of COLLECTIONS) {
    all[name] = forTraining(await entries(name));
  }
  return all;
}

export function resolveRelated(entry, allCollections) {
  const refs = entry.data.relatedEntries || [];
  return refs.map((ref) => {
    for (const [collection, items] of Object.entries(allCollections)) {
      const found = items.find((i) => i.id === ref);
      if (found) return { collection, entry: found };
    }
    return null;
  }).filter(Boolean);
}

export const domainLabels = {
  plants: 'Plants & trees',
  medicine: 'Traditional medicine',
  agriculture: 'Crops & farming',
  livestock: 'Livestock & animals',
  songs: 'Songs & music',
  traditions: 'Traditions & ceremonies',
  ecology: 'Wildlife & ecology',
  material: 'Crafts & material culture',
  food: 'Food & drink',
  oralHistory: 'Oral history',
};
