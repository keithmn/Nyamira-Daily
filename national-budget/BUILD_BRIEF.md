# Build brief: from prototype to a usable national budget tool

For the assistant working in VS Code (Claude Code or Codex) and for any developer. Written 1 Nov 2026 by the founder's strategy session. Read `AGENTS.md`, `docs/STATUS.md`, `docs/DECISIONS.md`, `national-budget/HANDOFF.md` and `national-budget/VERIFICATION.md` first.

## 0. Where we start, and the goal

**Already built (the skeleton):**
- `national-budget/`: a one-page prototype with seven chapters: KSh 100, debt, sectors, counties, Treasury to ward, calendar, rules.
- Node build scripts (`build-data.mjs`, `assemble.mjs`), with a test that `data.json` can be rebuilt from its sources.
- `VERIFICATION.md`: every national figure checked against its PDF page.

**Already in the Nyamira Daily site, to reuse rather than rebuild:**
- Components: `EvidenceLabel`, `charts/*` (ChartFrame, ColumnChart, LineChart, ShareBars), `viz/*` (Coins, HBars, Pictos, SplitBar), `EmbedCode`/`EmbedFoot` with `pages/embed/*`, `CorrectionLog`, `Sources`, `StaleScript`, `MyWard`, `DocTools`/`PageTools`, `PageHead`, `SectionTabs`, `Toggle`.
- `layouts/Sheet.astro`, the printable ward sheet. `qrcode` is already a dependency.
- `pages/tools/budget-simulator.astro`, `learn/budget-calendar`, `learn/glossary` and `search-index.json.js`.
- `/api/*.json`, `lib/facts.js` and the share-card script `scripts/build-share-cards.mjs`.
- The corrections service in `functions/` (Turnstile, D1) and the project tracker with its question rules in `lib/road-questions.js`.

**The goal.** Turn the explainer into a tool people return to. Each audience must be able to finish its job quickly, on a cheap phone, and trust every number. BudgIT is the bar for depth and reach. Take its page types and its editorial approach (big, simple numbers for citizens, full datasets for analysts, a project tracker, rankings of the states, a library of shareable infographics). Do not copy its logo, colours, wording or layouts, and never suggest we are connected to it.

**The test of "usable".** In a usability session (section 9), five first-time users on a 390px phone each complete the tasks below unaided, each within the time limit given:
1. Find their county's equitable share for this year and how much of last year's development budget it spent (3 taps, 30 seconds).
2. Find how much the national government will pay in interest this year and what share of revenue that is (20 seconds).
3. Find their sector of interest (say health), see this year against last year, and download the table (60 seconds).
4. Copy a question for their MP and see the date of the next public hearing (30 seconds).
5. Share a county card to WhatsApp (20 seconds).

## 1. Who it serves, and what each needs

| Audience | Their job | What the tool must give them |
|---|---|---|
| Citizen (phone, costly data, English or Kiswahili) | "What does my county get, what did it do with it, and what can I ask?" | A county page with the answer on the first screen; one share card; one question to copy; the next hearing date |
| Journalist (budget day, deadline) | "What changed, who gained and who lost, and are the numbers right?" | A "what changed" table and biggest risers and fallers by vote and sector; chart embeds; CSVs; a copyable citation for each figure |
| Analyst at a civil society group (CSO) | "Programme-level money and targets over five years; spending against budget" | Drill-down from sector to vote to programme; time series; stage comparison; CSV, JSON and API with permalinks |
| MP, MCA or committee staff | "How does my county or committee area compare?" | County comparison, fiscal-rule checks, pending bills, audit opinions |
| Teacher, student, first-time reader | "How does the budget work?" | Five-minute explainers, a glossary with Kiswahili terms, the calendar |

Design every page for the citizen first and the analyst one tap deeper. This is the two-layer rule from AGENTS.md, applied to a whole product.

## 2. Decisions to settle before building (ask the founder; log each in DECISIONS.md)

