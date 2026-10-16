import { ORB_ENGINE_JS } from '@/src/closedNetwork/orbEngineSource';

/**
 * Closed-network paint of the vendored thinking-orbs 0.3.1 engine.
 * One module is inlined into every orb Copy script. Live cards stay on ThinkingOrb.
 */
export const ORB_PREVIEW_CSS = `body { background: #0c0c0c; color: #ededed; }
.pill, .chip {
  display: flex; align-items: center;
  background: rgba(29,29,29,0.72);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 50px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.pill { height: 74px; gap: 12px; padding: 0 28px 0 9px; }
.chip { height: 36px; gap: 8px; padding: 0 14px 0 8px; }
.label { font-size: 18px; line-height: 24px; color: #ededed; }
.agent { font-size: 13px; line-height: 16px; }
.muted { color: #8a8a8a; }
.action { color: #ffffff; }
canvas { display: block; }
.picker {
  display: flex; flex-direction: row; align-items: center; gap: 8px;
  padding: 8px 10px; max-width: 640px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.stage-col {
  width: 100px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6px;
}
.controls { flex: 1; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.field { font-size: 11px; line-height: 14px; color: #979797; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chips button, #orb-pause {
  appearance: none; border: 0; cursor: pointer;
  background: rgba(255,255,255,0.06); color: #ededed;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-weight: 500;
}
.chips button { height: 24px; padding: 0 8px; border-radius: 36px; font-size: 11px; }
#orb-pause { height: 26px; padding: 0 10px; border-radius: 36px; font-size: 12px; }
.chips button.is-on { background: #f4f4f5; color: #111111; }
.chips button:disabled { opacity: 0.4; cursor: default; }`;

const HOST = `  var MOTION = {
    msThinking: { state: 'breathing', size: 64, mode: 'ring' },
    msAgentThinking: { state: 'breathing', size: 20, mode: 'ring' },
    msAgentPlanning: { state: 'composing', size: 20, mode: 'ribbon' },
    msAgentShaping: { state: 'shaping', size: 20, mode: 'morph' }
  };
  var card = document.getElementById('orb-card');
  var canvas = document.getElementById('orb');
  var ctx = canvas.getContext('2d');
  var reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = reduceQuery.matches;
  var paused = false;
  var frozen = null;
  var raf = 0;
  var running = false;
  function spec() {
    var key = card.getAttribute('data-motionsource');
    if (key && MOTION[key]) return MOTION[key];
    return {
      state: card.getAttribute('data-state') || 'working',
      size: Number(card.getAttribute('data-size')) || 64,
      mode: ''
    };
  }
  function orbTime(bakedSpeed) {
    var now = performance.now() / 1000;
    if (reduce) return 0.6;
    if (paused) {
      if (frozen == null) frozen = now * bakedSpeed;
      return frozen;
    }
    frozen = null;
    return now * bakedSpeed;
  }
  function paint() {
    var current = spec();
    var preset = OrbEngine.resolvePreset(current.state, current.size);
    if (current.mode && preset.mode !== current.mode) {
      console.warn('[motionsource] ' + card.getAttribute('data-motionsource') + ': expected mode ' + current.mode + ', vendor returned ' + preset.mode);
    }
    if (canvas.width !== current.size || canvas.height !== current.size) {
      canvas.width = current.size;
      canvas.height = current.size;
    }
    var t = orbTime(preset.speed);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    OrbEngine.paintFrame(ctx, OrbEngine.MODE_FRAMES[preset.mode](current.size, t, preset.opts), true);
  }
  function animating() {
    return !reduce && !paused && document.visibilityState !== 'hidden';
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function tick() {
    if (!running) return;
    paint();
    if (!animating()) { running = false; return; }
    raf = requestAnimationFrame(tick);
  }
  function kick() {
    paint();
    if (!animating()) { stop(); return; }
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }
  function setPaused(next) {
    paused = next;
    if (!paused) frozen = null;
    var button = document.getElementById('orb-pause');
    if (button) {
      button.textContent = paused ? 'Play' : 'Pause';
      button.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    }
    kick();
  }
  reduceQuery.addEventListener('change', function (event) {
    reduce = event.matches;
    kick();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') stop();
    else kick();
  });
  card.orbClock = { setPaused: setPaused };
  kick();
`;

