// County settings and publisher details, in one place (decision #74, the "county kit").
// The aim: a second county edition (Kisii first) is mostly a change of this file and of src/data/, not of every
// page. New code should read the county's names from here instead of typing "Nyamira". Older pages still have the
// name written in; move them over as they are touched (see docs/DECISIONS.md #74 for the list of what is left).

export const county = {
  slug: 'nyamira',
  name: 'Nyamira',
  countyName: 'Nyamira County',
  government: 'County Government of Nyamira',
  assembly: 'County Assembly of Nyamira',
  siteName: 'Nyamira Daily',
  domain: 'nyamiradaily.org',
  // The county's sub-county units under the County Governments Act (s.48) are its constituencies. Use these for
  // county budgets, wards and leaders. The national government's administrative sub-counties are a different map:
  // always say "constituency" or "administrative sub-county", never just "sub-county" (decision #75).
  constituencies: ['Borabu', 'Kitutu Masaba', 'North Mugirango', 'West Mugirango'],
  // Languages for summaries and audio. Ekegusii (ISO 639-3 "guz") is planned; see decision #78.
  languages: [
    { code: 'en', name: 'English', status: 'live' },
    { code: 'sw', name: 'Kiswahili', label: 'Muhtasari kwa Kiswahili', status: 'summaries' },
    { code: 'guz', name: 'Ekegusii', status: 'planned' },
  ],
};

// Who builds and publishes the site (decision #73). Use the exact name on the certificate of incorporation.
// CHECK BEFORE LAUNCH: confirm legalName against the certificate; spelling has varied in earlier drafts.
export const publisher = {
  legalName: 'Underdogs Rising Group Limited',
  shortName: 'Underdogs Rising',
  kind: 'a Kenyan media and technology company',
  founder: 'Keith Morangwa Nyahach',
  founderRole: 'founder of Nyamira Daily and Managing Director of Underdogs Rising Group Limited',
};

// The commitment to spin Nyamira Daily out into its own non-profit (decision #73). Published on /who-runs-us/.
// Fill in `targetDate` and `criteria` once agreed; until then the page says they are being set.
export const spinOut = {
  form: 'a non-profit company limited by guarantee, which will then apply to be registered as a public benefit organisation (PBO)',
  transfers: ['the Nyamira Daily name and trademarks', 'the website domains and social media accounts', 'all datasets', 'the website code'],
  targetDate: '',
  criteria: [],
};
