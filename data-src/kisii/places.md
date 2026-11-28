# Kisii County: public places and map points from OpenStreetMap

Built 27 Nov 2026 for decision #134 (Kisii County). Non-health places only; health facilities come from the Kenya Master Health Facility List in a separate file (`facilities-health.json`).

## Files

- `facilities-places.json`: 131 records in the shape of `src/data/facilities.json` (IDs `KSI-P0001` to `KSI-P0131`, ordered by ward slug, category, name). All `evidence: "unverified"`; `level` and `owner` are null (OpenStreetMap does not say). Nothing here says whether a place is open or working.
- `osm-points.json`: 301 named points in the format `scripts/build-geo.py` reads as its second argument (same keys as `data-src/osm-points.json`: `layer`, `ward`, `lon`, `lat`, `props`). `ward` is the geoBoundaries ADM3 name (the register's `boundaryName`), because `build-geo.py` matches points to boundary names. Layers: points_of_interest 167, populated_places 40, education_facilities 61, health_facilities 33. Unlike the facility records, this file keeps health points, populated places and commercial points (banks, fuel, restaurants), as Nyamira's map file does.

## Source

- OpenStreetMap, © OpenStreetMap contributors, licensed ODbL. Pulled once from the Overpass API (`https://overpass-api.de/api/interpreter`) at 2026-11-27T11:57:23Z; OSM data as of 2026-11-27T11:55:18Z. User-Agent `GusiiDailyMapping/1.0 (civic data project)`, as in `scripts/geo/pull-osm.mjs`. The server was at capacity on the first attempt (HTTP 502); the same query succeeded after a 20-second wait.
- Query (bounding box of the geoBoundaries ADM1 "Kisii" polygon plus about 500 m):

```
[out:json][timeout:180][bbox:-0.9782,34.6135,-0.4963,35.0180];
(
  nwr["amenity"];
  nwr["building"~"^(school|church|mosque|chapel|hospital|public|government)$"];
  nwr["office"~"^(government|administrative)$"];
  nwr["place"];
  nwr["man_made"~"^(water_well|water_tower|water_works|wastewater_plant|works)$"];
  nwr["healthcare"];
);
out center tags;
```

- Ward boundaries: geoBoundaries gbOpen KEN ADM3 (CC BY 4.0), the polygon named by each Kisii ward's `boundaryName` in `src/data/ward-register.json`. Each name matched exactly one ADM3 feature.

## Method

1. 546 OSM elements returned. Ways and relations use the centre Overpass returns.
2. Each point was placed in a Kisii ward by point-in-polygon (holes respected). 157 fell outside every Kisii ward polygon (the box also covers parts of neighbouring counties) and were dropped.
3. 86 unnamed features were dropped from both files: an unnamed point cannot be looked up or checked.
4. Health features (amenity hospital, clinic, doctors, dentist, pharmacy; building=hospital; any healthcare tag): 33, kept in the map file only.
5. Categories follow Nyamira's records and `scripts/geo/pull-osm.mjs`; `subtype` is the raw OSM value, as in Nyamira's OSM records:
   - Education: amenity school, college, university, kindergarten, library; building=school with no amenity.
   - Community centre: amenity=community_centre. Market: amenity=marketplace. Worship: amenity=place_of_worship; building church/mosque/chapel with no amenity.
   - Public office: amenity police, courthouse, townhall, post_office, fire_station, prison; office government/administrative (subtype "government office").
   - Water: man_made water_well, water_tower, water_works, wastewater_plant; amenity drinking_water, water_point. None with a name fell inside Kisii.
   - Agriculture: man_made=works with a tea or coffee product or name (subtype "tea factory" / "coffee factory", as Nyamira's records say "tea factory"); one amenity=fixme point whose mapper typed it "tea buying center".
6. Left out of the facility records (commercial, or not a public facility; Nyamira's records have none of these): place 40, amenity=fuel 33, amenity=bank 18, amenity=fixme 11, amenity=restaurant 10, amenity=bus_station 4, amenity=bar 4, amenity=money_transfer 3, amenity=pub 2, amenity=internet_cafe 2, man_made=works 1, amenity=cafe 1, amenity=post_box 1, amenity=taxi 1, amenity=veterinary 1, amenity=fast_food 1, amenity=shelter 1. The other amenity=fixme points are typed "shop" by their mapper.
7. Duplicates: the same name, category and ward within 200 m counted once (node kept): Kiamabundu Primary School (node/5455479323 = node/5431393525); Itierio Girls' High School (relation/16350806 = node/11203463675); Kemoreko Primary School (way/958834235 = node/8872065829).

## Judgement calls

- Two points tagged office=government are named as a private person's house (OSM node/5300181623 and node/5300181625, in Kisii Central). They are left out of both files: not public places, and naming a private home is not ours to publish.
- Names are as mapped (capitals and abbreviations kept, e.g. "KISII COUNTY GOVERNMENT OFFICES"). The county-government office points, and "NTSA" / "National Transport and Safety Authority", may each be one place mapped twice under different names; they are kept separate because the names differ.
- Parts of Kisii University ("KSU Library", "KSU Law School", "KSU Ampitheater") are separate OSM features and are kept as separate records.
- The `adm2_pcode` in the map file is built as `KE045` + the IEBC constituency code, matching the pattern of Nyamira's HOT export (`KE046270`); it is not copied from a HOT export.
- `build-geo.py` makes a slug from the boundary name, so Basi Central, Basi Bogetaorio and Majoge Basi would get `bobasi-central`, `bobasi-bogetaorio` and `majoge`, not the register slugs. Whoever extends the map should map boundary names to register slugs.

## Counts

By category and subtype (facility records):

| Category | Subtype | Records |
|---|---|---|
| Agriculture | coffee factory | 1 |
| Agriculture | tea buying centre | 1 |
| Agriculture | tea factory | 1 |
| Community centre | community_centre | 23 |
| Education | college | 5 |
| Education | library | 2 |
| Education | school | 49 |
| Education | university | 4 |
| Market | marketplace | 8 |
| Public office | courthouse | 1 |
| Public office | government office | 9 |
| Public office | police | 3 |
| Public office | post_office | 1 |
| Public office | prison | 2 |
| Worship | church | 1 |
| Worship | place_of_worship | 20 |

By ward (facility records; 20 of 45 wards have none mapped in OpenStreetMap: Bomariba, Riana, Boikang'a, Moticho, Magenche, Masige West, Masige East, Basi Central, Sameta/Mokwerero, Bobasi Boitangare, Majoge Basi, Bosoti/Sengera, Nyamasibi, Kiamokama, Monyerero, Sensi, Marani, Kegogi, Nyakoe, Nyatieko):

| Ward | Constituency | Records |
|---|---|---|
| Bomariba | Bonchari | 0 |
| Bogiakumu | Bonchari | 6 |
| Bomorenda | Bonchari | 14 |
| Riana | Bonchari | 0 |
| Tabaka | South Mugirango | 5 |
| Boikang'a | South Mugirango | 0 |
| Bogetenga | South Mugirango | 1 |
| Borabu/Chitago | South Mugirango | 1 |
| Moticho | South Mugirango | 0 |
| Getenga | South Mugirango | 5 |
| Bombaba Borabu | Bomachoge Borabu | 12 |
| Boochi Borabu | Bomachoge Borabu | 1 |
| Bokimonge | Bomachoge Borabu | 1 |
| Magenche | Bomachoge Borabu | 0 |
| Masige West | Bobasi | 0 |
| Masige East | Bobasi | 0 |
| Basi Central | Bobasi | 0 |
| Nyacheki | Bobasi | 4 |
| Basi Bogetaorio | Bobasi | 2 |
| Bobasi Chache | Bobasi | 1 |
| Sameta/Mokwerero | Bobasi | 0 |
| Bobasi Boitangare | Bobasi | 0 |
| Majoge Basi | Bomachoge Chache | 0 |
| Boochi/Tendere | Bomachoge Chache | 1 |
| Bosoti/Sengera | Bomachoge Chache | 0 |
| Ichuni | Nyaribari Masaba | 2 |
| Nyamasibi | Nyaribari Masaba | 0 |
| Masimba | Nyaribari Masaba | 1 |
| Gesusu | Nyaribari Masaba | 2 |
| Kiamokama | Nyaribari Masaba | 0 |
| Bobaracho | Nyaribari Chache | 13 |
| Kisii Central | Nyaribari Chache | 20 |
| Keumbu | Nyaribari Chache | 2 |
| Kiogoro | Nyaribari Chache | 5 |
| Birongo | Nyaribari Chache | 2 |
| Ibeno | Nyaribari Chache | 2 |
| Monyerero | Kitutu Chache North | 0 |
| Sensi | Kitutu Chache North | 0 |
| Marani | Kitutu Chache North | 0 |
| Kegogi | Kitutu Chache North | 0 |
| Bogusero | Kitutu Chache South | 4 |
| Bogeka | Kitutu Chache South | 1 |
| Nyakoe | Kitutu Chache South | 0 |
| Kitutu Central | Kitutu Chache South | 23 |
| Nyatieko | Kitutu Chache South | 0 |

OpenStreetMap coverage in Kisii is thin outside Kisii town (Kitutu Central, Kisii Central and Bobaracho hold 56 of the 131). An empty ward means nothing is mapped there yet, not that the ward has no schools or markets.
