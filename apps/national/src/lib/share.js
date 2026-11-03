// The message carries the figure, its source and the link, so a forwarded card keeps its provenance. Kept on its own so the
// browser scripts can use it without the dictionaries.
export const whatsappHref = (text, source, url) => `https://wa.me/?text=${encodeURIComponent(`${text} ${source} ${url}`)}`;
