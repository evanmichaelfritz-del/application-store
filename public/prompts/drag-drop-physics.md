# AGENT_PROMPT — Drag & drop with physics

Independent recreate of the visible behaviour of the transitions.dev demo. The demo is credited by name only. This document does not describe that demo's source.

One board. The live web demo and Copy both mount `PhysicsDropCard` from `src/demos/drag-drop/card.web.tsx`. Copy is `public/parity/drag-drop-physics.js`, built by `scripts/build-parity.mjs` from `src/demos/drag-drop/mount.tsx`. At a 1280 desktop the board is the fixed size below; it does not reflow.

## Geometry

| Part | Value |
| --- | --- |
| Board | 213×192, transparent, position relative |
| Chip | 72×72, left 141, top 0, `object-fit: cover`, radius 12 |
| Shared shadow | `0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12)` on the chip and on the filled zone |
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

The shadow is a soft halo, darker below than above, not a hard line. On the 72px chip over `#f9f9f9`, darkness (249 minus the pixel) reads 33/29/22/15/7/1 below at 1/2/4/6/12/20px, 22/18/12/7 on the side at 1/2/4/6px, and 15/10/7 above at 1/2/4px. It is gone by 23px. The label names Inter first and then system faces. Nothing downloads a font. There is no `@font-face` and no request to a font host.

## States

| State | How you get there | What you see |
| --- | --- | --- |
| `ready` | mount, a finished return, or the end of `back` | Chip at translate 0, rotation 0, scale 1, opacity 1. Cursor `grab` on the chip. Zone shows the dashed border and the label. No photo in the zone. |
| `held` | primary pointer down on the chip, only from `ready` | Chip follows the pointer 1:1. Scale eases to 1.05. Cursor `grabbing` on the chip only. Tilt eases toward a target from horizontal pointer velocity and holds when that velocity is zero. |
| `homing` | pointer up, and the chip centre is outside the zone | Translate, rotate, and scale ease to rest over 500ms. The rest values are applied in the pointerup frame. Pointer events on the chip are off. A new pointer down is ignored until the 500ms ends and the state is `ready`. |
| `sinking` | pointer up, and the chip centre is inside the zone | Chip fades out in place. Zone border and label hide. Zone photo fades in over the `#f7f7f7` plate. Zone scale eases to 0.97 and back. Puff plays behind the zone, unless reduced motion is on. |
| `clearing` | 1832ms after the hit | Photo fades out over 211ms, blur reaching 4px. Chip stays at opacity 0, already parked at rest. |
| `empty` | 2043ms after the hit | Zone is empty again: dashed border, label, no photo, no filled shadow. Chip stays at opacity 0. |
| `back` | 2268ms after the hit | Chip plays in from scale 0.9 and opacity 0. At 2410ms the state becomes `ready`. |

The chip centre is `left + x + 36`, `top + y + 36`, with left 141 and top 0. It is inside the zone when that point is within x 0…104 and y 88…192, edges included. Overlap of the boxes is not the test. `data-over` is `1` only while `held` and that test passes.

There is no throw and no momentum. Velocity never moves the chip after release. It only feeds tilt.

## Drag and tilt

- Position is `grabPose + (pointer - grabPoint)`, in CSS pixels, on every `pointermove`. The chip uses the `translate` property, so the follow is not on the same property as rotation or scale.
- Scale while held eases to 1.05 on `.ddp-lift` with the `scale` property. The transition is `scale 150ms cubic-bezier(0.2, 0.9, 0.3, 1)`, already armed in `ready`, so the change from 1 runs. Painted on the card: about 1.036 at 33ms, about 1.043 at 49ms, and 1.05 by about 140ms. The curve's 1.030 is at 25ms. The painted transition is about 8ms behind that.
- Cursor `grabbing` is set on the chip while `held`. `document.body` is left alone.
- Tilt is degrees on `.ddp-tilt` via the `rotate` property, clamped to ±10 and rounded to 0.001°. `vx` is horizontal pixels per millisecond since the previous move.
- `TILT_GAIN` is 25.774, which is 5.58 / 0.2165. Eleven events, 372/11 ms apart, carry an 80px drag. The first event's speed on that spacing measured 0.2139 to 0.2197 px/ms, and the settled angle was −5.56° to −5.68°. The slower pass, 4.4/5.58 of that speed, settled at −4.41° to −4.43°. The ease is 330ms of `cubic-bezier(0.16, 0.72, 0.16, 0.955)` and waits 8ms. A clamped flick reads about −3.4° on the frame whose scale has just passed 1.030. One such frame was −3.412° at scale 1.036.
- A move with `dx === 0`, and any time the pointer is idle, leaves the last target where it is. Tilt does not decay.
- `.ddp-tilt` is memoized on tilt, scale, and whether the drop cycle is running. The displayed angle is written from the ease each frame. A target change smaller than 0.25° does not restart that ease, so a steady drag can finish and hold. Under reduced motion the angle snaps to the clamped target instead of easing.
- Held motion is `translate` on `.ddp-chip`, `rotate` on `.ddp-tilt`, and `scale` on `.ddp-lift`. Each property eases on its own.

