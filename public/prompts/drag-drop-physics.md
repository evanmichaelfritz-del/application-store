# AGENT_PROMPT — Drag & drop with physics

Recreate this drag-and-drop board only. Build from the behaviour and values in this prompt. Do not read or copy Pro/paid source or page source. Work from the public demo behaviour only. The recreate targets this asset, not the author's site.

One board. The web card and Copy both mount `PhysicsDropCard` from `src/demos/drag-drop/card.web.tsx`. Copy is `public/parity/drag-drop-physics.js`, built by `scripts/build-parity.mjs` from `src/demos/drag-drop/mount.tsx`. At a 1280 desktop the board is the fixed size below; it does not reflow.

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
- Scale while held eases to 1.05 on `.ddp-lift` with the `scale` property. The transition is `scale 150ms cubic-bezier(0.2, 0.9, 0.3, 1)`, already armed in `ready`, so the change from 1 runs. The curve's 1.030 is at 25ms. On a 0.2 px/ms drag this card painted scale 1.036 at 35ms and 1.043 at 52ms, and 1.05 by 151ms.
- Cursor `grabbing` is set on the chip while `held`. `document.body` is left alone.
- Tilt is degrees on `.ddp-tilt` via the `rotate` property, clamped to ±10 and rounded to 0.001°. Speed is the rolling average of the last three move events. A gap above 100ms is a hold: that stretch reads 0, and the next move uses only the new intervals. A sample with no horizontal change leaves the target.
- `TILT_GAIN` is 27.9, which is 5.58 / 0.2. The angle is a first-order chase of `clamp(gain × speed, ±10°)`. While the pointer keeps moving, the chase does not restart, and a constant target is never crossed. The clock starts at the grab when the drag begins immediately, and at the first move after a hold. After a 28ms wait, 44% of the target up to ±5.58° arrives with a 6ms time constant and the rest with 70ms. The part past ±5.58° skips that fast mode, waits 58ms, and arrives with a 64ms time constant. A drag whose position is `−0.2 × t` px for 400ms read 0° at 18ms, −1.865° at 34.8ms, −3.241° at 51ms, −3.788° at 67.4ms, −4.174° at 84.4ms, −4.449° at 101.2ms, −4.700° at 117.1ms, −4.892° at 134.3ms, −5.039° at 151.2ms, −5.150° at 167.4ms, −5.312° at 200.5ms, −5.415° at 234.3ms, −5.493° at 267.3ms, −5.516° at 300.5ms, −5.560° at 351ms, −5.561° at 384ms, −5.565° at 400.3ms, and −5.580° at 700ms. It did not pass −5.58°. After a 250ms hold the same drag read −1.828° at 34.1ms of motion and −5.546° at 700ms, and did not pass −5.58°. The same shape at 0.1 px/ms read −2.351° at 117ms and −2.685° at 217ms, settled at −2.790°, and did not pass −2.80°. At 0.3 px/ms it read −5.836° at 101ms, −7.829° at 201ms, −8.244° at 301ms, and −8.341° at 400ms, and settled at −8.370°. An 80px drag over 1200ms in 36 equal steps read −1.574° at 118.5ms and −1.863° at 1200ms, and did not pass −3.21°. A flick of 80px in three moves 5ms apart read −1.954° at 35ms with scale 1.036 and −3.309° at 52ms with scale 1.043, then reached the −10° clamp at 700ms.
- A move with no horizontal change, and any time the pointer is idle, leaves the last target where it is. Tilt does not decay.
- `.ddp-tilt` is memoized on tilt, scale, and whether the drop cycle is running. The displayed angle is written from the chase each frame. Under reduced motion the angle snaps to the clamped target instead of chasing. The 0.2 px/ms drag snaps to −5.580° at 400ms. A move past the clamp snaps to −10° in that same event.
- Held motion is `translate` on `.ddp-chip`, `rotate` on `.ddp-tilt`, and `scale` on `.ddp-lift`. Each property eases on its own.

## Timing

