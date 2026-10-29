# Corrections review service

The public site remains a static Astro site. Optional Cloudflare Pages Functions receive correction reports and write them to Cloudflare D1. Editors review reports in a separate inbox protected by Cloudflare Access. The database is not queried by public pages.

## Current state

- The public form is **disabled by default**.
- No Cloudflare account, database, Turnstile widget, Access application or production deployment has been created from this repository.
- No reviewer or response cadence has been assigned. Do not enable public intake until the site owner assigns an inbox owner and checks the queue regularly.
- The form does not ask for a name, email, telephone number or file upload. It warns people not to submit personal or sensitive details. Submissions are unverified leads.
- A successful submission means the report was stored in D1. It does not mean anyone has reviewed it, and the sender is not promised a reply.
- Accepting a report records the review and evidence details in D1. It does not change the static site. Editors must verify the source, update the relevant public record in a reviewed repository change, and use the accepted-corrections export to prepare `src/data/corrections.json`. A normal reviewed build/deployment then publishes it.
- No automatic email or external notification is sent. The reviewer must check the inbox. Until an owner and monitoring cadence are set, this is not a monitored public service.

## Cloudflare setup

Use the same Cloudflare Pages project that serves the static site. Do not create production resources until the owner approves the account and hosting choice.

1. Create the Pages project and a D1 database named `nyamira-corrections`.
2. Copy the database ID into `wrangler.jsonc` in place of the all-zero local placeholder. Keep the database binding named `DB`; do not put credentials or tokens in this repository.
3. Apply the D1 migration:

   ```sh
   npm run db:migrate:remote
   ```

4. Add `DB` as a D1 binding in the Pages project settings for both preview and production environments. Keep their data separate.
5. Create a Turnstile site for the actual site hostname. Set `PUBLIC_TURNSTILE_SITE_KEY` as a build variable and `TURNSTILE_SECRET_KEY` as a secret for Pages Functions.
6. Create a Cloudflare Access application for `/review/*` and `/api/review*`. Permit only the named editors. Copy the Access team domain and application audience into the function variables below. The API independently verifies the signed Access JWT and an email allowlist.
7. Set the following Pages Functions variables/secrets:

   | Name | Type | Purpose |
   |---|---|---|
   | `CORRECTION_INTAKE_ENABLED` | variable | Must be exactly `true` before the API accepts reports |
   | `CORRECTION_SITE_ORIGIN` | variable | Exact origin, for example `https://nyamiradaily.org` |
   | `CORRECTION_SITE_HOST` | variable | Hostname expected in successful Turnstile results |
   | `CORRECTION_RETENTION_DAYS` | variable | Owner-approved retention period; deliberately has no default |
   | `CORRECTION_RATE_SALT` | secret | Random secret of at least 32 characters; used to HMAC the Cloudflare client IP for short-lived rate limiting |
   | `TURNSTILE_SECRET_KEY` | secret | Turnstile server-side verification key |
   | `CF_ACCESS_TEAM_DOMAIN` | variable | Cloudflare Access team hostname, ending in `.cloudflareaccess.com` |
   | `CF_ACCESS_AUD` | variable | Access application's audience tag |
   | `CORRECTION_REVIEWER_EMAILS` | variable | Comma-separated allowlist of editor email addresses |

   Generate a rate-limit salt locally with `openssl rand -hex 32`. Do not paste it into chat, source code, or a commit.

8. For the public form to render, set `PUBLIC_CORRECTION_INTAKE_ENABLED=true`, `PUBLIC_TURNSTILE_SITE_KEY` and `PUBLIC_CORRECTION_RETENTION_DAYS` in the site build environment. The public retention value must match `CORRECTION_RETENTION_DAYS`. The runtime API remains fail-closed unless all server-side bindings and secrets are also set.
9. Agree who owns review and how often they will check it. No notifications are currently sent. Do not set the intake flag until the reviewer, retention period, privacy notice and monitoring routine are approved.

The URL `/review/corrections/` is a static page with no submission data embedded. It is marked `noindex`; Cloudflare Access should protect it as well as the review APIs. The APIs require a valid Access assertion and a matching reviewer email even if the Access path policy is changed accidentally.

## Local development

```sh
cp .dev.vars.example .dev.vars
ND_PREVIEW_BUILD=1 npm run build
npm run db:migrate:local
npm run pages:dev
```

The local form stays disabled with the example variables. To test an enabled form, use Cloudflare's documented Turnstile testing keys and provide matching local values only in ignored `.dev.vars` and local build environment variables. Do not use production secrets locally.

## Data and safeguards

- Public reports contain the affected page path, a description, and an optional HTTPS source URL. No contact details or attachments are collected.
- Input size is capped. The API checks same-origin requests, Turnstile, a honeypot and three submissions per client IP per hour.
- Raw client IPs are not stored. The short-window limiter stores only an HMAC made with `CORRECTION_RATE_SALT`; expired limiter keys are cleared on API requests.
- Submission text may still contain information the sender should not share. The form warns against private/sensitive details. Reviewers must not publish private-person details.
- D1 cleanup removes old reports and their review events after `CORRECTION_RETENTION_DAYS`; cleanup runs when the API is used, so removal may occur on the next request after the retention period, not at an exact scheduled time.
- Every decision is recorded with reviewer identity, time and note. Decisions are only made once; a second reviewer cannot silently overwrite an existing decision.
- Only accepted records with a reviewed page path, public wording, HTTPS source and explicit source date appear in the export. Pending and rejected reports never enter the public log.
- The accepted-corrections export contains public fields only. It does not include the original report, reviewer note, email or internal history.

