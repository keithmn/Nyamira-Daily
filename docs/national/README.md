# Kenya Budget Explained: how to run it

"Kenya Budget Explained" is a working name. The plan is `national-budget/BUILD_BRIEF.md`, and the pages to come are in `SITEMAP.md` and `DESIGN.md` in this folder. `DATA.md` lists what is loaded.

## What exists today

| Where | What it is |
|---|---|
| `packages/engine/` | `@kbe/engine`: the figure and source schemas, the rules, the only code allowed to add or compare figures, citations and release logic |
| `data/national/` | What the product reads: `sources.json`, `figures/`, `releases/`, `corrections.json`, `reasons.json` |
| `data-src/national/` | Where figures come from: the CSVs for each document, and `person-checks.csv`. `pdfs/` holds the stored documents and is not in Git |
| `scripts/national/` | The extractor, the figure builder, double entry, the page search, releases and the master check |

`apps/national`, the site itself, comes in Phase 3. No page reads this data yet.

## Run the checks

```
npm install
npm test
npm run check:national
```

`check:national` fails on a broken rule, a table whose two readings disagree, a generated file out of step with its CSV, a figure missing from the latest release, or a stored PDF that has changed. It warns, without failing, about overdue documents, sources with no archive copy and tables waiting for a person.

`node scripts/national/verify-pages.mjs` searches each hand-typed figure's PDF page for its value. It needs `pdftotext` and the stored PDFs, so it runs on the laptop and not in CI. Run it after changing `data/national/figures/budget-2026-27.json`.

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