## Timing

| Piece | Duration | Easing | Notes |
| --- | --- | --- | --- |
| Lift | 150ms | `cubic-bezier(0.2, 0.9, 0.3, 1)` | Scale 1 → 1.05. About 1.036 at 33ms, about 1.043 at 49ms, 1.05 by about 140ms. The curve is 1.030 at 25ms. |
| Tilt ease | 330ms, after an 8ms wait | `cubic-bezier(0.16, 0.72, 0.16, 0.955)` | Progress 0.340 at 25ms of the curve, so a clamped flick is −3.40° there. Settled by 330ms. |
| Miss return | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Translate, rotate, and scale. Rest is applied in the pointerup frame. |
| Return overshoot | peak at 57.3% (about 287ms) | the same curve | Output peaks at about 1.0978, which is ≈9.75% of release distance (7.8px on 80px). |
| Chip fade on a hit | 229ms | `ease-out` | Opacity 1 → 0 and blur 0 → 2px. About 0.33 opacity at 112ms. Gone at 229ms, then the chip parks at rest while opacity stays 0. |
| Zone squash | 226ms down, 240ms back, shifted 12ms forward | dip `cubic-bezier(0.4, 1.05, 0.4, 0.9)`, back `cubic-bezier(0.55, 0.3, 0, 0.4)` | Painted 0.985/0.9729/0.9703/0.9748/0.9834/0.9889/0.9957/0.9997 at 45/111/210/278/312/345/412/460ms. |
| Zone photo in | 347ms | `ease-in-out` | Opacity 0 → 1, scheduled from the sinking paint. Radius 12, `object-fit: cover`, painted over the 104×104 outer box (offset by the 2px border). |
| Border and label | instant | none | Hidden while the photo is showing (`sinking` and `clearing`). Restored when the state becomes `empty`. |
| Puff | 263ms delay, then 1225ms | rise `cubic-bezier(0, 0.1, 0.6, 1)`, then a hold, then `cubic-bezier(0.2, 0.15, 0.1, 1)` | Opacity 0 at 263ms, about 0.05 at 276ms, 0.90 from 450ms through 470ms, 0 at 1488ms. Drift 4.96px at the peak, 6.6px at 750ms, 11.5px at the end. Scale 1.02 at the peak, 1.14 from 750ms. |
| Photo out | 1832ms → 2043ms | `cubic-bezier(0.12, 0.04, 0.08, 0.8)` | 211ms. Painted opacity 0.681/0.407/0.247/0.140/0.067/0 and blur 1.27/2.37/3.01/3.44/3.73/4 at 32/64/100/130/163/211ms. |
| Chip respawn | 2268ms → 2410ms | `cubic-bezier(0.24, 0.76, 0.5, 0.92)` | 142ms from scale 0.9 and opacity 0. Painted opacity/scale 0.512/0.951 at 30ms, 0.794/0.979 at 63ms, 0.923/0.992 at 96ms, and 1/1 at 142ms. |

On a miss, pointerup commits the `homing` class while the pose is still the release pose, forces layout, and then sets the rest pose before paint. That is what lets the 500ms curve start in the pointerup frame. Re-grabs are ignored for the whole return because the state is not `ready`. The chip also ignores pointer downs while `sinking`, `clearing`, `empty`, or `back`.

## Puff

A 100×100 layer centred on the zone: left `(104 - 100) / 2 = 2`, top `88 + 2 = 90`. It is a sibling behind the zone (`z-index: 0`, zone `z-index: 1`), so the squash does not scale it and the opaque filled zone covers the middle. The lobes outside the zone are the part you see. The photo is not greyed or darkened.

