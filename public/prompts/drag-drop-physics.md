# AGENT_PROMPT — Drag & drop with physics

Independent recreate of the visible behaviour of the transitions.dev demo. The demo is credited by name only. This document does not describe that demo's source.

One board. The live web demo and Copy both mount `PhysicsDropCard` from `src/demos/drag-drop/card.web.tsx`. Copy is `public/parity/drag-drop-physics.js`, built by `scripts/build-parity.mjs` from `src/demos/drag-drop/mount.tsx`. At a 1280 desktop the board is the fixed size below; it does not reflow.

## Geometry

| Part | Value |
| --- | --- |
| Board | 213×192, transparent, position relative |
| Chip | 72×72, left 141, top 0, `object-fit: cover`, radius 12 |
| Chip shadow | `0 1px 2px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.08), 0 18px 32px rgba(0,0,0,0.06)` |
| Zone | 104×104, left 0, top 88, radius 12, `box-sizing: border-box` |
| Zone border | 2px dashed `rgba(0,0,0,0.1)` while empty; transparent while the photo is showing |
| Zone background | `rgba(234,234,234,0.2)` while empty; `#f7f7f7` while the photo is showing |
| Filled shadow | `0 2px 4px rgba(0,0,0,0.06), 0 10px 22px rgba(0,0,0,0.08)` while the photo is showing |
| Drag-over | border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity 0.5, while the chip centre is inside the zone |
| Label | two centred lines, `Drag & drop` then `it here` |
| Label box | 11px / 14px, `#767676`, width 76, top 40, `left: 0; right: 0; margin: 0 auto` inside the zone |
| Label face | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Photo | `DROP_PHOTO`, JPEG data URI, 746×944, cover on the chip and, after a hit, on the zone at radius 12 |

The label names Inter first and then system faces. Nothing downloads a font. There is no `@font-face` and no request to a font host.

## States

| State | How you get there | What you see |
| --- | --- | --- |
| `ready` | mount, a finished return, or the end of `back` | Chip at translate 0,0, rotation 0, scale 1, opacity 1. Cursor `grab` on the chip. Zone shows the dashed border and the label. No photo in the zone. |
| `held` | primary pointer down on the chip, only from `ready` | Chip follows the pointer 1:1. Scale eases to 1.05. Cursor `grabbing` on the chip only. Tilt tracks horizontal pointer velocity and holds when that velocity is zero. |
| `homing` | pointer up, and the chip centre is outside the zone | Transform eases to rest over 500ms. Pointer events on the chip are off. A new pointer down is ignored until the 500ms ends and the state is `ready`. |
| `sinking` | pointer up, and the chip centre is inside the zone | Chip fades out in place. Zone border and label hide. Zone photo fades in over the `#f7f7f7` plate. Zone scale squashes and recovers. Puff plays behind the zone, unless reduced motion is on. |
| `clearing` | 1830ms after the hit | Photo fades out with a 1.5px blur. Chip stays at opacity 0, already parked at rest. |
| `empty` | 2064ms after the hit | Zone is empty again: dashed border, label, no photo, no filled shadow. Chip stays at opacity 0. |
| `back` | 2271ms after the hit | Chip plays in from scale 0.9 and opacity 0. At 2420ms the state becomes `ready`. |

The chip centre is `left + x + 36`, `top + y + 36`, with left 141 and top 0. It is inside the zone when that point is within x 0…104 and y 88…192, edges included. Overlap of the boxes is not the test. `data-over` is `1` only while `held` and that test passes.

There is no throw and no momentum. Velocity never moves the chip after release. It only feeds tilt.

## Drag and tilt

