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
import { YOGESH_CREATOR_CSS, YOGESH_CREATOR_HTML, YOGESH_CREATOR_SCRIPT } from '@/src/demos/yogesh-orb-creator/copySlots';
import { YOGESH_ORB_CSS, YOGESH_ORB_HTML, YOGESH_ORB_SCRIPT } from '@/src/demos/yogesh-thinking-orbs/copySlots';
import { TILT_COPY_SNIPPET } from '@/src/demos/tiltMotion';
import { ORB_PREVIEW_CSS, orbCard, orbPickerSource } from '@/src/closedNetwork/orbCopy';
import { imageGenerationLoaderScript } from '@/src/closedNetwork/organicLoaderSource';

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
  background: #f5f5f5;
}
canvas { display: block; width: 168px; height: 168px; }`,
    script: imageGenerationLoaderScript(),
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
    snippet: false,
    html: `<div id="parity-root"></div>`,
    extraCss: `@font-face {
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
#parity-root { width: 213px; }`,
    script: `(function () {
  var s = document.createElement('script');
  s.src = location.origin + '/parity/drag-drop-physics.js';
  document.body.appendChild(s);
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
    snippet: false,
    html: `<div id="parity-root"></div>`,
    extraCss: `#parity-root { width: min(480px, 100%); }`,
    script: `(function () {
  var s = document.createElement('script');
  s.src = location.origin + '/parity/border-beam.js';
  document.body.appendChild(s);
})();`,
  },
  'orb-solving': orbCard({ state: 'solving', size: 64, label: 'Solving....', agent: false }),
  'orb-thinking': orbCard({ motionsource: 'msThinking', size: 64, label: 'Thinking....', agent: false }),
  'orb-agent-listening': orbCard({ state: 'listening', size: 20, label: 'listening...', agent: true }),
  'orb-searching': orbCard({ state: 'searching', size: 64, label: 'Searching....', agent: false }),
  'orb-agent-planning': orbCard({ motionsource: 'msAgentPlanning', size: 20, label: 'planning...', agent: true }),
  'orb-agent-thinking': orbCard({ motionsource: 'msAgentThinking', size: 20, label: 'thinking...', agent: true }),
  'orb-working': orbCard({ state: 'working', size: 64, label: 'Working....', agent: false }),
  'orb-agent-shaping': orbCard({ motionsource: 'msAgentShaping', size: 20, label: 'shaping...', agent: true }),
  'orb-state-picker': orbPickerSource(),
  gooey: {
    snippet: false,
    html: `<div id="parity-root"></div>`,
    extraCss: `@font-face {
  font-family: Inter;
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
#parity-root { width: 452px; }`,
    script: `(function () {
  var s = document.createElement('script');
  s.src = location.origin + '/parity/gooey.js';
  document.body.appendChild(s);
})();`,
  },
  'abrar-overview': {
    document: abrarOverviewDocument,
    snippet: false,
  },
  'liquid-metal': {
    snippet: false,
    html: `<div id="parity-root"></div>`,
    extraCss: `#parity-root { width: 504px; }`,
    script: `(function () {
  var s = document.createElement('script');
  s.src = location.origin + '/parity/liquid-metal.js';
  document.body.appendChild(s);
})();`,
  },
  'preview-tools': {
    snippet: false,
    html: PREVIEW_TOOLS_HTML,
    extraCss: PREVIEW_TOOLS_CSS,
    script: PREVIEW_TOOLS_SCRIPT,
  },
  'yogesh-thinking-orbs': {
    snippet: false,
    html: YOGESH_ORB_HTML,
    extraCss: YOGESH_ORB_CSS,
    script: YOGESH_ORB_SCRIPT,
  },
  'yogesh-orb-creator': {
    snippet: false,
    html: YOGESH_CREATOR_HTML,
    extraCss: YOGESH_CREATOR_CSS,
    script: YOGESH_CREATOR_SCRIPT,
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
  if (id === 'yogesh-thinking-orbs') {
    return { html: YOGESH_ORB_HTML, css: YOGESH_ORB_CSS, script: YOGESH_ORB_SCRIPT };
  }
  if (id === 'yogesh-orb-creator') {
    return { html: YOGESH_CREATOR_HTML, css: YOGESH_CREATOR_CSS, script: YOGESH_CREATOR_SCRIPT };
  }
  const source = SOURCES[id];
  if (!source) throw new Error(`Missing preview source for ${id}`);
  if (source.document) {
    const parts = splitPreviewDocument(source.document);
    if (!parts.html || !parts.css) throw new Error(`Incomplete preview for ${id}`);
    return parts;
  }
  const html = (source.html ?? '').trim();
  const script = (source.script ?? '').trim();
  const css = fullCss(id, html, script, source.extraCss, source.snippet !== false);
  if (!html || !css) throw new Error(`Incomplete preview for ${id}`);
  return { html, css, script };
}

export function copyTextFor(id: string, kind: 'html' | 'css' | 'script'): string {
  const parts = previewDocumentParts(id);
  if (kind === 'script' && !parts.script) return HTML_CSS_ONLY_NOTE;
  return parts[kind];
}

