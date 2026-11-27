// Site, county and publisher settings, in one place (decision #74, the "county kit"; made multi-county by #134).
// New code reads names from here instead of hard-coding them. Older pages still have "Nyamira" written in; move
// them over as they are touched.

// The site itself, across the Gusii counties.
export const site = {
  name: 'Gusii Daily',
  domain: 'gusiidaily.org',
  // Languages for summaries and audio. Ekegusii (ISO 639-3 "guz") is planned; see decision #78.
  languages: [
    { code: 'en', name: 'English', status: 'live' },
    { code: 'sw', name: 'Kiswahili', label: 'Muhtasari kwa Kiswahili', status: 'summaries' },
    { code: 'guz', name: 'Ekegusii', status: 'planned' },
  ],
};

// The Gusii counties. A county's sub-county units under the County Governments Act (s.48) are its constituencies:
// use these for county budgets, wards and leaders. The national government's administrative sub-counties are a
// different map: always say "constituency" or "administrative sub-county", never just "sub-county" (decision #75).
// Constituencies are listed A to Z and must match src/data/ward-register.json (checked by npm test).
// `coverage`: 'full' = wards, places, money and leaders on the site; 'register' = the IEBC ward register and
// county-level figures only, so far.
export const counties = [
  {
    slug: 'nyamira',
    name: 'Nyamira',
    countyName: 'Nyamira County',
    government: 'County Government of Nyamira',
    assembly: 'County Assembly of Nyamira',
    iebcCode: '046',
    iso: 'KE-34',
    constituencies: ['Borabu', 'Kitutu Masaba', 'North Mugirango', 'West Mugirango'],
    coverage: 'full',
  },
  {
    slug: 'kisii',
    name: 'Kisii',
    countyName: 'Kisii County',
    government: 'County Government of Kisii',
    assembly: 'County Assembly of Kisii',
    iebcCode: '045',
    iso: 'KE-16',
    constituencies: ['Bobasi', 'Bomachoge Borabu', 'Bomachoge Chache', 'Bonchari', 'Kitutu Chache North', 'Kitutu Chache South', 'Nyaribari Chache', 'Nyaribari Masaba', 'South Mugirango'],
    coverage: 'register',
  },
];
export const countyBySlug = Object.fromEntries(counties.map((c) => [c.slug, c]));

// The county whose civic data the money, places, ward and leaders pages show today. Pages that cover one county's
// civic records read this; pages that cover the Gusii community read `site` and `counties`.
export const county = countyBySlug.nyamira;

// Who builds and publishes the site (decision #73). Use the exact name on the certificate of incorporation.
// CHECK BEFORE LAUNCH: confirm legalName against the certificate; spelling has varied in earlier drafts.
export const publisher = {
  legalName: 'Underdogs Rising Group Limited',
  shortName: 'Underdogs Rising',
  kind: 'a Kenyan media and technology company',
  // Legal details for /about/publisher/ (decision #122). Leave empty until confirmed against the certificate;
  // the page shows each line only when it is set.
  registrationNumber: '',
  registeredAddress: '',
  founder: 'Keith Morangwa Nyahach',
  founderRole: 'founder of Gusii Daily and Managing Director of Underdogs Rising Group Limited',
};

// The commitment to spin Gusii Daily out into its own non-profit (decision #73). Kept for the record; no longer published on a page (decision #122).
// Fill in `targetDate` and `criteria` once agreed; until then the page says they are being set.
export const spinOut = {
  form: 'a non-profit company limited by guarantee, which will then apply to be registered as a public benefit organisation (PBO)',
  transfers: ['the Gusii Daily name and trademarks', 'the website domains and social media accounts', 'all datasets', 'the website code'],
  targetDate: '',
  criteria: [],
};
