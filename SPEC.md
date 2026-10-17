# Drag & drop with physics

Behaviour of the drag-and-drop card. Measurements below are the card's own values.

## Geometry at 1280 desktop

- Board 213×192, transparent.
- Chip 72×72 photo, radius 12, at left 141, top 0. Photo `object-fit: cover`. Soft multi-layer shadow: `0 1px 2px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.08), 0 18px 32px rgba(0,0,0,0.06)`.
- Zone 104×104 at left 0, top 88, radius 12. Border 2px dashed `rgba(0,0,0,0.1)`, background `rgba(234,234,234,0.2)`.
- Label "Drag & drop" / "it here": 11px, `#767676`, width 76, top 40, centred in the zone. Font stack `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. No font file is downloaded.
- Photo is a 746×944 CC0 crop of Jez Timms's rose. Unsplash: https://unsplash.com/photos/ODANAGrc168. Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg. Licence: https://creativecommons.org/publicdomain/zero/1.0/. The original demo uses a different 746×944 portrait.

## Drag

- Pointer down on the chip grabs it. Cursor is `grab`, then `grabbing` on the chip only (not `document.body`).
- Scale eases to 1.05 over 200ms with `cubic-bezier(0, 0.24, 0.43, 0.65)`. About 1.017 at 35ms.
- The chip follows the pointer 1:1.
- Tilt follows horizontal pointer velocity, clamped to ±10°, with a short ease (time constant 59.39ms). It holds the last tilt while the pointer is idle.
- Reference gestures for that gain (28 degrees per px/ms): about -5.6° on an 80px drag at 0.2 px/ms, about -7.4° on an 80ms flick that reaches the clamp, and about -8.5° at 400ms into a drag at 0.3036 px/ms.
- No throw or momentum.

## Release

- Hit test: the chip centre is inside the zone.
- While the chip centre is over the zone, the zone highlights: border `rgba(0,0,0,0.28)`, background `rgba(234,234,234,0.55)`, label opacity about 0.5. That highlight is the drag-over state. There is no hover or focus style.
- Miss: return to rest over 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)`, starting from the release point. Overshoot is ≈9.75% of release distance (7.8px on 80px). Tilt and scale go back to rest. Ignore re-grabs during the return.
- Hit:
  - The chip fades out by 229ms, ease-out, with up to 1.8px of blur. Opacity is about 0.33 at 112ms.
  - The zone squashes to 0.97 and eases back to 1 by 520ms.
  - The photo fills the zone, cover, radius 12, fading in over 445ms ease-in-out (about 0.13 at 112ms). The dashed border and label hide. The filled tile uses background `#f7f7f7` and a soft shadow: `0 2px 4px rgba(0,0,0,0.06), 0 10px 22px rgba(0,0,0,0.08)`.
  - Puff: from the hit through about 1460ms. Opacity ramps from 0 to about 0.9 at 460ms, then fades out. Scale eases out, about 1.135 at 500ms, ending at about 1.577 (`1 + 60/104`). It is a faint, soft, mid-grey rounded haze layered behind the zone so it does not grey or darken the photo. Noise seed is 9.
  - Reset: the photo fades out with a 1.5px blur from 1830ms to 2064ms. The chip respawns at 2271ms from scale 0.9 and opacity 0, and is fully visible at 2420ms.

## Reduced motion

- No transitions. State changes are instant. The zone empties at 1830ms and the chip respawns at 2271ms. The puff does not play.

## Native

- `src/demos/drag-drop/index.tsx` re-exports the gesture-handler scene in `src/demos/DragDrop.tsx` for native. The web card and Copy do not use that scene.
