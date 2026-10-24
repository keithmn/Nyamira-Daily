// Nyamira Daily's plain-language grouping of the county's 24 budget votes (src/data/budget-sectors.json)
// for the budget simulator. The grouping is ours; the figures are the county's.
export const groups = [
  { key: 'health', label: 'Health', item: 'opd', votes: ['Medical Services', 'Primary Healthcare'] },
  { key: 'roads', label: 'Roads and public works', item: 'road', votes: ['Transport & Public Works,'] },
  { key: 'water', label: 'Water and environment', item: 'borehole', votes: ['Environment, Water, Energy & Natural Resources', 'Water Sanitation and Irrigation', 'Nyamira Water and sanitation company'] },
  { key: 'farming', label: 'Farming and livestock', votes: ['Crop Development', 'Livestock and Fisheries Services'] },
  { key: 'education', label: 'Education and training', item: 'ecde', votes: ['Education & Vocational Training'] },
  { key: 'trade', label: 'Trade, markets and co-operatives', votes: ['Trade, Tourism and Co-operatives Development'] },
  { key: 'towns', label: 'Towns, land and housing', votes: ['Land, Physical Planning, Housing and Urban Development', 'Nyamira Municipality', 'Keroka municipality'] },
  { key: 'social', label: 'Youth, gender and social services', votes: ['Youth, Gender, Culture and Social services', 'Nyamira disability board'] },
  { key: 'assembly', label: 'County Assembly', votes: ['County Assembly'] },
  { key: 'admin', label: 'Running the county (administration)', votes: ['County Executive', 'Public Service Management', 'Finance and Accounting services', 'Economic Planning, Resources Mobilization and ICT', 'CPSB', 'The County Attorney', 'Nyamira revenue board', 'Nyamira Investment Board'] },
];
