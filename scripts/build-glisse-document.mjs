/**
 * Bundle the Glisse card into one offline document and the parity script.
 * No sourcemap and no absolute path. The MIT text is an esbuild banner in
 * glisse.js, in the HTML that embeds that script, and in the card chunk.
 *
 *   node scripts/build-glisse-document.mjs
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

const GLISSE_POST = exportedString('src/demos/glisse/links.ts', 'GLISSE_POST');
const GLISSE_REPO = exportedString('src/demos/glisse/links.ts', 'GLISSE_REPO');
const GLISSE_SITE = exportedString('src/demos/glisse/links.ts', 'GLISSE_SITE');
const CARD_CSS = exportedTemplate('src/demos/glisse/cardCss.ts', 'CARD_CSS');
const vendor = join(root, 'src/demos/glisse/vendor');
const cssPath = join(vendor, 'styles.css');
const css = readFileSync(cssPath, 'utf8');
writeFileSync(
  `${cssPath}.inline.ts`,
  `/* Generated from styles.css for the Metro ?inline import. */\nexport default ${JSON.stringify(css)};\n`,
);

const licenseFile = readFileSync(join(vendor, 'LICENSE'), 'utf8').replace(/\r\n/g, '\n');
const license = licenseFile.trim();
const PERMISSION = 'Permission is hereby granted, free of charge';
const AS_IS = 'THE SOFTWARE IS PROVIDED "AS IS"';
if (!license.includes('Copyright (c) 2026 Kelvin Zhang')) {
  throw new Error('vendor LICENSE is missing Kelvin Zhang');
}
if (license.includes('*/')) throw new Error('vendor LICENSE cannot sit in a block comment');

const licenseBanner = `/*!\n${license}\n*/\n`;
writeFileSync(
  join(root, 'src/demos/glisse/shippedLicense.ts'),
  `/*!\n@license\n${license}\n*/\nexport const SHIPPED_LICENSE = ${JSON.stringify(license)};\n`,
);

const outfile = join(root, 'public/parity/glisse.js');
mkdirSync(dirname(outfile), { recursive: true });

await esbuild.build({
  entryPoints: [join(root, 'src/demos/glisse/mount.tsx')],
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
  plugins: [
    {
      name: 'css-inline',
      setup(build) {
        build.onResolve({ filter: /\.css\?inline$/ }, (args) => ({
          path: join(args.resolveDir, args.path.replace(/\?inline$/, '')),
          namespace: 'css-inline',
        }));
        build.onLoad({ filter: /.*/, namespace: 'css-inline' }, (args) => ({
          contents: `export default ${JSON.stringify(readFileSync(args.path, 'utf8'))};\n`,
          loader: 'js',
        }));
      },
    },
  ],
});

const script = readFileSync(outfile, 'utf8');
if (script.includes('sourceMappingURL') || script.includes('/agent/') || script.includes(root)) {
  throw new Error('glisse bundle has a sourcemap or an absolute path');
}

const credit = `<p class="glisse-credit">Kelvin Zhang (<a href="${GLISSE_POST}" target="_blank" rel="noopener noreferrer">@kelvinzhg</a>) · <a href="${GLISSE_REPO}" target="_blank" rel="noopener noreferrer">github.com/0kzh/glisse</a> · <a href="${GLISSE_SITE}" target="_blank" rel="noopener noreferrer">glisse.kelvinzhang.com</a></p>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Glisse</title>
<!--
${license}
-->
<style>
${CARD_CSS}
html, body { margin: 0; height: 100%; background: #0c0c0c; }
body { display: flex; justify-content: center; }
#glisse-frame { position: relative; width: 974px; height: 640px; flex: none; }
#glisse-root { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="glisse-frame">
<div id="glisse-root"></div>
${credit}
</div>
<script>
${script}
</script>
</body>
</html>
`;

const cardDir = mkdtempSync(join(tmpdir(), 'glisse-card-'));
const cardOut = join(cardDir, 'glisse-card.js');
await esbuild.build({
  entryPoints: [join(root, 'src/demos/glisse/card.web.tsx')],
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
  logLevel: 'silent',
  external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  plugins: [
    {
      name: 'css-inline',
      setup(build) {
        build.onResolve({ filter: /\.css\?inline$/ }, (args) => ({
          path: join(args.resolveDir, args.path.replace(/\?inline$/, '')),
          namespace: 'css-inline',
        }));
        build.onLoad({ filter: /.*/, namespace: 'css-inline' }, (args) => ({
          contents: `export default ${JSON.stringify(readFileSync(args.path, 'utf8'))};\n`,
          loader: 'js',
        }));
      },
    },
  ],
});
const cardChunk = readFileSync(cardOut, 'utf8');
if (cardChunk.includes('sourceMappingURL') || cardChunk.includes('/agent/') || cardChunk.includes(root)) {
  throw new Error('glisse card chunk has a sourcemap or an absolute path');
}

function requireLicense(label, text) {
  if (!text.includes(license) || !text.includes(PERMISSION) || !text.includes(AS_IS)) {
    throw new Error(`${label} is missing the MIT licence`);
  }
}
requireLicense('public/parity/glisse.js', script);
requireLicense('public/parity/glisse.html', html);
requireLicense('glisse card chunk', cardChunk);
rmSync(cardDir, { recursive: true, force: true });

writeFileSync(join(root, 'public/parity/glisse.html'), html);
const promptPath = join(root, 'public/prompts/glisse.md');
const prompt = readFileSync(promptPath, 'utf8');
const codeHeading = '\n## Code\n';
const codeAt = prompt.indexOf(codeHeading);
if (codeAt < 0) throw new Error('glisse.md is missing ## Code');
const nextPrompt = `${prompt.slice(0, codeAt + codeHeading.length)}\n\`\`\`html\n${html}\n\`\`\`\n`;
const fenced = nextPrompt.match(/```html\n([\s\S]*?)\n```/);
if (!fenced || fenced[1] !== html) throw new Error('glisse.md Code fence is not the Copy');
writeFileSync(promptPath, nextPrompt);

console.log(`public/parity/glisse.html ${Buffer.byteLength(html)}`);
console.log(`public/parity/glisse.js ${Buffer.byteLength(script)}`);
console.log(`glisse card chunk ${Buffer.byteLength(cardChunk)}`);
