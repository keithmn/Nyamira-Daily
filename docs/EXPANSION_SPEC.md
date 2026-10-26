# Nyamira Daily: build plan (expansion and alerts)

Two specs in one file. **Part A:** the expansion, Phases 1 to 4. **Part B:** alerts and incidents, item **1.8** of Phase 1.
Read `AGENTS.md` and everything in `docs/` before you start. Every rule in `docs/EDITORIAL_RULES.md` applies.

**Status (24 Oct 2026):** Phases 1 to 4 built (Phase 2 pages stay Planned until the reporting and sign-up channels are set); see `docs/ROADMAP.md`. Agreed changes to this spec: seven sections in the bar
(Today, Wards, Data, Take part, Stories, Government, Learn; the Constitution pages sit under Learn) and red on maps reserved for
emergencies, with red kept elsewhere for gaps in charts and for NY Watch (`docs/DECISIONS.md` #25).

**Corrections service amendment (26 Oct 2026):** The owner explicitly requested a database-backed correction review workflow. Implement only the optional Cloudflare Pages Functions + D1 service documented in `docs/CORRECTIONS_SERVICE.md`; the public site remains static. Other server/database services still need separate approval. Do not enable intake until the account, retention policy, reviewer access and monitoring owner/cadence are configured.

---

# PART A

## How to work through this spec

- **Static first.** The site stays a static Astro site. Where a feature needs a server (receiving reports, a WhatsApp bot, SMS), build only the static pages, the data files and the machine-readable outputs the service will use later. Leave a clear `TODO(service)` note. No backend, database or paid service without asking.
- **Never invent data.** If a dataset needs research you can't complete from primary sources: create the data file with its schema and no rows; add the page to `planned` in `src/config.js`; note what's missing in `docs/DATA.md`. Every row needs `source`, `url`, `page` (where applicable) and `checked`.
- **Keep it light.** One web font. No frameworks. Small vanilla JS only where a tool needs interaction. Pages work at 390 px and make sense without JavaScript wherever possible.
- **Two-layer pages.** One number, one sentence and one evidence label first; detail behind "See the detail". A Kiswahili summary (`.sw`) on new main pages, marked for native-speaker review.
- **Write in Markdown, not code.** Content collections (`src/content/`) for anything written as text, so non-developers can add entries.
- **One phase at a time.** Build, check phone and desktop in light and dark, update `docs/DATA.md`, `docs/DECISIONS.md` and `docs/ROADMAP.md`, commit, then stop and summarise.

## Navigation

Agreed: Today · Wards · Data · Take part · Stories · Government · Learn.
- **Take part:** Ask Nyamira, Is it working? (reports), Adopt a project, Submission helper, Budget simulator, Have your say.
- **Stories:** What's working, Nyamira's people, Heritage, Myth or fact, Explainers.

## Phase 1: tools that need no new research

**1.1 Ask Nyamira (`/ask/`).** Right to information (Constitution Article 35; Access to Information Act, 2016). Explainer (write to the county's information access officer, keep a copy, 21 days, complain to the Commission on Administrative Justice); a client-side request-letter builder (copy, print, WhatsApp; never submits); a public tracker from `src/data/asks.json` (`id, question, askedOf, sentOn, dueOn, status: sent|answered|partly answered|refused|no reply|appealed, answerSummary, documents[{title,url}], requester`). "Overdue" computed at build time from `dueOn`. Only requests by Nyamira Daily, or by residents who gave written consent. Starts empty.

**1.2 Submission helper (`/take-part/submission/`).** Fields: topic, ward, the problem, what you want done, name (optional). Produces a structured submission for a budget forum, a plan or a petition to the County Assembly. Copy, WhatsApp, print. Linked from `/learn/taking-part/`. No data leaves the page.

**1.3 Printable ward sheets (`/ward/[slug]/sheet/`).** One A4 page per ward: receipt, MCA, top services, FY2025/26 project lines, 2–3 questions to ask, a QR code to the ward page (inline SVG at build time), sources and date. Print CSS; must survive black-and-white photocopying.

**1.4 Machine-readable outputs.** `/api/wards.json`, `/api/ward/[slug].json`, `/api/ward/[slug].txt` (under 900 characters, for WhatsApp/SMS), `/api/money.json`, `/api/projects.json`, `/api/opportunities.json`, with licence and source fields. Document on `/data/open-data/` ("free to reuse with credit to Nyamira Daily"; OpenStreetMap-derived data is ODbL).

**1.5 Embeds (`/embed/ward/[slug]/`, `/embed/money/`).** No header or footer, for iframes; "Source: Nyamira Daily" and a link back. A "Use this on your site" block with the iframe code on ward and money pages.

**1.6 Number of the week (`/number-of-the-week/`).** One verified figure a week: 2–3 sentence explanation, source, 30-second radio script, WhatsApp share. Collection `numbers`. Latest on the home page.

**1.7 Content collections (scaffolding plus one example each).** `explainers` (title, summary, topic, sources[], updated, swSummary, readingLevel); `factchecks` at `/fact-check/` (claim, claimSource — never link private individuals — rating: true | mostly true | misleading | false | unproven, summary, evidence[], checkedOn; check claims about every side equally); `stories` at `/whats-working/` (title, ward, sector, evidence[], photos[] with credit and consent, date, evidenceLabel); `people` at `/people/` (name, role, ward, story, photo, consentOn; never politicians or officials; never without recorded consent); `heritage` (title, place, ward, story, sources, photos, contributor). Each with list and entry pages and in the search index. Also Planned pages: `/diaspora/`, `/schools-programme/`, `/fellowship/`, `/state-of-nyamira/`.

## Phase 2: community reporting front ends

Nothing is published until our team has checked it; the site shows only reviewed, aggregated results.

**2.1 Is it working? (`/report/`).** Water points, dispensaries, streetlights, roads and bridges, market facilities. Form: category, ward, place, status (working / partly / not working / closed), note, optional photo. Submitting opens WhatsApp with a structured message if `contact.whatsapp` is set, otherwise links to `reportFormUrl` (e.g. KoboToolbox). `TODO(service)` for receiving reports. Shows `src/data/reports.json` (`id, category, ward, place, status, reportedOn, checkedOn, checkedBy, evidenceLabel: unverified|verified, photo, note`) as summaries on ward pages and a county view. Services, never people; latest status per place; over 90 days shows "may be out of date".

**2.2 Clinic check.** Same form with medicines available, staff on duty, open at stated hours, waiting time; aggregated per facility, labelled as community reports.

**2.3 Adopt a project (`/adopt/`).** Volunteers or school clubs follow one project (sign-up link from config). Collection `projectlogs` (projectId, date, photo, note, observer, consent); photo timelines on project pages. Stable project IDs in `wardspend.json`, matched across years; rules in `docs/DATA.md`.

## Phase 3: new datasets (primary sources first)

For each: find the primary source, save it under `data-src/` where licences allow, a build script under `scripts/` if needed, document in `docs/DATA.md`; if unreachable, scaffold and mark Planned.

- **3.1 How Nyamira compares (`/data/compare/`):** Controller of Budget figures for neighbours (e.g. Kisii, Bomet, Kericho, Homa Bay, Migori) and the national average: spending per person (2019 census), development absorption, own-source revenue collection rate, development share. No league table.
- **3.2 Then and now (`/data/then-and-now/`):** timeline and before/after indicators from held or newly sourced data, each with its evidence label.
- **3.3 Elections (`/data/elections/`):** IEBC results 2013, 2017, 2022 by ward for all seats, registered voters and turnout, polling-station finder. Strictly factual; every candidate as recorded; IEBC forms and Kenya Gazette.
- **3.4 Tea and milk (`/data/tea-milk/`):** KTDA monthly rates and bonuses for factories serving Nyamira; dairy cooperative prices where published. Date and source each; never average across sources.
- **3.5 Health outcomes (`/data/health/`):** KHIS indicators by facility where public; scaffold if login needed.
- **3.6 Schools (`/data/schools/`):** KCSE/KPSEA summaries from KNEC or the Ministry; counts and enrolment; no rankings; per-school results only where officially published.
- **3.7 Village level:** 2019 census Volume II sub-location populations ("Find your sub-location"), clearly labelled as national units that do not match wards.

## Phase 4: interactive tools

- **4.1 Budget simulator (`/tools/budget-simulator/`):** sector totals from the latest Programme Based Budget in `src/data/budget-sectors.json` (source and page each); wage bill fixed with an explanation; steppers that must balance; plain-words trade-offs (estimates labelled); compare with the actual budget; WhatsApp share; link to the submission helper. Small vanilla JS, keyboard accessible.
- **4.2 What KSh 1 billion could build (`/tools/what-it-builds/`):** unit costs from Nyamira's own records in `src/data/unit-costs.json` (source, year, project ID), ranges not single numbers, always labelled "Estimate: based on past county contract sums".

## Not for Claude Code (Keith)

WhatsApp Business number and bot; SMS/USSD; KoboToolbox/ODK and the verification team; partnerships (radio, KTDA, cooperatives, health records, schools); volunteers and printing ward sheets; Ekegusii and Kiswahili review; consent forms; filing information requests; fellowship, schools programme and the State of Nyamira report; diaspora outreach, governance and funding.

---

# PART B: Alerts and incidents (item 1.8)

A calm record of major events affecting residents: **emergencies** (fires, floods, landslides, disease outbreaks), **disruptions** (road closures, power or water outages, health service strikes) and **public notices** (vaccination drives, county notices, weather advisories). Pings on the maps; every past event stays in an archive. Not breaking news: publish what is confirmed, say where it came from, update until resolved.

**Data:** one Markdown file per event in `src/content/alerts/` (`id, type, level, title, summary, wards[], place, lat, lon, startedAt, updatedAt, status: active|monitoring|resolved, resolvedAt, evidenceLabel: verified|official|unverified, sources[], advice, contacts[], swSummary`; body = dated update log, newest first).

| Level | Colour | Shape | Types |
|---|---|---|---|
| Emergency | Red | Triangle, pulsing while active | fire, flood, landslide, building collapse, disease outbreak, major accident, storm or hail damage |
| Disruption | Amber | Square | road closure, bridge out, power outage, water outage, health facility closure, service strike |
| Notice | Blue | Circle | vaccination or health campaign, county notice, weather advisory, public forum, exam period |

Shapes as well as colours. Red on the map means emergency only (health dots changed from red). Tokens `--alert-emergency`, `--alert-disruption`, `--alert-notice` with light and dark values. Pulsing stops under reduced motion.

**Where alerts appear:** a red banner under the header on every page for active emergencies (newest plus "+N more", dismissible per alert in the browser); disruptions banner only on affected ward pages and `/alerts/`; `/alerts/` (counts by level, county map, list, filters that work without JavaScript, archive by year with counts); map pings at lat/lon via the projection exported from `scripts/build-geo.py`, at the ward centre with a dashed outline when approximate, county-wide alerts in a box beside the map; ward pages and the ward receipt ("Active alerts"), and the Your-ward panel on Today; each alert's page with summary, status, evidence label, advice, contacts, update log, sources, mini map, WhatsApp share and Open Graph tags; `/api/alerts.json`, `/api/alerts/active.json`, `/api/alerts/active.txt` (`TODO(service)` broadcast) and `/alerts/rss.xml`.

**Keeping it current:** hosting rebuilds on every commit (add a file, commit, push: live in about a minute); later a simple editing screen (e.g. Decap CMS). Active alerts not updated for 72 hours show "Not updated recently: check the source" (at build and in the browser). Status: active → monitoring → resolved; resolved alerts leave the banner and map but stay in the archive.

**Editorial rules:** see `docs/EDITORIAL_RULES.md` section 11.

**Not for Claude Code (Keith):** who posts and verifies alerts (a duty roster); the contact list of official sources; WhatsApp Channel or SMS broadcasts; radio agreements; confirming emergency numbers before they go live.
