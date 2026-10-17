/**
 * Fail the build when a generated prompt still contains the off-scope boilerplate.
 * Missing States / Gotchas / Setup / Checklist sections are printed and do not fail:
 * those fields stay empty until a later asset PR fills them.
 *
 * A prompt that is byte-identical to a file under src/demos or public/prompts is
 * hand-written. Banned words in that file do not fail this check.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(tmpdir(), 'generated-prompts.mjs');

function stubTsx(source) {
  const names = new Set();
  for (const match of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of source.matchAll(/export\s+(?:const|let|var|class)\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1].split(',')) {
      const bits = part.trim().split(/\s+as\s+/);
      const name = (bits[1] ?? bits[0] ?? '').trim();
      if (/^[A-Za-z0-9_]+$/.test(name)) names.add(name);
    }
  }
  const lines = ['function __stub() { return null; }'];
  for (const name of names) lines.push(`export const ${name} = __stub;`);
  lines.push('export default __stub;');
  return lines.join('\n');
}

await esbuild.build({
  entryPoints: [join(root, 'scripts/load-generated-prompts.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  absWorkingDir: root,
  alias: { '@': root },
  logLevel: 'silent',
  plugins: [
    {
      name: 'prompt-check',
      setup(build) {
        build.onResolve({ filter: /^\.\/skia\// }, (args) => {
          if (args.importer.endsWith(`${join('src', 'catalog.ts')}`)) {
            return { path: args.path, namespace: 'prompt-empty' };
          }
          return null;
        });
        build.onLoad({ filter: /.*/, namespace: 'prompt-empty' }, () => ({
          contents: 'export function ensureCanvasKit() { return Promise.resolve(); }\nexport default {};\n',
          loader: 'js',
        }));
        build.onLoad({ filter: /\.tsx$/ }, (args) => ({
          contents: stubTsx(readFileSync(args.path, 'utf8')),
          loader: 'js',
        }));
        build.onLoad({ filter: /\.(html|md)$/ }, (args) => ({
          contents: `export default ${JSON.stringify(readFileSync(args.path, 'utf8'))};\n`,
          loader: 'js',
        }));
      },
    },
  ],
});

const loaded = await import(pathToFileURL(outfile).href);
const generatedPrompts = loaded.generatedPrompts();

/** Word characters plus a hyphen, so Helixes and SHA-256 are not Helix or SHA. */
function bannedPhrase(label) {
  const body = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { label, pattern: new RegExp(`(?<![A-Za-z0-9_-])${body}(?![A-Za-z0-9_-])`, 'gi') };
}

const BANNED = [
  bannedPhrase('Helix'),
  bannedPhrase('grok.me'),
  bannedPhrase('peptide'),
  bannedPhrase('Publish product code'),
  bannedPhrase('Card chrome'),
  bannedPhrase('SHA'),
  bannedPhrase('Application Store'),
  bannedPhrase('rebuild brief for this Application Store piece'),
  bannedPhrase('The three copy buttons'),
  bannedPhrase('Use the live Application Store showcase as the stage content'),
  bannedPhrase('Card copy buttons'),
  bannedPhrase('load it in Application Store'),
  bannedPhrase('Do not recreate the whole Application Store'),
  { label: 'categories field', pattern: /^\s*-\s*categories:/gim },
  { label: 'sections field', pattern: /^\s*-\s*sections:/gim },
  { label: 'pro field', pattern: /^\s*-\s*pro:/gim },
];