- Position is `grabPose + (pointer - grabPoint)`, in CSS pixels, on every `pointermove`.
- Scale while held eases to 1.05 on `.ddp-lift`. The transition is `transform 200ms cubic-bezier(0, 0.24, 0.43, 0.65)`, already armed in `ready`, so the change from 1 runs. That curve is about 1.017 at 35ms and 1.05 at 200ms.
- Cursor `grabbing` is set on the chip while `held`. `document.body` is left alone.
- Tilt is degrees on the chip, clamped to ±10. `vx` is horizontal pixels per millisecond since the previous move.
- `TILT_GAIN` is 28 degrees per (px/ms): an 80px move at a steady 0.2 px/ms (80px in 400ms) has target tilt -5.6°.
- Each move with nonzero `dx` eases toward `clamp(vx * 28, ±10)` by `1 - exp(-dt / TILT_EASE_MS)`. `TILT_EASE_MS` is `80 / -ln(0.26)`, about 59.39ms. One 80ms sample whose speed reaches the clamp therefore lands on -7.4°, because the blend is 0.74 and `0.74 * -10 = -7.4`.
- A drag at `8.5 / 28` px/ms (about 0.3036 px/ms) has target tilt -8.5°, so 400ms into that drag reads about -8.5°.
- A move with `dx === 0`, and any time the pointer is idle, leaves the last tilt where it is. Tilt does not decay.
- Translate and rotate are on `.ddp-chip`. Scale is on `.ddp-lift`. Origin of both is the centre, so tilt and scale do not move the hit-test centre.
- Held transform is `translate(x, y) rotate(tilt)` on the chip and `scale(scale)` on the lift.

## Timing

| Piece | Duration | Easing | Notes |
| --- | --- | --- | --- |
| Lift | 200ms | `cubic-bezier(0, 0.24, 0.43, 0.65)` | Scale 1 → 1.05. About 1.017 at 35ms. |
| Miss return | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Starts on the frame after release, from the release pose. Translate, tilt, and scale share this curve. |
| Return overshoot | peak at 57.3% (about 287ms) | the same curve | Output peaks at about 1.0978, which is ≈9.75% of release distance (7.8px on 80px). |
| Chip fade on a hit | 229ms | `ease-out` | Opacity 1 → 0 and blur 0 → 1.8px. About 0.33 opacity at 112ms. Gone at 229ms, then the chip parks at rest while opacity stays 0. |
| Zone squash | 520ms | `ease-in-out` between keys | Scale 1 at 0%, 0.97 at 42% (218.4ms), 1 at 520ms. |
| Zone photo in | 445ms | `ease-in-out` | Opacity 0 → 1. About 0.13 at 112ms. The transition is armed before the hit. Radius 12, `object-fit: cover`, painted over the 104×104 outer box (offset by the 2px border). |
| Border and label | instant | none | Hidden while the photo is showing (`sinking` and `clearing`). Restored when the state becomes `empty`. |
| Puff | 0 → 1460ms | see below | Mounts on the hit. Unmounts when the zone is empty. |
| Photo out | 1830ms → 2064ms | `ease-out` | Opacity 1 → 0 and blur 0 → 1.5px over 234ms. |
| Chip respawn | 2271ms → 2420ms | `ease-out` | From scale 0.9 and opacity 0 to scale 1 and opacity 1 over 149ms, then `ready`. |

The return transition is armed on the `homing` frame while the transform is still the release pose, then the rest transform is applied on the next frame. That is what lets the 500ms curve run. Re-grabs are ignored for the whole return because the state is not `ready`. The chip also ignores pointer downs while `sinking`, `clearing`, `empty`, or `back`.

## Puff

A 100×100 layer centred on the zone: left `(104 - 100) / 2 = 2`, top `88 + 2 = 90`. It is a sibling behind the zone (`z-index: 0`, zone `z-index: 1`), so the squash does not scale it and the opaque filled zone covers the middle. The halo outside the zone is the part you see. The photo is not greyed or darkened.

Opacity is linear between keys: 0 at 0ms, 0.9 at 460ms, 0 at 1460ms.