1. **Where it lives.** The options:
   - (a) A `/budget/` section inside the Nyamira Daily site.
   - (b) A second Astro app in the same repo, using npm workspaces: `packages/engine` holds the shared lib, components, figure schema and charts; `apps/nyamira-daily` and `apps/national` sit beside it.
   - (c) A separate repo.

   Recommend (b), done in stages: create `packages/engine` and move shared code only when both apps need it. The national product will become the umbrella brand, so it needs its own domain and identity, while the engine stays shared. Write out the trade-offs, wait for a yes, and keep the routes below working under any prefix.
2. **Name.** Keep "Kenya Budget Explained" behind one constant, `site.name`, so a rename touches one file.
3. **Years covered at launch.** Recommend FY2022/23 to FY2026/27 for national votes, and FY2013/14 to the latest year for counties, using the Controller of Budget (CoB) reports.
4. **Kiswahili scope at launch.** Recommend a full Kiswahili interface plus a Kiswahili summary on every page. Full Kiswahili pages come later for the top 10 pages.

## 3. Information architecture and routes

Every route answers one question; it is listed after the arrow. `[fy]` is written like `2026-27`.

- `/` → "Where is the budget now, and what matters this month?" Current stage strip, the headline number, three tiles, "your county" (remembered), this month's update, the next hearing, and the latest explainers and infographics.
- `/budget/[fy]/` → "The whole budget for one year." KSh 100 in and out, what changed from last year, debt summary, links into sectors.
- `/budget/[fy]/sectors/[sector]/` → the ten Medium-Term Expenditure Framework (MTEF) sectors, each with its votes.
- `/budget/[fy]/votes/[vote]/` → a ministry, department or agency (MDA) page: programmes, economic classification, five-year trend, performance targets.
- `/budget/[fy]/votes/[vote]/[programme]/` → sub-programmes, targets ("what they promised to deliver") and, where published, results.
- `/revenue/` → tax heads over five years and monthly collections against target.
- `/debt/` → stock, interest, repayments, domestic against external, share of revenue, and the debt documents.
- `/track/` → the monthly tracker: revenue against target, money released from the Exchequer to each ministry, and equitable-share releases to each county against the legal schedule.
- `/counties/` → all 47 counties: list, map, fiscal-rules check, entry to compare.
- `/counties/[county]/` → the county page (section 5.3).
- `/counties/compare/?c=nyamira,kisii` → two to four counties side by side.
- `/projects/` → national development projects from the Development Estimates, with "questions to ask" (section 5.7).
- `/budget-day/[fy]/` → press kit and live "what changed"; kept afterwards as an archive.
- `/have-your-say/` → hearings calendar, how to submit, and a memorandum builder.
- `/tools/your-taxes/` → the tax receipt (section 5.9).
- `/learn/`, `/learn/[slug]/`, `/learn/glossary/`, `/learn/calendar/` → learning pages.
- `/infographics/` and `/infographics/[slug]/` → the shareable library.
- `/data/`, `/data/releases/`, `/api/national/*.json` → downloads, the API and dated data releases.
- `/methods/`, `/corrections/`, `/about/`, `/who-runs-us/` → trust pages.

Navigation, the same on phone and desktop: **Budget · Counties · Track · Learn · Data**, a search button, and a "My county" chip. On phones use a bottom tab bar with the same five items. Breadcrumbs on every page deeper than one level. A footer repeating the map, plus the corrections link.

## 4. Data engine v2 (do this before the pages)

### 4.1 Figure registry
Replace hand-built `data.json` objects with a registry: `data/national/figures/*.json`, validated with a Zod schema in the build. A figure is:

