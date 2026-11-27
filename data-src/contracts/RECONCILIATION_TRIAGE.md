# Contract ↔ Project Reconciliation Triage

Generated: 21 November 2026
Sources: `data-src/contracts/reconcile-review.json` (176 candidate pairs from `scripts/reconcile-contracts.py`), `src/data/contracts.json` (contract records), `src/data/wardspend.json` (budget project records), and `data-src/contracts/project-links.json` (currently approved links)

## Summary

| Category | Records | Unique pairs | Action |
|---|---|---|---|
| **Confident** | 8 | 7 | Automated candidates in `project-links-proposed.json`; not approved |
| **Likely** | 8 | 7 | Worth reviewing — good candidates |
| **Ambiguous** | 29 | 16 | Need human judgment |
| **Reject** | 131 | — | False positives from fuzzy matching |

## Manual review (21 Nov 2026)

None of the seven newly proposed pairs was added to `project-links.json`. Similar names, wards and amounts make candidates worth checking, but do not by themselves establish that a contract and a budget line describe the same work.

- **C-09cadd53 → P-0f5d811:** the road names match, but the contract is from 2019/20 and the project line is from 2023/24. The contract has no ward, and the amounts differ (KSh 4,198,678 and KSh 5,506,520). Repeated work on the same road is possible; the records do not confirm it is the same project.
- **C-9d857a5e → P-f860931 / P-69aab24:** the exact same-year, same-amount Bogwendo line is already in `project-links.json`. The two additional lines are 2025/26 budget entries, not proof of two more links to the 2023/24 contract. The Magombo Borehole entry also does not name Bogwendo.
- **C-40e0224b, C-8aaf0c23, C-b5a5fa4d and C-e06a6fee:** each contract covers multiple wards, while its proposed project line names only one ward. The amounts and financial years also differ. No source-level record in this triage establishes that the single-ward lines are the component projects of those bundled contracts.

These seven pairs remain proposals for further documentary review. The live approved links are unchanged.

## Why so many rejections?

The core problem: **the county awards water spring contracts by ward, but the reconciliation script matched them to generic "water springs" projects in other wards.**

- 112 records rejected for ward conflict (contract names ward X, matched to project in ward Y)
- 57 records rejected for low similarity with no ward match

For example, "PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN BOKEIRA WARD" (contract C-5eb4b780) was matched to water springs projects in Gesima, Mekenene, Ekerenyo, Nyansiongo — all different wards. Only the Bokeira match (if it exists) would be real.

**Pattern:** Most county water/borehole contracts name a specific ward. The budget (wardspend.json) also lists per-ward water projects. When the reconciliation script uses text similarity alone, every water contract matches every water project. Ward filtering eliminates most false positives.

## Automated high-scoring candidates (not approved)

The automated rules surfaced six contract groups with seven new candidate pairs. They are listed below for traceability; the manual review above explains why none was promoted.

**C-09cadd53** → **P-0f5d811**
- Contract: REPAIR & MAINTENANCE OF NYARONDE MKT–NYARONDE PRI SCH–MILIMANI–RIBAITA ROAD
- Project: Road routine maintenance: Nyaronde Mkt - Nyaronde Pri Sch - Milimani - Ribaita (6.0 km)
- Similarity: 1.00 | Contract FY: 2019/20 | Project FY: 2023/24
- Contract amount: KSh 4,198,678 | Project amount: KSh 5,506,520
- Wards: contract=none, project=nyansiongo
- Reason: similarity 1.00

**C-9d857a5e** → **P-f860931**
- Contract: REHABILITATION AND WATER DISTRIBUTION OF BOGWENDO BOREHOLE IN MAGOMBO WARD
- Project: Pipping and water distribution at Bogwendo borehole
- Similarity: 0.67 | Contract FY: 2023/24 | Project FY: 2025/26
- Contract amount: KSh 1,995,026 | Project amount: KSh 1,000,000
- Wards: contract=magombo, project=magombo
- Reason: sim 0.67, ward match, amounts within 3x

