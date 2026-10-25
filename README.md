# Nyamira Daily

An independent, non-partisan information service about Nyamira County, Kenya: its money, projects, services, laws and leaders, in plain language, with a source behind every fact.

**New here? Read [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) first.** It explains what the site is for, who it serves and what we are trying to achieve.

| Doc | Read it when |
|---|---|
| [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) | You want the purpose, audience and structure of the site |
| [`docs/EDITORIAL_RULES.md`](docs/EDITORIAL_RULES.md) | Before adding or changing any fact, figure or claim |
| [`docs/DATA.md`](docs/DATA.md) | You touch anything in `src/data/` or need to refresh a dataset |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | You wonder why something is built the way it is |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | You're looking for what to build next |
| [`docs/BRAND_BRIEF.md`](docs/BRAND_BRIEF.md) | You're working on the logo, colours, fonts or visual design |
| [`AGENTS.md`](AGENTS.md) | You use an AI coding assistant: the project rules (Codex reads it directly, Claude Code through `CLAUDE.md`) |

## Run it

```
npm install
npm run dev      # local preview at http://localhost:4321
ND_PREVIEW_BUILD=1 npm run build  # local preview build into dist/ (uses localhost URLs)
npm run preview  # serves the built site
npm test         # Node regression tests
python3 -m unittest discover -s scripts -p 'test_*.py'  # data and export safeguards
```

Requires Node.js 18.20.8 or later (Astro 5). Python 3 is used by data scripts and their tests.

## Where things live

| What | Where |
|---|---|
| Page layout, header, menu, ward picker, footer | `src/layouts/Base.astro` |
| Navigation: the six sections and the menu of pages in each | `src/nav.js` |
| Colours (light and dark), spacing, components' styles | `src/styles/global.css` |
| Logos, icons, fonts, default share image | `public/brand/` (from the brand kit; see `docs/BRAND_BRIEF.md`) |
| Shared components (evidence labels, stat cards, maps, charts, ward panel) | `src/components/` |
| Pages (one file = one URL) | `src/pages/` |
| All site data (JSON) | `src/data/` (see `docs/DATA.md`) |
| Formatting helpers, project helpers | `src/lib/` |
| Site switches: contact channel, planned pages | `src/config.js` |
| Downloadable CSVs for readers | `public/files/` |
| Map source data and generator | `data-src/`, `scripts/build-geo.py` |

## Sections

Today · Wards · Data · Government · Constitution · Learn, plus Opportunities, Search, About and How we work.

The six sections form the navigation bar. Tapping a section opens a menu listing everything in it: the section's own page first, then its pages (for Data: Money, Projects, Services, People, Open data…). The Assembly's pages appear under The Assembly, and My Ward lists all 20 wards by sub-county. Opportunities and Have your say sit under Today. Without JavaScript the sections are plain links to their pages. The menus are defined in `src/nav.js`.

## Maps and the ward filter

- Maps are inline SVG drawn at build time from `src/data/geo.json`. No map library, no API key.
- To rebuild `geo.json`: `python3 scripts/build-geo.py data-src/ward-boundaries.json data-src/osm-points.json`.
- The "Your ward" picker saves the reader's choice in their browser (localStorage). Pages with ward content contain every ward's version; a small script in `Base.astro` shows the chosen one (`data-ward-only`, `data-ward-row`, `data-set-ward` attributes).
- Without JavaScript, readers get plain links to every ward page.

## Hosting

Public builds require `ND_SITE_URL=https://your-real-domain` and reject placeholder/local domains. `ND_PREVIEW_BUILD=1` is only for local preview builds; production hosting environments reject it. Public builds also reject `ND_DRAFTS=1`. The owner supplied `nyamiradaily.org`; configure the deployment environment with `ND_SITE_URL=https://nyamiradaily.org`. A successful local build does not verify DNS, hosting settings, or deployment.

## The one rule

Every number needs a source, a date and an evidence label (Verified, Audit finding, Official claim, Unverified). Never present a question as an accusation. Details in `docs/EDITORIAL_RULES.md`.
