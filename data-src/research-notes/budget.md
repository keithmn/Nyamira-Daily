# Nyamira County FY2025/26 budget by department: notes

Checked 2026-10-24.

## Source
- County Government of Nyamira, *The Programme Based Budget 2025/2026* (cover dated July 2025; PDF created 13 Oct 2025, 317 pages).
- URL: https://nyamira.go.ke/static/documents/13_10_2025_09_51_47_am_PBB_2025-2026.pdf
- Local copy: `src/PBB_2025-2026.pdf`. Text extracted with `pdftotext -layout` to `work/pbb.txt`.
- The printed page numbers ("Page N of 317") are the same as the PDF page numbers.
- **Stage:** the budget columns are headed "Printed Estimates 2025/2026". The foreword calls it the "PBB Budget Estimates" prepared under PFM Act s.125. The document does not say these are the figures the Assembly approved. No Appropriation Act or approved-estimates document was looked for, because the PBB has full department summary tables.

## Tables used (all FY2025/26 "Printed" columns)
| Field | Table | Pages |
|---|---|---|
| Recurrent per department | Table 12: Summary of departmental recurrent ceilings expenditure | p.37 (title), p.38 (body) |
| Compensation to employees | Table 13: Summary of Compensation to Employees per department | p.38-39 |
| Social contributions | Table 14: Summary of Social Contributions | p.39-40 |
| Recurrent conditional grants | Table 15: Conditional Grants in recurrent | p.40-41 |
| Recurrent funds (FIF, bursary etc.) | Table 16: Summary of funds in recurrent expenditure | p.41 |
| Operations and maintenance | Table 17: Summary of operations and maintenance allocation to each departments | p.41-42 |
| Development | Table 19: Summary of Development Expenditure Ceilings 2025/2026 | p.51-52 |
| Total (rec + dev) | Table 8: Summary and details of both recurrent and development Ceilings per department | p.19-20 |
| Economic classification (county-wide) | Table 10: Economic Classification for 2025/2026 Budget | p.28-29 |

## Definitions in budget-sectors.json
- `compensation` = Table 13 compensation + Table 14 employer social contributions. This is the definition the document itself uses for its 39.3% wage-bill figure. Both parts are kept separately under `compensationDetail`.
- `operations` = Table 17 O&M + Table 16 recurrent funds + Table 15 recurrent conditional grants, which together are all non-wage recurrent spending. The parts are under `operationsDetail`. The tables do not split "use of goods and services" by department.
- `recurrent` = Table 12. `development` = Table 19. `total` = Table 8.
- `short` names are our own plain-language labels, not taken from the source.

## County totals (printed)
- Total budget: 8,646,298,391 (Table 8, p.20)
- Recurrent: 5,365,307,614 (62%). Development: 3,280,990,777 (37.9%, p.42)
- Compensation to employees: 3,015,964,703. Social contributions: 385,119,251. Wage bill: **3,401,083,954**
- O&M 1,496,846,550, recurrent funds 319,697,400, recurrent conditional grants 147,679,711

## Wage bill statement
- p.29: "The total recurrent expenditure is estimated at Kshs.5,365,307,614 composed of Kshs.3,015,964,703 compensation to employees, Kshs.385,119,251 as social contributions, Kshs.1,496,846,549 as operations and maintenance, Kshs.319,697,400 as recurrent funds and Kshs.147,679,711 for recurrent conditional grants. In this budget, the wage-bill stands at 39.3%."
- The document does not say what the 39.3% is a share of. It matches (3,015,964,703 + 385,119,251) / 8,646,298,391 = 39.34% of the **total** budget. As a share of recurrent it would be 63.4%.
- **The 35% legal ceiling** (PFM (County Governments) Regulations 2015, reg. 25(1)(b)) is **not mentioned** anywhere in the extracted text. The document does not discuss whether it complies. 39.3% is above 35%.

## Checks and discrepancies
1. **Totals reconcile.** Department rows add up exactly to the printed totals for recurrent, development, total, compensation, social contributions, O&M, funds and grants. For every department, Table 12 recurrent + Table 19 development = Table 8 total.
2. **Conditional grant on the wrong vote.** Table 15 lists 75,179,711 against "5267 Medical services", and Table 4 (p.15) lists it as "5267 Health Services". But Medical Services' recurrent of 926,620,437 is fully explained without it (Table 11, p.32: 471,923,037 wages + 244,697,400 FIF + 210,000,000 EMMS). Primary Healthcare's recurrent of 1,102,065,948 reconciles only if the grant is included. Table 11 (p.36) lists CHP grant, DANIDA and salary-arrears items under Primary Health. **The grant is therefore assigned to Primary Healthcare.**
3. **1 KSh rounding in Medical Services.** Table 13 + Table 14 = 471,923,038, but Table 11 prints 471,923,037. As a result, compensation + operations across all departments come to 5,365,307,615, 1 KSh more than the printed 5,365,307,614.
4. **Table 10 does not match.** Table 10 prints Compensation to Employees (2100000) as 3,362,351,604. This matches neither Table 13 (3,015,964,703) nor Table 13 + Table 14 (3,401,083,954). The document does not reconcile it. 3,362,351,604 would be 38.9% of the total.
5. **Typos in the narrative.** p.19 gives development as "Kshs.3,280,990,391", but every table prints 3,280,990,777, and the totals only add up with 777. p.29 gives O&M as 1,496,846,549, while Table 17 prints 1,496,846,550.
6. **Vote codes conflict.** Keroka Municipality is 5280 in Table 11 and 5282 in Table 17. The Disability Board is 5282 in Table 11 and 5280 in Table 17. The JSON `vote` field uses Table 17.
7. **Table 19 header error.** Its projection columns are labelled "2025/2026, 2026/2027". The "Printed Dev Est 2025/2026" column was used. Its total matches Table 8 and the Table 18 grand total (3,280,990,777).
8. **Departments with no development line:** County Executive, CPSB, and the Revenue, Disability and Investment boards. All are 0 in Table 8 and recorded as 0. County Attorney is printed as 0 in Table 19.
9. **Names vary across tables.** For example, Table 13 has "Crop Production" where Table 12 has "Crop Development", and "Nyamira investment corporation" where Table 12 has "Nyamira Investment Board". The `name` field uses the Table 12 spelling, including the trailing comma in "Transport & Public Works,".

## Gaps
- There is no per-department split of use of goods and services versus other recurrent economic items. `operations` is all non-wage recurrent.
- Approval status is not confirmed. An Appropriation Act 2025 or approved-estimates document could be checked for later changes.
