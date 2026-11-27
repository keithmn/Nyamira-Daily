# The Abagusii Cultural Knowledge Base

A comprehensive, community-owned, consent-based digital archive of everything that makes the Abagusii community what it is — language, ecology, medicine, agriculture, livestock, music, tradition, law and craft — structured from the ground up so that an AI can understand this community the way an elder does.

## What this is

Most indigenous knowledge lives in the memories of people over sixty. When they die, it goes with them. Published research captures fragments — a grammar, a plant list, a ceremony description — but no single resource connects them, and none belongs to the community.

This project documents that knowledge as public information — the same way Gusii Daily documents county budgets and health facilities. Not a museum exhibit behind glass, but a living, growing, verified knowledge graph where:

- A **plant** connects to its **Ekegusii name**, the **medicines** it makes, the **ceremonies** it appears in, the **songs** that mention it, the **soil** it grows in, the **season** it fruits, and the **elder** who verified all of this.
- A **proverb** connects to the **animals** or **plants** it references, the **value** it teaches, the **situations** where it is used, and the **dialect** it comes from.
- A **ceremony** connects to the **songs** performed, the **plants** used, the **objects** made, the **roles** each person plays, the **food** prepared, and the **time of year** it happens.

Everything connects to everything. That is how culture works, and that is how an AI must learn it.

## What already exists

The codebase has the structural foundation:

| Component | Decision | Status |
|---|---|---|
| **Ekegusii language collection** | #129 | Schema complete, consent model, AI export at `/api/language.json`. Empty — needs entries. |
| **Culture archive** | #122 | Schema with 13 kinds (story, song, proverb, custom, craft, food, history, name, riddle, lullaby, ceremony, medicine, other). Consent-first: `consentPublish`, `consentAiTraining`, `withdrawn`. Empty. |
| **Heritage collection** | #130 | Stories with photos, sources, evidence labels. Empty. |
| **Language metadata** | #129 | ISO 639-3 (guz), noun class system, linguistic sources. Complete. |
| **Consent framework** | #65, #122 | Separate consent for publication and AI training. Withdrawal respected everywhere. Built into every schema. |
| **Evidence labels** | Core | Verified, audit, official, unverified. Every claim needs one. |

What's missing: the structured knowledge domains that connect the archive's narrative entries to queryable, machine-readable facts.

## The twelve domains

Each domain is a kind of knowledge. Together they describe the community completely.

### 1. Language (Ekegusii / Gusii — ISO 639-3: guz)

**What:** Every word, phrase, idiom, greeting, proverb, riddle, tongue twister, euphemism, praise name, clan term, age-graded expression, children's game phrase, counting form, and grammar pattern — with pronunciation, tones, noun classes, dialect variation, and usage context.

**Already built:** The `language` content collection with full schema. Needs entries.

**What to add:**
- Riddles (enigero) as a category — they have a call-and-response structure
- Praise names (ebituro) — with the person or clan they praise
- Taboo language and euphemisms — with the context where the direct word is avoided
- Register markers — which forms are respectful, which are intimate, which are for children
- Dialectal variation — Rogoro, South Mugirango, Maate and other dialects differ

**Sources:** Elders, teachers, published grammars (Cammenga 2002, Whiteley 1960), Bible translations, Ekegusii radio programmes.

### 2. Ethnobotany (Ebitondo — plants and trees)

**What:** Every plant and tree known to the community, with its Ekegusii name (and variant names by clan or dialect), scientific name, traditional uses (food, medicine, construction, ceremony, dye, tool, shade, boundary), habitat, and conservation status.

