// A data release exactly as scripts/national/release.mjs wrote it: every value, and what was added, changed and removed
import { json } from '../../../lib/api.js';
import { allReleases } from '../../../lib/figures.js';

export const getStaticPaths = () => allReleases().map((r) => ({ params: { date: r.date }, props: { r } }));
export const GET = ({ props }) => json(props.r);
