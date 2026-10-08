/**
 * Keeps img-fx's pixels, and keeps its draws off the main thread.
 *
 * img-fx has one fragment program. The intro and the grey mosaic stage are
 * different u_dotMode paths of that program, and both used to show up first as
 * a full-size draw plus a synchronous canvas readback. SwiftShader has no
 * KHR_parallel_shader_compile, so that readback waits out the compile.
 *
 * Before the card animates, each dot-mode path is drawn once at 1×1 behind a
 * fence. The first real frame is the same draw img-fx would have issued, also
 * fenced, and it is copied only after clientWaitSync(timeout 0) says the GPU
 * is done. Mosaic samples take that same path: no per-frame readback while a
 * fence is open, and the last finished sample is reused. A GPU that cannot
 * keep a frame under budget drops that stage's internal resolution (and, by
 * not stacking draws, its frame rate). A fast GPU stays at full resolution,
 * so the frame matches an immediate drawImage. If warmup is still running
 * after a few seconds the card holds the last finished frame instead of
 * waiting on the GPU.
 */

const COMPLETION_STATUS_KHR = 0x91b1;
const WARM_BUDGET_MS = 3000;
const FRAME_BUDGET_MS = 140;
const MIN_SCALE = 0.25;
const SAMPLE_PX = 64;
const BRIEF_WAIT_NS = 4_000_000;

type UniformNum = { value: number };
type UniformRes = { value: { x: number; y: number; set: (x: number, y: number) => void } };
type UniformBag = {
  u_time?: UniformNum;
  u_dotMode?: UniformNum;
  u_fillOpacity?: UniformNum;
  u_dpr?: UniformNum;
  u_resolution?: UniformRes;
};

type SceneLike = {
  traverse: (fn: (obj: { material?: { uniforms?: UniformBag } }) => void) => void;
};

type ViewportBox = {
  x: number;
  y: number;
  z: number;
  w: number;
  copy: (other: { x: number; y: number; z: number; w: number }) => ViewportBox;
};

type RendererLike = {
  domElement: HTMLCanvasElement;
  debug: { checkShaderErrors: boolean };
  render: (scene: SceneLike, camera: object) => void;
  compile: (scene: SceneLike, camera: object) => void;
  getContext: () => WebGL2RenderingContext;
  getPixelRatio: () => number;
  setPixelRatio: (value: number) => void;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  getViewport: (target: ViewportBox) => ViewportBox;
  setViewport: (x: number, y: number, w: number, h: number) => void;
  setScissor: (x: number, y: number, w: number, h: number) => void;
  setScissorTest: (on: boolean) => void;
};

type GateWindow = typeof globalThis & {
  __imgFxFreezeTime?: number;
  __imgFxUseDrawImage?: boolean;
  /** Locks the internal render scale (tests). Omitted in normal use. */
  __imgFxScale?: number;
  __imgFxStats?: ImgFxStats;
};

type DrawArgs = Parameters<CanvasRenderingContext2D['drawImage']>;

type SrcRect = { sx: number; sy: number; sw: number; sh: number };

type JobKind = 'warm' | 'calibrate' | 'heat' | 'visible' | 'sample';

type Job = {
  kind: JobKind;
  mode?: number;
  scale: number;
  at: number;
  missed: number;
};

type ImgFxStats = {
  khr: boolean;
  held: boolean;
  visibleScale: number;
  sampleScale: number;
  warmMs: number[];
  frames: { kind: JobKind; ms: number; scale: number }[];
  boot: { kind: JobKind; ms: number; scale: number; missed: number; at: number }[];
};

const stats: ImgFxStats = {
  khr: false,
  held: false,
  visibleScale: 1,
  sampleScale: 1,
  warmMs: [],
  frames: [],
  boot: [],
};

const imgFxCanvases = new WeakSet<HTMLCanvasElement>();
const programs = new Set<WebGLProgram>();
const readyListeners = new Set<() => void>();