**C-9d857a5e** → **P-69aab24**
- Contract: REHABILITATION AND WATER DISTRIBUTION OF BOGWENDO BOREHOLE IN MAGOMBO WARD
- Project: Pipping and water distribution at Magombo borehole
- Similarity: 0.67 | Contract FY: 2023/24 | Project FY: 2025/26
- Contract amount: KSh 1,995,026 | Project amount: KSh 2,000,000
- Wards: contract=magombo, project=magombo
- Reason: sim 0.67, ward match, amounts within 3x

**C-b5a5fa4d** → **P-28ade86**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN MAGWAGWA AND BOKEIRA WARDS
- Project: Proposed Construction and Protection of Water Springs
- Similarity: 0.60 | Contract FY: 2024/25 | Project FY: 2023/24
- Contract amount: KSh 1,734,372 | Project amount: KSh 1,599,965
- Wards: contract=bokeira, magwagwa, project=bokeira
- Reason: sim 0.60, ward match, amounts within 3x

**C-40e0224b** → **P-2eb752c**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN KIABONYORU AND MEKENENE WARDS
- Project: Proposed Construction and Protection of Water Springs
- Similarity: 0.60 | Contract FY: 2024/25 | Project FY: 2023/24
- Contract amount: KSh 1,739,965 | Project amount: KSh 3,499,720
- Wards: contract=mekenene, kiabonyoru, project=mekenene
- Reason: sim 0.60, ward match, amounts within 3x

**C-e06a6fee** → **P-98569a5**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN EKERENYO AND ITIBO WARDS
- Project: Proposed Construction and Protection of Water Springs
- Similarity: 0.60 | Contract FY: 2024/25 | Project FY: 2023/24
- Contract amount: KSh 1,739,594 | Project amount: KSh 999,874
- Wards: contract=itibo, ekerenyo, project=ekerenyo
- Reason: sim 0.60, ward match, amounts within 3x

**C-8aaf0c23** → **P-978d3de**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN ESISE AND NYANSIONGO WARDS
- Project: Proposed Construction and Protection of Water Springs
- Similarity: 0.60 | Contract FY: 2024/25 | Project FY: 2023/24
- Contract amount: KSh 1,736,520 | Project amount: KSh 1,599,965
- Wards: contract=nyansiongo, esise, project=nyansiongo
- Reason: sim 0.60, ward match, amounts within 3x

## Likely matches (review recommended)

These have supporting evidence but need a quick check:

**C-b9ee6f18** → **P-6eea4c4**
- Contract: PROPOSED EQUIPPING AND DISTRIBUTION OF GESIMA BOREHOLE IN GESIMA WARD
- Project: Water distribution at Gesima water borehole
- Similarity: 0.75 | FY: 2022/23 → 2025/26 | Wards: gesima → gesima
- Amounts: KSh 2,847,800 → KSh 500,000
- Reason: sim 0.75, ward match, amounts differ 5.7x

**C-86bf6a6e** → **P-d116175**
- Contract: CONSTRUCTION AND COMPLETION OF A PSYCHIATRIC HOSPITAL AT RIOMEGO (MAGWAGWA)
- Project: Equipping of Magwagwa Psychiatric hospital
- Similarity: 0.75 | FY: 2021/22 → 2024/25 | Wards: none → magwagwa
- Amounts: KSh 106,495,410 → KSh 2,500,000
- Reason: sim 0.75, single match

**C-f5cc5b71** → **P-7b1b69d**
- Contract: REPAIR & MAINTENANCE OF MOSOBETI–ENTOROBO TBC – NYARONGE TBC ROAD
- Project: Mosobeti-Entorobo-Nyaronge
- Similarity: 0.75 | FY: 2019/20 → 2025/26 | Wards: none → gesima
- Amounts: KSh 3,067,807 → KSh 1,500,000
- Reason: sim 0.75, single match

