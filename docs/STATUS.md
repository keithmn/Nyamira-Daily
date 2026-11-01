# Status and handover (31 Oct 2026)

For any assistant or developer picking this up (Codex, Claude Code, a person). Read `AGENTS.md`, then this page, then `docs/DECISIONS.md`. Older handover notes, with the history of each feature, are in `docs/STATUS_ARCHIVE.md`.

## Where things stand

- **The site:** a static Astro 5 site in eight sections (`src/nav.js`), with real data for money (12 years), ward pages, projects and the project tracker, services, census, leaders, the Assembly, county laws, fees, opportunities, constitution summaries, search and open data. Text content lives in `src/content/`; only one explainer and one number of the week are published so far, and two money explainers are drafted.
- **Who runs it (decision #73):** built and published by Underdogs Rising Group Limited, editorially independent, with a commitment to spin out into a non-profit. Trust pages: `/who-runs-us/`, `/right-of-reply/`, `/privacy/`, `/terms/`.
- **NY Watch (decision #79):** the founder's data review podcast. No episodes published yet.

## Changes on 31 Oct 2026 (review and "implement all")

Made in the working tree on the owner's laptop, not yet committed. Suggested branch: `feat/trust-and-launch-prep`.

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

1. Create the branch `feat/trust-and-launch-prep` in VS Code, run `git add --renormalize .` once (needs Git on the PATH), then `npm test` again: all tests should pass.
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