## Publishing an accepted correction

1. Check the cited source and any affected data/content. Do not infer dates, identity, status or a value.
2. Make the actual correction in the appropriate source-controlled file. Keep the repository's correction, evidence and review rules.
3. From the protected review screen, download the accepted-corrections export. Review it and copy the intended public record into `src/data/corrections.json`; preserve existing accepted records.
4. Run tests and the public-site build. Submit the repository changes for the normal review and deployment process.
5. The correction appears to readers only after that static build is deployed. Database acceptance alone is not publication.

## Facility observation reports

Facility reports use the same service, database, Turnstile check, salt, retention period and Access reviewers as corrections, but have their own tables (`migrations/0002_facility_observations.sql`), endpoints, inbox and switch (decision #49, #54). They are **disabled by default**, and switching on corrections does not switch them on.

- **Public form:** on each facility profile (`src/components/FacilityObservationForm.astro`). It renders only when the build has `PUBLIC_FACILITY_INTAKE_ENABLED=true`, `PUBLIC_TURNSTILE_SITE_KEY` and `PUBLIC_CORRECTION_RETENTION_DAYS`; otherwise profiles show nothing. A report covers one facility and one capability: what was checked (the reporter's words), what they found (available, not available, or not sure), the date they saw it, and whether they are a resident or a Nyamira Daily field reporter. Extra detail and an HTTPS source link are optional. No names, contact details or uploads.
- **Intake API:** `POST /api/facility-observations`. Needs `FACILITY_INTAKE_ENABLED=true` plus every server-side setting listed for corrections. It rejects facility IDs not in `src/data/facilities.json` and dates in the future (Nairobi time). Its limiter is separate from the corrections limiter: 10 reports per IP per hour, because one visit can cover several services.
- **Review:** `/review/facilities/`, with `GET`/`PATCH /api/review-facilities` and `GET /api/review-facilities-export`. The existing Access paths (`/review/*` and `/api/review*`) already cover them, and the APIs check the same JWT and `CORRECTION_REVIEWER_EMAILS` allowlist. To accept, the editor sets every public field: capability label, status, scope, observation date, source category, a public source reference with no personal names, and the evidence label. For reader reports the evidence label is `unverified`, or `verified` only if an editor checked it on site or against official records. Choose "field reporter" only when you know the report came from a designated field reporter; the form category is self-declared.
- **Retention:** after `CORRECTION_RETENTION_DAYS`, pending and rejected reports are deleted. Accepted reports lose the reporter's own words and link but keep the reviewed public fields, so the public history can still be exported.

### Publishing accepted facility observations

1. From `/review/facilities/`, download the accepted-observations export.
2. Preview it: `node scripts/import-facility-observations.js <export.json>`. Then add it: `node scripts/import-facility-observations.js <export.json> --write`. The script copies public fields only, stamps `publishedAt` with the current UTC time, skips records already published, refuses a changed duplicate, and validates the result against the facility registry.
3. Review the diff of `src/data/facility-observations.json`, run the tests and the build, and submit the change for the normal review and deployment. Observations appear on profiles and in `/api/facilities.json` only after that deploy.

## Road condition reports

Road reports use the same service, Turnstile check, salt, retention period and Access reviewers, with their own tables (`migrations/0003_road_conditions.sql`), endpoints, inbox and switch (decisions #55, #57). They are **disabled by default**; switching on corrections or facility reports does not switch them on.

- **Public form:** on each road page (`src/components/RoadConditionForm.astro`), rendered only when the build has `PUBLIC_ROAD_INTAKE_ENABLED=true`, `PUBLIC_TURNSTILE_SITE_KEY` and `PUBLIC_CORRECTION_RETENTION_DAYS`. A report gives one grade (Good, Fair, Poor, Impassable or Not sure, each defined on the form), the date seen, the reporter's category and up to three optional checks in the reporter's own words (Yes, No or Not sure). Nothing is preselected.
- **Intake API:** `POST /api/road-conditions`, needing `ROAD_INTAKE_ENABLED=true` plus every server-side setting listed for corrections. It rejects road IDs not in `src/data/roads.json` (a retired ID resolves to the road that replaced it) and future dates. Its limiter is separate: 10 reports per IP per hour.
- **Review:** `/review/roads/`, with `GET`/`PATCH /api/review-roads` and `GET /api/review-roads-export`, covered by the existing Access paths. To accept, the editor sets the grade, scope, observation date, source category, a public source reference without personal names, and the evidence label (`unverified`, or `verified` only if an editor checked it on site or against official records). Each check can be reworded or dropped by leaving its public label empty. The check wording and the decision are saved in one batch, and only while the report is pending.
- **Retention:** as for facility reports. After `CORRECTION_RETENTION_DAYS`, pending and rejected reports and their checks are deleted; accepted reports lose the reporter's own words and link but keep the reviewed fields.

### Publishing accepted road reports

1. From `/review/roads/`, download the accepted-reports export.
2. Preview with `node scripts/import-road-conditions.js <export.json>`, then add with `--write`. The script copies public fields only, stamps `publishedAt`, skips reports already published, refuses a changed duplicate and validates against the road registry.
3. Review the diff of `src/data/road-conditions.json`, run the tests and build, and submit the change. The condition appears on road pages after that deploy. A road reported complete in the county's records but graded Poor or Impassable then shows that gap as its first question to ask.
