# Source check: Kenya Budget Explained

Checked on 1 Nov 2026 by Claude Code, against the PDFs named in `build-data.mjs`. **This is not an editor's sign-off.** The figures stay labelled `official`, not `verified`, until a person checks them against the printed pages (decision of 1 Nov 2026). The two Acts and the typed figures were checked on 2 Nov 2026: see "Phase 2" below.

## How it was checked

- Each typed national figure was searched for in the text extracted from its PDF, and the PDF page recorded below.
- In the Budget Summary, the Revenue Estimates and the Guide, PDF page numbers match the printed ones, except the Revenue Estimates' roman-numbered summary pages (PDF p.6 to p.9 are printed v to viii). CRA pages: PDF p.51 and p.52 are printed 44 and 45.
- The whole Mwananchi Guide was read, so small numbers that match on many pages (3.0, 7.0) were confirmed in context.
- Table 2 of the Budget Summary extracts with its columns out of line. Column values were placed by the table's own arithmetic: foreign repayments of 412.9 reconcile with external financing and the net 116.2.
- All 94 county numbers in CRA Table 6.2 (47 for FY2025/26, 47 for FY2026/27) were compared one by one, and their sums reproduce the printed totals: 414,998 against a printed 415,000 (rounding), and 458,940 exactly.
- The Guide's p.14 county table is a picture with no text, so it was read from a rendered page and typed by hand. It adds up to 427.9 against a printed 428.0, which is what rounding to 0.1 gives. **An editor should check these 47 numbers first.**

## Corrections made

| What | Before | After |
|---|---|---|
| Guide page for headline figures | pp.3–4 | p.3 |
| Source of the KSh 428bn "law" figure | Guide p.14, dated 11 June, before the Act | Parliament's report of 26 June 2026 |
| FY2025/26 national budget | "FY2025/26 column" | Named as the Supplementary I column; the original budget was 4,269.9 |
| Other taxes, non-tax income | Shown as printed lines | Tagged as our sums |
| Other taxes description | "Import declaration fees, financial transactions and others" | Names the real lines |
| Formula | "Some money" is held as a baseline | KSh 387.43bn baseline, 4.46bn affirmative action, 36.1bn formula |
| CRA weights | No source | Table 6.1, p.44 |
| Sector name | "Public Administration and Internal Relations" (Guide p.3) | "International Relations", as on Guide p.15 and in the Treasury's sector reports. Guide p.3 is a misprint |
| Sector name | "Environment, Water and Natural Resources" | "Environment Protection, Water and Natural Resources" (Guide pp.3 and 15) |
| Sector total | "The guide does not reconcile this exactly" | It does: 2,923.8 + 1,501.3 + 428.0 = 4,853.1 (Guide p.15). The 33.7 above ministerial spending matches the securitised road levy (32.7) plus the Contingency Fund (1.0); that match is our arithmetic |
| How counties share the money | "Last year's baseline" | A baseline from each county's FY2024/25 allocation (County Allocation of Revenue Act, 2026, First Schedule, note *) |

