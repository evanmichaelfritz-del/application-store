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
  panel: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/>'),
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
        <div class="edge" data-testid="sidebar-edge" role="separator" aria-orientation="vertical" aria-label="Drag to resize sidebar" aria-valuemin="64" aria-valuemax="248" aria-valuenow="248"></div>
      </aside>
      <div class="main">
        <div class="panel">
          <button type="button" class="toggle" data-testid="sidebar-toggle" aria-label="Collapse sidebar">${ICONS.panel}</button>
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
        <button type="button" class="reset" data-testid="sidebar-reset" aria-label="Reset">${ICONS.reset}<span>Reset</span></button>
      </div>
    </div>
    <div class="tip" data-testid="sidebar-tip" role="tooltip" hidden>Drag to resize sidebar</div>
  </div>
</div>`;

export const CSS = `html, body { margin: 0; height: 100%; background: #f9f9f9; }
#adam-sidebar {
  --side-open: 248px;
  --side-closed: 64px;
  --side-snap: 160px;
  --idle-start: 1500ms;
  --idle-hold: 1000ms;
  --idle-resume: 3000ms;
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
#adam-sidebar .reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
  border-radius: 10px;
  height: 32px;
}
#adam-sidebar .reset svg { width: 14px; height: 14px; }
#adam-sidebar .reset:disabled { color: #a8a7aa; cursor: default; }
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
}`;

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
  var interacting = false;
  var idleDriving = false;
  var idleGen = 0;
  var idleTimer = 0;
  var idleNext = null;
  var idleWait = 0;
  var paused = false;
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
    toggle.setAttribute('aria-label', next > snapW() ? 'Collapse sidebar' : 'Expand sidebar');
    syncReset();
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

  toggle.addEventListener('click', function () {
    noteActivity();
    var to = width > snapW() ? closedW() : openW();
    if (mode === 'ease') playEase(to, to > snapW());
    else if (mode === 'cascade') playCascadeToggle(to);
    else playScrubToggle(to);
  });

  var m = 0;
  while (m < modeBtns.length) {
    modeBtns[m].addEventListener('click', function (event) {
      noteActivity();
      var target = event.currentTarget;
      var next = target.getAttribute('data-mode') || 'ease';
      setMode(next);
      fadeModeLabels();
    });
    m += 1;
  }

  resetBtn.addEventListener('click', function () {
    noteActivity();
    if (dragging) {
      dragging = false;
      try {
        edge.releasePointerCapture(pointer);
      } catch (err) {
        /* already released */
      }
    }
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

  function idleDelay(name, fallback) {
    var value = cssNum(name, fallback);
    return value > 0 ? value : fallback;
  }

  function clearIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = 0;
    }
  }

  function stopIdle() {
    idleGen += 1;
    idleDriving = false;
    idleNext = null;
    clearIdleTimer();
  }

  function schedule(ms, fn) {
    clearIdleTimer();
    idleNext = fn;
    idleWait = ms;
    if (disposed || paused || reduced() || interacting) return;
    var gen = idleGen;
    idleTimer = setTimeout(function () {
      idleTimer = 0;
      var next = idleNext;
      idleNext = null;
      if (disposed || gen !== idleGen) return;
      if (paused || reduced() || interacting) {
        idleNext = next;
        return;
      }
      if (next) next();
    }, ms);
  }

  function beginCycle() {
    if (disposed || reduced() || paused || interacting) return;
    runStep(0);
  }

  function whenSettled(gen, fn) {
    function check() {
      if (disposed || gen !== idleGen) return;
      if (paused || reduced() || interacting) {
        idleNext = function () {
          whenSettled(gen, fn);
        };
        idleWait = 40;
        return;
      }
      if (raf) {
        schedule(40, check);
        return;
      }
      fn();
    }
    schedule(40, check);
  }

  function runStep(index) {
    if (disposed || reduced() || paused || interacting) {
      idleNext = function () {
        runStep(index);
      };
      idleWait = 0;
      return;
    }
    if (index >= 6) {
      runStep(0);
      return;
    }
    var open = index % 2 === 1;
    var which = index < 2 ? 'ease' : index < 4 ? 'cascade' : 'scrub';
    idleDriving = true;
    setMode(which);
    var to = open ? openW() : closedW();
    var gen = idleGen;
    if (which === 'ease') playEase(to, open);
    else if (which === 'cascade') playCascadeToggle(to);
    else playScrubToggle(to);
    whenSettled(gen, function () {
      schedule(idleDelay('--idle-hold', 1000), function () {
        runStep(index + 1);
      });
    });
  }

  function noteActivity() {
    idleGen += 1;
    idleDriving = false;
    clearIdleTimer();
    cancel();
    if (disposed || reduced()) {
      idleNext = null;
      return;
    }
    idleNext = beginCycle;
    idleWait = idleDelay('--idle-resume', 3000);
    if (interacting || paused) return;
    schedule(idleWait, beginCycle);
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    interacting = true;
    noteActivity();
  }

  function endInteract() {
    if (!interacting) return;
    interacting = false;
    if (disposed || reduced() || paused || !idleNext) return;
    schedule(idleWait, idleNext);
  }

  function syncPause() {
    var next = document.hidden || root.getAttribute('data-visible') === '0';
    if (next === paused) return;
    paused = next;
    if (paused) {
      clearIdleTimer();
      return;
    }
    if (!idleNext || reduced() || interacting || disposed) return;
    schedule(idleWait, idleNext);
  }

  function armStart() {
    if (reduced() || disposed) return;
    var delay = idleDelay('--idle-start', 1500);
    if (paused || interacting) {
      idleNext = beginCycle;
      idleWait = delay;
      return;
    }
    schedule(delay, beginCycle);
  }

  var media = window.matchMedia('(prefers-reduced-motion: reduce)');
  var onReduce = function () {
    if (!reduced()) {
      if (!idleDriving && !idleTimer && !interacting && !paused) armStart();
      return;
    }
    var driving = idleDriving;
    stopIdle();
    cancel();
    if (!driving) {
      var target = width > snapW() ? openW() : closedW();
      if (mode === 'ease') {
        easeOpacity = easeDragOpacity(target);
        applyWidth(target);
        paintEase(easeOpacity);
      } else {
        applyWidth(target);
        paint();
      }
      return;
    }
    easeOpacity = 1;
    applyWidth(openW());
    setMode('ease');
    paintEase(1);
  };
  if (media.addEventListener) media.addEventListener('change', onReduce);
  var attrObserver = new MutationObserver(function (records) {
    var reduceHit = false;
    var visHit = false;
    var i = 0;
    while (i < records.length) {
      var name = records[i].attributeName;
      if (name === 'data-reduce') reduceHit = true;
      if (name === 'data-visible') visHit = true;
      i += 1;
    }
    if (reduceHit) onReduce();
    if (visHit) syncPause();
  });
  attrObserver.observe(root, { attributes: true, attributeFilter: ['data-reduce', 'data-visible'] });
  var docObserver = new MutationObserver(onReduce);
  docObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });

  function onVis() {
    syncPause();
  }
  document.addEventListener('visibilitychange', onVis);
  root.addEventListener('pointerdown', onPointerDown, true);
  root.addEventListener('pointerup', endInteract, true);
  root.addEventListener('pointercancel', endInteract, true);

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
    stopIdle();
    cancel();
    if (media.removeEventListener) media.removeEventListener('change', onReduce);
    document.removeEventListener('visibilitychange', onVis);
    attrObserver.disconnect();
    docObserver.disconnect();
    if (removeObserver) removeObserver.disconnect();
    if (ro) ro.disconnect();
    root.removeEventListener('pointerdown', onPointerDown, true);
    root.removeEventListener('pointerup', endInteract, true);
    root.removeEventListener('pointercancel', endInteract, true);
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
  paused = document.hidden || root.getAttribute('data-visible') === '0';
  if (!reduced()) armStart();
}
`;

export const boot = new Function(`${BOOT_SOURCE}\nreturn boot;`)() as (root: HTMLElement) => void;

export const SCRIPT =
  '(function () {\n' +
  BOOT_SOURCE +
  '\nvar root = document.getElementById("adam-sidebar");\nif (root) boot(root);\n})();\n';
