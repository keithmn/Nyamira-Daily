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
  sources: z.array(source).min(1), audio: z.string().optional(), translation: z.string().optional(), ...publication,
}).refine((d) => d.consentPublish, { message: 'An archive item cannot be published without consentPublish: true' }) });

// Ekegusii language dataset (decision #129): words, phrases, grammar notes and sentences, each with
// audio, translation, consent and review. Consent for publication and for AI training are separate.
// An entry its contributor has withdrawn is never published or exported.
const language = defineCollection({ loader: md('language'), schema: z.object({
  term: z.string(),
  category: z.enum(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'phrase', 'greeting', 'proverb', 'sentence', 'grammar']),
  nounClass: z.string().optional(),
  translationEn: z.string(),
  translationSw: z.string().optional(),
  phonetic: z.string().optional(),
  tonePattern: z.string().optional(),
  usageExample: z.string().optional(),
  usageTranslationEn: z.string().optional(),
  dialect: z.string().optional(),
  audio: z.string().optional(),
  credit: z.string().default('Name withheld at the contributor\'s request'),
  consentPublish: z.boolean(), consentAiTraining: z.boolean().default(false),
  consentRecord: z.string().min(1),
  withdrawn: z.boolean().default(false),
  reviewedBy: z.string().min(1), reviewedOn: z.coerce.date(),
  sources: z.array(source).min(1), ...publication,
}).refine((d) => d.consentPublish, { message: 'A language entry cannot be published without consentPublish: true' }) });

export const collections = {numbers, explainers, factchecks, stories, people, heritage, alerts, projectlogs, archive, language };
