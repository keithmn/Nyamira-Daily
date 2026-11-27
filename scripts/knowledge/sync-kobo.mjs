// Pull approved knowledge-survey submissions from KoboToolbox and write them as draft
// content-collection Markdown files in src/content/<domain>/. Every file lands with
// draft: true so a reviewer must check names, scientific IDs and related entries before
// it goes live. Photos and audio stay in Kobo — only references are written.
//
//   node scripts/knowledge/sync-kobo.mjs                      # from Kobo API
//   node scripts/knowledge/sync-kobo.mjs --from-dir DIR        # from an exported JSON
//   node scripts/knowledge/sync-kobo.mjs --dry-run             # show what would be created

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contentDir = path.join(root, 'src', 'content');
const APPROVED = 'validation_status_approved';

const slug = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/['']/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-')
    .slice(0, 60);

const today = new Date().toISOString().slice(0, 10);

const DOMAIN_DIR = {
  plant: 'plants',
  medicine: 'medicine',
  song: 'songs',
  livestock: 'livestock',
  food: 'food',
  tradition: 'traditions',
  agriculture: 'agriculture',
  ecology: 'ecology',
  material: 'material',
  'oral-history': 'oral-history',
  language: 'language',
  'social-organisation': 'traditions',
};

// --- Kobo API ---
async function kobo(uid) {
  const server = process.env.KOBO_SERVER || 'https://kf.kobotoolbox.org';
  if (!uid || !process.env.KOBO_TOKEN) {
    console.error('Set KOBO_TOKEN and KOBO_KNOWLEDGE_SURVEY in .env.local');
    process.exit(1);
  }
  const out = [];
  let url = `${server}/api/v2/assets/${uid}/data/?format=json&limit=1000`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Token ${process.env.KOBO_TOKEN}` } });
    if (!res.ok) throw new Error(`Kobo ${uid}: HTTP ${res.status}`);
    const page = await res.json();
    out.push(...page.results);
    url = page.next;
  }
  return out;
}

function approved(list) {
  return list.filter((s) => s?._validation_status?.uid === APPROVED && s.privacy_ok);
}

// --- Submission → frontmatter ---
function baseFrontmatter(s) {
  return {
    credit: s.source_name === 'anonymous' ? "Name withheld at the holder's request" : s.source_name,
    consentPublish: s.consent_publish === 'yes',
    consentAiTraining: s.consent_ai === 'yes',
    consentRecord: s.consent_record || 'verbal consent in audio',
    accessLevel: s.access_level || 'public',
    withdrawn: false,
    reviewedBy: s._validation_status?.by_whom || 'kobo-approved',
    reviewedOn: (s._submission_time || today).slice(0, 10),
    sources: [{ name: s.source_name === 'anonymous' ? 'Community elder' : s.source_name, date: (s.today || today).slice(0, 10) }],
    relatedEntries: [],
    audio: s.audio_recording ? `kobo:${s._id}:audio` : undefined,
    photos: [s.photo_1, s.photo_2].filter(Boolean).map((p) => ({
      src: `kobo:${s._id}:${p.split('/').pop()}`,
      alt: s.name_guz || s.name_en || 'Knowledge photo',
      credit: s.source_name === 'anonymous' ? 'Name withheld' : s.source_name,
      consent: s.consent_publish === 'yes',
    })),
    draft: true,
  };
}

function splitList(v) {
  return String(v ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean);
}

function plantFrontmatter(s) {
  const uses = splitList(s.plant_uses).map((u) => ({
    category: u,
    description: s.summary || '',
    parts: splitList(s.plant_parts),
  }));
  return {
    nameGuz: s.name_guz,
    nameEn: s.name_en,
    nameSw: s.name_sw || undefined,
    nameScientific: s.name_scientific || undefined,
    uses: uses.length ? uses : [],
    habitat: s.plant_habitat ? [s.plant_habitat] : [],
    conservation: s.plant_conservation || 'unknown',
    ...baseFrontmatter(s),
  };
}

function medicineFrontmatter(s) {
  return {
    conditionGuz: s.condition_guz || s.name_guz,
    conditionEn: s.condition_en || s.name_en,
    conditionSw: s.name_sw || undefined,
    symptoms: undefined,
    treatments: s.preparation ? [{
      plants: [],
      preparation: s.preparation,
      precautions: s.precautions || undefined,
    }] : [],
    ...baseFrontmatter(s),
  };
}

function songFrontmatter(s) {
  return {
    title: s.name_guz,
    titleEn: s.name_en || undefined,
    songType: s.song_type || 'other',
    lyrics: s.lyrics || '',
    translationEn: s.lyrics_en || undefined,
    occasion: s.occasion || undefined,
    instruments: splitList(s.instruments),
    ...baseFrontmatter(s),
  };
}

function livestockFrontmatter(s) {
  return {
    nameGuz: s.name_guz,
    nameEn: s.name_en,
    nameSw: s.name_sw || undefined,
    nameScientific: s.name_scientific || undefined,
    animalType: s.animal_type || 'other',
    characteristics: s.characteristics || undefined,
    colourTerms: s.colour_terms ? [{ termGuz: s.colour_terms, description: '' }] : [],
    veterinary: s.veterinary ? [{ condition: '', treatment: s.veterinary, plants: [] }] : [],
    culturalRole: s.cultural_role || undefined,
    conservation: 'unknown',
    ...baseFrontmatter(s),
  };
}

function foodFrontmatter(s) {
  return {
    nameGuz: s.name_guz,
    nameEn: s.name_en,
    nameSw: s.name_sw || undefined,
    kind: 'other',
    ingredients: splitList(s.ingredients),
    method: s.method || undefined,
    occasion: s.food_occasion || undefined,
    ...baseFrontmatter(s),
  };
}

function traditionFrontmatter(s) {
  return {
    nameGuz: s.name_guz,
    nameEn: s.name_en,
    nameSw: s.name_sw || undefined,
    kind: s.tradition_kind || 'other',
    description: s.description || s.summary || '',
    objects: splitList(s.objects_used),
    stillPracticed: s.still_practiced === 'yes',
    ...baseFrontmatter(s),
  };
}

function genericFrontmatter(s) {
  return {
    nameGuz: s.name_guz,
    nameEn: s.name_en,
    nameSw: s.name_sw || undefined,
    nameScientific: s.name_scientific || undefined,
    ...baseFrontmatter(s),
  };
}

const DOMAIN_FM = {
  plant: plantFrontmatter,
  medicine: medicineFrontmatter,
  song: songFrontmatter,
  livestock: livestockFrontmatter,
  food: foodFrontmatter,
  tradition: traditionFrontmatter,
  agriculture: genericFrontmatter,
  ecology: genericFrontmatter,
  material: genericFrontmatter,
  'oral-history': genericFrontmatter,
  language: genericFrontmatter,
  'social-organisation': traditionFrontmatter,
};

// --- YAML serialiser (simple, no library needed) ---
function yamlValue(v, indent = 0) {
  if (v === undefined || v === null) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') {
    if (v.includes('\n')) return `|\n${v.split('\n').map((l) => '  '.repeat(indent + 1) + l).join('\n')}`;
    if (/[:#{}[\],&*?|>!'"%@`]/.test(v) || v === '' || v === 'true' || v === 'false' || v === 'null')
      return JSON.stringify(v);
    return v;
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    if (v.every((i) => typeof i === 'string'))
      return `[${v.map((i) => JSON.stringify(i)).join(', ')}]`;
    return '\n' + v.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const entries = Object.entries(item).filter(([, val]) => val !== undefined);
        const first = entries[0];
        const rest = entries.slice(1);
        let out = '  '.repeat(indent) + `- ${first[0]}: ${yamlValue(first[1], indent + 1)}`;
        for (const [k, val] of rest) {
          out += '\n' + '  '.repeat(indent) + `  ${k}: ${yamlValue(val, indent + 1)}`;
        }
        return out;
      }
      return '  '.repeat(indent) + `- ${yamlValue(item, indent)}`;
    }).join('\n');
  }
  return '';
}

