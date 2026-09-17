import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { installWebPanCss } from '@/src/libdev/installWebPanCss';

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

function WebRoot() {
  installWebPanCss();
  return <App />;
}

/**
 * Load CanvasKit WASM once at the web root. Do not wrap WithSkiaWeb per card —
 * that remounts WASM and Aborts. Demos render Inner after this promise.
 */
LoadSkiaWeb({
  locateFile: (file) => `/${file}`,
}).then(async () => {
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

  renderRootComponent(WebRoot);
});
