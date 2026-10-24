# Nyamira County: census, schools and health sources (checked 2026-10-24)

## A. Sub-location populations, 2019 census

**Source:** KNBS, *2019 Kenya Population and Housing Census, Volume II: Distribution of Population by Administrative Units*.
https://www.knbs.or.ke/wp-content/uploads/2023/09/2019-Kenya-population-and-Housing-Census-Volume-2-Distribution-of-Population-by-Administrative-Units.pdf
(Found with the KNBS WordPress media search. The `?wpdmpro=` package link on the census reports page no longer serves a file.)

- **Table 2.4** (sub-locations), Nyamira block: printed pp. 233–236 (PDF pp. 244–247).
- **Cross-checks:** Table 2.3 (sub-counties), printed p. 20 (PDF p. 31); Table 2.2 (counties), printed p. 11 (PDF p. 22).
- **Columns:** Total, Male, Female, Households (Total, Conventional, Group Quarters), Land area (sq km), Density (persons per sq km).
- **No intersex column below county level.** The table footnote says intersex figures are too few to distribute below national level. Nyamira's county intersex count is 13 (Table 2.2).

**Method**
1. Ran `pdftotext -layout`, then used a regex to pick out every row with a name and 8 numbers between the NYAMIRA county row and the NAIROBI CITY row.
2. Rebuilt the hierarchy (sub-county > division > location > sub-location) by nesting on totals: each parent's total must equal the sum of its children's totals. Indentation was not used for this because it shifts from page to page. The nested result was then checked against the printed indentation, and there were no conflicts.
3. Checked male, female, households, conventional households, group quarters and area separately against every printed parent row.

**Results**
- 5 sub-counties: Borabu, Manga, Masaba North, Nyamira North, Nyamira South.
- 14 divisions, 49 locations, 113 sub-locations.
- Total, male, female and households (all three kinds) add up exactly at every level. The 113 sub-locations sum to 605,576, the county total.
- **Area differences:** 13 parent rows differ from the sum of their children by ±0.1 sq km, which is rounding. At sub-county level these are Borabu, Nyamira North and Nyamira South (−0.1 each).
- **Total vs male + female:** total exceeds male + female by 1–6 persons in some rows, which matches the intersex note. By sub-county the gap is Borabu 0, Manga 2, Masaba North 2, Nyamira North 6, Nyamira South 3. At county level the gap is 13, which equals the Table 2.2 intersex count.
- **Table 2.3 match:** all five sub-county rows in Table 2.4 match Table 2.3 exactly. Table 2.3 prints area as whole numbers.

**Names:** names are kept as KNBS prints them (upper case). Some names repeat at different levels (NYAMIRA, MANGA, KEMERA, ESISE and others). Two locations in Nyamira division are both printed as "BONYAMATUTA" (sub-locations KEBIRIGO and NYABISIMBA). Use the full path to identify a unit.

These are national-government administrative units and are not mapped to the county's 20 wards.

**Files**
- `sublocations.json`: `rows` (113), `subCountyTotals` (with sums, differences and the Table 2.3 comparison), `divisionTotals`, `locationTotals`, `checks` and the full `issues` list.

## B. Schools: official statistics

| Source | What it gives for Nyamira | Level |
|---|---|---|
| MoE *Basic Education Statistical Booklet 2020* (education.go.ke). Annex tables, printed pp. 84–128 (PDF page = printed + 21). Data from NEMIS. | Numbers of pre-primary, primary and secondary institutions (public and private); enrolment by class and sex; GER/NER; teachers; PTR; average school size; transition rate; adult education; Class 6 subject scores (no year given) | County only |
| KNEC *2025 KCSE Examination Essential Statistics* (and the 2024 edition for 2023 figures) | Registered KCSE candidates by sex (2023–2025), candidates by age (2024–2025), exam centres by school category (2024–2025) | County only (KNEC county code 43) |
| KNBS *2024 National School Census Pilot Report* | Institutions in the Keera pilot zone (Nyamira South) only: 59 | Pilot zone |
| KDHS 2022, Table 2.12C | Primary and secondary attendance ratios (survey-based) | County |

