# Sitemap: Kenya Budget Explained

**Status: approved by the owner, 2 Nov 2026 (decision #89).** The plan behind it is [`national-budget/BUILD_BRIEF.md`](../../national-budget/BUILD_BRIEF.md). "Kenya Budget Explained" is a working name, held in one constant, `site.name`.

## What was approved

1. Five sections, the same on phone and desktop: **Budget, Counties, Track, Learn, Data**.
2. The route list below: about 1,700 English pages at full depth, and a Kiswahili twin of each.
3. The nine changes to the spec listed under [Changes to the spec](#changes-to-the-spec).

## How it is organised

- **Two depths.** Every page answers one question for a citizen on the first screen. The analyst's detail is one tap deeper, on the same page or the next level down.
- **One question per page.** Each route below names its question and what leads the first screen.
- **Your county follows you.** Pick it once and every list highlights it. No account, no cookie, nothing sent anywhere: the choice stays in the reader's browser.

### Navigation

| Section | What is in it |
|---|---|
| **Budget** | The year, sectors, votes, programmes, revenue, debt, budget day |
| **Counties** | All 47, each county, compare, State of the Counties |
| **Track** | Money released this year, national projects, hearings and how to have your say |
| **Learn** | Explainers and reports, infographics, glossary, calendar, your taxes |
| **Data** | Downloads, API, data releases, methods, corrections |

Phones get a bottom tab bar with these five. Desktop gets them in the top bar. Both have a search button and a "My county" chip. Pages deeper than one level have breadcrumbs. The footer repeats the map and links corrections, who runs us, privacy and terms.

## Routes

`[fy]` is written `2026-27`. **Data** says how close each route is to being buildable today:

- **Ready:** in hand and checked.
- **Downloaded:** the PDF is in hand, but it is not loaded.
- **Located:** we know where it is published, but have not fetched it.
- **To find:** publication not confirmed.

### Home

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/` | Where is the budget now, and what matters this month? | Stage strip, KSh 4.82 trillion, My county card. Then this month's update, next hearing, data-area cards, search, three explainers, three infographics, sector cards | First screen Ready. "This month" and hearings To find |

### Budget

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/budget/` | Which year do you want? | Goes straight to the current year | Ready |
| `/budget/[fy]/` | What is the whole budget for one year? | Total, interest and its share of revenue, the two KSh 100 notes | FY2026/27 Ready. Earlier years To find |
| `/budget/[fy]/sectors/` | How do the ten sectors compare? | Largest sector, ranked bars | FY2026/27 Ready |
| `/budget/[fy]/sectors/[sector]/` | What does this sector get, and how does it compare with last year? | Amount, change on last year, its votes | Amounts Ready. Votes and last year need the map below |
| `/budget/[fy]/votes/[vote]/` | What does this ministry, department or agency get? | Amount, change, programmes | Appropriation Act Downloaded |
| `/budget/[fy]/votes/[vote]/[programme]/` | What will this programme spend and deliver? | Amount, targets ("what they promised") | Programme level Downloaded. Sub-programmes and targets Located (Estimates volumes on parliament.go.ke) |
| `/revenue/` | Where does the money come from, and is it on target? | Tax heads over five years | FY2026/27 Ready. Monthly To find |
| `/debt/` | How much is owed, and what does it cost? | Interest, share of revenue, stock | Interest Ready. Stock To find |
| `/budget-day/[fy]/` | What changed today? | What moved from the estimates, risers and fallers | Built for June 2027 |

### Counties

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/counties/` | How do the 47 counties compare? | Your county in the list, sortable by any measure | Equitable share Ready. Other measures Located |
| `/counties/[county]/` | What does my county get, and what did it do with it? | Equitable share (law), change on last year, last year's development spending, Share button | Share Ready for 47. Spending Ready for 6, Located for 41 |
| `/counties/[county]/sheet/` | One A4 page for a town hall or radio script | Five key numbers, two questions, hearing date, QR code | As the county page |
| `/counties/compare/?c=nyamira,kisii` | How do these counties compare? | Two to four counties side by side; the choice lives in the link | As the county page |
| `/counties/state/[edition]/` | How do counties compare on each published measure? | One ranked measure at a time, method beside it, no overall score (#84) | First edition held until after 24 Aug 2027 unless the owner decides otherwise |
| `/embed/county/[county]/` | A small card for news sites | Equitable share with its source | Ready |

### Track

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/track/` | How much has actually moved this year? | Revenue against target, Exchequer releases, county releases against the schedule, each with an "as of" date | To find |
| `/projects/` | Which national projects are funded, and what should I ask? | Projects near you, questions from dated documents | To find (Development Estimates) |
| `/have-your-say/` | When can I be heard, and how? | Next hearing with a countdown in days, or "None announced" | To find (official notices only, #29) |

### Learn

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/learn/` and `/learn/[slug]/` | How does this work? | Ten five-minute explainers, plus longer reports | Two drafts exist in the main site |
| `/learn/glossary/` | What does this word mean? | Every interface term, with its Kiswahili | Main-site glossary to extend |
| `/learn/calendar/` | What happens next in the budget year? | Next dated stage, with its legal source | PFM Act dates to check one by one |
| `/infographics/` and `/infographics/[slug]/` | One shareable picture per topic | The budget in 10 numbers, KSh 100, debt, each sector, each county | Follows the data |
| `/tools/your-taxes/` | Where does my tax go? | Your amount split by spending shares, with the caveat | Ready for version 1 |

### Data and trust

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/data/` | What can I download? | Every table as CSV and JSON, CC BY 4.0, citation | Follows the data |
| `/data/releases/` and `/data/releases/[date]/` | What changed, and when? | Dated changelog of figures added, changed, removed | Starts at launch |
| `/api/national/figures.json`, `/votes/[vote].json`, `/counties/[county].json` | Machine-readable figures | Same envelope as `lib/api.js` | Follows the data |
| `/methods/` | How do you work out your numbers? | Every derived measure, with its formula | With the data engine |
| `/corrections/` | What did you get wrong? | Old value, new value, reason, date | Starts at launch |
| `/search/` | Find a budget, county or explainer | Results by type. Understands TSC, HELB, KeNHA, KURA, SHA, KMTC and Kiswahili terms | Follows the data |
| `/about/`, `/who-runs-us/`, `/privacy/`, `/terms/`, `/right-of-reply/` | Who is behind this? | Publisher wording from decision #73 | Legal wording awaits the lawyer |
| `/sw/…` | The same page in Kiswahili | Every route has a twin under `/sw/`, with the same slugs and `hreflang` tags | Interface dictionary, native-speaker review |

Also: a 404 page, and `/dev/components/`, which is left out of production builds.

## URL rules

- **Counties:** `baringo`, `bomet`, `bungoma`, `busia`, `elgeyo-marakwet`, `embu`, `garissa`, `homa-bay`, `isiolo`, `kajiado`, `kakamega`, `kericho`, `kiambu`, `kilifi`, `kirinyaga`, `kisii`, `kisumu`, `kitui`, `kwale`, `laikipia`, `lamu`, `machakos`, `makueni`, `mandera`, `marsabit`, `meru`, `migori`, `mombasa`, `muranga`, `nairobi-city`, `nakuru`, `nandi`, `narok`, `nyamira`, `nyandarua`, `nyeri`, `samburu`, `siaya`, `taita-taveta`, `tana-river`, `tharaka-nithi`, `trans-nzoia`, `turkana`, `uasin-gishu`, `vihiga`, `wajir`, `west-pokot`.
- **Sectors:** `education`, `energy-infrastructure-ict`, `public-administration-international-relations`, `governance-justice-law-order`, `national-security`, `health`, `environment-water-natural-resources`, `agriculture-rural-urban-development`, `social-protection-culture-recreation`, `general-economics-commercial-affairs`.
- **Votes and programmes** use their printed codes, for example `/votes/1066/` and `/votes/1066/0502000/`. A vote's recurrent (R1066) and development (D1066) money share one page.
- Routes work under any domain or prefix, so a rename or move changes one setting.

## The five usability tasks, walked through

The spec's test of "usable", on a 390px phone:

| Task | Limit | Path | Taps |
|---|---|---|---|
| Find your county's share and last year's development spending | 3 taps, 30 s | Home, pick county. Both are on the My county card, on the first screen (see the specimen) | 1 to 2 |
| Find the interest bill and its share of revenue | 20 s | Budget tab. It is on the first screen of the year page | 1 |
| Find a sector, compare with last year, download the table | 60 s | Budget tab, sector list, Health, then "Show as a table" and the CSV link | 3 to 4 |
| Copy a question for your MP and see the next hearing | 30 s | Counties tab, your county, Questions to ask. The next hearing sits beside them | 2 to 3 |
| Share a county card to WhatsApp | 20 s | The Share button is on the county page's first screen | 2 to 3 |

## How many pages

| Page type | Count |
|---|---|
| Year pages | 5 |
| Sector pages, 12 per year (see change 10) | 60 |
| Vote pages, 87 per year (Appropriation Act 2026) | about 435 |
| Programme pages, 201 per year (same Act; 329 rows once recurrent and development are split) | about 1,005 |
| County pages, sheets and embeds | 141 |
| Infographics (10 numbers, KSh 100, debt, 10 sectors, 47 counties) | about 60 |
| Learn, Data, Track, trust and the rest | about 40 |
| **English total** | **about 1,700** |
| Kiswahili twins (no sheets or embeds) | about 1,600 |

That is within Cloudflare Pages' file limit, and close to the 2,817 pages the main site builds in about a minute. Pages for a year are generated only when its data is loaded.

## Where the BudgIT patterns went

We take the page types, not the look or wording, and never suggest a connection.

| Their pattern | Ours |
|---|---|
| Federal budget dashboard | `/budget/` explorer |
| State data portal | `/counties/` |
| State of States | `/counties/state/[edition]/`, one measure at a time |
| Tracka | `/projects/` |
| Personalised data | My county, without an account |
| Infographics, Publications | `/infographics/`, `/learn/` |
| Focus areas | Sector cards on the home page |
| Updates | "This month" and `/data/releases/` |

**Left out on purpose:** impact counters, testimonials, partner logos, Donate, and the AI chat. These need real evidence, or are barred by the spec. The subscribe block stays hidden until a real WhatsApp channel or email list exists (decision #12).

## Changes to the spec

1. **New route** `/counties/state/[edition]/`. The spec describes the page but gives it no route.
2. **New routes** `/search/`, `/privacy/`, `/terms/`, `/right-of-reply/` and a 404 page, which an app on its own domain needs. `/sw/` is the route for the Kiswahili interface in decision #87.
3. **Nav placement.** `/projects/` and `/have-your-say/` sit under Track. `/revenue/`, `/debt/` and `/budget-day/` sit under Budget. `/infographics/` and `/tools/your-taxes/` sit under Learn.
4. **Share at the top of county pages.** Decision #11 puts Share at the foot of a page. Task 5 needs it on the first screen, so county and infographic pages are an exception, logged as a new decision.
5. **A new stage, `law`.** The spec's stage list has `approved` for the Appropriation Act, but nothing for the county Act. The county page needs "law".
6. **No empty pages.** A page exists only when its data does. `NotYetLoaded` is for one figure inside a page, in line with decision #9.
7. **Two reviewed data files**, because the documents do not supply them: which votes make up each sector, and how votes map across years when ministries are reorganised. Neither can be scripted, so a person checks them. The five-year trend depends on the second.
8. **The Astro 7 upgrade comes first** in the next phase, before the data engine, because the registry's Zod version comes with Astro (decision #85).
9. **Phases are renumbered** as in decision #82: 2 data engine, 3 app shell, 4 core journeys, 5 depth, 6 reach, 7 hardening.
10. **Twelve sector groups,** added after approval (decision #93). The Budget Explainer lists Parliament and the Judiciary apart from the ten sectors, so they have pages of their own: `parliament` and `judiciary`.

## Risks to plan around

- **County history is the biggest data job.** FY2013/14 to the latest year for 47 counties is about 3,400 numbers (12 years, 6 measures), each entered twice.
- **Five years of vote and programme pages depend on the reorganisation map** in change 7. If it slips, launch with FY2026/27 and add earlier years as they are checked.
- **Monthly figures decide whether Track and "This month" can exist.** Their current publication is unconfirmed. If they cannot be found, those blocks stay out and the home page leads with the newest document instead.
- **The Kiswahili interface needs a native-speaker reviewer** before launch (decision #87).