const SECTIONS = [
  { label: 'States', pattern: /^## States\b/m },
  { label: 'Gotchas', pattern: /^## Gotchas\b/m },
  { label: 'Setup', pattern: /^## Setup\b/m },
  { label: 'Checklist', pattern: /^## (Acceptance )?checklist\b/im },
];

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (name.endsWith('.md')) acc.push(path);
  }
}

const handwritten = new Set();
for (const dir of [join(root, 'src/demos'), join(root, 'public/prompts')]) {
  const files = [];
  walk(dir, files);
  for (const file of files) handwritten.add(readFileSync(file, 'utf8'));
}

const publicPrompt = {
  'yogesh-thinking-orbs': readFileSync(join(root, 'public/prompts/yogesh-thinking-orbs.md'), 'utf8'),
  'yogesh-orb-creator': readFileSync(join(root, 'public/prompts/yogesh-orb-creator.md'), 'utf8'),
  'border-beam': readFileSync(join(root, 'public/prompts/border-beam.md'), 'utf8'),
  'liquid-metal': readFileSync(join(root, 'public/prompts/liquid-metal.md'), 'utf8'),
  gooey: readFileSync(join(root, 'public/prompts/gooey.md'), 'utf8'),
  'drag-drop-physics': readFileSync(join(root, 'public/prompts/drag-drop-physics.md'), 'utf8'),
};

function missingSections(text) {
  return SECTIONS.filter((section) => !section.pattern.test(text)).map((section) => section.label);
}

const hits = [];
const warnings = [];
const skipped = [];

for (const item of generatedPrompts) {
  const generated = item.prompt;
  const text = generated || publicPrompt[item.id] || '';
  if (!text) {
    warnings.push(`${item.id}: no prompt text`);
    continue;
  }
  const hand = !generated || handwritten.has(generated);
  if (hand) skipped.push(item.id);
  else {
    for (const ban of BANNED) {
      ban.pattern.lastIndex = 0;
      if (ban.pattern.test(text)) hits.push(`${item.id}: ${ban.label}`);
    }
  }
  const missing = missingSections(text);
  if (missing.length) warnings.push(`${item.id}: ${missing.join(', ')}`);
}

if (skipped.length) {
  console.log(`hand-written prompts skipped for banned words: ${skipped.join(', ')}`);
}
if (warnings.length) {
  console.log('missing sections (warning):');
  for (const line of warnings) console.log(`  ${line}`);
} else {
  console.log('missing sections (warning): none');
}
console.log(`banned hits: ${hits.length}`);
if (hits.length) {
  for (const line of hits) console.error(`  ${line}`);
  process.exit(1);
}

/**
 * A prompt that pastes package source under ## Component must carry that
 * package's LICENSE (and NOTICE, when the package ships one) above the code
 * fence. The frozen creator, orbs, and Abrar prompts are exempt so this rule
 * never requires editing them.
 */
const FROZEN_PROMPTS = new Set([
  join(root, 'public/prompts/yogesh-orb-creator.md'),
  join(root, 'public/prompts/yogesh-thinking-orbs.md'),
  join(root, 'src/demos/abrar-overview/AGENT_PROMPT.md'),
]);

const PACKAGE_SOURCE = [
  { file: join(root, 'public/prompts/gooey.md'), pkg: 'liquid-gooey', notice: false },
  { file: join(root, 'public/prompts/border-beam.md'), pkg: 'border-beam', notice: false },
  { file: join(root, 'public/prompts/liquid-metal.md'), pkg: 'metal-fx', notice: true },
  { file: join(root, 'public/prompts/drag-drop-physics.md'), pkg: 'react', notice: false },
];

function packageSourceIndex(text) {
  const heading = text.search(/^## Component\b/m);
  if (heading < 0) return -1;
  const fence = text.slice(heading).search(/```(?:js|javascript)\n/);
  if (fence < 0) return -1;
  return heading + fence;
}

const licenseHits = [];
const mapped = new Set(PACKAGE_SOURCE.map((item) => item.file));
const promptFiles = [];
walk(join(root, 'public/prompts'), promptFiles);
walk(join(root, 'src/demos'), promptFiles);

for (const file of promptFiles) {
  if (FROZEN_PROMPTS.has(file)) continue;
  const text = readFileSync(file, 'utf8');
  if (packageSourceIndex(text) < 0) continue;
  if (!mapped.has(file)) licenseHits.push(`${file}: embeds package source without a LICENSE mapping`);
}

for (const item of PACKAGE_SOURCE) {
  const text = readFileSync(item.file, 'utf8');
  const start = packageSourceIndex(text);
  if (start < 0) {
    licenseHits.push(`${item.file}: ## Component is missing its js block`);
    continue;
  }
  const before = text.slice(0, start);
  const license = readFileSync(join(root, 'node_modules', item.pkg, 'LICENSE'), 'utf8');
  if (!before.includes(license)) licenseHits.push(`${item.file}: LICENSE for ${item.pkg} is missing above the code block`);
  if (item.notice) {
    const notice = readFileSync(join(root, 'node_modules', item.pkg, 'NOTICE'), 'utf8');
    if (!before.includes(notice)) licenseHits.push(`${item.file}: NOTICE for ${item.pkg} is missing above the code block`);
  }
}

console.log(`license hits: ${licenseHits.length}`);
if (licenseHits.length) {
  for (const line of licenseHits) console.error(`  ${line}`);
  process.exit(1);
}