Scale eases out between keys: 1 at 0ms, 1.135 at 500ms, `1 + 60/104` (about 1.5769) at 1460ms. `translateY` stays 0 through 500ms, then eases to 10px at 1460ms. Transform origin is the centre. Order is translate then scale, so the 10px is not multiplied by the scale.

The ring, before the filter:

- outer box 100×100
- stroke 50, colour `rgba(148,148,148,0.55)`
- centreline rect at inset 25, size 50×50
- centreline `rx` is `27 - 25 = 2`, so the outer corner reads as about 27

The stroke is a soft rounded haze. An SVG filter roughens it slightly:

- `feTurbulence` fractal noise, `baseFrequency` 0.045, 2 octaves, seed 9
- `feDisplacementMap` scale 8, R and G channels
- `feGaussianBlur` stdDeviation 8
- filter region `-80% -80%` size `260% 260%`, `sRGB`
- the SVG `overflow` is visible so the blurred edge is not clipped to the 100 box

Reduced motion does not mount the puff.

## Reduced motion

`prefers-reduced-motion: reduce` removes transitions and animations (`transition: none` and `animation: none` on the chip, the lift, the photo, the squash, the puff, the photo-out, and the respawn). State changes are snaps.

- A miss goes straight back to `ready` at rest.
- A hit shows the filled zone immediately (photo opacity 1, border and label hidden, plate `#f7f7f7`, filled shadow, no squash, no puff) and parks the chip at rest while it is invisible.
- The zone empties at 1830ms and the chip respawns at 2271ms, already at scale 1 and opacity 1.

## Gotchas

- The chip accepts a grab only in `ready`. The return ignores re-grabs. The hit sequence also ignores them until the respawn has finished.
- Do not spring the chip home and do not keep integrating velocity after pointer up.
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

- [ ] Board is 213×192 and transparent. Chip is 72×72 at left 141, top 0, cover, radius 12, with the shadow above. Zone is 104×104 at left 0, top 88, radius 12.
- [ ] Zone border is 2px dashed `rgba(0,0,0,0.1)` and the background is `rgba(234,234,234,0.2)`. The label is 11px `#767676`, width 76, top 40, in the Inter-first system stack.
- [ ] Drag-over, while the chip centre is inside the zone, uses border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, and label opacity 0.5.
- [ ] Pointer down eases scale to 1.05 over 200ms (about 1.017 at 35ms) and sets cursor `grabbing` on the chip only. The chip follows the pointer 1:1.
- [ ] Tilt stays within ±10°. An 80px drag at 0.2 px/ms reads about -5.6°. An 80ms sample at the clamp reads -7.4°. A 0.3036 px/ms drag reads about -8.5° at 400ms. Idle tilt holds.
- [ ] A miss, tested by the chip centre, returns over 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (≈9.75% of release distance, 7.8px on 80px) and ignores re-grabs. There is no throw.
- [ ] A hit fades the chip out in 229ms ease-out with up to 1.8px blur (about 0.33 at 112ms), squashes the zone to 0.97 and back by 520ms, and fades the cover photo in over 445ms ease-in-out (about 0.13 at 112ms) while the border and label hide.
- [ ] The puff runs from the hit to 1460ms, behind the zone. Opacity peaks at 0.9 at 460ms. Scale is 1.135 at 500ms and about 1.577 at the end. It is a soft mid-grey rounded haze and does not darken the photo. Noise seed is 9.
- [ ] The photo fades out from 1830ms to 2064ms with a 1.5px blur. The chip respawns at 2271ms from scale 0.9 and opacity 0 and is fully visible at 2420ms.
- [ ] Reduced motion snaps the tweens, skips the puff, empties the zone at 1830ms, and respawns the chip at 2271ms.
- [ ] Copy and the live card are this component. Copy does not request a font or any other external host.
- [ ] The photo is the CC0 Jez Timms crop linked above, and a different 746×944 image can replace `DROP_PHOTO`. The original demo uses a different 746×944 portrait.

