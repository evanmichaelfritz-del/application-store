/**
 * Headless check of the Open Bot Avatar stall watchdog.
 * A hidden page and long main-thread tasks must not drop Fluffy to Flat.
 * Three slow frames that are not long tasks must.
 *
 *   node scripts/check-open-bot-avatar-stall.mjs
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = pathToFileURL(join(root, 'public/parity/open-bot-avatar.html')).href;
const chrome =
  process.env.CHROME_PATH ||
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((path) => existsSync(path));
if (!chrome) {
  console.error('open-bot-avatar stall: Chrome is missing');
  process.exit(1);
}

const failures = [];
function expect(label, ok, detail) {
  if (ok) console.log(`ok ${label}`);
  else {
    failures.push(`${label}: ${detail}`);
    console.error(`FAIL ${label}: ${detail}`);
  }
}

function spoofGpu() {
  const proto = HTMLCanvasElement.prototype;
  const orig = proto.getContext;
  proto.getContext = function (type, attrs) {
    const gl = orig.call(this, type, attrs);
    if (!gl || (type !== 'webgl' && type !== 'webgl2')) return gl;
    if (gl.__obaSpoof) return gl;
    gl.__obaSpoof = true;
    const getExtension = gl.getExtension.bind(gl);
    const getParameter = gl.getParameter.bind(gl);
    gl.getExtension = function (name) {
      const ext = getExtension(name);
      if (name === 'WEBGL_debug_renderer_info') {
        return ext || { UNMASKED_RENDERER_WEBGL: 37446, UNMASKED_VENDOR_WEBGL: 37445 };
      }
      return ext;
    };
    gl.getParameter = function (pname) {
      if (pname === 37446) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)';
      if (pname === 37445) return 'Google Inc. (NVIDIA)';
      return getParameter(pname);
    };
    return gl;
  };
  const markReduced = () => {
    if (document.documentElement) document.documentElement.setAttribute('data-reduce-motion', '1');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markReduced);
  else markReduced();
}

function blockWebGL() {
  const proto = HTMLCanvasElement.prototype;
  const orig = proto.getContext;
  proto.getContext = function (type, attrs) {
    if (type === 'webgl' || type === 'webgl2') return null;
    return orig.call(this, type, attrs);
  };
}

async function readCard(page) {
  return page.evaluate(() => {
    const finish = ['flat', 'fluffy', 'glass'].find(
      (item) => document.querySelector(`[data-testid="oba-material-${item}"]`)?.getAttribute('aria-pressed') === 'true',
    );
    const stall = document.querySelector('[data-testid="oba-stall"]');
    return { finish: finish ?? null, stall: stall?.textContent ?? null };
  });
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  defaultViewport: { width: 1280, height: 900 },
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const missing = await browser.newPage();
await missing.evaluateOnNewDocument(blockWebGL);
await missing.goto(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
await missing.waitForSelector('[data-testid="oba-material-flat"]', { timeout: 30000 });
await new Promise((resolve) => setTimeout(resolve, 400));
const noGl = await readCard(missing);
expect('no WebGL2 starts on Flat', noGl.finish === 'flat' && noGl.stall !== 'Fluffy was too slow here, so the finish is Flat.', JSON.stringify(noGl));
await missing.close();

const software = await browser.newPage();
await software.goto(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
await software.waitForSelector('[data-testid="oba-stall"]', { timeout: 30000 });
const soft = await readCard(software);
expect(
  'software WebGL starts on Flat',
  soft.finish === 'flat' && soft.stall === 'Software WebGL starts on Flat.',
  JSON.stringify(soft),
);
await software.close();

const gpu = await browser.newPage();
await gpu.evaluateOnNewDocument(spoofGpu);
await gpu.goto(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
await gpu.waitForSelector('[data-testid="oba-material-fluffy"]', { timeout: 30000 });
await new Promise((resolve) => setTimeout(resolve, 1500));
const opened = await readCard(gpu);
expect('real-GPU path is still Fluffy after warmup', opened.finish === 'fluffy' && opened.stall === null, JSON.stringify(opened));

if (opened.finish === 'fluffy') {
  await gpu.evaluate(() => {
    const hidden = { value: true };
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => hidden.value });
    Object.defineProperty(Document.prototype, 'visibilityState', {
      configurable: true,
      get: () => (hidden.value ? 'hidden' : 'visible'),
    });
    document.dispatchEvent(new Event('visibilitychange'));
    for (let i = 0; i < 4; i += 1) {
      const start = performance.now();
      while (performance.now() - start < 320) {
        /* long task while the page is hidden */
      }
    }
    hidden.value = false;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await new Promise((resolve) => setTimeout(resolve, 600));
  const afterJank = await readCard(gpu);
  expect(
    'long tasks and a hidden page do not drop',
    afterJank.finish === 'fluffy' && afterJank.stall === null,
    JSON.stringify(afterJank),
  );

  if (afterJank.finish === 'fluffy') {
    const errors = [];
    gpu.on('pageerror', (error) => errors.push(String(error)));
    await gpu.evaluate(() => {
      const orig = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => orig((time) => {
        window.setTimeout(() => cb(performance.now()), 280);
      });
    });
    await gpu.waitForFunction(
      () => document.querySelector('[data-testid="oba-stall"]')?.textContent === 'Fluffy was too slow here, so the finish is Flat.',
      { timeout: 8000 },
    ).catch(() => undefined);
    if (errors.length) console.error(errors.join('\n'));
    const dropped = await readCard(gpu);
    expect(
      'three slow frames drop to Flat',
      dropped.finish === 'flat' && dropped.stall === 'Fluffy was too slow here, so the finish is Flat.',
      JSON.stringify(dropped),
    );
  }
}

await browser.close();
if (failures.length) {
  console.error(`open-bot-avatar stall: ${failures.length} failed`);
  process.exit(1);
}
console.log('open-bot-avatar stall: ok');
