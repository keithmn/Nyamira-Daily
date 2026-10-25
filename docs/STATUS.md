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

## Current worktree (25 Oct 2026; not merged)

- ND-01 is implemented on `fix/nd-01-project-status`, awaiting owner manual checks. The project-status summary uses reviewed `projectId` values, explicit observation dates, and physical-progress wording. Undated progress, conflicting latest values, unsupported statuses and missing IDs are excluded and shown as coverage caveats. It is not owner-approved.
- The current source data has one reviewed ID represented by changed names; the earlier name-key summary counted it twice. Many percentage-bearing status rows have no observation date, so they remain outside the dated summary pending source review. No project IDs, source figures or public URLs were changed.
- After approval and manual preview checks, the next proposed task is to audit primary sources for explicit dates on currently undated statuses. Do not infer dates from fiscal-year labels. Continue the wider reliability work only as a separately scoped package.
