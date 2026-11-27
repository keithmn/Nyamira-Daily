# Kisii County: 2019 census figures (`census.json`)

Built 27 Nov 2026 in the same shape as `src/data/census.json` (Nyamira). Every value is copied as printed from the KNBS 2019 Kenya Population and Housing Census, read with `pdftotext -layout` and parsed by script (not retyped). Nothing is estimated; fields KNBS does not publish are `null`.

## Source files

| Volume | URL | sha256 | Check |
|---|---|---|---|
| I: Population by County and Sub-County | knbs.or.ke/…/2019-Kenya-population-and-Housing-Census-Volume-1-Population-By-County-And-Sub-County.pdf | 740093a7e0d3a2f34bc85bebfe343c3b45e6b8401a394470f191d281b280ae4e | Matches `data-src/phase3-sources.json` |
| II: Distribution of Population by Administrative Units | …Volume-2-Distribution-of-Population-by-Administrative-Units.pdf | 4e4e091a67eddebc7c1158d09c02f4470e10786a269443dde97a4fcc17a4872d | No checksum on record |
| III: Distribution of Population by Age and Sex | …Volume-3-Distribution-of-Population-by-Age-and-Sex.pdf | dc1253195cd766e42e0af6461fc20e2797ef9831301369bfc8942aee891cbb49 | No checksum on record |
| IV: Distribution of Population by Socio-Economic Characteristics | …Volume-4-Distribution-of-Population-by-Socio-Economic-Characteristics.pdf | 56d36d0929299d422249bc843156bb9990a5d29b87dd50e017322a627d492ab2 | No checksum on record |

Downloaded 27 Nov 2026 from knbs.or.ke with normal TLS verification. Full URLs are in the `url` fields of `census.json`.

## Where each value comes from

| Block | Values | Table | Printed page (PDF page) |
|---|---|---|---|
| county | population 1,266,860; male 605,784; female 661,038; intersex 38 | Vol I Table 2.2 | p.7 (PDF 17) |
| county | household population 1,260,509; households 308,054; average size 4.1 | Vol I Table 2.3 | p.9 (PDF 19) |
| county | area 1,323.0 km²; density 958 | Vol I Table 2.4 | p.10 (PDF 20) |
| county | conventional households 307,254; group quarters 800 | Vol II Table 2.2 | p.11 (PDF 22) |
| county.rural | 1,115,450 people (531,860 M, 583,560 F, 30 intersex); 261,837 households; 1,284 km²; 869 per km² | Vol II Table 2.2a | p.12 (PDF 23) |
| county.urban | 151,410 people (73,924 M, 77,478 F, 8 intersex); 46,217 households; 40 km²; 3,811 per km² | Vol II Table 2.2b | p.13 (PDF 24) |
| subCounties (11) | population and sex | Vol I Table 2.5 | p.20 (PDF 30) |
| subCounties | household population, households, average size | Vol I Table 2.6 | p.29 (PDF 39) |
| subCounties | area, density | Vol I Table 2.7 | p.38 (PDF 48) |
| subCounties | conventional households | Vol II Table 2.4 | pp.227-232 (PDF 238-243) |
| wards (45) | names of census units that share a ward's name | Vol II Table 2.4 | pp.227-232 (PDF 238-243) |
| age | 5-year groups summed into 0-14, 15-34, 35-64, 65+; not stated 22; total 1,266,822 | Vol III Table 2.3 (Kisii block) | p.380 (PDF 392) |
| indicators | drinking water | Vol IV Table 2.15 | p.309 (PDF 322) |
| indicators | cooking fuel | Vol IV Table 2.18 | p.337 (PDF 350) |
| indicators | lighting | Vol IV Table 2.19 | p.348 (PDF 361) — one page before Nyamira's row (p.349) |
| indicators | mobile phone ownership | Vol IV Table 2.32 | p.431 (PDF 444) |
| indicators | internet and computer use | Vol IV Table 2.33 | p.441 (PDF 454) |

The KNBS sub-counties are Etago, Gucha, Gucha South, Kenyenya, Kisii Central, Kisii South, Kitutu Central, Marani, Masaba South, Nyamache and Sameta.

## Checks made (all pass)

- County population 1,266,860 equals `src/data/compare.json` (Kisii `population2019`).
- Male + female + intersex = population (Vol I Table 2.2).
- Vol II Table 2.2 and Table 2.4 county rows give the same population and households as Vol I.
- Households 308,054 = 307,254 conventional + 800 group quarters (Vol II Table 2.2).
- Rural + urban = county population (1,115,450 + 151,410) and households (261,837 + 46,217).
- The 11 sub-counties add up to the county population, households and intersex count.
- For each sub-county, Vol II Table 2.4 population and households equal Vol I; conventional + group quarters = households.
- Age table: male and female totals equal Vol I; total 1,266,822 = population minus 38 intersex; the four bands plus 22 not stated add up to 1,266,822.
- Vol IV conventional-household denominator (307,254) equals Vol II Table 2.2.
- Mobile-phone share recomputed from its counts (516,635 / 1,179,067 = 43.8%) equals the printed figure.

## Disagreements between sources

- **Area and density.** Vol I Table 2.4 prints Kisii's area as 1,323.0 km² (density 958); Vol II Tables 2.2 and 2.4 print 1,323.3 km² (density 957). The difference is Gucha South: 94.9 km² (density 881) in Vol I Table 2.7, 95.2 km² (density 878) in Vol II Table 2.4. The 11 Vol I sub-county areas add up to 1,322.9 km². `census.json` uses Vol I, as Nyamira's does, and records both (`county.densityNote`, Gucha South `areaNote`). Nyamira's area agrees in both volumes.
- **Population.** No disagreement: 1,266,860 everywhere it appears (Vol I, Vol II, `compare.json`).

## Gaps (left `null`, never estimated)

- **Ward population, area and density:** KNBS does not tabulate by county assembly ward.
- **Sub-county to constituency mapping:** Kisii's 11 KNBS sub-counties are not its 9 constituencies, and no source mapping one to the other was checked. Nyamira's mapping came from its CIDP 2023-27. Names are no guide: Kitutu Central sub-county is not Kitutu Chache South constituency.
- **Ward voters:** `voters2022` is `null` here on purpose. The 2022 figures for all 45 wards are in `src/data/ward-register.json`, from the IEBC, and add up to the IEBC county total of 637,010. Keeping one copy avoids drift.
- **Earlier-register ward voters** (`votersRegisteredEarlier` and related fields): Nyamira's came from its CIDP 2018-22. Kisii's CIDP was not researched.
- **Census units sharing a ward's name** were found for 29 of 45 wards (Vol II Table 2.4). Each is a national-government division, location or sub-location, not a ward, and must not be published as a ward population. Levels are ranked by indentation within each PDF page, because pdftotext's indentation shifts from page to page. Some names repeat in different places (two Ichuni sub-locations, 4,223 and 6,822).

## Outside this file

`src/data/census.json` cites Nyamira's Vol II Table 2.4 block as "p.232 (PDF 244)". The page footer on PDF 244 reads 233, and Vol II's other printed pages run 11 behind the PDF page. Worth a one-line fix.
