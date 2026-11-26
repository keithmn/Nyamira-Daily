# Security audit and hardening prompt — Nyamira Daily pre-launch

Use this prompt with Claude Code (or any AI coding assistant with repository access) to run a systematic security review of the Nyamira Daily platform ahead of public launch. Copy the prompt below as-is.

---

## Prompt

You are the cybersecurity advisor for a small civic media engineering team about to launch a public-facing data journalism website for Nyamira County, Kenya. The site publishes government budget figures, facility conditions, procurement contracts and elected officials — information that may attract politically motivated attacks, defacement attempts, data tampering or denial of service.

**Read `AGENTS.md`, `docs/PROJECT_BRIEF.md` and `docs/STATUS.md` before starting.**

### Context

- **Architecture:** Static Astro 7 site (871+ pages of pre-rendered HTML) deployed to Cloudflare Pages (free tier). No server-side rendering at runtime. No application server. No database serves the public site.
- **Optional service:** A Cloudflare Pages Function + D1 (SQLite at edge) corrections service exists but is not yet enabled. When enabled, it will accept user input (correction submissions).
- **Data pipeline:** Government PDFs → manual extraction → JSON files in `src/data/` → build-time rendering. Field data: KoboToolbox → Google Sheets → reviewed sync script → `src/data/living/events.json`. No pipeline component is internet-exposed.
- **Client-side tools:** Budget simulator, submission helper, RTI letter builder and contact form. The first three process data entirely in the browser and send nothing. The contact form posts to a Cloudflare Function (when enabled) or opens a mailto/WhatsApp link.
- **API endpoints:** 53 static JSON/XML/TXT files rebuilt on each deploy. Read-only. No authentication. Licensed CC BY 4.0.
- **Hosting:** Cloudflare Pages with automatic HTTPS, global CDN, DDoS protection. DNS through Cloudflare.
- **Source control:** Private GitHub repository. Deploys trigger on push to `main`.
- **Dependencies:** Astro, `@astrojs/sitemap`, `qrcode` (build-time only). Dev: `wrangler`. No client-side JavaScript frameworks.
- **Users:** Residents on low-cost Android phones (Chrome, Opera Mini, Samsung Internet), journalists, researchers, government officials. No user accounts or authentication on the public site.
- **Threat model:** The site publishes public records about government spending and elected officials. Potential adversaries include: political actors who want content removed or altered; opportunistic attackers scanning for common vulnerabilities; anyone who might want to impersonate the site to spread disinformation.

### Your task

Run a systematic security audit across the following domains. For each finding, state the **risk** (what could go wrong), the **severity** (critical / high / medium / low), and the **fix** (the exact code change, configuration or process step). Group findings by domain.

#### 1. HTTP security headers

Check `public/_headers` (Cloudflare Pages headers file) or `astro.config.mjs` for the following. If any are missing or misconfigured, write the fix:

- `Strict-Transport-Security` (HSTS) with `max-age` of at least one year and `includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (the site should never be framed — embeds have their own `/embed/` routes)
- `Content-Security-Policy` — write a policy that fits the actual site: self-hosted fonts, inline styles, inline scripts (Astro's `is:inline`), no external scripts (unless analytics is enabled, in which case allow the configured analytics domain only), no external frames, no object/embed. The policy must not break the existing site.
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disable camera, microphone, geolocation, payment, interest-cohort (FLoC)
- `X-XSS-Protection: 0` (the header is deprecated; CSP replaces it; setting it to 1 can introduce vulnerabilities in older browsers)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin` (except for `/api/` routes, which should be `cross-origin` to allow fetch from other domains)

#### 2. Content Security Policy — detailed

The CSP must be tested against every page type. Specifically:

- Pages with inline `<script is:inline>` blocks (search, budget simulator, ward filter, story filter, alert dismiss, contact form, submission helper, ask letter builder, ward sheets)
- Pages that load self-hosted fonts from `/brand/fonts/`
- Pages that use inline SVGs and `data:` URIs (the county map, ward share images, QR codes)
- The analytics script (when `analytics.provider` is set) — this is an external script from a configurable domain
- The RSS/XML endpoints — these are static files, not HTML pages

Write the CSP as a `default-src 'none'` baseline with explicit allowances for each resource type. Use `'unsafe-inline'` for styles only if Astro generates inline styles that cannot be hashed; prefer hashes or nonces if possible. For scripts, document whether `'unsafe-inline'` is avoidable given Astro's `is:inline` pattern.

#### 3. Cloudflare Pages Functions (the corrections service)

Read `functions/` and `docs/CORRECTIONS_SERVICE.md` if they exist. Check for:

- Input validation and sanitisation on every field the function accepts
- Rate limiting (Cloudflare has built-in rate limiting rules; is one configured?)
- CSRF protection (the form should include a Turnstile token; is validation implemented server-side?)
- D1 SQL injection — are all queries parameterised? Grep for string concatenation in SQL.
- Error handling — do error responses leak internal details (stack traces, database schema, file paths)?
- CORS on the function endpoint — is it restricted to the site's own origin?
- Authentication for any admin/review endpoints (if they exist)

#### 4. Data integrity and supply chain

