# Build status — ND-01 project-status aggregation

Initial handoff written 25 Oct 2026. The implementation was subsequently committed and pushed as `f0b6c6f592becdf3d3d0c95b09b7c877ea0e0a89`; the bounded parser correction below is uncommitted.

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

## Current state: conservative parser correction (25 Oct 2026, 20:19 EAT)

### Checkpoint and worktree

- Existing implementation checkpoint: branch `fix/nd-01-project-status`, commit `f0b6c6f592becdf3d3d0c95b09b7c877ea0e0a89`, tracking `origin/fix/nd-01-project-status`. The previous turn confirmed that commit was pushed. This correction does not rewrite that history.
- Correction is limited to `src/lib/project-status.js` and `src/lib/project-status.test.js`; both are modified, unstaged, and uncommitted. No source dataset, project ID, public URL, or observation date was changed.
- The branch remains under review and is not owner-approved. Merge and deployment status have not been independently verified.

### Reproduction and correction

- Added regressions before changing the parser. The focused pre-correction run failed all 3 new tests: financial/negated completion parsing, Unicode minus handling, and dated financial-only aggregation. The failing expectations were `null`/`unreported`; the old parser reported 100, 10, and one completed project respectively.
- The parser now rejects `financial` only when it directly qualifies a recognized progress/completion label; rejects `not` in the local phrase between a completion label and value, or immediately before an unlabelled percentage; and includes Unicode minus in the signed numeric token so the existing unsupported-signed-value guard rejects it. This is local-context handling, not a global ban on those words or punctuation.
- Synthetic outputs now are: `Financial completion 100%` → `null`; `Not 100% complete` → `null`; `completion not 100%` → `null`; `Physical progress −10%` → `null`. The legitimate expenditure-plus-physical and target-plus-current-physical cases still return 50 and 40.
- Search of current `wardspend.json` found zero status strings matching these four requested synthetic phrase patterns. These tests do not establish errors in official records.

### Verification and current coverage

- `npm test` — passed: 25 tests, 25 passed, 0 failed, 0 skipped.
- `npm run build` — passed: Astro built 504 pages.
- `git diff --check` — passed after the code and handoff edits.
- Recomputed current data coverage is unchanged: 15 included IDs, 111 undated, 0 conflicts, 46 unreported/unsupported, 0 unidentified. The parser correction changes no current record classifications.
- The shared `pct()` consumers were checked in the project detail and ward pages. Both guard meter rendering with `pc != null`; the status text remains visible when percentage parsing returns null.
- Browser tooling/pages were unavailable for visual inspection. Manual checks remain outstanding at 390px and 1280px, light and dark, for `/data/money/`, `/ward/gesima/`, and `/ward/kiabonyoru/`. Check layout/overflow, keyboard access, source links, date distinctions, counts against bars, and the explanatory empty state. Awaiting owner verification; no visual pass is claimed.

## Primary-source date audit findings (25 Oct 2026)

- The owner directed the next package to be a primary-source audit for explicit dates. The revised two-product brief and acceptance tests were read from `/Users/test/Documents`; the repository copies of `START_HERE.md`, `AUDIT_ADDENDUM.md`, and the historical `FINDINGS.md` were not available. The later two-product direction remains controlling; this audit does not create a newsroom.
- Baseline on the current worktree, including the uncommitted parser correction: `npm test` passed with 25/25; `npm run build` passed with 504 pages. No application source or test file changed during the date audit.
- Four cited official PDFs were retrieved and inspected. Evidence supports `observedOn: 2025-06-30` at the source-record level for 15 IDs inside County Annual Development Plan 2026/2027 section 2.3.2, explicitly titled “Status of projects as at 30th June 2025,” printed pp. 54–61. One candidate, Biticha Morera OPD (`P-0493bd5`), has a different ID and 65% status alongside a 62% Biticha Morera OPD record under `P-5ab05f9` in the same section. The user approved applying the date to both source rows without merging IDs; the current aggregation counts them separately pending identity review. The date-field changes and current coverage are recorded below.
- The other 96 currently undated IDs remain unsupported by the inspected citations: 82 in the County Annual Development Plan 2025/2026, 8 in CoB FY2023/24 Table 3.234, and 6 in CoB FY2024/25 Table 3.416. Their fiscal/reporting periods are not substituted for observation dates. CoB Table 3.417’s explicit date applies to its separate stalled-project list and is not transferred to the six Table 3.416 records.
- The detailed evidence, candidate IDs, official URLs, and retrieved-PDF SHA-256 fingerprints are in `docs/PROJECT_DATE_AUDIT.md`. At the time of the audit write-up, coverage was 15 included / 111 undated / 46 without supported physical progress / 0 conflicts / 0 unidentified.
- The separate ND-01 browser checks remain outstanding; ND-01 is not marked owner-approved.

