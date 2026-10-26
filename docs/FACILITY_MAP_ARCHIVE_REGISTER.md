# Facility map and archive register

Started 26 Oct 2026. Requirements interview and source audit are recorded here. Registry implementation progress and the approved ledger are tracked in `docs/STATUS.md`.

## Direction received

The owner wants Nyamira Daily's map experience to let readers zoom in and out, see facility imagery that the team will create, map facilities across the county, understand what capabilities facilities have, and consult a dated archive of facility records and changes.

This supports Nyamira Daily's existing role as an independent public-information service. Present sourced information so readers can assess claims; do not frame the tool as suppressing or targeting any politician or official.

## Existing project constraints

- Keep Nyamira Daily separate from The Night Watch.
- The repository currently favors light, build-time maps and minimal client-side JavaScript.
- Every factual claim needs a source, date and evidence label. Do not infer a service or capability from a facility name, category, building, equipment list or funding record.
- Preserve uncertainty, record corrections transparently, and do not expose patient or other private personal data.

## Interview modules

1. Map and image interaction.
2. Facility scope, capability definitions and evidence.
3. Historical record, timestamps, corrections and archive behavior.
4. Field-data/image collection, permissions, privacy and update ownership.
5. Pilot scope, accessibility, low-data requirements and implementation phases.

## Decisions locked

- **Map and image interaction:** map zoom changes the geographic view; opening a facility provides a separate image viewer with independent zoom controls. Confirmed by the owner on 26 Oct 2026.
- **Facility profile URL:** `/facility/<lowercase-existing-ID>/`, e.g. `/facility/nym-f0001/`, to keep public links stable across name changes. Confirmed by the owner on 27 Oct 2026.
- **Profile discovery and data outputs:** link ward service rows, health/education ward counts and search results; keep the current v1 CSV and ward APIs unchanged, add a v2 facility CSV and a separate facility JSON API, and omit candidate coordinates from both new outputs. Confirmed by the owner on 27 Oct 2026.
- **Facility image medium:** photographs of actual facilities. Coverage (for example, exterior versus interior), permissions, and collection process remain open.
- **Capability basis:** show official service designation separately from dated observation of service availability/functionality. Each claim needs its own source and date; unobserved or unsupported status stays unknown. Confirmed by the owner on 26 Oct 2026.
- **Initial coverage scope (original decision; amended below):** public facilities across the county, including national- and county-managed sites. Identify the responsible public body/management role. Include facility-level audit/book records only where a public, legally accessible source exists, with scope/date/source made clear; do not imply every facility has its own public audit. The original decision deferred private, faith-based, NGO and other providers.

## Direction amendment — scope expanded, awaiting definition

- The owner clarified that the ambition is broader than a facility atlas: a detailed county encyclopedia, drilling from sub-county through administrative areas, villages and facilities, with public-interest individuals, to inform economics, finance, agriculture and political direction.
- The “which facility type first?” question is deferred; the owner has not selected a facility pilot category.
- The owner used “blockchain” to describe the vision. Whether this means a technical blockchain or a linked, dated, auditable information system remains open.
- **Proposed privacy/editorial safeguard, not yet approved:** named-person records should be limited to a documented public-interest role and role-relevant, source-backed facts. Do not create dossiers about private residents or publish sensitive personal details or precise private/home locations.
- The owner selected “anyone acting in a documented public role” for person records.
- Proposed rule to lock: include a person only where the public role and public-interest relevance are clear; limit content to role-relevant, source-backed facts; exclude private-resident dossiers, sensitive personal details and private/home-location data.
- State: awaiting owner confirmation.

## Facility profile scope and evidence amendment — approved 26 Oct 2026

- The owner approved profiles for all 247 existing facility records across the current listed categories, preserving the IDs already present in `wards.json`. Public/private ownership should be displayed only where supported by a source.
- This supersedes the earlier deferral of private, faith-based, NGO or other categories where such records already occur in the 247-entry list; it does not establish that the current list is complete or that an ownership value is verified.
- The separate 63-row `places-v1.csv` / map-place list is unverified and is not a second profile set. Link a place row to a facility profile only after its real-world identity is reviewed. Do not create guessed matches or treat generic landmarks/villages as facilities.
- The approved profile system keeps dated, sourced capability observations with explicit unknown states and a public history; public changes require editor review. Reader-facing pages remain static builds, with intake/review handled separately.
- Facility observations will be a separate intake/review workflow in the existing D1 corrections-review service, not mixed with general correction reports. Reuse Access and anti-spam safeguards; approved changes publish only through the normal static build. This service is still on a separate, unmerged branch.
- Resident and designated field-reporter observations are allowed. Public attribution is source category and date, not contributor names by default.
- Facility/project photos need capture date, photographer/source and identity match; use “No verified photo yet” instead of generic imagery when unavailable. Incidental people may appear as context; identifiable people require consent. Do not publish sensitive personal details.

