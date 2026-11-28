// Export the knowledge base in formats ready for AI training.
//
//   node scripts/knowledge/export-training.mjs              # all formats to dist-training/
//   node scripts/knowledge/export-training.mjs --format rag  # one format only
//
// Formats:
//   rag       — JSONL chunks for vector search / RAG retrieval
//   finetune  — instruction–response pairs for model fine-tuning
//   sentences — Ekegusii ↔ English sentence pairs for translation models
//   audio     — manifest of audio recordings with text labels (for ASR/TTS)
//   graph     — the full knowledge graph with typed edges

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contentDir = path.join(root, 'src', 'content');
const outDir = path.join(root, 'dist-training');

const COLLECTIONS = ['plants', 'medicine', 'agriculture', 'livestock', 'songs', 'traditions', 'ecology', 'material', 'food', 'oral-history', 'language'];

// --- Parse frontmatter from Markdown files ---
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let currentKey = null;
  let currentValue = '';
  let inMultiline = false;

  for (const line of m[1].split('\n')) {
    if (inMultiline) {
      if (/^\S/.test(line) && line.includes(':')) {
        data[currentKey] = currentValue.trim();
        inMultiline = false;
      } else {
        currentValue += '\n' + line;
        continue;
      }
    }
    const kv = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const val = kv[2].trim();
      if (val === '|' || val === '>') {
        inMultiline = true;
        currentValue = '';
      } else if (val === 'true') data[currentKey] = true;
      else if (val === 'false') data[currentKey] = false;
      else if (val.startsWith('[') && val.endsWith(']')) {
        try { data[currentKey] = JSON.parse(val); } catch { data[currentKey] = val; }
      } else if (val.startsWith('"') && val.endsWith('"')) data[currentKey] = val.slice(1, -1);
      else data[currentKey] = val;
    }
  }
  if (inMultiline && currentKey) data[currentKey] = currentValue.trim();
  return { data, body: m[2].trim() };
}

// --- Load all entries that consent to AI training ---
async function loadTrainingEntries() {
  const entries = [];
  for (const collection of COLLECTIONS) {
    const dir = path.join(contentDir, collection);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('EXAMPLE-'));
    for (const file of files) {
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, body } = parseFrontmatter(text);
      if (data.draft) continue;
      if (!data.consentPublish) continue;
      if (!data.consentAiTraining) continue;
      if (data.withdrawn) continue;
      if (data.accessLevel === 'restricted') continue;
      entries.push({ id: file.replace(/\.md$/, ''), collection, data, body });
    }
  }
  return entries;
}

// --- RAG format: chunks optimised for vector search ---
function exportRag(entries) {
  return entries.map((e) => {
    const names = [e.data.nameGuz, e.data.nameEn, e.data.nameSw, e.data.nameScientific,
                   e.data.title, e.data.titleEn, e.data.conditionGuz, e.data.conditionEn, e.data.term]
      .filter(Boolean);

    const chunk = [
      `Domain: ${e.collection}`,
      names.length ? `Names: ${names.join(' / ')}` : null,
      e.data.summary || e.body || null,
      e.data.culturalRole ? `Cultural role: ${e.data.culturalRole}` : null,
      e.data.description ? `Description: ${e.data.description}` : null,
      e.data.occasion ? `Occasion: ${e.data.occasion}` : null,
      e.data.lyrics ? `Lyrics: ${e.data.lyrics.slice(0, 500)}` : null,
      e.data.preparation ? `Preparation: ${e.data.preparation}` : null,
      e.data.method ? `Method: ${e.data.method}` : null,
    ].filter(Boolean).join('\n');

    return JSON.stringify({
      id: `${e.collection}/${e.id}`,
      text: chunk,
      metadata: {
        domain: e.collection,
        nameGuz: e.data.nameGuz || e.data.title || e.data.conditionGuz || e.data.term || null,
        nameEn: e.data.nameEn || e.data.titleEn || e.data.conditionEn || e.data.translationEn || null,
        ward: e.data.ward || null,
        hasAudio: Boolean(e.data.audio),
        hasPhotos: Array.isArray(e.data.photos) && e.data.photos.length > 0,
        relatedEntries: e.data.relatedEntries || [],
      },
    });
  }).join('\n');
}

