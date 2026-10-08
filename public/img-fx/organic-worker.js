/* Organic loader, off the main thread.

   The full img-fx program is one 29KB fragment. Its first draw blocks other
   GL contexts for seconds on a slow GPU, so this file keeps the pixels-organic
   light path (effect 22, dot mode 1) and loops the blur taps. The photo
   reveal (shaderColor4 mask, pixel dissolve, 2.2s hold, 320ms fade) runs
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
const CARD_BG = '#ffffff';
const REVEAL_SEC = 3;
const PIX_SEC = 2.55;
const HOLD_MS = 2200;
const FADE_MS = 320;
const SOFTNESS = 0.5;
const SAMPLE = 64;
const COLOR4 = [1, 1, 1];

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
  const ms = delayMs == null ? (1.2 + Math.random() * 1.2) * 1000 : delayMs;
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
    outCtx.fillStyle = '#ffffff';
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
  timer = setTimeout(present, 100);
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
