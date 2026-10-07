import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

function canUseWebGL() {
  try {
    const el = document.createElement('canvas');
    const gl =
      el.getContext('webgl2') ||
      el.getContext('webgl') ||
      el.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    }
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * One CanvasKit load for the whole page. `LoadSkiaWeb` is a singleton; call
 * this from `ensureCanvasKit` only. CanvasKitInit uses
 * `WebAssembly.instantiateStreaming` when `/canvaskit.wasm` is
 * `application/wasm` (see `vercel.json`).
 */
export function bootCanvasKit(): Promise<void> {
  return LoadSkiaWeb({
    locateFile: (file) => `/${file}`,
  }).then(() => {
    const ck = (
      globalThis as {
        CanvasKit?: {
          MakeWebGLCanvasSurface: (canvas: unknown, ...args: unknown[]) => unknown;
          MakeSWCanvasSurface: (canvas: unknown) => unknown;
        };
      }
    ).CanvasKit;

    // Don't call WebGL on the real Skia canvas when the GPU is missing —
    // a failed getContext('webgl2') poisons the element for software surfaces.
    if (ck?.MakeSWCanvasSurface && !canUseWebGL()) {
      ck.MakeWebGLCanvasSurface = (canvas) => ck.MakeSWCanvasSurface(canvas);
    }
  });
}
