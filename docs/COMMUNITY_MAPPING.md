# Community Mapping Initiative

How Gusii Daily builds its own geographic dataset — ward by ward, facility by facility, using phones people already have.

## Why build it ourselves

Every free geocoding API we tried returned near-zero results for Nyamira's small facilities. Google Maps has them but costs money and returns unverified coordinates. The Kenya Master Health Facility List API is offline. No external dataset will give us what we need: verified, dated, sourced coordinates with evidence labels.

Building it ourselves means:
- **Verified data.** Every coordinate is field-collected with a photo. Evidence label: Verified.
- **Living data.** The same visit that captures a coordinate also records condition, services, staff and water/power — the living data pipeline is already built.
- **Community ownership.** Contributors see their data on the site. The dataset becomes a civic asset.
- **OpenStreetMap contribution.** Every facility we verify can go into OSM, helping everyone.
- **Correspondent network.** The people who map today become the people who report changes tomorrow.

## What's already built

| Component | Status | Location |
|---|---|---|
| Place-visit Kobo form with GPS capture | Ready to deploy | `fieldwork/kobo/place-visit/` |
| Road-check Kobo form with GPS | Ready to deploy | `fieldwork/kobo/road-check/` |
| Market-prices Kobo form | Ready to deploy | `fieldwork/kobo/market-prices/` |
| Living data sync script | Code-complete | `scripts/living/sync.mjs` |
| Geo apply script (coordinates → registry) | Working | `scripts/geo/apply-review.mjs` |
| Coverage report | Working | `scripts/geo/coverage.mjs` |
| Manual coordinate lookup page | Working | `data-src/coord-lookup.html` |
| Review page for field updates | Built | `/review/changes/` |
| Privacy controls (no names/faces/numbers) | Built into every form | Form privacy checkbox |

## What needs to happen

### Step 1: Set up KoboToolbox (1 hour, one person)

1. Create a free KoboToolbox account at kf.kobotoolbox.org
2. Build the three forms: `npm run fieldwork:forms`
3. Upload each `.xlsx` file to Kobo (Projects → New → Upload an XLSForm)
4. Test each form on your own phone (download the KoboCollect app from Play Store)
5. Set the environment variables (`KOBO_TOKEN`, form asset IDs)
6. Run `npm run living:sync` and check the output

That's it. The pipeline works from this point.

### Step 2: Map your own ward first (1-2 days, one person)

Before recruiting anyone, map one ward completely yourself. This:
- Tests the full pipeline end-to-end
- Gives you a realistic time estimate per facility
- Produces a template for training others
- Creates the first verified data

**What to do at each facility:**
1. Open KoboCollect → Place visit form
2. Select the ward and facility (or "Not on the list" for new ones)
3. Stand at the entrance, wait for GPS accuracy <10m
4. Record status, condition, services, water, power
5. Take one photo of the outside (no people)
6. Submit (works offline — syncs when you have signal)

**Time estimate:** 15-20 minutes per facility including travel between nearby ones. A ward with 10 facilities takes half a day.

### Step 3: Recruit ward mappers (2-4 weeks)

Each ward needs one person with a smartphone. They don't need to be technical — the Kobo form guides them through every step.

**Who to recruit:**
- Teachers (know every school in the ward, trusted, literate)
- Community health volunteers (CHVs) — know every health facility, already move between them
- Bodaboda riders — know every road and shortcut, cover ground fast
- Students — digital natives, motivated by seeing their contribution published
- Church youth groups — organized, often looking for community projects

**What they need:**
- An Android phone with KoboCollect installed (most already have one)
- 30 minutes of training (how to use the form, what to record, what NOT to record)
- The ward's facility list printed on one page (the lookup page generates this)
- Mobile data for syncing (small — each submission is <50KB without photos)

**What they don't need:**
- A computer
- Technical skills
- Internet at the facility (forms work offline)
- Payment (but see incentives below)

### Step 4: Organize mapping events

**Ward mapping day** — pick one ward, gather 3-5 people, split the facility list, map everything in one day. Meet in the morning, divide facilities by location, reconvene at lunch to sync and troubleshoot, finish by afternoon.

**School mapping challenge** — partner with secondary schools. Geography or IT clubs map their own school plus nearby facilities. Schools compete by completeness and quality. Results go on the site with attribution.

**Church mapping Sunday** — after service, the youth group maps facilities near the church. Many rural churches are near dispensaries, water points, and schools.

**Market day mapping** — markets are the easiest: visit on market day, record what's trading, capture GPS, photograph the entrance.

### Step 5: Review and publish