| Piece | Duration | Easing | Notes |
| --- | --- | --- | --- |
| Lift | 150ms | `cubic-bezier(0.2, 0.9, 0.3, 1)` | Scale 1 → 1.05. The curve is 1.030 at 25ms. This card painted 1.036 at 35ms and 1.043 at 52ms on the 0.2 px/ms drag. |
| Tilt | first-order chase | 6ms and 70ms after a 28ms wait; past ±5.58°, 64ms after 58ms | Gain 27.9. The 0.2 px/ms drag above reads −5.565° at 400ms and −5.580° at 700ms, and does not pass −5.58°. |
| Miss return | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Translate, rotate, and scale. Rest is applied in the pointerup frame. |
| Return overshoot | peak at 57.3% (about 287ms) | the same curve | Output peaks at about 1.0978, which is ≈9.75% of release distance (7.8px on 80px). |
| Chip fade on a hit | 229ms | `ease-out` | Opacity 1 → 0 and blur 0 → 2px. This card painted 0.386 at 111ms. Gone at 229ms, then the chip parks at rest while opacity stays 0. |
| Zone squash | 226ms down, 240ms back, shifted 12ms forward | dip `cubic-bezier(0.4, 1.05, 0.4, 0.9)`, back `cubic-bezier(0.55, 0.3, 0, 0.4)` | Painted 0.985/0.9729/0.9703/0.9748/0.9834/0.9889/0.9957/0.9997 at 45/111/210/278/312/345/412/460ms. |
| Zone photo in | 430ms | `cubic-bezier(0.433, 0.032, 0.516, 1.065)` | Opacity 0 → 1, scheduled from the sinking paint. Painted 0.132/0.507/0.774/0.942 at 111/210/277/344ms, 0.984 at 377ms, 0.996 at 390ms. |
| Border and label | instant | none | Hidden while the photo is showing (`sinking` and `clearing`). Restored when the state becomes `empty`. |
| Puff | 267ms delay, then 1183ms | linear between the sampled stops | Opacity 0 at 279ms, 0.325 at 313ms, 0.899 at 462ms, 0 at 1462ms. Drift 2.46/4.11/6.08/9.94px at 462/612/812/1462ms. Scale 1.112/1.214/1.335/1.438/1.517/1.573 at 462/612/812/1012/1213/1462ms. |
| Photo out | 1832ms → 2043ms | `cubic-bezier(0.12, 0.04, 0.08, 0.8)` | 211ms. Painted opacity 0.681/0.407/0.247/0.140/0.067/0 and blur 1.27/2.37/3.01/3.44/3.73/4 at 32/64/100/130/163/211ms. |
| Chip respawn | 2268ms → 2410ms | `cubic-bezier(0.24, 0.76, 0.5, 0.92)` | 142ms from scale 0.9 and opacity 0. Painted opacity/scale 0.512/0.951 at 30ms, 0.794/0.979 at 63ms, 0.923/0.992 at 96ms, and 1/1 at 142ms. |

On a miss, pointerup commits the `homing` class while the pose is still the release pose, forces layout, and then sets the rest pose before paint. That is what lets the 500ms curve start in the pointerup frame. Re-grabs are ignored for the whole return because the state is not `ready`. The chip also ignores pointer downs while `sinking`, `clearing`, `empty`, or `back`.

## Puff

A 100×100 layer centred on the zone: left `(104 - 100) / 2 = 2`, top `88 + 2 = 90`. It is a sibling behind the zone (`z-index: 0`, zone `z-index: 1`), so the squash does not scale it and the opaque filled zone covers the middle. The lobes outside the zone are the part you see. The photo is not greyed or darkened.

