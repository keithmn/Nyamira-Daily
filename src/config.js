// Site-wide switches. Fill these in before launch.
export const contact = {
  whatsapp: '',  // e.g. '2547XXXXXXXX' — turns on "Tell us" and "Get updates"
  email: '',
};
// NY Watch, the nightly show. The "On air now" strip shows from start to end hour, Nairobi time (EAT).
// Add the stream or radio link to liveUrl and the strip links to it.
export const show = { start: 22, end: 23, liveUrl: '' };

export const hasContact = Boolean(contact.whatsapp || contact.email);

// Community reporting (Phase 2). Reports go to WhatsApp if contact.whatsapp is set, otherwise to this form
// (for example a KoboToolbox link). TODO(service): receiving, checking and storing reports.
export const reportFormUrl = '';
export const canReport = Boolean(contact.whatsapp || reportFormUrl);
// Adopt a project: the sign-up form for volunteers and school clubs
export const adoptSignupUrl = '';

// Pages that exist but have no real content yet. They stay reachable by
// link, are tagged "Planned" in menus, and are left out of the home page.
export const planned = new Set([
  '/tell-us/', '/subscribe/',
  '/learn/episodes/',
  '/data/prices/', '/data/plans/',
  // Phase 1 scaffolding (docs/EXPANSION_SPEC.md 1.7): planned until real, consented entries exist
  '/whats-working/', '/people/', '/heritage/', '/fact-check/',
  '/diaspora/', '/schools-programme/', '/fellowship/', '/state-of-nyamira/',
  // Phase 2: planned until a channel is set above
  ...(canReport ? [] : ['/report/', '/report/clinic/']),
  ...(adoptSignupUrl ? [] : ['/adopt/']),
]);
