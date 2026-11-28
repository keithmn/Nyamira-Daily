# Gusii Daily: project brief

Read this first. It explains what Gusii Daily is, who it is for, and what we are trying to achieve. The other docs in this folder cover the rules, the data and the decisions behind the code. Rewritten for the refocus of 16 Nov 2026 (`docs/refocus/PLAN.md`, decisions #110 to #118).

## In one sentence

Gusii Daily is a local data journalism tool for Nyamira County, Kenya: it maps every facility and the condition it is in, and it follows the money, with a source behind every fact.

## The two goals

1. **The map.** Every facility in every ward: what it is, its condition, whether it is open, and what services it gives. Each one is a place with its own page (`/place/<id>/`), and its state changes over time as we visit and residents report.
2. **The money.** What the county receives and spends, and how money moves through the county's economy, public and private. Public offices appear where the budget does: who approved it, who spent it.

Everything else is non-partisan community building.

## How it works

- **YouTube comes first.** The team makes videos: a visit to a dispensary, a new budget, a return visit to see what changed. The site holds the figures behind each video (`/watch/<id>/`), and each place page lists the videos made there. There is no big launch: the site grows one video and one visit at a time.
- **One field trip, two outputs.** The visit that is filmed is also the check that updates the place, through the KoboToolbox forms (`fieldwork/README.md`).
- **Two kinds of data.** Static records are what the documents say and are never written over; a new edition is added beside the old one. Living records are dated events (a status seen on a visit, a new budget stage); the current state is the latest reviewed event. See `docs/DATA.md`.

## Who it is for

- **Residents of the county's 20 wards.** Most read on low-cost Android phones, often on expensive or slow data. Many read English as a second language; Kiswahili and Ekegusii are widely spoken.
- **Our viewers on YouTube and WhatsApp**, who follow a video to its figures.
- **Journalists, researchers, civil society groups and county officials** who want citable figures and downloadable data.

## What it is not

- **Not a news site.** No breaking news or hot takes.
- **Not partisan.** It does not support or oppose any party, candidate or official, and it does not profile politicians. The Administration page lists who holds each seat, for information only.
- **Not an accusation engine.** Projects that raise questions are shown as questions to ask, never as proof of wrongdoing (`EDITORIAL_RULES.md`).

## Rules that hold everything up

- Every figure has a source, a date and an evidence label (verified, audit, official, unverified). Corrections are made openly.
- The two-layer rule: every page leads with one number, one plain sentence and one evidence label; the detail sits one tap deeper.
- County money, national money and household income are different measures and are never added together.
- Signal Green and charcoal are the only colours (decision #111).

## Structure of the site

Five sections (`src/nav.js`):

| Section | What it answers |
|---|---|
| Map | What is in each ward, what condition it is in, and what services it gives: the county map, ward pages, places, roads, health, education, Report a place |
| Money | What the county receives and spends: the budget by department and programme, spending to date, revenue, history, the Nyamira economy, farming, contracts, the budget calendar, fees |
| Watch | Our videos, explainers and the number of the week, each with the figures and sources behind it |
| Administration | Who holds each seat now, and what the county must do under the Constitution |
| About | Who runs us, how we work, right of reply, open data, the glossary, terms, privacy |

## Who runs it

Gusii Daily is built and published by Underdogs Rising Group Limited, which supplies the developers and data journalists. It is editorially independent and non-partisan, and the company has committed to spin it out into its own non-profit (a company limited by guarantee, then a registered PBO). Until then, never describe it as a non-profit, NGO, charity or PBO. Details: `/who-runs-us/` and `DECISIONS.md` #73. One name covers the site, the channel and every show: Gusii Daily.

## Languages

English is the written backbone. Key pages carry a short Kiswahili summary ("Muhtasari kwa Kiswahili"). Videos use the speaker's language with subtitles. Digitising Ekegusii and recording Gusii culture now live in the Community section (decision #122), under its consent and review rules; they may move to their own home if they grow.

## How to work on it

- Setup and commands: `../README.md`. Rules for assistants and developers: `../AGENTS.md`.
- Before publishing any fact: `EDITORIAL_RULES.md`.
- Where each dataset comes from and how to refresh it: `DATA.md`. Field forms, the sheet and the sync: `../fieldwork/README.md`.
- Why things are built the way they are: `DECISIONS.md`. What to do next: `ROADMAP.md`.
