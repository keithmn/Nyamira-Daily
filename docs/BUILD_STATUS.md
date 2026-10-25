# Build status — ND-01 project-status aggregation

Updated 25 Oct 2026. Local implementation branch; not committed, pushed, merged or deployed.

## Starting point

- Repository: `/Users/test/Projects/nyamira-daily`
- Starting branch: `codex-setup`
- Starting commit: `8b57529371009b132b38e99d69494e3607097382`
- Starting worktree: clean.
- Implementation branch: `fix/nd-01-project-status`
- Runtime: Node `v26.4.0`; npm `11.17.0`; `package-lock.json` uses lockfile version 3.
- Existing scripts were `dev`, `build` and `preview`; no test files or test script existed.

## Baseline and finding

- `npm run build` passed before edits: Astro built 504 pages.
- `npm test` before edits failed with `Missing script: "test"`; this is the pre-existing absence of a test runner, not a product test failure.
- ND-01 is reproduced. The old `statusCounts()` grouped by `ward + name` and overwrote values in input order. In the current data, reviewed ID `P-5ab05f9` has a 50% status under “Construction of OPD at Biticha Morera Dispensary” and a 62% status under a changed name. The old grouping produced 149 name keys for 148 reviewed IDs with parseable percentages, so it counted this project twice. Reversing the full current dataset did not change the old totals, but the pre-fix order-independence regression failed on two observations whose percentages differed, confirming that the last-row-wins algorithm changes category with record order.
- `wardspend.json` has no `observedOn` field. Its `fy` values include fiscal years, which are not observation dates, and the explicit literal `as at 30 Jun 2025`, which is an observation date. Source publication dates are not substituted for observation dates.
- The repository did not contain these requested handoff files: `docs/implementation/nyamira-night-watch/START_HERE.md`, `docs/implementation/nyamira-night-watch/CODEX_IMPLEMENTATION_BRIEF.md`, `docs/implementation/nyamira-night-watch/ACCEPTANCE_TESTS.md`, `docs/implementation/nyamira-night-watch/AUDIT_ADDENDUM.md`, or `docs/implementation/nyamira-night-watch/reference/2026-10-25-audit/FINDINGS.md`. Copies of the brief and acceptance tests were available and read from the local Documents folder; the START_HERE, audit addendum and findings were unavailable. `START_PROMPT.txt` was not executed.
- The repository also had no `.github/copilot-instructions.md`; `CLAUDE.md` delegates to `AGENTS.md`, and no other scoped `AGENTS.md` files were present.

## Changes

- `src/lib/project-status.js`: extracted a pure aggregation helper; aggregates by reviewed project ID, takes the latest valid dated physical-progress observation, and marks undated or same-date-conflicting observations unresolved. Only percentage text explicitly describing progress, implementation, completion or a supported physical status is counted; a financial “100% achieved” is not physical completion.
- `src/lib/projects.js`: retains the existing public helper and `pct()` export while delegating aggregation to the pure helper. Project IDs and URLs are unchanged.
- `src/lib/project-status.test.js`: added Node built-in test coverage, including an assertion against the actual renamed Biticha records in `wardspend.json`.
- `package.json`: added `npm test` using Node’s built-in `node:test`; no dependency was added and the lockfile did not need changes.
- `src/components/ProjectsPage.astro` and `src/pages/ward/[slug].astro`: now label results as latest dated physical progress, show the observation date/range, disclose unresolved coverage, and avoid implying that reported 100% proves completion or operation.
- `docs/DATA.md`, `docs/DECISIONS.md`, `docs/STATUS.md`: documented date semantics, aggregation rules and handover.
- `docs/BUILD_STATUS.md`: this handover record.

## Ambiguous-record behaviour

- A valid `observedOn` ISO date is accepted. For the existing schema, the exact `fy` text `as at 30 Jun 2025` is also accepted because it explicitly states an observation date. A fiscal-year label, source publication date, invalid date or missing date is not promoted to an observation date.
- A project with any parseable physical-progress percentage lacking a usable date is excluded from the summary, even if it also has a dated percentage; its chronology cannot be established. It is disclosed as undated.
- Repeated same-ID, same-date observations with the same percentage count once. Different percentages on the latest comparable date are excluded as a conflict. No last-row or highest-percentage tie-breaker is used.
- Missing IDs are excluded and counted as unidentified status records. Status text without a supported physical-progress percentage is not counted as completion; projects with no supported percentage are disclosed separately.
- The current dataset produces 15 counted projects, with observations dated 30 Jun 2025; 121 IDs with undated percentage observations; 36 IDs with status text but no supported physical-progress percentage; 0 same-date conflicts; and 0 status rows missing an ID. These are calculation-coverage results, not independent verification of county data.

## Verification

