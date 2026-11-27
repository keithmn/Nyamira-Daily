// Leaders summary as plain text under 900 characters, for SMS/USSD/WhatsApp bot replies.
import L from '../../data/leaders.json' with { type: 'json' };
import { text } from '../../lib/api.js';

export function GET() {
  const lines = [
    `Nyamira County Leaders (Gusii Daily)`,
    ``,
    ...L.county.map((l) => `${l.office}: ${l.name}${l.party ? ' (' + l.party + ')' : ''}`),
    ``,
    ...L.national.map((l) => `${l.office}: ${l.name} (${l.party})`),
    ``,
    `Reply with a ward name for its MCA.`,
    `More: https://gusiidaily.org/administration/`,
  ];
  return text(lines.join('\n').slice(0, 900));
}
