# Have your say: research notes (checked 2026-10-24)

Downloads are kept, untouched, in `dl/` (untrusted). Nothing was run from that folder.

## How publication dates were recorded
- County notices on nyamira.go.ke are **undated**. The `date` field is the date the file was posted, taken from the timestamp prefix in each file name (DD_MM_YYYY).
- Some file names also hint at the newspaper print date: `..._14-4-26` for the budget notice and `..._9_Sept_26` for the ADP notice. The newspaper is not named anywhere. These are recorded as hints only, not as verified dates.
- The CFSP notice file (`0000435107-01_RUTH_OMWENGA`) looks like a newspaper ad proof. It was posted on 23 Feb 2026, the day before the forum.

## What was found
**No upcoming forum is posted** on any official site checked (as of 24 Oct 2026). Every 2026 forum found has already happened:

| Forum | Date(s) | Venues | Memo deadline | Source |
|---|---|---|---|---|
| CFSP + County Debt Management Strategy Paper 2026/27 | 24 Feb 2026 | 5 sub-county venues | 24 Feb 2026 | nyamira.go.ke Public Notices |
| Programme Based Budget Estimates 2026/27 | 23 Apr 2026 | 5 sub-county venues | 23 Apr 2026 | nyamira.go.ke Public Notices |
| County Annual Development Plan 2027/28 | 17 Sep 2026 | 5 sub-county venues | 17 Sep 2026 | nyamira.go.ke Public Notices |
| (2025) ADP 2026/27 feedback sessions | 24 Sep 2025 | 5 venues | none given | PP Report |
| Assembly: Finance Bill 2025 | headline only | none | none | Assembly home page |

- Every county notice uses one channel: Ward/sub-county administrator's offices, **info@nyamira.go.ke**, **P.O BOX 434-40500, Nyamira**, and toll-free **800720176**.
- The forums now run one day, at **one venue per sub-county**. Earlier notices (2023, 2024) listed all 20 wards.
- Each notice sets the memo deadline **on the forum day**.
- Templates were posted only 3 to 6 days before each forum.

## Conflicts to flag on the site
1. **ADP 2027/28 forum date.** The notice says Thursday 17 Sept 2026. The final CADP 2027/28 says "24th September 2026" in s.1.3 and "29th September 2026" in its public-participation annex. All three dates come from official documents.
2. **ADP 2026/27 PP report** says "Monday, 24th September 2025". 24 Sept 2025 was a Wednesday.
3. **Circular vs actual.** Treasury Circular No 1 2025/26 planned the CFSP forum for 16-17 Feb 2026 (held 24 Feb). It planned the budget forum for 14-16 Apr 2026 (held 23 Apr, the same day the draft was due to the CEC). It planned the ADP forum for August 2025 (held 24 Sept 2025).
4. **Circular internal slips.** Section 3.3 says "1th Quarter ... 2024/2025" by 15 Oct 2025. The cover is dated August 2025, but s.1.2 says guidelines were issued 29 July 2025.

## The yearly cycle and `/learn/budget-calendar/`
Legal dates come from the **as-enacted 2012 PFM Act** (NCLR text, World Bank copy). The current consolidated text on new.kenyalaw.org (latest amendment listed: County Public Finance Laws (Amendment) Act No. 16 of 2025, version 19 Aug 2025) could not be read past s.85, and kenyalaw returned 403 to curl.

**Unverified (secondary source only).** Kenyans.co.ke (8 Sep 2026) reports a newly signed PFM amendment that:
- requires county Finance Bills to pass **before the new financial year**, which would replace the s.133 rule of 90 days after the Appropriation Act;
- gives assemblies **21 days instead of 14** to consider key budget documents.

Confirm both against the Act text or Gazette before publishing.

Comparison with `src/pages/learn/budget-calendar.astro`:
- **1 Sept ADP.** Agrees (s.126(3)).
- **30 Sept CBROP.** Partly agrees. 30 Sept is the deadline to submit to the **County Executive Committee** (s.118(1)(b)). The CEC then has 14 days, and the paper goes to the Assembly within 7 days of approval. Nyamira planned 21 Oct for the Assembly. The page note doesn't say "to the Assembly", so it is not wrong, but it could be clearer.
- **28 Feb CFSP.** Agrees (s.117(1)). This is submission to the Assembly. The Assembly then has 14 days, possibly 21 now (see the amendment above).
- **30 Apr estimates to the Assembly.** Agrees (s.129(2)(a)).
- **30 June budget approved.** Agrees in substance (s.131(1): approve estimates in time for the appropriation law to pass by 30 June).
- **Missing from the page:**
  - the 30 Aug budget circular (s.128(2));
  - the Finance Bill (s.133, possibly changed);
  - the explicit public-input points: s.117(5)(b) CFSP views of the public, s.125(2) public participation, s.131(2) committee must consider public views, s.137 CBEF.
- The page comment "confirm each against the Act before launch" still stands for the consolidated text.

## Standing channels
- **Petitions.** The procedure comes from the Petition to County Assemblies (Procedure) Act 2020, ss.3-5. In short: submit in writing to the Clerk; the Clerk reviews within 7 days; a committee reports; the petitioner is notified within 14 days of the decision.
  - The Assembly's own Standing Orders PDF (`/phocadownload/StandingOrders/SO.2022/Nyamira County Standing Orders.pdf`) could not be downloaded (connection reset, 3 tries plus WebFetch). The Assembly-specific petition rules and committee timelines are therefore **not captured**.
  - The Assembly Petitions Tracker lists only 9 petitions from 2017, all about vetting nominees.
- **Assembly contacts:** P.O Box 590-40500 Nyamira, 0701 967 200, info@nyamiraassembly.go.ke.
- **CBEF.**
  - No official Nyamira membership list or contact was found on nyamira.go.ke, on the Assembly site, or by search.
  - The Gazette of 26 May 2023 (No. 122) checked in passing has a CBEF notice for another county, not Nyamira.
  - CBROP 2025 says induction of 21 CBEF members was "Not done".

## Gaps / next steps
1. **No upcoming forum** is posted:
   - **CBROP 2026.** Due to the CEC by 30 Sept 2026; nothing posted.
   - **Treasury circular for FY2027/28.** Due 30 Aug 2026; not posted.
   - **County Finance Bill 2026/27.** Forum was planned 23-24 June 2026; no notice found.
   - **Supplementary budgets.** Nothing found.
   - **Sector bills.** None found.
2. **County Assembly site** (nyamiraassembly.go.ke) refused direct downloads and only partly loaded via WebFetch. Still to check:
   - committee calls for memoranda on the 2026/27 estimates (s.131(2) hearings, normally May-June);
   - Finance Bill 2025 forum details;
   - Bunge Mashinani pages;
   - Committees Sitting Schedule;
   - Standing Orders.
   Try again from another network or a browser.
3. **Kenya Gazette** was not searched systematically for 2026 Nyamira notices.
4. **Newspapers.** The print dates and titles of the county's adverts were not identified.
5. **Facebook / X.** The county's Facebook (id 100063963438374) and X (@NyamiraCountyG) were not checked; they need a browser.
6. **National forums held in Nyamira** (left out of forums.json because only secondary sources were found):
   - The National Assembly Education Committee held hearings on six education bills in Nyamira, 28 Sep - 2 Oct 2026 (The Star, 23 Sep 2026; no venue).
   - Finance Bill 2026 hearings at "NG-CDF Hall, West Mugirango" on "Thursday, 6th June" (People Daily, 2 Jun 2026). 6 June 2026 was a Saturday.
   Primary parliament.go.ke notices are needed before either is listed.
