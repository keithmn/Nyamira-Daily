// Site-wide switches. Fill these in before launch.
export const contact = {
  whatsapp: '',  // e.g. '2547XXXXXXXX' — turns on "Tell us" and "Get updates"
  email: '',
};
export const hasContact = Boolean(contact.whatsapp || contact.email);

// Pages that exist but have no real content yet. They stay reachable by
// link, are tagged "Planned" in menus, and are left out of the home page.
export const planned = new Set([
  '/have-your-say/', '/tell-us/', '/subscribe/',
  '/learn/episodes/',
  '/data/prices/', '/data/plans/',
]);
