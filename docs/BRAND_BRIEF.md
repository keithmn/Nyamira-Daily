# Brand brief: Nyamira Daily and NY Watch

Status: delivered as brand kit v1, October 2026 (the avocado pin was chosen) and applied to the site; see `docs/DECISIONS.md` #18–19. This brief records the thinking behind it. One change from the brief below: League Spartan is now used for body text too (#19).

## Project
Logo and visual identity for **Nyamira Daily**, an independent, non-partisan civic information platform for Nyamira County, Kenya.
- It is **not** the county government and must never look official.
- It explains the county in plain language: where public money goes, what each of the 20 wards has (health centres, schools, markets, water points), who the leaders are, what the Constitution says, and how residents can take part.
- Every fact carries a source.

Its sister show, **NY Watch**, is a nightly live programme and podcast: calm, investigative, "always recording".

## Audience
Ordinary residents of Nyamira, most of them young (72% are under 35).
- They read on low-cost Android phones and share pages on WhatsApp.
- Many speak Ekegusii and Kiswahili at home.

The mark must feel like it belongs to them: local and warm, not imported tech and not government.

## Personality
African modern. Curious, calm, trustworthy, independent, quietly proud of place. A well-made atlas crossed with a good local radio station.

Not loud, not corporate, not governmental, not partisan.

## The place (raw material for the symbol)
- The Gusii highlands: steep, rolling green hills, terraced farms, red earth, frequent afternoon rain, rivers and valleys.
- Tea: bushes clipped into flat-topped rows across the hills, picked by hand.
- Avocado: a fast-growing cash crop. The halved fruit is a teardrop with a round seed.
- Bananas (amatoke): on every homestead.
- Dairy: cattle are wealth and everyday life.
- Craft: basket weaving and beadwork, with rhythmic, repeating geometry.
- Morning: "Daily" is a habit, the first thing you check, like the sun coming up over the hills.

## Symbol directions (sketch at least 6, as single shapes)
1. **Avocado pin** (current favourite): a halved avocado whose outline is a map pin and whose seed is the location dot.
2. **Sunrise over contours**: a half sun rising behind 3 to 4 contour lines of the hills.
3. **Tea-row bars**: clipped tea bushes in rows that read as a bar chart rising up a hillside.
4. **Banana hand as a chart**: the fingers form ascending bars, or a banana leaf's ribs form a grid.
5. **Weaver bird and nest**: many strands woven into one home, as we weave scattered public records into one picture. The nest's weave can become the brand pattern.
6. **Lens on the land**: a loupe circle over a fragment of contour or terrace lines.

## Brand pattern
A repeating pattern built from data marks (bars, dots, ticks, grid) set to the rhythm of Gusii basketry and beadwork. It carries the personality, so the logo can stay simple.

## Wordmark
"Nyamira Daily" in a geometric sans (Jost or Futura), sentence or title case, set calmly beside the symbol. No blocks, no all-caps slab.

## Palette
- **Primary:** Signal Green #1FD07A (alternative: Emerald #00A86B).
- **Neutrals:** near-black ink and warm off-white paper.
- **Optional accent:** a muted terracotta (red earth). Test it, and use it sparingly.
- **NY Watch only:** a red recording dot.
- **Highlands palette (brand kit v1.1, Oct 2026, DECISIONS #30):** Tea #0B5D3B, Avocado #8DB33A, Harvest #F4B400, Red Earth #A63D2A, Rain #1F5F8B, Mist #DDEFE3, Dusk #3B2A6B, Bloom #F2C4B4, for backgrounds, photo overlays and social cards. Text is White on Tea, Red Earth, Rain and Dusk; Ink on the rest. Colour shows the topic: Harvest money, Rain health and water, Tea education and county figures, Avocado farming, Bloom people, Red Earth stories, Dusk elections, take part and NY Watch, Mist soft backgrounds. The County Government's green-and-orange and its seal are never used: we are independent.
- **Since Oct 2026 (DECISIONS #24, #25):** Signal Green is the main colour, Record Red (#E11D2A) the secondary, Ink and White the neutrals. On maps, red means an emergency alert and nothing else (health points are teal). Off the map, red marks gaps in charts (money not spent, unpaid bills, work at 0%), the NY Watch dot and the On air strip.

Green is for shapes and fills only. Body text stays in dark ink, because light green text on white fails contrast.

## Deliverables
- **Standalone symbol** for the app icon, favicon, video corner, sticker and T-shirt.
- **Lockups:** horizontal and stacked.
- **Variants:** one-colour and reversed.
- **Brand pattern.**
- **NY Watch sub-mark:** the same symbol family plus a red dot.
- **WhatsApp link-preview card** layout.

## Avoid
- The two-block "GRM Daily" layout.
- Anything that looks like the county government: crests, seals, the county's sage green, the county codes 046/047, "NYA".
- **Party symbols and colours.** Avoid anything resembling a political party symbol (for example the orange, the wheelbarrow, the umbrella, the cockerel, the lion) or a party's colours as the main palette. Check the IEBC register of party symbols.
- **Clan totem animals.** Each belongs to particular clans, so using one would favour one group over others.
- **Animals seen as bad omens**, such as owls and chameleons.
- Generic globes, generic chart icons, stock "tech" gradients.

## Tests
- The symbol alone, in one colour, at 32 px, still reads as Nyamira Daily.
- It works embroidered on a T-shirt and printed in black on a photocopied flyer.
- A resident shown it without the name would guess "something about our place", not "a county department", "a party" or "a bank".

## Applying it to the website (for developers)
- Brand colours become tokens in `src/styles/global.css`, with a dark-mode set.
- The four evidence-label colours stay separate from brand colours. They must never be confused with them.
- At most one web font (the wordmark or display face), subset and self-hosted. Body text stays on system fonts to keep pages light.
