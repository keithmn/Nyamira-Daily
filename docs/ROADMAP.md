# Roadmap

Status as of 23 October 2026.

## Live (real, sourced content)

- **Today**: headline figures, your-ward panel, links into each section.
- **Data**: Money (12 years, 3 charts), Projects (ward budgets, questions to ask, 404 records), Services (by ward), People (2019 census), Open data (4 CSVs).
- **My Ward**: county map, 20 ward pages (receipt with WhatsApp share, ward map, MCA, services, county projects).
- **Government**: Who's in charge, Leaders (all offices with sources), Executive (overview), Assembly (sittings, bills, committees, petitions and motions, MCAs), Watchdogs.
- **Constitution**: devolution articles 174–200 with plain summaries, Fourth Schedule, your rights, county Acts.
- **Learn**: how the county works, budget calendar, taking part, fees you pay, glossary.
- **Opportunities**, **About**, **How we work**, **Search**.

## Planned (tagged "Planned" on the site)

| Page | What's blocking it |
|---|---|
| Data → Prices | No reachable source of Nyamira market prices. Needs weekly checks at Nyamira, Keroka and Ekerenyo markets, or a KAMIS export from a Kenyan connection. |
| Data → Plans and promises | Needs the CIDP 2023–27 and ADP commitments extracted and matched to delivery. |
| Have your say | Needs a calendar of public participation forums (county website, newspapers, ward administrators). |
| Tell us, Get updates | Need a WhatsApp number or email (`src/config.js`). |
| Learn → Show episodes | Needs the show's episode list and audio links. |
| Kiswahili and Ekegusii versions | Translators, and a decision on URL structure (for example `/sw/`). |

## Next priorities (suggested order)

1. **Reconcile the FY2025/26 ward budget total** (357.1M stated vs 372.6M extracted) against the printed PDF, and compare the later scanned PBB 2025/26 on nyamira.go.ke.
2. **Auditor-General findings**: read every OAG report on Nyamira since 2013 and build an audit findings dataset (opinion, finding, amount, management response, repeated or resolved). This feeds an "Audit finding" layer across Money and Projects.
3. **Field verification**: a simple phone form (KoboToolbox or ODK) for correspondents to record a project or facility's GPS location, photo and condition (financial, physical and functional status). Results update evidence labels from Unverified to Verified.
4. **Longitudinal project tracking**: give each project a stable ID across years, so repeat budgeting and cost changes show automatically (a "repeat budgeting register").
5. **Have your say** calendar, and the contact channel for Tell us and Get updates.
6. **Interactive map** (optional): MapLibre + OpenStreetMap with verified points, if the SVG maps become limiting.
7. **Domain and hosting**: choose a domain, set `site` in `astro.config.mjs`, deploy to Netlify or Cloudflare Pages.

## Recurring jobs

| How often | Job |
|---|---|
| Weekly | Opportunities (jobs, tenders, bursaries); rebuild so open/closed status updates |
| Monthly | New Assembly Hansards → sittings, bills, petitions |
| After each CoB annual report | Money figures |
| Each June/July | New budget's ward lines → Projects and ward pages |
| As they happen | Leaders (by-elections, court rulings), corrections |

## Before public launch

- Check every constitution title and summary against Kenya Law.
- Native-speaker review of all Kiswahili summaries.
- Confirm the Speaker and Rigoma/Bokeira MCA court outcomes.
- Confirm whether a 2026 Finance Bill is before the Assembly.
- Set the domain, contact channel and analytics (privacy-friendly, for example Plausible or Cloudflare Web Analytics).
