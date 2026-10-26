// Builds a small search index at build time: pages, wards, leaders,
// constitution articles and listed services.
import wards from '../data/wards.js';
import leaders from '../data/leaders.json';
import c from '../data/constitution.json';
import { topics } from '../data/topics.js';
import { planned } from '../config.js';
import F from '../data/fees.json';
import A from '../data/assembly.json';
import W from '../data/wardspend.json';
import { entries } from '../lib/content.js';
import opportunities from '../data/opportunities.json';
import { opportunitiesAt } from '../lib/opportunity-status.js';
import { publicationTime } from '../lib/publication.js';

export async function GET() {
  const items = [];
  const add = (t, u, k = '', g = 'Page') => items.push({ t, u, k, g });
  const pages = [
    ['Today', '/'], ['Data', '/data/'], ['Wards', '/ward/'], ['Government', '/government/'],
    ["Who's in charge?", '/government/whos-in-charge/', 'responsible fix problem road hospital'],
    ['Leaders', '/government/leaders/', 'governor senator mp woman representative speaker mca'],
    ['The Executive', '/government/executive/', 'departments cec chief officer'],
    ['The Assembly', '/government/assembly/', 'county assembly mca'], ['MCAs', '/government/assembly/mcas/'],
    ['Watchdogs and complaints', '/government/watchdogs/', 'auditor eacc ombudsman controller of budget complaint'],
    ['Constitution', '/constitution/'], ['Devolution (Chapter 11)', '/constitution/devolution/'],
    ['What the county is responsible for (Fourth Schedule)', '/constitution/fourth-schedule/', 'functions'],
    ['Your rights', '/constitution/your-rights/'], ['County laws', '/constitution/county-laws/'],
    ['Learn', '/learn/'], ['How the county works', '/learn/how-it-works/'],
    ['Budget calendar', '/learn/budget-calendar/', 'cidp adp budget estimates dates'],
    ['Taking part', '/learn/taking-part/', 'public participation forum petition information access'],
    ['Fees you pay', '/learn/fees/', 'finance act business permit market cess parking boda boda matatu slaughter building approval land rates liquor'],
    ['Opportunities', '/opportunities/', 'jobs tenders bursary agpo vacancies scholarships'],
    ['Assembly sittings', '/government/assembly/sittings/', 'hansard impeachment appropriation'],
    ['Bills and Acts', '/government/assembly/bills/'], ['Committees', '/government/assembly/committees/'],
    ['Petitions and motions', '/government/assembly/petitions/'],
    ['Take part', '/take-part/'], ['Ask Nyamira', '/ask/', 'access to information request letter article 35 right to information'],
    ['Submission helper', '/take-part/submission/', 'budget forum petition public participation write'],
    ['Stories', '/stories/'], ['Explainers', '/explainers/'], ['Number of the week', '/number-of-the-week/', 'radio'],
    ['Is it working?', '/report/', 'report water point borehole dispensary streetlight road bridge market broken'], ['Clinic check', '/report/clinic/', 'health centre dispensary medicines waiting'],
    ['Adopt a project', '/adopt/', 'volunteer school club photo monitor'],
    ['Budget simulator: you run the county', '/tools/budget-simulator/', 'budget allocate departments health roads water wage bill'], ['What could it build?', '/tools/what-it-builds/', 'unit cost classroom borehole road km dispensary billion'],
    ['Alerts', '/alerts/', 'emergency fire flood landslide outage road closure notice'],
    ['Glossary', '/learn/glossary/'], ['About', '/about/'], ['How we work', '/how-we-work/', 'evidence labels corrections'],
  ];
  for (const [t, u, k] of pages) if (!planned.has(u)) add(t, u, k);
  for (const item of opportunitiesAt(opportunities.items, publicationTime).filter((item) => item.availability === 'open')) {
    add(item.title, '/opportunities/', `${item.type} deadline ${item.closes} ${item.by}`, `Opportunity open at latest build · ${item.type}`);
  }
  for (const t of topics) if (!planned.has(`/data/${t.slug}/`)) add(t.title, `/data/${t.slug}/`, t.question);
  add('County budget and spending', '/data/money/', 'money budget spending pending bills revenue controller of budget absorption');
  for (const w of wards) {
    const m = leaders.mcas[w.slug];
    add(`${w.name} Ward`, `/ward/${w.slug}/`, `${w.subCounty} ${m?.name ?? ''} ${w.places.map((p) => p.name).join(' ')}`, 'Ward');
    for (const f of w.facilities) add(f.name, `/facility/${f.id.toLowerCase()}/`, `${f.id} ${f.category} ${f.subtype} ${w.name} ${w.subCounty}`, `Facility · ${f.category}`);
  }
  for (const l of [...leaders.county, ...leaders.national]) add(l.name, '/government/leaders/', l.office, l.office);
  for (const [slug, m] of Object.entries(leaders.mcas)) add(m.name, `/ward/${slug}/`, 'mca', `MCA, ${wards.find((w) => w.slug === slug)?.name}`);
  for (const a of c.chapter11.articles) add(`Article ${a.n}: ${a.title}`, `/constitution/article/${a.n}/`, a.plain, 'Constitution');
  for (const f of F.fees) add(f.item, '/learn/fees/', `${f.group} fee ${f.amountText}`, 'Fee');
  for (const a of A.acts) add(a.name, '/constitution/county-laws/', a.summary, 'County Act');
  for (const p of W.projects) if (p.ward) add(p.name, `/projects/${p.projectId.toLowerCase()}/`, `${p.department} project ${p.fy}`, `Project in ${wards.find((w) => w.slug === p.ward)?.name}`);
  const label = { explainers: 'Explainer', factchecks: 'Myth or fact', stories: "What's working", people: "Nyamira's people", heritage: 'Heritage' };
  const base = { explainers: '/explainers/', factchecks: '/fact-check/', stories: '/whats-working/', people: '/people/', heritage: '/heritage/' };
  for (const c of Object.keys(label)) {
    for (const e of await entries(c)) add(e.data.title ?? e.data.claim ?? e.data.name, `${base[c]}${e.id}/`, e.data.summary ?? e.data.story ?? '', label[c]);
  }
  for (const e of await entries('numbers')) add(`${e.data.figure} ${e.data.sentence}`, `/number-of-the-week/#${e.id}`, e.data.explanation, 'Number of the week');
  for (const e of await entries('alerts')) add(e.data.title, `/alerts/${e.data.id.toLowerCase()}/`, `${e.data.type} ${e.data.place ?? ''} ${e.data.summary}`, 'Alert');
  return new Response(JSON.stringify(items));
}
