# Plan: Nyamira's budget, built on the national model

**Status: approved by the owner, 4 Nov 2026 (decision #105).** The nine decisions below stand as recommended.

The owner asked for Nyamira Daily's money pages to follow the model of Kenya Budget Explained (`apps/national`, `docs/national/SITEMAP.md`). The owner chose, on 4 Nov 2026:

1. **Data model and pages.** Move the county's money figures into the figure registry first, then rebuild the pages on it.
2. **Nyamira's own look.** Signal Green and the Highlands palette stay. The structure and components follow the national product, as its design doc asks ("a sibling, not a copy").
3. **Plan first.** This page, then building.

## What changes, in one paragraph

Today Nyamira's money is one page (`/data/money/`) drawn from two hand-made files, `money.json` (12 years of Controller of Budget totals) and `budget-sectors.json` (24 departments, FY2025/26). After the change, every county money figure is a record in a registry, with its source, page, budget stage and label, checked by `@kbe/engine`. The money section grows from one page into layers you can tap down through: the year, its 24 departments, each department's programmes, where the money comes from, and how much has been spent this year. Each page answers one question on its first screen, and the detail sits one tap deeper.

## What to approve

Each item has a recommendation. Change any of them before approving.

| # | Decision | Recommendation |
|---|---|---|
| 1 | Where the pages live | Under `/data/money/`. No new top-level section, and the nav keeps its eight sections (#60); the Money menu gains the new pages |
| 2 | Department addresses | The printed vote code, as in the national product: `/data/money/2025-26/departments/5261/`. Names change when departments are reorganised; codes rarely do. The page shows the name |
| 3 | One figure, one home | Figures the national registry already holds for all 47 counties (Controller of Budget, County Allocation Act, CRA) are read from `data/national/`, not copied. County documents get their own registry in `data/county/nyamira/` |
| 4 | Budget stages | Use the engine's stages as they are, with county wording on the page (table below). No schema change |
| 5 | Which year leads | FY2025/26 until the county publishes FY2026/27. The county's website has no FY2026/27 budget yet (checked 4 Nov 2026) |
| 6 | Kiswahili | Keep Nyamira's short Kiswahili summaries. Full `/sw/` twins of every page, as in the national product, are not part of this plan |
| 7 | Evidence labels | As agreed for the national product: Claude's checks are recorded but stay `official`; only a person's check makes a figure `verified` |
| 8 | Shared components | Move the national components this needs into `packages/engine`, made to take Nyamira's tokens. Never copy them (AGENTS.md) |
| 9 | Existing links | `/data/money/`, `/embed/money/` and `/api/money.json` keep working, now fed from the registry |

## Something this plan found

**The Money page is a year behind its sibling.** It ends at FY2024/25. The national registry already holds Nyamira's FY2025/26 figures from the Controller of Budget: a budget of KSh 8,646.3 million and spending of KSh 7,009.26 million, 81% (Official; Controller of Budget, County Budget Implementation Review Report FY2025/26, Table 2.5, p.9). Under decision 3 the Money page would show them as soon as it reads the registry.

The two sources agree on FY2024/25: `money.json` has 8,100 and 5,650 (rounded, from section 3.34), the registry 8,102.9 and 5,656.74 (Table 2.5).

## How it is organised

- **Two depths.** The first screen answers a resident's question: the number, a sentence, the label, the stage and the source. An analyst's detail is one tap deeper, in `<details>` or on the next page down (#3).
- **One question per page.** Each route below names its question.
- **Stages, never mixed.** A figure says which stage of the budget it comes from. Estimates, approved, supplementary and spent figures are shown side by side, never added together.
- **Questions, not accusations.** Gaps, like money not spent, unpaid bills or a target missed, come with questions to ask and their source documents (#14).
- **Your ward follows you.** A department page shows the chosen ward's projects from `wardspend.json` first, using the existing ward picker.

### Stages, in county words

| County document | Stage in the registry | Shown as |
|---|---|---|
| County Fiscal Strategy Paper (February) | `bps` | Fiscal strategy |
| Programme Based Budget, printed estimates | `estimates` | Estimates |
| Approved budget or County Appropriation Act (by 30 June) | `approved` | Approved |
| Supplementary budgets | `supplementary-1`, `-2`, `-3` | Supplementary |
| Money released to the county | `released` | Released |
| Quarterly reports, Controller of Budget annual report, Budget Review and Outlook Paper | `spent` | Spent |
| Auditor-General's report | `audited` | Audited |

Where the county's own report and the Controller of Budget give different spending for the same year (for FY2024/25: 7.41B against 5.65B, see the caveats in `money.json`), both are kept with their sources, and the page shows the difference as a question to ask.

## Routes

`[fy]` is written `2025-26`. **Data** says how close each route is to being buildable:

- **Ready:** in hand and checked.
- **Located:** the document is on the county's website (listed below), but not loaded.
- **To find:** not published, or not found yet.

| Route | Question | First screen leads with | Data |
|---|---|---|---|
| `/data/money/` | Where is the county budget now, and what matters? | Stage strip, the latest budget, share spent last year, cards for the pages below | Ready (rework of today's page) |
| `/data/money/[fy]/` | What is the whole county budget for one year? | Total. Where each KSh 100 goes (staff pay, running costs, development) and where it comes from (equitable share, own revenue, grants) | FY2025/26 Ready (printed estimates). Earlier years Located |
| `/data/money/[fy]/departments/` | How do the 24 departments compare? | The largest department, ranked bars, staff pay share | FY2025/26 Ready |
| `/data/money/[fy]/departments/[vote]/` | What does this department get, and what did it spend? | Amount, change on last year, staff pay, running costs and development, its programmes, your ward's projects | Amounts Ready. Programmes and spending Located |
| `/data/money/[fy]/departments/[vote]/[programme]/` | What will this programme spend and deliver? | Amount, its sub-programmes, targets ("what they promised") | Located (Programme Based Budget) |
| `/data/money/revenue/` | Where does the money come from, and is it on target? | Equitable share set by law, own-source revenue against target, grants | Ready (12 years from the Controller of Budget, and the County Allocation Act in the national registry) |
| `/data/money/track/` | How much has been spent this year? | Spending against budget by quarter, and each department's share spent | FY2025/26 quarters Located |
| `/data/money/history/` | How has the county used its money since 2013? | Today's twelve-year charts: budget and spending, development used, money not spent, unpaid bills | Ready (moves from today's page) |

Unchanged, and linked from the new pages: `/tracker/` (contracts), ward pages (projects), `/have-your-say/` and `/take-part/submission/` (comment on the budget), `/learn/budget-calendar/` and `/tools/budget-simulator/`.

## The documents

On the county's website (`nyamira.go.ke/templates/document_list?id=1` and `id=2`), checked 4 Nov 2026:

| Document | Years on the site | Feeds |
|---|---|---|
| Programme Based Budget | FY2015/16 to FY2025/26 | Year, departments, programmes, history |
| A second FY2025/26 Programme Based Budget, posted 24 Sep 2026 | FY2025/26 | Check first: it may be the approved budget, which would settle the open gap in `data-src/research-notes/budget.md` |
| Quarterly budget implementation reports | FY2023/24 to FY2025/26. For FY2025/26, quarters 2, 3 and 4 say the year in their file names; the quarter 1 file (posted 28 Jan 2026) does not, so open it to confirm | Track |
| County Fiscal Strategy Paper | 2015 to 2025 | Fiscal strategy stage |
| County Budget Review and Outlook Paper | 2015 to 2025 | Spent stage, county's own figures |
| Supplementary budgets | Some years (2017/18, 2019/20, 2022/23, 2023/24) | Supplementary stage |
| Popular (Mwananchi) versions of the budget | FY2024/25, FY2025/26 | Wording only, not figures |
| **FY2026/27 budget** | **Not on the site** | To find. Ask the county, or wait |

Already in the national registry for Nyamira: Controller of Budget totals for FY2024/25 and FY2025/26 (budget, spending, development, own-source revenue, grants, wages, pending bills), the equitable share for FY2025/26 and FY2026/27 from the County Allocation Act, and CRA's recommendation.

## The data model

- **Where:** `data/county/nyamira/sources.json` and `data/county/nyamira/figures/*.json`, in the same shape as `data/national/`. `readRegistry()` already takes the folder as an argument, so the engine needs no change to read it.
- **IDs:** in the national form, for example `ke.fy2025-26.estimates.county.nyamira.vote.5261.total`. They must not clash with the national registry; a test checks both registries together.
- **Money:** every figure is `money: county`. NG-CDF stays `ng-cdf` and is never added to county money (AGENTS.md).
- **Parts add up.** Each department's staff pay, running costs and development must add up to its total, and the 24 departments to the county total, within the document's rounding. The checks already in `budget-sectors.json` become engine rules.
- **Double entry.** Tables that are only pictures in the PDF are typed twice, as in the national product, and go first in the editor's queue.
- **What becomes of today's files.** `money.json` and `budget-sectors.json` are generated from the registry while any page still reads them, then retired. `wardspend.json` and `contracts.json` stay as they are, and department pages link to them by vote.

## Components

**Stay as they are on the main site:** `EvidenceLabel`, `ChartFrame` and `fmt.js` (already in `packages/engine`), `LineChart`, `ColumnChart`, `SplitBar`, `Toggle`, `EmbedCode`, the ward picker.

**Move from `apps/national` into `packages/engine`**, so both apps share one copy: `StageTimeline`, `StageChip`, `PageHero`, `FigureCard`, `KSh100Bar`, `RankedBars`, `BudgetVsSpent`, `QuestionCard`, `DataTable`, `NotYetLoaded`, `StaleNote`.

**The work in moving them:** they use the national tokens. `--primary` (violet) is used as text, but Signal Green must never be text on white, so on Nyamira the text role takes Ink and the fills take Signal Green. Red keeps its meaning on both sites (#24). Each component gets a token map and is checked for contrast in both themes.

## Phases

| Phase | What | Ends with |
|---|---|---|
| C0 | This plan | The owner's approval (#105) |
| C1, data | County registry; today's two files moved into it; FY2025/26 programmes and the quarterly reports loaded; checks and tests | `npm test` and the registry check pass. A list of figures that could not be sourced |
| C2, pages | The routes above for FY2025/26, the shared components, the nav | Screenshots at 390 and 1280, light and dark |
| C3, history | Programme Based Budgets FY2015/16 to FY2024/25, and a reviewed map of departments that were renamed or merged | Five years of department trends at least |
| C4, hardening | Weight, links, keyboard, tap targets, the build; `docs/STATUS.md` and `docs/DATA.md` | Usability round with real readers |

One branch per phase, never pushed or merged without the owner's go-ahead.

## Five tasks it must pass

On a 390px phone, as in the national product:

| Task | Limit |
|---|---|
| Find what Health got this year and how much it spent | 3 taps |
| Find the share of the budget that goes on staff pay | First screen of the year page |
| Find how much of last year's development budget was spent | 2 taps |
| Find a programme's promised target and copy a question about it | 4 taps |
| Download the departments table as CSV | 3 taps |

## How many pages

About 30 for FY2025/26: the year, the department list, 24 departments, revenue, track and history, plus one page per programme (the count is read from the Programme Based Budget, not guessed). Each earlier year loaded in C3 adds about the same. The main site builds 2,817 pages in about a minute, so this fits.

## Not in this plan

- The violet look, the national product's own name, and a separate domain.
- Full Kiswahili twins (decision 6).
- An overall score for departments. Like the national product, one measure at a time, with its method.
- Any figure the documents do not print. Unknown stays unknown (#27).

## Risks

- **Department names change.** Earlier years' departments were split and merged. The history phase needs a reviewed map, which a person must check; without it, trends start at FY2025/26.
- **Picture-only tables.** Some PDFs are scans. Those figures need double entry and a person's check before they are shown as verified.
- **The two spending figures.** For FY2024/25 the county and the Controller of Budget disagree by KSh 1.76 billion. Other years are not compared yet. Both are shown; neither is chosen silently.
- **No FY2026/27 budget yet.** Until the county publishes it, the year page is a year old, and says so.
