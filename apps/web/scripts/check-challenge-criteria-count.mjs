#!/usr/bin/env node
/**
 * Ensures challenge-criteria.json matches a fresh SPECS export.
 * Usage (from apps/web): node scripts/check-challenge-criteria-count.mjs
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '..');
const jsonPath = resolve(webRoot, '../../services/learning-api/Seed/challenge-criteria.json');
const exportScript = join(here, 'run-export-challenge-criteria.mjs');

// Build a temp export to stdout without rewriting the file: reuse esbuild entry directly.
const entry = join(here, 'export-challenge-criteria.mts');
const bundle = join(here, '_check-challenge-criteria.cjs');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const build = spawnSync(
  npx,
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

const fresh = JSON.parse(run.stdout);
const onDisk = JSON.parse(readFileSync(jsonPath, 'utf8'));

if (!Array.isArray(fresh) || !Array.isArray(onDisk)) {
  process.stderr.write('challenge-criteria payload must be an array\n');
  process.exit(1);
}

if (fresh.length !== onDisk.length) {
  process.stderr.write(
    `challenge-criteria.json length ${onDisk.length} != LIVE SPECS export ${fresh.length}. Run: npm run export:challenge-criteria\n`
  );
  process.exit(1);
}

const diskByKey = new Map(onDisk.map((r) => [`${r.moduleSlug}/${r.unitSlug}`, r]));
for (const live of fresh) {
  const key = `${live.moduleSlug}/${live.unitSlug}`;
  const row = diskByKey.get(key);
  if (!row) {
    process.stderr.write(`Missing seed row for ${key}. Run: npm run export:challenge-criteria\n`);
    process.exit(1);
  }
  const liveFp = JSON.stringify(live.criteria.map((c) => ({ type: c.type, paramsJson: c.paramsJson })));
  const diskFp = JSON.stringify(row.criteria.map((c) => ({ type: c.type, paramsJson: c.paramsJson })));
  if (liveFp !== diskFp) {
    process.stderr.write(`Stale criteria for ${key}. Run: npm run export:challenge-criteria\n`);
    process.exit(1);
  }
}

process.stdout.write(`challenge-criteria.json OK (${onDisk.length} units)\n`);
// silence unused
void exportScript;
