# Nyamira Daily: project brief

Read this first. It explains what the site is, who it is for, and what we are trying to achieve. The other docs in this folder cover the rules, the data and the decisions behind the code.

## In one sentence

Nyamira Daily is a non-partisan, editorially independent information service that explains how Nyamira County, Kenya, is run and what it delivers, in plain language, with a source behind every fact.

## Why it exists

Since devolution in 2013, Kenya's 47 county governments have controlled large budgets and most local services: health facilities, county roads, markets, early childhood education, water, agriculture. Nyamira County has spent about KSh 60 billion since 2013 (Controller of Budget figures).

The information that tells residents what happened to that money is public, but it is scattered across long PDFs from the Controller of Budget, the Auditor-General, the county's own plans and budgets, the County Assembly's Hansard and the Kenya Gazette. Very few residents ever read it.

Nyamira Daily gathers that record, checks it, and turns it into short pages anyone can understand on a cheap phone.

## Who it is for

- **Ordinary residents in the county's 20 wards.** Most read on low-cost Android phones, often on expensive or slow data. Many are not tech-savvy. Many read English as a second language; Kiswahili and Ekegusii are widely spoken.
- **Young people (about 72% of residents are under 35).** They are looking for jobs, tenders, bursaries and a say in local decisions.
- **Journalists, researchers, civil society groups and county officials** who want reliable, citable figures and downloadable data.

## What it is, and what it is not

- **It is** an information system: a reference people come back to, organised around their ward. Think of a public record that is easy to read, not a newspaper.
- **It is not** a news site. We avoid breaking news and hot takes. Updates are short and factual, and each one links to the page it changes.
- **It is not** partisan. It does not support or oppose any party, candidate or official. It reports successes as carefully as failures.
- **It is not** an accusation engine. Projects that raise questions are shown as questions to ask, never as proof of wrongdoing (see `EDITORIAL_RULES.md`).

## What we seek to achieve

1. **Civic education.** Explain the Constitution's devolution chapter, what the county is responsible for, and how residents can take part in decisions.
2. **Data and information integrity.** Every number has a source, a date and an evidence label. Corrections are made openly.
3. **Development discourse.** Give residents, leaders and media a shared, factual base for discussing what the county should do next.
4. **Make needs visible.** Show the social and economic needs and the gaps between wards (services, water, roads, projects), so they can be addressed.

## The two-layer rule (core UX principle)

Every page leads with one number, one plain sentence and one evidence label. The detail (full tables, sources, caveats) sits one tap deeper, behind "See the detail". A reader who stops after the first layer should still leave with something true and useful.

## Structure of the site

Eight sections, in the main menu (`src/nav.js`):

| Section | What it answers |
|---|---|
| Today | What our county has, spends and does: headline figures, alerts, the number of the week, opportunities, the NY Watch podcast |
| Wards | A page per ward (20) and per constituency (4): ward receipt, map, MCA, services, county projects, roads |
| Data | Money, health, education, farming, the project tracker, plus open data downloads |
| Community | Who lives here (census), what's working, heritage and people |
| Government | Who's in charge of what, leaders, elections, the Executive, the County Assembly, watchdogs |
| Take part | Ask Nyamira, reports, submissions, public hearings, the budget simulator |
| Learn | How the county works, the Constitution, the budget calendar, fees, glossary, explainers |
| About | Who runs us and funds us, how we work, right of reply, the impact log, terms, privacy |

The work follows three pillars: **money** (budgets, spending, audits, contracts), **ground truth** (what is actually there in each ward, checked on site) and **voice** (taking part, and stories of what works).

A **"Your ward" picker** sits on every page. Readers choose their ward once; the site then shows that ward's figures first. Each ward also keeps its own page, with its own share image, so it can be shared on WhatsApp.

## Who runs it

Nyamira Daily is built and published by Underdogs Rising Group Limited, which supplies the developers and data journalists. It is editorially independent and non-partisan, and the company has committed to spin it out into its own non-profit (a company limited by guarantee, then a registered PBO). Until then, never describe it as a non-profit, NGO, charity or PBO. Details: `/who-runs-us/` and `DECISIONS.md` #73.

## A related podcast

"NY Watch" is the data review podcast, hosted by the founder, Keith Morangwa Nyahach (decision #79). Each episode reviews one set of figures on the site: what the records say, what they leave out, and the questions to ask. It reviews records, not politicians. The podcast draws on the site's data; the site does not depend on it.

## Languages

English is the written backbone. Key pages carry a short Kiswahili summary ("Muhtasari kwa Kiswahili"). Full Kiswahili and Ekegusii versions are planned. Spoken content (audio, the show) uses the speaker's language with subtitles.

## Current state (31 October 2026)

See `ROADMAP.md` for the full list. In short:

- **Live with real data:** money (12 years), leaders, ward pages with maps and project lists, projects, services, census figures, Assembly sittings and bills, county Acts, fees, opportunities, constitution summaries, search.
- **Planned:** tell us and subscribe (these wait for a contact channel), NY Watch episodes, the impact log, full Kiswahili and Ekegusii translations, field verification of projects and services, the Ask Nyamira Daily assistant (built on `/api/facts.json`), a Kisii edition (the county kit, `src/county.js`).

## How to work on it

- Setup and commands: `../README.md`.
- Before publishing any fact: `EDITORIAL_RULES.md`.
- Where each dataset comes from and how to refresh it: `DATA.md`.
- Why things are built the way they are: `DECISIONS.md`.
- What to build next: `ROADMAP.md`.
