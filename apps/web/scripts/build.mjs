#!/usr/bin/env node
/**
 * `npm run build [-- <ng build args>]`: regenerate SEO files for the requested configuration
 * (fails production builds without SITE_ORIGIN), then run `ng build` with the same arguments.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '..');
const args = process.argv.slice(2);

const seo = spawnSync(process.execPath, [join(here, 'generate-seo-files.mjs'), ...args], {
  cwd: webRoot,
  stdio: 'inherit'
});
if ((seo.status ?? 1) !== 0) process.exit(seo.status ?? 1);

const ngCli = join(webRoot, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const build = spawnSync(process.execPath, [ngCli, 'build', ...args], { cwd: webRoot, stdio: 'inherit' });
if ((build.status ?? 1) !== 0) process.exit(build.status ?? 1);

// `/` is client-rendered (never prerendered), so Angular emits the client shell as index.csr.html.
// Also provide it as index.html for hosts that expect that name; nginx.conf falls back to index.csr.html.
const browserDir = join(webRoot, 'dist', 'web', 'browser');
const csr = join(browserDir, 'index.csr.html');
const index = join(browserDir, 'index.html');
if (existsSync(csr) && !existsSync(index)) {
  copyFileSync(csr, index);
  console.log('Copied index.csr.html -> index.html (client shell).');
}
