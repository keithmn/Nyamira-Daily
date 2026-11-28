// Content collections: Markdown files anyone can add (one file per entry, frontmatter as below).
// Entries with `draft: true` (the EXAMPLE entries) are left out of the built site unless ND_DRAFTS=1.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const source = z.object({ name: z.string(), url: z.string().optional().default(''), page: z.string().optional(), date: z.coerce.date().optional() });
const evidence = z.enum(['verified', 'audit', 'official', 'unverified']);
const photo = z.object({ src: z.string(), alt: z.string(), credit: z.string(), consent: z.boolean().default(false) });
const publication = { draft: z.boolean().default(false), publishAt: z.coerce.date().optional() };
const md = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

// 1.6 Number of the week
const numbers = defineCollection({ loader: md('numbers'), schema: z.object({
  week: z.coerce.date(), figure: z.string(), sentence: z.string(), explanation: z.string(),
  evidenceLabel: evidence, sources: z.array(source).min(1), radioScript: z.string(), swSummary: z.string().optional(), ...publication,
}) });

// 1.7 Explainers, fact-checks, what's working, people, heritage
const explainers = defineCollection({ loader: md('explainers'), schema: z.object({
  title: z.string(), summary: z.string(), topic: z.string(), sources: z.array(source).min(1), updated: z.coerce.date(),
  swSummary: z.string().optional(), readingLevel: z.enum(['easy', 'standard']).default('easy'), ...publication,
}) });
const factchecks = defineCollection({ loader: md('factchecks'), schema: z.object({
  claim: z.string(), claimSource: z.string(), rating: z.enum(['true', 'mostly true', 'misleading', 'false', 'unproven']),
  summary: z.string(), evidence: z.array(source).min(1), checkedOn: z.coerce.date(),
  swSummary: z.string().optional(), ...publication,
}) });
const stories = defineCollection({ loader: md('stories'), schema: z.object({
  title: z.string(), ward: z.string().optional(), sector: z.string(),
  evidence: z.array(source).min(1), photos: z.array(photo).default([]),
  date: z.coerce.date(), evidenceLabel: evidence, swSummary: z.string().optional(), ...publication,
}) });
const people = defineCollection({ loader: md('people'), schema: z.object({
  name: z.string(), role: z.string(), ward: z.string().optional(), story: z.string(),
  photo: photo.optional(), consentOn: z.coerce.date(), swSummary: z.string().optional(), ...publication,
}) });
const heritage = defineCollection({ loader: md('heritage'), schema: z.object({
  title: z.string(), place: z.string().optional(), ward: z.string().optional(),
  story: z.string(), sources: z.array(source).min(1), photos: z.array(photo).default([]),
  contributor: z.string().optional(), swSummary: z.string().optional(), ...publication,
}) });
// 1.8 Alerts and incidents (docs/EDITORIAL_RULES.md section 11)
const alerts = defineCollection({ loader: md('alerts'), schema: z.object({
  type: z.enum(['fire', 'flood', 'landslide', 'building collapse', 'disease outbreak', 'major accident', 'storm',
    'road closure', 'bridge out', 'power outage', 'water outage', 'health facility closure', 'service strike',
    'vaccination', 'health campaign', 'county notice', 'weather advisory', 'public forum', 'exam period']),
  level: z.enum(['emergency', 'disruption', 'notice']),
  title: z.string(), summary: z.string(),
  wards: z.array(z.string()).default([]), place: z.string().optional(),
  lat: z.number().optional(), lon: z.number().optional(),
  startedAt: z.coerce.date(), updatedAt: z.coerce.date(),
  status: z.enum(['active', 'monitoring', 'resolved']),
  resolvedAt: z.coerce.date().optional(),
  evidenceLabel: evidence,
  sources: z.array(source).min(1), advice: z.string().optional(),
  contacts: z.array(z.object({ name: z.string(), phone: z.string().optional(), role: z.string().optional() })).default([]),
  swSummary: z.string().optional(), ...publication,
}) });
const projectlogs = defineCollection({ loader: md('projectlogs'), schema: z.object({
  projectId: z.string(), date: z.coerce.date(), photo: photo.optional(), note: z.string(),
  observer: z.string().default('Volunteer'), consent: z.boolean(), ...publication,
}) });

