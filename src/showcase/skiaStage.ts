/**
 * Offline stage for the two Yogesh Skia cards.
 * The page shell stays the shared showcase document. This stage is the live
 * card: the esbuild bundle, CanvasKit started from inlined wasm bytes, and
 * the Latin variable Geist faces.
 */

const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

export const SKIA_SHOWCASE = new Set(['yogesh-thinking-orbs', 'yogesh-orb-creator']);

type ByteReader = (publicPath: string) => Promise<Uint8Array>;

function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes);
}

function face(family: string, src: string): string {
  return `@font-face {
  font-family: ${family};
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: ${src};
  unicode-range: ${LATIN_RANGE};
}`;
}

export async function skiaPreviewParts(
  id: string,
  read: ByteReader,
): Promise<{ html: string; css: string; script: string }> {
  const [bundle, glue, wasm, geist, mono, license] = await Promise.all([
    read(`/showcase/${id}.js`).then(decodeUtf8),
    read('/showcase/canvaskit.js').then(decodeUtf8),
    read('/canvaskit.wasm'),
    read('/fonts/geist-latin-wght-normal.woff2'),
    read('/fonts/geist-mono-latin-wght-normal.woff2'),
    read('/fonts/geist-OFL.txt').then(decodeUtf8),
  ]);
  if (bundle.includes('</script')) throw new Error(`${id} bundle contains a script closer`);
  if (glue.includes('</script')) throw new Error('canvaskit glue contains a script closer');
  const wasmB64 = bytesToBase64(wasm);
  const geistUri = `url("data:font/woff2;base64,${bytesToBase64(geist)}") format("woff2")`;
  const monoUri = `url("data:font/woff2;base64,${bytesToBase64(mono)}") format("woff2")`;
  const comment = `/*\n${license.trim().replace(/\*\//g, '* /')}\n*/`;
  const css = `${comment}
${face('Geist', geistUri)}
${face('Geist_400Regular', geistUri)}
${face('"Geist Mono"', monoUri)}
${face('GeistMono_500Medium', monoUri)}
html, body { background: #000; }
#parity-root { width: 100%; }`;
  const html = `<div id="parity-root"></div>
<script type="text/plain" id="skia-card">${bundle}</script>`;
  const script = `function wasmBytes(b64) {
  var binary = atob(b64);
  var bytes = new Uint8Array(binary.length);
  var i = 0;
  for (; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
var WASM_BYTES = wasmBytes(${JSON.stringify(wasmB64)});
${glue}
function canUseWebGL() {
  try {
    var el = document.createElement('canvas');
    var gl = el.getContext('webgl2') || el.getContext('webgl') || el.getContext('experimental-webgl');
    if (gl && gl.getExtension) {
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
    return !!gl;
  } catch (error) {
    return false;
  }
}
var viewportReady = new Promise(function (resolve) {
  var framed = false;
  try { framed = window.parent !== window; } catch (error) { framed = true; }
  if (!framed) {
    window.__SHOWCASE_WINDOW__ = { width: window.innerWidth, height: window.innerHeight };
    resolve();
    return;
  }
  window.addEventListener('message', function (event) {
    if (event.source !== window.parent) return;
    var data = event.data;
    if (!data || !data.showcaseViewport) return;
    window.__SHOWCASE_WINDOW__ = data.showcaseViewport;
    window.dispatchEvent(new Event('showcase-viewport'));
    resolve();
  });
  parent.postMessage({ showcaseViewportPlease: 1 }, '*');
});
var kitReady = CanvasKitInit({ wasmBinary: WASM_BYTES });
Promise.all([viewportReady, kitReady]).then(function (ready) {
  var ck = ready[1];
  globalThis.CanvasKit = ck;
  if (ck.MakeSWCanvasSurface && !canUseWebGL()) {
    ck.MakeWebGLCanvasSurface = function (canvas) { return ck.MakeSWCanvasSurface(canvas); };
  }
  if (typeof global === 'undefined') window.global = window;
  var node = document.getElementById('skia-card');
  (0, eval)(node ? node.textContent : '');
}).catch(function (error) {
  console.error(error);
});`;
  return { html, css, script };
}
