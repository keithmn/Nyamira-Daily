# Kisii County health facilities (KMHFL 2017)

`facilities-health.json`: 159 health facility records for Kisii County, in the shape of `src/data/facilities.json`, IDs `KSI-H0001` to `KSI-H0159` (ordered by ward slug, then name). Built 27 Nov 2026. Not yet wired into `src/data/`.

## Source

- **Dataset:** Kenya - Health facilities in Kenya, file `kenya-health-facilities-2017_08_02.xlsx` (one sheet, 8,932 facility rows, all counties).
- **Publisher on HDX:** OCHA Regional Office for Southern and Eastern Africa (ROSEA). HDX caveat: "HDX has extracted this list publicly from the Kenya Ministry of Health Portal on health facilities" (kmhfl.health.go.ke). Dataset source: Kenya Ministry of Health, USAID, AfyaInfo, Savannah Informatics, Knowing Limited, DANIDA, HS2020. Licence: CC BY.
- **URL:** https://data.humdata.org/dataset/7b9c2851-dc37-4a88-9dcb-62e55eb91baf/resource/df6bfc55-3b25-4309-a1b4-74afba434956/download/kenya-health-facilities-2017_08_02.xlsx
- **Dataset page:** https://data.humdata.org/dataset/kenya-health-facilities-in-kenya (dataset date 1 Aug 2017; resource last modified 2017-08-02T13:25:32; 948,284 bytes)
- **sha256:** `e86e85bcd303db0168a1ac693f09abc6cf9bbd3aa5682413f60d15cf4580860f` (downloaded 27 Nov 2026)
- **Same export as Nyamira:** all 120 Nyamira rows in this file are exactly the 120 KMHFL records in `src/data/facilities.json` (codes, type, KEPH level and owner identical), so the two counties are comparable.
- **Newer data:** the live KMHFL API (`kmhfr.health.go.ke`, `api.kmhfl.health.go.ke`) timed out on 27 Nov 2026, as it refused connections on 26 Nov. No newer official export was used. This is a 2017 list: facilities may have opened or closed since.

## Method (same rules as Nyamira)

