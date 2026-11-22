# Data intake plan

How community data, field observations and external sources reach the site.
The living data pipeline (`npm run living:sync`) is designed and built; this document tracks what's needed to activate each intake channel.

## Phase 1: Google Forms (now → 3 months)

Lowest barrier. Anyone with a phone and a Google account can submit. A person reviews submissions in the spreadsheet before syncing.

| Form | Collects | Goes into | Reviewer checks |
|---|---|---|---|
| **Place observation** | Ward, place, open/closed, condition, services, photo | `living/events.json` via the Google Sheet `events` tab | Place exists, status/condition is one of the valid values, evidence label assigned |
| **Market price** | Market, item, unit, quantity, price, seller, date | `living/prices.json` via the Google Sheet or a dedicated form | Price is plausible (not 10× or 0.1× the previous), item/unit match |
| **Road condition** | Ward, road, condition, what can pass, photo | `living/events.json` via the Google Sheet `events` tab | Road exists in `roads.json`, condition is one of the valid values |
| **Alert status update** | Alert ID, new status, date, source | `living/events.json` with `place: "alert:<id>"` | Alert exists, status transition is valid (active→monitoring→resolved) |
| **Correction** | Page, what's wrong, source | Google Sheet (until D1 inbox is configured) | Source checks out, the correction is factual not opinion |

**Setup steps:**
1. Create a Google Sheet with the tabs from `fieldwork/sheets/` templates
2. File → Share → Publish to web → choose each tab → CSV
3. Put the CSV links in `.env` (`SHEET_EVENTS_CSV`, `SHEET_VIDEOS_CSV`)
4. Create Google Forms that feed into the sheet (one per form type above)
5. Test with one real observation, run `npm run living:sync`, verify the build

**Who reviews:** One person with spreadsheet access checks new rows, adds their initials to `reviewed_by`, and runs the sync. Cadence: daily during active fieldwork, weekly otherwise.

## Phase 2: KoboToolbox (3–6 months)

For trained field reporters doing structured visits. Kobo works offline, enforces the form schema, and handles photos.

**Prerequisites:**
- Field reporters recruited and trained on the three Kobo forms (`fieldwork/kobo/`)
- KoboToolbox account set up, forms uploaded
- Environment variables for the sync script (`KOBO_TOKEN`, form asset IDs)

**Activation:**
1. `npm run fieldwork:forms` to build the .xlsx forms with current place/ward lists
2. Upload to KoboToolbox
3. Field reporters submit; reviewer sets each to Approved in Kobo's data table
4. `npm run living:sync` pulls approved submissions

## Phase 3: Cloudflare D1 corrections inbox (6+ months)

For the site's own report forms (`/review/facilities/`, `/review/roads/`). Needs:

- [ ] Cloudflare D1 database provisioned and migrations run (`npm run db:migrate:remote`)
- [ ] Anti-spam: Cloudflare Turnstile on the report forms (the wrangler config exists)
- [ ] Reviewer access: a simple authenticated page or a webhook to the Google Sheet
- [ ] Retention policy: how long raw submissions are kept, when they're deleted
- [ ] Monitoring: alerts if the inbox fills up or submissions spike

Until D1 is configured, report forms are disabled. When it's ready:
1. Enable the form endpoints in the Cloudflare Pages functions
2. Reviewed submissions export as JSON, imported with `node scripts/import-facility-observations.js` or `node scripts/import-road-conditions.js`
3. The living:sync script converts these into events

## External data sources with access barriers

| Data | Source | Current state | Realistic refresh |
|---|---|---|---|
| Market prices | KAMIS (kamis.kilimo.go.ke) | Blocks cloud servers | Via Google Form from someone in Kenya, or KAMIS data shared by a contact |
| Health facility services | MoH KHIS | Login required | Annual, from published KDHS reports |
| Assembly Hansards | nyamiraassembly.go.ke | Published irregularly | As published, downloaded manually |
| Census by ward | KNBS | Doesn't exist at ward level | Next census (2029) |
| NG-CDF project lists | NG-CDF Board | "Coming soon" for years | From audit reports when published |
| CoB quarterly reports | cob.go.ke | Published ~quarterly | Downloaded manually each quarter |

Pages showing data from these sources should state their refresh cadence honestly: "Updated annually from published reports" or "Last checked: [date]". The site's credibility depends on not implying live data it can't deliver.