- **Dependencies:** Run `npm audit`. Check that `package-lock.json` exists and is committed. Check for any dependencies with known vulnerabilities. Count total dependencies (direct and transitive) — flag if the number is surprisingly high for a static site.
- **Build pipeline:** Can a compromised dependency inject content into the built site? Review `astro.config.mjs` and any build scripts in `scripts/` that process data files. Flag any use of `eval()`, `Function()`, `child_process.exec()` with unsanitised input, or dynamic `import()` from user-controlled paths.
- **Data files:** Check that `src/data/*.json` files are not executable and contain no `<script>` tags or HTML injection payloads. Check that the build scripts that read government PDFs and CSVs (`scripts/ingest-pdf.py`, `scripts/build-roads.js`, etc.) do not pass file content through a shell or eval.
- **Git hygiene:** Check `.gitignore` for `.env`, credentials, API keys, and `.bundle` files. Grep the repository for hardcoded secrets, API keys, tokens or passwords (common patterns: `sk_`, `pk_`, `Bearer `, `password`, `secret`, `token`, `apiKey` in JS/JSON files, excluding test fixtures and documentation). Check that no `.env` file is committed.

#### 5. Client-side security

- **XSS in user-facing tools:** The budget simulator, submission helper, letter builder and contact form all process user input. Check that none of them use `innerHTML`, `document.write()`, `eval()` or `new Function()` with user-supplied values. Check that user input rendered into the page is escaped.
- **Open redirects:** Check for any pattern where a URL parameter or hash controls a redirect destination. Check the ward filter (`data-set-ward`) and search page for open redirect potential.
- **localStorage/sessionStorage:** Check what is stored. Confirm no sensitive data, tokens or PII are persisted. Check that the alert dismiss state (`localStorage`) cannot be manipulated to inject content.
- **Third-party scripts:** Confirm zero third-party scripts are loaded on the production site (excluding the analytics placeholder when enabled). Grep `dist/` for `<script src=` pointing to external domains.
- **Form action targets:** Confirm no form has an `action` pointing to an external URL that could be replaced via DOM manipulation.

#### 6. Information disclosure

- **Source maps:** Check that no `.map` files are in `dist/`.
- **Server headers:** Check whether Cloudflare Pages exposes server version headers that aid reconnaissance.
- **Directory listing:** Cloudflare Pages does not serve directory listings by default, but check for any `index.html` files that list file contents.
- **Robots.txt:** Check for a `robots.txt` that correctly allows indexing of public pages and disallows any admin, preview or function routes.
- **Error pages:** Check the 404 page for information leakage. Confirm it does not expose file paths, stack traces or software versions.
- **API responses:** Check that JSON API responses do not include internal fields (file paths, build timestamps that reveal deployment cadence, internal notes, or personal data from KoboToolbox — the rules say "never copy names, phone numbers, notes or photos out of Kobo").
- **Git metadata:** Confirm `.git/` is not deployed. Cloudflare Pages does not deploy it by default, but check the build output.

#### 7. DNS and domain

- **DNSSEC:** Check whether DNSSEC is enabled on the domain.
- **CAA records:** Check for Certificate Authority Authorization records that restrict which CAs can issue certificates for the domain.
- **Email (SPF/DKIM/DMARC):** Even if the site does not send email, check for SPF and DMARC records that prevent spoofing of the domain in phishing attacks impersonating the site. This matters: the site publishes information about politicians and money — a spoofed email from `nyamiradaily.org` could be used to spread disinformation.
- **Subdomain takeover:** Check for any dangling CNAME records pointing to deprovisioned services.

#### 8. Operational security

- **GitHub access:** Check the repository's branch protection rules. Flag if `main` accepts direct pushes without review. Flag if force-push is allowed on `main`.
- **Cloudflare access:** Note (but do not check — you don't have access) that the Cloudflare account should use 2FA, and the API token used for Wrangler deployments should be scoped to Pages only.
- **Secrets management:** Check `wrangler.jsonc` / `wrangler.toml` for hardcoded credentials or database IDs that should be in environment variables.
- **Monitoring:** Note whether any uptime monitoring, error alerting or security scanning is configured. Recommend the minimum viable monitoring stack for a small team.

#### 9. Resilience

- **Cache and CDN:** Cloudflare Pages serves static assets with strong caching. Check for any `Cache-Control` headers that might serve stale content after a correction is published (corrections must be visible quickly).
- **Backup:** The site is in Git, so the code is backed up. But check: are the source documents in `data-src/` committed? Are the KoboToolbox form definitions backed up? Is there a documented recovery procedure?
- **Defacement response:** Note whether there is a documented process for detecting and responding to defacement (someone pushes malicious content to `main`). Recommend the minimum: branch protection, required reviews, and a Cloudflare Pages rollback procedure.

### Output format

Produce a report with:

1. **Executive summary** — 3-5 sentences: overall posture, the top 3 risks, and whether the site is ready to launch from a security standpoint.
2. **Findings table** — one row per finding, sorted by severity (critical first): domain, finding, severity, fix.
3. **Recommended hardening changes** — the actual code changes (headers file, CSP, config), ready to apply. Write them as file contents or diffs.
4. **Process recommendations** — non-code items for the team (monitoring, incident response, access controls).
5. **What's already good** — call out what the architecture gets right (this matters for team morale and for showing funders the security posture).

Do not guess at findings. If you cannot determine whether a vulnerability exists, say so and describe how to check. Build and test after applying any changes — the site must still build and work correctly at 390px phone width.
