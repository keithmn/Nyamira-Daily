# Illustration prompts (decision #70)

For the slots in `src/data/illustrations.json`. Until an approved image is added, each slot shows the built-in
flat SVG illustration. Follow `docs/EDITORIAL_RULES.md` section 15: illustrations only, never evidence; no real
people, places, logos, text or numbers; caption "Illustration (AI-generated)" is added automatically.

**House style (paste at the start of every prompt):**
Flat editorial illustration, simple shapes, thick dark outlines, soft grain, warm daylight. Palette: tea green
#0B5D3B, avocado #8DB33A, harvest yellow #F4B400, red earth #A63D2A, rain blue #1F5F8B, mist #DDEFE3, signal green
#1FD07A, white and near-black. Rolling green highland hills of western Kenya with rows of tea bushes. No people's
faces, no text, no numbers, no logos, no flags. Wide 16:10 composition, subject centred-left, calm sky.

| Slot | Prompt (after the house style) | Where it shows |
|---|---|---|
| `money` | A neat stack of generic paper banknotes and a simple budget ledger with blank lines, resting on a wooden table in front of tea-covered hills. | Home money card; Money page lead figure |
| `health` | A small generic rural health centre with a plain green cross sign, a covered waiting bench and a footpath, hills behind. No real building. | Health page (when added) |
| `education` | An open exercise book and a yellow pencil in the foreground, a simple generic classroom block with a tin roof behind, hills beyond. | Education page (when added) |
| `farming` | Rows of tea bushes on a slope and a woven basket of freshly plucked green tea leaves in the foreground. | Farming page (when added) |
| `community` | A home compound with a water tank, a small kitchen garden and a red-earth footpath winding between hills. | Community page (when added) |

**After generating:** save as WebP (about 1600×1000, under 200 KB) in `public/illustrations/`, then fill in `file`,
`kind: "ai"`, `tool`, `prompt` (the full text used), `created` and `approvedBy` for that slot.
