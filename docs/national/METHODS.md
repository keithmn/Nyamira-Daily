# How Kenya Budget Explained works out its numbers

Most figures on the site are printed in an official document and are shown as printed. This page covers the rest: every number the site works out itself. Each one is tagged "Our calculation" where it appears, its code is named below, and a test in `apps/national/src/lib/national.test.js` or `scripts/national/*.test.mjs` holds it to this description. The public version is `/methods/`.

**Rules that apply to all of them:**

- No missing figure is ever estimated, interpolated or scaled. If a figure is not loaded, the page says so (`NotYetLoaded`).
- Figures of different stages are never added, and no change is worked out between them (`@kbe/engine/compare` refuses).
- Figures of different groupings, or of national and county money, are never added either. NG-CDF is never added to county money.

## Money

| Measure | How | Code |
|---|---|---|
| A vote's money | Supply plus Appropriations-in-Aid, recurrent plus development, as the Appropriation Act prints them (gross) | `lib/votes.js` |
| A programme's money | The same, for each programme of a vote | `lib/votes.js` |
| A sector's money | The sum of its votes. Which votes are in each sector comes from the Parliamentary Budget Office's tables (decision #93) | `lib/votes.js` |
| Change on last year | (this year − last year) ÷ last year × 100. Approved against approved, in cash terms, from the Budget Explainer's tables for both years, adding the same votes in both years for a sector | `lib/votes.js`, `@kbe/engine/compare` |
| Of every KSh 100 | A part ÷ total spending × 100, rounded to whole shillings; below KSh 1 in cents (to 10 cents); below 10 cents, "under 10 cents" | `lib/budget.js` |
| What a vote's money pays for | The Programme Based Budget's economic classification, grouped into wages, goods and services, transfers, and assets and other, as shares of the vote's total | `lib/votes.js` |
| National projects total | The sum of every project's FY2026/27 gross in the Development Estimates; equals the sum of the 64 development votes in the Act | `lib/projects.js` |

## Counties

| Measure | How | Code |
|---|---|---|
| Development spending rate | Development spent ÷ development budget × 100, as the Controller of Budget prints it. Each printed percentage is recomputed from the amounts and must agree | `scripts/national/double-entry.mjs` |
| Wage share | Wages ÷ total revenue × 100. Our division must reproduce every ratio the report names (Homa Bay 56%, Nyeri 52%, Taita-Taveta 49%, Mombasa 26%, Kwale 26%, Tana River 28%, all counties 39.54%), or the build stops | `scripts/national/build-figures.mjs` |
| Own-source revenue against target | Actual ÷ target × 100 | `lib/counties.js` |
| Rules checks | The county's wage share against 35% of total revenue (county regulations, reg. 25(1)(b)), and its development share against 30% (PFM Act s.107(2)(b), "over the medium term"). The report's finding comes first and the law is quoted (decision #95) | `lib/rules.js` |
| Rank | A county's place by equitable share in law, largest first. One published measure at a time, never an overall score (decision #84) | `lib/counties.js` |

## Debt

| Measure | How | Code |
|---|---|---|
| Interest as a share of revenue, past years | Interest paid ÷ ordinary revenue × 100, from the Annual Public Debt Report's tables | `lib/depth.js` |
| Interest as a share of ordinary revenue, FY2026/27 | Planned interest ÷ ordinary revenue × 100, from the Budget Summary. A plan, so it is never joined to the past years' line | `data/national/figures/budget-2026-27.json` (`calc`) |

## Tools and questions

| Measure | How | Code |
|---|---|---|
| Your taxes | The amount × each part's share of total spending, in whole shillings. Leftover shillings go to the largest remainders, so the parts add back to the amount | `lib/split.js` |
| Days to a deadline | Whole days from today in Nairobi to the date the law fixes, worked out again in the reader's browser | `lib/calendar.js`, `scripts/app.js` |
| Project questions | Money in FY2025/26 and none in FY2026/27; and one specific name funded under two or three votes, leaving out generic names (decision #96) | `lib/projects.js` |
| County questions | Each states a figure from a dated document and asks; none concludes anyone did wrong | `lib/sentences.js` |

## Checks on the documents themselves

These are not shown as figures, but they decide whether a document is loaded at all. `npm run check:national` repeats them; `national-budget/VERIFICATION.md` records the results.

- Every parent figure equals the sum of its children, within the source's tolerance.
- The Appropriation Act agrees with the Budget Explainer for all 87 votes within KSh 1 million.
- Every Programme Based Budget programme equals the Act, except one documented move in vote 1213.
- Every development vote's projects add to the printed total, which equals the Act.
- Every `calc` formula in the registry is evaluated again and must give the stored value.