The animation is `ddp-puff 1225ms linear 263ms both`, with its own timing on each stop. Opacity, `translate`, and `scale` are separate properties.

- 0%: opacity 0, translate 0, scale 1. Timing `cubic-bezier(0, 0.1, 0.6, 1)`.
- `(450−263)/1225`: opacity 0.9, translate 4.96px down, scale 1.02.
- `(470−263)/1225`: the same opacity, drift, and scale, so 460ms sits inside a 0.90 hold. Decay timing `cubic-bezier(0.2, 0.15, 0.1, 1)`.
- `(750−263)/1225`: translate 6.6px, scale 1.14.
- 100%: opacity 0, translate 11.5px, scale 1.14, which is 1488ms after the drop.

Painted: opacity 0 at 263ms, 0.051 at 276ms, 0.90 with 4.96px and scale 1.02 at the peak, 6.60px and scale 1.140 at 750ms, and 0 with 11.47px and scale 1.14 at 1488ms.

The ring, before the filter:

- outer box 100×100
- stroke 50, colour `rgba(132,132,132,0.55)`
- centreline rect at inset 25, size 50×50
- centreline `rx` is `27 - 25 = 2`, so the outer corner reads as about 27

An SVG filter warps that stroke into a soft haze:

- `feTurbulence` fractal noise, `baseFrequency` 0.028, 2 octaves, seed 11
- `feDisplacementMap` scale 4, R and G channels
- `feGaussianBlur` stdDeviation 22
- filter region `-80% -80%` size `260% 260%`, `sRGB`
- the SVG `overflow` is visible so the blurred edge is not clipped to the 100 box

At 800ms the side darkness is 32 at the zone edge and 12 at 8px outside it, and it is gone by 23px. The fade from that 12-darkness point is 15px. The edge is a smooth fall, not a torn or blotchy ring.

Reduced motion does not mount the puff.

## Reduced motion

The card follows both signals. `prefers-reduced-motion: reduce` is read with `matchMedia` on the pointer event, and `html[data-reduce-motion="1"]` is read the same way plus a mutation observer. The in-app Reduce Motion switch sets that attribute from the OS setting or the switch. Copy does not mount the switch, so Copy follows the OS query. Either signal removes transitions and animations. The tilt snaps to the clamped target instead of easing. A leftward move under either signal painted −10° immediately and was still −10° a frame later.

- A miss goes straight back to `ready` at rest.
- A hit shows the filled zone immediately (photo opacity 1, border and label hidden, plate `#f7f7f7`, shared shadow, no squash, no puff) and parks the chip at rest while it is invisible.
- The zone empties at 1832ms and the chip respawns at 2268ms, already at scale 1 and opacity 1.

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
- [ ] Pointer down eases scale to 1.05 over 150ms (about 1.036 at 33ms, about 1.043 at 49ms) and sets cursor `grabbing` on the chip only. The chip follows the pointer 1:1.
- [ ] Tilt stays within ±10°. Eleven events about 33.8ms apart carry an 80px drag, and it settles between −5.56° and −5.68°. The slower pass settles between −4.41° and −4.43°. A clamped flick is about −3.4° once the scale has passed 1.030. Idle tilt holds. Reduced motion snaps to the clamp.
- [ ] A miss, tested by the chip centre, returns over 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (≈9.75% of release distance, 7.8px on 80px), starting in the pointerup frame, and ignores re-grabs. There is no throw.
- [ ] A hit fades the chip out in 229ms ease-out with up to 2px blur (about 0.33 at 112ms), squashes the zone through 0.970 at 210ms and back to 0.9997 by 460ms, and fades the cover photo in over 347ms ease-in-out while the border and label hide.
- [ ] The puff starts at 263ms and is just visible at 276ms. Opacity is 0.90 from 450ms through 470ms. Drift is 4.96px at the peak, 6.6px at 750ms and 11.5px at 1488ms. Scale is 1.02 at the peak and 1.14 at the end. The ring is a soft blurred haze (seed 11, `baseFrequency` 0.028, displacement 4, blur 22) and does not darken the photo.
- [ ] The photo fades from 1832ms over 211ms to a 4px blur (opacity about 0.68/0.41/0.25 at 32/64/100ms, gone at 211ms, which is 2043ms after the drop). The chip respawns at 2268ms from scale 0.9 and opacity 0 and is fully visible at 2410ms.
- [ ] Reduced motion follows the OS setting and `html[data-reduce-motion="1"]`. It snaps the tilt, skips the puff, empties the zone at 1832ms, and respawns the chip at 2268ms.
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
/** Own curve. The painted scale is measured on the card, not taken from the solver. */
const LIFT_EASE = 'cubic-bezier(0.2, 0.9, 0.3, 1)';
const TILT_LIMIT = 10;
/**
 * Eleven pointer events, 372/11 ms apart, carry an 80px drag. The first
 * event's speed on that spacing was 0.2139, 0.2158, 0.2165 and 0.2197 px/ms
 * across runs. Gain 25.774 is 5.58 / 0.2165. Those runs settled at -5.56°,
 * -5.61° and -5.68°. The slower pass, 4.4/5.58 of the 80px speed, settled
 * at -4.41° to -4.43°. Leftward is negative. The ease itself is done by
 * 330ms. The lift transition paints about 8ms behind its curve (scale 1.022
 * at 24ms, where the curve is already at 1.029), so the tilt ease waits
 * those 8ms. A clamped flick then reads about -3.4° on the frame whose
 * scale has just passed 1.030. dx === 0 leaves the target, and once the
 * ease finishes the angle holds.
 */
