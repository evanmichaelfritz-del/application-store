/**
 * Rebuild public/parity bundles from the card mounts.
 * legal comments stay inline, then the package MIT text and the React
 * LICENSE are prepended. react-dom's LICENSE is added only when it differs.
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
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
    header: licenseHeader('liquid-gooey'),
  },
  {
    entry: 'src/demos/drag-drop/mount.tsx',
    outfile: 'public/parity/drag-drop-physics.js',
    header: block(readFileSync(join(root, 'node_modules/react/LICENSE'), 'utf8'), false),
  },
];

for (const target of targets) {
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
  });
  const js = result.outputFiles[0].text;
  writeFileSync(join(root, target.outfile), target.header + js);
  process.stdout.write(`${target.outfile} ${target.header.length + js.length}\n`);
}