// Today: news briefs (decision #63, docs/EDITORIAL_RULES.md section 13): short, dated, sourced, each tied to the
// data it changes, so news never stands apart from (or above) the data.
const pageLink = z.object({ label: z.string(), href: z.string().startsWith('/') });
// Today: the daily show (YouTube) and NY Watch, the podcast with decision makers (decision #63, section 14).
// Video loads only when the reader taps it; audio uses the browser's player and loads nothing until played.
// Community: the culture archive (decision #122). An item is published only when the knowledge holder agreed to
// publication, a reviewer has checked it and it names its source. Consent for the archive and for AI training are
// separate, and an item its holder has withdrawn is never published or exported.
const archive = defineCollection({ loader: md('archive'), schema: z.object({
  title: z.string(), summary: z.string(),
  kind: z.enum(['story', 'song', 'proverb', 'custom', 'craft', 'food', 'history', 'name', 'riddle', 'lullaby', 'ceremony', 'medicine', 'other']),
  language: z.enum(['guz', 'sw', 'en']).default('guz'),
  recordedOn: z.coerce.date(), place: z.string().optional(),
  credit: z.string().default('Name withheld at the holder\'s request'),
  consentPublish: z.boolean(), consentArchive: z.boolean(), consentAiTraining: z.boolean().default(false),
  consentRecord: z.string().min(1), // where the signed or recorded consent is kept (a file reference, never the file)
  withdrawn: z.boolean().default(false),
  reviewedBy: z.string().min(1), reviewedOn: z.coerce.date(),
  sources: z.array(source).min(1), audio: z.string().optional(), translation: z.string().optional(),
  transcript: z.string().optional(), transcriptLang: z.enum(['guz', 'sw', 'en']).optional(),
  ...publication,
}).refine((d) => d.consentPublish, { message: 'An archive item cannot be published without consentPublish: true' }) });

// Ekegusii language dataset (decision #129): words, phrases, grammar notes and sentences, each with
// audio, translation, consent and review. Consent for publication and for AI training are separate.
// An entry its contributor has withdrawn is never published or exported.
const language = defineCollection({ loader: md('language'), schema: z.object({
  term: z.string(),
  category: z.enum(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'phrase', 'greeting', 'proverb', 'sentence', 'grammar', 'riddle', 'praise-name', 'kinship', 'taboo', 'song-lyric']),
  nounClass: z.string().optional(),
  translationEn: z.string(),
  translationSw: z.string().optional(),
  phonetic: z.string().optional(),
  tonePattern: z.string().optional(),
  usageExample: z.string().optional(),
  usageTranslationEn: z.string().optional(),
  dialect: z.string().optional(),
  audio: z.string().optional(),
  transcript: z.string().optional(), transcriptLang: z.enum(['guz', 'sw', 'en']).optional(),
  credit: z.string().default('Name withheld at the contributor\'s request'),
  consentPublish: z.boolean(), consentAiTraining: z.boolean().default(false),
  consentRecord: z.string().min(1),
  withdrawn: z.boolean().default(false),
  reviewedBy: z.string().min(1), reviewedOn: z.coerce.date(),
  sources: z.array(source).min(1), ...publication,
}).refine((d) => d.consentPublish, { message: 'A language entry cannot be published without consentPublish: true' }) });

// ---------------------------------------------------------------------------
// Abagusii Cultural Knowledge Base (docs/KNOWLEDGE_BASE.md)
//
// Every knowledge entry shares the consent model: consentPublish (required for
// publication), consentAiTraining (opt-in for AI export), accessLevel (public,
// archive-only, or restricted), withdrawn (removes from everything). A refine
// enforces consentPublish for anything that builds to the site.
// ---------------------------------------------------------------------------

