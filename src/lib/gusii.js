// Data for the Gusii counties beyond Nyamira (decision #134). Nyamira's civic data lives in src/data/*.json as
// before; every other county keeps the same file shapes in src/data/counties/<county>/ (facilities, leaders,
// census, money). A missing file means that dataset is not collected yet, never zero.
import register from '../data/ward-register.json' with { type: 'json' };
import { countyBySlug } from '../county.js';

const files = import.meta.glob('../data/counties/*/*.json', { eager: true, import: 'default' });

export function countyData(county, name) {
  return files[`../data/counties/${county}/${name}.json`] ?? null;
}

export const registerWards = register.wards;
export const registerWard = (slug) => register.wards.find((w) => w.slug === slug);

// Wards whose pages use CountyWard.astro: every register ward in a county without full coverage.
export const registerOnlyWards = register.wards.filter((w) => countyBySlug[w.county]?.coverage !== 'full');

export function wardFacilities(ward) {
  return (countyData(ward.county, 'facilities') ?? []).filter((f) => f.ward === ward.slug);
}

export function wardMca(ward) {
  return countyData(ward.county, 'leaders')?.mcas?.[ward.slug] ?? null;
}

export function constituencyMp(ward) {
  return countyData(ward.county, 'leaders')?.national?.find((l) => l.office === `MP, ${ward.constituency}`) ?? null;
}