```
{ id: "ke.fy2026-27.statement.vote.1063.total",   // stable, readable, never reused
  value: 0, unit: "KSh" | "KSh m" | "KSh bn" | "%" | "count",
  fy: "2026/27", stage: "bps"|"recommendation"|"estimates"|"statement"|"approved"|"supplementary-1"|"supplementary-2"|"supplementary-3"|"released"|"spent"|"audited",
  level: "total"|"sector"|"vote"|"programme"|"subprogramme"|"economic"|"taxhead"|"county"|"project"|"debt",
  parent: "<id>" | null, label: "official"|"verified"|"audit"|"unverified",
  source: "<sourceId>", page: "printed p.25, Table 5", pdfPage: 68,
  calc?: { formula: "a + b", inputs: ["<id>", "<id>"] },     // recomputed and checked at build
  checkedOn: "2026-11-01", checkedBy: "claude-code" | "<editor initials>", note?: "" }
```

**Rules the build enforces (the build fails on any of them):**
- A figure with no source, page, stage or label.
- Children that do not add up to their parent within the tolerance declared for that document (for example ±0.1 for figures rounded to one decimal).
- A `calc` whose recomputed value differs from the stored value.
- A sum across stages, years or groupings. `lib/compare.js` refuses to compare figures from different groupings, and compares figures from different stages only through a labelled "stage change" view.
- A county figure added to NG-CDF, or to any national figure, in the same total.

### 4.2 Sources registry
`data/national/sources.json`: id, title, issuing body, document type, fiscal year, stage, date, official URL, a Wayback Machine snapshot URL, the SHA-256 of the copy in `data-src/national/`, the numbering offset between PDF and printed pages, and the next expected release date.

Government links break often (treasury.go.ke failed with an expired security certificate on 1 Nov 2026), so every source shows the official link and the archive link. Stored PDFs stay in `data-src/` and are listed in DATA.md.

### 4.3 Getting figures out of PDFs: double entry
For every table: (1) extract it with a script (pdf text or table extraction) into `data-src/national/<doc>/extract.csv`; (2) type it by hand, or take it from a second extraction method, into `typed.csv`; (3) a script compares the two and lists every mismatch. A table is loaded only when they agree or a person has resolved each mismatch, and the result is recorded in `VERIFICATION.md` (keep the existing format). Picture-only tables, like Guide p.14, are marked for a person to check first.

### 4.4 Documents to load, in priority order
Each one gets a figure set, a test and a VERIFICATION entry.
1. **Appropriation Act 2026** (Act No. 20 of 2026), per vote: the approved stage. The founder downloads it from Kenya Law.
2. **County Allocation of Revenue Act 2026** (Act No. 22 of 2026), per county, plus its disbursement schedule if it has one. The founder downloads it. Replace the Guide p.14 rounded figures; keep both in the stage history.
3. **The County Governments Additional Allocations Act for FY2026/27** (the conditional-grants law; confirm its year and number): each county's conditional grants.
4. **Programme Based Budget FY2026/27** (Treasury Budget Book): each vote, its programmes and sub-programmes, its economic classification, and the "key outputs, performance indicators and targets" tables.
5. **Development Estimates FY2026/27**: projects with codes, votes and financing (Government of Kenya, loan or grant).
6. **CoB national government annual budget implementation review report, FY2025/26:** money released to and spent by each MDA, plus Consolidated Fund Services spending.
7. **CoB county annual reports, FY2024/25 and FY2025/26, all 47 counties:** budget, spending, development absorption, own-source revenue target and actual, pending bills, wage bill. Extend the existing `compare.json` format rather than inventing a new one.
8. **Auditor-General:** the latest audit opinion for each county executive and assembly (unmodified, qualified, adverse or disclaimer), with report links. Opinions are facts; quote the opinion type and add no adjectives.
9. **Monthly series:** the Treasury's monthly statement of actual revenues and net Exchequer issues (confirm its current place of publication). It feeds `/track/` and keeps the site fresh between budget days.
10. **Debt:** the latest Annual Public Debt Management Report and CBK public debt statistics (stock, domestic against external, maturity).
11. **Previous years:** the same documents for FY2022/23 to FY2025/26, so every vote and county has a five-year trend. Each year's latest stage is used and labelled.
12. **KNBS:** the CPI, to convert to real terms (method in section 4.5), and population (the 2019 census, or KNBS projections if published), for per-person figures. Never mix census and projection figures in one view.

