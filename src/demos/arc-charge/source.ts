/**
 * Arc Charge. One document: the live card calls boot(), and Copy runs the same function.
 * Written from the charging video and the public description. Not from an uberdesigner
 * prompt, a project archive, or a Figma file.
 */
import { GEIST_ARC_WOFF2 } from './font';

const TICKS = Array.from({ length: 24 }, () => '<i></i>').join('');

export const HTML = `<div id="arc-charge" data-testid="arc-charge">
  <div class="screen">
    <canvas data-testid="arc-canvas"></canvas>
    <div class="fallback" data-testid="arc-fallback" hidden>
      <div class="beam"></div>
      <div class="dots"><span></span><span></span></div>
      <div class="ticks">${TICKS}</div>
      <div class="readout still"><span class="digits">100</span><span class="pct">%</span></div>
    </div>
    <div class="world" data-testid="arc-world">
      <div class="readout" data-testid="arc-readout"><span class="digits">27</span><span class="pct">%</span></div>
    </div>
    <div class="dock">
      <p class="credit">Original by <a href="https://x.com/seanaiux/status/2120279835020804164" target="_blank" rel="noopener noreferrer">Sean Galt (@seanaiux)</a> · <a href="https://uberdesigner.ai/t/arc-charge" target="_blank" rel="noopener noreferrer">uberdesigner.ai/t/arc-charge</a></p>
      <div class="controls">
      <button type="button" class="play" data-testid="arc-play" aria-pressed="true" aria-label="Pause"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="icon-pause" d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z"/><path class="icon-play" d="M8 5.5v13l10-6.5z"/></svg><span>Pause</span></button>
      <input class="scrub" data-testid="arc-scrub" type="range" min="0" max="8000" step="1" value="0" aria-label="Charge time" aria-valuemin="0" aria-valuemax="8000" aria-valuenow="0" />
      <div class="seg" role="group" aria-label="Speed">
        <button type="button" data-speed="0.5" data-testid="arc-speed-0.5" aria-pressed="false">0.5x</button>
        <button type="button" data-speed="1" data-testid="arc-speed-1" aria-pressed="true">1x</button>
        <button type="button" data-speed="2" data-testid="arc-speed-2" aria-pressed="false">2x</button>
      </div>
      <button type="button" class="replay" data-testid="arc-replay" aria-label="Replay"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.3 4"/><path d="M5 4.5V9h4.5"/></svg><span>Replay</span></button>
      </div>
    </div>
  </div>
</div>`;

const GEIST_OFL = `Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION AND CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
`;

