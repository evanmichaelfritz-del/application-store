/**
 * The exported card chunk must carry Dominik Scholz's MIT text.
 * Run after `expo export`. Finds the JS file under dist/_expo that contains
 * `oba-avatar-host`. public/parity/open-bot-avatar.js is copied into dist and
 * is not that chunk.
 *
 *   node scripts/check-open-bot-avatar-export.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', '_expo');
const MARKER = 'oba-avatar-host';
const LICENSE = readFileSync(join(root, 'src/demos/open-bot-avatar/vendor/LICENSE'), 'utf8')
  .replace(/\r\n/g, '\n')
  .trim();
const PIN = '646793af2c86604539e02faa344e9793ab2aefe8';

function carriesLicense(text, license) {
  if (text.includes(license)) return true;
  const escaped = license.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return text.includes(escaped);
}

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (error) {
    console.error(`open-bot-avatar export: cannot read ${dir}`);
    process.exit(1);
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (name.endsWith('.js')) acc.push(path);
  }
}

const files = [];
walk(dist, files);
const chunks = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (text.includes(MARKER)) chunks.push({ file, text });
}
if (chunks.length === 0) {
  console.error(`open-bot-avatar export: no JS chunk contains ${MARKER}`);
  process.exit(1);
}
let failed = false;
for (const chunk of chunks) {
  const missing = [];
  if (!carriesLicense(chunk.text, LICENSE)) missing.push('the full LICENSE block');
  if (!chunk.text.includes(PIN)) missing.push(PIN);
  const rel = chunk.file.slice(root.length + 1);
  if (missing.length) {
    failed = true;
    console.error(`${rel} is missing ${missing.join(' | ')}`);
  } else {
    console.log(`${rel} ${Buffer.byteLength(chunk.text)} carries the MIT text`);
  }
}
if (failed) process.exit(1);

const html = readFileSync(join(root, 'dist', 'index.html'), 'utf8');
const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((match) => match[1]);
const entrySrc = srcs.find((src) => /\/index-[^/]+\.js$/.test(src));
if (!entrySrc) {
  console.error('open-bot-avatar export: dist/index.html has no entry bundle');
  process.exit(1);
}
const entryPath = join(root, 'dist', entrySrc.replace(/^\//, ''));
const entry = readFileSync(entryPath, 'utf8');
const reactLicenses = entry.split('@license React').length - 1;
console.log(`${entryPath.slice(root.length + 1)} @license React ${reactLicenses}`);
if (!entry.includes('@license React')) {
  console.error('open-bot-avatar export: entry bundle is missing @license React');
  process.exit(1);
}