function toYaml(obj) {
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    const v = yamlValue(value, 0);
    if (v.startsWith('\n')) lines.push(`${key}:${v}`);
    else lines.push(`${key}: ${v}`);
  }
  return lines.join('\n');
}

// --- Write a content file ---
function writeEntry(domain, s, dryRun) {
  const dir = DOMAIN_DIR[domain];
  if (!dir) { console.warn(`  skip: unknown domain "${domain}" for ${s._id}`); return null; }

  const fm = (DOMAIN_FM[domain] || genericFrontmatter)(s);
  const id = slug(s.name_guz || s.name_en || `kobo-${s._id}`);
  const filename = `${id}.md`;
  const outDir = path.join(contentDir, dir);
  const outPath = path.join(outDir, filename);

  if (fs.existsSync(outPath)) {
    console.log(`  exists: ${dir}/${filename} (skipped)`);
    return null;
  }

  const body = s.summary || s.description || s.cultural_role || '';
  const content = `---\n${toYaml(fm)}\n---\n\n${body}\n`;

  if (dryRun) {
    console.log(`  would create: ${dir}/${filename}`);
    return filename;
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`  created: ${dir}/${filename}`);
  return filename;
}

// --- Main ---
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fromDirIdx = args.indexOf('--from-dir');
const fromDir = fromDirIdx >= 0 ? path.resolve(args[fromDirIdx + 1]) : null;

let subs;
if (fromDir) {
  const f = path.join(fromDir, 'knowledge-survey.json');
  if (!fs.existsSync(f)) { console.error(`File not found: ${f}`); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  subs = Array.isArray(data) ? data : data.results;
} else {
  // Load .env.local
  const envPath = path.join(root, '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.+)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  }
  subs = await kobo(process.env.KOBO_KNOWLEDGE_SURVEY);
}

const valid = approved(subs);
console.log(`Knowledge survey: ${subs.length} total, ${valid.length} approved`);

if (valid.length === 0) {
  console.log('No approved submissions to sync.');
  process.exit(0);
}

let created = 0;
for (const s of valid) {
  const domain = s.domain;
  const result = writeEntry(domain, s, dryRun);
  if (result) created++;
}

console.log(`\n${dryRun ? 'Would create' : 'Created'}: ${created} entries`);
if (created > 0 && !dryRun) {
  console.log('All entries are draft: true — review and remove the draft flag to publish.');
}