## Component

```js
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { DROP_PHOTO } from './photo';

/**
 * Drag-and-drop board. Geometry is the 1280 desktop card.
 * The same component is what the copy bundle mounts.
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
const LIFT_MS = 200;
/** 35ms into the 200ms lift reads about 1.017. */
const LIFT_EASE = 'cubic-bezier(0, 0.24, 0.43, 0.65)';
const TILT_LIMIT = 10;
/**
 * An 80px drag at a steady 0.2 px/ms (80px in 400ms) settles on -5.6°.
 * One 80ms sample at or past the clamp settles on -7.4°: the blend over
 * 80ms is 1 - e^(-80 / ease) = 0.74, and 0.74 * -10 = -7.4.
 * A typical drag at 8.5/28 px/ms reads -8.5° at 400ms.
 * Idle pointer movement does not change tilt.
 */
const DRAG_80_VX = -80 / 400;
const TILT_GAIN = -5.6 / DRAG_80_VX;
const TILT_EASE_MS = 80 / -Math.log(0.26);
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 229;
const FADE_BLUR = 1.8;
const SQUASH = 0.97;
const SQUASH_MS = 520;
const SQUASH_DIP = 42;
const PHOTO_IN_MS = 445;
const PUFF_MS = 1460;
const PUFF_PEAK_MS = 460;
const PUFF_SCALE_MS = 500;
const PUFF_MID_SCALE = 1.135;
const PHOTO_OUT_AT = 1830;
const PHOTO_OUT_MS = 234;
const PHOTO_OUT_BLUR = 1.5;
const RESPAWN_AT = 2271;
const RESPAWN_MS = 149;
const RESPAWN_SCALE = 0.9;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT = 10;
const PUFF_SCALE = 1 + 60 / ZONE;
const PUFF_COLOR = 'rgba(148,148,148,0.55)';
const PUFF_NOISE = 0.045;
const PUFF_OCTAVES = 2;
const PUFF_SEED = 9;
const PUFF_DISPLACE = 8;
const PUFF_BLUR = 8;
const ZONE_BORDER = 'rgba(0,0,0,0.1)';
const ZONE_BG = 'rgba(234,234,234,0.2)';
const OVER_BORDER = 'rgba(0,0,0,0.28)';
const OVER_BG = 'rgba(234,234,234,0.55)';
const OVER_LABEL = 0.5;
const FILLED_BG = '#f7f7f7';
const LABEL_COLOR = '#767676';
const LABEL_FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LABEL_SIZE = 11;
const LABEL_LINE = 14;
const LABEL_WIDTH = 76;
const LABEL_TOP = 40;
const CHIP_SHADOW = '0 1px 2px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.08), 0 18px 32px rgba(0,0,0,0.06)';
const ZONE_SHADOW = '0 2px 4px rgba(0,0,0,0.06), 0 10px 22px rgba(0,0,0,0.08)';

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'clearing' | 'empty' | 'back';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const PEAK_AT = (PUFF_PEAK_MS / PUFF_MS) * 100;
const SCALE_AT = (PUFF_SCALE_MS / PUFF_MS) * 100;

const SHEET = `
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms ease-in-out both; }
@keyframes ddp-squash {
  0% { transform: scale(1); }
  ${SQUASH_DIP}% { transform: scale(${SQUASH}); }
  100% { transform: scale(1); }
}
.ddp-fade { animation: ddp-fade ${FADE_MS}ms ease-out both; }
@keyframes ddp-fade {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${FADE_BLUR}px); }
}
.ddp-photo-out { animation: ddp-photo-out ${PHOTO_OUT_MS}ms ease-out both; }
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
  from { transform: scale(${RESPAWN_SCALE}); }
  to { transform: scale(1); }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation:
    ddp-puff-fade ${PUFF_MS}ms linear both,
    ddp-puff-grow ${PUFF_MS}ms ease-out both;
}
@keyframes ddp-puff-fade {
  0% { opacity: 0; }
  ${PEAK_AT}% { opacity: 0.9; }
  100% { opacity: 0; }
}
@keyframes ddp-puff-grow {
  0% { transform: translateY(0px) scale(1); }
  ${SCALE_AT}% { transform: translateY(0px) scale(${PUFF_MID_SCALE}); }
  100% { transform: translateY(${PUFF_DRIFT}px) scale(${PUFF_SCALE}); }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff, .ddp-fade, .ddp-photo-out, .ddp-in, .ddp-in-lift { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-lift, .ddp-photo { transition: none !important; }
}
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
  if (raw > TILT_LIMIT) return TILT_LIMIT;
  if (raw < -TILT_LIMIT) return -TILT_LIMIT;
  return raw;
}

