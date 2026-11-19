/**
 * Bundle the vendored Glisse card into one offline document.
 * No sourcemap and no absolute path. The MIT text is the HTML comment.
 *
 *   node scripts/build-glisse-document.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const GLISSE_PIN = exportedString('src/demos/glisse/links.ts', 'GLISSE_PIN');
const CARD_CSS = exportedTemplate('src/demos/glisse/cardCss.ts', 'CARD_CSS');
const vendor = join(root, 'src/demos/glisse/vendor');
const cssPath = join(vendor, 'styles.css');
const css = readFileSync(cssPath, 'utf8');
writeFileSync(
  `${cssPath}.inline.ts`,
  `/* Generated from styles.css for the Metro ?inline import. */\nexport default ${JSON.stringify(css)};\n`,
);

const licenseFile = readFileSync(join(vendor, 'LICENSE'), 'utf8');
const licenseAt = licenseFile.indexOf('MIT License');
if (licenseAt < 0) throw new Error('vendor LICENSE is missing the MIT text');
const license = licenseFile.slice(licenseAt).trim();
if (!license.includes('Copyright (c) 2026 Kelvin Zhang')) {
  throw new Error('vendor LICENSE is missing Kelvin Zhang');
}

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

Upstream: https://github.com/0kzh/glisse
Pinned at ${GLISSE_PIN}
-->
<style>
${CARD_CSS}
html, body { margin: 0; background: #0c0c0c; }
body { position: relative; width: 100%; height: 640px; overflow: hidden; }
#glisse-root { height: 640px; }
</style>
</head>
<body>
<div id="glisse-root"></div>
${credit}
<script>
${script}
</script>
</body>
</html>
`;

if (!html.includes(license)) throw new Error('document dropped the MIT text');
writeFileSync(join(root, 'public/parity/glisse.html'), html);
const bytes = Buffer.byteLength(html);
console.log(`public/parity/glisse.html ${bytes}`);
console.log(`public/parity/glisse.js ${Buffer.byteLength(script)}`);
