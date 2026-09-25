import { GUIDE, INSTRUMENTS, SAMPLE_CONTROLS, STAGE_HEIGHT, SWATCHES } from './model';
import { COLLAPSE_SVG, toolIconSvg } from './toolIcon';

const controlHtml = SAMPLE_CONTROLS.map(
  (control) =>
    `    <div class="pt-ctrl pt-${control.kind}" data-guide data-note="${control.id}" data-label="${control.label}">${control.label}</div>`,
).join('\n');

function iconInk(id: string): string {
  if (id === 'highlighter') return '#fff01f';
  if (id === 'eraser') return '#c9806f';
  return '#111111';
}

const penHtml = INSTRUMENTS.map((item) => {
  const on = item.id === 'pencil' ? ' is-on' : '';
  return `<button class="pt-pen${on}" type="button" data-pen="${item.id}" aria-label="${item.label}" aria-pressed="${item.id === 'pencil' ? 'true' : 'false'}">${toolIconSvg(item.id, iconInk(item.id))}</button>`;
}).join('');

function tickStroke(color: string): string {
  const value = Number.parseInt(color.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return (red * 299 + green * 587 + blue * 114) / 1000 > 170 ? '#111111' : '#ffffff';
}

const swatchHtml = SWATCHES.map((color) => {
  const on = color === '#111111';
  const tick = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="${tickStroke(color)}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.6 8.4 6.7 11.5 12.4 5.2"/></svg>`;
  return `<button class="pt-swatch${on ? ' is-on' : ''}" type="button" data-color="${color}" aria-label="${color}" style="background:${color}">${tick}</button>`;
}).join('');

const peekSvg = toolIconSvg('pencil', '#111111', 42);
const elementSvg = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.1 1.8 3.5 12.4 6.6 9.2 11.2 8.7 Z" fill="currentColor"/></svg>`;
const boxSvg = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
const noteToolsHtml = `<button class="pt-round pt-note-tool is-on" type="button" data-note-tool="element" aria-label="Element" aria-pressed="true">${elementSvg}</button><button class="pt-round pt-note-tool" type="button" data-note-tool="box" aria-label="Box" aria-pressed="false">${boxSvg}</button>`;
const glyphs = Object.fromEntries(INSTRUMENTS.map((item) => [item.id, toolIconSvg(item.id, iconInk(item.id), 42)]));

const alignSvg = `<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="8.3" width="16" height="1.4" fill="currentColor"/></svg>`;
const noteSvg = `<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><rect x="2" y="2" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 12.2 L9 12.2 L6.6 15.2 Z" fill="currentColor"/></svg>`;

export const PREVIEW_TOOLS_HTML = `<div class="pt-field is-open" id="pt-field">
  <div class="pt-row" id="pt-row">
${controlHtml}
  </div>
  <canvas class="pt-draw" id="pt-draw"></canvas>
  <svg class="pt-guides" id="pt-guides" aria-hidden="true"></svg>
  <div class="pt-box" id="pt-box"></div>
  <div class="pt-marks" id="pt-marks"></div>
  <div class="pt-note" id="pt-note">
    <p class="pt-note-label" id="pt-note-label"></p>
    <p class="pt-note-selector" id="pt-note-selector"></p>
    <textarea id="pt-note-input" placeholder="Note for the agent"></textarea>
    <div class="pt-note-actions">
      <button class="pt-copy" id="pt-note-copy" type="button">Copy</button>
      <button class="pt-add" id="pt-note-add" type="button">Add</button>
    </div>
  </div>
  <div class="pt-morph" id="pt-morph">
    <button class="pt-peek" type="button" id="pt-toggle" aria-expanded="false" aria-label="Open tools">${peekSvg}</button>
    <div class="pt-tray" id="pt-tray">
      <div class="pt-slots" id="pt-slots" data-face="instruments">${penHtml}${swatchHtml}${noteToolsHtml}</div>
      <span class="pt-rule"></span>
      <button class="pt-wheel" id="pt-color" type="button" aria-label="Color"><span id="pt-color-dot" style="background:#111111"></span></button>
      <button class="pt-round" id="pt-guides-btn" type="button" aria-label="Grid lines" aria-pressed="false">${alignSvg}</button>
      <button class="pt-round" id="pt-annotate" type="button" aria-label="Agentation" aria-pressed="false">${noteSvg}</button>
      <span class="pt-rule"></span>
      <button class="pt-round" id="pt-close" type="button" aria-label="Close tools">${COLLAPSE_SVG}</button>
    </div>
  </div>
</div>`;

export const PREVIEW_TOOLS_CSS = `.pt-field {
  position: relative;
  width: 100%;
  height: ${STAGE_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}
.pt-row { display: flex; align-items: center; gap: 8px; z-index: 2; }
.pt-ctrl {
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #fff;
  color: #17181c;
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  font: 600 13px/1 Inter, system-ui, sans-serif;
  cursor: pointer;
}
.pt-icon, .pt-send, .pt-pill { height: 32px; }
.pt-short { height: 26px; }
.pt-icon, .pt-send { width: 32px; }
.pt-pill, .pt-short { padding: 0 12px; }
.pt-send { background: #17181c; color: #fff; border-color: #17181c; }
.pt-field.is-element .pt-ctrl:hover,
.pt-ctrl.is-picked { outline: 2px solid #17181c; outline-offset: 3px; }
.pt-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  background: #17181c;
  color: #fff;
  font: 600 10px/16px Inter, system-ui, sans-serif;
  text-align: center;
}
.pt-draw {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  touch-action: none;
}
.pt-guides { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none; }
.pt-marks { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
.pt-box, .pt-region {
  position: absolute;
  border: 1px solid #111;
  box-sizing: border-box;
  pointer-events: none;
}
.pt-box { display: none; z-index: 5; }
.pt-box.is-on { display: block; }
.pt-region-num {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  background: #111;
  color: #fff;
  font: 600 9px/14px Inter, system-ui, sans-serif;
  text-align: center;
}
.pt-note {
  display: none;
  position: absolute;
  z-index: 7;
  width: 220px;
  padding: 10px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 12px 32px rgba(23,24,28,.18);
}
.pt-note.is-on { display: block; }
.pt-note-label { margin: 0; font: 600 13px/1.2 Inter, system-ui, sans-serif; color: #17181c; }
.pt-note-selector { margin: 2px 0 8px; font: 500 11px/1.2 ui-monospace, SFMono-Regular, monospace; color: #6c6c6c; }
.pt-note textarea {
  width: 100%;
  height: 64px;
  box-sizing: border-box;
  resize: none;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.1);
  padding: 6px 8px;
  font: 500 12px/1.3 Inter, system-ui, sans-serif;
  color: #17181c;
}
.pt-note-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; }
.pt-add, .pt-copy {
  height: 28px;
  border-radius: 8px;
  font: 600 12px/1 Inter, system-ui, sans-serif;
  cursor: pointer;
}
.pt-add { padding: 0 12px; border: 0; background: #17181c; color: #fff; }
.pt-copy { padding: 0 10px; border: 1px solid rgba(0,0,0,.1); background: #fff; color: #17181c; }
.pt-morph {
  position: absolute;
  z-index: 8;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%) scale(0.667);
  transform-origin: center center;
  height: 84px;
  width: 84px;
  border-radius: 42px;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(180deg, #fbfaf9, #f1efec);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 0 0 .5px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05), 0 5px 12px rgba(0,0,0,.09), 0 9px 20px rgba(0,0,0,.06);
  transition: width 520ms cubic-bezier(0.22, 0.9, 0.16, 1), border-radius 440ms cubic-bezier(0.22, 0.9, 0.16, 1), transform 540ms cubic-bezier(0.22, 0.9, 0.16, 1);
}
.pt-field.is-open .pt-morph {
  width: max-content;
  max-width: calc(100% - 24px);
  height: 84px;
  border-radius: 42px;
  align-items: flex-end;
  padding: 0 32px;
  gap: 8px;
  transform: translateX(-50%) scale(1);
}
.pt-peek {
  border: 0;
  background: none;
  padding: 7px 0 0;
  cursor: pointer;
  line-height: 0;
}
.pt-field.is-open .pt-peek { display: none; }
.pt-tray { display: none; align-items: flex-end; gap: 8px; height: 100%; }
.pt-field.is-open .pt-tray { display: flex; }
.pt-slots { display: flex; align-items: flex-end; gap: 2px; height: 100%; }
.pt-rule { width: 1px; height: 22px; align-self: center; background: rgba(0,0,0,.1); flex: none; }
.pt-pen {
  width: 34px;
  border: 0;
  padding: 0;
  margin-bottom: -20px;
  background: transparent;
  transform: translateY(6px);
  filter: drop-shadow(0 1px 1px rgba(0,0,0,.12));
  cursor: pointer;
  line-height: 0;
}
.pt-pen svg { display: block; margin: 0 auto; }
.pt-pen.is-on { transform: translateY(-12px); filter: drop-shadow(0 4px 6px rgba(0,0,0,.18)); }
.pt-slots[data-face="instruments"] .pt-swatch,
.pt-slots[data-face="instruments"] .pt-note-tool,
.pt-slots[data-face="palette"] .pt-note-tool { display: none; }
.pt-slots[data-face="palette"] .pt-pen,
.pt-slots[data-face="annotate"] .pt-pen,
.pt-slots[data-face="annotate"] .pt-swatch { display: none; }
.pt-slots[data-face="palette"],
.pt-slots[data-face="annotate"] { align-items: center; height: auto; gap: 4px; }
.pt-field.is-open .pt-morph:has(.pt-slots[data-face="palette"]),
.pt-field.is-open .pt-morph:has(.pt-slots[data-face="annotate"]) { align-items: center; }
.pt-field.is-annotate .pt-wheel { display: none; }
.pt-note-tool.is-on { background: rgba(0,0,0,.055); color: #111; }
.pt-swatch {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.12);
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.pt-swatch svg { opacity: 0; }
.pt-swatch.is-on { transform: scale(1.08) translateY(-1px); box-shadow: inset 0 0 0 1px rgba(0,0,0,.14), 0 3px 8px rgba(0,0,0,.24); }
.pt-swatch.is-on svg { opacity: 1; }
.pt-wheel, .pt-round {
  border: 0;
  background: transparent;
  color: #8a8a8e;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  align-self: center;
}
.pt-round { width: 36px; height: 36px; border-radius: 18px; }
.pt-wheel {
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background: conic-gradient(#ff383c, #ff8d28, #ffcc00, #34c759, #00c3d0, #0088ff, #6155f5, #d6336c, #ff383c);
  box-shadow: 0 0 0 .5px rgba(0,0,0,.12), inset 0 0 0 1px rgba(255,255,255,.5);
}
.pt-wheel span {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #fbfaf9, 0 0 0 3.5px rgba(0,0,0,.1);
}
#pt-annotate.is-on { color: #111111; }
#pt-annotate.is-on svg rect { fill: currentColor; }
#pt-guides-btn.is-on { color: ${GUIDE}; }
.pt-field.is-open:not(.is-annotate) .pt-draw,
.pt-field.is-box .pt-draw { pointer-events: auto; cursor: crosshair; }
`;

export const PREVIEW_TOOLS_SCRIPT = `(function () {
  var field = document.getElementById('pt-field');
  var canvas = document.getElementById('pt-draw');
  var guides = document.getElementById('pt-guides');
  var noteEl = document.getElementById('pt-note');
  var labelEl = document.getElementById('pt-note-label');
  var selectorEl = document.getElementById('pt-note-selector');
  var input = document.getElementById('pt-note-input');
  var copyBtn = document.getElementById('pt-note-copy');
  var addBtn = document.getElementById('pt-note-add');
  var ctx = canvas.getContext('2d');
  var toggle = document.getElementById('pt-toggle');
  var guidesBtn = document.getElementById('pt-guides-btn');
  var annotateBtn = document.getElementById('pt-annotate');
  var colorBtn = document.getElementById('pt-color');
  var colorDot = document.getElementById('pt-color-dot');
  var closeBtn = document.getElementById('pt-close');
  var slots = document.getElementById('pt-slots');
  var morph = document.getElementById('pt-morph');
  var boxEl = document.getElementById('pt-box');
  var marks = document.getElementById('pt-marks');
  var open = true;
  var guidesOn = false;
  var annotate = false;
  var noteTool = 'element';
  var face = 'instruments';
  var pen = 'pencil';
  var color = '#111111';
  var strokes = [];
  var draft = null;
  var boxDrag = null;
  var region = null;
  var notes = [];
  var target = null;
  var guide = '${GUIDE}';
  var noteGlyph = ${JSON.stringify(noteSvg)};
  var glyphs = ${JSON.stringify(glyphs)};
  var specs = {
    pencil: { size: 1, thinning: 0.5, mode: 'graphite' },
    pen: { size: 6, thinning: 0.5, mode: 'ink' },
    fineliner: { size: 2, thinning: 0, mode: 'ink' },
    marker: { size: 18, thinning: 0.12, mode: 'ink' },
    highlighter: { size: 28, thinning: 0, flat: true, mode: 'highlight' },
    brush: { size: 14, thinning: 0.42, taper: 16, mode: 'ink' },
    fountain: { size: 8, thinning: 0.1, nibAngle: 45, nibContrast: 0.85, mode: 'ink' },
    eraser: { size: 28, thinning: 0, mode: 'erase' }
  };

  function resize() {
    var w = field.clientWidth;
    var h = field.clientHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    paint();
    paintGuides();
  }
  function fillRing(ring) {
    ctx.beginPath();
    ctx.moveTo(ring[0][0], ring[0][1]);
    for (var i = 1; i < ring.length; i++) ctx.lineTo(ring[i][0], ring[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  function disc(cx, cy, radius) {
    var ring = [];
    for (var i = 0; i < 12; i++) {
      var angle = (i / 12) * Math.PI * 2;
      ring.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    return ring;
  }
  function paintStroke(stroke) {
    var points = stroke.points;
    if (points.length < 2) return;
    var spec = specs[stroke.pen];
    var nib = spec.size / 2;
    var radii = [];
    var lengths = [];
    var pressure = 0.7;
    var i;
    for (i = 1; i < points.length; i++) {
      var prev = points[i - 1];
      var next = points[i];
      var dist = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
      lengths.push(dist);
      pressure += (1 - Math.min(1, dist / 26) - pressure) * 0.45;
      var radius = nib * (1 - spec.thinning + spec.thinning * pressure);
      if (spec.nibContrast) {
        var angle = Math.atan2(next.y - prev.y, next.x - prev.x) - (spec.nibAngle * Math.PI) / 180;
        radius *= 1 - spec.nibContrast * (1 - Math.abs(Math.sin(angle)));
      }
      radii.push(Math.max(0.35, radius));
    }
    if (spec.taper) {
      var walked = 0;
      for (i = lengths.length - 1; i >= 0; i--) {
        walked += lengths[i];
        var along = Math.min(1, walked / spec.taper);
        radii[i] *= 0.1 + 0.9 * Math.pow(along, 0.55);
      }
    }
    ctx.save();
    if (spec.mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000';
    } else if (spec.mode === 'highlight') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#fff01f';
    } else if (spec.mode === 'graphite') {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#3a3a3a';
    } else {
      ctx.fillStyle = stroke.color;
    }
    for (i = 1; i < points.length; i++) {
      var a = points[i - 1];
      var b = points[i];
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len;
      var ny = dx / len;
      var r0 = radii[i - 1];
      var r1 = radii[Math.min(i, radii.length - 1)];
      fillRing([[a.x + nx * r0, a.y + ny * r0], [b.x + nx * r1, b.y + ny * r1], [b.x - nx * r1, b.y - ny * r1], [a.x - nx * r0, a.y - ny * r0]]);
      if (!spec.flat) fillRing(disc(a.x, a.y, r0));
    }
    if (!spec.flat) {
      var last = points[points.length - 1];
      fillRing(disc(last.x, last.y, radii[radii.length - 1]));
    }
    ctx.restore();
  }
  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var all = draft ? strokes.concat([draft]) : strokes;
    for (var i = 0; i < all.length; i++) paintStroke(all[i]);
  }
  function point(event) {
    var rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function syncPointer() {
    var draw = open && !annotate;
    var box = open && annotate && noteTool === 'box';
    var on = draw || box ? 'auto' : 'none';
    canvas.style.setProperty('pointer-events', on, 'important');
    canvas.style.cursor = draw || box ? 'crosshair' : 'default';
  }
  function fitBar() {
    if (!open) {
      morph.style.transform = '';
      return;
    }
    morph.style.transform = 'translateX(-50%) scale(1)';
    var max = field.clientWidth - 24;
    var width = morph.scrollWidth;
    var scale = width > max && max > 0 ? max / width : 1;
    morph.style.transform = 'translateX(-50%) scale(' + scale + ')';
  }
  function recolor() {
    var nodes = field.querySelectorAll('.pt-ink');
    for (var i = 0; i < nodes.length; i++) nodes[i].setAttribute('fill', color);
    colorDot.style.background = color;
  }
  function syncPeek() {
    toggle.innerHTML = annotate ? noteGlyph : glyphs[pen];
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    recolor();
  }
  function syncNoteTools() {
    var buttons = field.querySelectorAll('[data-note-tool]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-note-tool') === noteTool;
      buttons[i].classList.toggle('is-on', on);
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }
  function syncMode() {
    field.classList.toggle('is-open', open);
    field.classList.toggle('is-annotate', open && annotate);
    field.classList.toggle('is-element', open && annotate && noteTool === 'element');
    field.classList.toggle('is-box', open && annotate && noteTool === 'box');
    field.classList.toggle('is-guides', guidesOn);
    slots.setAttribute('data-face', annotate ? 'annotate' : face);
    annotateBtn.classList.toggle('is-on', annotate);
    annotateBtn.setAttribute('aria-pressed', annotate ? 'true' : 'false');
    guidesBtn.classList.toggle('is-on', guidesOn);
    guidesBtn.setAttribute('aria-pressed', guidesOn ? 'true' : 'false');
    colorBtn.classList.toggle('is-on', !annotate && face === 'palette');
    syncNoteTools();
    syncPeek();
    syncPointer();
    paintGuides();
    fitBar();
  }
  function hideNote() {
    target = null;
    region = null;
    noteEl.classList.remove('is-on');
    var nodes = field.querySelectorAll('[data-note]');
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove('is-picked');
  }
  function setOpen(next) {
    open = next;
    if (!next) hideNote();
    syncMode();
  }
  function frames() {
    var origin = field.getBoundingClientRect();
    var nodes = field.querySelectorAll('[data-guide]');
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
      var b = nodes[i].getBoundingClientRect();
      list.push({
        id: nodes[i].getAttribute('data-note'),
        x: Math.round(b.left - origin.left),
        y: Math.round(b.top - origin.top),
        width: Math.round(b.width),
        height: Math.round(b.height)
      });
    }
    return list;
  }
  function line(x1, y1, x2, y2) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', String(x1));
    el.setAttribute('y1', String(y1));
    el.setAttribute('x2', String(x2));
    el.setAttribute('y2', String(y2));
    el.setAttribute('stroke', guide);
    el.setAttribute('stroke-width', '1');
    guides.appendChild(el);
  }
  function paintGuides() {
    while (guides.firstChild) guides.removeChild(guides.firstChild);
    if (!guidesOn) return;
    var list = frames();
    if (!list.length) return;
    var top = list[0].y;
    var bottom = list[0].y + list[0].height;
    var seenH = {};
    var seenV = {};
    var i, f, rect;
    for (i = 0; i < list.length; i++) {
      f = list[i];
      if (f.y < top) top = f.y;
      if (f.y + f.height > bottom) bottom = f.y + f.height;
      seenH[f.y] = 1;
      seenH[Math.round(f.y + f.height / 2)] = 1;
      seenH[f.y + f.height] = 1;
      seenV[f.x] = 1;
      seenV[Math.round(f.x + f.width / 2)] = 1;
      seenV[f.x + f.width] = 1;
    }
    Object.keys(seenH).forEach(function (y) { line(0, Number(y), field.clientWidth, Number(y)); });
    Object.keys(seenV).forEach(function (x) { line(Number(x), top, Number(x), bottom); });
    for (i = 0; i < list.length; i++) {
      f = list[i];
      rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(f.x));
      rect.setAttribute('y', String(f.y));
      rect.setAttribute('width', String(f.width));
      rect.setAttribute('height', String(f.height));
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', guide);
      rect.setAttribute('stroke-width', '1');
      guides.appendChild(rect);
    }
  }
  function markdown() {
    return notes.map(function (note, index) {
      return (index + 1) + '. ' + note.label + '\\nselector: ' + note.selector + '\\nnote: ' + note.comment + '\\nbox: ' + note.box.x + ', ' + note.box.y + ', ' + note.box.width + ', ' + note.box.height;
    }).join('\\n\\n');
  }
  function refreshBadges() {
    var nodes = field.querySelectorAll('[data-note]');
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute('data-note');
      var count = notes.filter(function (note) { return note.id === id; }).length;
      var badge = nodes[i].querySelector('.pt-badge');
      if (!count) {
        if (badge) badge.remove();
        continue;
      }
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'pt-badge';
        nodes[i].appendChild(badge);
      }
      badge.textContent = String(count);
    }
  }
  function placeNote(box) {
    var width = 220;
    var left = Math.max(8, Math.min(box.x + box.width / 2 - width / 2, field.clientWidth - width - 8));
    var top = box.y - 158;
    if (top < 8) top = box.y + box.height + 8;
    noteEl.style.left = left + 'px';
    noteEl.style.top = top + 'px';
  }
  function paintRegions() {
    marks.innerHTML = '';
    notes.forEach(function (note, index) {
      if (note.selector !== 'region') return;
      var el = document.createElement('div');
      el.className = 'pt-region';
      el.style.left = note.box.x + 'px';
      el.style.top = note.box.y + 'px';
      el.style.width = note.box.width + 'px';
      el.style.height = note.box.height + 'px';
      var num = document.createElement('span');
      num.className = 'pt-region-num';
      num.textContent = String(index + 1);
      el.appendChild(num);
      marks.appendChild(el);
    });
  }
  function showBox(box) {
    boxEl.style.left = box.x + 'px';
    boxEl.style.top = box.y + 'px';
    boxEl.style.width = box.width + 'px';
    boxEl.style.height = box.height + 'px';
    boxEl.classList.add('is-on');
  }
  function showNote(node) {
    region = null;
    target = node;
    var id = node.getAttribute('data-note');
    var list = frames();
    var box = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) box = list[i];
    var nodes = field.querySelectorAll('[data-note]');
    for (var j = 0; j < nodes.length; j++) nodes[j].classList.toggle('is-picked', nodes[j] === node);
    labelEl.textContent = node.getAttribute('data-label') || '';
    selectorEl.textContent = '[data-note="' + id + '"]';
    noteEl.classList.add('is-on');
    input.value = '';
    if (box) placeNote(box);
    input.focus();
  }
  function commitDraft() {
    var comment = input.value.trim();
    if (!comment) return;
    if (region) {
      notes.push({ id: 'region', label: 'Box', selector: 'region', comment: comment, box: region });
      input.value = '';
      paintRegions();
      return;
    }
    if (!target) return;
    var id = target.getAttribute('data-note');
    var box = frames().filter(function (frame) { return frame.id === id; })[0] || { x: 0, y: 0, width: 0, height: 0 };
    notes.push({
      id: id,
      label: labelEl.textContent,
      selector: '[data-note="' + id + '"]',
      comment: comment,
      box: box
    });
    input.value = '';
    refreshBadges();
  }
  function selectPen(next) {
    pen = next;
    annotate = false;
    face = 'instruments';
    hideNote();
    var buttons = field.querySelectorAll('[data-pen]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-pen') === next;
      buttons[i].classList.toggle('is-on', on);
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    syncMode();
  }

  toggle.addEventListener('click', function (event) {
    event.stopPropagation();
    setOpen(true);
  });
  closeBtn.addEventListener('click', function (event) {
    event.stopPropagation();
    setOpen(false);
  });
  guidesBtn.addEventListener('click', function () {
    guidesOn = !guidesOn;
    syncMode();
  });
  annotateBtn.addEventListener('click', function () {
    annotate = !annotate;
    noteTool = 'element';
    face = 'instruments';
    hideNote();
    syncMode();
  });
  colorBtn.addEventListener('click', function () {
    if (annotate) return;
    face = face === 'palette' ? 'instruments' : 'palette';
    hideNote();
    syncMode();
  });
  field.querySelectorAll('[data-note-tool]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!annotate) return;
      noteTool = button.getAttribute('data-note-tool');
      hideNote();
      syncMode();
    });
  });
  field.querySelectorAll('[data-pen]').forEach(function (button) {
    button.addEventListener('click', function () { selectPen(button.getAttribute('data-pen')); });
  });
  field.querySelectorAll('[data-color]').forEach(function (button) {
    button.addEventListener('click', function () {
      color = button.getAttribute('data-color');
      face = 'instruments';
      syncMode();
      var swatches = field.querySelectorAll('[data-color]');
      for (var i = 0; i < swatches.length; i++) swatches[i].classList.toggle('is-on', swatches[i] === button);
    });
  });
  function rectBetween(x0, y0, x1, y1) {
    return {
      x: Math.round(Math.min(x0, x1)),
      y: Math.round(Math.min(y0, y1)),
      width: Math.round(Math.abs(x1 - x0)),
      height: Math.round(Math.abs(y1 - y0))
    };
  }
  canvas.addEventListener('pointerdown', function (event) {
    if (!open) return;
    var p = point(event);
    if (annotate && noteTool === 'box') {
      if (event.isTrusted) canvas.setPointerCapture(event.pointerId);
      boxDrag = { x0: p.x, y0: p.y, box: { x: p.x, y: p.y, width: 0, height: 0 } };
      showBox(boxDrag.box);
      return;
    }
    if (annotate) return;
    if (event.isTrusted) canvas.setPointerCapture(event.pointerId);
    draft = { pen: pen, color: color, points: [p] };
  });
  canvas.addEventListener('pointermove', function (event) {
    if (boxDrag) {
      var p = point(event);
      boxDrag.box = rectBetween(boxDrag.x0, boxDrag.y0, p.x, p.y);
      showBox(boxDrag.box);
      return;
    }
    if (!draft) return;
    draft.points.push(point(event));
    paint();
  });
  function endStroke() {
    if (boxDrag) {
      var box = boxDrag.box;
      boxDrag = null;
      boxEl.classList.remove('is-on');
      if (box.width > 6 && box.height > 6) {
        region = box;
        target = null;
        labelEl.textContent = 'Box';
        selectorEl.textContent = 'region';
        noteEl.classList.add('is-on');
        input.value = '';
        placeNote(box);
        input.focus();
      }
      return;
    }
    if (!draft) return;
    if (draft.points.length > 1) strokes.push(draft);
    draft = null;
    paint();
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  field.querySelectorAll('[data-note]').forEach(function (node) {
    node.addEventListener('click', function () {
      if (!open || !annotate || noteTool !== 'element') return;
      showNote(node);
    });
  });
  addBtn.addEventListener('click', commitDraft);
  copyBtn.addEventListener('click', function () {
    if (input.value.trim()) commitDraft();
    var text = markdown();
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied';
    setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1200);
  });
  window.addEventListener('resize', function () { resize(); fitBar(); });
  if (window.ResizeObserver) new ResizeObserver(function () { resize(); fitBar(); }).observe(field);
  resize();
  syncMode();
})();`;