- Before the fix, the initial regression run against the extracted original logic reported 11 tests, 0 passed, 11 failed, including the order-independence and renamed-ID cases.
- `npm test` after the fix: 14 tests, 14 passed, 0 failed, 0 skipped. Covers order independence, repeated observations, changed names with a shared ID, similar names with distinct IDs, chronology, missing/invalid dates, missing identity, conflicts, unknown/unsupported percentages, empty input and the actual source alias.
- Final `npm run build`: passed; Astro built 504 pages.
- `git diff --check`: passed.
- `npm run build` was also run on the untouched baseline and passed.

## Not tested and remaining risks

- No browser page was shared for this session, so manual checks at 390px and desktop, in light and dark mode, were not performed. The build verifies static generation, not visual layout.
- Most source progress percentages have no explicit observation date and are excluded. Do not infer those dates from financial years; verify them against source documents in a later, separately reviewed data task.
- The progress parser intentionally accepts only recognized physical-progress wording. New source terminology should be reviewed and tested before being included.
- No county figures, source datasets, public IDs, URLs, production settings or remote state were changed. No production deployment or independent county-data verification was performed.

## Recommended next task

Review primary sources to establish whether the currently undated project-progress records have explicit observation dates. Add only dates supported by those sources; keep unresolved records excluded. Broader project identity review remains separate from this fix.

## Review and acceptance continuation (25 Oct 2026, evening)

### Current parser review

- The parser review found the reported issue in the current helper. It looked for progress-related wording anywhere and then selected the first percentage, so it returned `100` for expenditure-first, financial-progress and target-completion fixtures, `10` for `Physical progress -10%`, and `40` for two conflicting physical-progress values.
- Added regressions first; the pre-correction full suite had 20 tests, 15 passing and 5 failing. A focused regression also exposed rejection of the source phrase `100% (phase 1) – Complete`; the parser was adjusted to preserve that completion wording.
- The current parser associates values with explicit `physical progress`, `completion` or `implementation` labels, or a leading percentage followed immediately by supported completion/ongoing wording. A lone “financial progress” label, a target qualifier, a procurement-stage phrase, or a mobilisation phrase does not establish physical construction progress. Negative, decimal, out-of-range and conflicting values are rejected rather than normalized or selected.
- Source vocabulary inspected in `wardspend.json` includes `completion N%`, `implementation N%`, `N% – On-going`, `N% – Completed`, `N% (phase 1) – Complete`, mobilisation, procurement, and “not procured” statuses. The latter procurement/mobilisation statuses remain visible in source records and project detail, but no longer enter the physical-progress summary.

### Current coverage and classifications

- After parser review, the summary remains 15 included project IDs, all with explicit observation date 30 Jun 2025. Coverage is now 111 IDs with at least one supported but undated physical-progress percentage; 46 status-bearing IDs have no supported physical-progress percentage; 0 same-date conflicts; and 0 status records lack project IDs.
- Compared with the previously documented 15 / 121 / 36, ten IDs moved from “undated percentage” to “no supported physical-progress percentage”: four whose only percentage status says “Mobilised”, three whose status describes an ongoing procurement process, and three marked “Not procured”. This is a parser classification correction, not a source-data change or a newly inferred fact. No project ID or source value changed.
- For the summary scope, `total + undated + conflicts + unreported` partitions reviewed IDs with status records. `unidentified` is a count of status records lacking an ID, not project IDs; it is zero here. These figures do not describe the full project inventory. An exclusion is not evidence of a failed project, and missing progress is not zero progress.
- Source links now show source publication dates separately from the observation date and include the stored page/table references attached to latest observations. Generated HTML was inspected for the aggregate and ward summaries.

### Verification and visual review

- Final `npm test`: 22 tests, 22 passed, 0 failed, 0 skipped. The added cases cover financial and target values, negative/decimal/out-of-range values, conflicting percentages, preserved dataset wording, and exclusion of procurement/mobilisation phrases, alongside the existing aggregation regressions.
- `npm run build`: passed after the parser and template changes; Astro built 504 pages. No page-count change was observed.
- `git diff --check`: passed after final edits.
- A local Astro dev server was already running on port 4321. It initially returned HTTP 500 while the just-edited ward template contained invalid Astro fragment syntax; the markup was simplified, and a later smoke check returned HTTP 200 for all three affected routes. The final production build also passed. An in-browser visual inspection was not possible because browser automation was unavailable and no browser page was shared.
- **Awaiting owner manual checks:** preview `/data/money/`, `/ward/gesima/` (dated progress), and `/ward/kiabonyoru/` (no dated progress) at 390px and 1280px, in light and dark mode. Check no horizontal overflow, text/caveat legibility, non-colour-only labels, keyboard navigation, date/source distinctions, bars/counts, source page references, and the explanatory empty state. Current local URLs use `http://localhost:4321`; if that server is unavailable, run `npm run dev`.

### Hold status and next scope

- Status: **B. Awaiting specified manual checks.** ND-01 is not owner-approved.
- The proposed next package is a primary-source audit for explicit observation dates only. Prerequisites: reviewer-approved source inventory and access to the cited original source documents/pages; record exactly which dated statement supports each proposed observation date. Do not infer from fiscal-year or publication dates, and do not edit date fields until evidence and proposed changes are reviewed separately.