The animation is `ddp-puff 1183ms linear 267ms both`. Opacity, `translate`, and `scale` are separate properties and move linearly between stops. The delay is 12ms ahead of the first visible frame because the sinking paint runs that far behind the drop. Painted opacity is 0 at 279ms, 0.325 at 313ms, 0.601 at 363ms, 0.803 at 413ms, 0.899 at 462ms, 0.837 at 513ms, 0.706 at 612ms, 0.585 at 712ms, 0.472 at 812ms, 0.370 at 913ms, 0.274 at 1012ms, 0.191 at 1112ms, 0.120 at 1213ms, 0.062 at 1313ms, 0.021 at 1412ms, and 0 at 1462ms. Drift is 2.46px at 462ms, 4.11px at 612ms, 6.08px at 812ms, and 9.94px at 1462ms. Scale is 1.112, 1.214, 1.335, 1.438, 1.517, and 1.573 at those same later marks, with no plateau.

The ring, before the filter:

- outer box 100×100
- stroke 36, colour `rgba(132,132,132,0.48)`. Stroke 36 is an eye choice, a thick ring with an open middle. Alpha 0.48 is the weight on blur 5 that jointly fits the demo side profiles
- centreline rect at inset 18, size 64×64
- centreline `rx` is `27 - 18 = 9`

An SVG filter warps that stroke into a soft haze:

- `feTurbulence` fractal noise, `baseFrequency` 0.028, 1 octave, seed 11. One octave, because the side darkness is a smooth fall
- `feDisplacementMap` scale 4, R and G channels
- `feGaussianBlur` stdDeviation 5
- filter region in user space, from −160 to 260 on both axes, `sRGB`
- the SVG and the puff layer set `overflow: visible`

At 500ms the side darkness (249 minus the pixel) is 48/31/13/2/0 on the right and 48/31/12/3/0 on the left, at 2/5/10/15/20px. Residuals against the demo's 56/42/20/5/0 are −8/−11/−7/−3/0 and −8/−11/−8/−2/0. The bottom edge on that frame is 64/47/26/9/1. At 800ms the left side is 40/32/23/14/6/1 at 2/5/10/15/20/25px, residuals 0/+2/+4/+6/+4.4/+0.8 against 40/30/19/8/1.6/0.2. The right side is 46/36/26/16/8/3. The bottom edge is 53/42/33/26/18/9. Blur stays 5. There is no straight cut and no filled corner.

Reduced motion does not mount the puff.

## Reduced motion

The card follows both signals. `prefers-reduced-motion: reduce` is read with `matchMedia` on the pointer event, and `html[data-reduce-motion="1"]` is read the same way plus a mutation observer. The in-app Reduce Motion switch sets that attribute from the OS setting or the switch. Copy does not mount the switch, so Copy follows the OS query. Either signal removes transitions and animations. The tilt snaps to the clamped target instead of chasing. The 0.2 px/ms drag snaps to −5.580° at 400ms. A fast move past the clamp snaps to −10° in the pointer event and is still −10° a frame later.

- A miss goes straight back to `ready` at rest.
- A hit shows the filled zone immediately (photo opacity 1, border and label hidden, plate `#f7f7f7`, shared shadow, no squash, no puff) and parks the chip at rest while it is invisible.
- The zone empties at 1832ms and the chip respawns at 2268ms, already at scale 1 and opacity 1.

## Gotchas

- The chip accepts a grab only in `ready`. The return ignores re-grabs. The hit sequence also ignores them until the respawn has finished.
- Do not spring the chip home and do not keep integrating velocity after pointer up. Do not wait a frame before applying the rest transform.
- Do not add hover or focus styles. The chip is not tabbable. The zone highlight is the drag-over state: it is on only while the pointer is down and the chip centre is inside the zone.
- The label must not request a font. No `fonts.gstatic.com`, no other CDN, no `@font-face` pointed at a network URL. The Inter-first system stack above is the face.
- The chip is the cover photo, 72×72, radius 12, with no text on it. Do not replace it with a coloured tile or a text label.
- The photo is a data URI. The board does not fetch an image.
- Copy CSS is the shared page sheet after unused rules are dropped, plus `#parity-root { width: 213px; }`. `.col` and `button.trigger` are not in that CSS.
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

## Known gaps

- Phone widths are a known gap. The board is measured at a 1280 desktop and stays 213×192. It does not reflow.
- The puff halo edge is a smooth haze. The public demo's outline wanders more irregularly.
- This asset's photo is the CC0 rose crop below. A different portrait is not this board.

