/**
 * Closed-network documents the Playground iframe actually runs.
 * Each transition and effect gets markup, the CSS that drives it, and
 * script when the motion cannot run from CSS alone.
 */
import { promptFor } from '@/src/agentPrompts';
import { TRANSITIONS } from '@/src/catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import type { NavSection } from '@/src/sections';
import { SNIPPETS } from '@/src/snippets';

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
  html: string;
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
  <div class="digits" id="digits" aria-label="65.78">
    <span class="t-digit">6</span><span class="t-digit">5</span><span class="t-digit">.</span><span class="t-digit">7</span><span class="t-digit">8</span>
  </div>
  <button class="trigger" type="button" id="replay">Replay</button>
</div>`,
    extraCss: `.digits { font-size: 42px; font-weight: 600; letter-spacing: 0.04em; }`,
    script: `(function () {
  var root = document.getElementById('digits');
  document.getElementById('replay').addEventListener('click', function () {
    var html = root.innerHTML;
    root.innerHTML = html;
  });
})();`,
  },
  'notification-badge': {
    html: `<button class="bell" type="button" id="bell" aria-label="Notifications">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17181c" stroke-width="1.7">
    <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 19a2 2 0 0 0 4 0"/>
  </svg>
  <span class="t-badge is-on" id="badge">3</span>
</button>`,
    extraCss: `.bell {
  position: relative; width: 48px; height: 48px; border-radius: 12px;
  border: 1px solid rgba(0,0,0,.08); background: #fff; cursor: pointer;
}
.t-badge {
  position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px;
  padding: 0 4px; border-radius: 99px; background: #e11d48; color: #fff;
  font-size: 10px; display: grid; place-items: center;
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
    }, reduce ? 0 : 150);
  });
})();`,
  },
  'menu-dropdown': {
    html: `<div class="menu">
  <button class="trigger" type="button" id="menu-btn" aria-expanded="true">Menu</button>
  <div class="t-dropdown is-open" id="menu">
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
  var open = true;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function () {
    if (open) {
      menu.classList.remove('is-open');
      menu.classList.add('is-closing');
      setTimeout(function () { menu.classList.remove('is-closing'); }, reduce ? 0 : 150);
    } else {
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
    }
    open = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();`,
  },
  'modal-open-close': {
    html: `<div class="col">
  <button class="trigger" type="button" id="open">Open modal</button>
  <div class="backdrop" id="backdrop">
    <div class="t-modal panel is-open" id="modal" role="dialog" aria-label="Modal">
      <strong>Modal</strong>
      <p>Scale and fade.</p>
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
  var open = true;
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
      }, reduce ? 0 : 150);
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
    ['BNB', '0.42 BNB'],
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
    }, reduce ? 0 : 250);
  });
})();`,
  },
  'icon-swap': {
    html: `<div class="col">
  <div class="icon-slot" id="slot">
    <span class="t-icon" id="icon-a" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17181c" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>
    </span>
    <span class="t-icon is-out" id="icon-b" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17181c" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
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
  <svg class="t-check" id="check" width="72" height="72" viewBox="0 0 72 72" aria-label="Success">
    <circle cx="36" cy="36" r="32" fill="#e9f9ef"/>
    <path d="M22 37l10 10 18-20" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
    <input class="t-shake" id="email" value="not-an-email" aria-label="Email" />
    <span class="msg">Please enter a valid email.</span>
  </label>
  <button class="trigger" type="button" id="validate">Shake</button>
</div>`,
    extraCss: `.field { display: flex; flex-direction: column; gap: 6px; width: 240px; }
