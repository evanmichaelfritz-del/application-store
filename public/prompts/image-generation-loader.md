# AGENT_PROMPT — Image generation loader

Recreate this image-generation loader only. Build from the behaviour and values in this prompt. Do not read or copy Pro/paid source or page source. Work from the public demo behaviour only. The recreate targets this asset, not the author's site.

The page card and Copy run one WebGL2 worker. The worker source below is `public/img-fx/organic-worker.js`. Copy embeds those same bytes as `WORKER_SOURCE` and builds the worker from a blob URL. The page card loads `/img-fx/organic-worker.js`. Both resolve a pool photo through the mosaic. Desktop 1280 is the gate.

A 1280×900 desktop capture, device pixel ratio 1, compared the visible canvas to the pool photos and to `/img-fx/organic-still@2x.png` after a 48×48 downscale. Luma is `0.2126 R + 0.7152 G + 0.0722 B`. Mean absolute error is in luma on 0–255.

| Surface | Clock | What the canvas is | Error |
| --- | --- | --- | --- |
| Page card | 0ms | baked mosaic still | luma 166.9. Mean absolute error about 52–64 against the three photos |
| Page card | 400–3200ms | live light field | luma about 235. Mean absolute error about 8–10 against the baked still, about 120 against the photos |
| Page card | 4000ms | mosaic again | the auto cycle has returned to the field |
| Page card | 5000–6200ms | `/img-fx/2.png` | mean absolute error 0.96, then 0.88 |
| Copy | 0ms | `/img-fx/2.png` | mean absolute error 1.75. Auto had already reached a hold during the load wait |
| Copy | 400–2600ms | live light field | mean absolute error about 8–10 against the baked still |
| Copy | 3200ms | mosaic | the field is back |
| Copy | 4000–6200ms | `/img-fx/3.png` | mean absolute error 1.37, then 0.85 |

The two clocks are not the same frame. `startAuto` waits `Math.random() * 1500`, and the next photo is a random other index. A resolved frame matches its pool photo within 1 luma. The wake field sits about 8–10 luma from the baked still at 48×48.

## Geometry

| Part | Value |
| --- | --- |
| Card | 168×168 CSS pixels, `border-radius: 20px`, `overflow: hidden`, background `#f5f5f5` |
| Page stage | height 200, radius 14, background `#f9f9f9`, 1px border `rgba(0, 0, 0, 0.04)`, card centred |
| Still canvas | 336×336 backing store, absolute inset 0, drawn with `/img-fx/organic-still@2x.png` until the first worker bitmap |
| View canvas | hidden until that first bitmap, then the still canvas hides |
| Shader buffer | `css × min(devicePixelRatio, 1.25)`, at least 1 |
| Display buffer | `css × min(devicePixelRatio, 2)`, at least 1. The bitmap is blitted into this buffer with smoothing off |
| Photos | `/img-fx/1.png`, `/img-fx/2.png`, `/img-fx/3.png`, fetched and posted as image bitmaps |
| Reveal, page | stage button, label `Reveal`, absolute right 10 bottom 10, height 28, padding 0 10, radius 8, 1px `rgba(0,0,0,0.08)`, fill `rgba(243,243,243,0.94)`, type 12px `#17181c`. Hover fill `#d9d9e2` and border `rgba(0,0,0,0.35)`. Pressed fill `#b7b7c2` and border `rgba(0,0,0,0.5)` |
| Reveal, Copy | shared column button under the card, gap 18, height 32, padding 0 12, radius 8, 1px `rgba(0,0,0,.08)`, fill `#fff`, type 500 13px `#17181c` |

`cssW` falls back to 168 when the canvas has no client width. `cssH` falls back to `cssW`. Copy's canvas element starts at width 168 height 168 and is then resized to the display buffer. `REF_DIM` is 320. Cell counts scale with `css / 320` so a 168px card keeps square cells.

## States

| State | How you get there | What you see |
| --- | --- | --- |
| `idle` | boot, the end of a fade when auto is off, or `scheduleIdle` | Shader opacity 1, overlay opacity 0. The mosaic is the pixels-organic light field: effect 22, dot mode 1, card background `#f5f5f5`. The page paints the baked still on top until the first bitmap. |
| `reveal` | auto timer, or Reveal while the phase is `idle` | One pool photo dissolves in. Shader opacity falls from 1 to 0. Overlay opacity is 1. |
| `visible` | `paintReveal` reaches `REVEAL_SEC` | Shader opacity 0. The photo is the full cover. Auto holds `HOLD_MS` 2000, then hides. A Reveal click uses `holdMode` `manual` and stays until the next click. |
| `hide` | the hold timer, or Reveal while the phase is `reveal`, `visible`, or `hide` | Overlay opacity falls from 1 to 0 and shader opacity rises from 0 to 1 over `FADE_MS` 300. Then auto waits again, or the phase returns to `idle` with `running` false. |

Reveal posts `reveal` from `idle` and `hide` from the other three phases. `manualReveal` returns immediately when `paused` is true or the phase is already `reveal`, `visible`, or `hide`.

The next photo is `Math.floor(Math.random() * images.length)`, drawn again while it matches `imageIndex` and the pool has more than one image. An empty pool retries `beginReveal` after 500ms.

## Timing

| Piece | Duration | Easing | Notes |
| --- | --- | --- | --- |
| First auto wait | `Math.random() * 1500` ms | none | `startAuto` calls `scheduleIdle` with that delay. It runs once, when `running` is still false. |
| Later idle wait | `(2 + Math.random() * 2) * 1000` ms | none | 2000–4000ms. `scheduleIdle()` with no argument. |
| Reveal mask | `REVEAL_SEC` 3s | `easeOutCubic`, `1 - (1 - t)³` | `t = min(elapsed / 3, 1)`. Shader opacity is `1 - eased` until `t` is 1, then 0. At 1.0s, `t` is 1/3 and eased is 19/27 (about 0.704), so shader opacity is about 0.296. At 1.5s, eased is 0.875 and shader opacity is 0.125. |
| Pixel dissolve | `PIX_SEC` 2.55s | the same curve | `y = easeOutCubic(min(elapsed / 2.55, 1))`. This clock finishes before the 3s mask. |
| Hold | `HOLD_MS` 2000ms | none | Armed in `finishReveal` when `holdMode` is not `manual`. `manual` clears the timer and stays on the photo. |
| Fade | `FADE_MS` 300ms | linear `min((now - hideStart) / 300, 1)` | Shader opacity is that value. Overlay opacity is 1 minus it. |
| Resume during `visible` | `Math.min(HOLD_MS, 500)` ms | none | Only when `holdMode` is not `manual`. A manual hold stays. |
| Frame gap | 50–150ms | step | `d = 100 - ((now - frameT0) % 100)`. The timeout is `d + 100` when `d < 50`, otherwise `d`. `frameT0` is `performance.now()` at boot. |
| Shader clock | seconds | linear | `40 + (performance.now() - t0) / 1000` while `frozen` is null. A `time` message stores `frozen` and the clock stays there. |

`easeOutCubic` is `1 - Math.pow(1 - t, 3)`. The pixel threshold uses a second `smooth` of `e * e * (3 - 2 * e)`.

## Reveal math

