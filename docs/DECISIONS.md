# Decisions log

Why the site is built the way it is. Add new decisions at the bottom with a date. If you want to reverse one, discuss it first.

| # | Decision | Why |
|---|---|---|
| 1 | **Static site with Astro 5**, plain HTML output | Fast on cheap phones and slow networks, free to host (Netlify, Cloudflare Pages, GitHub Pages), nothing to hack or keep running. Astro 5 because the build environment's Node version did not support Astro 7. |
| 2 | **System fonts, no web fonts, minimal JavaScript** | Pages are around 10–30 KB. Data costs matter to readers. |
| 3 | **Two-layer pages**: one number, one sentence, one label first; detail behind "See the detail" | Most readers stop after the first screen. They should still leave with something true. |
| 4 | **Evidence labels** on every figure (Verified, Audit finding, Official claim, Unverified) | Trust. See `EDITORIAL_RULES.md`. |
| 5 | **Informational, not news-heavy** | The site is a reference people return to, not a feed. Short factual updates only. |
| 6 | **Maps as inline SVG generated at build time**, no map library, no Google Maps API | Free, no API keys or usage limits, works without JavaScript, very light. Google Places was used only to discover names, never stored as coordinates (licence terms). Interactive maps (MapLibre/Leaflet + OpenStreetMap) can come later if needed. |
| 7 | **Ward pages and a site-wide ward filter, both** | The filter ("Your ward" picker, saved in localStorage) makes the whole site about the reader's ward. Ward pages remain because they can be shared on WhatsApp, found on Google, and work without JavaScript. |
| 8 | **Ward receipt** at the top of each ward page, with a WhatsApp share button | Most readers arrive from WhatsApp links; a short, forwardable summary is the main entry point. |
| 9 | **No "Coming soon" boxes.** Unfinished pages are tagged "Planned" in menus and left off the home page | Empty boxes make a site look abandoned. The list of planned pages is in `src/config.js`. |
| 10 | **Tables become stacked cards on phones** (`table.cards`) | No sideways scrolling on small screens. |
| 11 | **Share and Print at the bottom of pages**, not the top | Content first. |
| 12 | **"Tell us" and "Get updates" hidden until a contact channel exists** | Set `contact.whatsapp` or `contact.email` in `src/config.js` to turn them on. |
| 13 | **Language policy:** English written backbone; short Kiswahili summary on key pages; full Kiswahili and Ekegusii later; audio in the speaker's language with subtitles | Reach without tripling the editing load at the start. Kiswahili summaries need review by a native speaker before launch. |
| 14 | **Questions, not accusations** for projects with repeat budgeting or stalled works | See `EDITORIAL_RULES.md` section 3. |
| 15 | **Charts drawn at build time** (`src/components/BarChart.astro`) with one axis, native tooltips and the same numbers in a table | Accessible, light, no chart library. Series colours are tokens in `global.css` (light and dark). |
| 16 | **No regex literals in `.astro` frontmatter of pages that use `getStaticPaths`** | Astro's compiler mis-parsed one and failed with `Unexpected "export"`. Use helpers in `src/lib/fmt.js` instead. |
| 17 | **Dark mode supported** via `prefers-color-scheme` tokens in `global.css` | Many phones default to dark mode. |
