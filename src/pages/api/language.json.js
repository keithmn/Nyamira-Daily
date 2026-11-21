import { languageItems, forTraining } from '../../lib/language.js';
import { json } from '../../lib/api.js';

export async function GET({ site }) {
  const consented = forTraining(await languageItems());
  return json({
    description: 'Ekegusii language dataset: entries whose contributors gave separate consent for AI training (decision #129). Each record carries the Ekegusii text, translations, phonetic guide, grammatical category, usage example and its source. Entries without AI-training consent are never included. The licence is being finalised.',
    total: consented.length,
    entries: consented.map((e) => ({
      id: e.id,
      term: e.data.term,
      category: e.data.category,
      nounClass: e.data.nounClass ?? null,
      translationEn: e.data.translationEn,
      translationSw: e.data.translationSw ?? null,
      phonetic: e.data.phonetic ?? null,
      tonePattern: e.data.tonePattern ?? null,
      usageExample: e.data.usageExample ?? null,
      usageTranslationEn: e.data.usageTranslationEn ?? null,
      dialect: e.data.dialect ?? null,
      hasAudio: Boolean(e.data.audio),
      reviewedBy: e.data.reviewedBy,
      reviewedOn: e.data.reviewedOn.toISOString().slice(0, 10),
      sources: e.data.sources.map((s) => ({ name: s.name, url: s.url || undefined })),
    })),
  }, site);
}
