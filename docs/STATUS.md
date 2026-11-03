# Status and handover (3 Nov 2026)

For any assistant or developer picking this up (Codex, Claude Code, a person). Read `AGENTS.md`, then this page, then `docs/DECISIONS.md`. Older handover notes, with the history of each feature, are in `docs/STATUS_ARCHIVE.md`.

## Where things stand

- **The site:** a static Astro 7 site in eight sections (`src/nav.js`), with real data for money (12 years), ward pages, projects and the project tracker, services, census, leaders, the Assembly, county laws, fees, opportunities, constitution summaries, search and open data. Text content lives in `src/content/`; only one explainer and one number of the week are published so far, and two money explainers are drafted.
- **Who runs it (decision #73):** built and published by Underdogs Rising Group Limited, editorially independent, with a commitment to spin out into a non-profit. Trust pages: `/who-runs-us/`, `/right-of-reply/`, `/privacy/`, `/terms/`.
- **NY Watch (decision #79):** the founder's data review podcast. No episodes published yet.

## Changes on 3 Nov 2026

- National product Phase 7, hardening, on branch `feat/national-phase-7`, not pushed:
  - New security headers: HSTS, a cross-origin opener policy, open CORS on `/api/` and `/data/` only, and a one-day cache for the pictures.
  - `npm audit` now runs in CI.
  - `npm run check:national:all` runs every check in one command.
  - English pages with a headline (home, year, sector, vote, programme, county, debt, revenue, projects) now carry a Kiswahili summary, marked for review (decision #87).
  - The Track tab led to the unbuilt `/track/`. Tabs now go to a section's first built page, the footer shows unbuilt pages as "Planned" without a link, and the link check fails on any link to an unbuilt page.
  - New documents in `docs/national/`: `METHODS.md`, `BUDGET_DAY.md` (with the rehearsal timed on the laptop), `USABILITY.md` and `LAUNCH_CHECKLIST.md`.
- **Not done in Phase 7:**
  - Lighthouse is not installed, and adding it needs a new dependency.
  - The `/budget-day/` page needs next year's estimates.
  - Moving the national lib to TypeScript, or adding `astro check`, needs new dependencies.
  - Blocking merges on CI failures is a GitHub branch-protection setting the founder controls.
  - The trust pages wait for the lawyer.
  - The founder's sign-off. Everything that needs a person is in `docs/national/LAUNCH_CHECKLIST.md`.

- National product Phase 6, reach, on branch `feat/national-phase-6`, not pushed. New, in English and Kiswahili:
  - `/tools/your-taxes/`: version 1, which splits a typed amount by the shares of spending.
  - `/have-your-say/`: the dates the law fixes, a memorandum builder that sends and keeps nothing, and no hearing listed until an official notice is loaded.
  - `/learn/`: ten explainers.
  - `/learn/glossary/` and `/learn/calendar/`.
  - `/infographics/`: 62 topics, with 248 pictures that are each county's link preview.
  - `/embed/county/<slug>/`: a card news sites can frame.
  - The Data section: `/data/`, `/data/releases/`, `/methods/`, `/corrections/`, `datapackage.json`, and JSON files per vote and per county.
  - Decisions #98 to #101.
- Not done in Phase 6, and why:
  - Usability round 2 needs real readers.
  - The audit-opinions explainer needs the Auditor-General's reports.
  - Reporting an error needs a corrections contact.
  - PAYE (Your taxes version 2) waits for a test against KRA's examples.

- National product Phase 5, depth, on branch `feat/national-phase-5`, not pushed. New pages: `/debt/`, `/revenue/` and `/projects/`, in English and Kiswahili. Programme pages now show sub-programmes and the stated outcome. Vote pages show what the money pays for and the vote's projects. County pages show own-source revenue, grants, the wage and development rules checks, and pending bills.
- New data: 6,152 figures from 19 sources, data release 2026-11-03. Added:
  - the Controller of Budget's county detail tables;
  - the Annual Public Debt Report;
  - the approved Programme Based Budget;
  - all four approved Development Estimates volumes;
  - two sections of the PFM Act and one of the county regulations, read from Gazette copies.
- Every new table is proved against the Act or its own totals; see `national-budget/VERIFICATION.md`. Decisions #95 to #97 logged.
- `/track/` stays planned. The monthly Exchequer statements are in the Kenya Gazette, which Kenya Law serves behind a bot check, so the owner must download them. Programme targets wait for a person to type them (decision #97).

## Changes on 2 Nov 2026

- National product Phase 3, the app shell and design system, on branch `feat/national-phase-3`, not pushed. New: `apps/national` with five-section navigation, English and Kiswahili, the design tokens, the components and charts, a generated `_headers` file with a strict content security policy, and `/dev/components/` in preview builds. The only product page so far is the first screen of the home page. Decisions #91 and #92 logged. How to run it: `docs/national/README.md`; what was measured: `docs/national/DESIGN.md`.
- `EvidenceLabel`, `ChartFrame` and the number formats moved to `packages/engine`. Main site checked: 2,935 of 2,937 built files byte-identical, and the other two differ only in their build time.
- Tests: 264 unit tests pass, 72 browser checks pass, 24 visual comparisons pass. `npm audit` clean. Phase 2 counts corrected: the Act has 87 votes and 201 programmes (151 and 329 are rows).
- National product Phase 4, the core journeys, on branch `feat/national-phase-4`, not pushed. New in `apps/national`: the full home page, the year page, 12 sector groups, 87 votes, 201 programmes, 47 county pages with print sheets, county comparison, search and CSV downloads, in English and Kiswahili (803 pages). New data: the Parliamentary Budget Office's vote tables for two years and the Controller of Budget's county tables for two years, so 1,908 figures from 11 sources. Decisions #93 and #94 logged.
- All 87 votes in the Appropriation Act now agree with Parliament's tables within KSh 1m, and `check:national` enforces it. Two more scan errors in programme names were repaired.
- **Phase 4 is built, not finished.** The brief's test is usability round 1 with real readers, on tasks 1 to 3. It has not been run. The browser tests walk all five tasks with taps, but that shows the paths exist, not that people can use them.
- Next: usability round 1, a person's check of the sector map, then Phase 5 (depth: rules checks, bills and audits, `/track/`, `/projects/`, `/debt/`, `/revenue/`).
- Astro upgraded to 7.4.4 (decision #85), with dependencies pinned, Node pinned in `.nvmrc`, and a regression check of the existing site. On branch `feat/astro-7-upgrade`, not in `main`.
- National product Phase 2, the data engine, on branch `feat/national-phase-2`, not pushed. New: npm workspaces with `packages/engine` (figure registry, rules, comparison code, releases), `data/national/` (1,158 figures, 7 sources, first data release 2026-11-02), `data-src/national/` and `scripts/national/`. The Appropriation Act, 2026 and County Allocation of Revenue Act, 2026 are loaded. `npm run check:national` is new and runs in CI. Decision #90 logged. How to run it: `docs/national/README.md`; what is loaded: `docs/national/DATA.md`.
- Tests: 236 of 236 pass (140 existing, 96 new). Preview build passes, 2,817 pages. No page changed.
- Waiting on the owner: a route to archive copies for four sources (the Budget Summary, the Revenue Estimates and both Acts), a person's check of the rows on `data-src/national/person-checks.csv`, and who is responsible for each dataset. The 781.4 education figure stays `unverified`: the Act shows 784.48.

## Changes on 1 Nov 2026

- National budget prototype ("Kenya Budget Explained", working name) added in `national-budget/`, on branch `feat/national-budget-prototype`, not pushed. Its plan is `national-budget/BUILD_BRIEF.md` (decision #82).
- Its build scripts were ported from Python to Node (`build-data.mjs`, `assemble.mjs`), because Python is not installed on the owner's laptop. `npm test` now checks that `data.json` still matches `src/data`, so a correction there needs a rebuild of the page.
- National product Phase 0 finished: audit reported to the owner, decisions #82 to #87 logged, sector names and Treasury links fixed. The product will be a separate Astro app, `apps/national` (decision #83). Astro 7 upgrade is decided but not done (decision #85).
- National product Phase 1 written on branch `feat/national-phase-1`, not pushed: `docs/national/SITEMAP.md`, `docs/national/DESIGN.md` and a working design specimen, `docs/national/specimen.html`. Approved by the owner on 2 Nov 2026, with Dusk Violet as the accent (decisions #88, #89).

## Changes on 31 Oct 2026 (review and "implement all")

Committed as `b2cb102` on `feat/trust-and-launch-prep` and merged to `main` in PR #1 on 1 Nov 2026.

- Decisions #73–#80 added. Wording fixed: "bipartisan" and the misspelt publisher name in the footer; unqualified "independent" in About, the ward sheet, README, AGENTS and the brief.
- New pages: `/who-runs-us/`, `/privacy/`, `/terms/`, `/right-of-reply/`, `/impact/` (planned until the first entry). New data: `funders.json`, `impact.json`. Footer links to the trust pages; About menu updated.
- "Sub-county" columns and labels that showed constituencies now say "Constituency" (#75).
- `src/county.js` (county kit, #74); nav reads the constituencies from it.
- Election-period switch and `ElectionNotice.astro` (#77) on Government, Elections, Leaders, NY Watch.
- `/api/facts.json` with `src/lib/facts.js` and tests (#78). Data licence stated as CC BY 4.0 in the API wrapper and on Open data.
- NY Watch recast (#79): schema no longer requires a guest, but requires the data reviewed; page, home card, menu and EDITORIAL_RULES section 14 rewritten; section 9 now has the founder's recusal and the commercial firewall.
- Ward share images (#80): `public/brand/share/ward-<slug>.png` from `scripts/build-share-cards.mjs`, used by ward pages; test in `scripts/build-share-cards.test.js`.
- MCA source labelled honestly as a republished copy, pending a check against the Kenya Gazette (`leaders.json`: `mcaGazetteChecked: false`). Home health tile says "2017 national list".
- `.gitattributes` keeps Unix line endings (Windows clones broke `scripts/build-roads.test.js`), and keeps the published CSVs exactly as generated.
- Drafts (hidden until the editor publishes): `src/content/explainers/twelve-years-of-county-money.md` and `twelve-years-method.md`. Example NY Watch episode updated to the new format.

**Checks run on the laptop (31 Oct 2026, `npm run check:launch`, log in `check-launch.log`):** preview build passes, 2,813 pages, including the new pages and `/api/facts.json` (165 figures). Node tests: 137 of 138 pass; the one failure is `roads.json is reproducible…`, caused by Windows line endings, and clears after `git add --renormalize .`. The new pages were checked at 390 px and 1280 px: no sideways scroll, no script errors. Not yet done: Git is not on the Windows command-line PATH, so the script could not create the branch or renormalise (do both from VS Code's Source Control, or install Git for Windows with the PATH option); Python is not installed, so the Python data tests did not run there (they pass in the review workspace).

## Next

1. Add Git to the Windows command-line PATH; it works today only through Git Bash.
2. Confirm the exact registered company name against the certificate (`src/county.js`, `publisher.legalName`).
3. Lawyer review of `/who-runs-us/`, `/privacy/` and `/terms/`; set the spin-out date and criteria in `src/county.js` (`spinOut`).
4. Editor review and publication of the two money explainers (Sigma Awards deadline mid-January 2027), then the first ward receipts series.
5. Check every MCA against the Kenya Gazette; then set `mcaGazetteChecked: true` and replace `mcaSource`.
6. Refresh the health facility count from the current Kenya Master Health Facility List.
7. Page weight: done for the NG-CDF list (decision #81). The stylesheet stays as one file (about 20 KB compressed, cached).
8. County kit: move hard-coded "Nyamira" in older files to `src/county.js` as they are touched (#74).

## Before launch (needs a person)

1. Set `ND_SITE_URL=https://nyamiradaily.org` in the production build environment and verify hosting and DNS. Configure `contact`, `reportFormUrl`, `adoptSignupUrl` and `show.liveUrl` in `src/config.js` only when real, monitored destinations exist; the trust pages pick up the contact automatically.
2. Delete the EXAMPLE drafts in `src/content/` (alerts, episodes, fact-check, heritage, knowledge, news, people, project log, story).
3. Native-speaker review of every Kiswahili summary (new ones are marked in the page source); confirm emergency numbers before any alert goes live.
4. Agree who posts and verifies alerts (`docs/EDITORIAL_RULES.md` section 11).
5. Check the open items flagged in `data-src/research-notes/` (Tombe factory county; 2022 IEBC forms; NG-CDF court case; Finance Bill deadline amendment).

## Known gaps (data)

2022 full election results (IEBC forms unpublished); Auditor-General FY2014/15 and FY2015/16; milk prices; KHIS facility data (login); newer school statistics; NG-CDF project lists from the Board; reviewed facility coordinates; amounts paid and progress for tracker contracts.