## Checklist

- [ ] Board is 213×192 and transparent. Chip is 72×72 at left 141, top 0, cover, radius 12, with the shared shadow. Zone is 104×104 at left 0, top 88, radius 12.
- [ ] Zone border is 2px dashed `rgba(0,0,0,0.1)` and the background is `rgba(234,234,234,0.2)`. The label is 11px / 15px `#767676`, width 76, top 38, in the Inter-first system stack.
- [ ] Drag-over, while the chip centre is inside the zone, uses border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, and label opacity 0.5.
- [ ] Pointer down eases scale to 1.05 over 150ms (this card painted 1.036 at 35ms and 1.043 at 52ms) and sets cursor `grabbing` on the chip only. The chip follows the pointer 1:1.
- [ ] Tilt stays within ±10°. Gain is 27.9. A 0.2 px/ms drag for 400ms reads −1.865° at 34.8ms and −5.565° at 400.3ms, settles at −5.580° by 700ms, and does not pass −5.58°. The same drag after a 250ms hold reads −5.546° at 700ms of motion and does not pass −5.58°. The 0.1 px/ms drag reads −2.351° at 117ms and does not pass −2.80°. The 0.3 px/ms drag reads −8.341° at 400ms and settles at −8.370°. An 80px drag over 1200ms reads −1.863° at 1200ms. Idle tilt holds. Reduced motion snaps to the target.
- [ ] A miss, tested by the chip centre, returns over 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (≈9.75% of release distance, 7.8px on 80px), starting in the pointerup frame, and ignores re-grabs. There is no throw.
- [ ] A hit fades the chip out in 229ms ease-out with up to 2px blur (0.386 at 111ms), squashes the zone through 0.970 at 210ms and back to 0.9997 by 460ms, and fades the cover photo in over 430ms (0.132/0.507/0.774/0.942 at 111/210/277/344ms) while the border and label hide.
- [ ] The puff is opacity 0 at 279ms, 0.899 with drift 2.46px and scale 1.112 at 462ms, and opacity 0 with drift 9.94px and scale 1.573 at 1462ms. The ring is stroke 36, alpha 0.48, one octave, blur 5, in a user-space filter box from −160 to 260. It does not darken the photo, and the haze has no hard edge. The puff halo edge is a smooth haze; the original's outline wanders more irregularly.
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
 * Gain is 5.58 / 0.2 = 27.9. An 80px drag in 400ms is 0.2 px/ms and settles
 * at −5.58°. The same gain gives −2.79° at 0.1 px/ms and −8.37° at 0.3 px/ms.
 * Leftward is negative. Anything past ±10° snaps to the clamp.
 *
 * Speed is the rolling average of the last three move events. A gap above
 * 100ms is a hold: that stretch reads 0, and the next move uses only the
 * new intervals, so a wait before the drag does not dilute the speed.
 * A sample with no horizontal change leaves the target, and idle tilt holds.
 *
 * The angle is a first-order chase of that target. While the pointer keeps
 * moving, the chase does not restart, and a constant target is never crossed.
 * After a 28ms wait, 44% of the target (up to ±5.58°) arrives with a 6ms
 * time constant and the rest with 70ms. The part of the target past ±5.58°
 * skips that fast mode. It waits 58ms and arrives with a 64ms time constant,
 * so a faster drag cannot multiply the opening kick. The clock starts at the
 * grab when the drag begins immediately, and at the first move after a hold
 * so that wait is not skipped.
 */
const TILT_GAIN = 27.9;
const TILT_FAST_CAP = 5.58;
const TILT_LAG_MS = 28;
const TILT_FAST_WEIGHT = 0.44;
const TILT_TAU_FAST = 6;
const TILT_TAU_BODY = 70;
const TILT_EXTRA_LAG_MS = 58;
const TILT_EXTRA_TAU = 64;
const TILT_SAMPLES = 3;
/** Above one frame and a 33ms step, below a 250ms hold. */
const TILT_WINDOW_MS = 100;
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
/**
 * Photo fade-in. The sinking paint runs about 12ms behind the drop, so this
 * curve is fitted on that clock: opacity 0.13/0.50/0.77/0.94 at 111/210/277/344ms,
 * and 0.99 only after about 377ms.
 */
