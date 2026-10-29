# Status and handover (29 Oct 2026)

For any assistant or developer picking this up (Codex, Claude Code, a person). Read `AGENTS.md` / `CLAUDE.md`, then this, then `docs/`.

## Where things stand

- **Live on `main`:** the Atlas redesign (live county map hero, pill navigation, Highlands palette), Phases 1–4 of `docs/EXPANSION_SPEC.md`, Auditor-General findings, Have your say, and the restructure into six Data sectors with toggles, constituency pages and NG-CDF.
- **Content model:** data in `src/data/*.json` (sources in each file and in `docs/DATA.md`); text in `src/content/` collections (`draft: true` = EXAMPLE, hidden unless `ND_DRAFTS=1`).
- **Decisions:** `docs/DECISIONS.md` #1–#30 explain every structural choice. Read #3 (two layers), #14 (questions not accusations), #24–#25 (colour roles; red on maps = emergencies only), #27 (no invented data), #30 (sectors).

## Minimal footer (30 Oct 2026, branch `fix/minimal-footer` from `d37f7bb`)

- Decision #68 replaces #67: logo, social icons (from `social` in `src/config.js`; all empty for now, so no icons show), and one line naming the publisher, Underdawgs Rising Group Ltd., with independence and map credits.
- To switch socials on: paste the full https links of the real accounts into `social` and rebuild.
- Checks: `npm test` pass; build 850 pages; footer checked at 1280 and 390 px with and without sample links (sample links only in a throwaway preview build).

## Full-width home map and footer (29 Oct 2026, branch `feat/hero-fullwidth` from `21b325a`, pushed to `main`)

- Decision #66: the hero map spans the page with the neighbouring counties; the question/ward card floats beside the county as a glass widget with a line to the ward; phones dock the card under the map. Files: `src/components/HeroMap.astro`, `src/styles/global.css` (end), `src/data/neighbours.json` and `scripts/build-neighbours.py` (wider frame).
- Checks: `npm test` 128 pass; Python tests pass; `ND_SITE_URL=https://nyamiradaily.org npm run build` 850 pages; Playwright at 1280×900 and 1600×950 (light/dark) and 390×844: no sideways scroll, no script errors, hovering a ward moves the card beside the county and moving onto the card keeps it open.
- Decision #67: footer rebuilt as an atlas index (`src/components/SiteFooter.astro`): promise and mini county map, colour-coded directory of all sections, action cards, label key and Back to top. Checked at 1280 and 390 px: no sideways scroll, no script errors.
- Pushed to `main` on the owner's go-ahead (29 Oct 2026).

## Facelift (29 Oct 2026, merged to `main` at `6d20acb`)

