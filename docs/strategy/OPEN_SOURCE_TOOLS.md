# Open-source tools and standards for Nyamira Daily

Status: **strategy memo, 22 Nov 2026.** Advisory analysis of tools, resources and open standards a civic media tech venture of this kind can adopt. Sequenced by readiness and impact.

## Context

Nyamira Daily is a static Astro site (871 pages) serving civic information to residents on cheap phones and expensive data. Data comes from county PDFs, IEBC gazettes, audit reports, KoboToolbox field forms and Google Sheets. The team is small (owner plus one to three helpers), budget is tight, and the site is the verified record that social posts link back to.

The question: what open-source tools and standards can extend the platform's reach, speed up data collection, and deepen trust in the data — without adding weight or complexity the team cannot sustain?

---

## Tier 1 — High impact, adopt now

### 1. Whisper (speech-to-text)

**What it is:** OpenAI's open-source transcription model. Handles African-accented English and Kiswahili reasonably well; can be fine-tuned on collected corpus for Ekegusii.

**Why it matters:** Nyamira Daily already has an Ekegusii language dataset and a culture archive built for audio recordings. Every recorded elder, oral history and field interview becomes searchable, indexed text.

**How to apply:** Add a `scripts/transcribe.mjs` step to the living-data pipeline. Field reporters record audio via KoboToolbox; the sync script runs Whisper; the transcript enters the content collection alongside the audio. This also feeds the AI training export at `/api/language.json`.

**Prep cost:** A Python environment with `openai-whisper`, or a hosted API endpoint. Can run on a cheap GPU instance (Vast.ai, Lambda) or locally on an M-series Mac.

### 2. Tesseract OCR + document pipeline

**What it is:** Open-source OCR engine (Google-maintained) with Swahili and English language packs. Combined with tabula-py for table extraction from PDFs.

**Why it matters:** The biggest data bottleneck is manually reading government PDFs — county Programme Based Budgets, Controller of Budget reports, IEBC gazettes, audit reports. Each budget cycle means weeks of manual data entry.

**How to apply:** `scripts/ingest-pdf.py` takes a county PDF, runs Tesseract + tabula-py for table extraction, outputs candidate rows in the registry JSON format for human review. A person checks before data enters `data/county/nyamira/`. Cuts data entry time by 60-80% on the annual budget cycle.

**Prep cost:** Python with `pytesseract`, `tabula-py`, `pdf2image`. Template scripts for each document type (budget tables, gazette notices, audit findings).

### 3. Plausible or Umami (privacy-respecting analytics)

**What it is:** Lightweight, cookie-free analytics. Plausible is about 1 KB of JS. Umami is self-hostable on Cloudflare Workers or any Node host.

**Why it matters:** Nyamira Daily has no analytics. For a civic site, you need to know which wards people look at, which pages get shared, and where readers drop off — without Google Analytics' weight (45 KB) or privacy cost.

**How to apply:** Self-host Umami on the same Cloudflare account, or use Plausible Cloud (free for small sites under grant/open-source programmes). Know which ward pages get traffic (editorial signal for where correspondents should be), which money pages get shared (reader interest signal), and whether people use the budget simulator.

**Prep cost:** One Cloudflare Worker or a small VPS. A single `<script>` tag in `Base.astro`.

---

## Tier 2 — Strategic advantage, needs some setup

### 4. Africa's Talking (SMS/USSD gateway)

**What it is:** A Nairobi-based API for SMS and USSD, well-documented, pay-per-message. Kenya-specific, used by M-Pesa and hundreds of Kenyan apps.

**Why it matters:** Many readers have feature phones with no browser. A USSD menu (`*384*XXX#`) returns ward budget figures, facility counts or the MCA's name with zero data cost to the reader. SMS intake collects field reports from anyone with a phone.

**How to apply:** A lightweight USSD app (Node, runs on Cloudflare Workers) that reads the existing JSON data files. Menu: Choose your ward → Budget / Facilities / MCA / Report. The "Report" option collects a text observation that feeds into the living-data pipeline.

**Prep cost:** Africa's Talking sandbox account (free), a registered USSD short code (KSh 10,000-50,000/year depending on provider), a Worker that serves the menu tree.

### 5. WhatsApp Business API (via Turn.io or direct)

**What it is:** A WhatsApp bot that answers questions from your data. Turn.io is built for African civic organisations and has grant pricing.

**Why it matters:** Nyamira Daily already generates WhatsApp share links. The next step: "How much was budgeted for Bokeira?" or "Which clinics are in Nyamaiya?" answered from the JSON data, no browser needed.

**How to apply:** A stateless bot that pattern-matches ward names and topics against the data files and returns a formatted reply. No LLM needed — the data is structured enough for keyword lookup. Add a "Report a place" flow that collects the same fields as the KoboToolbox form.

**Prep cost:** WhatsApp Business API approval (free), Turn.io partnership application, or direct Meta API access. A Node service with the data files.

