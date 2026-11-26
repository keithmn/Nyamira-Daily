# Status and handover (26 Nov 2026)

For any assistant or developer picking this up (Codex, Claude Code, a person). Read `AGENTS.md`, then this page, then `docs/DECISIONS.md`. Older handover notes, with the history of each feature, are in `docs/STATUS_ARCHIVE.md`.

## Where things stand

- **The site:** a static Astro 7 site in eight sections (`src/nav.js`), with real data for money (12 years), ward pages, projects and the project tracker, services, census, leaders, the Assembly, county laws, fees, opportunities, constitution summaries, search and open data. Text content lives in `src/content/`; only one explainer and one number of the week are published so far, and two money explainers are drafted.
- **Who runs it:** the publisher is not named on the site for now (decision #125, replacing the public parts of #73). Rules and legal are one page, `/about/rules/`.
- **NY Watch (decision #79):** the founder's data review podcast. No episodes published yet.

## Launch readiness — Phase 1 & 2 (26 Nov 2026)

### Phase 1: Remove what could hurt us
- Deleted all 15 EXAMPLE content files (alerts, factchecks, heritage, language, people, stories). These were draft fiction marked `draft: true` but could have been indexed if deployed with `ND_DRAFTS=1`.
- Added site-wide **public beta banner** (BetaBanner.astro): "We are verifying data across all pages." Dismissible, controlled by `beta = true` in config.js.
- Added **MCA gazette-check disclosure** on all 20 ward pages when `mcaGazetteChecked` is false.
- Existing disclosures confirmed adequate: ward spending reconciliation (KSh 15.5M gap explained in ProjectsPage), "Mostly unverified" evidence labels, administration page gazette note.

### Phase 2: Verify the people
- **Governor Nyaribo:** Updated impeachment note — Senate terminated proceedings 3 Dec 2025 on procedural grounds (Assembly threshold not met). Charges never tested. Source updated to The Star.
- **Speaker Nyabaro:** Updated note — Bomet HC (Justice Ngarngar) affirmed Okero's impeachment and recognised Nyabaro. Okero appealed; no outcome found as of Nov 2026. Labour Court reportedly found Okero's removal unlawful (Mar 2026). Nyabaro chairs all 2025–2026 sittings.
- **By-election MCAs (3 wards):** Nyansiongo (Jackson Mogusu Mochumbe, PDP), Nyamaiya (Christopher Moturi Osiemo, UPA), Ekerenyo (Jeremiah Njenga Ongaro, UPA) — all now gazette-verified. IEBC gazetted winners 1 Dec 2025 (PDF: iebc.or.ke/uploads/resources/EHWTStffeC.pdf). Source links updated from news to gazette.
- **Rigoma/Bokeira:** Notes updated with detail — expelled Jul 2025 for absenteeism, reinstated by interim HC order (Judge Okwany), full hearing set 30 Jul 2025, no published outcome found. No by-election held for these wards.
- **2022 baseline MCAs (15 wards):** Added the IEBC Gazette Notice 9956 PDF as individual `src` for each. Names should still be checked character-by-character against the PDF.
- `mcaGazetteChecked` remains false until every name is verified and Rigoma/Bokeira resolved.
- `updated` date set to 2026-11-26.

### Phase 3: Ground-truth the places (26 Nov 2026)
- **Facility data audit:** 247 facilities in `facilities.json`. 120 sourced from the Kenya Master Health Facility List (2017 export, labelled "official"); 69 from OpenStreetMap and 58 from Google Maps (both labelled "unverified"). 127 of 247 are unverified. Zero living data events, zero field observations, zero road conditions — no correspondent has visited any place yet.
- **Fixed misleading freshness language** on ward pages (`ward/[slug].astro`): replaced "Last updated 22 Oct 2026" (which implied recent verification) with honest source dates: "Health facilities from the Kenya Master Health Facility List (2017 export); schools and other places from OpenStreetMap and Google Maps." Added a "Report a change" link.
- **Updated facilities dataset description** on the Open Data page (`OpenData.astro`): now states the actual sources and that most have not been visited.
- **Health and Education pages already honest:** HealthPage cites KDHS 2022 and CIDP; SchoolsPage cites KNEC KCSE 2024–2025 and the Ministry of Education statistical booklet (2020). No changes needed.
- **Map page already honest:** shows facility counts and "Checked on site: 0/247" without claiming a date. No changes needed.
- **KMHFR unreachable:** kmhfr.health.go.ke timed out and refused connections — cannot check for newer facility data online. A person should try in a browser.
- **Fieldwork pipeline documented but not set up:** `fieldwork/README.md` describes three Kobo forms, a four-tab Google Sheet and the sync script, but no forms have been uploaded to KoboToolbox, no sheet has been created, and no environment variables are configured. The pipeline is code-complete but needs a person to provision the accounts.

### Phase 4: Legal infrastructure (26 Nov 2026)
- **Data sources disclosure added** to `/about/rules/#data-sources` (`HowWeWork.astro`): a table listing every main dataset, its source, its date and its evidence label. This makes the age of each dataset explicit (e.g. "2017 export" for health facilities, "2022" for leaders) and notes that no field observations exist yet. Navigation link added.
- **Privacy notice updated** (`Privacy.astro`): added the beta banner localStorage key to the list of things the browser remembers. Date updated to 26 Nov 2026.
- **Terms date updated** (`Terms.astro`): date updated to 26 Nov 2026 to reflect the current state.
- **Already in place (no changes needed):** corrections log with one entry (equitable share split, Nov 2026); right of reply with pre- and post-publication process; contact form gracefully disabled with a "being set up" notice; correction form similarly gated; report forms show honest "not sent" messaging; CC BY 4.0 licence stated; Data Protection Act 2019 referenced; ODPC complaints avenue documented.

### Mapping infrastructure (26 Nov 2026)
Built a four-script geographic data pipeline in `scripts/geo/` to systematically fill the map:
- **`geo:pull-osm`** — pulls all mapped features in Nyamira County from the Overpass API. First run: 329 features (122 roads, 39 waterways, 33 education, 30 places, 30 markets, 17 water, 15 worship, 7 health, 5 leisure, 3 public office). Output: `data-src/osm-fresh.json`.
- **`geo:reconcile`** — matches OSM data against `facilities.json` using three strategies (exact sourceRef, fuzzy name within ward, containment). Found 58 matches (coordinate enrichment candidates) and 18 new facilities (mostly markets). Output: `data-src/geo-review.json` for human review.
- **`geo:apply`** — applies reviewed decisions from `geo-review.json` to `facilities.json`. Supports `--dry-run`.
- **`geo:coverage`** — prints a ward × category coverage matrix with benchmarks. Key finding: 59 of ~601 schools listed (10% completeness), 125 of ~150 health facilities (83%).

**Strategy document:** `docs/MAPPING_STRATEGY.md` lays out four phases (G1–G4): bulk data enrichment from Kenya schools dataset + Google Places geocoding, named roads and places, field verification with Plus Codes, and continuous improvement via monthly OSM re-pulls and resident reports.

**Biggest gaps identified:** ~542 missing schools (available from energydata.info Kenya schools dataset), 178 facilities with no coordinates, 0 of 247 facilities field-verified, water points almost entirely unmapped.

**Additional scripts added (Phase G1 enrichment):**
- **`geo:geocode`** — resolves coordinates for 58 facilities with Google Place IDs (needs `GOOGLE_PLACES_KEY`).
- **`geo:discover`** — searches each ward centroid for schools/clinics/markets via Google Places Text Search (needs `GOOGLE_PLACES_KEY`).
- **`geo:ingest-schools`** — imports any school CSV into the reconcile pipeline format, auto-detecting columns and filtering to Nyamira. Ready for when the Kenya schools dataset is downloaded manually.
- **`geo:reconcile-roads`** — cross-references 90 budget roads against 122 OSM roads. Found 8 fuzzy matches; the two layers are mostly complementary. Output: `data-src/road-review.json`.

**Data source availability (26 Nov 2026):** energydata.info (403), opendata.go.ke (404), HDX (403), KMHFL API (connection refused). All need manual browser download or retry later. The Google Places API is the fastest path to coordinates — it needs an API key from Google Cloud Console.

### Still needs a person
- Open the Gazette Notice 9956 PDF and check each 2022 MCA name character-by-character.
- Check Kenya Law or Nyamira HC registry for the Rigoma/Bokeira full hearing outcome.
- Check whether Okero's appeal (Speaker case) has been decided.
- **Register with the Data Protection Commissioner** (odpc.go.ke) if collecting personal data — required before any form is switched on.
- **Set up a working contact channel** (email or WhatsApp) and fill in `contact` in `src/config.js` — this unlocks the right-of-reply and corrections paths.
- **Lawyer review** of the privacy notice, terms and right of reply before launch (noted in the code).
- Try kmhfr.health.go.ke in a browser for newer facility data.
- Create a KoboToolbox account, upload the three forms, create the Google Sheet with four tabs, publish tabs as CSV, and set environment variables per `fieldwork/README.md`.
- **Review `data-src/geo-review.json`**: 18 new facility candidates (mostly markets) and 58 coordinate-enrichment matches from OSM. Set `approve: true/false` on each, then run `npm run geo:apply`.
- **Download the Kenya schools dataset** from energydata.info and filter to Nyamira subcounties — this closes the biggest gap (~542 missing schools).
- **Try maps.krb.go.ke** in a browser — if the KRB road map allows feature export, it would give classified road data with condition ratings.

---

## Changes on 26 Nov 2026 (Kiswahili summaries + CSS cleanup)

On branch `feat/data-architecture-improvements`. Completing the two leftovers from 22 Nov.

### Kiswahili summaries completed
Added Kiswahili summaries to the 17 pages that were missing them. All follow the existing pattern (`<div class="sw" lang="sw">`) and are marked `<!-- Kiswahili: needs native-speaker review -->`. Pages: about/, about/nyamira/, about/glossary/, about/contact/, about/careers/, about/partners/, watch/, ask/, take-part/submission/, tools/budget-simulator/, fact-check/, whats-working/, people/, heritage/, number-of-the-week/, search/, money/history/.

### CSS cleanup (partial)
Removed ~80 lines of confirmed dead CSS from `src/styles/global.css`: `.front-door`, `.list-filter`, `.chip-btn`, `.home-ward`/`.home-help`, `.ward-facts`, `.home-two`, `.next-steps`, `.h-name`/`.h-bar`, `.tk-year`, `.sheet-inner`/`.sheet-search`, `.ph-detail`, `.fg-ft-meta`, `.fg-cc-badge`, `a.fg-ft-pill`. Many other candidates from the original ~110 audit turned out to be false positives (dynamically generated class names like `st-${state}`, `sb-${tone}`, `op-${opinion}`, `sc${index}`). Remaining old-design CSS (`.site-header`, `.desk-nav`, `.hero-grid`, `.sec-switch`, etc.) is harmless dead weight but tangled with live code — safe removal would need a more careful refactor.

### Build
- `npm run build` (871 pages) passes.

---

## Changes on 22 Nov 2026 (open-source prep: endpoints, schemas, analytics, PDF scaffold)

On branch `feat/data-architecture-improvements`. Structural prep for open-source tools and standards (strategy in `docs/strategy/OPEN_SOURCE_TOOLS.md`).

### New API endpoints
- **`/api/ocds.json`** — County contracts in Open Contracting Data Standard (OCDS 1.1) release format. 271 county releases; national contracts excluded per OCDS publisher rules. Spec: https://standard.open-contracting.org/
- **`/api/leaders.json`** — County and national leaders in Popolo format (persons, organizations, memberships). 29 persons, 4 organizations. Spec: https://www.popoloproject.com/
- **`/api/meta.json`** — Data freshness metadata: 13 datasets, each with its last-checked date, record count, refresh trigger and API endpoints. For monitoring crons, Datasette, or dashboards.
- **`/api/budget.txt`** — County budget summary as plain text under 900 characters, for SMS/USSD/WhatsApp bot.
- **`/api/facilities.txt`** — Facility summary as plain text, for SMS/USSD/WhatsApp bot.
- **`/api/leaders.txt`** — Leaders summary as plain text, for SMS/USSD/WhatsApp bot.
- All new endpoints listed on the Open Data page (`OpenData.astro`).

### Schema and infrastructure changes
- **Analytics placeholder** in `config.js` and `Base.astro`: set `analytics.provider` to `'plausible'` or `'umami'` and fill in `src` to enable. Zero weight until enabled.
- **DocumentCloud URL field** (`documentCloud`) added to the registry `Source` schema (`packages/engine/src/schema.js`) and the facility API output. Optional, defaults to null.
- **Whisper-ready transcript fields** (`transcript`, `transcriptLang`) added to the `archive` and `language` content collection schemas (`src/content.config.ts`). Ready for Whisper output.
- **PDF ingest scaffold** (`scripts/ingest-pdf.py`): table extraction from county PDFs, with templates for PBB Table 18, CoB Table 2.1 and gazette MCAs. Falls back gracefully when tabula-py is not installed.
- **Strategy doc** saved at `docs/strategy/OPEN_SOURCE_TOOLS.md`: three tiers of tools, open data standards, and a quarterly investment sequence.

### Build
- `npm run build` (871 pages) passes.

---

## Earlier on 22 Nov 2026 (page optimization + MCA verification research)

On branch `feat/data-architecture-improvements` (from `ee970ce`).

### Page content/copy optimization

- **Footer trimmed:** removed the `fg-ft-meta` bottom section (Open Licence, Independence, Evidence Standard, Quick Jump blocks) from `SiteFooter.astro`.
- **Hero cleaned up:** removed the decorative topographic SVG contour lines (`fg-hero-topo`) from `HeroMap.astro`.
- **14px minimum font size:** all `font-size: 13px` declarations in `global.css` changed to `14px` (~28 instances across `.eyebrow`, `.label`, `.source`, `.updated`, `.small`, `.hc-note`, `.tg-meta`, `.now-meta`, etc.) for readability on budget phones.
- **Structured data (JSON-LD):** `Base.astro` now outputs a `BreadcrumbList` on every non-home page (built from URL segments, last crumb uses the page title) and a `WebSite` with `SearchAction` on the home page.
- **Noscript fallback for Kiswahili:** `<noscript>` block in `Base.astro` ensures Kiswahili summaries are visible and the toggle button is hidden when JavaScript is off (Opera Mini, feature phones).
- **Sitemap:** `@astrojs/sitemap` integration added in `astro.config.mjs`, generating `sitemap-index.xml`.
- **RSS feeds:** new `src/pages/explainers/rss.xml.js` and `src/pages/number-of-the-week/rss.xml.js`.
- **Glossary expanded:** from 11 to 30 terms (added ADP, CARA, CIDP, ECDE, FIF, Gazette, KCSE, KDHS, KeNHA, KeRRA, KHIS, KNEC, KURA, NG-CDF, PBB, PPIP, Supplementary budget, Ward, Ward Development Fund).
- **"What we do not measure yet" sections** added to HealthPage (5 items), SchoolsPage (4 items) and TeaMilkPage (4 items).
- **Freshness labels** added to revenue, contracts and history pages.
- **Kiswahili summaries** added to 9 pages: index (home), map/index, ward/index, administration/index, administration/duties, money/economy, money/track, money/revenue, money/contracts/index. All marked `<!-- Kiswahili: needs native-speaker review -->`.
- Remaining Kiswahili summaries completed on 26 Nov (see above).
- CSS audit: ~80 lines of confirmed dead classes removed on 26 Nov (see above). Many candidates were false positives; remaining old-design CSS is harmless dead weight.

### MCA verification research

Searched official IEBC and court records for the five MCA entries that need primary-source verification. No roster entries were changed; `mcaGazetteChecked` stays `false`.

**By-elections (Nyansiongo, Nyamaiya, Ekerenyo — Nov 2025):**
- The August 2025 Kenya Gazette (Vol. CXXVII—No. 169, Gazette Notice No. 11159, p. 4864) confirms the IEBC appointed Returning Officers for Nyamaiya (ward code 1352, West Mugirango), Ekerenyo (ward code 1361, North Mugirango) and Nyansiongo (ward code 1364, Borabu) for 27 Nov 2025 by-elections.
- Gazette Notice No. 11160 (same issue, p. 4864) is the official by-election schedule notice.
- Multiple news sources report the winners as Jackson Mogusu Mochumbe (PDP, Nyansiongo), Christopher Moturi Osiemo (UPA, Nyamaiya) and Jeremiah Njenga Ongaro (UPA, Ekerenyo) — matching the current `leaders.json` entries.
- The official results gazette (reported as Gazette Notice No. 17611, December 2025 special issue) has not been directly verified. The IEBC website's by-elections resources page lists only two documents, neither of which is the results gazette. The Kenya Gazette archive at kenyalaw.org blocked automated access (HTTP 403).
- **Status: corroborated by multiple news sources and the official appointments gazette, but the results gazette PDF has not been fetched and read.**

**Court status (Rigoma and Bokeira — expelled MCAs):**
- In July 2025, the Nyamira County Assembly expelled 10 MCAs (including Rigoma's Emmanuel Nyambega Gisesa and Bokeira's Joel Ombongi Nyang'au) for missing 8 consecutive sittings.
- The High Court at Nyamira (Judge Wilfrida Okwany) granted interim relief reinstating them, with the substantive hearing set for 30 July 2025.
- No final judgment has been found in any search (web search, news, Kenya Law — the latter blocked automated fetches with HTTP 403).
- **Status: interim relief only. The final ruling is unresolved. The roster notes say "Final ruling not yet confirmed" and that is still accurate.**

**What remains for a person:**
1. Visit kenyalaw.org in a browser to search for the final Rigoma/Bokeira court ruling (search: "Nyamira County Assembly", "Okwany", "MCA absenteeism 2025").
2. Visit the IEBC Gazette Notices page (iebc.or.ke/electionlaws/?Gazette_Notices) to find and download the December 2025 results gazette (Gazette Notice No. 17611).
3. When both are verified, update `leaders.json` with the gazette citation and set `mcaGazetteChecked: true`.

### Build and tests

- `npm run build` (871 pages) passes.
- `npm test` (342 tests) passes.
- Sitemap generated at `sitemap-index.xml`.

## Changes on 21-22 Nov 2026

- **Data architecture improvements** (decision #131) on branch `feat/data-architecture-improvements` (from `ee970ce`).
  - **Ward-slug validator** (`npm run check:wards`): catches typos in ward references across all data files and content collections. 935 references checked.
  - **Flattened wards.json**: pure 20-row identity lookup. Places extracted to `ward-places.json`. Facility references derived from `facilities.json` at build time. No more double-edits.
  - **Geo boundaries built**: `geo.json` (20 wards, 103 OSM points) and `neighbours.json` (10 counties) populated from geoBoundaries Kenya ADM3. The entire Map section is now unblocked.
  - **Legacy money auto-generation** (`npm run generate:legacy-money`): `money.json` and `budget-sectors.json` generated from the county registry, guaranteed to match.
  - **Hybrid alerts**: narrative as Markdown, status changes as living events (`alert:<id>` in `events.json`). Field reporters can update status from a phone form without touching git.
  - **Contract-project triage**: 176 candidates sorted into confident (8), likely (8), ambiguous (29), reject (131). Six new contract groups produced seven proposed pairs. Manual source-level review did not confirm any new pair; the live `project-links.json` remains unchanged. Findings are in `data-src/contracts/RECONCILIATION_TRIAGE.md`.
  - **Data dependency graph** (`npm run check:data-deps`): 56 source files, 36 data files, all validated.
  - **Data-freshness labels** on health, education and economy pages.
  - **Intake plan** (`docs/INTAKE_PLAN.md`): three-phase plan — Google Forms now, KoboToolbox at 3-6 months, D1 at 6+.
  - Checked during continuation: `npm test` (342 passed), `npm run build` (871 pages; with the documented `ND_SITE_URL`), `npm run check:wards`, and `npm run check:data-deps` pass. The home page, map and contracts page have no horizontal overflow at 390px; the home page also has none at 1280px. The Administration page was checked at 390px and 1280px with no horizontal overflow.
  - Waiting for a person: (1) Check the source documents for the seven unconfirmed contract-project pairs if stronger evidence is available. (2) Create and publish the Google Sheet from the fieldwork tab templates; the Google Drive/Sheets connector was not available in this chat. (3) The geoBoundaries source files are in `data-src/` for reproducibility.
  - **Places facility research (registry unchanged):** the 27 Oct 2026 facility inventory has five police-tagged entries, all unverified; only Keroka has candidate coordinates. Sixteen wards have no police-tagged entry, which is a listing gap, not evidence that they lack police coverage. The 2018-22 CIDP names seven stations/posts/patrol bases, but is historical; the 2023-27 CIDP does not provide a current point-level roster. The current NPS/Kenya Police public sources checked did not yield one; the February 2026 police-hotlines document contains general hotlines, not a local station list.
  - Other facility leads: the 2026/27 ADP identifies planned fire/ECDE works, not proof of operating facilities. WASREB's provider register can verify water-service providers, not individual water points. Next: complete and submit the drafted records request to NPS/County Commissioner; then verify locations and operating status before changing `facilities.json`. No request has been sent.
  - **MCA source check:** the 2022 Nyamira ward roster was compared with IEBC Gazette Notice No. 9956, Kenya Gazette Vol. CXXIV, No. 170, 24 Aug 2022, p. 6747. Three current ward entries reflect later by-elections; their official result notices and the final court status for Rigoma and Bokeira remain to be verified, so `mcaGazetteChecked` stays `false`.

- **Expansion build: seven tools and four new content collections** (decision #130) on branch `feat/ekegusii-language-framework` (from `6ae010c`).
  - Four new content collections with schemas, helpers, list pages, example entries and search integration:
    - `factchecks` at `/fact-check/`: claims checked against the record (true/mostly true/misleading/false/unproven), with evidence and sources.
    - `stories` at `/whats-working/`: evidence-backed stories, with ward, sector, photos, evidence labels.
    - `people` at `/people/`: consent-required profiles of residents (never politicians), with photo, role and story.
    - `heritage` at `/heritage/`: heritage places and traditions, with named sources.
  - **Ask Nyamira** (`/ask/`): RTI explainer citing Constitution Art 35 and AIA 2016, a client-side request-letter builder (copy/print/WhatsApp, no data sent), and a public tracker.
  - **Submission helper** (`/take-part/submission/`): generates structured submissions for budget forums, development plans and Assembly petitions. Client-side only.
  - **Alerts and incidents** (`/alerts/`): `alerts` content collection (19 event types, 3 levels, 3 statuses), hub page, individual alert pages, AlertBanner in Base.astro (emergencies everywhere, disruptions on affected ward pages, dismissible via localStorage), RSS feed, two JSON API endpoints, Open Data page updated.
  - **Budget simulator** (`/tools/budget-simulator/`): interactive tool with 8 grouped sectors from the real 24-department budget, range sliders that balance, fixed wage bill, trade-off warnings, comparison table, WhatsApp share.
  - Navigation updated: Stories gains fact-checks, what's working, people, heritage; Places gains alerts; About gains Ask Nyamira, Submission helper, Budget simulator.
  - Search index includes all new collections and tool pages.
  - Checked: the build (871 pages), `npm test` (340 pass), all new pages built.
  - All content starts empty (example entries are `draft: true`); the tools work without data.
  - Waiting for a person: the first real entries for each collection; the contact channel for Ask Nyamira requests; native-speaker review of the submission helper's template text.

- **Ekegusii language documentation and AI digitization framework** (decision #129) on branch `feat/ekegusii-language-framework` (from `6ae010c`).
  - New `language` content collection (`src/content/language/`): words, phrases, grammar notes and sentences with English and Kiswahili translations, phonetic guide, tonal marking, usage examples, audio, noun class, dialect, and consent fields (publication and AI training are separate, following the same model as the archive).
  - Language metadata (`src/data/language-meta.json`): ISO 639-3 code `guz`, Bantu classification, speaker estimate, ten noun classes with examples, all from Cammenga (2002), Whiteley (1960), Ethnologue and the 2019 Kenya census.
  - Helper (`src/lib/language.js`): mirrors `src/lib/archive.js` with `visible`, `forTraining`, `languageItems`, `wordItems`, `grammarItems` and category labels.
  - Hub page expanded (`/community/language/`): dataset statistics, the four-stage workflow, noun classes table, AI-use explainer and links to the word list and grammar reference.
  - New `/community/language/words/`: a browsable word list by category with translations, phonetics and full details behind `<details>`.
  - New `/community/language/grammar/`: grammar reference with the Bantu noun class system, documented patterns and published sources.
  - New `/api/language.json`: AI training export endpoint, returning only entries whose contributors gave the separate AI-training consent.
  - Navigation updated: words and grammar pages sit under the Ekegusii language entry in the Community section.
  - Three EXAMPLE draft entries (a noun, a grammar note, a greeting) show the schema; nothing is published.
  - Checked: the build (870 pages), `npm test` (340 pass), all new pages built.
  - Waiting for a person: the first real recordings and entries; the licence for the AI training export; native-speaker review of the noun class examples.

## Changes on 18 Nov 2026

- **Civic Field Guide redesign** on branch `maltilda` (from `b7ec83b`), for review. Reimagines information presentation across the entire site with visual structure inspired by `civictech.guide`, while strictly preserving Nyamira Daily's original `:root` colour tokens (Signal Green, deep green, soft mint, charcoal, paper, white; zero raw colour literals outside `:root`; no red; no dark mode), self-hosted fonts (`Varela Round` + `League Spartan` 500/700), active `Nyamira-Daily_*` logos, canonical 5 sections, and every real dataset, source citation and evidence label.
  - Global shell (`Base`, `SiteHeader`, `SiteFooter`, `SectionNav`, `PageHead`): search-first white topbar with tracked uppercase section links and offset-shadow Signal Green `Report a place` button; horizontal section pill-tab bar replacing the left sidebar; full-bleed soft-mint topographic page heroes; dashed/solid charcoal card frames with crisp offset shadows; and a soft-mint directory footer with dashed dividers, inline search bar, social links, 4 columns and CC BY 4.0 licence block.
  - Front page (`HeroMap`, `src/pages/index.astro`): soft-mint topographic hero with 2×2 headline figure grid, graphic interactive 20-ward map, and overlapping white ward-picker card; 3-column curated `↗` pill directory (*The Places*, *The Books*, *Community & Stories*) + knowledgebase search and 20-ward jumper; 4-card illustrated record preview band (county spending, every KSh 100, separated county vs national/NG-CDF contracts, and ground facility checks); overlapping dashed-border stories/videos/labels sheet; split ticket-stub PFM Act budget calendar; and 3 colour-blocked *Get Involved* cards (charcoal, white, Signal Green).
  - Section & inner pages (`map/index`, `money/contracts/index`, `community/index`, `community/language/index`, `CommunityRules`, `watch/index`, `about/index`, and unified styling for charts, tables, toggles, rows and tiles across all remaining templates).
  - Checked: `ND_PREVIEW_BUILD=1 npm run build` (868 pages, 0 errors), `npm test` (340/340 pass), Python tests (24/24 pass), zero raw colour literals outside `:root`, and `@axe-core/playwright` across all 37 routes at 390 and 1440 px (0 contrast violations, 0 accessibility issues, 0 horizontal overflows, 0 JS errors).

## Changes on 16 Nov 2026

- **Home page blocks and one side list** (decision #128), on `feat/home-blocks` from `2992ffc`. Home: your ward, the next budget date, where every KSh 100 goes, help us check, new here. The side list shows on every section page from 960 px, including Places and Stories. Checked: the build (868 pages), `npm test` (338 pass, 2 new), home and five section pages at 390, 1000 and 1280 px.

- **Overhaul 3, first steps, and the seven folds** on branch `feat/overhaul-3` (from `91aea3b`). Decisions #123 to #127; plan `docs/overhaul/PLAN-3.md`.
  - Menu: Home, Places, Money, Community, Stories, About. The county's pages sit under Places; About is one page plus Tell us, Careers, Partner with us, and Rules and legal (`/about/rules/`).
  - Folded into other pages (in `src/components/folded/`): roads, the budget calendar, fees, how we work, right of reply, terms, privacy. The explainers list is part of Stories. Old addresses redirect.
  - The publisher is not named on the site (decision #125); it must be named in the privacy section before any form that collects personal data is switched on.
  - Checked: the build, `npm test` (336 pass), every internal link and `#part` in the built site (none broken), nine folded pages at 390 and 1280 px (no sideways scroll, no script errors).

- **Overhaul 2** on branch `feat/overhaul-2` (from `b061cba`), not pushed. Decision #122; plan `docs/overhaul/PLAN.md`; strategy `docs/strategy/GM_PLAN.md`; the next round is planned in `docs/overhaul/PLAN-3.md`.
  - New: Community section (5 pages, the `archive` collection with consent checks), About rebuilt (hub, About Nyamira County, Contact, Careers, Partners, Publisher), the contact worker and migration 0004, six footer social icons.
  - Checked: the build (876 pages), `npm test` (336 pass, 4 new), 12 new or changed pages at 390 and 1280 px: no sideways scroll, no script errors; `/who-runs-us/` redirects.
  - Waiting for the owner: the Cloudflare account (D1, Turnstile keys, `CONTACT_*` variables) to switch the form on; the inbox to forward to; social links; the company registration number and address; the review panel; pay terms for roles.

- **UX round 1** on branch `feat/ux-round-1` (from `f71ef54`), not pushed. Decision #121, from a design review and an interview with the owner.
  - Header: plain links, no pop-up menus; the phone menu sheet lists pages in the switcher's groups. Page heads: no dark band; breadcrumbs only three or more levels deep. Side list aligned with the logo; 44 px tap targets in the lists and for lone table links on phones.
  - Home page as a summary: "Coming fast" from `src/data/living/now.json` (empty for now, so hidden), the map with a lead story (none yet, so the card invites the reader to point at a ward), three numbers (0 of 247 places checked; money spent; contracts dated 2025/26), latest explainers and numbers, Watch when videos exist.
  - Checked: the build, `npm test` (332 pass, 2 new for `now.json`); 12 page types at 390, 768, 1280 and 1500 px: no sideways scroll, no script errors; the page title now starts at 147 px on phones (245 before) and 85 px on wide screens.
  - Waiting for the owner: social account links for the footer (`src/config.js`); the first "Coming fast" item and lead story.

- **Navigation option B and the footer** on branch `feat/nav-switcher` (from `9a99de8`), not pushed. Decisions #119 and #120.
  - The secondary tab bar is replaced by a section switcher and, from 1,180 px, a side list of the section's pages in groups (`src/components/SectionNav.astro`, groups in `src/nav.js`). The Map section keeps full width (switcher only). Administration leaves the main menu; its two pages sit under About, in a Reference group.
  - Footer: social icons (none set yet in `src/config.js`) and "© year Nyamira Daily" only.
  - Checked: the build, `npm test` (330 pass); Money, Map, Watch and Who holds each seat at 1280 and 1500 px, and Money at 390 px with the switcher open: no sideways scroll, no script errors.
  - Next: set the social account links; the home page as a summary and the stories collection (design boards on the canvas).

- **Refocus plan (decision #110), approved by the owner.** The owner set a new direction: the map (facility condition, status and services) and the money (county budget and the private economy), YouTube first, static and living databases, Signal Green and charcoal only, Kenya Budget Explained in its own repository. The plan, with every page's fate and phases R0 to R7, is `docs/refocus/PLAN.md` on branch `plan/refocus`. Nothing is built or deleted yet.
- Found while studying the repo: none of the 247 facilities has been checked on site, 178 have no coordinates, and none has a condition or status field. The D1 tables for facility observations and road conditions exist, but `wrangler.jsonc` still has a placeholder database id, so they were never switched on.
- R0 done: the plan is approved and `main` (cfa390f) is tagged `archive/pre-refocus-2026-11`. Next: R1, the look.

- **Cleanup pass** on the same branch, not pushed. Decision #118.
  - Alerts removed everywhere; 163 unused CSS rules removed (page heights unchanged); `/administration/duties/` built and the Constitution redirects pointed at it; four unused files deleted; PROJECT_BRIEF, ROADMAP and DATA rewritten.
  - Checked: the build (867 pages), `npm test` (330 pass; the alert tests went with the alert code), `npm run check:county:pages`, every pre-refocus URL resolves or redirects, no broken internal link; six page types at 390 and 1280px with no sideways scroll or script errors.
  - Next: R7, Kenya Budget Explained to its own repository (needs the owner: the repository name and whether it is private or public).
- **Phase R6, Watch, built** on the same branch, not pushed. Decision #117.
  - `/watch/<id>/` per video, the hub lists videos, place pages list their videos; a `links` column in the sheet's videos tab; seven unused collections removed.
  - Checked with a test video and event (then reset to empty): the video page, the place page and the hub show them; the build (866 pages); `npm test` (332 pass); `npm run check:county:pages`; every pre-refocus URL resolves or redirects.
  - Next: R7, Kenya Budget Explained to its own repository (needs the owner: a new GitHub repository). Still open from earlier phases: the alerts collection and its map code, the CSS of removed features, `/administration/duties/`, and the older sections of PROJECT_BRIEF, ROADMAP and DATA.
- **Phase R5, money, built** on the same branch, not pushed. Decision #116.
  - `/money/contracts/` replaces the 1,962 tracker pages (search, totals by group, CSV; county and national apart); `/money/economy/`; the Assembly's money laws on `/money/calendar/`. 866 pages in all; 2,865 redirects.
  - Checked: the build, `npm test` (331 pass), `npm run check:county:pages`, every pre-refocus URL resolves or redirects, no broken internal link; in a browser, an old contract address opens its search result and typing a search finds results; the economy page at 390px with no sideways scroll.
  - Next: R6, Watch (the videos collection), then R7, moving Kenya Budget Explained to its own repository.
- **Phase R4, living data, built** on the same branch, not pushed. Decision #115.
  - Three Kobo forms (`fieldwork/kobo/*.xlsx`, built from CSV sources by `npm run fieldwork:forms`), a four-tab sheet layout (`fieldwork/sheets/`), the sync (`npm run living:sync`), `/review/changes/`, and `fieldwork/README.md` for the team.
  - Checked: the forms open as valid XLSX with survey, choices and settings sheets (not yet uploaded to KoboToolbox, which is the real test); an end-to-end run from test exports produced valid events that showed on a place page and on the changes page (then reset to empty); the build; `npm test` (331 pass, 6 new for the sync); `npm run check:county:pages`.
  - Waiting for a person: create the KoboToolbox account and upload the three forms; create the Google Sheet with the four tabs and publish them as CSV; set the variables in `fieldwork/README.md`; then run the sync.
  - Next: R5, the money (the economy section, the contracts table, prices from the market form).
- **Phase R3, places, built** on the same branch, not pushed. Decision #114.
  - 686 place pages at `/place/<id>/` with a shared summary (status, condition, last checked, who is responsible, what you can do, history); 686 old addresses redirect; living events file `src/data/living/events.json` (empty) with build-time checks.
  - Checked: the build, `npm test` (325 pass, 4 new for places), `npm run check:county:pages`, a facility, a project and a road page at 390px with no sideways scroll or script errors.
  - Not done: ward pages link to places but do not yet count them by status (nothing is checked yet, so every count would be "not yet checked"); the alert plumbing and the CSS of removed features are still to clear out.
  - Next: R4, the living data: KoboToolbox forms, Google Sheets, the sync script, merging the two older observation files into the living events, the changes list.
- **Phase R2b built** on the same branch, not pushed. Decision #113.
  - New addresses `/map/`, `/money/` and the rest; 217 redirects in `redirects.json`, every target checked; compact home page; 27 unused files deleted; About states the new purpose.
  - Checked: the build, `npm test` (321 pass: the tests of the three deleted modules went with them), `npm run check:county:pages`, every pre-R2 URL resolves or redirects, no internal link points at a missing page; home page at 390 and 1280 with no sideways scroll.
  - Not done in R2: `/administration/duties/` (the Fourth Schedule page; the Constitution redirects go to `/administration/` until it exists); the CSS of removed features (alerts, NY Watch, on-air strip) is still in `global.css`; the alert plumbing on the maps renders nothing while no alert is live, and goes with R3. The older sections of PROJECT_BRIEF, ROADMAP and DATA still describe the old site.
  - Next: the owner's review of R1 and R2, then R3, places.
- **Phase R2a, structure, built** on branch `feat/refocus-r2-structure` (stacked on R1), not pushed. Decision #112.
  - Five-item menu; 68 page files removed; 101 old addresses redirect (`redirects.json`); new `/administration/` and `/watch/`.
  - Checked: the build (2,825 pages), `npm test` (334 pass), `npm run check:county:pages`, every old URL from before R2 resolves or redirects, no internal link points at a removed page, all 986 search entries point at live pages.
  - Next, R2b: move the map and money pages to `/map/` and `/money/` (with redirects), merge About, rebuild the home page compactly, delete components and data only removed pages used, remove the Administration dropdown arrow (it has no sub-pages), and update PROJECT_BRIEF, README and DATA.
- **Phase R1, the look, built** on branch `feat/refocus-r1-look` (stacked on `plan/refocus`), not pushed. Decision #111, for the owner to review.
  - One palette block in `src/styles/global.css`: Signal Green and charcoal. The stylesheet went from 146 colour values to the palette block alone; no colour is written anywhere else in `src/`.
  - Removed: dark mode (73 rules, the toggle in the header and menu, the script in `Base.astro`), Record Red, the Highlands palette, section tones and rotating card colours.
  - New rules for gaps (hatched charcoal) and evidence labels (word and shape). Charts, the county map views, illustrations, the printable ward sheet and its QR code follow the palette.
  - Checked by eye at 390 and 1280 on the home page, Money, spending to date, a ward, the county map, the Data hub and Health: no sideways scroll, no script errors.
  - Not done: the logo (needs a new lockup from the brand kit); `apps/national` keeps its own tokens until it moves out (R7). The `.sec-*` classes and `tone` values on pages are inert and go in R2.
  - Next: R2, structure (the five-item menu, cut pages, redirects).

## Changes on 4 Nov 2026

- **County budget on the national model (decision #105).** The owner approved `docs/county-budget/SITEMAP.md`: Nyamira's money figures move into a registry in `data/county/nyamira/`, then the money section grows into year, department, programme, revenue, track and history pages under `/data/money/`, in Nyamira's own look. Next: phase C1, data, on `feat/county-phase-1-data`.
- Found while planning: the Money page ends at FY2024/25, while the national registry already holds Nyamira's FY2025/26 Controller of Budget figures. The county's website has Programme Based Budgets FY2015/16 to FY2025/26, the FY2025/26 quarterly reports, and no FY2026/27 budget yet.
- **Phase C1, data, built** on branch `feat/county-phase-1-data` (from `3c3bd02`), not pushed. Details in `docs/county-budget/DATA.md`; choices in decision #106, for the owner to review.
  - `data/county/nyamira/`: 717 figures from 13 documents. FY2025/26 budget for 24 votes and 96 programme rows (proved to the shilling against Tables 8, 12 and 19); FY2025/26 spending by department from the county's Q4 report; FY2013/14 to FY2024/25 from the Controller of Budget.
  - 96 of 97 history figures carried over from `money.json` were found on their page in the 11 stored reports. `money.json`'s equitable share column mixes the allocation (seven years) and the amount received (five years); the registry separates them.
  - `npm run check:county` and 11 tests (`npm test`: 322 pass). No page changed: the main site builds the same 2,817 pages.
  - Waiting for a person: `data-src/county/nyamira/person-checks.csv` (programme names and grouping, the budget's approval status, one history figure, the equitable share years).
  - Next: phase C2, pages. It must also fix the Money page's equitable share column, with a corrections note.
- **Phase C2, pages, built** on branch `feat/county-phase-2-pages` (stacked on C1), not pushed. Choices in decision #107, for the owner to review.
  - New under `/data/money/`: `2025-26/` (the year: total, where each KSh 100 goes and comes from, departments), `2025-26/departments/` and one page per department (24) and per programme (78), `revenue/`, `track/` (spending to 30 June 2026, with questions for departments under 75%), `history/` (the twelve-year charts, moved from `/data/money/`). `/data/money/` now opens with a stage strip, the year's budget, both published spending totals and cards to these pages. Menu: four pages under Money. Build: 2,924 pages.
  - The site now reads `src/lib/county-money.js` (from the registry) wherever it read `money.json`, so the home page, ward pages, embed and APIs all show FY2025/26. The equitable share is two columns (allocated, received), with an entry in the corrections log.
  - Checked at 390 and 1280, light and dark, on eight page types: no sideways scroll, no script errors. One layout fault found by eye and fixed: long values squeezed the labels in share bars.
  - One build took 13 minutes while screenshots ran beside it; the next took 34 seconds.
  - Next: phase C3, history (Programme Based Budgets FY2015/16 to FY2024/25, the department rename map, and the missing equitable share values so allocated and received are complete).
- **Phase C3, history, built** on branch `feat/county-phase-3-history` (stacked on C2), not pushed. Choices in decision #108, for the owner to review; details in `docs/county-budget/DATA.md`.
  - Equitable share: allocated and received for every year FY2013/14 to FY2025/26 except FY2018/19 receipts; the revenue page now charts both. The county received less than its allocation in 4 of 12 years.
  - Department budgets FY2021/22 to FY2024/25 from each year's Programme Based Budget (7 of 8 tables proved to the shilling), with a reviewed map of renamed and combined departments. Department pages show the change on FY2024/25 and five years of budgets; the year page charts the county's printed budget since FY2021/22; the department list has a change column. Registry: 876 county figures.
  - Found: FY2024/25's recurrent table does not add up to its own total (KSh 22.4 million apart); a C1 evidence note for FY2015/16 quoted the next county and is corrected.
  - Next: phase C4, hardening, and the person checks in `data-src/county/nyamira/person-checks.csv`. Earlier programme rows and budgets before FY2021/22 are not loaded.
- **Phase C4, hardening, built** on branch `feat/county-phase-4-hardening` (stacked on C3), not pushed. Decision #109, for the owner to review.
  - Checked on the money pages: 0 broken internal links (26,461 on 108 pages); 0 axe problems (WCAG 2.2 AA, 8 page types at 390 and 1280, light and dark); every page type works with JavaScript off; HTML median 13 KB compressed, largest 55 KB (`/data/money/`, with its toggles). New: `npm run check:county:pages` after a build.
  - The budget simulator and site search now read the registry; no page reads `money.json` or `budget-sectors.json`. Deleting those two files waits for the owner's go-ahead.
  - Small tap targets in shared components (breadcrumbs, CSV links, the history table's source links) pass WCAG 2.2 but not the national product's 44px aim; left for a site-wide pass.
  - Waiting for people: the usability round (`docs/county-budget/USABILITY.md`) and the person checks. The county plan's phases C1 to C4 are otherwise built; nothing is pushed or merged.

## Changes on 3 Nov 2026

- After the phases, all merged into `main`:
  - the corrections form, reusing the main site's service (decision #102);
  - the owner's approval of decisions #90 to #100;
  - Treasury notices: the 2027 Budget Policy Statement goes to Parliament by 16 November 2026, under a calendar revised for the election (decision #103);
  - briefs for reviewers, deploy steps and a daily-rebuild workflow.
- `/track/` is built from the Treasury's quarterly review for FY2025/26: revenue and spending against target, every vote's share spent, and questions for the votes under 75% (decision #104). Data release 2026-11-03 now holds 6,740 figures from 20 sources.

- National product Phase 7, hardening, on branch `feat/national-phase-7`, not pushed:
  - New security headers: HSTS, a cross-origin opener policy, open CORS on `/api/` and `/data/` only, and a one-day cache for the pictures.
  - `npm audit` now runs in CI.
  - `npm run check:national:all` runs every check in one command.
  - English pages with a headline (home, year, sector, vote, programme, county, debt, revenue, projects) now carry a Kiswahili summary, marked for review (decision #87).
  - The Track tab led to the unbuilt `/track/`. Tabs now go to a section's first built page, the footer shows unbuilt pages as "Planned" without a link, and the link check fails on any link to an unbuilt page.
  - New documents in `docs/national/`: `METHODS.md`, `BUDGET_DAY.md` (with the rehearsal timed on the laptop), `USABILITY.md` and `LAUNCH_CHECKLIST.md`.
- **Not done in Phase 7:**
  - Lighthouse is not installed, and adding it needs a new dependency.
  - The `/budget-day/` page needs next year's estimates.
  - Moving the national lib to TypeScript, or adding `astro check`, needs new dependencies.
  - Blocking merges on CI failures is a GitHub branch-protection setting the founder controls.
  - The trust pages wait for the lawyer.
  - The founder's sign-off. Everything that needs a person is in `docs/national/LAUNCH_CHECKLIST.md`.

- National product Phase 6, reach, on branch `feat/national-phase-6`, not pushed. New, in English and Kiswahili:
  - `/tools/your-taxes/`: version 1, which splits a typed amount by the shares of spending.
  - `/have-your-say/`: the dates the law fixes, a memorandum builder that sends and keeps nothing, and no hearing listed until an official notice is loaded.
  - `/learn/`: ten explainers.
  - `/learn/glossary/` and `/learn/calendar/`.
  - `/infographics/`: 62 topics, with 248 pictures that are each county's link preview.
  - `/embed/county/<slug>/`: a card news sites can frame.
  - The Data section: `/data/`, `/data/releases/`, `/methods/`, `/corrections/`, `datapackage.json`, and JSON files per vote and per county.
  - Decisions #98 to #101.
- Not done in Phase 6, and why:
  - Usability round 2 needs real readers.
  - The audit-opinions explainer needs the Auditor-General's reports.
  - Reporting an error needs a corrections contact.
  - PAYE (Your taxes version 2) waits for a test against KRA's examples.

- National product Phase 5, depth, on branch `feat/national-phase-5`, not pushed. New pages: `/debt/`, `/revenue/` and `/projects/`, in English and Kiswahili. Programme pages now show sub-programmes and the stated outcome. Vote pages show what the money pays for and the vote's projects. County pages show own-source revenue, grants, the wage and development rules checks, and pending bills.
- New data: 6,152 figures from 19 sources, data release 2026-11-03. Added:
  - the Controller of Budget's county detail tables;
  - the Annual Public Debt Report;
  - the approved Programme Based Budget;
  - all four approved Development Estimates volumes;
  - two sections of the PFM Act and one of the county regulations, read from Gazette copies.
- Every new table is proved against the Act or its own totals; see `national-budget/VERIFICATION.md`. Decisions #95 to #97 logged.
- `/track/` stays planned. The monthly Exchequer statements are in the Kenya Gazette, which Kenya Law serves behind a bot check, so the owner must download them. Programme targets wait for a person to type them (decision #97).

## Changes on 2 Nov 2026

- National product Phase 3, the app shell and design system, on branch `feat/national-phase-3`, not pushed. New: `apps/national` with five-section navigation, English and Kiswahili, the design tokens, the components and charts, a generated `_headers` file with a strict content security policy, and `/dev/components/` in preview builds. The only product page so far is the first screen of the home page. Decisions #91 and #92 logged. How to run it: `docs/national/README.md`; what was measured: `docs/national/DESIGN.md`.
- `EvidenceLabel`, `ChartFrame` and the number formats moved to `packages/engine`. Main site checked: 2,935 of 2,937 built files byte-identical, and the other two differ only in their build time.
- Tests: 264 unit tests pass, 72 browser checks pass, 24 visual comparisons pass. `npm audit` clean. Phase 2 counts corrected: the Act has 87 votes and 201 programmes (151 and 329 are rows).
- National product Phase 4, the core journeys, on branch `feat/national-phase-4`, not pushed. New in `apps/national`: the full home page, the year page, 12 sector groups, 87 votes, 201 programmes, 47 county pages with print sheets, county comparison, search and CSV downloads, in English and Kiswahili (803 pages). New data: the Parliamentary Budget Office's vote tables for two years and the Controller of Budget's county tables for two years, so 1,908 figures from 11 sources. Decisions #93 and #94 logged.
- All 87 votes in the Appropriation Act now agree with Parliament's tables within KSh 1m, and `check:national` enforces it. Two more scan errors in programme names were repaired.
- **Phase 4 is built, not finished.** The brief's test is usability round 1 with real readers, on tasks 1 to 3. It has not been run. The browser tests walk all five tasks with taps, but that shows the paths exist, not that people can use them.
- Next: usability round 1, a person's check of the sector map, then Phase 5 (depth: rules checks, bills and audits, `/track/`, `/projects/`, `/debt/`, `/revenue/`).
- Astro upgraded to 7.4.4 (decision #85), with dependencies pinned, Node pinned in `.nvmrc`, and a regression check of the existing site. On branch `feat/astro-7-upgrade`, not in `main`.
- National product Phase 2, the data engine, on branch `feat/national-phase-2`, not pushed. New: npm workspaces with `packages/engine` (figure registry, rules, comparison code, releases), `data/national/` (1,158 figures, 7 sources, first data release 2026-11-02), `data-src/national/` and `scripts/national/`. The Appropriation Act, 2026 and County Allocation of Revenue Act, 2026 are loaded. `npm run check:national` is new and runs in CI. Decision #90 logged. How to run it: `docs/national/README.md`; what is loaded: `docs/national/DATA.md`.
- Tests: 236 of 236 pass (140 existing, 96 new). Preview build passes, 2,817 pages. No page changed.
- Waiting on the owner: a route to archive copies for four sources (the Budget Summary, the Revenue Estimates and both Acts), a person's check of the rows on `data-src/national/person-checks.csv`, and who is responsible for each dataset. The 781.4 education figure stays `unverified`: the Act shows 784.48.

## Changes on 1 Nov 2026

- National budget prototype ("Kenya Budget Explained", working name) added in `national-budget/`, on branch `feat/national-budget-prototype`, not pushed. Its plan is `national-budget/BUILD_BRIEF.md` (decision #82).
- Its build scripts were ported from Python to Node (`build-data.mjs`, `assemble.mjs`), because Python is not installed on the owner's laptop. `npm test` now checks that `data.json` still matches `src/data`, so a correction there needs a rebuild of the page.
- National product Phase 0 finished: audit reported to the owner, decisions #82 to #87 logged, sector names and Treasury links fixed. The product will be a separate Astro app, `apps/national` (decision #83). Astro 7 upgrade is decided but not done (decision #85).
- National product Phase 1 written on branch `feat/national-phase-1`, not pushed: `docs/national/SITEMAP.md`, `docs/national/DESIGN.md` and a working design specimen, `docs/national/specimen.html`. Approved by the owner on 2 Nov 2026, with Dusk Violet as the accent (decisions #88, #89).

## Changes on 31 Oct 2026 (review and "implement all")

Committed as `b2cb102` on `feat/trust-and-launch-prep` and merged to `main` in PR #1 on 1 Nov 2026.

- Decisions #73–#80 added. Wording fixed: "bipartisan" and the misspelt publisher name in the footer; unqualified "independent" in About, the ward sheet, README, AGENTS and the brief.
- New pages: `/who-runs-us/`, `/privacy/`, `/terms/`, `/right-of-reply/`, `/impact/` (planned until the first entry). New data: `funders.json`, `impact.json`. Footer links to the trust pages; About menu updated.
- "Sub-county" columns and labels that showed constituencies now say "Constituency" (#75).
- `src/county.js` (county kit, #74); nav reads the constituencies from it.
- Election-period switch and `ElectionNotice.astro` (#77) on Government, Elections, Leaders, NY Watch.
- `/api/facts.json` with `src/lib/facts.js` and tests (#78). Data licence stated as CC BY 4.0 in the API wrapper and on Open data.
- NY Watch recast (#79): schema no longer requires a guest, but requires the data reviewed; page, home card, menu and EDITORIAL_RULES section 14 rewritten; section 9 now has the founder's recusal and the commercial firewall.
- Ward share images (#80): `public/brand/share/ward-<slug>.png` from `scripts/build-share-cards.mjs`, used by ward pages; test in `scripts/build-share-cards.test.js`.
- MCA source labelled honestly as a republished copy, pending a check against the Kenya Gazette (`leaders.json`: `mcaGazetteChecked: false`). Home health tile says "2017 national list".
- `.gitattributes` keeps Unix line endings (Windows clones broke `scripts/build-roads.test.js`), and keeps the published CSVs exactly as generated.
- Drafts (hidden until the editor publishes): `src/content/explainers/twelve-years-of-county-money.md` and `twelve-years-method.md`. Example NY Watch episode updated to the new format.

**Checks run on the laptop (31 Oct 2026, `npm run check:launch`, log in `check-launch.log`):** preview build passes, 2,813 pages, including the new pages and `/api/facts.json` (165 figures). Node tests: 137 of 138 pass; the one failure is `roads.json is reproducible…`, caused by Windows line endings, and clears after `git add --renormalize .`. The new pages were checked at 390 px and 1280 px: no sideways scroll, no script errors. Not yet done: Git is not on the Windows command-line PATH, so the script could not create the branch or renormalise (do both from VS Code's Source Control, or install Git for Windows with the PATH option); Python is not installed, so the Python data tests did not run there (they pass in the review workspace).

## Next

1. Add Git to the Windows command-line PATH; it works today only through Git Bash.
2. Confirm the exact registered company name against the certificate (`src/county.js`, `publisher.legalName`).
3. Lawyer review of `/who-runs-us/`, `/privacy/` and `/terms/`; set the spin-out date and criteria in `src/county.js` (`spinOut`).
4. Editor review and publication of the two money explainers (Sigma Awards deadline mid-January 2027), then the first ward receipts series.
5. Check every MCA against the Kenya Gazette; then set `mcaGazetteChecked: true` and replace `mcaSource`.
6. Refresh the health facility count from the current Kenya Master Health Facility List.
7. Page weight: done for the NG-CDF list (decision #81). The stylesheet stays as one file (about 20 KB compressed, cached).
8. County kit: move hard-coded "Nyamira" in older files to `src/county.js` as they are touched (#74).

## Before launch (needs a person)

1. Set `ND_SITE_URL=https://nyamiradaily.org` in the production build environment and verify hosting and DNS. Configure `contact`, `reportFormUrl`, `adoptSignupUrl` and `show.liveUrl` in `src/config.js` only when real, monitored destinations exist; the trust pages pick up the contact automatically.
2. Delete the EXAMPLE drafts in `src/content/` (alerts, episodes, fact-check, heritage, knowledge, news, people, project log, story).
3. Native-speaker review of every Kiswahili summary (new ones are marked in the page source); confirm emergency numbers before any alert goes live.
4. Agree who posts and verifies alerts (`docs/EDITORIAL_RULES.md` section 11).
5. Check the open items flagged in `data-src/research-notes/` (Tombe factory county; 2022 IEBC forms; NG-CDF court case; Finance Bill deadline amendment).

## Known gaps (data)

2022 full election results (IEBC forms unpublished); Auditor-General FY2014/15 and FY2015/16; milk prices; KHIS facility data (login); newer school statistics; NG-CDF project lists from the Board; reviewed facility coordinates; amounts paid and progress for tracker contracts.
