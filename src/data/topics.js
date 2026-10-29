// Data sectors (decision #30): one page per sector, with Notion-style toggles inside.
// `tone` picks the sector's Highlands colour (global.css .sec-*). Older topic pages redirect here (astro.config.mjs).
export const topics = [
  { slug: 'money', tone: 'harvest', title: 'Money', question: 'How much did Nyamira receive, how was it spent, and what did the auditor find?', status: 'Twelve years of Controller of Budget figures, ward projects, Auditor-General findings, and how Nyamira compares', sources: ['Controller of Budget', 'County budgets and plans', 'Auditor-General'] },
  { slug: 'health', tone: 'rain', title: 'Health', question: 'Are mothers and children getting care, and where are the health facilities?', status: 'KDHS 2022 county figures, facilities by ward, health projects', sources: ['KDHS 2022', 'Kenya Master Health Facility List', 'County budgets'] },
  { slug: 'education', tone: 'tea', title: 'Education', question: 'How many schools and learners does Nyamira have, and what is being built?', status: 'Ministry of Education 2020 statistics, KCSE candidates, ECDE and school projects; no rankings', sources: ['Ministry of Education', 'KNEC', 'County budgets'] },
  { slug: 'farming', tone: 'avocado', title: 'Farming', question: 'What are tea factories paying, and what is the county spending on farming?', status: 'Tea bonuses for six factories; crop and livestock projects; no published milk prices yet', sources: ['KTDA', 'Tea Board of Kenya', 'County budgets'] },
  { slug: 'open-data', tone: 'mist', title: 'Open data', question: 'Download our tables to check our work or use them yourself.', status: 'CSV downloads and live data files', sources: ['Nyamira Daily'] },
];

// People and places moved from Data to Community (decision #58); same content, now at /community/people-and-places/.
export const peopleAndPlaces = { slug: 'people', tone: 'bloom', title: 'People and places', question: 'How many people live in Nyamira and in your sub-location, and what services are listed?', status: '2019 census for the county, sub-counties and all 113 sub-locations; services listed by ward', sources: ['KNBS 2019 census', 'Nyamira Daily list'] };
