/**
 * Closed-network documents the Playground iframe actually runs.
 * Each transition and effect gets markup, the CSS that drives it, and
 * script when the motion cannot run from CSS alone.
 */
import abrarOverviewDocument from '@/src/demos/abrar-overview/closed-network.html';
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

// Source only: public/fonts/inter-latin.woff2. This path is not part of the payload.
const GOOEY_FONT_SRC = 'url(data:font/woff2;base64,\u2026)';
const GOOEY_FONT_NOTE =
  'the base64 is the Inter v20 latin variable woff2 (48,256 B, sha256 3100e775\u2026), included in the Copy';
const GOOEY_FONT_PROMPT_LINE = `src: ${GOOEY_FONT_SRC}; /* ${GOOEY_FONT_NOTE} */`;

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
  /** React Native or TSX copy. The playground shows it as code and does not iframe it. */
  codeOnly: boolean;
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
  /** Skip the shared light sheet. This card paints its own stage. */
  omitBase?: boolean;
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
    html: `<div class="stage">
  <div class="t-resize" id="card">
    <div class="bar"></div>
    <div class="bar short"></div>
  </div>
  <button class="animate" type="button" id="toggle" aria-label="Animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.t-resize {
  width: 148px;
  height: 100px;
  background: #ffffff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.bar { height: 8px; width: 100%; border-radius: 4px; background: #ececec; }
.bar.short { width: 62%; }
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
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
    html: `<div class="stage">
  <div class="row" id="row"></div>
  <button class="animate" type="button" id="animate" aria-label="Animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.row { display: flex; align-items: flex-end; }