export const CSS = `/* ${GEIST_OFL} */
@font-face {
  font-family: "Geist Arc";
  src: url("${GEIST_ARC_WOFF2}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: block;
}
html, body {
  margin: 0;
  height: 100%;
  background: #070503;
}
#arc-charge {
  --loop: 8000ms;
  --full: 3100ms;
  --mint-at: 3800ms;
  --drain: 4200ms;
  --floor: 4900ms;
  --spark: 5450ms;
  --hit: 7450ms;
  --pull: 7750ms;
  --still: 4000ms;
  --flash: 180ms;
  --ink: #f3f2f0;
  --pct: #8d8d92;
  --dim: #8a8a8a;
  --bg: #070503;
  --amber: #8e6c42;
  --blue: #4c6091;
  --violet: #7a5aa8;
  --mint: #7ec9b4;
  --rest: #ff3c1e;
  --tick-dim: #3a342f;
  --dock: #ffffff;
  --dock-ink: #17181c;
  --track: #f3f3f3;
  --line: #e6e6e6;
  position: relative;
  width: 100%;
  min-height: 100%;
  display: grid;
  place-items: center;
  background: var(--bg);
  color: var(--dock-ink);
  font-family: Inter, system-ui, sans-serif;
}
#arc-charge .screen {
  position: relative;
  width: min(100%, calc(100vh * 16 / 9));
  aspect-ratio: 16 / 9;
  background: var(--bg);
  overflow: hidden;
}
#arc-charge canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
#arc-charge .world {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--shorter, 100%);
  height: var(--shorter, 100%);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
#arc-charge .readout {
  position: absolute;
  left: 50%;
  top: calc(50% - 11.4%);
  transform: translate(-50%, -50%);
  display: flex;
  align-items: flex-start;
  font-family: "Geist Arc", sans-serif;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  font-size: calc(var(--shorter, 320px) * 0.217);
  letter-spacing: -0.04em;
  line-height: 0.72;
  color: var(--ink);
  white-space: nowrap;
}
#arc-charge .digits { font-variant-numeric: tabular-nums; }
#arc-charge .pct {
  position: absolute;
  left: 100%;
  top: 0;
  margin: 0;
  font-size: 0.24em;
  line-height: 1;
  color: var(--pct);
}
#arc-charge .readout.is-dim { color: var(--dim); }
#arc-charge .readout.is-dim .pct { color: var(--dim); }
#arc-charge .fallback { position: absolute; inset: 0; }
#arc-charge .fallback[hidden] { display: none; }
#arc-charge .fallback .beam {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 60.2%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--mint), #ffffff, var(--mint), transparent);
  box-shadow: 0 0 18px var(--mint), 0 0 64px var(--mint);
}
#arc-charge .fallback .dots { position: absolute; left: 18%; right: 18%; top: calc(60.2% - 3px); display: flex; justify-content: space-between; }
#arc-charge .fallback .dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px var(--mint);
}
#arc-charge .fallback .ticks {
  position: absolute;
  left: 27.7%;
  right: 27.7%;
  top: 72.2%;
  display: flex;
  justify-content: space-between;
}
#arc-charge .fallback .ticks i { width: 2px; height: 12px; background: var(--mint); display: block; }
#arc-charge .dock {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 24px);
  background: var(--dock);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 10px 12px;
  z-index: 5;
}
#arc-charge .controls { display: flex; align-items: center; gap: 8px; }
#arc-charge .seg { display: flex; background: var(--track); border-radius: 10px; padding: 3px; }
#arc-charge .seg button,
#arc-charge .play,
#arc-charge .replay {
  appearance: none;
  border: 0;
  background: transparent;
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  font: 500 13px/1 Inter, system-ui, sans-serif;
  color: var(--dock-ink);
  cursor: pointer;
}
#arc-charge .seg button[aria-pressed="true"] {
  background: var(--dock);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
#arc-charge .play,
#arc-charge .replay {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--line);
  background: var(--dock);
  border-radius: 10px;
  height: 32px;
  box-sizing: border-box;
}
#arc-charge .play { width: 105px; flex: none; }
#arc-charge .play svg,
#arc-charge .replay svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
#arc-charge .play svg { fill: currentColor; stroke: none; }
#arc-charge .play .icon-play { display: none; }
#arc-charge .play[aria-pressed="false"] .icon-pause { display: none; }
#arc-charge .play[aria-pressed="false"] .icon-play { display: block; }
#arc-charge .play[aria-pressed="true"] { background: var(--track); }
#arc-charge .play:disabled { color: #a8a7aa; cursor: default; }
#arc-charge .scrub {
  -webkit-appearance: none;
  appearance: none;
  width: 180px;
  height: 4px;
  border-radius: 999px;
  background: var(--line);
  cursor: pointer;
}
#arc-charge .scrub::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dock-ink);
}
#arc-charge .credit {
  margin: 0;
  text-align: center;
  font: 400 12px/16px Inter, system-ui, sans-serif;
  color: #8d8d92;
}
#arc-charge .credit a { color: inherit; }
@media (prefers-reduced-motion: reduce) {
  #arc-charge { --still: 4000ms; }
}
#arc-charge[data-reduce="1"] .play { color: #a8a7aa; }`;

