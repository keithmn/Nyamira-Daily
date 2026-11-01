# Handoff: Kenya Budget Explained (national budget tool)

Read this first if you are an assistant picking this up in VS Code (Claude Code, Codex) or a developer.

## What this is
A prototype of the national budget platform from the masterplan: a BudgIT-style explainer for Kenya's FY2026/27 national budget. It reuses Nyamira Daily's data, its evidence labels and its brand. It is built as one self-contained HTML page. A published copy (private to the owner) is at https://claude.ai/artifact/5nQyn6Qs4r2Dj3CYkXVLVr.

Working name: "Kenya Budget Explained". The founder has not chosen the final name.

## Files (this folder: `national-budget/` in the Nyamira-Daily repo)
- `page.src.html`: the page (CSS, markup, script). The placeholder `__DATA__` is filled from `data.json`.
- `build-data.mjs`: builds `data.json`. National figures are typed in from the Treasury and Commission on Revenue Allocation (CRA) documents in `SOURCES`. County and Nyamira figures are read from `../src/data/` (`money.json`, `compare.json`, `budget-sectors.json`, `wardspend.json`, `wards.json`), so corrections made there flow through. It also runs the arithmetic checks.
- `assemble.mjs`: writes `kenya-budget.html`, the finished single page. Open it in a browser to view it.
- `VERIFICATION.md`: the record of the source check, figure by figure.
- `build-data.test.mjs`: checks that `data.json` and `kenya-budget.html` match what the scripts produce; it runs with `npm test`. If you correct `src/data`, rebuild or this test fails.
- Rebuild: `node national-budget/build-data.mjs` then `node national-budget/assemble.mjs`. Set `ND_DATA` to point at another data folder.

## Rules (same as AGENTS.md)
- Every figure has a source, a page or table, a stage (recommendation, estimates, statement, law, approved, spent, audited) and an evidence label. Our own arithmetic is tagged with `calc`.
- Never estimate or scale figures. Unknown stays unknown: final county amounts show "not yet loaded".
- Never mix stages or groupings in one sum without saying so. Keep NG-CDF (national money) apart from county money.
- Questions, not accusations; non-partisan.
- Must work on cheap phones: test at 390px width, light and dark themes, with no horizontal scroll.

## Chapters
1. Every KSh 100: where it comes from and where it goes.
2. Debt: interest is KSh 1,254.2bn, or 42% of ordinary revenue.
3. Sectors, plus a card explaining why education can be 784.5, 668.3 or 781.4.
4. Counties: CRA 458.9bn, then estimates 420.0bn, then the law 428.0bn; the CRA per-county table and the Guide's rounded amounts; Controller of Budget FY2024/25 figures for six counties.
5. Treasury to ward, FY2025/26: national budget, then counties, then Nyamira, then its county budget, then the 20 wards; plus 12 years of budget against spending.
6. Budget calendar and questions to ask.
7. Six traps for readers, eight guardrails from how similar tools failed, and a table of every figure with its source.

## Open work, in order
1. **Verify:** Claude Code checked every national figure against its PDF on 1 Nov 2026; see `VERIFICATION.md`. Still to do: a person checks each against the printed page, starting with the 47 hand-typed numbers from Guide p.14, then relabels it `verified`.
2. **County amounts:** load the exact amount for each county from the County Allocation of Revenue Act, 2026 (Act No. 22 of 2026): https://new.kenyalaw.org/akn/ke/act/2026/22/eng@2026-07-03. Kenya Law blocks scripts, so a person must download it. The bill on libraryir.parliament.go.ke is the Treasury's February proposal at KSh 420bn: do not use it. The page shows the Guide's rounded amounts (p.14) until then. Do not derive amounts from CRA's figures.
3. **Approved stage:** add the Appropriation Act, 2026 figures (Act No. 20 of 2026): https://new.kenyalaw.org/akn/ke/act/2026/20/eng@2026-06-26. Same Kenya Law download problem.
4. **National spending:** add the Controller of Budget's national government spending from the FY2025/26 annual report, listed at https://cob.go.ke/reports/national-government-budget-implementation-review-reports/.
5. **All counties:** extend Controller of Budget spending figures to all 47 counties (today only Nyamira, Kisii, Bomet, Kericho, Homa Bay and Migori are in `compare.json`).
6. **Into the site:** port the page to Astro, either as its own site or as a section that shares `src/lib` and the components. That is a structural decision, so log it in `docs/DECISIONS.md`.
7. **Before launch:** choose the name, set up a corrections contact, and get a native speaker to review the Kiswahili lines.