**Fields:**
- `nameGuz` — Ekegusii name(s), including dialectal variants
- `nameScientific` — Latin binomial (verified by a botanist)
- `nameSw` — Kiswahili name
- `nameEn` — English common name
- `family` — botanical family
- `uses` — array of uses, each with a category (medicinal, food, construction, ceremony, dye, fibre, tool, shade, boundary, ornamental, spiritual) and description
- `habitat` — where it grows (riverbank, hilltop, homestead, forest, cultivated)
- `parts` — which parts are used (root, bark, leaf, fruit, seed, sap, flower, wood)
- `season` — when it fruits, flowers, or is harvested
- `conservation` — common, declining, rare, locally extinct
- `threats` — what threatens it (land clearing, overharvesting, climate change)
- `photo` — with consent and credit
- `audio` — pronunciation of the name
- `relatedMedicine` — links to medicine entries
- `relatedCeremony` — links to ceremony entries
- `relatedProverb` — links to proverbs that mention it
- `verifiedBy` — who confirmed the identification (elder, botanist, or both)

**Collection method:** Walk-and-talk interviews with elders who know plant names. A botanist or agricultural extension officer accompanies for scientific identification. Photographs of leaves, bark, flowers, fruit. GPS coordinates of specimen trees.

**Why it matters:** Gusii highlands had dense tree cover and rich plant diversity. Deforestation and tea/sugarcane monoculture have eliminated many species from daily life. The names are going — when the plant disappears, its name follows within a generation.

### 3. Traditional medicine (Oboganga)

**What:** The conditions the community recognised, the treatments used, the plants and preparations, and the practitioners who carried this knowledge — presented as cultural heritage, never as health advice.

**Fields:**
- `conditionGuz` — the Ekegusii name for the condition
- `conditionEn` — English description
- `symptoms` — how the condition was recognised
- `treatments` — array: each with the plants used, preparation method, dosage/duration (as described by the source), and any precautions
- `plants` — links to ethnobotany entries
- `practitionerType` — who administered (herbalist, bonesetter, birth attendant, diviner, any elder)
- `stillPracticed` — whether this treatment is still in use
- `pharmacological` — whether any scientific study has examined this treatment (with citation if yes)
- `safetyNote` — required: "This is a cultural record, not medical advice. Consult a qualified health professional."

**Ethics:**
- Some medicinal knowledge is considered proprietary by specific practitioners or clans. The consent model must allow a contributor to share knowledge publicly OR restrict it to the archive (not published, but preserved).
- Medicine entries always carry the safety disclaimer.
- No entry claims efficacy. We record what was done, not what works.
- Where pharmacological research exists (many East African medicinal plants have been studied), we cite it without endorsing or dismissing the traditional use.

**Sources:** Traditional healers (abanyamoriogi), birth attendants (ababisia), bonesetting practitioners, elder women (who often hold the most detailed plant knowledge), published ethnobotanical surveys of Kisii/Nyamira.

### 4. Agriculture and food (Oboremi)

**What:** Every crop variety the community grew, the farming calendar, soil management, seed preservation, food processing and storage, and traditional tools.

**Sub-domains:**

**Heritage seeds and crops:**
- `nameGuz` — Ekegusii name for the variety
- `nameScientific` — species and variety
- `cropType` — grain, root, vegetable, fruit, spice, stimulant
- `varieties` — specific varieties (types of finger millet, sorghum, beans, etc.)
- `growingSeason` — when planted, when harvested, in relation to Gusii seasons
- `soilPreference` — traditional knowledge about which soils
- `seedSource` — where seed can still be found (a gene bank, a farmer who still grows it, locally extinct)
- `preparation` — how it was processed and eaten
- `storage` — how it was preserved
- `culturalRole` — ceremonial uses, bride price, hospitality

**Key varieties to document:**
- Sorghum (amasaka) — multiple varieties by colour and use
- Finger millet (obore) — the original Gusii staple
- Beans — many traditional varieties before commercial hybrids
- Bananas — specific cooking and brewing varieties
- Traditional vegetables (chinsaga, rinagu, enderema and others)

