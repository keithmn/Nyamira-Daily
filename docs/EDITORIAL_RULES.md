# Editorial rules

These rules matter more than the code. The site is only useful if people can trust it, including people who disagree with what it shows.

## 1. Every fact has a source

- Every figure links to the document it came from, ideally with the page or table number.
- Prefer primary sources: Controller of Budget (CoB), Office of the Auditor-General, the county's own plans and budgets, the County Assembly's Hansard, the Kenya Gazette, Kenya Law, KNBS, IEBC.
- Media reports are acceptable for events (for example, a court ruling or a Senate vote), from reputable outlets: Nation, The Standard, The Star, Citizen Digital, Kenya News Agency, Capital FM.
- Aggregator blogs and social media are leads only, never the sole source.
- Show the date: "Last updated" or "Checked" on every page with figures.

## 2. Every claim carries an evidence label

| Label | Meaning | Example |
|---|---|---|
| Verified | Checked on site by our correspondents, or against two independent records | Ward list (IEBC and boundary data agree) |
| Audit finding | Stated by the Auditor-General in an audit report | A qualified opinion, unsupported expenditure |
| Official claim | Stated by a government body, not yet independently checked | CoB spending figures, county budget lines |
| Unverified | Reported or listed, not yet confirmed | Services listed from maps that no one has visited |

The labels are implemented in `src/components/EvidenceLabel.astro`. Use them everywhere a figure appears.

## 3. Never manufacture wrongdoing

- Never describe an allegation as established corruption.
- Never infer theft because a project is incomplete or appears in several budgets. A project budgeted again can have good reasons (a new phase, a variation, a delayed payment).
- When documents show something odd (repeat budgeting, stalled works, conflicting figures), present it as a **question to ask**, labelled "Needs a site visit", with the documents that raise it.
- Absence of evidence that something was completed is not evidence that it was not. Use "Completion not yet verified", never "ghost project", unless a competent authority has established it.
- Keep procedural status exact: allegation, audit query, under investigation, charged, trial ongoing, convicted, acquitted, case withdrawn, cleared. Never collapse these into "corruption".
- If someone was cleared, acquitted, or a case was dropped, report that as prominently as the original allegation.

## 4. Fairness to people

- Name individuals only where the record names them (for example, the Hansard shows who moved a motion).
- Cover all MCAs and wards evenly. Don't single out anyone the record does not.
- No personal attacks, no speculation about motives, no private life.
- Before publishing anything that criticises a named person, ask: "What would their lawyer say?" If the claim can't survive that, downgrade it or remove it.

## 5. Show conflicts, don't hide them

When sources disagree (for example, the county's own report and CoB give different spending totals), show the figure we use, say which source it comes from, and note the other figure. Never quietly pick the more dramatic number.

## 6. Plain language

- Short sentences. One idea per sentence.
- Explain terms the first time ("own-source revenue: money the county raises itself from fees, rates and permits").
- Lead with the number and what it means for a resident.
- Avoid loaded words: "looted", "stole", "scandal". Prefer "According to the Controller of Budget...", "The county reported...", "We could not verify...".

## 7. Report what works, too

Successes, improvements and well-run projects get the same care and prominence as problems. The aim is "keep what works, fix what doesn't", not to make anyone look bad.

## 8. Corrections

- Mistakes are corrected openly, with the date and what changed, on `/how-we-work/#corrections`.
- Never silently change a published figure.

## 9. Independence

The site does not support or oppose any party, candidate or official. Contributors with a political role or ambition must not edit or approve content about the people they would compete with, or about themselves.

## 10. Privacy and safety

- No personal data of private individuals.
- Community reports ("Tell us") are checked before anything is published, and reporters are never identified without consent.

## 11. Alerts and incidents

Alerts (`src/content/alerts/`, spec item 1.8) are a calm record of what happened and what to do, not breaking news.

- **Only confirmed events go live:** from an official source (County Government, Kenya Red Cross, Kenya Meteorological Department, Ministry of Health, Kenya Power, the police, the National Disaster Operations Centre), from a reputable outlet (Kenya News Agency, Nation, Standard, Star, Citizen), or verified by our own correspondent on site. A single social media post is not enough. If something unconfirmed is circulating and people need guidance, publish it as `unverified`, with "Reports, not yet confirmed" in the title, and update fast.
- **Facts, not speculation.** No guessing about causes ("arson", "negligence") unless an authority has said so, attributed.
- **Protect people.** No names of victims or injured people; no images of injured or dead people; no images of children without guardian consent. Numbers only as given by an authority, attributed.
- **Calm language.** Lead with what residents should do. No sensational words.
- **Disease outbreaks:** Ministry of Health or county health department information only. Never name patients, households or schools unless officials did so publicly.
- **Security incidents:** official statements only, and only where residents need to act (for example, avoid an area).
- **Emergency numbers** in `contacts` must be confirmed for Nyamira before an alert goes live.
- **Keep it current.** Update `updatedAt` with every change and add a dated line to the update log. An active alert not updated for 72 hours shows "Not updated recently: check the source". Status runs active → monitoring → resolved.
- **Corrections.** If an alert was wrong, set `corrected:` with what changed and keep the alert. Never delete one silently.
