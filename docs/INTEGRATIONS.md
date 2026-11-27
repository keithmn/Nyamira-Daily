# Open-source tools and integrations

What exists in the open-source world that Gusii Daily can use to become a superior civic data product — and what order to adopt them in.

## Principles

- **Phone-first:** every tool must work on a cheap Android phone on expensive data. No 2MB JS bundles.
- **Self-hostable:** no dependency on a service that can shut down or start charging.
- **Build-time where possible:** compute at build time, serve static files. The site runs on Cloudflare Pages.
- **One thing at a time:** adopt tools when the content is ready for them, not before.

## Tier 1: High impact, adopt now

### MapLibre GL JS + PMTiles — self-hosted vector maps
**What:** MapLibre is the open-source fork of Mapbox GL JS. PMTiles is a serverless tile format that serves from a single static file on Cloudflare R2 or Pages.
**Why:** The current map is a static SVG. Vector tiles give zoom, pan, satellite imagery toggle, and facility pins — the experience people expect from a map. PMTiles means no tile server, no API key, no Mapbox bill.
**Cost:** Free. The tiles are generated once from OpenStreetMap data using `tippecanoe`.
**Size:** MapLibre is ~200KB gzipped. PMTiles for Nyamira County would be ~5MB (cached after first load).
**When:** When the facility registry has coordinates for >50% of entries (currently 28%).

### Pagefind — instant static search
**What:** A Rust-based search engine that indexes at build time and runs client-side.
**Why:** The current search page builds a JSON index at build time. Pagefind would give instant, typo-tolerant, highlighted search results with ~100KB of JS. It indexes every page automatically.
**Size:** ~100KB JS + a small index (~200KB for 871 pages).
**When:** Now. Drop-in replacement for the current search.

### Whisper (OpenAI) — episode transcription
**What:** Open-source speech-to-text model. Runs locally or via free APIs.
**Why:** NY Watch episodes need transcripts for accessibility, search indexing, and Kiswahili translation. The archive and language content collections already have `transcript` fields in the schema.
**How:** Run `whisper` locally on each episode MP3, then store the transcript in the content collection. Build-time only — no API needed.
**When:** When the first NY Watch episode is recorded.

