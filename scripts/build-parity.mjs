/**
 * Rebuild public/parity bundles from the card mounts.
 * legal comments stay inline, then the package MIT text and the React
 * LICENSE are prepended. react-dom's LICENSE is added only when it differs.
 */
import { build } from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function block(text, leadingNewline) {
  if (text.includes('*/')) throw new Error('licence text contains */');
  const body = text.endsWith('\n') ? text : `${text}\n`;
  return leadingNewline ? `/*!\n${body}*/\n` : `/*!${body}*/\n`;
}

function licenseHeader(packageDir, notice) {
  const packageLicense = readFileSync(join(root, 'node_modules', packageDir, 'LICENSE'), 'utf8');
  const reactLicense = readFileSync(join(root, 'node_modules/react/LICENSE'), 'utf8');
  const reactDomLicense = readFileSync(join(root, 'node_modules/react-dom/LICENSE'), 'utf8');
  let header = block(packageLicense, false);
  header += block(reactLicense, false);
  if (reactDomLicense !== reactLicense) header += block(reactDomLicense, false);
  if (notice) header += block(readFileSync(join(root, 'node_modules', packageDir, notice), 'utf8'), true);
  return header;
}

function licensePath(dir) {
  for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md']) {
    const path = join(dir, name);
    if (existsSync(path)) return path;
  }
  // @react-native/normalize-colors ships no licence file. Its source header
  // points at the React Native repo root LICENSE, which is this file.
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const repo = typeof pkg.repository === 'string' ? pkg.repository : (pkg.repository?.url ?? '');
  if (repo.includes('github.com/react/react-native') || repo.includes('github.com/facebook/react-native')) {
    const shared = join(root, 'node_modules/react-native/LICENSE');
    if (existsSync(shared)) return shared;
  }
  return null;
}

/** Every node_modules package in an esbuild metafile, in a stable order. */
function packagesFromMeta(meta) {
  const dirs = new Map();
  for (const input of Object.keys(meta.inputs)) {
    const normalized = input.split('\\').join('/');
    const marker = 'node_modules/';
    const at = normalized.lastIndexOf(marker);
    if (at < 0) continue;
    const parts = normalized.slice(at + marker.length).split('/');
    const name = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
    if (!name || dirs.has(name)) continue;
    dirs.set(name, join(root, 'node_modules', name));
  }
  return [...dirs.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

/** Verbatim licence block for every bundled package. Throws when one is missing. */
function headerFromMeta(meta) {
  const packages = packagesFromMeta(meta);
  if (packages.length === 0) throw new Error('metafile listed no bundled packages');
  let header = '';
  const names = [];
  for (const [name, dir] of packages) {
    const file = licensePath(dir);
    if (!file) throw new Error(`bundled package ${name} has no LICENSE header`);
    const text = readFileSync(file, 'utf8');
    header += block(text, false);
    if (!header.includes(text)) throw new Error(`bundled package ${name} licence was not written into the header`);
    const notice = join(dir, 'NOTICE');
    if (existsSync(notice)) header += block(readFileSync(notice, 'utf8'), true);
    names.push(name);
  }
  return { header, names };
}

const targets = [
  {
    entry: 'src/demos/border-beam/mount.tsx',
    outfile: 'public/parity/border-beam.js',
    header: licenseHeader('border-beam'),
  },
  {
    entry: 'src/demos/liquid-metal/mount.tsx',
    outfile: 'public/parity/liquid-metal.js',
    header: licenseHeader('metal-fx', 'NOTICE'),
  },
  {
    entry: 'src/demos/gooey/mount.tsx',
    outfile: 'public/parity/gooey.js',
    // Inter is self-hosted for this copy. The woff2 stays under public/fonts;
    // the bundle header carries the full OFL text that ships with that file.
    header: licenseHeader('liquid-gooey') + block(readFileSync(join(root, 'public/fonts/OFL.txt'), 'utf8'), false),
  },
  {
    entry: 'src/demos/drag-drop/mount.tsx',
    outfile: 'public/parity/drag-drop-physics.js',
    header: block(readFileSync(join(root, 'node_modules/react/LICENSE'), 'utf8'), false),
  },
  {
    entry: 'src/demos/spacing-tuner/mount.tsx',
    outfile: 'public/parity/spacing-tuner.js',
    // TODO: the other Copy bundles still use a hand-listed header. Pointing
    // them at headerFromMeta would prepend every transitive licence and change
    // their bytes, so this metafile header stays on spacing-tuner only.
    fromMeta: true,
    alias: { 'react-native': 'react-native-web' },
  },
];

const only = process.argv.slice(2);
const selected = only.length
  ? targets.filter((target) => only.some((name) => target.outfile.includes(name)))
  : targets;
if (selected.length === 0) throw new Error(`no parity target matches ${only.join(', ')}`);

for (const target of selected) {
  const result = await build({
    absWorkingDir: root,
    entryPoints: [target.entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    minify: true,
    legalComments: 'inline',
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
    metafile: Boolean(target.fromMeta),
    ...(target.alias ? { alias: target.alias } : {}),
  });
  let header = target.header ?? '';
  if (target.fromMeta) {
    const built = headerFromMeta(result.metafile);
    header = built.header;
    process.stdout.write(`licences ${built.names.join(', ')}\n`);
  }
  const js = result.outputFiles[0].text;
  writeFileSync(join(root, target.outfile), header + js);
  process.stdout.write(`${target.outfile} ${header.length + js.length}\n`);
}
