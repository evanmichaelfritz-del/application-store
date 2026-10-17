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
- Scale eases to 1.05 over 150ms with `cubic-bezier(0.2, 0.9, 0.3, 1)`. Painted on the card: about 1.036 at 33ms, about 1.043 at 49ms, and 1.05 by about 140ms. A held sample of 1.046 is part of that same curve. The curve's own 1.030 is at 25ms. The painted transition sits about 8ms behind that: scale 1.022 at 24ms, and the next frame is already 1.036.
- The chip follows the pointer 1:1. Position is the `translate` property. Rotation and scale are separate properties, so the follow is not waiting on the tilt ease.
- Tilt is a target plus an ease on `rotate`, clamped to ±10°, then held. The angle is written in the same frame as the pointer event. A target change under 0.25° does not restart the ease. A move with no horizontal change leaves the target. Idle tilt holds.
- The ease is 330ms of `cubic-bezier(0.16, 0.72, 0.16, 0.955)`, and it waits 8ms so it lines up with the painted lift. At 25ms of the curve the progress is 0.340, which is −3.40° on a clamped flick. That lands near the frame whose scale has just passed 1.030. One such frame read −3.412° at scale 1.036. Neighbouring frames read −2.94° and −3.16°, so the painted flick is about −3.4°.
- No throw or momentum.

## Release

- Hit test: the chip centre is inside the zone.
- While the chip centre is over the zone, the zone highlights: border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity about 0.5. That highlight is the drag-over state. There is no hover or focus style.
- Miss: the homing transition is committed on pointerup, layout is forced, and the rest `translate`, `rotate`, and `scale` are applied in that same frame, before paint. The return then runs 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)`. Overshoot is ≈9.75% of release distance (7.8px on 80px). The peak of that curve is about 287ms after pointerup. Ignore re-grabs during the return.
- Hit:
  - The chip fades out by 229ms, ease-out, with up to 2px of blur. Opacity is about 0.33 at 112ms.
  - The zone eases to scale 0.97 and back. Down is 226ms with `cubic-bezier(0.4, 1.05, 0.4, 0.9)`. Back is 240ms with `cubic-bezier(0.55, 0.3, 0, 0.4)`. The animation is shifted 12ms forward because that clock sat 12ms behind the drop. Painted scale, and the residual against the frame samples 0.985/0.9725/0.970/0.975/0.983/0.989/0.996 and recovered by 460ms: 0.9850 (0), 0.9729 (+0.0004), 0.9703 (+0.0003), 0.9748 (−0.0002), 0.9834 (+0.0004), 0.9889 (−0.0001), 0.9957 (−0.0003), 0.9997 at 460ms. Sum of squared residuals 0.0000010.
  - The photo fills the zone, cover, radius 12, fading in over 347ms ease-in-out. The dashed border and label hide. The filled tile uses background `#f7f7f7` and the same shadow as the chip.
  - Puff: see the frame fit below. It is a soft fully blurred haze behind the zone. It starts at opacity 0 and scale 1.
  - Reset: the photo fade is 211ms of `cubic-bezier(0.12, 0.04, 0.08, 0.8)`, scheduled so it runs from 1832ms to 2043ms, blur ending at 4px. Painted opacity against 0.66/0.40/0.24/0.13/0.07/0 at 32/64/100/130/163/211ms: 0.681 (+0.021), 0.407 (+0.007), 0.247 (+0.007), 0.140 (+0.010), 0.067 (−0.003), 0. Painted blur against 1.37/2.39/3.05/3.46 then 4px: 1.27/2.37/3.01/3.44/3.73/4. The chip respawns over 142ms of `cubic-bezier(0.24, 0.76, 0.5, 0.92)`, from 2268ms to 2410ms, starting at scale 0.9 and opacity 0. Painted opacity/scale against 0.51/0.951, 0.79/0.979, 0.92/0.992 and 1/1 at 30/63/96/142ms: 0.512/0.951 (+0.002/0), 0.794/0.979 (+0.004/0), 0.923/0.992 (+0.003/0), 1/1.

## Reduced motion

- Follows the OS `prefers-reduced-motion: reduce` setting and `html[data-reduce-motion="1"]`. The in-app Reduce Motion switch writes that attribute. Copy has no switch, so it follows the OS query.
- No transitions and no animations. The tilt snaps to the clamped target in the pointer event. Both the OS query and the attribute were read live: a leftward move painted −10° immediately and was still −10° a frame later, with scale 1.05.
- The zone empties at 1832ms and the chip respawns at 2268ms, already at scale 1 and opacity 1. The puff does not play.

## Native

- `src/demos/drag-drop/index.tsx` re-exports the gesture-handler scene in `src/demos/DragDrop.tsx` for native. The web card and Copy do not use that scene.

## Tilt fit

Eleven pointer events, `372/11 = 33.818` ms apart, carry the gesture. An 80px drag at that spacing is about `80/372 = 0.215` px/ms. The first event's measured speed moved with the gap: 0.2139, 0.2158, 0.2165 and 0.2197 px/ms. Gain is `5.58 / 0.2165 = 25.774`. It is not rounded to 28.