const PICKER = `  function mark() {
    var buttons = card.querySelectorAll('button');
    var i;
    for (i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      var stateOn = button.getAttribute('data-orb-state') && button.getAttribute('data-orb-state') === card.getAttribute('data-state');
      var sizeOn = button.getAttribute('data-orb-size') && Number(button.getAttribute('data-orb-size')) === Number(card.getAttribute('data-size'));
      var on = !!(stateOn || sizeOn);
      button.classList.toggle('is-on', on);
      if (button.getAttribute('role') === 'radio') button.setAttribute('aria-checked', on ? 'true' : 'false');
    }
  }
  card.addEventListener('click', function (event) {
    var button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.id === 'orb-pause') { setPaused(!paused); return; }
    if (button.getAttribute('data-orb-state')) card.setAttribute('data-state', button.getAttribute('data-orb-state'));
    if (button.getAttribute('data-orb-size')) card.setAttribute('data-size', button.getAttribute('data-orb-size'));
    mark();
    kick();
  });
  mark();
`;

export function orbPreviewScript(picker: boolean): string {
  return `(function () {\n${ORB_ENGINE_JS}\n${HOST}${picker ? PICKER : ''}})();\n`;
}

export function orbCard(options: {
  label: string;
  agent: boolean;
  state?: string;
  size?: number;
  motionsource?: string;
}): { html: string; extraCss: string; script: string; snippet: false } {
  const size = options.size ?? 64;
  const aria = options.agent ? `Agent ${options.label}` : options.label;
  const text = options.agent
    ? `<span class="agent"><span class="muted">Agent </span><span class="action">${options.label}</span></span>`
    : `<span class="label">${options.label}</span>`;
  const attrs = options.motionsource
    ? ` data-motionsource="${options.motionsource}"`
    : ` data-state="${options.state ?? 'working'}" data-size="${size}"`;
  return {
    snippet: false,
    html: `<div class="${options.agent ? 'chip' : 'pill'}" id="orb-card"${attrs}>
  <canvas id="orb" width="${size}" height="${size}" aria-label="${aria}"></canvas>
  ${text}
</div>`,
    extraCss: ORB_PREVIEW_CSS,
    script: orbPreviewScript(false),
  };
}

export function orbPickerSource(): { html: string; extraCss: string; script: string; snippet: false } {
  return {
    snippet: false,
    html: `<div class="picker" id="orb-card" data-state="listening" data-size="64">
  <div class="stage-col">
    <canvas id="orb" width="64" height="64" aria-label="Listening"></canvas>
    <button type="button" id="orb-pause" aria-label="Pause">Pause</button>
    <div class="chips">
      <button type="button" role="radio" data-orb-size="64" aria-checked="true">64px</button>
      <button type="button" role="radio" data-orb-size="20" aria-checked="false">20px</button>
      <button type="button" disabled>32px</button>
    </div>
  </div>
  <div class="controls" id="orb-controls">
    <div class="field">State</div>
    <div class="chips">
      <button type="button" role="radio" data-orb-state="working" aria-checked="false">Working</button>
      <button type="button" role="radio" data-orb-state="searching" aria-checked="false">Searching</button>
      <button type="button" role="radio" data-orb-state="solving" aria-checked="false">Solving</button>
      <button type="button" role="radio" data-orb-state="listening" aria-checked="true">Listening</button>
      <button type="button" role="radio" data-orb-state="connecting" aria-checked="false">Connecting</button>
      <button type="button" role="radio" data-orb-state="composing" aria-checked="false">Composing</button>
      <button type="button" role="radio" data-orb-state="breathing" aria-checked="false">Breathing</button>
      <button type="button" disabled>Weaving</button>
      <button type="button" disabled>Shaping</button>
    </div>
  </div>
</div>`,
    extraCss: ORB_PREVIEW_CSS,
    script: orbPreviewScript(true),
  };
}
