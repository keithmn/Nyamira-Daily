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
