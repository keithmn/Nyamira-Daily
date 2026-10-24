# How Nyamira compares: method and caveats (checked 2026-10-24)

## Sources
1. **CoB, County Governments Budget Implementation Review Report FY 2024/25** (cover dated August 2025).
   Landing page: https://cob.go.ke/download/county-governments-budget-implementation-review-report-fy-2024-25/
   PDF: `...?wpdmdl=16263`. The server names the file "CGBIRR August 2025.pdf". It has 607 pages, PDF CreationDate 2025-11-14, and sha256 825edf1e…b213.
   Saved as `src/CoB_County_BIRR_FY2024-25.pdf`.
   **Page numbers are the printed page numbers. PDF page = printed + 44.** For example, Nyamira s.3.34 starts on printed p.388, which is PDF p.432.
2. **KNBS, 2019 Kenya Population and Housing Census Volume I: Population by County and Sub-County.**
   https://www.knbs.or.ke/wp-content/uploads/2023/09/2019-Kenya-population-and-Housing-Census-Volume-1-Population-By-County-And-Sub-County.pdf
   The link came from https://www.knbs.or.ke/reports/kenya-census-2019/. The PDF has 49 pages and sha256 740093a7…ae4e. Saved as `src/KNBS_2019_KPHC_Volume_I.pdf`.
   Population comes from **Table 2.2 "Distribution of Population by Sex and County", printed p.7 (PDF p.17)**, Total column (male + female + intersex).
   Fetch note: knbs.or.ke does not send its Let's Encrypt intermediate certificate (YE2), so curl failed TLS verification. I downloaded the intermediate from its official AIA URL (http://ye2.i.lencr.org/) and added it to a copy of the CA bundle. Verification stayed on throughout.

## Method
- `pdftotext -layout` was run on each page separately (`work/pages/pN.txt`, where N is the PDF page).
- **Main fields** (`budget`, `spent`, `devBudget`, `devSpent`, `recurrentSpent`, absorption %) come from **Table 2.5** (pp.8–9). Bomet is on p.8 and the others are on p.9. Table 2.5 gives the same figures for every county and the national total. The amounts are in KSh millions to 2 d.p., and I multiplied them by 1,000,000. They are therefore rounded to the nearest KSh 10,000.
- **OSR** (`osrTarget`, `osrActual`) comes from **Table 2.1** (pp.2–3), using the "Total OSR" columns. These cover ordinary OSR plus FIF/A-i-A. Bomet, Homa Bay and Kericho are on p.2. Kisii, Migori, Nyamira and the Total are on p.3.
- `budget` is the approved/revised budget used by CoB: Supplementary I for Nyamira, Bomet and Kericho, and Supplementary II for Kisii, Homa Bay and Migori.
- `devAbsorptionPct` is the Table 2.5 value (whole %). The section-text rate, which is sometimes given to one decimal place, is recorded in `ch3Exact.note`.
- **`ch3Exact`** holds whole-KSh figures from each county's chapter-3 tables:
  - Budget and expenditure: the County Executive and County Assembly columns of the "Summary of Budget and Expenditure by Economic Classification" table, which I added together.
  - OSR: the ordinary OSR row plus the FIF row of the "Revenue Performance" table, which I added together.
  - These match Table 2.5 to the rounding for every county **except Homa Bay** (see below).
- The **national** figures are the all-county totals: Table 2.5 Total row (p.9) and Table 2.1 Total row (p.3). The report gives no per-county averages.
- **Verification:** every chapter-2 value was grepped on its county's row in the page text. Every chapter-3 component and every population figure was grepped in its page text. All matched.

