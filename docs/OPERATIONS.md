# Editorial operations guide

How to keep Nyamira Daily alive after launch. This is the repeatable system: what to publish, how often, and the exact steps. Everything here uses tools already built into the site.

Read `AGENTS.md` first (the rules), then `EDITORIAL_RULES.md` (the standards), then come back here for the rhythm.

## The weekly heartbeat: Number of the Week

**Effort:** 30–60 minutes. **Frequency:** every Saturday or Sunday. **Impact:** proves the site is alive; gives radio stations something to read.

A Number of the Week is one figure, one source, one paragraph, and a radio script. The schema is in `src/content.config.ts` (the `numbers` collection). One published example exists: `src/content/numbers/2026-10-26-development-37.md`.

### How to write one

1. **Pick a figure** from data already on the site. Good sources:
   - A line from `/money/` that readers would not have noticed (e.g. pending bills, a department's absorption rate, local revenue per person)
   - A facility count or gap (e.g. "4 of 20 wards have no listed water point")
   - A contract or project figure (e.g. "KSh X allocated, KSh 0 reported spent")
   - A KCSE or health indicator that changed
   - A census figure that surprises (e.g. population density, age distribution)

2. **Create the file** at `src/content/numbers/YYYY-MM-DD-short-slug.md`:

```markdown
---
week: YYYY-MM-DD
figure: "37%"
sentence: "of Nyamira's development budget was used in 2024/25."
explanation: "Development money pays for things that last: roads, classrooms, dispensaries and water. In 2024/25 the county spent KSh 1.05 billion of it, 37 per cent of what was set aside."
evidenceLabel: official
sources:
  - { name: "Controller of Budget, County Governments Budget Implementation Review Report FY2024/25", url: "https://cob.go.ke/...", page: "section 3.34, pp.388–391" }
radioScript: "This week's number is thirty-seven..."
swSummary: "Asilimia 37 tu ya bajeti ya maendeleo..."
draft: false
---
```

3. **The fields that matter:**
   - `figure` — the number itself, with its unit ("37%", "KSh 1.05B", "4 of 20")
   - `sentence` — finishes the phrase "This week's number is [figure]: [sentence]"
   - `explanation` — 2–4 plain-language sentences: what it means, why it matters, what a reader can do
   - `evidenceLabel` — one of: verified, audit, official, unverified
   - `sources` — at least one, with a URL and ideally a page number
   - `radioScript` — the same content rewritten to be read aloud on radio (spell out numbers, no abbreviations, end with the site name)
   - `swSummary` — one sentence in Kiswahili (mark for native-speaker review)
   - `draft: false` to publish immediately, or `draft: true` to hold for review

4. **Build and check:** `npm run build` — the number appears on `/number-of-the-week/` and in the RSS feed.

### Number of the Week ideas (starter list)

These are all figures already on the site with their sources. Pick one per week.

| Figure | Source page | Angle |
|---|---|---|
| KSh 6.17B spent in FY2023/24 (highest year) | /money/history/ | The peak year of county spending |
| 37% development absorption FY2024/25 | /money/ | Most of the development budget was not used |
| 127 of 247 facilities are unverified | /map/ | More than half our listed places have never been visited |
| 0 field observations so far | /map/ | We are asking for your help to check |
| KSh 357.1M ward projects FY2025/26 | /ward/ | What is budgeted for your ward this year |
| Pending bills (from money.json) | /money/ | Money the county owes but has not paid |
| Local revenue vs transfers ratio | /money/revenue/ | How much the county raises itself |
| KCSE candidature by constituency | /map/education/ | Where students sit the exam |
| Health facility density per ward | /map/health/ | Which wards have fewest clinics |
| Tea bonus vs milk prices | /money/farming/ | The two crops that pay most households |

---

## The monthly anchor: Explainers

**Effort:** 2–4 hours. **Frequency:** 1–2 per month. **Impact:** builds authority; the kind of content that gets linked and cited.

An explainer walks through one topic using the site's own data. Two are drafted (`twelve-years-of-county-money.md`, `development-budget.md`); publish them first.

### How to write one

1. **Pick a topic** where the data is already on the site and raises a question a resident would ask:
   - "Where does the county's money actually go?" (the twelve-years draft)
   - "What does 'development budget' mean and why is absorption low?"
   - "How does the ward development fund work?"
   - "What is NG-CDF and why is it separate from county money?"
   - "How to read a Controller of Budget report"
   - "What happens at a county budget forum"

2. **Create the file** at `src/content/explainers/short-slug.md`:

```markdown
---
title: "KSh 59.6 billion: twelve years of Nyamira's money"
summary: "What the Controller of Budget's figures show..."
topic: Money
sources:
  - { name: "Controller of Budget...", url: "...", page: "..." }
updated: 2026-11-26
readingLevel: easy
swSummary: "..."
draft: true
---

Lead with the number. Plain language. Short sentences.
```

3. **The editorial rules that matter most here:**
   - Every figure has a source (rule 1)
   - Questions, not accusations (rule 3)
   - Show conflicts between sources (rule 5)
   - Report what works too (rule 7)
   - Plain language, lead with the number (rule 6)

4. **Publish:** set `draft: false`, build, check the page and the RSS feed.

### Explainer pipeline

| Priority | Topic | Data source | Status |
|---|---|---|---|
| 1 | Twelve years of county money | money.json, CoB reports | Drafted |
| 2 | What "development budget" means | money.json | Drafted |
| 3 | How to read a CoB report | money.json + a sample report | To write |
| 4 | NG-CDF vs county money | contracts.json (scope labels) | To write |
| 5 | The ward development fund | wardspend.json | To write |
| 6 | How county fees are set | fees.json | To write |
| 7 | What the Auditor-General checks | audit.json | To write |

---

## YouTube and NY Watch

**Effort:** 4–8 hours per episode (research, script, record, edit, publish). **Frequency:** start with 1 per month, build to weekly.

NY Watch is the data review format (decision #79, editorial rules section 14). Each episode reviews one set of figures from the site.

### The production system

**Before recording:**

1. Pick a dataset or page to review. The explainer pipeline above doubles as an episode list.
2. Write a script using the site's figures. Every number said on air must come from the site with its source and label.
3. If the episode names an office or project with a question, send right of reply (section 4 of editorial rules) at least 3 working days before.
4. Prepare the episode page data for the Google Sheet `videos` tab:
   - `id` (becomes `/watch/<id>/`)
   - `title`
   - YouTube ID (after upload)
   - `places` (space-separated place IDs the episode covers)
   - `links` (site pages with the data: `/money/2025-26/ Budget 2025/26; /map/health/ Health`)
   - `summary`

**After recording:**

5. Upload to YouTube. Get the video ID.
6. Add the row to the Google Sheet `videos` tab with `reviewed_by` initials.
7. Run `npm run living:sync` to pull the video into the site.
8. Build and check the episode page and the Watch hub.

### Episode ideas (from existing data)

| Episode | Reviews | Key figures |
|---|---|---|
| "Where did KSh 59.6 billion go?" | /money/history/ | 12 years of spending |
| "Your ward's money this year" | /ward/ | FY2025/26 ward allocations |
| "The 37% question" | /money/ | Development absorption |
| "What the auditor found" | (audit.json) | Audit findings |
| "Is the dispensary open?" | /map/health/ | Facility verification gap |
| "Reading a CoB report" | /money/ | How to check the figures yourself |

### The founder recusal rule

The founder hosts but recuses from coverage of politicians and county leadership (section 9). Episodes never assess a named politician's conduct, record or fitness for office. Where records raise a question about a named office or project, it is put as a question with right of reply offered before release. Episodes that need to go further are presented by another host.

---

## Field checks: breathing life into 247 places

**Effort:** 1–2 hours per place visit. **Impact:** this is what makes the site different from every other civic data project.

The pipeline is built (`fieldwork/README.md`). What you need to do:

### One-time setup (needs a person)

1. **Create a KoboToolbox account** at kobotoolbox.org (free for small projects)
2. **Build and upload the three forms:**
   ```
   npm run fieldwork:forms
   ```
   Then upload `kobo/place-visit.xlsx`, `kobo/road-check.xlsx` and `kobo/market-prices.xlsx` to KoboToolbox.
3. **Create the Google Sheet** with four tabs from the templates in `fieldwork/sheets/`: `events`, `videos`, `seats`, `budget-stages`. Publish each tab as CSV.
4. **Set environment variables** (never commit these):
   - `KOBO_TOKEN` — from KoboToolbox Account → Security
   - `KOBO_PLACE_VISIT`, `KOBO_ROAD_CHECK`, `KOBO_MARKET_PRICES` — form asset IDs
   - `SHEET_EVENTS_CSV`, `SHEET_VIDEOS_CSV` — published CSV links

### The visit routine

1. **Open the KoboToolbox app** on your phone (works offline).
2. **Go to the place.** Fill in the form: ward, place, is it open, what condition, what services are working, staff, water, power. Take a photo of the building (not people).
3. **Submit** when you have signal. The submission sits in Kobo until reviewed.
4. **Review in Kobo:** open the submission, check the answers, set to Approved.
5. **Sync:** `npm run living:sync` pulls approved submissions into `src/data/living/events.json`.
6. **Build and check:** the place page now shows the visit with a Verified label.

### Where to start (highest-impact first)

| Priority | Why |
|---|---|
| Ward headquarters (20) | One per ward, establishes presence |
| Sub-county hospitals (4–5) | Highest-traffic facilities |
| Schools near roads you travel | Opportunistic — check while passing |
| Places with "Unverified" that readers ask about | Demand-driven |

### Privacy rules for fieldwork

- Every form ends with a consent tick: no names, faces or phone numbers
- Photos show buildings, not people
- Notes are for the reviewer and are never published
- The sync copies only the fields listed in `scripts/living/sync.mjs`; photos and notes stay in Kobo
- Never copy names, phone numbers, notes or photos out of Kobo

---

## Community content: stories, people, heritage

**Effort:** varies. **Frequency:** as opportunities arise. **Impact:** builds the community relationship that makes fieldwork possible.

Four content collections are ready but empty: `stories`, `people`, `heritage`, `factchecks`.

### Stories (`/whats-working/`)

Evidence-backed stories of things that work. Not news — a water point that has been running for three years, a school that improved its KCSE results, a market that grew.

```markdown
---
title: "Riokindo water point: three years and still running"
ward: rigoma
sector: Water
evidence:
  - { name: "Field visit", date: 2026-12-15 }
  - { name: "County water report 2024", url: "..." }
photos:
  - { file: "/photos/riokindo-water.jpg", alt: "...", consent: true }
date: 2026-12-15
evidenceLabel: verified
draft: false
---

The story, in plain language.
```

### People (`/people/`)

Residents doing interesting work (never politicians). Requires dated consent.

### Heritage (`/heritage/`)

Places, traditions, songs, crafts. Must follow the cultural knowledge rules (editorial rules section 12): consent from the knowledge holder, nothing sacred or restricted.

### Fact-checks (`/fact-check/`)

A claim, its source, a rating (true / mostly true / misleading / false / unproven), and the evidence. Use only when a specific claim is circulating and the site's data can check it.

---

## Ekegusii language digitisation

**Effort:** 15–30 minutes per entry. **Frequency:** ongoing. **Impact:** long-term cultural preservation.

The collection and infrastructure are built (`src/content/language/`, `src/data/language-meta.json`, the word list at `/community/language/words/`, the grammar reference at `/community/language/grammar/`).

### The workflow

1. **Record:** an elder or speaker says a word, phrase or grammar pattern. Record the audio. Get consent (publication consent and, separately, AI-training consent).
2. **Write the entry** at `src/content/language/term-slug.md`:

```markdown
---
term: "enyumba"
category: noun
nounClass: "9/10"
english: "house"
kiswahili: "nyumba"
phonetic: "e-nyoom-ba"
usage: "Enyumba yane enene. (My house is big.)"
dialect: standard
consentPublication: true
consentAI: false
contributor: "Name or 'Name withheld at the holder's request'"
recordedOn: 2026-12-01
draft: false
---

Additional notes, etymology or cultural context.
```

3. **Review:** a native speaker checks the entry. Mark reviewed entries.
4. **Build:** the word appears on the word list; if `consentAI: true`, it also appears in `/api/language.json`.

### Where to start

- **Common nouns** in the 10 noun classes (the classes are documented in `language-meta.json`)
- **Greetings and everyday phrases** — most useful for learners
- **Proverbs** — elders enjoy sharing these and they carry cultural weight
- **Grammar patterns** — one per noun class, then verb tenses

---

## The cadence

A sustainable rhythm for one person. Scale up as the team grows.

| When | What | Time |
|---|---|---|
| **Every week** | Number of the Week | 30–60 min |
| **Every 2 weeks** | 1 field visit (a place near you) | 1–2 hours |
| **Every month** | 1 explainer (publish or draft) | 2–4 hours |
| **Every month** | 1 NY Watch episode (when ready) | 4–8 hours |
| **Ongoing** | Language entries as opportunities arise | 15–30 min each |
| **Ongoing** | Stories, heritage when you encounter them | 1–2 hours each |
| **After each session** | Run `npm run living:sync`, build, push | 15 min |

### The Monday check

Every Monday, check:
1. Is there a Number of the Week ready for this Saturday?
2. Are there Kobo submissions to review?
3. Are there Google Sheet rows without `reviewed_by`?
4. Has any page's data gone stale? (Check `/api/meta.json`)
5. Has anyone sent a correction or right-of-reply? (Check the contact channel)

---

## Growing the team

The system is designed so that volunteers and correspondents only need a phone.

| Role | What they do | What they need |
|---|---|---|
| **Field correspondent** | Visit places, fill Kobo forms | A phone with KoboToolbox installed |
| **Desk reviewer** | Check Kobo submissions, approve or reject | KoboToolbox access |
| **Language contributor** | Record words and phrases | A phone, consent form |
| **Language reviewer** | Check entries for accuracy | Native Ekegusii speaker |
| **Writer** | Draft explainers and stories | Access to the repo |
| **Editor** | Review and publish, right of reply | Full access |

### Onboarding a field correspondent

1. Install KoboToolbox on their phone
2. Share the three form links
3. Walk through one practice submission together
4. Explain: buildings not people, no names, no phone numbers, tick the consent box
5. Assign them 2–3 nearby places to start

---

## Keeping the data fresh

| Dataset | How to refresh | Trigger |
|---|---|---|
| County money | Download the new CoB report, extract figures, update the registry | New CoB report (Aug–Oct each year) |
| Ward projects | Download the new PBB or quarterly report | New budget or quarterly report |
| Leaders | Check the gazette or news | By-election, court ruling, appointment |
| Facilities | Field visits via Kobo | Ongoing |
| Health indicators | Wait for the next KDHS | Next KDHS (every 5 years) |
| Education | Wait for the next MoE booklet or KNEC results | Annual (KNEC), irregular (MoE) |
| Contracts | Download from PPIP | Quarterly |
| Roads | Field visits via Kobo + `npm run build-roads` | Ongoing |
| Fees | Wait for the next Finance Act | Annual |

---

## Checklists

### Before publishing any content

- [ ] Every figure has a source with a URL or document name
- [ ] Every figure has an evidence label
- [ ] No accusations — questions only, with the source document
- [ ] No names of private individuals without consent
- [ ] Right of reply sent if the content names someone with a question (3+ working days)
- [ ] Kiswahili summary written and marked for review
- [ ] `npm run build` passes
- [ ] Page checked at 390px — no horizontal scroll

### Before a field visit

- [ ] KoboToolbox app installed and forms downloaded
- [ ] Phone charged
- [ ] Know which places you are visiting
- [ ] Consent rule clear: buildings not people, no names, no phone numbers

### After a sync

- [ ] `npm run living:sync` ran without errors
- [ ] Check the diff: `git diff src/data/living/`
- [ ] `npm run build` passes
- [ ] The updated place pages show the new data
- [ ] Commit and push