### 4.5 Derived measures (each one tagged "Our calculation", each one tested)
- **Change on last year:** shown in cash terms, and in real terms using the average CPI over the fiscal year, July to June. Always say which, and compare like with like (estimates with last year's estimates, or approved with approved). The method goes on `/methods/`.
- **Shares:** of the total, of ordinary revenue, of GDP (using the Treasury's GDP for the same year and stage).
- **Per person:** state the population year in the label. Never rank counties per person without showing the absolute figure alongside.
- **Fiscal-rule checks:** show the official assessment first: the Treasury's report on fiscal responsibility principles in the Budget Policy Statement and the Budget Review and Outlook Paper, and the CoB's county reports. Our own checks come second, using the rule's exact legal definition, with the section quoted:
  - development at least 30% of the county budget (PFM Act s.107);
  - county wages and benefits at most 35% of the county's total revenue (PFM County Governments Regulations 2015, reg. 25);
  - the national equivalents in PFM Act s.15.

  Check each citation against the text of the law before publishing. If the legal definition is unclear, show only the official assessment.
- **Constitutional floor:** the equitable share against Article 203(2): at least 15% of the most recent audited revenue that Parliament has approved. The Guide says 21.0% of FY2022/23 revenue.

### 4.6 Freshness and releases
- Each dataset declares `nextExpected`. Past that date, the page shows a quiet "Newer document expected" note (reuse `StaleScript`), and the build prints a warning list.
- **Data releases:** every publish writes `data/national/releases/YYYY-MM-DD.json` and a changelog of figures added, changed or removed. A changed figure creates a corrections-log entry automatically (old value, new value, reason, date), shown at `/corrections/` and beside the figure.
- Every figure has a citation string, for example: "Kenya Budget Explained, data release 2026-11-01, figure ke.fy2026-27…, from the Budget Summary FY2026/27, Table 2, p.14". A "Copy citation" button produces it.

### 4.7 Fix before anything else
- Check the sector names against the Guide's p.3 and the MTEF sector list. The prototype says "Public Administration and **Internal** Relations"; the MTEF sector is usually "Public Administration and **International** Relations". Correct it if the document confirms.
- Replace the dead `treasury.go.ke` links with the working `newsite.treasury.go.ke` paths plus archive links.

## 5. Features, specified

### 5.1 Home
- **First screen at 390px:** the stage strip (where this year's budget is now), the headline figure with its label, and a "My county" card if a county was chosen before (otherwise a county picker).
- **"This month":** one dated update drawn from the newest source, for example "Treasury released KSh X to counties by 30 September".
- **Next hearing or deadline:** with a countdown in days, never in hours.
- **Then:** three explainers, three infographics, and search.
- No impact counters, testimonials or partner logos until real ones exist.

### 5.2 National explorer (budget → sector → vote → programme)
- **Every level:**
  - a headline sentence written from data templates, for example: "The State Department for Basic Education gets KSh X in FY2026/27, Y% more than the FY2025/26 estimates in cash terms (Z% in real terms)";
  - its evidence label and stage;
  - a sorted bar list of the children, with a "Recurrent / Development / Both" toggle;
  - an economic classification split (wages, goods and services, transfers, capital) using `SplitBar`;
  - a five-year line using `LineChart`, with stage marked per point;
  - "What they promised" (targets from the Programme Based Budget);
  - related projects (section 5.7) and related explainers;
  - downloads (CSV and JSON), embed code, copy citation and a share card.
- **Wording rules for generated sentences:** the words are "more" and "less", "up" and "down", with numbers. Never "slashed", "ballooned" or "starved". Test the templates with snapshot tests, covering zero, missing and negative cases.
- **Search:** finds vote names and abbreviations (TSC, HELB, KeNHA, KURA, SHA, KMTC), programmes and counties, with Kiswahili synonyms. Extend `search-index.json.js` or build a separate national index. It works without a server.
- **Stage change view:** for one vote, show the BPS ceiling, then the estimates, then the approved figure, then supplementary I to III, then released, then spent. This is our answer to "the number changes": the whole life of one shilling. Never sum across stages.

### 5.3 County page (the most-used page; make it excellent)
- **First screen:** the county name, the equitable share this year (law), the change on last year, and how much of last year's development budget was spent, each with label and stage, plus a "Share" button.
- **Sections (Toggle or SectionTabs):**
  1. **Money in:** equitable share, conditional grants, own-source revenue against target, five-year trend.
  2. **Money out:** budget against spending by year (reuse the "budget against spending" bars), development absorption against the all-county figure.
  3. **Rules check:** the official assessment first, then ours. Use badges "Meets / Does not meet / No data", each with the legal reference. The badges carry no red; red is kept for gaps such as unspent money.
  4. **Bills and audits:** pending bills (with the CoB's own caveats) and the audit opinion by year, linked to the report.
  5. **Releases this year:** equitable share released to date against the disbursement schedule, from `/track/`.
  6. **Questions to ask:** three or four generated from the data, for example "Development spending was 37% of the development budget in FY2024/25 (all counties: 57%). Which projects were not started?", each with a Copy button.
  7. **The people responsible:** governor, county assembly and the Assembly's budget committee, by office only. Never rate people.
  8. **Deeper local data:** for Nyamira, link to Nyamira Daily's ward pages. Other counties get a slot for future county editions.
- **Print sheet:** `/counties/[county]/sheet/` using `layouts/Sheet.astro`. One A4 page with the five key numbers, two questions, the hearing date and a QR code to the page. It is meant for town halls and radio scripts.
- **Embed:** `/embed/county/[county]/`, a small card for news sites, following the existing `pages/embed/*` pattern.

### 5.4 County comparison
- Two to four counties from a picker; the selection lives in the URL (`?c=`) so it can be shared.
- Rows: equitable share, per person (with its year), development absorption, own-source revenue performance, pending bills, audit opinion, rules check.
- Columns line up; differences shown as numbers, not colours alone.
- "Add Nyamira's neighbours" shortcut, from `neighbours.json`.

### 5.5 Counties overview and map
- The list of 47, sortable by any measure, with a written method.
- **Map:** a simplified county boundary file (check the licence; aim for under 80 KB gzipped), loaded only when opened. One sequential colour for a single measure. Tapping a county opens its card. The list remains the main view; the map is optional.
- A yearly "State of the Counties" page: a comparison on published, checkable measures only, with the method beside it. No composite score until the method is reviewed by a public-finance adviser.

### 5.6 Monthly tracker (`/track/`)
- Revenue collected against target by month, for the year to date.
- Exchequer releases by vote, as a share of the approved budget.
- Equitable-share releases to the counties against the schedule, with the months of delay counted from the schedule date.
- Each chart has an "as of" date and a "next update expected" date. When a month is missing, show the gap; never interpolate.

### 5.7 Projects (national tracker)
- **From the Development Estimates:** each project with code, name, vote, location if printed, financing source and allocation by year.
- **Question rules:** reuse the pattern in `lib/road-questions.js`, with a test for each rule. For example:
  - "Funded in N consecutive budgets": N ≥ 4, with the amounts per year listed.
  - "Allocation fell to zero but the project still appears".
  - "Same project name under two votes".

  Every rule produces a question with its documents, never a conclusion.
- Status fields are filled only from a dated source (CoB, a ministry report or a field visit), with its label.

### 5.8 Budget day mode (`/budget-day/[fy]/`)
- Before budget day: prepared templates and the estimates already loaded, so on the day only the budget statement figures are added.
- **On the day:**
  - what changed from the estimates;
  - the biggest risers and fallers by vote, in cash and in real terms;
  - the tax measures in plain words (from the Finance Bill), each tagged as "proposed" until the Act passes;
  - press-kit embeds and CSVs.
- After the day the page stays as an archive. A rehearsal checklist lives in `docs/national/BUDGET_DAY.md`.

### 5.9 Your taxes (`/tools/your-taxes/`)
- **Version 1:** the user types an amount of tax paid. The tool splits it by the spending shares ("Of your KSh 10,000: KSh 3,110 to interest and pensions…"), with the share card and a plain caveat: taxes go into one pool, so this shows shares of spending, not where your shilling was spent.
- **Version 2, only after a test against KRA's published examples:** a PAYE estimator using the current tax bands, plus the statutory deductions in force (confirm each against the current Finance Act and KRA guidance, and show the date). Leave it out until those tests pass.

### 5.10 Have your say (`/have-your-say/`)
- Upcoming hearings (BPS, estimates, Finance Bill, county budget hearings) with dates, the committee and how to submit. Show email addresses as copyable text.
- **Memorandum builder:** the user picks a topic and writes their ask; the tool assembles a correctly structured memorandum (to, from, subject, background with our figures and citations, request) to copy. We send nothing and store nothing.
- After each hearing, link the committee's report if it is published.

### 5.11 Learn
- Ten five-minute explainers: how the budget is made; equitable share and how it is calculated; Consolidated Fund Services; why numbers change by stage; reading a Programme Based Budget; development absorption; pending bills; audit opinions; how to submit a memorandum; NG-CDF against county money.
- Each has one picture or chart, a Kiswahili summary and a two-question self-check.
- **Glossary:** every term in the interface has an inline definition (a button-triggered popover, keyboard reachable) and a Kiswahili term reviewed by a native speaker. Extend the existing `learn/glossary`.

### 5.12 Infographics library
- Built from data at build time with the share-card pipeline: portrait 1080×1350 (WhatsApp and Instagram) and landscape 1200×630 (OG).
- Topics: the budget in 10 numbers, KSh 100, debt, each sector, each county.
- Every image carries the figure, its label and stage, the source and the data release date in the image itself, so a screenshot keeps its provenance.
- Each image has its own page with alt text, a text version and download links.

### 5.13 Data and API
- `/data/`: every table as CSV and JSON, a `datapackage.json` (Frictionless Data), the CC BY 4.0 licence and a suggested citation.
- `/api/national/figures.json`, `/api/national/votes/[vote].json`, `/api/national/counties/[county].json`, each with `release`, `generated` and source blocks, following the existing `lib/api.js` envelope.
- A "Report an error" link on every figure opens the existing corrections service, prefilled with the figure id. It sends no personal data beyond what the person chooses to give.

## 6. Interface and design system

- **Brand:** the national product is a sibling of Nyamira Daily, not a copy.
  - It shares the type (League Spartan for body and figures, Varela Round for display) and the neutrals.
  - It has its own primary accent role, chosen with the founder. Signal Green stays Nyamira Daily's.
  - Record Red is kept for gaps (unspent money, missed targets, debt service) and deadlines, never for parties, people or blame.
  - Document the tokens in `docs/national/DESIGN.md`, with light and dark values.
- **Components** (Astro, no client framework; behaviour in small vanilla modules):
  - `FigureCard`: number, sentence, evidence label, stage chip, source, copy citation, report error.
  - `StageChip`, `StageTimeline` and `StageChange`.
  - `KSh100Bar`.
  - `RankedBars`: sorted bars with keyboard-reachable tooltips and a table view.
  - `TrendLine`, which marks the stage on each point.
  - `SplitBar`: economic classification.
  - `CountyPicker`: searchable and remembered.
  - `CompareTray` and `RuleBadge`.
  - `QuestionCard` with copy.
  - `ShareCard` (preview, plus WhatsApp text that carries the figure, the source and the link).
  - `EmbedCode`.
  - `DataTable`: sortable, with a CSV link, stacking into cards on phones.
  - `GlossaryTerm`.
  - `UpdatedNote` and `StaleNote`.
  - `NotYetLoaded`: explains why a figure is missing and when it is expected.
  - `Breadcrumbs`.
- **Every component has its states** documented and visible on a `/dev/components/` page that is excluded from production: normal, missing, stale, corrected (with the correction note), disputed (two official sources disagree: show both, say which is used and why), and long text in Kiswahili.
- **Charts:**
  - Drawn as SVG at build time, readable with JavaScript off.
  - JavaScript adds tooltips (tap to pin) and toggles.
  - Each chart has a one-sentence takeaway above it, a "Show as table" option and a text alternative.
  - One axis per chart; colours chosen by meaning; colour never the only cue.
  - Validate any categorical palette for colour-blind safety.
- **Copy:** lead with the number; sentences under 20 words; define each term once; questions, not accusations; "more" and "less", not loaded verbs. The Kiswahili summary sits below the English and is marked for review.
- **Phones first:**
  - Test at 360, 390, 768 and 1280px, light and dark; no horizontal scroll anywhere.
  - Tap targets at least 44px.
  - The bottom tab bar respects safe-area insets.
- **Speed:**
  - Under 120 KB transferred per page on first load, excluding fonts (fonts self-hosted and subset).
  - Largest Contentful Paint under 2.5 s on a "slow 4G, mid-range phone" profile.
  - No layout shift from fonts or charts.
- **Accessibility:** WCAG 2.2 AA; checked with axe in Playwright on every page template; a keyboard path through every interaction; and `prefers-reduced-motion` respected.
- **Language:** an interface dictionary (`src/i18n/en.json` and `sw.json`). Numbers formatted for each language (for example "KSh trilioni 4.82" in Kiswahili; confirm the house style with the reviewer).

## 7. Code health and strength

1. **Types:** move the national lib to TypeScript, or JSDoc with `// @ts-check`. Zod schemas are the single source for the figure and source types. Run `astro check` in the build.
2. **Tests** (node --test plus Playwright):
   - unit tests for every formatter, calculation, question rule and sentence template;
   - checks that every parent's children add up to it, and that no view sums across stages;
   - a test that the data rebuilds identically (keep the current one);
   - Playwright journeys for the five usability tasks;
   - axe on every template;
   - a no-horizontal-scroll check at 360px;
   - visual snapshots of key components at 390 and 1280px, light and dark;
   - a check for broken internal links.
3. **One command:** `npm run check:national` runs the build, the tests, the link check, axe, Lighthouse budgets and the stale-data report. Add a GitHub Actions workflow in `.github/` that runs it on every pull request; merging is blocked if it fails.
4. **Security:**
   - Cloudflare Pages `_headers` with a strict Content-Security-Policy (no inline scripts without hashes), `Referrer-Policy`, `Permissions-Policy` and `X-Content-Type-Options`.
   - No third-party scripts; analytics through Cloudflare Web Analytics only, if the founder agrees, and stated on the privacy page.
   - Forms use Turnstile and rate limits in `functions/`.
   - Dependencies pinned; `npm audit` clean; Renovate or Dependabot opened only with the founder's approval.
5. **Structure:**
   - No logic copied between Nyamira Daily and the national app: shared code lives in one place (see decision 2.1).
   - Pages hold no arithmetic; all of it is in `lib/` with tests.
   - Data files are never edited by hand when a script generates them (the same rule as `roads.json`).
6. **Failure behaviour:** every page renders fully with JavaScript off. A missing figure shows `NotYetLoaded`, never 0, NaN or an empty bar. A failed build step names the figure id and the source page.
7. **Docs, kept current at the end of each phase:** `docs/national/` with `README.md` (how to run and add a document), `DATA.md`, `DESIGN.md`, `METHODS.md`, `BUDGET_DAY.md`, `USABILITY.md`; plus `HANDOFF.md`, `VERIFICATION.md` and `docs/STATUS.md`.

## 8. Guardrails (from how budget and civic tools have failed; each must be visible in the product)

| Failure seen elsewhere | Guardrail here |
|---|---|
| Portals go stale when the publisher stops (Kenya's open data portal, 2011–2013) | `nextExpected` on every dataset, visible stale notes, a monthly tracker, and a named person responsible for each dataset in DATA.md |
| Links break when government sites move or certificates expire | An archive link and a stored copy (with its SHA-256) for every source |
| Readers misread stages, groupings, or net and gross figures | Stage chips, the stage change view, grouping names on every chart, and a "net" label wherever it applies |
| A wrong figure spreads | Double entry, a VERIFICATION record, a "verified" label only after a person's check, automatic corrections entries, and a "report an error" link on every figure |
| Only connected, educated users are reached | Phone-first pages, light pages, Kiswahili, print sheets with QR codes, WhatsApp share text, radio-ready summaries |
| People raise issues and get no reply | Questions addressed to named offices with a legal duty to answer, hearing dates, and replies logged in the impact log |
| Overbuilding: software projects that run far over cost | Each phase ends in something usable; nothing new starts until the usability tasks pass |
| Funding dries up and the site goes dark | A static site that costs almost nothing to run, plus open code and open data |
| The tool looks partisan in an election year (10 Aug 2027) | No ratings of people, the same treatment for every county and office, and an election-period notice (reuse `ElectionNotice`) |
| Gaps are filled with guesses | `NotYetLoaded` instead of estimates; no scaling, interpolation or "approximately" figures |
| AI answers invent numbers | No AI features in this brief. Any later assistant answers only from the figure registry, with citations, and is tested before release |

## 9. Usability testing (before calling any phase done)
- Five participants per round, including at least two who are not regular internet users and two who prefer Kiswahili, recruited through ward champions with consent. Record notes only, not identities.
- Run the five tasks from section 0 on a mid-range Android phone over mobile data. Record success, time and where people got stuck.
- Fix the top three problems, then run a second round. Write the results in `docs/national/USABILITY.md`.

## 10. Phases (one branch each, named `feat/national-<phase>`; never push or merge without the founder)

| Phase | Delivers | Done when |
|---|---|---|
| 0. Audit and decisions | A findings list on the prototype (UX, accessibility, code, data); the decisions in section 2 put to the founder; the fixes in section 4.7 | The founder has answered; fixes merged on the branch |
| 1. Data engine v2 | Registry, schemas, source registry with archive links, double-entry scripts, releases and changelog; items 1–2 of section 4.4 loaded | `npm run check:national` (data part) passes; VERIFICATION updated |
| 2. App shell and design system | Routes, navigation, i18n, tokens, the component library page, charts | Components pass axe and visual checks; DESIGN.md written |
| 3. Core journeys | Home, `/budget/[fy]/`, sector and vote pages, 47 county pages, county comparison, print sheets | Usability round 1 run; tasks 1–3 pass |
| 4. Depth | `/track/`, `/projects/`, `/debt/`, `/revenue/`, rules checks, programme targets; items 3–10 of section 4.4 | Each feature has tests and its data in VERIFICATION |
| 5. Reach | Infographics library, share cards, embeds, have-your-say and the memorandum builder, your-taxes v1, learn pages, Kiswahili interface | Usability round 2 passes all five tasks |
| 6. Hardening and launch prep | CI, security headers, budgets met, docs complete, budget-day rehearsal | All checks green; launch checklist signed by the founder |

At the end of every phase, give the founder screenshots at 390px and 1280px (light and dark), the test summary, the list of figures that could not be sourced, and what is next.

## 11. Never
- Never invent, estimate, interpolate or scale a figure. Never show a placeholder that looks like data.
- Never rate, rank or praise politicians or parties; rank only counties, and only on published measures with a written method.
- Never copy BudgIT's brand, text or design files, or suggest we are connected to it.
- Never add impact counters, testimonials, partner logos or a Donate button until they are real, and call nothing a non-profit until the entity exists.
- Never store personal data beyond what a form needs, never add third-party trackers, and never send anything on a user's behalf.
- Never push, merge into main or delete files without the founder's go-ahead.