Samples are taken every other reveal frame into a 64×64 buffer (`SAMPLE` is 64). The sample pass draws with dot mode 0, fill 0, and output mode 1, then `readPixels`, flips Y, and downscales with high-quality smoothing.

The mask compares each sample texel with `COLOR4` `[0.961, 0.961, 0.961]`:

- `n = exp(-8 * (dr² + dg² + db²))`, channels in 0–1
- `thresh = 1 - eased * (1 + SOFTNESS)` with `SOFTNESS` 0.5
- `e = smooth(clamp01((n - thresh) / SOFTNESS))`
- mask alpha is `e * 255`, rounded

The dissolve grid uses `base = 6 + 0.22 * 74` (22.28). Columns are `max(2, floor(base * cssW / 320))`. Rows use `cssH`. At 168×168 that is 11×11. Each cell stores `0.07 + Math.random() * 0.86` once per reveal. `gain` is `1 / 0.14`. Cell alpha is `clamp01(0.5 + (value - y) * gain)`. The photo is covered into the display buffer with a 0.6% inset (`6e-3` of the shorter source edge), high-quality smoothing on the cover, and smoothing off when the cell grid is scaled back up. The mask is then applied with `destination-in`.

## Setup

The worker canvas is an `OffscreenCanvas`. The context is:

`getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true })`

A missing context posts `{ type: 'error' }` and draws nothing. The program binds attribute 0 to `position` and uploads one triangle, `Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0])`, `gl.TRIANGLES`, three vertices. Depth test and blend are off. The viewport matches the shader canvas.

`boot` writes these uniforms. Colours go through the sRGB linearisation `c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)` inside `set3`.

| Uniform | Value |
| --- | --- |
| `u_resolution` | shader canvas width and height |
| `u_dpr` | the capped shader ratio, fallback 1 |
| `u_speed` | 0.3 |
| `u_intensity` | 0.85 |
| `u_scale` | 1 |
| `u_direction` | `25 * Math.PI / 180` |
| `u_softness` | 0.76 |
| `u_distortion` | 0.3 |
| `u_complexity` | 0.2 |
| `u_shape` | 0.52 |
| `u_flicker` | 0 |
| `u_vignette`, `u_vigOpacity` | 0, 0 |
| `u_blur` | 1 |
| `u_highlight` | 0.7 |
| `u_shaderOpacity` | 1 at boot. The composite then multiplies the bitmap by the phase opacity |
| `u_cellSize` | 0.22 |
| `u_gap` | 0.14 |
| `u_dotSize` | 0.8 |
| `u_dotSoftness` | 0.1 |
| `u_dotOpacity` | 0.68 |
| `u_hlScale` | 0.8 |
| `u_fillOpacity` | 0.18 on the visible mosaic pass |
| `u_edgeFade` | 20 |
| `u_fadeStr` | 1 |
| `u_dotMode` | 1 on the visible pass. The mask sample pass uses 0 |
| `u_outMode` | 0 on the visible pass. The mask sample pass uses 1 |
| `u_effect` | 22 |
| `u_sweepEase` | 0 |
| `u_color1` … `u_color7` | `#e3e3e3`, `#ffffff`, `#f5f5f5`, `#f5f5f5`, `#080808`, `#f5f5f5`, `#f5f5f5`, each alpha 1 |
| `u_cardBg` | `#f5f5f5` |

`present` fills the display canvas with `#f5f5f5`, draws the shader bitmap at `shaderOpacity` with smoothing off, then the photo overlay at `overlayOpacity` with smoothing on, and posts `transferToImageBitmap()`. The host blits that bitmap with `imageSmoothingEnabled = false` and closes it. Dot mode 1 is the square cell grid (`u_dotMode < 1.5`), with gap `u_gap * 0.35 / scaleBoost`. The visible pass calls `drawShader(1, 0.18, 0)`.

Messages the host posts: `start` (once), `photos`, `hold`, `auto`, `reveal`, `hide`. The worker posts `phase`, `frame` with the bitmap, and `error`.

The page card waits on `canvasKitPending()` before `start`, and its live flag is `inView && !document.hidden && !canvasKitPending()`. Copy's live flag is `inView && !document.hidden`. Both use `IntersectionObserver` with threshold 0 and root margin 0. Off screen or a hidden document sets `hold` true and `auto` false. `hold` stops `present` without clearing the phase. Coming back posts `hold: false` and `present` restarts when no timer is armed. `visibilitychange` cancels the animation frame and syncs immediately.

Copy HTML, Copy CSS, the host, the worker, and the page card are the blocks below.

## Gotchas

- The first paint on the page is the baked still, or a flat `#f5f5f5` fill when that image has not decoded. Copy has one canvas, so `#f5f5f5` shows until the first bitmap. After that frame both surfaces are the worker's bitmap.
- Two loads are not frame-locked. The first wait, the idle wait, the cell pattern, and the photo index are `Math.random()`. Compare a settled photo to its file. Compare the wake to the light-field uniforms, not to the other surface's clock.
- The wake field is about 8–10 luma from `/img-fx/organic-still@2x.png` at 48×48. The resolved photo is within 1 luma of its pool file.
- `manualReveal` does nothing while paused. A card that has scrolled away ignores Reveal until it is back in view and the auto message has cleared `paused`.
- Leaving pause during a manual `visible` hold does not start the 500ms resume timer. An automatic hold hides 500ms after the card returns.
- There is no reduced-motion branch. Auto keeps cycling while the card is in view and the document is visible.
- `beginHide` returns when already `hide` or `idle`, and when `paused`.
- The worker clock starts at 40 seconds, so the field is already in motion on the first bitmap.
- Photos are same-origin fetches. The recreate serves `/img-fx/1.png`, `/img-fx/2.png`, `/img-fx/3.png`, and `/img-fx/organic-still@2x.png` with the worker.
- The fragment below is the light path this asset runs (effect 22, dot mode 1, five blur taps, photo reveal). Keep it byte for byte with the worker file.

## Known gaps

- Phone widths are a known gap. The card is measured at a 1280 desktop and stays 168×168. It does not reflow.
- A second load picks a different photo and a different wait, so a side-by-side frame will not match. The settled photo still matches its own file within 1 luma.
- During the wake, the live field is about 8–10 luma from the baked still at 48×48. That still is the placeholder, drawn until the first bitmap.
- Copy's Reveal button sits under the card. The page button sits at the stage's bottom-right and has the hover and pressed fills above. The mosaic and the phase clock are the asset.

## Checklist

- [ ] Card is 168×168, radius 20, background `#f5f5f5`. Shader dpr caps at 1.25. Display dpr caps at 2.
- [ ] The worker is the program below, on an `OffscreenCanvas`, WebGL2, the context flags in Setup, effect 22, dot mode 1, and the uniform table.
- [ ] Idle is the light-field mosaic. The page shows `/img-fx/organic-still@2x.png` until the first bitmap.
- [ ] Reveal spends 3s on `easeOutCubic` and 2.55s on the pixel dissolve. At 1.0s shader opacity is about 0.296. At 1.5s it is 0.125. At 3s the photo is fully covered and the shader opacity is 0.
- [ ] Auto hold is 2000ms. Fade is 300ms linear. The first auto wait is under 1500ms. Later idle waits are 2000–4000ms.
- [ ] Reveal from `idle` posts `reveal` and holds until the next click. Reveal from `reveal`, `visible`, or `hide` posts `hide`.
- [ ] The resolved frame matches `/img-fx/1.png`, `/img-fx/2.png`, or `/img-fx/3.png` within 1 luma at 48×48. The photo is a random other index.
- [ ] Off-screen and a hidden document post `hold` and pause auto. Returning restarts `present`. A manual hold survives that pause.
- [ ] Frames are scheduled from `frameT0` with the 50–150ms gap above. The host blits with smoothing off.
- [ ] Desktop 1280 is the gate. Phone widths are a known gap.

