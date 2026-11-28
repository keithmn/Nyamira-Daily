# Navigation inventory and proposed structure (27 Nov 2026)

Working document for the Gusii Daily navigation. It records where every sector and civic record sits today, and the proposed secondary bar. Source of the "today" column: `src/nav.js`, `src/data/topics.js`, the record files in `src/data/`, and the page files in `src/pages/`.

## Decisions this rests on

1. **Top menu (five items):** Gusii, Places, Money, Stories, About. Gusii (language, knowledge and heritage) leads, because it is the dataset the language model will be built from.
2. **Places is the spine.** Every facility, road, ward and (later) town, landmark or market is a place with an ID, a ward and a county. Language and knowledge entries link to the same place IDs, so the civic data and the cultural data share one reference.
3. **Counties are a switch, not a section.** Every county-scoped page (Places, Money, Wards, Health, Education, Farming, the county pages) carries a Nyamira / Kisii switch. The switch filters; it does not create a parallel set of pages. The reference pages `/about/nyamira/` and `/about/kisii/` stay under About.
4. **Money stays its own section.** Budgets, spending and contracts describe money, which links to wards and places rather than being one.
5. **Sectors are lenses over Places,** not separate sections.

## Sector inventory

| Sector | Records (Nyamira / Kisii) | Page today | Proposed home |
|---|---|---|---|
| Wards | 20 / 45 wards (`wards.json`, `ward-register.json`) | Places › Wards (`/ward/`) | Places › Wards |
| Roads | 90 roads, Nyamira only (`roads.json`) | Places › Roads (`/map/#roads`) | Places › Roads |
| Health | 125 / 159 facilities (`facilities.json`, `counties/kisii/facilities.json`) | Places › Health (`/map/health/`) | Places › Health |
| Education | 59 / 60 facilities | Places › Schools (`/map/education/`) | Places › Education |
| Farming and agriculture | 6 / 3 facilities; tea bonuses and farm projects | Listed under Places, but the page is `/money/farming/` | Places › Farming and markets |
| Markets | 10 / 8 facilities | None | Places › Markets |
| Water | 5 / 0 facilities | None | Places › Water |
| Worship | 25 / 21 facilities | None | Places › Worship |
| Public offices | 9 / 16 facilities | None | Places › Public offices |
| Community centres | 8 / 23 facilities | None | Places › Community centres |
| Money: budget, spending, revenue | Nyamira full history; Kisii 13 years (`counties/kisii/money.json`) | Money › Budget 2025/26, What was spent, Where it comes from, Since 2013 | Money (switch) |
| Money: contracts | Nyamira contracts; Kisii none yet | Money › Contracts | Money (switch) |
| Money: economy | Nyamira only | Money › The economy | Money (switch) |
| Leaders and seats | Nyamira full; Kisii 34 of 45 MCAs, 4 of 9 MPs | Places › Nyamira County › Who holds each seat | Places › Leaders (switch) |
| Alerts | live, empty | Places › Alerts | Places › Alerts |
| Census | Nyamira full; Kisii population and sub-counties | About › county pages | About (reference) |

## Current menu (from `src/nav.js`)

- **Gusii:** Ekegusii language, The Abagusii, Culture archive.
- **Places:** Wards (with constituencies), Roads, Health, Schools, Farming, Nyamira County (with How it is governed, Who holds each seat, Glossary), Kisii County, Alerts.
- **Money:** Budget 2025/26, What was spent, Where it comes from, Since 2013, Contracts, The economy.
- **Stories:** Explainers, Number of the week, Fact check, What's working, People, Heritage.
- **About:** Tell us, Careers and volunteering, Partner with us, Open data, Rules and legal, Ask your county, Submission helper, Budget simulator.

## Problems found

- Farming is listed under Places but its page is under Money.
- The health and schools pages are titled "in Nyamira County", which will not hold once the map covers both counties.
- Water, markets, worship, public offices and community centres have records but no page.
- Kisii appears only as a reference page under Places; no county switch exists yet.

## Proposed secondary bar under Places

Wards · Roads · Health · Education · Farming & markets · Water · Worship · Public offices · Alerts

Every item carries the Nyamira / Kisii switch. Each county-scoped page reads the county from the URL (for example `?county=kisii`) and filters its records; the default is both counties together, with each record showing its county.

## Requirement: county switch

Every county-scoped page gets a Nyamira / Kisii switch, including the Places and Money pages, the ward index, and each sector page. A county with no data for a page shows "not yet collected" for that county, never zero.

## Open items

- Confirm the switch behaviour: default to both counties, or to Nyamira until Kisii data is complete.
- Kisii ward budgets: no primary source found yet.
- Place profiles (history, people, current setup, demography, economy, social life): a research plan is needed, starting with the 65 wards.
- Rename the health and schools pages once the switch exists.