const TILT_GAIN = 25.774;
const TILT_EASE_MS = 330;
const TILT_LAG_MS = 8;
/** 0.340 at 25ms of the curve, 1 by 330ms. */
const TILT_CURVE = [0.16, 0.72, 0.16, 0.955] as const;
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 229;
const FADE_BLUR = 2;
const SQUASH = 0.97;
const SQUASH_DOWN_MS = 226;
const SQUASH_BACK_MS = 240;
const SQUASH_MS = SQUASH_DOWN_MS + SQUASH_BACK_MS;
const SQUASH_DIP = (SQUASH_DOWN_MS / SQUASH_MS) * 100;
/** Dip: 0.985 at 45ms, 0.9725 at 111ms, 0.970 by 210ms. */
const SQUASH_DIP_EASE = 'cubic-bezier(0.4, 1.05, 0.4, 0.9)';
/** Back: 0.975/0.983/0.989/0.996 at 278/312/345/412ms, and 0.999 by 460ms. */
const SQUASH_BACK_EASE = 'cubic-bezier(0.55, 0.3, 0, 0.4)';
/**
 * The squash animation clock sat 12ms behind the drop timestamp. Shifting
 * the animation forward by that amount puts the wall-clock samples on the curve.
 */
const SQUASH_LEAD = 12;
const PHOTO_IN_MS = 347;
const PUFF_DELAY = 263;
const PUFF_MS = 1225;
const PUFF_PEAK = 0.9;
/**
 * Opacity holds at 0.9 from 450ms to 470ms. 460ms sits inside that window,
 * so a sample a few milliseconds off the peak still reads 0.9. These
 * percents are (450-263)/1225 and (470-263)/1225.
 */
const PUFF_PEAK_LO = ((450 - PUFF_DELAY) / PUFF_MS) * 100;
const PUFF_PEAK_HI = ((470 - PUFF_DELAY) / PUFF_MS) * 100;
/** Side reach has levelled off by 750ms, 487ms into the run. */
const PUFF_HOLD_AT = ((750 - PUFF_DELAY) / PUFF_MS) * 100;
const PHOTO_OUT_AT = 1832;
const PHOTO_OUT_MS = 211;
const PHOTO_OUT_BLUR = 4;
/** Opacity 0.66/0.40/0.24/0.13/0.07 at 32/64/100/130/163ms. The fit reaches 0 at 211ms, so the fade ends at 2043ms. */
const PHOTO_OUT_EASE = 'cubic-bezier(0.12, 0.04, 0.08, 0.8)';
/** Scheduled from the sinking paint, which lands SQUASH_LEAD after the drop. */
const PHOTO_OUT_DELAY = PHOTO_OUT_AT - SQUASH_LEAD;
const RESPAWN_AT = 2268;
const RESPAWN_MS = 142;
/** Opacity and scale share this ease: 0.51/0.951 at 30ms, 0.79/0.979 at 63ms, 0.92/0.992 at 96ms. Done at 142ms, which is 2410ms after the drop. */
const RESPAWN_EASE = 'cubic-bezier(0.24, 0.76, 0.5, 0.92)';
/**
 * Scheduled from the same sinking paint as the photo fade. The respawn
 * samples read about 3ms behind that paint, so this starts 3ms sooner.
 */