let installed = false;
let shaderReady = false;
let imgGl: WebGL2RenderingContext | null = null;
let khr: object | null = null;
let origDraw: CanvasRenderingContext2D['drawImage'] | null = null;
let origRender: ((scene: SceneLike, camera: object) => void) | null = null;
let renderer: RendererLike | null = null;
let scene: SceneLike | null = null;
let camera: object | null = null;
let glCanvas: HTMLCanvasElement | null = null;

let booted = false;
let bootAt = 0;
let readyEmitted = false;
let sizeRestored = false;
let savedPr = 1;
let savedCssW = 8;
let savedCssH = 8;
let cssW = 168;
let cssH = 168;
let pollScheduled = false;
let allowBriefWait = true;
let scaleCap = 1;
let calibratePasses = 0;

let bootSeeded = false;
let queue: Array<{ kind: JobKind; mode?: number; scale: number }> = [];
let inflight: Job | null = null;
let fence: WebGLSync | null = null;
let bufferKind: 'empty' | 'visible' | 'sample' = 'empty';
let visibleSrc: SrcRect | null = null;
let sampleSrc: SrcRect | null = null;
let visiblePresented = false;
let shaderCtx: CanvasRenderingContext2D | null = null;
let shaderArgs: DrawArgs | null = null;
let sampleReq: { dot: number; fill: number } | null = null;
let sampleQueued = false;
let cacheCanvas: HTMLCanvasElement | null = null;
let cacheCtx: CanvasRenderingContext2D | null = null;
let rendersThisTurn = 0;
let turnReset = false;

function gateWindow(): GateWindow {
  return globalThis as GateWindow;
}

function useImmediateCopy() {
  return gateWindow().__imgFxUseDrawImage === true;
}

function isImgFxSource(source: unknown): source is HTMLCanvasElement {
  return source instanceof HTMLCanvasElement && imgFxCanvases.has(source);
}

function pushFrame(kind: JobKind, ms: number, scale: number, missed = 0) {
  stats.frames.push({ kind, ms, scale });
  if (stats.frames.length > 40) stats.frames.shift();
  if (stats.boot.length < 16) stats.boot.push({ kind, ms, scale, missed, at: Math.round(performance.now()) });
  stats.visibleScale = visibleScale();
  stats.sampleScale = sampleScale();
}

function visibleScale() {
  return stats.visibleScale;
}

function sampleScale() {
  return stats.sampleScale;
}

function setVisibleScale(value: number) {
  stats.visibleScale = Math.max(MIN_SCALE, Math.min(1, value));
}

function setSampleScale(value: number) {
  stats.sampleScale = Math.max(MIN_SCALE, Math.min(1, value));
}

function grab(): UniformBag {
  const found: UniformBag = {};
  scene?.traverse((obj) => {
    const uniforms = obj.material?.uniforms;
    if (!uniforms) return;
    if (uniforms.u_dotMode) found.u_dotMode = uniforms.u_dotMode;
    if (uniforms.u_fillOpacity) found.u_fillOpacity = uniforms.u_fillOpacity;
    if (uniforms.u_time) found.u_time = uniforms.u_time;
    if (uniforms.u_dpr) found.u_dpr = uniforms.u_dpr;
    if (uniforms.u_resolution) found.u_resolution = uniforms.u_resolution;
  });
  return found;
}

function applyFreeze() {
  const freeze = gateWindow().__imgFxFreezeTime;
  if (typeof freeze !== 'number') return;
  const time = grab().u_time;
  if (time) time.value = freeze;
}

function emitReady() {
  if (shaderReady) return;
  shaderReady = true;
  readyListeners.forEach((listener) => listener());
}

function viewportBox(): ViewportBox {
  return {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    copy(other) {
      this.x = other.x;
      this.y = other.y;
      this.z = other.z;
      this.w = other.w;
      return this;
    },
  };
}

function libraryRenderIndex() {
  const index = rendersThisTurn;
  rendersThisTurn += 1;
  if (!turnReset) {
    turnReset = true;
    queueMicrotask(() => {
      rendersThisTurn = 0;
      turnReset = false;
    });
  }
  return index;
}

function schedulePoll() {
  if (pollScheduled) return;
  pollScheduled = true;
  // rAF does not run while SwiftShader is busy, even though the main thread is
  // idle. A timer still fires, so the fence can be retired without a new draw.
  setTimeout(poll, 32);
}

