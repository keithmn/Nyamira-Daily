# Nyamira OAG audit findings: notes

Checked 2026-10-24. Data: `audit.json`. Source PDFs: `src/` (consolidated OAG volumes in `src/volumes/`). Extracted text (`pdftotext -layout`) is in `txt/`, and page-marked copies are in `pm/`.

## Where the reports came from
- **oagkenya.go.ke**: the year pages (`/20XX-20YY-county-government-audit-reports/`) host individual Nyamira PDFs with a text layer for FY2016/17, 2017/18, 2018/19, 2019/20 and 2021/22, for both the Executive and the Assembly. For 2022/23, 2023/24 and 2024/25 the site has only consolidated volumes ("Green Books").
- **Parliament library** (libraryir.parliament.go.ke, DSpace; searched through its REST API): copies of the reports as tabled. Most are scans with OCR text, and they include the entity's financial statements. They cover FY2013/14, 2019/20, 2020/21, 2021/22, 2022/23, 2023/24 and 2024/25.
- Kenya Law was not needed. The Senate committee reports found are committee deliberations, not OAG reports, so they were not used.

## Years found / opinion per year
| FY | County Executive | County Assembly |
|---|---|---|
| 2013/14 | **Disclaimer**. The opinion is on the *County Government of Nyamira* (whole county) for the 16 months ended 30 June 2014. There is also a separate "financial operations" management audit of the Executive, which has no opinion. | **No opinion**. Only a "financial operations" management audit exists. |
| 2014/15 | MISSING | MISSING |
| 2015/16 | MISSING | MISSING |
| 2016/17 | Adverse | Adverse |
| 2017/18 | Qualified | Qualified |
| 2018/19 | Qualified | Qualified |
| 2019/20 | Qualified | Unqualified (report heading is "Opinion", i.e. unmodified) |
| 2020/21 | Qualified | Unqualified (heading "Opinion") |
| 2021/22 | Qualified | Qualified |
| 2022/23 | Adverse | Qualified |
| 2023/24 | Qualified | Qualified |
| 2024/25 | Qualified (from the OAG 2024/25 consolidated volume) | Qualified (from the OAG 2024/25 consolidated volume) |

## Missing years and why
- **FY2014/15 and FY2015/16 (both entities)**: the OAG 2014/2015 page has no files, and there is no 2015/2016 page. The Parliament library returned no Nyamira item for those years (several queries). WordPress media search and guessed file paths on the OAG site found nothing. A Senate compilation titled "County Executive Reports and Financial Statements FY ended 30 June 2016" was checked; it covers Elgeyo Marakwet, not Nyamira. A SlideShare upload titled "Nyamira County Audit Report 2014/2015" exists but would not load and is not a primary source, so it was not used.
- **FY2013/14 Assembly opinion**: no financial-statement opinion for the Assembly alone was found.

## Scanned reports (no text layer)
- FY2024/25 Executive and Assembly copies in the Parliament library (`src/PL-Exec-2024-25.pdf`, `src/PL-Assembly-2024-25.pdf`) have no text, so they were **not** extracted. FY2024/25 data comes from the text-based OAG consolidated volumes: "Auditor-General's Report on the County Governments 2024/2025", Vol. 1 County Executives (Nyamira at PDF pp. 604-618) and the County Assemblies volume (Nyamira at PDF pp. 229-233). The volumes reproduce the basis-for-opinion, emphasis/other-matter, lawfulness and internal-control paragraphs and a list of unresolved prior-year matters. The opinion type comes from the section heading ("Basis for Qualified Opinion") and from the volume's opinion annex.
- The other Parliament copies (2013/14, 2019/20-2023/24) are scans with usable OCR. OCR errors are common ("l" for "I", garbled dates). Amounts were taken only where they were legible.
- FY2022/23 Executive: the signature date is illegible in the scan (only "2024" is readable). The source date given is the library's issue date, 2024-02-28.

## Method
- Each report's text was read section by section. Findings were entered by hand in small Python files (`../../tools/d*.py`). Each finding's page is found automatically: a verbatim snippet is matched against the page-split text, with OCR-tolerant matching and searching only from the start page of the auditor's report.
- **Page numbers are PDF page numbers** (1-based physical pages) of the file named by `sourceId`, not the printed report page numbers.
- **section**:
  - `basis` = Basis for (Qualified/Adverse/Disclaimer) Opinion. Every basis item is included.
  - `lawfulness` = "Report on Lawfulness and Effectiveness in Use of Public Resources". Capped at 10 per entity-year, largest amounts first. Amount-less findings rank last.
  - `other` = (a) the FY2013/14 financial-operations (management) audit findings, the top 10 by amount; (b) pending bills, own-source revenue issues and budget items reported under Other Matter / Emphasis of Matter; (c) stalled or idle projects with names and amounts (task item 4) that fell outside the lawfulness top 10, including project-by-project entries from report appendices and tables.
- FY2016/17 reports put everything under "Basis for Adverse Opinion" (there is no separate lawfulness section that year), so all those findings are `basis`.
- Internal-control/governance findings were not recorded, except where they appear in the basis section.
- **amountKsh** is a figure stated in the report for that finding: the headline contract sum or questioned amount. Where the report gives only several component figures, the amount is `null` and the figures are quoted in the summary. Nothing was summed or estimated. One exception is noted: exec-202223-09 is null because the report prints the variance as "Kshs.60,090,5653".
- **ward**: set only when the report names a place that matches one of the listed ward names (e.g. "Manga stadium" → manga, "Bomwagamo" → bomwagamo, "Banyamatuta ward" → bonyamatuta, "Ekerenyo Sub-County Hospital" → ekerenyo, "Nyamaiya" → nyamaiya, "Kemera Market" → kemera). Multi-place findings are left `null`.
- Language follows the auditor's wording. Phrases like "wasteful" and "nugatory" are attributed in the summaries as the auditor's words. No accusatory terms are used.

## Follow-up / statusLater
`statusLater` is set only where a later document states a status. It is `{fy, status, page, sourceId}`; `sourceId` was added so the page can be traced.
- FY2017/18 Assembly basis items: the FY2018/19 report (Other Matter) says they "remained unresolved as the Senate had not deliberated".
- FY2019/20 (Exec basis; Assembly items), FY2020/21 (Exec, Assembly) and FY2021/22 (Assembly): taken from **management's "Progress on follow up of prior year auditor's recommendations" table** in the next year's financial statements, as stated there. All items are "Not Resolved" / "Unresolved" except the FY2020/21 Executive cash-variance item, which management marked "Resolved". This is management's self-reported status, not the auditor's.
- FY2021/22 Exec, FY2022/23 Exec and Assembly, FY2023/24 Exec and Assembly: taken from the **auditor's own Other Matter** in the following year ("prior year audit issues remained unresolved"). For FY2023/24 the auditor gives an explicit numbered list of the unresolved matters (29 Executive, 14 Assembly).
- Earlier years (2013/14-2016/17, 2018/19 Exec) have no stated follow-up status, so they are `null`.

## Caveats
- Several reports contain internal inconsistencies (e.g. FY2016/17 Assembly cash payments: Kshs.98,791,857 in the finding versus Kshs.8,791,857 in the conclusion; FY2023/24 Executive pending bills printed as both 776,779,157 and 776,379,157). These are quoted as printed.
- Recurring multi-year projects (County Headquarters, the Assembly office block, the COVID-19 isolation complex, Manga Stadium, Magwagwa/Nyamusi/Manga wards) appear in several years as separate findings, with the same `project` name so they can be linked.