// --- Fine-tuning format: instruction–response pairs ---
function exportFinetune(entries) {
  const pairs = [];
  for (const e of entries) {
    const name = e.data.nameGuz || e.data.title || e.data.conditionGuz || e.data.term || e.id;
    const nameEn = e.data.nameEn || e.data.titleEn || e.data.conditionEn || e.data.translationEn || '';
    const desc = e.data.summary || e.body || e.data.description || '';

    if (nameEn && name) {
      pairs.push({ instruction: `What is "${name}" in Ekegusii?`, response: `"${name}" (${nameEn}) — ${desc}`.trim() });
    }
    if (e.collection === 'plants' && desc) {
      pairs.push({ instruction: `What are the traditional uses of ${nameEn || name}?`, response: desc });
    }
    if (e.collection === 'medicine' && e.data.preparation) {
      pairs.push({ instruction: `How is ${nameEn || name} treated in Abagusii traditional medicine?`, response: `${desc}\n\nPreparation: ${e.data.preparation}`.trim() });
    }
    if (e.collection === 'food' && e.data.method) {
      pairs.push({ instruction: `How is ${nameEn || name} prepared?`, response: `${desc}\n\nMethod: ${e.data.method}`.trim() });
    }
    if (e.collection === 'songs' && e.data.lyrics) {
      pairs.push({ instruction: `What is the song "${name}" about?`, response: `${desc}\n\nLyrics:\n${e.data.lyrics.slice(0, 1000)}`.trim() });
    }
    if (e.collection === 'traditions' && desc) {
      pairs.push({ instruction: `What is the tradition of ${nameEn || name}?`, response: desc });
    }
    if (e.collection === 'language') {
      const cat = e.data.category || '';
      pairs.push({ instruction: `Translate "${name}" from Ekegusii to English`, response: nameEn });
      if (e.data.usageExample) {
        pairs.push({ instruction: `Use "${name}" in a sentence in Ekegusii`, response: e.data.usageExample });
      }
    }
  }
  return pairs.map((p) => JSON.stringify(p)).join('\n');
}

// --- Sentence pairs: Ekegusii ↔ English ---
function exportSentences(entries) {
  const pairs = [];
  for (const e of entries) {
    const guz = e.data.nameGuz || e.data.title || e.data.conditionGuz || e.data.term;
    const en = e.data.nameEn || e.data.titleEn || e.data.conditionEn || e.data.translationEn;
    if (guz && en) pairs.push({ guz, en, domain: e.collection });

    if (e.data.usageExample && e.data.usageTranslationEn) {
      pairs.push({ guz: e.data.usageExample, en: e.data.usageTranslationEn, domain: e.collection });
    }
    if (e.data.lyrics && e.data.translationEn) {
      const guzLines = e.data.lyrics.split('\n').filter(Boolean);
      const enLines = e.data.translationEn.split('\n').filter(Boolean);
      const count = Math.min(guzLines.length, enLines.length);
      for (let i = 0; i < count; i++) {
        pairs.push({ guz: guzLines[i].trim(), en: enLines[i].trim(), domain: 'songs' });
      }
    }
  }
  return pairs.map((p) => JSON.stringify(p)).join('\n');
}

// --- Audio manifest: paired text + audio for ASR/TTS training ---
function exportAudio(entries) {
  const manifest = [];
  for (const e of entries) {
    if (!e.data.audio) continue;
    const text = e.data.nameGuz || e.data.title || e.data.conditionGuz || e.data.term || '';
    manifest.push({
      audio_ref: e.data.audio,
      text,
      text_en: e.data.nameEn || e.data.titleEn || e.data.conditionEn || e.data.translationEn || '',
      language: 'guz',
      domain: e.collection,
      id: `${e.collection}/${e.id}`,
      speaker: e.data.credit,
    });
  }
  return manifest.map((m) => JSON.stringify(m)).join('\n');
}

