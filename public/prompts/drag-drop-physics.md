# AGENT_PROMPT — Drag & drop with physics

Independent recreate of the visible behaviour of the transitions.dev demo. The demo is credited by name only. This document does not describe that demo's source.

One board. The live web demo and Copy both mount `PhysicsDropCard` from `src/demos/drag-drop/card.web.tsx`. Copy is `public/parity/drag-drop-physics.js`, built by `scripts/build-parity.mjs` from `src/demos/drag-drop/mount.tsx`. At a 1280 desktop the board is the fixed size below; it does not reflow.

## Geometry

| Part | Value |
| --- | --- |
| Board | 213×192, transparent, position relative |
| Chip | 72×72, left 141, top 0, `object-fit: cover`, radius 18 (chip side / 4) |
| Zone | 104×104, left 0, top 88, `box-sizing: border-box` |
| Zone border | 2px dashed `rgba(0,0,0,0.1)` while empty; transparent while filled |
| Zone background | `rgba(234,234,234,0.2)` |
| Label | two centred lines, `Drag & drop` then `it here` |
| Label type | 12px / 15px, `rgba(0,0,0,0.45)`, `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Photo | `DROP_PHOTO`, JPEG data URI, 746×944, cover on the chip and, after a hit, on the zone |

12px is the label size that keeps both lines inside the zone's 100px content box (104 minus the 2px border on each side). The spec calls the label small grey text and does not give a pixel size or a grey hex. Radius 18 is the chip side divided by 4; the spec says rounded and does not give a radius.

## States

| State | How you get there | What you see |
| --- | --- | --- |
| `ready` | mount, a finished return, or the 2265ms respawn | Chip at translate 0,0, rotation 0, scale 1, opacity 1. Cursor `grab`. Zone shows the dashed border and the label. No photo in the zone. |
| `held` | primary pointer down on the chip, only from `ready` | Chip follows the pointer 1:1. Scale becomes 1.05 on the down event, with no separate scale tween. Cursor `grabbing` on the chip and on `document.body` until release. Tilt tracks horizontal pointer velocity. |
| `homing` | pointer up, and the chip centre is outside the zone | Transform eases to rest over 500ms. Pointer events on the chip are off. A new pointer down is ignored until the 500ms ends and the state is `ready`. |
| `sinking` | pointer up, and the chip centre is inside the zone | Chip fades out in place. Zone border and label hide. Zone photo fades in. Zone scale squashes and recovers. Puff plays, unless reduced motion is on. |
| `empty` | 1815ms after the hit | Zone is empty again: dashed border, label, no photo. Chip stays at opacity 0, already parked at rest. |

The chip centre is `left + x + 36`, `top + y + 36`, with left 141 and top 0. It is inside the zone when that point is within x 0…104 and y 88…192, edges included. Overlap of the boxes is not the test.

There is no throw and no momentum. Velocity never moves the chip after release. It only feeds tilt.

## Drag and tilt

- Position is `grabPose + (pointer - grabPoint)`, in CSS pixels, on every `pointermove`.
- Scale while held is 1.05.
- Tilt is degrees, clamped to ±10, smoothed toward `vx * TILT_GAIN`.
- `vx` is horizontal pixels per millisecond.
- A typical drag is the 125px gap from the chip centre (177) to the zone centre (52), covered in 400ms, so `vx = -125 / 400 = -0.3125` px/ms.
- That speed maps to -5.6°, so `TILT_GAIN = -5.6 / -0.3125 = 17.92` degrees per (px/ms).
- Smoothing on each move is `tilt += (target - tilt) * (1 - exp(-dt / 48))`, with `dt` in ms.
- If the pointer has not moved for 40ms, a frame loop eases tilt back toward 0 with the same 48ms constant.
- Transform origin is the chip centre, so tilt and scale do not move the hit-test centre.
- `transform` while held and while fading is `translate(x, y) rotate(tilt) scale(scale)`.

## Timing

| Piece | Duration | Easing | Notes |
| --- | --- | --- | --- |
| Miss return | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Starts on the frame after release, from the release pose. Translate, tilt, and scale share this transition. |
| Return overshoot | peak at 57.3% (about 287ms) | the same curve | Output peaks at about 1.098, which is about 10% of the release distance. |
| Chip fade on a hit | 230ms | linear | Opacity 1 → 0. The chip stays at the release pose until the fade ends, then its transform snaps to rest while opacity is 0. |
| Zone squash | 610ms | linear keyframes | Scale 1 at 0%, 0.97 at `230/610` (37.7049%, the chip-fade time), 1 at 100%. |
| Zone photo | 395ms | linear | Opacity 0 → 1, `object-fit: cover`, painted over the 104×104 outer box (offset by the 2px border). |
| Border and label | instant | none | Hidden on the hit frame. Restored on the empty frame. |
| Puff visible | 280ms → 1460ms | linear | Delay 280ms, duration 1180ms. |
| Zone empties | 1815ms after the hit | snap | State `empty`. |
| Chip respawns | 2265ms after the hit | snap | State `ready`, rest pose, opacity 1. No fade-in. |

The return transition is armed on the `homing` frame while the transform is still the release pose, then the rest transform is applied on the next frame. That is what lets the 500ms curve run. Re-grabs are ignored for the whole return because the state is not `ready`. The chip also ignores pointer downs while `sinking` or `empty`, so the drop timeline cannot be restarted until the respawn.

## Puff

A 100×100 layer centred on the zone: left `(104 - 100) / 2 = 2`, top `88 + 2 = 90`. It is not inside the zone, so the squash does not scale it.

End scale is `1 + 60 / 104` (about 1.576923). End drift is `translateY(10px)`. Opacity goes from 1 to 0 over the 1180ms run. Transform origin is the centre. Order is translate then scale, so the 10px is not multiplied by the scale.

The ring, before the filter:

- outer box 100×100
- stroke 50, colour `rgba(122,122,122,0.4)`
- centreline rect at inset 25, size 50×50
- centreline `rx` is `27 - 25 = 2`, so the outer corner reads as about 27

The stroke is torn into wisps with an SVG filter. These numbers are the wisp recipe, not measurements of the demo:

- `feTurbulence` fractal noise, `baseFrequency` 0.08, 3 octaves, seed 4
- `feDisplacementMap` scale 24, R and G channels
- `feGaussianBlur` stdDeviation 1.8
- filter region `-80% -80%` size `260% 260%`, `sRGB`
- the SVG `overflow` is visible so the torn edge is not clipped to the 100 box

The puff mounts when the hit starts and unmounts when the zone empties. Reduced motion does not mount it.

## Reduced motion

`prefers-reduced-motion: reduce` removes transitions and animations (`transition: none` and `animation: none` on the chip, the photo, the squash, and the puff). State changes are snaps.

- A miss goes straight back to `ready` at rest.
- A hit shows the filled zone immediately (photo opacity 1, border and label hidden, no squash, no puff) and parks the chip at rest while it is invisible.
- The zone still empties at 1815ms and the chip still respawns at 2265ms, so the drop stays usable.

## Gotchas

- The chip accepts a grab only in `ready`. The return ignores re-grabs. The hit sequence also ignores them until the respawn.
- Do not spring the chip home and do not keep integrating velocity after pointer up.
- Do not add hover or focus styles. The chip is not tabbable.
- The label must not request a font. No `fonts.gstatic.com`, no other CDN, no `@font-face` pointed at a network URL. The system stack above is the face.
- The photo is a data URI. The board does not fetch an image.
- Live and Copy are the same component. Copy's document centers a 213px `#parity-root` on `#f9f9f9` and loads `/parity/drag-drop-physics.js` from the same origin. The transparent board sits on that same grey in the live frame.
- The native file is a static stand-in. It is not the web demo and it is not Copy.