.t-shake { height: 36px; border-radius: 8px; border: 1px solid #e11d48; padding: 0 10px; font: 500 14px Inter, system-ui, sans-serif; }
.msg { color: #e11d48; font-size: 12px; }`,
    script: `(function () {
  var input = document.getElementById('email');
  document.getElementById('validate').addEventListener('click', function () {
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
  <button class="trigger" type="button" id="host">Save</button>
  <div class="tip-anchor"><div class="t-tt is-on" id="tip">Saved to library</div></div>
</div>`,
    extraCss: `.tip-wrap { position: relative; margin-top: 28px; }
.tip-anchor { position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); }
.t-tt {
  background: #17181c; color: #fff; border-radius: 6px; padding: 6px 8px;
  font-size: 12px; white-space: nowrap;
}`,
    script: `(function () {
  var tip = document.getElementById('tip');
  var host = document.getElementById('host');
  function show() {
    tip.classList.remove('is-off');
    tip.classList.add('is-on');
  }
  function hide() {
    tip.classList.remove('is-on');
    tip.classList.add('is-off');
  }
  host.addEventListener('mouseenter', show);
  host.addEventListener('focus', show);
  host.addEventListener('mouseleave', hide);
  host.addEventListener('blur', hide);
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
  <span class="t-avatar" style="background:#7c2bff">A</span>
  <span class="t-avatar" style="background:#e11d48">B</span>
  <span class="t-avatar" style="background:#ea580c">C</span>
  <span class="t-avatar" style="background:#0f766e">D</span>
  <span class="t-avatar" style="background:#17181c">E</span>
</div>`,
    extraCss: `.t-avatars { display: flex; padding: 12px 12px 12px 22px; }
.t-avatar {
  width: 36px; height: 36px; margin-left: -10px; border-radius: 50%;
  border: 2px solid #fff; display: grid; place-items: center;
  color: #fff; font-size: 12px; font-weight: 600;
}
.t-avatar.is-near { transform: translateY(calc(var(--avatar-lift) * var(--avatar-falloff))) scale(1.02); }`,
    script: `(function () {
  var root = document.getElementById('avatars');
  var avatars = [].slice.call(root.querySelectorAll('.t-avatar'));
  function clear() {
    avatars.forEach(function (el) { el.classList.remove('is-hot', 'is-near'); });
  }
  avatars.forEach(function (el, i) {
    el.addEventListener('mouseenter', function () {
      avatars.forEach(function (other, j) {
        var dist = Math.abs(i - j);
        other.classList.toggle('is-hot', dist === 0);
        other.classList.toggle('is-near', dist === 1);
      });
    });
  });
  root.addEventListener('mouseleave', clear);
})();`,
  },
  'card-stack-hover': {
    html: `<div class="t-stack is-spread" id="stack">
  <div class="t-stack-card"></div>
  <div class="t-stack-card"></div>
  <div class="t-stack-card"><strong>Notes</strong><span>Spring fan</span></div>
</div>`,
    extraCss: `.t-stack { position: relative; width: 200px; height: 140px; cursor: pointer; }
.t-stack-card {
  position: absolute; left: 28px; right: 28px; top: 22px; bottom: 18px;
  border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.08);
  padding: 12px;
}
.t-stack .t-stack-card:nth-child(1) { background: #ececec; transform: translate(-6px, 6px) rotate(-3deg); }
.t-stack .t-stack-card:nth-child(2) { background: #f7f7f7; }
.t-stack .t-stack-card:nth-child(3) { display: flex; flex-direction: column; gap: 4px; }
.t-stack-card span { color: #6c6c6c; font-size: 12px; }`,
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
    html: `<p class="t-shimmer">Masked gradient sweep</p>`,
    extraCss: `.t-shimmer { margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.03em; }`,
  },
  'tilt-3d': {
    html: `<div class="t-tilt" id="tilt">
  <div class="t-tilt-card" id="card">
    <div class="t-tilt-glare" id="glare"></div>
    <div class="face">
      <span class="brand">Credit</span>
      <span class="mark">VISA</span>
      <span class="name">John Smith</span>
      <span class="pan">4111 - 1111 - 1111 - 1111</span>
    </div>
  </div>
</div>`,
    extraCss: `.t-tilt { width: 280px; height: 168px; }
.t-tilt-card {
  width: 100%; height: 100%; border-radius: 16px; position: relative; overflow: hidden;
  background: linear-gradient(160deg, #3a3d4e, #17181c); color: #fff;
}
.t-tilt-glare { position: absolute; inset: 0; }
.face { position: relative; z-index: 1; height: 100%; padding: 18px; display: flex; flex-direction: column; }
.brand { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7; }
.mark { margin-left: auto; font-weight: 700; letter-spacing: 0.12em; }
.name { margin-top: auto; font-size: 14px; }
.pan { font-size: 13px; letter-spacing: 0.04em; opacity: 0.85; }`,
    script: `(function () {
  var card = document.getElementById('card');
  var glare = document.getElementById('glare');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(rx, ry, gx, gy) {
    card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    glare.style.background = 'radial-gradient(circle at ' + gx + '% ' + gy + '%, rgba(255,255,255,var(--tilt-glare-opacity)), transparent 55%)';
  }
  card.addEventListener('pointermove', function (e) {
    if (reduce) return;
    var b = card.getBoundingClientRect();
    var px = (e.clientX - b.left) / b.width;
    var py = (e.clientY - b.top) / b.height;
    set((0.5 - py) * 14, (px - 0.5) * 18, px * 100, py * 100);
  });
  card.addEventListener('pointerenter', function () {
    card.style.transitionDuration = reduce ? '0ms' : 'var(--tilt-follow)';
  });
  card.addEventListener('pointerleave', function () {
    card.style.transitionDuration = reduce ? '0ms' : 'var(--tilt-return)';
    set(0, 0, 50, 20);
  });
  set(6, -8, 30, 20);
})();`,
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
  'thinking-orbs-playground': {
    html: `<div class="orb-stage">
  <canvas id="orbs" width="360" height="180" aria-label="Thinking orbs"></canvas>
  <div class="labels">
    <span>Agent searching...</span>
    <span>Thinking....</span>
  </div>
</div>`,
    extraCss: `.orb-stage { display: flex; flex-direction: column; align-items: center; gap: 4px; }
canvas { width: 360px; height: 180px; }
.labels { width: 360px; display: flex; justify-content: space-around; font-size: 13px; color: #6c6c6c; }`,
    script: `(function () {
  var canvas = document.getElementById('orbs');
  var ctx = canvas.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var start = performance.now();
  function dots(x, y, r, t) {
    var n = 56;
    var i;
    for (i = 0; i < n; i++) {
      var phi = Math.acos(1 - 2 * (i + 0.5) / n);
      var theta = Math.PI * (1 + Math.sqrt(5)) * i + t * Math.PI * 2 / 9;
      var sp = Math.sin(phi);
      var dx = sp * Math.cos(theta);
      var dy = Math.cos(phi);
      var dz = sp * Math.sin(theta);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(23,24,28,' + (0.3 + 0.7 * (dz + 1) / 2) + ')';
      ctx.arc(x + dx * r, y + dy * r, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function metal(x, y, r, t) {
    var g = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#c5d0e4');
    g.addColorStop(1, '#6a7386');
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(x, y);
    ctx.rotate(t * Math.PI * 2 / 7.2);
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.fillRect(-r, -5, r * 2, 10);
    ctx.restore();
  }
  function frame(now) {
    var t = reduce ? 0.4 : (now - start) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots(100, 90, 42, t);
    metal(250, 90, 42, t);
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();`,
    snippet: false,
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

    const parts = source.document
      ? splitPreviewDocument(source.document)
      : {
          html: source.html.trim(),
          css: fullCss(item.id, source.extraCss, source.snippet !== false),
          script: (source.script ?? '').trim(),
        };
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
