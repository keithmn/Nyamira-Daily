# Usability testing

The build brief (section 9) makes usability rounds the test of each phase: Phase 4 needs round 1 to pass tasks 1 to 3, and Phase 6 needs round 2 to pass all five. **No round has been run yet.** The browser checks walk every task with taps on a 390px phone, which shows the paths exist, not that people can use them.

## How a round runs

- **Who:** five people per round, through ward champions, with consent.
  - At least two who are not regular internet users.
  - At least two who prefer Kiswahili.
- **What is recorded:** notes only, never names or other identities.
- **Device:** a mid-range Android phone on mobile data, not Wi-Fi.
- **Each task:** read it aloud. Record success, time, the number of taps and where the person got stuck.
- **After the round:** fix the top three problems, then run the next round.

## The five tasks

| # | Task | Limit | Path on the site |
|---|---|---|---|
| 1 | Find your county's share and last year's development spending | 3 taps, 30 s | Home, pick county: both are on the My county card |
| 2 | Find the interest bill and its share of revenue | 20 s | Budget tab: the first screen of the year page |
| 3 | Find a sector, compare it with last year, and download the table | 60 s | Budget tab, sector list, the sector, "Show as a table", CSV |
| 4 | Copy a question for your MP and see the next hearing | 30 s | Counties tab, your county, Questions to ask, then "Hearings, and write a memorandum" under them. No hearing is listed until an official notice is loaded |
| 5 | Share a county card to WhatsApp | 20 s | County page, Share, on the first screen |

## Results

| Round | Date | Participants | Task 1 | Task 2 | Task 3 | Task 4 | Task 5 | Top three problems | Fixed in |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Not run | | | | | | | | |
| 2 | Not run | | | | | | | | |

## What the automated checks cover meanwhile

- No sideways scroll at 320, 360, 390, 768 and 1280px.
- axe at 390 and 1280, light and dark.
- Headings in order.
- Tap targets of at least 44px.
- Pages work with JavaScript off.
- Every page within the 120 KB budget.
- A walk through each task's taps.

They are in `apps/national/e2e/site.spec.mjs`.
