/**
 * Closed-network documents the Playground iframe actually runs.
 * Each transition and effect gets markup, the CSS that drives it, and
 * script when the motion cannot run from CSS alone.
 */
import abrarOverviewDocument from '@/src/demos/abrar-overview/closed-network.html';
import { promptFor } from '@/src/agentPrompts';
import { TRANSITIONS } from '@/src/catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import type { NavSection } from '@/src/sections';
import { SNIPPETS } from '@/src/snippets';
import { PREVIEW_TOOLS_CSS, PREVIEW_TOOLS_HTML, PREVIEW_TOOLS_SCRIPT } from '@/src/demos/preview-tools/copy';
import { TILT_COPY_SNIPPET } from '@/src/demos/tiltMotion';

export type PreviewKind = 'transitions' | 'effects';

export type PlaygroundPreviewButton = {
  key: string;
  id: string;
  label: string;
  kind: PreviewKind;
  /** Body markup only — what Copy HTML writes. */
  html: string;
  /** Full stylesheet — what Copy CSS writes. */
  css: string;
  /** Script body, or empty when the preview does not need one. */
  script: string;
  /** Full document loaded into the editor and the iframe. */
  code: string;
  prompt: string;
};

type Source = {
  html?: string;
  extraCss?: string;
  script?: string;
  /** Canonical document. Used for Gooey plus menu so the editor stays the real file. */
  document?: string;
  /** When false, do not inject SNIPPETS[id] (it is not a stylesheet). */
  snippet?: boolean;
};

const BASE_CSS = `* { box-sizing: border-box; }
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
.col { display: flex; flex-direction: column; align-items: center; gap: 18px; }`;

const ORB_PREVIEW_CSS = `.pill, .chip {
  display: flex; align-items: center; background: #fff; border-radius: 999px;
  box-shadow: 0 8px 24px rgba(23,24,28,.08);
}
.pill { gap: 10px; padding: 10px 18px 10px 12px; }
.chip { gap: 6px; padding: 6px 12px 6px 8px; }
.label { font-size: 15px; font-weight: 600; }
.agent { font-size: 13px; font-weight: 600; }
.muted { color: #8a8a8a; font-weight: 500; }
.picker { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.controls { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-width: 380px; }
.controls button {
  appearance: none; border: 1px solid rgba(0,0,0,.08); background: #fff; color: #17181c;
  border-radius: 999px; padding: 6px 10px; font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.controls button.is-on { background: #17181c; color: #fff; }
.controls button:disabled { opacity: .38; cursor: not-allowed; }
canvas { display: block; }`;

/** Closed-network canvas for one split orb card. Copy HTML, CSS, and script use this document, not the React install snippet. */
function orbPreviewScript(picker: boolean): string {
  return `(function () {
  var card = document.getElementById('orb-card');
  var canvas = document.getElementById('orb');
  var ctx = canvas.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = false;
  var start = performance.now();
  function mode() { return card.getAttribute('data-mode') || 'solving'; }
  function size() { return Number(card.getAttribute('data-size')) || canvas.width; }
  function resize() {
    var s = size();
    if (canvas.width !== s) { canvas.width = s; canvas.height = s; }
  }
  function dots(cx, cy, r, t) {
    var n = 48, i;
    for (i = 0; i < n; i++) {
      var phi = Math.acos(1 - 2 * (i + 0.5) / n);
      var theta = Math.PI * (1 + Math.sqrt(5)) * i + t * Math.PI * 2 / 9;
      var sp = Math.sin(phi);
      var dz = sp * Math.sin(theta);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(23,24,28,' + (0.28 + 0.72 * (dz + 1) / 2) + ')';
      ctx.arc(cx + sp * Math.cos(theta) * r, cy + Math.cos(phi) * r, Math.max(1, r * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function ring(cx, cy, r, t) {
    var breathe = 0.82 + 0.18 * Math.sin(t * 2.4);
    ctx.beginPath();
    ctx.strokeStyle = '#17181c';
    ctx.lineWidth = Math.max(1.5, r * 0.12);
    ctx.arc(cx, cy, r * breathe, t, t + Math.PI * 1.35);
    ctx.stroke();
  }
  function listen(cx, cy, r, t) {
    var i;
    for (i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(23,24,28,' + (0.35 + 0.2 * i) + ')';
      ctx.lineWidth = Math.max(1, r * 0.1);
      ctx.arc(cx, cy, r * (0.35 + i * 0.22), -0.8 + Math.sin(t * 3 + i) * 0.15, 0.8 + Math.sin(t * 3 + i) * 0.15);
      ctx.stroke();
    }
  }
  function orbit(cx, cy, r, t) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(23,24,28,.2)';
    ctx.lineWidth = 1;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    var a = t * 2.2;
    ctx.beginPath();
    ctx.fillStyle = '#17181c';
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.55, Math.max(1.5, r * 0.16), 0, Math.PI * 2);
    ctx.fill();
  }
  function ribbon(cx, cy, r, t) {
    ctx.beginPath();
    ctx.strokeStyle = '#17181c';
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.moveTo(cx - r, cy);
    var x;
    for (x = -r; x <= r; x += 2) {
      ctx.lineTo(cx + x, cy + Math.sin(x / r * Math.PI * 2 + t * 4) * r * 0.35);
    }
    ctx.stroke();
  }
  function metal(cx, cy, r, t) {
    var g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#c5d0e4');
    g.addColorStop(1, '#6a7386');
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(t * Math.PI * 2 / 7.2);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillRect(-r, -r * 0.12, r * 2, r * 0.24);
    ctx.restore();
  }
  function morph(cx, cy, r, t) {
    ctx.beginPath();
    ctx.fillStyle = '#17181c';
    var i;
    for (i = 0; i <= 40; i++) {
      var a = (i / 40) * Math.PI * 2;
      var wobble = 1 + 0.22 * Math.sin(a * 3 + t * 2.5);
      var x = cx + Math.cos(a) * r * wobble;
      var y = cy + Math.sin(a) * r * wobble;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.fill();
  }
  function connect(cx, cy, r, t) {
    var i;
    for (i = 0; i < 2; i++) {
      var a = t * (i ? -2.4 : 1.8);
      ctx.beginPath();
      ctx.fillStyle = i ? '#6a7386' : '#17181c';
      ctx.arc(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, Math.max(1.5, r * 0.22), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function paint(t) {
    resize();
    var s = canvas.width;
    var cx = s / 2, cy = s / 2, r = s * 0.34;
    ctx.clearRect(0, 0, s, s);
    var m = mode();
    if (m === 'solving') dots(cx, cy, r, t);
    else if (m === 'breathing') ring(cx, cy, r, t);
    else if (m === 'listening') listen(cx, cy, r, t);
    else if (m === 'searching') orbit(cx, cy, r, t);
    else if (m === 'composing') ribbon(cx, cy, r, t);
    else if (m === 'working') metal(cx, cy, r, t);
    else if (m === 'shaping') morph(cx, cy, r, t);
    else if (m === 'connecting') connect(cx, cy, r, t);
    else dots(cx, cy, r, t);
  }
  function frame(now) {
    var t = reduce || paused ? 0.4 : (now - start) / 1000;
    paint(t);
    if (!reduce && !paused) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  ${picker ? `var controls = document.getElementById('orb-controls');
  function mark() {
    var buttons = controls.querySelectorAll('button');
    var i;
    for (i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var on = (b.getAttribute('data-orb-state') && b.getAttribute('data-orb-state') === mode())
        || (b.getAttribute('data-orb-size') && Number(b.getAttribute('data-orb-size')) === size());
      b.classList.toggle('is-on', !!on);
    }
  }
  controls.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.id === 'orb-pause') {
      paused = !paused;
      b.textContent = paused ? 'Play' : 'Pause';
      if (!paused) { start = performance.now(); requestAnimationFrame(frame); }
      else paint(0.4);
      return;
    }
    if (b.getAttribute('data-orb-state')) card.setAttribute('data-mode', b.getAttribute('data-orb-state'));
    if (b.getAttribute('data-orb-size')) card.setAttribute('data-size', b.getAttribute('data-orb-size'));
    mark();
    if (reduce || paused) paint(0.4);
  });
  mark();` : ''}
})();`;
}