## Current state: approved observation-date update (25 Oct 2026)

- **Approval and scope:** the user approved applying the explicit CADP section date to all 15 candidate IDs at row level, including `P-0493bd5`, without merging it with `P-5ab05f9`. The unresolved identity ambiguity remains a risk: current project counts treat the two IDs separately.
- **Data change:** added `observedOn: "2025-06-30"` to 25 existing status rows for the 15 candidate IDs in `src/data/wardspend.json`. No project IDs, names, status values, amounts, or URLs changed. The source-backed date and distinction from expected completion dates are documented in `docs/PROJECT_DATE_AUDIT.md` and `docs/DATA.md`.
- **Regression coverage:** added a test that checks the exact 15 reviewed IDs, all 25 dated rows, the CADP source, and the aggregate classification. The test failed before the data change on the missing explicit dates and passed afterward.
- **Coverage change:** before: 15 included (0 reported at 100%, 15 with reported progress from 1% to 99%, 0 at 0%), 111 undated, 46 unsupported/unreported, 0 conflicts, 0 unidentified. After: 30 included (10 reported at 100%, 19 with reported progress from 1% to 99%, 1 at 0%), 96 undated, 46 unsupported/unreported, 0 conflicts, 0 unidentified. The 15 newly dated rows contribute 10 at 100%, 4 from 1% to 99%, and 1 at 0%. This is calculation coverage, not the full county project inventory; 100% reported does not establish operation. The same-page Biticha Morera records may cause a distinct-project overcount until identity review.
- **Verification for this update:** `node --test --test-name-pattern='approved CADP source dates' src/lib/project-status.test.js` failed before the source edit as expected, then passed after it (1 pass, 0 failures). Final `npm test` passed (26 tests, 0 failures, 0 skipped); `npm run build` passed (504 pages); `git diff --check` passed. The independent data assertion verified all 25 candidate rows have the approved date and the post-update coverage is 30 included / 96 undated / 46 unsupported / 0 conflicts / 0 unidentified.
- **Still outstanding:** browser review at 390px and 1280px, in light and dark mode, for `/data/money/`, `/ward/gesima/`, and `/ward/kiabonyoru/`. Browser pages are not shared in this session; these checks await owner verification. Also unresolved: whether `P-0493bd5` and `P-5ab05f9` are separate work packages or duplicate/conflicting records.

## Current state: ND-06 identity safeguards (25 Oct 2026)

- **Finding:** `scripts/project-ids.py` regenerated every ID from the current ward/name key. A renamed row could therefore be assigned a new ID and break its existing project link. The override file was an empty key-to-key merge map with no structure requiring a reason or source.
- **Change:** the script now treats existing `projectId` values as authoritative, reuses an existing ID for an identical normalized ward/name key, and assigns deterministic IDs only to new unmatched keys. A different name key can use a reviewed alias that names a currently existing ID and includes both a reason and source. Invalid aliases, conflicting IDs for one key, and ID collisions fail explicitly. `--keys` remains a read-only listing command.
- **Conservative identity handling:** no real alias was added because the source review has not established that similar Biticha Morera OPD entries are the same work package. Existing IDs are not merged or migrated, preserving current public project URLs. Same-facility projects with distinct work-package names remain separate unless an evidence-backed alias is later approved.
- **Tests:** added `scripts/test_project_ids.py` with seven unit cases for current-data ID preservation, renamed records, reusing normalized keys, explicitly reviewed aliases, distinct phases at the same facility, missing review metadata, and contradictory IDs. Current identity data remains 404 rows / 349 IDs; no source ID changed.
- **Verification:** `python3 -m unittest scripts/test_project_ids.py` passed (7 tests); `npm test` passed (26 tests, 0 failures); `npm run build` passed (504 pages); `git diff --check` passed. `python3 scripts/project-ids.py --keys | head -n 8` smoke-tested key listing without writing data. An independent comparison confirmed all 404 current `projectId` values match the starting commit.
- **Files:** `scripts/project-ids.py`, `scripts/test_project_ids.py`, `data-src/project-id-overrides.json`, `docs/DATA.md`, `docs/DECISIONS.md`, `docs/STATUS.md`, and this handover. The ND-01 parser/date changes already present in the worktree remain unrelated and preserved.
- **Remaining evidence need:** source audit/reviewer must determine whether to alias any renamed or similar-name records, including the two Biticha Morera OPD IDs. Do not infer or merge identities; next data work requires cited evidence and approval.
- **Visual review:** this tooling change has no page/UI changes. The earlier ND-01 browser checks remain outstanding and await owner verification.

