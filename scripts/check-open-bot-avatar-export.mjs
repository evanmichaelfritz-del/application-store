/**
 * The exported card chunk must carry Dominik Scholz's MIT text.
 * The exported Copy and its prompt must carry that text once, with the pin
 * after it. Run after `expo export`. The card chunk is the JS file under
 * dist/_expo that contains `oba-avatar-host`. public/parity/open-bot-avatar.js
 * is copied into dist/parity and is not that chunk.
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

function blockCount(text, block) {
  let count = 0;
  let at = 0;
  while (true) {
    const next = text.indexOf(block, at);
    if (next < 0) return count;
    count += 1;
    at = next + block.length;
  }
}

function licenseCopies(text, license) {
  const escaped = license.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return blockCount(text, license) + blockCount(text, escaped);
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
  const copies = licenseCopies(chunk.text, LICENSE);
  const rel = chunk.file.slice(root.length + 1);
  if (copies !== 1 || !chunk.text.includes(PIN)) {
    failed = true;
    console.error(`${rel} has ${copies} full LICENSE blocks`);
  } else {
    console.log(`${rel} ${Buffer.byteLength(chunk.text)} carries one MIT block`);
  }
}
if (failed) process.exit(1);

const followed = `${LICENSE}\n\n${PIN}`;
const copyFiles = [
  ['dist/parity/open-bot-avatar.html', join(root, 'dist', 'parity', 'open-bot-avatar.html')],
  ['dist/parity/open-bot-avatar.js', join(root, 'dist', 'parity', 'open-bot-avatar.js')],
  ['dist/prompts/open-bot-avatar.md', join(root, 'dist', 'prompts', 'open-bot-avatar.md')],
];

function codeSection(markdown) {
  const heading = '\n## Code\n';
  const at = markdown.indexOf(heading);
  if (at < 0) return null;
  const body = markdown.slice(at + heading.length);
  const open = body.indexOf('```html\n');
  if (open < 0) return null;
  const start = open + '```html\n'.length;
  const close = body.indexOf('\n```', start);
  if (close < 0) return null;
  return body.slice(start, close);
}

for (const [label, path] of copyFiles) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    failed = true;
    console.error(`open-bot-avatar export: cannot read ${label}`);
    continue;
  }
  if (label.endsWith('.md')) {
    const section = codeSection(text);
    if (section === null) {
      failed = true;
      console.error(`${label} Code section is missing`);
      continue;
    }
    text = section;
  }
  const copies = blockCount(text, followed);
  if (copies !== 1) {
    failed = true;
    console.error(`${label} has ${copies} full LICENSE blocks followed by ${PIN}`);
  } else {
    console.log(`${label} carries one MIT block`);
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
