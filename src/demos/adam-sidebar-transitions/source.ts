/**
 * Sidebar transition experiments.
 * One document: the live card calls boot(), and Copy runs the same function.
 */

const svgOpen =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const svgClose = '</svg>';

function svg(body: string): string {
  return svgOpen + body + svgClose;
}

const ICONS = {
  grid: svg(
    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  ),
  clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/>'),
  file: svg('<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z"/><path d="M14 3.5V8h4.5"/>'),
  chart: svg('<path d="M4 19.5V11"/><path d="M10 19.5V5"/><path d="M16 19.5v-6"/><path d="M3 19.5h18"/>'),
  board: svg('<rect x="3.5" y="4.5" width="17" height="13" rx="2"/><path d="M3.5 9h17"/><path d="M9 9v8.5"/>'),
  shield: svg('<path d="M12 3.5l7.5 2.8v5.4c0 4.4-3.1 6.8-7.5 8.3-4.4-1.5-7.5-3.9-7.5-8.3V6.3z"/>'),
  users: svg(
    '<circle cx="9" cy="8.5" r="2.6"/><path d="M3.8 18.2c.4-2.6 2.4-4 5.2-4s4.8 1.4 5.2 4"/><circle cx="16.5" cy="9" r="2"/><path d="M16.2 14.2c1.6.2 2.8 1.2 3.3 2.6"/>',
  ),
  user: svg('<circle cx="12" cy="8.5" r="2.7"/><path d="M5.5 18.4c.7-2.8 3-4.3 6.5-4.3s5.8 1.5 6.5 4.3"/>'),
  sliders: svg(
    '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/><circle cx="8" cy="7" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="10" cy="17" r="1.7"/>',
  ),
  reset: svg('<path d="M4 12a8 8 0 1 0 2.2-5.5"/><path d="M4 4.5V10h5.5"/>'),
};

const NAV: { label: string; icon: string }[] = [
  { label: 'Dashboard', icon: ICONS.grid },
  { label: 'Analytics', icon: ICONS.clock },
  { label: 'Documents', icon: ICONS.file },
  { label: 'Reports', icon: ICONS.chart },
  { label: 'Projects', icon: ICONS.board },
  { label: 'Security', icon: ICONS.shield },
  { label: 'Users', icon: ICONS.users },
  { label: 'Account', icon: ICONS.user },
  { label: 'Settings', icon: ICONS.sliders },
];

function row(icon: string, label: string, brand = false): string {
  return `<div class="row${brand ? ' brand' : ''}"><span class="ico">${icon}</span><span class="lab">${label}</span></div>`;
}

export const HTML = `<div id="adam-sidebar" data-testid="adam-sidebar">
  <div class="frame">
    <div class="window">
      <aside class="side" data-testid="sidebar">
        ${row('<span class="logo"></span>', 'Acme Inc', true)}
        ${NAV.map((item) => row(item.icon, item.label)).join('\n        ')}
        <div class="edge" data-testid="sidebar-edge" data-cursor="resize-ew" role="separator" aria-orientation="vertical" aria-label="Drag to resize sidebar" aria-valuemin="64" aria-valuemax="248" aria-valuenow="248"></div>
      </aside>
      <div class="main">
        <div class="panel">
          <button type="button" class="toggle" data-testid="sidebar-toggle" aria-expanded="true" aria-label="Collapse sidebar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><line class="mark" x1="9.17" y1="4.5" x2="9.17" y2="19.5"/></svg></button>
          <div class="skel">
            <div class="bar w1"></div>
            <div class="bar w2"></div>
            <div class="rule"></div>
            <div class="card"><div class="sq"></div><div class="lines"><div class="bar w3"></div><div class="bar w4"></div></div><div class="pill"></div></div>
            <div class="bar w5"></div>
            <div class="card"><div class="sq"></div><div class="lines"><div class="bar w3"></div><div class="bar w4"></div></div><div class="pill"></div></div>
            <div class="bar w5"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="dock">
      <p class="desc" data-testid="sidebar-desc"></p>
      <div class="controls">
        <div class="seg" role="group" aria-label="Transition mode">
          <button type="button" data-mode="ease" data-testid="mode-ease" aria-pressed="true">Ease out</button>
          <button type="button" data-mode="cascade" data-testid="mode-cascade" aria-pressed="false">Cascade</button>
          <button type="button" data-mode="scrub" data-testid="mode-scrub" aria-pressed="false">Scrub</button>
        </div>
        <button type="button" class="play" data-testid="sidebar-play" aria-pressed="false" aria-label="Play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg><span>Play</span></button>
        <button type="button" class="reset" data-testid="sidebar-reset" aria-label="Reset">${ICONS.reset}<span>Reset</span></button>
      </div>
    </div>
    <div class="tip" data-testid="sidebar-tip" role="tooltip" hidden>Drag to resize sidebar</div>
    <div class="cursor" data-kind="pointer" data-testid="sidebar-cursor" hidden>
      <div class="cursor-press">
        <div class="glyph" data-glyph="pointer" data-on="true"><svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><g transform="translate(10 7)"><path d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z" fill="#fff"/><path d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z" fill="#000"/></g></svg></div>
        <div class="glyph" data-glyph="resize-ew" data-on="false"><svg width="21" height="21" viewBox="-14 -14 28 28" aria-hidden="true"><g transform="rotate(90)" stroke-linejoin="round"><path d="M0-8.4 2.55-3.65H-2.55ZM0 8.4 2.55 3.65H-2.55Z" fill="#fff" stroke="#fff" stroke-width="3.2"/><path d="M0-8.4 2.55-3.65H-2.55ZM0 8.4 2.55 3.65H-2.55Z" fill="#000" stroke="#000" stroke-width="1.2"/></g></svg></div>
      </div>
    </div>
  </div>
</div>`;

