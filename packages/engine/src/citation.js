// The citation string behind each "Copy citation" button (build brief 4.6).

// A document's title without the bracket at its end. Brackets inside the name stay: "(County Governments) Regulations".
export const shortenTitle = (title) => title.replace(/ \([^()]*\)$/, '');

export function citation(figure, source, release, siteName) {
  return `${siteName}, data release ${release}, figure ${figure.id}, from the ${shortenTitle(source.title)}, ${figure.page}.`;
}
