# Kisii County leaders: sources, checks and open questions

Built 27 Nov 2026 for `data-src/kisii/leaders.json`, in the same shape as `src/data/leaders.json`. Not yet wired into the site. Seats: 1 Governor, 1 Deputy Governor, 1 Speaker, 1 Senator, 1 Woman Representative, 9 MPs, 45 MCAs = 59.

## Sources and what each confirms

| Source | Address | File checked | What it confirms |
|---|---|---|---|
| IEBC Gazette Notice No. 9956, Kenya Gazette Vol. CXXIV No. 170, 24 Aug 2022 (county assembly declarations) | https://www.iebc.or.ke/uploads/resources/t5KQ6O4YGp.pdf | Downloaded; sha256 eafe12d9e632fa70229f00acd6638b3fec3ca95368a5124d2f6960228db23e2a; text extracted with pdftotext | All 45 Kisii MCAs: ward, surname, other names, party abbreviation, votes. Each line matched by script. |
| IEBC Gazette Notice No. 9955 (senators), same PDF | as above | same file | Senator Onyonka Richard Momoima, ODM, 173,189 votes. |
| IEBC Gazette Notice 1 Dec 2025 (by-elections) | https://www.iebc.or.ke/uploads/resources/EHWTStffeC.pdf | Downloaded; sha256 0cb3cf767b3b5f4017fe465b913db94fa241d7d08cac719766ee5d8e3a271d4e | No Kisii ward is listed. The Nyamira by-elections (Nyamaiya, Ekerenyo, Nyansiongo) are listed. |
| Parliament of Kenya, member list | https://www.parliament.go.ke/the-national-assembly/mps | Pages 0–15 downloaded (partial list) | Woman Representative Aburi Donya Dorice (WDM); MPs Onchoke Charles Mamwacha (Bonchari, UPA), Kibagendi Antoney (Kitutu Chache South, ODM), Miruka Alfah Ondieki (Bomachoge Chache, UDA), Barongo Nolfason Obadiah (Bomachoge Borabu, ODM), Jhanda Zaheer (Nyaribari Chache, UDA). |
| Mzalendo, Kisii county profile | https://mzalendo.com/mps-performance/counties/kisii/ | Downloaded | Senator, Woman Rep, all nine MPs with parties; cites Gazette 9949 (governor), 9950 (MPs), 9951 (woman rep), 9955 (senator). Used for the four MPs not on the Parliament pages read. |
| Kenya News Agency, "New Kisii Deputy Governor Sworn In", 23 Jul 2024 | https://www.kenyanews.go.ke/new-kisii-deputy-governor-sworn-in/ | Downloaded | Elijah Obebo sworn in as Deputy Governor at Gusii Stadium after the impeachment of Robert Monda. |
| Kenya News Agency, Clerk sworn in, Mar 2026 | https://www.kenyanews.go.ke/?p=136102 | Downloaded | Dr Philip Nyanumba presiding as Speaker of the Kisii County Assembly. |
| Mount Kenya Times, "Dr Nyanumba elected third speaker for Kisii County" | https://mountkenyatimes.co.ke/?p=12228 | Search snippet only; article not read in full | Nyanumba elected Speaker, 47 votes to Eric Janganya's 21, replacing David Kombo. No date. |
| Kenya Law, Kisii County Government & 2 others v IEBC; Monda (Interested Party), Petition E006 of 2024 | https://new.kenyalaw.org/akn/ke/judgment/kehc/2024/8477/eng@2024-07-04 | Search snippet only | High Court at Kisii, 4 Jul 2024: directed the IEBC to gazette Obebo, or for him to be sworn in if it did not. |
| Kenya Law, appeal on the 2022 Nyatieko ward election (case name not read) | https://new.kenyalaw.org/akn/ke/judgment/kehc/2023/19285/eng@2023-06-30 | Search snippet only | Judgment of 30 Jun 2023 finding the 9 Aug 2022 Nyatieko ward election valid. |
| Standard, "Impeached senators vote to remove Kisii deputy governor" | https://www.standardmedia.co.ke/politics/article/2001491501/impeached-senators-vote-to-remove-kisii-deputy-governor-from-office | Search snippet only | Senate upheld the impeachment of Robert Monda in March 2024. |
| kisii.go.ke, Office of the Speaker | https://kisii.go.ke/index.php/office-of-the-speaker | Search snippet only | Names Kerosi Ondieki as Speaker. This conflicts with the KNA 2026 report and looks out of date. |