- **Starting point:** `main` at `ea05311` (the branch chain described below is already on `main`; the "waiting for go-ahead" note there is historical).
- **Done (decision #55):**
  1. Large numbers glow in their section colour: soft halo in light mode, neon in dark mode and on Ink panels; red gap figures glow red. Digit colours and contrast are unchanged; print has no glow.
  2. Own icon set: `src/lib/icons.js` (31 icons) and `src/components/Icon.astro`. On page heads (a large outline mark per section, or the facility's category), sector tiles, home stat tiles and "Find out more", Government and Learn cards, ward service lists and the `Pictos` pictograms.
  3. Headings: h2 has a highlighter underline in the section's deep tone, h3 takes that tone as its colour (Varela Round has no bold). Not applied inside tiles, cards, receipts or Ink panels.
  4. `src/components/PhotoSlot.astro`: placeholder cards for verified photos. Facility profiles now show three (main photo, services, location) with the rules for when a photo can go in.
  5. Hero map: the six neighbouring counties as dashed context (`src/data/neighbours.json`, built by `scripts/build-neighbours.py` from geoBoundaries ADM1). The county still links ward by ward.
  6. `/maps/` ("Map" in the Wards menu): one map with four views (Wards, Facilities, Ward money, Alerts), zoom/pan/pinch and a ward card on tap (`src/components/AtlasMap.astro`). No facility points until locations are reviewed. `id="services"` added on ward pages.
  7. Decision #56: glass bands and frosted surfaces on every page (colour rotation like the home page), glossy heads and tiles, and large numbers in Varela Round. This covers facility ledger item 7 (icy/glass surfaces).
- **Checks:** `npm test` 104 pass; Python tests pass; `node scripts/build-facilities-csv.js --check` passes; `ND_SITE_URL=https://nyamiradaily.org npm run build` 754 pages; Playwright at 390×844 and 1280 px, light and dark, on home, Data, Government, Esise, a facility profile and `/maps/`: no sideways scroll, no console errors; the facility map's category buttons update shading, counts and key.
- **Not done / next:** owner visual review; the icons are not yet on every page (Take part, Stories, Constitution, Opportunities lists); exporting the icons as SVG files for social cards; facility ledger item 6 (sourced map points, photo viewer) remains next; item 7 is done here pending review. The photo cards are the frames item 6 will fill.

## Before launch (needs a person)

1. Set `ND_SITE_URL=https://nyamiradaily.org` in the production build environment and verify hosting/DNS; configure `contact.whatsapp`, `reportFormUrl`, `adoptSignupUrl`, and `show.liveUrl` in `src/config.js` only when real, monitored destinations exist.
2. Delete the EXAMPLE drafts in `src/content/` (alerts, stories, people, heritage, fact-check, project log).
3. Native-speaker review of Kiswahili summaries; confirm emergency numbers before any alert goes live.
4. Agree who posts and verifies alerts (`docs/EDITORIAL_RULES.md` §11).
5. Check the open items flagged in `data-src/research-notes/` (Tombe factory county; 2022 IEBC forms; NG-CDF court case; Finance Bill deadline amendment).

## Known gaps (data)

2022 full election results (IEBC forms unpublished); Auditor-General FY2014/15 and FY2015/16; milk prices; KHIS facility data (login); newer school statistics; NG-CDF project lists from the Board.

## Suggested next work

- Extend Alerts with an "Update" level for official decisions (budgets passed, fee changes, court rulings), keeping the same rules: confirmed, sourced, calm, filed by ward and date.
- Brand kit v1.1 files (swatches, social templates) from the canvas boards.
- A light editing screen (e.g. Decap CMS) for alerts and number of the week.

## Current worktree (25 Oct 2026; reliability follow-up in progress)

- Current branch `fix/nd-01-project-status`, starting commit `ad2fb018e2964ebe85114271bf333d74cfc1efc1`. ND-01, ND-06, ND-07 and ND-14 are implemented locally; the commit is one ahead of `origin` and is not pushed from this follow-up.
- ND-01 uses reviewed IDs and explicit, comparable observation dates. Coverage after the approved CADP date update is 30 included / 96 undated / 46 unsupported. The two Biticha Morera OPD IDs remain separate pending primary-source identity review. Owner visual acceptance remains outstanding.
- The local reliability follow-up implements repository-supported parts of ND-02, ND-03, ND-04, ND-05, ND-08, ND-10, ND-11 and ND-12. Final checks: 58 Node tests and 12 Python tests pass; the local preview build generates 504 pages. The production build intentionally stops without an owner-supplied HTTPS domain. Details and remaining blockers are in `docs/BUILD_STATUS.md`.
- ND-09 and ND-13 are not classified: their definitions are missing from the available repository brief/audit files. Do not infer their scope; provide the referenced specifications before implementation.
- The owner supplied `nyamiradaily.org`; a public-config build with `ND_SITE_URL=https://nyamiradaily.org` passed locally. DNS, hosting environment configuration and deployment are not verified. Correction/report destination and response role remain outstanding. The owner volunteered to check alerts daily; this monitoring policy is configured. Intake remains disabled. The Night Watch remains separate and is not being built here.
- Browser pages are not shared in this session. Responsive, keyboard-accessibility and light/dark visual checks await owner verification.
- On 26 Oct 2026, the owner prioritized filling dataset gaps before building the county encyclopedia/map. The initial public-facility/geography coverage audit and first-pass SHA/MoH, Ministry of Education and IEBC source research are recorded in `docs/FACILITY_MAP_ARCHIVE_REGISTER.md`; no public data changed. The 247-row facility list is an incomplete seed list (127 rows explicitly unverified; the other 120 health rows trace to a 2017 registry export); the 63-row place list is entirely unverified, not a county-wide inventory.
- The corrections review workflow is implemented locally on `feat/corrections-review-workflow` as a Cloudflare Pages Functions + D1 service, with the public site remaining static. Intake stays off until the owner configures the database, Turnstile, retention period, Cloudflare Access reviewers and a monitoring owner/cadence. No deployment or live database has been provisioned.

## Corrections review workflow handover (26 Oct 2026)

- Starting point: commit `bea0021589d0a56d85c7206844e3eccbd7b08695` on `feat/corrections-review-workflow`; the branch was clean before this task. Implementation commit `c0e97e7` is pushed to `origin/feat/corrections-review-workflow`. It has not been merged or deployed.
- Implemented: optional public correction intake, fail-closed until configured; bounded form validation, same-origin and Turnstile checks, honeypot and HMAC-based rate limiting; D1 submissions, review history and retention cleanup; Cloudflare Access JWT and reviewer allowlist checks; private noindex review page; accepted-only export with source provenance and Nairobi review date. Database decisions never publish automatically; the public site remains a static build.
- Files changed and why: `functions/`, `migrations/0001_corrections.sql`, `wrangler.jsonc`, `package.json` and `package-lock.json` add the Pages Functions, D1 schema and local tooling; `src/pages/how-we-work.astro` adds the default-disabled public form; `src/pages/review/corrections.astro` and `src/layouts/Base.astro` provide the noindex review interface; `src/components/CorrectionLog.astro` displays source dates; `src/lib/correction-review.test.js` and `scripts/test_corrections_migration.py` cover API rules and database constraints; `docs/CORRECTIONS_SERVICE.md`, this status entry and related project docs document safeguards and setup; `.dev.vars.example` and `.gitignore` support local configuration without tracking secrets.
- Checks run:
  - `npm test` — passed, 77 Node tests.
  - `python3 -m unittest discover -s scripts -p 'test_*.py'` — passed, 16 tests.
  - `npm run db:migrate:local` — passed; migration already applied. Local Wrangler query confirmed the three correction tables and the review-event trigger.
  - `ND_PREVIEW_BUILD=1 PUBLIC_CORRECTION_INTAKE_ENABLED=true PUBLIC_TURNSTILE_SITE_KEY=test-site-key PUBLIC_CORRECTION_RETENTION_DAYS=30 npm run build` — passed with local dummy public settings; assertions confirmed the form, retention notice, test site key and review-page `noindex`.
  - `ND_SITE_URL=https://nyamiradaily.org npm run build` — passed; assertions confirmed the default public build does not render the intake form or load Turnstile and the review page remains `noindex`.
  - `npm run pages:dev -- --ip 127.0.0.1` — local preview started and was stopped after smoke tests. `/how-we-work/` and `/review/corrections/` returned 200; GET `/api/corrections` returned 405; POST `/api/corrections` returned 503 while intake was disabled; unauthenticated review and export requests returned 503 because retention was intentionally unconfigured.
  - `git diff --check` — passed.
  - `npm audit --omit=dev` — reported 5 advisories (1 low, 3 high, 1 critical) in the existing Astro production dependency tree. The suggested automatic fix requires a breaking Astro 7 upgrade; no framework upgrade was attempted.
- Not tested: production Cloudflare configuration, real Turnstile verification, authenticated reviewer flows against a provisioned Access application, scheduled/periodic retention cleanup, and browser visual/accessibility checks at phone and desktop sizes. No Cloudflare resources or production secrets were supplied; review and intake remain disabled.
- Remaining risks: an owner must provision and configure D1, Turnstile and Access, choose retention, name an inbox owner and monitoring cadence, and approve public intake. Review accepted claims against their cited sources before changing source-controlled public data. Resolve the production Astro advisories as a separate dependency-upgrade task.
- Recommended next task: owner review of this branch and its workflow; after approval, provision the Cloudflare resources and configure a named reviewer/monitoring routine before enabling intake. Do not auto-publish database decisions.

## Revamp finding status (25 Oct 2026)

| Finding | Current state |
|---|---|
| ND-01 project-status aggregation | Implemented and regression-tested; owner visual review remains outstanding. |
| ND-02 opportunity deadlines | Shared Nairobi-time calculation implemented and regression-tested; source checks still need weekly maintenance. |
| ND-03 production configuration | Fail-closed domain/draft checks implemented; owner supplied `nyamiradaily.org` and configured build passed. Hosting configuration and deployment are unverified. |
| ND-04 corrections | Static accepted-corrections log and database-backed review workflow implemented locally; public intake remains disabled pending owner configuration of Cloudflare, retention, reviewer access and monitoring. |
| ND-05 live-show indicators | Clock-based “On air now” claim removed; no live/recorded broadcast evidence or link is configured. |
| ND-06 project identities | ID preservation safeguards implemented; Biticha Morera identity remains unresolved pending evidence. |
| ND-07 missing amounts | Missing, zero and positive amounts remain distinct across summaries and exports. |
| ND-08 publication controls | Central draft/scheduled-content filtering and CI checks implemented; branch protection/review policy remains a hosting/repository-owner decision. |
| ND-09 | Needs more evidence: definition not present in the available brief/audit files. |
| ND-10 evidence labels | Metadata fields and clearer label meanings implemented; source-backed details are still missing for existing claims. |
| ND-11 alerts | Check timestamps/versioned dismissals implemented; site owner and daily review cadence are configured. Real alerts still require source-backed content and check times. |
| ND-12 community reporting | Neutral required choices and uncertainty-aware summaries implemented; the corrections inbox does not accept facility/community service reports. That intake remains disabled pending its own destination and reviewer. |
| ND-13 | Needs more evidence: definition not present in the available brief/audit files. |
| ND-14 financial comparisons | Comparable measures and cautious budget/expenditure language implemented and regression-tested. |

No entry in this table is an owner approval, production deployment, or independent verification of county data.

## Public graphics foundation (26 Oct 2026)

- This graphics task is on `feat/public-graphics-foundation`, based on `bea0021589d0a56d85c7206844e3eccbd7b08695` from `fix/nd-01-project-status`, separate from the corrections-review branch.
- Approved direction: editorial atlas; restrained mix of pale, glossy surfaces and gentle elevation; app-polished mobile website, with a possible separate app deferred. Rollout is hybrid: shared visual foundation first, then page groups. First pass: home page and Data, starting with Money.
- Implemented in this first pass: shared light/dark graphic-surface tokens and a reusable `.graphic-panel` / `.graphic-tile` style; applied to the home summary tiles and money summary/chart sections. On 26 Oct, the owner requested a lighter shade and stronger gloss; the light surface is now near-white green with a clearer top sheen and soft elevation, while the dark surface gets a restrained highlight. No data or claims were changed.
- The graphic style is lightweight CSS. It uses existing brand roles, keeps text contrast, and preserves the static SVG/HTML chart approach.
- Validation: `npm test` passed (58 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); after the lighter/glossier adjustment, `ND_SITE_URL=https://nyamiradaily.org npm run build` passed and generated 504 pages; built-HTML assertions confirmed the home and Money graphic classes; CSS token assertions confirmed the brighter surface, stronger sheen and dark-mode counterpart; `git diff --check` passed.
- Not visually verified: 390px and desktop rendering in light and dark mode. No browser pages were shared; the checked Chromium, Playwright and Puppeteer tools were unavailable in this environment.
- Next: owner visual review of the home and Money pages at phone and desktop sizes. Then continue to remaining Data sections and ward/facility maps; facility unknowns remain explicit.

## Varela Round headings (26 Oct 2026)

- The owner approved the additional self-hosted font despite the earlier one-font guideline. Varela Round Regular now styles h1–h3; League Spartan remains the body, label and figure font.
- Added the Google Fonts Latin text subset (`VarelaRound-Latin-Title.ttf`, 32,808 bytes) and its SIL Open Font License (`OFL-VarelaRound.txt`). The subset includes common English/Swahili Latin characters and punctuation; unsupported characters use the existing font fallback. The heading font is preloaded and uses `font-display: swap`.
- Updated [AGENTS.md](../AGENTS.md), the brand brief and decisions to reflect the owner-approved change.
- Validation: `npm test` passed (58 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `ND_SITE_URL=https://nyamiradaily.org npm run build` passed (504 pages); generated-output assertions confirmed the font preload, `@font-face`, h1–h3 assignment, font asset and license; `git diff --check` passed.
- Not visually checked at 390px/desktop or light/dark because no browser page was shared and local browser automation is unavailable. The added font increases the font download budget by about 33 KB; no logo artwork or data changed.

## Facility profile and icy visual direction (26 Oct 2026)

- Owner-approved requirement foundation: create a profile for each of the 247 current facility records, preserving its existing ID; current source and verification status are visible, and the incomplete county-wide inventory is disclosed. Other datasets reference profile IDs. The separate 63-row unverified place list is not a second profile set; link a place row only after identity review.
- Health, school, market, water, public office, community centre, worship and agriculture/service entries in current lists are in scope; show public/private status only where supported.
- Profiles accept observations from residents and designated field reporters. Editors review before publication. Public attribution is source category and date, not personal name by default.
- Capabilities use type-specific reported available / reported unavailable / unknown states with a date and source; unknown is not equivalent to no. Keep a public, dated archive of reviewed profile changes and observations.
- Project/facility photos require capture date, photographer/source and matching facility/project identity. If a verified photo is unavailable, show “No verified photo yet”; do not substitute stock imagery. Incidental people may appear as context; identifiable people require consent.
- Facility updates use the review database, but approved profile records publish through the static site build. The public site's existing static delivery remains in place.
- Facility observations will use a separate workflow/tables in the existing D1 review service; they will not be mixed into general correction submissions. Reuse editor Access and anti-spam safeguards. The D1 service is on a separate, unmerged branch; integration must be planned and public intake remains disabled until configuration and review ownership are supplied.
- Icy surfaces use existing Mist/Rain tones site-wide on cards, tiles and graphic panels; map, evidence, alert and critical-data colors stay unchanged. Use lightweight gradients/highlights on ordinary surfaces; true background blur is reserved for large hero panels.
- Current data evidence: `wards.json` has 247 facility records with IDs across eight categories; source and evidence fields exist but current dated capability observations and reviewed coordinate links are not established for the inventory. The separate 63-row place list remains unverified and must not be merged automatically.
- These are requirements recorded for implementation; no facility registry, profile pages, photo system or new icy glass styling has been implemented in this phase.

### Approved implementation ledger

1. **Canonical facility records and safeguards — complete (27 Oct 2026):** normalized the 247 current facility rows around their existing IDs; added tests for unique IDs, ward/category references and explicit unknown fields. Place-list matches remain separate; existing coordinates are retained but not promoted to map points.
2. **Static profile pages — complete (27 Oct 2026):** generate one page per current facility ID at `/facility/<lowercase-ID>/` (owner-approved 27 Oct 2026), with only sourced identity, owner/type/level, source and evidence fields; show unknown where current capabilities or dates are absent. Each profile says “No verified photo yet” and that no reviewed history is recorded. Profile discovery links are ledger item 3.
3. **Cross-site integration — complete (27 Oct 2026):** ward service rows, health/education counts and search link to stable profile URLs. The v1 CSV and ward APIs remain unchanged; `facilities-v2.csv` and `/api/facilities.json` add profile URLs and omit candidate coordinates.
4. **Dated history and capability records — complete (26 Oct 2026):** add type-scoped reported-available / reported-unavailable / unknown observations with source, observation date and review/publication timestamps; retain all reviewed entries. Use reviewed descriptive labels, not an invented controlled vocabulary. Do not upgrade old registry fields or category labels into capability claims.
5. **Facility review intake — complete (29 Oct 2026), switched off:** corrections-review branch merged in; dedicated facility-observation tables and APIs, source-category attribution, editor review and a public-only approved export, plus an import script. Service and intake stay disabled until Cloudflare resources, reviewer access, retention and monitoring owner are configured. See the handover below.
6. **Map/photo experience:** add geographic zoom only for sourced facility locations and a separate image viewer with its own zoom; require capture date, photographer/source, matching facility/project ID and permissions. No generic imagery; unidentified, private or non-consenting people are not published.
7. **Site-wide icy surfaces:** move cards, tiles and graphic panels toward existing Mist/Rain tones with lightweight gloss; use real blur only on large hero panels. Preserve text contrast and all map/evidence/alert/critical-data color semantics.
8. **Validation and handover:** tests for identity, unresolved place matches, unknown states, dated history, photo provenance, route links and review exports; build; check 390px/desktop and light/dark. No browser pages are shared yet, so visual inspection will need an owner or newly shared browser page.

**Open facts before any public facility claims or intake:** current authoritative facility registers by category; dates and scope for existing sources; public, lawfully usable photos and permissions; reviewed coordinates and place-to-facility identity matches; owner-assigned reviewer, retention and monitoring cadence for the D1 service. The site can publish the known 247 profiles with honest unknowns without resolving these gaps, but it must not imply a complete inventory or current capability.

### Facility profile implementation progress (27 Oct 2026)

- **Starting point:** commit `0a0ee50ee903f259a26960cc6a94cf077d076f3b` on `feat/public-graphics-foundation`. A dedicated branch `feat/facility-profile-foundation` was created; existing documentation edits and the untracked `.wrangler/` cache were preserved.
- **Baseline:** `npm test` passed (58 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests). `npm run build` without configuration stopped at the existing fail-closed `ND_SITE_URL` guard. With the owner-supplied `ND_SITE_URL=https://nyamiradaily.org`, `npm run build` passed and produced 504 pages.
- **Ledger item 1 complete:** normalized the existing 247 facility records into `src/data/facilities.json` without changing their IDs; `src/data/wards.json` now stores the corresponding ID references. Preserved all source references, evidence notes and the 69 coordinate pairs already present in the v1 CSV. Candidate coordinates are not used as map points. Missing owner/level values are `null`. `src/data/wards.js` and `src/lib/facility-registry.js` resolve references and derive service lists/category counts; existing page, search, form and receipt consumers use the resolver. `scripts/build-facilities-csv.js` now reproduces the existing v1 CSV from the canonical registry without changing its columns or contents.
- **Validation after item 1:** `node --test src/data/wards.test.js scripts/build-facilities-csv.test.js` passed (7 tests); `npm test` passed (65 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `ND_SITE_URL=https://nyamiradaily.org npm run build` passed (504 pages); `git diff --check` passed. No public facility routes, capability claims, map points, review database changes, photos or CSS changes were made.
- **Validation after item 2:** `npm test` passed (65 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `ND_SITE_URL=https://nyamiradaily.org npm run build` passed (751 pages); `node scripts/build-facilities-csv.js --check` and `git diff --check` passed. A built-output assertion confirmed all 247 profile routes exist and show unknown capability, photo and history states; the built ward page/API/search/CSV checks from item 1 still pass.
- **Ledger item 3 starting point and files:** started from `cc0efcb` on `feat/facility-profile-foundation`. Updated ward service, category-count, health/education and search links in `src/pages/ward/[slug].astro`, `src/components/ServicesBlock.astro`, `src/pages/data/[topic].astro` and `src/pages/search-index.json.js`. Added `src/pages/api/facilities.json.js`, its tested mapper `src/lib/facility-api.js`, `public/files/facilities-v2.csv`, and v2 generation/tests in `scripts/build-facilities-csv.js` and `scripts/build-facilities-csv.test.js`. Updated `src/components/OpenData.astro`, `docs/DATA.md`, `docs/DECISIONS.md`, this status and `docs/FACILITY_MAP_ARCHIVE_REGISTER.md` to document the additive outputs and unknown-state handling.
- **Ledger item 3 complete:** linked each ward service row and search result to its existing-ID profile; health/education counts and category counts link to the corresponding ward service section. Added `facilities-v2.csv` and `/api/facilities.json` with profile URLs, while preserving the v1 CSV and ward API contracts. The new outputs omit candidate coordinates; API dates and capabilities remain explicit `null` when unrecorded. The v1 CSV SHA-1 was identical before and after regeneration.
- **Validation after item 3:** `npm test` passed (68 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `node scripts/build-facilities-csv.js --check` passed; `ND_SITE_URL=https://nyamiradaily.org npm run build` passed. Built-output assertions verified all 247 profiles, API records, v2 CSV rows, search URLs, ward service links and 75 category-count links. `git -c core.whitespace=cr-at-eol diff --cached --check` passed, recognizing the generated CSV's intentional CRLF line endings. No browser visual review or deployment was performed.
- **Ledger item 4 starting point and files:** started from `a021fe7` on `feat/facility-profile-foundation`. Added an empty published-observation registry and the validator/summarizer in `src/data/facility-observations.json` and `src/lib/facility-observations.js`; added regression tests in `src/lib/facility-observations.test.js` and extended API tests. Facility profiles now show dated reviewed observations and retained history when present; the facilities API includes latest summaries and history. Updated the data, decision, status and facility archive records. No facility source records or capability claims were changed.
- **Ledger item 4 complete:** observation records require an existing facility ID and matching category, a descriptive capability label and scope, one of the three approved statuses, source/reference, evidence label, valid observed date, and UTC review/publication timestamps. All published observations remain in history. Summaries use the latest observation date, independent of file order; disagreeing statuses on that date display as unknown with a conflict marker. Existing old registry fields are not promoted. The observation registry is currently empty, so all 247 profiles and API entries continue to report unknown/no published observation.
- **Validation after item 4:** `node --test src/lib/facility-observations.test.js src/lib/facility-api.test.js` passed (8 tests); `npm test` passed (74 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `node scripts/build-facilities-csv.js --check` passed; `ND_SITE_URL=https://nyamiradaily.org npm run build` passed (751 pages); a built-output assertion checked all 247 profile pages/API records remain explicitly unknown with empty history; `git diff --check` passed. No browser visual review or deployment was performed.
- **Not visually checked:** the profile pages use existing layouts and responsive card/table patterns, but no browser pages are shared in this session. Phone/desktop and light/dark visual review remains outstanding.
- **Remaining risks / next:** no dated, editor-reviewed facility observations have been sourced yet; the 247-entry list is incomplete and the separate 63-row places list remains unlinked. Next is ledger item 5: integrate the dedicated facility-observation review workflow with the separate corrections-review service, but keep intake disabled until Cloudflare configuration, reviewer access, retention and monitoring ownership are supplied. Later steps still need authoritative dated sources, reviewed identity/coordinates, and photo assets/permissions. No deployment was performed.

## Facility review intake handover (29 Oct 2026)

- **Starting point:** `feat/facility-review-intake` at `c74555e` with an uncommitted merge of `feat/corrections-review-workflow` left by the previous session. Its two conflicts (`docs/DECISIONS.md`, `src/layouts/Base.astro`) had been resolved by keeping both sides; that merge was checked and committed as `2971ba3`.
- **Implemented (ledger item 5), all switched off:**
  - `migrations/0002_facility_observations.sql`: facility report, event and limiter tables, separate from corrections. The database enforces the allowed statuses and source categories, and accepted reports must have complete public fields.
  - `functions/_shared/facility-observations.js`, `functions/api/facility-observations.js` (intake), `functions/api/review-facilities.js` (inbox list and decisions) and `functions/api/review-facilities-export.js` (accepted-only export). They reuse the corrections service's origin check, Turnstile, honeypot, HMAC limiter, Access JWT check and reviewer allowlist. `functions/_shared/corrections.js` and `functions/api/review.js` gained small parameters for that (form fields, limiter table, cleanup function); correction behaviour is unchanged.
  - `src/components/FacilityObservationForm.astro` on each facility profile, rendering nothing unless the build flags are set. `src/pages/review/facilities.astro` is the noindex editor inbox, cross-linked with the corrections inbox.
  - `scripts/import-facility-observations.js` adds an export to `src/data/facility-observations.json`.
  - Decision #54 records the choices: one capability per report; editors write every public field; reader reports are `verified` or `unverified` only; a separate limiter of 10 per hour; accepted reports keep reviewed fields after retention. Setup and publishing steps are in `docs/CORRECTIONS_SERVICE.md`.
- **Checks run:**
  - `npm test` passed, 104 tests. These include an end-to-end run on `node:sqlite` with the real migrations: intake → Access-signed accept → second decision refused → retention cleanup → export → import.
  - Python tests passed, 20.
  - `node scripts/build-facilities-csv.js --check` passed.
  - `ND_SITE_URL=https://nyamiradaily.org npm run build` passed, 764 pages: no profile renders the form and no page loads Turnstile.
  - A preview build with `PUBLIC_FACILITY_INTAKE_ENABLED=true` and test settings put the form on all 247 profiles with no preselected answers, while the correction form stayed off.
  - `wrangler pages functions build` compiled.
  - `npm run db:migrate:local` applied 0002.
  - `wrangler pages dev` smoke test with no settings: facility intake returned 503 (not enabled); review list, decisions and export returned 503 (retention not configured); corrections were unchanged.
- **Not tested:** real Turnstile, a real Access application, and production D1. Nothing was provisioned or deployed.
- **Before switching on:** everything already listed for corrections (D1, Turnstile, Access, retention, a named reviewer and how often they check), plus `npm run db:migrate:remote` for 0002. Then set `FACILITY_INTAKE_ENABLED` and `PUBLIC_FACILITY_INTAKE_ENABLED`. The owner may want to change the 10-per-hour limit (`facilitySubmissionsPerHour`).
- **Next:** item 6 (map/photo experience) or item 7 (icy surfaces), once the branch chain is reviewed and merged (see below).

## Branch chain and visual review (29 Oct 2026)

- **How it reaches `main`:** every branch in the chain (`codex-setup` → `fix/nd-01-project-status` → `feat/corrections-review-workflow` and `feat/public-graphics-foundation` → `feat/facility-profile-foundation`) is contained in `feat/facility-review-intake`. `main` can fast-forward to it: 18 commits, no conflicts. Waiting for the owner's go-ahead. Pushing `main` publishes all of it, and deploys it if hosting rebuilds on pushes to `main`.
- **First real browser check:** Playwright with true 390×844 and 1280×900 viewports, light and dark, on the merged build (home, Money, Health, Education, projects, Esise ward, two facility profiles, Opportunities, How we work, correction review). The command-line Chrome used before can't go narrower than 500px, so earlier "390px" checks were not real. No page scrolls sideways at 390. Fonts load. No red or amber on map points, no red on evidence labels. No console errors.
- **Problems introduced by the chain: fixed on 29 Oct 2026 and checked in a 390px browser.**
  1. Facility profiles printed each record label twice on phones. The `th[scope="row"]` is now hidden in the card layout (`global.css`); the `td` prints the label once.
  2. `/opportunities/`: the build-time note touched the page head. `.page-head + .updated` now adds a 12px gap, and this also covers other pages with that pattern.
  3. Review pages: button rows use `page-tools` (8px gap), and `tools={false}` removes the public Share/Print bar.
  4. "1 project have…" and "1 status record lack…" now agree in number (`ProjectsPage.astro`, `ward/[slug].astro`).
  5. Heading font: switched to Google Fonts' standard Latin woff2 for Varela Round (`VarelaRound-Latin.woff2`, 15,884 bytes, 230 characters, including the straight apostrophe and quotes) instead of the 32,808-byte TTF text subset (81 characters). Chrome now draws "What the county's own plan says" entirely in Varela Round. Using Google's own file avoids making a modified version under the font's Reserved Font Name. The old `VarelaRound-Latin-Title.ttf` was deleted with the owner's approval.
- **Problems already on `main`: fixed on `fix/display-issues` (29 Oct 2026) and checked at 390px and 1280px, light and dark. Nothing scrolls sideways on the checked pages.**
  1. Home Number of the Week: "37%" was amber on amber in dark mode because `main .figure .num:not(.hot)` outranked the panel's ink rule. A more specific panel rule now gives ink: 10.2:1 for the number and its source link in both modes, up from 1:1 in dark and 3.3:1 in light.
  2. Toggles at 390: `.tg-meta` wraps under the title (`flex-basis: 100%`, aligned with the title). On Money, titles take at most 2 lines, down from up to 6.
  3. Bar charts (`HBars`): under `@supports (grid-template-columns: subgrid)`, rows share one value column, so every track in a chart has the same width. Measured spread is 0px on Money, Education, Farming, Esise and Borabu. Browsers without subgrid keep the old layout.
  4. Source lines: `.source` is now ordinary text flow instead of flex, so text after a link no longer becomes its own item. This applies to all 40 `<p class="source">` lines; none contains block content.
  5. Ward maps draw each OpenStreetMap place once (21 duplicate pairs in 12 wards; see `docs/DATA.md`). The caption count follows, for example Esise "1 named place" instead of "2". **For the corrections log:** these mapped-place counts change on 12 ward pages.
  6. Home "Explore the data": the Open data tile has a 1px outline in its own deep tone, and the six tiles sit in three columns from 700px.

## Roads in the facility network (29 Oct 2026)

Owner direction: roads are facilities too. Poor roads should be shown, the responsible body named, and past allocations examined, for complete roads as well. Decisions are recorded in #57. Owner choices: start from county records while researching the official classification; condition reports use a grade plus specific checks; name the body and office, with contractors only as county documents name them.

| Step | State |
|---|---|
| R1 Road registry | **Done** on `feat/roads`. 90 roads and road structures (permanent IDs `NYM-R0001`–`NYM-R0090`): road-works records FY2023/24–FY2025/26 plus 3 roads named in audit findings. 35 ward-wide lines are excluded with reasons. The owner confirmed 3 records reported in two documents (ADP 2025/26 and CoB 2024/25, same contract sums) as the same road; they show as one contract, not two allocations. |
| R2 Profiles and links | **Done.** `/road/` index and `/road/<id>/` profiles: latest record, questions to ask (with sources and "Needs a site visit"), responsible body and office, contractors as named, condition unknown, money trail and audit findings in collapsible sections. Roads block on ward pages (19 of 20; Esise's road lines are all ward-wide), Data menu and search. Checked at 390px and 1280px, light and dark: no sideways scroll, no console errors. |
| R3 Condition reports | **Done** on `feat/roads`, switched off (#59). Grade plus up to three checks; public form on every road page only when build flags are set; `/review/roads/` inbox; accepted-only export; `scripts/import-road-conditions.js`; road pages and the index show the reviewed condition and history, and a road reported complete but graded Poor or Impassable leads with that question. Checks: 126 Node tests, including an end-to-end run on `node:sqlite` with all three migrations, and 24 Python tests; the public build has no form or Turnstile; the flagged build puts the form on all 90 roads with nothing preselected; `wrangler pages dev` with no settings returns 503 for road intake and review. The grade definitions are Nyamira Daily's own and need the owner's review. |
| R4 Road class and authority | Researched (`data-src/research-notes/roads.md`, not yet editor-checked). The Constitution and the Kenya Roads Board's APRP 2024/25 give responsibility by class (S/A/B KeNHA; C KeRRA; urban KURA; D–G county), but no public road-by-road register for Nyamira was found: the 2016 gazetted register could not be retrieved and KRB's register page is password-protected. The legal split is also unsettled (High Court ruling on s.47 stayed on appeal; reclassification bill in mediation). None of the 90 roads can be classified from a primary source yet, so all stay "not yet confirmed". Possible next step: add the national roads the APRP names in Nyamira (KeNHA B4, B5, B133 sections; KeRRA class C roads) as road records with their class and source. The county roads office holder is not in `leaders.json`. |
| R5 Older money | Project data starts at FY2023/24; earlier road money appears only through audit findings. Adding earlier budgets needs the older documents. |
| R6 Map and photos | Road lines on the map and dated photos, with facility ledger item 6. |

**Community (decision #58, owner choices 29 Oct 2026; not started):** Stories becomes Community at `/community/`. It takes in Stories, Nyamira since 2013, What's working, Nyamira's people and Heritage, plus the People and places data page; Myth or fact and Explainers move to Learn. Datasets: census social figures and a community groups directory. Reviewed sharing of events, achievements, funeral and harambee announcements and open discussion, switched off until moderation is in place. Order: road condition reports (R3) first, then Community.

## Navigation, Community and site-wide look (29 Oct 2026)

On `feat/nav-community`, from `main` at the roads merge.

- **Navigation (#60):** new `src/components/SiteHeader.astro` and `SectionTabs.astro` replace the old header in `Base.astro`. Sections reordered; Map and Roads under Wards; Myth or fact and Explainers under Learn. Desktop (1180px and up): one row, no bullets, mega menus with an intro block and page cards. Phones and tablets: a hamburger sheet with search and expandable section cards. A secondary tab bar on every section page. Checked at 360, 390, 414, 820, 1180, 1280 and 1440px, light and dark: no sideways scroll, a single 65px header bar, menus open and close, the ward label fits.
- **Community (#58):** `/community/` hub with the 2019 population and households (sourced) and tiles for its pages; People and places moved from Data to `/community/people-and-places/`; Nyamira since 2013 moved to `/community/nyamira-since-2013/`; the old Stories hub became the Community hub. Redirects: `/stories/`, `/stories/nyamira-since-2013/`, `/data/people/` and the older `/data/sub-locations/`, `/data/services/`, `/data/then-and-now/`. Data has five sectors; the home page's Explore tiles add Community as the sixth. Nyamira's people, What's working and Heritage remain Planned (no real entries yet), so they are tagged on the hub and left out of the tab bar. **Still to do:** census social figures and the community groups directory (background research in progress), and the reviewed sharing intake (switched off until moderation is in place).
- **Look (#61):** titles and big numbers about 30% smaller; pigmented cards and bands on every page; neon edges on tables and form fields; more sheen; the home hero stacked in one column. Fixed a facelift regression that turned the dark-mode Number of the Week amber on amber again.
- **Test fix:** the facility and road round-trip tests used a fixed publication time and began failing after 08:00 UTC on 29 Oct; they now stamp the time just after the review, as the import scripts do. (`main` has the failing version until this branch is merged.)
- **Towns and About (#62):** towns and centres on the county map and home hero; About is the eighth section; the header's ward pill was removed and the Your ward box on data pages got its own picker. Checked at 360, 390, 1180, 1280 and 1440px: no overflow, eight sections fit on one desktop row.
- **Community data research (29 Oct):** saved in `data-src/research-notes/social/`, not yet editor-checked. Census: 25 KNBS 2019 Volume IV tables (education, phones and internet, housing materials and tenure, water, sanitation, cooking fuel, lighting, disability, assets, religion) for Nyamira County and five KNBS sub-counties, as printed with page references. KNBS sub-counties do not match constituencies (only a CIDP mapping exists; Borabu and North Mugirango cannot be read off any row), and nothing is published by ward. **Next:** publish a reviewed selection on the Community page. Community groups: no public register lists Nyamira groups by name and place; only counts (PBO and NGO sector reports, CIDP 2018-22 co-operative counts, which conflict in the source) and scattered mentions. A records request to the county social development and co-operatives offices is the realistic route.
- **Community census figures (#58), on `feat/community-census`:** "Life at home" on `/community/`: six county headline figures and six topics (phones and internet, drinking water, toilets, cooking fuel, lighting, disability) by KNBS sub-county, from `src/data/census-social.json`. All 528 values were compared with the KNBS Volume IV PDF text, with no differences; a test keeps the published file identical to the checked extraction. KNBS dashes stay empty, never zero. The constituency caveat is shown under the tables. More tables (education, housing, tenure) are extracted in `data-src/research-notes/social/` but need the same PDF check before publishing.

## Media, news and heritage databases (29 Oct 2026)

On `feat/media-heritage` (branched from `feat/community-census`, which is not yet on `main`). Owner direction: a daily YouTube show and the NY Watch podcast, minimal data-tied news, and databases of clans, family lineages and fading cultural knowledge (traditional medicine, spiritual practices and more). Decisions #63-#65; editorial rules sections 12-14.

- **Built, empty and Planned until real entries exist:** `/news/` (briefs collection, at most four sentences, a source and a dataset link required); `/show/` and `/ny-watch/` (episodes collection; tap-to-load video, native audio, claims checked against the data, offices that appeared listed); `/community/clans/` (`src/data/clans.json`, clans as groups); `/community/knowledge/` (knowledge collection; the build refuses any entry whose holder did not consent to publication, which was checked with a temporary entry). The home page shows at most three briefs, below the data, once any exist. `/learn/episodes/` redirects to `/ny-watch/`. One EXAMPLE draft per new collection shows the format.
- **Not built, by design:** family lineages. They need a written data-protection plan first (consent from each living person named, privacy notice, secure storage, retention, withdrawal, Data Protection Commissioner registration if required).
- **Waiting on:** the YouTube channel and podcast links (`media` in `src/config.js`); first episodes and briefs; clan sources (background research running); knowledge holders, consent forms and field recordings.