## Setup

`src/demos/drag-drop/photo.ts` exports `DROP_PHOTO`, a CC0 JPEG (Jez Timms, Unsplash ODANAGrc168) as a data URI. Any 746×944 image can replace it. The original demo uses a different portrait.

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

- [ ] Board is 213×192 and transparent. Chip is 72×72 at left 141, top 0, cover, radius 18. Zone is 104×104 at left 0, top 88.
- [ ] Zone border is 2px dashed `rgba(0,0,0,0.1)` and the background is `rgba(234,234,234,0.2)`. The label is the two lines above, in the system font stack.
- [ ] Pointer down sets scale 1.05 and cursor `grabbing`. The chip follows the pointer 1:1. Tilt stays within ±10° and is about -5.6° for a 125px leftward drag over 400ms.
- [ ] A miss, tested by the chip centre, returns over 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` and ignores re-grabs. There is no throw.
- [ ] A hit fades the chip out in 230ms, squashes the zone to 0.97 and back by 610ms, and fades the cover photo in over 395ms while the border and label hide.
- [ ] The puff runs from 280ms to 1460ms, grows to `1 + 60/104`, drifts 10px down, and fades out. It is a 100×100 rounded stroke torn by the noise filter above.
- [ ] The zone empties at 1815ms. The chip respawns at rest at 2265ms.
- [ ] Reduced motion snaps the tweens, skips the puff, and still empties at 1815ms and respawns at 2265ms.
- [ ] Copy and the live card are this component. Copy does not request a font or any other external host.
- [ ] The photo is the CC0 Jez Timms JPEG, and a different 746×944 image can replace `DROP_PHOTO`.

## Component

```tsx
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { DROP_PHOTO } from './photo';

