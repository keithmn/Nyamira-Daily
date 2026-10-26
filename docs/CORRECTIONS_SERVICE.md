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
