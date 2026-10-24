# Nyamira County election archive: research notes

Checked: 2026-10-24. All figures in `elections.json` come from the official documents in `src/`, except where a record says otherwise. Nothing was estimated. Where a value was not found in an official source, it is `null`.

## What was found

| Item | 2022 | 2017 | 2013 |
|---|---|---|---|
| MCA results by ward | Winner and winner's votes only, for all 20 wards (Gazette GN 9956) | All candidates for 19 wards (IEBC 2017 report); Bogichora winner from the 7 Nov 2017 by-election | All candidates for all 20 wards, plus ward total valid votes (IEBC 2013 Election Data book) |
| MNA | Winner only, 4 constituencies (GN 9950) | All candidates, 4 constituencies | All candidates and total valid votes, 4 constituencies |
| Governor | Winner (GN 9949) and runner-up (High Court judgment) | All 9 candidates and total valid votes | All 16 candidates and total valid votes |
| Senator | Winner only (GN 9955) | All 7 candidates and total valid votes | All 9 candidates and total valid votes |
| Woman Rep | Winner only (GN 9951) | All 10 candidates and total valid votes | All 11 candidates and total valid votes |
| Registered voters by ward | 20 wards (IEBC rov_per_caw) | 20 wards, with polling-station counts | Not found (constituency and county totals only) |
| Polling stations | 643 stations: code, name, registration centre, registered voters | 553 stations: code, centre name, stream, registered voters | Not found (counts only: 332 stations and 427 streams county-wide) |

Also included:
- the 7 Nov 2017 Bogichora by-election winner (GN 11488);
- three 27 Nov 2025 MCA by-election winners (Nyamaiya, Ekerenyo, Nyansiongo; GN 17611). These are outside the requested years, but they change who holds those seats.

## Levels of the results

- **MCA:** ward level, for all years.
- **MNA:** constituency level (the Form 35B level).
- **Governor, Senator and Woman Rep:** county level (the Form 37C / 38 level).
- **No ward-level results were found for the governor, senator, woman rep or MP races in any year.** The 2013 and 2017 IEBC books report these races only at constituency or county level, and the 2022 forms are not online (see below).

## Main gaps

1. **2022 MCA results beyond the winner.** For every ward, these are missing: losing candidates and their votes, total valid votes, rejected votes, and turnout.
   - On the IEBC portal (forms.iebc.or.ke, "2022 General Elections"), Nyamira shows "643 of 3,858 (16.67%)" Form A uploads. That is the presidential Form 34A only.
   - Every MCA, MNA, governor, senator and woman rep form (Series A, B and C) for Nyamira is marked "Pending". Snapshots are in `src/forms-portal-snapshots/`.
   - No IEBC 2022 results report (like the 2013 and 2017 ones) was found.
2. **2022 governor, senator, woman rep and MNA races:** only winners from the gazette. The exception is the governor runner-up, Walter Osebe Nyambati with 49,339 votes, taken from the High Court judgment `kehc-2023-816`.
   - The judgment says 12 candidates ran for governor. The other 10 candidates' votes were not found in an official source.
3. **Rejected votes** are missing for every race and year. The 2013 and 2017 books give only valid votes.
4. **Turnout (`turnoutPct`)** is null everywhere. No official source gives a usable figure at this level for these races, and none was computed.
5. **2013 registered voters per ward, and 2013 polling stations,** were not found on iebc.or.ke. The 2013 data book gives registered voters by constituency and county only. Those figures are used for the 2013 MNA and county-race records.
6. **2017 MCA and MNA total valid votes:** the IEBC 2017 report has no total rows for these tables, so `validVotes` is null. It was not filled in by adding up the candidates.

## Conflicts between sources

### 2022 governor

