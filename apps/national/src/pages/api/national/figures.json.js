// Every figure in the current data release, with its source documents
import { envelope, json } from '../../../lib/api.js';
import { allFigures } from '../../../lib/figures.js';

export const GET = () => json(envelope({ what: 'Every figure in the registry. Stages differ, so never add figures of different stages.' }, allFigures()));
