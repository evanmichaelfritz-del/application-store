import { CHEVRON_SVG, GUIDE, INSTRUMENTS, SAMPLE_CONTROLS, STAGE_HEIGHT, SWATCHES, marksSvg } from './model';

const controlHtml = SAMPLE_CONTROLS.map(
  (control) =>
    `    <div class="pt-ctrl pt-${control.kind}" data-guide data-note="${control.id}" data-label="${control.label}">${control.label}</div>`,
).join('\n');

const penHtml = INSTRUMENTS.map((item) => {
  const on = item.id === 'pen' ? ' is-on' : '';
  return `<button class="pt-pen${on}" type="button" data-pen="${item.id}" aria-label="${item.label}" aria-pressed="${item.id === 'pen' ? 'true' : 'false'}">${marksSvg(item.marks, 18, 30)}</button>`;
}).join('');

const swatchHtml = SWATCHES.map(
  (color) =>
    `<button class="pt-swatch${color === '#17181c' ? ' is-on' : ''}" type="button" data-color="${color}" aria-label="${color}" style="background:${color}"></button>`,
).join('');

const penSvg = marksSvg(INSTRUMENTS[1].marks, 18, 30);
const glyphs = Object.fromEntries(INSTRUMENTS.map((item) => [item.id, marksSvg(item.marks, 18, 30)]));

const alignSvg = `<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="8.3" width="16" height="1.4" fill="currentColor"/></svg>`;
const noteSvg = `<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><rect x="2" y="2" width="14" height="10" rx="2" fill="none" stroke="#17181c" stroke-width="1.4"/><path d="M6 12.2 L9 12.2 L6.6 15.2 Z" fill="#17181c"/></svg>`;