Every submission goes through review before it reaches the site:
1. **In KoboToolbox:** reviewer checks each submission — GPS is in the right ward, photo shows the named facility, status makes sense
2. **Mark as Approved** or Not approved
3. **Run sync:** `npm run living:sync`
4. **Check the diff:** `git diff src/data/living/`
5. **Build and deploy:** `npm run build` → push

New facilities discovered in the field appear in `new-places.json` for a person to add to the registry.

### Step 6: Contribute to OpenStreetMap

Every verified facility should go into OSM so the whole community benefits and so that free geocoding tools work better for everyone building civic tech in rural Kenya.

**How:**
1. After a ward is fully verified, export the facility list with coordinates
2. Use JOSM (desktop) or iD editor (browser) to add each facility to OSM
3. Tag correctly: `amenity=clinic`, `amenity=school`, `amenity=marketplace`, etc.
4. Add `source=Gusii Daily field survey 2026` and `source:date=YYYY-MM-DD`
5. Add the facility name in `name=` and `name:sw=` if the Kiswahili name differs

**Organized mapping:** register a project on the HOT Tasking Manager (tasks.hotosm.org) for Nyamira County. Remote mappers worldwide can trace buildings and roads from satellite imagery while local mappers verify names and categories on the ground.

## Incentives and sustainability

### Free incentives
- **Attribution on the site.** "Mapped by [name], [date]" in the facility's metadata. Contributors see their name on a public civic resource.
- **Leaderboard.** A page showing who has verified the most facilities, by ward. Update weekly.
- **Certificates.** "Civic Data Contributor" certificates for people who complete a ward. Useful for CVs.
- **Training.** Mapping skills, data collection, GIS basics — marketable skills for free.

### Low-cost incentives
- **Airtime.** KSh 50-100 per verified facility covers data costs and says thank you. 178 facilities × KSh 100 = KSh 17,800 (~$140).
- **Branded items.** T-shirts, notebooks, stickers with the Gusii Daily logo for people who complete a ward.

### Sustainability
The same people who map today become field correspondents tomorrow. When a facility changes — a dispensary closes, a school gets a new building, a road washes out — they report it through the same form. The mapping phase bootstraps the living data network.

## Timeline

| Week | Action | Target |
|---|---|---|
| 1 | Set up KoboToolbox, test forms on your phone | Pipeline working end-to-end |
| 2 | Map one ward yourself (Township or Manga — urban, facilities close together) | ~15-20 facilities verified |
| 3-4 | Recruit 5 ward mappers, train them, do first mapping day | 3 wards started |
| 5-8 | Rolling ward mapping, weekly review and sync | 10 wards mapped |
| 9-12 | Complete remaining wards, start OSM contributions | All 20 wards, >80% coverage |
| 13+ | Transition to living data: correspondents report changes | Ongoing |

## Tools to build (code additions)

Things we can add to the codebase to support this initiative:

1. **Mapping progress dashboard** — a page showing coverage by ward: how many facilities verified, how many remaining, last visit date. Already have the data; needs a page component.

2. **Contributor attribution** — store the mapper's name (with consent) in the facility record. Display "Last verified by [name] on [date]" on facility pages.

3. **Ward mapping kit generator** — a script that produces a one-page PDF per ward: facility list, rough locations on the ward boundary map, what to look for. Mappers print it or view on phone.

4. **Offline facility list** — a lightweight PWA or cached page that shows the ward's facilities without needing data. Mapper opens it once at home, uses it in the field.

5. **Photo gallery** — facility photos from Kobo displayed on the facility page. Proves the visit happened, shows the reader what it looks like.

6. **OSM export script** — generates an `.osm` file from verified facilities, ready to upload to OpenStreetMap via JOSM.

7. **WhatsApp integration** — a simple bot (via Twilio or the free WhatsApp Business API) that accepts a location pin + facility name and creates a Kobo-compatible submission. Many people know WhatsApp but won't install another app.

## Coverage targets

| Milestone | Facilities with coordinates | % of registry |
|---|---|---|
| Today | 69 of 247 | 28% |
| After 1 ward | ~85 | 34% |
| After 5 wards | ~140 | 57% |
| After 10 wards | ~190 | 77% |
| After 20 wards | 247+ | 100% (plus new discoveries) |
| MapLibre map unlocked | >124 (50%) | Phase 2 of map roadmap |

Field mapping typically discovers 20-30% more facilities than any registry knows about. Expect the registry to grow from 247 to ~300-350 as mappers find unregistered water points, ECDE centres, and community facilities.
