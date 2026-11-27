# Fieldwork: forms, the sheet and the sync

How the living data gets onto the site (decisions #110, #114, #115). Two tools collect it, a person reviews it, and a script brings the reviewed rows into `src/data/living/`.

| Tool | For | Reviewed in |
|---|---|---|
| **KoboToolbox** | Field visits on a phone, offline: places, roads, market prices | Kobo's own data table: set each submission to **Approved** or **Not approved** |
| **Google Sheets** | Desk updates: a change seen in a document, videos, seat holders, budget stages | The `reviewed_by` column: a row counts only once a reviewer puts their initials there |

Nothing reaches the site until a person has reviewed it.

## The three Kobo forms

Built from the CSV sources in `fieldwork/kobo/<form>/` by `npm run fieldwork:forms`, which also adds the ward list and today's 686 places from the site's data. Upload the `.xlsx` to KoboToolbox (Projects → New → Upload an XLSForm). After the list of places changes, rebuild and replace the form in Kobo ("Replace form"), keeping the same project so the old submissions stay.

| Form | File | Records |
|---|---|---|
| Place visit | `kobo/place-visit.xlsx` | Ward, place (or a new one), location, open or not, condition, services seen working, staff on duty, water, power, photos, video ID |
| Road check | `kobo/road-check.xlsx` | Ward, road (or a new one), location, condition (good to impassable), what can pass, drains, works, photo, video ID |
| Market prices | `kobo/market-prices.xlsx` | Ward, market, then a repeat of item, unit, quantity, price and seller type |

**Privacy.** Every form ends with a box the recorder must tick: no names, faces or phone numbers. The notes field is for the reviewer and is never published. The sync copies only the fields listed in `scripts/living/sync.mjs`; photos and notes stay in Kobo.

**Who recorded it.** "Gusii Daily field team" becomes a `visit` with the label Verified; "A resident" becomes a `resident-report` with the label Unverified.

## The Google Sheet

One sheet with four tabs. The CSV files in `fieldwork/sheets/` are the templates: copy their header rows into the tabs (delete the example rows). Then File → Share → Publish to web → choose each tab → CSV, and put the four links in the environment (below).

| Tab | Template | One row is |
|---|---|---|
| `events` | `sheets/events.csv` | One change to one place, from a document or a phone call: `place_id`, `field` (`status`, `condition` or `service:<name>`), `value`, `observed_on`, `method`, `source`, `evidence`, `reviewed_by`, `video_id` |
| `videos` | `sheets/videos.csv` | One published video: our ID (it becomes `/watch/<id>/`), title, YouTube ID, date, the places it covers (space-separated place IDs), `links` to the site pages with its figures (`/money/2025-26/ Budget 2025/26; /map/health/ Health`: an address, a space, its label, separated by semicolons), a summary |
| `seats` | `sheets/seats.csv` | A change of seat holder, with its source (for the Administration page) |
| `budget-stages` | `sheets/budget-stages.csv` | A budget step reached: year, stage, date, document, source |

Values are the ones the site accepts (`src/lib/places.js`): status `open`, `closed`, `under-construction`, `stalled`, `unknown`; condition `good`, `fair`, `poor`, `impassable`, `unknown`; method `visit`, `resident-report`, `document`; evidence `verified`, `audit`, `official`, `unverified`.

### Alert status updates

Alert status changes (active → monitoring → resolved) can also be tracked as living events, so a field reporter can update an alert's status from a phone form or the Google Sheet without touching git. Use `alert:<id>` as the place ID (where `<id>` is the alert's filename without `.md`), `status` as the field, and `active`, `monitoring` or `resolved` as the value. If the event's `observed_on` is newer than the Markdown entry's `updatedAt`, the event's status wins at build time. The Markdown file still holds the narrative (title, summary, advice, contacts, sources).

## The sync

```
npm run living:sync                 # Kobo and the sheet, using the environment below
npm run living:sync -- --from-dir <folder>   # the same, from exported files (for testing, or with no internet)
```

Environment (never commit these):

| Variable | What |
|---|---|
| `KOBO_TOKEN` | Your Kobo API token (Account settings → Security) |
| `KOBO_SERVER` | Optional; defaults to `https://kf.kobotoolbox.org` |
| `KOBO_PLACE_VISIT`, `KOBO_ROAD_CHECK`, `KOBO_MARKET_PRICES` | Each form's asset ID (the part after `/forms/` in its Kobo address) |
| `SHEET_EVENTS_CSV`, `SHEET_VIDEOS_CSV` | The published CSV links of those tabs |

The sync writes `src/data/living/events.json` (changes to places), `prices.json` (market prices) and `videos.json`, and `new-places.json` for places a recorder said were not on the list (for a person to add to the registry). It also converts the reviewed reports in `src/data/facility-observations.json` and `road-conditions.json`, which come from the site's own report forms. Run it, check the diff, run `npm run build`, then commit: Git keeps the full history.

`/review/changes/` (not indexed) lists what changed and which places are due a return visit: the queue for update videos.
