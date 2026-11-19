# AGENT_PROMPT — Glisse

## Piece

- id: `glisse`
- title: Glisse
- subtitle: Liquid Glass controls on a wallpaper you can drag.

Kelvin Zhang (@kelvinzhg). Post: https://x.com/kelvinzhg/status/2114756680047321369. Repo: https://github.com/0kzh/glisse pinned at 4922c852a6866ee9991d2f8c715bb1cfbe7aa2b9. Site: https://glisse.kelvinzhang.com. The library is MIT, Copyright (c) 2026 Kelvin Zhang. The copied document carries that full licence.

## Stage content

A 640px stage, background #0c0c0c, `data-theme="dark"`. A 1300×1300 wallpaper sits in a scroller. On top: a Glass lens, a TabBar (Home, Browse, Radio, Library; Radio selected), a SegmentedControl (Day, Week, Month; Week selected), three Sliders (continuous, stepped, disabled), and a Wi-Fi Switch that starts on. A dock under them sets the Glass knobs. The credit names Kelvin Zhang (@kelvinzhg) and links the post, the repo, and glisse.kelvinzhang.com.

## Geometry and values

- Stage: width 100%, height 640px, background #0c0c0c.
- Wallpaper: 1300×1300. The scroller starts centred across and 30% down. A mouse drag scrolls it. The wheel scrolls it. The cursor is grab, and grabbing while the pointer is down.
- Glass lens: 210×150, radius 75px, background none. It does not take pointer events, so the wallpaper drags underneath it.
- Tab bar: four tabs, Radio selected. Segmented control: Day, Week, Month, Week selected.
- Continuous slider: aria-label Volume, value 40, step 1. Stepped slider: aria-label Stepped volume, value 40, step 10. Disabled slider: aria-label Disabled volume, value 40, disabled.
- Switch: aria-label Wi-Fi, checked.
- Knobs, on the Glass lens only: Bend 0 to 1 step 0.01, default 0.45 (`--lg-glass-bend`). Dispersion 0 to 2 step 0.05, default 0.4 (`--lg-glass-dispersion`). Blur 0 to 12 step 0.5, default 0, shown with px (`--lg-blur`). Rim 0 to 1 step 0.01, default 0.13 (`--lg-rim-shine`).
- Credit: 12px, line-height 16px, colour rgb(255 255 255 / 0.62), centred 10px from the bottom.

## States

| State | Trigger | From | To | Duration | Easing | Delay |
| --- | --- | --- | --- | --- | --- | --- |
| wallpaper | mouse drag or wheel on the scroller | the centred, 30% down rest | the pointer's scroll | follows the pointer | | |
| press | pointer down on a tab, segment, slider, switch, or knob | rest | the control's lens | his press spring | his spring | |
| release | pointer up | the lifted lens | rest | his release spring | his spring | |
| tab | click or drag a tab | the selected tab | the tab under the pointer | his selection spring | his spring | |
| segment | click or drag a segment | the selected segment | the segment under the pointer | his selection spring | his spring | |
| slider | drag a thumb | the current value | the value under the pointer | follows the pointer | | |
| switch | click Wi-Fi | off or on | the other | his spring | his spring | |
| bend | the Bend knob | 0.45 | 0 to 1 | follows the knob | | |
| dispersion | the Dispersion knob | 0.4 | 0 to 2 | follows the knob | | |
| blur | the Blur knob | 0px | 0px to 12px | follows the knob | | |
| rim | the Rim knob | 0.13 | 0 to 1 | follows the knob | | |
| disabled | the Disabled slider | value 40 | the same | | | |
| reduced | prefers-reduced-motion | a spring | the target at once | 0ms | | |

## Timing

Press, release, tab, segment, and switch use the springs in the vendored library (`createSpring` in `internal/spring.ts`, the press feel in `internal/press.ts`, the selection springs in `internal/segments.tsx`). A press on a slider or switch lifts that thumb into a lens. Holding a tab or segment lifts its selection into a lens. Reduced motion, from `prefers-reduced-motion: reduce`, snaps those springs.

## Reduced motion

`prefers-reduced-motion: reduce` snaps his springs. The stage does not add a second clock. The store's `data-reduce-motion` attribute is not what the library reads.

## Gotchas

- The copied document is one HTML file. Its script is the vendored library and this stage, bundled. The credit anchors are external URLs, and nothing fetches them.
- The MIT text, Copyright (c) 2026 Kelvin Zhang, is in that file. Stripping it is a failed copy.
- Chrome bends the backdrop with his SVG filter. Safari and Firefox use his canvas fallback in `internal/drawn.ts`. Do not replace that fallback.
- The wallpaper is an inlined drawing. It is not the Tahoe photo on his site.
- The Blur knob is his Frost knob: `--lg-blur`, 0 to 12, step 0.5. It is labelled Blur.
- The three volume sliders are on screen together. His site toggles one slider between Continuous, Stepped, and Disabled.
- The Glass knobs write custom properties on the lens. They do not retune the tab, segment, slider, or switch lenses. Those keep his own bend properties.

## Setup

Mount the HTML file. It has no install step and no run command. The script reads the custom properties on the Glass lens and listens for prefers-reduced-motion.

## Known gaps

Phone widths are a known gap. At a 1280 desktop the stage measures 974×640 and does not reflow. The wallpaper is an inlined 1300×1300 drawing, not the Tahoe photos. The docs refraction stage is 320px and also shows a Share button, a Continue button, a search field, and a theme switch. The docs toggle one slider; this stage shows Continuous, Stepped, and Disabled together. The frost knob is labelled Blur. The magnifier's drag spring is not in the library, so this lens stays put. The type is system-ui, not Akkurat Pro. Safari's canvas fallback was not measured here.

## Checklist

- [ ] Radio starts selected. Week starts selected. Volume is 40. Stepped volume is 40 at step 10. Disabled volume stays at 40. Wi-Fi starts on.
- [ ] Bend starts at 0.45, Dispersion at 0.4, Blur at 0px, Rim at 0.13. Each knob reaches its min and its max.
- [ ] Dragging the wallpaper moves it under the lens. Holding a tab, segment, slider, or switch lifts that control.
- [ ] The credit links the post, https://github.com/0kzh/glisse, and https://glisse.kelvinzhang.com.
- [ ] The document includes the MIT text and does not request a font, a script, or an image.

## Code

The copied HTML file is the runnable document. It inlines the stage, the vendored library, and the MIT licence.