Kisii County Governor's sworn-in: kisii.go.ke "H.E Hon. Paul Simba Arati Sworn In as Governor" (https://kisii.go.ke/?p=13673), seen in search results and not opened.

## Seat by seat

| Seat | Holder | Party | Status of check |
|---|---|---|---|
| Governor | Paul Simba Arati | ODM | Mzalendo cites Gazette 9949; sworn-in page seen in search only. Gazette not read. **Uncertain (primary not read).** |
| Deputy Governor | Elijah Obebo | not confirmed | Sworn in July 2024 (KNA). Party not stated in sources read. **Confirmed; party null.** |
| Speaker, County Assembly | Philip Nyanumba | not confirmed | Presiding in March 2026 (KNA). Election date not found. **Confirmed as current; election date open.** |
| Senator | Richard Momoima Onyonka | ODM | Gazette 9955, read in full. **Confirmed.** |
| Woman Representative | Dorice Donya Aburi | Wiper (WDM-K in Mzalendo) | Parliament list and Mzalendo. Gazette 9951 not read. **Confirmed by parliament list.** |
| MP, Bobasi | Innocent Momanyi Obiri | Wiper | Mzalendo only; not on the Parliament pages read. **Uncertain.** |
| MP, Bomachoge Borabu | Obadiah Nolfason Barongo | ODM | Parliament list. **Confirmed.** |
| MP, Bomachoge Chache | Alfah Ondieki Miruka | UDA | Parliament list. **Confirmed.** |
| MP, Bonchari | Charles Mamwacha Onchoke | UPA | Parliament list. **Confirmed.** |
| MP, Kitutu Chache North | Japheth Mokaya Nyakundi | UDA | Mzalendo only. **Uncertain.** |
| MP, Kitutu Chache South | Antoney Kibagendi | ODM | Parliament list. **Confirmed.** |
| MP, Nyaribari Chache | Zaheer Jhanda | UDA | Parliament list. **Confirmed.** |
| MP, Nyaribari Masaba | Daniel Ogwoka Manduku | ODM | Mzalendo only. **Uncertain.** |
| MP, South Mugirango | Silvanus Osoro | UDA | Mzalendo only. **Uncertain.** |
| MCAs (45 wards) | As in `leaders.json` `mcas` | As printed in 2022 | Every name, party and vote count matched to the gazette text by script; all 45 confirmed against the Kisii County Assembly member list (kisiiassembly.go.ke, updated 27 Nov 2026). Gazette name order differs on 10 wards; the County Assembly listing is used as the current record. |

Tally: 58 confirmed by a primary or official source (46 gazette-read or parliament-read seats, the Deputy Governor, the current Speaker, and all 45 MCAs against the County Assembly list). 1 uncertain: the Governor (Gazette 9949 not read).

## Changes since August 2022

- **Deputy Governor:** Robert Monda (elected with the Governor in 2022) was impeached by the County Assembly on 29 Feb 2024. The Senate upheld the impeachment in March 2024. Monda filed court challenges. Search summaries report that Justice Okwany of the Nyamira High Court refused conservatory orders for his reinstatement in 2024; the summary was not read in full. Elijah Obebo was nominated, approved and sworn in in July 2024 after the High Court order of 4 Jul 2024. **No final outcome of Monda's appeal or petition was found.**
- **Speaker:** Nyanumba replaced David Kombo (Mount Kenya Times). **Election date not found.** The county website names an earlier Speaker.
- **MCAs:** No Kisii ward appears in the 1 Dec 2025 by-election gazette. A Nyacheki ward by-election was reported (Nation; Standard, undated) with a winner named Naftal Onkoba (ODM); the 2022 gazette lists Naftal Nyaberi Onkoba (JP). **Date and result not confirmed; left as the 2022 gazette name.** Searches found no other Kisii MCA death, expulsion or nullification. Searches were not exhaustive.
- **Governor:** One search found no motion to remove Governor Arati in 2025 or 2026. **Not exhaustively checked.**

