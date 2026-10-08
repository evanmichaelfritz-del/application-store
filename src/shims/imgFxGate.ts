/**
 * Keeps the pixels-organic loader off the main thread.
 *
 * img-fx has one 29KB fragment program. Compiling it on the main thread, or
 * even drawing it once from a worker, blocks every other GL context for
 * several seconds on a slow GPU. Software GL never compiles: the card keeps
 * the static frame. A real GPU draws that same preset from a worker, on an
 * OffscreenCanvas, and the page shows the static frame until the first
 * present. The present is withheld while CanvasKit is creating a context.
 */

import { canvasKitPending } from '@/src/skia/ensureCanvasKit';

const SOFTWARE_GL = /swiftshader|llvmpipe|software/i;
/** img-fx caps the shader buffer at 1.25× and nearest-filters it up to 2×. */
const SHADER_DPR_CAP = 1.25;

type SceneLike = {
  traverse: (fn: (obj: object) => void) => void;
};

type RendererLike = {
  domElement: HTMLCanvasElement;
  debug: { checkShaderErrors: boolean };
  render: (scene: SceneLike, camera: object) => void;
  getContext: () => WebGL2RenderingContext;
};

type ImgFxStats = {
  software: boolean;
  held: boolean;
  caveatFailed: boolean;
  khr: boolean;
  renderer: string;
  vendor: string;
};

type GateWindow = typeof globalThis & {
  __imgFxFreezeTime?: number;
  __imgFxUseDrawImage?: boolean;
  __imgFxStats?: ImgFxStats;
};

const stats: ImgFxStats = {
  software: false,
  held: false,
  caveatFailed: false,
  khr: false,
  renderer: '',
  vendor: '',
};

const imgFxCanvases = new WeakSet<HTMLCanvasElement>();
let installed = false;
let shaderReady = false;
let origDraw: CanvasRenderingContext2D['drawImage'] | null = null;
let worker: Worker | null = null;
let lastHold: boolean | null = null;
let origRender: ((scene: SceneLike, camera: object) => void) | null = null;
const readyListeners = new Set<() => void>();

function gateWindow(): GateWindow {
  return globalThis as GateWindow;
}

function useImmediateCopy() {
  return gateWindow().__imgFxUseDrawImage === true;
}

function holdingStill() {
  return stats.held;
}

function noteGl(gl: WebGL2RenderingContext) {
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  if (ext) {
    stats.renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    stats.vendor = String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '');
  }
  if (!stats.khr) stats.khr = !!gl.getExtension('KHR_parallel_shader_compile');
  if (stats.caveatFailed || SOFTWARE_GL.test(`${stats.renderer} ${stats.vendor}`)) {
    stats.software = true;
    stats.held = true;
  }
}

function releaseGl(gl: WebGL2RenderingContext | null) {
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
}

/** One short-lived context, dropped before img-fx creates its own. */
function detectSoftwareGl() {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const caveat = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  stats.caveatFailed = !caveat;
  let gl = caveat as WebGL2RenderingContext | null;
  let extra: HTMLCanvasElement | null = null;
  if (!gl) {
    extra = document.createElement('canvas');
    extra.width = 8;
    extra.height = 8;
    gl = extra.getContext('webgl2') as WebGL2RenderingContext | null;
  }
  if (gl) noteGl(gl);
  else if (stats.caveatFailed) {
    stats.software = true;
    stats.held = true;
  }
  releaseGl(gl);
}

function shaderCanvas(): HTMLCanvasElement | null {
  const node = document.querySelector('canvas.image-gen-shader');
  return node instanceof HTMLCanvasElement ? node : null;
}

function cardInView() {
  const canvas = shaderCanvas();
  if (!canvas) return false;
  const rect = canvas.getBoundingClientRect();
  return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
}

function shouldHold() {
  return canvasKitPending() || document.hidden || !cardInView();
}

function targetSize() {
  const canvas = shaderCanvas();
  const cssW = canvas?.clientWidth || 168;
  const cssH = canvas?.clientHeight || cssW;
  const dpr = Math.min(window.devicePixelRatio || 1, SHADER_DPR_CAP);
  return {
    w: Math.max(1, Math.floor(cssW * dpr)),
    h: Math.max(1, Math.floor(cssH * dpr)),
    dpr,
  };
}