## Current state: ND-07 project amount handling (25 Oct 2026)

- **Finding:** the current `wardspend.json` has 404 numeric project amounts, including 13 explicit zeros and no missing values. Some UI code treated `0` as false and rendered “Printed as 0 or blank,” omitted the amount from project lists, counted zero and missing rows together, or defaulted absent ward totals to numeric zero for charts. The v1 CSV represented the current zeros as `0` but had no explicit availability field.
- **Change:** added `src/lib/project-amounts.js` to distinguish `reported_zero`, `reported_amount`, and `unavailable`; invalid/negative values fail. Ward budget sums are derived from source budget lines and remain unavailable if any component is unavailable. Charts leave the bar empty and display “Amount not reported” for unknown values; labels and receipts preserve reported KSh 0. Project details, ward lists, sector listings, adoption lists, embeds and printable sheets now distinguish the states.
- **Downloads/API:** preserved `/files/projects-v1.csv` with its original columns and added `projects-v2.csv` with an `amount_status` column. `scripts/build-projects-csv.py` regenerates v2; its tests cover reported zero, positive, missing, invalid values and CSV serialization. `/api/projects.json` keeps numeric 0 separate from null/missing and explains that contract in its description.
- **Coverage:** current records remain 404 numeric amounts: 391 positive, 13 explicit zero, 0 unavailable. All current FY2025/26 ward totals match their source-line sums; no figures changed.
- **Tests:** added `src/lib/project-amounts.test.js` and `scripts/test_project_amounts_csv.py`. The Node suite checks amount states, unavailable aggregate behavior, and that all 20 computed ward budget totals still match the current source totals. The Python suite covers the CSV classification and export.
- **Files:** amount helper/tests, amount-consuming project/ward components and pages, API description, generated CSV v2 and its generator/tests, download copy, `docs/DATA.md`, `docs/DECISIONS.md`, and this handover. Preserve all earlier ND-01/date-audit/ND-06 work.
- **Visual review:** page displays changed. Browser pages are not shared; no visual pass is claimed. Manually verify Money and a ward with reported-zero lines, especially Nyansiongo or Nyamaiya, at 390px and 1280px in light and dark modes.
- **Final verification:** `npm test` passed (31 tests, 0 failed); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `python3 scripts/build-projects-csv.py` generated 404 rows with 391 `reported_amount`, 13 `reported_zero`, and 0 `unavailable`; `npm run build` passed (504 pages); `git diff --check` passed. The row-level CSV test verifies `0`, blank, and positive values remain distinct. The current JSON dataset contains 404 numeric amounts (13 zero); no amount figure was changed.

## Current state: ND-14 financial comparison rules (25 Oct 2026)

- **Finding:** the county comparison chart used Kisii's reported 178% own-source revenue performance, which divides all revenue (including facility fees) by a target that excludes facility fees. The source's like-for-like ordinary-revenue rate is 64% (section 3.16.2, printed p.183). The UI marked Kisii “not comparable” but still plotted 178%. Budget tables also used generic “Budget”/“Spent” labels; the longitudinal budget-minus-expenditure text could be read as a cash-release figure. The data contains no separate cash-release series.
- **Change:** added `osrComparablePct` alongside the untouched reported `osrPerformancePct`; Kisii now uses the source's ordinary-only 64% for the chart, while the detail table labels its all-source actual and ordinary-only target separately. The comparison table distinguishes approved/revised budget from actual expenditure and notes that supplementary stages differ by county. Money charts and the Then/Now panel clarify that budget less expenditure is not a measure of cash released. Equitable share is named as the CoB-reported measure, without claiming it is a cash-release series. The Then/Now panel no longer calculates an OSR “times as much” comparison across the reporting-scope change.
- **Figures:** no underlying budget, expenditure, revenue, or equitable-share amounts changed. Kisii's raw 178% source value is retained for traceability; the comparable 64% value is sourced to the report's ordinary-only text. Data source references are in `compare.json` and `data-src/research-notes/compare.md`.
- **Regression coverage:** added checks that the five comparable county rates match reported actual/target arithmetic, Kisii's raw and comparable values remain distinct and trace to p.183, the all-county rate reconciles, and the money dataset labels the measure types and release-series gap.
- **Visual review:** comparison and money views changed. Browser pages are not shared; no visual check is claimed. Review `/data/money/` and its comparison toggle at 390px and 1280px, in light and dark modes, especially the Kisii row, target-scope note, and accessible table layout.
- **Verification:** `node --test src/lib/financial-comparisons.test.js` passed (3 tests); full `npm test` passed (34 tests, 0 failures); `python3 -m unittest discover -s scripts -p 'test_*.py'` passed (12 tests); `npm run build` passed (504 pages); `git diff --check` passed.