export const PREVIEW_TOOLS_HTML = `<div class="pt-field" id="pt-field">
  <div class="pt-row" id="pt-row">
${controlHtml}
  </div>
  <canvas class="pt-draw" id="pt-draw"></canvas>
  <svg class="pt-guides" id="pt-guides" aria-hidden="true"></svg>
  <div class="pt-note" id="pt-note">
    <p class="pt-note-label" id="pt-note-label"></p>
    <p class="pt-note-selector" id="pt-note-selector"></p>
    <textarea id="pt-note-input" placeholder="Note for the agent"></textarea>
    <div class="pt-note-actions">
      <button class="pt-copy" id="pt-note-copy" type="button">Copy</button>
      <button class="pt-add" id="pt-note-add" type="button">Add</button>
    </div>
  </div>
  <div class="pt-dock">
    <div class="pt-bar" id="pt-bar">
      <div class="pt-slots" id="pt-slots" data-face="instruments">${penHtml}${swatchHtml}</div>
      <button class="pt-color" id="pt-color" type="button" aria-label="Color"><span id="pt-color-dot" style="background:#17181c"></span></button>
      <button class="pt-tool is-on" id="pt-guides-btn" type="button" aria-label="Alignment" aria-pressed="true">${alignSvg}</button>
      <button class="pt-tool" id="pt-annotate" type="button" aria-label="Annotate" aria-pressed="false">${noteSvg}</button>
    </div>
    <button class="pt-disc" type="button" id="pt-toggle" aria-expanded="false" aria-label="Open tools">${penSvg}</button>
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
.pt-field.is-annotate .pt-ctrl:hover,
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
.pt-dock {
  position: absolute;
  z-index: 8;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: calc(100% - 16px);
}
.pt-bar {
  display: none;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 52px;
  max-width: calc(100% - 54px);
  padding: 4px 6px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 10px 28px rgba(23,24,28,.16);
}
.pt-field.is-open .pt-bar { display: flex; }
.pt-slots { display: flex; align-items: flex-end; gap: 1px; }
.pt-pen {
  width: 24px;
  height: 40px;
  border: 0;
  padding: 0;
  background: transparent;
  border-radius: 8px;
  display: grid;
  place-items: end center;
  cursor: pointer;
}
.pt-pen.is-on { background: #ececee; }
.pt-slots[data-face="instruments"] .pt-swatch { display: none; }
.pt-slots[data-face="palette"] .pt-pen { display: none; }
.pt-swatch {
  width: 16px;
  height: 16px;
  margin: 0 2px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.12);
  padding: 0;
  cursor: pointer;
}
.pt-swatch.is-on { outline: 2px solid #17181c; outline-offset: 2px; }
.pt-color, .pt-tool {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  color: #17181c;
}
.pt-color { border-radius: 14px; border: 1px solid rgba(0,0,0,.08); background: #fff; }
.pt-color span {
  width: 16px;
  height: 16px;
  border-radius: 8px;
  display: block;
  border: 1px solid rgba(0,0,0,.15);
}
.pt-tool.is-on, .pt-color.is-on { background: #ececee; }
#pt-guides-btn.is-on { color: ${GUIDE}; }
.pt-disc {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border: 1px solid rgba(0,0,0,.06);
  background: #fff;
  box-shadow: 0 10px 28px rgba(23,24,28,.16);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  flex: 0 0 auto;
}
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
  var slots = document.getElementById('pt-slots');
  var open = false;
  var guidesOn = true;
  var annotate = false;
  var face = 'instruments';
  var pen = 'pen';
  var color = '#17181c';
  var strokes = [];
  var draft = null;
  var notes = [];
  var target = null;
  var guide = '${GUIDE}';
  var glyphs = ${JSON.stringify(glyphs)};
  var chevron = ${JSON.stringify(CHEVRON_SVG)};

  function hexAlpha(hex, alpha) {
    var value = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((value >> 16) & 255) + ', ' + ((value >> 8) & 255) + ', ' + (value & 255) + ', ' + alpha + ')';
  }
  function resize() {
    var w = field.clientWidth;
    var h = field.clientHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    paint();
    paintGuides();
  }
  function paintStroke(stroke) {
    var points = stroke.points;
    if (points.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (stroke.pen === 'eraser' || stroke.pen === 'highlighter' || stroke.pen === 'fineliner') {
      if (stroke.pen === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 20;
      } else if (stroke.pen === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = hexAlpha(stroke.color, 0.38);
        ctx.lineWidth = 16;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = 1.35;
      }
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      for (var j = 1; j < points.length; j++) {
        var prev = points[j - 1];
        var next = points[j];
        var dx = next.x - prev.x;
        var dy = next.y - prev.y;
        var dist = Math.hypot(dx, dy) || 1;
        if (stroke.pen === 'fountain') {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = 0.6 + (Math.max(0, dy) / dist) * 5.5;
        } else if (stroke.pen === 'brush') {
          var brushSpeed = Math.min(1, dist / 22);
          ctx.strokeStyle = hexAlpha(stroke.color, 0.85);
          ctx.lineWidth = Math.max(1.8, 9 * (1 - brushSpeed * 0.78));
        } else if (stroke.pen === 'pencil') {
          var pencilSpeed = Math.min(1, dist / 24);
          ctx.strokeStyle = '#4a4a4a';
          ctx.lineWidth = Math.max(0.45, 2.2 * (1 - pencilSpeed * 0.75));
        } else {
          var penSpeed = Math.min(1, dist / 28);
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = Math.max(0.7, 3.4 * (1 - penSpeed * 0.72));
        }
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
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
    var on = open && !annotate ? 'auto' : 'none';
    canvas.style.setProperty('pointer-events', on, 'important');
    canvas.style.cursor = open && !annotate ? 'crosshair' : 'default';
  }
  function syncDisc() {
    toggle.innerHTML = open ? chevron : glyphs[pen];
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close tools' : 'Open tools');
  }
  function hideNote() {
    target = null;
    noteEl.classList.remove('is-on');
    var nodes = field.querySelectorAll('[data-note]');
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove('is-picked');
  }
  function setOpen(next) {
    open = next;
    field.classList.toggle('is-open', open);
    if (open) {
      annotate = false;
      face = 'instruments';
      slots.setAttribute('data-face', face);
      colorBtn.classList.remove('is-on');
      annotateBtn.classList.remove('is-on');
      annotateBtn.setAttribute('aria-pressed', 'false');
      hideNote();
    } else {
      hideNote();
    }
    field.classList.toggle('is-annotate', open && annotate);
    field.classList.toggle('is-guides', open && guidesOn);
    syncDisc();
    syncPointer();
    paintGuides();
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
    if (!open || !guidesOn) return;
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
  function showNote(node) {
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
    if (box) {
      var width = 220;
      var left = Math.max(8, Math.min(box.x + box.width / 2 - width / 2, field.clientWidth - width - 8));
      var top = box.y - 158;
      if (top < 8) top = box.y + box.height + 8;
      noteEl.style.left = left + 'px';
      noteEl.style.top = top + 'px';
    }
    input.focus();
  }
  function commitDraft() {
    var comment = input.value.trim();
    if (!target || !comment) return;
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
    slots.setAttribute('data-face', face);
    colorBtn.classList.remove('is-on');
    annotateBtn.classList.remove('is-on');
    annotateBtn.setAttribute('aria-pressed', 'false');
    field.classList.remove('is-annotate');
    hideNote();
    var buttons = field.querySelectorAll('[data-pen]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-pen') === next;
      buttons[i].classList.toggle('is-on', on);
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    syncDisc();
    syncPointer();
  }

  toggle.addEventListener('click', function (event) {
    event.stopPropagation();
    setOpen(!open);
  });
  guidesBtn.addEventListener('click', function () {
    guidesOn = !guidesOn;
    guidesBtn.classList.toggle('is-on', guidesOn);
    guidesBtn.setAttribute('aria-pressed', guidesOn ? 'true' : 'false');
    field.classList.toggle('is-guides', open && guidesOn);
    paintGuides();
  });
  annotateBtn.addEventListener('click', function () {
    annotate = !annotate;
    face = 'instruments';
    slots.setAttribute('data-face', face);
    colorBtn.classList.remove('is-on');
    annotateBtn.classList.toggle('is-on', annotate);
    annotateBtn.setAttribute('aria-pressed', annotate ? 'true' : 'false');
    field.classList.toggle('is-annotate', open && annotate);
    if (annotate) {
      var buttons = field.querySelectorAll('[data-pen]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('is-on');
        buttons[i].setAttribute('aria-pressed', 'false');
      }
    } else {
      hideNote();
      selectPen(pen);
    }
    syncPointer();
  });
  colorBtn.addEventListener('click', function () {
    face = face === 'palette' ? 'instruments' : 'palette';
    slots.setAttribute('data-face', face);
    colorBtn.classList.toggle('is-on', face === 'palette');
    annotate = false;
    annotateBtn.classList.remove('is-on');
    annotateBtn.setAttribute('aria-pressed', 'false');
    field.classList.remove('is-annotate');
    hideNote();
    syncPointer();
  });
  field.querySelectorAll('[data-pen]').forEach(function (button) {
    button.addEventListener('click', function () { selectPen(button.getAttribute('data-pen')); });
  });
  field.querySelectorAll('[data-color]').forEach(function (button) {
    button.addEventListener('click', function () {
      color = button.getAttribute('data-color');
      colorDot.style.background = color;
      face = 'instruments';
      slots.setAttribute('data-face', face);
      colorBtn.classList.remove('is-on');
      var swatches = field.querySelectorAll('[data-color]');
      for (var i = 0; i < swatches.length; i++) swatches[i].classList.toggle('is-on', swatches[i] === button);
    });
  });
  canvas.addEventListener('pointerdown', function (event) {
    if (!open || annotate) return;
    try { canvas.setPointerCapture(event.pointerId); } catch (err) {}
    draft = { pen: pen, color: color, points: [point(event)] };
  });
  canvas.addEventListener('pointermove', function (event) {
    if (!draft) return;
    draft.points.push(point(event));
    paint();
  });
  function endStroke() {
    if (!draft) return;
    if (draft.points.length > 1) strokes.push(draft);
    draft = null;
    paint();
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  field.querySelectorAll('[data-note]').forEach(function (node) {
    node.addEventListener('click', function () {
      if (!open || !annotate) return;
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
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(field);
  resize();
  syncPointer();
})();`;