/**
 * Independent recreate of the visible behaviour of the transitions.dev
 * drag-and-drop demo. Geometry is the 1280 desktop measurement.
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
/** Rounded tile. The spec gives no radius; a quarter of the chip side stays clearly rounded. */
const CHIP_RADIUS = CHIP / 4;
const GRAB_SCALE = 1.05;
const TILT_LIMIT = 10;
/**
 * A typical drag covers the horizontal gap from the chip centre to the zone
 * centre in 400ms, moving left. That speed maps to -5.6°.
 */
const TYPICAL_TILT = -5.6;
const TYPICAL_DRAG_MS = 400;
const TYPICAL_VX = -(CHIP_X + CHIP / 2 - (ZONE_X + ZONE / 2)) / TYPICAL_DRAG_MS;
const TILT_GAIN = TYPICAL_TILT / TYPICAL_VX;
/** Own smoothing. Tilt eases toward the latest horizontal velocity. */
const TILT_SMOOTH_MS = 48;
const TILT_IDLE_MS = 40;
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 230;
const SQUASH = 0.97;
const SQUASH_MS = 610;
const PHOTO_MS = 395;
const PUFF_START = 280;
const PUFF_END = 1460;
const PUFF_MS = PUFF_END - PUFF_START;
const EMPTY_AT = 1815;
const RESPAWN_AT = 2265;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT = 10;
const PUFF_SCALE = 1 + 60 / ZONE;
const PUFF_COLOR = 'rgba(122,122,122,0.4)';
/** Own wisp recipe: noise tears the thick stroke, then a small blur. */
const PUFF_NOISE = 0.08;
const PUFF_OCTAVES = 3;
const PUFF_SEED = 4;
const PUFF_DISPLACE = 24;
const PUFF_BLUR = 1.8;
const ZONE_BORDER = 'rgba(0,0,0,0.1)';
const ZONE_BG = 'rgba(234,234,234,0.2)';
const LABEL_COLOR = 'rgba(0,0,0,0.45)';
const LABEL_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LABEL_SIZE = 12;
const LABEL_LINE = 15;

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'empty';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const SQUASH_AT = (FADE_MS / SQUASH_MS) * 100;

