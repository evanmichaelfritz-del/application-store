/**
 * Keeps img-fx's pixels, and takes the synchronous GPU readback off the main thread.
 *
 * img-fx renders a ShaderMaterial into a hidden WebGL canvas and then
 * `drawImage`s that canvas onto the visible 2D canvas. The first copy waits
 * while the GPU compiles the fragment shader; every later copy waits for that
 * frame's draw (a ReadPixels stall).
 *
 * 1. Link with KHR_parallel_shader_compile and poll COMPLETION_STATUS_KHR on
 *    animation frames before the first draw.
 * 2. After each draw, fence the GPU and do not read the canvas back until
 *    clientWaitSync(timeout 0) says the frame is finished. The blit is then the
 *    same drawImage img-fx would have done, without waiting on the GPU.
 *    A new draw is not submitted while that fence is open, so frames stay in order.
 */

const COMPLETION_STATUS_KHR = 0x91b1;

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

type GateWindow = typeof globalThis & {
  __imgFxFreezeTime?: number;
  __imgFxUseDrawImage?: boolean;
};

type GateState = {
  compileStarted: boolean;
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

const state: GateState = {
  compileStarted: false,
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

function isImgFxSource(source: unknown): source is HTMLCanvasElement {
  return source instanceof HTMLCanvasElement && imgFxCanvases.has(source);
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
  if (shaderReady) return;
  shaderReady = true;
  readyListeners.forEach((listener) => listener());
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
  if (!pendingBlit || !origDraw || !drew || !gpuIdle()) return;
  const { ctx, args } = pendingBlit;
  // Same copy img-fx does in it(), issued only after the GPU fence signals so
  // the readback does not wait on the shader. `copy` writes the buffer as-is.
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
  // Match img-fx it(): viewport in CSS pixels; three scales by the renderer pixel ratio.
  renderer.setViewport(0, 0, cssW, cssH);
  renderer.setScissor(0, 0, cssW, cssH);
  renderer.setScissorTest(true);
}

function drawFrame(renderer: RendererLike) {
  if (!state.orig || !state.scene || !state.camera || !gpuIdle()) return;
  replayBlit();
  syncViewport(renderer);
  applyFreeze(state.scene);
  state.orig(state.scene, state.camera);
  armFence();
}

function markReady() {
  if (state.ready) return;
  state.ready = true;
  if (state.renderer) drawFrame(state.renderer);
  emitReady();
}

function schedulePoll() {
  if (pollScheduled) return;
  pollScheduled = true;
  requestAnimationFrame(poll);
}

function poll() {
  pollScheduled = false;
  if (!state.ready) {
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
  if (useImmediateCopy()) {
    if (!state.orig) return;
    applyFreeze(scene);
    state.orig(scene, camera);
    return;
  }
  if (!state.compileStarted) {
    state.compileStarted = true;
    // Shader setup stays off the React commit that first mounts the card.
    requestAnimationFrame(() => {
      try {
        renderer.compile(scene, camera);
      } catch {
        markReady();
        return;
      }
      schedulePoll();
    });
    return;
  }
  if (!state.ready || !state.orig) return;
  // it() has just set the viewport. Publish the finished frame, then submit
  // the next one. Skip the submit while the GPU is still on the previous frame.
  drawFrame(renderer);
}

/** Wrap an img-fx WebGLRenderer so it does not draw until the program can be used. */
export function patchImgFxRenderer(renderer: RendererLike) {
  const canvas = renderer.domElement;
  if (!imgFxCanvases.has(canvas)) return;
  imgGl = renderer.getContext();
  state.orig = renderer.render.bind(renderer);
  state.renderer = renderer;
  state.glCanvas = canvas;
  renderer.debug.checkShaderErrors = false;
  renderer.render = (scene, camera) => wrappedRender(renderer, scene, camera);
}

export function installImgFxGate() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

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
    if (isImgFxSource(source) && this.canvas.classList.contains('image-gen-shader')) {
      if (useImmediateCopy()) return savedDraw.apply(this, args);
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
    // img-fx clears the shader canvas immediately before the readback. The
    // deferred blit clears at the moment it copies a finished frame.
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
