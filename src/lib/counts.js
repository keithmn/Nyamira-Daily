// Counts that appear in copy, computed from the data so they cannot drift from it (decision #136).
import register from '../data/ward-register.json' with { type: 'json' };
import budget from '../data/budget-sectors.json' with { type: 'json' };
import { countyBySlug } from '../county.js';

export const wardCount = register.wards.length;
export const constituencyCount = register.constituencies.length;
export const nyamiraWardCount = register.counties.nyamira.wards;
export const nyamiraConstituencyCount = countyBySlug.nyamira.constituencies.length;
export const departmentCount = budget.departments.length;
