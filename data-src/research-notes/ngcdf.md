# NG-CDF data for Nyamira's four constituencies: research notes

Checked: 2026-10-25. Constituencies: Borabu, Kitutu Masaba, North Mugirango, West Mugirango.
Output: `ngcdf.json` (same folder). Downloaded files are in `src/`.

## Method

1. **Allocations (NG-CDF Board).** The table at https://ngcdf.go.ke/allocations/ loads its data with JavaScript from a Board API: `https://crm.ngcdf.go.ke/api/bootstrap?n=mobile-allocations&constid=N`. The constituency IDs come from the page source: Kitutu Masaba 270, West Mugirango 271, North Mugirango 272, Borabu 273. The raw JSON is saved in `src/api_allocations_*.json`. Only FY2018/19 onwards went into the JSON; FY2013/14 to FY2017/18 are also in the raw files. The same API also serves disbursements (`n=mobile-disbursements`): dated payments per constituency, saved in `src/api_disbursements_*.json`. These were not put in the JSON.
   - Cross-check: Borabu's FY2024/25 allocation (Kshs 170,469,856.74) matches the "transfers from the NG-CDF Board" of Kshs 170,469,857 cited in the FY2024/25 audit report.
2. **Audit reports.**
   - FY2018/19 to FY2021/22: the individual Office of the Auditor-General (OAG) reports for all four constituencies, found on the OAG yearly "Constituency Development Fund Audit Reports" pages. These PDFs have a text layer. Pages cited are PDF pages.
   - FY2022/23, West Mugirango FY2023/24, and FY2024/25: the Parliament Library repository (libraryir.parliament.go.ke, DSpace API). Each record is the audit report bound with the constituency's annual report and financial statements. The scans have a poor text layer, so the audit-report pages were re-OCR'd with tesseract at 300 dpi. Figures in tables were read from page images. Pages cited are PDF pages of the downloaded file.
   - FY2023/24 for Borabu, Kitutu Masaba and North Mugirango: no individual report was found on OAG or in the Parliament repository. The opinion and findings come from the OAG *Summary Report on NG-CDF 2023/2024*: Appendix 1 for opinions, and the appendices cited for findings. Pages cited are PDF pages; the printed page number is the PDF page minus 18.
3. **Projects.** The NG-CDF Board does not publish project lists for these constituencies. The Board pages ngcdf.go.ke/constituencies/borabu/, /kitutu-masaba/, /north-mugirango/ and /west-mugirango/ all say "Coming Soon". No project endpoint was found on the Board API (several names were tried with no response). Project data in the JSON therefore comes from two other sources, marked in the field `kind`:
   - `budget-execution line`: every line of *Statement 16, Budget Execution by Sectors and Projects* in each constituency's audited **FY2024/25** financial statements (Parliament repository). These were transcribed by hand from page images.
     - Lines under Kshs 100,000 were left out. These are mostly small carried-forward balances such as water-spring residuals.
     - Administration and bursary aggregate lines were left out; bursaries are in the `bursaries` array.
     - `amountKsh` is the final budget and `actualKsh` is the actual spend on a comparable basis.
     - Transcription was checked against the printed sector subtotals: emergency, environment, security and tertiary for several constituencies all reconcile exactly.
     - Some lines name suppliers or payees rather than projects (for example "Pavima Supplies", "Panom Ventures Ltd"). They are kept as printed and marked "(payee)" where the table shows only a payee.
   - `named in Auditor-General report`: projects the Auditor-General names with an amount and an observed status, for FY2018/19 to FY2024/25.
4. **Bursaries.** These come from the "Other grants and transfers" note (Note 8 or Note 14) in the financial statements, read from page images, or from the amounts the Auditor-General cites. Each row has a `category` (secondary, tertiary, special, or total as stated).
5. **How NG-CDF works.** This section draws on the NG-CDF Act No. 30 of 2015 (Rev. 2022 PDF hosted by the Board, amended 2022/2023) and the Board's About page. Legal status after the court cases is from two media reports, clearly marked `kind: media`.

## Neutrality conventions

Findings repeat what the Auditor-General reported and are attributed to that office. Words such as "unsupported", "could not be confirmed" and "not branded" are the auditor's terms. An audit qualification means the auditor could not verify an item or found a departure from the rules. It is not a finding of wrongdoing.

