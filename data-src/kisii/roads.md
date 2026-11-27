# Kisii roads and contracts: candidates and checks (27 Nov 2026)

Working notes for the Kisii roads and contracts datasets. Nothing here is on the site yet. The files are candidates, to be reviewed before they go into `src/data/`.

## Files

- `data-src/kisii/contracts.json`: 214 county contract records in the shape of `src/data/contracts.json`.
- `data-src/kisii/roads.json`: 10 candidate road contracts in the shape of `src/data/roads.json`, not yet grouped into roads.

## Sources and counts

| Source | URL | Date checked | Records | Assigned to a ward | Notes |
|---|---|---|---|---|---|
| PPRA Public Procurement Information Portal, procuring entity "Kisii County Government" | `https://tenders.go.ke/api/contract?pe%3Aname=Kisii+County+Government&perpage=50&page=1..5` | 27 Nov 2026 | 214 contracts, KSh 2,863,682,792.58 | 59 contracts (by title) | Same method as Nyamira's pull (`docs/DATA.md`). All 5 pages read; total matches the portal's 214; every record names Kisii County Government; ids unique. FY 2023/24 to 2026/27. |
| KeRRA tenders and awards | `https://kerra.go.ke/` | 27 Nov 2026 | 0 | - | Home page loads and does not list Kisii documents. Award lists not searched further. |
| KeNHA awards | `https://www.kenha.co.ke/` | 27 Nov 2026 | 0 | - | Address redirects (HTTP 301); no award list fetched. |
| NG-CDF Board, Kisii constituency documents | `https://cdf.go.ke/` | 27 Nov 2026 | 0 | - | Site did not respond (timeout). Not gathered. NG-CDF is national money and must never be added to county figures, so it stays separate when gathered. |

Supplier contact details (phone, email, PIN, addresses) in the portal are not copied. Only supplier company names are kept.

## Road candidates

The 10 road candidates come from titles naming a road, tarmac or road works. Bridges, footbridges and culverts are excluded from `roads.json`. Titles give no lengths, so `lengthKm` is null.

Assigned to a ward (7 contracts):
- K-118893 Nyamoiseke Muya Ekerubo Road, Ichuni ward
- K-118910 Lot 1 roads in Getenga, Bogetenga and Tabaka wards (three wards, set by hand: the title lists them in one phrase)
- K-148999 Roads in Masimba ward
- K-149095 Roads in Sensi ward
- K-149129 Roads in Marani ward
- K-149222 Roads in Majoge Bassi ward
- K-149233 Roads in Boochi Borabu ward

Not assigned (3 contracts), because the title names no ward:
- K-118853 Arura Market-Nyabiosi Junction Road
- K-118955 Tarmac Marindi Primary, Omotembe, Nyamage, Ragesuya Road
- K-118967 Riariga-Timani Road

## Assignment rule

A contract gets a ward only when its title names a register ward (`src/data/ward-register.json`, county kisii) followed by the word WARD, for example "in Kisii Central ward". Name order and the Bassi/Basi spelling are both tried. Place names that are not written as "ward" are not assigned: for example, "Kiamokama market" names a place that may sit in the Kiamokama ward, but the title does not say so. Multi-ward phrases ("A, B & C WARDS") are set by hand and quoted above.

## Not yet done

- 155 of the 214 contracts have no ward yet. Their titles name places, supplies or events, not a ward.
- No Kisii road has a length, and roads have not been grouped into road identities.
- KeRRA, KeNHA and NG-CDF Kisii award and allocation documents are not gathered.
- Ward assignment has not been checked by a person against the tender documents.
- The file has not been validated against the site's schema; it is not yet read by any page.
