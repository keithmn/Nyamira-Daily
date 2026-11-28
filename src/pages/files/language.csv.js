import { languageItems } from '../../lib/language.js';

function esc(v) { return v == null ? '' : `"${String(v).replace(/"/g, '""')}"`; }

export async function GET() {
  const items = await languageItems();
  const header = 'id,term,category,noun_class,translation_en,translation_sw,phonetic,tone_pattern,usage_example,usage_translation_en,dialect,has_audio,ai_training_consent,reviewed_by,reviewed_on,source';
  const rows = items.map((e) => [
    e.id, e.data.term, e.data.category, e.data.nounClass ?? '', e.data.translationEn,
    e.data.translationSw ?? '', e.data.phonetic ?? '', e.data.tonePattern ?? '',
    e.data.usageExample ?? '', e.data.usageTranslationEn ?? '', e.data.dialect ?? '',
    e.data.audio ? 'yes' : 'no', e.data.consentAiTraining ? 'yes' : 'no',
    e.data.reviewedBy, e.data.reviewedOn.toISOString().slice(0, 10),
    e.data.sources.map((s) => s.name).join('; '),
  ].map(esc).join(','));
  return new Response([header, ...rows].join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="ekegusii-language.csv"' } });
}
