# Project progress observation-date audit

Checked 25 Oct 2026. This audit reviews cited primary sources for explicit observation dates on project-progress records classified as undated at the start of the audit. After review, the user approved entering the section date on all 15 candidate IDs as row-level evidence, including `P-0493bd5`; those rows now have `observedOn: "2025-06-30"`. No source figures, project IDs, or public URLs were changed.

## Scope and method

At the start of this audit, the ND-01 helper identified 111 reviewed project IDs with supported physical-progress percentages but no comparable observation date. They mapped to four source groups:

| Source ID | IDs undated at audit start | Status rows in scope | Cited pages |
|---|---:|---:|---|
| `adp2526` | 82 | 95 | Printed pp. 57–60, 69, 73–77, 79–80 |
| `cadp2627` | 15 | 25 | Printed pp. 54–55, 60–61 |
| `cob2324` | 8 | 16 | Table 3.234, printed pp. 438–439 |
| `cob2425` | 6 | 12 | Table 3.416, printed p. 396 |
| **Total** | **111** | **148** | |

The source PDFs were obtained from the official URLs listed below and inspected using `pdfinfo`, `pdftotext -layout`, and (for the scanned CADP pages) rendered page images. A reporting-period label, document publication date, PDF metadata date, contract date, expected completion date, or expenditure cutoff was not substituted for an explicit project-status observation date.

## Finding: CADP status section supports 15 candidate dates

The County Annual Development Plan 2026/2027, section 2.3.2, is explicitly titled **“STATUS OF PROJECTS AS AT 30TH JUNE 2025”** on printed p. 54. The section continues through the numbered subsections for Medical Services, Primary Health Care, Education and Vocational Training, and Water, Sanitation and Irrigation, on pp. 54–61. The water table on pp. 60–61 also labels its cumulative-expenditure column “up to 30th June 2025.”

This section heading provides explicit date context for the project-status tables within that section. It supports `observedOn: "2025-06-30"` for the following 15 IDs at the source-record level. One ID is flagged below because it may duplicate a different reviewed project ID in the same section. The owner approved entering its row-level date but did not merge the IDs; the current ID-based summary therefore counts both records separately while the identity/status ambiguity remains unresolved. This is a source-reported status date, not independent evidence that a project was physically inspected or that a completed facility was operational.

| Project ID | Source-record name | Source location | Date evidence |
|---|---|---|---|
| `P-b1944f0` | Nyamwetureko eye Hospital | p. 54–55, Medical Services | Section 2.3.2 heading; the stored status also says “as at 30 Jun 2025” |
| `P-610ca53` | Completion of the Nyamusi Sub-County Hospital | p. 54–55, Medical Services | Section 2.3.2 heading; the stored status also says “as at 30 Jun 2025” |
| `P-bb6f38c` | Completion of the Ekerenyo Sub-County Hospital | p. 54–55, Medical Services | Section 2.3.2 heading; the stored status also says “as at 30 Jun 2025” |
| `P-d116175` | Equipping of Magwagwa Psychiatric hospital | p. 54–55, Medical Services | Section 2.3.2 heading; the stored status also says “as at 30 Jun 2025” |
| `P-0493bd5` | Construction and completion of OPD block at Biticha Morera Dispensary | p. 55, Primary Health Care | Continuation within section 2.3.2; possible duplicate/conflict flagged below |
| `P-0b87b5e` | Raitigo Dam | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-344a863` | Nyameru Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-9e8373f` | Moruga Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-549ea2d` | Ikonge Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-c6ee20e` | Egechini Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-e1db09c` | Ekegoro Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-ab34c05` | Biticha Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-788a27d` | Rionguti Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-27c3a61` | Keginga Borehole | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |
| `P-bf07028` | Borehole Water Distribution Flagship Tongo-Omonuri | p. 60–61, Water, Sanitation and Irrigation | Continuation within section 2.3.2; expenditure column cutoff |

The values “June 2024” and “June 2025” that appear in the water table are in the **Expected Completion Date** column. They are not used as observation dates. The date proposal comes from the section's explicit “as at” heading, not those expected dates.

The date proposals were reviewed and approved. `observedOn: "2025-06-30"` is now explicit on all 25 source rows for these 15 IDs. The date comes from the section heading, not from the expected completion dates. No status percentage or amount was changed.

### Identity and status ambiguity for the Biticha Morera OPD

The source records contain two different IDs for nearly identical Biticha Morera OPD names on printed p. 55:

- `P-5ab05f9`, “Construction and completion of OPD at Biticha Morera Dispensary,” in the “on-going primary health care projects” table: 62%, with the source status explicitly annotated “as at 30 Jun 2025.”
- `P-0493bd5`, “Construction and completion of OPD block at Biticha Morera Dispensary,” in the adjacent 2024/2025 budget-allocation table: 65%, under the same dated section.

The source section supports the date for both rows, but the IDs and percentages differ. The evidence does not establish whether these are separate phases, a duplicate listing, or conflicting reports of the same work. The user approved the date on both source rows without merging IDs. The aggregation currently counts them separately, so a possible duplicate-project overcount remains until a distinct identity review resolves the relationship.

