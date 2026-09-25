import { GUIDE, SAMPLE_CONTROLS } from './model';

const controlHtml = SAMPLE_CONTROLS.map(
  (control) =>
    `    <div class="pt-ctrl pt-${control.kind}" data-guide data-note="${control.id}" data-label="${control.label}">${control.label}</div>`,
).join('\n');

export const PREVIEW_TOOLS_HTML = `<div class="pt-field" id="pt-field">
  <div class="pt-row" id="pt-row">
${controlHtml}
  </div>
  <canvas class="pt-draw" id="pt-draw"></canvas>
  <svg class="pt-guides" id="pt-guides" aria-hidden="true"></svg>
  <div class="pt-dock">
    <button class="pt-toggle" type="button" id="pt-toggle" aria-expanded="false" aria-label="Open tools">+</button>
    <div class="pt-panel">
      <div class="pt-tools">
        <button class="pt-chip is-on" type="button" id="pt-guides-btn" aria-pressed="true">Guides</button>
        <button class="pt-chip is-on" type="button" data-ink="pen" aria-pressed="true">Pen</button>
        <button class="pt-chip" type="button" data-ink="marker" aria-pressed="false">Marker</button>
        <button class="pt-chip" type="button" data-ink="eraser" aria-pressed="false">Eraser</button>
      </div>
      <form class="pt-note" id="pt-note">
        <span class="pt-target" id="pt-target">Click a control</span>
        <input class="pt-input" id="pt-input" type="text" placeholder="Note for the agent" />
        <button class="pt-chip" type="submit">Add</button>
        <button class="pt-chip" id="pt-copy" type="button">Copy</button>
      </form>
    </div>
  </div>
</div>`;

export const PREVIEW_TOOLS_CSS = `.pt-field {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pt-dock {
  position: absolute;
  z-index: 6;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.pt-field.is-open .pt-dock { left: 8px; right: 8px; bottom: 8px; transform: none; }
.pt-toggle {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,.08);
  background: #fff;
  color: #17181c;
  font: 500 18px/1 Inter, system-ui, sans-serif;
  box-shadow: 0 4px 16px rgba(23,24,28,.12);
  cursor: pointer;
}
.pt-field.is-open .pt-toggle { background: #17181c; color: #fff; border-color: #17181c; }
.pt-panel { display: none; width: 100%; gap: 4px; }
.pt-field.is-open .pt-panel { display: flex; flex-direction: column; }
.pt-tools, .pt-note { display: flex; align-items: center; justify-content: center; gap: 4px; }
.pt-note { background: rgba(249,249,249,.92); border-radius: 10px; padding: 4px; }
.pt-chip {
  appearance: none;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.08);
  background: #fff;
  color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif;
  cursor: pointer;
}
.pt-chip.is-on { background: #17181c; color: #fff; border-color: #17181c; }
.pt-row { display: flex; align-items: center; gap: 8px; z-index: 5; }
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
}
.pt-icon, .pt-send, .pt-pill { height: 32px; }
.pt-short { height: 26px; }
.pt-icon, .pt-send { width: 32px; }
.pt-pill, .pt-short { padding: 0 12px; }
.pt-send { background: #17181c; color: #fff; border-color: #17181c; }
.pt-ctrl.is-picked { outline: 2px solid ${GUIDE}; outline-offset: 2px; }
.pt-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  background: ${GUIDE};
  color: #fff;
  font: 600 9px/14px Inter, system-ui, sans-serif;
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
.pt-field.is-open .pt-draw { pointer-events: auto; }
.pt-guides { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5; pointer-events: none; display: none; }
.pt-field.is-open.is-guides .pt-guides { display: block; }
.pt-target { font: 500 11px/1 Inter, system-ui, sans-serif; color: #6c6c6c; max-width: 72px; overflow: hidden; white-space: nowrap; }
.pt-input {
  flex: 1;
  min-width: 0;
  height: 26px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.08);
  padding: 0 8px;
  font: 500 12px/1 Inter, system-ui, sans-serif;
}
`;

