# Mapping strategy: every facility, every road, every coordinate

How to get from 247 partially-mapped facilities to a complete, verified geographic registry of Nyamira County.

## Current state (26 Nov 2026)

| Measure | Count | Notes |
|---|---|---|
| **Facilities listed** | 247 | 125 health, 59 education, 10 markets, 25 worship, 9 public office, 8 community, 6 agriculture, 5 water |
| **With coordinates** | 69 (28%) | All from OSM; KMHFL and Google Maps records have none |
| **Field-verified** | 0 (0%) | No correspondent has visited any place |
| **Roads** | 90 | From county budget documents; no GIS data |
| **Places/towns** | 59 | Trading centres, from Google Maps |
| **Living events** | 0 | Fieldwork pipeline is coded but not provisioned |

### Completeness gaps

- **Education:** 59 of ~601 schools listed (CRA benchmark). ~542 missing, mostly primary schools.
- **Health:** 125 of ~150 estimated. Close, but the KMHFL data is from 2017 — some have opened, some have closed.
- **Water:** 5 listed. The actual number of water points is in the hundreds.
- **Markets:** 10 listed. OSM alone shows 30 marketplaces.
- **Police/courts:** 9 listed. At least 7 stations/posts per the 2018–22 CIDP.
- **Roads:** 90 from budget documents. OSM has 122 named roads with classifications.
- **Coordinates:** 178 facilities have no coordinates at all.

### Ward coverage inequality

Ekerenyo has 3 facilities listed; Mekenene and Kiabonyoru have 20 each. This is a data gap, not a service gap — Ekerenyo has schools and clinics, they just aren't in our registry yet.

## Data sources

### Available now (free, downloadable)

| Source | What it has | Records for Nyamira | Format | Licence |
|---|---|---|---|---|
| **OpenStreetMap (Overpass API)** | All mapped features: amenities, roads, places, water | 329 (fresh pull 26 Nov 2026) | JSON/GeoJSON | ODbL |
| **KMHFL 2017 export (HDX)** | Health facilities with levels, ownership, MFL codes | 120 | CSV | Open |
| **Kenya schools dataset (energydata.info)** | Schools with coordinates | National; filter to Nyamira subcounties | CSV/SHP/JSON | CC0/Open |
| **geoBoundaries ADM3** | Ward boundary polygons | 20 wards | GeoJSON | CC BY 4.0 |
| **Google Maps place IDs** | 58 facilities with Google Place IDs | 58 (in facilities.json) | — | Terms apply |
| **CRA Nyamira Fact Sheet** | Facility counts as benchmarks | — | PDF | Public |

### Available with effort

| Source | What it has | How to get it |
|---|---|---|
| **KMHFR API** (kmhfr.health.go.ke) | Current health facility registry with coordinates | Try the API: `/api/facilities/facilities/?county=nyamira&format=json`. Site has been unreachable; try in a browser. |
| **Google Places API** | Geocoding and discovery | 10,000 free geocoding requests/month. Text Search Essentials (IDs only) is free. Feasible for our scale. |
| **KRB road map** (maps.krb.go.ke) | Classified roads with condition/surface | Web map; may allow feature export. Try in a browser. |
| **KeRRA** | County road registry with classifications | Email Nyamira Regional Office (dg@kerra.go.ke) |
| **GWASCO / WASREB** | Water service infrastructure | Contact GWASCO for point data |
| **NPS / County Commissioner** | Police stations and posts | Records request (drafted, not sent) |

### Field collection

| Method | For | Cost |
|---|---|---|
| **KoboToolbox forms** | Visiting facilities, checking condition, collecting coordinates | Free (forms are built) |
| **Plus Codes** | Offline coordinate collection by correspondents | Free, works offline, 14m accuracy |
| **Google Maps (manual)** | Spot-checking coordinates | Free |

## The pipeline

Four scripts in `scripts/geo/`:

```
npm run geo:pull-osm       # 1. Pull fresh OSM data → data-src/osm-fresh.json
npm run geo:reconcile       # 2. Match against facilities.json → data-src/geo-review.json
                            #    (a person reviews and sets approve: true/false)
npm run geo:apply           # 3. Apply reviewed decisions → updates facilities.json
npm run geo:coverage        # 4. Print the coverage report
```

### The workflow

```
  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │  pull-osm   │───▶│  reconcile  │───▶│ geo-review  │
  │  (Overpass)  │    │  (matching)  │    │   (JSON)    │
  └─────────────┘    └─────────────┘    └──────┬──────┘
                                               │
                                        Person reviews
                                        approve: true/false
                                               │
                                        ┌──────▼──────┐
                                        │ apply-review │
                                        │  (updates    │
                                        │  facilities) │
                                        └──────┬──────┘
                                               │
                                        npm run build
                                        npm run geo:coverage
```

