# Overhaul 3: the fact source, built around the reader's ward and question

Status: **plan for the owner to approve. Not built.** It combines what overhaul 2 left open (`PLAN.md`, decision #122) with the general manager's strategy (`docs/strategy/GM_PLAN.md`). Starts from `feat/overhaul-2`.

## The aim

In three years Gusii Daily is the county's fact source. Overhaul 2 gave the site its sections. Overhaul 3 makes it answer a reader's own question fast, shows how much of the data is checked, and turns each week's work into content for every channel.

## Part A: built around the reader

| # | Change | From | Notes |
|---|---|---|---|
| A1 | **"My ward" front page.** Once a reader picks a ward, the home page leads with that ward: its places and their status, its money, its contracts, its MCA, its latest story. | GM 8.1 | The ward picker and ward pages exist; this reorders the home page for a chosen ward, without JavaScript falling back to the county view. |
| A2 | **Ask first.** A large search box on the home page: "What do you want to know about Nyamira?" Answers from the search index (wards, places, contracts, budget lines). | GM 8.2 | `/search/` exists; this promotes it and adds contracts and budget lines to the index. |
| A3 | **Link-in-bio page** `/go/`: latest story, this week's opportunities, choose your ward, WhatsApp. Under 30 KB. | GM 8.3 | The address every TikTok and Instagram profile points to. |
| A4 | **Stories from data.** A `stories` collection: each story names the places, wards, contracts and budget lines it draws on, and shows "the numbers behind it". Watch becomes **Stories** (video and text). Every place, ward and money page lists its stories. | GM 8.4, the stories brainstorm | Replaces the "Latest" list on the home page; the lead story in `now.json` points at a story. |
| A5 | **Opportunities this week**: a weekly, hand-picked list (jobs, tenders, bursaries, trainings) with deadlines and source links, as a story type with its own page `/opportunities/`. | GM 3, 4 | Expired items drop off by date at build time. |

## Part B: data people can trust

| # | Change | From | Notes |
|---|---|---|---|
| B1 | **Coverage page** `/about/coverage/` and a coverage line on each section: how complete and how fresh each dataset is ("0 of 247 places checked; budget to 30 June 2026"). | GM 5, 8.5 | Computed from the data at build time. |
| B2 | **Facility details**: staffing, drugs in stock, fees and results fields on the Kobo facility form and the place page. | GM 3 | Health details are about the facility, never about patients. |
| B3 | **Market prices** page from the Kobo prices form: staples, tea, milk, bananas by market, monthly. | GM 3 | `src/data/living/prices.json` exists, empty. |
| B4 | **Business directory** by ward: name, kind, ward, contact the business itself supplied. | GM 3 | Listing is free; businesses consent to their entry; no ratings. |
| B5 | **Monthly document watch**: a checklist script that lists each source site and the last document we hold from it. | GM 5 | Run on a fixed day; results go to STATUS. |
| B6 | **Corrections credited**: accepted corrections name the resident who sent them, if they agree. | GM 5 | A consent tick on the correction form. |

## Part C: finish overhaul 2

| # | Change | Needs from the owner |
|---|---|---|
| C1 | Switch on the contact form (D1, Turnstile, the `CONTACT_*` variables, the forwarding inbox). | Cloudflare access; the inbox |
| C2 | Social links in `src/config.js`; WhatsApp number for "Ask us". | The account links |
| C3 | Publisher page: registration number and address. | The certificate details |
| C4 | Community: name the review panel; choose the dataset licence; consent form wording reviewed by a lawyer; first recordings. | Panel; lawyer |
| C5 | Careers: terms for correspondents and volunteers. | A decision on expenses or fees |
| C6 | Sponsored content rules (labelled, apart from stories, never touching figures). | A decision |

## Part D: the weekly machine

- One story a week, cut for every channel: site page, vertical video, X thread, WhatsApp post, LinkedIn post. A share kit on each story page (the caption, the key number, a square image) so cutting takes minutes.
- English first, Kiswahili summary; the owner as host.
- Fieldwork: the team films ward by ward; correspondents cover the rest; residents' reports are confirmed before they change a record.

## Order of work

1. **C1 to C3** (switch on what is built).
2. **A4 and A5** (stories and opportunities: the content engine needs them first).
3. **B1** (coverage), then **A1 to A3** (ward front page, ask first, link-in-bio).
4. **B2 to B4** as fieldwork starts; **B5, B6**.

## Not in this round

An app, user accounts, comments, an AI chat assistant, paid data products with prices, and the Ekegusii translator. Each waits for the audience or the data to justify it.

## Owner decisions (implementation interview, 16 Nov 2026)

Order and structure
- Build **in the plan's order**: stories and opportunities, then coverage, then the reader-first home, then new data.
- **Watch is renamed Stories** (videos and written stories together); `/watch/` addresses redirect.
- Add a **Home** link to the menu: Home · Map · Money · Community · Stories · About.
- **Search bars and filters wherever they make a list easier** (opportunities, stories, the directory, contracts already has one).
- With a ward chosen, the home page is **ward first, county below**.

Editorial
- The owner **writes and approves** every story; drafts may be prepared from the data for the owner to edit.
- **12-month targets:** all 247 places checked once; 15,000 followers across channels; monthly costs covered.
- **Sponsored content rules, published:** always labelled; never touches figures or stories; kept apart from stories and data pages.
- Correspondents' terms: **still not decided** (Careers stays "register your interest").

Opportunities this week
- Everything: public jobs and tenders, bursaries and scholarships, grants and trainings, private jobs; **with categories, filters and search**.
- Private jobs only from **a registered business**, and **never a job that charges applicants a fee**.

Data
- **Coverage shown everywhere, openly:** a coverage page, plus a line on the home page and each section, from day one.
- **Business directory:** businesses submit, we check they exist, then publish. Listing fee: decide later (free for now).
- **Market prices: later**, after facility visits are running.
- **WhatsApp "ask us":** answered by hand by the owner at first (WhatsApp Business quick replies and links); no bot.

The visit questionnaire (one per facility type; to be drafted and reviewed with the owner)
- **Types:** every kind of facility: health, schools, markets, water, roads, public offices.
- **Length:** 20 to 30 minutes, about 40 questions.
- **Four sources in each visit:** what we see ourselves; the person in charge (recorded by role, not name); 3 to 5 residents using the place (fixed questions, no names); official records compared afterwards.
- **Collect everything we reasonably can**, including how residents feel about the service.
- **Health scope:** essential drugs in stock on the day; staff present against staff posted; residents' reports of informal payments (always shown as reports, never as proven); maternity and emergency cover.
- **Residents' views:** collected at visits first ("What residents told us", with how many were asked and when); open online ratings on place pages later, moderated.
- Rules that follow from the law and our own: never record patients' or pupils' personal details; opinions are labelled as views, not facts; a named person or business gets a right of reply before a serious claim is published.

## Language goal (owner, 16 Nov 2026)

Once the Ekegusii dataset exists, Gusii Daily should be fully readable in Ekegusii: a language switch for the whole site, not only summaries. Ekegusii is the site's second language (not Kiswahili). Steps: (1) move every piece of interface text into one strings file per language, so a second language can be switched on without touching pages; (2) Ekegusii speakers translate and review the strings and the key pages; (3) machine translation of longer pages only after the dataset and a reviewed model exist, always marked and checked by a speaker. Before claiming "the first", check what else exists in Ekegusii online.