Headline 2020 counts (BESB 2020):

| Level | Public | Private | Total |
|---|---|---|---|
| Pre-primary | 404 | 161 | 565 |
| Primary | 408 | 143 | 551 |
| Secondary | 190 | 4 | 194 |

No school rankings or per-school results were collected.

**Gaps**
- No Basic Education Statistical Booklet newer than 2020 on education.go.ke. The 2019 edition was found only on a third-party mirror (africacheck.org), so it was not used.
- No junior secondary school (JSS) counts or enrolment: JSS began in 2023, after the 2020 booklet.
- No sub-county school statistics in any official source found.
- KNEC Essential Statistics give no county grade or mean results. No official KPSEA or KJSEA county summaries were found on knec.ac.ke.
- BESB Table IV.1 (Class 6 achievement) gives no assessment year, so `year` is null.

## C. Health: KHIS and alternatives

**Is KHIS (hiskenya.org) public?** Not confirmed. The available evidence says a login is needed.
- From this environment, every request to hiskenya.org (the home page, `/api/me`, `/api/system/info` and the login page) was reset by the remote side. Nothing could be loaded, so no public endpoint could be tested.
- The site's robots.txt blocks automated fetching.
- A published study (PLOS Global Public Health 2021, doi 10.1371/journal.pgph.0000029) says: "Aggregated DHIS2 data is available online with access provided by Ministry of Health".
- No public dashboard or open-data export for KHIS was found.
- To confirm, someone should open https://hiskenya.org in a normal browser from Kenya. Expect a DHIS2 login page; accounts are issued by the MoH or the County Health Records and Information Officer.

**Alternatives used**
- **KDHS 2022 Main Report Vol. 1** (KNBS/ICF), county tables (printed page = PDF page − 42):
  - 9.1C, ANC from a skilled provider: 100.0%
  - 9.2C, 4+ ANC visits: 65.8%
  - 9.7C, facility delivery: 93.7%
  - 9.9C, skilled birth attendance: 92.6%
  - 10.4C, children 12–23 months fully vaccinated with basic antigens: 82.7%, and by national schedule: 55.8%. The report puts these in parentheses because they rest on 25–49 unweighted cases.
  - Samples are small: 55 women, 57 births, 24 children.
- **KDHS 2022 Nyamira fact sheet:** rounded values that match the main report.
- **Nyamira CIDP 2023–27, p. 28:** county-reported 72.8% (also given as 72%) skilled delivery, 86% fully immunised, and 95% of pregnant mothers insured. No year or source is given, so use with caution.
- **Nyamira ADP 2026/27:** checked. It gives only activity counts, not coverage rates, so nothing was taken from it.
- **County Gender Data Sheet** (Oct 2025, knbs.or.ke `46-Nyamira-county-no-46.pdf`): secondary. It republishes KDHS 2022 and census values, so it was not used as a source.

**Gaps**
- No outpatient visit figures in any public official document.
- No sub-county or facility-level health figures.

## Technical notes
- **TLS fixes.** knbs.or.ke serves an incomplete certificate chain (the Let's Encrypt YE2 intermediate is missing), and so does knec.ac.ke (the Sectigo OV R36 intermediate is missing). education.go.ke chains to emSign Root CA - G1, which is not in the local store. Each was fixed by adding the official intermediate or root, fetched from letsencrypt.org, crt.sectigo.com and curl.se/ca/cacert.pem (the Mozilla bundle), to a separate CA file. Every chain then verified to a trusted root. TLS verification was never turned off.
- **File layout.** Downloaded files are in `src/` (PDFs) and `web/` (HTML). Parsing scripts are kept outside the research folder, in `scratchpad/scripts/`, and are run with `python3 -I`. Extracted text files (`*.txt`) are kept beside the JSON so the values can be re-checked.
