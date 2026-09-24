import { GUIDE, SAMPLE_CONTROLS } from './marks';

const controlHtml = SAMPLE_CONTROLS.map(
  (control) => `    <div class="sg-ctrl sg-${control.kind}" data-guide>${control.label}</div>`,
).join('\n');

export const SYMMETRY_GRID_HTML = `<div class="sg-field" id="sg-field">
  <button class="sg-toggle" type="button" id="sg-toggle" aria-pressed="false">Guides</button>
  <div class="sg-row">
${controlHtml}
  </div>
  <svg class="sg-overlay" id="sg-overlay" aria-hidden="true"></svg>
</div>`;

export const SYMMETRY_GRID_CSS = `.sg-field {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.sg-toggle {
  appearance: none;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,.08);
  background: #fff;
  color: #17181c;
  font: 500 13px/1 Inter, system-ui, sans-serif;
  cursor: pointer;
  z-index: 2;
}
.sg-toggle.is-on { background: #17181c; color: #fff; }
.sg-row { display: flex; align-items: center; gap: 8px; z-index: 1; }
.sg-ctrl {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #fff;
  color: #17181c;
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  font: 600 13px/1 Inter, system-ui, sans-serif;
}
.sg-icon, .sg-send, .sg-pill { height: 32px; }
.sg-short { height: 26px; }
.sg-icon, .sg-send { width: 32px; }
.sg-pill, .sg-short { padding: 0 12px; }
.sg-send { background: #17181c; color: #fff; border-color: #17181c; }
.sg-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 3;
}`;

export const SYMMETRY_GRID_SCRIPT = `(function () {
  var field = document.getElementById('sg-field');
  var overlay = document.getElementById('sg-overlay');
  var toggle = document.getElementById('sg-toggle');
  var on = false;
  var guide = '${GUIDE}';
  function round(n) { return Math.round(n); }
  function paint() {
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
    if (!on) return;
    var origin = field.getBoundingClientRect();
    var nodes = field.querySelectorAll('[data-guide]');
    var frames = [];
    var i, b, f, el, rect;
    for (i = 0; i < nodes.length; i++) {
      b = nodes[i].getBoundingClientRect();
      frames.push({
        x: b.left - origin.left,
        y: b.top - origin.top,
        w: b.width,
        h: b.height
      });
    }
    var seenH = {};
    var seenV = {};
    function line(x1, y1, x2, y2) {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      el.setAttribute('x1', String(x1));
      el.setAttribute('y1', String(y1));
      el.setAttribute('x2', String(x2));
      el.setAttribute('y2', String(y2));
      el.setAttribute('stroke', guide);
      el.setAttribute('stroke-width', '1');
      overlay.appendChild(el);
    }
    for (i = 0; i < frames.length; i++) {
      f = frames[i];
      seenH[round(f.y)] = 1;
      seenH[round(f.y + f.h / 2)] = 1;
      seenH[round(f.y + f.h)] = 1;
      seenV[round(f.x)] = 1;
      seenV[round(f.x + f.w / 2)] = 1;
      seenV[round(f.x + f.w)] = 1;
    }
    Object.keys(seenH).forEach(function (y) { line(0, Number(y), field.clientWidth, Number(y)); });
    Object.keys(seenV).forEach(function (x) { line(Number(x), 0, Number(x), field.clientHeight); });
    for (i = 0; i < frames.length; i++) {
      f = frames[i];
      rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(f.x));
      rect.setAttribute('y', String(f.y));
      rect.setAttribute('width', String(f.w));
      rect.setAttribute('height', String(f.h));
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', guide);
      rect.setAttribute('stroke-width', '1');
      overlay.appendChild(rect);
    }
  }
  toggle.addEventListener('click', function () {
    on = !on;
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.classList.toggle('is-on', on);
    paint();
  });
  window.addEventListener('resize', paint);
})();`;