const PHOTO_IN_MS = 430;
const PHOTO_IN_EASE = 'cubic-bezier(0.433, 0.032, 0.516, 1.065)';
/**
 * First and last visible frames of the puff. The sinking paint runs about
 * 12ms behind the drop, so the animation is started that much earlier.
 */
const PUFF_FROM = 279;
const PUFF_END = 1462;
const PUFF_DELAY = PUFF_FROM - SQUASH_LEAD;
const PUFF_MS = PUFF_END - PUFF_FROM;
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
/**
 * Stroke 36 is an eye choice: a thick ring, open in the middle (inner 64).
 * One octave, because the side darkness falls off in a smooth haze.
 * Blur 5 is the stdDeviation whose 500ms and 800ms side profiles are the
 * closest joint fit to the demo. Alpha 0.48 is the weight on that blur.
 * 500ms reads 48/31/13/2/0 against 56/42/20/5/0. 800ms left reads
 * 40/32/23/14/6/1 against 40/30/19/8/1.6/0.2.
 */
const PUFF_STROKE = 36;
const PUFF_RADIUS = 27;
const PUFF_COLOR = 'rgba(132,132,132,0.48)';
const PUFF_NOISE = 0.028;
const PUFF_OCTAVES = 1;
const PUFF_SEED = 11;
const PUFF_DISPLACE = 4;
const PUFF_BLUR = 5;
/** Filter box in the puff's own pixels, wide enough that the blur is not cut. */
const PUFF_FILTER_MARGIN = 160;

type PuffStop = { t: number; opacity?: number; drift?: number; scale?: number };
/** Opacity, drift, and scale read off the demo frames. Linear between these stops. */
const PUFF_STOPS: PuffStop[] = [
  { t: 279, opacity: 0, drift: 0, scale: 1 },
  { t: 313, opacity: 0.335 },
  { t: 363, opacity: 0.607 },
  { t: 413, opacity: 0.807 },
  { t: 462, opacity: 0.899, drift: 2.46, scale: 1.112 },
  { t: 513, opacity: 0.836 },
  { t: 612, opacity: 0.706, drift: 4.11, scale: 1.214 },
  { t: 712, opacity: 0.585 },
  { t: 812, opacity: 0.472, drift: 6.08, scale: 1.335 },
  { t: 913, opacity: 0.369 },
  { t: 1012, opacity: 0.274, scale: 1.438 },
  { t: 1112, opacity: 0.191 },
  { t: 1213, opacity: 0.119, scale: 1.517 },
  { t: 1313, opacity: 0.061 },
  { t: 1412, opacity: 0.021 },
  { t: 1462, opacity: 0, drift: 9.94, scale: 1.573 },
];

function puffKeyframeCss(): string {
  return PUFF_STOPS.map((stop) => {
    const pct = ((stop.t - PUFF_FROM) / PUFF_MS) * 100;
    const bits: string[] = [];
    if (stop.opacity !== undefined) bits.push(`opacity: ${stop.opacity}`);
    if (stop.drift !== undefined) bits.push(`translate: 0 ${stop.drift}px`);
    if (stop.scale !== undefined) bits.push(`scale: ${stop.scale}`);
    return `  ${Number(pct.toFixed(4))}% { ${bits.join('; ')}; }`;
  }).join('\n');
}
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
    ddp-photo-in ${PHOTO_IN_MS}ms ${PHOTO_IN_EASE} both,
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
${puffKeyframeCss()}
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

/** Two first-order modes. Result stays in [0, 1] and does not decrease. */
function firstOrderMix(elapsedMs: number, lagMs: number, weightFast: number, tauFast: number, tauBody: number): number {
  const elapsed = elapsedMs - lagMs;
  if (elapsed <= 0) return 0;
  const mixed =
    1 -
    weightFast * Math.exp(-elapsed / tauFast) -
    (1 - weightFast) * Math.exp(-elapsed / tauBody);
  if (mixed <= 0) return 0;
  if (mixed >= 1) return 1;
  return mixed;
}

