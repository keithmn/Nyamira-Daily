// The citation string behind each "Copy citation" button (build brief 4.6).
export function citation(figure, source, release, siteName) {
  const title = source.title.replace(/ ([^()]*)$/, '');
  return `${siteName}, data release ${release}, figure ${figure.id}, from the ${title}, ${figure.page}.`;
}