## Conflicts within the CoB report (both values recorded)
| County | Item | Value A | Value B |
|---|---|---|---|
| Bomet | Development budget | Text s.3.2.1 (p.31): "Kshs.2.36 billion (34.2) per cent)" | Table 2.5 3,364.86m. Table 3.17: 3,114.04m + 250.82m = 3,364.86m. The text figure looks like a typo |
| Bomet | Dev absorption | Text p.34: 60.9% | Table 2.5: 61% |
| Bomet | OSR vs target | Text p.32–33: "71.3 per cent of the annual target" | Table 2.1: 76% (367.77 / 482.75) |
| Bomet | Table 3.17 "Total" row | 14,592,022,941 / 1,706,518,632 | Double-counts the sub-rows. Ignored |
| Bomet | Additional allocations | Text p.31: "Kshs.1.45 million" | Should be billion (unit error) |
| Homa Bay | Recurrent budget | Table 2.5: 7,939.42m | Table 3.92: 7,939,127,415 |
| Homa Bay | Development expenditure | Table 2.5: 3,562.22m | Table 3.92: 3,564,223,988 |
| Homa Bay | Total budget | Table 2.5: 13,130.57m. Text: 13.13bn | Table 3.92: 13,130,278,958. Table 3.88 Grand Total: 13,222,573,502 (includes equalisation fund share) |
| Homa Bay | Total expenditure | Table 2.5: 10,752.69m. Text: 10.75bn | Table 3.92: 10,754,690,713 |
| Homa Bay | OSR sub-total actual | Table 3.88 printed: 1,038,693,905 | Its components 390,674,039 + 1,099,705,825 = 1,490,379,864. This sum matches Table 2.1 (1,490.38m) and the text (1.49bn, 101%) |
| Homa Bay | Cash b/f | Text p.95: "Kshs.98.55 billion" | Table 3.88: 98,545,349 (unit error) |
| Kericho | Dev / recurrent absorption | Text p.143: 72.4% / 87.1% | Table 2.5: 72 / 87 (rounding only) |
| Kericho | OSR collected | Text p.140: 1.07bn | Text p.142: 1.08bn. Table: 1,079,648,752.25 |
| Kericho | Table 3.136 | Two additional-allocation rows are listed twice (FLOCCA CCIR, KABDP) | OSR rows are unaffected |
| Kisii | OSR performance | Table 2.1 / 3.182: 178% | Text p.183: "64 per cent of the annual target". The target (865m) covers only ordinary OSR, because Kisii set no FIF target. 178% compares all OSR against an ordinary-only target. 64% compares ordinary OSR against that target |
| Kisii | OSR collected | Table 2.1 / 3.182 sub-total: 1,538.64m | Text s.3.16.2 (p.181): 1.59bn. This adds liquor licensing (40.16m) and veterinary fund (10.53m), which Table 3.182 lists under "Other Sources" |
| Migori | Dev absorption | Text pp.316–317: 63% | Table 2.5: 62% (2,790.61 / 4,466.41 = 62.5%) |
| Migori | Unit errors | Text p.313: "738.37 billion", "691.56 billion", "688.43 billion" | Should be million |
| National | OSR performance | Table 2.1 Total row prints "4,145" (the column summed, not a rate) | Text p.2: 77%. I used 77 |

Nyamira has no internal conflicts. The chapter-2 tables, Tables 3.408 and 3.411, and the s.3.34 text all agree:
- Budget: 8.10bn
- Spent: 5.65bn
- Development: 1.05bn (37% absorption)
- Recurrent: 4.60bn (88% of the recurrent budget)
- OSR: 741.13m, which is 87% of the 850m target

Within that OSR, ordinary OSR was only 134.53m of its 400m target (34%). FIF was 606.60m against a 450m target (135%).

## Comparability cautions for the site
- **OSR is not comparable across counties without care.** Kisii's target excludes FIF. FIF is over half of OSR in most of these counties. Table 2.1 also has separate ordinary-OSR and FIF columns if the site wants to show them apart.
- Budgets are at different supplementary stages (I vs II).
- The 2019 census populations are about six years older than FY 2024/25. Spending per person computed from them reflects 2019 population.

## Gaps
- **No per-county averages** appear in chapter 2. Only all-county totals are given. Any average would have to be computed by the site, for example total ÷ 47.
- Exchequer releases, pending bills and other details were not collected because they were out of scope. They are available in the same sections.
- No figure was estimated. No field is null.