The same workflow works for any new data source: convert it to the same format as osm-fresh.json (an array of features with `osmId`, `name`, `category`, `lat`, `lon`, `ward`) and run reconcile.

## Phases

### Phase G1: Bulk data enrichment (do this first)

**Goal:** go from 247 to ~800+ facilities with coordinates for most.

1. **Fresh OSM pull** — done. 329 features, 18 new candidates (mostly markets). Review and approve.
2. **Kenya schools dataset** — download from energydata.info, filter to Nyamira subcounties (Borabu, Kitutu Masaba, West Mugirango, North Mugirango). This should add ~400+ schools with coordinates.
3. **Google Places geocoding** — use the 58 Google Place IDs already in facilities.json to get coordinates. 10,000 free requests/month is more than enough. Write a `scripts/geo/geocode-google.mjs` that reads Place IDs and returns lat/lon.
4. **KMHFL API** — if reachable, pull the current registry. Even if not, the KMHFL codes in facilities.json (e.g. "KMHFL 16256") can be used to look up coordinates from other mirrors.

**Expected result:** ~800+ facilities, ~600+ with coordinates.

### Phase G2: Named roads and places

**Goal:** a complete named-road registry with coordinates and classifications.

1. **OSM roads** — 122 named roads already pulled, with highway classifications (trunk, primary, secondary, tertiary, unclassified). Cross-reference against the 90 budget-document roads.
2. **OSM places** — 30 villages and 7 towns. Merge with the 59 trading centres in ward-places.json.
3. **Water features** — 56 waterways from OSM. These anchor the geography.
4. **KRB map** — if exportable, the classified road network with condition data.

### Phase G3: Field verification

**Goal:** start turning "Unverified" into "Verified" with real visits.

1. **Provision KoboToolbox and Google Sheets** (see `fieldwork/README.md`)
2. **Add Plus Codes** to the KoboToolbox place-visit form as the coordinate collection method
3. **Start with the 20 ward headquarters** — one per ward, fastest coverage
4. **Then the 4–5 sub-county hospitals** — highest traffic
5. **Then schools along travel routes** — opportunistic

Each visit produces:
- A dated event in living/events.json (status, condition, services)
- Coordinates (via Plus Code or GPS)
- A photo (building, not people)
- The evidence label changes from "Unverified" to "Verified"

### Phase G4: Continuous improvement

**Goal:** keep the map current and growing.

1. **Monthly OSM re-pull** — new features appear as mappers add them
2. **Resident reports** — the KoboToolbox "place visit" form, eventually open to the public
3. **Document-driven updates** — budget documents, audit reports, news (via the Google Sheets events tab)
4. **OSM contributions** — when field visits find places not on OSM, contribute them back (this grows the ecosystem)

## Coordinate collection standards

- **Primary method:** GPS from the KoboToolbox form (automatic on submission)
- **Offline backup:** Google Plus Codes (10-character, ~14m accuracy). The correspondent reads the code from Google Maps offline mode or plus.codes and enters it in the form.
- **Desk method:** Google Maps pin drop for places visible in satellite imagery
- **Never:** estimating, interpolating, or copying coordinates from unverified sources without marking them as "candidate"

Coordinates from desk methods are `coordinateEvidence: "unverified"` until a field visit confirms them. Coordinates from GPS during a field visit are `coordinateEvidence: "verified"`.

## Benchmarks for completeness

| Category | Benchmark source | Expected count | We have | Gap |
|---|---|---|---|---|
| Primary schools | CRA Fact Sheet | ~411 | ~40 | ~371 |
| Secondary schools | CRA Fact Sheet | ~190 | ~19 | ~171 |
| Health facilities | KMHFL 2017 | ~120 | 125 | ~0 (but need update) |
| Water points | — | Hundreds | 5 | Hundreds |
| Markets | OSM | 30+ | 10 | 20+ |
| Police stations | CIDP 2018–22 | 7+ | 5 | 2+ |
| Roads (named) | OSM | 122+ | 90 | 32+ |

## What makes this valuable

1. **No other public source** maps every facility in Nyamira County at this detail level with evidence labels and verification status
2. **The registry is a platform** — apps, radio stations, researchers and county planners can build on the open data (CC BY 4.0 at `/api/facilities.json`)
3. **Field verification is the moat** — anyone can copy the KMHFL list; nobody else is going to visit every dispensary in Bosamaro ward and report whether it's open
4. **It compounds** — every visit makes the data more valuable, every new correspondent covers more ground, every update makes the registry more trustworthy