## Priority amendment — dataset gaps first

- On 26 Oct 2026, the owner redirected the immediate work: audit and address gaps in existing datasets before building out the county encyclopedia/map.
- This changes sequencing, not the long-term county-wide ambition. Do not fill missing values by estimation or assume a source is accessible. Each dataset should have a bounded gap list, candidate authoritative sources, an explicit coverage date, and unknown/unavailable states preserved.
- Current source-backed gap leads are in `docs/DATA.md`, `docs/STATUS.md`, `docs/ROADMAP.md` and `data-src/research-notes/`; this register will record which gap is selected before any dataset values are changed.

### Initial repository gap inventory (26 Oct 2026)

| Dataset area | What the repository currently holds | Explicit gap / blocker |
|---|---|---|
| Geography and public facilities | 2019 census hierarchy through 113 sub-locations; 20 county wards; ward service/place lists drawing on a 2017 Kenya Master Health Facility List export and OpenStreetMap | Census administrative units do not match county wards. Service listings are mostly unverified; schools and water points are under-listed; OSM coverage is thin. No verified county-wide public-facility inventory with management body, current services/capabilities and dated operation checks is established. |
| Health | KDHS 2022 county indicators and selected CIDP figures | No sub-county or facility-level health figures. KHIS access needs a Ministry of Health login and public access is unconfirmed. |
| Schools | County-level 2020 school statistics and KCSE candidate counts for 2023–2025; 2024 school-census pilot covers only the Keera pilot zone | No newer comprehensive county booklet located, no JSS counts in the 2020 data, no official sub-county school statistics, and no current complete school-by-school inventory/capability data. |
| Elections | 2013/2017 full candidate results; 2022 winners for some races | IEBC 2022 ward and race forms are marked pending in the inspected portal snapshot; 2022 losing candidates/votes and some totals remain unavailable. Do not use media provisional tallies as official results. |
| County audits | Auditor-General opinions/findings for FY2013/14 and FY2016/17–FY2024/25, with missing opinion details noted where absent | FY2014/15 and FY2015/16 reports for both county entities were not found after repository research. |
| Tea and milk | Tea factory and bonus rows from named sources; empty milk-price dataset | No Nyamira-specific farm-gate milk price was found. Several tea years/factories lack reliable figures; sources conflict or are interim. Field or official confirmation is needed. |
| NG-CDF | Constituency allocations, audited budget-execution lines, selected audit-named projects and bursaries | The Board does not publish project lists; current project coverage comes from audited FY2024/25 statements and audit reports, not a complete inventory. |
| Money/projects | County budgets, actual spending and 404 project records, with specific reconciliation and identity caveats documented | Some budget-source totals conflict; many physical-progress observations lack explicit dates; project identities across renamed records need source review. |

The first-pass priority recommendation is **geography and public-facility inventory**, because it underpins the proposed county encyclopedia and mapping work. Begin with a coverage/source audit and define the inventory schema; do not add guessed facilities, coordinates, management assignments or capability claims. This recommendation is not yet approved as the first dataset update.

### First work package — source/coverage audit (completed 26 Oct 2026)

- The owner selected **public-facility inventory and geography** as the first dataset gap.
- First stage: audit existing facility/place and boundary records and their source coverage; identify authoritative source candidates and what's missing by facility category and administrative level; report the coverage gaps before changing any records.
- Existing relevant files include `src/data/wards.json`, `src/data/geo.json`, `src/data/sublocations.json`, `public/files/facilities-v1.csv`, `public/files/places-v1.csv`, `data-src/osm-points.json`, `data-src/ward-boundaries.json`, and `data-src/research-notes/schools-health-census.md`.
- Do not yet add or alter facilities, locations, coordinates, management assignments, capability claims, or observation dates.
- Confirmed by the owner on 26 Oct 2026.

#### Measured repository coverage

Counts below are a local structural audit on 26 Oct 2026, derived from the named files. They describe current records only; they are not estimates of how many facilities or places exist in Nyamira and do not independently verify county data.