Settled angle on those runs, after the 330ms ease had finished: −5.562°, −5.612° and −5.680°. Residuals against −5.58°: +0.018°, −0.032°, −0.100°. The 0.2197 px/ms run is the one whose first gap was 33.1ms rather than 33.8ms.

The slower pass uses `(80/372) × (4.4/5.58) = 0.1696` px/ms. Its first event measured 0.1707 to 0.1712 px/ms and the settled angle was −4.412° to −4.425°. Residuals against −4.40°: −0.012° to −0.025°.

Model: `clamp(gain × armed speed, ±10°)`, then the 330ms curve delayed by 8ms. The armed speed is the first event that moved, unless a later event changes the target by 0.25° or more.

### 80px, the run that settled at −5.680°

| t (ms) | x (px) | event v (px/ms) | armed v (px/ms) | tilt (deg) |
| --- | --- | --- | --- | --- |
| 33.1 | −7.27 | −0.2197 | −0.2197 | −1.931 |
| 67.7 | −14.55 | −0.2102 | −0.2197 | −3.710 |
| 101.5 | −21.82 | −0.2152 | −0.2197 | −4.523 |
| 135.0 | −29.09 | −0.2171 | −0.2197 | −4.956 |
| 168.5 | −36.36 | −0.2171 | −0.2197 | −5.219 |
| 202.9 | −43.64 | −0.2114 | −0.2197 | −5.395 |
| 236.4 | −50.91 | −0.2171 | −0.2197 | −5.510 |
| 269.7 | −58.18 | −0.2184 | −0.2197 | −5.589 |
| 304.3 | −65.45 | −0.2102 | −0.2197 | −5.644 |
| 337.9 | −72.73 | −0.2165 | −0.2197 | −5.680 |
| 371.3 | −80.00 | −0.2177 | −0.2197 | −5.680 |

Predicted settled angle `−0.2197 × 25.774 = −5.663°`. Painted −5.680°. Residual −0.017°.

### Slower pass, settled at −4.412°

Armed speed −0.1707 px/ms. Predicted `−0.1707 × 25.774 = −4.400°`. Painted −4.412°. Residual −0.012°.

## Puff frame fit

Frames of the demo, with the pre-drop frame subtracted. A pixel counts once it is 10 levels darker than that frame. Drift is `(bottom reach − top reach) / 2`, shifted so the first side reach of about 2px is 276ms. The 276ms sample is partly the zone shadow, which is why its residual is large. Later samples, once the reach is past 12px, are the puff.

| t (ms) | drift (px) | fit (px) | residual (px) |
| --- | --- | --- | --- |
| 276 | 3.5 | 1.90 | −1.60 |
| 342 | 4.0 | 3.71 | −0.29 |
| 409 | 4.5 | 4.52 | +0.02 |
| 484 | 5.0 | 5.15 | +0.15 |
| 617 | 5.5 | 6.03 | +0.53 |
| 709 | 6.0 | 6.58 | +0.58 |
| 850 | 6.5 | 7.40 | +0.90 |
| 917 | 7.0 | 7.80 | +0.80 |
| 1017 | 10.0 | 8.41 | −1.59 |
| 1117 | 9.5 | 9.03 | −0.47 |

The fit is `cubic-bezier(0, 0.5, 0.2, 0.4)` from 263ms to 1488ms, ending at 11.5px. RMS residual 0.87px. At 460ms the fit is 4.96px. At 750ms, where the side reach has levelled off, the fit is 6.6px.

The side reach at darkness 10 grew from about 11px to a plateau of about 18px, 7px of growth on the ring's 50px half-size. That is scale 1.02 near the 460ms peak and scale 1.14 once the reach has levelled off. The run is 1225ms because 1488 − 263 = 1225. Opacity holds at 0.90 from 450ms to 470ms, which is `(450−263)/1225` and `(470−263)/1225` of the run, so a sample a few milliseconds off 460ms still reads 0.90. Those stops are not an integer 16% keyframe.

Painted on the card:

| t (ms) | opacity | drift (px) | scale |
| --- | --- | --- | --- |
| 263 | 0 | 0 | 1 |
| 276 | 0.051 | 0.28 | 1.001 |
| 464 | 0.900 | 4.96 | 1.02 |
| 750 | 0.362 | 6.60 | 1.140 |
| 800 | 0.290 | 6.82 | 1.14 |
| 1488 | 0 | 11.47 | 1.14 |

The ring is stroke 50 on a 100×100 box, colour `rgba(132,132,132,0.55)`, noise `baseFrequency` 0.028, 2 octaves, seed 11, displacement 4, blur 22. At 800ms the side darkness is 32 at the zone edge and 12 at 8px outside it, and it is gone by 23px. The fade from that 12-darkness point is 15px.

## What these fits are not

The durations are the frame fits above. They are not 250ms and 450ms of squash, not a 400ms photo fade, and not a 250ms respawn. The puff is not a 1275ms ease-out, not opacity 0.9 at an integer 16% stop, not scale 0.96, not +10px, and not scale `1 + 60/104`. Displacement is 4, not 30. Blur is 22, not 0.35. The tilt gain is 25.774, not 28. The tilt curve's last control is 0.955, which is what makes the curve 0.340 at 25ms. It is not a start scale.