const SHEET = `
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms linear both; }
@keyframes ddp-squash {
  0% { transform: scale(1); }
  ${SQUASH_AT}% { transform: scale(${SQUASH}); }
  100% { transform: scale(1); }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation: ddp-puff ${PUFF_MS}ms linear ${PUFF_START}ms forwards;
}
@keyframes ddp-puff {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(${PUFF_DRIFT}px) scale(${PUFF_SCALE}); }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-photo { transition: none !important; }
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
        zIndex: 2,
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
  const phaseRef = useRef<DropPhase>('ready');
  const poseRef = useRef<Pose>(REST);
  const pointerRef = useRef<number | null>(null);
  const grabRef = useRef({ x: 0, y: 0, poseX: 0, poseY: 0 });
  const velRef = useRef({ vx: 0, lastX: 0, movedAt: 0, tilt: 0 });
  const timersRef = useRef<number[]>([]);
  const tiltLoopRef = useRef(0);
  const homeFrameRef = useRef(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
      if (tiltLoopRef.current) cancelAnimationFrame(tiltLoopRef.current);
      if (homeFrameRef.current) cancelAnimationFrame(homeFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'held') return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = 'grabbing';
    return () => {
      document.body.style.cursor = previous;
    };
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

  function stopTilt() {
    if (!tiltLoopRef.current) return;
    cancelAnimationFrame(tiltLoopRef.current);
    tiltLoopRef.current = 0;
  }

  function tiltFrame(now: number) {
    if (!aliveRef.current || phaseRef.current !== 'held') return;
    const vel = velRef.current;
    const idleFor = now - vel.movedAt;
    if (idleFor > TILT_IDLE_MS) {
      const blend = 1 - Math.exp(-idleFor / TILT_SMOOTH_MS);
      const nextTilt = vel.tilt + (0 - vel.tilt) * blend;
      vel.tilt = nextTilt;
      if (Math.abs(poseRef.current.tilt - nextTilt) > 0.05) {
        publish({ ...poseRef.current, tilt: nextTilt });
      }
    }
    tiltLoopRef.current = requestAnimationFrame(tiltFrame);
  }

  function parkReady() {
    publish(REST);
    setPhaseBoth('ready');
  }

  function beginHome() {
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
    setPhaseBoth('sinking');
    later(reduceRef.current ? 0 : FADE_MS, () => {
      if (phaseRef.current !== 'sinking') return;
      publish(REST);
    });
    later(EMPTY_AT, () => {
      if (phaseRef.current !== 'sinking') return;
      setPhaseBoth('empty');
    });
    later(RESPAWN_AT, () => {
      if (phaseRef.current !== 'empty') return;
      parkReady();
    });
  }

  function finishDrag() {
    stopTilt();
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
    velRef.current = { vx: 0, lastX: event.clientX, movedAt: performance.now(), tilt: 0 };
    setPhaseBoth('held');
    publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: 0, scale: GRAB_SCALE });
    stopTilt();
    tiltLoopRef.current = requestAnimationFrame(tiltFrame);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    const grab = grabRef.current;
    const vel = velRef.current;
    const now = performance.now();
    const dt = Math.max(now - vel.movedAt, 1);
    vel.vx = (event.clientX - vel.lastX) / dt;
    vel.lastX = event.clientX;
    vel.movedAt = now;
    const blend = 1 - Math.exp(-dt / TILT_SMOOTH_MS);
    vel.tilt += (clampTilt(vel.vx) - vel.tilt) * blend;
    publish({
      x: grab.poseX + (event.clientX - grab.x),
      y: grab.poseY + (event.clientY - grab.y),
      tilt: vel.tilt,
      scale: GRAB_SCALE,
    });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  }

  const filled = phase === 'sinking';
  const hidden = phase === 'sinking' || phase === 'empty';
  const homing = phase === 'homing' && !reduce;
  const fading = phase === 'sinking' && !reduce;

  const chipStyle: CSSProperties = {
    position: 'absolute',
    left: CHIP_X,
    top: CHIP_Y,
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP_RADIUS,
    overflow: 'hidden',
    zIndex: 3,
    touchAction: 'none',
    userSelect: 'none',
    cursor: phase === 'held' ? 'grabbing' : 'grab',
    pointerEvents: phase === 'ready' || phase === 'held' ? 'auto' : 'none',
    opacity: hidden ? 0 : 1,
    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.tilt}deg) scale(${pose.scale})`,
    transformOrigin: 'center center',
    transition: homing ? `transform ${RETURN_MS}ms ${RETURN_EASE}` : fading ? `opacity ${FADE_MS}ms linear` : 'none',
  };

  const photoStyle: CSSProperties = {
    position: 'absolute',
    left: -BORDER,
    top: -BORDER,
    width: ZONE,
    height: ZONE,
    objectFit: 'cover',
    opacity: filled ? 1 : 0,
    transition: filled && !reduce ? `opacity ${PHOTO_MS}ms linear` : 'none',
    pointerEvents: 'none',
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} data-testid="drag-drop-physics">
      <div
        data-phase={phase}
        style={{ position: 'relative', width: BOARD_W, height: BOARD_H, background: 'transparent' }}
      >
        <div
          className={filled && !reduce ? 'ddp-squash' : undefined}
          style={{
            position: 'absolute',
            left: ZONE_X,
            top: ZONE_Y,
            width: ZONE,
            height: ZONE,
            boxSizing: 'border-box',
            border: `${BORDER}px dashed ${filled ? 'transparent' : ZONE_BORDER}`,
            background: ZONE_BG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            transformOrigin: 'center center',
          }}
        >
          <img className="ddp-photo" src={DROP_PHOTO} alt="" draggable={false} style={photoStyle} />
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              opacity: filled ? 0 : 1,
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
        {filled && !reduce ? <Puff filterId={filterId} /> : null}
        <div
          className="ddp-chip"
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
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
  );
}
```