export const PREVIEW_TOOLS_SCRIPT = `(function () {
  var field = document.getElementById('pt-field');
  var canvas = document.getElementById('pt-draw');
  var guides = document.getElementById('pt-guides');
  var input = document.getElementById('pt-input');
  var targetEl = document.getElementById('pt-target');
  var copyBtn = document.getElementById('pt-copy');
  var ctx = canvas.getContext('2d');
  var toggle = document.getElementById('pt-toggle');
  var guidesBtn = document.getElementById('pt-guides-btn');
  var open = false;
  var guidesOn = true;
  var ink = 'pen';
  var strokes = [];
  var draft = null;
  var notes = [];
  var target = null;
  var guide = '${GUIDE}';

  function resize() {
    var w = field.clientWidth;
    var h = field.clientHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    paint();
    paintGuides();
  }
  function trace(points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
  function paintStroke(stroke) {
    var points = stroke.points;
    if (points.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 18;
      trace(points);
    } else if (stroke.tool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 214, 10, 0.45)';
      ctx.lineWidth = 14;
      trace(points);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#17181c';
      for (var i = 1; i < points.length; i++) {
        var prev = points[i - 1];
        var next = points[i];
        var speed = Math.hypot(next.x - prev.x, next.y - prev.y);
        ctx.lineWidth = Math.max(0.8, 3.2 * (1 - Math.min(1, speed / 28) * 0.7));
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
  function setOpen(next) {
    open = next;
    field.classList.toggle('is-open', open);
    field.classList.toggle('is-guides', open && guidesOn);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close tools' : 'Open tools');
    toggle.textContent = open ? '×' : '+';
    paintGuides();
  }
  function setGuides(next) {
    guidesOn = next;
    field.classList.toggle('is-guides', open && guidesOn);
    guidesBtn.classList.toggle('is-on', guidesOn);
    guidesBtn.setAttribute('aria-pressed', guidesOn ? 'true' : 'false');
    paintGuides();
  }
  function setInk(next) {
    ink = next;
    var buttons = field.querySelectorAll('[data-ink]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-ink') === next;
      buttons[i].classList.toggle('is-on', on);
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
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
    var seenH = {};
    var seenV = {};
    var i, f, rect;
    for (i = 0; i < list.length; i++) {
      f = list[i];
      seenH[f.y] = 1;
      seenH[Math.round(f.y + f.height / 2)] = 1;
      seenH[f.y + f.height] = 1;
      seenV[f.x] = 1;
      seenV[Math.round(f.x + f.width / 2)] = 1;
      seenV[f.x + f.width] = 1;
    }
    Object.keys(seenH).forEach(function (y) { line(0, Number(y), field.clientWidth, Number(y)); });
    Object.keys(seenV).forEach(function (x) { line(Number(x), 0, Number(x), field.clientHeight); });
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
  function pick(node) {
    target = node;
    var nodes = field.querySelectorAll('[data-note]');
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.toggle('is-picked', nodes[i] === node);
    targetEl.textContent = node.getAttribute('data-label') || '';
    input.focus();
  }

  toggle.addEventListener('click', function () { setOpen(!open); });
  guidesBtn.addEventListener('click', function () { setGuides(!guidesOn); });
  field.querySelectorAll('[data-ink]').forEach(function (button) {
    button.addEventListener('click', function () { setInk(button.getAttribute('data-ink')); });
  });
  canvas.addEventListener('pointerdown', function (event) {
    if (!open) return;
    canvas.setPointerCapture(event.pointerId);
    draft = { tool: ink, points: [point(event)] };
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
      if (!open) return;
      pick(node);
    });
  });
  document.getElementById('pt-note').addEventListener('submit', function (event) {
    event.preventDefault();
    var comment = input.value.trim();
    if (!target || !comment) return;
    var id = target.getAttribute('data-note');
    var box = frames().filter(function (frame) { return frame.id === id; })[0];
    notes.push({
      id: id,
      label: targetEl.textContent,
      selector: '[data-note="' + id + '"]',
      comment: comment,
      box: box || { x: 0, y: 0, width: 0, height: 0 }
    });
    input.value = '';
    refreshBadges();
  });
  copyBtn.addEventListener('click', function () {
    var text = markdown();
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied';
    setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1200);
  });
  window.addEventListener('resize', resize);
  resize();
})();`;