function srcFor(scale: number): SrcRect {
  const pr = renderer?.getPixelRatio() || 1;
  const sw = Math.max(1, Math.round(cssW * scale * pr));
  const sh = Math.max(1, Math.round(cssH * scale * pr));
  const height = glCanvas?.height ?? sh;
  return { sx: 0, sy: Math.max(0, height - sh), sw, sh };
}

function drawScaled(scale: number, draw: () => void): SrcRect {
  const uniforms = grab();
  const res = uniforms.u_resolution?.value;
  const savedX = res?.x ?? cssW;
  const savedY = res?.y ?? cssH;
  const savedDpr = uniforms.u_dpr?.value ?? 1;
  if (scale < 0.999 && res) {
    res.set(savedX * scale, savedY * scale);
    if (uniforms.u_dpr) uniforms.u_dpr.value = savedDpr * scale;
  }
  renderer?.setViewport(0, 0, Math.max(1, cssW * scale), Math.max(1, cssH * scale));
  renderer?.setScissor(0, 0, Math.max(1, cssW * scale), Math.max(1, cssH * scale));
  renderer?.setScissorTest(true);
  try {
    draw();
  } finally {
    if (res) res.set(savedX, savedY);
    if (uniforms.u_dpr) uniforms.u_dpr.value = savedDpr;
  }
  return srcFor(scale);
}

/** Compile each branch with a single fragment. Viewport stays inside the 1×1 buffer. */
function drawOnePixel(draw: () => void) {
  const uniforms = grab();
  const res = uniforms.u_resolution?.value;
  const savedX = res?.x ?? 1;
  const savedY = res?.y ?? 1;
  const savedDpr = uniforms.u_dpr?.value ?? 1;
  if (res) res.set(1, 1);
  if (uniforms.u_dpr) uniforms.u_dpr.value = 1;
  renderer?.setViewport(0, 0, 1, 1);
  renderer?.setScissor(0, 0, 1, 1);
  renderer?.setScissorTest(true);
  try {
    draw();
  } finally {
    if (res) res.set(savedX, savedY);
    if (uniforms.u_dpr) uniforms.u_dpr.value = savedDpr;
  }
}

