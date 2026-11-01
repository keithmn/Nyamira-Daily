---
title: "How we added up twelve years of county money"
summary: "The sources, steps and limits behind our KSh 59.6 billion figure, so anyone can check it."
topic: Money
sources:
  - { name: "Controller of Budget, County Governments Budget Implementation Review Reports, FY2013/14 to FY2024/25", url: "https://cob.go.ke/", page: "Nyamira County section of each annual report" }
updated: 2026-10-31
readingLevel: standard
draft: true
---
<!-- DRAFT method post for the editor (31 Oct 2026). Publish together with twelve-years-of-county-money.md. -->

This note explains how we produced the figures in [KSh 59.6 billion: twelve years of Nyamira's money](/explainers/twelve-years-of-county-money/).

## Sources

We used one source for every year: the Controller of Budget's annual County Governments Budget Implementation Review Report, from FY2013/14 to FY2024/25. Each year's report and page reference is listed on the [Money page](/data/money/) and in the [download](/files/money-v1.csv).

## Steps

1. For each year we copied, from the Nyamira County section of the report, the approved budget, actual total spending, actual development spending, actual recurrent spending, the share of the development budget used, local revenue and pending bills. Amounts are in KSh millions, as printed.
2. We added the twelve actual spending figures: KSh 59,590 million. We did the same for development (KSh 13,593 million) and recurrent spending (KSh 46,010 million). The sums are calculated in code from the published file, not by hand.
3. We did not add up budgets, because money not spent in one year is often budgeted again the next.

## Limits

- The figures are what the Controller of Budget reports. We have not audited them. The county's own budget review paper gives a different total for 2024/25 (KSh 7.41 billion spent, against the Controller of Budget's KSh 5.65 billion); we show both.
- Rounding in the reports means development and recurrent spending add up to KSh 13 million more than the total.
- Pending bills change between reports for the same date, so we do not total them.

## Check it yourself

Download the CSV, add up the "total_spent_ksh_m" column, and compare each row with the page reference given. If you find a difference, tell us through our [corrections](/how-we-work/#corrections) process.
