# Drag & drop with physics

Clean-room. Build the card from the behaviour recorded here. Don't open transitions.dev, and don't open that site's HTML, CSS, JS, or bundles, or pull request 43's card or prompt. Each number is a measured gesture, an observed frame, or a value chosen while matching the picture.

## Geometry at 1280 desktop

- Board 213×192, transparent.
- Chip 72×72 photo, radius 12, at left 141, top 0. Photo `object-fit: cover`.
- Zone 104×104 at left 0, top 88, radius 12. Border 2px dashed `rgba(0,0,0,0.1)`, background `rgba(234,234,234,0.2)`.
- The chip and the filled zone share one shadow, chosen by eye on `#f9f9f9`: `0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12)`. A soft halo, darker below than above. On the 72px chip the darkness (249 minus the pixel) reads about 33/29/22/15/7/1 below at 1/2/4/6/12/20px, about 22/18/12/7 on the side at 1/2/4/6px, and about 15/10/7 above at 1/2/4px. It is gone by 23px.
- Label "Drag & drop" / "it here": 11px, line-height 15, `#767676`, width 76, top 38 inside the zone's padding edge. The 2px border puts the text at 40 from the outer edge. Font stack `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. No font file is downloaded.
- Photo is a 746×944 CC0 crop of Jez Timms's rose. Unsplash: https://unsplash.com/photos/ODANAGrc168. Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg. Licence: https://creativecommons.org/publicdomain/zero/1.0/. The original demo uses a different 746×944 portrait.

## Drag

- Pointer down on the chip grabs it. Cursor is `grab`, then `grabbing` on the chip only (not `document.body`).
- Scale eases to 1.05 over 150ms with `cubic-bezier(0.2, 0.9, 0.3, 1)`. Painted on the card: about 1.036 at 33ms, about 1.043 at 49ms, and 1.05 by about 140ms.
- The chip follows the pointer 1:1. Position is the `translate` property. Rotation and scale are separate properties, so the follow is not waiting on the tilt ease.
- Tilt is a target plus an ease on `rotate`, clamped to ±10°, then held. The angle is written in the same frame as the pointer event. It is not blended on every move, and a small speed wobble does not restart the ease.
- Measured gesture for the gain: pointer events arrive about 33ms apart (about 24–37ms), so 80px lasts about 400ms, not 12 frames of 16ms. The gain is the fitted value 27.9497, from the three gestures in the provenance section below. Leftward motion is negative.
- On that drag the card reads -1.77° at 34ms, -3.19° at 40px, and -5.54° at 80px, then holds. A 120px drag at 1.5× that speed, events still about 33ms apart, settles at -8.34°.
- A fast flick that clamps at ±10° reads -3.22° at 35ms (scale 1.036) and -3.46° at 51ms (scale 1.043).
- A move with no horizontal change leaves the target where it is. Idle tilt holds.
- No throw or momentum.

## Release

