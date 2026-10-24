# Tea and milk payouts for Nyamira: notes (checked 2026-10-24)

## Method
- Factory locations come from KTDA's own pages: ktdateas.com/nyamira-county/, ktdateas.com/kisii-county/ and the factory pages and subdomains. I cross-checked them against the Tea Board of Kenya manufacturers list.
- Payout figures come from media articles (Standard, Nation, Kenyans.co.ke, Kenya Times, Kahawatungu) and one official KTDA PDF (the June 2022 FY "Tea Growers Payment" table). I downloaded each article with curl and pulled the dates from the page's `datePublished` metadata. The `wording` field quotes each article's text.
- I did not estimate, derive, subtract or average anything. Where the same figure appears in more than one source, I recorded each source as a separate row.
- Raw downloads are in `dl/` and treated as untrusted data. The scripts that read them are in `scripts/` and `extract.py`.

## Factories serving Nyamira
- **Nyamira, per KTDA:** Nyansiongo, Sanganyi, Kebirigo, Nyankoba, Tombe and Gianchore.
- **Matunwa, also Nyamira:** this one was not on the candidate list. The Tea Board lists it as KTDA-managed. KNA describes it as "a satellite of Nyansiongo Tea Factory". I found no payout figures for it.
- **Kisii, not Nyamira:** Itumbe (Sameta sub-county), Rianyamwamu (Kisii central), Eberege (Kenyenya sub-county) and Kiamokama (Masaba South). They appear in `factories` for reference only, and I collected no tea rows for them.
- **Wards:** no official or reputable source gives a ward for any factory, so `ward` is null for all of them. KTDA uses old district, division and location names, such as Borabu District, Manga Division and "Bonyamatuta Masaba Location". I did not map these to current wards.

## Conflicts
1. **Tombe's county.** KTDA says "Tombe Market, Bonyamondo sub-location, Manga division ... Nyamira County". The Tea Board list says county "Kisii". Tombe was also not among the five factories named in the Feb 2026 Zone 10 (Nyamira) monthly-rate notice. I recorded it as Nyamira on KTDA's authority, but the conflict needs resolving, for example by asking KTDA or the factory.
2. **FY2024/25 bonuses, which are interim or "documents seen".** On 3 Sep 2025, KTDA said that "Factories have not yet declared their final payment for the 2024/2025 financial year. The numbers circulating online are therefore false" (FBMEA, 5 Sep 2025). The Nation figures came later, on 29 Sep 2025, and cite an "interim report" and "documents seen". Two later sources repeat those figures and so partly corroborate them: The Standard (30 Sep 2026) gives Gianchore's prior year as Sh13, and Kahawatungu (23 Oct 2026) gives Nyansiongo Sh12 and Kebirigo Sh13. I found no KTDA or factory notice that states the FY2024/25 finals directly.
3. **FY2024/25 government refund.** The Star (7 Oct 2025) reports a Sh2.7bn GoK refund paid "equitably" to farmers in October 2025 payslips, on top of the bonus. No per-kg amount for Nyamira factories was published, so farmers' actual receipts for that year may be higher than the bonus rows show.
4. **FY2025/26 bonuses.** On 25 Sep 2026, KTDA called a circulating consolidated bonus list "misleading and unverified" (Africa Check). Each factory was to declare its own rate. The figures recorded here are:
   - Gianchore at Sh18, from The Standard (30 Sep 2026).
   - Nyankoba 30, Kebirigo 19, Sanganyi 18, Gianchore 18 and Tombe 16, all from Kahawatungu (23 Oct 2026). Kahawatungu calls them "reported rates" and names no source.

   Education News Hub publishes the same numbers (1 Oct 2026), "supplied for publication". However, its own 2 Oct 2026 article gives Sanganyi as KSh16 instead of KSh18, which contradicts itself. I judged it low-reliability and excluded it from the JSON. **I found no FY2025/26 figure for Nyansiongo** in a reputable source. Education News Hub gives "Nyasiongo" KSh18, which is unverified. The Nyamira and Kisii growers' judicial review of the 2025/26 bonus (Nation, 9 Oct 2026) lists Sanganyi, Kebirigo and Tombe as interested parties. Figures could change.