export const CSS = `html, body { margin: 0; height: 100%; background: #f9f9f9; }
#adam-sidebar {
  --side-open: 248px;
  --side-closed: 64px;
  --side-snap: 160px;
  --side-dur: 400ms;
  --label-dur: 160ms;
  --label-delay: 240ms;
  --scrub-dur: 335ms;
  --row-stagger: 31ms;
  --row-fade: 120ms;
  --cascade-lead: 125ms;
  --cascade-lag: 110ms;
  --ink-zero: 89px;
  --ink-span: 70px;
  --shift: -6px;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --scrub-ease: cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  width: 100%;
  height: 520px;
  overflow: hidden;
  background: #f9f9f9;
  color: #17181c;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
}
#adam-sidebar .frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 960px;
  height: 520px;
  transform-origin: top left;
}
#adam-sidebar .window {
  position: absolute;
  left: 40px;
  top: 20px;
  width: 880px;
  height: 440px;
  display: flex;
  background: #f9f9f9;
  border: 1px solid #e6e6e6;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);
}
#adam-sidebar .side {
  position: relative;
  width: var(--side-open);
  flex: none;
  height: 100%;
  background: transparent;
  overflow: hidden;
}
#adam-sidebar .side.is-hot { box-shadow: inset -2px 0 0 #4671e4; }
#adam-sidebar .row { position: relative; height: 39px; }
#adam-sidebar .brand { height: 44px; margin-top: 16px; }
#adam-sidebar .ico {
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3f3f46;
}
#adam-sidebar .brand .ico { left: 22px; width: 20px; }
#adam-sidebar .ico svg { width: 16px; height: 16px; display: block; }
#adam-sidebar .logo { width: 20px; height: 20px; border-radius: 5px; background: #d4d4d8; }
#adam-sidebar .lab {
  position: absolute;
  left: 48.5px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  color: #17181c;
  white-space: nowrap;
  will-change: opacity, transform;
}
#adam-sidebar .brand .lab { left: 50.5px; font-weight: 600; }
#adam-sidebar .edge {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 100%;
  cursor: col-resize;
  touch-action: none;
  z-index: 4;
}
#adam-sidebar .main { position: relative; flex: 1; min-width: 0; background: transparent; }
#adam-sidebar .panel {
  position: absolute;
  top: 10px;
  right: 0;
  bottom: 0;
  left: 0;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}
#adam-sidebar .toggle {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
  color: #3f3f46;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}
#adam-sidebar .toggle svg { width: 14px; height: 14px; }
#adam-sidebar .skel { padding: 56px 28px 16px; }
#adam-sidebar .bar { height: 10px; border-radius: 5px; background: #e6e6e6; }
#adam-sidebar .w1 { width: 168px; }
#adam-sidebar .w2 { width: 100%; height: 8px; margin-top: 10px; }
#adam-sidebar .rule { height: 1px; background: #f0f0f0; margin: 16px 0; }
#adam-sidebar .card {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f6f6f6;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 8px;
}
#adam-sidebar .sq { width: 44px; height: 36px; border-radius: 8px; background: #e4e4e7; flex: none; }
#adam-sidebar .lines { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
#adam-sidebar .w3 { width: 62%; }
#adam-sidebar .w4 { width: 40%; height: 8px; }
#adam-sidebar .w5 { width: 46%; margin: 6px 0 14px; }
#adam-sidebar .pill { width: 36px; height: 12px; border-radius: 6px; background: #e4e4e7; flex: none; }
#adam-sidebar .dock {
  position: absolute;
  left: 480px;
  bottom: 14px;
  transform: translateX(-50%);
  width: 540px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 14px 16px 12px;
  z-index: 5;
  text-align: center;
}
#adam-sidebar .desc { margin: 0; font-size: 13px; line-height: 18px; color: #17181c; }
#adam-sidebar .controls { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 10px; }
#adam-sidebar .seg { display: flex; background: #f3f3f3; border-radius: 10px; padding: 3px; }
#adam-sidebar .seg button,
#adam-sidebar .play,
#adam-sidebar .reset {
  appearance: none;
  border: 0;
  background: transparent;
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  font: 500 13px/1 Inter, system-ui, sans-serif;
  color: #17181c;
  cursor: pointer;
}
#adam-sidebar .seg button[aria-pressed="true"] {
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
#adam-sidebar .play,
#adam-sidebar .reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
  border-radius: 10px;
  height: 32px;
}
#adam-sidebar .play svg,
#adam-sidebar .reset svg { width: 14px; height: 14px; }
#adam-sidebar .play[aria-pressed="true"] { background: #f3f3f3; }
#adam-sidebar .reset:disabled { color: #a8a7aa; cursor: default; }
#adam-sidebar .cursor {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 8;
  pointer-events: none;
  will-change: transform;
}
#adam-sidebar .cursor[hidden] { display: none; }
#adam-sidebar .cursor-press {
  display: grid;
  transform-origin: 0 0;
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}
#adam-sidebar .cursor[data-pressed="true"] .cursor-press {
  transform: scale(0.9);
  transition: transform 0.08s ease-out;
}
#adam-sidebar .glyph {
  grid-area: 1 / 1;
  opacity: 0;
  transform: scale(0.5);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
#adam-sidebar .glyph[data-glyph="pointer"] { margin-left: -7.5px; margin-top: -5.25px; transform-origin: 7.5px 5.25px; }
#adam-sidebar .glyph[data-glyph="resize-ew"] { margin-left: -10.5px; margin-top: -10.5px; transform-origin: 10.5px 10.5px; }
#adam-sidebar .glyph[data-on="true"] { opacity: 1; transform: scale(1); }
#adam-sidebar .glyph svg { display: block; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)); }
#adam-sidebar .tip {
  position: absolute;
  z-index: 6;
  background: #ffffff;
  border: 1px solid #ececec;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12px;
  line-height: 16px;
  color: #17181c;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  pointer-events: none;
  white-space: nowrap;
}
#adam-sidebar .tip[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) {
  #adam-sidebar {
    --side-dur: 0ms;
    --label-dur: 0ms;
    --label-delay: 0ms;
    --scrub-dur: 0ms;
    --row-stagger: 0ms;
    --row-fade: 0ms;
    --cascade-lead: 0ms;
    --cascade-lag: 0ms;
  }
  #adam-sidebar .cursor,
  #adam-sidebar[data-reduce="1"] .cursor { display: none; }
  #adam-sidebar .cursor-press,
  #adam-sidebar .glyph { transition: none; }
}
#adam-sidebar[data-reduce="1"] .cursor { display: none; }`;