.t-digit { font: 600 42px/46px Inter, system-ui, sans-serif; letter-spacing: -1px; color: #0d0d0d; }
.t-digit.dot { font-size: 32px; margin-bottom: 2px; }
.t-digit.gap { width: 6px; }
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
    script: `(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sets = ['6 5. 7 8', '1 4. 0 2', '9 3. 6 1'];
  var i = 0;
  var row = document.getElementById('row');
  function render() {
    row.textContent = '';
    sets[i].split('').forEach(function (ch) {
      var el = document.createElement('span');
      el.className = 't-digit' + (ch === '.' ? ' dot' : '') + (ch === ' ' ? ' gap' : '');
      el.textContent = ch;
      if (reduce) el.style.animationDuration = '0ms';
      row.appendChild(el);
    });
  }
  render();
  document.getElementById('animate').addEventListener('click', function () {
    i = (i + 1) % sets.length;
    render();
  });
})();`,
  },
  'notification-badge': {
    html: `<div class="stage">
  <div class="bell">
    <svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9a6 6 0 1 1 12 0c0 3.2.8 4.8 1.6 6H4.4C5.2 13.8 6 12.2 6 9Z"/>
      <path d="M10 18a2 2 0 0 0 4 0"/>
    </svg>
    <span class="t-badge" id="badge">1</span>
  </div>
  <button class="animate" type="button" id="animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.bell { position: relative; width: 40px; height: 40px; display: grid; place-items: center; }
.glyph { width: 28px; height: 28px; }
.glyph path { fill: none; stroke: #0d0d0d; stroke-width: 1.7px; }
.glyph path + path { stroke-linecap: round; }
.t-badge {
  position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px;
  padding: 0 4px; border-radius: 9px; background: #e23d2d; color: #fff;
  font: 600 10px/18px Inter, system-ui, sans-serif; display: grid; place-items: center;
}
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
    script: `(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var on = false;
  var badge = document.getElementById('badge');
  document.getElementById('animate').addEventListener('click', function () {
    on = !on;
    badge.classList.toggle('is-on', on);
    badge.classList.toggle('is-off', !on);
    if (reduce) badge.style.animationDuration = '0ms';
  });
})();`,
  },
  'text-states-swap': {
    html: `<div class="stage">
  <div class="swap"><span class="t-text-swap" id="line">Transaction processing...</span></div>
  <button class="animate" type="button" id="animate" aria-label="Animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.t-text-swap { color: #0d0d0d; font: 500 15px Inter, system-ui, sans-serif; }
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
    script: `(function () {
  var el = document.getElementById('line');
  var texts = ['Transaction processing...', 'Transaction completed'];
  var i = 0;
  var busy = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('animate').addEventListener('click', function () {
    if (busy) return;
    busy = true;
    el.classList.add('is-exit');
    setTimeout(function () {
      i = (i + 1) % texts.length;
      el.textContent = texts[i];
      el.classList.remove('is-exit');
      el.classList.add('is-enter-start');
      void el.offsetWidth;
      el.classList.remove('is-enter-start');
      busy = false;
    }, reduce ? 0 : 250);
  });
})();`,
  },
  'menu-dropdown': {
    html: `<div class="stage">
  <div class="anchor">
    <div class="menu-hit" id="menu-hit" tabindex="0">Open menu</div>
    <div class="menu" id="menu">
      <div class="item" tabindex="0">New file</div>
      <div class="item" tabindex="0">Add image</div>
      <div class="item" tabindex="0">New folder</div>
    </div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.anchor { min-width: 160px; display: flex; flex-direction: column; align-items: flex-start; }
.menu-hit {
  height: 34px; padding: 0 12px; border-radius: 10px; background: #ffffff; color: #0d0d0d;
  font: 500 13px/34px Inter, system-ui, sans-serif; cursor: pointer;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.menu {
  width: 160px; margin-top: 8px; padding: 6px; border-radius: 12px; background: #ffffff;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.item {
  height: 32px; padding: 0 8px; border-radius: 8px; color: #0d0d0d;
  font: 400 13px/32px Inter, system-ui, sans-serif; cursor: pointer;
}`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var hit = document.getElementById('menu-hit');
  var menu = document.getElementById('menu');
  var open = false;
  function paint() {
    menu.classList.toggle('is-open', open);
    hit.textContent = open ? 'Close menu' : 'Open menu';
    menu.style.transitionDuration = media.matches ? '0ms' : '';
  }
  function toggle() {
    open = !open;
    paint();
  }
  function close() {
    if (!open) return;
    open = false;
    paint();
  }
  function onKey(event, fn) {
    if (event.repeat || event.key !== 'Enter') return;
    fn();
  }
  hit.addEventListener('click', toggle);
  hit.addEventListener('keydown', function (event) { onKey(event, toggle); });
  [].slice.call(menu.querySelectorAll('.item')).forEach(function (item) {
    item.addEventListener('click', close);
    item.addEventListener('keydown', function (event) { onKey(event, close); });
  });
  media.addEventListener('change', paint);
})();`,
  },
  'modal-open-close': {
    html: `<div class="stage">
  <button class="open-btn" type="button" id="open">Toggle modal</button>
  <div class="layer" id="layer">
    <div class="backdrop scrim" id="backdrop"></div>
    <div class="t-modal panel" id="modal" role="dialog" aria-label="New project">
      <p class="title">New project</p>
      <p class="message">Scale from 0.94 with a 200ms fade.</p>
      <button class="close" type="button" id="close">Close</button>
    </div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative;
  width: 100%;
  height: 200px;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.open-btn {
  appearance: none;
  height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: #ffffff;
  color: #0d0d0d;
  font: 500 13px/normal Inter, system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.layer {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 1;
  pointer-events: none;
}
.layer.is-open { pointer-events: auto; }
.layer.is-closing { pointer-events: none; }
.backdrop {
  position: absolute;
  inset: 0;
  background: #0d0d0d;
  opacity: 0;
  transition: opacity var(--modal-open-dur) var(--modal-ease);
}
.layer.is-open .backdrop { opacity: 0.28; }
.layer.is-closing .backdrop {
  opacity: 0;
  transition-duration: var(--modal-close-dur);
}
.panel {
  z-index: 1;
  width: 210px;
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.title {
  margin: 0 0 6px;
  color: #0d0d0d;
  font: 600 15px/normal Inter, system-ui, sans-serif;
}
.message {
  margin: 0 0 12px;
  color: #6c6c6c;
  font: 400 12px/17px Inter, system-ui, sans-serif;
}
.close {
  appearance: none;
  align-self: flex-end;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #0d0d0d;
  font: 500 13px/normal Inter, system-ui, sans-serif;
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .backdrop { transition: none !important; }
}`,
    script: `(function () {
  var layer = document.getElementById('layer');
  var modal = document.getElementById('modal');
  var open = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paint(next) {
    open = next;
    if (next) {
      modal.classList.remove('is-closing');
      layer.classList.remove('is-closing');
      void modal.offsetWidth;
      modal.classList.add('is-open');
      layer.classList.add('is-open');
    } else {
      modal.classList.remove('is-open');
      layer.classList.remove('is-open');
      modal.classList.add('is-closing');
      layer.classList.add('is-closing');
      setTimeout(function () {
        if (!open) {
          modal.classList.remove('is-closing');
          layer.classList.remove('is-closing');
        }
      }, reduce ? 0 : 200);
    }
  }
  document.getElementById('open').addEventListener('click', function () { paint(true); });
  document.getElementById('close').addEventListener('click', function (event) {
    event.stopPropagation();
    paint(false);
  });
  document.getElementById('backdrop').addEventListener('click', function () { paint(false); });
})();`,
  },
  'page-side-by-side': {
    html: `<button class="pager" type="button" id="pager">
  <div class="t-page" id="list">
    <div class="row">
      <span class="avatar">B</span>
      <span class="names">
        <span class="name">BNB</span>
        <span class="sub">BNB</span>
      </span>
      <span class="price">$66.11</span>
    </div>
  </div>
  <div class="t-page is-enter" id="detail">
    <span class="amount">$10</span>
    <span class="avail">$66.11 available</span>
  </div>
</button>`,
    extraCss: `.pager {
  appearance: none; position: relative; width: 210px; height: 88px; padding: 0;
  border: 0; border-radius: 14px; background: #fff; overflow: hidden; cursor: pointer;
  text-align: left; color: #0d0d0d; font: 500 14px/1 Inter, system-ui, sans-serif;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.t-page {
  position: absolute; inset: 0; padding: 16px;
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
}
.row { display: flex; align-items: center; gap: 10px; width: 100%; }
.avatar {
  width: 32px; height: 32px; border-radius: 16px; background: #f3ba2f; color: #1a1200;
  display: grid; place-items: center; font-size: 14px; font-weight: 600; flex: none;
}
.names { display: flex; flex-direction: column; }
.name { font-size: 14px; font-weight: 500; line-height: 18px; color: #0d0d0d; }
.sub { font-size: 12px; font-weight: 400; line-height: 16px; color: #767676; }
.price { margin-left: auto; font-size: 14px; font-weight: 500; color: #0d0d0d; }
.amount { font-size: 28px; font-weight: 600; line-height: 32px; color: #0d0d0d; }
.avail { font-size: 12px; font-weight: 400; line-height: 16px; color: #767676; }`,
    script: `(function () {
  var list = document.getElementById('list');
  var detail = document.getElementById('detail');
  var on = false;
  document.getElementById('pager').addEventListener('click', function () {
    on = !on;
    list.classList.toggle('is-exit', on);
    detail.classList.toggle('is-enter', !on);
  });
})();`,
  },
  'icon-swap': {
    html: `<button class="icon-slot" type="button" id="slot" aria-label="Swap icon">
  <span class="t-icon" id="icon-a" aria-hidden="true">
    <span class="bars"><i></i><i></i><i></i></span>
  </span>
  <span class="t-icon is-out" id="icon-b" aria-hidden="true">
    <span class="x"></span>
  </span>
</button>`,
    extraCss: `.icon-slot {
  appearance: none; position: relative; width: 48px; height: 48px; padding: 0; border: 0;
  border-radius: 12px; background: #fff; cursor: pointer;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.t-icon { position: absolute; left: 14px; top: 16px; width: 20px; height: 16px; }
.bars { display: flex; flex-direction: column; justify-content: space-between; width: 20px; height: 16px; }
.bars i { display: block; width: 20px; height: 2px; margin: 0; border-radius: 1px; background: #0d0d0d; }
.x { position: relative; width: 20px; height: 16px; }
.x::before, .x::after {
  content: ""; position: absolute; left: 0; top: 7px; width: 20px; height: 2px;
  border-radius: 1px; background: #0d0d0d;
}
.x::before { transform: rotate(45deg); }
.x::after { transform: rotate(-45deg); }`,
    script: `(function () {
  var a = document.getElementById('icon-a');
  var b = document.getElementById('icon-b');
  document.getElementById('slot').addEventListener('click', function () {
    a.classList.toggle('is-out');
    b.classList.toggle('is-out');
  });
})();`,
  },
  'success-check': {
    html: `<div class="stage">
  <div class="mark" id="mark">
    <div class="badge">
      <svg class="disc" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="16"/>
        <path d="M11 18.5 L16 23.5 L25 13.5"/>
      </svg>
    </div>
  </div>
  <button class="animate" type="button" id="animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.mark {
  opacity: var(--t);
  transform: translateY(calc((1 - var(--t)) * 28px)) rotate(calc((1 - var(--t)) * 80deg)) scale(calc(0.86 + var(--t) * 0.14));
}
.badge { width: 56px; height: 56px; display: grid; place-items: center; }
.disc { width: 36px; height: 36px; }
.disc circle { fill: #1f8a4c; }
.disc path {
  fill: none; stroke: #fff; stroke-width: 2.4px; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 28px; stroke-dashoffset: calc((1 - var(--dash)) * 28px);
}
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
    script: `(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var on = false;
  var mark = document.getElementById('mark');
  document.getElementById('animate').addEventListener('click', function () {
    on = !on;
    mark.classList.toggle('is-on', on);
    mark.classList.toggle('is-off', !on);
    if (reduce) mark.style.animationDuration = '0ms';
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
    extraCss: `.field { position: relative; display: block; width: 220px; padding-bottom: 20px; }
.t-shake { display: block; width: 100%; height: 38px; border-radius: 10px; border: 1px solid rgba(0,0,0,.1); padding: 0 10px; font: 400 13px Inter, system-ui, sans-serif; }
.t-shake.is-error { border-color: #c43a31; }
.msg { position: absolute; left: 0; top: calc(38px + 6px); height: 14px; line-height: 14px; margin: 0; color: #c43a31; font-size: 11px; }`,
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
    html: `<div class="stage">
  <div class="row" id="row">
    <div class="bones">
      <div class="avatar bone"></div>
      <div class="lines">
        <div class="line"></div>
        <div class="line long"></div>
      </div>
    </div>
    <div class="loaded">
      <div class="avatar photo"><span class="ini">JC</span></div>
      <div class="who">
        <p class="name">Jane Cooper</p>
        <p class="mail">jane.cooper@example.com</p>
      </div>
    </div>
  </div>
  <button class="animate" type="button" id="toggle" aria-label="Animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.row { position: relative; width: 230px; height: 48px; }
.bones, .loaded { position: absolute; inset: 0; }
.bones { display: flex; align-items: center; }
.avatar { position: absolute; left: 0; top: 4px; width: 40px; height: 40px; border-radius: 20px; }
.bone { background: #eeeeef; }
.lines { margin-left: 52px; }
.line { width: 108px; height: 10px; border-radius: 5px; background: #eeeeef; }
.line.long { width: 150px; margin-top: 8px; }
.loaded { display: flex; align-items: center; padding-left: 52px; }
.photo { background: #d9b8a2; display: flex; align-items: center; justify-content: center; }
.ini { color: #2a2118; font: 500 11px Inter, system-ui, sans-serif; }
.name { margin: 0; color: #0d0d0d; font: 500 14px Inter, system-ui, sans-serif; }
.mail { margin: 0; color: #767676; font: 400 12px Inter, system-ui, sans-serif; }
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
    script: `(function () {
  var row = document.getElementById('row');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shown = false;
  var timer = 0;
  function show() {
    shown = true;
    row.classList.add('is-loaded');
  }
  function hide() {
    shown = false;
    row.classList.remove('is-loaded');
  }
  document.getElementById('toggle').addEventListener('click', function () {
    if (timer) window.clearTimeout(timer);
    timer = 0;
    if (shown) hide();
    else show();
  });
  // First reveal after 900ms. Reduced motion uses 0ms.
  timer = window.setTimeout(show, reduce ? 0 : 900);
})();`,
  },
  'texts-reveal': {
    html: `<div class="stage">
  <div class="lines" id="lines">
    <div class="line title">Pull request opened</div>
    <div class="line sub">Review requested from 3 teammates</div>
  </div>
  <button class="animate" type="button" id="animate" aria-label="Animate">Animate</button>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.lines { width: 230px; }
.title { margin: 0 0 4px; color: #0d0d0d; font: 500 16px/20px Inter, system-ui, sans-serif; }
.sub { margin: 0; color: #767676; font: 400 13px/16px Inter, system-ui, sans-serif; }
.animate {
  appearance: none; position: absolute; right: 10px; bottom: 10px; height: 28px;
  padding: 0 10px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(243, 243, 243, 0.94); color: #17181c;
  font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
}
.animate:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.animate:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var lines = document.getElementById('lines');
  function render() {
    lines.textContent = '';
    var title = document.createElement('div');
    title.className = 'line title';
    title.textContent = 'Pull request opened';
    var sub = document.createElement('div');
    sub.className = 'line sub';
    sub.textContent = 'Review requested from 3 teammates';
    if (media.matches) {
      title.style.animationDuration = '0ms';
      sub.style.animationDuration = '0ms';
    }
    lines.appendChild(title);
    lines.appendChild(sub);
  }
  document.getElementById('animate').addEventListener('click', render);
})();`,
  },
  'tabs-sliding': {
    html: `<div class="stage">
  <div class="bar">
    <div class="pill" id="pill"></div>
    <div class="tab on" tabindex="0">Overview</div>
    <div class="tab" tabindex="0">Activity</div>
    <div class="tab" tabindex="0">Settings</div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.bar { display: flex; position: relative; background: #f1f1f1; border-radius: 999px; padding: 3px; }
.pill {
  position: absolute; top: 3px; bottom: 3px; left: 0; width: 78px;
  border-radius: 999px; background: #fff; transform: translateX(3px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.tab {
  position: relative; z-index: 1; width: 78px; height: 30px;
  display: grid; place-items: center; cursor: pointer;
  color: rgba(15, 15, 15, 0.8); font: 500 12px/1 Inter, system-ui, sans-serif;
}
.tab.on { color: #0f0f0f; }`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var mass = 1, damping = 20, stiffness = 280;
  var omega0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var omega1 = omega0 * Math.sqrt(1 - zeta * zeta);
  // Visible settle 530ms. The step does not snap there. dt cap 64ms.
  var cap = '64ms';
  var targets = ['3px', '81px', '159px'];
  var pill = document.getElementById('pill');
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  var spring = { value: 3, velocity: 0, target: 3, energy: 0, done: true };
  var index = 0;
  var raf = 0;
  var last = 0;
  function paint() {
    pill.style.transform = 'translateX(' + spring.value + 'px)';
  }
  function to(target) {
    if (media.matches) {
      spring.value = target;
      spring.velocity = 0;
      spring.target = target;
      spring.done = true;
      pill.style.animationDuration = '0ms';
      paint();
      return;
    }
    if (spring.target === target) return;
    var v = spring.velocity;
    // Opposing velocity is dropped. Velocity toward the new target is kept.
    if ((target > spring.value && v < 0) || (target < spring.value && v > 0)) v = 0;
    spring.velocity = v;
    spring.target = target;
    var x0 = spring.value - target;
    spring.energy = 0.5 * stiffness * x0 * x0 + 0.5 * mass * v * v;
    spring.done = spring.energy === 0;
    if (spring.done) spring.value = target;
    kick();
  }
  function step(dtMs) {
    if (spring.done) return;
    var dt = Math.min(parseFloat(cap), Math.max(0, dtMs)) / 1000;
    var x0 = spring.value - spring.target;
    var v0 = spring.velocity;
    var env = Math.exp(-zeta * omega0 * dt);
    var sin1 = Math.sin(omega1 * dt);
    var cos1 = Math.cos(omega1 * dt);
    var frag = env * (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
    spring.value = spring.target + frag;
    spring.velocity = -zeta * omega0 * frag + env * (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);
    var e = 0.5 * stiffness * (spring.target - spring.value) * (spring.target - spring.value) + 0.5 * mass * spring.velocity * spring.velocity;
    if (spring.energy === 0 || e / spring.energy <= 6e-9) {
      spring.value = spring.target;
      spring.velocity = 0;
      spring.done = true;
    }
  }
  function frame(now) {
    step(now - last);
    last = now;
    paint();
    if (!spring.done) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function select(i) {
    var target = parseFloat(targets[i]);
    if (i === index && spring.target === target) return;
    index = i;
    tabs.forEach(function (tab, j) { tab.classList.toggle('on', j === i); });
    to(target);
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
    tab.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') select(i);
    });
  });
  media.addEventListener('change', function () {
    if (media.matches) to(spring.target);
  });
  paint();
})();`,
  },
  'tooltip-open-close': {
    html: `<div class="stage">
  <div class="group">
    <div class="bubble" id="bubble">
      <div class="face" id="face">Edit</div>
    </div>
    <div class="row">
      <div class="hit" tabindex="0" data-tip="Edit" data-slot="0">Aa</div>
      <div class="hit" tabindex="0" data-tip="Share" data-slot="1">↗</div>
      <div class="hit" tabindex="0" data-tip="More" data-slot="2">\u00b7\u00b7\u00b7</div>
    </div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.group { position: relative; }
.bubble { position: absolute; top: -36px; left: 0; transform: translateX(0px); pointer-events: none; }
.face {
  height: 28px; min-width: 36px; padding: 0 8px; border-radius: 8px; background: #ffffff;
  color: #2f2f2f; font: 500 12px/28px Inter, system-ui, sans-serif; white-space: nowrap;
  display: grid; place-items: center;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}
.row { display: flex; gap: 8px; }
.hit {
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff; color: #0d0d0d; cursor: pointer;
  display: grid; place-items: center; font: 500 13px/1 Inter, system-ui, sans-serif;
}`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var mass = 1, damping = 20, stiffness = 280;
  var omega0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var omega1 = omega0 * Math.sqrt(1 - zeta * zeta);
  // Rests are 0px, 44px, and 88px.
  // Visible settle 371ms on 44px. Visible settle 536ms on 88px. The step does not snap there. dt cap 64ms.
  var cap = '64ms';
  var step = '44px';
  var bubble = document.getElementById('bubble');
  var face = document.getElementById('face');
  var hits = [].slice.call(document.querySelectorAll('.hit'));
  var spring = { value: 0, velocity: 0, target: 0, energy: 0, done: true };
  var raf = 0;
  var last = 0;
  function paint() {
    bubble.style.transform = 'translateX(' + spring.value + 'px)';
  }
  function to(target) {
    if (media.matches) {
      spring.value = target;
      spring.velocity = 0;
      spring.target = target;
      spring.done = true;
      face.style.transitionDuration = '0ms';
      face.style.transitionDelay = '0ms';
      paint();
      return;
    }
    face.style.transitionDuration = '';
    face.style.transitionDelay = '';
    if (spring.target === target) return;
    var v = spring.velocity;
    // Opposing velocity is dropped. Velocity toward the new target is kept.
    if ((target > spring.value && v < 0) || (target < spring.value && v > 0)) v = 0;
    spring.velocity = v;
    spring.target = target;
    var x0 = spring.value - target;
    spring.energy = 0.5 * stiffness * x0 * x0 + 0.5 * mass * v * v;
    spring.done = spring.energy === 0;
    if (spring.done) spring.value = target;
    kick();
  }
  function stepSpring(dtMs) {
    if (spring.done) return;
    var dt = Math.min(parseFloat(cap), Math.max(0, dtMs)) / 1000;
    var x0 = spring.value - spring.target;
    var v0 = spring.velocity;
    var env = Math.exp(-zeta * omega0 * dt);
    var sin1 = Math.sin(omega1 * dt);
    var cos1 = Math.cos(omega1 * dt);
    var frag = env * (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
    spring.value = spring.target + frag;
    spring.velocity = -zeta * omega0 * frag + env * (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);
    var e = 0.5 * stiffness * (spring.target - spring.value) * (spring.target - spring.value) + 0.5 * mass * spring.velocity * spring.velocity;
    if (spring.energy === 0 || e / spring.energy <= 6e-9) {
      spring.value = spring.target;
      spring.velocity = 0;
      spring.done = true;
    }
  }
  function frame(now) {
    stepSpring(now - last);
    last = now;
    paint();
    if (!spring.done) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function show(hit) {
    face.textContent = hit.getAttribute('data-tip') || '';
    face.classList.remove('is-on');
    face.classList.add('is-off');
    void face.offsetWidth;
    face.classList.remove('is-off');
    face.classList.add('is-on');
    to(Number(hit.getAttribute('data-slot')) * parseFloat(step));
  }
  function hide() {
    face.classList.remove('is-on');
    face.classList.add('is-off');
  }
  hits.forEach(function (hit) {
    hit.addEventListener('mouseenter', function () { show(hit); });
    hit.addEventListener('mouseleave', hide);
  });
  media.addEventListener('change', function () {
    if (media.matches) to(spring.target);
  });
  paint();
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
    html: `<div class="stage">
  <div class="burst" id="burst">
    <button class="celebrate" type="button" id="celebrate">Celebrate</button>
  </div>
</div>`,
    extraCss: `.stage {
  width: 289px; height: 200px; border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px;
  background: #f9f9f9; overflow: hidden; display: grid; place-items: center;
}
.burst { position: relative; width: 100%; height: 220px; display: grid; place-items: center; }
.celebrate {
  position: relative; z-index: 2; appearance: none; height: 36px; padding: 0 14px;
  border: 0; border-radius: 10px; background: #ffffff; color: #0d0d0d; cursor: pointer;
  font: 500 13px/1 Inter, system-ui, sans-serif;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
}`,
    script: `(function () {
  var root = document.getElementById('burst');
  var btn = document.getElementById('celebrate');
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var colors = ['#ff5a5f', '#f5c518', '#2ecc71', '#4da3ff', '#b07cff', '#ff8a3d'];
  var seed = 0;
  var last = 0;
  function debounceMs() {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--confetti-debounce'));
    return Number.isFinite(n) ? n : 80;
  }
  function spawn() {
    var now = Date.now();
    if (now - last < debounceMs()) return;
    last = now;
    seed += 1;
    var old = root.querySelectorAll('.t-confetti-piece');
    var k;
    for (k = 0; k < old.length; k++) old[k].remove();
    var reduce = reduceQuery.matches;
    var i;
    for (i = 0; i < 18; i++) {
      var el = document.createElement('span');
      el.className = 't-confetti-piece';
      el.style.background = colors[i % colors.length];
      el.style.setProperty('--x', String(((i % 9) - 4) * 9 + (i % 2) * 3));
      el.style.setProperty('--peak', String(46 + (i % 6) * 8));
      el.style.setProperty('--rot', String(((i * 37 + seed * 11) % 200) - 100));
      el.style.setProperty('--slot', String(i % 6));
      if (reduce) el.style.animationDuration = '0ms';
      root.appendChild(el);
      el.classList.add('is-on');
    }
  }
  btn.addEventListener('click', spawn);
})();`,
  },
  'gooey-plus-menu': {
    html: '',
    document: GOOEY_PLUS_CLOSED_NETWORK_HTML,
    snippet: false,
  },
  'avatar-group-hover': {
    html: `<div class="stage">
  <div class="row" id="row">
    <div class="hit" tabindex="0"><span class="disc jc">JC</span></div>
    <div class="hit" tabindex="0"><span class="disc ak">AK</span></div>
    <div class="hit" tabindex="0"><span class="disc mr">MR</span></div>
    <div class="hit" tabindex="0"><span class="disc sl">SL</span></div>
    <div class="hit" tabindex="0"><span class="disc tw">TW</span></div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.row { display: flex; align-items: center; }
.hit { cursor: pointer; }
.disc {
  width: 40px; height: 40px; border-radius: 20px; margin-left: -10px;
  border: 2px solid #fff; display: grid; place-items: center;
  color: #2a2118; font: 500 11px/1 Inter, system-ui, sans-serif;
}
.hit:first-child .disc { margin-left: 0; }
.jc { background: #d9b8a2; }
.ak { background: #b7c7d9; }
.mr { background: #d4c4a8; }
.sl { background: #c5b3d6; }
.tw { background: #a8c5b8; }`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var mass = 4, damping = 20, stiffness = 280;
  var omega0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var omega1 = omega0 * Math.sqrt(1 - zeta * zeta);
  var settle = '3782ms';
  function num(name, fallback) {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(n) ? n : fallback;
  }
  function Spring(value) {
    this.value = value;
    this.velocity = 0;
    this.target = value;
    this.energy = 0;
    this.born = 0;
    this.done = true;
  }
  Spring.prototype.to = function (target) {
    if (media.matches) {
      this.value = target;
      this.velocity = 0;
      this.target = target;
      this.done = true;
      return;
    }
    if (this.target === target && !this.done) return;
    var v = this.velocity;
    if ((target > this.value && v < 0) || (target < this.value && v > 0)) v = 0;
    this.velocity = v;
    this.target = target;
    var x0 = this.value - target;
    this.energy = 0.5 * stiffness * x0 * x0 + 0.5 * mass * v * v;
    this.born = performance.now();
    this.done = this.energy === 0;
    if (this.done) this.value = target;
  };
  Spring.prototype.step = function (dtMs, now) {
    if (this.done) return;
    if (now - this.born >= parseFloat(settle)) {
      this.value = this.target;
      this.velocity = 0;
      this.done = true;
      return;
    }
    var dt = Math.min(64, Math.max(0, dtMs)) / 1000;
    var x0 = this.value - this.target;
    var v0 = this.velocity;
    var env = Math.exp(-zeta * omega0 * dt);
    var sin1 = Math.sin(omega1 * dt);
    var cos1 = Math.cos(omega1 * dt);
    var frag = env * (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
    this.value = this.target + frag;
    this.velocity = -zeta * omega0 * frag + env * (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);
    var e = 0.5 * stiffness * (this.target - this.value) * (this.target - this.value) + 0.5 * mass * this.velocity * this.velocity;
    if (this.energy === 0 || e / this.energy <= 6e-9) {
      this.value = this.target;
      this.velocity = 0;
      this.done = true;
    }
  };
  var hits = [].slice.call(document.querySelectorAll('.hit'));
  var discs = hits.map(function (hit) { return hit.querySelector('.disc'); });
  var lifts = discs.map(function () { return new Spring(0); });
  var scales = discs.map(function () { return new Spring(1); });
  var hot = null;
  var raf = 0;
  var last = 0;
  function strength(j) {
    if (hot == null) return 0;
    return Math.max(0, 1 - Math.abs(hot - j) * num('--avatar-falloff', 0.45));
  }
  function retarget() {
    var lift = num('--avatar-lift', -8);
    var gain = num('--avatar-scale', 0.06);
    discs.forEach(function (disc, j) {
      var s = strength(j);
      lifts[j].to(lift * s);
      scales[j].to(1 + gain * s);
      disc.style.zIndex = s > 0.9 ? '3' : '1';
      if (media.matches) disc.style.animationDuration = '0ms';
    });
    kick();
  }
  function paint(now) {
    var dt = now - last;
    last = now;
    var moving = false;
    discs.forEach(function (disc, j) {
      lifts[j].step(dt, now);
      scales[j].step(dt, now);
      disc.style.transform = 'translateY(' + lifts[j].value + 'px) scale(' + scales[j].value + ')';
      if (!lifts[j].done || !scales[j].done) moving = true;
    });
    if (moving) raf = requestAnimationFrame(paint);
    else raf = 0;
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(paint);
  }
  function setHot(index) {
    hot = index;
    retarget();
  }
  var row = document.getElementById('row');
  hits.forEach(function (hit, i) {
    hit.addEventListener('pointerenter', function () { setHot(i); });
    hit.addEventListener('pointerleave', function (event) {
      var next = event.relatedTarget;
      if (next && next.closest && next.closest('.row') === row) return;
      setHot(null);
    });
    hit.addEventListener('pointerdown', function () { setHot(i); });
    hit.addEventListener('pointerup', function () { setHot(null); });
    hit.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') setHot(i);
    });
    hit.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') setHot(null);
    });
  });
})();`,
  },
  'card-stack-hover': {
    html: `<div class="stage">
  <div class="hit" id="hit" tabindex="0">
    <div class="stack">
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
    </div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.hit { position: relative; width: 180px; height: 120px; cursor: pointer; }
.stack { position: absolute; left: 35px; top: 23px; width: 110px; height: 74px; }
.card {
  position: absolute; left: 0; top: 0; width: 110px; height: 74px;
  border-radius: 12px; background: #fff; color: #0d0d0d;
  box-shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05);
  display: grid; place-items: center; font: 500 13px/1 Inter, system-ui, sans-serif;
}`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var mass = 1, damping = 20, stiffness = 280;
  var omega0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var omega1 = omega0 * Math.sqrt(1 - zeta * zeta);
  var settle = '984ms';
  var hit = document.getElementById('hit');
  var cards = [].slice.call(hit.querySelectorAll('.card'));
  var spread = false;
  var spring = { value: 0, velocity: 0, target: 0, energy: 0, born: 0, done: true };
  var raf = 0;
  var last = 0;
  function to(target) {
    if (media.matches) {
      spring.value = target;
      spring.velocity = 0;
      spring.target = target;
      spring.done = true;
      cards.forEach(function (card) { card.style.animationDuration = '0ms'; });
      paint(performance.now());
      return;
    }
    if (spring.target === target && !spring.done) return;
    var v = spring.velocity;
    if ((target > spring.value && v < 0) || (target < spring.value && v > 0)) v = 0;
    spring.velocity = v;
    spring.target = target;
    var x0 = spring.value - target;
    spring.energy = 0.5 * stiffness * x0 * x0 + 0.5 * mass * v * v;
    spring.born = performance.now();
    spring.done = spring.energy === 0;
    if (spring.done) spring.value = target;
    kick();
  }
  function step(dtMs, now) {
    if (spring.done) return;
    if (now - spring.born >= parseFloat(settle)) {
      spring.value = spring.target;
      spring.velocity = 0;
      spring.done = true;
      return;
    }
    var dt = Math.min(64, Math.max(0, dtMs)) / 1000;
    var x0 = spring.value - spring.target;
    var v0 = spring.velocity;
    var env = Math.exp(-zeta * omega0 * dt);
    var sin1 = Math.sin(omega1 * dt);
    var cos1 = Math.cos(omega1 * dt);
    var frag = env * (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
    spring.value = spring.target + frag;
    spring.velocity = -zeta * omega0 * frag + env * (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);
    var e = 0.5 * stiffness * (spring.target - spring.value) * (spring.target - spring.value) + 0.5 * mass * spring.velocity * spring.velocity;
    if (spring.energy === 0 || e / spring.energy <= 6e-9) {
      spring.value = spring.target;
      spring.velocity = 0;
      spring.done = true;
    }
  }
  function paint(now) {
    var dt = now - last;
    last = now;
    step(dt, now);
    cards.forEach(function (card) {
      var cs = getComputedStyle(card);
      var x = parseFloat(cs.getPropertyValue('--x')) * spring.value;
      var y = parseFloat(cs.getPropertyValue('--y')) * spring.value;
      var r = parseFloat(cs.getPropertyValue('--r')) * spring.value;
      card.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + r + 'deg)';
    });
    if (!spring.done) raf = requestAnimationFrame(paint);
    else raf = 0;
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(paint);
  }
  function setSpread(next) {
    spread = next;
    to(spread ? 1 : 0);
  }
  hit.addEventListener('pointerenter', function () { setSpread(true); });
  hit.addEventListener('pointerleave', function () { setSpread(false); });
  hit.addEventListener('click', function () { setSpread(!spread); });
  hit.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') setSpread(!spread);
  });
})();`,
  },
  'input-clear-dissolve': {
    html: `<div class="stage">
  <div class="field">
    <div class="row" id="row"></div>
    <div class="x" id="x" tabindex="0">×</div>
  </div>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}
.field {
  width: 230px; height: 40px; border-radius: 12px; background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08); padding: 0 12px;
  display: flex; align-items: center;
}
.row { position: relative; flex: 1; display: flex; gap: 4px; overflow: hidden; min-width: 0; }
.word { color: #0d0d0d; font: 400 14px/17px Inter, system-ui, sans-serif; }
.word.out { position: absolute; top: 0px; }
.placeholder { color: #8f8f8f; font: 400 14px/17px Inter, system-ui, sans-serif; }
.x {
  width: 20px; height: 20px; display: grid; place-items: center; cursor: pointer;
  color: #6c6c6c;
  font: 400 18px/20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}`,
    script: `(function () {
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var stagger = '45ms';
  var words = ['search', 'recent', 'files'];
  var row = document.getElementById('row');
  var control = document.getElementById('x');
  var cleared = false;
  var exitSerial = 0;
  function showPlaceholder() {
    if (row.querySelector('.placeholder')) return;
    var hold = document.createElement('span');
    hold.className = 'placeholder';
    hold.textContent = 'Search';
    row.appendChild(hold);
  }
  function settle() {
    row.textContent = '';
    if (cleared) {
      showPlaceholder();
      control.textContent = '+';
      return;
    }
    control.textContent = '×';
    words.forEach(function (word) {
      var el = document.createElement('span');
      el.className = 'word';
      el.textContent = word;
      el.style.animationDuration = '0ms';
      row.appendChild(el);
    });
  }
  // files keeps top -8.5px for the whole clear. translateY still ends at -25px, so the visual offset ends at -33.5px.
  function armExit(el, i, box) {
    var serial = String(++exitSerial);
    el.dataset.exit = serial;
    el.className = 'word out';
    el.style.left = box.left + 'px';
    el.style.top = i === 2 ? '-8.5px' : '0px';
    el.style.width = box.width + 'px';
    el.style.height = box.height + 'px';
    el.style.animationName = 'none';
    el.style.animationDelay = (i * parseFloat(stagger)) + 'ms';
    void el.offsetWidth;
    el.style.animationName = 'word-out';
    el.addEventListener('animationend', function onEnd(event) {
      if (event.target !== el || el.dataset.exit !== serial) return;
      el.removeEventListener('animationend', onEnd);
      el.remove();
    });
  }
  function enter() {
    cleared = false;
    if (media.matches) {
      settle();
      return;
    }
    var hold = row.querySelector('.placeholder');
    if (hold) hold.remove();
    control.textContent = '×';
    words.forEach(function (word, i) {
      var el = document.createElement('span');
      el.className = 'word in';
      el.textContent = word;
      el.style.animationDelay = (i * parseFloat(stagger)) + 'ms';
      row.appendChild(el);
    });
  }
  function leave() {
    cleared = true;
    if (media.matches) {
      settle();
      return;
    }
    var live = [].slice.call(row.querySelectorAll('.word:not(.out)'));
    var boxes = live.map(function (node) {
      return { left: node.offsetLeft, width: node.offsetWidth, height: node.offsetHeight };
    });
    live.forEach(function (node, i) { armExit(node, i, boxes[i]); });
    showPlaceholder();
    control.textContent = '+';
  }
  function toggle() {
    if (cleared) enter();
    else leave();
  }
  control.addEventListener('click', toggle);
  control.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') toggle();
  });
  media.addEventListener('change', function () {
    if (!media.matches) return;
    settle();
  });
  enter();
})();`,
  },
  'drag-drop-physics': {
    snippet: false,
    html: `<div id="parity-root"></div>`,
    extraCss: `#parity-root { width: 213px; }`,
    script: `(function () {
  var s = document.createElement('script');
  s.src = location.origin + '/parity/drag-drop-physics.js';
  document.body.appendChild(s);
})();`,
  },
  'spacing-tuner': {
    snippet: false,
    html: `<div id="parity-root"></div>`,
    extraCss: `body { background: #F3F3F3; }
#parity-root { width: min(1440px, 100%); aspect-ratio: 1440 / 1080; }`,
    script: `(function () {
  var s = document.createElement('script');
  s.src = location.origin + '/parity/spacing-tuner.js';
  document.body.appendChild(s);
})();`,
  },
  'shimmer-text': {
    html: `<div class="stage">
  <p class="shimmer" id="shimmer"><span class="base">Generating reply</span><span class="mask" id="mask"><span class="hot">Generating reply</span></span></p>
</div>`,
    extraCss: `.stage {
  position: relative; width: 289px; height: 200px; overflow: hidden;
  display: grid; place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04); border-radius: 14px; background: #f9f9f9;
}`,
    script: `(function () {
  var root = document.getElementById('shimmer');
  var base = root.querySelector('.base');
  function apply() {
    root.style.setProperty('--shimmer-end', base.offsetWidth + 'px');
  }
  apply();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
})();`,
  },
  'tilt-3d': {
    document: TILT_COPY_SNIPPET,
  },
  'border-beam': {
    snippet: false,
    omitBase: true,
    html: `<div id="parity-root"></div>`,
    extraCss: `html, body {
  height: 100%;
  margin: 0;
  background: #171717;
}
#parity-root { width: 100%; }`,
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
  ${GOOEY_FONT_PROMPT_LINE}
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

const PARITY_LOADER = "location.origin + '/parity/";

/**
 * A sandboxed srcdoc iframe reports `location.origin` as the string "null",
 * so the parity loader requests `/null/parity/…`. Rewrite only that loader
 * expression. Other `location.origin` text, including HTML pasted into Run,
 * stays as written. The stored Copy still says `location.origin`.
 */
export function withPreviewOrigin(html: string, origin: string): string {
  if (!origin || origin === 'null' || !html.includes(PARITY_LOADER)) return html;
  return html.split(PARITY_LOADER).join(`${JSON.stringify(origin)} + '/parity/`);
}

/** Copy is React Native or TSX source, not a document the sandbox can run. */
export function isCodeOnlyCopy(html: string, css: string, script: string): boolean {
  const source = `${html}\n${css}\n${script}`;
  if (/from\s+['"]react-native(?:-[^'"]+)?(?:\/[^'"]*)?['"]/.test(source)) return true;
  if (/\/\* FILE [^*]*\.tsx \*\//.test(source)) return true;
  return false;
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
  const css = fullCss(id, html, script, source.extraCss, source.snippet !== false, source.omitBase === true);
  if (!html || !css) throw new Error(`Incomplete preview for ${id}`);
  return { html, css, script };
}

export function copyTextFor(id: string, kind: 'html' | 'css' | 'script'): string {
  const parts = previewDocumentParts(id);
  if (kind === 'script' && !parts.script) return HTML_CSS_ONLY_NOTE;
  return parts[kind];
}

/** Start the face chunk before a Copy CSS write so the clipboard does not wait on it. */
export function prefetchGooeyFont(text: string): void {
  if (!text.includes(GOOEY_FONT_SRC)) return;
  void import('./interLatinFont');
}

/** Swap the prompt's font placeholder for the embedded woff2. Loads the face on demand. */
export function embedGooeyFont(text: string): Promise<string> {
  if (!text.includes(GOOEY_FONT_SRC)) return Promise.resolve(text);
  return import('./interLatinFont').then((mod) =>
    text.split(GOOEY_FONT_PROMPT_LINE).join(
      `src: url("${mod.INTER_LATIN_WOFF2_DATA_URI}") format("woff2"); /* Inter © 2016 The Inter Project Authors. SIL Open Font License 1.1, https://openfontlicense.org */`,
    ),
  );
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

function idNames(selector: string): string[] {
  return [...selector.matchAll(/#([A-Za-z_][\w-]*)/g)].map((match) => match[1] ?? '').filter((name) => name.length > 0);
}

/**
 * Element and :root selectors style the preview document, so they stay.
 * A class or id stays when that asset's HTML or script uses it, including a
 * class the script adds or toggles. A getElementById / querySelector('#id')
 * lookup does not count: that read is a no-op when the node is not in the markup.
 */
function usageHaystack(html: string, script: string): string {
  const withoutIdLookups = script
    .replace(/getElementById\(\s*['"][^'"]+['"]\s*\)/g, '')
    .replace(/querySelector(?:All)?\(\s*['"]#[^'"]+['"]\s*\)/g, '');
  return `${html}\n${withoutIdLookups}`;
}

function selectorNeeded(selector: string, haystack: string): boolean {
  const classes = classNames(selector).filter((name) => name.length > 0);
  const ids = idNames(selector);
  if (classes.length === 0 && ids.length === 0) return true;
  return [...classes, ...ids].every((name) => tokenAppears(name, haystack));
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
  // Every selector is used: the source rule, unchanged.
  if (needed.length === selectors.length) return block.raw.trim();
  // A grouped rule keeps the original declaration block and only the selectors this asset uses.
  return `${needed.join(', ')} {${block.body}}`;
}

/**
 * Keep a shared sheet's rules only when this asset's HTML or script uses them.
 * Element, :root, and pseudo-only selectors stay. A class or id stays when that
 * token appears, including a class the script toggles. @keyframes stay when a
 * kept rule names them. A kept rule's declaration block is the source text.
 */
function filterSheet(css: string, html: string, script: string): string {
  const haystack = usageHaystack(html, script);
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

function fullCss(
  id: string,
  html: string,
  script: string,
  extra: string | undefined,
  useSnippet: boolean,
  omitBase = false,
): string {
  const motion = useSnippet ? (SNIPPETS[id] ?? '') : '';
  const base = omitBase ? '' : filterSheet(BASE_CSS, html, script);
  const extraCss = extra === ORB_PREVIEW_CSS ? filterSheet(ORB_PREVIEW_CSS, html, script) : (extra ?? '');
  return [base, motion.trim(), extraCss.trim()].filter(Boolean).join('\n\n');
}

function isPreviewKind(section: NavSection): section is PreviewKind {
  return section === 'transitions' || section === 'effects';
}

export function playgroundPreviewButtons(promptForId: (id: string) => string): PlaygroundPreviewButton[] {
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
        codeOnly: isCodeOnlyCopy(parts.html, parts.css, parts.script),
        prompt: promptForId(item.id),
      });
    }
  }

  if (missing.length) {
    throw new Error(`Playground is missing a real preview for: ${missing.join(', ')}`);
  }

  return buttons;
}
