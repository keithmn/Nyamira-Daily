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

## Open work
This prototype is now a reference, not the base for the product. `BUILD_BRIEF.md` is the plan (decision #82): read it first. The product is a new Astro app at `apps/national` (decision #83), and only the data carries over from here.

Phases: 0 audit and decisions (done, 1 Nov 2026); 1 sitemap, design document and component list, which wait for the owner's approval; then the brief's phases, numbered 2 to 7. Branches are `feat/national-phase-<n>`, each from the one before, because this branch is not in `main`.

Carried over from the old list:
- **Checks by a person:** Claude Code checked every national figure against its PDF on 1 Nov 2026 (`VERIFICATION.md`). The labels stay `official` until a person checks the printed pages, starting with the 47 hand-typed numbers from Guide p.14.
- **Acts:** the County Allocation of Revenue Act, 2026 (No. 22) and the Appropriation Act, 2026 (No. 20) are downloaded but not loaded; they load in the data engine phase. Kenya Law blocks scripts, so a person must download anything from it. The bill on libraryir.parliament.go.ke is the Treasury's February proposal at KSh 420bn: do not use it.
- **Before launch:** choose the name, set up a corrections contact, and get a native speaker to review the Kiswahili lines.