**C-15518591** → **P-1cc28de**
- Contract: PROPOSED RENOVATION OF MORTUARY AND INSTALLATION OF A NEW COOLING SYSTEM AT NYAMIRA COUNTY REFERRAL 
- Project: Proposed Renovation and installation of new cooling system at NCRH Mortuary
- Similarity: 0.62 | FY: 2021/22 → as at 30 Jun 2025 | Wards: none → township
- Amounts: KSh 9,040,205 → KSh 9,040,205
- Reason: sim 0.62, single match

**C-6dcadd99** → **P-28ade86**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS FOR BOKEIRA, NYAMAIYA & MAGWAGWA WARDS
- Project: Proposed Construction and Protection of Water Springs
- Similarity: 0.50 | FY: 2024/25 → 2023/24 | Wards: bokeira, magwagwa, nyamaiya → bokeira
- Amounts: KSh 1,249,695 → KSh 1,599,965
- Reason: low sim 0.50 but ward match and amounts close (1.3x)

**C-7a64e31c** → **P-a1d2282**
- Contract: PROPOSED DRILLING OF KIAMOGAKE BOREHOLE IN EKERENYO WARD
- Project: Equipping of Kiamogake borehole
- Similarity: 0.50 | FY: 2023/24 → 2025/26 | Wards: ekerenyo → ekerenyo
- Amounts: KSh 2,999,992 → KSh 1,500,000
- Reason: low sim 0.50 but ward match and amounts close (2.0x)

**C-4266fde1** → **P-5ab2897**
- Contract: PROPOSED PIPELINE EXTENSION AND CONSTRUCTION OF KIOSKS FROM MARARA BOREHOLE IN NYAMAIYA WARD
- Project: Pipeline Extension from Marara to Mangongo
- Similarity: 0.50 | FY: 2022/23 → 2023/24 | Wards: nyamaiya → nyamaiya
- Amounts: KSh 1,993,750 → KSh 998,760
- Reason: low sim 0.50 but ward match and amounts close (2.0x)

## Ambiguous matches (need human eyes)

These could go either way:

**C-5eb4b780** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF BOKEIRA WARD WATER SPRINGS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.75 | FY: 2024/25→2023/24 | Wards: bokeira→none | Amounts: KSh 3,955,858→KSh 3,599,921
- Reason: sim 0.75, contract in ['bokeira'] but project has no ward

**C-0225e3f5** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN NYANSIONGO WARD
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.75 | FY: 2023/24→2023/24 | Wards: nyansiongo→none | Amounts: KSh 1,599,965→KSh 3,599,921
- Reason: sim 0.75, contract in ['nyansiongo'] but project has no ward

**C-2217a5dc** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN EKERENYO WARD
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.75 | FY: 2023/24→2023/24 | Wards: ekerenyo→none | Amounts: KSh 999,874→KSh 3,599,921
- Reason: sim 0.75, contract in ['ekerenyo'] but project has no ward

**C-0e2a3501** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN BOKEIRA WARD
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.75 | FY: 2023/24→2023/24 | Wards: bokeira→none | Amounts: KSh 1,599,965→KSh 3,599,921
- Reason: sim 0.75, contract in ['bokeira'] but project has no ward

**C-a1eb4cdf** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN MEKENENE WARD
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.75 | FY: 2023/24→2023/24 | Wards: mekenene→none | Amounts: KSh 3,500,000→KSh 3,599,921
- Reason: sim 0.75, contract in ['mekenene'] but project has no ward

**C-7fa9cf46** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN BOSAMARO AND BOGICHORA WARDS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.60 | FY: 2024/25→2023/24 | Wards: bogichora, bosamaro→none | Amounts: KSh 1,739,872→KSh 3,599,921
- Reason: sim 0.60, contract in ['bogichora', 'bosamaro'] but project has no ward

**C-8cd0e787** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN NYAMAIYA AND BOMWAGAMO WARDS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.60 | FY: 2024/25→2023/24 | Wards: bomwagamo, nyamaiya→none | Amounts: KSh 1,735,231→KSh 3,599,921
- Reason: sim 0.60, contract in ['bomwagamo', 'nyamaiya'] but project has no ward

