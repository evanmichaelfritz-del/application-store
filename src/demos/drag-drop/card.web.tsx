import { useEffect, useRef } from 'react';
import { DROP_PHOTO } from './photo';

/**
 * Independent recreate of the drag-and-drop specimen on the public
 * transitions.dev demo. Positions, timings, and the smoke ring follow
 * that demo as measured in a browser. A miss eases home.
 */

const FONT = 'Inter, Inter_400Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_FADE = 'cubic-bezier(0.34, 1.35, 0.64, 1)';
const SHADOW = '0 1px 2px 0 color(display-p3 0 0 0 / 0.15), 0 2px 6px 0 color(display-p3 0 0 0 / 0.10), 0 4px 20px 0 color(display-p3 0 0 0 / 0.15)';
const SHADOW_OFF = '0 1px 2px 0 rgba(0, 0, 0, 0), 0 2px 6px 0 rgba(0, 0, 0, 0), 0 4px 20px 0 rgba(0, 0, 0, 0)';

const LIFT = 1.05;
const TILT_MAX = 10;
const RETURN_MS = 500;
const HOLD_MS = 1800;
const EMPTY_MS = 400;
const RESPAWN_MS = 250;
const RING_DELAY = 250;
const RING_MS = 1275;

const CSS = `
.as-dd { position: relative; width: 213px; height: 192px; font-family: ${FONT}; }
.as-dd .chip {
  position: absolute; left: 141px; top: 0; width: 72px; height: 72px; border-radius: 12px;
  overflow: hidden; box-shadow: ${SHADOW}; cursor: grab; touch-action: none; user-select: none;
  z-index: 5; translate: var(--chip-x, 0px) var(--chip-y, 0px); rotate: var(--chip-tilt, 0deg); scale: var(--chip-lift, 1);
  transition: scale 200ms ${EASE_OUT}, rotate 150ms ease-out; will-change: translate, rotate, scale;
}
.as-dd .chip img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.as-dd .chip.is-dragging { cursor: grabbing; z-index: 30; }
.as-dd .chip.is-returning { transition: translate ${RETURN_MS}ms ${EASE_BACK}, rotate ${RETURN_MS}ms ${EASE_BACK}, scale ${RETURN_MS}ms ${EASE_BACK}; }
.as-dd .chip.is-fading { opacity: 0; filter: blur(2px); transition: opacity 450ms ${EASE_FADE}, filter 450ms ${EASE_FADE}; pointer-events: none; }
.as-dd .chip.is-respawning { animation: as-dd-respawn ${RESPAWN_MS}ms ${EASE_OUT}; }
@keyframes as-dd-respawn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.as-dd .zone {
  position: absolute; left: 0; top: 88px; width: 104px; height: 104px; box-sizing: border-box;
  border-radius: 12px; border: 2px dashed rgba(0, 0, 0, 0.1); background: rgba(234, 234, 234, 0.2);
  transition: border-color 150ms ease, background-color 150ms ease, box-shadow 400ms ease-in-out;
}
.as-dd .zone.is-over { border-color: rgba(0, 0, 0, 0.28); background: rgba(234, 234, 234, 0.55); }
.as-dd .label {
  position: absolute; left: 50%; top: 38px; transform: translateX(-50%); width: 76px;
  font-size: 11px; font-weight: 400; line-height: 15px; text-align: center; color: #767676;
  transition: opacity 150ms ease; pointer-events: none;
}
.as-dd .zone.is-over .label { opacity: 0.5; }
.as-dd .zone.is-filled { border-color: transparent; box-shadow: ${SHADOW}; }
.as-dd .zone.is-filled .label { opacity: 0; }
.as-dd .fill {
  position: absolute; inset: -2px; width: calc(100% + 4px); height: calc(100% + 4px);
  object-fit: cover; border-radius: 12px; display: block; opacity: 0; pointer-events: none;
  transition: opacity 400ms ease-in-out;
}
.as-dd .zone.is-filled .fill { opacity: 1; }
.as-dd .zone.is-landing { animation: as-dd-squash 250ms ${EASE_OUT} forwards, as-dd-release 450ms ${EASE_OUT} 250ms forwards; will-change: transform; }
@keyframes as-dd-squash { from { transform: scale(1); } to { transform: scale(0.97); } }
@keyframes as-dd-release { from { transform: scale(0.97); } to { transform: scale(1); } }
.as-dd .zone.is-emptying .fill { opacity: 0; filter: blur(4px); transition: opacity ${EMPTY_MS}ms ${EASE_OUT}, filter ${EMPTY_MS}ms ${EASE_OUT}; }
.as-dd .zone.is-emptying { border-color: rgba(0, 0, 0, 0.1); box-shadow: ${SHADOW_OFF}; transition: box-shadow ${EMPTY_MS}ms ${EASE_OUT}, border-color ${EMPTY_MS}ms ${EASE_OUT}; }
.as-dd .ring { position: absolute; inset: -40px; width: calc(100% + 80px); height: calc(100% + 80px); overflow: visible; pointer-events: none; }
.as-dd .puff {
  fill: none; stroke: rgba(122, 122, 122, 0.42); stroke-width: 16; opacity: 0;
  filter: blur(5px); transform-box: fill-box; transform-origin: center;
}
@keyframes as-dd-puff {
  0% { opacity: 0; transform: translateY(0) scale(0.96); }
  16% { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(10px) scale(1.45); }
}
.as-dd .zone.is-bursting .puff { animation: as-dd-puff ${RING_MS}ms ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  .as-dd .chip, .as-dd .chip.is-fading, .as-dd .fill { transition: none !important; }
  .as-dd .zone, .as-dd .zone.is-emptying, .as-dd .label { transition: none !important; }
  .as-dd .chip.is-respawning, .as-dd .zone.is-landing, .as-dd .zone.is-bursting .puff { animation: none !important; }
}
`;

function installCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('as-dd-css')) return;
  const style = document.createElement('style');
  style.id = 'as-dd-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function DragDropCard() {
  const chipRef = useRef<HTMLDivElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    installCss();
    const chip = chipRef.current;
    const zone = zoneRef.current;
    if (!chip || !zone) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dragging = false;
    let settling = false;
    let pointerId = -1;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let lastX = 0;
    let lastT = 0;
    let moved = false;
    let revertTimer = 0;
    let burstTimer = 0;
    let emptyTimer = 0;
    let respawnTimer = 0;
    let returnTimer = 0;

    const setVars = (x: number, y: number, tilt: number | null, lift: number | null) => {
      chip.style.setProperty('--chip-x', `${x.toFixed(1)}px`);
      chip.style.setProperty('--chip-y', `${y.toFixed(1)}px`);
      if (tilt !== null) chip.style.setProperty('--chip-tilt', `${tilt.toFixed(2)}deg`);
      if (lift !== null) chip.style.setProperty('--chip-lift', String(lift));
    };

    const overZone = () => {
      const c = chip.getBoundingClientRect();
      const z = zone.getBoundingClientRect();
      const cx = c.left + c.width / 2;
      const cy = c.top + c.height / 2;
      return cx >= z.left && cx <= z.right && cy >= z.top && cy <= z.bottom;
    };

    const land = () => {
      zone.classList.add('is-filled', 'is-landing');
      if (!reduced.matches) {
        burstTimer = window.setTimeout(() => {
          zone.classList.add('is-bursting');
        }, RING_DELAY);
      }
      window.clearTimeout(revertTimer);
      revertTimer = window.setTimeout(() => {
        zone.classList.add('is-emptying');
        emptyTimer = window.setTimeout(() => {
          zone.classList.remove('is-filled', 'is-emptying', 'is-bursting', 'is-landing');
          dx = 0;
          dy = 0;
          setVars(0, 0, 0, 1);
          chip.getBoundingClientRect();
          chip.classList.remove('is-fading');
          chip.classList.add('is-respawning');
          respawnTimer = window.setTimeout(() => {
            chip.classList.remove('is-respawning');
            settling = false;
          }, RESPAWN_MS + 50);
        }, EMPTY_MS + 50);
      }, HOLD_MS);
    };

    const onDown = (event: PointerEvent) => {
      if (dragging || settling) return;
      dragging = true;
      pointerId = event.pointerId;
      try {
        chip.setPointerCapture(pointerId);
      } catch {
        /* synthetic events have no active pointer */
      }
      startX = event.clientX - dx;
      startY = event.clientY - dy;
      lastX = event.clientX;
      lastT = performance.now();
      moved = false;
      chip.classList.remove('is-returning', 'is-respawning');
      chip.classList.add('is-dragging');
      chip.style.setProperty('--chip-lift', String(LIFT));
    };

    const onMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dx = event.clientX - startX;
      dy = event.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const vx = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastT = now;
      const tilt = Math.max(-TILT_MAX, Math.min(TILT_MAX, vx * 28));
      setVars(dx, dy, tilt, null);
      zone.classList.toggle('is-over', !zone.classList.contains('is-filled') && overZone());
    };

    const release = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      chip.classList.remove('is-dragging');
      const dropIn = zone.classList.contains('is-over');
      zone.classList.remove('is-over');
      if (dropIn) {
        settling = true;
        setVars(dx, dy, 0, null);
        chip.classList.add('is-fading');
        land();
      } else {
        settling = true;
        chip.classList.add('is-returning');
        dx = 0;
        dy = 0;
        setVars(0, 0, 0, 1);
        window.clearTimeout(returnTimer);
        returnTimer = window.setTimeout(() => {
          chip.classList.remove('is-returning');
          settling = false;
        }, RETURN_MS + 50);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!moved) return;
      moved = false;
      event.stopPropagation();
      event.preventDefault();
    };

    chip.addEventListener('pointerdown', onDown);
    chip.addEventListener('pointermove', onMove);
    chip.addEventListener('pointerup', release);
    chip.addEventListener('pointercancel', release);
    const wrap = chip.parentElement;
    wrap?.addEventListener('click', onClick, true);

    return () => {
      chip.removeEventListener('pointerdown', onDown);
      chip.removeEventListener('pointermove', onMove);
      chip.removeEventListener('pointerup', release);
      chip.removeEventListener('pointercancel', release);
      wrap?.removeEventListener('click', onClick, true);
      window.clearTimeout(revertTimer);
      window.clearTimeout(burstTimer);
      window.clearTimeout(emptyTimer);
      window.clearTimeout(respawnTimer);
      window.clearTimeout(returnTimer);
    };
  }, []);

  return (
    <div className="as-dd" data-testid="drag-drop-card">
      <div className="chip" ref={chipRef} data-testid="drag-drop-chip">
        <img src={DROP_PHOTO} alt="" draggable={false} />
      </div>
      <div className="zone" ref={zoneRef} data-testid="drag-drop-zone">
        <span className="label">
          Drag & drop
          <br />
          it here
        </span>
        <img className="fill" alt="" src={DROP_PHOTO} draggable={false} />
        <svg className="ring" viewBox="0 0 184 184" aria-hidden="true" focusable="false">
          <circle className="puff" cx="92" cy="92" r="46" />
        </svg>
      </div>
    </div>
  );
}
