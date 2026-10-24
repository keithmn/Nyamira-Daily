// Shared wrapper for machine-readable outputs (/api/…), documented on /data/open-data/.
export const licence = {
  licence: 'Free to reuse with credit to Nyamira Daily.',
  credit: 'Source: Nyamira Daily',
  note: 'Data derived from OpenStreetMap is © OpenStreetMap contributors, ODbL. Ward boundaries: geoBoundaries, CC BY 4.0.',
};
export function json(body, site) {
  return new Response(JSON.stringify({ ...licence, site: site?.toString(), generated: new Date().toISOString().slice(0, 10), ...body }, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
export function text(body) {
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