## Copy HTML

```html
<div class="col">
  <div class="t-img-fx-card" id="card">
    <canvas id="mosaic" width="168" height="168" aria-label="Generated image mosaic"></canvas>
  </div>
  <button class="trigger" type="button" id="reveal">Reveal</button>
</div>
```

## Copy CSS

```css
* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f9f9f9;
  color: #17181c;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}
button.trigger {
  appearance: none;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.08);
  background: #fff;
  color: #17181c;
  font: 500 13px/1 Inter, system-ui, sans-serif;
  cursor: pointer;
}
.col { display: flex; flex-direction: column; align-items: center; gap: 18px; }

.t-img-fx-card {
  width: 168px; height: 168px; border-radius: 20px; overflow: hidden;
  background: #f5f5f5;
}
canvas { display: block; width: 168px; height: 168px; }
```

## Host

`WORKER_SOURCE` is the program in the next section, as text. Copy assigns that string and passes it to the blob. The page card skips the blob and loads `/img-fx/organic-worker.js`.

```js
(function () {
  var view = document.getElementById('mosaic');
  var card = document.getElementById('card');
  var cssW = view.clientWidth || 168;
  var cssH = view.clientHeight || cssW;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  var canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = Math.max(1, Math.floor(cssW * dpr));
  var h = Math.max(1, Math.floor(cssH * dpr));
  var displayW = Math.max(1, Math.floor(cssW * canvasDpr));
  var displayH = Math.max(1, Math.floor(cssH * canvasDpr));
  view.width = displayW;
  view.height = displayH;
  var worker = new Worker(URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' })));
  var phase = 'idle';
  var inView = true;
  worker.onmessage = function (ev) {
    var data = ev.data || {};
    if (data.bmp && view) {
      var ctx = view.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(data.bmp, 0, 0, view.width, view.height);
      }
      if (data.bmp.close) data.bmp.close();
    }
    if (data.phase) phase = data.phase;
  };
  worker.postMessage({
    type: 'start',
    w: w,
    h: h,
    dpr: dpr,
    cssW: cssW,
    cssH: cssH,
    displayW: displayW,
    displayH: displayH
  });
  var urls = ['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png'];
  Promise.all(urls.map(function (src) {
    return fetch(src).then(function (res) { return res.blob(); }).then(function (blob) { return createImageBitmap(blob); });
  })).then(function (bitmaps) {
    worker.postMessage({ type: 'photos', bitmaps: bitmaps }, bitmaps);
  });
  var lastHold = null;
  var lastAuto = null;
  var raf = 0;
  function sync() {
    var live = inView && !document.hidden;
    var hold = !live;
    var auto = live;
    if (hold !== lastHold) {
      lastHold = hold;
      worker.postMessage({ type: 'hold', hold: hold });
    }
    if (auto !== lastAuto) {
      lastAuto = auto;
      worker.postMessage({ type: 'auto', on: auto });
    }
    raf = requestAnimationFrame(sync);
  }
  if (typeof IntersectionObserver === 'function' && card) {
    var observer = new IntersectionObserver(function (entries) {
      inView = entries.some(function (entry) { return entry.isIntersecting; });
    }, { root: null, rootMargin: '0px', threshold: 0 });
    observer.observe(card);
  }
  document.getElementById('reveal').addEventListener('click', function () {
    var active = phase === 'reveal' || phase === 'visible' || phase === 'hide';
    worker.postMessage({ type: active ? 'hide' : 'reveal' });
  });
  document.addEventListener('visibilitychange', function () { cancelAnimationFrame(raf); sync(); });
  raf = requestAnimationFrame(sync);
})();
```

## Program

