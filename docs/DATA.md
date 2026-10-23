# Data: what we hold, where it comes from, how to refresh it

All site data lives in `src/data/` as JSON files, built into pages at build time. Downloadable copies for readers live in `public/files/` (CSV). Each JSON file includes its sources; this document summarises them.

**Never estimate or interpolate.** If a figure was not found, leave it empty and say so.

## Datasets

| File | What it holds | Main sources | Checked | Refresh |
|---|---|---|---|---|
| `money.json` | County budget, spending, development spending, own-source revenue, equitable share, pending bills, FY2013/14 to FY2024/25 | Controller of Budget annual County Governments Budget Implementation Review Reports (cob.go.ke), Nyamira section of each | 22 Oct 2026 | When each new CoB annual report is published (around August–October) |
| `leaders.json` | Governor, Deputy, Speaker, Senator, Woman Rep, 4 MPs, 20 ward MCAs, past governors | IEBC 2022 gazetted results (via educationnewshub), Mzalendo, Kenya Law, Nation, Standard, Star, Citizen | 22 Oct 2026 | After any by-election, court ruling, impeachment or appointment |
| `wards.json` | 20 wards: sub-county, listed services (schools, health, markets, worship, offices), named places | Kenya Master Health Facility List (2017 export, HDX), OpenStreetMap (HOT exports), Google Maps (discovery only; names, no coordinates stored) | Oct 2026 | As field checks come in. Generated from `facilities-v1.csv` and `places-v1.csv` |
| `geo.json` | Ward boundary shapes (SVG paths) and named OpenStreetMap points per ward | geoBoundaries KEN ADM3 (CC BY 4.0), OpenStreetMap (ODbL) | Oct 2026 | Run `scripts/build-geo.py` (see README) |
| `wardspend.json` | 404 project records by ward: FY2025/26 budget lines, FY2023/24 contracts and spending, status at 30 June 2025, stalled projects | County Programme Based Budget 2025/26 (Table 18), Annual Development Plan 2025/26, County ADP 2026/27, Q4 Budget Implementation Report 2024/25, CoB FY2023/24 and FY2024/25 | 22 Oct 2026 | Each June/July (new budget), and when new ADPs or CoB reports appear |
| `assembly.json` | County Acts (2014–2023), recent bills, 11 sitting summaries, committees, petitions and motions | County Assembly Hansard (nyamiraassembly.go.ke), Kenya Law Nyamira legislation listing, media for outcomes | 22 Oct 2026 | Monthly (new Hansards) |
| `fees.json` | 93 fees from the Nyamira County Finance Act, 2025 | The Act (nyamira.go.ke), Kenya Gazette Supplement No. 12, 22 Dec 2025 | 22 Oct 2026 | When a new Finance Act is passed |
| `opportunities.json` | Jobs, tenders, bursaries, programmes, how-to guides | nyamira.go.ke, cpsb.nyamira.go.ke, nyamiraassembly.go.ke, tenders.go.ke, agpo.go.ke, NG-CDF notices | 22 Oct 2026 | **Weekly.** Open/closed status is computed at build time from closing dates |
| `census.json` | Population, households, age groups, household indicators, by county and census sub-county; earlier registered voters per ward | KNBS 2019 Census Volumes I–IV; Nyamira CIDP 2018–22 Table 7 (IEBC 2018 voters) | 22 Oct 2026 | Next census |
| `constitution.json` | Chapter 11 articles 174–200 with plain-language summaries and Nyamira notes; Fourth Schedule Part 2 functions | Constitution of Kenya, 2010 (Kenya Law) | Oct 2026 | Check titles and summaries against Kenya Law before launch |
| `topics.js` | Data topics, their question and honest status | — | — | When a topic's status changes |

## Known caveats (do not remove from the site)

- **Money:** the county's own reports sometimes give different totals from CoB (FY2024/25: county 7.41B spent vs CoB 5.65B). We show CoB and note the difference. From FY2022/23 CoB counts hospital fees (FIF) as own-source revenue, so revenue before and after is not comparable. Pending-bill figures differ between CoB reports for the same date. Don't add approved budgets across years (carried-forward cash is budgeted again); adding actual spending is fine.
- **Ward spending:** the FY2025/26 budget states KSh 357,124,313 for ward-based projects; the lines we extracted add to KSh 372.6M. Not yet reconciled against the printed PDF. Nyansiongo and Nyamaiya totals are low because many lines are printed as 0. Three roads are placed in different wards by CoB and the county ADP; we use the county's coding.
- **Census:** KNBS did not publish 2019 population by ward, and ward boundaries don't match census units. Do not publish census "locations" with ward names as ward populations.
- **Services:** most listed services are unverified. Water points and schools are badly under-listed. OpenStreetMap coverage of Nyamira is thin.
- **Assembly:** few Hansards are published (none for 2024; none after 21 July 2026 at last check). The Act summaries are based on titles only.
- **Speaker:** the Speakership has been disputed in court since late 2024. Keep the wording in `leaders.json` exact.

## Access notes for whoever refreshes the data

- CoB and nyamira.go.ke PDFs download fine with `curl` (some web-fetch tools fail on them). CoB download pages accept `?wpdmdl=<id>`.
- nyamiraassembly.go.ke often resets connections; retry.
- Kenya Law sometimes returns 403 to scripts; use a browser.
- KAMIS (kamis.kilimo.go.ke, the national market price system) blocks access from cloud servers. Prices need either a weekly export from a Kenyan connection or field reporters.
- KNBS's site has an incomplete certificate chain; add the missing intermediate rather than disabling TLS checks.

## Open data

`public/files/` holds CSVs readers can download: `money-v1.csv`, `projects-v1.csv`, `facilities-v1.csv`, `places-v1.csv`. Regenerate them whenever the matching JSON changes, and bump the version number when the columns change. Licence: free to reuse with credit to Nyamira Daily; OpenStreetMap-derived data is ODbL.
