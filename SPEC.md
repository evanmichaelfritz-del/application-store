# Drag & drop with physics

Clean-room. Build the card from the behaviour recorded here. Don't open transitions.dev, and don't open that site's HTML, CSS, JS, or bundles, or pull request 43's card or prompt. Each number is a measured gesture, an observed frame, or a value chosen while matching the picture.

## Geometry at 1280 desktop

- Board 213×192, transparent.
- Chip 72×72 photo, radius 12, at left 141, top 0. Photo `object-fit: cover`.
- Zone 104×104 at left 0, top 88, radius 12. Border 2px dashed `rgba(0,0,0,0.1)`, background `rgba(234,234,234,0.2)`.
- The chip and the filled zone share one shadow, chosen by eye on `#f9f9f9`: `0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12)`. A soft halo, darker below than above. On the 72px chip the darkness (249 minus the pixel) reads 33/29/22/15/7/1/0 below at 1/2/4/6/12/20/23px, 22/18/12/7 on the side at 1/2/4/6px, and 15/10/7 above at 1/2/4px. Against the halo targets 38/30/20/14/6/1, 23/18/12/9 and 15/11/7, the residuals are −5/−1/+2/+1/+1/0, −1/0/0/−2 and 0/−1/0. Every sample is inside ±25% of its target. The side sample at 6px is 7, just inside the 6.75 floor of 9. It is gone by 23px.
- Label "Drag & drop" / "it here": 11px, line-height 15, `#767676`, width 76, top 38 inside the zone's padding edge. The 2px border puts the text at 40 from the outer edge. Font stack `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. No font file is downloaded.
- Photo is a 746×944 CC0 crop of Jez Timms's rose. Unsplash: https://unsplash.com/photos/ODANAGrc168. Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg. Licence: https://creativecommons.org/publicdomain/zero/1.0/. The original demo uses a different 746×944 portrait.

## Drag

- Pointer down on the chip grabs it. Cursor is `grab`, then `grabbing` on the chip only (not `document.body`).
- Scale eases to 1.05 over 150ms with `cubic-bezier(0.2, 0.9, 0.3, 1)`. The curve's own 1.030 is at 25ms. On this build a 0.2 px/ms drag painted scale 1.036 at 35ms and 1.043 at 52ms, and 1.05 by 151ms.
- The chip follows the pointer 1:1. Position is the `translate` property. Rotation and scale are separate properties, so the follow is not waiting on the tilt ease.
- Tilt target is `clamp(gain × speed, ±10°)`, rounded to 0.001°. Speed is the horizontal movement since the grab divided by the time since the grab, so one short interval cannot spike it. Gain is `5.58 / 0.2 = 27.9`. The angle is a first-order chase of that target. It does not restart, and a constant target is never crossed. After a 28ms wait, 44% of the target up to ±5.58° arrives with a 6ms time constant and the rest with 70ms. The part past ±5.58° skips that fast mode, waits 58ms, and arrives with a 64ms time constant. The angle is written in the same frame as the pointer event. A move with no horizontal change leaves the target. Idle tilt holds.
- No throw or momentum.

## Release