```js
/*!MIT License

Copyright (c) 2026 Jakub Antalik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* Organic loader, off the main thread.

   The full img-fx program is one 29KB fragment. Its first draw blocks other
   GL contexts for seconds on a slow GPU, so this file keeps the pixels-organic
   light path (effect 22, dot mode 1) and loops the blur taps. The photo
   reveal (shaderColor4 mask, pixel dissolve, 2000ms hold, 300ms fade) runs
   here too. The page only blits the finished bitmap. */
const VERT = `#version 300 es
precision highp float;
precision highp int;
in vec3 position;
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const FRAG = `#version 300 es
precision highp float;
precision highp int;
layout(location = 0) out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
` + `\n` + `uniform vec2 u_resolution;
  uniform float u_dpr;
  uniform float u_time;
  uniform vec3 u_color1, u_color2, u_color3, u_color4, u_color5, u_color6, u_color7, u_cardBg;
  uniform float u_alpha1, u_alpha2, u_alpha3, u_alpha4, u_alpha5, u_alpha6, u_alpha7;
  uniform float u_speed, u_intensity, u_scale, u_direction;
  uniform float u_softness, u_distortion, u_complexity, u_shape, u_flicker;
  uniform float u_vignette, u_vigOpacity, u_blur, u_highlight, u_shaderOpacity;
  uniform float u_cellSize, u_gap, u_dotSize, u_dotSoftness, u_dotOpacity, u_hlScale, u_fillOpacity, u_edgeFade, u_fadeStr;
  uniform float u_dotMode;
  uniform float u_outMode;
  uniform int u_effect;
  uniform int u_sweepEase;

  // Reference card edge length (CSS px) at which the original preset cellSize
  // gives the canonical cell count. Cell PIXEL size stays constant across card
  // sizes by scaling gridSize proportionally to (currentCssDim / REF_DIM).
  const float REF_DIM = 320.0;

  /** Anisotropic cell count: returns the number of cells along x and y so that
   *  each cell stays SQUARE in screen space regardless of the card's aspect
   *  ratio. A 600×300 card gets twice as many cells horizontally as vertically;
   *  cells stay the same physical size as on a 300×300 card. */
  vec2 gridCounts(float baseCount) {
    vec2 cssRes = u_resolution / max(u_dpr, 0.0001);
    return max(vec2(2.0), floor(baseCount * cssRes / REF_DIM));
  }

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 ox = floor(x_ + 0.5);
    vec3 a0 = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p, float oct) {
    float val = 0.0, amp = 0.5;
    int n = int(oct);
    for (int i = 0; i < 4; i++) {
      if (i >= n) break;
      val += amp * snoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  float nfbm(vec2 p) { return fbm(p, 2.0 + u_complexity * 2.0); }



  vec3 softBlend(float a, float b, float c) {
    a = clamp(a, 0.0, 1.0); a *= a;
    b = clamp(b, 0.0, 1.0); b *= b;
    c = clamp(c, 0.0, 1.0); c *= c;
    float d = clamp(a * 0.7 + c * 0.3, 0.0, 1.0); d *= d;
    float e = clamp(b * 0.5 + c * 0.5, 0.0, 1.0); e *= e;
    a *= u_alpha1; b *= u_alpha2; c *= u_alpha3; d *= u_alpha4; e *= u_alpha5;
    float total = a + b + c + d + e;
    float floorW = max(0.001 - total, 0.0);
    vec3 fallback = (u_color1 + u_color2 + u_color3 + u_color4 + u_color5) * 0.2;
    return (u_color1 * a + u_color2 * b + u_color3 * c + u_color4 * d + u_color5 * e + fallback * floorW) / (total + floorW);
  }

  vec2 warp(vec2 p, float t) {
    float str = u_distortion * 2.0;
    return vec2(
      nfbm(p + vec2(t * 0.1, 0.0)),
      nfbm(p + vec2(0.0, t * 0.12) + 5.0)
    ) * str;
  }





  vec3 computeEffect(vec2 uv, float aspect, float t, float dist, float soft, float cpx, float shp) {
    vec2 p = (uv - 0.5) * u_scale;
    p.x *= aspect;
    p += vec2(cos(u_direction), sin(u_direction)) * t * 0.15;
    vec3 col = vec3(0.0);

vec2 w  = warp(p * 0.7, t * 0.5);
      vec2 w2 = warp(p * 0.4 + w * 0.3, t * 0.3);
      vec2 wp = p + w * (0.4 + dist * 0.6);
      float n1 = snoise(wp * (1.4 + cpx * 1.6) + t * 0.14);
      float n2 = snoise((wp + w2 * dist * 0.4) * (2.0 + cpx * 2.0) + vec2(3.0, 7.0) - t * 0.1);
      float ridge1 = 1.0 - abs(n1);
      ridge1 = pow(ridge1, 5.0 + shp * 12.0);
      float ridge2 = 1.0 - abs(n2);
      ridge2 = pow(ridge2, 4.0 + shp * 10.0);
      float base = (n1 + n2) * 0.25 + 0.5;
      float w1 = (base * 0.6 + ridge1 * 1.2) * u_intensity;
      float w2c = ((1.0 - base) * 0.6 + ridge2 * 1.0) * u_intensity;
      float w3 = (ridge1 * 0.8 + ridge2 * 0.6) * u_intensity;
      col = softBlend(w1, w2c, w3);

    return col;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    float t = u_time * u_speed;
    float dist = u_distortion;
    float soft = u_softness;
    float cpx = u_complexity;
    float shp = u_shape;

    vec2 sampleUV = uv;
    if (u_dotMode > 0.5) {
      vec2 gs = gridCounts(6.0 + u_cellSize * 74.0);
      if (u_dotMode > 1.5) {
        gs = max(vec2(2.0), floor(gs * (1.0 - u_gap * 0.8)));
      }
      sampleUV = (floor(uv * gs) + vec2(0.5)) / gs;
    }

    float r = u_blur * 0.02;
    vec2 taps[5];
    taps[0] = vec2(0.0);
    taps[1] = vec2( r, 0.0);
    taps[2] = vec2(-r, 0.0);
    taps[3] = vec2(0.0,  r);
    taps[4] = vec2(0.0, -r);
    float tw[5];
    tw[0] = u_blur < 0.01 ? 1.0 : 0.4;
    tw[1] = u_blur < 0.01 ? 0.0 : 0.15;
    tw[2] = tw[1]; tw[3] = tw[1]; tw[4] = tw[1];
    vec3 col = vec3(0.0);
    for (int i = 0; i < 5; i++) {
      col += computeEffect(sampleUV + taps[i], aspect, t, dist, soft, cpx, shp) * tw[i];
    }

    vec3 baseCol = col;
    if (u_dotMode < 0.5) {
      col = pow(col, vec3(1.3));
    }

    // CSS-pixel distance to the nearest edge — keeps the vignette / edge-fade
    // bands a consistent physical width on every side of any aspect ratio.
    vec2 cssRes = u_resolution / max(u_dpr, 0.0001);
    vec2 cssCoord = uv * cssRes;
    float edgeDistPx = min(
      min(cssCoord.x, cssRes.x - cssCoord.x),
      min(cssCoord.y, cssRes.y - cssCoord.y)
    );
    float vigRangePx = 40.0 * (1.0 + u_vignette * 3.0);
    float vig = (edgeDistPx * edgeDistPx) / (vigRangePx * vigRangePx);
    vig = smoothstep(0.0, 1.0, vig);
    col *= mix(1.0, vig, u_vignette * u_vigOpacity);

    float colorAlpha = (u_alpha1 + u_alpha2 + u_alpha3 + u_alpha4 + u_alpha5) / 5.0;
    if (colorAlpha < 0.999) {
      vec3 c1d = col - u_color1, c2d = col - u_color2, c3d = col - u_color3, c4d = col - u_color4, c5d = col - u_color5;
      float prox1 = exp(-8.0 * dot(c1d, c1d));
      float prox2 = exp(-8.0 * dot(c2d, c2d));
      float prox3 = exp(-8.0 * dot(c3d, c3d));
      float prox4 = exp(-8.0 * dot(c4d, c4d));
      float prox5 = exp(-8.0 * dot(c5d, c5d));
      float pTotal = prox1 + prox2 + prox3 + prox4 + prox5 + 0.0001;
      colorAlpha = (prox1*u_alpha1 + prox2*u_alpha2 + prox3*u_alpha3 + prox4*u_alpha4 + prox5*u_alpha5) / pTotal;
    }
    float alpha = colorAlpha;

    if (u_dotMode > 0.5) {
      vec2 gridSize = gridCounts(6.0 + u_cellSize * 74.0);
      if (u_dotMode > 1.5) {
        gridSize = max(vec2(2.0), floor(gridSize * (1.0 - u_gap * 0.8)));
      }
      // cellLocal is in [0,1] within each cell. Because gridSize was chosen so
      // that cell PIXEL size is square, distance / mask math here works in
      // screen-square units even though we're operating in normalised cell uv.
      vec2 cellLocal = fract(uv * gridSize);

      float hlFactor = 0.0;
      if (u_highlight > 0.01 || u_hlScale > 0.01) {
        vec2 cellCenter = (floor(uv * gridSize) + vec2(0.5)) / gridSize;
        vec2 cp2 = (cellCenter - 0.5) * u_scale;
        cp2.x *= aspect;
        float lw = sin(cp2.x * 3.0 + t * 1.5) * 0.5 + 0.5;
        lw *= sin(cp2.y * 2.5 - t * 1.1) * 0.5 + 0.5;
        lw += (snoise(cp2 * 2.0 + t * 0.6) * 0.5 + 0.5) * 0.3;
        hlFactor = clamp(lw, 0.0, 1.0);
        hlFactor *= hlFactor;
      }

      float scaleBoost = 1.0 + smoothstep(0.2, 0.8, hlFactor) * u_hlScale * 1.2;

      float mask = 1.0;
      if (u_dotMode < 1.5) {
        float gapW = u_gap * 0.35 / scaleBoost;
        if (gapW > 0.003) {
          mask = step(gapW, cellLocal.x) * step(gapW, 1.0 - cellLocal.x)
               * step(gapW, cellLocal.y) * step(gapW, 1.0 - cellLocal.y);
        }
      } else {
        // Render the circular dot mask in screen-pixel space rather than
        // cell-local UV. We map the cell-local offset to actual pixels
        // (cellPx = u_resolution / gridSize), then apply a 1-pixel AA
        // floor to the smoothstep edge so the dot rim is crisp and
        // properly anti-aliased even at u_dotSoftness near 0. The user
        // softness slider still scales linearly on top of the floor.
        // No fwidth() / GL_OES_standard_derivatives needed - dPx is
        // already in pixel units, so a fixed 1-px edge IS pixel-perfect.
        // gridCounts() already keeps cells square in screen space, so
        // pxOffset traces true circles (not ellipses) on any aspect.
        vec2 cellPx = u_resolution / gridSize;
        vec2 pxOffset = (cellLocal - 0.5) * cellPx;
        float dPx = length(pxOffset);
        float minCellPx = min(cellPx.x, cellPx.y);
        float radiusPx = u_dotSize * 0.5 * minCellPx * scaleBoost;
        // 0.5-px AA floor (1-px total smoothstep ramp) keeps the rim
        // pixel-perfect at u_dotSoftness=0 while letting the user softness
        // value dominate at the bundled preset defaults (e.g. softness=0.1
        // on a ~28-px cell yields softPx=0.56 -> ~1.1-px ramp, matching
        // the original cell-local behaviour). A larger floor (e.g. 1.0)
        // would widen low-softness dots and visually lighten dot presets.
        float aaPx = 0.5;
        float softPx = u_dotSoftness * 0.2 * minCellPx;
        float edgePx = max(aaPx, softPx);
        mask = 1.0 - smoothstep(radiusPx - edgePx, radiusPx + edgePx, dPx);
      }

      if (u_highlight > 0.01) {
        float hl = hlFactor * u_highlight;
        col = col * (1.0 + hl * 2.5) + vec3(hl * hl * 0.3);
      }

      if (u_edgeFade > 0.5 && u_fadeStr > 0.005) {
        float ef = smoothstep(0.0, u_edgeFade, edgeDistPx);
        mask *= mix(1.0, ef, u_fadeStr);
      }

      float baseOpacity = (u_dotMode < 1.5) ? u_fillOpacity : 0.0;
      alpha = colorAlpha * mix(baseOpacity, u_dotOpacity, mask);

      float bgLum  = dot(u_cardBg, vec3(0.299, 0.587, 0.114));
      float colLum = dot(baseCol, vec3(0.299, 0.587, 0.114));
      alpha *= smoothstep(0.0, 0.33, abs(colLum - bgLum));
    }

    float aOut = alpha * u_shaderOpacity;
    vec3 straight = clamp(col, vec3(0.0), vec3(1.0));
    if (u_outMode > 0.5) {
      straight = mix(straight * 12.92, 1.055 * pow(straight, vec3(1.0/2.4)) - 0.055, step(0.0031308, straight));
      gl_FragColor = vec4(straight, 1.0);
    } else {
      vec3 premul = straight * aOut;
      premul = mix(premul * 12.92, 1.055 * pow(premul, vec3(1.0/2.4)) - 0.055, step(0.0031308, premul));
      gl_FragColor = vec4(premul, aOut);
    }
  }`;