function chaseTilt(elapsedMs: number, target: number): number {
  const sign = target < 0 ? -1 : 1;
  const mag = Math.abs(target);
  const capped = mag < TILT_FAST_CAP ? mag : TILT_FAST_CAP;
  const extra = mag - capped;
  const base = capped * firstOrderMix(elapsedMs, TILT_LAG_MS, TILT_FAST_WEIGHT, TILT_TAU_FAST, TILT_TAU_BODY);
  const extraElapsed = elapsedMs - TILT_EXTRA_LAG_MS;
  const tail = extraElapsed <= 0 ? 0 : extra * (1 - Math.exp(-extraElapsed / TILT_EXTRA_TAU));
  return Math.round(sign * (base + tail) * 1000) / 1000;
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
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      <svg width={PUFF_SIZE} height={PUFF_SIZE} viewBox={`0 0 ${PUFF_SIZE} ${PUFF_SIZE}`} overflow="visible">
        <filter
          id={filterId}
          filterUnits="userSpaceOnUse"
          x={-PUFF_FILTER_MARGIN}
          y={-PUFF_FILTER_MARGIN}
          width={PUFF_SIZE + PUFF_FILTER_MARGIN * 2}
          height={PUFF_SIZE + PUFF_FILTER_MARGIN * 2}
          colorInterpolationFilters="sRGB"
        >
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
  const tiltSamples = useRef<{ t: number; x: number }[]>([]);
  const tiltTrack = useRef({ origin: 0, from: 0, target: 0, freshAt: 0, movedAt: 0 });
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
    const elapsed = now - track.origin;
    if (track.from === 0) return chaseTilt(elapsed, track.target);
    const mix = firstOrderMix(elapsed, TILT_LAG_MS, TILT_FAST_WEIGHT, TILT_TAU_FAST, TILT_TAU_BODY);
    return Math.round((track.from + (track.target - track.from) * mix) * 1000) / 1000;
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
    tiltSamples.current = [{ t: now, x: event.clientX }];
    tiltTrack.current = { origin: now, from: 0, target: 0, freshAt: 0, movedAt: now };
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
    const now = performance.now();
    const track = tiltTrack.current;
    const snap = motionReducedNow();
    reduceRef.current = snap;
    const samples = tiltSamples.current;
    const prev = samples[samples.length - 1];
    if (prev && event.clientX === prev.x) {
      if (now - track.movedAt > TILT_WINDOW_MS) {
        samples.splice(0, samples.length, { t: now, x: event.clientX });
        track.freshAt = now;
      }
    } else if (prev) {
      track.movedAt = now;
      if (now - prev.t > TILT_WINDOW_MS) {
        samples.splice(0, samples.length, { t: now, x: event.clientX });
        track.freshAt = now;
      } else {
        samples.push({ t: now, x: event.clientX });
        if (samples.length > TILT_SAMPLES) samples.splice(0, samples.length - TILT_SAMPLES);
        const oldest = samples[0];
        const newest = samples[samples.length - 1];
        const dt = newest.t - oldest.t;
        if (dt > 0) {
          const next = clampTilt((newest.x - oldest.x) / dt);
          if (track.freshAt) {
            const start = track.freshAt;
            track.freshAt = 0;
            const current = snap ? next : tiltAngle(now);
            const pastTarget = Math.sign(current) === Math.sign(next) && Math.abs(current) > Math.abs(next);
            if (current === 0) {
              track.from = 0;
              track.origin = start;
              track.target = next;
            } else if (pastTarget) {
              track.from = next;
              track.origin = now;
              track.target = next;
            } else {
              track.from = current;
              track.origin = now;
              track.target = next;
            }
          } else {
            track.target = next;
          }
        }
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
    transition: reduce || cycling ? 'none' : `opacity ${PHOTO_IN_MS}ms ${PHOTO_IN_EASE}`,
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