Items the source check confirmed unchanged, after first looking wrong: PAYE 706.6 (the second table's row labels are shifted in extraction), and the 668.3 "thematic area" for education (Table 5 is headed Thematic Areas).

## Limits

- The `treasury.go.ke` links failed on 1 Nov 2026 with an expired security certificate, so the page now links the same paths on `newsite.treasury.go.ke`, which opened on that date. The Wayback Machine held copies of the Guide (13 Jul 2026) and the CRA report (8 Apr 2026), and the page links those. It held none of the Budget Summary or the Estimates of Revenue on 1 Nov 2026.
- Nyamira figures come from `src/data` and were not rechecked here.
- Which sector a key allocation belongs to is our reading: the Guide lists allocations by theme, not always by sector.

## Phase 2: the two Acts and the typed figures (2 Nov 2026)

Also Claude Code's work, and also not an editor's sign-off. `npm run check:national` repeats all of this except the page search.

**Appropriation Act, 2026 (No. 20): the Schedule, 480 rows and 7 printed totals.** The rows are 151 for votes and 329 for programmes, because recurrent and development money are printed separately. That is 87 votes, 64 of them with both kinds of money, and 201 programmes.

- The PDF is a scan with a machine-read text layer. Two readings, through two `pdftotext` modes: `extract.csv` and `typed.csv`, compared by `scripts/national/double-entry.mjs`. 465 rows agree. 3 have the same digits in the other column (D1023, D1193, D1193/0215000). 12 disagree, and each was resolved from the page image, with its reason in `corrections.csv`. None is unresolved.
- `corrections.csv` has 22 rows in all: those 12, 2 of the rows that changed column (D1193 and D1193/0215000), and 8 where the first reading lost or misplaced an amount and the second reading had it right. 4 damaged names are repaired in `names.csv`. **A person should check these 26 rows first.**
- Both readings come from one text layer, so double entry cannot see a misread they share. The Act's own arithmetic can: programmes add to their vote, votes to their class, classes to their cluster and clusters to the grand total, in both columns, to the shilling, with no differences left.
- A dash in the Act gives no figure, so the 480 rows and 7 totals give 763 figures, not 974.

**County Allocation of Revenue Act, 2026 (No. 22): the First Schedule, 47 rows.**

- The schedule has no text layer, so it was typed from a rendered picture of pp.459 to 461. **A person should check these 47 rows first.** Every figure carries that note.
- Checks on the typing, all 47 rows: column B of the baseline reproduces column C, and index E of the KSh 36.115bn reproduces column F, each within the rounding of the printed percentage. A rounds to CRA's FY2025/26 column. G rounds to the Guide's p.14. B and E each add to 100. A test changes one digit in each column and each check catches it.
- G = C + D + F holds exactly in 45 rows. Nyamira and Taita Taveta are one shilling out, in the Act itself, and the figures keep what the Act prints. The columns add to within KSh 4 of their printed totals (A +1, C 0, D +4, F -1, G +1), so the tolerance for this document is KSh 5.
- The formula weights (45, 35, 12 and 8) are in note *** on p.461. Column F is printed as the "additional equitable share" above KSh 391.885bn.
- The Act has no disbursement schedule. Payment dates are in a separate Gazette notice (s.4(2)).

**The 91 typed figures in `budget-2026-27.json`,** each searched for on its own PDF page by `scripts/national/verify-pages.mjs`: 78 printed as they stand, 7 rounded from a longer printed amount, 5 our calculations (the build recomputes them), and 1 press figure with no document. None was missing. The 47 CRA numbers and the 47 Guide numbers keep the checks above.

**What the Acts settle.**

- Total spending: the Act's Supply plus Appropriations-in-Aid is KSh 2,922.71bn, against the Guide's 2,890.1 of ministerial spending plus the 32.7 securitised levy, 2,922.8. They differ by rounding.
- Education: votes 1064, 1065, 1066, 1067 and 2091 add to KSh 784.48bn, which is the Guide's 784.5. The 781.4 reported in the press after the vote is not in the Act. It stays `unverified` and its source is unknown.
- Sectors: the Act does not say which vote is in which sector, so other sector totals cannot be proved from it. The two health votes, 1082 and 1083, add to KSh 176.25bn against the Guide's sector 177.2, and this does not show that either is wrong.

| Figure | Value | Document | Cited as | PDF page | Result |
|---|---|---|---|---|---|
| Grand total, Supply | 2186508892628 | Appropriation Act | Schedule, p.422 | 37 | Found: the votes and clusters add to it exactly |
| Grand total, Appropriations-in-Aid | 736198020556 | Appropriation Act | Schedule, p.422 | 37 | Found: the votes and clusters add to it exactly |
| Central Government cluster, Supply | 1545115400805 | Appropriation Act | Schedule, p.415 | 30 | Found |
| Central Government cluster, A-I-A | 733426695556 | Appropriation Act | Schedule, p.415 | 30 | Found |
| Commissions cluster, Supply | 641393491823 | Appropriation Act | Schedule, p.422 | 37 | Found |
| Commissions cluster, A-I-A | 2771325000 | Appropriation Act | Schedule, p.422 | 37 | Found |
| Total equitable share | 428000000000 | County Act | First Schedule, p.461 | 9 | Found: the 47 rows add to within KSh 1 |
| Baseline | 387425000000 | County Act | First Schedule, p.461 | 9 | Found: the 47 rows add to it exactly |
| Affirmative action | 4460000000 | County Act | First Schedule, p.461 | 9 | Found: the 12 rows add to within KSh 4 |
| Additional equitable share | 36115000000 | County Act | First Schedule, p.461 | 9 | Found: the 47 rows add to within KSh 1 |
| FY2025/26 equitable share | 415000000000 | County Act | First Schedule, p.461 | 9 | Found: the 47 rows add to within KSh 1 |
| Nyamira's equitable share | 6265653089 | County Act | First Schedule, p.460 | 8 | Found, typed from the picture: a person should check it |

## Every figure

| Figure | Value | Document | Cited as | PDF page | Result |
|---|---|---|---|---|---|
| total | 4820.4 | Mwananchi Guide | p.3, Overall Budget and Financing (also p.2) | 2, 3 | Found |
| totalGdp | 23.2 | Mwananchi Guide | p.3, Overall Budget and Financing | 3 | Found |
| revenue | 3630.5 | Mwananchi Guide | p.3, Overall Budget and Financing: total revenue including A-I-A | 3 | Found |
| revenueGdp | 17.4 | Mwananchi Guide | p.3, Overall Budget and Financing | 3 | Found |
| grants | 43.6 | Mwananchi Guide | p.3, Overall Budget and Financing | 3 | Found |
| deficit | 1146.2 | Mwananchi Guide | p.3, Overall Budget and Financing: fiscal deficit | 3 | Found |
| deficitGdp | 5.5 | Mwananchi Guide | p.3, Overall Budget and Financing | 3, 4 | Found |
| netForeign | 116.2 | Mwananchi Guide | p.3, Deficit Financing: net foreign financing | 3 | Found |
| netDomestic | 1030 | Mwananchi Guide | p.3, Deficit Financing: net domestic financing | 3 | Found |
| gdp | 20816.8 | Budget Summary | Table 2, nominal GDP FY2026/27 | 14, 63 | Found |
| Running national government | 2081.1 | Mwananchi Guide | p.2, where the money goes | 2 | Found |
| Interest and pensions | 1501.3 | Mwananchi Guide | p.2, where the money goes | 2, 15 | Found |
| Building projects | 809 | Mwananchi Guide | p.2, where the money goes | 2 | Found |
| Counties (equitable share) | 428 | Mwananchi Guide | p.2, where the money goes | 2, 14, 15 | Found |
| Emergencies fund | 1 | Mwananchi Guide | p.2, where the money goes | 2, 3, 5, 6 and others | Found |
| Income tax | 1383.6 | Estimates of Revenue | Summary II, p.vi | 7, 10 | Found |
| VAT | 829.2 | Estimates of Revenue | Summary II, p.vi | 7, 10 | Found |
| Excise duty | 383.4 | Estimates of Revenue | Summary II, p.vi | 7 | Found |
| Import duty | 186.2 | Estimates of Revenue | Summary II, p.vi |  | Rounded from a printed line: 186,179,602,951 on PDF p.7, which rounds to 186.2 |
| Other taxes | 79.9 | Estimates of Revenue | Summary II, p.vi |  | Our sum: 51,860,915,462 + 24,566,020,473 + 2,270,250,731 + 1,191,780,388 = 79.9bn. Now tagged as our calculation. |
| Non-tax income | 123.4 | Estimates of Revenue | Summary II, p.vii |  | Our sum: 123,133,486,672 + 263,554,110 = 123.4bn. Now tagged as our calculation. |
| Fees kept by agencies (A-I-A) | 644.8 | Estimates of Revenue | Summary III, p.viii (excluding grants) | 9, 35 | Found |
| Grants | 43.6 | Mwananchi Guide | p.3, Overall Budget and Financing | 3 | Found |
| Borrowing (net) | 1146.2 | Mwananchi Guide | p.3, Overall Budget and Financing: fiscal deficit | 3 | Found |
| domesticInterest | 986.7 | Budget Summary | para 66, Table 3 | 23, 63 | Found |
| foreignInterest | 267.5 | Budget Summary | para 66, Table 3 | 23, 59, 63 | Found |
| pensions | 247.1 | Budget Summary | para 66, Table 3 (pensions, salaries and allowances of constitutional office holders) | 23 | Found |
| total | 1501.3 | Budget Summary | para 66, Table 3 | 22, 23 | Found |
| foreignRepayments | 412.9 | Budget Summary | Table 2, financing: foreign repayments | 14, 63 | Found |
| ordinaryRevenue | 2985.7 | Estimates of Revenue | Summary II, p.vii, total ordinary revenue | 8 | Found |
| Education | 784.5 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Teachers Service Commission | 408.5 | Mwananchi Guide | pp.5–14, key allocations | 12 | Found |
| HELB loans and scholarships | 96.4 | Mwananchi Guide | pp.5–14, key allocations | 12 | Found |
| Free primary and day secondary | 61.6 | Mwananchi Guide | pp.5–14, key allocations | 12 | Found |
| Junior secondary capitation | 30.9 | Mwananchi Guide | pp.5–14, key allocations | 11, 12 | Found |
| Intern teachers | 8.2 | Mwananchi Guide | pp.5–14, key allocations | 12 | Found |
| TVET | 7.3 | Mwananchi Guide | pp.5–14, key allocations | 12 | Found |
| School feeding | 3 | Mwananchi Guide | pp.5–14, key allocations | 2, 3, 4, 5 and others | Found |
| Energy, Infrastructure and ICT | 531.3 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Roads: maintenance | 118.1 | Mwananchi Guide | pp.5–14, key allocations | 10 | Found |
| Roads: rehabilitation | 58 | Mwananchi Guide | pp.5–14, key allocations | 10 | Found |
| Roads and bridges: construction | 44.3 | Mwananchi Guide | pp.5–14, key allocations | 10 | Found |
| Railways | 38.1 | Mwananchi Guide | pp.5–14, key allocations | 10 | Found |
| Rural electrification | 20.2 | Mwananchi Guide | pp.5–14, key allocations | 11 | Found |
| National grid | 7.5 | Mwananchi Guide | pp.5–14, key allocations | 11 | Found |
| Public Administration and International Relations | 373.7 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Governance, Justice, Law and Order | 363.9 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| National Security | 316.2 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Police vehicle leasing | 13 | Mwananchi Guide | pp.5–14, key allocations | 9, 11, 13 | Found |
| Police modernisation | 7 | Mwananchi Guide | pp.5–14, key allocations | 6, 7, 9, 11 and others | Found |
| Health | 177.2 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Primary Healthcare Fund | 19.1 | Mwananchi Guide | pp.5–14, key allocations | 7 | Found |
| Global Fund: HIV, TB, malaria | 18.5 | Mwananchi Guide | pp.5–14, key allocations | 7 | Found |
| Health interns | 9.3 | Mwananchi Guide | pp.5–14, key allocations | 7 | Found |
| Universal Health Coverage | 8.6 | Mwananchi Guide | pp.5–14, key allocations | 7, 8 | Found |
| Vaccines | 6.4 | Mwananchi Guide | pp.5–14, key allocations | 7 | Found |
| Community health promoters | 3.6 | Mwananchi Guide | pp.5–14, key allocations | 3, 8 | Found |
| Emergency, Chronic and Critical Illness Fund | 3 | Mwananchi Guide | pp.5–14, key allocations | 2, 3, 4, 5 and others | Found |
| Environment Protection, Water and Natural Resources | 121.2 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Clean water access | 70.4 | Mwananchi Guide | pp.5–14, key allocations | 11 | Found |
| Wildlife security and conservation | 15.1 | Mwananchi Guide | pp.5–14, key allocations | 11 | Found |
| Forests | 13.4 | Mwananchi Guide | pp.5–14, key allocations | 11 | Found |
| Agriculture, Rural and Urban Development | 111.7 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Fertiliser subsidy | 18 | Mwananchi Guide | pp.5–14, key allocations | 3, 5, 7 | Found |
| Settling the landless | 9.4 | Mwananchi Guide | pp.5–14, key allocations | 5 | Found |
| Social Protection, Culture and Recreation | 94.3 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Cash transfers: older persons | 24.6 | Mwananchi Guide | pp.5–14, key allocations | 12, 15 | Found |
| Cash transfers: orphans and vulnerable children | 8.9 | Mwananchi Guide | pp.5–14, key allocations | 11, 12, 15 | Found |
| Hunger Safety Net | 4.3 | Mwananchi Guide | pp.5–14, key allocations | 8, 12, 15 | Found |
| Cash transfers: severe disability | 1.5 | Mwananchi Guide | pp.5–14, key allocations | 2, 8, 12, 15 and others | Found |
| General Economics and Commercial Affairs | 49.8 | Mwananchi Guide | p.3, ministerial allocations by sector | 3, 15 | Found |
| Education sector (ministerial) | 784.5 | Mwananchi Guide | p.3 | 3, 15 | Found |
| Education thematic area | 668.3 | Budget Summary | Table 5, p.25 | 25, 68 | Found |
| Education as approved by MPs | 781.4 | People Daily | reported |  | Not checked: Press report, stays Unverified until the Appropriation Act is read. |
| Counties: prev | 415000 | CRA Recommendation | Table 6.2, pp.44–45, column FY2025/26 | 52 | Found |
| Counties: rec | 458940 | CRA Recommendation | Table 6.2, pp.44–45, total FY2026/27 | 52 | Found |
| Counties: law | 428 | undefined | National Assembly report on the County Allocation of Revenue Bill as passed | not a PDF here | Found |
| Counties: estimates | 420 | Budget Summary | para 67 | 14, 22, 23, 26 and others | Found |
| Counties: countyTotal | 502 | Mwananchi Guide | p.14: equitable share 428.0 + conditional allocations from national government 16.6 + from development partners 57.4 | 14 | Found |
| Counties: equalisation | 10.3 | Mwananchi Guide | p.13, Equalization Fund | 13, 15 | Found |
| Counties: ngcdf | 61.8 | Mwananchi Guide | p.13, NG-CDF (national money, not county money) | 13, 15 | Found |
| National budget | 4638.4 | Budget Summary | Table 2, FY2025/26 Supplementary I column, p.14 | 13, 14, 63 | Found |
| All 47 counties’ equitable share | 415 | Budget Summary | Table 2, FY2025/26: of which equitable share | 14, 22, 26, 48 and others | Found |
| Nyamira’s equitable share | 6.073 | CRA Recommendation | Table 6.2, p.45, column FY2025/26 | 6, 51 | Found |