let gl = null;
let program = null;
let canvas = null;
let hold = true;
let timer = 0;
let t0 = 0;
let frameT0 = 0;
let frozen = null;
let cssW = 168;
let cssH = 168;
let displayW = 168;
let displayH = 168;
let uTime = null;
let uDot = null;
let uFill = null;
let uOut = null;
let uRes = null;

const PRESET_BG = '#f5f5f5';
const CARD_BG = '#f5f5f5';
const REVEAL_SEC = 3;
const PIX_SEC = 2.55;
const HOLD_MS = 2000;
const FADE_MS = 300;
const SOFTNESS = 0.5;
const SAMPLE = 64;
const COLOR4 = [0.961, 0.961, 0.961];

let images = [];
let running = false;
let paused = true;
let phase = 'idle';
let continueAuto = false;
let holdMode = 'auto';
let imageIndex = -1;
let revealTimer = 0;
let revealStart = 0;
let hideStart = 0;
let currentImage = null;
let revealDone = false;
let sampleCache = null;
let sampleCounter = 0;
let pixPattern = null;
let pixCols = 0;
let pixRows = 0;

let outCanvas = null;
let outCtx = null;
let overlay = null;
let overlayCtx = null;
let cover = null;
let coverCtx = null;
let pixCanvas = null;
let pixCtx = null;
let dropCanvas = null;
let dropCtx = null;
let maskCanvas = null;
let maskCtx = null;
let sampleFull = null;
let sampleFullCtx = null;
let sampleSmall = null;
let sampleSmallCtx = null;