## What was found (counts)

| Item | Borabu | Kitutu Masaba | North Mugirango | West Mugirango |
|---|---|---|---|---|
| Allocations (FY2018/19 to FY2026/27) | 9 | 9 | 9 | 9 |
| Projects: FY2024/25 budget-execution lines | 123 | 108 | 88 | 93 |
| Projects: named in audit reports | 22 | 17 | 41 | 19 |
| Bursary rows | 11 | 8 | 5 | 11 |
| Audit years (FY2018/19 to FY2024/25) | 7 | 7 | 7 | 7 |
| Audit findings | 64 | 59 | 56 | 51 |

### Audit opinions

| FY | Borabu | Kitutu Masaba | North Mugirango | West Mugirango |
|---|---|---|---|---|
| 2018/19 | Qualified | Qualified | Qualified | Qualified |
| 2019/20 | Qualified | Qualified | Qualified | Qualified |
| 2020/21 | Qualified | Qualified | Qualified | Qualified |
| 2021/22 | Qualified | Qualified | Qualified | Unmodified |
| 2022/23 | Adverse | Adverse | Qualified | Adverse |
| 2023/24 | Unmodified* | Qualified* | Qualified* | Qualified |
| 2024/25 | Qualified | Qualified | Qualified | Qualified |

\* From the OAG 2023/24 summary report, Appendix 1.

### Allocations (Kshs, from the Board API)

| FY | Borabu | Kitutu Masaba | North Mugirango | West Mugirango |
|---|---|---|---|---|
| 2018/19 | 109,040,875.50 | 109,040,875.50 | 109,040,875.50 | 109,040,875.50 |
| 2019/20 | 137,367,724.14 | 137,367,724.14 | 137,367,724.14 | 137,367,724.14 |
| 2020/21 | 137,114,879.31 | 137,088,879.31 | 137,088,879.31 | 137,088,879.31 |
| 2021/22 | 137,088,879.00 | 137,088,879.00 | 137,088,879.00 | 137,088,879.00 |
| 2022/23 | 138,215,033.00 | 151,960,174.00 | 145,087,603.00 | 145,087,603.00 |
| 2023/24 | 166,593,720.00 | 184,129,901.00 | 175,361,810.00 | 175,361,810.00 |
| 2024/25 | 170,469,856.74 | 188,414,052.19 | 179,448,954.47 | 179,441,954.47 |
| 2025/26 | 182,982,585.00 | 202,243,910.00 | 192,623,248.00 | 192,613,248.00 |
| 2026/27 | 182,982,585.00 | 202,243,910.00 | 192,623,248.00 | 192,613,248.00 |

Notes on the table:
- From FY2022/23 the amounts differ between constituencies. This is consistent with the s.34 formula, which shares a quarter of the Fund by number of wards, but the Board feed does not explain the split.
- The feed also includes FY2025/26 and FY2026/27, which have not yet been audited.
- North and West Mugirango differ by Kshs 7,000 in FY2024/25 and by Kshs 10,000 in FY2025/26 and FY2026/27, as published.

### Other context, not in the JSON schema

From the OAG 2023/24 summary report, Appendix 2 (revenue budget vs actual) and Appendix 3 (transfers from the Board), PDF pp.60-73:

| Constituency | Revenue budget (Kshs) | Actual revenue (Kshs) | Transfers from the Board (Kshs) |
|---|---|---|---|
| Borabu | 247,114,764 | 198,335,364 | 180,459,186 |
| Kitutu Masaba | 314,337,241 | 277,643,662 | 276,566,334 |
| North Mugirango | 276,184,225 | 218,525,920 | 211,497,603 |
| West Mugirango | 286,649,630 | 240,285,168 | 197,679,334 |

The revenue budget includes balances brought forward, so it is larger than the year's allocation.

## Data caveats

