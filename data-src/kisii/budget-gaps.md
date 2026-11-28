# Kisii budget gaps: ward lines and FY2025/26 totals (27 Nov 2026)

Scope: ward-level budget lines for Kisii, and which FY2025/26 total is supported by primary documents. No ward-level data was written, because no primary document lists Kisii project lines by ward.

## Sources checked

| Document | URL (county site unless noted) | Date | Ward-level lines? |
|---|---|---|---|
| Approved Revised Programme Based Budget FY2025/26 (85 pp; sha256 96e00bcc2adab74d) | kisii.go.ke/download/approved-revised-programme-based-budget-financial-year-2025-2026/?wpdmdl=26209 | Revised PBB, FY2025/26 | No. Project lines are by department and programme. Ward names appear only in narrative (Riana Health Centre and Moticho Social Hall, in FY2023/24 review text), which is not an allocation. |
| CIDP 2023-2027, approved (288 pp; kisii.go.ke/download/cidp-2023-2027-approved/?wpdmdl=17532) | as left | Approved, c. 2023 | No costed ward lines. 18 of 45 ward names appear, in public-participation and description text; none is within reach of a shilling figure. |
| County Budget Implementation Review Report FY2025/26 | kisii.go.ke/download/county-budget-implementation-review-report-fy-2025-26/ | FY2025/26 | Not downloaded: the link returns a landing page, not the file. Listed as open. |
| Annual Development Plan 2024/25, 2027/28 draft | kisii.go.ke (search "annual development plan") | 2024-2028 | Not downloaded; not expected to hold costed ward lines. Listed as open. |
| Kisii County Assembly | kisiiassembly.go.ke | n/a | Returns HTTP 403 to the fetch; not reached. |
| Controller of Budget | cob.go.ke | n/a | Not reached: the report URLs redirect. Figures already in data-src/national/cob-county-2025-26/. |

## FY2025/26 totals (revised PBB, pp. vii to 8)

| Line | Approved budget | Revised budget |
|---|---|---|
| Total revenue | KSh 18,584,592,398 | KSh 20,047,926,018 |
| Recurrent expenditure | KSh 11,388,182,931 | KSh 11,233,875,578 |
| Development expenditure | KSh 7,196,409,467 | KSh 8,814,050,440 |

The approved and revised totals each add up (recurrent plus development equals revenue).

## Which figure is which

- The press reports of KSh 18.0bn and 18.5bn are consistent with the **approved** budget (KSh 18.58bn). They are secondary and are not used.
- The Controller of Budget figure in data-src/national/cob-county-2025-26/extract.csv is **KSh 20.16bn**. It is closest to the **revised** budget (KSh 20.05bn). The difference is KSh 0.11bn, and the cause is not stated in the sources reached.
- Decision for the site: show the approved and revised budgets from the county's document, and the Controller of Budget figure with its own label. Do not choose one silently. Until the CoB table is checked against the revised PBB, the Kisii money tiles should say which budget they use.

## What remains open

1. Ward-level lines: the revised PBB and the CIDP carry none. Check the Kisii Annual Development Plan and the FY2025/26 implementation review once the file links resolve.
2. The KSh 0.11bn gap between the CoB total (20.16bn) and the revised PBB (20.05bn): ask CoB or read its Kisii section for the revision stage it used.
3. The Kisii Assembly site returns 403 to automated fetches. Check its budget page by hand.
