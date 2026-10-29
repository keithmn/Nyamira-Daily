import { exportAcceptedFacilityObservations, requireFacilityReviewer } from './review-facilities.js';
import { jsonResponse } from '../_shared/corrections.js';

export async function onRequestGet({ request, env }) {
  try {
    const access = await requireFacilityReviewer(request, env);
    if (access.response) return access.response;
    const exported = await exportAcceptedFacilityObservations(env.DB);
    return new Response(JSON.stringify(exported, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': 'attachment; filename="facility-observations-export.json"',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Accepted facility observation export failed:', error);
    return jsonResponse({ error: 'The accepted facility observation export could not be generated.' }, 500);
  }
}

export function onRequest({ request }) {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}