- **Gazette GN 9949 (p.6703):** Nyaribo Amos Kimwomi, UPA, 81,980. The scan is tilted, so the Nyamira line looks as if it reads "ODM 270,928" (that is Kisii's entry). Reading the party and vote columns in order (8 entries for the 8 counties Busia to Nairobi) gives Nyamira = UPA 81,980, deputy Ondicho James Gesami. The judgment confirms 81,980.
- **High Court judgment [2023] KEHC 816 (16 Feb 2023):** Nyaribo 81,980 and Nyambati 49,339. It also cites conflicting Form 37C totals:
  - One version: 179,719 voters (55.59%), 176,929 valid, 2,790 rejected.
  - Another version: 207,096 valid, 2,791 rejected, 209,887 votes cast (64.92%).
  - The judgment gives 323,291 registered voters. IEBC's rov_per_county gives 323,283.
  - The judgment also records small re-tally corrections, for example Kitutu Masaba 69,127 corrected to 69,073.
  - Kenya Law notes that the judgment was later reviewed by another court; the outcome of that review was not checked.
  - The judgment could not be downloaded (Kenya Law returned HTTP 403), so the figures were read through a web-fetch summary. They should be checked against the judgment text before publication.
- **Media (secondary, not used in the JSON):**
  - People Daily (15 Aug 2022): Nyaribo 81,090; Nyambati 49,339; Timothy Bosire (ODM) 35,671.
  - The Star (12 Aug 2022) and Capital FM (Feb 2023): Nyaribo 82,090; Nyambati 49,281.

### Other 2022 races, media vs gazette

People Daily figures that differ from the gazette:

| Race | People Daily | Gazette |
|---|---|---|
| Woman Rep, Jerusha Momanyi | 84,833 | 84,843 |
| North Mugirango MP, Nyamoko | 15,160 | 15,351 |
| West Mugirango MP, Mogaka | 16,877 | 17,097 |

The senator figure agrees (96,432). People Daily also gives runner-up figures that are not in the JSON:

| Race | Candidate | Votes |
|---|---|---|
| Senator | Nyambega Mose (UDA) | 43,866 |
| Senator | Adam Mochenwa (DP) | 28,235 |
| Woman Rep | Emily Nyagarama (ODM) | 72,434 |
| Woman Rep | Josphine Omanwa (UDA) | 18,059 |
| North Mugirango MP | Nyangau Atebe (UPA) | 9,152 |
| North Mugirango MP | John Mosongo (ODM) | 5,981 |

These look like provisional tallies and are left out of the JSON.

### Gazette oddities, recorded as printed

- **2022 MCA schedule (GN 9956):**
  - Township is printed twice; the two rows are identical.
  - Bosamaro's party is spelled "Jubille".
  - Itibo's votes are printed "2555" with no comma.
  - Bonyamatuta's winner is "Matwere Julius Kimwom".
  - The Kemera and Nyansiongo winners are both "Wiper Democratic Movement- Kenya", but abbreviated "WDM- K" and "WDM" respectively.
- **The 6 Sep 2022 corrigenda (GN 10533/10534)** do not touch any Nyamira row.

### 2013 spelling differences, data book vs gazette (same people, same winners)

| Data book | Gazette |
|---|---|
| KENETH ATUTH NYAMEINO | Kenneth Atuth Nyameino |
| BONFACE OMBORI ORINA | Boniface Ombori Orina |
| SAMWEL NYANGAU | Samuel Nyangau Nyanchama |
| TERESIAH NYABOKE NYAANGA | Theresa Nyaboke Nyaanga |
| JAMES KINGERECH SABWENGI | James Kingerechi Sabwengi |
| MOCHECHE BUSENI ROBINSON | "Mocheche Boseni Robinson" |
| CALLEN K ATUYA | Callen Kemuma Atuya |
| JULIUS NYANGANA OBONYO | Julius Obonyo Nyangana |

The JSON uses the data-book spelling for 2013 candidates.

### 2017

- **Winners:** all 19 MCA winners, the 4 MNA winners and the 3 county-race winners in the IEBC 2017 report match the gazettes (GN 8239/8240 and GN 7845-7847), names and votes.
- **Errors in the report:** the media reported errors in this IEBC report (Kenyans.co.ke, "IEBC ridiculed over staggering errors in 2017 election report"). The Nyamira rows were checked only against gazette winners, row counts and total rows.
- **A likely typo, kept as printed:** "OCHOK1 EUNIAH NYANDUKO" (Woman Rep candidate).

### Polling stations

- **2022 counts:** the 643 stations in rov_per_polling_station match the 643 Form 34A slots on the IEBC portal. The per-ward station counts also match the portal (for example, Rigoma 41).
- **Per-ward totals:** the registered voters per ward, summed from the station list, equal the rov_per_caw figures exactly for all 20 wards in both 2022 and 2017. The county totals are 323,283 (2022) and 278,853 (2017).

## Ward-name matching

All three years use the same 20 ward names and IEBC ward codes (CAW 1346-1365), so they matched one-to-one with the slugs. Township appears as "TOWNSHIP" or "Township", never "Nyamira Township".

| Code | Ward | Code | Ward |
|---|---|---|---|
| 1346 | rigoma | 1356 | township |
| 1347 | gachuba | 1357 | itibo |
| 1348 | kemera | 1358 | bomwagamo |
| 1349 | magombo | 1359 | bokeira |
| 1350 | manga | 1360 | magwagwa |
| 1351 | gesima | 1361 | ekerenyo |
| 1352 | nyamaiya | 1362 | mekenene |
| 1353 | bogichora | 1363 | kiabonyoru |
| 1354 | bosamaro | 1364 | nyansiongo |
| 1355 | bonyamatuta | 1365 | esise |

Constituency codes: 270 Kitutu Masaba, 271 West Mugirango, 272 North Mugirango, 273 Borabu.

## Field conventions in elections.json

- **`level`:** `ward`, `constituency` or `county`.
- **`registered`** gives voters for that level, from the IEBC register file named in `registeredSourceId`. It is ward-level for MCA races (2017 and 2022 only), constituency-level for MNA races and county-level for county races.
- **`winner`:** the declared winner as named in the results source. The `elected` flag marks the top vote-getter, and in every case that candidate matches the gazette winner.
- **Names and parties** are copied as printed:
  - The 2022 gazette is in title case and gives the surname first.
  - The 2017 report is in upper case, surname first.
  - The 2013 data book is in upper case, mostly given names first.
- **`page`:**
  - For gazettes, the printed gazette page.
  - For the 2013 book, the PDF page and the printed page; the printed page is the PDF page minus 2.
  - For the 2017 report, the PDF page, which equals its "Page N of 685".
- **Polling-station `code`:**
  - 2022 codes are 15 digits: county (3) + constituency (3) + ward (4) + registration centre (3) + stream (2). They are unique.
  - 2017 codes are 14 digits as printed in the IEBC file and are not unique; for example, 04627013460101 repeats across centres. For 2017, use `pollingCentreCode` + `stream` together with `code`.
  - In 2017, `name` is the polling-centre name.
- **The 2022 MCA candidate lists hold one entry each (the winner).** Do not read them as complete fields of candidates.

## Method

- **PDF text:**
  - Most PDFs were converted with `pdftotext -layout`, or `-raw` for the 2017 polling-station list.
  - Tables in the 2013 and 2017 IEBC books were extracted with pdfplumber. Wrapped name and party cells were merged back into their row.
  - Every 2013 block was checked: the candidate votes add up to the printed total.
  - 2017 row counts were checked against the plain-text layout: 325 MCA rows, 40 MNA rows and 26 county-race rows.
- **Scanned gazettes:** the 2022 gazette No. 169 and the 2013 gazette No. 45 were checked by eye on rendered page images, because their OCR text layer is unreliable.
- **Downloaded files** were handled only as data. No code from them was run.