**C-c0b061f2** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN TOWNSHIP AND BONYAMATUTA WARDS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.60 | FY: 2024/25→2023/24 | Wards: township, bonyamatuta→none | Amounts: KSh 1,723,813→KSh 3,599,921
- Reason: sim 0.60, contract in ['township', 'bonyamatuta'] but project has no ward

**C-2b2a25f3** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN RIGOMA AND GACHUBA WARDS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.60 | FY: 2024/25→2023/24 | Wards: gachuba, rigoma→none | Amounts: KSh 1,738,665→KSh 3,599,921
- Reason: sim 0.60, contract in ['gachuba', 'rigoma'] but project has no ward

**C-d7f6504c** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS IN MANGA AND KEMERA WARDS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.60 | FY: 2024/25→2023/24 | Wards: kemera, manga→none | Amounts: KSh 1,734,850→KSh 3,599,921
- Reason: sim 0.60, contract in ['kemera', 'manga'] but project has no ward

**C-2305fd8a** → **P-f393229**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF WATER SPRINGS FOR BOMWAGAMO & ITIBO WARDS
- Project: Proposed Construction and Protection of Water Springs
- Sim: 0.60 | FY: 2023/24→2023/24 | Wards: itibo, bomwagamo→none | Amounts: KSh 1,749,982→KSh 3,599,921
- Reason: sim 0.60, contract in ['itibo', 'bomwagamo'] but project has no ward

**C-5568d826** → **P-df975db**
- Contract: PROPOSED EQUIPPING AND DISTRIBUTION OF TONGA OMONURI BOREHOLE IN NYAMAIYA WARD
- Project: Proposed Drilling of Tonga Omonuri Borehole
- Sim: 0.50 | FY: 2024/25→2023/24 | Wards: nyamaiya→nyamaiya | Amounts: KSh 3,644,966→KSh 2,929,248
- Reason: low sim 0.50 but ward match and single match

**C-4264c082** → **P-fb42a96**
- Contract: PROPOSED REHABILITATION OF GESURE BOREHOLE IN MANGA WARD
- Project: Equipping and Distribution of Gesure Borehole
- Sim: 0.50 | FY: 2024/25→2023/24 | Wards: manga→manga | Amounts: KSh 1,499,995→KSh 2,999,992
- Reason: low sim 0.50 but ward match and single match

**C-7a1d0f20** → **P-5fa67c4**
- Contract: PROPOSED CONSTRUCTION AND PROTECTION OF ITIBO WARD WATER SPRING
- Project: Spring protection
- Sim: 0.50 | FY: 2024/25→2025/26 | Wards: itibo→itibo | Amounts: KSh 4,944,823→KSh 1,000,000
- Reason: low sim 0.50, ward match but multi-match

**C-1adc4cfb** → **P-e1db09c**
- Contract: PROPOSED EQUIPPING AND DISTRIBUTION OF EKEGORO BOREHOLE IN MAGWAGWA WARD
- Project: Ekegoro Borehole
- Sim: 0.50 | FY: 2024/25→2024/25 | Wards: magwagwa→magwagwa | Amounts: KSh 3,999,680→KSh 6,405,000
- Reason: low sim 0.50 but ward match and single match

**C-96ab5273** → **P-beff907**
- Contract: EQUIPPING AND DISTRIBUTION OF GESURE BOREHOLE IN MANGA WARD
- Project: Drilling, equipping and distribution of the Sengera borehole in Manga Ward
- Sim: 0.50 | FY: 2023/24→2024/25 | Wards: manga→manga | Amounts: KSh 2,999,992→KSh 4,999,600
- Reason: low sim 0.50 but ward match and single match

## Recommendation for the reconciliation script

The current `reconcile-contracts.py` produces too many false positives because it relies on text similarity alone. Adding **ward filtering** to the script would:
- Eliminate ~75% of false positives (the ward-conflict rejections)
- Make "likely" candidates more reliable
- Reduce the human review burden from 176 candidates to ~30

Specifically: when a contract names a ward (contractWards is non-empty), only match it to projects in one of those wards.
