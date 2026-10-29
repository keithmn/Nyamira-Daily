# KNBS 2019 Census: social tables for Nyamira (summary)

Assistant research, 29 Oct 2026: extracted as printed with page references, not yet checked by an editor. Nothing here is published until it is.

**Source:** KNBS, *2019 Kenya Population and Housing Census, Volume IV: Distribution of Population by Socio-Economic Characteristics* (498-page PDF).
URL: https://www.knbs.or.ke/wp-content/uploads/2023/09/2019-Kenya-population-and-Housing-Census-Volume-4-Distribution-of-Population-by-Socio-Economic-Characteristics.pdf
Retrieved 29 Oct 2026. **Printed page = PDF page − 13.** Census night 24/25 August 2019.

Data: `census-social.json` (25 tables, 2,318 rows; every value has `printed`, `pagePrinted` and `pagePdf`).

## Areas

KNBS gives Nyamira County and five sub-counties: **BORABU, MANGA, MASABA NORTH, NYAMIRA NORTH, NYAMIRA SOUTH**. KNBS never mentions constituencies in Volumes I or IV.

The only mapping found is in the county's **CIDP 2023-27, s.1.4.3, p.9 (PDF p.24)**:
- West Mugirango = Nyamira South.
- Kitutu Masaba = Manga + Masaba North.
- North Mugirango = Nyamira North, except Kiabonyoru division.
- Borabu = Borabu sub-county + Kiabonyoru division.

So **Borabu and North Mugirango constituencies cannot be read from any Volume IV row.** (s.1.4.2 of the same CIDP words it more loosely.) Nothing is tabulated by ward.

## Already in `src/data/census.json` (don't duplicate)

- Households, conventional households, group quarters and average household size (Vol I). Vol IV Table 2.10 gives the same counts.
- County-only shares:
  - Water: stream/river, protected spring, and a piped figure that the repo summed itself.
  - Cooking: firewood, LPG, charcoal, electricity.
  - Lighting: mains electricity (also by sub-county) and solar.
  - ICT (Tables 2.32-2.33): mobile phone, internet, computer.
- Everything else below is new. The sub-county breakdowns are all new.

## Tables extracted

| Table | Printed p. (PDF) | Base | Unit | Levels |
|---|---|---|---|---|
| 2.2 School attendance status | 42-43 (55-56) | Population aged 3+ | number + % | county, 5 SCs, by sex |
| 2.3 Level now attending | 73 (86) | Aged 3+ now at school (= "at school" in 2.2) | number | county, SCs, sex |
| 2.4 Highest level **reached** | 103-104 (116-117) | Aged 3+ who ever attended (501,830)* | number | county, SCs, sex |
| 2.5 Highest level **completed** | 135 (148) | Same as 2.4 | number | county, SCs, sex |
| 2.6b Attendance by special age group | 159 (172) | Aged 3+ | number | county only |
| 2.10 Households and tenure | 251 (264) | Households; tenure = conventional households | number + % | county, SCs |
| 2.11a Owned: how acquired | 258 (271) | Owner households | number + % | county, SCs |
| 2.11b Rented/provided: by whom | 264 (277) | Renting/provided households | number + % | county, SCs |
| 2.12 Roof material | 276 (289) | Conventional households (150,499) | % | county, SCs |
| 2.13 Wall material | 286 (299) | Conventional households | % | county, SCs |
| 2.14 Floor material | 299 (312) | Conventional households | % | county, SCs |
| 2.15 Drinking water source | 309 (322) | Conventional households | % | county, SCs |
| 2.16 Human waste disposal | 316 (329) | Conventional households | % | county, SCs |
| 2.17 Solid waste disposal | 329 (342) | Conventional households | % | county, SCs |
| 2.18 Cooking fuel | 337 (350) | Conventional households | % | county, SCs |
| 2.19 Lighting fuel | 349 (362) | Conventional households | % | county, SCs |
| 2.26 Disability status | 404 (417) | Population aged 5+ | number + % | county, SCs, sex |
| 2.27 Disability by domain | 413 (426) | Aged 5+ with a disability | number | county, SCs, sex |
| 2.28 Albinism | 420 (433) | Household population, all ages | number | county, SCs, sex |
| 2.32 Owns a mobile phone | 431 (444) | Aged 3+ | number + % | county, SCs, sex |
| 2.33 Internet; computer/laptop/tablet | 441 (454) | Aged 3+ | number + % | county, SCs, sex |
| 2.34 Bought goods/services online | 448 (461) | Aged 15+ | number + % | county, SCs, sex |
| 2.35 ICT by age group | 461 (474) | Aged 3+ (online buying: 15+) | number | county only |
| 2.36 Household assets (extra) | 468 (481) | Conventional households | % | county, SCs |
| 2.30 Religion (extra) | 422 (435) | Household population (603,051) | number | county only |

