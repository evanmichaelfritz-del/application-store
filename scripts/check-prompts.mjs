/**
 * Fail the build when a generated prompt still contains the off-scope boilerplate,
 * or when it lacks a States, Gotchas, Setup, or Checklist section.
 *
 * A prompt that is byte-identical to a file under src/demos or public/prompts is
 * hand-written. Those files stay frozen, so banned words and missing sections in
 * them are printed and do not fail this check.
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
const catalogSkills = loaded.catalogSkills();
const canonicalIds = loaded.CANONICAL_IDS;

/** Word characters plus a hyphen, so Helixes and SHA-256 are not Helix or SHA. */
function bannedPhrase(label) {
  const body = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { label, pattern: new RegExp(`(?<![A-Za-z0-9_-])${body}(?![A-Za-z0-9_-])`, 'gi') };
}

const BANNED = [
  bannedPhrase('Helix'),
  bannedPhrase('grok.me'),
  bannedPhrase('peptide'),
  // The MIT grant says "publish, distribute". That clause is the license text
  // pasted above a bundle, not the store-process word.
  {
    label: 'Publish',
    pattern: /(?<![A-Za-z0-9_-])Publish(?![A-Za-z0-9_-])(?!\s*,\s*distribute)/gi,
  },
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
  'spacing-tuner': readFileSync(join(root, 'public/prompts/spacing-tuner.md'), 'utf8'),
  'image-generation-loader': readFileSync(join(root, 'public/prompts/image-generation-loader.md'), 'utf8'),
};

function missingSections(text) {
  return SECTIONS.filter((section) => !section.pattern.test(text)).map((section) => section.label);
}

/**
 * The 22 generic prompts describe the pasted Copy. The shared brief, repo
 * paths, and "live card" stay on the other generated prompts, which must
 * remain byte-identical, so these bans and the States-literal check apply
 * only here.
 */
const GENERIC_IDS = new Set([
  'card-resize',
  'number-pop-in',
  'notification-badge',
  'text-states-swap',
  'menu-dropdown',
  'confetti-burst',
  'modal-open-close',
  'gooey-plus-menu',
  'page-side-by-side',
  'icon-swap',
  'success-check',
  'avatar-group-hover',
  'card-stack-hover',
  'error-state-shake',
  'input-clear-dissolve',
  'skeleton-reveal',
  'texts-reveal',
  'tabs-sliding',
  'shimmer-text',
  'tooltip-open-close',
  'tilt-3d',
  'preview-tools',
]);

const GENERIC_BANS = [
  bannedPhrase('Closed-network'),
  bannedPhrase('live card'),
  { label: 'src/', pattern: /(?<![A-Za-z0-9_-])src\//gi },
];

function fenceBodies(text, langs) {
  const bodies = [];
  const pattern = new RegExp('```(?:' + langs + ')\\n([\\s\\S]*?)```', 'g');
  for (const match of text.matchAll(pattern)) bodies.push(match[1]);
  return bodies;
}

/** CSS and script the prompt pastes, including style/script inside an HTML document. */
function copyStyleAndScript(text) {
  const parts = [...fenceBodies(text, 'css|js|javascript')];
  for (const html of fenceBodies(text, 'html')) {
    for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) parts.push(match[1]);
    for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) parts.push(match[1]);
  }
  return parts.join('\n');
}