function lin(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function hex(h) {
  return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
}
function resolved(h) {
  return h.toLowerCase() === PRESET_BG ? CARD_BG : h;
}
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function smooth(e) {
  return e * e * (3 - 2 * e);
}
function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}
function set1(name, v) {
  const loc = gl.getUniformLocation(program, name);
  if (loc) gl.uniform1f(loc, v);
}
function set3(name, r, g, b) {
  const loc = gl.getUniformLocation(program, name);
  if (loc) gl.uniform3f(loc, lin(r), lin(g), lin(b));
}
function setPhase(next) {
  if (phase === next) return;
  phase = next;
  postMessage({ type: 'phase', phase });
}
function clearRevealTimer() {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = 0;
  }
}
function coverRect(img, dw, dh) {
  const n = dw / Math.max(1, dh);
  const o = img.width / Math.max(1, img.height);
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (o > n) {
    sw = img.height * n;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / n;
    sy = (img.height - sh) / 2;
  }
  const inset = Math.min(sw, sh) * 6e-3;
  if (sw - 2 * inset > 1 && sh - 2 * inset > 1) {
    sx += inset;
    sy += inset;
    sw -= 2 * inset;
    sh -= 2 * inset;
  }
  return [sx, sy, sw, sh];
}
function drawCover(ctx, img, dw, dh) {
  const [sx, sy, sw, sh] = coverRect(img, dw, dh);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
}
function ensure2d() {
  if (outCanvas) return;
  outCanvas = new OffscreenCanvas(displayW, displayH);
  outCtx = outCanvas.getContext('2d');
  overlay = new OffscreenCanvas(displayW, displayH);
  overlayCtx = overlay.getContext('2d');
  cover = new OffscreenCanvas(displayW, displayH);
  coverCtx = cover.getContext('2d');
  pixCanvas = new OffscreenCanvas(2, 2);
  pixCtx = pixCanvas.getContext('2d');
  dropCanvas = new OffscreenCanvas(2, 2);
  dropCtx = dropCanvas.getContext('2d');
  maskCanvas = new OffscreenCanvas(SAMPLE, SAMPLE);
  maskCtx = maskCanvas.getContext('2d');
  sampleFull = new OffscreenCanvas(displayW, displayH);
  sampleFullCtx = sampleFull.getContext('2d');
  sampleSmall = new OffscreenCanvas(SAMPLE, SAMPLE);
  sampleSmallCtx = sampleSmall.getContext('2d');
}
function boot(w, h, dpr, cssWidth, cssHeight, dispW, dispH) {
  cssW = cssWidth || 168;
  cssH = cssHeight || cssW;
  displayW = dispW || w;
  displayH = dispH || h;
  canvas = new OffscreenCanvas(Math.max(1, w), Math.max(1, h));
  gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  if (!gl) {
    postMessage({ type: 'error' });
    return;
  }
  program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  uRes = gl.getUniformLocation(program, 'u_resolution');
  if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
  set1('u_dpr', dpr || 1);
  set1('u_speed', 0.3);
  set1('u_intensity', 0.85);
  set1('u_scale', 1);
  set1('u_direction', 25 * Math.PI / 180);
  set1('u_softness', 0.76);
  set1('u_distortion', 0.3);
  set1('u_complexity', 0.2);
  set1('u_shape', 0.52);
  set1('u_flicker', 0);
  set1('u_vignette', 0);
  set1('u_vigOpacity', 0);
  set1('u_blur', 1);
  set1('u_highlight', 0.7);
  set1('u_shaderOpacity', 1);
  set1('u_cellSize', 0.22);
  set1('u_gap', 0.14);
  set1('u_dotSize', 0.8);
  set1('u_dotSoftness', 0.1);
  set1('u_dotOpacity', 0.68);
  set1('u_hlScale', 0.8);
  set1('u_fillOpacity', 0.18);
  set1('u_edgeFade', 20);
  set1('u_fadeStr', 1);
  set1('u_dotMode', 1);
  set1('u_outMode', 0);
  const effect = gl.getUniformLocation(program, 'u_effect');
  if (effect) gl.uniform1i(effect, 22);
  const sweep = gl.getUniformLocation(program, 'u_sweepEase');
  if (sweep) gl.uniform1i(sweep, 0);
  ['#e3e3e3', '#ffffff', '#f5f5f5', '#f5f5f5', '#080808', '#f5f5f5', '#f5f5f5'].forEach((h, i) => {
    const [r, g, b] = hex(resolved(h));
    set3('u_color' + (i + 1), r, g, b);
    set1('u_alpha' + (i + 1), 1);
  });
  const [br, bg, bb] = hex(CARD_BG);
  set3('u_cardBg', br, bg, bb);
  uTime = gl.getUniformLocation(program, 'u_time');
  uDot = gl.getUniformLocation(program, 'u_dotMode');
  uFill = gl.getUniformLocation(program, 'u_fillOpacity');
  uOut = gl.getUniformLocation(program, 'u_outMode');
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  t0 = performance.now();
  frameT0 = performance.now();
  ensure2d();
}
function drawShader(dotMode, fill, outMode) {
  const seconds = frozen == null ? 40 + (performance.now() - t0) / 1000 : frozen;
  if (uTime) gl.uniform1f(uTime, seconds);
  if (uDot) gl.uniform1f(uDot, dotMode);
  if (uFill) gl.uniform1f(uFill, fill);
  if (uOut) gl.uniform1f(uOut, outMode);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function takeSample() {
  drawShader(0, 0, 1);
  const w = canvas.width;
  const h = canvas.height;
  const pixels = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  if (sampleFull.width !== w || sampleFull.height !== h) {
    sampleFull.width = w;
    sampleFull.height = h;
  }
  const img = new ImageData(w, h);
  for (let y = 0; y < h; y++) {
    const src = (h - 1 - y) * w * 4;
    img.data.set(pixels.subarray(src, src + w * 4), y * w * 4);
  }
  sampleFullCtx.putImageData(img, 0, 0);
  sampleSmallCtx.imageSmoothingEnabled = true;
  sampleSmallCtx.imageSmoothingQuality = 'high';
  sampleSmallCtx.clearRect(0, 0, SAMPLE, SAMPLE);
  sampleSmallCtx.drawImage(sampleFull, 0, 0, SAMPLE, SAMPLE);
  return sampleSmallCtx.getImageData(0, 0, SAMPLE, SAMPLE).data;
}
function buildMask(sample, u) {
  const thresh = 1 - u * (1 + SOFTNESS);
  const img = maskCtx.createImageData(SAMPLE, SAMPLE);
  const data = img.data;
  for (let i = 0; i < SAMPLE * SAMPLE; i++) {
    const o = i * 4;
    const dr = sample[o] / 255 - COLOR4[0];
    const dg = sample[o + 1] / 255 - COLOR4[1];
    const db = sample[o + 2] / 255 - COLOR4[2];
    const n = Math.exp(-8 * (dr * dr + dg * dg + db * db));
    let e = (n - thresh) / SOFTNESS;
    e = smooth(clamp01(e));
    data[o] = 255;
    data[o + 1] = 255;
    data[o + 2] = 255;
    data[o + 3] = (e * 255 + 0.5) | 0;
  }
  maskCtx.putImageData(img, 0, 0);
}
function ensurePattern(cols, rows) {
  if (pixPattern && pixCols === cols && pixRows === rows && pixPattern.revealStart === revealStart) return;
  const n = cols * rows;
  const values = new Float32Array(n);
  const span = 1 - 2 * 0.07;
  for (let i = 0; i < n; i++) values[i] = 0.07 + Math.random() * span;
  pixPattern = values;
  pixPattern.revealStart = revealStart;
  pixCols = cols;
  pixRows = rows;
}
function paintPhoto(img) {
  overlayCtx.globalCompositeOperation = 'source-over';
  overlayCtx.globalAlpha = 1;
  overlayCtx.clearRect(0, 0, displayW, displayH);
  drawCover(overlayCtx, img, displayW, displayH);
}
function paintReveal(now) {
  const elapsed = (now - revealStart) / 1000;
  const linear = Math.min(elapsed / REVEAL_SEC, 1);
  const eased = easeOutCubic(linear);
  if (linear >= 1) {
    paintPhoto(currentImage);
    return { shaderOpacity: 0, done: true };
  }
  if ((sampleCounter++ & 1) === 0 || !sampleCache) sampleCache = takeSample();
  buildMask(sampleCache, eased);
  const base = 6 + 0.22 * 74;
  const cols = Math.max(2, Math.floor(base * cssW / 320));
  const rows = Math.max(2, Math.floor(base * cssH / 320));
  ensurePattern(cols, rows);
  if (pixCanvas.width !== cols || pixCanvas.height !== rows) {
    pixCanvas.width = cols;
    pixCanvas.height = rows;
  }
  if (dropCanvas.width !== cols || dropCanvas.height !== rows) {
    dropCanvas.width = cols;
    dropCanvas.height = rows;
    const blank = dropCtx.createImageData(cols, rows);
    for (let i = 0; i < blank.data.length; i += 4) {
      blank.data[i] = 255;
      blank.data[i + 1] = 255;
      blank.data[i + 2] = 255;
    }
    dropCtx.putImageData(blank, 0, 0);
  }
  const y = easeOutCubic(Math.min(elapsed / PIX_SEC, 1));
  const gain = 1 / (2 * 0.07);
  const drop = dropCtx.createImageData(cols, rows);
  for (let i = 0; i < pixPattern.length; i++) {
    const a = clamp01(0.5 + (pixPattern[i] - y) * gain);
    drop.data[i * 4] = 255;
    drop.data[i * 4 + 1] = 255;
    drop.data[i * 4 + 2] = 255;
    drop.data[i * 4 + 3] = (a * 255 + 0.5) | 0;
  }
  dropCtx.putImageData(drop, 0, 0);
  coverCtx.clearRect(0, 0, displayW, displayH);
  drawCover(coverCtx, currentImage, displayW, displayH);
  pixCtx.globalCompositeOperation = 'source-over';
  pixCtx.clearRect(0, 0, cols, rows);
  pixCtx.imageSmoothingEnabled = true;
  pixCtx.imageSmoothingQuality = 'high';
  pixCtx.drawImage(cover, 0, 0, displayW, displayH, 0, 0, cols, rows);
  pixCtx.globalCompositeOperation = 'destination-in';
  pixCtx.imageSmoothingEnabled = false;
  pixCtx.drawImage(dropCanvas, 0, 0);
  pixCtx.globalCompositeOperation = 'source-over';
  overlayCtx.globalCompositeOperation = 'source-over';
  overlayCtx.globalAlpha = 1;
  overlayCtx.clearRect(0, 0, displayW, displayH);
  overlayCtx.imageSmoothingEnabled = true;
  overlayCtx.imageSmoothingQuality = 'high';
  overlayCtx.drawImage(cover, 0, 0);
  overlayCtx.imageSmoothingEnabled = false;
  overlayCtx.drawImage(pixCanvas, 0, 0, cols, rows, 0, 0, displayW, displayH);
  pixCtx.globalCompositeOperation = 'source-over';
  pixCtx.clearRect(0, 0, cols, rows);
  pixCtx.imageSmoothingEnabled = true;
  pixCtx.imageSmoothingQuality = 'high';
  pixCtx.drawImage(maskCanvas, 0, 0, cols, rows);
  overlayCtx.imageSmoothingEnabled = false;
  overlayCtx.globalCompositeOperation = 'destination-in';
  overlayCtx.drawImage(pixCanvas, 0, 0, cols, rows, 0, 0, displayW, displayH);
  overlayCtx.globalCompositeOperation = 'source-over';
  overlayCtx.imageSmoothingEnabled = true;
  return { shaderOpacity: 1 - eased, done: false };
}
function finishReveal() {
  if (revealDone) return;
  revealDone = true;
  setPhase('visible');
  if (!running || paused) return;
  if (holdMode === 'manual') {
    clearRevealTimer();
    return;
  }
  clearRevealTimer();
  revealTimer = setTimeout(() => {
    revealTimer = 0;
    beginHide();
  }, HOLD_MS);
}
function scheduleIdle(delayMs) {
  if (!running || paused) return;
  setPhase('idle');
  currentImage = null;
  const ms = delayMs == null ? (2 + Math.random() * 2) * 1000 : delayMs;
  clearRevealTimer();
  revealTimer = setTimeout(() => {
    revealTimer = 0;
    beginReveal(true, 'auto');
  }, ms);
}
function beginReveal(cont, mode) {
  if (!running || paused) return;
  if (!images.length) {
    clearRevealTimer();
    revealTimer = setTimeout(() => beginReveal(cont, mode), 500);
    return;
  }
  let next = 0;
  if (images.length > 1) {
    do next = Math.floor(Math.random() * images.length);
    while (next === imageIndex);
  }
  imageIndex = next;
  continueAuto = cont;
  holdMode = mode;
  currentImage = images[next];
  revealStart = performance.now();
  revealDone = false;
  sampleCache = null;
  sampleCounter = 0;
  pixPattern = null;
  setPhase('reveal');
}
function beginHide() {
  if (paused || phase === 'hide' || phase === 'idle') return;
  setPhase('hide');
  hideStart = performance.now();
  clearRevealTimer();
  revealTimer = setTimeout(() => {
    revealTimer = 0;
    currentImage = null;
    if (continueAuto && running && !paused) scheduleIdle();
    else {
      running = false;
      setPhase('idle');
    }
  }, FADE_MS);
}
function startAuto() {
  if (running) return;
  running = true;
  paused = false;
  scheduleIdle(Math.random() * 1500);
}
function setPaused(next) {
  if (paused === next) return;
  paused = next;
  if (paused) {
    clearRevealTimer();
    return;
  }
  if (!running) return;
  if (phase === 'visible') {
    if (holdMode === 'manual') return;
    clearRevealTimer();
    revealTimer = setTimeout(() => {
      revealTimer = 0;
      beginHide();
    }, Math.min(HOLD_MS, 500));
    return;
  }
  if (phase === 'hide') {
    clearRevealTimer();
    revealTimer = setTimeout(() => {
      revealTimer = 0;
      currentImage = null;
      scheduleIdle();
    }, FADE_MS);
    return;
  }
  scheduleIdle();
}
function manualReveal() {
  if (paused || phase === 'reveal' || phase === 'visible' || phase === 'hide') return;
  const was = running;
  clearRevealTimer();
  if (!was) running = true;
  beginReveal(was, 'manual');
}
function opacities(now) {
  if (phase === 'reveal' && currentImage) {
    const frame = paintReveal(now);
    if (frame.done) finishReveal();
    return { shaderOpacity: frame.done ? 0 : frame.shaderOpacity, overlayOpacity: 1 };
  }
  if (phase === 'visible' && currentImage) {
    return { shaderOpacity: 0, overlayOpacity: 1 };
  }
  if (phase === 'hide') {
    const p = Math.min((now - hideStart) / FADE_MS, 1);
    return { shaderOpacity: p, overlayOpacity: 1 - p };
  }
  return { shaderOpacity: 1, overlayOpacity: 0 };
}
function present() {
  if (hold || !gl || !program || !outCtx) {
    timer = 0;
    return;
  }
  try {
    const now = performance.now();
    const fade = opacities(now);
    if (fade.shaderOpacity > 0) drawShader(1, 0.18, 0);
    outCtx.globalCompositeOperation = 'source-over';
    outCtx.globalAlpha = 1;
    outCtx.fillStyle = CARD_BG;
    outCtx.fillRect(0, 0, displayW, displayH);
    if (fade.shaderOpacity > 0) {
      outCtx.globalAlpha = fade.shaderOpacity;
      outCtx.imageSmoothingEnabled = false;
      outCtx.drawImage(canvas, 0, 0, displayW, displayH);
    }
    if (fade.overlayOpacity > 0) {
      outCtx.globalAlpha = fade.overlayOpacity;
      outCtx.imageSmoothingEnabled = true;
      outCtx.drawImage(overlay, 0, 0);
    }
    outCtx.globalAlpha = 1;
    const bmp = outCanvas.transferToImageBitmap();
    postMessage({ type: 'frame', bmp }, [bmp]);
  } catch (err) {
    postMessage({ type: 'error', message: String(err && err.message ? err.message : err) });
  }
  const d = 100 - ((performance.now() - frameT0) % 100);
  timer = setTimeout(present, d < 50 ? d + 100 : d);
}
self.onmessage = (ev) => {
  const msg = ev.data || {};
  if (msg.type === 'start') {
    if (!gl) boot(msg.w, msg.h, msg.dpr, msg.cssW, msg.cssH, msg.displayW, msg.displayH);
    return;
  }
  if (msg.type === 'photos') {
    images = msg.bitmaps || [];
    return;
  }
  if (msg.type === 'hold') {
    hold = !!msg.hold;
    if (!hold && !timer && gl) present();
    return;
  }
  if (msg.type === 'auto') {
    if (msg.on) {
      if (!running) startAuto();
      else setPaused(false);
    } else setPaused(true);
    return;
  }
  if (msg.type === 'reveal') {
    manualReveal();
    return;
  }
  if (msg.type === 'hide') {
    beginHide();
    return;
  }
  if (msg.type === 'time') frozen = msg.time;
};
```

## Card

The page card. Copy does not mount this module. Copy runs the host above.

```tsx
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { canvasKitPending } from '@/src/skia/ensureCanvasKit';

const IMAGES = ['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png'];
const MOSAIC_STILL = '/img-fx/organic-still@2x.png';
/** pixels-organic light preset `cardBg`. */
const CARD_BG = '#f5f5f5';

const cardStyle: CSSProperties = {
  width: 168,
  height: 168,
  borderRadius: 20,
  background: CARD_BG,
};

let mosaicStill: HTMLImageElement | null = null;

/** Start the 2× still fetch as soon as the card mounts, off the bundle. */
function preloadMosaicStill(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!mosaicStill) {
    const img = new Image();
    img.decoding = 'sync';
    img.src = MOSAIC_STILL;
    void img.decode?.().catch(() => {});
    mosaicStill = img;
  }
  return mosaicStill;
}

