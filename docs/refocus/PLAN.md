# Plan: refocus Gusii Daily on the map and the money

**Status: approved by the owner, 16 Nov 2026 (decision #110).** The nine decisions below stand as recommended. The archive tag `archive/pre-refocus-2026-11` marks `main` before any change.

## Why

The owner's direction, 16 Nov 2026: the site has grown past its purpose. It has 2,939 pages in eight sections, 146 colours, a second product inside the repo, and a government directory, while the core goal (the condition of every facility) has 247 listings, none checked on site and none with a condition or status.

Gusii Daily is now **a local, ultra-modern data journalism tool** with two goals:

1. **The map.** Every facility in every location in Nyamira County: what it is, its condition, its status, and what services it delivers.
2. **The money.** Public money (the county budget, and the government's responsibility for it) and the private economy (what Nyamira earns in each sector, and how money circulates). Gathered from documents, research and field collection.

Everything else is non-partisan community building. Government appears only where the budget does.

**YouTube comes first.** There is no big launch. The site grows behind the videos: explainers on the money, facility visits, revisits and update videos. Each video links to the page holding its figures. A community radio may follow. Digitising Ekegusii (training language models) is a separate initiative, kept off this site for now.

**One name: Gusii Daily.** The site, the channel and every show use it. The NY Watch name and logo are retired.

## The site after the refocus

Five menu items, down from eight sections and about 60 menu entries:

| Section | What it holds |
|---|---|
| **Map** | The county map, the 20 ward pages, and one page per place: health facilities, schools, markets, water points, roads, offices and county projects |
| **Money** | The county budget (the registry built in #105 to #109), revenue, spending to date, history, audit findings, contracts in one table, what the Assembly passed on money, fees, the budget calendar, and a new part: the Nyamira economy |
| **Watch** | One page per video, with the video, its figures and its sources |
| **Administration** | One page: who holds each county seat now, for information. No profiles |
| **About** | Who runs us, how we work, evidence labels, corrections, right of reply, privacy, terms |

### The place page (the heart of the map)

One kind of record replaces three (facilities, projects, roads). A county project is a place being built; a road is a place you travel on.

Each place page shows, on its first screen:

- what it is, its ward, and who owns it (county, national, faith, private, community)
- **status:** open, closed, under construction, stalled, or not yet checked
- **condition:** good, fair, poor, or not yet checked
- **services:** what it offers, as last seen
- when it was last checked, how, and the evidence label
- **Who is responsible:** the office in charge under the Constitution's Fourth Schedule (an office, never a person)
- **What you can do:** report its condition; the budget hearing where its money is decided; the fee that funds it, where one applies

Below that is its history: every visit and report, in order, and the videos made there.

### The Nyamira economy (new)

How much money comes into Nyamira, from where, and where it goes:

- **In:** the county's equitable share and other transfers; national money spent in the county (NG-CDF, national agencies' contracts); tea and dairy payouts; remittances; trade.
- **Through:** the county budget; markets; wages.
- **Out:** county spending; goods bought from outside the county.

Possible sources include the KNBS Gross County Product report (output by sector), the tea and milk figures already in `src/data/teamilk.json`, NG-CDF, county own-source revenue, and our own market and price surveys. Every figure keeps its source, date and evidence label. National money is never added to county figures (AGENTS.md). Where no figure exists, the page says so.

## Two kinds of database

### Static: facts that do not change

A published document says what it says. The FY2025/26 budget, the 2019 census, the ward boundaries and an Act the Assembly passed will not change. When a new edition comes out (the FY2026/27 budget, the 2029 census), it is **added beside** the old one, never written over it.

- **Where it lives:** JSON and CSV in Git, as today. Changed by reviewed commits.
- **What it holds:** the money registry (`data/county/nyamira/`), census, boundaries and towns, audit reports, contracts awarded, NG-CDF allocations, fees by Finance Act, the Fourth Schedule, unit costs, ward budget lines, tea and milk payouts by year, official facility lists, Acts passed.

### Living: things that change

A dispensary can close this month and reopen next year. A road can be graded and then wash out. The budget moves from proposal to approved to spent. A bill moves through the Assembly. A seat changes hands.

Living records are **never overwritten. Each change is a new dated event**, and the current state is the latest event that has been reviewed:

| Field | Meaning |
|---|---|
| `place` | the place it is about (or the seat, the bill, the budget year) |
| `field` | what changed: `status`, `condition`, `service:<name>`, `stage`, `holder` |
| `value` | the new value |
| `observed_on` | the date it was seen or published |
| `method` | `visit`, `resident-report`, `document` |
| `source` | the form, document or link |
| `evidence` | the evidence label |
| `reviewed_by` | the person who accepted it |
| `video` | the video made from it, if any |

- **What it holds:** place status, condition and services; visits; project progress; the current budget year's stage and spending to date; bills in progress; who holds each seat; corrections.
- **Where it is collected:**
  - **KoboToolbox** for field visits. It works offline on a cheap phone and records GPS and photos. Forms: place visit, road check, market prices.
  - **Google Sheets** for desk updates: seats, bills, the budget stage, the video log.
  - A custom collection site may follow if these fall short.
- **How it reaches the site:** a sync script pulls the reviewed rows from Kobo and Sheets and writes `data/living/*.json`, which is committed so Git keeps the full history. The site builds from that as it does today. The Cloudflare D1 database (`migrations/`) is used only for public intake, meaning residents' reports and corrections, which are reviewed into the sheet. Its observation and road tables are merged into one.
- **Privacy:** field forms must not publish anyone's name or phone number. Personal details stay in Kobo, and the export to the site drops them.

### The changes list: where update videos come from

Because every living change is a dated event, the build can list **what changed since a given date**: places that changed status, revisits due, a new budget, a bill passed. That list is the editorial queue for update videos ("we came back six months later"). The Watch page for each video links the events it covers, and each place page links its videos.

**One trip, two outputs:** a field visit to film a video is also the check that updates the place.

## What happens to each part of today's site

Nothing is lost. Before anything is deleted, the current `main` is tagged `archive/pre-refocus-2026-11`. Every removed URL gets a redirect to its closest new page.

| Today | After |
|---|---|
| Home | Map hero, one money band, the latest video, "Report a place" |
| `/ward/`, `/ward/<slug>/` | **Keep** under Map. The ward page gains its places with status, the ward's budget lines, and one line naming its MCA (linking to Administration) |
| `/facility/<id>/`, `/projects/<id>/`, `/road/<id>/` | **Merge** into `/place/<id>/` |
| `/maps/` | **Becomes** `/map/` |
| `/data/money/**` | **Keep**, moved to `/money/**` |
| `/tracker/**` (1,962 pages) | **One page,** `/money/contracts/`, searchable, with a CSV. County and national contracts are labelled and never summed together. No per-contractor pages |
| `/data/health/`, `/data/education/` | **Become** Map filters (place types), with their sourced headline figures |
| `/data/farming/` | **Moves** to the Nyamira economy |
| `/data/open-data/` | **Moves** to About (downloads) |
| `/constituency/<slug>/` | **Cut.** NG-CDF figures move to the Nyamira economy as national money |
| `/government/**` (12 pages) | **Cut**, apart from `/administration/`: seat, name, since and source, from `leaders.json`. No party, photos or profiles. Budget votes and money Acts move to Money. Election results are cut |
| `/constitution/**` (32 pages) | **One page:** what the county must do (Fourth Schedule), linked from every place's "Who is responsible" |
| `/learn/**` | Budget calendar and fees **move** to Money; the glossary **moves** to About; the rest is cut |
| Explainers, fact-checks, number of the week, news, show, NY Watch | **Merge** into one `videos` collection at `/watch/` |
| `/community/**`, people, heritage, clans, knowledge, what's working | **Cut.** Census figures stay as context on ward pages. Heritage and knowledge go to the Ekegusii initiative |
| `/report/` | **Becomes** "Report a place", feeding the intake |
| Alerts, opportunities, Take part, Ask, Adopt, submission helper, simulator, What could it build, Have your say, diaspora, fellowship, schools programme, State of Nyamira, impact log, subscribe, tell us | **Cut** |
| About, Who runs us, How we work | **Merge** into `/about/`. Right of reply, privacy and terms stay separate |
| `/review/**`, search, 404 | **Keep** |
| Embeds; APIs for alerts, opportunities, projects, facts | **Cut.** Keep the places, wards and money APIs |
| `apps/national` (Kenya Budget Explained) | **Moves to its own repository** (below) |

Estimated size afterwards: about 850 pages (about 690 places, 110 money pages, 20 wards and about 30 others), down from 2,939, plus one page per video.

## Colours: Signal Green and charcoal only

| Role | Colour |
|---|---|
| Brand, data, map highlight, buttons | Signal Green `#1FD07A`, with a deep green `#1C5E3C` and a soft tint `#E2F8EC` |
| Text, header, map and dark bands | Charcoal `#2A2A28`, taken from the map's wards |
| Lines and secondary text | Charcoal steps `#595957`, `#8A8A85`, `#DCDCD7` |
| Reading surface | White and paper `#F5F5F3` |

- **One theme.** Pages are light, with charcoal headers, the map and charcoal bands. Dark mode and its toggle go. Full-charcoal pages are hard to read in sunlight on a cheap phone.
- **Removed:** Record Red, the eight Highlands colours, the twelve section tones, the NY Watch purple and the coloured illustrations.
- **Evidence labels** stop using colour to tell them apart. Each has its word plus a shape: verified is green filled, official is a charcoal outline, audit is charcoal filled, unverified is a dashed outline.
- **Gaps in charts** (money not spent, work at 0%) become hatched charcoal instead of red.
- **Green is never text on white** (contrast); text is charcoal. Green on charcoal is fine.
- **The logo.** The header uses the two-block wordmark (a green "NYAMIRA" block and an outlined "DAILY" block), the layout `BRAND_BRIEF.md` says to avoid. Recommendation: the avocado pin with a one-line wordmark. Logo files are never recoloured by hand (AGENTS.md), so a new lockup comes from the brand kit. The kit's ink is `#111111`, which sits beside charcoal without clashing.

`AGENTS.md`, `BRAND_BRIEF.md` and the colour rules in decisions #21, #24, #25, #30, #56 and #61 are updated to match. Superseded decisions are marked, not deleted.

## Kenya Budget Explained gets its own repository

- `apps/national`, `data/national`, `data-src/national`, `scripts/national`, `docs/national` and `national-budget/` move to a new repository, keeping their Git history.
- `packages/engine` is used by both. It becomes a versioned package that both repositories install, so it is never copied (AGENTS.md).
- Gusii Daily reads the national figures it needs (Nyamira's equitable share and Controller of Budget totals) from the national product's published data release, instead of from a folder in this repository.

## Phases

**Amended 16 Nov 2026 (R2):** R2 is built in two steps. R2a cuts pages, sets the five-item menu and adds the redirects; R2b moves the existing money pages to `/money/` and the map pages to `/map/`. The move happens in R2, not R5, because the budget calendar and fees join Money now. R5 adds the economy section and the contracts table.

Each phase is its own branch, checked, and approved before the next starts.

| Phase | What | Done when |
|---|---|---|
| **R0** | This plan approved; archive tag on `main` | Tag exists |
| **R1 Look** | Green and charcoal tokens, one theme, new evidence labels and chart gaps, logo usage | No colour outside the tokens; contrast passes; 390px and 1280px checked |
| **R2 Structure** | The five-item menu; cut pages, components and data removed; redirects for every old URL | Build passes; 0 broken internal links; every removed URL redirects |
| **R3 Places** | One place model from facilities, projects and roads; place pages; ward pages read it | Every old facility, project and road id resolves to a place |
| **R4 Living** | Kobo forms, Sheets, the sync script, `data/living/`, the changes list; D1 for intake only | A test visit in Kobo appears on its place page after a build |
| **R5 Money** | `/money/`, contracts table, money Acts, the Nyamira economy (research first, then pages) | Every economy figure has a source, date and label |
| **R6 Watch** | The `videos` collection; existing episodes, explainers and the number of the week moved in | Each video page links its figures, and its places link back |
| **R7 Split** | Kenya Budget Explained in its own repository; `@kbe/engine` as a package | Both repositories build; the money figures are unchanged |

R7 does not depend on R1 to R6 and can run beside them.

## To approve

| # | Decision | Recommendation |
|---|---|---|
| 1 | Menu | Map · Money · Watch · Administration · About |
| 2 | Addresses | `/map/`, `/place/<id>/`, `/money/`, `/watch/`, `/administration/`, with redirects from the old URLs |
| 3 | Administration | Seat, name, since, source. No party, photos or profiles. Ward pages name the MCA in one line |
| 4 | One name | Gusii Daily everywhere; NY Watch retired |
| 5 | Theme | Light pages with charcoal bands; dark mode dropped |
| 6 | Living data | Kobo for the field, Sheets for the desk, snapshots committed to Git; D1 for public intake only |
| 7 | Contracts | One table of all public contracts in Nyamira, county and national labelled apart |
| 8 | Languages | Keep the short Kiswahili summaries; Ekegusii work stays off the site for now |
| 9 | Deleting | Cut pages, data and components are deleted from `main` after the archive tag (R2) |
