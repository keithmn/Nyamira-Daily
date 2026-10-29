# Notes for AI coding assistants (and humans)

This is the one rulebook for every assistant on this repo. Codex reads it directly; Claude Code reads it through `CLAUDE.md`. Edit the rules here.

This repo is **Nyamira Daily**, an independent, non-partisan civic information website about Nyamira County, Kenya. Read `docs/PROJECT_BRIEF.md` for purpose and audience before making changes.

## How we work (Codex, Claude Code or a person)

1. Start by reading this file, then `docs/STATUS.md` (where things stand) and `docs/DECISIONS.md`.
2. One branch per task, named after it. Don't commit straight to `main`.
3. Before finishing, run the checklist at the end of this file and update `docs/STATUS.md` with what changed and what's next, so whoever picks up next (another assistant or a person) knows where things are.
4. Don't push, merge into `main` or delete files without the owner's go-ahead.
5. Never commit `.bundle` files, `node_modules/` or `dist/`.

## Non-negotiables

- **Every figure has a source, a date and an evidence label** (`src/components/EvidenceLabel.astro`: verified, audit, official, unverified). Never add a number without them.
- **Never estimate, interpolate or invent data.** If a value is unknown, show it as unknown.
- **Questions, not accusations.** Repeat budgeting, stalled works or conflicting figures are presented as "questions to ask" with their source documents. Never write "corruption", "stole", "looted" or "ghost project" unless a court or competent authority has established it. Full rules: `docs/EDITORIAL_RULES.md`.
- **Non-partisan.** No content supporting or opposing any party, candidate or official.
- **Readers are on cheap phones and expensive data.** Keep pages light: self-host League Spartan 500/700 for body and figures plus Google Fonts' Latin woff2 of the Varela Round title font (about 16 KB; see `docs/DECISIONS.md` #46), no big libraries, no client-side frameworks. Test at 390px width with no horizontal scroll.
- **Plain language.** Short sentences, explain terms, lead with the number.

## Conventions

- Astro 5 static site. Data lives in `src/data/*.json` and is rendered at build time; see `docs/DATA.md` for sources and refresh cadence.
- Two-layer pages: headline card (number, sentence, label, source) first; tables and caveats inside `<details>`.
- Tables that should stack on phones use `class="cards"` with `data-label` on each `<td>`.
- Unfinished pages go in the `planned` set in `src/config.js` (tagged "Planned", kept off the home page). Don't add "Coming soon" boxes.
- Navigation is defined in `src/nav.js` (#60): seven sections (Today, Wards, Data, Community, Government, Take part, Learn), each with pages. When you add a page, add it to its section's `pages` with a short `label`, an `icon` from `src/lib/icons.js` and a one-line `desc`; the desktop mega menu, the phone sheet and the secondary tab bar all read from it.
- Ward filter: `data-ward-only="<slug>"`, `data-ward-row="<slug>"`, `data-set-ward="<slug>"`; the script is at the bottom of `src/layouts/Base.astro`.
- Number formatting: use `src/lib/fmt.js` (`ksh`, `num`, `date`). Avoid regex literals in frontmatter of pages with `getStaticPaths` (Astro compiler bug, see `docs/DECISIONS.md` #16).
- Colours are CSS tokens in `src/styles/global.css` with dark-mode overrides under `:root[data-theme="dark"]` (set by the header toggle script, see `docs/DECISIONS.md` #17); never hard-code colours in components. Logos that differ by mode come in pairs: `.for-light` (full-colour) and `.for-dark` (reverse), both `loading="lazy"`. Brand colours are the `--nd-*` tokens: Signal Green is for fills, marks and underlines, never text on white or paper; Colour roles (`docs/DECISIONS.md` #24): Signal Green is the main colour, Record Red the secondary, Ink and White the neutrals. Red marks critical numbers, meaning the gap (money not spent, unpaid bills, work at 0%, revenue short of target), plus questions to ask, deadlines and the show. Red text uses `--accent-ink`, red fills `--accent`. **On maps red means an emergency alert and nothing else** (#25): never use red or amber for map points. Never put red on evidence labels or pair it with words of blame. Charts and infographics live in `src/components/viz/` (dots out of 100, split bars, horizontal bars, pictograms); prefer them to tables for the first layer.
- Logos, icons and fonts are in `public/brand/`, copied unchanged from the brand kit. Never retype the wordmark, recolour, stretch or crop a logo; use the reverse versions on dark backgrounds. Where the show appears, use the NY Watch logo (`src/components/NyWatchLogo.astro`).
- Short Kiswahili summaries use `<div class="sw" lang="sw">`. Mark new ones for native-speaker review.
- Ward slugs: esise, mekenene, kiabonyoru, nyansiongo (Borabu); rigoma, gachuba, kemera, magombo, manga, gesima (Kitutu Masaba); nyamaiya, bogichora, bosamaro, bonyamatuta, township (West Mugirango); itibo, bomwagamo, bokeira, magwagwa, ekerenyo (North Mugirango).

- **Structure (#30, #58):** Data is five sector pages (`src/data/topics.js`: money, health, education, farming, open-data); People and places is under Community (`/community/people-and-places/`) with Notion-style toggles (`src/components/Toggle.astro`; a link to `#id` opens it). Elections live under Government, the four constituencies at `/constituency/<slug>/` (with NG-CDF, which is national money and must never be added to county figures). Old data URLs redirect (`astro.config.mjs`).
- **Highlands palette:** sector colours via `.sec-<tone>` classes and `--hl-*` tokens; `PageHead tone=` gives a coloured head. See `docs/BRAND_BRIEF.md`.
- **Roads (#57):** `src/data/roads.json` is generated by `scripts/build-roads.js` from the county records and the reviewed `data-src/road-identities.json`; never edit it by hand. Group records into one road only with recorded confirmation, and never present one contract reported in two documents as two allocations.
- Text content (explainers, fact-checks, stories, people, heritage, number of the week, alerts) lives in `src/content/` (schemas in `src/content.config.ts`). `draft: true` entries are hidden unless built with `ND_DRAFTS=1`. Alerts follow `docs/EDITORIAL_RULES.md` section 11.
- The expansion plan is `docs/EXPANSION_SPEC.md`; work one phase at a time.

## Before you finish a change

1. `npm run build` passes.
2. Check the changed pages at phone width (390px) and desktop, light and dark.
3. Any new figure has its source and label; any changed figure is noted for the corrections log.
4. Update `docs/DATA.md` if you added or refreshed a dataset, and `docs/DECISIONS.md` if you made a structural choice.