function statesBody(text) {
  const match = text.match(/^## States\b[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  return match ? match[1] : '';
}

/** px, ms, and colour tokens written in States. Longest hex wins so #fff is not a prefix. */
const STATE_VALUE = /(?<![\d.])-?\d+(?:\.\d+)?(?:px|ms)|(?<![#\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

function sectionBody(text, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^## ${escaped}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  return match ? match[1] : '';
}

function valuesMissingFromCopy(body, source) {
  const missing = [];
  const seen = new Set();
  for (const match of body.matchAll(STATE_VALUE)) {
    const token = match[0];
    if (seen.has(token)) continue;
    seen.add(token);
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let pattern;
    if (token.endsWith('px') || token.endsWith('ms')) pattern = new RegExp(`(?<![\\d.])${escaped}(?!\\d)`);
    else if (token.startsWith('#')) pattern = new RegExp(`${escaped}(?![0-9a-fA-F])`);
    else pattern = new RegExp(escaped);
    if (!pattern.test(source)) missing.push(token);
  }
  return missing;
}

function statesValuesMissingFromCopy(text) {
  return valuesMissingFromCopy(statesBody(text), copyStyleAndScript(text));
}

const CANONICAL_HEADINGS = [
  'Piece',
  'Stage content',
  'Geometry and values',
  'States',
  'Timing',
  'Reduced motion',
  'Gotchas',
  'Setup',
  'Known gaps',
  'Checklist',
  'Code',
];

function canonicalHeadingErrors(id, text) {
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
  const errors = [];
  if (headings.join('\n') !== CANONICAL_HEADINGS.join('\n')) {
    errors.push(`${id}: headings are ${headings.join(' | ') || '(none)'}`);
  }
  const subs = [...text.matchAll(/^### (.+)$/gm)].map((match) => match[1].trim());
  if (subs.join('\n') !== 'HTML\nCSS\nScript') {
    errors.push(`${id}: Code subsections are ${subs.join(' | ') || '(none)'}`);
  }
  const codeAt = text.search(/^## Code\b/m);
  const firstSub = text.search(/^### /m);
  if (codeAt < 0 || firstSub < codeAt) errors.push(`${id}: Code subsections precede ## Code`);
  return errors;
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
    if (GENERIC_IDS.has(item.id)) {
      for (const ban of GENERIC_BANS) {
        ban.pattern.lastIndex = 0;
        if (ban.pattern.test(text)) hits.push(`${item.id}: ${ban.label}`);
      }
      for (const token of statesValuesMissingFromCopy(text)) {
        hits.push(`${item.id}: States value ${token} is not in Copy CSS/script`);
      }
    }
    if (canonicalIds.has(item.id)) {
      // Any whitespace run or hyphen between the words. Canonical prompts only:
      // other cards still paste the phrase inside a Copy document.
      const spaced = {
        label: 'closed network',
        pattern: /(?<![A-Za-z0-9_])closed[\s-]+network(?![A-Za-z0-9_])/gi,
      };
      spaced.pattern.lastIndex = 0;
      if (spaced.pattern.test(text)) hits.push(`${item.id}: closed network`);
      // Site-process words. Whole word, any case. The Copy payload under ## Code
      // is exempt so a literal identifier in the document does not fail the prose.
      const prose = text.split(/^## Code\b/m)[0];
      for (const word of ['harness', 'showcase', 'preview', 'gallery']) {
        const pattern = new RegExp(`(?<![A-Za-z0-9_])${word}(?![A-Za-z0-9_])`, 'i');
        if (pattern.test(prose)) hits.push(`${item.id}: ${word}`);
      }
      hits.push(...canonicalHeadingErrors(item.id, text));
      const source = copyStyleAndScript(text);
      for (const title of ['Geometry and values', 'Timing']) {
        for (const token of valuesMissingFromCopy(sectionBody(text, title), source)) {
          hits.push(`${item.id}: ${title} value ${token} is not in Copy CSS/script`);
        }
      }
    }
  }
  const missing = missingSections(text);
  if (missing.length) {
    const line = `${item.id}: ${missing.join(', ')}`;
    if (hand) warnings.push(line);
    else hits.push(`missing sections: ${line}`);
  }
}

if (skipped.length) {
  console.log(`hand-written prompts skipped for banned words: ${skipped.join(', ')}`);
}
if (warnings.length) {
  console.log('missing sections (hand-written, warning):');
  for (const line of warnings) console.log(`  ${line}`);
} else {
  console.log('missing sections (hand-written, warning): none');
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
  { file: join(root, 'public/prompts/spacing-tuner.md'), pkg: 'react', notice: false },
];

function packageSourceIndex(text) {
  const heading = text.search(/^## Component\b/m);
  if (heading < 0) return -1;
  const fence = text.slice(heading).search(/```(?:js|javascript|tsx)\n/);
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
    licenseHits.push(`${item.file}: ## Component is missing its code block`);
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

/**
 * Spacing tuner fences are the card's source. A heading
 * `### \`src/spacing-tuner/<file>\`` must match src/demos/spacing-tuner/<file>.
 */
const fencePrompt = readFileSync(join(root, 'public/prompts/spacing-tuner.md'), 'utf8');
const fenceFiles = [
  'tokens.ts',
  'timeline.ts',
  'layout.ts',
  'Icons.tsx',
  'SpacingTuner.tsx',
  'index.ts',
];
const fenceHits = [];
for (const name of fenceFiles) {
  const heading = `src/spacing-tuner/${name}`;
  const marker = `### \`${heading}\``;
  const at = fencePrompt.indexOf(marker);
  if (at < 0) {
    fenceHits.push(`${heading}: heading missing`);
    continue;
  }
  const rest = fencePrompt.slice(at + marker.length);
  const open = rest.match(/```(?:ts|tsx)\n/);
  if (!open || open.index == null) {
    fenceHits.push(`${heading}: code fence missing`);
    continue;
  }
  const start = open.index + open[0].length;
  const end = rest.indexOf('\n```', start);
  if (end < 0) {
    fenceHits.push(`${heading}: code fence never closes`);
    continue;
  }
  const fenced = rest.slice(start, end);
  const file = readFileSync(join(root, 'src/demos/spacing-tuner', name), 'utf8').replace(/\n$/, '');
  if (fenced !== file) fenceHits.push(`${heading}: fence does not match the card file`);
}
console.log(`fence hits: ${fenceHits.length}`);
if (fenceHits.length) {
  for (const line of fenceHits) console.error(`  ${line}`);
  process.exit(1);
}

/**
 * A catalog skill.path is a file under public/. Copy Skill serves those bytes.
 * spacing-audit's hash is pinned to the staged skill.
 */
import { createHash } from 'node:crypto';

function frontmatterName(bytes) {
  const text = bytes.toString('utf8');
  const fence = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) return null;
  const line = fence[1].match(/^name:\s*(\S+)\s*$/m);
  return line ? line[1] : null;
}

const skillHits = [];
if (catalogSkills.length === 0) skillHits.push('catalog declares no skill');
for (const skill of catalogSkills) {
  const skillPath = skill.path;
  const skillName = skill.name;
  if (skillPath.includes('..') || skillPath.startsWith('/')) {
    skillHits.push(`${skillName}: path must stay inside public/`);
    continue;
  }
  const absolute = join(root, 'public', skillPath);
  let bytes;
  try {
    bytes = readFileSync(absolute);
  } catch {
    skillHits.push(`${skillName}: public/${skillPath} is missing`);
    continue;
  }
  if (bytes.length === 0) skillHits.push(`${skillName}: public/${skillPath} is empty`);
  const declared = frontmatterName(bytes);
  if (declared !== skillName) {
    skillHits.push(`${skill.id}: SKILL.md name ${declared ?? '(missing)'} != registry name ${skillName}`);
  }
  if (skillName === 'spacing-audit') {
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (!hash.startsWith('fa392acc')) skillHits.push(`spacing-audit sha256 ${hash.slice(0, 8)} != fa392acc`);
  }
}
console.log(`skill hits: ${skillHits.length}`);
if (skillHits.length) {
  for (const line of skillHits) console.error(`  ${line}`);
  process.exit(1);
}

/**
 * Gooey Copy embeds the latin Inter woff2 and ships its OFL text in the bundle
 * header. The blob is checked on the Copy CSS payload, not the prompt.
 * Dropping the face, the licence file, or the header block fails the build.
 */
const fontHits = [];
const oflPath = join(root, 'public/fonts/OFL.txt');
const woffPath = join(root, 'public/fonts/inter-latin.woff2');
const gooeyBundlePath = join(root, 'public/parity/gooey.js');
let oflText = '';
try {
  oflText = readFileSync(oflPath, 'utf8');
} catch {
  fontHits.push('public/fonts/OFL.txt is missing');
}
if (oflText && !oflText.includes('SIL OPEN FONT LICENSE')) {
  fontHits.push('public/fonts/OFL.txt is missing the OFL text');
}
let gooeyBundle = '';
try {
  gooeyBundle = readFileSync(gooeyBundlePath, 'utf8');
} catch {
  fontHits.push('public/parity/gooey.js is missing');
}
if (oflText && gooeyBundle && !gooeyBundle.includes(oflText.trim())) {
  fontHits.push('public/parity/gooey.js is missing the OFL block');
}
let woffBytes;
try {
  woffBytes = readFileSync(woffPath);
} catch {
  fontHits.push('public/fonts/inter-latin.woff2 is missing');
}
if (woffBytes) {
  const woffHash = createHash('sha256').update(woffBytes).digest('hex');
  if (!woffHash.startsWith('3100e775')) fontHits.push(`inter-latin.woff2 sha256 ${woffHash.slice(0, 8)} != 3100e775`);
  const embedded = woffBytes.toString('base64');
  let css = '';
  try {
    css = await loaded.embedGooeyFont(loaded.copyTextFor('gooey', 'css'));
  } catch (error) {
    fontHits.push(`gooey Copy CSS payload failed: ${error instanceof Error ? error.message : 'unknown'}`);
  }
  if (!css.includes(embedded)) {
    fontHits.push('gooey Copy CSS is missing the Inter woff2 data URI');
  }
  if (!css.includes('/* Inter © 2016 The Inter Project Authors. SIL Open Font License 1.1, https://openfontlicense.org */')) {
    fontHits.push('gooey Copy CSS is missing the Inter OFL comment');
  }
  if (css.includes('48,256') || css.includes('sha256') || css.includes('included in the Copy')) {
    fontHits.push('gooey Copy CSS payload includes the prompt font note');
  }
  const gooeyPrompt = generatedPrompts.find((item) => item.id === 'gooey');
  if (!gooeyPrompt || !gooeyPrompt.prompt.includes('included in the Copy')) {
    fontHits.push('gooey prompt is missing the font elision note');
  }
}
console.log(`font hits: ${fontHits.length}`);
if (fontHits.length) {
  for (const line of fontHits) console.error(`  ${line}`);
  process.exit(1);
}

/**
 * The nine orb cards paste the portable Canvas2D renderer into the prompt.
 * The picker cannot select Shaping, so that prompt must not carry the morph painter.
 */
const ORB_FAMILY = [
  'orb-agent-listening',
  'orb-agent-planning',
  'orb-agent-shaping',
  'orb-agent-thinking',
  'orb-searching',
  'orb-solving',
  'orb-state-picker',
  'orb-thinking',
  'orb-working',
];
const ORB_CHIPS = ['orb-agent-listening', 'orb-agent-planning', 'orb-agent-shaping', 'orb-agent-thinking'];
const ORB_PILLS = ['orb-searching', 'orb-solving', 'orb-thinking', 'orb-working'];

function hasClassSelector(css, name) {
  return new RegExp(`\\.${name}(?![A-Za-z0-9_-])`).test(css);
}

function copyScript(prompt) {
  const at = prompt.indexOf('## Copy script');
  return at < 0 ? '' : prompt.slice(at);
}

function bindingName(script, key) {
  return script.slice(script.indexOf(key)).match(new RegExp(`${key}\\s*([A-Za-z_$][\\w$]*)`))?.[1] ?? '';
}

/** morph: has to be a MODE_FRAMES key, and MODE_DRAWS has to be built from that same map. */
function framesAndDrawsIncludeMorph(script) {
  const framesName = bindingName(script, 'MODE_FRAMES:');
  const drawsName = bindingName(script, 'MODE_DRAWS:');
  if (!framesName || !drawsName) return false;
  const framesAt = script.lastIndexOf(`${framesName} = {`, script.indexOf('MODE_FRAMES:'));
  if (framesAt < 0 || !script.slice(framesAt, script.indexOf('}', framesAt)).includes('morph:')) return false;
  const drawsAt = script.lastIndexOf(`${drawsName} =`, script.indexOf('MODE_DRAWS:'));
  if (drawsAt < 0) return false;
  const drawsBody = script.slice(drawsAt, drawsAt + 240);
  return drawsBody.includes(`Object.entries(${framesName})`) || drawsBody.includes('morph:');
}

const orbHits = [];
for (const id of ORB_FAMILY) {
  const prompt = generatedPrompts.find((item) => item.id === id)?.prompt ?? '';
  const script = copyScript(prompt);
  const engineKeys = ['var OrbEngine = {', 'MODE_FRAMES:', 'MODE_DRAWS:', 'resolvePreset:', 'paintFrame:'];
  if (engineKeys.some((key) => !script.includes(key))) {
    orbHits.push(`${id}: prompt is missing the portable renderer`);
  }
  if (id === 'orb-state-picker') {
    if (script.includes('shaping:') || script.includes('morph:')) {
      orbHits.push(`${id}: prompt still includes the unreachable shaping drawing`);
    }
  } else {
    if (!script.includes('shaping:')) orbHits.push(`${id}: prompt is missing the shared renderer`);
    if (!framesAndDrawsIncludeMorph(script)) orbHits.push(`${id}: MODE_FRAMES/MODE_DRAWS is missing morph`);
  }
  let css = '';
  try {
    css = loaded.copyTextFor(id, 'css');
  } catch (error) {
    orbHits.push(`${id}: Copy CSS failed: ${error instanceof Error ? error.message : 'unknown'}`);
    continue;
  }
  const unused = id === 'orb-state-picker'
    ? ['trigger', 'col', 'pill', 'chip', 'label', 'agent', 'muted']
    : ORB_CHIPS.includes(id)
      ? ['col', 'controls', 'is-on', 'label', 'picker', 'pill', 'trigger']
      : ORB_PILLS.includes(id)
        ? ['agent', 'chip', 'col', 'controls', 'is-on', 'muted', 'picker', 'trigger']
        : [];
  for (const name of unused) {
    if (hasClassSelector(css, name)) orbHits.push(`${id}: unused CSS .${name}`);
  }
}
console.log(`orb hits: ${orbHits.length}`);
if (orbHits.length) {
  for (const line of orbHits) console.error(`  ${line}`);
  process.exit(1);
}