// --- Knowledge graph: entities with typed edges ---
function exportGraph(entries) {
  const nodes = [];
  const edges = [];
  for (const e of entries) {
    const name = e.data.nameGuz || e.data.title || e.data.conditionGuz || e.data.term || e.id;
    nodes.push({
      id: `${e.collection}/${e.id}`,
      domain: e.collection,
      nameGuz: name,
      nameEn: e.data.nameEn || e.data.titleEn || e.data.conditionEn || e.data.translationEn || null,
      nameSw: e.data.nameSw || e.data.conditionSw || null,
      nameScientific: e.data.nameScientific || null,
    });
    for (const rel of (e.data.relatedEntries || [])) {
      edges.push({ from: `${e.collection}/${e.id}`, to: rel, type: 'related' });
    }
    if (e.collection === 'medicine' && Array.isArray(e.data.treatments)) {
      for (const t of e.data.treatments) {
        for (const p of (t.plants || [])) {
          edges.push({ from: `${e.collection}/${e.id}`, to: `plants/${p}`, type: 'uses-plant' });
        }
      }
    }
    if (e.collection === 'traditions') {
      for (const p of (e.data.plantsUsed || [])) edges.push({ from: `${e.collection}/${e.id}`, to: `plants/${p}`, type: 'uses-plant' });
      for (const s of (e.data.songsPerformed || [])) edges.push({ from: `${e.collection}/${e.id}`, to: `songs/${s}`, type: 'performs-song' });
      for (const f of (e.data.foodPrepared || [])) edges.push({ from: `${e.collection}/${e.id}`, to: `food/${f}`, type: 'prepares-food' });
    }
  }
  return JSON.stringify({ nodes, edges, exported: new Date().toISOString() }, null, 2);
}

// --- Main ---
const args = process.argv.slice(2);
const formatArg = args.indexOf('--format');
const requestedFormat = formatArg >= 0 ? args[formatArg + 1] : null;

const entries = await loadTrainingEntries();
console.log(`Found ${entries.length} entries with AI-training consent`);

if (entries.length === 0) {
  console.log('No entries to export. Collect knowledge and set consentAiTraining: true.');
  process.exit(0);
}

const domainCounts = {};
for (const e of entries) domainCounts[e.collection] = (domainCounts[e.collection] || 0) + 1;
console.log('By domain:', Object.entries(domainCounts).map(([k, v]) => `${k}: ${v}`).join(', '));

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const FORMATS = {
  rag: { fn: exportRag, ext: 'jsonl', label: 'RAG chunks' },
  finetune: { fn: exportFinetune, ext: 'jsonl', label: 'fine-tuning pairs' },
  sentences: { fn: exportSentences, ext: 'jsonl', label: 'sentence pairs' },
  audio: { fn: exportAudio, ext: 'jsonl', label: 'audio manifest' },
  graph: { fn: exportGraph, ext: 'json', label: 'knowledge graph' },
};

const toExport = requestedFormat ? { [requestedFormat]: FORMATS[requestedFormat] } : FORMATS;
if (requestedFormat && !FORMATS[requestedFormat]) {
  console.error(`Unknown format: ${requestedFormat}. Available: ${Object.keys(FORMATS).join(', ')}`);
  process.exit(1);
}

for (const [name, { fn, ext, label }] of Object.entries(toExport)) {
  const content = fn(entries);
  const lines = ext === 'json' ? 1 : content.split('\n').filter(Boolean).length;
  const outPath = path.join(outDir, `knowledge-${name}.${ext}`);
  fs.writeFileSync(outPath, content + '\n', 'utf8');
  console.log(`  ${label}: ${lines} ${ext === 'json' ? 'graph' : 'rows'} → ${path.relative(root, outPath)}`);
}

console.log(`\nTraining data exported to ${path.relative(root, outDir)}/`);
