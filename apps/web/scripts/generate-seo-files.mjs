/**
 * Writes robots.txt, sitemap.xml, and build-site-origin.ts before ng build.
 * Usage: SITE_ORIGIN=https://your.domain npm run prebuild
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const routesFile = path.join(webRoot, 'prerender-routes.txt');
const publicDir = path.join(webRoot, 'public');
const originFile = path.join(webRoot, 'src/app/core/build-site-origin.ts');

const origin = (process.env.SITE_ORIGIN || 'https://example.com').replace(/\/$/, '');

const routes = fs
  .readFileSync(routesFile, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((p) => `  <url><loc>${origin}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /learn
Disallow: /lab
Disallow: /account

Sitemap: ${origin}/sitemap.xml
`;

const originTs = `// Auto-updated by scripts/generate-seo-files.mjs — set SITE_ORIGIN when building for production.
export const BUILD_SITE_ORIGIN = '${origin}';
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
fs.writeFileSync(originFile, originTs);

console.log(`SEO: ${routes.length} URLs in sitemap.xml, robots.txt, BUILD_SITE_ORIGIN=${origin}`);