function centreInsideZone(x: number, y: number): boolean {
  const cx = CHIP_X + x + CHIP / 2;
  const cy = CHIP_Y + y + CHIP / 2;
  return cx >= ZONE_X && cx <= ZONE_X + ZONE && cy >= ZONE_Y && cy <= ZONE_Y + ZONE;
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduce(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
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
  const homeFrameRef = useRef(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
      if (homeFrameRef.current) cancelAnimationFrame(homeFrameRef.current);
    };
  }, []);

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
    if (homeFrameRef.current) cancelAnimationFrame(homeFrameRef.current);
    homeFrameRef.current = 0;
  }

  function parkReady() {
    publish(REST);
    setOver(false);
    setPhaseBoth('ready');
  }

  function beginHome() {
    setOver(false);
    setPhaseBoth('homing');
    if (reduceRef.current) {
      parkReady();
      return;
    }
    homeFrameRef.current = requestAnimationFrame(() => {
      homeFrameRef.current = 0;
      if (!aliveRef.current || phaseRef.current !== 'homing') return;
      publish(REST);
      later(RETURN_MS, () => {
        if (phaseRef.current !== 'homing') return;
        setPhaseBoth('ready');
      });
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
      const target = clampTilt(dx / dt);
      tilt = vel.tilt + (target - vel.tilt) * (1 - Math.exp(-dt / TILT_EASE_MS));
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
  const homing = phase === 'homing' && !reduce;
  const fading = phase === 'sinking' && !reduce;
  const respawning = phase === 'back' && !reduce;

  let chipOpacity = 1;
  if (phase === 'clearing' || phase === 'empty') chipOpacity = 0;
  if (reduce && (phase === 'sinking' || phase === 'back')) chipOpacity = 0;

  let chipTransition = 'none';
  if (homing) chipTransition = `transform ${RETURN_MS}ms ${RETURN_EASE}`;

  let liftTransition = `transform ${LIFT_MS}ms ${LIFT_EASE}`;
  if (reduce || phase === 'back' || phase === 'clearing' || phase === 'empty' || (phase === 'sinking' && pose.scale === 1)) {
    liftTransition = 'none';
  } else if (homing) liftTransition = `transform ${RETURN_MS}ms ${RETURN_EASE}`;

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
    opacity: fading || respawning ? undefined : chipOpacity,
    boxShadow: CHIP_SHADOW,
    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.tilt}deg)`,
    transformOrigin: 'center center',
    transition: chipTransition,
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
            boxShadow: showingPhoto ? ZONE_SHADOW : 'none',
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
          className={fading ? 'ddp-chip ddp-fade' : respawning ? 'ddp-chip ddp-in' : 'ddp-chip'}
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className={respawning ? 'ddp-lift ddp-in-lift' : 'ddp-lift'}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: RADIUS,
              overflow: 'hidden',
              transform: `scale(${pose.scale})`,
              transformOrigin: 'center center',
              transition: liftTransition,
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
      </div>
    </div>
  );
}
```
