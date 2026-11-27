// Ekegusii language dataset (decision #129). Withdrawn entries never show; the AI-training export
// includes only entries whose contributors gave that separate consent.
import { entries } from './content.js';

export const visible = (list) => list.filter((e) => e.data.consentPublish && !e.data.withdrawn);
export const forTraining = (list) => visible(list).filter((e) => e.data.consentAiTraining);

export async function languageItems() {
  return visible(await entries('language')).sort((a, b) => a.data.term.localeCompare(b.data.term, 'guz'));
}

export function wordItems(list) {
  return list.filter((e) => e.data.category !== 'grammar');
}

export function grammarItems(list) {
  return list.filter((e) => e.data.category === 'grammar');
}

export const categoryLabel = {
  noun: 'Noun', verb: 'Verb', adjective: 'Adjective', adverb: 'Adverb',
  pronoun: 'Pronoun', phrase: 'Phrase', greeting: 'Greeting', proverb: 'Proverb',
  sentence: 'Sentence', grammar: 'Grammar', riddle: 'Riddle', 'praise-name': 'Praise name',
  kinship: 'Kinship term', taboo: 'Taboo / euphemism', 'song-lyric': 'Song lyric',
};