function arm(kind: JobKind, scale: number) {
  if (!imgGl) return;
  if (fence) imgGl.deleteSync(fence);
  fence = imgGl.fenceSync(imgGl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  imgGl.flush();
  inflight = { kind, scale, at: performance.now(), missed: 0 };
  schedulePoll();
}

/** Retire the in-flight draw once the GPU is done. timeout 0 never blocks. */
function takeFence(timeoutNs: number) {
  if (!inflight || !fence || !imgGl) return false;
  const flags = timeoutNs > 0 ? imgGl.SYNC_FLUSH_COMMANDS_BIT : 0;
  const status = imgGl.clientWaitSync(fence, flags, timeoutNs);
  const done = status === imgGl.ALREADY_SIGNALED || status === imgGl.CONDITION_SATISFIED;
  if (!done) {
    if (timeoutNs > 0) allowBriefWait = false;
    return false;
  }
  imgGl.deleteSync(fence);
  fence = null;
  const job = inflight;
  inflight = null;
  onJobDone(job);
  return true;
}

function presentVisible(src: SrcRect, scale: number) {
  if (!shaderCtx || !origDraw || !glCanvas) return;
  const dest = shaderArgs;
  const dw = dest && dest.length === 9 ? (dest[7] as number) : shaderCtx.canvas.width;
  const dh = dest && dest.length === 9 ? (dest[8] as number) : shaderCtx.canvas.height;
  const dx = dest && dest.length === 9 ? (dest[5] as number) : 0;
  const dy = dest && dest.length === 9 ? (dest[6] as number) : 0;
  const args: DrawArgs =
    scale > 0.999 && dest && dest.length === 9
      ? dest
      : [glCanvas, src.sx, src.sy, src.sw, src.sh, dx, dy, dw, dh];
  shaderCtx.save();
  shaderCtx.globalCompositeOperation = 'copy';
  shaderCtx.imageSmoothingEnabled = scale < 0.999;
  origDraw.apply(shaderCtx, args as DrawArgs);
  shaderCtx.restore();
  visiblePresented = true;
}

function ensureCache() {
  if (cacheCanvas && cacheCtx) return;
  cacheCanvas = document.createElement('canvas');
  cacheCtx = cacheCanvas.getContext('2d');
}

function captureSample(src: SrcRect, scale: number) {
  if (!origDraw || !glCanvas || !cacheCtx || !cacheCanvas) return;
  if (cacheCanvas.width !== SAMPLE_PX || cacheCanvas.height !== SAMPLE_PX) {
    cacheCanvas.width = SAMPLE_PX;
    cacheCanvas.height = SAMPLE_PX;
  }
  cacheCtx.save();
  cacheCtx.globalCompositeOperation = 'copy';
  cacheCtx.imageSmoothingEnabled = scale < 0.999;
  origDraw.call(cacheCtx, glCanvas, src.sx, src.sy, src.sw, src.sh, 0, 0, SAMPLE_PX, SAMPLE_PX);
  cacheCtx.restore();
}

function paintCache(ctx: CanvasRenderingContext2D) {
  if (!origDraw) return;
  ctx.save();
  ctx.globalCompositeOperation = 'copy';
  ctx.imageSmoothingEnabled = false;
  if (cacheCanvas && cacheCtx && cacheCanvas.width > 0) {
    origDraw.call(ctx, cacheCanvas, 0, 0, cacheCanvas.width, cacheCanvas.height, 0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.restore();
}

function withMode(mode: number, fill: number, draw: () => void) {
  const uniforms = grab();
  const dot = uniforms.u_dotMode?.value;
  const prevFill = uniforms.u_fillOpacity?.value;
  if (uniforms.u_dotMode) uniforms.u_dotMode.value = mode;
  if (uniforms.u_fillOpacity) uniforms.u_fillOpacity.value = fill;
  try {
    draw();
  } finally {
    if (uniforms.u_dotMode && dot !== undefined) uniforms.u_dotMode.value = dot;
    if (uniforms.u_fillOpacity && prevFill !== undefined) uniforms.u_fillOpacity.value = prevFill;
  }
}

function submitDraw(kind: JobKind, scale: number, mode?: number, fill?: number) {
  if (!origRender || !scene || !camera || !renderer) return;
  applyFreeze();
  const run = () => {
    const draw = () => origRender!(scene!, camera!);
    if (kind === 'warm') drawOnePixel(draw);
    else if (kind === 'visible' || kind === 'calibrate') visibleSrc = drawScaled(scale, draw);
    else sampleSrc = drawScaled(scale, draw);
  };
  if (mode === undefined) run();
  else withMode(mode, fill ?? 0, run);
  if (kind === 'sample' || kind === 'heat') bufferKind = 'sample';
  else if (kind !== 'warm') bufferKind = 'visible';
  arm(kind, scale);
}

function restoreSize() {
  if (sizeRestored || !renderer) return;
  sizeRestored = true;
  renderer.setPixelRatio(savedPr);
  renderer.setSize(savedCssW, savedCssH, false);
}

function khrReady() {
  if (!khr || !imgGl || programs.size === 0) return true;
  for (const program of programs) {
    if (!imgGl.getProgramParameter(program, COMPLETION_STATUS_KHR)) return false;
  }
  return true;
}

function seedAfterWarm() {
  if (bootSeeded) return;
  bootSeeded = true;
  restoreSize();
  // The first 1×1 draw pays for shader compile and can take seconds on
  // SwiftShader. That cost is not the per-pixel cost. A GPU that can compile
  // in parallel starts at full resolution. Without that, the first real frame
  // starts at a quarter and climbs only when a frame finishes before the next
  // poll. A slow real frame steps the scale down.
  stats.held = false;
  const locked = gateWindow().__imgFxScale;
  if (typeof locked === 'number') {
    setVisibleScale(locked);
    scaleCap = visibleScale();
  } else if (stats.khr) setVisibleScale(1);
  else {
    // Half resolution still rasterizes long enough to stall the compositor on
    // SwiftShader. Start at a quarter and climb only when a frame finishes
    // before the next poll, which is what a normal GPU does.
    setVisibleScale(MIN_SCALE);
  }
  setSampleScale(visibleScale());
  queue.push({ kind: 'calibrate', scale: visibleScale() });
  queue.push({ kind: 'heat', scale: sampleScale() });
}

function onJobDone(job: Job) {
  const ms = Math.round(performance.now() - job.at);
  pushFrame(job.kind, ms, job.scale, job.missed);
  // missed === 0 means the GPU finished before the next frame. Wall time
  // includes scheduling delay, so it is not the signal for "fast".
  const fast = job.missed === 0;
  const slow = job.missed > 0 && ms > FRAME_BUDGET_MS;

  if (job.kind === 'warm') {
    stats.warmMs.push(ms);
    if (!queue.some((item) => item.kind === 'warm')) seedAfterWarm();
    return;
  }

  if (job.kind === 'calibrate') {
    calibratePasses += 1;
    if (typeof gateWindow().__imgFxScale === 'number') {
      if (visibleSrc) presentVisible(visibleSrc, job.scale);
      return;
    }
    const stepped = Math.min(scaleCap, job.scale * 2);
    if (fast && stepped > job.scale + 0.01 && calibratePasses < 5) {
      setVisibleScale(stepped);
      setSampleScale(visibleScale());
      queue = queue.filter((item) => item.kind !== 'heat');
      queue.unshift({ kind: 'heat', scale: sampleScale() });
      queue.unshift({ kind: 'calibrate', scale: visibleScale() });
      return;
    }
    if (slow && job.scale > MIN_SCALE + 0.01 && calibratePasses < 5) {
      scaleCap = job.scale / 2;
      setVisibleScale(scaleCap);
      setSampleScale(visibleScale());
      queue = queue.filter((item) => item.kind !== 'heat');
      queue.unshift({ kind: 'heat', scale: sampleScale() });
      queue.unshift({ kind: 'calibrate', scale: visibleScale() });
      return;
    }
    setVisibleScale(job.scale);
    setSampleScale(job.scale);
    if (visibleSrc) presentVisible(visibleSrc, job.scale);
    return;
  }

  if (job.kind === 'heat') {
    ensureCache();
    if (sampleSrc) captureSample(sampleSrc, job.scale);
    return;
  }

  if (job.kind === 'visible') {
    if (visibleSrc) presentVisible(visibleSrc, job.scale);
    if (slow && typeof gateWindow().__imgFxScale !== 'number') setVisibleScale(visibleScale() / 2);
    return;
  }

  if (job.kind === 'sample') {
    ensureCache();
    if (sampleSrc) captureSample(sampleSrc, job.scale);
    if (slow && typeof gateWindow().__imgFxScale !== 'number') setSampleScale(sampleScale() / 2);
  }
}

function pumpBoot() {
  if (inflight || readyEmitted) return;
  if (!khrReady()) {
    schedulePoll();
    return;
  }
  const next = queue.shift();
  if (!next) {
    readyEmitted = true;
    emitReady();
    return;
  }
  if (next.kind !== 'warm') restoreSize();
  if (next.kind === 'warm') {
    renderer?.setPixelRatio(1);
    renderer?.setSize(1, 1, false);
    const fill = next.mode && next.mode > 0.5 ? 0.18 : 0;
    submitDraw('warm', 1, next.mode, fill);
    return;
  }
  if (next.kind === 'calibrate') {
    submitDraw('calibrate', next.scale);
    return;
  }
  submitDraw('heat', next.scale, 0, 0);
}

function pumpLive() {
  if (inflight || !readyEmitted || !visiblePresented) return;
  if (sampleQueued && sampleReq) {
    sampleQueued = false;
    const req = sampleReq;
    submitDraw('sample', sampleScale(), req.dot, req.fill);
  }
}

function poll() {
  pollScheduled = false;
  if (inflight) {
    if (!takeFence(0)) {
      inflight.missed += 1;
      if (performance.now() - inflight.at > WARM_BUDGET_MS) stats.held = true;
      schedulePoll();
      return;
    }
  }
  if (!readyEmitted) pumpBoot();
  else pumpLive();
}

function boot(nextRenderer: RendererLike, nextScene: SceneLike, nextCamera: object) {
  if (booted) return;
  booted = true;
  bootAt = performance.now();
  renderer = nextRenderer;
  scene = nextScene;
  camera = nextCamera;
  glCanvas = nextRenderer.domElement;
  imgGl = nextRenderer.getContext();
  savedPr = nextRenderer.getPixelRatio() || 1;
  savedCssW = (glCanvas?.width || 8) / savedPr;
  savedCssH = (glCanvas?.height || 8) / savedPr;
  const box = viewportBox();
  nextRenderer.getViewport(box);
  if (box.z >= 1 && box.w >= 1) {
    cssW = box.z;
    cssH = box.w;
  }
  gateWindow().__imgFxStats = stats;
  const start = () => {
    try {
      nextRenderer.compile(nextScene, nextCamera);
    } catch {
      /* draw anyway */
    }
    khr = imgGl?.getExtension('KHR_parallel_shader_compile') ?? null;
    stats.khr = !!khr;
    const dot = grab().u_dotMode?.value ?? 1;
    const modes = [...new Set([dot, 0, 1, 2])];
    queue = modes.map((mode) => ({ kind: 'warm' as const, mode, scale: 1 }));
    pumpBoot();
  };
  const idle = window.requestIdleCallback;
  if (typeof idle === 'function') idle(() => start(), { timeout: 250 });
  else setTimeout(start, 0);
}

function wrappedRender(nextRenderer: RendererLike, nextScene: SceneLike, nextCamera: object) {
  renderer = nextRenderer;
  scene = nextScene;
  camera = nextCamera;
  if (!glCanvas) glCanvas = nextRenderer.domElement;
  if (useImmediateCopy()) {
    if (!origRender) return;
    applyFreeze();
    origRender(nextScene, nextCamera);
    emitReady();
    return;
  }
  const index = readyEmitted ? libraryRenderIndex() : 0;
  if (!readyEmitted) {
    boot(nextRenderer, nextScene, nextCamera);
    return;
  }
  if (index > 0) {
    const uniforms = grab();
    sampleReq = {
      dot: uniforms.u_dotMode?.value ?? 0,
      fill: uniforms.u_fillOpacity?.value ?? 0,
    };
    sampleQueued = true;
  }
  if (inflight) {
    schedulePoll();
    return;
  }
  if (index === 0) {
    submitDraw('visible', visibleScale());
    if (stats.khr && allowBriefWait) takeFence(BRIEF_WAIT_NS);
    return;
  }
  if (sampleQueued && visiblePresented) {
    const req = sampleReq;
    if (!req) return;
    sampleQueued = false;
    submitDraw('sample', sampleScale(), req.dot, req.fill);
    if (stats.khr && allowBriefWait) takeFence(BRIEF_WAIT_NS);
  }
}

/** Wrap an img-fx WebGLRenderer so it does not draw until the program can be used. */
export function patchImgFxRenderer(next: RendererLike) {
  const canvas = next.domElement;
  if (!imgFxCanvases.has(canvas)) return;
  imgGl = next.getContext();
  origRender = next.render.bind(next);
  renderer = next;
  glCanvas = canvas;
  next.debug.checkShaderErrors = false;
  next.render = (nextScene, nextCamera) => wrappedRender(next, nextScene, nextCamera);
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
    ...args: DrawArgs
  ) {
    const source = args[0];
    if (!isImgFxSource(source)) return savedDraw.apply(this, args);
    if (useImmediateCopy()) return savedDraw.apply(this, args);

    if (this.canvas.classList.contains('image-gen-shader')) {
      shaderCtx = this;
      shaderArgs = args;
      if (!readyEmitted) return;
      if (bufferKind === 'visible' && visibleSrc && !fence) {
        presentVisible(visibleSrc, visibleScale());
      }
      return;
    }

    if (bufferKind === 'sample' && sampleSrc && !fence) {
      ensureCache();
      captureSample(sampleSrc, sampleScale());
      paintCache(this);
      return;
    }
    paintCache(this);
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
