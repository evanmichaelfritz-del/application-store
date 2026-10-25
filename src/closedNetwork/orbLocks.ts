import type { PromptLock } from '@/src/agentPrompts';

/** Per-asset locks for the nine thinking-orb cards. Paste the entries into LOCKS, replacing the ORB_GALLERY_LOCKS lines. */
export const ORB_LOCKS: Record<string, PromptLock> = {
  'orb-state-picker': {
    "motion": "One Skia canvas. State chips swap the engine preset in place; size chips resize it; neither remounts the canvas or resets t. Engine mapping at 64px: working → orbits speed 1.885 (516 dots at t 0.6); searching → globe speed 2.015 (204 dots at t 0.6); solving → rubik speed 1.82 (138 dots at t 0.6); listening → wave speed 4.388 (134 dots at t 0.6); connecting → web speed 3.315 (48 dots, 81 lines at t 0.6); composing → ribbon speed 2.34 (566 dots at t 0.6); breathing → ring speed 3.24 (484 dots at t 0.6). At 20px: working → orbits speed 3.9 (39 dots at t 0.6); searching → globe speed 2.665 (54 dots at t 0.6); solving → rubik speed 1.95 (30 dots at t 0.6); listening → wave speed 3.998 (42 dots at t 0.6); connecting → web speed 6.63 (9 dots at t 0.6); composing → ribbon speed 3.12 (208 dots at t 0.6); breathing → ring speed 3.78 (120 dots at t 0.6). Pause freezes the current t and keeps the picture; Play resumes at the wall-clock phase. Reduced motion holds t = 0.6. All motion is linear in wall time, no easing, no delay.",
    "content": "Left column 100 wide, centred, gap 6: the orb, a Pause/Play button (height 26, padding 10, radius 36, fill `rgba(255,255,255,0.06)`, 12px weight 500 `#ededed`), a Reset button with those same metrics, then size chips `64px`, `20px` and a locked `32px`. Right column: label `State` (11/14, `#979797`), then chips Working, Searching, Solving, Listening, Connecting, Composing, Breathing, plus locked Weaving and Shaping. Chips: height 24, padding 8, radius 36, gap 4, wrap; idle fill `rgba(255,255,255,0.06)` text `#ededed`; selected fill `#f4f4f5` text `#111111`; locked opacity 0.4 and disabled. Text 11px weight 500 `Inter, ui-sans-serif, system-ui, sans-serif`. Row: horizontal, gap 8, padding 10 × 8, scrollable. Defaults: state listening, size 64, playing.",
    "states": [
      {
        "name": "Default",
        "trigger": "Mount",
        "from": "",
        "to": "listening, 64px, playing (wave, speed 4.388)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "State chip",
        "trigger": "Press a free state chip",
        "from": "current preset",
        "to": "chosen preset, same canvas, same t base",
        "duration": "0ms (next frame)",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Size chip",
        "trigger": "Press 64px or 20px",
        "from": "current size",
        "to": "chosen size; canvas resizes, preset re-resolves for that size",
        "duration": "0ms (next frame)",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Locked chip",
        "trigger": "Press Weaving, Shaping, or 32px",
        "from": "current",
        "to": "no change (disabled)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Pause",
        "trigger": "Press Pause",
        "from": "running t",
        "to": "frozen t = now × speed at the moment of pause; label becomes Play",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Play",
        "trigger": "Press Play",
        "from": "frozen t",
        "to": "wall-clock t (jumps to current phase); label becomes Pause",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reset",
        "trigger": "Press Reset",
        "from": "current state, size, and pause flag",
        "to": "same chips and pause flag. The clock ref starts empty: a paused orb snaps its frozen t to the current wall-clock phase and stays paused; a playing orb keeps wall-clock t; reduced motion stays at t = 0.6",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion",
        "from": "live or frozen t",
        "to": "t = 0.6 for every state",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "Pause keeps the frozen t across state and size changes made while paused, because the frozen value is held in a ref and only cleared when playing resumes.",
      "Size presets exist only for 64 and 20; 32 has no engine preset and must stay a disabled chip.",
      "Weaving (braid) and Shaping (morph) exist in the engine but are disabled chips on this picker.",
      "State, size and paused live in component state with defaults listening / 64 / false; nothing else persists."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around the picker (orb, Pause/Play, size chips, state chips). Native needs no loader.",
    "checklist": [
      "Opens on Listening, 64px, playing; the Listening and 64px chips are selected.",
      "Pressing Working shows the orbits mode (516 dots at t 0.6, 64px) without a canvas remount.",
      "Pressing 20px shrinks the canvas to 20×20; Working at 20px is 39 dots at t 0.6.",
      "Connecting at 64px draws 41 nodes worth of web: 48 dots and 81 lines at t 0.6.",
      "Weaving, Shaping and 32px are at opacity 0.4 and do nothing when pressed.",
      "Pause freezes the frame and the button reads Play; Play resumes at the current wall-clock phase, not where it stopped.",
      "Reset keeps the selected state, size, and pause flag. A paused orb snaps to the current wall-clock phase and stays paused.",
      "Reduced motion: every state is still at t 0.6.",
      "Selected chip is `#f4f4f5` with `#111111` text; idle chips `rgba(255,255,255,0.06)` with `#ededed` text."
    ]
  },
  'orb-solving': {
    "motion": "`state=\"solving\" size={64}` paints the `rubik` frame mode on Skia. Engine speed 1.82: t = wall seconds × 1.82. Resolved options at 64px: latRings 9, lonDensity 24, moveCount 14, rBase 0.63, rDepth 1.785, rActive 0.315, inkFar 0.62, inkSpan 0.54, rsPow 0.6, rMin 0.3, rSizeMul 1.05. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (138 dots). Light ink on dark: dots are drawn white-inverted (`dark` true).",
    "content": "64px orb, then `Solving....`. Pill row: height 74, paddingLeft 9, paddingRight 28, gap 12, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 18/24 `Inter, ui-sans-serif, system-ui, sans-serif`, color `#ededed`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 1.82",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (138 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "Default size is 64 and default state is `working` when the props are omitted; this card passes `state=\"solving\"` and `size={64}` explicitly."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb state=\"solving\" size={64} />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 64×64 and does not take pointer events.",
      "Frame mode is `rubik`; engine speed 1.82.",
      "With reduce motion on, the orb is still and shows 138 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Solving....` in `#ededed` at 18px.",
      "Row height 74, radius 50, padding 9 left / 28 right, gap 12.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-thinking': {
    "motion": "motion key `msThinking` (engine state `breathing`, 64px) paints the `ring` frame mode on Skia. Engine speed 3.24: t = wall seconds × 3.24. Resolved options at 64px: lanes 3, segs 44, ghostN 0, faceOn 1, rBase 1.0516, rDepth 1.6252, rsPow 0.6, rMin 0.3, rSizeMul 0.956, spin 0, bandMul 3.627, wobMul 0.368. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (484 dots). Light ink on dark: dots are drawn white-inverted (`dark` true). Ring mode is the ribbon painter turned face-on (faceOn 1, ghostN 0): undulation moves onto the radius and there is no ghost sphere.",
    "content": "64px orb, then `Thinking....`. Pill row: height 74, paddingLeft 9, paddingRight 28, gap 12, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 18/24 `Inter, ui-sans-serif, system-ui, sans-serif`, color `#ededed`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 3.24",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (484 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "`msThinking` fixes the size at 64px; a size prop is ignored. The visible label is `Thinking....`, not the engine state name `breathing`.",
      "Do not label this card Breathing. It is a separate card from the 20px Agent thinking chip, which uses different resolved options."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb motionsource=\"msThinking\" />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 64×64 and does not take pointer events.",
      "Frame mode is `ring`; engine speed 3.24.",
      "With reduce motion on, the orb is still and shows 484 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Thinking....` in `#ededed` at 18px.",
      "Row height 74, radius 50, padding 9 left / 28 right, gap 12.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-agent-listening': {
    "motion": "`state=\"listening\" size={20}` paints the `wave` frame mode on Skia. Engine speed 3.998: t = wall seconds × 3.998. Resolved options at 20px: rings 5, lonDensity 13, rBase 0.96, rDepth 2.72, rsPow 0.6, rMin 0.3, rSizeMul 1.6. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (42 dots). Light ink on dark: dots are drawn white-inverted (`dark` true).",
    "content": "20px orb, then `Agent listening...`. Chip row: height 36, paddingLeft 8, paddingRight 14, gap 8, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 13/16 `Inter, ui-sans-serif, system-ui, sans-serif`: muted `Agent ` in `#8a8a8a`, then the action word in `#ffffff`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 3.998",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (42 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "Default size is 64 and default state is `working` when the props are omitted; this card passes `state=\"listening\"` and `size={20}` explicitly."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb state=\"listening\" size={20} />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 20×20 and does not take pointer events.",
      "Frame mode is `wave`; engine speed 3.998.",
      "With reduce motion on, the orb is still and shows 42 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Agent listening...` with `Agent ` muted `#8a8a8a` and the action `#ffffff`.",
      "Row height 36, radius 50, padding 8 left / 14 right, gap 8.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-searching': {
    "motion": "`state=\"searching\" size={64}` paints the `globe` frame mode on Skia. Engine speed 2.015: t = wall seconds × 2.015. Resolved options at 64px: latRings 11, lonDensity 29, rBase 0.69, rDepth 1.955, rBoost 1, inkFar 0.62, inkSpan 0.54, rsPow 0.6, rMin 0.3, rSizeMul 1.15, scanMul 4.08, dimBase 0.45. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (204 dots). Light ink on dark: dots are drawn white-inverted (`dark` true). Globe overlay extras: scanMul 4.08, dimBase 0.45.",
    "content": "64px orb, then `Searching....`. Pill row: height 74, paddingLeft 9, paddingRight 28, gap 12, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 18/24 `Inter, ui-sans-serif, system-ui, sans-serif`, color `#ededed`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 2.015",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (204 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "Default size is 64 and default state is `working` when the props are omitted; this card passes `state=\"searching\"` and `size={64}` explicitly."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb state=\"searching\" size={64} />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 64×64 and does not take pointer events.",
      "Frame mode is `globe`; engine speed 2.015.",
      "With reduce motion on, the orb is still and shows 204 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Searching....` in `#ededed` at 18px.",
      "Row height 74, radius 50, padding 9 left / 28 right, gap 12.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-agent-planning': {
    "motion": "motion key `msAgentPlanning` (engine state `composing`, 20px) paints the `ribbon` frame mode on Skia. Engine speed 3.12: t = wall seconds × 3.12. Resolved options at 20px: lanes 2, segs 20, ghostN 8, rBase 1.1803, rDepth 1.8241, rsPow 0.6, rMin 0.3, rSizeMul 1.073, spin 0, bandMul 4.94, wobMul 1. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (208 dots). Light ink on dark: dots are drawn white-inverted (`dark` true).",
    "content": "20px orb, then `Agent planning...`. Chip row: height 36, paddingLeft 8, paddingRight 14, gap 8, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 13/16 `Inter, ui-sans-serif, system-ui, sans-serif`: muted `Agent ` in `#8a8a8a`, then the action word in `#ffffff`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 3.12",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (208 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "`msAgentPlanning` fixes the size at 20px; a size prop is ignored. The visible label is `Agent planning...`, not the engine state name `composing`.",
      "This is the ribbon mode with composing options, not the orbits mode."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb motionsource=\"msAgentPlanning\" />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 20×20 and does not take pointer events.",
      "Frame mode is `ribbon`; engine speed 3.12.",
      "With reduce motion on, the orb is still and shows 208 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Agent planning...` with `Agent ` muted `#8a8a8a` and the action `#ffffff`.",
      "Row height 36, radius 50, padding 8 left / 14 right, gap 8.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-agent-thinking': {
    "motion": "motion key `msAgentThinking` (engine state `breathing`, 20px) paints the `ring` frame mode on Skia. Engine speed 3.78: t = wall seconds × 3.78. Resolved options at 20px: lanes 2, segs 15, ghostN 0, faceOn 1, rBase 1.7842, rDepth 2.7574, rsPow 0.6, rMin 0.3, rSizeMul 1.622, spin 0, bandMul 3.968, wobMul 0.565. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (120 dots). Light ink on dark: dots are drawn white-inverted (`dark` true). Ring mode, face-on, no ghost sphere.",
    "content": "20px orb, then `Agent thinking...`. Chip row: height 36, paddingLeft 8, paddingRight 14, gap 8, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 13/16 `Inter, ui-sans-serif, system-ui, sans-serif`: muted `Agent ` in `#8a8a8a`, then the action word in `#ffffff`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 3.78",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (120 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "`msAgentThinking` fixes the size at 20px; a size prop is ignored. The visible label is `Agent thinking...`, not the engine state name `breathing`."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb motionsource=\"msAgentThinking\" />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 20×20 and does not take pointer events.",
      "Frame mode is `ring`; engine speed 3.78.",
      "With reduce motion on, the orb is still and shows 120 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Agent thinking...` with `Agent ` muted `#8a8a8a` and the action `#ffffff`.",
      "Row height 36, radius 50, padding 8 left / 14 right, gap 8.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-working': {
    "motion": "`state=\"working\" size={64}` paints the `orbits` frame mode on Skia. Engine speed 1.885: t = wall seconds × 1.885. Resolved options at 64px: orbitN 12, ghostN 40, ghostR 0.9, ghostA 0.5, particles 3, partR 1.2, partRDepth 1.6, rsPow 0.6, rMin 0.3. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (516 dots). Light ink on dark: dots are drawn white-inverted (`dark` true).",
    "content": "64px orb, then `Working....`. Pill row: height 74, paddingLeft 9, paddingRight 28, gap 12, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 18/24 `Inter, ui-sans-serif, system-ui, sans-serif`, color `#ededed`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 1.885",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (516 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "Default size is 64 and default state is `working` when the props are omitted; this card passes `state=\"working\"` and `size={64}` explicitly."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb state=\"working\" size={64} />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 64×64 and does not take pointer events.",
      "Frame mode is `orbits`; engine speed 1.885.",
      "With reduce motion on, the orb is still and shows 516 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Working....` in `#ededed` at 18px.",
      "Row height 74, radius 50, padding 9 left / 28 right, gap 12.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
  'orb-agent-shaping': {
    "motion": "motion key `msAgentShaping` (engine state `shaping`, 20px) paints the `morph` frame mode on Skia. Engine speed 2.08: t = wall seconds × 2.08. Resolved options at 20px: rDot 0.021231, iconD 0.53, rMin 0.25, rSizeMul 1.011, spread 1.45. Continuous loop, linear in time, no easing and no delay. Reduced motion holds t = 0.6 (18 dots). Light ink on dark: dots are drawn white-inverted (`dark` true). Morph loop; no pinned frame time.",
    "content": "20px orb, then `Agent shaping...`. Chip row: height 36, paddingLeft 8, paddingRight 14, gap 8, radius 50, fill `rgba(29,29,29,0.72)`, 1px border `rgba(255,255,255,0.08)`. Label 13/16 `Inter, ui-sans-serif, system-ui, sans-serif`: muted `Agent ` in `#8a8a8a`, then the action word in `#ffffff`. The orb is centred on the stage with horizontal padding 12.",
    "states": [
      {
        "name": "Loop",
        "trigger": "Mount, visible, motion allowed",
        "from": "t = now × 2.08",
        "to": "next frame t",
        "duration": "continuous, one paint per display frame",
        "easing": "linear (wall clock)",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion",
        "trigger": "In-app flag or system reduce-motion turns on",
        "from": "live t",
        "to": "static t = 0.6 (18 dots)",
        "duration": "0ms, single repaint",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Reduced motion off",
        "trigger": "Both flags off",
        "from": "t = 0.6",
        "to": "wall-clock t, in phase",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Hidden",
        "trigger": "Tab hidden or app not active",
        "from": "running",
        "to": "last picture held, frame callback inactive",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      },
      {
        "name": "Visible again",
        "trigger": "Tab visible and app active",
        "from": "held picture",
        "to": "wall-clock t (jumps to current phase)",
        "duration": "0ms",
        "easing": "none",
        "delay": "0ms"
      }
    ],
    "gotchas": [
      "One shared frame pump: every orb subscribes to a single listener set. Only one OrbClockProvider owns the Reanimated `useFrameCallback`; the others wait and take over when the owner unmounts. Do not start a requestAnimationFrame loop per orb.",
      "Time is wall clock, not mount-elapsed: t = performance.now()/1000 × preset speed × speed prop. Changing state or size never resets t, and resuming after a hidden tab reads the wall clock again, so the orb comes back in phase.",
      "Reduced motion is the in-app flag ORed with the system setting (`AccessibilityInfo.isReduceMotionEnabled`, `reduceMotionChanged`, and `matchMedia(\"(prefers-reduced-motion: reduce)\")` change events). When on, the loop stops and the orb paints one static frame at t = 0.6.",
      "Visibility pause: `document.visibilityState === \"hidden\"` or AppState other than `active` stops the frame callback. The canvas stays mounted with its last picture.",
      "Ink is grey only: each dot or line colour is `Skia.Color([c, c, c, a])` where c = clamp(white, 0, 1), inverted when `dark` is true (the default), and a = alpha ?? 1. There is no hue, no P3 colour, and no look id on this orb.",
      "Dots with r ≤ 0 are skipped. Lines (only the web mode at 64px emits them) are stroked before dots are filled. Anti-aliasing is on.",
      "Each frame is recorded into an SkPicture (`PictureRecorder`, bounds 0,0,size,size) and handed to `<Picture>`. Never dispose a picture while it may still be drawn: Skia web paints on a later turn than the React commit. Keep every picture alive until unmount, then dispose after 3 animation frames inside try/catch. As written, every recorded picture is kept in a list until unmount, so a long-running orb holds one picture per painted frame.",
      "Do not put the resolved preset object in effect dependencies; it is a fresh object each render and loops setPicture ↔ effect. Depend on the primitive props only.",
      "One Skia `<Canvas>` (one WebGL surface on web) per orb, sized exactly size × size, with `pointerEvents: \"none\"`. State and size changes swap the preset, they do not remount the canvas. When the host withholds a surface, render an empty size × size View in its place.",
      "Web needs CanvasKit loaded once per page before any Canvas mounts: `LoadSkiaWeb({ locateFile: (file) => `/${file}` })`, which fetches `/canvaskit.wasm` from the web root. Serve it as `application/wasm` so streaming instantiation works. If WebGL is unavailable, route `MakeWebGLCanvasSurface` to `MakeSWCanvasSurface`. A host on a sub-path must change locateFile.",
      "Unknown motion mode does not throw: the motionsource resolver only `console.warn`s when the engine mode differs from the expected one, and still paints the engine preset.",
      "`msAgentShaping` fixes the size at 20px; a size prop is ignored. The visible label is `Agent shaping...`, not the engine state name `shaping`."
    ],
    "setup": "Dependencies (pins as the code declares them): `@shopify/react-native-skia` 2.6.2, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react` 19.2.3, `react-dom` 19.2.3, `react-native` 0.86.3, `react-native-web` ~0.21.0, `expo` ~57.0.23. Labels name the font stack `Inter, ui-sans-serif, system-ui, sans-serif`; this card's files do not load Inter themselves, so it falls back to the system font unless the host loads it. Run `npx setup-skia-web public` after install so `public/canvaskit.wasm` exists.\n\nEngine: the vendored thinking-orbs 0.3.1 frame engine (`MODE_FRAMES`, `resolvePreset`, `STATE_TO_MODE`), MIT. Files: `orbs/ThinkingOrb.tsx`, `orbs/clock.tsx`, `orbs/time.ts`, `orbs/types.ts`, `orbs/motionsource.ts`, `orbs/engine/`.\n\nMount: load CanvasKit once at the web root, then render `<OrbClockProvider reducedMotion={flag}>` around a row that renders `<ThinkingOrb motionsource=\"msAgentShaping\" />` followed by the label. Native needs no loader.",
    "checklist": [
      "Canvas is exactly 20×20 and does not take pointer events.",
      "Frame mode is `morph`; engine speed 2.08.",
      "With reduce motion on, the orb is still and shows 18 dots (t = 0.6).",
      "Dots are light grey/white on the dark row; no colour hue anywhere.",
      "Label reads `Agent shaping...` with `Agent ` muted `#8a8a8a` and the action `#ffffff`.",
      "Row height 36, radius 50, padding 8 left / 14 right, gap 8.",
      "Two orbs on one page share one frame callback; hiding the tab stops both, and on return they resume at the wall-clock phase.",
      "Unmounting the card disposes its pictures 3 animation frames later with no BindingError in the console."
    ]
  },
};
