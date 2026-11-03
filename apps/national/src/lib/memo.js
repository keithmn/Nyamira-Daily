// A memorandum to a committee, assembled from the reader's choices (build brief 5.10). Pure and free of the dictionaries,
// so the built page and the browser share it; the words arrive in `w`, already in the page's language. Nothing is sent or
// kept: the reader copies the text and sends it themselves.
export function memorandum({ topic, from, date, ask, w }) {
  return [
    `${w.to}: ${topic.to}`,
    `${w.from}: ${from.trim() || w.yourName}`,
    `${w.date}: ${date}`,
    `${w.subject}: ${topic.subject}`,
    '',
    `1. ${w.background}`,
    ...topic.facts.map((f) => `${f.text} (${w.source}: ${f.cite})`),
    '',
    `2. ${w.request}`,
    ask.trim() || w.yourAsk,
    '',
    w.close,
    from.trim() || w.yourName,
  ].join('\n');
}
