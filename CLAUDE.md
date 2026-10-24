# Notes for AI coding assistants (and humans)

This repo is **Nyamira Daily**, an independent, non-partisan civic information website about Nyamira County, Kenya. Read `docs/PROJECT_BRIEF.md` for purpose and audience before making changes.

## Non-negotiables

- **Every figure has a source, a date and an evidence label** (`src/components/EvidenceLabel.astro`: verified, audit, official, unverified). Never add a number without them.
- **Never estimate, interpolate or invent data.** If a value is unknown, show it as unknown.
- **Questions, not accusations.** Repeat budgeting, stalled works or conflicting figures are presented as "questions to ask" with their source documents. Never write "corruption", "stole", "looted" or "ghost project" unless a court or competent authority has established it. Full rules: `docs/EDITORIAL_RULES.md`.
- **Non-partisan.** No content supporting or opposing any party, candidate or official.
- **Readers are on cheap phones and expensive data.** Keep pages light: one self-hosted font only (League Spartan 500 and 700, about 22 KB; see `docs/DECISIONS.md` #19), no big libraries, no client-side frameworks. Test at 390px width with no horizontal scroll.
- **Plain language.** Short sentences, explain terms, lead with the number.

## Conventions

- Astro 5 static site. Data lives in `src/data/*.json` and is rendered at build time; see `docs/DATA.md` for sources and refresh cadence.
- Two-layer pages: headline card (number, sentence, label, source) first; tables and caveats inside `<details>`.
- Tables that should stack on phones use `class="cards"` with `data-label` on each `<td>`.
- Unfinished pages go in the `planned` set in `src/config.js` (tagged "Planned", kept off the home page). Don't add "Coming soon" boxes.
- Navigation has two bars, both defined in `src/nav.js`: the six sections (primary) and the pages inside the current section (secondary). When you add a page, add it to its section's `pages` there; keep bar labels short.
- Ward filter: `data-ward-only="<slug>"`, `data-ward-row="<slug>"`, `data-set-ward="<slug>"`; the script is at the bottom of `src/layouts/Base.astro`.
- Number formatting: use `src/lib/fmt.js` (`ksh`, `num`, `date`). Avoid regex literals in frontmatter of pages with `getStaticPaths` (Astro compiler bug, see `docs/DECISIONS.md` #16).
- Colours are CSS tokens in `src/styles/global.css` with dark-mode overrides under `:root[data-theme="dark"]` (set by the header toggle script, see `docs/DECISIONS.md` #17); never hard-code colours in components. Logos that differ by mode come in pairs: `.for-light` (full-colour) and `.for-dark` (reverse), both `loading="lazy"`. Brand colours are the `--nd-*` tokens: Signal Green is for fills, marks and underlines, never text on white or paper; Record Red appears only in NY Watch elements (`.nyw`).
- Logos, icons and fonts are in `public/brand/`, copied unchanged from the brand kit. Never retype the wordmark, recolour, stretch or crop a logo; use the reverse versions on dark backgrounds. Where the show appears, use the NY Watch logo (`src/components/NyWatchLogo.astro`).
- Short Kiswahili summaries use `<div class="sw" lang="sw">`. Mark new ones for native-speaker review.
- Ward slugs: esise, mekenene, kiabonyoru, nyansiongo (Borabu); rigoma, gachuba, kemera, magombo, manga, gesima (Kitutu Masaba); nyamaiya, bogichora, bosamaro, bonyamatuta, township (West Mugirango); itibo, bomwagamo, bokeira, magwagwa, ekerenyo (North Mugirango).

## Before you finish a change

1. `npm run build` passes.
2. Check the changed pages at phone width (390px) and desktop, light and dark.
3. Any new figure has its source and label; any changed figure is noted for the corrections log.
4. Update `docs/DATA.md` if you added or refreshed a dataset, and `docs/DECISIONS.md` if you made a structural choice.
