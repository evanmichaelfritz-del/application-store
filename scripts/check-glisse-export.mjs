/**
 * The exported card chunk must carry Kelvin Zhang's MIT text.
 * Run after `expo export`. Finds the JS file that contains `lg-tab-bar`.
 *
 *   node scripts/check-glisse-export.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Metro chunks only. public/parity/glisse.js is copied into dist and is not the card chunk.
const dist = join(root, 'dist', '_expo');
const LICENSE = readFileSync(join(root, 'src/demos/glisse/vendor/LICENSE'), 'utf8')
  .replace(/\r\n/g, '\n')
  .trim();

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
    console.error(`glisse export: cannot read ${dir}`);
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
  if (text.includes('lg-tab-bar')) chunks.push({ file, text });
}
if (chunks.length === 0) {
  console.error('glisse export: no JS chunk contains lg-tab-bar');
  process.exit(1);
}
let failed = false;
for (const chunk of chunks) {
  const rel = chunk.file.slice(root.length + 1);
  if (!carriesLicense(chunk.text, LICENSE)) {
    failed = true;
    console.error(`${rel} is missing the full LICENSE block`);
  } else {
    console.log(`${rel} ${Buffer.byteLength(chunk.text)} carries the MIT text`);
  }
}
if (failed) process.exit(1);

const html = readFileSync(join(root, 'dist', 'index.html'), 'utf8');
const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((match) => match[1]);
const entrySrc = srcs.find((src) => /\/index-[^/]+\.js$/.test(src));
if (!entrySrc) {
  console.error('glisse export: dist/index.html has no entry bundle');
  process.exit(1);
}
const entryPath = join(root, 'dist', entrySrc.replace(/^\//, ''));
const entry = readFileSync(entryPath, 'utf8');
const reactLicenses = entry.split('@license React').length - 1;
console.log(`${entryPath.slice(root.length + 1)} @license React ${reactLicenses}`);
if (!entry.includes('@license React')) {
  console.error('glisse export: entry bundle is missing @license React');
  process.exit(1);
}