const BOOT_SOURCE = `
function boot(root) {
  if (root.getAttribute('data-booted') === '1') return;
  root.setAttribute('data-booted', '1');

  var frame = root.querySelector('.frame');
  var side = root.querySelector('.side');
  var edge = root.querySelector('.edge');
  var toggle = root.querySelector('.toggle');
  var desc = root.querySelector('.desc');
  var tip = root.querySelector('.tip');
  var resetBtn = root.querySelector('.reset');
  var playBtn = root.querySelector('.play');
  var mark = root.querySelector('.mark');
  var cursor = root.querySelector('.cursor');
  var win = root.querySelector('.window');
  var modeBtns = root.querySelectorAll('[data-mode]');
  var labs = Array.prototype.slice.call(root.querySelectorAll('.lab'));

  var COPY = {
    ease: 'Snaps to icons once you drag under 160px. Labels fade in 0.16s while the width glides over 0.4s.',
    cascade:
      'Snaps to icons once you drag under 160px. Follows your drag in one motion. Past 160px the labels drift left and fade from the top down, and it settles to icons when you let go. The collapse button plays it over 0.4s.',
    scrub: 'Follows your drag. Labels fade as you narrow the sidebar, and it settles to icons when you let go.',
  };

  var mode = 'ease';
  var width = 248;
  var easeOpacity = 1;
  var scale = 1;
  var dragging = false;
  var pointer = -1;
  var startX = 0;
  var startW = 248;
  var raf = 0;
  var travelTo = -1;
  var playGen = 0;
  var playing = false;
  var cursorX = 0;
  var cursorY = 0;
  var disposed = false;

  function cssNum(name, fallback) {
    var raw = getComputedStyle(root).getPropertyValue(name);
    var value = parseFloat(raw);
    return isFinite(value) ? value : fallback;
  }

  function reduced() {
    if (root.getAttribute('data-reduce') === '1') return true;
    var rootNode = document.documentElement;
    if (rootNode && rootNode.getAttribute('data-reduce-motion') === '1') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function ms(name, fallback) {
    if (reduced()) return 0;
    return cssNum(name, fallback);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function unitBezier(t, x1, y1, x2, y2) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var cx = 3 * x1;
    var bx = 3 * (x2 - x1) - cx;
    var ax = 1 - cx - bx;
    var u = t;
    var i = 0;
    while (i < 8) {
      var dx = ((ax * u + bx) * u + cx) * u - t;
      var d = (3 * ax * u + 2 * bx) * u + cx;
      if (Math.abs(d) < 1e-6) break;
      u = u - dx / d;
      if (u < 0) u = 0;
      if (u > 1) u = 1;
      i += 1;
    }
    var cy = 3 * y1;
    var by = 3 * (y2 - y1) - cy;
    var ay = 1 - cy - by;
    return ((ay * u + by) * u + cy) * u;
  }

  function easeOutCurve(t) {
    return unitBezier(t, 0.4, 0, 0.2, 1);
  }

  function scrubCurve(t) {
    return unitBezier(t, 0.25, 1, 0.5, 1);
  }

  function openW() {
    return cssNum('--side-open', 248);
  }
  function closedW() {
    return cssNum('--side-closed', 64);
  }
  function snapW() {
    return cssNum('--side-snap', 160);
  }
  function shiftPx() {
    return cssNum('--shift', -6);
  }

  function easeDragOpacity(w) {
    return clamp((w - cssNum('--ink-zero', 89)) / cssNum('--ink-span', 70), 0, 1);
  }

  function readOpacity(el) {
    var parsed = parseFloat(el.style.opacity);
    return isFinite(parsed) ? parsed : 1;
  }

  function syncReset() {
    var open = openW();
    var atOpen = Math.abs(width - open) < 0.75;
    var headingOpen = travelTo >= 0 && Math.abs(travelTo - open) < 0.75 && mode === 'ease';
    var disabled = mode === 'ease' && (headingOpen || (travelTo < 0 && atOpen));
    resetBtn.disabled = disabled;
    resetBtn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  }

  function cancel() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (travelTo !== -1) {
      travelTo = -1;
      syncReset();
    }
  }

  function beginTravel(to) {
    travelTo = to;
    syncReset();
  }

  function endTravel() {
    if (travelTo === -1) {
      syncReset();
      return;
    }
    travelTo = -1;
    syncReset();
  }

  function applyWidth(next) {
    width = next;
    side.style.width = next + 'px';
    edge.setAttribute('aria-valuenow', String(Math.round(next)));
    edge.setAttribute('aria-valuetext', Math.round(next) + ' pixels');
    var openNow = next > snapW();
    toggle.setAttribute('aria-label', openNow ? 'Collapse sidebar' : 'Expand sidebar');
    toggle.setAttribute('aria-expanded', openNow ? 'true' : 'false');
    syncMark();
    syncReset();
  }

  function syncMark() {
    if (!mark) return;
    var span = openW() - closedW();
    var along = span ? clamp((openW() - width) / span, 0, 1) : 0;
    var x = (3.5 + 17 * (1 / 3 + along / 3)).toFixed(2);
    mark.setAttribute('x1', x);
    mark.setAttribute('x2', x);
  }

  function paintEase(opacity) {
    var i = 0;
    while (i < labs.length) {
      labs[i].style.opacity = String(opacity);
      labs[i].style.transform = 'none';
      i += 1;
    }
  }

  function cascadeOpacity(w, index) {
    var span = snapW() - closedW();
    var p = clamp((snapW() - w) / span, 0, 1);
    var start = labs.length <= 1 ? 0 : (index / (labs.length - 1)) * 0.4;
    return clamp(1 - (p - start) / 0.45, 0, 1);
  }

  function paintCascade(w) {
    var shift = shiftPx();
    var i = 0;
    while (i < labs.length) {
      var opacity = cascadeOpacity(w, i);
      labs[i].style.opacity = String(opacity);
      labs[i].style.transform = 'translateX(' + (1 - opacity) * shift + 'px)';
      i += 1;
    }
  }

  function scrubOpacity(w) {
    return clamp((w - closedW()) / (snapW() - closedW()), 0, 1);
  }

  function paintScrub(w) {
    var opacity = scrubOpacity(w);
    var i = 0;
    while (i < labs.length) {
      labs[i].style.opacity = String(opacity);
      labs[i].style.transform = 'none';
      i += 1;
    }
  }

  function paint() {
    if (mode === 'cascade') paintCascade(width);
    else if (mode === 'scrub') paintScrub(width);
    else paintEase(easeOpacity);
  }

  function setMode(next) {
    mode = next;
    var i = 0;
    while (i < modeBtns.length) {
      var btn = modeBtns[i];
      btn.setAttribute('aria-pressed', btn.getAttribute('data-mode') === next ? 'true' : 'false');
      i += 1;
    }
    desc.textContent = COPY[next] || COPY.ease;
    syncReset();
  }

  function labelShift(el) {
    var raw = el.style.transform || '';
    var found = /translateX\(([-\d.]+)px\)/.exec(raw);
    return found ? parseFloat(found[1]) : 0;
  }

  function writeLabel(el, opacity, shift) {
    el.style.opacity = String(opacity);
    el.style.transform = Math.abs(shift) < 0.001 ? 'none' : 'translateX(' + shift + 'px)';
  }

  function modeLabelTargets() {
    var ops = [];
    var i = 0;
    if (mode === 'scrub') {
      var scrub = scrubOpacity(width);
      while (i < labs.length) {
        ops.push(scrub);
        i += 1;
      }
    } else if (mode === 'cascade') {
      while (i < labs.length) {
        ops.push(cascadeOpacity(width, i));
        i += 1;
      }
    } else {
      var ease = easeDragOpacity(width);
      while (i < labs.length) {
        ops.push(ease);
        i += 1;
      }
    }
    return ops;
  }

  function fadeModeLabels() {
    cancel();
    var toOps = modeLabelTargets();
    var fromOps = [];
    var fromShift = [];
    var toShift = [];
    var shift = shiftPx();
    var fromSum = 0;
    var toSum = 0;
    var i = 0;
    while (i < labs.length) {
      fromOps.push(readOpacity(labs[i]));
      fromShift.push(labelShift(labs[i]));
      toShift.push(mode === 'cascade' ? (1 - toOps[i]) * shift : 0);
      fromSum += fromOps[i];
      toSum += toOps[i];
      i += 1;
    }
    var opening = toSum > fromSum + 0.001;
    var t0 = performance.now();
    var lDur = ms('--label-dur', 160);
    var delay = opening ? ms('--label-delay', 240) : 0;
    if (lDur === 0) {
      i = 0;
      while (i < labs.length) {
        writeLabel(labs[i], toOps[i], toShift[i]);
        i += 1;
      }
      if (mode === 'ease') easeOpacity = toOps.length ? toOps[0] : 1;
      return;
    }
    function tick(now) {
      var elapsed = now - t0 - delay;
      var lt = elapsed <= 0 ? 0 : Math.min(1, elapsed / lDur);
      var eased = easeOutCurve(lt);
      var j = 0;
      while (j < labs.length) {
        writeLabel(
          labs[j],
          fromOps[j] + (toOps[j] - fromOps[j]) * eased,
          fromShift[j] + (toShift[j] - fromShift[j]) * eased,
        );
        j += 1;
      }
      if (mode === 'ease') easeOpacity = fromOps[0] + (toOps[0] - fromOps[0]) * eased;
      if (lt < 1) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        j = 0;
        while (j < labs.length) {
          writeLabel(labs[j], toOps[j], toShift[j]);
          j += 1;
        }
        if (mode === 'ease') easeOpacity = toOps.length ? toOps[0] : 1;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function playEase(to, opening) {
    cancel();
    beginTravel(to);
    var fromW = width;
    var fromOps = [];
    var fromShift = [];
    var i = 0;
    while (i < labs.length) {
      fromOps.push(readOpacity(labs[i]));
      fromShift.push(labelShift(labs[i]));
      i += 1;
    }
    var toO = opening ? 1 : 0;
    var t0 = performance.now();
    var wDur = ms('--side-dur', 400);
    var lDur = ms('--label-dur', 160);
    var delay = opening ? ms('--label-delay', 240) : 0;
    if (wDur === 0 && lDur === 0) {
      easeOpacity = toO;
      applyWidth(to);
      paintEase(toO);
      endTravel();
      return;
    }
    function tick(now) {
      var wt = wDur === 0 ? 1 : Math.min(1, (now - t0) / wDur);
      applyWidth(fromW + (to - fromW) * easeOutCurve(wt));
      var elapsed = now - t0 - delay;
      var lt = elapsed <= 0 ? 0 : lDur === 0 ? 1 : Math.min(1, elapsed / lDur);
      var eased = easeOutCurve(lt);
      var j = 0;
      while (j < labs.length) {
        writeLabel(labs[j], fromOps[j] + (toO - fromOps[j]) * eased, fromShift[j] * (1 - eased));
        j += 1;
      }
      easeOpacity = fromOps.length ? fromOps[0] + (toO - fromOps[0]) * eased : toO;
      var fading = lDur > 0 && elapsed < lDur;
      if (wt < 1 || fading) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        applyWidth(to);
        easeOpacity = toO;
        paintEase(toO);
        endTravel();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function playLinked(to) {
    cancel();
    beginTravel(to);
    var fromW = width;
    var t0 = performance.now();
    var wDur = ms('--side-dur', 400);
    if (wDur === 0) {
      applyWidth(to);
      paint();
      endTravel();
      return;
    }
    function tick(now) {
      var wt = wDur === 0 ? 1 : Math.min(1, (now - t0) / wDur);
      applyWidth(fromW + (to - fromW) * easeOutCurve(wt));
      paint();
      if (wt < 1) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        applyWidth(to);
        paint();
        endTravel();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function playCascadeToggle(to) {
    cancel();
    beginTravel(to);
    var fromW = width;
    var opening = to > snapW();
    var fromOps = labs.map(readOpacity);
    var t0 = performance.now();
    var wDur = ms('--side-dur', 400);
    var lead = opening ? 0 : ms('--cascade-lead', 125);
    var labelBase = opening ? ms('--cascade-lag', 110) : 0;
    var stagger = ms('--row-stagger', 31);
    var fade = ms('--row-fade', 120);
    var shift = shiftPx();
    if (wDur === 0) {
      applyWidth(to);
      paintCascade(to);
      endTravel();
      return;
    }
    function tick(now) {
      var elapsed = now - t0;
      var wElapsed = elapsed - lead;
      var wt = wElapsed <= 0 ? 0 : Math.min(1, wElapsed / wDur);
      applyWidth(fromW + (to - fromW) * easeOutCurve(wt));
      var pending = wt < 1;
      var i = 0;
      while (i < labs.length) {
        var start = labelBase + i * stagger;
        var p = fade === 0 || elapsed >= start + fade ? 1 : elapsed <= start ? 0 : (elapsed - start) / fade;
        var eased = easeOutCurve(p);
        var target = opening ? 1 : 0;
        var opacity = fromOps[i] + (target - fromOps[i]) * eased;
        labs[i].style.opacity = String(opacity);
        labs[i].style.transform = 'translateX(' + (1 - opacity) * shift + 'px)';
        if (p < 1) pending = true;
        i += 1;
      }
      if (pending) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        applyWidth(to);
        paintCascade(to);
        endTravel();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function playScrubToggle(to) {
    cancel();
    beginTravel(to);
    var fromW = width;
    var fromO = readOpacity(labs[0]);
    var opening = to > snapW();
    var toO = opening ? 1 : 0;
    var t0 = performance.now();
    var wDur = ms('--scrub-dur', 335);
    var lDur = ms('--label-dur', 160);
    if (wDur === 0 && lDur === 0) {
      applyWidth(to);
      paintScrub(to);
      endTravel();
      return;
    }
    function tick(now) {
      var elapsed = now - t0;
      var wt = wDur === 0 ? 1 : Math.min(1, elapsed / wDur);
      applyWidth(fromW + (to - fromW) * scrubCurve(wt));
      var lt = lDur === 0 ? 1 : Math.min(1, elapsed / lDur);
      var opacity = fromO + (toO - fromO) * scrubCurve(lt);
      var i = 0;
      while (i < labs.length) {
        labs[i].style.opacity = String(opacity);
        labs[i].style.transform = 'none';
        i += 1;
      }
      if (wt < 1 || lt < 1) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        applyWidth(to);
        paintScrub(to);
        endTravel();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function fit() {
    var w = root.clientWidth;
    if (w < 40) return;
    scale = Math.min(1, w / 960);
    var nextH = Math.round(520 * scale) + 'px';
    if (root.style.height !== nextH) root.style.height = nextH;
    frame.style.transform = 'scale(' + scale + ')';
    frame.style.left = Math.max(0, (w - 960 * scale) / 2) + 'px';
  }

  function moveTip(event) {
    var rect = frame.getBoundingClientRect();
    var x = (event.clientX - rect.left) / scale + 16;
    var y = (event.clientY - rect.top) / scale - 28;
    tip.hidden = false;
    var tw = tip.offsetWidth || 160;
    var th = tip.offsetHeight || 28;
    x = Math.max(8, Math.min(960 - tw - 8, x));
    y = Math.max(8, Math.min(520 - th - 8, y));
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }

  function hideTip() {
    tip.hidden = true;
    if (!dragging) side.classList.remove('is-hot');
    frame.style.cursor = '';
  }

  function endDrag(event) {
    if (!dragging || event.pointerId !== pointer) return;
    dragging = false;
    try {
      edge.releasePointerCapture(pointer);
    } catch (err) {
      /* already released */
    }
    hideTip();
    if (mode === 'ease') return;
    if (width < snapW()) playLinked(closedW());
  }

  function onDown(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    abortPlay();
    cancel();
    dragging = true;
    pointer = event.pointerId;
    startX = event.clientX;
    startW = width;
    edge.setPointerCapture(event.pointerId);
    side.classList.add('is-hot');
    frame.style.cursor = 'col-resize';
    moveTip(event);
  }

  function onMove(event) {
    if (!dragging || event.pointerId !== pointer) {
      if (!dragging && event.type === 'pointermove' && side.classList.contains('is-hot')) moveTip(event);
      return;
    }
    var next = clamp(startW + (event.clientX - startX) / scale, closedW(), openW());
    if (mode === 'ease' && startW >= snapW() && next < snapW()) {
      dragging = false;
      try {
        edge.releasePointerCapture(pointer);
      } catch (err) {
        /* already released */
      }
      hideTip();
      playEase(closedW(), false);
      return;
    }
    applyWidth(next);
    if (mode === 'ease') {
      easeOpacity = easeDragOpacity(next);
      paintEase(easeOpacity);
    } else paint();
    moveTip(event);
  }

  edge.addEventListener('pointerdown', onDown);
  edge.addEventListener('pointermove', onMove);
  edge.addEventListener('pointerup', endDrag);
  edge.addEventListener('pointercancel', endDrag);
  edge.addEventListener('pointerenter', function (event) {
    side.classList.add('is-hot');
    moveTip(event);
  });
  edge.addEventListener('pointerleave', function () {
    if (!dragging) hideTip();
  });

  function atRest() {
    return Math.abs(width - openW()) < 0.75 || Math.abs(width - closedW()) < 0.75;
  }

  function playTo(to) {
    if (mode === 'ease') playEase(to, to > snapW());
    else if (mode === 'cascade') playCascadeToggle(to);
    else playScrubToggle(to);
  }

  function setPlaying(on) {
    playing = on;
    if (playBtn) playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function hideCursor() {
    if (!cursor) return;
    cursor.hidden = true;
    cursor.removeAttribute('data-pressed');
    setKind('pointer');
  }

  function abortPlay() {
    playGen += 1;
    setPlaying(false);
    hideCursor();
    if (!dragging) {
      tip.hidden = true;
      side.classList.remove('is-hot');
      frame.style.cursor = '';
    }
  }

  function releaseDrag() {
    if (!dragging) return;
    dragging = false;
    try {
      edge.releasePointerCapture(pointer);
    } catch (err) {
      /* already released */
    }
  }

  function snapOpen() {
    cancel();
    releaseDrag();
    hideTip();
    applyWidth(openW());
    if (mode === 'ease') {
      easeOpacity = 1;
      paintEase(1);
    } else paint();
  }

  function finishRest(dest) {
    var to = dest >= 0 ? dest : width >= snapW() ? openW() : closedW();
    playTo(to);
  }

  toggle.addEventListener('click', function () {
    abortPlay();
    var to = width > snapW() ? closedW() : openW();
    playTo(to);
  });

  var m = 0;
  while (m < modeBtns.length) {
    modeBtns[m].addEventListener('click', function (event) {
      var wasPlaying = playing;
      var dest = travelTo;
      abortPlay();
      var target = event.currentTarget;
      var next = target.getAttribute('data-mode') || 'ease';
      setMode(next);
      if (wasPlaying && (dest >= 0 || !atRest())) finishRest(dest);
      else fadeModeLabels();
    });
    m += 1;
  }

  resetBtn.addEventListener('click', function () {
    abortPlay();
    releaseDrag();
    hideTip();
    setMode('ease');
    if (Math.abs(width - openW()) < 0.75 && easeOpacity > 0.999) {
      easeOpacity = 1;
      paintEase(1);
      syncReset();
      return;
    }
    playEase(openW(), true);
  });

  function alive(gen) {
    return gen === playGen && !disposed && !reduced();
  }

  function wait(gen, amount) {
    return new Promise(function (resolve) {
      if (!alive(gen)) {
        resolve(false);
        return;
      }
      setTimeout(function () {
        resolve(alive(gen));
      }, amount);
    });
  }

  function setKind(kind) {
    if (!cursor) return;
    cursor.setAttribute('data-kind', kind);
    var glyphs = cursor.querySelectorAll('.glyph');
    var i = 0;
    while (i < glyphs.length) {
      glyphs[i].setAttribute('data-on', glyphs[i].getAttribute('data-glyph') === kind ? 'true' : 'false');
      i += 1;
    }
  }

  function placeCursor(x, y, kind) {
    cursorX = x;
    cursorY = y;
    if (!cursor) return;
    cursor.hidden = false;
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    if (kind) setKind(kind);
  }

  function tipAt(x, y) {
    tip.hidden = false;
    var tw = tip.offsetWidth || 160;
    var th = tip.offsetHeight || 28;
    var left = Math.max(8, Math.min(960 - tw - 8, x + 16));
    var top = Math.max(8, Math.min(520 - th - 8, y - 28));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function easeIO(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function moveCursor(gen, toX, toY) {
    var fromX = cursorX;
    var fromY = cursorY;
    var dist = Math.hypot(toX - fromX, toY - fromY);
    if (dist < 0.5) return Promise.resolve(alive(gen));
    var msTravel = Math.max(300, Math.min(650, 260 + dist * 0.9));
    var bow = Math.min(dist * 0.08, 24);
    var nx = -(toY - fromY) / dist;
    var ny = (toX - fromX) / dist;
    var t0 = performance.now();
    var edgeAt = win.offsetLeft + width;
    return new Promise(function (resolve) {
      function frame(now) {
        if (!alive(gen)) {
          resolve(false);
          return;
        }
        var t = Math.min(1, (now - t0) / msTravel);
        var e = easeIO(t);
        var lift = Math.sin(Math.PI * e) * bow;
        var x = fromX + (toX - fromX) * e + nx * lift;
        var y = fromY + (toY - fromY) * e + ny * lift;
        placeCursor(x, y, x <= edgeAt + 1 ? 'resize-ew' : 'pointer');
        if (t < 1) requestAnimationFrame(frame);
        else resolve(true);
      }
      requestAnimationFrame(frame);
    });
  }

  function pickup(gen) {
    if (!cursor) return Promise.resolve(false);
    cursor.setAttribute('data-pressed', 'true');
    return wait(gen, 60).then(function (ok) {
      if (!ok || !cursor) return false;
      return wait(gen, 70);
    }).then(function (ok) {
      if (!alive(gen) || !cursor) return false;
      cursor.removeAttribute('data-pressed');
      return ok;
    });
  }

  function dragEdge(gen, toWidth) {
    var fromX = cursorX;
    var y = cursorY;
    var toX = win.offsetLeft + toWidth;
    var dist = Math.abs(toX - fromX) || 1;
    var msTravel = Math.max(450, Math.min(900, 360 + dist * 1.1));
    var t0 = performance.now();
    var began = width;
    var handed = false;
    side.classList.add('is-hot');
    return new Promise(function (resolve) {
      function frame() {
        if (!alive(gen)) {
          resolve(false);
          return;
        }
        if (handed) {
          placeCursor(win.offsetLeft + width, y, 'resize-ew');
          tipAt(cursorX, cursorY);
          if (raf) requestAnimationFrame(frame);
          else resolve(true);
          return;
        }
        var t = Math.min(1, (performance.now() - t0) / msTravel);
        var x = fromX + (toX - fromX) * easeIO(t);
        placeCursor(x, y, 'resize-ew');
        tipAt(x, y);
        var next = clamp(x - win.offsetLeft, closedW(), openW());
        if (mode === 'ease' && began >= snapW() && next < snapW()) {
          handed = true;
          playEase(closedW(), false);
        } else {
          applyWidth(next);
          if (mode === 'ease') {
            easeOpacity = easeDragOpacity(next);
            paintEase(easeOpacity);
          } else paint();
        }
        if (t < 1 || handed) {
          if (!handed) requestAnimationFrame(frame);
          else requestAnimationFrame(frame);
          return;
        }
        if (mode !== 'ease' && width < snapW()) {
          handed = true;
          playLinked(closedW());
          requestAnimationFrame(frame);
          return;
        }
        resolve(true);
      }
      requestAnimationFrame(frame);
    });
  }

  function runDemo(gen) {
    var restX = win.offsetLeft + 520;
    var restY = win.offsetTop + 250;
    placeCursor(restX, restY, 'pointer');
    var grabY = win.offsetTop + 230;
    return moveCursor(gen, win.offsetLeft + width, grabY)
      .then(function (ok) {
        if (!ok) return false;
        return pickup(gen);
      })
      .then(function (ok) {
        if (!ok) return false;
        return dragEdge(gen, snapW() - 24);
      })
      .then(function (ok) {
        if (!ok) return false;
        hideTip();
        side.classList.remove('is-hot');
        return wait(gen, 640);
      })
      .then(function (ok) {
        if (!ok) return false;
        placeCursor(win.offsetLeft + width, grabY, 'resize-ew');
        return pickup(gen);
      })
      .then(function (ok) {
        if (!ok) return false;
        return dragEdge(gen, openW());
      })
      .then(function (ok) {
        if (!ok) return false;
        hideTip();
        side.classList.remove('is-hot');
        return moveCursor(gen, restX, restY);
      })
      .then(function (ok) {
        if (!ok) return false;
        return wait(gen, 280);
      })
      .then(function () {
        if (!alive(gen)) return false;
        hideCursor();
        setPlaying(false);
        return true;
      });
  }

  function startPlay() {
    playGen += 1;
    var gen = playGen;
    hideCursor();
    releaseDrag();
    hideTip();
    snapOpen();
    if (reduced() || disposed) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    runDemo(gen).then(
      function () {
        if (gen === playGen) setPlaying(false);
      },
      function () {
        if (gen === playGen) setPlaying(false);
      },
    );
  }

  playBtn.addEventListener('click', function () {
    startPlay();
  });

  var media = window.matchMedia('(prefers-reduced-motion: reduce)');
  var onReduce = function () {
    if (!reduced()) return;
    var wasPlaying = playing;
    abortPlay();
    cancel();
    releaseDrag();
    hideTip();
    var target = wasPlaying || width > snapW() ? openW() : closedW();
    if (mode === 'ease') {
      easeOpacity = target > snapW() ? 1 : 0;
      applyWidth(target);
      paintEase(easeOpacity);
    } else {
      applyWidth(target);
      paint();
    }
  };
  if (media.addEventListener) media.addEventListener('change', onReduce);
  var attrObserver = new MutationObserver(function () {
    onReduce();
  });
  attrObserver.observe(root, { attributes: true, attributeFilter: ['data-reduce'] });
  var docObserver = new MutationObserver(onReduce);
  docObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });

  fit();
  requestAnimationFrame(fit);
  var ro = null;
  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(fit);
    ro.observe(root);
  }

  var removeObserver = null;
  function dispose() {
    if (disposed) return;
    disposed = true;
    playGen += 1;
    cancel();
    if (media.removeEventListener) media.removeEventListener('change', onReduce);
    attrObserver.disconnect();
    docObserver.disconnect();
    if (removeObserver) removeObserver.disconnect();
    if (ro) ro.disconnect();
  }
  if (root.parentNode) {
    removeObserver = new MutationObserver(function () {
      if (!root.isConnected) dispose();
    });
    removeObserver.observe(root.parentNode, { childList: true });
  }

  applyWidth(openW());
  setMode('ease');
  easeOpacity = 1;
  paintEase(1);
}
`;

export const boot = new Function(`${BOOT_SOURCE}\nreturn boot;`)() as (root: HTMLElement) => void;

export const SCRIPT =
  '(function () {\n' +
  BOOT_SOURCE +
  '\nvar root = document.getElementById("adam-sidebar");\nif (root) boot(root);\n})();\n';
