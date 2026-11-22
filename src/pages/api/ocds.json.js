// Open Contracting Data Standard (OCDS) 1.1 release package.
// Maps Nyamira Daily's contracts tracker to OCDS so global procurement transparency tools can consume it.
// Spec: https://standard.open-contracting.org/latest/en/
import D from '../../data/contracts.json' with { type: 'json' };
import { json } from '../../lib/api.js';

function ocdsRelease(c, site) {
  const ocid = `ocds-nyamira-${c.id}`;
  const release = {
    ocid,
    id: `${ocid}-${c.source}`,
    date: c.awardDate || c.fy || null,
    tag: [c.kind === 'contract' ? 'award' : 'planning'],
    initiationType: 'tender',
    buyer: { name: c.agency || D.groups[c.group]?.label || 'Unknown' },
    tender: {
      id: c.tenderNo || c.id,
      title: c.title,
      status: c.terminated ? 'cancelled' : 'complete',
      procuringEntity: { name: c.agency || D.groups[c.group]?.label || null },
    },
    awards: c.kind === 'contract' && c.contractor ? [{
      id: `award-${c.id}`,
      title: c.title,
      status: c.terminated ? 'cancelled' : 'active',
      date: c.awardDate || null,
      value: c.amount != null ? { amount: c.amount, currency: 'KES' } : null,
      suppliers: [{ name: c.contractor }],
      contractPeriod: c.startDate || c.endDate ? {
        startDate: c.startDate || null,
        endDate: c.endDate || null,
      } : null,
    }] : [],
    planning: {
      budget: {
        description: c.amountLabel || null,
        amount: c.amount != null ? { amount: c.amount, currency: 'KES' } : null,
      },
    },
  };
  if (c.wards?.length) release.tender.items = c.wards.map((w) => ({ description: `Ward: ${w}` }));
  if (c.paid != null) {
    release.contracts = [{
      id: `contract-${c.id}`,
      awardID: `award-${c.id}`,
      title: c.title,
      implementation: {
        transactions: [{ id: `payment-${c.id}`, value: { amount: c.paid, currency: 'KES' }, date: c.paidAsAt || null }],
      },
    }];
  }
  return release;
}

export function GET({ site }) {
  const countyContracts = D.contracts.filter((c) => !c.national);
  return json({
    description: 'Open Contracting Data Standard (OCDS 1.1) release package for Nyamira County Government contracts. National contracts (NG-CDF, KeNHA, KeRRA) are excluded — OCDS says each publisher covers its own procuring entity. See /api/contracts.json for all records.',
    standard: 'OCDS 1.1 (https://standard.open-contracting.org/)',
    publishedDate: new Date().toISOString(),
    publisher: { name: 'Nyamira Daily', scheme: 'nyamiradaily.org', url: site?.toString() },
    releases: countyContracts.map((c) => ocdsRelease(c, site)),
  }, site);
}