function drawMosaicStill(canvas: HTMLCanvasElement) {
  const img = mosaicStill;
  if (!img || !img.complete || !img.naturalWidth) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return true;
}

/** Sync paint so the card is never empty while the 2× still is loading. */
function paintPlaceholder(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, w, h);
}

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

type LoaderPhase = 'idle' | 'reveal' | 'visible' | 'hide';

function imageActive(phase: LoaderPhase) {
  return phase === 'reveal' || phase === 'visible' || phase === 'hide';
}

/**
 * The page creates no img-fx WebGL context. The worker compiles the
 * pixels-organic light field and runs the photo reveal.
 */
function WorkerLoader({
  inViewRef,
  workerRef,
  syncRef,
  onPhase,
}: {
  inViewRef: MutableRefObject<boolean>;
  workerRef: MutableRefObject<Worker | null>;
  syncRef: MutableRefObject<(() => void) | null>;
  onPhase: (phase: LoaderPhase) => void;
}) {
  const stillRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const onPhaseRef = useRef(onPhase);
  onPhaseRef.current = onPhase;

  useLayoutEffect(() => {
    const canvas = stillRef.current;
    if (!canvas) return;
    const img = preloadMosaicStill();
    if (drawMosaicStill(canvas)) return;
    paintPlaceholder(canvas);
    if (!img) return;
    const onLoad = () => {
      drawMosaicStill(canvas);
    };
    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const cssW = view.clientWidth || 168;
    const cssH = view.clientHeight || cssW;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));
    const displayW = Math.max(1, Math.floor(cssW * canvasDpr));
    const displayH = Math.max(1, Math.floor(cssH * canvasDpr));
    view.width = displayW;
    view.height = displayH;

    const worker = new Worker('/img-fx/organic-worker.js');
    workerRef.current = worker;
    let dead = false;
    let raf = 0;
    worker.onmessage = (ev: MessageEvent<{ bmp?: ImageBitmap; phase?: LoaderPhase }>) => {
      const data = ev.data || {};
      if (data.bmp && viewRef.current) {
        const ctx = viewRef.current.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(data.bmp, 0, 0, viewRef.current.width, viewRef.current.height);
          viewRef.current.style.visibility = 'visible';
          if (stillRef.current) stillRef.current.style.visibility = 'hidden';
        }
        data.bmp.close();
      }
      if (data.phase) onPhaseRef.current(data.phase);
    };

    let lastHold: boolean | null = null;
    let lastAuto: boolean | null = null;
    const sync = () => {
      if (dead) return;
      const live = inViewRef.current && !document.hidden && !canvasKitPending();
      const hold = !live;
      const auto = live;
      if (hold !== lastHold) {
        lastHold = hold;
        worker.postMessage({ type: 'hold', hold });
      }
      if (auto !== lastAuto) {
        lastAuto = auto;
        worker.postMessage({ type: 'auto', on: auto });
      }
      raf = requestAnimationFrame(sync);
    };
    const boot = () => {
      if (dead) return;
      if (canvasKitPending()) {
        raf = requestAnimationFrame(boot);
        return;
      }
      worker.postMessage({
        type: 'start',
        w,
        h,
        dpr,
        cssW,
        cssH,
        displayW,
        displayH,
      });
      sync();
    };

    const loadPhotos = async () => {
      const bitmaps = await Promise.all(
        IMAGES.map(async (src) => {
          const res = await fetch(src);
          return createImageBitmap(await res.blob());
        }),
      );
      if (dead) {
        bitmaps.forEach((bitmap) => bitmap.close());
        return;
      }
      worker.postMessage({ type: 'photos', bitmaps }, bitmaps);
    };

    syncRef.current = () => {
      cancelAnimationFrame(raf);
      sync();
    };
    boot();
    loadPhotos().catch(() => {
      /* reveal retries until the bitmaps arrive */
    });
    return () => {
      dead = true;
      syncRef.current = null;
      cancelAnimationFrame(raf);
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, [inViewRef, syncRef, workerRef]);

  return (
    <div data-testid="img-fx-loader" style={{ position: 'relative', width: '100%', height: '100%', ...cardStyle }}>
      <canvas
        ref={stillRef}
        width={336}
        height={336}
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      <canvas
        ref={viewRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          visibility: 'hidden',
        }}
      />
    </div>
  );
}