- `wards.json` / `facilities-v1.csv` contain **247 facility rows across all 20 wards**: 125 Health, 59 Education, 25 Worship, 10 Market, 9 Public office, 8 Community centre, 6 Agriculture, and 5 Water.
- The 247 rows' source mix is **120** from the Kenya Master Health Facility List 2017 export, **69** from OpenStreetMap/HOT, and **58** from Google Maps discovery. All **127** OSM/Google rows are labeled unverified; the 120 registry rows are sourced to a 2017 export, so current existence, management and capability still need re-checking.
- **69/247** facility CSV rows have coordinates, all from the OSM/HOT source; **178** have none. **127/247** have no owner value. The schema has no observation/check date or facility-image/history fields. The existing category list includes private health providers and worship/community/place types, so it is not yet a public-facilities-only register.
- `geo.json` has **20 ward boundary shapes** and **103 rendered named OSM map points across 17 wards**; Bosamaro, Bomwagamo and Gesima have no rendered OSM points. The map build filters to named points with recognized categories. In the **281** raw OSM features, **153** have no name and a further **25 named** features are not included by the current category filter. The rendered points do not retain source feature IDs or a stable ID linking them to the 247 facility rows. **27 additional same-name/category point entries** repeat within wards; this is a review signal, not proof that they are duplicate real-world facilities.
- `places-v1.csv` has **63 rows**, all labeled Unverified: 43 Google discovery rows, 2 Google school-listing addresses, and 18 OSM rows. **18/63** have coordinates; **45** do not; **4** lack a ward or sub-county assignment. Its "Village" type has 15 rows, but this is not an authoritative or complete village inventory.
- `sublocations.json` carries the 2019 KNBS hierarchy of **5 sub-counties, 14 divisions, 49 locations and 113 sub-locations** with population/household/area values and aggregation checks. Those administrative units are not mapped to the county's 20 wards. The boundary source currently contains ward shapes only; no sub-location or village geometries were found in the reviewed files.
- No current facility-specific service/capability history or dated facility change archive is present in the reviewed facility/places export schemas. The Health dataset has no sub-county or facility-level statistics; health operational data is blocked by KHIS login/access conditions.

#### Source candidates and limits

- **Health facility identity/management:** current local base is the 2017 KMHFL export. The SHA Provider Portal is reachable but its public page did not expose a facility list; the KMHFL source URL could not be retrieved in this environment. KHIS is a separate system for health-service data and appears login-gated in the repository research notes.
- **Education facilities:** the local detailed statistics are the county-level BESB 2020, plus KNEC county candidate counts for 2023–2025; the KNBS 2024 school-census pilot covers only Keera. The NEMIS HTTP information page describes school/learner/staff data and GIS but does not publish a register. A current complete school register and detailed sub-county data were not found in the reviewed public pages and local research.
- **Administrative geography:** KNBS 2019 Volume II supports the named census hierarchy but not the county-ward matching or small-area geometries. geoBoundaries/IEBC ward shapes support ward mapping only. An authoritative source is still needed for lower-level boundaries and a village gazetteer.
- **Other county assets:** county plans, budgets, asset registers, departmental reports and public audit records may identify facilities or projects, but each record must be scoped to what that document actually establishes; a budget line does not establish current operation or capability.

#### Audit conclusion

The current data is a useful seed list, not a county-wide public-facility inventory. Its most important structural gaps are: stale/heterogeneous source dates; unverified and incomplete coverage; missing coordinates for most rows; no stable cross-link between map markers and facility records; no current public/national/county management classification; no facility capability/operational observations; and no dated history or image permissions. No source data was changed in this audit.

## Research/update direction amendment (26 Oct 2026)

- The owner wants further current, cross-sector research and evidence-based dataset updates, rather than relying on the old seed lists.
- Candidate sources the owner suggested: SHA records for health-facility listings; Ministry of Education records for schools; IEBC records for polling stations.
- These are source leads, not confirmed access or field coverage. Use each only for the facts it directly establishes. For example, a health payer/provider listing must not be treated as proof of every service or current operation; a school register is not performance data; a polling station is election-specific and should be dated by election/IEBC register, not modeled as a permanent service facility without evidence.
- Proposed next research batch: establish public availability, vintage, fields, geographic coverage and limitations for the SHA/MoH, Ministry of Education and IEBC sources; compare records to the current local data; then update only source-supported fields, leaving missing values explicit. Additional sectors and lower-level geography need their own source mapping.
- The owner confirmed that SHA/MoH health, Ministry of Education schools and IEBC polling stations should be researched as the next batch.
- State: first-pass source research recorded below; no data rows changed.

### Source track findings (first pass, checked 26 Oct 2026)

#### SHA / Ministry of Health — health facilities

- The SHA Provider Portal is reachable at `https://portal.sha.go.ke/`, but the public response is an application shell titled “SHA | Provider Portal”; it did not expose a public Nyamira facility export or directory in the reviewed content. No sign-in, private data or provider API was accessed.
- The Ministry of Health SHA page (`https://www.health.go.ke/node/1225`, dated 11 Jul 2024) is public SHA information, not a current facility inventory.
- The repository's health base includes 120 facility rows labeled “Kenya Master Health Facility List (2017 export via HDX)” with evidence `official`. KHIS access is separately described as login-gated in the existing health research notes.
- **Next evidence needed:** a public/downloadable SHA or current KMHFL facility list, or a public, lawfully shareable export from the responsible authority. SHA listing/contracting would establish only the status and date it explicitly states—not facility ownership, all capabilities or current operation. Do not ingest member/patient records.

