# Design system: Kenya Budget Explained

**Status: approved by the owner, 2 Nov 2026 (decision #88).** See it working: the [live specimen](https://claude.ai/artifact/RcAVE4AT3hpmKcdHdwaj6c) (private to the owner), or [`specimen.html`](specimen.html) in this folder. It uses real figures and a working picker for all 47 counties. Its switch still offers the two accents that were not chosen.

## What was approved

1. **The accent colour:** Dusk Violet. Check it against the IEBC register of party colours before launch.
2. **Numbers set in Varela Round.** The spec says League Spartan, but its digits cannot line up in columns (see [Type](#type)).
3. **Red on debt,** extending decision #24.
4. **The component list** below, including what is reused and what is rebuilt.

## What it inherits, and what is its own

A sibling of Nyamira Daily, not a copy.

- **Shared:** League Spartan and Varela Round, the neutrals, evidence labels, the Calm rules of decision #69 (one level of container with a hairline edge, one soft shadow only on things you can tap, numbers in Ink), and the chart frame with a title that states the finding.
- **Its own:** a violet accent, a Dusk panel for the headline where Nyamira Daily uses Ink, the stage strip, and the KSh 100 notes.
- **No logo yet.** The name is set in Varela Round from `site.name` until the owner chooses it.
- **Signal Green stays with Nyamira Daily.** It does not appear in the national product.

## Accent colour

Three things narrow the choice. Signal Green is taken. The evidence labels already use green, blue, grey and amber, and the brand brief says they must never be confused with brand colours. The brand brief also rules out party colours as a main palette, which argues against orange and yellow in an election year; check the final choice against the IEBC register.

| | **Dusk Violet (recommended)** | Lake Teal | Rain Blue |
|---|---|---|---|
| Accent, light | `#6250d6` | `#10798c` | `#1F5F8B` |
| Accent, dark | `#9085e9` | `#4cc3d9` | `#7db8e6` |
| Panel | `#3B2A6B` (brand Dusk) | `#0d4552` | `#163f5e` |
| White text on the accent | 5.77 | 5.08 | 6.84 |
| Accent as text on paper | 5.29 | 4.65 | 6.27 |
| Accent as text on a dark card | 5.34 | 8.04 | 7.85 |
| Text and surface pairs passing | 12 of 12 | 11 of 12 | 12 of 12 |
| Distance from the nearest evidence label (15 is the floor for telling colours apart) | **15.3** | 13.0 | **5.1** |

Violet is the only option above the floor. Rain Blue is almost the same colour as the Audit finding label. Violet is also a slot in the validated chart palette below, so "counties" and "your county" share one colour across the product.

## Tokens

**Naming trap.** In the main site, `--accent` means Record Red, and shared chart code depends on that. The national accent is therefore `--primary`. Never rename `--accent`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#111111` | Page |
| `--card` | `#FFFFFF` | `#1e1e1c` | Cards |
| `--surface` | `#F5F5F3` | `#1e1e1c` | Alternate bands |
| `--ink` | `#111111` | `#FFFFFF` | Text, numbers |
| `--ink-2` | `#333333` | `#e2e2de` | Secondary text |
| `--muted` | `#595957` | `#b3b3ad` | Captions, axes |
| `--line` | `#dcdcd7` | `#3a3a37` | Hairlines |
| `--control-line` | `#8a8a85` | `#8a8a85` | Field edges, 3:1 |
| `--focus` | `#111111` | `#FFFFFF` | Focus ring; White on every dark panel |
| `--primary` | `#6250d6` | `#9085e9` | Accent: active state, your county |
| `--on-primary` | `#FFFFFF` | `#111111` | Text on the accent |
| `--primary-soft` | `#ecebfb` | `#2a2650` | "Your county" tag; Ink or White text only |
| `--panel` | `#3B2A6B` | `#3B2A6B` | Headline band |
| `--panel-edge` | `#9085e9` | `#9085e9` | 6px edge under the panel |
| `--panel-muted` | `#d9d6f0` | `#d9d6f0` | Captions on the panel |
| `--accent` | `#E11D2A` | `#E11D2A` | Red fills: gaps and debt |
| `--accent-ink` | `#c0121e` | `#ff6b73` | Red text |
| `--accent-soft` | `#fde8e9` | `#3a1518` | Unspent part of a bar |
| `--bar-context` | `#8a8a85` | `#8a8a85` | Bars that are context |

Evidence label colours are unchanged from `global.css`. All four pass in both modes, at 6.57:1 or better.

**Measured contrast** (all pass AA): Ink on white 18.88, muted on paper 6.43, dark muted on card 7.93, red text on paper 5.75, dark red text on card 6.04, White on panel 12.14, context bars on paper 3.18.

**Red.** It marks gaps (money not spent, missed targets), debt (interest, net borrowing) and deadlines. It never appears on evidence labels, rule badges, parties, people or words of blame, and on any map it still means an emergency only (#25).

## Chart colours

Colours are chosen by meaning. Each set was checked with the data-viz validator, and 210 orderings were ranked; the winner has the widest colour-blind separation of those ending in violet.

| Slot | Meaning | Light | Dark |
|---|---|---|---|
| Debt | Interest and pensions; net borrowing | `#E11D2A` | `#E11D2A` |
| 1 | Running government; taxes | `#2a78d6` | `#3987e5` |
| 2 | Building projects; fees | `#008300` | `#008300` |
| 3 | Counties; grants | `#6250d6` | `#9085e9` |
| Rest | Small remainders | `#8a8a85` | `#8a8a85` |

- **Order:** always debt first, then 1, 2, 3, so only these neighbours touch.
- **Colour-blind separation:** 26.0 in light and 26.9 in dark. The target is 8, and the prototype's colours reached 9.2 at their closest.
- **Normal vision:** 29.0 in light and 29.9 in dark, against a floor of 15.
- **Contrast:** every mark is at least 3:1 on every surface, including paper and dark cards.
- **Single-series bars** use `--bar-context`, with Ink for the one bar the title is about and `--primary` for the reader's county.
- **Map, optional:** one hue in five steps. Light `#aaa8ee #8d88e4 #7367d6 #5848b5 #3e3186`; dark `#4e4987 #665fb0 #7f78d3 #9d9aea #c2c1f7`. Both pass the ordinal checks. Never red or amber (#25).
- **No text inside coloured bars.** Labels sit above the bar in Ink. This is what fixes the prototype's contrast failures.

## Type

| Role | Face | Size |
|---|---|---|
| Hero figure | Varela Round | clamp(58px, 15vw, 92px); one per page |
| Figures | Varela Round | clamp(38px, 6vw, 48px) |
| Number columns, chart values | Varela Round | 16 to 18px |
| h2, h3 | Varela Round | clamp(25px, 4vw, 34px); 20px |
| Body | League Spartan 500 | 16px, line height 1.5 |
| Labels | League Spartan 700 | 13 to 14.5px; never below 13px (#19) |

**Why numbers are in Varela Round.** Measured at 100px: League Spartan's digits range from 31 to 58 units wide, and `font-variant-numeric: tabular-nums` changes nothing, because the subset has no tabular figures. Every Varela Round digit is exactly 62.81 units wide, so columns line up with no extra work. This matches decision #56. League Spartan stays for numbers inside sentences.

Fonts are the three self-hosted files, 38 KB in all: League Spartan 500 and 700, and Varela Round. The prototype's Google Fonts link and weight 400 go.

## Space and layout

- **Phones first:** one column at 390px, two from 900px, 1,120px maximum.
- **Gutters:** at least 16px, clearing the phone's safe areas.
- **Spacing steps:** 4, 8, 12, 16, 24, 32, 48. Radius 12px, or 999px for pills.
- **Bottom tab bar:** 62px plus the safe area, below 900px. Top bar from 900px.
- **First layer, then detail:** number, sentence, label, stage, source. Then the chart. Then tables and caveats inside `<details>`.
- **Tables:** two-column tables stay tables on phones. Tables of three or more columns stack as cards (#10).

## Accessibility rules

- **Focus:** a 3px ring in `--focus`, offset 2px. `--focus` turns White on Ink and Dusk panels, which fixes the prototype's invisible ring.
- **Tap targets:** at least 44px everywhere, including source links, which are full-height rows.
- **Never colour alone:** stages use ticks, rings and text. "Your county" has a tag and bold type as well as colour. Bars have direct labels or a legend in the same order.
- **Live messages:** copy confirmations go through `role="status"`.
- **Skip link** on every page. **Motion:** none beyond small colour fades, and those respect `prefers-reduced-motion`.
- **Every page works with JavaScript off.** JavaScript adds tooltips, toggles and the remembered county.

## Charts

- Drawn at build time. Readable with JavaScript off.
- Every chart has: a title that states the finding, units and period, label, stage, source, a "Show as a table" view, and a text alternative.
- **Tooltips enhance, they never gate.** Every value is also on the page.
- **Tooltip behaviour:** opens on hover, focus or tap; Escape or a tap elsewhere closes it; the pointer can move onto it; and it survives the scroll that focus causes.
- **Line charts take one tab stop.** Arrow keys move between years, and a tap picks the nearest year. A line chart of 12 years cannot give each point a 44px target on a phone.
- One axis per chart. Thin marks: bars up to 24px, lines 2px. 2px gaps between touching segments.
- Line charts are drawn on a phone-sized canvas (360 units) so their text stays readable at 390px. The main site's 640-unit charts rely on CSS to enlarge text.

## Components

**From the main site.** The shared version moves to `packages/engine` only when both apps need it (#83). Each needs its styles lifted out of `global.css` first, because none of these components has its own.

| Component | Decision | Work needed |
|---|---|---|
| `EvidenceLabel` | Reuse | Its meaning text says "Nyamira Daily"; take the site name as a prop |
| `ChartFrame` | Reuse | CSV as a file link. Today's `data:` link repeats every number in the page |
| `LineChart` | Extend into `TrendLine` | Phone-sized canvas, a stage mark on each point, keyboard layer |
| `ColumnChart` | Reuse | Keyboard layer |
| `ShareBars`, `Toggle` | Reuse | None |
| `HBars` | Replace with `RankedBars` | New layout, tooltips, your-county highlight |
| `SplitBar`, `Coins` | Extend | Tones are fixed to green and red; add the chart slots |
| `Sources` | Extend | Add the archive link |
| `EmbedCode`, `PageTools` | Rework | Inline `onclick` breaks the content security policy; `EmbedCode` and `EmbedFoot` hard-code the name |
| `DocTools` | Rework | Inline script becomes a module |
| `StaleScript` | Replace with `StaleNote` | Tied to alerts, and uses `define:vars`, the feature in the critical `npm audit` issue |
| `MyWard` | Replace with `CountyPicker` | It builds every ward into each page, which 47 counties cannot afford within budget |
| `CorrectionLog` | Extend | Reads the main site's file; take entries as props |
| `PageHead`, `Sheet` | Rework | Tied to `nav.js` and `global.css` |
| `ElectionNotice` | Reuse | Point at the national site's name |
| `fmt.js` | Extend | Add words (KSh 4.82 trillion) and Kiswahili (KSh trilioni 4.82); `ksh()` stays as it is |
| `project-amounts.js`, `lib/api.js` | Reuse | `api.js` licence text takes the site name |
| `SectionTabs`, `Pictos`, `BarChart` | Not needed | |

**New.** "Shown" means it is in the specimen.

| Component | Purpose | Shown |
|---|---|---|
| `SiteHeader`, `BottomTabs` | Five sections, search, My county chip | Yes |
| `StageTimeline` | Where the budget is now, compact on phones with no sideways scroll | Yes |
| `StageChip` | The stage in words, separate from the evidence label | Yes |
| `StageChange` | One figure across its stages, never summed | Yes |
| `FigureCard` | Question, number, sentence, label, stage, source, citation, report error | Yes |
| `KSh100Bar` | Part to whole, debt first | Yes |
| `RankedBars` | Sorted bars with table view | Yes |
| `TrendLine` | Years, with the stage marked per point | Yes |
| `BudgetVsSpent` | Budget, spent, and the gap in red | Yes |
| `Meter` | A county against the all-county figure | Yes |
| `CountyPicker`, `MyCountyChip` | Pick once, remembered in the browser. Links with JavaScript off | Yes |
| `QuestionCard` | A question with a Copy button | Yes |
| `ShareCard` | WhatsApp text carrying the figure, source and link; card preview | Button only |
| `DataTable` | Sortable, CSV link, stacks when wide | Plain table |
| `NotYetLoaded`, `StaleNote` | Missing and newer-document states | Yes |
| `KiswahiliSummary` | Summary, marked for review. `lang="guz"` slot on Kisii and Nyamira pages | Yes |
| `Breadcrumbs`, `UpdatedNote`, `GlossaryTerm`, `SearchBox`, `LanguageSwitch`, `ThemeToggle` | Page furniture. `GlossaryTerm` is a button popover, reachable by keyboard | Partly |
| `CitationButton`, `ReportError` | Copy citation; opens the corrections service with the figure id | Citation |
| `CompareTray`, `RuleBadge`, `InfographicCard`, `EmbedCode` | Later phases. `RuleBadge` says Meets, Does not meet or No data, and carries no red | No |

Every component shows six states on `/dev/components/`: normal, missing, stale, corrected, disputed and long Kiswahili text. The specimen has the first five as real examples.

## Weight and security

**Budget:** under 120 KB transferred per page on first load, excluding fonts.

| Part | Allowance | Specimen, compressed |
|---|---|---|
| HTML | 60 KB | 12 KB, with its 47-county data at 2.5 KB |
| CSS | 12 KB | 5.4 KB |
| JavaScript | 10 KB | 3.9 KB |

The main site's 20 KB stylesheet is not used. Static CSV, JSON and images load only on request.

**Content security policy:** no third-party scripts, and inline scripts by hash only.

```
default-src 'none'; script-src 'self' 'sha256-…'; style-src 'self'; style-src-attr 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

`style-src-attr` is needed because bar widths are inline styles, as in the main site's `HBars` and `ShareBars`. `/embed/*` pages relax `frame-ancestors` so news sites can show them.

## Checked on the specimen

Measured on 2 Nov 2026, with the same scripts as the Phase 0 audit of the prototype.

| Check | Prototype | Specimen |
|---|---|---|
| Lighthouse performance, mobile | 87 | 100 |
| Lighthouse accessibility, mobile | 97 | 100 |
| Largest paint, slow 4G | 3.0 s | 1.3 s |
| axe violations, 390 and 1280, light and dark | up to 3 rules | 0 |
| Tap targets under 44px at 390 | 109 of 143 | 0 of 55 |
| Numbers visible with JavaScript off | 57 of 520 | 198 of 198 |
| Tooltips reachable by keyboard | 0 of 83 chart rows | 24 of 24 |
| Sideways scroll at 320, 360, 390, 768, 1280 | none | none |
| Script errors | none | none |

**Not yet checked:** a real low-end phone, a screen reader, and the Kiswahili interface at full length. The specimen is one page, so these numbers show the system can meet the targets, not that every page will. axe could not judge eight SVG chart labels for contrast; they use `--muted` and `--ink`, which pass on their own.
