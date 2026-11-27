import { departmentCount } from '../lib/counts.js';
// Builds a small search index at build time: the pages of the five sections (decision #110), wards, places,
// roads, county projects, money pages, fees, seat holders and published explainers.
import wards from '../data/wards.js';
import { roads, roadPath, subtypeLabel, wardName } from '../lib/roads.js';
import leaders from '../data/leaders.json' with { type: 'json' };
import { topics, topicPath } from '../data/topics.js';
import { departments, departmentPath, programmePath, yearPath, FY } from '../lib/county-budget.js';
import { planned } from '../config.js';
import F from '../data/fees.json' with { type: 'json' };
import W from '../data/wardspend.json' with { type: 'json' };
import { entries } from '../lib/content.js';

export async function GET() {
  const items = [];
  const add = (t, u, k = '', g = 'Page') => items.push({ t, u, k, g });
  const pages = [
    ['Home', '/'], ['Map of Nyamira', '/map/', 'map wards facilities'], ['Wards', '/ward/'],
    ['Report a place', '/report/', 'report water point borehole dispensary streetlight road bridge market broken'], ['Clinic check', '/report/clinic/', 'health centre dispensary medicines waiting'],
    ['Budget calendar', '/money/2025-26/#key-dates', 'cidp adp budget estimates dates hearing'],
    ['Fees you pay', '/money/revenue/#fees', 'finance act business permit market cess parking boda boda matatu slaughter building approval land rates liquor'],
    ['Contracts', '/money/contracts/', 'tenders contractors project tracker'], ['The Nyamira economy', '/money/economy/', 'economy tea bonus ng-cdf national contracts market prices income'],
    ['Watch', '/watch/', 'videos explainers'], ['Explainers', '/explainers/'], ['Number of the week', '/number-of-the-week/'],
    ['Administration: who holds each seat', '/administration/', 'governor deputy speaker mca senator mp woman representative'], ['What the county must do', '/administration/duties/', 'fourth schedule functions constitution devolution responsible'],
    ['About', '/about/'], ['Contact us', '/about/contact/', 'tips concerns'], ['Careers and volunteering', '/about/careers/', 'jobs correspondents'], ['Partner with us', '/about/partners/', 'data licence research sponsorship'], ['About Nyamira County', '/about/nyamira/', 'population facts'], ['Community', '/community/', 'Abagusii Gusii culture Ekegusii language archive'], ['How we work', '/about/rules/', 'evidence labels corrections'],
    ['Right of reply', '/about/rules/#right-of-reply'], ['Glossary', '/about/glossary/'], ['Terms and reuse', '/about/rules/#terms'], ['Privacy', '/about/rules/#privacy'],
    ['Alerts', '/alerts/', 'emergency disruption notice incident flood fire road closure outage'],
    ['Fact check', '/fact-check/', 'claims true false misleading verified'],
    ["What's working", '/whats-working/', 'stories evidence water road school health working'],
    ["Nyamira's people", '/people/', 'people profiles teachers farmers community consent'],
    ['Heritage', '/heritage/', 'places traditions soapstone culture Tabaka'],
  ];
  for (const [t, u, k] of pages) if (!planned.has(u)) add(t, u, k);
  for (const t of topics) if (!planned.has(topicPath[t.slug])) add(t.title, topicPath[t.slug], t.question);
  add('County budget and spending', '/money/', 'money budget spending pending bills revenue controller of budget absorption');
  // The county budget pages (decision #105): each department and programme can be found by name
  add(`Nyamira's budget ${FY}`, yearPath(), 'budget estimates ksh 100 staff pay wage bill development equitable share', 'Money');
  add(`The ${departmentCount} departments, ${FY}`, `${yearPath()}departments/`, 'departments votes ministries staff pay change', 'Money');
  add('What the county spent this year', '/money/track/', 'spending absorption quarter report questions to ask unspent', 'Money');
  add('Where the money comes from', '/money/revenue/', 'revenue equitable share allocated received own source revenue fees grants', 'Money');
  add("Nyamira's money since 2013", '/money/history/', 'history budget spending development pending bills since 2013', 'Money');
  for (const d of departments()) {
    add(d.name, departmentPath(d.vote), `vote ${d.vote} ${d.short} department budget ${FY}`, `Department · vote ${d.vote}`);
    for (const p of d.programmes) add(p.name, programmePath(d.vote, p.slug), `${d.name} ${d.short} programme ${p.rows.map((r) => r.name ?? '').join(' ')}`, `Programme · ${d.short}`);
  }
  for (const w of wards) {
    add(`${w.name} Ward`, `/ward/${w.slug}/`, `${w.subCounty} ${w.places.map((p) => p.name).join(' ')}`, 'Ward');
    for (const f of w.facilities) add(f.name, `/place/${f.id.toLowerCase()}/`, `${f.id} ${f.category} ${f.subtype} ${w.name} ${w.subCounty}`, `Facility · ${f.category}`);
  }
  add('Roads', '/map/#roads', 'roads bridges culverts road works money questions to ask', 'Places');
  for (const r of roads) {
    const where = r.wards.map(wardName).join(', ');
    add(r.name, roadPath(r.id), `${r.id} road ${subtypeLabel[r.subtype]} ${where}`, where ? `Road · ${where}` : 'Road');
  }
  // Seat holders link to the Administration page only: no profiles (decision #110)
  for (const l of [...leaders.county, ...leaders.national]) add(l.name, '/administration/', l.office, l.office);
  for (const [slug, m] of Object.entries(leaders.mcas)) add(m.name, `/administration/#ward-${slug}`, 'mca', `MCA, ${wards.find((w) => w.slug === slug)?.name}`);
  for (const f of F.fees) add(f.item, '/money/revenue/#fees', `${f.group} fee ${f.amountText}`, 'Fee');
  for (const p of W.projects) if (p.ward) add(p.name, `/place/${p.projectId.toLowerCase()}/`, `${p.department} project ${p.fy}`, `Project in ${wards.find((w) => w.slug === p.ward)?.name}`);
  for (const e of await entries('explainers')) add(e.data.title, `/explainers/${e.id}/`, e.data.summary ?? '', 'Explainer');
  for (const e of await entries('numbers')) add(`${e.data.figure} ${e.data.sentence}`, `/number-of-the-week/#${e.id}`, e.data.explanation, 'Number of the week');
  // Fact checks, stories, people, heritage (Expansion 1.7)
  for (const e of await entries('factchecks')) add(`Fact check: ${e.data.claim}`, `/fact-check/#${e.id}`, `${e.data.rating} ${e.data.summary}`, 'Fact check');
  for (const e of await entries('stories')) add(e.data.title, `/whats-working/#${e.id}`, `${e.data.sector} ${e.data.ward ?? ''}`.trim(), "What's working");
  for (const e of await entries('people')) add(e.data.name, `/people/#${e.id}`, `${e.data.role} ${e.data.ward ?? ''}`.trim(), 'People');
  for (const e of await entries('heritage')) add(e.data.title, `/heritage/#${e.id}`, `${e.data.place ?? ''} ${e.data.ward ?? ''}`.trim(), 'Heritage');
  // Alerts (Expansion 1.8)
  const { alertItems } = await import('../lib/alerts.js');
  for (const e of await alertItems()) add(e.data.title, `/alerts/${e.id}/`, `${e.data.summary} ${e.data.wards.join(' ')}`, `Alert · ${e.data.level}`);
  // Ekegusii language entries (decision #129): each word or phrase is searchable by its Ekegusii term and English translation
  const { languageItems } = await import('../lib/language.js');
  for (const e of await languageItems()) add(`${e.data.term} — ${e.data.translationEn}`, `/community/language/words/#cat-${e.data.category}`, `${e.data.translationSw ?? ''} ${e.data.usageExample ?? ''} ${e.data.category}`.trim(), 'Ekegusii');
  // Tool pages
  add('Ask Nyamira', '/ask/', 'right to information article 35 access to information request county government', 'Tool');
  add('Submission helper', '/take-part/submission/', 'budget hearing petition county assembly submission public participation', 'Tool');
  add('Budget simulator', '/tools/budget-simulator/', 'budget sectors spending move money development recurrent simulator', 'Tool');
  return new Response(JSON.stringify(items));
}