const VS = `#version 300 es
layout(location=0) in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FS = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uLevel;
uniform vec3 uColor;
uniform vec3 uTick;
uniform float uAmp;
uniform float uStraight;
uniform float uFilament;
uniform float uSpark;
uniform float uZoom;
uniform vec2 uFocus;
uniform float uHead;
uniform float uFlash;
uniform float uLeft;
uniform float uDust;
uniform float uGain;
uniform float uLift;
uniform float uHalf;
uniform float uArcY;
uniform float uTickY;
uniform float uTickHalf;
uniform vec4 uFreq;
uniform vec4 uSpin;
out vec4 fragColor;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

float envAt(float u) {
  return pow(sin(clamp(u, 0.0, 1.0) * 3.14159265), 0.62);
}

float wave(float x, float t, float amp) {
  float u = clamp((x + uHalf) / (2.0 * uHalf), 0.0, 1.0);
  float e = envAt(u);
  float w = sin(u * uFreq.x + t * uSpin.x) * 0.56;
  w += sin(u * uFreq.y - t * uSpin.y) * 0.28;
  w += sin(u * uFreq.z + t * uSpin.z) * 0.12;
  w += sin(u * uFreq.w - t * uSpin.w) * 0.06;
  return uArcY + w * e * amp * (1.0 - uStraight);
}

float arcDist(vec2 w, float t, float amp) {
  float d = 4.0;
  for (int i = -3; i <= 3; i++) {
    float x = clamp(w.x + float(i) * 0.01, -uHalf, uHalf);
    float y = wave(x, t, amp);
    d = min(d, length(vec2(w.x - x, w.y - y)));
  }
  return d;
}

void main() {
  float s = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / s;
  p.y = -p.y;
  p.y += uLift;
  vec2 w = p / max(uZoom, 0.001) + uFocus;
  float along = clamp((w.x + uHalf) / (2.0 * uHalf), 0.0, 1.0);
  float feather = smoothstep(0.0, 0.16, along) * smoothstep(1.0, 0.84, along);
  float d = arcDist(w, uTime, uAmp);
  float cover = smoothstep(uHead + 0.015, uHead - 0.04, along);

  vec3 bg = vec3(0.012, 0.008, 0.006);
  float wash = exp(-length((w - vec2(0.0, uArcY)) * vec2(0.9, 3.2)));
  bg += uColor * wash * 0.05;
  float vig = smoothstep(1.25, 0.15, length((p - vec2(0.0, uLift)) * vec2(0.7, 1.05)));
  bg *= mix(0.55, 1.0, vig);

  float thread = exp(-pow(abs(w.y - uArcY) * 220.0, 2.0)) * feather * (1.0 - cover);
  vec3 col = bg + uColor * thread * 0.45;

  float tight = mix(165.0, 280.0, uStraight);
  float core = exp(-pow(d * tight, 2.0)) * cover * feather;
  float glow = exp(-d * mix(95.0, 160.0, uStraight)) * cover * feather;
  float halo = exp(-d * mix(32.0, 48.0, uStraight)) * cover * feather;
  vec3 ink = uColor * uGain;
  col += ink * halo * 0.55;
  col += ink * glow * 0.85;
  col += mix(ink, vec3(1.0), 0.12) * core;

  float fil = uFilament * (1.0 - uStraight);
  if (fil > 0.01) {
    float yA = wave(w.x, uTime + 1.7, uAmp * 1.55) - envAt(along) * 0.02 * fil;
    float yB = wave(w.x, uTime + 3.1, uAmp * 1.25) + envAt(along) * 0.018 * fil;
    float peel = exp(-abs(w.y - yA) * 120.0) + exp(-abs(w.y - yB) * 140.0);
    col += ink * peel * fil * cover * feather * 0.4;
  }

  if (uSpark > 0.01) {
    for (int i = 0; i < 10; i++) {
      float id = float(i);
      float life = fract(uTime * 0.85 + hash(id + 1.3));
      float x = mix(-uHalf, uHalf, hash(id + 4.0));
      float y0 = wave(x, uTime, uAmp);
      float dir = hash(id + 8.0) - 0.5;
      vec2 sp = vec2(x + dir * life * 0.04, y0 + dir * life * 0.08);
      float sd = length((w - sp) * vec2(1.0, 1.6));
      col += vec3(1.0) * exp(-sd * 140.0) * (1.0 - life) * uSpark * cover;
    }
  }

  vec2 left = vec2(-uHalf, uArcY);
  vec2 right = vec2(uHalf, uArcY);
  float ld = length((w - left) * vec2(1.0, 3.0));
  float rd = length((w - right) * vec2(1.0, 3.0));
  col += mix(uColor, vec3(1.0), 0.85) * (exp(-ld * 90.0) + exp(-rd * 90.0));
  col += vec3(1.0, 0.55, 0.25) * exp(-ld * 22.0) * uLeft;

  float flareY = (uArcY - uFocus.y) * uZoom;
  float flare = exp(-abs(p.y - flareY) * mix(160.0, 90.0, uStraight));
  flare *= exp(-pow(abs(p.x) * 0.85, 2.0)) * feather;
  col += mix(uColor, vec3(1.0), 0.25) * flare * uGain * (0.06 + uStraight * 0.4 + uFlash * 0.25);

  col += vec3(1.0) * uFlash * exp(-rd * 10.0);
  col += uColor * uFlash * 0.25;

  if (uDust > 0.01) {
    for (int i = 0; i < 16; i++) {
      float id = float(i);
      float x = fract(hash(id + 2.2) - uTime * (0.12 + hash(id) * 0.4));
      float y = (hash(id + 6.0) - 0.5) * 1.15;
      vec2 q = w - vec2((x - 0.5) * 1.8, y);
      float streak = exp(-abs(q.y) * 280.0) * exp(-max(q.x, 0.0) * 30.0) * exp(min(q.x, 0.0) * 5.0);
      col += vec3(1.0, 0.72, 0.45) * streak * uDust * 0.7;
    }
  }

  for (int i = 0; i < 24; i++) {
    float fi = float(i);
    float x = mix(-uTickHalf, uTickHalf, fi / 23.0);
    float need = (fi + 0.5) / 24.0;
    float lit = uLevel >= need ? 1.0 : 0.0;
    vec2 tp = vec2(x, uTickY);
    vec2 dtk = abs(w - tp);
    float mark = step(dtk.x, 0.0011) * step(dtk.y, 0.006);
    vec3 tc = mix(uTick, mix(uColor, vec3(1.0), 0.35), lit);
    col += tc * mark * mix(0.55, 1.0, lit);
  }

  fragColor = vec4(col, 1.0);
}
`;