- Hit test: the chip centre is inside the zone.
- While the chip centre is over the zone, the zone highlights: border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity about 0.5. That highlight is the drag-over state. There is no hover or focus style.
- Miss: the homing transition is committed on pointerup, layout is forced, and the rest `translate`, `rotate`, and `scale` are applied in that same frame, before paint. The return then runs 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)`. Overshoot is ≈9.75% of release distance (7.8px on 80px). The peak of that curve is about 287ms after pointerup. Ignore re-grabs during the return.
- Hit:
  - The chip fades out by 229ms, ease-out, with up to 2px of blur. Opacity is about 0.33 at 112ms.
  - The zone eases to scale 0.97 and back. Down is 226ms with `cubic-bezier(0.4, 1.05, 0.4, 0.9)`. Back is 240ms with `cubic-bezier(0.55, 0.3, 0, 0.4)`. The animation is shifted 12ms forward because that clock sat 12ms behind the drop. Painted scale, and the residual against the frame samples 0.985/0.9725/0.970/0.975/0.983/0.989/0.996 and recovered by 460ms: 0.9850 (0), 0.9729 (+0.0004), 0.9703 (+0.0003), 0.9748 (−0.0002), 0.9834 (+0.0004), 0.9889 (−0.0001), 0.9957 (−0.0003), 0.9997 at 460ms. Sum of squared residuals 0.0000010.
  - The photo fills the zone, cover, radius 12, fading in over 430ms of `cubic-bezier(0.433, 0.032, 0.516, 1.065)`. Painted opacity 0.132 at 111ms, 0.507 at 210ms, 0.774 at 277ms, 0.942 at 344ms, 0.984 at 377ms, and 0.996 at 390ms. It does not reach 0.99 before 377ms. The dashed border and label hide. The filled tile uses background `#f7f7f7` and the same shadow as the chip.
  - Puff: see the frame fit below. It is a soft fully blurred haze behind the zone. It starts at opacity 0 and scale 1.
  - Reset: the photo fade is 211ms of `cubic-bezier(0.12, 0.04, 0.08, 0.8)`, scheduled so it runs from 1832ms to 2043ms, blur ending at 4px. Painted opacity against 0.66/0.40/0.24/0.13/0.07/0 at 32/64/100/130/163/211ms: 0.681 (+0.021), 0.407 (+0.007), 0.247 (+0.007), 0.140 (+0.010), 0.067 (−0.003), 0. Painted blur against 1.37/2.39/3.05/3.46 then 4px: 1.27/2.37/3.01/3.44/3.73/4. The chip respawns over 142ms of `cubic-bezier(0.24, 0.76, 0.5, 0.92)`, from 2268ms to 2410ms, starting at scale 0.9 and opacity 0. Painted opacity/scale against 0.51/0.951, 0.79/0.979, 0.92/0.992 and 1/1 at 30/63/96/142ms: 0.512/0.951 (+0.002/0), 0.794/0.979 (+0.004/0), 0.923/0.992 (+0.003/0), 1/1.

## Reduced motion

- Follows the OS `prefers-reduced-motion: reduce` setting and `html[data-reduce-motion="1"]`. The in-app Reduce Motion switch writes that attribute. Copy has no switch, so it follows the OS query.
- No transitions and no animations. The tilt snaps to the clamped target in the pointer event. On the 80px gesture below, that snap is −5.581° at 400ms with scale 1.05. A fast move that exceeds the clamp snaps to −10° in the pointer event and is still −10° a frame later. Both the OS query and the attribute take that path.
- The zone empties at 1832ms and the chip respawns at 2268ms, already at scale 1 and opacity 1. The puff does not play.

## Native

- `src/demos/drag-drop/index.tsx` re-exports the gesture-handler scene in `src/demos/DragDrop.tsx` for native. The web card and Copy do not use that scene.

## Tilt fit

Gain `27.9 = 5.58 / 0.2`. A steady 0.2 px/ms drag settles at −5.58°. The same gain gives −2.79° at 0.1 px/ms and −8.37° at 0.3 px/ms. The chase is the two first-order modes above. It is monotone for a constant target and does not cross that target.

The ±10° clamp is the end of a fast move. Reduced motion on a move past the clamp reads −10.00° immediately. On this card a 120px move in 120ms (three 40ms steps, target already the clamp) read −2.606° / −5.365° / −7.487° / −8.394° at 40/80/120/160ms and −9.922° at 360ms, still closing on −10°.

### 80px gesture

Replay: pointer position is `−0.2 × t` px for 400ms (twelve equal steps, 6.667px every 33.333ms), then hold. Readings on this card, and the residual against the demo's −1.78 / −3.40 / −3.80 / −4.17 / −4.42 / −4.64 / −4.82 / −4.98 / −5.09 / −5.26 / −5.39 / −5.48 / −5.51 / −5.55 / −5.58:

| t (ms) | tilt (deg) | residual (deg) |
| --- | --- | --- |
| 18.1 | 0 | 0 |
| 34.6 | −1.809 | −0.029 |
| 51 | −3.252 | +0.148 |
| 67.5 | −3.792 | +0.008 |
| 84 | −4.176 | −0.006 |
| 101 | −4.485 | −0.065 |
| 117 | −4.714 | −0.074 |
| 134 | −4.904 | −0.084 |
| 151 | −5.053 | −0.073 |
| 167.5 | −5.165 | −0.075 |
| 200.1 | −5.323 | −0.063 |
| 234.2 | −5.427 | −0.037 |
| 267.5 | −5.490 | −0.010 |
| 300.4 | −5.526 | −0.016 |
| 351.4 | −5.559 | −0.009 |
| 384 | −5.569 | +0.011 |
| 400.2 | −5.571 | +0.009 |

