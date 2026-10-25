# Status and handover (25 Oct 2026)

For any assistant or developer picking this up (Codex, Claude Code, a person). Read `AGENTS.md` / `CLAUDE.md`, then this, then `docs/`.

## Where things stand

- **Live on `main`:** the Atlas redesign (live county map hero, pill navigation, Highlands palette), Phases 1–4 of `docs/EXPANSION_SPEC.md`, Auditor-General findings, Have your say, and the restructure into six Data sectors with toggles, constituency pages and NG-CDF.
- **Content model:** data in `src/data/*.json` (sources in each file and in `docs/DATA.md`); text in `src/content/` collections (`draft: true` = EXAMPLE, hidden unless `ND_DRAFTS=1`).
- **Decisions:** `docs/DECISIONS.md` #1–#30 explain every structural choice. Read #3 (two layers), #14 (questions not accusations), #24–#25 (colour roles; red on maps = emergencies only), #27 (no invented data), #30 (sectors).

## Before launch (needs a person)

1. Set the domain in `astro.config.mjs` (`site`), and `contact.whatsapp`, `reportFormUrl`, `adoptSignupUrl`, `show.liveUrl` in `src/config.js`.
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

## Current worktree (25 Oct 2026; ND-01 checkpoint committed, correction uncommitted)

- ND-01 implementation checkpoint is commit `f0b6c6f` on `fix/nd-01-project-status` (reported pushed; merge/deployment not verified). A bounded parser correction is currently uncommitted in `src/lib/project-status.js` and `src/lib/project-status.test.js`. The summary uses reviewed `projectId` values, explicit observation dates, and physical-progress wording. Undated progress, conflicting latest values, unsupported statuses and missing IDs are excluded and shown as coverage caveats. It is not owner-approved.
- The current source data has one reviewed ID represented by changed names; the earlier name-key summary counted it twice. Many percentage-bearing status rows have no observation date, so they remain outside the dated summary pending source review. No project IDs, source figures or public URLs were changed.
- The parser correction rejects locally negated completion claims, financial-only completion labels and Unicode-minus percentages. The 25-test suite and 504-page build pass; current dataset coverage remains 15 included / 111 undated / 46 unreported. Browser checks still await owner verification.
- The primary-source date audit is recorded in `docs/PROJECT_DATE_AUDIT.md`. With owner approval, `observedOn: 2025-06-30` was added to 25 CADP rows for 15 reviewed IDs in the County Annual Development Plan 2026/2027. Coverage is now 30 included / 96 undated / 46 unsupported. Two Biticha Morera OPD IDs remain separate and may represent duplicate/conflicting work; current counts treat both separately pending identity review. The other 96 remain undated pending evidence. Do not infer dates from fiscal-year labels. Continue wider reliability work only as separately scoped packages.
- ND-06 identity tooling was hardened: rerunning `scripts/project-ids.py` now preserves existing IDs; records with an identical normalized ward/name key reuse the existing ID; name changes require a reasoned, sourced alias entry. No source project ID or public URL was changed and no ambiguous alias was added. The Biticha Morera OPD relationship still needs a source-backed identity decision.
- ND-07 amount handling now distinguishes KSh 0 from unavailable values in project and ward summaries, charts, receipts, and project CSV v2. Current figures are unchanged; see `docs/BUILD_STATUS.md` for test/build results and the pending visual review.
- ND-14 financial comparisons were corrected to use like-for-like revenue actual/target scopes and clearer budget/expenditure labels. Budget less expenditure is not presented as cash released. See the current ND-14 handover in `docs/BUILD_STATUS.md`.