## Findings for the remaining sources

### County Annual Development Plan 2025/2026 (`adp2526`): 82 IDs remain undated

The cited pages contain prior-year implementation tables, including “current status” and implementation-status columns. The project tables identify financial years such as FY 2022/23 or FY 2023/24, but the cited status rows do not state a comparable point observation date. Contract dates and expected completion dates in the tables are not observation dates.

The same PDF contains “As at 30TH JUNE, 2024” in a separate Department of Education performance-indicator table. That date is not attached to the project-status tables cited above and is not transferable to those project observations. The PDF creation date is likewise not used.

**Decision:** no observation date supported for these 82 IDs by the inspected citations. Keep them undated pending a more specific source statement.

### CoB FY 2023/24 report (`cob2324`): 8 IDs remain undated

Table 3.234, “List of Development Projects with the Highest Expenditure,” reports implementation status percentages for the FY 2023/24 reporting period. The surrounding text describes spending “in the reporting period”; the table itself does not give a project-status “as at” date. The financial-year period and report context do not identify the point in time at which each physical-progress percentage was observed.

**Decision:** no observation date supported for these 8 IDs by Table 3.234. Do not substitute 30 June 2024 based solely on the FY label.

### CoB FY 2024/25 report (`cob2425`): 6 IDs remain undated

Table 3.416, “List of Development Projects with the Highest Expenditure,” provides implementation-status percentages for the reporting period, with no explicit observation date in that table. Table 3.417 is separately titled “Nyamira County Stalled Projects as of 30 June 2025” and contains three stalled projects; those are not the six Table 3.416 records under review. The dated Table 3.417 evidence is not transferred to unrelated Table 3.416 projects.

**Decision:** no observation date supported for these 6 IDs by Table 3.416. Keep them undated. The existing separately dated Speaker’s Residence entry is not one of these six.

## Current calculated state and next step

After the approved date update, current coverage is 30 included IDs (10 reported at 100%, 19 with reported progress from 1% to 99%, and 1 reported at 0%), 96 undated IDs, 0 conflicts, 46 status-bearing IDs with no supported physical-progress percentage, and 0 unidentified status records. The 15 newly dated IDs account for 10 reported at 100%, 4 with reported progress from 1% to 99%, and 1 reported at 0%. “Reported at 100%” is not proof that a service is operational. These are calculation-coverage counts for reviewed IDs with status records, not the county’s full project inventory. The potential separate-ID overcount for the Biticha Morera OPD remains unresolved.

Recommended next step: separately review the relationship between the two Biticha Morera OPD IDs before treating their totals as distinct project counts. The other 96 IDs remain undated unless additional primary-source evidence is found.

## Source references and retrieved-file fingerprints

1. County Government of Nyamira, *County Annual Development Plan 2026/2027* (source ID `cadp2627`), section 2.3.2, printed pp. 54–61. [Official PDF](https://nyamira.go.ke/static/documents/updated_CADP_2026-2027.pdf). SHA-256 of retrieved file: `04a42648889642bed75b448c6dc49e381edaa386f694f62fccd9f96abf7f16b3`.
2. County Government of Nyamira, *Annual Development Plan 2025/2026* (source ID `adp2526`), printed pp. 57–60, 69, 73–77, 79–80. [Official PDF](https://nyamira.go.ke/static/documents/11_03_2025_09_08_33_am_ANNUAL_DEVELOPMENT_PLAN_2025-2026-2_(2).pdf). SHA-256: `162b419d64b9ce8bea56cb8277d483903f1f9683d90a20da8d659029d24641fb`.
3. Controller of Budget, *County Governments Budget Implementation Review Report for FY 2023/24* (source ID `cob2324`), Table 3.234, printed pp. 438–439. [Official PDF](https://cob.go.ke/download/county-governments-budget-implementation-review-report-for-the-financial-year-2023-24/?wpdmdl=16104). SHA-256: `a2d0d9ba5355493a515f02cd3e4a599df80d251b1fff91594a0d0550afa0d9a6`.
4. Controller of Budget, *County Governments Budget Implementation Review Report FY 2024/25* (source ID `cob2425`), Tables 3.416–3.417, printed pp. 396–397. [Official PDF](https://cob.go.ke/download/county-governments-budget-implementation-review-report-fy-2024-25/?wpdmdl=16263). SHA-256: `825edf1e1a347016a61477002471761e5f826e540ac153d74764087bb920b213`.

The revised two-product implementation brief and acceptance tests were available at `/Users/test/Documents/CODEX_IMPLEMENTATION_BRIEF.md` and `/Users/test/Documents/ACCEPTANCE_TESTS.md`. The repository copies requested by the earlier handoff were not present: `docs/implementation/nyamira-night-watch/START_HERE.md`, `docs/implementation/nyamira-night-watch/AUDIT_ADDENDUM.md`, and `docs/implementation/nyamira-night-watch/reference/2026-10-25-audit/FINDINGS.md`. This audit follows the revised two-product boundary; it does not build a newsroom or move Nyamira Daily content.
