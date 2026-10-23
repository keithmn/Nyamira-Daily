# Nyamira Daily: project brief

Read this first. It explains what the site is, who it is for, and what we are trying to achieve. The other docs in this folder cover the rules, the data and the decisions behind the code.

## In one sentence

Nyamira Daily is an independent, non-partisan information service that explains how Nyamira County, Kenya, is run and what it delivers, in plain language, with a source behind every fact.

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

Six sections, in the main menu:

| Section | What it answers |
|---|---|
| Today | What our county has, spends and does: headline figures plus the reader's own ward |
| Data | Money, projects, services, people (census), prices, plans; plus open data downloads |
| My Ward | A page per ward (20): ward receipt, map, MCA, services, county projects |
| Government | Who's in charge of what, leaders, the Executive, the County Assembly, watchdogs |
| Constitution | Devolution (Chapter 11), what the county must provide (Fourth Schedule), your rights, county laws |
| Learn | How the county works, budget calendar, taking part, fees you pay, glossary |

A **"Your ward" picker** sits under the menu on every page. Readers choose their ward once; the site then shows that ward's figures first. Each ward also keeps its own page so it can be shared on WhatsApp.

## A related show

"Nyamira Watch" is a nightly live show (10 to 11 pm, also released as a podcast) that discusses the county's facts. The site carries a link to its episodes. The show draws on the site's data; the site does not depend on the show.

## Languages

English is the written backbone. Key pages carry a short Kiswahili summary ("Muhtasari kwa Kiswahili"). Full Kiswahili and Ekegusii versions are planned. Spoken content (audio, the show) uses the speaker's language with subtitles.

## Current state (October 2026)

See `ROADMAP.md` for the full list. In short:

- **Live with real data:** money (12 years), leaders, ward pages with maps and project lists, projects, services, census figures, Assembly sittings and bills, county Acts, fees, opportunities, constitution summaries, search.
- **Planned:** market prices, plans and promises, have your say, tell us and subscribe (these wait for a contact channel), show episodes, full translations, field verification of projects and services.

## How to work on it

- Setup and commands: `../README.md`.
- Before publishing any fact: `EDITORIAL_RULES.md`.
- Where each dataset comes from and how to refresh it: `DATA.md`.
- Why things are built the way they are: `DECISIONS.md`.
- What to build next: `ROADMAP.md`.
