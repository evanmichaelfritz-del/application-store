/**
 * Build every eligible showcase file and prove it is offline.
 * Yogesh's two orb cards are deferred, so they are not generated.
 *
 *   node scripts/check-showcase.mjs
 *   node scripts/check-showcase.mjs adam-sidebar-transitions
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2] ?? '';
const outdir = join(tmpdir(), 'store-showcases');
rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

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

const outfile = join(tmpdir(), 'showcase-generate.mjs');
await esbuild.build({
  entryPoints: [join(root, 'src/showcase/generate.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  absWorkingDir: root,
  alias: { '@': root },
  logLevel: 'silent',
  plugins: [
    {
      name: 'showcase-check',
      setup(build) {
        build.onResolve({ filter: /^\.\/skia\// }, (args) => {
          if (args.importer.endsWith(`${join('src', 'catalog.ts')}`)) {
            return { path: args.path, namespace: 'showcase-empty' };
          }
          return null;
        });
        build.onLoad({ filter: /.*/, namespace: 'showcase-empty' }, () => ({
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
const read = async (publicPath) => readFileSync(join(root, 'public', publicPath.replace(/^\//, '')));

function jsonAt(source, index) {
  if (source[index] !== '"') throw new Error('expected a JSON string');
  let i = index + 1;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source[i] === '"') return JSON.parse(source.slice(index, i + 1));
    i += 1;
  }
  throw new Error('unterminated JSON string');
}

function embedded(html, name) {
  const marker = `var ${name} = `;
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`missing ${name}`);
  return jsonAt(html, at + marker.length);
}

function stripComments(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

const REQUEST_PATTERNS = [
  { label: 'script src', pattern: /<script\b[^>]*\bsrc\s*=/i },
  { label: '@import', pattern: /@import\b/i },
  { label: 'css url', pattern: /url\(\s*(['"])(?!data:|#)(?!\1)/ },
  { label: 'fetch(', pattern: /\bfetch\s*\(/ },
  { label: 'worker', pattern: /new\s+Worker\s*\(\s*(['"])(?!blob:)/ },
  { label: 'xhr', pattern: /\bXMLHttpRequest\b/ },
  { label: 'dynamic import', pattern: /\bimport\s*\(\s*['"]/ },
  { label: 'websocket', pattern: /\bWebSocket\s*\(/ },
  { label: 'event source', pattern: /\bEventSource\s*\(/ },
  {
    label: 'attribute url',
    pattern: /\b(?:src|href|poster|srcset|action|formaction)\s*=\s*(['"])(?!data:|#|about:blank|javascript:)[^'"]*\1/i,
  },
  { label: 'root path', pattern: /(['"`])\/(?:media|img-fx|parity|fonts|prompts|downloads)\// },
  { label: 'protocol-relative', pattern: /(['"`])\/\/[A-Za-z]/ },
];

function requestHits(source) {
  const hits = [];
  for (const check of REQUEST_PATTERNS) {
    if (check.pattern.test(source)) hits.push(check.label);
    check.pattern.lastIndex = 0;
  }
  return hits;
}

function strayHttp(source) {
  const bare = stripComments(source)
    .replace(/https?:\/\/react\.dev\/errors\//g, '')
    .replace(/https?:\/\/www\.w3\.org\/[^\s'"<>)]*/g, '')
    .replace(/https?:\/\/www\.apache\.org\/licenses\/LICENSE-2\.0/g, '')
    .replace(/https?:\/\/(?:github\.com|openfontlicense\.org|scripts\.sil\.org)\S*/g, '');
  const found = bare.match(/https?:\/\/[^'"\s)<]+|\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g);
  return found ?? [];
}

function assertOffline(html, id) {
  const stage = embedded(html, 'STAGE');
  const code = embedded(html, 'CODE');
  const prompt = embedded(html, 'PROMPT');
  const shell = html
    .replace(JSON.stringify(stage).replace(/</g, '\\u003c'), '""')
    .replace(JSON.stringify(code).replace(/</g, '\\u003c'), '""')
    .replace(JSON.stringify(prompt).replace(/</g, '\\u003c'), '""');
  const credit = shell.match(/<p class="credit">([\s\S]*?)<\/p>/);
  const shellBody = credit ? shell.replace(credit[0], '') : shell;
  const hits = [...requestHits(shellBody), ...requestHits(stage).map((label) => `stage ${label}`)];
  const http = [...strayHttp(shellBody).map((url) => `shell ${url}`), ...strayHttp(stage).map((url) => `stage ${url}`)];
  if (!html.includes('data:font/woff2;base64,')) hits.push('missing Inter');
  if (html.includes('data:font/woff2')) {
    if (!html.includes('The Inter Project Authors')) hits.push('missing Inter licence notice');
    if (!html.includes('PERMISSION AND CONDITIONS')) hits.push('missing Inter licence conditions');
  }
  if (!html.includes('prefers-reduced-motion')) hits.push('missing reduced motion');
  return { hits, http, code, prompt };
}

const ids = loaded.showcaseIds().filter((id) => !only || id === only);
if (ids.length === 0) throw new Error(`No showcase for ${only}`);

const rows = [];
const problems = [];
for (const id of ids) {
  const html = await loaded.generateShowcase(id, read);
  const [code, prompt] = await Promise.all([loaded.showcaseCode(id), loaded.showcasePrompt(id, read)]);
  const offline = assertOffline(html, id);
  if (offline.code !== code) problems.push(`${id}: embedded Copy code is not the card copy`);
  if (offline.prompt !== prompt) problems.push(`${id}: embedded Copy prompt is not the card prompt`);
  for (const hit of offline.hits) problems.push(`${id}: ${hit}`);
  for (const url of offline.http) problems.push(`${id}: network url ${url}`);
  const file = join(outdir, `${id}-showcase.html`);
  writeFileSync(file, html);
  rows.push({ id, bytes: Buffer.byteLength(html), file, code, prompt });
}

if (!only) {
  const declaredOver = [...loaded.SHOWCASE_OVER_LIMIT].sort();
  const measuredOver = rows
    .filter((row) => row.bytes > loaded.SHOWCASE_FILE_LIMIT)
    .map((row) => row.id)
    .sort();
  if (declaredOver.join('\n') !== measuredOver.join('\n')) {
    problems.push(`over-limit set [${declaredOver.join(', ')}] != measured [${measuredOver.join(', ')}]`);
  }
}

const chrome =
  process.env.CHROME_PATH ||
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((path) => existsSync(path));
if (!chrome) {
  console.warn('check-showcase: Chrome is missing, skipping the browser phase');
}

const browser = chrome
  ? await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
    })
  : null;

async function openFile(page, file) {
  const hits = [];
  const errors = [];
  const onRequest = (request) => {
    const url = request.url();
    if (url.startsWith('file:') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) {
      request.continue().catch(() => undefined);
      return;
    }
    hits.push(url);
    request.abort().catch(() => undefined);
  };
  const onConsole = (message) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPage = (error) => errors.push(error.message);
  page.on('request', onRequest);
  page.on('console', onConsole);
  page.on('pageerror', onPage);
  await page.setRequestInterception(true);
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load', timeout: 30000 });
  return {
    hits,
    errors,
    stop() {
      page.off('request', onRequest);
      page.off('console', onConsole);
      page.off('pageerror', onPage);
    },
  };
}

async function stageFrame(page) {
  await page.waitForSelector('#stage');
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const handle = await page.$('#stage');
    const frame = handle ? await handle.contentFrame() : null;
    if (frame) {
      try {
        await frame.waitForSelector('body', { timeout: 1000 });
        return frame;
      } catch {
        /* the srcdoc frame is still attaching */
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('stage frame missing');
}

async function exercise(page) {
  const stage = await stageFrame(page);
  const inner = await stage.evaluate(() => {
    const reset = document.querySelector('[data-testid="sidebar-reset"]');
    if (reset) {
      const startedDisabled = reset.disabled === true;
      document.querySelector('[data-testid="mode-cascade"]').click();
      const enabled = reset.disabled === false;
      document.querySelector('[data-testid="mode-ease"]').click();
      const restored = reset.disabled === true;
      const play = document.querySelector('[data-testid="sidebar-play"]');
      play.click();
      return { kind: 'sidebar', startedDisabled, enabled, restored, play: play.getAttribute('aria-pressed') };
    }
    const video = document.querySelector('video');
    if (video && video.getAttribute('src')?.startsWith('data:video/')) {
      return { kind: 'video', src: true, paused: video.paused };
    }
    const range = document.querySelector('input[type="range"]');
    if (range && !range.disabled) {
      const before = range.value;
      range.value = String(Number(range.max) / 2);
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
      return { kind: 'range', moved: range.value !== before };
    }
    const control = [...document.querySelectorAll('button, [role="button"], [tabindex="0"]')].find(
      (node) => !node.disabled,
    );
    if (control) {
      const before = control.className;
      control.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      control.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      return { kind: 'control', name: control.id || control.textContent, changed: control.className !== before };
    }
    return { kind: 'visual' };
  });
  if (inner.kind !== 'visual') return inner;
  const replay = await page.$('#stage-reset');
  if (replay) {
    await replay.click();
    const label = await page.$eval('#stage-reset', (node) => node.textContent);
    return { kind: 'replay', label };
  }
  return inner;
}

async function copiedFrom(frame, selector) {
  return frame.evaluate((sel) => {
    const button = document.querySelector(sel);
    let copied = '';
    let written = '';
    const onCopy = () => {
      const field = document.querySelector('textarea');
      if (field && field.value) copied = field.value;
    };
    document.addEventListener('copy', onCopy);
    const clipboard = navigator.clipboard;
    const realWrite = clipboard && clipboard.writeText ? clipboard.writeText.bind(clipboard) : null;
    if (clipboard && realWrite) {
      clipboard.writeText = (text) => {
        written = String(text);
        return realWrite(text);
      };
    }
    button.click();
    return new Promise((resolve) => {
      window.setTimeout(() => {
        document.removeEventListener('copy', onCopy);
        if (clipboard && realWrite) clipboard.writeText = realWrite;
        resolve({ copied: written || copied, label: button.textContent });
      }, 200);
    });
  }, selector);
}

function hostFile(id, html, sandbox) {
  const file = join(outdir, `${id}-${sandbox ? 'sandbox' : 'srcdoc'}.html`);
  const attr = sandbox ? ' sandbox="allow-scripts"' : '';
  const page = `<!DOCTYPE html><meta charset="utf-8"><iframe id="host" style="width:1280px;height:900px;border:0"${attr}></iframe>
<script>document.getElementById('host').srcdoc = ${JSON.stringify(html).replace(/</g, '\\u003c')};<\/script>`;
  writeFileSync(file, page);
  return file;
}

async function frameFor(page, selector) {
  await page.waitForSelector(selector);
  const handle = await page.$(selector);
  const frame = await handle.contentFrame();
  if (!frame) throw new Error(`no frame for ${selector}`);
  await frame.waitForSelector('#copy-code', { timeout: 15000 });
  return frame;
}

if (browser) for (const row of rows) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  try {
    const session = await openFile(page, row.file);
    await page.waitForSelector('#copy-code', { timeout: 15000 });
    const control = await exercise(page);
    if (row.id === 'adam-sidebar-transitions') {
      if (!control.startedDisabled || !control.enabled || !control.restored) {
        problems.push(`${row.id}: Reset disabled state did not follow the mode (${JSON.stringify(control)})`);
      }
    } else if (control.kind === 'range' && !control.moved) {
      problems.push(`${row.id}: range did not move`);
    }
    const topCode = await copiedFrom(page.mainFrame(), '#copy-code');
    const topPrompt = await copiedFrom(page.mainFrame(), '#copy-prompt');
    if (topCode.copied !== row.code) problems.push(`${row.id}: top-level Copy code mismatch`);
    if (topPrompt.copied !== row.prompt) problems.push(`${row.id}: top-level Copy prompt mismatch`);
    if (topCode.label !== 'Copied' || topPrompt.label !== 'Copied') problems.push(`${row.id}: Copied state missing`);
    if (session.hits.length) problems.push(`${row.id}: network ${session.hits.join(', ')}`);
    if (session.errors.length) problems.push(`${row.id}: console ${session.errors.join(' | ')}`);
    session.stop();
    await page.close();

    for (const sandbox of [false, true]) {
      const nested = await browser.newPage();
      await nested.setViewport({ width: 1280, height: 900 });
      const host = hostFile(row.id, readFileSync(row.file, 'utf8'), sandbox);
      const watch = await openFile(nested, host);
      const frame = await frameFor(nested, '#host');
      const nestedCode = await copiedFrom(frame, '#copy-code');
      const nestedPrompt = await copiedFrom(frame, '#copy-prompt');
      const where = sandbox ? 'sandbox' : 'srcdoc';
      if (nestedCode.copied !== row.code) problems.push(`${row.id}: ${where} Copy code mismatch`);
      if (nestedPrompt.copied !== row.prompt) problems.push(`${row.id}: ${where} Copy prompt mismatch`);
      if (watch.hits.length) problems.push(`${row.id}: ${where} network ${watch.hits.join(', ')}`);
      if (watch.errors.length) problems.push(`${row.id}: ${where} console ${watch.errors.join(' | ')}`);
      watch.stop();
      await nested.close();
    }
  } catch (error) {
    problems.push(`${row.id}: ${error instanceof Error ? error.message : String(error)}`);
    await page.close().catch(() => undefined);
  }
}

if (browser) await browser.close();

const width = Math.max(...rows.map((row) => row.id.length));
console.log('showcase bytes');
for (const row of rows) {
  const via = row.bytes > 2 * 1024 * 1024 ? 'file' : 'clipboard';
  console.log(`${row.id.padEnd(width)}  ${String(row.bytes).padStart(9)}  ${via}`);
}
console.log(`cards ${rows.length}`);
console.log(`problems ${problems.length}`);
for (const line of problems) console.error(`  ${line}`);
if (problems.length) process.exit(1);
