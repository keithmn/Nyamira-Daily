# Status and handover (29 Oct 2026)

For any assistant or developer picking this up (Codex, Claude Code, a person). Read `AGENTS.md` / `CLAUDE.md`, then this, then `docs/`.

## Where things stand

- **Live on `main`:** the Atlas redesign (live county map hero, pill navigation, Highlands palette), Phases 1–4 of `docs/EXPANSION_SPEC.md`, Auditor-General findings, Have your say, and the restructure into six Data sectors with toggles, constituency pages and NG-CDF.
- **Content model:** data in `src/data/*.json` (sources in each file and in `docs/DATA.md`); text in `src/content/` collections (`draft: true` = EXAMPLE, hidden unless `ND_DRAFTS=1`).
- **Decisions:** `docs/DECISIONS.md` #1–#30 explain every structural choice. Read #3 (two layers), #14 (questions not accusations), #24–#25 (colour roles; red on maps = emergencies only), #27 (no invented data), #30 (sectors).

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
