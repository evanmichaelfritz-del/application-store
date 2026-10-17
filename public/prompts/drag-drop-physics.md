# AGENT_PROMPT — Drag & drop with physics

Independent recreate of the visible behaviour of the transitions.dev demo. The demo is credited by name only. This document does not describe that demo's source.

One board. The live web demo and Copy both mount `PhysicsDropCard` from `src/demos/drag-drop/card.web.tsx`. Copy is `public/parity/drag-drop-physics.js`, built by `scripts/build-parity.mjs` from `src/demos/drag-drop/mount.tsx`. At a 1280 desktop the board is the fixed size below; it does not reflow.

## Geometry

| Part | Value |
| --- | --- |
| Board | 213×192, transparent, position relative |
| Chip | 72×72, left 141, top 0, `object-fit: cover`, radius 12 |
| Shared shadow | `0 2px 2px rgba(0,0,0,0.50), 0 6px 8px rgba(0,0,0,0.22)` on the chip and on the filled zone |
| Zone | 104×104, left 0, top 88, radius 12, `box-sizing: border-box` |
| Zone border | 2px dashed `rgba(0,0,0,0.1)` while empty; transparent while the photo is showing |
| Zone background | `rgba(234,234,234,0.2)` while empty; `#f7f7f7` while the photo is showing |
| Filled shadow | the shared shadow above, while the photo is showing; `none` while empty |
| Drag-over | border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity 0.5, while the chip centre is inside the zone |
| Label | two centred lines, `Drag & drop` then `it here` |
| Label box | 11px / 15px, `#767676`, width 76, top 38, `left: 0; right: 0; margin: 0 auto` inside the zone |
| Label face | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Photo | `DROP_PHOTO`, JPEG data URI, 746×944, cover on the chip and, after a hit, on the zone at radius 12 |

Top 38 is from the zone's padding edge. The 2px border puts the text at 40 from the outer edge.

The shadow is a 2px contact edge plus a short mid layer. On the page grey it is gone by about 20px below the box. The label names Inter first and then system faces. Nothing downloads a font. There is no `@font-face` and no request to a font host.

## States

| State | How you get there | What you see |
| --- | --- | --- |
| `ready` | mount, a finished return, or the end of `back` | Chip at translate 0, rotation 0, scale 1, opacity 1. Cursor `grab` on the chip. Zone shows the dashed border and the label. No photo in the zone. |
| `held` | primary pointer down on the chip, only from `ready` | Chip follows the pointer 1:1. Scale eases to 1.05. Cursor `grabbing` on the chip only. Tilt eases toward a target from horizontal pointer velocity and holds when that velocity is zero. |
| `homing` | pointer up, and the chip centre is outside the zone | Translate, rotate, and scale ease to rest over 500ms. The rest values are applied in the pointerup frame. Pointer events on the chip are off. A new pointer down is ignored until the 500ms ends and the state is `ready`. |
| `sinking` | pointer up, and the chip centre is inside the zone | Chip fades out in place. Zone border and label hide. Zone photo fades in over the `#f7f7f7` plate. Zone scale eases to 0.97 and back. Puff plays behind the zone, unless reduced motion is on. |
| `clearing` | 1815ms after the hit | Photo fades out over 400ms, blur reaching 4px. Chip stays at opacity 0, already parked at rest. |
| `empty` | 2215ms after the hit | Zone is empty again: dashed border, label, no photo, no filled shadow. Chip stays at opacity 0. |
| `back` | 2265ms after the hit | Chip plays in from scale 0.9 and opacity 0. At 2515ms the state becomes `ready`. |

The chip centre is `left + x + 36`, `top + y + 36`, with left 141 and top 0. It is inside the zone when that point is within x 0…104 and y 88…192, edges included. Overlap of the boxes is not the test. `data-over` is `1` only while `held` and that test passes.

There is no throw and no momentum. Velocity never moves the chip after release. It only feeds tilt.

## Drag and tilt

