/**
 * Bundle the Open Bot Avatar card into one offline document and the parity script.
 * No sourcemap and no absolute path. The MIT text is an esbuild banner in
 * open-bot-avatar.js, in the HTML that embeds that script, and in the card chunk.
 *
 *   node scripts/build-open-bot-avatar-document.mjs
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function exportedString(file, name) {
  const source = readFileSync(join(root, file), 'utf8');
  const match = source.match(new RegExp(`export const ${name} = '([^']*)'`));
  if (!match) throw new Error(`${file} is missing ${name}`);
  return match[1];
}

function exportedTemplate(file, name) {
  const source = readFileSync(join(root, file), 'utf8');
  const marker = `export const ${name} = \``;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`${file} is missing ${name}`);
  const body = source.slice(start + marker.length);
  const end = body.lastIndexOf('`;');
  if (end < 0) throw new Error(`${name} template did not close`);
  return body.slice(0, end);
}

const OBA_POST = exportedString('src/demos/open-bot-avatar/links.ts', 'OBA_POST');
const OBA_PROFILE = exportedString('src/demos/open-bot-avatar/links.ts', 'OBA_PROFILE');
const OBA_REPO = exportedString('src/demos/open-bot-avatar/links.ts', 'OBA_REPO');
const OBA_SITE = exportedString('src/demos/open-bot-avatar/links.ts', 'OBA_SITE');
const CARD_CSS = exportedTemplate('src/demos/open-bot-avatar/cardCss.ts', 'CARD_CSS');

const licenseFile = readFileSync(join(root, 'src/demos/open-bot-avatar/vendor/LICENSE'), 'utf8').replace(/\r\n/g, '\n');
const license = licenseFile.trim();
const PERMISSION = 'Permission is hereby granted, free of charge';
const AS_IS = 'THE SOFTWARE IS PROVIDED "AS IS"';
const COPYRIGHT = 'Copyright (c) 2026 Dominik Scholz';
if (!license.includes(COPYRIGHT)) throw new Error('vendor LICENSE is missing Dominik Scholz');
if (!license.includes(PERMISSION) || !license.includes(AS_IS)) throw new Error('vendor LICENSE lost the MIT grant');
if (license.includes('*/')) throw new Error('vendor LICENSE cannot sit in a block comment');

const PIN = '646793af2c86604539e02faa344e9793ab2aefe8';
const shipped = `${license}\n\n${PIN}`;
const licenseBanner = `/*!\n${shipped}\n*/\n`;
writeFileSync(
  join(root, 'src/demos/open-bot-avatar/shippedLicense.ts'),
  `/*!\n@license\n${shipped}\n*/\nexport const SHIPPED_LICENSE = ${JSON.stringify(shipped)};\n`,
);

const outfile = join(root, 'public/parity/open-bot-avatar.js');
mkdirSync(dirname(outfile), { recursive: true });

await esbuild.build({
  entryPoints: [join(root, 'src/demos/open-bot-avatar/mount.tsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  outfile,
  absWorkingDir: root,
  jsx: 'automatic',
  minify: true,
  legalComments: 'none',
  sourcemap: false,
  banner: { js: licenseBanner },
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'silent',
});

const script = readFileSync(outfile, 'utf8');
if (script.includes('sourceMappingURL') || script.includes('/agent/') || script.includes(root)) {
  throw new Error('open-bot-avatar bundle has a sourcemap or an absolute path');
}

const credit = `<p class="oba-credit"><a href="${OBA_PROFILE}" target="_blank" rel="noopener noreferrer">Dominik Scholz</a> (<a href="${OBA_PROFILE}" target="_blank" rel="noopener noreferrer">@dom_scholz</a>) · <a href="${OBA_POST}" target="_blank" rel="noopener noreferrer">post</a> · <a href="${OBA_REPO}" target="_blank" rel="noopener noreferrer">repo</a> · <a href="${OBA_SITE}" target="_blank" rel="noopener noreferrer">site</a></p>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Open Bot Avatar</title>
<style>
${CARD_CSS}
html, body { margin: 0; height: 100%; background: #f3f3f4; }
body { display: flex; justify-content: center; align-items: center; }
#oba-frame { position: relative; width: 960px; height: 720px; flex: none; }
#oba-root { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="oba-frame">
<div id="oba-root"></div>
${credit}
</div>
<script>
${script}
</script>
</body>
</html>
`;

const cardDir = mkdtempSync(join(tmpdir(), 'oba-card-'));
const cardOut = join(cardDir, 'oba-card.js');
await esbuild.build({
  entryPoints: [join(root, 'src/demos/open-bot-avatar/card.web.tsx')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: cardOut,
  absWorkingDir: root,
  jsx: 'automatic',
  minify: true,
  legalComments: 'none',
  sourcemap: false,
  banner: { js: licenseBanner },
  define: { 'process.env.NODE_ENV': '"production"' },
  external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  logLevel: 'silent',
});
const cardChunk = readFileSync(cardOut, 'utf8');
if (cardChunk.includes('sourceMappingURL') || cardChunk.includes('/agent/') || cardChunk.includes(root)) {
  throw new Error('open-bot-avatar card chunk has a sourcemap or an absolute path');
}

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

function licenseCopies(text) {
  const escaped = license.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return blockCount(text, license) + blockCount(text, escaped);
}

function requireOneLicense(label, text) {
  const copies = licenseCopies(text);
  if (copies !== 1 || !text.includes(PIN)) {
    throw new Error(`${label} has ${copies} MIT licence blocks`);
  }
}
requireOneLicense('public/parity/open-bot-avatar.js', script);
requireOneLicense('public/parity/open-bot-avatar.html', html);
if (!cardChunk.includes(license) || !cardChunk.includes(PIN)) {
  throw new Error('open-bot-avatar card chunk is missing the MIT licence');
}
rmSync(cardDir, { recursive: true, force: true });

writeFileSync(join(root, 'public/parity/open-bot-avatar.html'), html);
const promptPath = join(root, 'public/prompts/open-bot-avatar.md');
const prompt = readFileSync(promptPath, 'utf8');
const codeHeading = '\n## Code\n';
const codeAt = prompt.indexOf(codeHeading);
if (codeAt < 0) throw new Error('open-bot-avatar.md is missing ## Code');
const nextPrompt = `${prompt.slice(0, codeAt + codeHeading.length)}\n\`\`\`html\n${html}\n\`\`\`\n`;
const fenced = nextPrompt.match(/```html\n([\s\S]*?)\n```/);
if (!fenced || fenced[1] !== html) throw new Error('open-bot-avatar.md Code fence is not the Copy');
writeFileSync(promptPath, nextPrompt);

console.log(`public/parity/open-bot-avatar.html ${Buffer.byteLength(html)}`);
console.log(`public/parity/open-bot-avatar.js ${Buffer.byteLength(script)}`);
console.log(`open-bot-avatar card chunk ${Buffer.byteLength(cardChunk)}`);
