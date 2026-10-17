# Drag & drop with physics

The specimen is the first paint of https://transitions.dev/transitions/drag-drop-with-physics/ on the transitions.dev index. The board is 213×192. The photo chip is 72×72 at left 141px, top 0. The zone is 104×104 at left 0, top 88px, border-box, radius 12, border 2px dashed rgba(0, 0, 0, 0.1), background rgba(234, 234, 234, 0.2). The label is two lines, "Drag & drop" and "it here", 11px weight 400, line-height 15px, color #767676, width 76px, top 38px, centered.

The page marks the transition Pro and disables remix. The specimen itself has no option rows, so there is nothing to label Pro-locked and no package control that is absent from the page.

The original page uses a different photo (`assets/proto-images/Screenshot 2026-05-17 at 19.53.15.png`, 746×944). This card uses a CC0 close-up instead, cropped to those pixel sizes and embedded as a data URI.

- warm rose, 746×944: Blood-red rose up close, Jez Timms, CC0, https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg
- licence https://creativecommons.org/publicdomain/zero/1.0/deed.en

## States

| Control | Source start | Notes |
| --- | --- | --- |
| chip | left 141, top 0, lift 1 | rest until pointerdown |
| zone | empty | dashed, label visible |
| lift | 1.05 while dragging | 200ms cubic-bezier(0.22, 1, 0.36, 1) |
| tilt | velocity × 28, clamp ±10deg | rotate 150ms ease-out |
| miss | translate back to 0, 0 | 500ms cubic-bezier(0.34, 1.56, 0.64, 1) |
| hit | chip fades, zone shows the photo | fade 450ms cubic-bezier(0.34, 1.35, 0.64, 1), blur 2px |
| squash | scale 1 to 0.97 to 1 | 250ms then 450ms, both cubic-bezier(0.22, 1, 0.36, 1) |
| hold | photo stays | 1800ms |
| empty | photo blurs out | 400ms cubic-bezier(0.22, 1, 0.36, 1), blur 4px |
| respawn | chip returns | 250ms cubic-bezier(0.22, 1, 0.36, 1), from scale 0.9 |

The hit test is the chip center inside the zone. Smoke is one ring: stroke width 50, duration 1275ms, travel `1 + 60 / zone width`, turbulence baseFrequency 0.046 0.046, displacement 30, blur 5. It starts 250ms after the land. `prefers-reduced-motion: reduce` drops the transitions and the smoke animation. The zone still fills and empties.

## Timing

Lift 200ms. Tilt 150ms. Return 500ms. Fade 450ms. Squash 250ms. Release 450ms delayed 250ms. Smoke delay 250ms, duration 1275ms. Hold 1800ms. Empty 400ms. Respawn 250ms. There is no idle loop.

## Gotchas

- Do not leave a black "Photo" tile or a blue "Image" chip. The chip and the filled zone are the same photo.
- A hit does not keep the photo in the zone. After 1800ms the zone empties and the chip respawns at its origin.
- The center of the chip has to be inside the zone. An edge overlap that misses the center springs home.
- The board is 213×192. Do not stretch the zone to the card.
- Switching nothing remounts the board. One instance owns the pointer.
- The native card still runs the older gesture-handler scene.

## Setup

Peer is React. transitions.dev does not publish this Pro transition as an open package, so there is no package LICENSE to attach. The Copy bundle is this card and it includes React, so the header is the React LICENSE verbatim. `react-dom` uses the same LICENSE, so it is not repeated.

Copy loads Inter at weight 400 from `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2` (the Google Fonts latin subset of Inter, a variable font, OFL). The file is not embedded. The face is declared in the Copy CSS as `@font-face` with `font-weight: 400`.

## Checklist

- [ ] The first paint is the 72×72 photo chip and the empty 104×104 zone with the two-line label.
- [ ] A miss returns to the origin in 500ms. A hit fills the zone, holds 1800ms, then empties and respawns the chip.
- [ ] The photo is the CC0 rose above, 746×944, not the page's original portrait.
- [ ] The component source below is this card.

## Component

MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```js
import { useEffect, useRef, useState } from 'react';
import { DROP_PHOTO } from './photo';

/**
 * transitions.dev "Drag & drop with physics", first paint.
 * The page specimen is a 72×72 photo chip over a 104×104 dashed zone.
 * The Pro recipe is not a public package, so this card matches the
 * published specimen rather than redistributing that recipe.
 */

const FONT = 'Inter, Inter_400Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_FADE = 'cubic-bezier(0.34, 1.35, 0.64, 1)';
const SHADOW = '0 1px 2px 0 color(display-p3 0 0 0 / 0.15), 0 2px 6px 0 color(display-p3 0 0 0 / 0.10), 0 4px 20px 0 color(display-p3 0 0 0 / 0.15)';
const SHADOW_OFF = '0 1px 2px 0 rgba(0, 0, 0, 0), 0 2px 6px 0 rgba(0, 0, 0, 0), 0 4px 20px 0 rgba(0, 0, 0, 0)';

const LIFT = 1.05;
const TILT_MAX = 10;
const RETURN_MS = 500;
const HOLD_MS = 1800;
const EMPTY_MS = 400;
const RESPAWN_MS = 250;
const BURST_DELAY = 250;
const PUFF_DIST = 30;
const PUFF_DUR = 1500;
const PUFF_COUNT = 1;
const PUFF_BASE = 50;
const PUFF_FALLOFF = 20;
const PUFF_STAGGER = 150;
const PUFF_GROW = 0.28;

const CSS = `
.as-dd { position: relative; width: 213px; height: 192px; font-family: ${FONT}; }
.as-dd .chip {
  position: absolute; left: 141px; top: 0; width: 72px; height: 72px; border-radius: 12px;
  overflow: hidden; box-shadow: ${SHADOW}; cursor: grab; touch-action: none; user-select: none;
  z-index: 5; translate: var(--dx, 0px) var(--dy, 0px); rotate: var(--tilt, 0deg); scale: var(--lift, 1);
  transition: scale 200ms ${EASE_OUT}, rotate 150ms ease-out; will-change: translate, rotate, scale;
}
.as-dd .chip img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.as-dd .chip.is-dragging { cursor: grabbing; z-index: 30; }
.as-dd .chip.is-returning { transition: translate ${RETURN_MS}ms ${EASE_BOUNCE}, rotate ${RETURN_MS}ms ${EASE_BOUNCE}, scale ${RETURN_MS}ms ${EASE_BOUNCE}; }
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
.as-dd .smoke { position: absolute; inset: -50px; width: calc(100% + 100px); height: calc(100% + 100px); overflow: visible; pointer-events: none; }
.as-dd .puff { fill: none; stroke: rgba(122, 122, 122, 0.42); opacity: 0; transform: translate(0, 0) scale(0.96); transform-box: fill-box; transform-origin: center; }
@keyframes as-dd-puff { 0% { opacity: 0; transform: translate(0, 0) scale(0.96); } 16% { opacity: 0.9; } 100% { opacity: 0; transform: translate(0, 10px) scale(var(--wscale, 1.5)); } }
.as-dd .zone.is-bursting .puff { animation-name: as-dd-puff; animation-duration: var(--wdur, ${PUFF_DUR}ms); animation-timing-function: ease-out; animation-delay: var(--wdelay, 0ms); animation-fill-mode: forwards; }
@media (prefers-reduced-motion: reduce) {
  .as-dd .chip, .as-dd .chip.is-fading, .as-dd .fill { transition: none !important; }
  .as-dd .chip.is-respawning, .as-dd .zone.is-landing, .as-dd .zone.is-bursting .puff { animation: none !important; }
}
`;

let smokeSeq = 0;

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
  const puffsRef = useRef<SVGGElement | null>(null);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const [filterId] = useState(() => {
    smokeSeq += 1;
    return `as-dd-smoke-${smokeSeq}`;
  });

  useEffect(() => {
    installCss();
    const chip = chipRef.current;
    const zone = zoneRef.current;
    const puffs = puffsRef.current;
    const turb = turbRef.current;
    const disp = dispRef.current;
    const blur = blurRef.current;
    if (!chip || !zone || !puffs || !turb || !disp || !blur) return;

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
      chip.style.setProperty('--dx', `${x.toFixed(1)}px`);
      chip.style.setProperty('--dy', `${y.toFixed(1)}px`);
      if (tilt !== null) chip.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
      if (lift !== null) chip.style.setProperty('--lift', String(lift));
    };

    const overZone = () => {
      const c = chip.getBoundingClientRect();
      const z = zone.getBoundingClientRect();
      const cx = c.left + c.width / 2;
      const cy = c.top + c.height / 2;
      return cx >= z.left && cx <= z.right && cy >= z.top && cy <= z.bottom;
    };

    const buildPuffs = () => {
      turb.setAttribute('baseFrequency', '0.046 0.046');
      disp.setAttribute('scale', '30');
      blur.setAttribute('stdDeviation', '5');
      const travel = 1 + (PUFF_DIST * 2) / zone.offsetWidth;
      puffs.replaceChildren();
      for (let wave = 0; wave < PUFF_COUNT; wave += 1) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const sw = Math.max(2, PUFF_BASE - wave * PUFF_FALLOFF);
        const hw = sw / 2;
        rect.setAttribute('class', 'puff');
        rect.setAttribute('x', String(52 + hw));
        rect.setAttribute('y', String(52 + hw));
        rect.setAttribute('width', String(Math.max(1, 100 - sw)));
        rect.setAttribute('height', String(Math.max(1, 100 - sw)));
        rect.setAttribute('rx', String(Math.max(2, 14 - hw)));
        rect.setAttribute('stroke-width', String(sw));
        rect.style.setProperty('--wdur', `${Math.round(PUFF_DUR * (0.85 + wave * PUFF_GROW))}ms`);
        rect.style.setProperty('--wdelay', `${Math.round(wave * PUFF_STAGGER)}ms`);
        rect.style.setProperty('--wscale', (travel + wave * 0.07).toFixed(3));
        puffs.appendChild(rect);
      }
    };

    const land = () => {
      zone.classList.add('is-filled', 'is-landing');
      if (!reduced.matches) {
        buildPuffs();
        burstTimer = window.setTimeout(() => {
          zone.classList.add('is-bursting');
        }, BURST_DELAY);
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
      chip.classList.remove('is-returning', 'is-dropping', 'is-respawning');
      chip.classList.add('is-dragging');
      chip.style.setProperty('--lift', String(LIFT));
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
        <svg className="smoke" viewBox="0 0 204 204" aria-hidden="true" focusable="false">
          <g ref={puffsRef} filter={`url(#${filterId})`} />
        </svg>
      </div>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id={filterId} x="-150%" y="-150%" width="400%" height="400%">
          <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.046 0.046" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="n" scale={30} xChannelSelector="R" yChannelSelector="G" result="warped" />
          <feGaussianBlur ref={blurRef} in="warped" stdDeviation={5} />
        </filter>
      </svg>
    </div>
  );
}
```
