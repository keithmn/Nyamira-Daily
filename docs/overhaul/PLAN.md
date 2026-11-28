# Overhaul 2: About, Contact, Careers, Partners, About Nyamira County, Community

Status: **plan, from the owner interview of 16 Nov 2026. Not built.** Owner chose to build it all on one branch.
Starts from `main` at `b061cba` (decisions #110 to #121). The decision number for this plan is #122 once approved.

## 1. What changes, in one view

Main menu (five items): **Map · Money · Community · Watch · About**

| Section | Pages | Groups in the switcher |
|---|---|---|
| Map | unchanged | Places · Help us |
| Money | unchanged | This year · Over time · Follow it |
| **Community** (new) | Community home; The Abagusii; Culture archive; Ekegusii language; Share a story; Volunteer | Learn about us · Take part |
| Watch | unchanged | Also on Watch |
| **About** (rebuilt) | About Nyamira County (Facts and figures, How it's governed, Places to know, Who holds each seat, Glossary); Contact us; Careers and volunteering; Partner with us; Legal (Publisher, Terms, Privacy, Corrections, Right of reply) | Nyamira County · Work with us · Legal |

Removed from About as pages about us: Who runs us (becomes one short paragraph on the Publisher page), How we work (folded into Corrections and the evidence-label tooltips; see 3.6), Use our data (see 3.5).

## 2. Owner decisions recorded (interview, 16 Nov 2026)

About and legal
- About shows the **legal minimum** about us plus a **short paragraph** on why the site exists.
- Keep visible: publisher's legal name and registration, terms, privacy, data licence, corrections, right of reply.

Contact
- A **contact form**, plus WhatsApp and email, plus separate routes for **tips, corrections and concerns**.
- Form backend: **our own Cloudflare worker** (`wrangler.jsonc` already exists, with a placeholder D1 id). Messages are stored and forwarded to an inbox the owner will create (a Gmail address for now). The address is **not printed** on the page; it sits behind the form.
- Replies: the owner, as soon as possible. Page copy: "We read every message and reply as soon as we can."
- WhatsApp number and email: **later** (placeholders; buttons hidden until set in `src/config.js`).

Careers and volunteering
- First roles: **ward correspondents** and **language and culture volunteers**.
- Terms (paid or volunteer): **not decided**. The page says "Register your interest"; no pay promises.

Partner with us
- Offers: **data licences, commissioned research, sponsorship**, and any other use of our data.
- Open data vs paid licences: **decide later**. The page says "Talk to us"; everything published stays CC BY 4.0 until the owner decides otherwise.
- Public safeguards: **no political clients**; **client data kept apart** (labelled, published only with the client's agreement).
  Not chosen (owner may revisit): a public sponsor list; partners never preview stories.

About Nyamira County (includes Learn)
- Cover: **facts and figures**, **how it's governed** (county vs national, the Fourth Schedule, how the budget is made, the Constitution summaries), **places to know**.
- Not chosen: history (may come later from the Community archive).
- Learn lives **inside About Nyamira County**.

Seat holders ("Who holds each seat")
- Shown on **ward pages** (MCA), **place pages** ("Who is responsible" names the office), **money pages** (who approved and who spent), and **one full list** in About Nyamira County.
- The `/administration/` and `/administration/duties/` addresses redirect to their new homes.

Community
- First initiatives: **Who the Gusii are**, **Ekegusii language data**, **the Gusii culture archive**.
- Brand: **inside Gusii Daily first, spin out later** if it grows. PROJECT_BRIEF's line "kept off this site for now" is replaced.
- Sensitivity rules (all chosen): **history and culture only** (no clan population counts, rankings, or anything tied to elections or land claims); **sources and elders cited**; **several voices** where accounts differ; **review before publishing** by a small panel (elders, a historian).
- Consent rules (all chosen): **written or recorded consent**, with the right to withdraw; **the community keeps the rights**, contributors credited unless they ask not to be; **separate consent for AI training**; **pay or thank contributors** for their time.
- First language-model goal: **an open, documented Ekegusii text and speech dataset** (collect, transcribe, translate), before any translator or chatbot.
- Ways to take part: **read and listen**; **volunteer to record**; **share a story or record**; **send tips and concerns**.

Footer and social
- Footer stays: social icons and "© year Gusii Daily" (decision #120).
- Accounts: YouTube, TikTok, Instagram, WhatsApp Channel, X. Owner asked to **show the icons now without links**, for the look. Build note: the icons render as plain images (not links, hidden from screen readers) until each URL is set, then become links automatically.

## 3. Build plan (one branch: `feat/overhaul-2`)

3.1 Navigation (`src/nav.js`)
- Add the Community section; rebuild About's pages and groups as in section 1.
- Footer: render all six icons; each is a link only when its URL is set.

3.2 About
- `/about/` becomes a short hub: one paragraph on why the site exists, then three blocks: Nyamira County, Work with us, Legal.
- `/about/publisher/`: legal name, registration number, registered address, non-partisan statement, the short "why" paragraph. Replaces `/who-runs-us/` (redirect).
- Keep `/terms/`, `/privacy/`, `/right-of-reply/`; `/how-we-work/#corrections` moves to `/about/corrections/` (redirect), keeping the corrections log.

3.3 Contact (`/about/contact/`)
- One form with a topic choice: General, News tip, Concern, Correction, Right of reply, Partnership, Careers. Fields: name, phone or email, ward (optional), message, consent tick. Honeypot field and a rate limit; no third-party trackers.
- Cloudflare Worker `functions/api/contact.js` (or a Worker route): validate, store in D1 (`contact_messages`), forward by email (MailChannels or the provider the owner chooses). Needs from the owner: the Cloudflare account with D1 created, and the inbox address.
- Without the worker configured, the page shows the WhatsApp and email buttons only (hidden until set), so nothing breaks.

3.4 Careers and volunteering (`/about/careers/`)
- Two role cards: Ward correspondent; Language and culture volunteer (what you'd do, what you need, time asked). "Register your interest" goes to the contact form with the topic preset.
- No pay terms until the owner decides.

3.5 Partner with us (`/about/partners/`)
- What we can offer (data licences, commissioned research, sponsorship, other uses), what data we hold (live counts from the registry: places, budget figures, contracts, prices), and the two safeguards. "Talk to us" goes to the contact form (topic: Partnership).
- `/about/data/` (Use our data): the open downloads move to a "Data we hold" block on this page; the licence stays in Terms. Redirect.

3.6 How we check facts
- The evidence labels keep a short explanation page at `/about/evidence/` (every label links there), so figures stay explained. Not in the menu. (Owner chose "Legal only" for the menu; this keeps the labels working.)

3.7 About Nyamira County (`/about/nyamira/`)
- Facts and figures (2019 census population, area, 20 wards, 4 sub-counties, towns, main economy), each with a source.
- How it's governed: county vs national functions (from `/administration/duties/`), how the budget is made (links to the budget calendar), Constitution summaries (from `constitution.json`), the glossary.
- Who holds each seat: the full table (from `/administration/`), with sources.
- Places to know: towns and markets (from `towns.json`), linking to the map.

3.8 Seat holders in context
- Ward pages: MCA card (exists); place pages: "Who is responsible" links to the governance page; money pages: a line naming the Assembly (approves) and the Executive (spends), linking to the seats list.

3.9 Community (`/community/`)
- Community home: what the work is, the rules (sensitivity, consent, review), how to take part.
- `/community/abagusii/`: who the Abagusii are: history and culture only, sourced, several voices.
- `/community/archive/`: the culture archive: recordings, transcripts and translations with consent records and credits (a content collection `archive` with consent fields: `consentPublish`, `consentArchive`, `consentAiTraining`, `withdrawn`, `credit`, `reviewedBy`, `reviewedOn`).
- `/community/language/`: the Ekegusii dataset: goal, method, how to contribute, licence (to decide: likely CC BY 4.0 for text with consent, per-item rules for voice).
- `/community/share/`: share a story or record, volunteer to record, send tips and concerns (all through the contact worker, with community topics).
- Build checks: no archive item publishes without `consentPublish`, `reviewedBy` and a source; AI-training exports include only items with `consentAiTraining: true` and not withdrawn.

3.10 Docs and checks
- DECISIONS #122, PROJECT_BRIEF (Community in scope; About scope), DATA (archive collection, contact messages), EDITORIAL_RULES (community sensitivity and consent rules), STATUS.
- Build, tests (new: archive consent checks, now.json, nav groups), screenshots of every changed page at 390 and 1280 px, redirects check.

## 4. Open questions for the owner (asked again before or during the build)

1. Publisher details for the legal page: registration number and registered address.
2. The inbox for the form (Gmail address) and the Cloudflare account access for the worker and D1.
3. Social account links (icons show without links until then).
4. Who sits on the community review panel.
5. Licence for the language dataset (text and voice), and whether contributor payments are per session or per item.
6. Whether to publish a sponsor list and a "partners never preview stories" rule (not chosen in the interview).