const RESPAWN_DELAY = RESPAWN_AT - SQUASH_LEAD - 3;
const RESPAWN_SCALE = 0.9;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT_AT_PEAK = 4.96;
const PUFF_SCALE_AT_PEAK = 1.02;
const PUFF_DRIFT_AT_HOLD = 6.6;
const PUFF_DRIFT = 11.5;
const PUFF_SCALE = 1.14;
const PUFF_COLOR = 'rgba(132,132,132,0.55)';
const PUFF_NOISE = 0.028;
const PUFF_OCTAVES = 2;
const PUFF_SEED = 11;
const PUFF_DISPLACE = 4;
const PUFF_BLUR = 22;
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
/** Soft halo on #f9f9f9. Two blurs, no hard contact line. About 1 darkness at 20px, gone by 23px. */
const SHADOW = '0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12)';

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'clearing' | 'empty' | 'back';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const SHEET = `
.ddp-ready .ddp-lift,
.ddp-held .ddp-lift { transition: scale ${LIFT_MS}ms ${LIFT_EASE}; }
.ddp-homing .ddp-chip { transition: translate ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-homing .ddp-tilt { transition: rotate ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-homing .ddp-lift { transition: scale ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms linear -${SQUASH_LEAD}ms both; }
@keyframes ddp-squash {
  0% { transform: scale(1); animation-timing-function: ${SQUASH_DIP_EASE}; }
  ${SQUASH_DIP}% { transform: scale(${SQUASH}); animation-timing-function: ${SQUASH_BACK_EASE}; }
  100% { transform: scale(1); }
}
@keyframes ddp-fade {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${FADE_BLUR}px); }
}
.ddp-photo-out {
  animation:
    ddp-photo-in ${PHOTO_IN_MS}ms ease-in-out both,
    ddp-photo-out ${PHOTO_OUT_MS}ms ${PHOTO_OUT_EASE} ${PHOTO_OUT_DELAY}ms forwards;
}
@keyframes ddp-photo-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ddp-photo-out {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${PHOTO_OUT_BLUR}px); }
}
.ddp-chip-life {
  animation:
    ddp-fade ${FADE_MS}ms ease-out forwards,
    ddp-in ${RESPAWN_MS}ms ${RESPAWN_EASE} ${RESPAWN_DELAY}ms forwards;
}
.ddp-life-lift { animation: ddp-in-lift ${RESPAWN_MS}ms ${RESPAWN_EASE} ${RESPAWN_DELAY}ms forwards; }
@keyframes ddp-in {
  from { opacity: 0; filter: blur(0px); }
  to { opacity: 1; filter: blur(0px); }
}
@keyframes ddp-in-lift {
  from { scale: ${RESPAWN_SCALE}; }
  to { scale: 1; }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation: ddp-puff ${PUFF_MS}ms linear ${PUFF_DELAY}ms both;
}
@keyframes ddp-puff {
  0% {
    opacity: 0;
    translate: 0 0;
    scale: 1;
    animation-timing-function: cubic-bezier(0, 0.1, 0.6, 1);
  }
  ${PUFF_PEAK_LO}% {
    opacity: ${PUFF_PEAK};
    translate: 0 ${PUFF_DRIFT_AT_PEAK}px;
    scale: ${PUFF_SCALE_AT_PEAK};
    animation-timing-function: linear;
  }
  ${PUFF_PEAK_HI}% {
    opacity: ${PUFF_PEAK};
    translate: 0 ${PUFF_DRIFT_AT_PEAK}px;
    scale: ${PUFF_SCALE_AT_PEAK};
    animation-timing-function: cubic-bezier(0.2, 0.15, 0.1, 1);
  }
  ${PUFF_HOLD_AT}% {
    translate: 0 ${PUFF_DRIFT_AT_HOLD}px;
    scale: ${PUFF_SCALE};
    animation-timing-function: linear;
  }
  100% {
    opacity: 0;
    translate: 0 ${PUFF_DRIFT}px;
    scale: ${PUFF_SCALE};
  }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff, .ddp-photo-out, .ddp-chip-life, .ddp-life-lift { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-tilt, .ddp-lift, .ddp-photo { transition: none !important; }
}
html[data-reduce-motion="1"] .ddp-squash,
html[data-reduce-motion="1"] .ddp-puff,
html[data-reduce-motion="1"] .ddp-photo-out,
html[data-reduce-motion="1"] .ddp-chip-life,
html[data-reduce-motion="1"] .ddp-life-lift { animation: none !important; }
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
  return Math.round(clamped * 1000) / 1000;
}

function unitBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    const mt = 1 - t;
    const bx = 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t;
    if (bx < x) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  const mt = 1 - t;
  return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t;
}

function tiltProgress(elapsedMs: number): number {
  return unitBezier(
    TILT_CURVE[0],
    TILT_CURVE[1],
    TILT_CURVE[2],
    TILT_CURVE[3],
    (elapsedMs - TILT_LAG_MS) / TILT_EASE_MS,
  );
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

const ChipFace = memo(function ChipFace({ tilt, scale, cycling }: { tilt: number; scale: number; cycling: boolean }) {
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
        className={cycling ? 'ddp-lift ddp-life-lift' : 'ddp-lift'}
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
  const velRef = useRef({ lastX: 0, movedAt: 0 });
  const tiltTrack = useRef({ downAt: 0, origin: 0, from: 0, target: 0, armed: false });
  const tiltLoop = useRef(0);
  const timersRef = useRef<number[]>([]);
  const chipRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const armHomeRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (tiltLoop.current) cancelAnimationFrame(tiltLoop.current);
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

  function tiltAngle(now: number): number {
    const track = tiltTrack.current;
    const raw = track.from + (track.target - track.from) * tiltProgress(now - track.origin);
    return Math.round(raw * 1000) / 1000;
  }

  function stopTiltLoop() {
    if (tiltLoop.current) cancelAnimationFrame(tiltLoop.current);
    tiltLoop.current = 0;
  }

  function kickTiltLoop() {
    stopTiltLoop();
    const step = () => {
      if (phaseRef.current !== 'held') return;
      const angle = tiltAngle(performance.now());
      if (angle !== poseRef.current.tilt) {
        flushSync(() => {
          publish({ ...poseRef.current, tilt: angle });
        });
      }
      tiltLoop.current = requestAnimationFrame(step);
    };
    tiltLoop.current = requestAnimationFrame(step);
  }

  function parkReady() {
    stopTiltLoop();
    publish(REST);
    setOver(false);
    setPhaseBoth('ready');
  }

  function beginHome() {
    stopTiltLoop();
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
    stopTiltLoop();
    clearTimers();
    setOver(false);
    flushSync(() => {
      setPhaseBoth('sinking');
    });
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
    const now = performance.now();
    velRef.current = { lastX: event.clientX, movedAt: now };
    tiltTrack.current = { downAt: now, origin: now, from: 0, target: 0, armed: false };
    reduceRef.current = motionReducedNow();
    flushSync(() => {
      setPhaseBoth('held');
      publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: poseRef.current.tilt, scale: GRAB_SCALE });
    });
    if (!reduceRef.current) kickTiltLoop();
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
    const track = tiltTrack.current;
    const snap = motionReducedNow();
    reduceRef.current = snap;
    if (dx !== 0) {
      const next = clampTilt(dx / dt);
      // A steady drag's event spacing wobbles, and that wobble used to restart the ease.
      // Keep the target until the speed really changes.
      const changed = Math.abs(next - track.target) >= 0.25;
      if (!track.armed) {
        track.armed = true;
        track.from = snap ? next : 0;
        track.target = next;
        track.origin = snap ? now : track.downAt;
      } else if (changed) {
        track.from = snap ? next : tiltAngle(now);
        track.target = next;
        track.origin = now;
      }
    }
    if (snap) stopTiltLoop();
    const tilt = snap ? track.target : tiltAngle(now);
    const x = grab.poseX + (event.clientX - grab.x);
    const y = grab.poseY + (event.clientY - grab.y);
    setOver(centreInsideZone(x, y));
    flushSync(() => {
      publish({ x, y, tilt, scale: GRAB_SCALE });
    });
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
  const cycling = !reduce && (phase === 'sinking' || phase === 'clearing' || phase === 'empty' || phase === 'back');

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
    transition: reduce || cycling ? 'none' : `opacity ${PHOTO_IN_MS}ms ease-in-out`,
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
            className={cycling && showingPhoto ? 'ddp-photo ddp-photo-out' : 'ddp-photo'}
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
          className={cycling ? 'ddp-chip ddp-chip-life' : 'ddp-chip'}
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ChipFace tilt={pose.tilt} scale={pose.scale} cycling={cycling} />
        </div>
      </div>
    </div>
  );
}
```