- Position is `grabPose + (pointer - grabPoint)`, in CSS pixels, on every `pointermove`. The chip uses the `translate` property, so the follow is not on the same property as rotation or scale.
- Scale while held eases to 1.05 on `.ddp-lift` with the `scale` property. The transition is `scale 150ms cubic-bezier(0.2, 0.9, 0.3, 1)`, already armed in `ready`, so the change from 1 runs. That curve is about 1.037 at 35ms, about 1.043 at 52ms, and 1.05 at 150ms.
- Cursor `grabbing` is set on the chip while `held`. `document.body` is left alone.
- Tilt is degrees on `.ddp-tilt` via the `rotate` property, clamped to ±10 and rounded to 0.001°. `vx` is horizontal pixels per millisecond since the previous move.
- `TILT_GAIN` is `5.57 / (80/192)`. An 80px move across 12 frames of 16ms has target tilt -5.57°. The 112ms ease-out finishes during that gesture, so the rotation reads -5.57° at the end of it.
- A fast flick whose speed reaches the ±10° clamp, starting in the same frame as the lift, is partway through that ease when the scale is 1.030. At 25ms the ease-out toward -10° is about -3.4° and the lift scale is 1.030.
- A move with `dx === 0`, and any time the pointer is idle, leaves the last target where it is. Tilt does not decay.
- `.ddp-tilt` is memoized on tilt, scale, and the respawn flag. A steady target does not rewrite `rotate`, so the 112ms ease can finish and hold.
- Held motion is `translate` on `.ddp-chip`, `rotate` on `.ddp-tilt`, and `scale` on `.ddp-lift`. Each property eases on its own.

## Timing

| Piece | Duration | Easing | Notes |
| --- | --- | --- | --- |
| Lift | 150ms | `cubic-bezier(0.2, 0.9, 0.3, 1)` | Scale 1 → 1.05. About 1.037 at 35ms, about 1.043 at 52ms. |
| Tilt ease | 112ms | `ease-out` | Rotate toward the clamped target. Holds when the target does not change. |
| Miss return | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Translate, rotate, and scale. Rest is applied in the pointerup frame. |
| Return overshoot | peak at 57.3% (about 287ms) | the same curve | Output peaks at about 1.0978, which is ≈9.75% of release distance (7.8px on 80px). |
| Chip fade on a hit | 229ms | `ease-out` | Opacity 1 → 0 and blur 0 → 2px. About 0.33 opacity at 112ms. Gone at 229ms, then the chip parks at rest while opacity stays 0. |
| Zone squash | 700ms | `ease-out` on each segment | Scale 1 at 0%, 0.97 at 250ms (`35.714285714285715%`), 1 at 700ms. The timeline itself is linear. |
| Zone photo in | 380ms | `ease-in-out` | Opacity 0 → 1. The transition is armed before the hit. Radius 12, `object-fit: cover`, painted over the 104×104 outer box (offset by the 2px border). |
| Border and label | instant | none | Hidden while the photo is showing (`sinking` and `clearing`). Restored when the state becomes `empty`. |
| Puff | 260ms delay, then 1275ms | one `ease-out` | Not visible before the delay. Unmounts when the zone is empty. |
| Photo out | 1815ms → 2215ms | `cubic-bezier(0, 0.65, 0.25, 0.9)` | Opacity 1 → 0 and blur 0 → 4px over 400ms. At about 1.9s (85ms in) opacity is about 0.30 and blur is about 2.8px. |
| Chip respawn | 2265ms → 2515ms | `ease-out` | From scale 0.9 and opacity 0 to scale 1 and opacity 1 over 250ms, then `ready`. Inline opacity stays 0 and scale stays 0.9 until the animation moves them, so the first frame does not jump. |

On a miss, pointerup commits the `homing` class while the pose is still the release pose, forces layout, and then sets the rest pose before paint. That is what lets the 500ms curve start in the pointerup frame. Re-grabs are ignored for the whole return because the state is not `ready`. The chip also ignores pointer downs while `sinking`, `clearing`, `empty`, or `back`.

## Puff

A 100×100 layer centred on the zone: left `(104 - 100) / 2 = 2`, top `88 + 2 = 90`. It is a sibling behind the zone (`z-index: 0`, zone `z-index: 1`), so the squash does not scale it and the opaque filled zone covers the middle. The lobes outside the zone are the part you see. The photo is not greyed or darkened.