**Collection method:** Interviews with elder farmers. Visit farms that still grow heritage varieties. Partner with Kenya Agricultural and Livestock Research Organisation (KALRO) or the Gene Bank of Kenya for scientific identification. Photograph and describe each variety.

### 5. Livestock and animal husbandry (Ebitonga)

**What:** The breeds of cattle, sheep, goats, and poultry the community traditionally kept, their characteristics, Ekegusii names for colours, markings and types, husbandry practices, veterinary folk knowledge, and breed conservation status.

**Fields:**
- `animalType` — cattle, sheep, goat, poultry, dog, other
- `breedNameGuz` — Ekegusii name
- `breedNameScientific` — recognised breed name (e.g. East African Zebu, Red Maasai sheep, Small East African goat)
- `colourTerms` — Ekegusii colour and marking vocabulary (Gusii cattle vocabulary is extensive)
- `characteristics` — size, temperament, production, disease resistance
- `husbandry` — traditional feeding, housing, breeding practices
- `veterinary` — traditional treatments for livestock diseases, with the plants used (links to ethnobotany)
- `culturalRole` — bride price values, ceremony uses, status markers
- `conservation` — still common, crossbred, rare, locally extinct
- `geneticInfo` — breed registry references, DNA studies if any exist

**Why it matters:** The original Gusii cattle (a local East African Zebu type, adapted to the highlands over centuries) are being crossbred out of existence with Friesian and Ayrshire. The genetic adaptation to local diseases, altitude and forage is irreplaceable. The same is happening with indigenous goat and sheep breeds.

**Sources:** Elder livestock keepers, veterinary officers who remember the old breeds, Kenya Livestock Breeders Organisation, ILRI (International Livestock Research Institute — based in Nairobi), published breed surveys.

### 6. Ecology and wildlife (Ebiomanyi — the natural world)

**What:** Every animal, bird, insect and fish the community knew — with Ekegusii names, habitat, behaviour as the community understood it, proverbs and stories about it, and current status.

- Mammals that lived in the Gusii highlands (before forest clearing)
- Birds — the community's names and associations
- Insects — including those with medicinal or agricultural significance
- Fish — river species
- Reptiles and amphibians
- The ecological relationships the community understood (which birds mean rain, which insects mean a good harvest)

### 7. Music and performance (Ebisagane)

**What:** Every type of song, the instruments, the dances, the occasions, and the texts — in full, with translations and context.

**Fields:**
- `title` — if it has one
- `type` — work song, ceremony, entertainment, mourning, lullaby, war, praise, satirical, children's game
- `lyrics` — full Ekegusii text
- `translation` — English and/or Kiswahili
- `occasion` — when and where it is performed
- `instruments` — links to instrument entries (obokano, chinsimba, ebisiriri, drums, etc.)
- `dance` — associated dance form, if any
- `performers` — who performs (men, women, children, specific roles)
- `audio` — recording with consent
- `video` — if recorded
- `notation` — if someone has transcribed the melody

**Instruments** deserve their own entries: Ekegusii name, description, materials, how it is made, how it is played, who plays it, what occasions, and whether anyone still makes them.

### 8. Traditions and ceremonies (Ebirimo)

**What:** Every ceremony, rite, custom and social practice — what happens, why, when, who participates, what objects and plants are used, what songs are sung, what food is prepared.

- Rites of passage (naming, coming of age, marriage, death)
- Seasonal ceremonies (planting, harvest, new year)
- Conflict resolution (Gusii traditional justice: amaragoli, obokerebe)
- Hospitality customs
- House building and homestead layout
- Taboos and their explanations
- Gift-giving protocols
- Greeting sequences (which vary by relationship, age, occasion)

**Sensitivity:** Some ceremonial knowledge is restricted — by gender, age, or initiation status. The consent model must allow a contributor to mark knowledge as "archive only" (preserved but not published) or "restricted" (available only to qualified researchers with community approval).

### 9. Social organisation (Etureti — the system of living)