- Hit test: the chip centre is inside the zone.
- While the chip centre is over the zone, the zone highlights: border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity about 0.5. That highlight is the drag-over state. There is no hover or focus style.
- Miss: the homing transition is committed on pointerup, layout is forced, and the rest `translate`, `rotate`, and `scale` are applied in that same frame, before paint. The return then runs 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)`. Overshoot is ≈9.75% of release distance (7.8px on 80px). The peak of that curve is about 287ms after pointerup. Ignore re-grabs during the return.
- Hit:
  - The chip fades out by 229ms, ease-out, with up to 2px of blur. Opacity is about 0.33 at 112ms.
  - The zone eases to scale 0.97 and back. Painted scale: 0.985 at 45ms, 0.972 at 111ms, 0.972 at 210ms, then 0.975 at 278ms, 0.983 at 312ms, 0.989 at 345ms, 0.996 at 412ms, and 1 by 511ms.
  - The photo fills the zone, cover, radius 12, fading in over 380ms ease-in-out. The dashed border and label hide. The filled tile uses background `#f7f7f7` and the same shadow as the chip.
  - Puff: not visible until 250ms after the drop. One 1275ms ease-out then runs. It starts at opacity 0 and scale 0.96, peaks at opacity 0.90 from 454ms through 461ms, and ends at opacity 0, +10px of drift, and scale `1 + 60/104` (about 1.577). The ring is a soft blurred haze (noise frequency 0.028, seed 11, displacement 6, blur 14), drawn behind the zone. At 800ms the side halo is about darkness 12 at 19px outside the zone and clears within about 17px of that.
  - Reset: at 1815ms the photo fades over 263ms with `cubic-bezier(0.138, 0.3, 0.19, 0.981)` to a 4px blur. Painted: opacity 0.65/0.39/0.23/0.13/0.07 and blur 1.41/2.46/3.08/3.48/3.73 at 32/64/100/130/163ms, gone at 263ms. The zone is empty at 2078ms. The chip respawns at 2265ms from scale 0.9 and opacity 0 over 212ms, and is fully visible at 2477ms. Painted at 30/63/96ms: opacity 0.55/0.81/0.93 and scale 0.955/0.981/0.993, and at least 0.99 by 163ms. The respawn starts from 0.9 and 0, so the first frame does not jump.

## Reduced motion

- Follows the OS `prefers-reduced-motion: reduce` setting and `html[data-reduce-motion="1"]`. The in-app Reduce Motion switch writes that attribute. Copy has no switch, so it follows the OS query.
- No transitions. State changes are instant. The zone empties at 1815ms and the chip respawns at 2265ms, already at scale 1 and opacity 1. The puff does not play.

## Native

- `src/demos/drag-drop/index.tsx` re-exports the gesture-handler scene in `src/demos/DragDrop.tsx` for native. The web card and Copy do not use that scene.

## Tilt gain provenance

The gain is the one-parameter least-squares fit of displayed tilt against velocity on three gestures. Events are about 33ms apart. Times are milliseconds from pointerdown. x is the pointer's horizontal move, leftward negative. Event v is that move divided by the gap since the previous event (pointerdown is x = 0 at t = 0). Armed v is the velocity of the first event that moved, which is the velocity the tilt held onto.

Model, with the card's 380ms ease `cubic-bezier(0.104, 0.62, 0, 0.006)`:

displayed tilt = clamp(gain × armed v, ±10°) × ease(t)

The loss is the sum of squared residuals over every pointermove below. A search in steps of 0.001, then a ternary refine, puts the minimum at 27.94965. The card uses 27.9497. It is not rounded to 28.

- Gestures: a slow drag at 0.1 px/ms for 792ms, the 80px drag at 0.2 px/ms for 396ms (it ends at 79.2px), and a flick of −45px on the first event (~33ms) then held.
- Samples: 44. Sum of squared residuals at 27.9497: 0.0030. RMS residual: 0.008°. Largest absolute residual: 0.014°.
- Check, ordinary least squares of the settled unsaturated samples only (ease at least 0.85 and implied target inside ±9.5°): 27.9727 on 18 samples. The flick is saturated, so those samples pin the ±10° clamp instead of the slope.

### slow

