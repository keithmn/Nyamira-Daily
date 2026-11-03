# Launch checklist

The build brief's last gate: "All checks green; launch checklist signed by the founder." Claude Code fills in the **Checked** column with what it ran and when. Only the founder signs; a line Claude Code cannot do says who must.

Nothing here is pushed, merged or deployed. That needs the founder's go-ahead (AGENTS.md).

## Checks a machine runs

| # | Check | How | Checked |
|---|---|---|---|
| 1 | Data rules, double entry, cross-document checks, release in step | `npm run check:national` | See the Phase 7 entry in `docs/STATUS.md` |
| 2 | Unit tests | `npm test` | As above |
| 3 | Browser checks: axe, phones, JavaScript off, weight, links, journeys | `npm run test:national:site` | As above |
| 4 | Visual comparisons (laptop only) | `npm run test:national:visual` | As above |
| 5 | Infographics made for the current release | the browser checks fail otherwise | As above |
| 6 | `npm audit` clean | `npm audit` | As above |
| 7 | Security headers and content security policy | `dist/_headers`, and the unit tests on it | As above |
| 8 | Lighthouse on key pages | laptop run, see `BUDGET_DAY.md` | As above |

## Needs a person

| # | Item | Who | Status |
|---|---|---|---|
| 9 | Choose the product's name (Kenya Budget Explained is a working name, decision #82) | Founder | Open |
| 10 | Domain and Cloudflare Pages project, with `KBE_SITE_URL` set | Founder | Open |
| 11 | A person checks the rows in `data-src/national/person-checks.csv` and the five places in the Controller of Budget's `known-issues.csv`; only then can figures be labelled `verified` | An editor | Open |
| 12 | A named person responsible for each dataset (`docs/national/DATA.md`) | Founder | Open |
| 13 | Archive copies of the 17 sources without one (`check:national` lists them) | Founder decides how | Open |
| 14 | Download from Kenya Law: the County Governments Additional Allocations Act, and, to add monthly figures to `/track/`, the Gazette's Exchequer statements. `/track/` already shows the Treasury's quarterly review (decision #104) | A person | Open |
| 15 | Type the Programme Based Budget's targets (decision #97) | A person, typed twice | Open |
| 16 | A native speaker reviews every Kiswahili string and summary (decision #87) | Reviewer | Open |
| 17 | An editor reads the ten explainers, the methods page and every question template (decisions #96, #98) | Editor | Open |
| 18 | Usability rounds 1 and 2 (`USABILITY.md`) | Ward champions | Open |
| 19 | Open corrections: create the D1 database, Turnstile widget, secrets and Access policy listed in `README.md`, "Turn on corrections" (decision #102). The form is built and waits for them | Founder | Open |
| 20 | Trust pages: `/about/`, `/who-runs-us/`, `/privacy/`, `/terms/`, `/right-of-reply/`. Wording from decision #73; legal wording waits for the lawyer | Founder and lawyer | Open |
| 21 | Confirm that PFM Act ss.25(2), 37(2), 39(1) and (2) and 107(2)(b) are unchanged in the current revised edition: the stored copy is the 2012 Act as enacted | A person | Open |
| 22 | Check the IEBC timetable against the election-period dates (decision #77) | Founder | Open |
| 23 | Review decisions #90 to #101 | Founder | Done 3 Nov 2026: #90 to #100 approved; #101 replaced by #102 |
| 24 | Agree to commit about 9 MB of infographic pictures, or choose another home for them (decision #99) | Founder | Done 3 Nov 2026: approved, 8.3 MB in Git |
| 25 | Budget-day rehearsal with a person, before June 2027 (`BUDGET_DAY.md`) | Founder and an editor | Open |
| 26 | A daily rebuild (a Cloudflare Pages deploy hook on a schedule), so dates, countdowns and notices move on without a code change (decision #103) | Founder | Open |
| 27 | Watch the Treasury and Parliament sites for new notices (hearings, calls for comments) and add them to `data/national/notices.json`; the 2027 Budget Policy Statement reaches Parliament by 16 November 2026; watch Parliament's site for any call for views on it | A named person | Open |

## Sign-off

| | Name | Date |
|---|---|---|
| Founder | | |