One animation, `ddp-puff 1275ms ease-out 260ms both`:

- 0%: opacity 0, `translateY(0px) scale(0.96)`
- 16%: opacity 0.9. Transform is not set on this keyframe, so rotate-free drift and scale keep one ease-out across the whole 1275ms.
- 100%: opacity 0, `translateY(10px) scale(1 + 60/104)` (about 1.577)

The delay is 260ms, so the puff is not visible until then. Opacity is 0.9 at 16% of the 1275ms run (464ms after the drop). With the delay, 600ms after the drop is 340ms into the ease-out, which is about 4px of drift. Transform order is translate then scale, and the matrix translation is the 10px itself. Transform origin is the centre.

The ring, before the filter:

- outer box 100×100
- stroke 50, colour `rgba(132,132,132,0.55)`
- centreline rect at inset 25, size 50×50
- centreline `rx` is `27 - 25 = 2`, so the outer corner reads as about 27

An SVG filter warps that stroke into uneven lobes:

- `feTurbulence` fractal noise, `baseFrequency` 0.035, 2 octaves, seed 11
- `feDisplacementMap` scale 30, R and G channels
- `feGaussianBlur` stdDeviation 0.35
- filter region `-80% -80%` size `260% 260%`, `sRGB`
- the SVG `overflow` is visible so the warped edge is not clipped to the 100 box

Reduced motion does not mount the puff.

## Reduced motion

The card follows both signals. `prefers-reduced-motion: reduce` is read with `matchMedia`, and `html[data-reduce-motion="1"]` is read with a mutation observer. The in-app Reduce Motion switch sets that attribute from the OS setting or the switch. Copy does not mount the switch, so Copy follows the OS query. Either signal removes transitions and animations (`transition: none` and `animation: none` on the chip, the tilt, the lift, the photo, the squash, the puff, the photo-out, and the respawn). State changes are snaps.

- A miss goes straight back to `ready` at rest.
- A hit shows the filled zone immediately (photo opacity 1, border and label hidden, plate `#f7f7f7`, shared shadow, no squash, no puff) and parks the chip at rest while it is invisible.
- The zone empties at 1815ms and the chip respawns at 2265ms, already at scale 1 and opacity 1.

## Gotchas

- The chip accepts a grab only in `ready`. The return ignores re-grabs. The hit sequence also ignores them until the respawn has finished.
- Do not spring the chip home and do not keep integrating velocity after pointer up. Do not wait a frame before applying the rest transform.
- Do not add hover or focus styles. The chip is not tabbable. The zone highlight is the drag-over state: it is on only while the pointer is down and the chip centre is inside the zone.
- The label must not request a font. No `fonts.gstatic.com`, no other CDN, no `@font-face` pointed at a network URL. The Inter-first system stack above is the face.
- The photo is a data URI. The board does not fetch an image.
- Live and Copy are the same component. Copy's document centers a 213px `#parity-root` on `#f9f9f9` and loads `/parity/drag-drop-physics.js` from the same origin. The transparent board sits on that same grey in the live frame.
- Native `src/demos/drag-drop/index.tsx` re-exports `DragDropDemo` from `src/demos/DragDrop.tsx`, the gesture-handler scene. That scene is not the web board and it is not Copy.

## Setup

`src/demos/drag-drop/photo.ts` exports `DROP_PHOTO`, a 746×944 CC0 crop of a rose by Jez Timms. The photograph is Unsplash photo ODANAGrc168, https://unsplash.com/photos/ODANAGrc168, also on Wikimedia Commons at https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg. The dedication is CC0 1.0 Universal, https://creativecommons.org/publicdomain/zero/1.0/. Any 746×944 image can replace `DROP_PHOTO`. The original demo uses a different 746×944 portrait.

Peer is React. `scripts/build-parity.mjs` bundles `mount.tsx` and prepends the React `LICENSE` verbatim in one `/*! */` header. `react-dom`'s `LICENSE` is the same text, so it is not repeated. The header is:

```
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
```

## Checklist

- [ ] Board is 213×192 and transparent. Chip is 72×72 at left 141, top 0, cover, radius 12, with the shared shadow. Zone is 104×104 at left 0, top 88, radius 12.
- [ ] Zone border is 2px dashed `rgba(0,0,0,0.1)` and the background is `rgba(234,234,234,0.2)`. The label is 11px / 15px `#767676`, width 76, top 38, in the Inter-first system stack.
- [ ] Drag-over, while the chip centre is inside the zone, uses border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, and label opacity 0.5.
- [ ] Pointer down eases scale to 1.05 over 150ms (about 1.037 at 35ms, about 1.043 at 52ms) and sets cursor `grabbing` on the chip only. The chip follows the pointer 1:1.
- [ ] Tilt stays within ±10°. An 80px drag over 12 frames of 16ms settles at about -5.57°. A flick at the clamp is about -3.4° when scale is 1.030. Idle tilt holds.
- [ ] A miss, tested by the chip centre, returns over 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (≈9.75% of release distance, 7.8px on 80px), starting in the pointerup frame, and ignores re-grabs. There is no throw.
- [ ] A hit fades the chip out in 229ms ease-out with up to 2px blur (about 0.33 at 112ms), eases the zone to 0.97 over 250ms and back over 450ms, and fades the cover photo in over 380ms ease-in-out while the border and label hide.
- [ ] The puff waits 260ms, then runs one 1275ms ease-out behind the zone. Opacity peaks at 0.9 at 16%. Drift is about 4px at 600ms from the drop. It ends at about 1.577 and +10px. The lobes are a light warped ring and do not darken the photo. Noise seed is 11 and `baseFrequency` is 0.035.
- [ ] The photo fades out from 1815ms to 2215ms with blur reaching 4px. At about 1.9s opacity is about 0.30 and blur is about 2.8px. The chip respawns at 2265ms from scale 0.9 and opacity 0, without a first-frame jump, and is fully visible at 2515ms.
- [ ] Reduced motion follows the OS setting and `html[data-reduce-motion="1"]`. It snaps the tweens, skips the puff, empties the zone at 1815ms, and respawns the chip at 2265ms.
- [ ] Copy and the live card are this component. Copy does not request a font or any other external host.
- [ ] The photo is the CC0 Jez Timms crop linked above, and a different 746×944 image can replace `DROP_PHOTO`. The original demo uses a different 746×944 portrait.

## Component

