/**
 * Software GL keeps the organic still and never compiles img-fx.
 * A real GPU does not mount img-fx at all: the loader draws from a worker,
 * and this gate refuses the img-fx WebGL context so a slow compile cannot
 * land on the main thread.
 */

const SOFTWARE_GL = /swiftshader|llvmpipe|software/i;

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
let decided: 'software' | 'worker' | null = null;
let blockImgFxGl = false;
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

/** One short-lived context, dropped before any loader canvas is created. */
function detectSoftwareGl() {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const caveat = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  stats.caveatFailed = !caveat;
  const gl = (caveat || canvas.getContext('webgl2')) as WebGL2RenderingContext | null;
  if (gl) noteGl(gl);
  else if (stats.caveatFailed) {
    stats.software = true;
    stats.held = true;
  }
  releaseGl(gl);
}

function isImgFxGlRequest(canvas: HTMLCanvasElement, type: string, attrs?: unknown) {
  if (type !== 'webgl' && type !== 'webgl2') return false;
  const engine = canvas.dataset?.engine || '';
  if (engine.startsWith('three.js')) return true;
  if (canvas.width !== 8 || canvas.height !== 8 || canvas.isConnected) return false;
  if (!attrs || typeof attrs !== 'object') return false;
  const glAttrs = attrs as WebGLContextAttributes;
  return glAttrs.powerPreference === 'high-performance' && glAttrs.premultipliedAlpha === false;
}

/**
 * Call once before the loader mounts. Hardware sets the block so img-fx's
 * renderer cannot create a context later.
 */
export function decideImgFxPath(): 'software' | 'worker' {
  if (decided) return decided;
  if (typeof document === 'undefined') {
    stats.software = true;
    stats.held = true;
    decided = 'software';
    return decided;
  }
  try {
    detectSoftwareGl();
  } catch {
    stats.software = true;
    stats.held = true;
  }
  if (!stats.renderer && !stats.caveatFailed) {
    stats.software = true;
    stats.held = true;
  }
  decided = stats.held ? 'software' : 'worker';
  blockImgFxGl = decided === 'worker';
  gateWindow().__imgFxStats = stats;
  return decided;
}

/** Software GL: never call the real renderer, so the 29KB program stays uncompiled. */
export function patchImgFxRenderer(renderer: RendererLike) {
  const canvas = renderer.domElement;
  if (!imgFxCanvases.has(canvas)) return;
  if (!decided) decideImgFxPath();
  if (blockImgFxGl) return;
  if (!stats.renderer && !stats.caveatFailed) detectSoftwareGl();
  try {
    noteGl(renderer.getContext());
  } catch {
    /* context already lost */
  }
  renderer.debug.checkShaderErrors = false;
  renderer.render = () => {
    /* The still is the software-GL frame. Compiling here stalls the page. */
  };
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
    if (blockImgFxGl && isImgFxGlRequest(this, type, attrs)) return null;
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

  const origDraw = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function drawImage(
    this: CanvasRenderingContext2D,
    ...args: Parameters<CanvasRenderingContext2D['drawImage']>
  ) {
    const source = args[0];
    if (
      !useImmediateCopy() &&
      source instanceof HTMLCanvasElement &&
      this.canvas.classList.contains('image-gen-shader')
    ) {
      return;
    }
    return origDraw.apply(this, args);
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
