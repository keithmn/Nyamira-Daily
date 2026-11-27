# Notes for AI coding assistants (and humans)

This is the one rulebook for every assistant on this repo. Codex reads it directly; Claude Code reads it through `CLAUDE.md`. Edit the rules here.

This repo is **Gusii Daily**, a non-partisan, editorially independent civic information and cultural knowledge website covering the Abagusii community across Nyamira and Kisii counties, Kenya. It is built and published by Underdogs Rising Group Limited, with a public commitment to spin out into its own non-profit (`docs/DECISIONS.md` #73). Never call it a non-profit, NGO, charity or PBO until that entity exists. Read `docs/PROJECT_BRIEF.md` for purpose and audience before making changes.

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

- Astro 7 static site. Data lives in `src/data/*.json` and is rendered at build time; see `docs/DATA.md` for sources and refresh cadence.
- The national product is a separate app in `apps/national`, with its own tokens and rules: read `docs/national/README.md` before changing it. Code both apps use lives in `packages/engine`; never copy it.
- Two-layer pages: headline card (number, sentence, label, source) first; tables and caveats inside `<details>`.
- Tables that should stack on phones use `class="cards"` with `data-label` on each `<td>`.
- Unfinished pages go in the `planned` set in `src/config.js` (tagged "Planned", kept off the home page). Don't add "Coming soon" boxes.
- Navigation is defined in `src/nav.js` (decision #112, reordered for the Gusii Daily rebrand): five sections (Gusii, Places, Money, Stories, About), each with pages. Gusii (language and cultural knowledge, at `/community/`) leads. Use "Gusii" for the brand and section names; keep "Ekegusii" for the language itself. When you add a page, add it to its section's `pages` with a short `label`, an `icon` from `src/lib/icons.js` and a one-line `desc`; the desktop mega menu, the phone sheet and the secondary tab bar all read from it. Removed pages redirect through `redirects.json` (read by `astro.config.mjs`); when you remove or move a page, add its old address there.
- Ward filter: `data-ward-only="<slug>"`, `data-ward-row="<slug>"`, `data-set-ward="<slug>"`; the script is at the bottom of `src/layouts/Base.astro`.
- Number formatting: use `src/lib/fmt.js` (`ksh`, `num`, `date`). Avoid regex literals in frontmatter of pages with `getStaticPaths` (Astro compiler bug, see `docs/DECISIONS.md` #16).
- Colours (decision #110): **Signal Green and charcoal only.** Every colour value is written once, in the palette block at the top of `src/styles/global.css` (`--nd-green`, `--nd-green-deep`, `--nd-green-soft`, `--nd-charcoal`, the `--ch-*` charcoal steps, paper and white); never hard-code a colour in a component or add a new hue. Green is for fills, marks, bars and underlines, never text on white or paper; text is charcoal. There is one theme: light pages with charcoal bands (`.on-ink`, page heads, the map, the footer). There is no dark mode and no red. A gap (money not spent, unpaid bills, work at 0%) is charcoal hatching (`--gap-fill`) or a hollow mark, with its number in bold. Evidence labels differ by word and shape, not hue: verified green filled, audit charcoal filled, official charcoal outline, unverified dashed outline. Charts and infographics live in `src/components/viz/` (dots out of 100, split bars, horizontal bars, pictograms); prefer them to tables for the first layer.
- Logos, icons and fonts are in `public/brand/`, copied unchanged from the brand kit. Never retype the wordmark, recolour, stretch or crop a logo; use the reverse versions on charcoal. The NY Watch name and logo are retired (decision #110) and go with their pages in phase R2.
- Short Kiswahili summaries use `<div class="sw" lang="sw">`. Mark new ones for native-speaker review.
- Ward slugs: esise, mekenene, kiabonyoru, nyansiongo (Borabu); rigoma, gachuba, kemera, magombo, manga, gesima (Kitutu Masaba); nyamaiya, bogichora, bosamaro, bonyamatuta, township (West Mugirango); itibo, bomwagamo, bokeira, magwagwa, ekerenyo (North Mugirango).

- **Structure (#110, #112):** Map holds the county map, the ward pages, places (facilities, projects, roads), Health, Education and Report a place; Money holds the county budget pages, Farming, the contracts tracker, the budget calendar and fees; Watch holds explainers and the number of the week; Administration lists who holds each seat (no party, photos or profiles); About holds the trust pages, open data and the glossary. Addresses: `/map/` (with `/map/health/`, `/map/education/`), `/ward/`, `/money/` (with `/money/farming/`, `/money/calendar/`, `/money/fees/`), `/watch/`, `/administration/`, `/about/` (with `/about/data/`, `/about/glossary/`). Topic pages are one component, `src/components/TopicPage.astro`, with a small route file per address; `topicPath` in `src/data/topics.js` gives each address. NG-CDF is national money and must never be added to county figures.
- **Section colours are retired (decision #110).** The `.sec-<tone>` classes and `PageHead tone=` still appear on pages but no longer change colour: every section uses the `--sec` tokens (Signal Green on white, charcoal heads).
- **Living data (#114, #115):** changes to places (status, condition, services) are dated events in `src/data/living/events.json`, written only by `npm run living:sync` from reviewed KoboToolbox submissions and Google Sheet rows (`fieldwork/README.md`). Never edit an old event or overwrite a static record; add a new event. Never copy names, phone numbers, notes or photos out of Kobo.
- **Roads (#57):** `src/data/roads.json` is generated by `scripts/build-roads.js` from the county records and the reviewed `data-src/road-identities.json`; never edit it by hand. Group records into one road only with recorded confirmation, and never present one contract reported in two documents as two allocations.
- Text content (explainers, fact-checks, stories, people, heritage, number of the week, alerts, news briefs, show and NY Watch episodes, cultural knowledge) lives in `src/content/` (schemas in `src/content.config.ts`). `draft: true` entries are hidden unless built with `ND_DRAFTS=1`. Alerts follow `docs/EDITORIAL_RULES.md` section 11.
- The expansion plan is `docs/EXPANSION_SPEC.md`; work one phase at a time.

## Before you finish a change

1. `npm run build` passes.
2. Check the changed pages at phone width (390px) and desktop.
3. Any new figure has its source and label; any changed figure is noted for the corrections log.
4. Update `docs/DATA.md` if you added or refreshed a dataset, and `docs/DECISIONS.md` if you made a structural choice.