function classNames(selector: string): string[] {
  return [...selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1] ?? '');
}

/** Class tokens keep `-` inside the name, so `aria-label` is not `label` and `orb-controls` is not `controls`. */
function tokenAppears(name: string, source: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^A-Za-z0-9_-])${escaped}(?:$|[^A-Za-z0-9_-])`).test(source);
}

function splitSelectors(prelude: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  for (const ch of prelude) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function selectorNeeded(selector: string, haystack: string): boolean {
  const classes = classNames(selector).filter((name) => name.length > 0);
  if (classes.length === 0) return true;
  return classes.every((name) => tokenAppears(name, haystack));
}

type CssBlock = {
  kind: 'rule' | 'media' | 'keyframes' | 'other';
  raw: string;
  prelude: string;
  body: string;
  name: string;
};

function skipCssNoise(css: string, index: number): number {
  const ch = css[index];
  if (ch === '"' || ch === "'") {
    let i = index + 1;
    while (i < css.length) {
      if (css[i] === '\\') {
        i += 2;
        continue;
      }
      if (css[i] === ch) return i + 1;
      i += 1;
    }
    return i;
  }
  if (ch === '/' && css[index + 1] === '*') {
    const end = css.indexOf('*/', index + 2);
    return end < 0 ? css.length : end + 2;
  }
  return index;
}

function parseBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i] ?? '')) i += 1;
    if (i >= css.length) break;
    const start = i;
    let open = -1;
    while (i < css.length) {
      const skipped = skipCssNoise(css, i);
      if (skipped !== i) {
        i = skipped;
        continue;
      }
      if (css[i] === '{') {
        open = i;
        break;
      }
      i += 1;
    }
    if (open < 0) {
      const raw = css.slice(start).trim();
      if (raw) blocks.push({ kind: 'other', raw, prelude: raw, body: '', name: '' });
      break;
    }
    let depth = 1;
    i = open + 1;
    while (i < css.length && depth > 0) {
      const skipped = skipCssNoise(css, i);
      if (skipped !== i) {
        i = skipped;
        continue;
      }
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
      i += 1;
    }
    const raw = css.slice(start, i);
    const prelude = css.slice(start, open).trim();
    const body = css.slice(open + 1, i - 1);
    const frames = /^@keyframes\s+([A-Za-z_][\w-]*)/i.exec(prelude);
    if (frames) {
      blocks.push({ kind: 'keyframes', raw, prelude, body, name: frames[1] ?? '' });
    } else if (/^@(media|supports)\b/i.test(prelude)) {
      blocks.push({ kind: 'media', raw, prelude, body, name: '' });
    } else {
      blocks.push({ kind: 'rule', raw, prelude, body, name: '' });
    }
  }
  return blocks;
}

function emitRule(block: CssBlock, haystack: string): string | null {
  const selectors = splitSelectors(block.prelude);
  const needed = selectors.filter((selector) => selectorNeeded(selector, haystack));
  if (needed.length === 0) return null;
  if (needed.length === selectors.length) return block.raw.trim();
  return `${needed.join(', ')} {${block.body}}`;
}

/**
 * Keep a shared sheet's rules only when this asset's HTML or script uses them.
 * Element, :root, and pseudo-only selectors stay. A class selector stays when
 * every class token appears. @keyframes stay when a kept rule names them.
 */
function filterSheet(css: string, html: string, script: string): string {
  const haystack = `${html}\n${script}`;
  const blocks = parseBlocks(css);
  const kept: { index: number; text: string }[] = [];
  const referenced: string[] = [];

  blocks.forEach((block, index) => {
    if (block.kind === 'keyframes') return;
    if (block.kind === 'other') {
      kept.push({ index, text: block.raw.trim() });
      referenced.push(block.raw);
      return;
    }
    if (block.kind === 'media') {
      const inner = filterSheet(block.body, html, script);
      if (!inner.trim()) return;
      const text = inner.trim() === block.body.trim() ? block.raw.trim() : `${block.prelude} {\n${inner}\n}`;
      kept.push({ index, text });
      referenced.push(inner);
      return;
    }
    const text = emitRule(block, haystack);
    if (!text) return;
    kept.push({ index, text });
    referenced.push(text);
  });

  const used = referenced.join('\n');
  blocks.forEach((block, index) => {
    if (block.kind === 'keyframes' && block.name && tokenAppears(block.name, used)) {
      kept.push({ index, text: block.raw.trim() });
    }
  });

  kept.sort((a, b) => a.index - b.index);
  const filtered = kept.map((item) => item.text).join('\n');
  if (filtered.trim() === css.trim()) return css;
  return filtered;
}

function fullCss(id: string, html: string, script: string, extra: string | undefined, useSnippet: boolean): string {
  const motion = useSnippet ? (SNIPPETS[id] ?? '') : '';
  const base = filterSheet(BASE_CSS, html, script);
  const extraCss = extra === ORB_PREVIEW_CSS ? filterSheet(ORB_PREVIEW_CSS, html, script) : (extra ?? '');
  return [base, motion.trim(), extraCss.trim()].filter(Boolean).join('\n\n');
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