## Open questions

1. Read Gazette 9949 (governor), 9950 (MPs) and 9951 (woman rep) to confirm the remaining Kisii seats from the primary source. Notices 9949, 9950 and 9951 were not found by search, and the Kenya Gazette archives tried did not hold the 23 Aug 2022 issues. **All 45 MCA names are confirmed against the County Assembly member list (kisiiassembly.go.ke), but Gazette 9956 itself has not been read character-by-character.**
2. Complete the Parliament list (pages 16 onward, not downloaded) to confirm Obiri, Nyakundi, Manduku and Osoro.
3. Date of Nyanumba's election as Speaker, and the Speaker named on kisii.go.ke.
4. Outcome of Monda's appeal and petition; whether Obebo's gazettement is complete.
5. Nyacheki by-election: date, candidates, and whether it changed the ward's MCA.
6. Party changes since 2022 for MCAs; the file gives 2022 parties only.


## Gap pass (after the first pass)

All 45 MCA names are set (confirmed against gazette 9956 and the County Assembly member list). No seats are null. Names are set where two sources agree; name-order differences between the gazette and the County Assembly list are noted on each entry.

| Seat | Result | Source |
|---|---|---|
| Governor, Paul Simba Arati | Confirmed: sworn in (Kisii County Government) and reported in Capital FM | kisii.go.ke/?p=13673; capitalfm.africa |
| MP, Bobasi: Innocent Momanyi Obiri | Confirmed: Star and IEBC-based list (middle name from Mzalendo) | the-star.co.ke 2022-08-11; educationnewshub |
| MP, Kitutu Chache North: Japheth Mokaya Nyakundi | Confirmed: Star and IEBC-based list | same |
| MP, Nyaribari Masaba: Daniel Ogwoka Manduku | Confirmed: Star and IEBC-based list | same |
| MP, South Mugirango: Silvanus Osoro | Confirmed: Star and IEBC-based list. The Star places him under Nyamira; the IEBC code (262) places South Mugirango in Kisii | same |
| MCA Kiogoro: Obare Mochache Walter (Wiper, 3,766) | Confirmed: gazette 9956 and Mzalendo (same person, name order differs) | iebc gazette 9956; mzalendo |
| MCA Kiamokama: Malack Mainya Matara (ODM) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Sensi: Onchong'a Nyagaka Saisi (PDP) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Marani: Dennis Ochwang'i Ombachi (PDP) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Monyerero: Peter Gichana Otachi (ODM) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Kitutu Central: Duke Samwel Nyarango (ODM) | Confirmed: gazette 9956 and County Assembly list | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Nyakoe: Cosmas Asimundi Oyagi (KNC) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Nyatieko: Amos Omweri Mokaya (KSC) | Confirmed: gazette 9956 and County Assembly list | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Bogusero: Vincent Obuga Onyangore (ODM) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Bogeka: Richmond Manani Rayori (DAP-K) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |
| MCA Kegogi: Jared Kimori Masieka (UDA) | Confirmed: gazette 9956 and County Assembly list (name order differs; County Assembly used) | iebc gazette 9956; kisiiassembly.go.ke |

Notes on the gazette: the schedule defines column 7 as surname and column 8 as other names (Kenya Gazette, 24 Aug 2022). The earlier "unclear order" note was a guess, not a finding, and the name order used throughout is other names then surname.

Other finding: the gazette and a news list disagree on Bogiakumu (gazette: Ismael Bosire, ODM; news list: Ishmael Omwongo). That seat is already set, so it is flagged here for checking.
