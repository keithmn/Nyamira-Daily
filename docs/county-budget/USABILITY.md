# Usability round: the county budget pages

The plan (`SITEMAP.md`, decision #105) is not finished until real readers have tried it. This page is how to run that round. It needs people; nothing here can be done by a script.

## Who and how

- **Five readers** who live in Nyamira or follow its affairs, not people who built the site. Mix them: at least two who use a phone for everything, one who reads mostly Ekegusii or Kiswahili, one who has been to a budget hearing.
- **Their own phone**, or a cheap Android phone at its normal text size, on mobile data. No laptop.
- **Start each task from the home page** (`/`). Read the task aloud, then say nothing. Note the time, the taps, and where they hesitated or went wrong.
- **Ask afterwards, not during:** "What did you expect to find there?" and "Was any word unclear?"

## The five tasks

| # | Task, as you read it | Passes if | Path we expect |
|---|---|---|---|
| 1 | "Find out how much the Health department called Medical Services got this year, and how much of it it spent." | Within 3 taps; says KSh 1.35B and 61.5% | Data or Money, then a department, or the Money cards |
| 2 | "What share of the county's budget pays staff?" | Finds 39% on the first screen of the year page | Money, Budget 2025/26 |
| 3 | "How much of last year's development money did the county use?" | Within 2 taps; says 66.0% (county) or 59% (Controller of Budget), and knows there are two figures | Money, What was spent |
| 4 | "Find what the Education department's early childhood programme promised, and copy a question to ask about it." | Within 4 taps; finds the programme page and understands targets are not loaded yet | Money, departments, Education, the programme |
| 5 | "Download the table of all the departments." | Within 3 taps; opens "Show as a table" and the CSV | Money, Budget 2025/26, the departments chart |

Task 4 cannot fully pass yet: the programme targets are not loaded, and the questions on the site are about spending, not programmes. Run it anyway; whether readers understand "not yet loaded" is worth knowing.

## What to record

One row per reader per task in `docs/county-budget/usability-round-1.csv`: `reader, phone, task, passed (yes/no), seconds, taps, where they went wrong, words they did not understand, what they said`. Do not record names; use reader 1 to 5.

## After the round

- Fix anything that stopped two or more readers, then run the round again with new readers.
- Words readers did not understand go into the plain-language list for the editor.
- Note the round's date and result in `docs/STATUS.md`.
