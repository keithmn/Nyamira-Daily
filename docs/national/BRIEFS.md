# Briefs for the people Kenya Budget Explained needs before launch

One brief per role, written to be sent as it is. Nobody needs to use Git or code: each person works in a spreadsheet or a document and sends it back, and Claude Code or a developer loads the result. The founder sends each person the files their brief names. Kenya Budget Explained is a working name.

Every brief rests on the same rules:

- **Figures:** never estimate a figure. If something is unclear, say so instead of guessing.
- **Wording:** ask questions, never make accusations. The site is non-partisan and takes no side for or against any party, candidate or official.
- **Personal data:** none goes into any file.

---

## 1. Checking the figures (an editor or researcher)

**Why:** every figure on the site was read from an official PDF and checked by machine, then checked again by Claude Code. Only a person's check lets a figure carry the label "verified" instead of "official".

**What to check:** 219 rows in seven tables. Each row is one figure or one name. Compare it with the page of the PDF it came from, and mark it right or wrong.

| Table | What it is | Rows |
|---|---|---:|
| County Allocation of Revenue Act 2026, First Schedule | Each county's share, typed from a picture of the page | 47 |
| Mwananchi Guide 2026/27, p.14 | The Guide's county table, typed from a picture | 47 |
| Appropriation Act 2026, corrections | Amounts where the scan was misread and corrected from the page image | 22 |
| Appropriation Act 2026, names | Programme and ministry names repaired from the page image | 6 |
| Budget Explainer 2026, sectors | Which ministry belongs to which sector | 87 |
| Budget Explainer 2025, names | Last year's ministries matched to this year's where the name changed | 5 |
| Controller of Budget FY2025/26, known issues | Places where the report does not add up as printed | 5 |

**What you get:** the seven tables as spreadsheets, and the PDFs.

**What to send back:** each spreadsheet with two columns filled in:

- `checked`: right or wrong;
- `note`: for anything wrong, what the page shows.

Also send your name as you want it recorded, and the date.

**Time:** about one working day.

---

## 2. Reviewing the Kiswahili (a native speaker)

**Why:** the site has a full Kiswahili version. Every word in it was written by Claude Code, so it is marked "Awaiting native-speaker review" until a native speaker has read it.

**What to review:**

- `review/kiswahili-strings.csv`: 605 lines of interface text, each with its English beside it. Some lines have places for numbers or names, such as `{amount}` or `{name}`. Keep those exactly as they are.
- `review/kiswahili-explainer-summaries.csv`: the Kiswahili summaries of the ten explainers.

**What to aim for:** plain, everyday Kiswahili that a reader in a county town would use. It should not read like a word-for-word translation. Keep budget terms consistent; the glossary on the site lists them.

**What to send back:** both files, with the `kiswahili_reviewed` column filled in wherever you change a line, and a short `note` where the choice is not obvious.

**Time:** two to three days.

---

## 3. Editing the explainers and questions (an editor)

**Why:** the site's explainers, method notes and question templates were written by Claude Code. They need an editor's read for accuracy, fairness and plain language before launch.

**What to read:**

- The ten explainers at `/learn/`: how the budget is made, the equitable share, Consolidated Fund Services, why numbers change by stage, reading a Programme Based Budget, development spending, pending bills, own-source revenue, how to submit a memorandum, and NG-CDF.
- The methods page, `/methods/`.
- The questions the site asks on each county page and on `/projects/`.

**What to check:**

- Is each sentence true to the source it cites?
- Is anything an accusation instead of a question?
- Could any reader take it as supporting or opposing a party or a person?
- Is it plain enough for a first-time reader?

**What to send back:** comments in a document, each with the page address. Where you change the text of an explainer, give the new text in full.

**Time:** one day.

---

## 4. Typing the programme targets (two typists)

**Why:** the Programme Based Budget lists what each ministry promises to deliver, with targets for three years. The tables run across columns in a way no machine reads reliably. So two people type them, separately, and anywhere the two typings differ is checked against the page.

**What to type:** Part E of the approved Programme Based Budget for FY2026/27, which runs to about 545 pages. Start with the ten largest ministries:

- Teachers Service Commission (2091)
- Defence (1041)
- Roads (1091)
- Higher Education (1065)
- National Police Service (1025)
- Housing and Urban Development (1094)
- Basic Education (1066)
- Medical Services (1082)
- National Treasury (1071)
- Agriculture (1169)

**How:**

- Use `review/programme-targets-template.csv`, one row per performance indicator. The first row is an example taken from page 300; delete it before you start.
- Type every value exactly as printed, including commas, percentages and dashes.
- Leave a cell empty if the page leaves it empty.
- Put the PDF page number on every row.
- Do not compare your work with the other typist's until both of you have finished.

**What to send back:** your completed sheet, with your initials in `typed_by` and the date in `typed_on`.

**Time:** about two days per typist for the ten ministries.

---

## 5. Running the usability rounds (ward champions)

**Why:** the site is meant for everyone, not only people who are used to budget documents. Five people try five tasks on a phone, and we fix what stops them.

**Who takes part:** five people per round.

- At least two who don't use the internet often.
- At least two who prefer Kiswahili.

Ask each person's consent first. Record notes only: no names, phone numbers or photos of faces.

**What you need:**

- a mid-range Android phone on mobile data, not Wi-Fi;
- the site's address;
- a stopwatch;
- `USABILITY.md`, which has the five tasks and a results table.

**How:**

- Read each task aloud.
- Don't help unless the person is stuck for more than a minute.
- For each task, note:
  - whether they finished;
  - how long it took;
  - how many taps;
  - where they got stuck, in their own words.

**What to send back:** the results table for each participant, and your three biggest observations.

**Time:** about an hour per participant, including consent.

---

## 6. Wording the trust pages (a lawyer)

**Why:** the site needs five pages before it launches:

- About;
- Who runs us;
- Privacy;
- Terms;
- Right of reply.

Their legal wording should come from a lawyer.

**Facts the wording must reflect:**

- **Publisher:** the site is built and published by Underdogs Rising Group Limited. It is editorially independent and non-partisan. It plans to move into its own non-profit once impact is shown. Until that entity exists, it must not be called a non-profit, NGO, charity or PBO (decision #73). Please check the registered company name against the certificate.
- **Data:** shared under the Creative Commons Attribution 4.0 licence.
- **No tracking:** no third-party scripts or trackers, and no accounts. A reader's chosen county and theme are kept only in their own browser.
- **Forms that send:** only the corrections form, once it is switched on.
  - It stores what the reader types: the page or figure, a description and an optional source link.
  - It stores a keyed hash of their internet address for one hour, for the rate limit.
  - Reports are deleted after a set number of days.
  - Cloudflare's Turnstile check runs on that page only.
- **Tools that send nothing:** the memorandum builder and the tax tool send and store nothing.
- **Right of reply:** the site names offices in its questions, and the founder wants a right-of-reply process for them. Please propose how replies are received and published.

**What to send back:** the text for the five pages, and anything the site should change to meet the law, for example under the Data Protection Act, 2019.