**What:** The clan system, age sets, kinship terminology, leadership structures, and land management — the social software that organised daily life.

- **Clans** (ebiaro) — names, territories, totems, obligations, relationships between clans
- **Age sets** (ebisaku) — the system, the names, the transitions
- **Kinship terminology** — the full Ekegusii kinship vocabulary (which is extensive and structurally different from English)
- **Conflict resolution** — traditional courts, the role of elders, the process
- **Land** — traditional land tenure, boundaries, inheritance rules

### 10. Material culture (Ebintu — the things people made)

**What:** Traditional architecture, tools, pottery, basketry, weaving, clothing, adornment, soapstone carving, musical instruments, weapons — how they were made, from what materials, by whom.

- Building techniques (round houses, granaries, cattle enclosures)
- Tools (farming, cooking, craft)
- Pottery — forms, uses, makers
- Basketry and weaving — patterns, materials, makers
- Soapstone carving (Kisii soapstone is world-famous)
- Clothing and body decoration
- Each entry links to the plants (materials) and ceremonies (occasions) it connects to

### 11. Oral history and cosmology (Ebinto bia kare — the deep past)

**What:** Migration narratives, clan histories, place name origins, the relationship with neighbouring peoples (Luo, Kipsigis, Maasai), and traditional beliefs about the world.

- Origin stories and migration routes
- Founding events of each clan
- Place names and their etymology
- Historical events preserved in oral tradition
- Traditional beliefs about God (Engoro), spirits, ancestors
- Sacred places and their significance
- Dreams, omens and divination
- Taboos and their cosmological explanations

**Ethics:** Spiritual knowledge is especially sensitive. Some of it is considered dangerous to share outside its context. The consent model must respect this absolutely.

### 12. Food and drink (Chinyenyeri)

**What:** Every traditional dish, drink and preparation — ingredients, method, occasion, and the vocabulary around food.

- Staple preparations (obokima, chinsaga, rinagu, etc.)
- Brewing (obusaa, amarua and other fermented drinks)
- Ceremonial foods
- Preservation methods (smoking, drying, fermentation)
- Food taboos (who cannot eat what, and why)
- Hospitality food (what is served to guests, and in what order)
- Seasonal foods
- Links to the crop varieties and plants used

## The knowledge graph

The power of this architecture is in the connections. Every entry in every domain links to related entries in other domains:

```
           ┌─────────────┐
           │   Language   │◄──── every entry in every domain
           │  (Ekegusii)  │      has an Ekegusii name
           └──────┬───────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│ Plants │◄─┤ Medicine │  │  Songs   │
│        │──┤          │  │          │
└───┬────┘  └──────────┘  └────┬─────┘
    │                          │
    ▼                          ▼
┌────────┐              ┌───────────┐
│  Food  │◄─────────────┤ Ceremony  │
│        │              │           │
└────────┘              └─────┬─────┘
                              │
              ┌───────────────┼──────────────┐
              ▼               ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Material │   │ Ecology  │   │ Social   │
        │ culture  │   │          │   │ org      │
        └──────────┘   └──────────┘   └──────────┘
```

A single query — "What plants are used in a naming ceremony?" — traverses from Ceremony → Plants → Ethnobotany, returning the plant names (in Ekegusii and scientific), how they are prepared, where they grow, and who verified this.

This graph is what makes the AI possible. Without it, an AI gets text. With it, an AI gets understanding.

## Data architecture

### Content collections (Astro, Markdown files)

For narrative, contextual, long-form entries — the kind of knowledge that needs a human voice:

```
src/content/
  language/       ← existing (#129): words, phrases, grammar
  archive/        ← existing (#122): stories, songs, proverbs, customs
  heritage/       ← existing (#130): heritage stories with photos
  plants/         ← NEW: one file per plant species
  medicine/       ← NEW: one file per condition/treatment
  livestock/      ← NEW: one file per breed/animal type
  agriculture/    ← NEW: one file per crop variety or practice
  songs/          ← NEW: one file per song (with full lyrics)
  traditions/     ← NEW: one file per ceremony or custom
  ecology/        ← NEW: one file per species
  material/       ← NEW: one file per craft, tool, or technique
  food/           ← NEW: one file per dish or preparation
  oral-history/   ← NEW: one file per narrative or place name
```

Each collection gets its own Zod schema in `content.config.ts`, inheriting the shared consent model:

```typescript
// Every knowledge entry has these fields
const knowledgeBase = {
  nameGuz: z.string(),
  nameEn: z.string(),
  nameSw: z.string().optional(),
  summary: z.string(),
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
  ...publication,
};
```

### Structured data (JSON, build-time)

For queryable, machine-readable facts that the graph is built from:

```
src/data/
  knowledge/
    plant-index.json      ← ID, names, family, uses, links
    medicine-index.json   ← ID, condition, plants, links
    livestock-index.json  ← ID, breed, characteristics, links
    crop-index.json       ← ID, varieties, seasons, links
    species-index.json    ← ID, names, habitat, status
    kinship-terms.json    ← the full kinship vocabulary
    clan-index.json       ← clans, territories, totems
    instrument-index.json ← instruments, materials, makers
```

These are generated from the content collections at build time (like `facilities.json` is generated from source data). They power:
- The knowledge graph API (`/api/knowledge.json`)
- Cross-referencing on the site (a plant page shows the ceremonies that use it)
- The AI training export

### AI training export

```
/api/knowledge.json — the full graph, public entries only, AI-consented only
/api/language.json  — already exists: language entries with AI consent
```

The knowledge export is structured as entities and relationships:

```json
{
  "entities": [
    {
      "id": "plant-omote",
      "domain": "ethnobotany",
      "nameGuz": "omote",
      "nameScientific": "Markhamia lutea",
      "nameEn": "Nile tulip tree",
      "uses": ["construction", "medicine", "boundary"],
      "source": "Mzee Ombati, Bogichora ward, 2027-03-15",
      "verifiedBy": "Dr. Nyakundi (botanist)"
    }
  ],
  "relationships": [
    {
      "from": "plant-omote",
      "to": "medicine-headache-bark-tea",
      "type": "used-in",
      "detail": "Bark boiled for headache tea"
    },
    {
      "from": "plant-omote",
      "to": "ceremony-house-building",
      "type": "used-in",
      "detail": "Corner posts of a traditional house"
    },
    {
      "from": "proverb-omote-omorembe",
      "to": "plant-omote",
      "type": "references",
      "detail": "The proverb uses the tree as a metaphor for patience"
    }
  ]
}
```

## Collection methodology

### KoboToolbox forms

Extend the existing fieldwork infrastructure with new forms:

| Form | For | Method |
|---|---|---|
| **Plant survey** | Record a plant with its Ekegusii name, uses, and photo | Walk with elder + botanist, record at the plant |
| **Elder interview** | Record oral history, ceremony, custom, song | Structured interview, audio recorded, transcript later |
| **Seed/crop record** | Document a heritage crop variety | Visit a farm that still grows it, photograph, record details |
| **Livestock record** | Document a breed with characteristics | Visit keeper, photograph animal, record traits |
| **Song recording** | Capture lyrics, translation, context, audio | At the performer's home or a cultural event |
| **Place name record** | Record the Ekegusii name and story of a place | At the place, with the elder who knows its history |

Each form inherits the consent model: consent checkbox for publication, separate checkbox for AI training, privacy checkbox (no names without consent), reviewer field.

### Who collects

