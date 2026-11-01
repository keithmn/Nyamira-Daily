# Handoff: Kenya Budget Explained (national budget tool)

Read this first if you are an assistant picking this up in VS Code (Claude Code, Codex) or a developer.

## What this is
A prototype of the national budget platform from the masterplan: a BudgIT-style explainer for Kenya's FY2026/27 national budget. It reuses Nyamira Daily's data, its evidence labels and its brand. It is built as one self-contained HTML page. A published copy (private to the owner) is at https://claude.ai/artifact/5nQyn6Qs4r2Dj3CYkXVLVr.

Working name: "Kenya Budget Explained". The founder has not chosen the final name.

## Files (this folder: `national-budget/` in the Nyamira-Daily repo)
- `page.src.html`: the page (CSS, markup, script). The placeholder `__DATA__` is filled from `data.json`.
- `build_data.py`: builds `data.json`. National figures are typed in from the Treasury and Commission on Revenue Allocation (CRA) documents in `SOURCES`. County and Nyamira figures are read from `../src/data/` (`money.json`, `compare.json`, `budget-sectors.json`, `wardspend.json`, `wards.json`), so corrections made there flow through. It also runs the arithmetic checks.
- `assemble.py`: writes `kenya-budget.html`, the finished single page. Open it in a browser to view it.
- Rebuild: `python national-budget/build_data.py` then `python national-budget/assemble.py`. Set `ND_DATA` to point at another data folder.

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
4. Counties: CRA 458.9bn, then estimates 420.0bn, then the law 428.0bn; the CRA per-county table; Controller of Budget FY2024/25 figures for six counties.
5. Treasury to ward, FY2025/26: national budget, then counties, then Nyamira, then its county budget, then the 20 wards; plus 12 years of budget against spending.
6. Budget calendar and questions to ask.
7. Six traps for readers, eight guardrails from how similar tools failed, and a table of every figure with its source.

## Open work, in order
1. **Verify:** check each national figure against its printed PDF page, then relabel it `verified`. The figures were read from extracted PDF text on 1 Nov 2026.
2. **County amounts:** load the enacted County Allocation of Revenue Act 2026 amount for each county. The source is the bill PDF on libraryir.parliament.go.ke, or Kenya Law. Do not derive them from CRA's figures.
3. **Approved stage:** add the Appropriation Act 2026 figures.
4. **National spending:** add the Controller of Budget's national government spending (national BIRR FY2025/26).
5. **All counties:** extend Controller of Budget spending figures to all 47 counties (today only Nyamira, Kisii, Bomet, Kericho, Homa Bay and Migori are in `compare.json`).
6. **Into the site:** port the page to Astro, either as its own site or as a section that shares `src/lib` and the components. That is a structural decision, so log it in `docs/DECISIONS.md`.
7. **Before launch:** choose the name, set up a corrections contact, and get a native speaker to review the Kiswahili lines.