\* The table doesn't state this base. It equals Table 2.2's "at school" + "left after completion" + "left before completion" + "not stated" (all 3+). In 2.5, "None" means attended but completed no level.

**ICT question wording** (questionnaire, PDF p.491):
- P-55: "Has <Name> owned a Mobile Phone in the last 3 months?"
- P-57: used the internet "from any location in the last 3 months".
- P-58: used a computer/laptop/tablet in the same period.
- P-59: bought or ordered goods or services online in the last 3 months.

**Disability:** asked of persons aged 5+ using six domains (visual, hearing, mobility, cognition, self-care, communication) (s.2.1.6, p.12).

## Caveats

1. **Percent vs count.** Tables 2.12-2.19 and 2.36 print percentages only; the first column is the count of conventional households. Other tables give counts, some with printed per cent columns. Use the printed per cent; don't recompute.
2. **Rounded shares don't sum to 100.** Rows add to between 99.8 and 100.2.
3. **"-" cells** are stored as `value: null` with `printed: "-"`. Vol IV has no legend for "-".
4. **Intersex.** Footnotes say intersex persons are excluded, yet Total* is usually Male + Female + a few. The gap matches the Vol I intersex counts (county 12-13; Manga 2, Masaba North 2, Nyamira North 5-6, Nyamira South 3). So Total* appears to include intersex. This is our inference, not stated by KNBS.
5. **Table 2.26 doesn't add up.** Total* is larger than with + without + not stated: county +35, Borabu +2, Manga +4, Masaba North +3, Nyamira North +9, Nyamira South +17. Unexplained in the source.
6. **Table 2.34, Manga:** Male + Female (58,100) is one more than Total* (58,099).
7. **Table 2.27 counts domains, not people.** Its note: "The figures include the number of PWDs with multiple disabilities". Never sum the domains.
8. **Special age groups overlap** in Table 2.6b (3-5 and 4-5); don't sum them.
9. **Contents page errors.** It lists Table 2.30 (religion) at p.322; it is printed at p.422. The Vol IV summary text also misnumbers tables (e.g. calls the disability tables "2.25 to 2.27").
10. **Rural/urban not available.** Table titles say "Area of Residence", but the Nyamira rows give totals only. No rural/urban split by county was printed.

All checks passed except those listed above:
- Sub-county sums equal the county figure for attendance, households, disability, phone, internet and albinism.
- Category columns sum to Total* in Tables 2.2-2.5.
- Age groups sum to totals in Tables 2.6b and 2.35.

The list is in `consistencyChecks` in the JSON.

## Headline county figures (as printed; for orientation only)

**Education** (aged 3+, 566,741):
- 46.0% at school.
- 10.8% never been to school.

**Housing** (conventional households):
- Owned dwellings: 85.5%. Borabu stands out at 56.9% owned and 43.1% rented/provided.
- Iron-sheet roofs: 96.1%.
- Mud/cow-dung walls: 60.3%.
- Earth/sand floors 35.9% and dung floors 33.1%.

**Services** (conventional households):
- Covered pit latrine: 60.4%.
- Uncovered pit latrine: 22.6%.

**Disability** (aged 5+, 538,716):
- 17,549 people (3.3%) have a disability.

**ICT** (aged 3+):
- Online buying (aged 15+): 2.2%.

**Albinism:**
- 190 persons.
