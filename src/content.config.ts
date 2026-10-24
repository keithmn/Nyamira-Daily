// Content collections: Markdown files anyone can add (one file per entry, frontmatter as below).
// Entries with `draft: true` (the EXAMPLE entries) are left out of the built site unless ND_DRAFTS=1.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { alertTypes } from './lib/alerts.js';

const source = z.object({ name: z.string(), url: z.string().optional().default(''), page: z.string().optional(), date: z.coerce.date().optional() });
const evidence = z.enum(['verified', 'audit', 'official', 'unverified']);
const photo = z.object({ src: z.string(), alt: z.string(), credit: z.string(), consent: z.boolean().default(false) });
const md = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

// 1.6 Number of the week
const numbers = defineCollection({ loader: md('numbers'), schema: z.object({
  week: z.coerce.date(), figure: z.string(), sentence: z.string(), explanation: z.string(),
  evidenceLabel: evidence, sources: z.array(source).min(1), radioScript: z.string(), swSummary: z.string().optional(), draft: z.boolean().default(false),
}) });

// 1.7 Explainers, fact-checks, what's working, people, heritage
const explainers = defineCollection({ loader: md('explainers'), schema: z.object({
  title: z.string(), summary: z.string(), topic: z.string(), sources: z.array(source).min(1), updated: z.coerce.date(),
  swSummary: z.string().optional(), readingLevel: z.enum(['easy', 'standard']).default('easy'), draft: z.boolean().default(false),
}) });
const factchecks = defineCollection({ loader: md('factchecks'), schema: z.object({
  claim: z.string(), claimSource: z.string(), rating: z.enum(['true', 'mostly true', 'misleading', 'false', 'unproven']),
  summary: z.string(), evidence: z.array(source).min(1), checkedOn: z.coerce.date(), swSummary: z.string().optional(), draft: z.boolean().default(false),
}) });
const stories = defineCollection({ loader: md('stories'), schema: z.object({
  title: z.string(), summary: z.string(), ward: z.string(), sector: z.string(), evidence: z.array(source).min(1),
  photos: z.array(photo).default([]), date: z.coerce.date(), evidenceLabel: evidence, draft: z.boolean().default(false),
}) });
const people = defineCollection({ loader: md('people'), schema: z.object({
  name: z.string(), role: z.string(), ward: z.string(), story: z.string(), photo: photo.optional(),
  consentOn: z.coerce.date(), draft: z.boolean().default(false),
}) });
const heritage = defineCollection({ loader: md('heritage'), schema: z.object({
  title: z.string(), place: z.string(), ward: z.string(), story: z.string(), sources: z.array(source).default([]),
  photos: z.array(photo).default([]), contributor: z.string(), draft: z.boolean().default(false),
}) });

// 1.8 Alerts and incidents (docs/EDITORIAL_RULES.md section 11)
const allTypes = [...alertTypes.emergency, ...alertTypes.disruption, ...alertTypes.notice] as [string, ...string[]];
const alerts = defineCollection({ loader: md('alerts'), schema: z.object({
  id: z.string(), type: z.enum(allTypes), level: z.enum(['emergency', 'disruption', 'notice']).optional(),
  title: z.string(), summary: z.string(), wards: z.array(z.string()).default([]), place: z.string().optional(),
  lat: z.number().optional(), lon: z.number().optional(),
  startedAt: z.coerce.date(), updatedAt: z.coerce.date(), status: z.enum(['active', 'monitoring', 'resolved']),
  resolvedAt: z.coerce.date().optional().nullable(), evidenceLabel: z.enum(['verified', 'official', 'unverified']),
  sources: z.array(source).min(1), advice: z.string().optional(), contacts: z.array(z.string()).default([]),
  swSummary: z.string().optional(), corrected: z.string().optional(), draft: z.boolean().default(false),
}) });

export const collections = { numbers, explainers, factchecks, stories, people, heritage, alerts };
