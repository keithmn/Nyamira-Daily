# County data: what is loaded

Phase C1 of [the plan](SITEMAP.md) (decision #105). Nyamira's money figures are records in `data/county/nyamira/`, in the same shape as the national registry and checked by `@kbe/engine`. No page reads them yet; that is phase C2.

## In one table

| File | What | Figures | Source |
|---|---|---|---|
| `figures/pbb-2025-26.json` | FY2025/26 budget: county totals, 24 votes, staff pay and running costs, and 96 programme rows | 408 | Programme Based Budget 2025/26, printed estimates |
| `figures/bir-2025-26-q4.json` | FY2025/26 spending by department to 30 June 2026, with the share spent | 207 | The county's fourth-quarter Budget Implementation Report |
| `figures/cob-history.json` | FY2013/14 to FY2024/25: budget, spending, development, own-source revenue, equitable share, pending bills | 102 | Controller of Budget annual reports |
| `structure-2025-26.json` | The 24 votes, their programmes and sub-programmes, by name, pointing at the figures | | Built from the CSVs |
| `sources.json` | 13 documents, with their links, dates, SHA-256 and page offsets | | |

The national registry already holds Nyamira's Controller of Budget figures for FY2024/25 (budget, spending, development) and FY2025/26 (those and own-source revenue, grants, wages, payables), and the equitable share from the County Allocation Act. They are not repeated here; the county check loads both registries together.

## How the figures are made

```
node scripts/county/extract-pbb-programmes.mjs > data-src/county/nyamira/pbb-2025-26/table9-reading.csv
node scripts/county/extract-bir-q4.mjs > data-src/county/nyamira/bir-2025-26-q4/departments.csv
node scripts/county/verify-history.mjs      # searches the stored reports, writes cob-history/checked.json
npm run build:county-data                   # builds the JSON from the CSVs
npm run check:county                        # every rule and check below
```

The extractors and `verify-history.mjs` need `pdftotext` and the PDFs in `data-src/county/nyamira/pdfs/`, which are not in Git. Download them from the links in `sources.json`; the SHA-256 there says whether a copy is the same.

- **Departments** (`pbb-2025-26/departments.csv`): carried over from `src/data/budget-sectors.json` (checked 24 Oct 2026), which read Tables 8 and 12 to 19.
- **Programmes** (`pbb-2025-26/programmes.csv`): Table 9 (pp.20-28) wraps every column. The amounts are read by machine with `pdftotext -table`, joining the pieces each number is split into; the names, and which programme each row belongs to, are typed by hand. 74 rows carry a printed programme code; for 22 the programme is read from the layout (`basis = layout`).
- **Q4 spending** (`bir-2025-26-q4/departments.csv`): Table 4 (pp.82-85), read by machine. The report names departments, not votes; `VOTES` in the extractor matches them.
- **History** (`cob-history/history.csv`): carried over from `src/data/money.json`, field for field, with two columns added for the equitable share (below).

## What the checks prove

`npm run check:county`, and the tests in `scripts/county/check-county.test.mjs`, which `npm test` runs:

- The engine's rules for every figure: sources exist, ids match their year, parts add up, page numbers fit the PDF, and only a person can mark a figure verified.
- Each vote's Table 9 rows add up to its printed total, recurrent and development (Tables 8, 12 and 19). Every vote passes to the shilling.
- Each programme row's recurrent and development add up to its total, and `programmes.csv` matches the machine reading row for row.
- Each department's staff pay and running costs add up to its recurrent total, and the 24 votes add up to the county's printed totals.
- The wage bill share, worked out from the printed parts, is the 39.3% printed on p.29.
- In the Q4 report, every share spent is the report's own spending divided by its budget, and every budget matches the Programme Based Budget within a shilling.
- `money.json` and `budget-sectors.json` still agree with the registry, number for number, while pages read them.
- The JSON is exactly what the builder makes from today's CSVs.

The tests also break a figure on purpose and confirm the check catches it.

## History, checked against the reports

All 11 Controller of Budget reports from FY2013/14 to FY2023/24 were downloaded and searched for Nyamira's figures (`verify-history.mjs`): **96 of 97 were found on the page given in `checked.json`**, printed as a sentence ("Kshs.4.23 billion"), a table cell in shillings (5,135,340,036), or for pending bills as parts that add up to the figure (938.83 + 410.76). Those figures record the check and keep the label `official`. The FY2018/19 own-source revenue target (255.57) is not in the report's text and waits for a person. FY2024/25 figures are checked against the national copy of that report.

**The equitable share was two different measures.** `money.json`'s "Equitable share reported" is the allocation, what the county expected to receive, in FY2013/14, 2014/15, 2018/19, 2019/20, 2021/22, 2023/24 and 2024/25, and the amount received in FY2015/16, 2016/17, 2017/18, 2020/21 and 2022/23. In FY2021/22 the allocation was KSh 5.14 billion and the county received 4.72 billion. The registry files each year under what the report says it is (`equitable-share-allocated` or `equitable-share-received`), with the report's words in the figure's note. The Money page still shows them as one column; phase C2 fixes that, with a corrections note.

## Found on the way

- **The FY2025/26 budget is still at the estimates stage.** Its columns say "Printed Estimates". The county posted a stamped scan of the same document on 24 Sep 2026; its cover letter forwards it to the County Assembly under PFM Act s.135, which is about supplementary budgets, so it does not show approval. The total equals the budget the Controller of Budget reports for the year.
- **Two spending figures for FY2025/26.** The county's Q4 report: KSh 7,105,627,509. The Controller of Budget: KSh 7,009.26 million.
- **Low development spending in FY2025/26**, from the county's own report: Medical Services spent 4.0% of its development budget (KSh 16.8 million of 419.3 million), Public Service Management 0.6% (2.35 million of 372.5 million), the County Assembly 15.4%. These are questions for phase C2's pages, never findings of wrongdoing.
- **Overdue:** the FY2026/27 budget (the Assembly approves it by 30 June, PFM Act s.131(1)) and the first quarter report for FY2026/27 (due by 31 October 2026, s.166(4)) are not on the county's website.

Printed errors and how each is handled: `data-src/county/nyamira/known-issues.csv`. What waits for a person: `data-src/county/nyamira/person-checks.csv`.

## Not loaded yet

- Quarters 1 to 3 of FY2025/26. Quarter 4 is cumulative, so Track needs only it; quarter 3 is a scan with no text layer.
- Programme Based Budgets FY2015/16 to FY2024/25 (phase C3), and the map of departments renamed or merged across years.
- Programme targets (key performance indicators), which wrap in the PDF as badly as the national ones (decision #97).
- Fiscal Strategy Papers, Budget Review and Outlook Papers, and supplementary budgets.
