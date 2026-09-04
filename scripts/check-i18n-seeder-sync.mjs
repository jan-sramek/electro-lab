#!/usr/bin/env node
/**
 * CI guard: every key AND value in apps/web EN_FALLBACK must match the English dictionary in
 * services/learning-api/Seed/TranslationSeeder.cs (the server copy wins at runtime, so drift
 * silently changes UI copy). Exits non-zero on any difference.
 * Fix drift with: node scripts/sync-i18n-seeder.js (never hand-edit the seeder).
 * Usage (repo root): node scripts/check-i18n-seeder-sync.mjs   |   (apps/web): npm run check:i18n-seeder
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const webRoot = join(repoRoot, 'apps/web');
const fallbackTs = join(webRoot, 'src/app/core/i18n/en-fallback.ts');
const seederPath = join(repoRoot, 'services/learning-api/Seed/TranslationSeeder.cs');

function loadFallback() {
  const require = createRequire(join(webRoot, 'package.json'));
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch {
    process.stderr.write('esbuild not found — run `npm ci` in apps/web first\n');
    process.exit(2);
  }
  const outDir = mkdtempSync(join(tmpdir(), 'i18n-seeder-check-'));
  const bundle = join(outDir, 'en-fallback.cjs');
  try {
    esbuild.buildSync({
      entryPoints: [fallbackTs],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: bundle,
      logLevel: 'error'
    });
    return require(bundle).EN_FALLBACK;
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

function loadSeederEnglish() {
  if (!existsSync(seederPath)) {
    process.stderr.write(`Seeder not found: ${seederPath}\n`);
    process.exit(2);
  }
  const src = readFileSync(seederPath, 'utf8');
  const marker = 'IReadOnlyDictionary<string, string> English = new Dictionary<string, string>';
  const start = src.indexOf(marker);
  if (start < 0) {
    process.stderr.write('English dictionary not found in TranslationSeeder.cs\n');
    process.exit(2);
  }
  const open = src.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) {
      end = i;
      break;
    }
  }
  const body = src.slice(open + 1, end);
  // Entries are emitted by sync-i18n-seeder.js as `["key"] = <JSON string>,` — JSON-compatible escapes.
  const entryRe = /\["((?:[^"\\]|\\.)*)"\]\s*=\s*("(?:[^"\\]|\\.)*")\s*,?/g;
  const dict = {};
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    dict[JSON.parse(`"${m[1]}"`)] = JSON.parse(m[2]);
  }
  return dict;
}

const fallback = loadFallback();
const seeder = loadSeederEnglish();

const problems = [];
for (const [key, value] of Object.entries(fallback)) {
  if (!(key in seeder)) problems.push(`missing in seeder: ${key}`);
  else if (seeder[key] !== value) {
    problems.push(`value differs: ${key}\n    client: ${JSON.stringify(value)}\n    seeder: ${JSON.stringify(seeder[key])}`);
  }
}
for (const key of Object.keys(seeder)) {
  if (!(key in fallback)) problems.push(`missing in EN_FALLBACK: ${key}`);
}

if (problems.length) {
  process.stderr.write(
    `TranslationSeeder.cs is out of sync with EN_FALLBACK (${problems.length} problem(s)):\n  ` +
      problems.slice(0, 40).join('\n  ') +
      (problems.length > 40 ? `\n  ... ${problems.length - 40} more` : '') +
      '\nRun: node scripts/sync-i18n-seeder.js\n'
  );
  process.exit(1);
}
process.stdout.write(`i18n seeder OK (${Object.keys(fallback).length} keys match)\n`);
