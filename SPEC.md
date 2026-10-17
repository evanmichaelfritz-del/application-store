# Drag & drop with physics

Clean-room. Build the card from the behaviour recorded here. Don't open transitions.dev, and don't open that site's HTML, CSS, JS, or bundles, or pull request 43's card or prompt. Each number is a measured gesture, an observed frame, or a value chosen while matching the picture.

## Geometry at 1280 desktop

- Board 213×192, transparent.
- Chip 72×72 photo, radius 12, at left 141, top 0. Photo `object-fit: cover`.
- Zone 104×104 at left 0, top 88, radius 12. Border 2px dashed `rgba(0,0,0,0.1)`, background `rgba(234,234,234,0.2)`.
- The chip and the filled zone share one shadow, chosen by eye: `0 2px 2px rgba(0,0,0,0.50), 0 6px 8px rgba(0,0,0,0.22)`. A 2px contact edge plus a short mid layer. On `#f9f9f9` the shade is back to the page by about 20px below the box.
- Label "Drag & drop" / "it here": 11px, line-height 15, `#767676`, width 76, top 38 inside the zone's padding edge. The 2px border puts the text at 40 from the outer edge. Font stack `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. No font file is downloaded.
- Photo is a 746×944 CC0 crop of Jez Timms's rose. Unsplash: https://unsplash.com/photos/ODANAGrc168. Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg. Licence: https://creativecommons.org/publicdomain/zero/1.0/. The original demo uses a different 746×944 portrait.

## Drag

- Pointer down on the chip grabs it. Cursor is `grab`, then `grabbing` on the chip only (not `document.body`).
- Scale eases to 1.05 over 150ms with `cubic-bezier(0.2, 0.9, 0.3, 1)`. Chosen so the lift is about 1.037 at 35ms, about 1.043 at 52ms, and 1.05 at 150ms.
- The chip follows the pointer 1:1. Position is the `translate` property. Rotation and scale are separate properties, so the follow is not waiting on the tilt ease.
- Tilt is a target plus a 112ms ease-out on `rotate`, clamped to ±10°, then held. It is not blended on every move.
- Measured gesture for the gain: 80px over 12 frames of 16ms (192ms) is 80/192 px/ms and reads about -5.57°. Gain is `5.57 / (80/192)`. Leftward motion is negative. The target is rounded to 0.001° so that steady speed stays on one angle and the ease can finish. By the end of that gesture the rotation has settled on -5.57°.
- A fast flick that clamps at ±10°, starting with the lift, is about -3.4° when the scale is 1.030. That is 25ms into the 112ms ease-out toward the clamp.
- A move with no horizontal change leaves the target where it is. Idle tilt holds.
- No throw or momentum.

## Release

- Hit test: the chip centre is inside the zone.
- While the chip centre is over the zone, the zone highlights: border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity about 0.5. That highlight is the drag-over state. There is no hover or focus style.
- Miss: the homing transition is committed on pointerup, layout is forced, and the rest `translate`, `rotate`, and `scale` are applied in that same frame, before paint. The return then runs 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)`. Overshoot is ≈9.75% of release distance (7.8px on 80px). The peak of that curve is about 287ms after pointerup. Ignore re-grabs during the return.
- Hit:
  - The chip fades out by 229ms, ease-out, with up to 2px of blur. Opacity is about 0.33 at 112ms.
  - The zone eases to scale 0.97 over 250ms, then back to 1 over 450ms. Both segments are ease-out.
  - The photo fills the zone, cover, radius 12, fading in over 380ms ease-in-out. The dashed border and label hide. The filled tile uses background `#f7f7f7` and the same shadow as the chip.
  - Puff: not visible until 260ms after the drop. One 1275ms ease-out then runs. It starts at opacity 0 and scale 0.96, peaks at opacity 0.9 at 16% of that run, and ends at opacity 0, +10px of drift, and scale `1 + 60/104` (about 1.577). Drift is about 4px at 600ms from the drop. The ring is a light grey warp with uneven lobes (noise frequency 0.035, seed 11, displacement 30, blur 0.35), drawn behind the zone so it does not grey the photo.
  - Reset: at 1815ms the photo fades over 400ms with `cubic-bezier(0, 0.65, 0.25, 0.9)` to a 4px blur. At about 1.9s that reads opacity 0.30 and blur 2.8px. The zone is empty at 2215ms. The chip respawns at 2265ms from scale 0.9 and opacity 0 over 250ms ease-out, and is fully visible at 2515ms. The respawn starts from those values, so the first frame does not jump to full opacity.

## Reduced motion

- Follows the OS `prefers-reduced-motion: reduce` setting and `html[data-reduce-motion="1"]`. The in-app Reduce Motion switch writes that attribute. Copy has no switch, so it follows the OS query.
- No transitions. State changes are instant. The zone empties at 1815ms and the chip respawns at 2265ms, already at scale 1 and opacity 1. The puff does not play.

## Native

- `src/demos/drag-drop/index.tsx` re-exports the gesture-handler scene in `src/demos/DragDrop.tsx` for native. The web card and Copy do not use that scene.