function paintFrame(bmp: ImageBitmap) {
  const canvas = shaderCanvas();
  if (!canvas || !origDraw) {
    bmp.close();
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bmp.close();
    return;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  // ImageBitmap is not an HTMLCanvasElement, so the drawImage patch lets it through.
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
}

function watchGpu() {
  if (!worker || holdingStill()) return;
  const hold = shouldHold();
  if (hold !== lastHold) {
    lastHold = hold;
    worker.postMessage({ type: 'hold', hold });
    const freeze = gateWindow().__imgFxFreezeTime;
    if (typeof freeze === 'number') worker.postMessage({ type: 'time', time: freeze });
  }
  requestAnimationFrame(watchGpu);
}

function ensureGpuPath() {
  if (worker || holdingStill() || typeof Worker !== 'function') return;
  worker = new Worker('/img-fx/organic-worker.js');
  worker.onmessage = (ev: MessageEvent<{ bmp?: ImageBitmap }>) => {
    if (ev.data?.bmp) paintFrame(ev.data.bmp);
  };
  const boot = () => {
    if (!worker) return;
    if (canvasKitPending()) {
      requestAnimationFrame(boot);
      return;
    }
    worker.postMessage({ type: 'start', ...targetSize() });
    lastHold = null;
    watchGpu();
  };
  boot();
}

function wrappedRender(scene: SceneLike, camera: object) {
  if (holdingStill()) return;
  if (useImmediateCopy()) {
    origRender?.(scene, camera);
    return;
  }
  ensureGpuPath();
}

/** Wrap an img-fx WebGLRenderer so a slow compile never runs on the main thread. */
export function patchImgFxRenderer(renderer: RendererLike) {
  const canvas = renderer.domElement;
  if (!imgFxCanvases.has(canvas)) return;
  if (!stats.renderer && !stats.caveatFailed) detectSoftwareGl();
  try {
    noteGl(renderer.getContext());
  } catch {
    /* context already lost */
  }
  renderer.debug.checkShaderErrors = false;
  origRender = renderer.render.bind(renderer);
  renderer.render = (scene, camera) => wrappedRender(scene, camera);
  if (!holdingStill() && !useImmediateCopy()) ensureGpuPath();
}

export function installImgFxGate() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  gateWindow().__imgFxStats = stats;

  const origGetContext = HTMLCanvasElement.prototype.getContext as (
    this: HTMLCanvasElement,
    type: string,
    attrs?: unknown,
  ) => RenderingContext | null;
  HTMLCanvasElement.prototype.getContext = function getContext(
    this: HTMLCanvasElement,
    type: string,
    attrs?: unknown,
  ) {
    const imgFx =
      type === 'webgl2' &&
      !!attrs &&
      typeof attrs === 'object' &&
      (attrs as WebGLContextAttributes).powerPreference === 'high-performance' &&
      (attrs as WebGLContextAttributes).premultipliedAlpha === false &&
      (attrs as WebGLContextAttributes).antialias === false &&
      (attrs as WebGLContextAttributes).alpha === true &&
      this.width === 8 &&
      this.height === 8 &&
      !this.isConnected;
    const context = origGetContext.call(this, type, attrs);
    if (context && imgFx) imgFxCanvases.add(this);
    return context;
  } as typeof HTMLCanvasElement.prototype.getContext;

  origDraw = CanvasRenderingContext2D.prototype.drawImage;
  const savedDraw = origDraw;
  CanvasRenderingContext2D.prototype.drawImage = function drawImage(
    this: CanvasRenderingContext2D,
    ...args: Parameters<CanvasRenderingContext2D['drawImage']>
  ) {
    const source = args[0];
    if (source instanceof HTMLCanvasElement && this.canvas.classList.contains('image-gen-shader')) {
      if (useImmediateCopy()) return savedDraw.apply(this, args);
      return;
    }
    return savedDraw.apply(this, args);
  } as typeof CanvasRenderingContext2D.prototype.drawImage;

  const origClear = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function clearRect(
    this: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    if (!useImmediateCopy() && this.canvas.classList.contains('image-gen-shader')) return;
    return origClear.call(this, x, y, w, h);
  };
}

export function subscribeImgFxReady(listener: () => void) {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

export function getImgFxShaderReady() {
  return shaderReady;
}

installImgFxGate();