| Collector | Domain | Why they're the right person |
|---|---|---|
| **Elders (abagaka)** | Everything | They hold the knowledge. They are the primary source. |
| **Traditional healers** | Medicine, plants | Specialised knowledge of preparations and dosages |
| **Elder women** | Food, plants, childcare, pottery | Women often hold the most detailed everyday knowledge |
| **Farmers (60+)** | Agriculture, seeds, livestock | Remember varieties that are no longer grown |
| **Botanist/KALRO officer** | Plants | Scientific identification alongside traditional names |
| **Veterinary officer** | Livestock | Breed identification alongside traditional knowledge |
| **Music teacher / cultural group** | Songs, instruments, dance | They perform and teach the traditions |
| **Language teacher** | Language | They study and teach Ekegusii formally |
| **Community youth** | Collection assistants | They operate the phones and learn the knowledge |

### The interview protocol

1. **Before:** explain the project, the consent model, and that the person can withdraw at any time. Bring the consent form (printed, Ekegusii and English).
2. **Record:** audio (phone recorder), photos (phone camera), GPS (KoboCollect), and the structured form.
3. **Review:** a reviewer (not the recorder) checks the entry against the audio and marks it reviewed.
4. **Verify:** where possible, a second source confirms the knowledge. For plants, a botanist confirms the scientific identification. For medicine, we note whether pharmacological literature exists.
5. **Publish:** only with `consentPublish: true` and `reviewedBy` set. AI export only with `consentAiTraining: true`.

### The consent framework

Three levels, each independent:

| Level | What it means | Default |
|---|---|---|
| **consentPublish** | The entry appears on the website | Required for publication |
| **consentAiTraining** | The entry is included in the AI training export | Off by default, opt-in |
| **accessLevel: restricted** | The entry is preserved in the archive but not published, available only to approved researchers | Available for sensitive knowledge |

A contributor can:
- Share knowledge publicly and for AI training
- Share publicly but not for AI
- Share for the archive only (preserved, not published)
- Withdraw at any time (the `withdrawn` flag removes it from everything)

## Editorial framework

### The journalistic mandate

Cultural knowledge is public information. It belongs to the Abagusii community the same way county budget figures belong to the public — no one person or organisation owns it, and everyone has a right to access it.

Gusii Daily's role is journalistic: we collect, verify, structure and publish this knowledge with the same rigour we apply to county budgets and facility records. Every entry has a source, a date, an evidence label and a reviewer. This is not extraction — it is documentation. The same editorial standards that govern our civic data govern our cultural data.

### Principles

1. **Public knowledge, structured as journalism.** Cultural knowledge belongs to the Abagusii community. We analyse and structure it the same way we handle any public information — with sources, verification and evidence labels.

2. **Informed consent for contributors.** The knowledge is public, but the act of sharing it with us is personal. Contributors consent to publication, and separately to AI training. They can withdraw at any time. The consent form is explained verbally in Ekegusii.

3. **Restricted knowledge is respected.** Some knowledge is restricted by tradition — by gender, age, initiation, or clan. The collector must ask: "Is this something anyone can know, or is it for certain people?" If restricted, it goes to the archive with `accessLevel: restricted` — preserved but not published, available only to approved researchers with community approval.

4. **Credit where wanted, anonymity where wanted.** Contributors choose whether to be named. The default is anonymity.

5. **Medicine is heritage, not prescription.** Every medicine entry carries a safety disclaimer. We document what was done, not what should be done.

6. **Verification, not validation.** We verify that this is what the community knows (source, date, reviewer). We do not validate whether traditional knowledge is "correct" by Western scientific standards. Where scientific research exists, we cite it alongside the traditional knowledge without ranking them.

7. **Multiple accounts, not one truth.** Where oral accounts differ — on a migration route, a ceremony's sequence, a plant's use — we publish each version with its source, rather than choosing a winner. This is how journalism handles disputed facts, and it is how oral tradition works.

### Legal

- **Data Protection Act 2019 (Kenya):** register with ODPC before collecting personal data (already in STATUS.md).
- **Traditional Knowledge and Cultural Expressions Act:** understand and comply with community rights over traditional knowledge.
- **Copyright Act:** original expressions (songs, stories) are copyright of the creator/community.
- **CC BY 4.0:** the site's default licence, applied to our structured documentation of public cultural knowledge.