- **Two figures for Kitutu Masaba's FY2022/23 bursaries.** The notes give secondary Kshs 19,450,000 and tertiary Kshs 32,054,350. The audit report cites Kshs 19,183,000 and Kshs 31,655,350 from the statement of receipts and payments. Both are recorded: the JSON value is from the notes, and the audit figures are in the `note` field.
- **Kitutu Masaba FY2021/22 comparatives.** The FY2022/23 statements show Kshs 102,513,870 as tertiary bursary and nil as secondary bursary for 2021/22. This is recorded as printed and flagged.
- **West Mugirango FY2024/25 column header.** Note 14 in the FY2024/25 statements is headed "2025-2026". It is treated as FY2024/25 and flagged.
- **Figures that do not compute.** Some audit-report figures are recorded verbatim even though the arithmetic does not work:
  - Kitutu Masaba 2019/20 under-expenditure is printed as "38%".
  - West Mugirango 2021/22 fixed-asset variance is printed as Kshs 4,550,999, but the two balances quoted differ by Kshs 12,550,999.
- **FY2024/25 statements use a different basis.** They are transitional IPSAS (accrual) statements, while earlier years are on a cash basis. Opinions are comparable; line items may not be.
- **No FY2023/24 comparatives for three constituencies.** The FY2024/25 statements for Borabu, Kitutu Masaba and North Mugirango show no FY2023/24 comparative column for bursaries.

## Gaps (what is missing)

1. **Board project lists.** These are not published: the constituency pages say "Coming Soon" and there is no project API. Projects for FY2018/19 to FY2023/24 are limited to those named in audit reports.
   - The FY2022/23 and FY2023/24 budget-execution tables exist in the downloaded statements: West Mugirango 2023/24 and all four 2022/23 files in `src/parl/`. They were not transcribed for lack of time. Their scan quality is lower; Borabu 2022/23 lists some contractor names in place of projects.
2. **Individual FY2023/24 audit reports** for Borabu, Kitutu Masaba and North Mugirango were not found. The OAG 2023/24 page lists no files, and searches of the Parliament repository returned nothing for these three. Only summary-report data is used for them.
3. **Bursary figures missing:**
   - Borabu: 2020/21 and 2023/24.
   - Kitutu Masaba: 2019/20 and 2023/24. Its 2018/19 figure is the earmarked amount, not spend.
   - North Mugirango: 2018/19, 2019/20, 2021/22 and 2023/24. Its 2020/21 figure covers secondary only. Its 2023/24 summary-report figure (Kshs 46,877,562) is the unsupported amount, not total bursary spend, so it is not recorded as a bursary allocation.
   - West Mugirango: 2018/19 and 2019/20.
   - **No source states a planned bursary "share" (allocation) per constituency.** All bursary figures are actual expenditure as reported.
4. **Gazette notices and Treasury or Parliament allocation schedules** were not consulted. The Board feed was used as the single allocation source, cross-checked once against an audit report.
5. **Parliamentary follow-up was not processed.** A Decentralized Funds Accounts Committee report on West Mugirango (11th DFAC report, covering FY2013/14, 2014/15 and 2021/22; Parliament item d8a116ae-7b6c-4a8a-af93-a9ee2852d2a1, about 185 MB) exists but was not downloaded.
6. **Supreme Court status.** The NG-CDF Act's constitutional status is before the Supreme Court: a notice of appeal was filed on 6 February 2026. No Supreme Court decision was found as of 2026-10-25. This should be re-checked before publication.

## Files

- `src/api_allocations_{270,271,272,273}.json` and `src/api_disbursements_*.json`: raw NG-CDF Board API data.
- `src/page_allocations.html` and `src/page_disbursement.html`: Board pages, used to map constituency IDs.
- `src/ngcdf_act_2015_amended_2023.pdf` and `src/act.txt`: the Act.
- `src/oag/`: 16 individual OAG reports (FY2018/19 to FY2021/22) plus `NGCDF-consolidated-2023-2024.pdf`, with text extracts.
- `src/parl/`: 9 Parliament repository PDFs (FY2022/23 x4, West Mugirango FY2023/24, FY2024/25 x4), with text layers.
- `src/ocr/`: tesseract OCR of the audit-report pages, plus page images used for the bursary notes (`burs_*.png`) and budget-execution tables (`be/`).
- `../ngcdf_scripts/`: builder (`build.py`) and the hand-transcribed FY2024/25 project tables (`proj_*2425.tsv`). These scripts were kept outside `src/`.
