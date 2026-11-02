# National data: what is loaded

Data release 2026-11-02 holds 1,908 figures from 11 sources, for FY2026/27 with FY2025/26 and FY2024/25 where a comparison needs them. `data/national/sources.json` is the full record, with links, hashes and page offsets. `national-budget/VERIFICATION.md` records how each document was checked. No figure is labelled `verified` yet: only a person's check earns that.

## Figure files

| File in `data/national/figures/` | Figures | Stage | Made by |
|---|---:|---|---|
| `appropriation-act-2026.json` | 763 | approved | `build-figures.mjs`, from the extract CSV |
| `county-allocation-act-2026.json` | 209 | law | `build-figures.mjs`, from the typed CSV |
| `cra-recommendation-2026-27.json` | 48 | recommendation | `build-figures.mjs`, from the typed CSV |
| `guide-counties-2026-27.json` | 47 | statement | `build-figures.mjs`, from the typed CSV |
| `pbo-votes-2026-27.json` | 87 | approved | `build-figures.mjs`, from the Budget Explainer CSV |
| `pbo-votes-2025-26.json` | 87 | approved | `build-figures.mjs`, from the Budget Explainer CSV |
| `cob-counties-2025-26.json` | 288 | spent | `build-figures.mjs`, from the extract CSV |
| `cob-counties-2024-25.json` | 288 | spent | `build-figures.mjs`, from the extract CSV |
| `budget-2026-27.json` | 91 | estimates, statement, supplementary-1, approved | Typed by hand. Edit it here |

The Act's figures are per vote and per programme, in shillings, with Supply and Appropriations-in-Aid kept apart. The County Act's are per county: baseline, affirmative action, additional equitable share and total, plus last year's total and the four formula weights.

The two `pbo-votes` files hold each vote's total in KSh million, in one grouping for both years, so a vote can be compared with last year like for like. The Act stays the record of this year's money. They also let the build check the Act, vote by vote.

`data/national/sectors.json` says which votes are in each of the 12 groups, read from the Budget Explainer's tables. It is generated too.

## Documents

Stored PDFs are in `data-src/national/pdfs/`, which is not in Git (decision #27). A new copy of the repo needs them from the official link, or from the owner's copy.

| Stored file | Document | Archive copy | Next expected | Responsible |
|---|---|---|---|---|
| `appropriation-act-2026.pdf` | Appropriation Act, 2026 (No. 20) | None yet | 30 Jun 2027 | Not named yet |
| `county-allocation-act-2026.pdf` | County Allocation of Revenue Act, 2026 (No. 22) | None yet | 31 Jul 2027 | Not named yet |
| `mwananchi-guide-2026-27.pdf` | Mwananchi Guide, FY2026/27 | 13 Jul 2026 | 30 Jun 2027 | Not named yet |
| `budget-summary-2026-27.pdf` | Budget Summary, FY2026/27 | None yet | 30 Apr 2027 | Not named yet |
| `estimates-of-revenue-2026-27.pdf` | Estimates of Revenue, Grants and Loans, FY2026/27 | None yet | 30 Jun 2027 | Not named yet |
| `cra-recommendation-2026-27.pdf` | CRA Recommendation, FY2026/27 | 8 Apr 2026 | 28 Feb 2027 | Not named yet |
| `pbo-budget-explainer-2026.pdf` | Budget Explainer 2026, Parliamentary Budget Office | None yet | 31 Aug 2027 | Not named yet |
| `pbo-budget-explainer-2025.pdf` | Budget Explainer, FY2025/26, Parliamentary Budget Office | None yet | None | Not named yet |
| `cob-county-birr-2025-26.pdf` | County Governments Budget Implementation Review Report, FY2025/26, Controller of Budget | None yet | 30 Sep 2027 | Not named yet |
| `cob-county-birr-2024-25.pdf` | The same report, FY2024/25 | None yet | None | Not named yet |

The next expected dates are the usual timing of each document, not dates anyone has announced. The People Daily report is also a source, for one `unverified` figure kept so readers can see why it does not match. It has no stored copy.

The brief asks for a named person responsible for each dataset, so a stale document has an owner. The owner has yet to choose them.

## Waiting for a person

`data-src/national/person-checks.csv` is the list. `check:national` prints it until each row's status changes.

| Table | What to check | Rows |
|---|---|---|
| `county-allocation-act-2026/typed.csv` | Typed from a picture of the First Schedule, against the Act pp.459 to 461 | 47 |
| `mwananchi-guide-2026-27/typed.csv` | Typed from a picture of the Guide's p.14 table | 47 |
| `appropriation-act-2026/corrections.csv` | Amounts corrected from page images, where the text layer misread them | 22 |
| `appropriation-act-2026/names.csv` | Names repaired from page images or from another row of the Act | 6 |
| `pbo-explainer/votes-2026-27.csv` | Which votes are in each sector, as the Budget Explainer's tables print them (decision #89) | 87 |
| `pbo-explainer/names-2025-26.csv` | Last year's votes matched to this year's by name, where the wording differs | 5 |

## How the Act was read, and where that stops

The PDF is a scan with a machine-read text layer. Both readings come from that one layer, through two `pdftotext` modes, so double entry catches mistakes in our parser and not a misread that both modes share. Two things guard against a shared misread. The Act's own arithmetic adds programmes to votes, votes to classes, classes to clusters and clusters to the grand total, to the shilling. The Parliamentary Budget Office's tables are an independent reading: all 87 votes agree with them within KSh 1 million on recurrent, development and total, and `check:national` fails if one stops agreeing.

Arithmetic cannot check words. All 156 distinct programme names were read by Claude Code, and two more were repaired. Programme code `075000`, for Administration of Quasi-Judicial Functions, looks like a lost digit, but the Programme Based Budget prints it the same way, so it stays.

## How a vote is compared with last year

The 2025 Budget Explainer prints vote names, not codes, so they are matched to this year's votes by name. All 87 match; five needed the wording match in `names-2025-26.csv`. Both years are at the approved stage, in cash terms.

Sector membership changes between years. The State Department for Internal Security and National Administration was in Public Administration last year and is in Governance this year. So a sector's change adds the same votes in both years. Governance is up 29.7% on that basis, not the 78.9% its printed totals suggest, and Public Administration is up 12.6%, not down 10.3%.

The Mwananchi Guide's ten sectors group some votes differently: its General Economics leaves out the ASALs vote and its Social Protection leaves out Youth. Its sector totals are shown as a note, never compared. Parliament and the Judiciary are listed on their own in the Explainer, so the site has 12 groups.

## Not loaded yet

Items 3 to 12 of section 4.4 of the brief, starting with the County Governments Additional Allocations Act and the Programme Based Budget. The County Allocation of Revenue Act has no disbursement schedule: payment dates are in a separate Gazette notice under s.4(2). Own-source revenue and pending bills are in the Controller of Budget reports already stored (Tables 2.1 and 2.9 of the FY2024/25 report), and are not read yet.