The largest residual is 0.148° at 51ms. Every sample is inside 0.3°. The angle moved in one direction. The most negative sample was −5.574° at 420ms, which does not pass −5.58°.

### Flick, the same 0.2 px/ms drag read early

| t (ms) | tilt (deg) | scale |
| --- | --- | --- |
| 35 | −1.937 | 1.036 |
| 52.3 | −3.313 | 1.043 |

Residuals against −1.77° and −3.40° are −0.167° and +0.087°. The painted scale at 52ms is 1.043.

### 40px and 120px

Same 400ms, twelve-step shape.

40px, 0.1 px/ms. Painted −2.356° at 117.1ms (residual +0.214° against −2.57°) and −2.688° at 217ms (residual +0.042° against −2.73°). The most negative sample was −2.783°. It did not pass −2.80°.

120px, 0.3 px/ms. Painted −5.863° at 101.5ms (residual −0.033° against −5.83°), −7.816° at 201ms (residual +0.004° against −7.82°), and −8.251° at 301ms (residual −0.031° against −8.22°).

### Slow gesture

Replay: 80px over 1200ms, thirty-six equal steps. Pointer position is `−(80/1200) × t` px until 1200ms, then hold. That is 2.222px every 33.333ms, 0.06667 px/ms, target −1.86°. Painted −1.575° at 118ms and −1.860° from 1000ms. The most negative sample was −1.861°. It did not pass −3.21°. Residual against the −1.87° settle is +0.010°. Residual against the demo's −2.55° at 118ms is +0.975°. That demo frame is past the −1.87° settle, and this constant-speed chase does not pass its target.

## Puff frame fit

The puff is visible from 279ms and is gone at 1462ms. The sinking paint runs about 12ms behind the drop, so the animation delay is 267ms and the run is 1183ms. Opacity, drift, and scale are linear between the demo's samples. Painted on this card:

| t (ms) | opacity | drift (px) | scale |
| --- | --- | --- | --- |
| 279 | 0 | 0 | 1 |
| 313 | 0.325 | 0.44 | 1.020 |
| 363 | 0.601 | 1.11 | 1.051 |
| 413 | 0.803 | 1.79 | 1.081 |
| 462 | 0.899 | 2.46 | 1.112 |
| 513 | 0.837 | 3.01 | 1.146 |
| 612 | 0.706 | 4.11 | 1.214 |
| 712 | 0.585 | 5.09 | 1.274 |
| 812 | 0.472 | 6.08 | 1.335 |
| 913 | 0.370 | 6.67 | 1.386 |
| 1012 | 0.274 | 7.27 | 1.438 |
| 1112 | 0.191 | 7.86 | 1.477 |
| 1213 | 0.120 | 8.46 | 1.517 |
| 1313 | 0.062 | 9.05 | 1.539 |
| 1412 | 0.021 | 9.64 | 1.562 |
| 1462 | 0 | 9.94 | 1.573 |

The ring is a 100×100 box, stroke 36, colour `rgba(132,132,132,0.38)`, centreline rect inset 18 so the inner size is 64 and the inner corner radius is 9. Stroke 36 is an eye choice: a thick ring with the middle left open. One octave of fractal noise (`baseFrequency` 0.028, seed 11), because the side darkness is a smooth haze. Displacement 4. Blur stdDeviation 5. The filter uses `filterUnits="userSpaceOnUse"` with a box from −160 to 260, so the blur is not cut into a square.

At 500ms the side darkness (249 minus the pixel, averaged over five rows) is 41/27/12/3/0 at 2/5/10/15/20px outside the zone. Past 10px the largest one-pixel step on that side is 4, then 2 or less; the other side's largest step is 3. The upper corner is 6/4/3/1 and the lower corner, which the downward drift darkens, is 17/13/10/7/6/3 at 0–5px along the diagonal. Neither corner is a filled square. At 800ms the side reads 37/29/20/11/4/2 at 2/5/10/15/20/25px and is 0 by 27px.

Puff halo edge is a smooth haze; the original's outline wanders more irregularly (Motion, 75aa37c). Accepted as known gap.