### 6. DocumentCloud

**What it is:** Built by the journalism community (IRE/ProPublica). Upload source documents, it OCRs them, makes them searchable, and provides embeddable document viewers with annotation.

**Why it matters:** When a figure cites "PBB 2025/26, Table 18, page 42", readers can click through to the actual highlighted page. This is the evidence-label philosophy taken to its natural conclusion: not "trust us" but "see for yourself".

**How to apply:** Upload source documents from `data-src/county/`. Each figure in the registry gets a DocumentCloud URL with the specific page highlighted. Free for journalists and civic organisations.

**Prep cost:** A DocumentCloud account (free for qualifying organisations), an upload script, and URL fields added to the registry schema.

### 7. Datasette (open data portal)

**What it is:** Simon Willison's tool that turns JSON/CSV/SQLite data into a browsable, queryable, downloadable portal with zero custom code.

**Why it matters:** Nyamira Daily has `/about/data/` and JSON API endpoints. Datasette lets researchers, journalists and other civic tech projects query the data without scraping the site. This is how the site becomes infrastructure others build on.

**How to apply:** `scripts/build-datasette.mjs` exports registries, facilities, contracts and leaders into a SQLite database. Deploy as a companion service at `data.nyamiradaily.org`. Datasette runs on Cloudflare Workers, Fly.io, or any Python host.

**Prep cost:** A build script, a small hosting instance, and a subdomain.

---

## Tier 3 — Transformative, needs scale or funding

### 8. Ushahidi (crowdsourced reporting and mapping)

**What it is:** Born in Kenya for the 2008 election crisis. Geolocated citizen reports, verification workflows, map visualisation, SMS intake. Hosted version (ushahidi.io) has free tiers for civic projects.

**Why it matters:** "Report a place" is a manual version of what Ushahidi automates. When the field reporting pipeline goes live (KoboToolbox + Google Sheets + living sync), Ushahidi can be the public-facing layer: citizens report, the team verifies, verified reports become living events.

**When to adopt:** When field reporting is active and the verification queue needs roles and workflow beyond what a spreadsheet provides.

### 9. Polis (opinion gathering)

**What it is:** Built by the team behind Taiwan's digital democracy tools. Maps where a community agrees and disagrees on policy questions using clustering algorithms that find consensus, not just the loudest voices.

**Why it matters:** During county budget hearing season, run "What should Nyamira spend more on?" and surface genuine community priorities with statistical backing.

**How to apply:** Embed a Polis conversation on the budget simulator page during the CFSP public participation window (the budget calendar tracks the dates). Results feed into the submission helper: "72% of participants prioritised health facility staffing over new construction."

**When to adopt:** During the next budget participation cycle, with enough audience to generate meaningful clusters.

### 10. Aleph (investigative document search)

**What it is:** Built by OCCRP for cross-referencing documents and entities. Indexes documents, extracts entities, maps relationships across years of procurement data.

**Why it matters:** If Nyamira Daily grows into investigating procurement patterns — which company wins contracts across years, which directors appear in multiple firms — Aleph surfaces patterns no human would spot in spreadsheets.

**When to adopt:** When 3+ years of contract data and audit reports are loaded and the team has capacity for investigative work.

---

## Open data standards to adopt now (zero infrastructure cost)

### Open Contracting Data Standard (OCDS)

The contracts tracker already has the right fields. Publishing in OCDS format makes the data interoperable with global procurement transparency tools (Open Contracting Partnership, Spend Network, etc.). Add an OCDS JSON export endpoint alongside the existing JSON API.

### Open Fiscal Data Package

The budget data maps almost exactly to the Fiscal Data Package spec. This makes the county budget machine-readable by any fiscal transparency tool (OpenSpending, International Budget Partnership).

### Popolo standard

For the leaders data. Makes MCA/Governor/MP records machine-readable by any civic tech tool that consumes Popolo (EveryPolitician, Pombola, Mzalendo).

---

## Investment sequence

| Quarter | Move | Why |
|---------|------|-----|
| Now | Plausible/Umami + DocumentCloud | Know the audience; make evidence clickable |
| Q1 2027 | Whisper pipeline + Tesseract PDF ingestion | Automate the two biggest manual bottlenecks |
| Q2 2027 | USSD via Africa's Talking | Reach the feature-phone audience |
| Q3 2027 | WhatsApp bot + Datasette portal | Distribution + open data infrastructure |
| When funded | Ushahidi + Polis for participation season | Civic engagement at scale |

---

## Strategic through-line

Every tool either **reduces the cost of getting data in** (Whisper, Tesseract, Ushahidi), **increases the reach of getting data out** (USSD, WhatsApp, Datasette), or **builds trust in the data itself** (DocumentCloud, OCDS, Plausible). That maps directly to Nyamira Daily's editorial promise: every figure sourced, every place checked, written in plain language for people on cheap phones.
