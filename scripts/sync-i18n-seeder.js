const fs = require('fs');
const p = 'apps/web/src/app/core/i18n/en-fallback.ts';
const t = fs.readFileSync(p, 'utf8');
const m = t.match(/export const EN_FALLBACK[^=]*=\s*(\{[\s\S]*?\n\});/);
if (!m) {
  console.error('no match');
  process.exit(1);
}
const obj = Function('return (' + m[1] + ')')();
const entries = Object.entries(obj)
  .map(([k, v]) => `        ["${k}"] = ${JSON.stringify(v)},`)
  .join('\n');
const seederPath = 'services/learning-api/Seed/TranslationSeeder.cs';
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
const newDict =
  marker +
  '\n    {\n' +
  entries +
  '\n    }';
s = s.slice(0, start) + newDict + s.slice(end + 1);
fs.writeFileSync(seederPath, s);
console.log('synced', Object.keys(obj).length, 'keys');
