import { defineConfig } from 'astro/config';

// Nyamira Daily: a light, static, phone-first site.
export default defineConfig({
  site: 'https://nyamiradaily.example', // replace with the real domain
  trailingSlash: 'always',
  build: { format: 'directory' },
});