```tsx
import { memo, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { DROP_PHOTO } from './photo';

/**
 * Drag-and-drop board. Geometry is the 1280 desktop card.
 * The same component is what the copy bundle mounts.
 *
 * Timing below is fit to measured gestures and to frames read off the
 * moving card. The easing numbers are this file's own curves for those
 * samples. Nothing here is taken from another implementation's source.
 */

const BOARD_W = 213;
const BOARD_H = 192;
const CHIP = 72;
const ZONE = 104;
const CHIP_X = 141;
const CHIP_Y = 0;
const ZONE_X = 0;
const ZONE_Y = 88;
const BORDER = 2;
const RADIUS = 12;
const GRAB_SCALE = 1.05;
const LIFT_MS = 150;
/** About 1.037 at 35ms, about 1.043 at 52ms, 1.05 at 150ms. */
const LIFT_EASE = 'cubic-bezier(0.2, 0.9, 0.3, 1)';
const TILT_LIMIT = 10;
/**
 * 80px over 12 frames of 16ms is 80/192 px/ms and reads about -5.57°.
 * Gain is that angle divided by that speed. Leftward motion is negative.
 * The rotate layer then ease-outs toward the clamped target. 112ms reaches
 * about -3.4° at 25ms, the moment the lift scale is 1.030, when the target
 * is the clamp. dx === 0 leaves the target alone, so idle tilt holds.
 */
const TILT_GAIN = 5.57 / (80 / 192);
const TILT_EASE_MS = 112;
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 229;
const FADE_BLUR = 2;
const SQUASH = 0.97;
const SQUASH_DOWN_MS = 250;
const SQUASH_BACK_MS = 450;
const SQUASH_MS = SQUASH_DOWN_MS + SQUASH_BACK_MS;
const SQUASH_DIP = (SQUASH_DOWN_MS / SQUASH_MS) * 100;
const PHOTO_IN_MS = 380;
const PUFF_DELAY = 260;
const PUFF_MS = 1275;
const PUFF_START_SCALE = 0.96;
const PUFF_PEAK = 0.9;
const PUFF_PEAK_AT = 16;
const PHOTO_OUT_AT = 1815;
const PHOTO_OUT_MS = 400;
const PHOTO_OUT_BLUR = 4;
/** 85ms in (about 1.9s from the drop): opacity 0.30, blur 2.8px of the 4px end. */
const PHOTO_OUT_EASE = 'cubic-bezier(0, 0.65, 0.25, 0.9)';
const RESPAWN_AT = 2265;
const RESPAWN_MS = 250;
const RESPAWN_SCALE = 0.9;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT = 10;
const PUFF_SCALE = 1 + 60 / ZONE;
const PUFF_COLOR = 'rgba(132,132,132,0.55)';
const PUFF_NOISE = 0.035;
const PUFF_OCTAVES = 2;
const PUFF_SEED = 11;
const PUFF_DISPLACE = 30;
const PUFF_BLUR = 0.35;
const ZONE_BORDER = 'rgba(0,0,0,0.1)';
const ZONE_BG = 'rgba(234,234,234,0.2)';
const OVER_BORDER = 'rgba(0,0,0,0.28)';
const OVER_BG = 'rgba(234,234,234,0.55)';
const OVER_LABEL = 0.5;
const FILLED_BG = '#f7f7f7';
const LABEL_COLOR = '#767676';
const LABEL_FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LABEL_SIZE = 11;
const LABEL_LINE = 15;
const LABEL_WIDTH = 76;
/** 38px from the padding edge. The 2px border puts the text at 40px from the outer edge. */
const LABEL_TOP = 38;
/** 2px contact edge plus a short mid layer. The shade is gone by about 20px. */
const SHADOW = '0 2px 2px rgba(0,0,0,0.50), 0 6px 8px rgba(0,0,0,0.22)';

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'clearing' | 'empty' | 'back';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const SHEET = `
.ddp-ready .ddp-lift,
.ddp-held .ddp-lift { transition: scale ${LIFT_MS}ms ${LIFT_EASE}; }
.ddp-held .ddp-tilt { transition: rotate ${TILT_EASE_MS}ms ease-out; }
.ddp-homing .ddp-chip { transition: translate ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-homing .ddp-tilt { transition: rotate ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-homing .ddp-lift { transition: scale ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms linear both; }
@keyframes ddp-squash {
  0% { transform: scale(1); animation-timing-function: ease-out; }
  ${SQUASH_DIP}% { transform: scale(${SQUASH}); animation-timing-function: ease-out; }
  100% { transform: scale(1); }
}
.ddp-fade { animation: ddp-fade ${FADE_MS}ms ease-out both; }
@keyframes ddp-fade {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${FADE_BLUR}px); }
}
.ddp-photo-out { animation: ddp-photo-out ${PHOTO_OUT_MS}ms ${PHOTO_OUT_EASE} both; }
@keyframes ddp-photo-out {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${PHOTO_OUT_BLUR}px); }
}
.ddp-in { animation: ddp-in ${RESPAWN_MS}ms ease-out both; }
@keyframes ddp-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ddp-in-lift { animation: ddp-in-lift ${RESPAWN_MS}ms ease-out both; }
@keyframes ddp-in-lift {
  from { scale: ${RESPAWN_SCALE}; }
  to { scale: 1; }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation: ddp-puff ${PUFF_MS}ms ease-out ${PUFF_DELAY}ms both;
}
@keyframes ddp-puff {
  0% { opacity: 0; transform: translateY(0px) scale(${PUFF_START_SCALE}); }
  ${PUFF_PEAK_AT}% { opacity: ${PUFF_PEAK}; }
  100% { opacity: 0; transform: translateY(${PUFF_DRIFT}px) scale(${PUFF_SCALE}); }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff, .ddp-fade, .ddp-photo-out, .ddp-in, .ddp-in-lift { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-tilt, .ddp-lift, .ddp-photo { transition: none !important; }
}
html[data-reduce-motion="1"] .ddp-squash,
html[data-reduce-motion="1"] .ddp-puff,
html[data-reduce-motion="1"] .ddp-fade,
html[data-reduce-motion="1"] .ddp-photo-out,
html[data-reduce-motion="1"] .ddp-in,
html[data-reduce-motion="1"] .ddp-in-lift { animation: none !important; }
html[data-reduce-motion="1"] .ddp-puff { opacity: 0 !important; }
html[data-reduce-motion="1"] .ddp-chip,
html[data-reduce-motion="1"] .ddp-tilt,
html[data-reduce-motion="1"] .ddp-lift,
html[data-reduce-motion="1"] .ddp-photo { transition: none !important; }
`;

function installSheet() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ddp-sheet')) return;
  const style = document.createElement('style');
  style.id = 'ddp-sheet';
  style.textContent = SHEET;
  document.head.appendChild(style);
}

function clampTilt(vxPxPerMs: number): number {
  const raw = vxPxPerMs * TILT_GAIN;
  const clamped = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, raw));
  // Thousandths of a degree. A steady drag stays on one target so the ease can finish.
  return Math.round(clamped * 1000) / 1000;
}

function centreInsideZone(x: number, y: number): boolean {
  const cx = CHIP_X + x + CHIP / 2;
  const cy = CHIP_Y + y + CHIP / 2;
  return cx >= ZONE_X && cx <= ZONE_X + ZONE && cy >= ZONE_Y && cy <= ZONE_Y + ZONE;
}

function motionReducedNow(): boolean {
  if (typeof window === 'undefined') return false;
  const media =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced = typeof document !== 'undefined' && document.documentElement.dataset.reduceMotion === '1';
  return Boolean(media || forced);
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(motionReducedNow);

  useEffect(() => {
    const apply = () => setReduce(motionReducedNow());
    apply();
    const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    query?.addEventListener('change', apply);
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
    return () => {
      query?.removeEventListener('change', apply);
      observer.disconnect();
    };
  }, []);

  return reduce;
}

function Puff({ filterId }: { filterId: string }) {
  const inset = PUFF_STROKE / 2;
  const inner = PUFF_SIZE - PUFF_STROKE;
  const innerRadius = PUFF_RADIUS - inset;
  return (
    <div
      className="ddp-puff"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: ZONE_X + (ZONE - PUFF_SIZE) / 2,
        top: ZONE_Y + (ZONE - PUFF_SIZE) / 2,
        width: PUFF_SIZE,
        height: PUFF_SIZE,
        zIndex: 0,
      }}
    >
      <svg width={PUFF_SIZE} height={PUFF_SIZE} viewBox={`0 0 ${PUFF_SIZE} ${PUFF_SIZE}`} overflow="visible">
        <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={PUFF_NOISE} numOctaves={PUFF_OCTAVES} seed={PUFF_SEED} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={PUFF_DISPLACE} xChannelSelector="R" yChannelSelector="G" result="torn" />
          <feGaussianBlur in="torn" stdDeviation={PUFF_BLUR} />
        </filter>
        <rect
          x={inset}
          y={inset}
          width={inner}
          height={inner}
          rx={innerRadius}
          fill="none"
          stroke={PUFF_COLOR}
          strokeWidth={PUFF_STROKE}
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}

const ChipFace = memo(function ChipFace({ tilt, scale, respawning }: { tilt: number; scale: number; respawning: boolean }) {
  return (
    <div
      className="ddp-tilt"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: RADIUS,
        boxShadow: SHADOW,
        transformOrigin: 'center center',
        rotate: `${tilt}deg`,
      }}
    >
      <div
        className={respawning ? 'ddp-lift ddp-in-lift' : 'ddp-lift'}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: RADIUS,
          overflow: 'hidden',
          transformOrigin: 'center center',
          scale,
        }}
      >
        <img
          src={DROP_PHOTO}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
});

export function PhysicsDropCard() {
  installSheet();
  const reduce = usePrefersReducedMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const filterRaw = useId();
  const filterId = `ddp${filterRaw.replace(/[^A-Za-z0-9_-]/g, '')}`;

  const [phase, setPhase] = useState<DropPhase>('ready');
  const [pose, setPose] = useState<Pose>(REST);
  const [over, setOver] = useState(false);
  const phaseRef = useRef<DropPhase>('ready');
  const poseRef = useRef<Pose>(REST);
  const pointerRef = useRef<number | null>(null);
  const grabRef = useRef({ x: 0, y: 0, poseX: 0, poseY: 0 });
  const velRef = useRef({ lastX: 0, movedAt: 0, tilt: 0 });
  const timersRef = useRef<number[]>([]);
  const chipRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const armHomeRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  useLayoutEffect(() => {
    if (!armHomeRef.current || phase !== 'homing') return;
    armHomeRef.current = false;
    chipRef.current?.getBoundingClientRect();
    publish(REST);
  }, [phase]);

  function publish(next: Pose) {
    poseRef.current = next;
    setPose(next);
  }

  function setPhaseBoth(next: DropPhase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function later(ms: number, run: () => void) {
    const id = window.setTimeout(() => {
      if (!aliveRef.current) return;
      run();
    }, ms);
    timersRef.current.push(id);
  }

  function clearTimers() {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }

  function parkReady() {
    publish(REST);
    setOver(false);
    setPhaseBoth('ready');
  }

  function beginHome() {
    setOver(false);
    if (reduceRef.current) {
      parkReady();
      return;
    }
    armHomeRef.current = true;
    flushSync(() => {
      setPhaseBoth('homing');
    });
    later(RETURN_MS, () => {
      if (phaseRef.current !== 'homing') return;
      setPhaseBoth('ready');
    });
  }

  function beginDrop() {
    clearTimers();
    setOver(false);
    setPhaseBoth('sinking');
    if (reduceRef.current) {
      publish(REST);
      later(PHOTO_OUT_AT, () => {
        if (phaseRef.current !== 'sinking') return;
        setPhaseBoth('empty');
      });
      later(RESPAWN_AT, () => {
        if (phaseRef.current !== 'empty') return;
        parkReady();
      });
      return;
    }
    later(FADE_MS, () => {
      if (phaseRef.current !== 'sinking') return;
      publish(REST);
    });
    later(PHOTO_OUT_AT, () => {
      if (phaseRef.current !== 'sinking') return;
      setPhaseBoth('clearing');
    });
    later(PHOTO_OUT_AT + PHOTO_OUT_MS, () => {
      if (phaseRef.current !== 'clearing') return;
      setPhaseBoth('empty');
    });
    later(RESPAWN_AT, () => {
      if (phaseRef.current !== 'empty') return;
      setPhaseBoth('back');
      publish({ ...REST, scale: RESPAWN_SCALE });
      later(RESPAWN_MS, () => {
        if (phaseRef.current !== 'back') return;
        publish(REST);
        setPhaseBoth('ready');
      });
    });
  }

  function finishDrag() {
    pointerRef.current = null;
    if (centreInsideZone(poseRef.current.x, poseRef.current.y)) beginDrop();
    else beginHome();
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if (phaseRef.current !== 'ready') return;
    clearTimers();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = event.pointerId;
    grabRef.current = {
      x: event.clientX,
      y: event.clientY,
      poseX: poseRef.current.x,
      poseY: poseRef.current.y,
    };
    velRef.current = { lastX: event.clientX, movedAt: performance.now(), tilt: poseRef.current.tilt };
    setPhaseBoth('held');
    publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: poseRef.current.tilt, scale: GRAB_SCALE });
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    const grab = grabRef.current;
    const vel = velRef.current;
    const now = performance.now();
    const dt = Math.max(now - vel.movedAt, 1);
    const dx = event.clientX - vel.lastX;
    vel.lastX = event.clientX;
    vel.movedAt = now;
    let tilt = vel.tilt;
    if (dx !== 0) {
      tilt = clampTilt(dx / dt);
      vel.tilt = tilt;
    }
    const x = grab.poseX + (event.clientX - grab.x);
    const y = grab.poseY + (event.clientY - grab.y);
    setOver(centreInsideZone(x, y));
    publish({ x, y, tilt, scale: GRAB_SCALE });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  }

  const showingPhoto = phase === 'sinking' || phase === 'clearing';
  const fading = phase === 'sinking' && !reduce;
  const respawning = phase === 'back' && !reduce;

  let chipOpacity = 1;
  if (phase === 'clearing' || phase === 'empty') chipOpacity = 0;
  if (respawning) chipOpacity = 0;
  if (reduce && (phase === 'sinking' || phase === 'back')) chipOpacity = 0;

  const chipStyle: CSSProperties = {
    position: 'absolute',
    left: CHIP_X,
    top: CHIP_Y,
    width: CHIP,
    height: CHIP,
    borderRadius: RADIUS,
    zIndex: 2,
    touchAction: 'none',
    userSelect: 'none',
    cursor: phase === 'held' ? 'grabbing' : 'grab',
    pointerEvents: phase === 'ready' || phase === 'held' ? 'auto' : 'none',
    opacity: fading ? undefined : chipOpacity,
    translate: `${pose.x}px ${pose.y}px`,
    transformOrigin: 'center center',
  };

  const photoStyle: CSSProperties = {
    position: 'absolute',
    left: -BORDER,
    top: -BORDER,
    width: ZONE,
    height: ZONE,
    objectFit: 'cover',
    borderRadius: RADIUS,
    opacity: showingPhoto ? 1 : 0,
    transition: reduce || phase === 'clearing' ? 'none' : `opacity ${PHOTO_IN_MS}ms ease-in-out`,
    pointerEvents: 'none',
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} data-testid="drag-drop-physics">
      <div
        data-phase={phase}
        data-over={over ? '1' : '0'}
        className={`ddp-${phase}`}
        style={{ position: 'relative', width: BOARD_W, height: BOARD_H, background: 'transparent' }}
      >
        {showingPhoto && !reduce ? <Puff filterId={filterId} /> : null}
        <div
          className={phase === 'sinking' && !reduce ? 'ddp-squash' : undefined}
          style={{
            position: 'absolute',
            left: ZONE_X,
            top: ZONE_Y,
            width: ZONE,
            height: ZONE,
            boxSizing: 'border-box',
            borderRadius: RADIUS,
            border: `${BORDER}px dashed ${showingPhoto ? 'transparent' : over ? OVER_BORDER : ZONE_BORDER}`,
            background: showingPhoto ? FILLED_BG : over ? OVER_BG : ZONE_BG,
            boxShadow: showingPhoto ? SHADOW : 'none',
            zIndex: 1,
            transformOrigin: 'center center',
          }}
        >
          <img
            className={phase === 'clearing' && !reduce ? 'ddp-photo ddp-photo-out' : 'ddp-photo'}
            src={DROP_PHOTO}
            alt=""
            draggable={false}
            style={photoStyle}
          />
          <span
            style={{
              position: 'absolute',
              top: LABEL_TOP,
              left: 0,
              right: 0,
              width: LABEL_WIDTH,
              margin: '0 auto',
              opacity: showingPhoto ? 0 : over ? OVER_LABEL : 1,
              textAlign: 'center',
              fontFamily: LABEL_FONT,
              fontSize: LABEL_SIZE,
              lineHeight: `${LABEL_LINE}px`,
              color: LABEL_COLOR,
              pointerEvents: 'none',
            }}
          >
            Drag & drop
            <br />
            it here
          </span>
        </div>
        <div
          ref={chipRef}
          className={fading ? 'ddp-chip ddp-fade' : respawning ? 'ddp-chip ddp-in' : 'ddp-chip'}
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ChipFace tilt={pose.tilt} scale={pose.scale} respawning={respawning} />
        </div>
      </div>
    </div>
  );
}
```
