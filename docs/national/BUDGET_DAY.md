# Budget day

The Cabinet Secretary reads the budget statement in June, and the Appropriation Bill must be signed by 30 June (PFM Act s.39(1)). On the day, readers want to know what changed. The site's job is to show the official figures fast, each with its source, stage and label, and nothing else. **No figure is typed from a speech or a press report**: only from the documents the Treasury publishes that day, and a press figure stays `unverified` until a document confirms it.

The brief's budget-day page (`/budget-day/[fy]/`) is not built yet. It needs the estimates of the year it covers loaded first, and a page of "not yet loaded" boxes would be a placeholder. Build it from the April estimates, then fill it on the day.

## Before the day (from 30 April, when the estimates reach the National Assembly)

1. Download the estimates, the Budget Summary and the Programme Based Budget for the new year from `newsite.treasury.go.ke`, not `treasury.go.ke`, whose certificate has expired. Never turn off certificate checks.
2. Add each to `data/national/sources.json` with its SHA-256, and read it twice (`docs/national/README.md`, "Add a document").
3. Run `npm run check:national`, then put out a data release.
4. Build `/budget-day/<fy>/` from the estimates:
   - the biggest votes;
   - change on last year, approved against estimates, labelled as different stages and never subtracted;
   - the tax measures in the Finance Bill, each tagged "proposed".
5. Rehearse the day's steps below on a branch, against a copy of the estimates, and time them.

## On the day

| Step | Command | Time on the laptop, 3 Nov 2026 |
|---|---|---|
| 1. Download the budget statement documents; record each in `sources.json` | by hand | not timed |
| 2. Type the statement figures into the year's figure file, each with its page | by hand | not timed |
| 3. Check them against the pages | `node scripts/national/verify-pages.mjs` | 2 s |
| 4. Rules and cross-checks | `npm run check:national` | 2 s |
| 5. Rebuild the figure files, then the data release | `node scripts/national/build-figures.mjs`, `npm run release:national` | 1 s, then 1 s |
| 6. Build | `KBE_SITE_URL=<the domain> npm run build:national`. A build with no address stops, so a public build cannot point at the wrong place | 13 s |
| 7. Remake the infographics | `node e2e/infographics.mjs http://localhost:4321` with a preview running | about 4 min for 248 pictures |
| 8. Build again, run the checks | `npm run test:national:site` | 5.5 min for 572 checks |
| 9. Deploy | the founder's go-ahead, then Cloudflare Pages | not rehearsed |

## After the day

- The page stays as an archive of what was said that day.
- When the Appropriation Act is published, load it and put out a release. Figures that change go in `corrections.json` automatically, each with the reason from `reasons.json`.
- Link each committee's report once it is published.

## Never

- Never estimate a figure that a document does not give, even on the day.
- Never add figures of different stages, and never call a statement figure "approved".
- Never publish a tax measure as law before the Finance Act passes.
