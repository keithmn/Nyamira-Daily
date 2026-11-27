# Kisii County money, by year: source notes

Figures for `money-years.json`, in the shape of Nyamira's per-year money data (`data-src/county/nyamira/cob-history/history.csv`). KSh million. Each value is as printed in the Controller of Budget (CoB) annual County Governments Budget Implementation Review Report for that year, converted from billions or millions and kept at the report's rounding. A value the report does not give is `null`, never estimated.

## Reports used

All 13 PDFs were downloaded from the CoB landing pages and each file's SHA-256 matched the checksum already recorded for it in the Nyamira source file (`data/county/nyamira/sources.json`). Text was extracted with `pdftotext`. Page numbers are the PDF's page numbers.

| FY | Report | Kisii section | SHA-256 (first 12) |
|---|---|---|---|
| 2013/14 | Annual CGBIRR FY 2013/14 | "Kisii County", PDF pp.100–101 | ef8e9a7812f4 |
| 2014/15 | Annual CGBIRR FY 2014/15 | "Kisii County", PDF pp.125–127 | a282633e530b |
| 2015/16 | Annual CGBIRR FY 2015/16 | §3.16, PDF pp.134–138 | eb7506ea0257 |
| 2016/17 | Annual CGBIRR FY 2016/17 | §3.16, PDF pp.135–139 | a206f4fe5ea7 |
| 2017/18 | Annual CGBIRR FY 2017/18 | §3.16, PDF pp.129–132 | 9646ea3788bd |
| 2018/19 | Annual CGBIRR FY 2018/19 | §3.16, PDF pp.131–133 | 00e24adcb3da |
| 2019/20 | CGBIRR FY 2019/20 | §3.17, PDF pp.161–163 | ef41deda74c0 |
| 2020/21 | Annual CGBIRR FY 2020/21 | §3.17, PDF pp.175–177 | fcc8de913d87 |
| 2021/22 | CGBIRR FY 2021/22 | §3.16, PDF pp.188–191 | 1b42af2f3b6a |
| 2022/23 | CGBIRR FY 2022/23 | §3.16, PDF pp.239–242 | 3106ee6e497b |
| 2023/24 | CGBIRR FY 2023/24 | §3.16, PDF pp.223–226 | a2d0d9ba5355 |
| 2024/25 | CGBIRR FY 2024/25 | §3.16, PDF pp.225–229; Table 2.1 p.3 | 825edf1e1a34 |
| 2025/26 | CGBIRR FY 2025/26 | Tables 2.1, 2.4, 2.5, 2.10; Annex I (national registry extract) | 919930622bc9 |

Each Kisii section stops where the next county's heading begins. In the FY2022/23 and FY2024/25 reports, figures from other counties appear immediately after Kisii's section, and were excluded.

## Checks

- **Spending adds up.** Development plus recurrent spending equals the printed total in every year except FY2013/14: printed components sum to 4.70bn against a 4.8bn total. FY2014/15 and FY2018/19 differ by 0.01bn (rounding in the report). FY2013/14 is kept as printed and noted.
- **FY2024/25 and FY2025/26 agree with the existing extracts.** Spent 9,963.15m (`src/data/compare.json`, `cob-county-2024-25/extract.csv`) against 9.96bn in the text. Development 2,456.17m and recurrent 7,506.99m match the text's 2.46bn and 7.51bn. FY2025/26 budget 20,160.90m, spent 12,765.24m, development spent 3,170.50m, development absorption 41.01% and FIF-inclusive own revenue (2,486.89m) match `cob-county-2025-26/extract.csv` and `osr.csv`.
- **Equitable share.** Expected share is taken from the budget financing paragraph (as Nyamira's `eqShare` is for early years). FY2025/26 uses the County Allocation Act figure in `annex.csv` (9,819.72m).
- **Pending bills** are the year-end figure in the report's words. Where a report gives development and recurrent parts, they are summed and the parts are in `pendingNote`.

## Disagreements and gaps

1. **FY2024/25 own-source revenue.** Section 3.16.2 says 1.59bn; Table 2.1 says 1,538.64m (the value in `compare.json`). I used the table figure, as the national extract does, and flagged the text figure in `osrNote`.
2. **FY2020/21 total and recurrent spending** are not printed in the section text, so `spent` and `rec` are `null`. The development figure (2.60bn) is from the economic classification. The total was not worked out from the parts.
3. **FY2024/25 expected equitable share and year-end pending bills** are not in the extracted text. `eqShare` and `pending` are `null`. Received share is 9.31bn (revenue text).
4. **FY2022/23 year-end pending bills** are not in the extracted text (start-of-year stock 1.46bn). `pending` is `null`.
5. **FY2023/24 year-end pending bills (1,120m)** come from the FY2024/25 report (§3.16.7, "as of 30 June 2024"), not the FY2023/24 report.
6. **FY2023/24 and FY2017/18 own-revenue targets** are the own-source revenue expected in the budget financing (1.84bn gross including FIF; 950m), since the reports print no separate annual target in those years. Noted in `osrNote`.
7. **FY2013/14 own-revenue target** is not printed (the report gives 22% of target). `osrTarget` is `null`.

## Not checked

- **Kisii Programme Based Budget 2025/26 with ward-level lines.** Not searched in this pass, so no URL, table or page is recorded. Nyamira's equivalent is Table 18 in `src/data/wardspend.json`.