- **Included:** every row with `County = KISII`: 159 rows. All 159 are `Operation status: Operational`, `Closed: No`, `Approved: Yes`, `Public visible: Yes` in the export (as were all 120 Nyamira rows, which were all used). This is the export's status in 2017, not a claim that a facility operates today.
- **Fields:** `name` as printed; `subtype` = Facility type; `level` = Keph level; `owner` = Owner; `sourceRef` = `KMHFL <Code>`; `source`, `evidence` ("official") and `evidenceNote` ("Official list (2017), not yet verified") copied from the Nyamira KMHFL records. No level or owner was missing.
- **Coordinates:** none. The export has no coordinate columns (Nyamira's KMHFL records are also `coordinates: null`). So the point-in-polygon cross-check could not be run.
- **Ward:** matched from the export's `Ward` to the IEBC ward register (`src/data/ward-register.json`, county "kisii") by name, ignoring case and punctuation. As a check in place of coordinates, the export's `Constituency` had to equal the register's constituency for that ward; all 159 passed. Unassigned: none.

## Judgement calls

- **Ward spellings** (KMHFL to IEBC register): `BASSI BOGETAORIO` to Basi Bogetaorio (`basi-bogetaorio`, 4 records); `BOBASI/BOITANGARE` to Bobasi Boitangare (`bobasi-boitangare`, 4); `BOIKANGA` to Boikang'a (`boikanga`, 1). Each also matched on constituency (Bobasi, Bobasi, South Mugirango). `BASI CENTRAL` and `MAJOGE BASI` match the IEBC spelling exactly.
- **Names:** two names printed in capitals were title-cased, as Nyamira's capitalised names were (e.g. NYAMUSI MEDICAL CENTER): `CENTRAL MEDICAL CLINIC` to "Central Medical Clinic", `GALAXY MEDICAL CENTRE` to "Galaxy Medical Centre". `LADACA` (KMHFL 22204) is kept in capitals: it may be an acronym. All other names verbatim, including place tags in brackets such as "(Gucha)" and "Kisii Hospital (Level 5)".
- **Facility types kept as listed**, including one "Regional Blood Transfusion Centre" and one "Comprehensive primary health care facility", types that do not occur in Nyamira.
- **Nyatieko ward has no facility** in the 2017 export. That is a gap in the list, not evidence that the ward has no health facility.
- Health facilities that are only in OpenStreetMap (Nyamira has a few, with source "OpenStreetMap (ODbL), HOT export") are not included here; that belongs to the OSM places work.

## Counts

By type: Basic primary health care facility 31; Dispensaries and clinic-out patient only 101; Secondary care hospitals 8; Comprehensive primary health care facility 1; Primary care hospitals 17; Regional Blood Transfusion Centre 1. By KEPH level: Level 3 34; Level 2 104; Level 4 20; Level 5 1.

| Constituency | Ward | Health facilities |
|---|---|---|
| Bobasi | Basi Bogetaorio (`basi-bogetaorio`) | 4 |
| Bobasi | Basi Central (`basi-central`) | 2 |
| Bobasi | Bobasi Boitangare (`bobasi-boitangare`) | 4 |
| Bobasi | Bobasi Chache (`bobasi-chache`) | 5 |
| Bobasi | Masige East (`masige-east`) | 1 |
| Bobasi | Masige West (`masige-west`) | 3 |
| Bobasi | Nyacheki (`nyacheki`) | 4 |
| Bobasi | Sameta/Mokwerero (`sameta-mokwerero`) | 7 |
| Bomachoge Borabu | Bokimonge (`bokimonge`) | 4 |
| Bomachoge Borabu | Bombaba Borabu (`bombaba-borabu`) | 4 |
| Bomachoge Borabu | Boochi Borabu (`boochi-borabu`) | 1 |
| Bomachoge Borabu | Magenche (`magenche`) | 3 |
| Bomachoge Chache | Boochi/Tendere (`boochi-tendere`) | 3 |
| Bomachoge Chache | Bosoti/Sengera (`bosoti-sengera`) | 3 |
| Bomachoge Chache | Majoge Basi (`majoge-basi`) | 2 |
| Bonchari | Bogiakumu (`bogiakumu`) | 5 |
| Bonchari | Bomariba (`bomariba`) | 1 |
| Bonchari | Bomorenda (`bomorenda`) | 7 |
| Bonchari | Riana (`riana`) | 3 |
| Kitutu Chache North | Kegogi (`kegogi`) | 1 |
| Kitutu Chache North | Marani (`marani`) | 4 |
| Kitutu Chache North | Monyerero (`monyerero`) | 2 |
| Kitutu Chache North | Sensi (`sensi`) | 3 |
| Kitutu Chache South | Bogeka (`bogeka`) | 1 |
| Kitutu Chache South | Bogusero (`bogusero`) | 2 |
| Kitutu Chache South | Kitutu Central (`kitutu-central`) | 7 |
| Kitutu Chache South | Nyakoe (`nyakoe`) | 2 |
| Kitutu Chache South | Nyatieko (`nyatieko`) | 0 |
| Nyaribari Chache | Birongo (`birongo`) | 2 |
| Nyaribari Chache | Bobaracho (`bobaracho`) | 6 |
| Nyaribari Chache | Ibeno (`ibeno`) | 3 |
| Nyaribari Chache | Keumbu (`keumbu`) | 3 |
| Nyaribari Chache | Kiogoro (`kiogoro`) | 5 |
| Nyaribari Chache | Kisii Central (`kisii-central`) | 13 |
| Nyaribari Masaba | Gesusu (`gesusu`) | 5 |
| Nyaribari Masaba | Ichuni (`ichuni`) | 4 |
| Nyaribari Masaba | Kiamokama (`kiamokama`) | 1 |
| Nyaribari Masaba | Masimba (`masimba`) | 4 |
| Nyaribari Masaba | Nyamasibi (`nyamasibi`) | 2 |
| South Mugirango | Bogetenga (`bogetenga`) | 4 |
| South Mugirango | Boikang'a (`boikanga`) | 1 |
| South Mugirango | Borabu/Chitago (`borabu-chitago`) | 3 |
| South Mugirango | Getenga (`getenga`) | 2 |
| South Mugirango | Moticho (`moticho`) | 9 |
| South Mugirango | Tabaka (`tabaka`) | 4 |