const BOOT_SOURCE = `
function boot(root) {
  if (root.getAttribute('data-booted') === '1') return;
  root.setAttribute('data-booted', '1');
  (function hoistFace() {
    if (document.getElementById('arc-charge-face')) return;
    var node = root.getRootNode ? root.getRootNode() : document;
    var styles = node.querySelectorAll ? node.querySelectorAll('style') : [];
    var rule = '';
    for (var i = 0; i < styles.length; i++) {
      var text = styles[i].textContent || '';
      var at = text.indexOf('@font-face');
      if (at < 0) continue;
      var end = text.indexOf('}', at);
      if (end > at) rule = text.slice(at, end + 1);
    }
    if (!rule || !document.head) return;
    var el = document.createElement('style');
    el.id = 'arc-charge-face';
    el.textContent = rule;
    document.head.appendChild(el);
    if (document.fonts && document.fonts.load) document.fonts.load('400 48px "Geist Arc"');
  })();

  var screen = root.querySelector('.screen');
  var canvas = root.querySelector('canvas');
  var fallback = root.querySelector('.fallback');
  var world = root.querySelector('.world');
  var readout = root.querySelector('.world .readout');
  var digits = readout.querySelector('.digits');
  var playBtn = root.querySelector('.play');
  var replayBtn = root.querySelector('.replay');
  var scrub = root.querySelector('.scrub');
  var speeds = root.querySelectorAll('[data-speed]');
  var style = getComputedStyle(root);

  function readMs(name, fallbackMs) {
    var raw = style.getPropertyValue(name);
    var n = parseFloat(raw);
    return n === n ? n : fallbackMs;
  }
  function hex(name, fallbackHex) {
    var raw = style.getPropertyValue(name).trim() || fallbackHex;
    var h = raw.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var v = parseInt(h, 16);
    if (v !== v) return [1, 1, 1];
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  }

  var LOOP = readMs('--loop', 8000);
  var FULL = readMs('--full', 3100);
  var MINT_AT = readMs('--mint-at', 3800);
  var DRAIN = readMs('--drain', 4200);
  var FLOOR = readMs('--floor', 4900);
  var SPARK = readMs('--spark', 5450);
  var HIT = readMs('--hit', 7450);
  var PULL = readMs('--pull', 7750);
  var STILL = readMs('--still', 4000);
  var FLASH = readMs('--flash', 180);
  var COL_AMBER = hex('--amber', '#ffb040');
  var COL_BLUE = hex('--blue', '#78aaff');
  var COL_VIOLET = hex('--violet', '#c9a0ff');
  var COL_MINT = hex('--mint', '#b8ffe8');
  var COL_REST = hex('--rest', '#ff3c1e');
  var COL_TICK = hex('--tick-dim', '#3a342f');

  var ARC_HALF = 0.4;
  var ARC_Y = 0.102;
  var TICK_Y = 0.222;
  var TICK_HALF = 0.373;
  var ZOOM_MAX = 2.45;
  var FREQ = [17, 43, 89, 130];
  var SPIN = [8, 14, 21, 33];
  var LEVEL_KEYS = [
    [0, 27], [100, 30], [200, 34], [300, 37], [400, 40], [500, 44], [600, 47], [700, 50],
    [800, 53], [900, 56], [1000, 59], [1100, 61], [1200, 64], [1300, 67], [1400, 70],
    [1500, 72], [1600, 75], [1700, 77], [1800, 79], [1900, 82], [2000, 84], [2100, 86],
    [2200, 88], [2300, 90], [2400, 91], [2500, 93], [2600, 94], [2700, 96], [2800, 97],
    [2900, 98], [3100, 100], [4200, 100], [4300, 98], [4400, 88], [4500, 66], [4600, 33],
    [4700, 13], [4800, 5], [4900, 4], [7700, 4], [7800, 14], [7900, 23], [8000, 27]
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) {
    var u = clamp((t - a) / (b - a), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function mix3(a, b, u) {
    return [mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)];
  }
  function levelAt(ms) {
    var t = ((ms % LOOP) + LOOP) % LOOP;
    if (t <= LEVEL_KEYS[0][0]) return LEVEL_KEYS[0][1];
    for (var i = 1; i < LEVEL_KEYS.length; i++) {
      if (t <= LEVEL_KEYS[i][0]) {
        var a = LEVEL_KEYS[i - 1];
        var b = LEVEL_KEYS[i];
        var u = (t - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * u;
      }
    }
    return LEVEL_KEYS[0][1];
  }
  function scene(ms) {
    var t = ((ms % LOOP) + LOOP) % LOOP;
    var level = levelAt(t);
    var u = level / 100;
    var rise = t < FULL || t >= 7700;
    var hold = t >= FULL && t < DRAIN;
    var draining = t >= DRAIN && t < FLOOR;
    var chasing = t >= SPARK && t < PULL;
    var straight = 0;
    if (hold) straight = smooth(FULL, MINT_AT, t);
    else if (draining) straight = 1 - smooth(FLOOR - 600, FLOOR, t) * 0.2;
    var color = COL_REST;
    if (rise) {
      if (u < 0.42) color = mix3(COL_AMBER, COL_BLUE, clamp((u - 0.22) / 0.2, 0, 1));
      else if (u < 0.72) color = mix3(COL_BLUE, COL_VIOLET, clamp((u - 0.42) / 0.3, 0, 1));
      else color = mix3(COL_VIOLET, [0.92, 0.86, 1], clamp((u - 0.72) / 0.26, 0, 1));
    } else if (hold) {
      color = mix3(COL_VIOLET, COL_MINT, straight);
    } else if (draining) {
      color = mix3(COL_MINT, COL_REST, clamp((20 - level) / 16, 0, 1));
    } else if (chasing) {
      color = mix3(COL_REST, COL_AMBER, smooth(SPARK, SPARK + 280, t));
    }
    var amp = 0.0035 + Math.pow(Math.max(u, 0), 1.35) * 0.03;
    if (hold) amp *= 1 - straight;
    if (draining) amp = 0.0016;
    if (!rise && !hold && !draining && !chasing) amp = 0.0018;
    if (chasing) amp = 0.008 + smooth(SPARK, HIT, t) * 0.014;
    var filament = rise ? smooth(0.4, 0.58, u) * (1 - smooth(0.9, 0.99, u)) : 0;
    var spark = rise ? smooth(0.72, 0.96, u) : (chasing ? 0.35 : 0);
    var chaseIn = smooth(SPARK, SPARK + 700, t);
    var chaseOut = smooth(HIT, PULL, t);
    var travel = smooth(SPARK + 180, HIT, t);
    var headX = mix(-ARC_HALF, ARC_HALF, travel);
    var engaged = chaseIn * (1 - chaseOut);
    var zoom = 1 + (ZOOM_MAX - 1) * engaged;
    var focusX = headX * engaged;
    var focusY = ARC_Y * engaged;
    var head = rise || hold || draining || t >= HIT ? 1.2 : (chasing ? travel : -0.04);
    var flashU = (t - HIT) / FLASH;
    var flash = t >= HIT - 40 && t <= HIT + FLASH ? Math.exp(-flashU * flashU * 3.2) : 0;
    var left = 0;
    if (t >= SPARK - 80 && t <= SPARK + 420) {
      var lu = (t - SPARK) / 220;
      left = Math.exp(-lu * lu);
    }
    var dust = chasing ? engaged : 0;
    var gain = draining ? 0.05 + 0.08 * u : 1;
    var dim = level < 16 && !(rise && t < FULL);
    if (t >= 7700) dim = level < 16;
    return {
      level: level, color: color, amp: amp, straight: hold || draining ? straight : 0,
      filament: filament, spark: spark, zoom: zoom, focusX: focusX, focusY: focusY,
      head: head, flash: flash, left: left, dust: dust, gain: gain, dim: dim
    };
  }

  var gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' });
  var program = null;
  var loc = {};
  var buffer = null;
  if (!gl) {
    fallback.hidden = false;
    world.hidden = true;
    canvas.hidden = true;
    root.setAttribute('data-gl', '0');
  } else {
    root.setAttribute('data-gl', '1');
    function compile(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    var vs = compile(gl.VERTEX_SHADER, ${JSON.stringify(VS)});
    var fs = compile(gl.FRAGMENT_SHADER, ${JSON.stringify(FS)});
    if (!vs || !fs) {
      fallback.hidden = false;
      world.hidden = true;
      canvas.hidden = true;
      gl = null;
      root.setAttribute('data-gl', '0');
    } else {
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, 'a');
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        fallback.hidden = false;
        world.hidden = true;
        canvas.hidden = true;
        gl = null;
        root.setAttribute('data-gl', '0');
      } else {
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        ['uRes','uTime','uLevel','uColor','uTick','uAmp','uStraight','uFilament','uSpark','uZoom','uFocus','uHead','uFlash','uLeft','uDust','uGain','uLift','uHalf','uArcY','uTickY','uTickHalf','uFreq','uSpin'].forEach(function (name) {
          loc[name] = gl.getUniformLocation(program, name);
        });
      }
    }
  }

  var time = 0;
  var speed = 1;
  var playing = true;
  var visible = root.getAttribute('data-visible') !== '0';
  var raf = 0;
  var last = 0;
  var disposed = false;
  var media = window.matchMedia('(prefers-reduced-motion: reduce)');

  function reduced() {
    if (root.getAttribute('data-reduce') === '1') return true;
    if (document.documentElement.getAttribute('data-reduce-motion') === '1') return true;
    return media.matches;
  }

  function paintControls() {
    var on = playing && !reduced();
    playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    playBtn.querySelector('span').textContent = on ? 'Pause' : 'Play';
    playBtn.disabled = reduced();
    var shown = reduced() ? STILL : time;
    scrub.value = String(Math.round(shown));
    scrub.setAttribute('aria-valuenow', String(Math.round(shown)));
    var lvl = Math.round(levelAt(shown));
    scrub.setAttribute('aria-valuetext', lvl + ' percent');
    for (var i = 0; i < speeds.length; i++) {
      speeds[i].setAttribute('aria-pressed', Number(speeds[i].getAttribute('data-speed')) === speed ? 'true' : 'false');
    }
  }

  function draw(ms) {
    var view = scene(ms);
    var level = Math.round(view.level);
    digits.textContent = String(level);
    readout.classList.toggle('is-dim', view.dim);
    var rect = screen.getBoundingClientRect();
    var shorter = Math.min(rect.width, rect.height) || 1;
    root.style.setProperty('--shorter', shorter + 'px');
    var dock = root.querySelector('.dock');
    var dockH = dock ? dock.offsetHeight : 0;
    var tickScreen = rect.height * 0.5 + TICK_Y * shorter + 10;
    var dockTop = rect.height - 14 - dockH;
    var liftPx = Math.max(0, tickScreen - (dockTop - 18));
    var camX = -view.focusX * shorter * view.zoom;
    var camY = -view.focusY * shorter * view.zoom - liftPx;
    world.style.transform = 'translate(-50%, -50%) translate(' + camX + 'px, ' + camY + 'px) scale(' + view.zoom + ')';
    if (!gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(2, Math.round(rect.width * dpr));
    var h = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    gl.uniform1f(loc.uTime, ms / 1000);
    gl.uniform1f(loc.uLevel, view.level / 100);
    gl.uniform3fv(loc.uColor, view.color);
    gl.uniform3fv(loc.uTick, COL_TICK);
    gl.uniform1f(loc.uAmp, view.amp);
    gl.uniform1f(loc.uStraight, view.straight);
    gl.uniform1f(loc.uFilament, view.filament);
    gl.uniform1f(loc.uSpark, view.spark);
    gl.uniform1f(loc.uZoom, view.zoom);
    gl.uniform2f(loc.uFocus, view.focusX, view.focusY);
    gl.uniform1f(loc.uHead, view.head);
    gl.uniform1f(loc.uFlash, view.flash);
    gl.uniform1f(loc.uLeft, view.left);
    gl.uniform1f(loc.uDust, view.dust);
    gl.uniform1f(loc.uGain, view.gain);
    gl.uniform1f(loc.uLift, liftPx / shorter);
    gl.uniform1f(loc.uHalf, ARC_HALF);
    gl.uniform1f(loc.uArcY, ARC_Y);
    gl.uniform1f(loc.uTickY, TICK_Y);
    gl.uniform1f(loc.uTickHalf, TICK_HALF);
    gl.uniform4f(loc.uFreq, FREQ[0], FREQ[1], FREQ[2], FREQ[3]);
    gl.uniform4f(loc.uSpin, SPIN[0], SPIN[1], SPIN[2], SPIN[3]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function frame(now) {
    if (disposed) return;
    raf = 0;
    if (!visible) return;
    var dt = last ? Math.min(50, now - last) : 0;
    last = now;
    if (playing && !reduced()) time = (time + dt * speed) % LOOP;
    draw(reduced() ? STILL : time);
    paintControls();
    if (playing && !reduced() && visible) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf || disposed || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  playBtn.addEventListener('click', function () {
    if (reduced()) return;
    playing = !playing;
    paintControls();
    if (playing) kick();
    else draw(time);
  });
  replayBtn.addEventListener('click', function () {
    if (reduced()) {
      draw(STILL);
      return;
    }
    time = 0;
    playing = true;
    paintControls();
    kick();
  });
  scrub.addEventListener('input', function () {
    if (reduced()) {
      scrub.value = String(Math.round(STILL));
      draw(STILL);
      return;
    }
    time = Number(scrub.value) || 0;
    playing = false;
    paintControls();
    draw(time);
  });
  for (var s = 0; s < speeds.length; s++) {
    speeds[s].addEventListener('click', function (event) {
      var next = Number(event.currentTarget.getAttribute('data-speed'));
      if (next) speed = next;
      paintControls();
    });
  }

  function onReduce() {
    paintControls();
    if (reduced()) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      draw(STILL);
    } else if (playing) kick();
    else draw(time);
  }
  if (media.addEventListener) media.addEventListener('change', onReduce);
  else if (media.addListener) media.addListener(onReduce);
  var attrObserver = new MutationObserver(onReduce);
  attrObserver.observe(root, { attributes: true, attributeFilter: ['data-reduce', 'data-visible'] });
  var docObserver = new MutationObserver(onReduce);
  docObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
  var visObserver = new MutationObserver(function () {
    visible = root.getAttribute('data-visible') !== '0';
    if (!visible) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (playing && !reduced()) kick();
    else draw(reduced() ? STILL : time);
  });
  visObserver.observe(root, { attributes: true, attributeFilter: ['data-visible'] });

  var ro = null;
  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(function () { draw(reduced() ? STILL : time); });
    ro.observe(screen);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    if (media.removeEventListener) media.removeEventListener('change', onReduce);
    attrObserver.disconnect();
    docObserver.disconnect();
    visObserver.disconnect();
    if (ro) ro.disconnect();
    if (gl) {
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  }
  if (root.parentNode) {
    var removeObserver = new MutationObserver(function () {
      if (!root.isConnected) dispose();
    });
    removeObserver.observe(root.parentNode, { childList: true });
  }

  paintControls();
  draw(reduced() ? STILL : time);
  if (playing && !reduced() && visible) kick();
}
`;

export const boot = new Function(`${BOOT_SOURCE}\nreturn boot;`)() as (root: HTMLElement) => void;

export const SCRIPT =
  '(function () {\n' +
  BOOT_SOURCE +
  '\nvar root = document.getElementById("arc-charge");\nif (root) boot(root);\n})();\n';
