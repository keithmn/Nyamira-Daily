# Kenya Budget Explained: how to run it

"Kenya Budget Explained" is a working name. The plan is `national-budget/BUILD_BRIEF.md`, and the pages to come are in `SITEMAP.md` and `DESIGN.md` in this folder. `DATA.md` lists what is loaded.

## What exists today

| Where | What it is |
|---|---|
| `packages/engine/` | `@kbe/engine`: the figure and source schemas, the rules, the only code allowed to add or compare figures, citations and release logic |
| `data/national/` | What the product reads: `sources.json`, `figures/`, `releases/`, `corrections.json`, `reasons.json` |
| `data-src/national/` | Where figures come from: the CSVs for each document, and `person-checks.csv`. `pdfs/` holds the stored documents and is not in Git |
| `scripts/national/` | The extractor, the figure builder, double entry, the page search, releases and the master check |
| `apps/national/` | The site: `src/pages`, components, `src/lib` (all arithmetic), `src/i18n`, `src/scripts/app.js`, `e2e` (browser tests) |

So far the site has, in English and Kiswahili: the home page, the year page, all 12 sector groups, all 87 votes, all 201 programmes, all 47 counties with their print sheets, county comparison and search. That is 803 pages, plus CSV files in `/data/` and the component library in preview builds. The Track, Learn and Data sections go to routes still listed in `PLANNED` in `src/lib/routes.js`.

Views are in `src/components/pages/`. Each route is a thin file in `src/pages/` and its twin in `src/pages/sw/`, which only name the paths, the title and the view.

## Run the site

```
npm run dev:national
```

Then open <http://localhost:4321/> and <http://localhost:4321/dev/components/>.

A public build needs its address, and a preview build needs a flag instead. Previews carry `/dev/` and `noindex`. In Git Bash:

```
KBE_SITE_URL=https://the-final-domain.example npm run build:national
KBE_PREVIEW_BUILD=1 npm run build:national
```

`KBE_BASE` puts the whole site under a prefix. The output is `apps/national/dist`, including its `_headers` file. The Cloudflare Pages project does not exist yet: it needs the root folder of this repo, the build command `npm run build:national`, the output folder above, and `KBE_SITE_URL`.

## Run the checks

```
npm install
npm test
npm run check:national
npm run test:national:site
npm run test:national:visual
```

`test:national:site` builds the app, then checks axe, heading order, tap targets, sideways scroll, script errors under the real security policy, JavaScript off, keyboard use, weight and internal links, and walks the five usability tasks with taps at 390px. It takes about four minutes, runs in CI and needs Chrome installed. Passing it does not replace the rounds with real readers in section 9 of the brief.

`test:national:visual` compares six key parts of the pages, at 390 and 1280, light and dark, with saved pictures. It runs on the laptop only. After a deliberate change, run it with `-- --update-snapshots` and look at the new pictures before committing them.

`check:national` fails on a broken rule, a table whose two readings disagree, a generated file out of step with its CSV, a figure missing from the latest release, or a stored PDF that has changed. It warns, without failing, about overdue documents, sources with no archive copy and tables waiting for a person.

`node scripts/national/verify-pages.mjs` searches each hand-typed figure's PDF page for its value. It needs `pdftotext` and the stored PDFs, so it runs on the laptop and not in CI. Run it after changing `data/national/figures/budget-2026-27.json`.

## Add a page

1. Put the page in `src/pages/` and its Kiswahili twin in `src/pages/sw/`, both using one shared component with a `lang` prop.
2. Remove its route from `PLANNED` in `src/lib/routes.js`. The link check fails on a link that is neither built nor planned.
3. Ask for figures by id with `fig()`. An unknown id stops the build. Any arithmetic goes in `src/lib`, with a test, and adding or comparing figures goes through `@kbe/engine/compare`.
4. Put every word in `src/i18n/en.json` and `sw.json`. A test fails if the two differ, and a missing key stops the build. All Kiswahili waits for a native speaker's review.
5. Add the page to `PAGES` and `TEMPLATES` in `e2e/site.spec.mjs`, so axe, phones and weight cover it.

## Add a document

1. Save the PDF in `data-src/national/pdfs/`. Kenya Law blocks scripts, so a person downloads anything from it.
2. Add it to `data/national/sources.json` with its SHA-256, page offset, tolerance and next expected date.
3. Read it twice into `data-src/national/<doc>/extract.csv` and `typed.csv`. Use a script for the first reading and a second method or a typist for the other. A picture-only table gets a row in `person-checks.csv` and a check against other documents instead.
4. Compare the readings in `scripts/national/double-entry.mjs`. Resolve every disagreement from the page image and record the reason in the document's `corrections.csv`. Never correct a figure in code.
5. Generate the figures in `scripts/national/build-figures.mjs`. Add tests in `check-national.test.mjs`, and an entry in `national-budget/VERIFICATION.md`.
6. Put out a data release.

## Correct a figure

Change the CSV, or `budget-2026-27.json` for the typed figures, then run `node scripts/national/build-figures.mjs`. Never edit the generated files by hand: `check:national` notices. The change goes out in the next release, which refuses to run until the reason is written.

## Put out a data release

1. Write a reason in `data/national/reasons.json` for every changed or removed figure, keyed by id. A person writes these: they are shown to the public (decision #44).
2. Run `npm run release:national`. It writes `data/national/releases/YYYY-MM-DD.json` and adds to `corrections.json`.

Ids are never reused. Adding a figure needs no reason.

## The rules, in short

- Claude Code's checks are recorded, but only a person's check earns `verified`. The registry rejects anything else.
- A dash in a document gives no figure, never a zero.
- Figures add up only within one year, stage, grouping, money type and unit. NG-CDF is never added to county money.
- A sum that a document does not print is our calculation, with a `calc` the build recomputes.