const knowledgeConsent = {
  credit: z.string().default("Name withheld at the holder's request"),
  consentPublish: z.boolean(),
  consentAiTraining: z.boolean().default(false),
  consentRecord: z.string().min(1),
  accessLevel: z.enum(['public', 'archive', 'restricted']).default('public'),
  withdrawn: z.boolean().default(false),
  reviewedBy: z.string().min(1),
  reviewedOn: z.coerce.date(),
  sources: z.array(source).min(1),
  relatedEntries: z.array(z.string()).default([]),
  audio: z.string().optional(),
  photos: z.array(photo).default([]),
};

const consentRefine = (d: { consentPublish: boolean }) => d.consentPublish;
const consentMsg = { message: 'Cannot be published without consentPublish: true' };

// 2.1 Ethnobotany — plants and trees with Ekegusii names, scientific names, and traditional uses
const plants = defineCollection({ loader: md('plants'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  nameScientific: z.string().optional(),
  family: z.string().optional(),
  uses: z.array(z.object({
    category: z.enum(['medicinal', 'food', 'construction', 'ceremony', 'dye', 'fibre', 'tool', 'shade', 'boundary', 'ornamental', 'spiritual', 'fuel', 'fodder', 'other']),
    description: z.string(),
    parts: z.array(z.string()).default([]),
  })).default([]),
  habitat: z.array(z.enum(['riverbank', 'hilltop', 'homestead', 'forest', 'cultivated', 'roadside', 'swamp', 'grassland'])).default([]),
  season: z.string().optional(),
  conservation: z.enum(['common', 'declining', 'rare', 'locally-extinct', 'unknown']).default('unknown'),
  threats: z.array(z.string()).default([]),
  botanistVerified: z.boolean().default(false),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.2 Traditional medicine — conditions and treatments, presented as heritage not health advice
const medicine = defineCollection({ loader: md('medicine'), schema: z.object({
  conditionGuz: z.string(), conditionEn: z.string(), conditionSw: z.string().optional(),
  symptoms: z.string().optional(),
  treatments: z.array(z.object({
    plants: z.array(z.string()),
    preparation: z.string(),
    administration: z.string().optional(),
    precautions: z.string().optional(),
  })).default([]),
  practitionerType: z.enum(['herbalist', 'bonesetter', 'birth-attendant', 'diviner', 'elder', 'any']).optional(),
  stillPracticed: z.boolean().default(false),
  pharmacpiological: z.string().optional(),
  safetyNote: z.string().default('This is a cultural record, not medical advice. Consult a qualified health professional.'),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.3 Agriculture — heritage crop varieties, farming practices, seed preservation
const agriculture = defineCollection({ loader: md('agriculture'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  nameScientific: z.string().optional(),
  kind: z.enum(['grain', 'root', 'vegetable', 'fruit', 'legume', 'spice', 'stimulant', 'practice', 'tool']),
  varieties: z.array(z.object({ nameGuz: z.string(), description: z.string() })).default([]),
  growingSeason: z.string().optional(),
  soilPreference: z.string().optional(),
  seedSource: z.enum(['available', 'rare', 'gene-bank', 'locally-extinct', 'unknown']).default('unknown'),
  preparation: z.string().optional(),
  storage: z.string().optional(),
  culturalRole: z.string().optional(),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.4 Livestock — indigenous breeds, husbandry, veterinary folk knowledge
const livestock = defineCollection({ loader: md('livestock'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  nameScientific: z.string().optional(),
  animalType: z.enum(['cattle', 'sheep', 'goat', 'poultry', 'dog', 'bee', 'other']),
  characteristics: z.string().optional(),
  colourTerms: z.array(z.object({ termGuz: z.string(), description: z.string() })).default([]),
  husbandry: z.string().optional(),
  veterinary: z.array(z.object({ condition: z.string(), treatment: z.string(), plants: z.array(z.string()).default([]) })).default([]),
  culturalRole: z.string().optional(),
  conservation: z.enum(['common', 'crossbred', 'rare', 'locally-extinct', 'unknown']).default('unknown'),
  geneticInfo: z.string().optional(),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.5 Songs — musical heritage with full lyrics, context, and instruments
const songs = defineCollection({ loader: md('songs'), schema: z.object({
  title: z.string(), titleEn: z.string().optional(),
  songType: z.enum(['work', 'ceremony', 'entertainment', 'mourning', 'lullaby', 'war', 'praise', 'satirical', 'children', 'wedding', 'harvest', 'other']),
  lyrics: z.string(),
  translationEn: z.string().optional(), translationSw: z.string().optional(),
  occasion: z.string().optional(),
  instruments: z.array(z.string()).default([]),
  dance: z.string().optional(),
  performers: z.string().optional(),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.6 Traditions — ceremonies, rites, customs, and social practices
const traditions = defineCollection({ loader: md('traditions'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  kind: z.enum(['rite-of-passage', 'seasonal', 'conflict-resolution', 'hospitality', 'building', 'naming', 'marriage', 'funeral', 'governance', 'taboo', 'other']),
  description: z.string(),
  participants: z.string().optional(),
  timing: z.string().optional(),
  objects: z.array(z.string()).default([]),
  plantsUsed: z.array(z.string()).default([]),
  songsPerformed: z.array(z.string()).default([]),
  foodPrepared: z.array(z.string()).default([]),
  stillPracticed: z.boolean().default(false),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.7 Ecology — animals, birds, insects, fish with Ekegusii names and cultural significance
const ecology = defineCollection({ loader: md('ecology'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  nameScientific: z.string().optional(),
  kind: z.enum(['mammal', 'bird', 'insect', 'fish', 'reptile', 'amphibian', 'other']),
  habitat: z.string().optional(),
  behaviour: z.string().optional(),
  culturalMeaning: z.string().optional(),
  proverbs: z.array(z.string()).default([]),
  conservation: z.enum(['common', 'declining', 'rare', 'locally-extinct', 'unknown']).default('unknown'),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.8 Material culture — crafts, tools, architecture, instruments, clothing
const material = defineCollection({ loader: md('material'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  kind: z.enum(['tool', 'pottery', 'basket', 'textile', 'instrument', 'weapon', 'architecture', 'carving', 'clothing', 'adornment', 'other']),
  materials: z.array(z.string()).default([]),
  maker: z.string().optional(),
  method: z.string().optional(),
  use: z.string().optional(),
  stillMade: z.boolean().default(false),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.9 Food and drink — dishes, preparations, preservation, brewing
const food = defineCollection({ loader: md('food'), schema: z.object({
  nameGuz: z.string(), nameEn: z.string(), nameSw: z.string().optional(),
  kind: z.enum(['staple', 'vegetable', 'meat', 'drink', 'fermented', 'snack', 'ceremonial', 'preservation', 'other']),
  ingredients: z.array(z.string()).default([]),
  method: z.string().optional(),
  occasion: z.string().optional(),
  season: z.string().optional(),
  nutritional: z.string().optional(),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

// 2.10 Oral history — migration, clan history, place names, cosmology
const oralHistory = defineCollection({ loader: md('oral-history'), schema: z.object({
  title: z.string(), titleGuz: z.string().optional(),
  kind: z.enum(['migration', 'clan-history', 'place-name', 'historical-event', 'origin', 'cosmology', 'belief', 'other']),
  period: z.string().optional(),
  place: z.string().optional(),
  clan: z.string().optional(),
  translationEn: z.string().optional(),
  ...knowledgeConsent, ...publication,
}).refine(consentRefine, consentMsg) });

export const collections = {
  numbers, explainers, factchecks, stories, people, heritage, alerts, projectlogs,
  archive, language,
  plants, medicine, agriculture, livestock, songs, traditions, ecology, material, food, oralHistory,
};
