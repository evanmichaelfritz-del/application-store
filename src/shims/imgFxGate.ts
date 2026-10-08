/**
 * Keeps img-fx's pixels, and takes the synchronous GPU readback off the main thread.
 *
 * img-fx has one fragment program. Warming every dot-mode path up front compiles
 * that program over and over; on SwiftShader each pass is serial and the card
 * stays blank until the last one finishes. This gate compiles that one program,
 * on an idle slice, and only when CanvasKit is not creating a context.
 *
 * A software GL (SwiftShader, llvmpipe, or a failIfMajorPerformanceCaveat miss)
 * never compiles. The card keeps the static full-resolution frame painted at
 * mount. Hardware stays at full resolution and blits only after a fence, so an
 * animating frame is the same drawImage img-fx would have issued.
 */

import { canvasKitPending } from '@/src/skia/ensureCanvasKit';

const COMPLETION_STATUS_KHR = 0x91b1;
const SOFTWARE_GL = /swiftshader|llvmpipe|software/i;

type UniformBag = { u_time?: { value: number } };

type SceneLike = {
  traverse: (fn: (obj: { material?: { uniforms?: UniformBag } }) => void) => void;
};

type RendererLike = {
  domElement: HTMLCanvasElement;
  debug: { checkShaderErrors: boolean };
  render: (scene: SceneLike, camera: object) => void;
  compile: (scene: SceneLike, camera: object) => void;
  getContext: () => WebGL2RenderingContext;
  setViewport: (x: number, y: number, w: number, h: number) => void;
  setScissor: (x: number, y: number, w: number, h: number) => void;
  setScissorTest: (on: boolean) => void;
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

type GateState = {
  compileStarted: boolean;
  compileFinished: boolean;
  ready: boolean;
  scene: SceneLike | null;
  camera: object | null;
  orig: ((scene: SceneLike, camera: object) => void) | null;
  renderer: RendererLike | null;
  glCanvas: HTMLCanvasElement | null;
};

type PendingBlit = {
  ctx: CanvasRenderingContext2D;
  args: Parameters<CanvasRenderingContext2D['drawImage']>;
};

const stats: ImgFxStats = {
  software: false,
  held: false,
  caveatFailed: false,
  khr: false,
  renderer: '',
  vendor: '',
};

const state: GateState = {
  compileStarted: false,
  compileFinished: false,
  ready: false,
  scene: null,
  camera: null,
  orig: null,
  renderer: null,
  glCanvas: null,
};

const imgFxCanvases = new WeakSet<HTMLCanvasElement>();
const programs = new Set<WebGLProgram>();
let imgGl: WebGL2RenderingContext | null = null;
let pollScheduled = false;
let installed = false;
let shaderReady = false;
let fence: WebGLSync | null = null;
let drew = false;
let pendingBlit: PendingBlit | null = null;
const readyListeners = new Set<() => void>();
let origDraw: CanvasRenderingContext2D['drawImage'] | null = null;

function gateWindow(): GateWindow {
  return globalThis as GateWindow;
}

function useImmediateCopy() {
  return gateWindow().__imgFxUseDrawImage === true;
}

function holdingStill() {
  return stats.held;
}

function applyFreeze(scene: SceneLike | null) {
  const freeze = gateWindow().__imgFxFreezeTime;
  if (typeof freeze !== 'number' || !scene) return;
  scene.traverse((obj) => {
    const time = obj.material?.uniforms?.u_time;
    if (time) time.value = freeze;
  });
}

function emitReady() {
  if (shaderReady || holdingStill()) return;
  shaderReady = true;
  readyListeners.forEach((listener) => listener());
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

/** True when no draw is in flight. timeout 0 never blocks the main thread. */
function gpuIdle() {
  if (!fence || !imgGl) return true;
  const status = imgGl.clientWaitSync(fence, 0, 0);
  if (status === imgGl.ALREADY_SIGNALED || status === imgGl.CONDITION_SATISFIED) {
    imgGl.deleteSync(fence);
    fence = null;
    return true;
  }
  return false;
}

function replayBlit() {
  if (holdingStill() || !pendingBlit || !origDraw || !drew || !gpuIdle()) return;
  const { ctx, args } = pendingBlit;
  ctx.save();
  ctx.globalCompositeOperation = 'copy';
  ctx.imageSmoothingEnabled = false;
  origDraw.apply(ctx, args);
  ctx.restore();
}

function armFence() {
  if (!imgGl) return;
  fence = imgGl.fenceSync(imgGl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  imgGl.flush();
  drew = true;
  schedulePoll();
}

function syncViewport(renderer: RendererLike) {
  const canvas = pendingBlit?.ctx.canvas;
  const cssW = canvas?.clientWidth || 0;
  const cssH = canvas?.clientHeight || 0;
  if (cssW < 1 || cssH < 1) return;
  renderer.setViewport(0, 0, cssW, cssH);
  renderer.setScissor(0, 0, cssW, cssH);
  renderer.setScissorTest(true);
}

function drawFrame(renderer: RendererLike) {
  if (holdingStill() || !state.orig || !state.scene || !state.camera || !gpuIdle()) return;
  replayBlit();
  syncViewport(renderer);
  applyFreeze(state.scene);
  state.orig(state.scene, state.camera);
  armFence();
}

function markReady() {
  if (state.ready || holdingStill()) return;
  state.ready = true;
  if (state.renderer) drawFrame(state.renderer);
  emitReady();
}

function schedulePoll() {
  if (pollScheduled || holdingStill()) return;
  pollScheduled = true;
  requestAnimationFrame(poll);
}

function beginCompile() {
  if (holdingStill() || !state.renderer || !state.scene || !state.camera) return;
  state.compileStarted = true;
  const run = () => {
    if (holdingStill()) return;
    if (canvasKitPending()) {
      state.compileStarted = false;
      schedulePoll();
      return;
    }
    try {
      state.renderer?.compile(state.scene as SceneLike, state.camera as object);
    } catch {
      state.compileFinished = true;
      markReady();
      return;
    }
    state.compileFinished = true;
    if (imgGl) stats.khr = !!imgGl.getExtension('KHR_parallel_shader_compile');
    schedulePoll();
  };
  const idle = window.requestIdleCallback;
  if (typeof idle === 'function') idle(run, { timeout: 250 });
  else requestAnimationFrame(run);
}

function poll() {
  pollScheduled = false;
  if (holdingStill()) return;
  if (!state.ready) {
    if (!state.compileStarted) {
      if (canvasKitPending()) {
        schedulePoll();
        return;
      }
      beginCompile();
      return;
    }
    if (!state.compileFinished) {
      schedulePoll();
      return;
    }
    const gl = imgGl;
    const ext = gl?.getExtension('KHR_parallel_shader_compile');
    if (!gl || !ext || programs.size === 0) {
      markReady();
      return;
    }
    for (const program of programs) {
      if (!gl.getProgramParameter(program, COMPLETION_STATUS_KHR)) {
        schedulePoll();
        return;
      }
    }
    markReady();
    return;
  }
  if (pendingBlit && gpuIdle()) replayBlit();
  if (fence) schedulePoll();
}

function wrappedRender(renderer: RendererLike, scene: SceneLike, camera: object) {
  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  if (holdingStill()) return;
  if (useImmediateCopy()) {
    if (!state.orig) return;
    applyFreeze(scene);
    state.orig(scene, camera);
    return;
  }
  if (!state.compileStarted) {
    schedulePoll();
    return;
  }
  if (!state.ready || !state.orig) return;
  drawFrame(renderer);
}

/** Wrap an img-fx WebGLRenderer so it does not draw until the program can be used. */
export function patchImgFxRenderer(renderer: RendererLike) {
  const canvas = renderer.domElement;
  if (!imgFxCanvases.has(canvas)) return;
  imgGl = renderer.getContext();
  noteGl(imgGl);
  state.orig = renderer.render.bind(renderer);
  state.renderer = renderer;
  state.glCanvas = canvas;
  renderer.debug.checkShaderErrors = false;
  renderer.render = (scene, camera) => wrappedRender(renderer, scene, camera);
}

export function installImgFxGate() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  gateWindow().__imgFxStats = stats;
  detectSoftwareGl();

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

  const origLink = WebGL2RenderingContext.prototype.linkProgram;
  WebGL2RenderingContext.prototype.linkProgram = function linkProgram(program: WebGLProgram) {
    origLink.call(this, program);
    const canvas = this.canvas;
    if (canvas instanceof HTMLCanvasElement && imgFxCanvases.has(canvas)) {
      programs.add(program);
      imgGl = this;
    }
  };

  origDraw = CanvasRenderingContext2D.prototype.drawImage;
  const savedDraw = origDraw;
  CanvasRenderingContext2D.prototype.drawImage = function drawImage(
    this: CanvasRenderingContext2D,
    ...args: Parameters<CanvasRenderingContext2D['drawImage']>
  ) {
    const source = args[0];
    if (source instanceof HTMLCanvasElement && this.canvas.classList.contains('image-gen-shader')) {
      if (useImmediateCopy()) return savedDraw.apply(this, args);
      if (holdingStill()) return;
      pendingBlit = { ctx: this, args };
      replayBlit();
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
