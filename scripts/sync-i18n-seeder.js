const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const fallbackTs = path.join(repoRoot, 'apps/web/src/app/core/i18n/en-fallback.ts');

const json = execFileSync('npx', ['tsx', 'scripts/export-en-fallback.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  shell: true
});

const obj = JSON.parse(json);
const entries = Object.entries(obj)
  .map(([k, v]) => `        ["${k}"] = ${JSON.stringify(v)},`)
  .join('\n');

const seederPath = path.join(repoRoot, 'services/learning-api/Seed/TranslationSeeder.cs');
let s = fs.readFileSync(seederPath, 'utf8');
const marker = 'public static readonly IReadOnlyDictionary<string, string> English = new Dictionary<string, string>';
const start = s.indexOf(marker);
if (start < 0) {
  console.error('no English dict');
  process.exit(1);
}
const brace = s.indexOf('{', start);
let depth = 0;
let end = -1;
for (let i = brace; i < s.length; i++) {
  if (s[i] === '{') depth++;
  else if (s[i] === '}') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
const newDict = marker + '\n    {\n' + entries + '\n    }';
s = s.slice(0, start) + newDict + s.slice(end + 1);
fs.writeFileSync(seederPath, s);
console.log('synced', Object.keys(obj).length, 'keys');
