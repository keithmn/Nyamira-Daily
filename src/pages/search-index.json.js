// Builds a small search index at build time: pages, wards, leaders,
// constitution articles and listed services.
import wards from '../data/wards.json';
import leaders from '../data/leaders.json';
import c from '../data/constitution.json';
import { topics } from '../data/topics.js';
import { planned } from '../config.js';
import F from '../data/fees.json';
import A from '../data/assembly.json';
import W from '../data/wardspend.json';

export function GET() {
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
    ['Glossary', '/learn/glossary/'], ['About', '/about/'], ['How we work', '/how-we-work/', 'evidence labels corrections'],
  ];
  for (const [t, u, k] of pages) add(t, u, k);
  for (const t of topics) if (!planned.has(`/data/${t.slug}/`)) add(t.title, `/data/${t.slug}/`, t.question);
  add('County budget and spending', '/data/money/', 'money budget spending pending bills revenue controller of budget absorption');
  for (const w of wards) {
    const m = leaders.mcas[w.slug];
    add(`${w.name} Ward`, `/ward/${w.slug}/`, `${w.subCounty} ${m?.name ?? ''} ${w.places.map((p) => p.name).join(' ')}`, 'Ward');
    for (const f of w.facilities) add(f.name, `/ward/${w.slug}/`, `${f.category} ${f.subtype} ${w.name}`, `Service in ${w.name}`);
  }
  for (const l of [...leaders.county, ...leaders.national]) add(l.name, '/government/leaders/', l.office, l.office);
  for (const [slug, m] of Object.entries(leaders.mcas)) add(m.name, `/ward/${slug}/`, 'mca', `MCA, ${wards.find((w) => w.slug === slug)?.name}`);
  for (const a of c.chapter11.articles) add(`Article ${a.n}: ${a.title}`, `/constitution/article/${a.n}/`, a.plain, 'Constitution');
  for (const f of F.fees) add(f.item, '/learn/fees/', `${f.group} fee ${f.amountText}`, 'Fee');
  for (const a of A.acts) add(a.name, '/constitution/county-laws/', a.summary, 'County Act');
  for (const p of W.projects) if (p.ward) add(p.name, `/ward/${p.ward}/#projects`, `${p.department} project ${p.fy}`, `Project in ${wards.find((w) => w.slug === p.ward)?.name}`);
  return new Response(JSON.stringify(items));
}
