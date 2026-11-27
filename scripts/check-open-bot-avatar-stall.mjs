/**
 * Headless check of the Open Bot Avatar stall watchdog.
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

const FLUFFY_LINE = 'Fluffy was too slow here, so the finish is Flat.';
const GLASS_LINE = 'Glass was too slow here, so the finish is Flat.';
const failures = [];

function expect(label, ok, detail) {
  if (ok) console.log(`ok ${label}`);
  else {
    failures.push(`${label}: ${detail}`);
    console.error(`FAIL ${label}: ${detail}`);
  }
}

function installGpuSpoof(reduced) {
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
  if (!reduced) return;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One main-thread block. The next animation frame is a single slow gap. */
async function blockOnce(page, ms) {
  await page.evaluate(
    (hold) =>
      new Promise((resolve) => {
        const start = performance.now();
        while (performance.now() - start < hold) {
          /* one long task */
        }
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    ms,
  );
}

/** Consecutive animation frames that are slow because each one runs a long task. */
async function slowFrames(page, count, ms) {
  await page.evaluate(
    (times, hold) =>
      new Promise((resolve) => {
        let left = times;
        const step = () => {
          requestAnimationFrame(() => {
            const start = performance.now();
            while (performance.now() - start < hold) {
              /* this frame is a long task */
            }
            left -= 1;
            if (left > 0) step();
            else requestAnimationFrame(() => resolve());
          });
        };
        step();
      }),
    count,
    ms,
  );
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
await sleep(300);
const noGl = await readCard(missing);
expect('no WebGL2 starts on Flat', noGl.finish === 'flat' && noGl.stall !== FLUFFY_LINE, JSON.stringify(noGl));
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

const natural = await browser.newPage();
await natural.evaluateOnNewDocument(installGpuSpoof, false);
await natural.goto(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
await natural.waitForSelector('[data-testid="oba-material-fluffy"]', { timeout: 30000 });
await natural
  .waitForFunction(
    (line) => document.querySelector('[data-testid="oba-stall"]')?.textContent === line,
    { timeout: 25000 },
    FLUFFY_LINE,
  )
  .catch(() => undefined);
const naturalCard = await readCard(natural);
expect(
  'sustained Fluffy frames that are long tasks drop to Flat',
  naturalCard.finish === 'flat' && naturalCard.stall === FLUFFY_LINE,
  JSON.stringify(naturalCard),
);
await natural.close();

const gpu = await browser.newPage();
await gpu.evaluateOnNewDocument(installGpuSpoof, true);
await gpu.goto(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
await gpu.waitForSelector('[data-testid="oba-material-fluffy"]', { timeout: 30000 });
await sleep(1200);
const opened = await readCard(gpu);
expect('a calm load stays on Fluffy', opened.finish === 'fluffy' && opened.stall === null, JSON.stringify(opened));

if (opened.finish === 'fluffy') {
  await blockOnce(gpu, 1300);
  await sleep(400);
  const one = await readCard(gpu);
  expect('a single 1.3 s block does not drop', one.finish === 'fluffy' && one.stall === null, JSON.stringify(one));

  await gpu.evaluate(() => {
    const flag = { hidden: true };
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => flag.hidden });
    Object.defineProperty(Document.prototype, 'visibilityState', {
      configurable: true,
      get: () => (flag.hidden ? 'hidden' : 'visible'),
    });
    document.dispatchEvent(new Event('visibilitychange'));
    const start = performance.now();
    while (performance.now() - start < 1500) {
      /* gap while the page is hidden */
    }
    flag.hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(500);
  const hidden = await readCard(gpu);
  expect('a hidden-tab gap does not drop', hidden.finish === 'fluffy' && hidden.stall === null, JSON.stringify(hidden));

  if (hidden.finish === 'fluffy') {
    await slowFrames(gpu, 4, 320);
    await sleep(300);
    const dropped = await readCard(gpu);
    expect(
      'three slow Fluffy frames drop to Flat',
      dropped.finish === 'flat' && dropped.stall === FLUFFY_LINE,
      JSON.stringify(dropped),
    );
  }
}
await gpu.close();

const glass = await browser.newPage();
await glass.evaluateOnNewDocument(installGpuSpoof, true);
await glass.goto(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
await glass.waitForSelector('[data-testid="oba-material-glass"]', { timeout: 30000 });
await sleep(800);
await glass.click('[data-testid="oba-material-glass"]');
await sleep(600);
const glassReady = await readCard(glass);
expect('Glass can be shown', glassReady.finish === 'glass' && glassReady.stall === null, JSON.stringify(glassReady));
if (glassReady.finish === 'glass') {
  await slowFrames(glass, 4, 320);
  await sleep(300);
  const glassDrop = await readCard(glass);
  expect(
    'three slow Glass frames drop to Flat',
    glassDrop.finish === 'flat' && glassDrop.stall === GLASS_LINE,
    JSON.stringify(glassDrop),
  );
}

await browser.close();
if (failures.length) {
  console.error(`open-bot-avatar stall: ${failures.length} failed`);
  process.exit(1);
}
console.log('open-bot-avatar stall: ok');
