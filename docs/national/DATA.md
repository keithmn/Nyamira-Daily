# National data: what is loaded

Data release 2026-11-02 holds 1,158 figures from 7 sources, all for FY2026/27 except the prior-year county column. `data/national/sources.json` is the full record, with links, hashes and page offsets. `national-budget/VERIFICATION.md` records how each document was checked. No figure is labelled `verified` yet: only a person's check earns that.

## Figure files

| File in `data/national/figures/` | Figures | Stage | Made by |
|---|---:|---|---|
| `appropriation-act-2026.json` | 763 | approved | `build-figures.mjs`, from the extract CSV |
| `county-allocation-act-2026.json` | 209 | law | `build-figures.mjs`, from the typed CSV |
| `cra-recommendation-2026-27.json` | 48 | recommendation | `build-figures.mjs`, from the typed CSV |
| `guide-counties-2026-27.json` | 47 | statement | `build-figures.mjs`, from the typed CSV |
| `budget-2026-27.json` | 91 | estimates, statement, supplementary-1, approved | Typed by hand. Edit it here |

The Act's figures are per vote and per programme, in shillings, with Supply and Appropriations-in-Aid kept apart. The County Act's are per county: baseline, affirmative action, additional equitable share and total, plus last year's total and the four formula weights.

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

The next expected dates are the usual timing of each document, not dates anyone has announced. The People Daily report is also a source, for one `unverified` figure kept so readers can see why it does not match. It has no stored copy.

The brief asks for a named person responsible for each dataset, so a stale document has an owner. The owner has yet to choose them.

## Waiting for a person

`data-src/national/person-checks.csv` is the list. `check:national` prints it until each row's status changes.

| Table | What to check | Rows |
|---|---|---|
| `county-allocation-act-2026/typed.csv` | Typed from a picture of the First Schedule, against the Act pp.459 to 461 | 47 |
| `mwananchi-guide-2026-27/typed.csv` | Typed from a picture of the Guide's p.14 table | 47 |
| `appropriation-act-2026/corrections.csv` | Amounts corrected from page images, where the text layer misread them | 22 |
| `appropriation-act-2026/names.csv` | Names repaired from page images | 4 |

## How the Act was read, and where that stops

The PDF is a scan with a machine-read text layer. Both readings come from that one layer, through two `pdftotext` modes, so double entry catches mistakes in our parser and not a misread that both modes share. What guards against a shared misread is the Act's own arithmetic: programmes add to votes, votes to classes, classes to clusters and clusters to the grand total, to the shilling. A misread could get past that only if a second misread cancelled it exactly.

The Act does not say which vote belongs to which sector, so the Guide's sector totals cannot be rebuilt from it. That map comes with the explorer, and a person reviews it (decision #89).

## Not loaded yet

Items 3 to 12 of section 4.4 of the brief, starting with the County Governments Additional Allocations Act. The County Allocation of Revenue Act has no disbursement schedule: payment dates are in a separate Gazette notice under s.4(2).