## Phased rollout

### Phase K1: Language and proverbs (start now)

The language collection is ready. Start with what requires no field equipment and no specialist:
- Record 100 common Ekegusii words with pronunciation, translation, and usage examples
- Record 50 proverbs with their meanings, contexts, and the animals/plants they reference
- Record 20 riddles (enigero) with their answers
- Record 10 greetings for different occasions
- Record the kinship terminology system

**Who:** Anyone who speaks Ekegusii. A phone with a voice recorder. The language KoboToolbox form (to be built).

### Phase K2: Plants and food (months 2-3)

The most urgent preservation need — elder women who know plant names and food preparation.
- Identify and photograph 50 common plants with Ekegusii names and uses
- Document 20 traditional dishes with ingredients, method, and occasion
- Document 10 traditional drinks and fermentations
- Record heritage crop varieties that are still grown locally

**Who:** Elder women, a botanist or agricultural extension officer, a youth recorder.

### Phase K3: Songs and ceremonies (months 3-5)

Requires trust and relationship. The recorder must be someone the community accepts.
- Record 30 songs across all types (work, ceremony, children's, mourning, praise)
- Document 10 ceremonies with their full sequence, objects, songs, and food
- Record the age-set system and clan histories from multiple sources

**Who:** Cultural group performers, clan elders, ceremony participants.

### Phase K4: Medicine and ecology (months 5-8)

Requires the most sensitivity and the most verification.
- Document 30 medicinal plants with traditional healers
- Scientific identification by a botanist
- Cross-reference with published ethnobotanical literature
- Document 20 animal species with Ekegusii names and cultural significance
- Document traditional livestock breeds with veterinary officer

**Who:** Traditional healers (with established trust), botanist, veterinary officer.

### Phase K5: The full graph (months 8-12)

- Link every entry to its related entries across domains
- Build the knowledge graph API
- Begin AI training experiments
- Community review: gather people to review and correct entries

## What makes this different

1. **Journalism, not extraction.** This is not a university dataset taken for academic papers, or a Silicon Valley training set scraped without consent. It is structured documentation of public cultural knowledge, published with the same editorial standards as our civic data: sources, evidence labels, review.

2. **Consent-first contributors.** The knowledge is public, but sharing it is personal. Every entry has explicit, informed consent. AI training consent is separate and opt-in. Withdrawal is instant and permanent.

3. **Structured for AI.** Not a PDF collection or a blog. Typed entities, typed relationships, structured exports. An AI trained on this understands that omote is both a tree and medicine and a building material and a metaphor in proverbs — because the graph connects them.

4. **Verified by practitioners.** Not "someone read a Wikipedia article." A healer verifies the medicine. A botanist verifies the plant. An elder verifies the ceremony. Each entry says who and when.

5. **Living.** New knowledge is added through the same KoboToolbox pipeline. The community keeps contributing. The graph keeps growing. This is not a one-time documentation project — it is a permanent infrastructure for cultural memory.

6. **Connected to the civic data.** The same map that shows health facilities shows the sacred grove. The same ward page that shows the budget shows the clan history. Culture and governance are not separate — they are the same community.

## For the AI

The end goal: an AI that can answer "What tree do you plant at the corner of a new house, and why?" not by looking up a fact, but by understanding that the omote tree has strong wood (ethnobotany), that it marks a boundary (social organisation), that planting it at the foundation is part of the house-building ceremony (traditions), that the ceremony includes specific songs (music), that the bark is also used for headache tea (medicine), and that there is a proverb about patience that uses the omote as its metaphor (language).

That depth of understanding — a tree is never just a tree — is what makes a culturally aware AI different from a translation engine. And the only way to build it is to ask the people who know.
