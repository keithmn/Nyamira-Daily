// The explainers (build brief 5.11). Each uses only figures in the registry and law already read from its text, so every
// number in the prose comes from `fig` and every date from the PFM Act. The text is English with a Kiswahili summary
// (decision #87); both wait for an editor, and the summary for a native speaker. An explainer on audit opinions waits for
// the Auditor-General's reports to be loaded.
import { money, percent } from '@kbe/engine/fmt';
import { fig } from './figures.js';

const m = (id) => { const f = fig(id); return money(f.value, f.unit, 'en'); };
const v = (id) => fig(id).value;

export function explainers() {
  return [
    {
      slug: 'how-the-budget-is-made', minutes: 4,
      title: 'How the budget is made',
      body: [
        'Kenya\'s national budget passes through stages, and each stage produces its own figures. That is why the same thing can have several numbers.',
        'It starts with a recommendation from the Commission on Revenue Allocation on how revenue should be shared between the national government and the 47 counties.',
        'The National Treasury then sends the Budget Policy Statement to Parliament by 15 February. It sets the year\'s priorities and ceilings.',
        'The Cabinet Secretary for the National Treasury submits the budget estimates to the National Assembly by 30 April. Before the Assembly considers them, its committee reviews them and takes into account the views of the Cabinet Secretary and the public.',
        'The National Assembly approves the estimates, with or without changes, in time for the Appropriation Bill to be signed into law by 30 June. The new financial year begins on 1 July.',
        'During the year the money is spent. The Controller of Budget reports on spending, and later the Auditor-General audits it.',
      ],
      figures: [{ id: 'statement.total.expenditure', q: 'How much does the national government plan to spend in FY2026/27?' }],
      sources: ['PFM Act s.25(2), p.908; s.37(2), p.916; s.39(1) and (2), p.919'],
      check: [
        { q: 'By when must the Budget Policy Statement reach Parliament?', a: 'By 15 February each year (PFM Act, s.25(2)).' },
        { q: 'Why can one ministry have several different figures in one year?', a: 'Each stage, from estimates to the approved budget to spending, produces its own figure.' },
      ],
      sw: 'Bajeti ya kitaifa inapitia hatua kadhaa, na kila hatua ina takwimu zake. Taarifa ya Sera ya Bajeti inafika Bungeni kufikia 15 Februari, makadirio kufikia 30 Aprili, na Mswada wa Matumizi unatiwa saini kufikia 30 Juni.',
    },
    {
      slug: 'equitable-share', minutes: 4,
      title: 'The equitable share, and how it is shared out',
      body: [
        `The equitable share is the money the national government passes to the 47 counties to spend as they decide. For FY2026/27 it went through three figures: the Commission on Revenue Allocation recommended ${m('recommendation.county-total.equitable-share')}, the National Treasury's estimates gave ${m('estimates.county.equitable-share')}, and the law, the County Allocation of Revenue Act, gave ${m('law.county-total.equitable-share')}.`,
        `The Act builds each county's share from three parts. A baseline, ${m('law.county-total.baseline')} for all counties together. An affirmative action allocation for 12 counties, ${m('law.county-total.affirmative-action')} in all. And a formula part, ${m('law.county-total.formula')}.`,
        `The Act's note on the formula part gives four weights: population ${v('law.formula-weight.population')}%, an equal share ${v('law.formula-weight.equal-share')}%, poverty ${v('law.formula-weight.poverty')}% and land area ${v('law.formula-weight.geographical-size')}%.`,
        'Each county page shows its own three parts and how its share compares with last year.',
      ],
      figures: [{ id: 'law.county-total.equitable-share', q: 'How much does the law give the 47 counties in FY2026/27?' }],
      sources: ['County Allocation of Revenue Act, 2026, First Schedule, p.461'],
      check: [
        { q: 'Which figure is the one counties actually receive under the law?', a: `The County Allocation of Revenue Act's: ${m('law.county-total.equitable-share')}.` },
        { q: 'What are the three parts of a county\'s share?', a: 'A baseline, an affirmative action allocation (12 counties only) and a formula part.' },
      ],
      sw: `Mgao sawa ni pesa ambazo serikali ya kitaifa inazipa kaunti 47. Mwaka 2026/27 sheria iliweka ${money(v('law.county-total.equitable-share'), 'KSh', 'sw')}, ikijengwa kutoka msingi, mgao wa kusaidia kaunti 12, na sehemu ya fomula.`,
    },
    {
      slug: 'consolidated-fund-services', minutes: 3,
      title: 'Consolidated Fund Services: interest and pensions',
      body: [
        `Some spending comes before anything else. Consolidated Fund Services are mostly interest on public debt and pensions. In the FY2026/27 estimates they come to ${m('estimates.cfs.total')}.`,
        `Domestic interest is ${m('estimates.cfs.domestic-interest')} and foreign interest ${m('estimates.cfs.foreign-interest')}. Pensions, with the salaries and allowances of some constitutional office holders, are ${m('estimates.cfs.pensions')}.`,
        `Interest alone equals ${v('estimates.debt.interest-share-of-ordinary-revenue')}% of ordinary revenue, our calculation from the Budget Summary's figures. These amounts are not in any ministry's vote in the Appropriation Act, which is one reason the Act's total is smaller than total spending.`,
      ],
      figures: [{ id: 'estimates.debt.interest', q: 'How much interest is planned in FY2026/27?' }],
      sources: ['Budget Summary FY2026/27, para 66, Table 3'],
      check: [
        { q: 'What are the two main parts of Consolidated Fund Services?', a: 'Interest on public debt, and pensions.' },
        { q: 'Why is the Appropriation Act\'s total smaller than total spending?', a: 'Consolidated Fund Services and the counties\' equitable share are not in its votes.' },
      ],
      sw: `Huduma za Mfuko Mkuu ni hasa riba ya deni la umma na pensheni: ${money(v('estimates.cfs.total'), 'KSh bn', 'sw')} katika makadirio ya 2026/27. Riba pekee inachukua ${v('estimates.debt.interest-share-of-ordinary-revenue')}% ya mapato ya kawaida.`,
    },
    {
      slug: 'why-numbers-change', minutes: 3,
      title: 'Why the numbers change by stage',
      body: [
        `Education in FY2026/27 can be ${m('statement.sector.education')}, ${m('estimates.thematic.education')} or ${m('approved.press.education')}, depending on where you look. The first is the Mwananchi Guide's sector total. The second is the Budget Summary's thematic area, which groups spending differently. The third is a press report that we could not match to any official document, so it stays unverified.`,
        `The counties' share went from ${m('recommendation.county-total.equitable-share')} recommended to ${m('estimates.county.equitable-share')} in the estimates to ${m('law.county-total.equitable-share')} in the law.`,
        'Two figures for the same thing are only comparable at the same stage and in the same grouping. This site shows figures of different stages side by side, and never adds them or works out a change between them.',
      ],
      figures: [{ id: 'statement.sector.education', q: 'What does the Mwananchi Guide give education?' }],
      sources: ['Mwananchi Guide FY2026/27, p.3', 'Budget Summary FY2026/27, Table 5, p.25'],
      check: [
        { q: 'Can you subtract an estimate from a law figure to see what changed?', a: 'Only with care: they are different stages, so this site shows them side by side instead.' },
        { q: 'Why does the Budget Summary give education a smaller figure than the Guide?', a: 'It groups spending into thematic areas, which differ from the Guide\'s sectors.' },
      ],
      sw: 'Kitu kimoja kinaweza kuwa na takwimu kadhaa kwa sababu kila hatua na kila mpangilio una namba yake. Tovuti hii huonyesha takwimu za hatua tofauti kando kwa kando, bila kuzijumlisha.',
    },
    {
      slug: 'reading-a-programme-based-budget', minutes: 4,
      title: 'Reading a Programme Based Budget',
      body: [
        'The Appropriation Act gives each vote, a ministry, department or agency, its money in programmes. The Programme Based Budget explains each programme: what it aims to achieve, its sub-programmes, and what the money buys.',
        'Each programme states an outcome, the change it is meant to bring. Sub-programmes split its money further. The economic classification shows how much goes to wages, to goods and services, to transfers, and to assets.',
        'The book also lists targets for each programme. They are printed in tables that do not read reliably as text, so a person will type them in before this site shows them.',
        'On this site, every vote page lists its programmes, and each programme page shows its outcome, its sub-programmes and the Act\'s amount.',
      ],
      figures: [{ id: 'approved.pbb.vote.1066.programme.0503000', q: 'What does the Programme Based Budget give Quality Assurance and Standards?' }],
      sources: ['Programme Based Budget FY2026/27, approved, Parts F and G'],
      check: [
        { q: 'What does a programme\'s outcome tell you?', a: 'The change the programme is meant to bring about.' },
        { q: 'Where would you see how much of a vote goes to wages?', a: 'In the economic classification, shown on each vote page as "What the money pays for".' },
      ],
      sw: 'Bajeti ya Programu inaeleza kila programu ya fungu: lengo lake, programu ndogo, na pesa zinanunua nini. Kila ukurasa wa fungu kwenye tovuti hii unaonyesha programu zake.',
    },
    {
      slug: 'development-spending', minutes: 3,
      title: 'Development spending: how much of the plan was spent',
      body: [
        `In FY2025/26 the 47 counties budgeted ${m('ke.fy2025-26.spent.county-total.dev-budget')} for development, such as roads, clinics and water, and spent ${m('ke.fy2025-26.spent.county-total.dev-spent')}. That is ${v('ke.fy2025-26.spent.county-total.dev-absorption')}%, as the Controller of Budget reports it. Across all their spending, counties spent ${v('ke.fy2025-26.spent.county-total.absorption')}% of their budgets.`,
        'This is a different measure from the legal rule on development. The PFM Act asks that at least 30% of a county\'s budget goes to development over the medium term. That rule is about the plan; development spending is about what happened to the plan.',
        'Each county page shows both, with the Controller of Budget\'s figures and the words of the law.',
      ],
      figures: [{ id: 'ke.fy2025-26.spent.county-total.dev-absorption', q: 'How much of their development budgets did counties spend in FY2025/26?' }],
      sources: ['Controller of Budget, County Governments Budget Implementation Review Report FY2025/26, Table 2.5', 'PFM Act s.107(2)(b), p.969'],
      check: [
        { q: 'What does 54% development spending mean?', a: 'Counties spent 54 shillings of every 100 they had budgeted for development that year.' },
        { q: 'Is the 30% rule about spending or about the budget?', a: 'About the budget: at least 30% allocated to development, over the medium term.' },
      ],
      sw: `Mwaka 2025/26 kaunti zilitumia ${v('ke.fy2025-26.spent.county-total.dev-absorption')}% ya bajeti zao za maendeleo, kwa mujibu wa Mdhibiti wa Bajeti. Kanuni ya 30% ni kuhusu mpango wa bajeti, si matumizi.`,
    },
    {
      slug: 'pending-bills', minutes: 3,
      title: 'Pending bills',
      body: [
        `Pending bills are amounts owed for goods, services and works already delivered but not yet paid. The Controller of Budget reports that counties owed ${m('ke.fy2025-26.spent.county-total.payables')} in pending bills in FY2025/26.`,
        'Unpaid bills hurt suppliers, many of them small local businesses, and they carry into the next year\'s budget.',
        'Each county page shows its own pending bills as the report gives them. Where the report prints no figure for a county, the page says so instead of showing zero.',
      ],
      figures: [{ id: 'ke.fy2025-26.spent.county-total.payables', q: 'How much did counties owe in pending bills in FY2025/26?' }],
      sources: ['Controller of Budget, County Governments Budget Implementation Review Report FY2025/26, Table 2.10'],
      check: [
        { q: 'What is a pending bill?', a: 'An amount owed for something already delivered but not yet paid.' },
        { q: 'What does this site show when a county reports no figure?', a: '"No figure reported", never zero.' },
      ],
      sw: 'Bili zinazosubiri ni madeni ya bidhaa, huduma na kazi zilizokwisha kutolewa lakini bado hazijalipwa. Kila ukurasa wa kaunti unaonyesha bili zake kama ripoti ya Mdhibiti wa Bajeti inavyozitoa.',
    },
    {
      slug: 'own-source-revenue', minutes: 3,
      title: 'Own-source revenue: what counties raise themselves',
      body: [
        `Besides their equitable share, counties raise money themselves: rates, licences, parking and fees. In FY2025/26 the 47 counties aimed to raise ${m('ke.fy2025-26.spent.county-total.osr-target')} and raised ${m('ke.fy2025-26.spent.county-total.osr-actual')}, as the Controller of Budget reports it.`,
        `That is ${percent(v('ke.fy2025-26.spent.county-total.osr-actual') / v('ke.fy2025-26.spent.county-total.osr-target') * 100, 0)} of the target, our calculation from the report's two figures.`,
        'Each county page shows its own target and what it raised.',
      ],
      figures: [{ id: 'ke.fy2025-26.spent.county-total.osr-actual', q: 'How much did counties raise themselves in FY2025/26?' }],
      sources: ['Controller of Budget, County Governments Budget Implementation Review Report FY2025/26, Table 2.1'],
      check: [
        { q: 'Name two kinds of own-source revenue.', a: 'For example business licences, land rates, parking fees or market fees.' },
        { q: 'Did counties together reach their target in FY2025/26?', a: 'No: they raised less than they aimed to.' },
      ],
      sw: 'Kaunti hukusanya mapato yao wenyewe kutoka ada, leseni na kodi za ardhi. Mwaka 2025/26 zilikusanya chini ya lengo lao, kwa mujibu wa Mdhibiti wa Bajeti.',
    },
    {
      slug: 'how-to-submit-a-memorandum', minutes: 3,
      title: 'How to submit a memorandum',
      body: [
        'A memorandum is a short written submission to a committee. Parliament\'s committees and county assemblies take them when they consider the budget.',
        'A good memorandum says who it is to and from, names its subject, gives the background with figures and their sources, and makes a clear request.',
        'Send it to the address in the committee\'s official notice, before the deadline the notice gives. Keep a copy.',
        'The memorandum builder on Have your say assembles one for you, with figures and sources for any vote or county. It sends nothing and keeps nothing: you copy the text and send it yourself.',
      ],
      figures: [],
      sources: [],
      check: [
        { q: 'Where do you find the address to send a memorandum?', a: 'In the committee\'s official notice for the hearing.' },
        { q: 'What should the background contain?', a: 'The relevant figures, each with its source.' },
      ],
      sw: 'Memoranda ni maoni mafupi ya maandishi kwa kamati. Itaje inakwenda kwa nani, kutoka kwa nani, inahusu nini, maelezo yenye takwimu na vyanzo vyake, na ombi lililo wazi. Ituma kwa anwani iliyo kwenye tangazo rasmi.',
    },
    {
      slug: 'ng-cdf-and-county-money', minutes: 3,
      title: 'NG-CDF is not county money',
      body: [
        `The National Government Constituencies Development Fund, NG-CDF, is national money run by constituency committees. The Mwananchi Guide gives it ${m('statement.fund.ng-cdf')} in FY2026/27.`,
        `County money is different: the counties' equitable share in law is ${m('law.county-total.equitable-share')}, spent by county governments under their assemblies.`,
        'The two are never added on this site. A constituency\'s NG-CDF projects and a county\'s projects can sit in the same place, but they come from different budgets and answer to different people.',
      ],
      figures: [{ id: 'statement.fund.ng-cdf', q: 'How much does NG-CDF get in FY2026/27?' }],
      sources: ['Mwananchi Guide FY2026/27, p.13'],
      check: [
        { q: 'Is NG-CDF part of a county\'s budget?', a: 'No. It is national money run by constituency committees.' },
        { q: 'Can you add NG-CDF to a county\'s equitable share?', a: 'No: they are different budgets, so adding them would double up and mislead.' },
      ],
      sw: 'NG-CDF ni pesa za kitaifa zinazosimamiwa na kamati za maeneo bunge, si pesa za kaunti. Tovuti hii haiwahi kuzijumlisha na mgao sawa wa kaunti.',
    },
  ];
}

export const explainerBySlug = (slug) => explainers().find((e) => e.slug === slug);
