#!/usr/bin/env node
/**
 * Rebuild services/learning-api/Seed/challenge-criteria.json from client SPECS.
 * Usage (from apps/web): node scripts/run-export-challenge-criteria.mjs
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '..');
const entry = join(here, 'export-challenge-criteria.mts');
const bundle = join(here, '_export-challenge-criteria.cjs');
const outJson = resolve(webRoot, '../../services/learning-api/Seed/challenge-criteria.json');

const build = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['--yes', 'esbuild', entry, '--bundle', '--platform=node', '--format=cjs', `--outfile=${bundle}`],
  { cwd: webRoot, encoding: 'utf8', shell: process.platform === 'win32' }
);
if ((build.status ?? 1) !== 0) {
  process.stderr.write(build.stderr || build.stdout || 'esbuild failed\n');
  process.exit(build.status ?? 1);
}

const run = spawnSync(process.execPath, [bundle], { cwd: webRoot, encoding: 'utf8' });
if ((run.status ?? 1) !== 0) {
  process.stderr.write(run.stderr || run.stdout || 'export failed\n');
  process.exit(run.status ?? 1);
}

mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, run.stdout, 'utf8');
process.stdout.write(`Wrote ${outJson}\n`);
