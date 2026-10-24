// The ward receipt as plain text for WhatsApp or SMS replies (TODO(service): the bot reads /api/ward/<slug>.txt).
// Kept under 900 characters.
import { ksh, num } from './fmt.js';
export function wardText(r) {
  const top = r.services.byCategory.slice(0, 3).map((c) => `${c.category} ${c.count}`).join(', ');
  const lines = [
    `${r.name} Ward, ${r.subCounty} (Nyamira Daily)`,
    `MCA: ${r.mca ? r.mca.name + (r.mca.party ? ' (' + r.mca.party + ')' : '') : 'not confirmed'}`,
    r.mp ? `MP: ${r.mp}` : null,
    `Services listed: ${r.services.total}${top ? ' (' + top + '), not yet checked on site' : ''}`,
    r.wardProjects2526 ? `Ward projects budgeted 2025/26: ${ksh(r.wardProjects2526.amount)} (county budget)` : null,
    r.registeredVoters2018 ? `Registered voters (IEBC 2018): ${num(r.registeredVoters2018)}` : null,
    `County spent ${ksh(r.county.spentKshMillion * 1e6)} of ${ksh(r.county.budgetKshMillion * 1e6)} in ${r.county.fy}; ${r.county.developmentBudgetUsedPct}% of the development budget was used (Controller of Budget).`,
    r.questions.length ? `Question to ask: ${r.questions[0].title}` : null,
    `More, with sources: ${r.url}`,
  ].filter(Boolean);
  let t = lines.join('\n');
  if (t.length > 900) t = lines.filter((l) => !l.startsWith('Question')).join('\n');
  return t.slice(0, 900);
}