5. **Gianchore FY2022/23.** The Standard (18 Sep 2023) prints "those of Gianchore Sh31 and Sh30". The sentence is garbled, and I recorded Sh31 with that caveat. Education News Hub's 2023 list also shows Gianchore at 31.00, but I excluded it as low-reliability.
6. **Monthly rate for 2026.** The Zone 10 (Nyamira) notice holds the monthly rate at KSh24/kg, reported on 5 Feb 2026 by Kenyans.co.ke, the Kenya Times and The Star. On the same day, PS Ronoh ordered West of Rift factories to pay "a minimum of Sh26" (The Star). KNA (2 Feb 2026) says that "those in the west of the rift will now receive Sh26 per kilo of green leaf monthly". This regional figure is not specific to any factory, so it is not in the JSON. **I found no published confirmation of whether the Nyamira factories moved from 24 to 26.** The Kenya Times also dates the notice to "Thursday, January 5", which looks like an error for Thursday, 5 February.
7. **The FY2024/25 advance.** FBMEA (5 Sep 2025) says farmers had received an "advance monthly payment of Kes 23 per kilogram" during the year. This is a national statement, not specific to any factory, so it is not in the JSON.

## Totals per kg
- The only "total paid per kg" figures come from KTDA's official June 2022 FY table, which covers FY2021/22 and FY2020/21 for Region 6 (Kisii/Nyamira).
- In that table, Tombe appears as "TOMBE/SOMBOGO".
- I found no KTDA bonus tables for 2023, 2024 or 2025 on ktdateas.com. I checked several likely URLs and all returned 404.
- No source gives a total per kg for FY2022/23 to FY2025/26, and I did not compute one by adding the monthly rate to the bonus.

## Gaps
- **FY2025/26 bonus:** no reputable figure for Nyansiongo. All the others except Gianchore rest only on Kahawatungu.
- **FY2024/25 bonus:** none found for Nyankoba.
- **FY2023/24 bonus:** found only for Nyankoba (Sh40). Nothing found for Nyansiongo, Sanganyi, Kebirigo, Tombe or Gianchore.
- **Monthly rates:** only the 2026 Zone 10 KSh24. Nothing found by factory for earlier years.
- **Matunwa:** no figures at all.
- **Wards:** none sourced.
- **Site warning:** the KTDA factory subdomains (nyansiongo., gianchore., kiamokama.ktdateas.com) contain injected casino or gambling spam. They are still the official factory sites, but treat them with care, and do not link readers to them without checking first.

## Milk
**No farm-gate milk price specific to Nyamira, or to a buyer in Nyamira, was found, so `milk` is empty.** These are the leads I checked:
- **Brookside** has raw-milk collection points in Nyamira (Standard, 2 Sep 2017). The article gives no price.
- **Cooperatives that received government coolers** (TV47, 23 May 2026; KBC, 26 May 2026): Gesima (Gesima Ward), Kineni (Esise Ward), Bonyasige (Magombo Ward), Kebirigo (Bonyamatuta Ward) and Magwagwa (Magwagwa Ward). These are possible buyers to contact, but no prices were published.
  - TV47's "5,000 litres ... KSh 245,000 in collective daily income" implies a per-litre figure. That is a calculation, not a published price, so I did not record it.
- **National New KCC and government prices**, which are not specific to Nyamira, and it is unconfirmed whether New KCC buys in Nyamira:
  - New KCC raised its price to Sh50/litre from 1 Mar 2024 (Business Daily, 29 Feb 2024).
  - President Ruto announced Ksh65 per litre plus a Ksh2 quarterly bonus from October 2026 (Kenyans.co.ke, 20 Oct 2026, Mashujaa Day). The article does not say which buyers this binds.
- **Suggested next step:** ask the Nyamira County Department of Agriculture, Livestock and Fisheries or the cooperatives above for their current pay rates, and the Kenya Dairy Board for any county price data.