#### Ministry of Education — schools

- The latest detailed official school-statistics source currently in the local dataset is the Ministry's *Basic Education Statistical Booklet 2020* (`MOE-BESB-2020`; local copy `src/MoE_BESB_2020.pdf`). KNEC county candidate-count sources extend through 2025 (`KNEC-KCSE-2025-ES`); KNBS's `KNBS-SCHOOLCENSUS-PILOT-2024` is a pilot covering Keera only. These sources do not provide a current complete school-by-school register.
- The Ministry homepage (`https://www.education.go.ke/`) is accessible but does not expose the needed school inventory. The NEMIS HTTPS host could not be retrieved in this environment; its HTTP information page (`http://nemis.education.go.ke/`) is accessible and describes a system that collects school, learner and teacher data and includes GIS for analysis. That page is not a public school register and does not establish what is available without sign-in. Do not submit credentials over HTTP or seek learner/staff records.
- **Next evidence needed:** a public current school register/export or a shareable Ministry/county source with stable school codes, level, ownership/management, administrative location and record date. Student-level records are out of scope.

#### IEBC — polling stations

- The repository already contains official IEBC polling-station registers (`iebc-rov-ps-2017`, dated 27 Jun 2017: 553 stations; `iebc-rov-ps-2022`, dated 3 Aug 2022: 643 stations): 1,196 election-year rows total. Rows carry year, ward, constituency, station code/name, registration-centre code/name, registered voters, source ID and page.
- None of these 1,196 rows has latitude/longitude. They can support historical election-year station lists by ward, but not precise map pins without a separately sourced or field-checked location. Do not geocode names into asserted facility coordinates.
- No 2027 polling-station register or coordinates were located in the reviewed repository/source check. The IEBC homepage, checked 26 Oct 2026, shows a countdown to the 10 Aug 2027 General Election but no polling-station register in the page content; a targeted search did not surface a Nyamira 2027 register. This does not prove that IEBC has not published one elsewhere.
- Polling stations are election-specific records. Keep year/register version and source date; don't merge them with permanent facilities absent evidence that they are the same place.

#### What this means for updating data

- A useful first update is not yet safe from the sources found: the SHA portal did not expose a public facility list, NEMIS could not be accessed and no complete current school register was found, while the IEBC list has no coordinates and is election-year-specific.
- Existing source rows remain unchanged. Preserve the 2017 KMHFL as a dated historical source; do not relabel it as current. Preserve IEBC 2017/2022 station lists as dated records; don't add map coordinates by name matching.
- To proceed with the health inventory, obtain a public/authorized facility-only SHA or KMHFL export. For schools, obtain a current public official register. For polling stations, wait for or source an official register with coordinates or separately validate coordinates through a documented field process.
- The owner asked to postpone providing a SHA/KMHFL source while they look. Continue only with public sources in the meantime; do not request or use credentials or private records.

## Open questions and facts

- Does “blockchain” mean actual blockchain technology or a metaphor for linked, dated, auditable records?
- What geographic hierarchy and authoritative boundary sources should define the encyclopedia?
- Which sources establish each facility type's official designation and observed capabilities?
- Which named people/roles own collection, editorial review and routine updates?
- What dates should the archive distinguish (source/document date, field observation date, publication/update time)?
- Are image permissions and any privacy/security restrictions known?

## Status

The owner approved the facility-profile and icy-visual foundation and the ledger in `docs/STATUS.md`. Ledger item 1 is implemented on `feat/facility-profile-foundation`: the 247 existing facility IDs and source fields are preserved in `src/data/facilities.json`, and `wards.json` now references those IDs. The 69 coordinate pairs already present in the v1 CSV are retained as source attributes only; they have not been added to a map or treated as reviewed locations. The facility v1 CSV remains byte-for-byte reproducible from the registry. Ledger item 2 is implemented: all current records have static profiles at `/facility/<lowercase-existing-ID>/`. Profiles disclose missing source/observation dates, unknown capability status, no verified photo and no reviewed history rather than filling those gaps. Ledger item 3 is implemented: ward service rows, relevant counts and search results link to profile URLs; the additive v2 CSV and facility JSON API include profile links but omit candidate coordinates. The v1 CSV and existing ward APIs remain unchanged. Review intake, verified facility photographs, new map points and icy styling remain pending.
