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
| [`CLAUDE.md`](CLAUDE.md) | You use an AI coding assistant (it reads this automatically) |

## Run it

```
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # builds the site into dist/ (about 90 pages)
npm run preview  # serves the built site
```

Requires Node.js 18.20.8 or later (Astro 5).

## Where things live

| What | Where |
|---|---|
| Page layout, header, menu, ward picker, footer | `src/layouts/Base.astro` |
| Navigation: the six sections (primary bar) and the pages in each (secondary bar) | `src/nav.js` |
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

Today · Data · My Ward · Government · Constitution · Learn, plus Opportunities, Search, About and How we work.

The six sections form the primary navigation bar. Under it, a secondary bar lists the pages inside the section the reader is in (for Data: Money, Projects, Services, People, Open data…). Opportunities and Have your say sit under Today; My Ward's secondary bar jumps to each sub-county's wards. Both bars are defined in `src/nav.js`.

## Maps and the ward filter

- Maps are inline SVG drawn at build time from `src/data/geo.json`. No map library, no API key.
- To rebuild `geo.json`: `python3 scripts/build-geo.py data-src/ward-boundaries.json data-src/osm-points.json`.
- The "Your ward" picker saves the reader's choice in their browser (localStorage). Pages with ward content contain every ward's version; a small script in `Base.astro` shows the chosen one (`data-ward-only`, `data-ward-row`, `data-set-ward` attributes).
- Without JavaScript, readers get plain links to every ward page.

## Hosting

`npm run build` produces plain HTML in `dist/`. Host it free on Netlify, Cloudflare Pages or GitHub Pages. Set the real domain in `astro.config.mjs` (`site`) before launch.

## The one rule

Every number needs a source, a date and an evidence label (Verified, Audit finding, Official claim, Unverified). Never present a question as an accusation. Details in `docs/EDITORIAL_RULES.md`.