function orbCard(mode: string, size: number, label: string, agent: boolean): Source {
  const text = agent
    ? `<span class="agent"><span class="muted">Agent </span>${label}</span>`
    : `<span class="label">${label}</span>`;
  return {
    snippet: false,
    html: `<div class="${agent ? 'chip' : 'pill'}" id="orb-card" data-mode="${mode}" data-size="${size}">
  <canvas id="orb" width="${size}" height="${size}" aria-label="${agent ? `Agent ${label}` : label}"></canvas>
  ${text}
</div>`,
    extraCss: ORB_PREVIEW_CSS,
    script: orbPreviewScript(false),
  };
}

const SOURCES: Record<string, Source> = {
  'card-resize': {
    html: `<div class="col">
  <div class="t-resize" id="card">
    <div class="bar"></div>
    <div class="bar short"></div>
  </div>
  <button class="trigger" type="button" id="toggle">Resize</button>
</div>`,
    extraCss: `.t-resize {
  width: 148px;
  height: 100px;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  overflow: hidden;
}
.bar { height: 8px; border-radius: 4px; background: #ececec; margin-bottom: 8px; }
.bar.short { width: 62%; }`,
    script: `(function () {
  var card = document.getElementById('card');
  var small = false;
  function apply() {
    card.style.width = small ? '88px' : '148px';
    card.style.height = small ? '64px' : '100px';
  }
  apply();
  document.getElementById('toggle').addEventListener('click', function () {
    small = !small;
    apply();
  });
})();`,
  },
  'number-pop-in': {
    html: `<div class="col">
  <div class="digits" id="digits" aria-label="6 5. 7 8"></div>
  <button class="trigger" type="button" id="replay">Replay</button>
</div>`,
    extraCss: `.digits { font-size: 42px; font-weight: 600; letter-spacing: -0.02em; display: flex; align-items: flex-end; }
.t-digit.gap { width: 6px; }`,
    script: `(function () {
  var root = document.getElementById('digits');
  var sets = ['6 5. 7 8', '1 4. 0 2', '9 3. 6 1'];
  var i = 0;
  function render() {
    root.setAttribute('aria-label', sets[i]);
    root.innerHTML = sets[i].split('').map(function (ch) {
      if (ch === ' ') return '<span class="t-digit gap">&nbsp;</span>';
      return '<span class="t-digit">' + ch + '</span>';
    }).join('');
  }
  render();
  document.getElementById('replay').addEventListener('click', function () {
    i = (i + 1) % sets.length;
    render();
  });
})();`,
  },
  'notification-badge': {
    html: `<button class="bell" type="button" id="bell" aria-label="Notifications">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17181c" stroke-width="1.7">
    <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 19a2 2 0 0 0 4 0"/>
  </svg>
  <span class="t-badge" id="badge">1</span>
</button>`,
    extraCss: `.bell {
  position: relative; width: 48px; height: 48px; border-radius: 12px;
  border: 1px solid rgba(0,0,0,.08); background: #fff; cursor: pointer;
}
.t-badge {
  position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px;
  padding: 0 4px; border-radius: 9px; background: #e23d2d; color: #fff;
  font-size: 10px; font-weight: 600; display: grid; place-items: center;
}`,
    script: `(function () {
  var badge = document.getElementById('badge');
  document.getElementById('bell').addEventListener('click', function () {
    badge.classList.toggle('is-on');
  });
})();`,
  },
  'text-states-swap': {
    html: `<div class="col">
  <div class="swap"><span class="t-text-swap" id="line">Transaction processing...</span></div>
  <button class="trigger" type="button" id="swap">Swap</button>
</div>`,
    extraCss: `.swap { min-height: 24px; font-size: 16px; font-weight: 600; }`,
    script: `(function () {
  var el = document.getElementById('line');
  var texts = ['Transaction processing...', 'Transaction completed'];
  var i = 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('swap').addEventListener('click', function () {
    el.classList.add('is-exit');
    setTimeout(function () {
      i = (i + 1) % texts.length;
      el.textContent = texts[i];
      el.classList.remove('is-exit');
      el.classList.add('is-enter-start');
      void el.offsetWidth;
      el.classList.remove('is-enter-start');
    }, reduce ? 0 : 250);
  });
})();`,
  },
  'menu-dropdown': {
    html: `<div class="menu">
  <button class="trigger" type="button" id="menu-btn" aria-expanded="false">Open menu</button>
  <div class="t-dropdown" id="menu">
    <button type="button">New file</button>
    <button type="button">Add image</button>
    <button type="button">New folder</button>
  </div>
</div>`,
    extraCss: `.menu { position: relative; }
.t-dropdown {
  position: absolute; top: 40px; left: 0; min-width: 168px;
  background: #fff; border-radius: 12px; padding: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
}
.t-dropdown button {
  display: block; width: 100%; text-align: left; border: 0; background: transparent;
  padding: 8px 10px; border-radius: 8px; font: 500 13px Inter, system-ui, sans-serif; cursor: pointer;
}
.t-dropdown button:hover { background: #f3f3f3; }`,
    script: `(function () {
  var menu = document.getElementById('menu');
  var btn = document.getElementById('menu-btn');
  var open = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function () {
    if (open) {
      menu.classList.remove('is-open');
      menu.classList.add('is-closing');
      setTimeout(function () { menu.classList.remove('is-closing'); }, reduce ? 0 : 180);
    } else {
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
    }
    open = !open;
    btn.textContent = open ? 'Close menu' : 'Open menu';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();`,
  },
  'modal-open-close': {
    html: `<div class="col">
  <button class="trigger" type="button" id="open">Toggle modal</button>
  <div class="backdrop" id="backdrop" hidden>
    <div class="t-modal panel" id="modal" role="dialog" aria-label="New project">
      <strong>New project</strong>
      <p>Scale from 0.94 with a 200ms fade.</p>
      <button class="trigger" type="button" id="close">Close</button>
    </div>
  </div>
</div>`,
    extraCss: `.backdrop {
  position: fixed; inset: 0; display: grid; place-items: center;
  background: rgba(0,0,0,.28);
}
.backdrop[hidden] { display: none !important; }
.panel { width: 280px; background: #fff; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.panel p { margin: 0; color: #6c6c6c; }`,
    script: `(function () {
  var backdrop = document.getElementById('backdrop');
  var modal = document.getElementById('modal');
  var open = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paint(next) {
    open = next;
    if (next) {
      backdrop.hidden = false;
      modal.classList.remove('is-closing');
      modal.classList.add('is-open');
    } else {
      modal.classList.remove('is-open');
      modal.classList.add('is-closing');
      setTimeout(function () {
        modal.classList.remove('is-closing');
        if (!open) backdrop.hidden = true;
      }, reduce ? 0 : 200);
    }
  }
  document.getElementById('open').addEventListener('click', function () { paint(true); });
  document.getElementById('close').addEventListener('click', function () { paint(false); });
})();`,
  },
  'page-side-by-side': {
    html: `<div class="col">
  <div class="pager"><div class="t-page" id="page"></div></div>
  <button class="trigger" type="button" id="next">Next page</button>
</div>`,
    extraCss: `.pager {
  width: 220px; height: 120px; background: #fff; border-radius: 14px;
  display: grid; place-items: center; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.t-page { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 18px; font-weight: 600; }
.t-page span { font-size: 13px; font-weight: 500; color: #6c6c6c; }`,
    script: `(function () {
  var page = document.getElementById('page');
  var pages = [
    ['BNB', '$66.11'],
    ['$10', '$66.11 available']
  ];
  var i = 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render() {
    page.innerHTML = '<strong>' + pages[i][0] + '</strong><span>' + pages[i][1] + '</span>';
  }
  render();
  document.getElementById('next').addEventListener('click', function () {
    page.classList.add('is-exit');
    setTimeout(function () {
      i = (i + 1) % pages.length;
      page.classList.remove('is-exit');
      page.classList.add('is-enter');
      render();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { page.classList.remove('is-enter'); });
      });
    }, reduce ? 0 : 300);
  });
})();`,
  },
  'icon-swap': {
    html: `<div class="col">
  <div class="icon-slot" id="slot">
    <span class="t-icon" id="icon-a" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17181c" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </span>
    <span class="t-icon is-out" id="icon-b" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17181c" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </span>
  </div>
  <button class="trigger" type="button" id="swap">Swap icon</button>
</div>`,
    extraCss: `.icon-slot { position: relative; width: 48px; height: 48px; }
.t-icon { position: absolute; inset: 0; display: grid; place-items: center; }`,
    script: `(function () {
  var a = document.getElementById('icon-a');
  var b = document.getElementById('icon-b');
  document.getElementById('swap').addEventListener('click', function () {
    a.classList.toggle('is-out');
    b.classList.toggle('is-out');
  });
})();`,
  },
  'success-check': {
    html: `<div class="col">
  <svg class="t-check" id="check" width="36" height="36" viewBox="0 0 36 36" aria-label="Success">
    <circle cx="18" cy="18" r="16" fill="#1f8a4c"/>
    <path class="mark" d="M11 18.5 L16 23.5 L25 13.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <button class="trigger" type="button" id="replay">Replay</button>
</div>`,
    script: `(function () {
  var check = document.getElementById('check');
  document.getElementById('replay').addEventListener('click', function () {
    check.classList.remove('t-check');
    void check.offsetWidth;
    check.classList.add('t-check');
  });
})();`,
  },
  'error-state-shake': {
    html: `<div class="col">
  <label class="field">
    <input class="t-shake" id="email" value="hello@" aria-label="Email" />
    <span class="msg" id="msg" hidden>Please enter a valid email.</span>
  </label>
  <button class="trigger" type="button" id="validate">Submit</button>
</div>`,
    extraCss: `.field { display: flex; flex-direction: column; gap: 6px; width: 220px; }
.t-shake { height: 38px; border-radius: 10px; border: 1px solid rgba(0,0,0,.1); padding: 0 10px; font: 400 13px Inter, system-ui, sans-serif; }
.t-shake.is-error { border-color: #c43a31; }
.msg { color: #c43a31; font-size: 11px; }`,
    script: `(function () {
  var input = document.getElementById('email');
  var msg = document.getElementById('msg');
  document.getElementById('validate').addEventListener('click', function () {
    var valid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.value);
    if (valid) {
      input.classList.remove('is-error');
      msg.hidden = true;
      return;
    }
    msg.hidden = false;
    input.classList.remove('is-error');
    void input.offsetWidth;
    input.classList.add('is-error');
  });
})();`,
  },
  'skeleton-reveal': {
    html: `<div class="col">
  <div class="skel-card" id="card">
    <div class="t-skel bar"></div>
    <div class="t-skel bar short"></div>
    <div class="t-content is-hidden" id="content">
      <strong>Jane Cooper</strong>
      <span>jane.cooper@example.com</span>
    </div>
  </div>
  <button class="trigger" type="button" id="reveal">Reveal</button>
</div>`,
    extraCss: `.skel-card {
  position: relative; width: 240px; min-height: 78px; background: #fff;
  border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.t-skel.bar { height: 12px; border-radius: 6px; background: #ececec; }
.t-skel.short { width: 62%; }
.t-content { position: absolute; inset: 16px; display: flex; flex-direction: column; gap: 4px; }
.t-content span { color: #6c6c6c; font-size: 13px; }`,
    script: `(function () {
  var content = document.getElementById('content');
  var bars = [].slice.call(document.querySelectorAll('.t-skel'));
  var shown = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal() {
    shown = true;
    bars.forEach(function (bar) { bar.style.display = 'none'; });
    content.classList.remove('is-hidden');
  }
  function reset() {
    shown = false;
    bars.forEach(function (bar) { bar.style.display = ''; });
    content.classList.add('is-hidden');
  }
  document.getElementById('reveal').addEventListener('click', function () {
    if (shown) reset();
    else reveal();
  });
  setTimeout(reveal, reduce ? 0 : 900);
})();`,
  },
  'texts-reveal': {
    html: `<div class="col">
  <div class="lines" id="lines">
    <div class="t-line">Pull request opened</div>
    <div class="t-line">Review requested from 3 teammates</div>
  </div>
  <button class="trigger" type="button" id="replay">Replay</button>
</div>`,
    extraCss: `.lines { display: flex; flex-direction: column; gap: 6px; font-size: 18px; font-weight: 600; }
.lines .t-line:nth-child(2) { font-size: 14px; font-weight: 500; color: #6c6c6c; }`,
    script: `(function () {
  var lines = document.getElementById('lines');
  document.getElementById('replay').addEventListener('click', function () {
    lines.innerHTML = lines.innerHTML;
  });
})();`,
  },
  'tabs-sliding': {
    html: `<div class="t-tabs" id="tabs" role="tablist">
  <div class="t-tabs-pill" id="pill"></div>
  <button type="button" role="tab">Overview</button>
  <button type="button" role="tab">Activity</button>
  <button type="button" role="tab">Settings</button>
</div>`,
    extraCss: `.t-tabs { display: inline-flex; padding: 3px; }
.t-tabs button {
  height: 28px; padding: 0 14px; border: 0; background: transparent; position: relative; z-index: 1;
  font: 500 13px Inter, system-ui, sans-serif; cursor: pointer; color: #17181c;
}
.t-tabs-pill { left: 0; width: 86px; transform: translateX(3px); box-shadow: 0 1px 2px rgba(0,0,0,.06); }`,
    script: `(function () {
  var tabs = document.getElementById('tabs');
  var pill = document.getElementById('pill');
  var buttons = [].slice.call(tabs.querySelectorAll('button'));
  function select(i) {
    var b = buttons[i];
    pill.style.width = b.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    buttons.forEach(function (btn, j) {
      btn.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
  }
  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function () { select(i); });
  });
  select(0);
})();`,
  },
  'tooltip-open-close': {
    html: `<div class="tip-wrap">
  <div class="t-tt" id="tip">Edit</div>
  <div class="tip-row">
    <button type="button" data-tip="Edit" data-slot="0">Aa</button>
    <button type="button" data-tip="Share" data-slot="1">↗</button>
    <button type="button" data-tip="More" data-slot="2">···</button>
  </div>
</div>`,
    extraCss: `.tip-wrap { position: relative; padding-top: 40px; }
.t-tt {
  position: absolute; top: 0; height: 28px; padding: 0 8px;
  border-radius: 8px; background: #fff; color: #2f2f2f; font-size: 12px; font-weight: 500;
  display: grid; place-items: center; box-shadow: 0 1px 3px rgba(0,0,0,.08); white-space: nowrap;
}
.tip-row { display: flex; gap: 8px; }
.tip-row button {
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(0,0,0,.06);
  background: #fff; cursor: pointer; font: 500 13px Inter, system-ui, sans-serif;
}`,
    script: `(function () {
  var tip = document.getElementById('tip');
  var row = document.querySelector('.tip-row');
  function show(button) {
    var slot = Number(button.getAttribute('data-slot')) || 0;
    tip.textContent = button.getAttribute('data-tip') || '';
    tip.style.setProperty('--tt-x', (slot * 44) + 'px');
    tip.classList.remove('is-off');
    tip.classList.add('is-on');
  }
  function hide() {
    tip.classList.remove('is-on');
    tip.classList.add('is-off');
  }
  [].slice.call(row.querySelectorAll('button')).forEach(function (button) {
    button.addEventListener('mouseenter', function () { show(button); });
    button.addEventListener('focus', function () { show(button); });
    button.addEventListener('mouseleave', hide);
    button.addEventListener('blur', hide);
  });
})();`,
  },
  'image-generation-loader': {
    html: `<div class="col">
  <div class="t-img-fx-card" id="card">
    <canvas id="mosaic" width="168" height="168" aria-label="Generated image mosaic"></canvas>
  </div>
  <button class="trigger" type="button" id="reveal">Reveal</button>
</div>`,
    extraCss: `.t-img-fx-card {
  width: 168px; height: 168px; border-radius: 20px; overflow: hidden;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
canvas { display: block; width: 168px; height: 168px; }`,
    script: `(function () {
  var canvas = document.getElementById('mosaic');
  var ctx = canvas.getContext('2d');
  var cells = 12;
  var cw = 168 / cells;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function color(i, j, reveal) {
    var x = i / cells;
    var y = j / cells;
    var n = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453);
    n = n - Math.floor(n);
    var r = Math.floor((80 + 140 * x) * reveal + 180 * (1 - reveal) * n);
    var g = Math.floor((90 + 100 * y) * reveal + 170 * (1 - reveal) * n);
    var b = Math.floor((210 - 70 * x) * reveal + 160 * (1 - reveal) * n);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function paint(progress) {
    ctx.clearRect(0, 0, 168, 168);
    var j, i, order, t, size, jitter;
    for (j = 0; j < cells; j++) {
      for (i = 0; i < cells; i++) {
        order = ((i * 7 + j * 3) % (cells * cells)) / (cells * cells);
        t = reduce ? 1 : Math.max(0, Math.min(1, (progress - order) / 0.28));
        size = cw * (0.55 + 0.45 * t);
        jitter = (1 - t) * 7;
        ctx.globalAlpha = 0.4 + 0.6 * t;
        ctx.fillStyle = color(i, j, t);
        ctx.fillRect(i * cw + jitter, j * cw + jitter * 0.4, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }
  var start = null;
  function loop(now) {
    if (start == null) start = now;
    var p = Math.min(1, (now - start) / 1500);
    paint(p);
    if (p < 1 && !reduce) requestAnimationFrame(loop);
  }
  document.getElementById('reveal').addEventListener('click', function () {
    start = null;
    requestAnimationFrame(loop);
  });
  requestAnimationFrame(loop);
})();`,
    snippet: false,
  },
  'confetti-burst': {
    html: `<div class="burst" id="burst">
  <button class="trigger celebrate" type="button" id="celebrate">Celebrate</button>
</div>`,
    extraCss: `.burst { position: relative; width: 280px; height: 220px; }
.t-confetti-piece { left: 0; top: 0; z-index: 1; }
.celebrate { position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 2; }`,
    script: `(function () {
  var root = document.getElementById('burst');
  var btn = document.getElementById('celebrate');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = ['#ff5a5f', '#f5c518', '#2ecc71', '#4da3ff', '#b07cff', '#ff8a3d'];
  var pieces = [];
  var raf = 0;
  function cssNum(name, fallback) {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(n) ? n : fallback;
  }
  function launch() {
    cancelAnimationFrame(raf);
    pieces.forEach(function (p) { p.el.remove(); });
    pieces = [];
    var gravity = cssNum('--confetti-gravity', 1800);
    var bounce = cssNum('--confetti-bounce', 0.35);
    var spread = cssNum('--confetti-spread', 46) * Math.PI / 180;
    var host = root.getBoundingClientRect();
    var rect = btn.getBoundingClientRect();
    var originX = rect.left - host.left + rect.width / 2;
    var floor = rect.top - host.top - 8;
    var i;
    for (i = 0; i < 18; i++) {
      var el = document.createElement('span');
      el.className = 't-confetti-piece';
      el.style.background = colors[i % colors.length];
      root.appendChild(el);
      var angle = -Math.PI / 2 + (i / 17 - 0.5) * spread;
      var speed = 380 + (i % 5) * 50;
      pieces.push({
        el: el,
        x: originX,
        y: floor,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: (i * 37) % 180
      });
    }
    if (reduce) {
      pieces.forEach(function (p) {
        p.el.style.transform = 'translate(' + p.x + 'px,' + floor + 'px)';
      });
      return;
    }
    var last = performance.now();
    function tick(now) {
      var dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      var alive = false;
      pieces.forEach(function (p) {
        p.vy += gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y > floor) {
          p.y = floor;
          p.vy *= -bounce;
          p.vx *= 0.72;
          if (Math.abs(p.vy) < 50) p.vy = 0;
        }
        p.rot += 160 * dt;
        p.el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + p.rot + 'deg)';
        if (Math.abs(p.vy) > 12 || p.y < floor - 1) alive = true;
      });
      if (alive) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }
  btn.addEventListener('click', launch);
  launch();
})();`,
  },
  'gooey-plus-menu': {
    html: '',
    document: GOOEY_PLUS_CLOSED_NETWORK_HTML,
    snippet: false,
  },
  'avatar-group-hover': {
    html: `<div class="t-avatars" id="avatars">
  <span class="t-avatar" style="background:#d9b8a2">JC</span>
  <span class="t-avatar" style="background:#b7c7d9">AK</span>
  <span class="t-avatar" style="background:#d4c4a8">MR</span>
  <span class="t-avatar" style="background:#c5b3d6">SL</span>
  <span class="t-avatar" style="background:#a8c5b8">TW</span>
</div>`,
    extraCss: `.t-avatars { display: flex; align-items: center; }
.t-avatar {
  width: 40px; height: 40px; margin-left: -10px; border-radius: 50%;
  border: 2px solid #fff; display: grid; place-items: center;
  color: #2a2118; font-size: 11px; font-weight: 500;
}
.t-avatar:first-child { margin-left: 0; }`,
    script: `(function () {
  var root = document.getElementById('avatars');
  var avatars = [].slice.call(root.querySelectorAll('.t-avatar'));
  function cssNum(name, fallback) {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(n) ? n : fallback;
  }
  function place(hot) {
    var lift = cssNum('--avatar-lift', -8);
    var falloff = cssNum('--avatar-falloff', 0.45);
    var peak = cssNum('--avatar-scale', 1.06);
    avatars.forEach(function (el, j) {
      var strength = hot == null ? 0 : Math.max(0, 1 - Math.abs(hot - j) * falloff);
      el.style.transform = 'translateY(' + (lift * strength) + 'px) scale(' + (1 + (peak - 1) * strength) + ')';
      el.style.zIndex = strength > 0.9 ? '3' : '1';
    });
  }
  avatars.forEach(function (el, i) {
    el.addEventListener('mouseenter', function () { place(i); });
    el.addEventListener('mouseleave', function () { place(null); });
  });
  place(null);
})();`,
  },
  'card-stack-hover': {
    html: `<div class="t-stack" id="stack">
  <div class="t-stack-card">Card 1</div>
  <div class="t-stack-card">Card 2</div>
  <div class="t-stack-card">Card 3</div>
</div>`,
    extraCss: `.t-stack { position: relative; width: 180px; height: 120px; cursor: pointer; }
.t-stack-card {
  position: absolute; left: 35px; top: 23px; width: 110px; height: 74px;
  border-radius: 12px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.06);
  display: grid; place-items: center; font-size: 13px; font-weight: 500;
}`,
    script: `(function () {
  var stack = document.getElementById('stack');
  stack.addEventListener('mouseenter', function () { stack.classList.add('is-spread'); });
  stack.addEventListener('mouseleave', function () { stack.classList.remove('is-spread'); });
  stack.addEventListener('click', function () { stack.classList.toggle('is-spread'); });
})();`,
  },
  'input-clear-dissolve': {
    html: `<div class="field" id="field">
  <div class="words" id="words">
    <span class="t-word">search</span>
    <span class="t-word">recent</span>
    <span class="t-word">files</span>
  </div>
  <button class="x" type="button" id="clear" aria-label="Clear">×</button>
</div>`,
    extraCss: `.field {
  width: 230px; height: 40px; border-radius: 12px; background: #fff;
  border: 1px solid rgba(0,0,0,.08); padding: 0 8px 0 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.words { display: flex; gap: 4px; font-size: 14px; }
.x {
  width: 22px; height: 22px; border: 0; border-radius: 99px; background: #f1f1f1;
  cursor: pointer; font-size: 14px;
}`,
    script: `(function () {
  var words = [].slice.call(document.querySelectorAll('.t-word'));
  var btn = document.getElementById('clear');
  var cleared = false;
  btn.addEventListener('click', function () {
    if (!cleared) {
      words.forEach(function (word, i) {
        word.style.transitionDelay = (i * 45) + 'ms';
        word.classList.add('is-out');
      });
      btn.textContent = '+';
      cleared = true;
    } else {
      words.forEach(function (word) {
        word.style.transitionDelay = '0ms';
        word.classList.remove('is-out');
      });
      btn.textContent = '×';
      cleared = false;
    }
  });
})();`,
  },
  'drag-drop-physics': {
    html: `<div class="board">
  <div class="t-drop" id="zone">Drag & drop it here</div>
  <div class="chip" id="chip">Photo</div>
</div>`,
    extraCss: `.board { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.t-drop {
  width: 220px; height: 140px; border-radius: 28px; border: 1.5px dashed #d0d0d0;
  display: grid; place-items: center; color: #6c6c6c; background: transparent;
}
.t-drop.is-filled { border-radius: 16px; border-style: solid; background: #fff; transform: scale(1.04); color: #17181c; }
.chip {
  width: 72px; height: 72px; border-radius: 16px; background: #17181c; color: #fff;
  display: grid; place-items: center; touch-action: none; cursor: grab; user-select: none;
}`,
    script: `(function () {
  var zone = document.getElementById('zone');
  var chip = document.getElementById('chip');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragging = false;
  var ox = 0, oy = 0, x = 0, y = 0;
  chip.addEventListener('pointerdown', function (e) {
    dragging = true;
    chip.setPointerCapture(e.pointerId);
    chip.style.transition = 'none';
    ox = e.clientX - x;
    oy = e.clientY - y;
  });
  chip.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    x = e.clientX - ox;
    y = e.clientY - oy;
    chip.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  });
  chip.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging = false;
    var zb = zone.getBoundingClientRect();
    var cb = chip.getBoundingClientRect();
    var inside = cb.left < zb.right && cb.right > zb.left && cb.top < zb.bottom && cb.bottom > zb.top;
    chip.style.transition = reduce ? 'none' : 'transform var(--drop-snap) var(--drop-ease)';
    if (inside) {
      zone.classList.add('is-filled');
      zone.textContent = 'Dropped';
      var dx = (zb.left + zb.width / 2) - (cb.left + cb.width / 2);
      var dy = (zb.top + zb.height / 2) - (cb.top + cb.height / 2);
      x += dx;
      y += dy;
    } else {
      zone.classList.remove('is-filled');
      zone.textContent = 'Drag & drop it here';
      x = 0;
      y = 0;
    }
    chip.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  });
})();`,
  },
  'shimmer-text': {
    html: `<p class="t-shimmer">Generating reply</p>`,
    extraCss: `.t-shimmer { margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.03em; }`,
  },
  'tilt-3d': {
    document: TILT_COPY_SNIPPET,
  },
  'border-beam': {
    html: `<div class="col">
  <div class="t-beam shell">
    <div class="beam-spin"></div>
    <div class="inner chat">
      <span class="mark">}</span>
      <span class="dots">…</span>
      <span class="auto">Auto</span>
      <span class="send">↑</span>
    </div>
  </div>
  <div class="t-beam search">
    <div class="beam-spin search-spin"></div>
    <div class="inner search-inner">
      <span class="mag">⌕</span>
      <span>Search</span>
    </div>
  </div>
</div>`,
    extraCss: `.t-beam.shell, .t-beam.search { border-radius: 18px; padding: 2px; overflow: hidden; background: #ff4d9a; }
.t-beam.search { border-radius: 999px; background: #ff8ab8; }
.beam-spin {
  position: absolute; inset: -70%;
  background: conic-gradient(from 0deg, transparent 0 60%, var(--beam-colors));
  animation: beam-spin var(--beam-loop) linear infinite;
}
.search-spin {
  background: conic-gradient(from 90deg, transparent 0 72%, var(--search-colors));
  animation-duration: var(--search-loop);
}
.inner { position: relative; z-index: 1; background: #fff; border-radius: 16px; }
.chat { width: 280px; height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 12px; }
.search-inner { height: 40px; padding: 0 16px; display: flex; align-items: center; gap: 8px; color: #6c6c6c; border-radius: 999px; }
.mark { font-weight: 600; }
.dots { flex: 1; letter-spacing: 0.2em; color: #8f8f8f; }
.auto, .send {
  height: 26px; min-width: 26px; padding: 0 8px; border-radius: 999px;
  display: grid; place-items: center; background: #f3f3f3; font-size: 12px;
}
@keyframes beam-spin { to { transform: rotate(1turn); } }
@media (prefers-reduced-motion: reduce) {
  .beam-spin { animation: none !important; }
}`,
  },
  'orb-solving': orbCard('solving', 64, 'Solving....', false),
  'orb-thinking': orbCard('breathing', 64, 'Thinking....', false),
  'orb-agent-listening': orbCard('listening', 20, 'listening...', true),
  'orb-searching': orbCard('searching', 64, 'Searching....', false),
  'orb-agent-planning': orbCard('composing', 20, 'planning...', true),
  'orb-agent-thinking': orbCard('breathing', 20, 'thinking...', true),
  'orb-working': orbCard('working', 64, 'Working....', false),
  'orb-agent-shaping': orbCard('shaping', 20, 'shaping...', true),
  'orb-state-picker': {
    snippet: false,
    html: `<div class="picker" id="orb-card" data-mode="listening" data-size="64">
  <canvas id="orb" width="64" height="64" aria-label="Orb state picker"></canvas>
  <div class="controls" id="orb-controls">
    <button type="button" data-orb-state="working">Working</button>
    <button type="button" data-orb-state="searching">Searching</button>
    <button type="button" data-orb-state="solving">Solving</button>
    <button type="button" data-orb-state="listening">Listening</button>
    <button type="button" data-orb-state="connecting">Connecting</button>
    <button type="button" data-orb-state="composing">Composing</button>
    <button type="button" data-orb-state="breathing">Breathing</button>
    <button type="button" disabled>Weaving</button>
    <button type="button" disabled>Shaping</button>
    <button type="button" data-orb-size="64">64px</button>
    <button type="button" data-orb-size="20">20px</button>
    <button type="button" disabled>32px</button>
    <button type="button" id="orb-pause">Pause</button>
  </div>
</div>`,
    extraCss: ORB_PREVIEW_CSS,
    script: orbPreviewScript(true),
  },
  gooey: {
    html: `<div class="gooey" id="stage">
  <div class="t-gooey-tile anchor" id="anchor"></div>
  <div class="t-gooey-neck" id="neck"></div>
  <div class="t-gooey-tile drag" id="drag"></div>
</div>`,
    extraCss: `.gooey { position: relative; width: 280px; height: 280px; touch-action: none; }
.t-gooey-tile { position: absolute; left: 70px; top: 16px; }
.anchor { background: #7c2bff; }
.drag { background: #e11d48; cursor: grab; }
.t-gooey-neck {
  position: absolute; left: 122px; top: 90px; transform-origin: 8px 0;
  border-radius: 8px; z-index: 0;
}
.t-gooey-tile { z-index: 1; }`,
    script: `(function () {
  var stage = document.getElementById('stage');
  var drag = document.getElementById('drag');
  var neck = document.getElementById('neck');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function num(name, fallback) {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(n) ? n : fallback;
  }
  var homeX = num('--gooey-rest-x', 28);
  var homeY = num('--gooey-rest-y', 78);
  var x = homeX;
  var y = homeY;
  var vx = 0;
  var vy = 0;
  var dragging = false;
  function place() {
    drag.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    var dist = Math.max(num('--gooey-neck', 16), Math.hypot(x, y));
    var angle = Math.atan2(y, x) * 180 / Math.PI;
    neck.style.height = dist + 'px';
    neck.style.transform = 'rotate(' + (angle - 90) + 'deg)';
  }
  function spring() {
    if (dragging || reduce) return;
    var k = num('--gooey-spring-k', 280);
    var d = num('--gooey-spring-d', 20);
    var m = num('--gooey-spring-m', 0.85);
    var dt = 0.016;
    vx = (vx + ((homeX - x) * k) / m * dt) * Math.exp(-d * dt);
    vy = (vy + ((homeY - y) * k) / m * dt) * Math.exp(-d * dt);
    x += vx * dt;
    y += vy * dt;
    place();
    if (Math.hypot(homeX - x, homeY - y) > 0.6 || Math.hypot(vx, vy) > 0.6) requestAnimationFrame(spring);
    else { x = homeX; y = homeY; vx = 0; vy = 0; place(); }
  }
  drag.addEventListener('pointerdown', function (e) {
    dragging = true;
    drag.setPointerCapture(e.pointerId);
    vx = 0;
    vy = 0;
  });
  drag.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var b = stage.getBoundingClientRect();
    var px = (e.clientX - b.left) * (280 / b.width);
    var py = (e.clientY - b.top) * (280 / b.height);
    x = px - 130;
    y = py - 90;
    place();
  });
  function end() {
    if (!dragging) return;
    dragging = false;
    spring();
  }
  drag.addEventListener('pointerup', end);
  drag.addEventListener('pointercancel', end);
  place();
})();`,
  },
  'abrar-overview': {
    document: abrarOverviewDocument,
    snippet: false,
  },
  'liquid-metal': {
    html: `<div class="metal-row">
  <div class="t-metal pill"><span>Auto</span></div>
  <div class="t-metal send"><span>↑</span></div>
</div>`,
    extraCss: `.metal-row { display: flex; align-items: center; gap: 16px; }
.t-metal { display: grid; place-items: center; border-radius: 999px; isolation: isolate; }
.t-metal.pill { padding: var(--metal-auto-stroke); }
.t-metal.send { width: 48px; height: 48px; padding: var(--metal-send-stroke); }
.t-metal > span {
  position: relative; z-index: 1; background: #fff; border-radius: inherit;
  display: grid; place-items: center; width: 100%; height: 100%;
  padding: 8px 18px; font-weight: 600;
}
.t-metal::before {
  content: "";
  position: absolute; inset: 0; border-radius: inherit;
  background: conic-gradient(var(--metal-colors));
  animation: metal-spin var(--metal-loop) linear infinite;
}
@keyframes metal-spin { to { transform: rotate(1turn); } }
@media (prefers-reduced-motion: reduce) {
  .t-metal::before { animation: none !important; }
}`,
  },
  'preview-tools': {
    snippet: false,
    html: PREVIEW_TOOLS_HTML,
    extraCss: PREVIEW_TOOLS_CSS,
    script: PREVIEW_TOOLS_SCRIPT,
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (ch) => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;'));
}

export function composePreviewDocument(title: string, html: string, css: string, script: string): string {
  const scriptBlock = script.trim() ? `<script>\n${script.trim()}\n</script>\n` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
${css.trim()}
</style>
</head>
<body>
${html.trim()}
${scriptBlock}</body>
</html>
`;
}

export function splitPreviewDocument(doc: string): { html: string; css: string; script: string } {
  const css = (doc.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? '').trim();
  const script = [...doc.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1].trim()).join('\n\n');
  const body = doc.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const html = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim();
  return { html, css, script };
}

/** Clipboard note when the preview document has no script. */
export const HTML_CSS_ONLY_NOTE = 'This effect is HTML and CSS only.';

export type PreviewParts = { html: string; css: string; script: string };

/** HTML, CSS, and script that compose the document the preview iframe runs. */
export function previewDocumentParts(id: string): PreviewParts {
  const source = SOURCES[id];
  if (!source) throw new Error(`Missing preview source for ${id}`);
  const parts = source.document
    ? splitPreviewDocument(source.document)
    : {
        html: (source.html ?? '').trim(),
        css: fullCss(id, source.extraCss, source.snippet !== false),
        script: (source.script ?? '').trim(),
      };
  if (!parts.html || !parts.css) throw new Error(`Incomplete preview for ${id}`);
  return parts;
}

export function copyTextFor(id: string, kind: 'html' | 'css' | 'script'): string {
  const parts = previewDocumentParts(id);
  if (kind === 'script' && !parts.script) return HTML_CSS_ONLY_NOTE;
  return parts[kind];
}

function fullCss(id: string, extra: string | undefined, useSnippet: boolean): string {
  const motion = useSnippet ? (SNIPPETS[id] ?? '') : '';
  return [BASE_CSS, motion.trim(), (extra ?? '').trim()].filter(Boolean).join('\n\n');
}

function isPreviewKind(section: NavSection): section is PreviewKind {
  return section === 'transitions' || section === 'effects';
}

export function playgroundPreviewButtons(): PlaygroundPreviewButton[] {
  const buttons: PlaygroundPreviewButton[] = [];
  const missing: string[] = [];

  for (const item of TRANSITIONS) {
    const kinds = item.sections.filter(isPreviewKind);
    if (!kinds.length) continue;
    const source = SOURCES[item.id];
    if (!source) {
      missing.push(item.id);
      continue;
    }

    const parts = previewDocumentParts(item.id);
    const code = source.document ?? composePreviewDocument(item.title, parts.html, parts.css, parts.script);
    if (!parts.html || !parts.css) {
      missing.push(item.id);
      continue;
    }

    for (const kind of kinds) {
      buttons.push({
        key: `${kind}:${item.id}`,
        id: item.id,
        label: item.title,
        kind,
        html: parts.html,
        css: parts.css,
        script: parts.script,
        code,
        prompt: promptFor(item.id),
      });
    }
  }

  if (missing.length) {
    throw new Error(`Playground is missing a real preview for: ${missing.join(', ')}`);
  }

  return buttons;
}
