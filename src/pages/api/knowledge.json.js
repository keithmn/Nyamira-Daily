import { knowledgeForTraining, domainLabels } from '../../lib/knowledge.js';
import { json } from '../../lib/api.js';

function mapEntry(e, domain) {
  const d = e.data;
  return {
    id: e.id,
    domain,
    nameGuz: d.nameGuz ?? d.title ?? d.conditionGuz ?? null,
    nameEn: d.nameEn ?? d.titleEn ?? d.conditionEn ?? null,
    nameSw: d.nameSw ?? d.conditionSw ?? null,
    nameScientific: d.nameScientific ?? null,
    summary: d.summary ?? d.description ?? null,
    relatedEntries: d.relatedEntries ?? [],
    hasAudio: Boolean(d.audio),
    hasPhotos: (d.photos?.length ?? 0) > 0,
    reviewedBy: d.reviewedBy,
    reviewedOn: d.reviewedOn.toISOString().slice(0, 10),
    sources: d.sources.map((s) => ({ name: s.name, url: s.url || undefined })),
  };
}

export async function GET({ site }) {
  const all = await knowledgeForTraining();
  const entities = [];
  const counts = {};

  for (const [domain, items] of Object.entries(all)) {
    counts[domain] = items.length;
    for (const e of items) entities.push(mapEntry(e, domain));
  }

  return json({
    description: 'Abagusii Cultural Knowledge Base: entries whose holders gave separate consent for AI training. Covers plants, medicine, agriculture, livestock, songs, traditions, ecology, material culture, food and oral history. Each entry is verified by a reviewer and sourced. Entries without AI-training consent are never included.',
    domains: Object.entries(domainLabels).map(([k, label]) => ({ key: k, label, count: counts[k] ?? 0 })),
    total: entities.length,
    entities,
  }, site);
}