| t (ms) | x (px) | event v (px/ms) | armed v (px/ms) | tilt (deg) | predicted (deg) | residual (deg) |
| --- | --- | --- | --- | --- | --- | --- |
| 32.90 | -3.30 | -0.1003 | -0.1003 | -0.890 | -0.889 | -0.001 |
| 65.80 | -6.60 | -0.1003 | -0.1003 | -1.022 | -1.020 | -0.002 |
| 98.20 | -9.90 | -0.1019 | -0.1003 | -1.134 | -1.131 | -0.003 |
| 131.70 | -13.20 | -0.0985 | -0.1003 | -1.273 | -1.270 | -0.003 |
| 164.30 | -16.50 | -0.1012 | -0.1003 | -1.429 | -1.426 | -0.003 |
| 197.80 | -19.80 | -0.0985 | -0.1003 | -1.609 | -1.606 | -0.003 |
| 230.20 | -23.10 | -0.1019 | -0.1003 | -1.798 | -1.794 | -0.004 |
| 263.60 | -26.40 | -0.0988 | -0.1003 | -2.006 | -2.001 | -0.005 |
| 297.00 | -29.70 | -0.0988 | -0.1003 | -2.225 | -2.220 | -0.005 |
| 329.50 | -33.00 | -0.1015 | -0.1003 | -2.448 | -2.442 | -0.006 |
| 362.90 | -36.30 | -0.0988 | -0.1003 | -2.685 | -2.679 | -0.006 |
| 395.20 | -39.60 | -0.1022 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 428.70 | -42.90 | -0.0985 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 462.00 | -46.20 | -0.0991 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 494.50 | -49.50 | -0.1015 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 527.90 | -52.80 | -0.0988 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 560.50 | -56.10 | -0.1012 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 594.00 | -59.40 | -0.0985 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 626.60 | -62.70 | -0.1012 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 660.20 | -66.00 | -0.0982 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 692.90 | -69.30 | -0.1009 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 725.50 | -72.60 | -0.1012 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 759.10 | -75.90 | -0.0982 | -0.1003 | -2.814 | -2.803 | -0.011 |
| 791.60 | -79.20 | -0.1015 | -0.1003 | -2.814 | -2.803 | -0.011 |

### 80px

| t (ms) | x (px) | event v (px/ms) | armed v (px/ms) | tilt (deg) | predicted (deg) | residual (deg) |
| --- | --- | --- | --- | --- | --- | --- |
| 32.50 | -6.60 | -0.2031 | -0.2031 | -1.789 | -1.795 | 0.006 |
| 66.10 | -13.20 | -0.1964 | -0.2031 | -2.061 | -2.066 | 0.005 |
| 98.60 | -19.80 | -0.2031 | -0.2031 | -2.287 | -2.293 | 0.006 |
| 132.10 | -26.40 | -0.1970 | -0.2031 | -2.568 | -2.575 | 0.007 |
| 164.50 | -33.00 | -0.2037 | -0.2031 | -2.882 | -2.890 | 0.008 |
| 198.00 | -39.60 | -0.1970 | -0.2031 | -3.243 | -3.253 | 0.010 |
| 230.30 | -46.20 | -0.2043 | -0.2031 | -3.624 | -3.634 | 0.010 |
| 263.70 | -52.80 | -0.1976 | -0.2031 | -4.041 | -4.053 | 0.012 |
| 297.00 | -59.40 | -0.1982 | -0.2031 | -4.483 | -4.495 | 0.012 |
| 329.40 | -66.00 | -0.2037 | -0.2031 | -4.930 | -4.943 | 0.013 |
| 362.80 | -72.60 | -0.1976 | -0.2031 | -5.409 | -5.423 | 0.014 |
| 396.10 | -79.20 | -0.1982 | -0.2031 | -5.663 | -5.677 | 0.014 |

### flick

| t (ms) | x (px) | event v (px/ms) | armed v (px/ms) | tilt (deg) | predicted (deg) | residual (deg) |
| --- | --- | --- | --- | --- | --- | --- |
| 32.60 | -45.00 | -1.3804 | -1.3804 | -3.159 | -3.164 | 0.005 |
| 66.10 | -45.00 | 0.0000 | -1.3804 | -3.639 | -3.640 | 0.001 |
| 98.60 | -45.00 | 0.0000 | -1.3804 | -4.040 | -4.040 | -0.000 |
| 132.20 | -45.00 | 0.0000 | -1.3804 | -4.535 | -4.537 | 0.002 |
| 197.60 | -45.00 | 0.0000 | -1.3804 | -5.719 | -5.723 | 0.004 |
| 264.00 | -45.00 | 0.0000 | -1.3804 | -7.145 | -7.148 | 0.003 |
| 362.50 | -45.00 | 0.0000 | -1.3804 | -9.543 | -9.546 | 0.003 |
| 428.90 | -45.00 | 0.0000 | -1.3804 | -10.000 | -10.000 | 0.000 |
