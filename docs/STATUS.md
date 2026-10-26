# Status and handover (25 Oct 2026)

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

## Revamp finding status (25 Oct 2026)

| Finding | Current state |
|---|---|
| ND-01 project-status aggregation | Implemented and regression-tested; owner visual review remains outstanding. |
| ND-02 opportunity deadlines | Shared Nairobi-time calculation implemented and regression-tested; source checks still need weekly maintenance. |
| ND-03 production configuration | Fail-closed domain/draft checks implemented; owner supplied `nyamiradaily.org` and configured build passed. Hosting configuration and deployment are unverified. |
| ND-04 corrections | Structured accepted-corrections log implemented; intake is disabled until a monitored destination and responder are supplied. |
| ND-05 live-show indicators | Clock-based “On air now” claim removed; no live/recorded broadcast evidence or link is configured. |
| ND-06 project identities | ID preservation safeguards implemented; Biticha Morera identity remains unresolved pending evidence. |
| ND-07 missing amounts | Missing, zero and positive amounts remain distinct across summaries and exports. |
| ND-08 publication controls | Central draft/scheduled-content filtering and CI checks implemented; branch protection/review policy remains a hosting/repository-owner decision. |
| ND-09 | Needs more evidence: definition not present in the available brief/audit files. |
| ND-10 evidence labels | Metadata fields and clearer label meanings implemented; source-backed details are still missing for existing claims. |
| ND-11 alerts | Check timestamps/versioned dismissals implemented; site owner and daily review cadence are configured. Real alerts still require source-backed content and check times. |
| ND-12 community reporting | Neutral required choices and uncertainty-aware summaries implemented; intake remains disabled pending destination and reviewer. |
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
2. **Static profile pages — next, pending review of item 1:** generate one page per current facility ID with only sourced identity, owner/type/level, source and evidence fields; show unknown where current capabilities or dates are absent. Provide “No verified photo yet” unless a properly matched, dated and credited photo exists.
3. **Cross-site integration:** link ward service lists, relevant health/data views, search and machine-readable outputs to stable profile IDs; keep current public URLs working. Only add facility map points where coordinate and identity provenance is reviewed.
4. **Dated history and capability records:** build type-specific reported-available / reported-unavailable / unknown observations with source, observation date and review/publication timestamps; retain old reviewed entries. Do not upgrade existing old registries or category labels into current capability claims.
5. **Facility review intake:** coordinate with the separate corrections-review branch; add dedicated facility-observation tables and APIs, source-category attribution, editor review and a public-only approved export. Keep service and intake disabled until Cloudflare resources, reviewer access, retention and monitoring owner are configured.
6. **Map/photo experience:** add geographic zoom only for sourced facility locations and a separate image viewer with its own zoom; require capture date, photographer/source, matching facility/project ID and permissions. No generic imagery; unidentified, private or non-consenting people are not published.
7. **Site-wide icy surfaces:** move cards, tiles and graphic panels toward existing Mist/Rain tones with lightweight gloss; use real blur only on large hero panels. Preserve text contrast and all map/evidence/alert/critical-data color semantics.
8. **Validation and handover:** tests for identity, unresolved place matches, unknown states, dated history, photo provenance, route links and review exports; build; check 390px/desktop and light/dark. No browser pages are shared yet, so visual inspection will need an owner or newly shared browser page.

**Open facts before any public facility claims or intake:** current authoritative facility registers by category; dates and scope for existing sources; public, lawfully usable photos and permissions; reviewed coordinates and place-to-facility identity matches; owner-assigned reviewer, retention and monitoring cadence for the D1 service. The site can publish the known 247 profiles with honest unknowns without resolving these gaps, but it must not imply a complete inventory or current capability.

### Facility profile implementation progress (27 Oct 2026)

- **Starting point:** commit `0a0ee50ee903f259a26960cc6a94cf077d076f3b` on `feat/public-graphics-foundation`. A dedicated branch `feat/facility-profile-foundation` was created; existing documentation edits and the untracked `.wrangler/` cache were preserved.
- **Baseline:** `npm test` passed (58 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests). `npm run build` without configuration stopped at the existing fail-closed `ND_SITE_URL` guard. With the owner-supplied `ND_SITE_URL=https://nyamiradaily.org`, `npm run build` passed and produced 504 pages.
- **Ledger item 1 complete:** normalized the existing 247 facility records into `src/data/facilities.json` without changing their IDs; `src/data/wards.json` now stores the corresponding ID references. Preserved all source references, evidence notes and the 69 coordinate pairs already present in the v1 CSV. Candidate coordinates are not used as map points. Missing owner/level values are `null`. `src/data/wards.js` and `src/lib/facility-registry.js` resolve references and derive service lists/category counts; existing page, search, form and receipt consumers use the resolver. `scripts/build-facilities-csv.js` now reproduces the existing v1 CSV from the canonical registry without changing its columns or contents.
- **Validation after item 1:** `node --test src/data/wards.test.js scripts/build-facilities-csv.test.js` passed (7 tests); `npm test` passed (65 tests); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `ND_SITE_URL=https://nyamiradaily.org npm run build` passed (504 pages); `git diff --check` passed. No public facility routes, capability claims, map points, review database changes, photos or CSS changes were made.
- **Not visually checked:** this data-foundation slice does not change page styling. Browser pages are not shared, so the site was not inspected at phone/desktop widths or in light/dark mode.
- **Remaining risks / next:** the existing list is not a complete county inventory; dates and current status for many source entries are not established. The separate 63-row places list remains unlinked. Continue with ledger item 2 (static profiles) only after reviewing this registry migration. Later steps still need authoritative dated sources, reviewed identity/coordinates, photo assets/permissions, and D1 reviewer/retention/monitoring ownership. No deployment was performed.