### Tabula / Camelot — PDF table extraction
**What:** Open-source tools for extracting tables from PDF documents.
**Why:** County budgets, audit reports, KNEC results and gazette notices come as PDFs. The `scripts/ingest-pdf.py` scaffold is already in place (decision #133). Tabula extracts clean tables that can be validated and committed.
**How:** `pip install tabula-py camelot-py[cv]`. Run on each new PDF, review the output, commit to `data-src/`.
**When:** Now. Every new budget document or gazette should go through this.

### Observable Plot — lightweight data visualisation
**What:** A JS library for quick, responsive charts from the creator of D3.
**Why:** The site uses custom SVG components in `src/components/viz/` (dots, bars, pictograms). Observable Plot can generate build-time SVGs or tiny client-side charts (~30KB) for more complex visualisations: time series, scatter plots, geographic distributions.
**Size:** ~30KB gzipped (much lighter than Chart.js or Recharts).
**When:** When the data justifies it — budget trends over 12 years, facility growth over time.

## Tier 2: Medium impact, adopt next quarter

### Datasette — data publishing and exploration
**What:** A tool for publishing SQLite databases as a browsable, queryable web interface.
**Why:** The open data endpoints (`/api/facilities.json`, `/api/ocds.json`, `/api/meta.json`) serve static JSON. Datasette would let researchers, journalists and county planners explore the data with SQL queries, filters, charts and CSV export — without us building custom interfaces.
**How:** Build a SQLite database at build time from the JSON data files, deploy Datasette on Fly.io or Cloudflare Workers (via `datasette-lite`). Or use `datasette-lite` which runs entirely in the browser via WebAssembly.
**Cost:** Free (self-hosted) or ~$3/month (Fly.io).
**When:** When the data is clean enough to invite exploration.

### Plausible / Umami — privacy-first analytics
**What:** Open-source, cookie-free web analytics. Plausible is hosted (~€9/month) or self-hosted. Umami is fully self-hosted.
**Why:** The analytics placeholder is already in `src/config.js` and `Base.astro`. We need to know which pages matter to readers, which wards get the most traffic, and whether people reach the data or bounce.
**How:** Self-host Umami on Fly.io or use Plausible Cloud. The script is <1KB.
**When:** At launch or shortly after.

### KoboToolbox + ODK — field data collection
**What:** Open-source platform for offline-capable mobile data collection. Already scaffolded in `fieldwork/README.md`.
**Why:** The living data pipeline (`npm run living:sync`) is code-complete but needs provisioning. Field correspondents need forms that work offline, collect GPS coordinates, and sync when they have signal.
**How:** Create a KoboToolbox account (free for civic use), upload the three forms, connect to the Google Sheet, run `living:sync`.
**When:** When the first field correspondent is recruited.

### Tesseract.js — OCR for scanned documents
**What:** Open-source OCR engine, available as a JS library.
**Why:** Some county documents (older budgets, handwritten records, gazette scans) are images, not searchable PDFs. Tesseract can extract text for indexing and fact-checking.
**Size:** The model is ~15MB (loaded only in a build script, not shipped to users).
**When:** When we receive scanned documents that need processing.

## Tier 3: Future, adopt when community grows

### Matrix/Element or Signal groups — community channels
**What:** Open-source encrypted messaging. Matrix is federated (self-hostable). Signal is centralised but widely used in Kenya.
**Why:** Gusii Daily needs a channel where readers can report problems, suggest corrections, and share information. A WhatsApp group works for now, but Matrix gives data ownership.
**When:** When there are >100 regular readers.

### ActivityPub — federated social posts
**What:** The protocol behind Mastodon, enabling federation.
**Why:** Each "Number of the Week" or alert could be a post on the fediverse, reaching readers where they are without depending on Twitter/X or Facebook.
**How:** Publish an ActivityPub outbox alongside the RSS feeds. Libraries: `activitypub-express` or `fedify`.
**When:** When social distribution matters (post-launch).

### n8n or Huginn — workflow automation
**What:** Open-source alternatives to Zapier for connecting services.
**Why:** Automate: gazette published → extract text → check for Nyamira mentions → create alert draft. Or: KNEC results released → download → run ingest script → create PR.
**When:** When the editorial cadence is established and there are recurring data sources.

### Vega-Lite — advanced grammar-of-graphics charts
**What:** A declarative grammar for interactive visualisations.
**Why:** When readers want to explore the data themselves — filter by ward, compare years, hover for details. Builds on the same foundation as Observable Plot but adds interactivity.
**When:** When the audience includes researchers and planners, not just residents.

## Integrations with Kenyan systems

| System | Integration | Priority |
|---|---|---|
| **KMHFR** (kmhfr.health.go.ke) | Pull health facility registry with coordinates | High (when API is back) |
| **KNEC** (knec.ac.ke) | Download KCSE results for school performance data | High (annual) |
| **PPIP** (ppip.go.ke) | Pull procurement data for contracts tracker | Already done |
| **KRA/IFMIS** | County revenue and expenditure data | Medium (access unclear) |
| **IEBC** | Election results, voter registration by ward | Low (event-driven) |
| **ODPC** (odpc.go.ke) | Register as data controller (legal requirement) | High (before launch) |
| **KoboToolbox** | Field data collection and sync | High (when correspondent recruited) |
| **Google Sheets** | Living data events tab (review before sync) | High (with KoboToolbox) |

## The map as platform

The map is the centrepiece. The integration path:

```
Phase 1 (now):   Static SVG map + facility list pages
                 ↓
Phase 2 (Q1):    MapLibre GL + PMTiles + facility pins
                 (zoom, pan, satellite toggle, ward boundaries)
                 ↓
Phase 3 (Q2):    Live data overlay
                 (field-verified status, last-visit date, condition)
                 ↓
Phase 4 (Q3):    Community layer
                 (resident reports, photos, corrections)
                 ↓
Phase 5 (Q4+):   Offline map
                 (service worker + cached tiles for field correspondents)
```

Each phase builds on the one before. Phase 2 needs coordinates for >50% of facilities. Phase 3 needs the KoboToolbox pipeline running. Phase 4 needs a community.

## What NOT to adopt

- **React/Vue/Svelte:** the site is static Astro, phone-first. No client framework.
- **PostGIS/Supabase:** overkill for 247 (growing to ~800) facilities. JSON files at build time.
- **Mapbox GL JS:** MapLibre is the same thing, open-source, no API key.
- **D3.js directly:** too heavy for most charts. Observable Plot or the custom viz components are better.
- **LLM-powered features:** not until the data is complete and verified. AI-generated summaries on unverified data would undermine trust.
