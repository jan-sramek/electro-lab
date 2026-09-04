/**
 * Writes robots.txt, sitemap.xml, and build-site-origin.ts before ng build.
 * Invoked by scripts/build.mjs (npm run build) with the ng build arguments; fails a
 * production build when SITE_ORIGIN is unset or still the example.com placeholder.
 * Usage: SITE_ORIGIN=https://your.domain node scripts/generate-seo-files.mjs --configuration production
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const routesFile = path.join(webRoot, 'prerender-routes.txt');
const publicDir = path.join(webRoot, 'public');
const originFile = path.join(webRoot, 'src/app/core/build-site-origin.ts');

const PLACEHOLDER_ORIGIN = 'https://example.com';

/** True for `--configuration production`, `--configuration=production`, `-c production`, or `--prod`. */
function isProductionBuild(argv) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--prod') return true;
    if (arg === '--configuration' || arg === '-c') return argv[i + 1] === 'production';
    if (arg.startsWith('--configuration=') || arg.startsWith('-c=')) {
      return arg.split('=')[1] === 'production';
    }
  }
  return false;
}

const production = isProductionBuild(process.argv.slice(2));
const rawOrigin = (process.env.SITE_ORIGIN || '').trim().replace(/\/$/, '');
if (production && (!rawOrigin || rawOrigin === PLACEHOLDER_ORIGIN)) {
  console.error(
    '\nERROR: SITE_ORIGIN is not set for a production build.\n' +
      'Canonical URLs, Open Graph tags, JSON-LD and sitemap.xml would point at the https://example.com placeholder.\n' +
      'Set the public origin, e.g. SITE_ORIGIN=https://electro-lab.example npm run build -- --configuration production\n' +
      '(docker: --build-arg SITE_ORIGIN=..., compose: SITE_ORIGIN in the environment).\n'
  );
  process.exit(1);
}
if (!production && !rawOrigin) {
  console.warn(`SEO: SITE_ORIGIN unset — using placeholder ${PLACEHOLDER_ORIGIN} (development build only).`);
}
const origin = rawOrigin || PLACEHOLDER_ORIGIN;

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
