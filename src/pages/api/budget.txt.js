// County budget summary as plain text under 900 characters, for SMS/USSD/WhatsApp bot replies.
import money from '../../lib/county-money.js';
import { ksh } from '../../lib/fmt.js';
import { text } from '../../lib/api.js';

export function GET() {
  const y = money.years[money.years.length - 1];
  const prev = money.years.length > 1 ? money.years[money.years.length - 2] : null;
  const lines = [
    `Nyamira County Budget (Nyamira Daily)`,
    ``,
    `${y.fy}:`,
    `Budget: ${ksh(y.budget * 1e6)}`,
    `Spent: ${ksh(y.spent * 1e6)}`,
    y.dev != null ? `Development: ${ksh(y.dev * 1e6)} (${y.devAbs}% used)` : null,
    y.osr != null ? `Own revenue: ${ksh(y.osr * 1e6)}` : null,
    y.pending != null ? `Pending bills: ${ksh(y.pending * 1e6)}` : null,
    ``,
    prev ? `${prev.fy}: Budget ${ksh(prev.budget * 1e6)}, Spent ${ksh(prev.spent * 1e6)}` : null,
    ``,
    `Source: Controller of Budget`,
    `More: https://nyamiradaily.org/money/`,
  ].filter((l) => l != null);
  return text(lines.join('\n').slice(0, 900));
}
