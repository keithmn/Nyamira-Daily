// Site-wide switches. Fill these in before launch.
export const contact = {
  whatsapp: '',  // e.g. '2547XXXXXXXX' — turns on "Tell us" and "Get updates"
  email: '',
};
// NY Watch. A scheduled hour alone is not evidence that a broadcast is live.
// Status values: planned, scheduled, confirmed_live, or recorded.
export const show = { status: 'scheduled', start: 22, end: 23, liveUrl: '', confirmedAt: '', recordingUrl: '' };
// Media (decision #63): the daily show's YouTube channel and the NY Watch podcast. Leave empty until they exist;
// episodes live in src/content/episodes/.
export const media = { showChannelUrl: '', podcastUrl: '' };

export const hasContact = Boolean(contact.whatsapp || contact.email);

// Community reporting stays disabled until both a monitored channel and a response owner are configured.
export const reportFormUrl = '';
export const reportResponseRole = '';
export const canReport = Boolean((contact.whatsapp || reportFormUrl) && reportResponseRole);
export const alertMonitoring = { role: 'Site owner', reviewCadence: 'daily' };
// Adopt a project: the sign-up form for volunteers and school clubs
export const adoptSignupUrl = '';

// Pages that exist but have no real content yet. They stay reachable by
// link, are tagged "Planned" in menus, and are left out of the home page.
export const planned = new Set([
  '/tell-us/', '/subscribe/',
  // Phase 1 scaffolding (docs/EXPANSION_SPEC.md 1.7): planned until real, consented entries exist
  '/whats-working/', '/people/', '/heritage/', '/fact-check/',
  '/diaspora/', '/schools-programme/', '/fellowship/', '/state-of-nyamira/',
  // Media, news and heritage databases (decisions #63-#65): planned until their first checked entries
  '/news/', '/show/', '/ny-watch/', '/community/clans/', '/community/knowledge/',
  // Phase 2: planned until a channel is set above
  ...(canReport ? [] : ['/report/', '/report/clinic/']),
  ...(adoptSignupUrl ? [] : ['/adopt/']),
]);
