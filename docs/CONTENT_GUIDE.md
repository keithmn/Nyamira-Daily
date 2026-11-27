# Content guide: writing the first entries

The site's content collections are built, with example entries showing the schema. Here's how to write the first real entries.

## General rules

- Every figure needs a source, a date and an evidence label (verified, audit, official, unverified). See `docs/EDITORIAL_RULES.md`.
- Never estimate, interpolate or invent data. If unknown, say unknown.
- Questions, not accusations. Never write "corruption", "stole", "looted" or "ghost project" unless a court has established it.
- `draft: true` entries are hidden unless built with `ND_DRAFTS=1`. Remove `draft: true` when the entry is reviewed and ready.
- Short Kiswahili summaries (`swSummary`) should be marked for native-speaker review.

## Fact-checks (`src/content/factchecks/`)

**When to write one:** A specific, verifiable claim about Nyamira County is circulating — on social media, in local media, or in public statements.

**How to find claims:** Monitor local Facebook groups, Twitter/X, local radio call-ins, county government announcements, and Assembly proceedings.

**File:** `src/content/factchecks/<slug>.md`

```yaml
---
claim: "The exact claim, in quotes"
claimSource: Where it appeared (e.g. "Facebook post by [public figure], 15 Nov 2026")
rating: unproven  # true | mostly true | misleading | false | unproven
summary: One-sentence verdict explaining why
evidence:
  - name: "Official document title"
    url: "https://..."
    page: "p.X"
checkedOn: 2026-11-21
# draft: true  ← remove when reviewed
---

The body explains the evidence. Lead with what the documents say. Never claim more than the evidence supports.
```

**Example file:** `EXAMPLE-claim.md` (a Borabu roads claim checked against budget documents)

## Stories / What's working (`src/content/stories/`)

**When to write one:** A county project or facility is demonstrably working as intended, with evidence.

**How to find them:** Field visits, community reports, Assembly Hansard mentions of completed projects.

```yaml
---
title: "Short title describing what works"
ward: rigoma  # ward slug, optional
sector: health  # health | education | water | roads | agriculture | ...
evidence:
  - name: "Source document or observation"
    url: "https://..."
photos:
  - src: /photos/stories/example.jpg
    alt: "Description of the photo"
    credit: "Photographer name"
date: 2026-11-21
evidenceLabel: verified
# draft: true
---

The story, in plain language. What it is, where it is, who it serves, what the evidence shows.
```

## People (`src/content/people/`)

**When to write one:** A resident (never an elected official) has consented to a profile about their role in the community.

**Consent is required.** The `consentOn` date must be when the person gave written or recorded consent.

```yaml
---
name: "Full name"
role: "What they do"
ward: kemera  # optional
story: "One sentence about their contribution"
consentOn: 2026-11-21
# photo:
#   src: /photos/people/name.jpg
#   alt: "Name at their workplace"
#   credit: "Photographer"
# draft: true
---

The person's story. Focus on their work, not personal details. Never publish without consent.
```

## Heritage (`src/content/heritage/`)

**When to write one:** A place, tradition or practice of cultural significance, with named sources.

```yaml
---
title: "Name of the place or tradition"
place: "Location name"  # optional
ward: manga  # optional
story: "One sentence summary"
sources:
  - name: "Source name"
    url: "https://..."
contributor: "Who shared this knowledge"  # optional
# draft: true
---

The heritage story. Several voices where possible. Sources named. Never claim knowledge without attribution.
```

## Alerts (`src/content/alerts/`)

**When to write one:** A confirmed incident or public notice affecting Nyamira County.

**Sources:** County emergency office, Red Cross Nyamira branch, Kenya Meteorological Department, police reports, county government notices.

**Types:** fire, flood, landslide, building collapse, disease outbreak, major accident, storm, road closure, bridge out, power outage, water outage, health facility closure, service strike, vaccination, health campaign, county notice, weather advisory, public forum, exam period

```yaml
---
type: flood  # one of the types above (use spaces, not hyphens)
level: emergency  # emergency | disruption | notice
title: "Short description"
summary: "One paragraph summary"
wards:
  - gesima
  - manga
startedAt: 2026-11-20
updatedAt: 2026-11-21
status: active  # active | monitoring | resolved
sources:
  - name: "Official notice or report"
    url: "https://..."
advice: "What people should do"
contacts:
  - name: "Emergency contact name"
    phone: "0700 000 000"
    role: "Their role"
evidenceLabel: official
# draft: true
---

Detailed description. What happened, when, where, what's being done.
```

**Status updates without git:** Once an alert is published, its status can be updated via the living data pipeline — a Google Sheet row or KoboToolbox form with `alert:<id>` as the place, `status` as the field, and the new status as the value. See `fieldwork/README.md`.