/**
 * Web showcase of the pixels-organic light mosaic.
 * The worker is the closed-network program. Copy runs that same source.
 */
export function ImageGenerationLoaderDemo() {
  const hostRef = useRef<View>(null);
  const workerRef = useRef<Worker | null>(null);
  const syncRef = useRef<(() => void) | null>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [seen, setSeen] = useState(!canObserve);
  const [inView, setInView] = useState(!canObserve);
  const [tabHidden, setTabHidden] = useState(false);
  const [phase, setPhase] = useState<LoaderPhase>('idle');
  const inViewRef = useRef(inView);
  inViewRef.current = inView && !tabHidden;

  useLayoutEffect(() => {
    preloadMosaicStill();
  }, []);

  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(hostRef.current);
    if (!el) {
      setSeen(true);
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        setInView(hit);
        if (hit) setSeen(true);
      },
      { root: null, rootMargin: '0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canObserve]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => {
      setTabHidden(document.visibilityState === 'hidden');
      syncRef.current?.();
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Stage>
      <View ref={hostRef} style={styles.wrap} collapsable={false}>
        {seen ? (
          <WorkerLoader inViewRef={inViewRef} workerRef={workerRef} syncRef={syncRef} onPhase={setPhase} />
        ) : (
          <div style={cardStyle} />
        )}
      </View>
      <AnimateButton
        label="Reveal"
        onPress={() => {
          workerRef.current?.postMessage({ type: imageActive(phase) ? 'hide' : 'reveal' });
        }}
      />
    </Stage>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 168,
    height: 168,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
```
