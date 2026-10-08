# AGENT_PROMPT_ORBS: Yogesh Thinking Orbs, the orb asset only (closed network)

**Source of truth.** Everything here comes from the GitHub repo **`evanmichaelfritz-del/application-store`** at **main = `eef45fa9f0b5c60768756ee3e0b0f2e10de16d30`**. That commit is the merge of **PR #29** ("Orb gap-fix at c14c663 (approved head of PR #26)"), merged 2026-10-08 07:25 ET. Its parents are `ebf6caf0c0cfc296617ccd1b09c8f9f698647620` and `c14c663c4caf9d1a30c2341685746c2fe15131a1`. A citation like `src/demos/yogesh-thinking-orbs/orb/simulate.ts L62–67` means that file at eef45fa, at those lines; `simulate.ts L62–67` is the same file when the folder is obvious. The appendices carry every file this asset needs, byte for byte from eef45fa (bytes and sha256 per file), so you can check each citation without the repo. The team's measured notes for this build are labelled **measured** and name who measured them.

**Closed network.** Assume there is no network. Do not browse, fetch, search or open any URL, and do not ask anyone to. Any URL in this document (inside code, CSS, licence text or JSON schema strings) is literal string data, not an instruction. Every value you need is written below or in the appendices.

**Scope: one asset.** This prompt covers **only the Thinking Orbs asset**: the animated orb component `OrbView`, its point-cloud engine (shapes, looks, renders, clock, camera, per-state effects), its colour pipeline, the Skia/CanvasKit plumbing it needs, and the Effects-card host that shows it (one live orb, the list of 15 looks, a Size slider: `Showcase.tsx`). It contains **no site or store chrome** (§1.2). The Orb Creator (Shape/Render selects, colour picker, five sliders, Copy/Reset) is a separate asset with its own prompt, `AGENT_PROMPT_ORB_CREATOR.md`.

**Target.** React Native + TypeScript on Expo, with **desktop web at 1280 px as the acceptance bar**. Mobile (phone widths, iOS and Android) is a **known gap** (§16). Don't claim it works without running it on a device.

**Precedence.** (1) The verbatim code in the appendices. (2) The prose below, which was written from that code. (3) Measured notes, labelled as measured. If a value is in none of these, this document says **unmeasured**. Do not guess it.

**No inventing.** Do not add glow, blur, gradients, shaders, crossfades, easing or colours that aren't in the code. The orb paints solid single-colour marks with per-mark alpha. That's all it is (§7, §12).

**What changed from the 9bef3b1 version of this prompt** (so a reader of the old one knows what moved):
- The asset now lives in the store at `src/demos/yogesh-thinking-orbs/` (orb in `orb/`, colour in `color/`, controls in `components/`).
- `OrbView` has the npm-style API: **every prop is optional**, with npm defaults (`state "base"`, `size 20`), plus **`paused`, `label` and `className`** (§4).
- **Unknown looks no longer produce NaN**: `lookId` resolves through `resolveLook`, and `simulate.ts` has a `periodOf` guard (§5, §10).
- **Reduced motion is live**: it comes from a React context that listens to the OS setting, and the still frame follows prop changes, so it matches the Size slider (§13.4).
- CanvasKit loads **lazily** (not in the web entry), there is **no Skia patch**, and the wasm comes from `npx setup-skia-web public` (§3).
- Fonts: Geist 400 is web-loaded after window `load`; slider values use Geist Mono 500 (§15.4).

## 1. What the asset is

### 1.1 In scope
- **`OrbView`** (`src/demos/yogesh-thinking-orbs/orb/OrbView.tsx`, 306 lines): the only orb component. A square Skia `<Canvas>` inside a sized box (a web `div` or a native `View`), animating a 3-D point cloud and drawing it in one of 8 renders.
- **Engine** (a TypeScript port of npm `@yogesharc/thinking-orbs` 0.1.1, MIT © 2026 Yogesh; notice in `orb/LICENSE`), all in `src/demos/yogesh-thinking-orbs/orb/`:
  - `orbProps.ts`: public prop defaults, the 8 states, their variants, the 15 known look ids and `resolveLook` (new in eef45fa).
  - `orbProps.check.ts`: a runnable assertion script for `resolveLook` and the NaN guard (new in eef45fa).
  - `model.ts`: geometry build (`buildInput`), the renders list, `lookId`.
  - `shapes.ts`: cube, octahedron, tetrahedron and torus point layouts.
  - `simulate.ts`: per-frame motion (`step`), camera, per-state effects, tone grid.
  - `draw.ts`: Skia drawing of the 8 renders.
  - `clock.ts`: the shared per-look clock.
- **Colour** (`src/demos/yogesh-thinking-orbs/color/color.ts`): `OrbView` imports `parseColor`, `toSrgb` and `toExtendedSrgb` (`OrbView.tsx` L20). The whole file is inlined because it is one module.
- **Runtime dependencies `OrbView` imports from outside its folder** (both inlined):
  - `src/context/ReduceMotionContext.tsx`: `useReduceMotion()` (`OrbView.tsx` L7, L103–105). It throws if there is no `ReduceMotionProvider` above it (`ReduceMotionContext.tsx` L42–46).
  - `src/skia/liveBudget.tsx`: `useSkiaRuntime()` (`OrbView.tsx` L18, L301). Without a provider it returns `{ mount: true, running: true }` (`liveBudget.tsx` L22–28).
- **CanvasKit boot on web** (inlined): `src/skia/ensureCanvasKit.web.ts`, `src/skia/bootCanvasKit.ts`, the native stub `src/skia/ensureCanvasKit.ts` and `src/skia/canvasKit.d.ts`.
- **The Effects-card host** (reference host, §15): `src/demos/yogesh-thinking-orbs/Showcase.tsx` and what it imports: `components/SliderRow.tsx` (the Size slider), `content/cards.ts` (the 15 looks), `hooks/useArrowKeys.web.ts` / `useArrowKeys.ts` (↑/↓), `theme/theme.tsx` (palette, fonts, `ThemeProvider`) and `src/skia/cardState.ts` (`useCardField`, in-memory card state).

### 1.2 Excluded (store chrome or other assets)
- **Store chrome:** the card frame `Stage` (`src/components/Stage.tsx`) and the wrapper `src/demos/yogesh-thinking-orbs/index.tsx`, the lazy Skia loader and canvas budget (`src/skia/DeferredSkiaDemo.tsx`, `src/skia/skiaCards.tsx`, `src/catalog.ts`, the `registerSkiaCard` half of `liveBudget.tsx`), the card's Copy/prompt buttons (`copySlots.ts`, `copy/*.md`, `loadPrompt.ts`, `src/agentPrompts.ts`), the store app shell (`app/*`, top nav, filters, toasts) and `metro.config.js` beyond the one `wasm` line in §3. §15.1 says what the host must provide instead.
- **The Orb Creator** (`Tuner.tsx`, `SelectRow.tsx`, `ColorPicker*.tsx`, `Shimmer*.tsx`, `icons.tsx`, `content/snippet.ts`): see `AGENT_PROMPT_ORB_CREATOR.md`. `OrbView` imports none of them (`OrbView.tsx` L1–24).
- `Showcase.tsx` does not pass `live`, `speed`, `tilt`, `shape` or `render`. Those props still exist and are documented (§4, §14) because they are part of the orb's API.

## 2. File structure (asset files only, paths as in the repo)

```
package.json                                     pins (§3.1); postinstall = npx setup-skia-web public
babel.config.js                                  babel-preset-expo + react-native-worklets/plugin (Appendix 22)
tsconfig.json                                    strict, extends expo/tsconfig.base, "@/*" → "./*" (Appendix 23)
vercel.json                                      static export; serves /canvaskit.wasm as application/wasm (§3.4, cited only)
public/canvaskit.wasm                            GENERATED by `npx setup-skia-web public`; gitignored (.gitignore last line)
src/skia/ensureCanvasKit.web.ts                  shared lazy CanvasKit load (web)                        Appendix 14
src/skia/bootCanvasKit.ts                        LoadSkiaWeb + software-surface fallback                 Appendix 15
src/skia/ensureCanvasKit.ts                      native no-op                                            Appendix 16
src/skia/canvasKit.d.ts                          global CanvasKit type                                   Appendix 17
src/skia/liveBudget.tsx                          SkiaRuntimeContext + useSkiaRuntime (+ store budget)    Appendix 12
src/skia/cardState.ts                            useCardField: in-memory per-card state                  Appendix 18
src/context/ReduceMotionContext.tsx              ReduceMotionProvider + useReduceMotion                  Appendix 11
src/demos/yogesh-thinking-orbs/
  orb/OrbView.tsx                                the component                                           Appendix 1
  orb/orbProps.ts                                defaults, states, variants, resolveLook                 Appendix 2
  orb/orbProps.check.ts                          `npx tsx` assertion script                              Appendix 3
  orb/model.ts                                   buildInput, RENDERS, isFlat, lookId, nearest            Appendix 4
  orb/shapes.ts                                  cube / octahedron / tetrahedron / torus                 Appendix 5
  orb/simulate.ts                                step(), makeLocal(), toneAt(), PERIOD, periodOf          Appendix 6
  orb/draw.ts                                    drawOrb(): Skia calls for the 8 renders                 Appendix 7
  orb/clock.ts                                   tick(): one forward-only clock per look@speed           Appendix 8
  orb/LICENSE                                    MIT, © 2026 Yogesh                                      Appendix 9
  color/color.ts                                 parseColor, toSrgb, toExtendedSrgb (+ picker helpers)   Appendix 10
  Showcase.tsx                                   Effects-card host: list + orb + Size                    Appendix 13
  components/SliderRow.tsx                       the Size slider                                         Appendix 19
  content/cards.ts                               LANDING / PLAYGROUND looks and labels                   Appendix 20
  hooks/useArrowKeys.web.ts, useArrowKeys.ts     ↑/↓ cycles the list (web) / native no-op                Appendix 21a, 21b
  theme/theme.tsx                                palette, fonts, ThemeProvider, Geist 400 web load       Appendix 24
```

There are no web/native splits inside `orb/`. The platform differences are runtime branches: `canUseExtendedColor()` (`OrbView.tsx` L48–52) and `OrbFrame` (L161–196). The split files are `ensureCanvasKit.web.ts` vs `ensureCanvasKit.ts`, and `useArrowKeys.web.ts` vs `useArrowKeys.ts`.

Imports use the `@/` alias (`OrbView.tsx` L7, L18; `Showcase.tsx` L3), which `tsconfig.json` maps to the project root (L5–9). Keep the same paths so the imports resolve unchanged.

## 3. Dependencies, Skia/CanvasKit setup and wasm loading

### 3.1 Versions (spec from `package.json`, resolved from `package-lock.json`, both at eef45fa)

| Package | Spec | Resolved | Why this asset needs it |
|---|---|---|---|
| `@shopify/react-native-skia` | `2.6.2` (**exact**, L10) | 2.6.2 (MIT) | Canvas, Picture, PictureRecorder, Paint, Path; `LoadSkiaWeb` |
| `canvaskit-wasm` | (transitive, Skia's own dependency) | **0.41.0** (BSD-3-Clause) | the web Skia runtime |
| `react-native-reanimated` | `4.5.1` (L29) | 4.5.1 | `useFrameCallback`, `useSharedValue`, `runOnUI`, `makeMutable`; slider springs |
| `react-native-worklets` | `0.10.1` (L34) | 0.10.1 | worklet runtime; its Babel plugin is in `babel.config.js` L5 |
| `react-native-gesture-handler` | `~2.32.0` (L28) | 2.32.0 | the Size slider's `GestureDetector` |
| `expo-constants` | `~57.0.18` (L13) | 57.0.18 | `ExecutionEnvironment.StoreClient` (Expo Go colour clamp) |
| `expo-router` | `~57.0.21` (L18) | 57.0.21 | `useIsFocused` (`OrbView.tsx` L5, L299); `usePathname` (`theme.tsx` L2, L133) |
| `expo-font` | `~57.0.4` (L14) | 57.0.4 | `loadAsync` (Geist 400, `theme.tsx` L1, L123); `useFonts` (Geist Mono 500, `SliderRow.tsx` L2, L76) |
| `@expo-google-fonts/geist` | `^0.4.2` (L6) | 0.4.2 (MIT AND OFL-1.1) | `Geist_400Regular` (web-loaded, §15.4) |
| `@expo-google-fonts/geist-mono` | `^0.4.3` (L7) | 0.4.3 (MIT AND OFL-1.1) | `GeistMono_500Medium` (slider value text) |
| `expo` | `~57.0.23` (L11) | 57.0.23 | SDK |
| `react-native` | `0.86.3` (L27) | 0.86.3 | `Platform`, `View`, `AccessibilityInfo` |
| `react-native-web` | `~0.21.0` (L33) | 0.21.2 | web |
| `react` / `react-dom` | `19.2.3` (L25–26) | 19.2.3 | `createElement`, `useLayoutEffect`, `useSyncExternalStore` |
| `typescript` (dev) | `~6.0.3` (L39) | 6.0.3 | |
| `babel-preset-expo` | (transitive) | 57.0.12 | the only preset (`babel.config.js` L4) |

- `package.json` has `"engines": { "node": ">=20" }` (L49–51). React Native 0.86.3's own `engines.node` is `^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0` (lockfile).
- **There is no `patches/` folder and no `patch-package` at eef45fa.** The 9bef3b1 Skia patch (P3 web surface, iOS `setColor4f`) is gone, so Skia 2.6.2 runs unpatched (§12.3).
- **Install:** `npm ci` against the lockfile, from an offline cache or internal mirror. If packages aren't available locally, stop and report it. Don't change the Skia version.

### 3.2 postinstall: the wasm copy
- `package.json` L47: `"postinstall": "npx setup-skia-web public"`. L46 `export:web` runs the same command before `expo export --platform web`.
- `setup-skia-web` is the `bin` of `@shopify/react-native-skia` 2.6.2 (`scripts/setup-canvaskit.js` inside the installed package). Its own doc comment says it resolves `canvaskit-wasm/bin/full/canvaskit.wasm` and copies it to `<project>/public/canvaskit.wasm`. For canvaskit-wasm 0.41.0 that file was recorded at **8,076,553 B**, sha256 `eb68c7a7f602d8cb89915352c4471a2d26edfd72000f78202cb1fe32ce1f9dc4`, on the 9bef3b1 build (same package version). It has **not** been re-measured at eef45fa.
- `public/canvaskit.wasm` is gitignored (`.gitignore` last line, "CanvasKit wasm (copied from canvaskit-wasm for Expo web; too large for git)").
- `metro.config.js` L6–8 adds `wasm` to `resolver.assetExts`. The rest of that file is store tooling (raw-text imports, a `three` shim) and is not part of this asset.

### 3.3 Web: CanvasKit loads lazily, before any Skia module evaluates
- The web entry does **not** load Skia. `index.web.tsx` L12–13: "CanvasKit stays out of boot. The first Skia card within 200px calls the shared LoadSkiaWeb in src/skia/ensureCanvasKit.web.ts."
- `ensureCanvasKit()` (`ensureCanvasKit.web.ts` L13–21): resolves at once if `globalThis.CanvasKit` exists (`canvasKitReady`, L3–5); otherwise it starts one shared promise, `import('./bootCanvasKit').then((mod) => mod.bootCanvasKit())` (L18), and every later caller awaits the same promise. `canvasKitPending()` (L8–10) is true while it is in flight.
- `bootCanvasKit()` (`bootCanvasKit.ts` L25–44): `LoadSkiaWeb({ locateFile: (file) => \`/${file}\` })` (L26–28), so the wasm is fetched from the **site root**, `/canvaskit.wasm`. Then, if CanvasKit has `MakeSWCanvasSurface` and `canUseWebGL()` (L3–17) is false, it replaces `MakeWebGLCanvasSurface` with the software surface (L38–42). The comment at L38–39 gives the reason: a failed `getContext('webgl2')` poisons the element for software surfaces.
- **Ordering rule** (`ensureCanvasKit.web.ts` L16–17): "bootCanvasKit must finish before skiaCards evaluates Skia.web.js, which snapshots globalThis.CanvasKit at module init." So **any module that imports `@shopify/react-native-skia` (here `OrbView.tsx`, and through it `Showcase.tsx`) must be first evaluated after `ensureCanvasKit()` has resolved.** The store does this with `React.lazy` around a dynamic import that first awaits `ensureCanvasKit()` (`src/catalog.ts` L30–41, store chrome, not inlined). A standalone host needs the same order: await `ensureCanvasKit()`, then load the module that imports `OrbView`.
- `ensureCanvasKit.ts` (native, L1–12) is a stub: ready is `true`, pending is `false`, `ensureCanvasKit()` resolves immediately. Native Skia is linked.
- `canvasKit.d.ts` declares `var CanvasKit: unknown | undefined` on `globalThis` (L1–5).
- `WithSkiaWeb` is **not** used anywhere. Don't introduce it.

### 3.4 Static export and serving (desktop web)
1. `npx setup-skia-web public && npx expo export --platform web` (`vercel.json` L5; `package.json` L46) produces `dist/` (`vercel.json` L6).
2. Check that `dist/canvaskit.wasm` exists, copied from `public/`. Without it no orb paints, because `LoadSkiaWeb` never resolves.
3. Serve `/canvaskit.wasm` as **`application/wasm`** (`vercel.json` L10–15). `bootCanvasKit.ts` L21–23 notes that CanvasKitInit uses `WebAssembly.instantiateStreaming` when the wasm is served as `application/wasm`.
4. SPA rewrite: every path except `canvaskit.wasm` and `prompts/` goes to `/index.html` (`vercel.json` L7–9). Never answer the wasm request with HTML.
5. Dev: `npm run web` = `expo start --web --port 43181` (`package.json` L45).

### 3.5 Gotchas (from the code)
- **WebGL context cap.** Each `OrbView` is its own Skia canvas and WebGL surface. The store caps live Skia surfaces at **6** (`SKIA_CANVAS_CAP`, `liveBudget.tsx` L7) and mounts a card when it is within **200 px** of the viewport (`SKIA_NEAR_MARGIN_PX`, L4). That budget is store chrome; `OrbView` only reads its result through `useSkiaRuntime()` (§13.5).
- **Picture lifetime.** Never `dispose()` a picture that may still be on screen. `paint()` keeps the previous picture in `retire` for one frame and disposes the one before it (`OrbView.tsx` L121–124).
- **Never `setState` per frame.** All per-frame work is in a Reanimated `useFrameCallback` worklet writing a `SharedValue<SkPicture>` (L269–285).
- **Providers.** `OrbView` needs a `ReduceMotionProvider` above it (it throws otherwise) and an expo-router navigator (`useIsFocused`). `Showcase` also needs `ThemeProvider` (§15.1).

## 4. Public API (exactly as merged at eef45fa)

### 4.1 `OrbView` props (`OrbView.tsx` L75–101; defaults applied in `OrbCanvas` L198–216 from `orbProps.ts` L65–72)

**Every prop is optional.**

| Prop | Type (verbatim) | Default | Default source | Effect |
|---|---|---|---|---|
| `state` | `string` | `"base"` | `ORB_DEFAULT_STATE` (`orbProps.ts` L65; `OrbView.tsx` L199) | Look family. Resolved with `variant` through `resolveLook` (§5). Doc comment L76: "Omitted state is npm's `base`. Unknown ids resolve inside `buildInput`." |
| `variant` | `string` | `undefined` | none | Variant of the state. Unknown or `"default"` gives the state's default look (§5). |
| `size` | `number` | `20` | `ORB_DEFAULT_SIZE` (`orbProps.ts` L66; L201) | Box and canvas are `size × size` px (L155, L180, L191). Also sets point count, radius and mark size (§8). Doc comment L79: "npm default is 20." |
| `speed` | `number` | `1` | `ORB_DEFAULT_SPEED` (`orbProps.ts` L68; L202) | Clock rate multiplier (§9). Part of the clock key `state@speed`. |
| `density` | `number` | `1` | `ORB_DEFAULT_DENSITY` (`orbProps.ts` L69; L203) | Point count multiplier (§8). |
| `dotSize` | `number` | `1` | `ORB_DEFAULT_DOT_SIZE` (`orbProps.ts` L70; L204) | Mark radius multiplier (§8). |
| `tilt` | `number` (degrees) | `20` | `ORB_DEFAULT_TILT` (`orbProps.ts` L71; L205) | Camera pitch from above; ignored on flat renders (§10). |
| `shape` | `ShapeName` = `"sphere" \| "cube" \| "octahedron" \| "tetrahedron" \| "torus"` | `"sphere"` | literal (L206) | Point layout (§6). |
| `render` | `RenderName` = `"dots" \| "crosses" \| "dashes" \| "halftone" \| "lines" \| "mesh" \| "squares" \| "verticalLines"` | `"dots"` | literal (L207) | How points are drawn (§7). |
| `color` | `string` | `"#ffffff"` | `ORB_DEFAULT_COLOR` (`orbProps.ts` L67; L208) | Any string `parseColor` accepts (§12). An unparseable string paints white (L56). Doc comment L87: "Omitted color paints the dark-store stand-in for npm `currentColor`." |
| `active` | `boolean` | `true` | literal (L209) | `false` keeps the canvas mounted but stops ticking (L89). `OrbView` passes `active={props.active !== false && runtime.running}` (L305). |
| `paused` | `boolean` | `false` | `ORB_DEFAULT_PAUSED` (`orbProps.ts` L72; L210) | npm `paused` (L91: "hold the frame and do not tick"). Entering pause holds the current frame at the clock's current t; prop edits while paused repaint at that held t (L247–267; §13.3). |
| `label` | `string` | `undefined` | none | Screen-reader name (L93: "Without one the orb is hidden from assistive tech"). Web: the box gets `role="img"` and `aria-label`; without a label it gets `aria-hidden` (L177–179). Native: `accessibilityRole "image"` + `accessibilityLabel`, or hidden (L187–190). |
| `className` | `string` | `undefined` | none | Web `className` on the orb's box `div` (L95, L176). Not used on native. |
| `live` | `SharedValue<OrbLive>` | `undefined` | none | When set, each frame reads speed, tilt and colour from it on the UI thread instead of from props (L273; §14.3). |
| `onFrame` | `(uri: string) => void` | `undefined` | none | On **unmount**, receives the last frame as `data:image/png;base64,…` (L139–153). |

`orbProps.ts` also exports `OrbPassProps` and `normalizeOrbProps()` (L91–113), the npm-default normaliser for `state`/`size`/`speed`/`color`/`paused`/`label`/`className`. In eef45fa only `orbProps.check.ts` calls it (L137–140); `OrbView` applies the same defaults directly in its parameter list.

### 4.2 Render logic (`OrbView`, L298–306, exported as `memo`)
1. `useIsFocused()` false → returns `null` (L299, L303).
2. `useSkiaRuntime().mount` false → returns an empty `<View style={{ width: size, height: size }} />` placeholder, where `size = props.size ?? 20` (L301–302, L304).
3. Otherwise → `<OrbCanvas {...props} reduced={reduced} active={props.active !== false && runtime.running} />` (L305), with `reduced = useReduceMotion().reduceMotion` (L103–105, L300).

Inside `OrbCanvas`, `running = active && !paused && !reduced` (L220). Only a running orb registers an active frame callback (L285, L287–289).

### 4.3 The DOM/native box (`OrbFrame`, L161–196)
- **Web:** `createElement("div", { className, role: label ? "img" : undefined, "aria-label": label, "aria-hidden": label ? undefined : true, style: { width: size, height: size, lineHeight: 0 } }, children)` (L172–183).
- **Native:** `<View accessibilityRole={label ? "image" : undefined} accessibilityLabel={label} accessibilityElementsHidden={label ? undefined : true} importantForAccessibility={label ? "auto" : "no-hide-descendants"} style={{ width: size, height: size }}>` (L185–195).
- Inside it: `<Canvas ref style={{ width: size, height: size }} pointerEvents="none" colorSpace="p3"><Picture picture={picture} /></Canvas>` (L154–158). The canvas has no background: the host's background shows through.

### 4.4 Types and other exports
- `OrbViewProps` (L75–101) is exported. `OrbLive` (L26–36): `{ size: number; speed: number; density: number; dotSize: number; tilt: number; r: number; g: number; b: number; a: number }`.
- `canUseExtendedColor(): boolean` (L48–52): `android` → false; `ios` → `Constants.executionEnvironment !== ExecutionEnvironment.StoreClient`; anything else (web) → true.
- `colorToRgba(color: string)` (L54–59): `parseColor` null → `{1,1,1,1}`; `!canUseExtendedColor()` → `toSrgb(parsed)`; otherwise `toExtendedSrgb(parsed)`.
- From `orbProps.ts`: `OrbStateName` (L7–15), `VARIANTS` (L17–26), `KnownLook` (L28–43), `KNOWN_LOOKS` (L45–61), the 8 `ORB_DEFAULT_*` constants (L65–72), `isOrbState` (L74–76), `isKnownLook` (L78–80), `resolveLook` (L82–89), `OrbPassProps` and `normalizeOrbProps` (L91–113).
- From `model.ts`: `RENDERS` (L11–20), `RenderName` (L21), `ShapeName` (re-exported, L9), `isFlat(render)` (L28–30: true for `halftone`, `lines`, `verticalLines`), `nearest` (L37–58), `OrbInput` (L88–108), `lookId` (L112–115), `buildInput` (L117–184).
- From `shapes.ts`: `cube`, `octahedron`, `tetrahedron`, `torus` (each `{ scale, points(count, look) }`; torus also has `tip: 35`), `SHAPES`, `Pt`.
- From `simulate.ts`: `makeLocal`, `step`, `toneAt`, `OrbLocal`. From `clock.ts`: `clocks`, `tick`. From `draw.ts`: `drawOrb`.

## 5. Every state and variant (15 looks) and how unknown ids resolve

### 5.1 Resolution (`orbProps.ts` L82–89; `model.ts` L112–115)
`buildInput` calls `lookId(opts.state, opts.variant)` (`model.ts` L126), and at eef45fa `lookId` simply returns `resolveLook(state, variant)` (`model.ts` L112–115). `resolveLook`:
1. `which` = `state` if it is one of the 8 states in `VARIANTS` (`isOrbState`, own-property check, L74–76), else `"base"` (L83).
2. `own` = `variant` is defined, is not `"default"`, and is in `VARIANTS[which]` (L84–85).
3. `id = own ? \`${which}-${variant}\` : which` (L86). If `id` is in `KNOWN_LOOKS`, return it; else return `"base"` (L87–88).

Consequences (each asserted in `orbProps.check.ts` L128–135, which I ran with `npx tsx` against the eef45fa files: it prints `orb props ok`):
- `resolveLook()` → `base`; `resolveLook("nope")` → `base`.
- `resolveLook("working-gyro")` → **`base`**: a combined id passed as `state` is **not** a state. Always pass the variant separately.
- `resolveLook("working", "gyro")` → `working-gyro`; `("working", "nope")` → `working`; `("working", "default")` → `working`; `("compacting", "fuse")` → `compacting-fuse`; `("compacting", "squeeze")` → `compacting-squeeze`.
- Every state × every variant name (plus `"nope"`) resolves to one of the 15 known ids (L142–148).

**NaN guard.** If an unknown id ever reaches `step()` anyway, `periodOf()` returns **6500** (`simulate.ts` L62–67) and both the yaw (L76) and `period` (L162) use it, so no dot becomes NaN. The check script builds a slipped input with `state: "not-a-look"` and asserts every dot is finite (`orbProps.check.ts` L158–163).

### 5.2 The 15 looks
`VARIANTS` (`orbProps.ts` L17–26): base [default]; working [default, gyro]; reasoning [default, twins]; searching [default, lighthouse]; background [default, spiral]; retrying [default, surge]; compacting [default, squeeze, fuse]; waiting [default]. `KNOWN_LOOKS` is the 15 ids below (L45–61). Periods are from `simulate.ts` L24–40. Labels and status text are `PLAYGROUND` in `content/cards.ts` L135–151 (the `Look` type is L4–15); the Effects card shows the `playground` label (`Showcase.tsx` L57).

| # (list order) | look id | `state`, `variant` | Label (`playground`) | Status text (`status`, verbatim) | PERIOD ms | Engine branch |
|---|---|---|---|---|---|---|
| 0 | `base` | base | Base | "Working" | 6500 | plain spin §11.1 |
| 1 | `working` **(selected on load)** | working | Working | "Working" | 3000 | ring sweep §11.4 |
| 2 | `working-gyro` | working, gyro | Working · Gyro | "Working" | 3000 | gyro camera §10.2 + twist §11.8 |
| 3 | `reasoning` | reasoning | Reasoning | "Thinking" | 6500 | 1 walk §11.6 |
| 4 | `reasoning-twins` | reasoning, twins | Reasoning · Twins | "Thinking" | 6500 | 2 repelling walks §11.6 |
| 5 | `searching` | searching | Searching | "Searching web" | 13000 | lens §11.2 |
| 6 | `searching-lighthouse` | searching, lighthouse | Searching · Lighthouse | "Searching files" | 13000 | beam §11.5 |
| 7 | `background` | background | Background | "1 Background Task" | 13000 | `dens = 1` §8 |
| 8 | `background-spiral` | background, spiral | Background · Spiral | "2 Background Tasks" | 13000 | spiral layouts §6 |
| 9 | `retrying` | retrying | Retrying | "Retrying — attempt 2 of 10" | 13000 (yaw uses rewind) | §10.3 |
| 10 | `retrying-surge` | retrying, surge | Retrying · Surge | "Retrying — attempt 3 of 10" | 13000 (yaw uses surge) | §10.3 |
| 11 | `compacting` | compacting | Compacting | "Compacting context" | 10000 | sweep k=1.5 §11.3 |
| 12 | `compacting-squeeze` | compacting, squeeze | Compacting · Squeeze | "Compacting context" | 10000 | twist only §11.8 |
| 13 | `compacting-fuse` | compacting, fuse | Compacting · Fuse | "Compacting context" | 10000 | sweep k=1 + burn §11.3 |
| 14 | `waiting` | waiting | Waiting | "Waiting for usage limit to reset" | 13000 | comet §11.7 |

- The `—` in the Retrying rows is an em dash, U+2014. `cards.ts` is byte-identical to the 9bef3b1 file.
- The Effects card selects index **1** (Working) on load (`Showcase.tsx` L18). It never shows the status text; that belongs to the creator's status line.

## 6. Shapes (`src/demos/yogesh-thinking-orbs/orb/shapes.ts`; sphere in `src/demos/yogesh-thinking-orbs/orb/model.ts` L60–86)

Every shape produces unit-scale model points `[x, y, z]`. `buildInput` asks for `asked = max(8, round(size · dens · density))` points (`model.ts` L129). Only the sphere returns exactly `asked`; the polyhedra and torus return whatever their lattice gives. The screen radius is `R = (size/2) · 0.8 · scale` (`model.ts` L131–132).

**sphere** (scale 1; `model.ts` L75–86)
- Default: a Fibonacci sphere. For i = 0…count−1: `y = 1 − 2(i+0.5)/count`, `r = sqrt(1 − y²)`, `θ = i·GOLDEN` with `GOLDEN = π(3 − √5)` (`model.ts` L24), point `[r·cos θ, y, r·sin θ]`.
- `background-spiral`: `arms(count)` (`model.ts` L60–73), 8 arms:
  - `g = sqrt(4π/count)`, `along = 0.6g`;
  - for arm m = 0…7: `room = m ? (m & −m) : 8`, `lim = min(85°, acos(min(1, g·8/(2π·room))))`;
  - lat runs from `−lim + ((m·0.618) mod 1)·along` to `lim`, stepping `along / sqrt(1 + cos²(lat))`;
  - the point is at `lon = (m/8)·2π − lat`: `[cos lat·cos lon, sin lat, cos lat·sin lon]`.

**cube** (scale 1.2; `shapes.ts` L48–64)
- Default: `n = max(1, round(sqrt((count−2)/6)))`, `at(i) = 2i/n − 1`. Loop a, b, c over 0…n and keep the point if any of a, b, c is 0 or n (`a % n === 0 || …`). The point is `[at(a), at(b), at(c)] / √3`.
- `background-spiral`: `layers("cube")` (L16–30): 6 square rings at `y = h·(2i/5 − 1)` with `h = 1/√3`, corners `(±h, ±h)`. Edges are subdivided with `gap = 0.6·sqrt(4π/count)` (`steps = max(1, round(edge/gap))`), then each point is remapped to `[y, x, z]`.

**octahedron** (scale 1.2; L66–80)
- Default: `n = max(1, round(sqrt((count−2)/4)))`. For i = −n…n and j = |i|−n … n−|i|: `k = n − |i| − |j|`. Push `[i/n, j/n, k/n]`, and if k ≠ 0 also `[i/n, j/n, −k/n]`.
- `background-spiral`: `layers("octahedron")` (L31–38): poles `[0, 1, 0]` and `[0, −1, 0]`, plus 6 diamond rings at `y = 2i/7 − 1` (i = 1…6), half-width `w = 1 − |y|`, corners `(w,0), (0,w), (−w,0), (0,−w)`.

**tetrahedron** (scale 1.2; L82–114)
- `TRI = sqrt(8/9)` (L8). Top `[0, 1, 0]`; base corners `[TRI·cos(2πk/3), −1/3, TRI·sin(2πk/3)]`, k = 0, 1, 2.
- Default: `n = max(1, round(sqrt((count−2)/2)))`. Each of the 4 faces is subdivided barycentrically (i + j ≤ n), and points are de-duplicated on a key rounded to 1e-4.
- `background-spiral`: `layers("tetrahedron")` (L39–44): apex `[0, 1, 0]` plus 6 triangle rings at `y = −1/3 + (4/3)(i/6)`, `w = TRI·(1 − y)·0.75`, corners at angles 0, 120° and 240°.
- **Both layouts** are then scaled by `s = sqrt(3/4)` and shifted: `[x·s, (y − 1/3)·s, z·s]` (L111–112).

**torus** (scale 1.2, **tip 35** degrees added to pitch; L116–149)
- `RING = 0.65`, `TUBE = 0.3`; a point is `at(u, v) = [(RING + TUBE·cos v)·cos u, TUBE·sin v, (RING + TUBE·cos v)·sin u]`.
- Default: `gap = sqrt(4π²·RING·TUBE/count)`, `nv = max(3, round(2π·TUBE/gap))` tube rings. Ring j (`v = 2πj/nv`) holds `nu = max(3, round(2π(RING + TUBE·cos v)/gap))` points at `u = ((i + (j mod 2)/2)/nu)·2π`.
- `background-spiral`: 6 strands, 3 turns. `v = (k/6)·2π + 3u`; u advances by `along / hypot(RING + TUBE·cos v, TUBE·3)` with `along = 0.6·sqrt(4π/count)`, until u reaches 2π.

**Computed counts.** These were produced by running the eef45fa `buildInput` with `npx tsx` (code outputs, not live measurements; identical to the 9bef3b1 values because `shapes.ts` is byte-identical and `model.ts` only changed `lookId`). Look `working`, density 1, dotSize 1:

| Shape | count @ size 96 (asked 384) | R @ 96 | count @ size 320 (asked 1280) | background-spiral count @ 96 |
|---|---|---|---|---|
| sphere | 384 | 38.4 | 1280 | 257 |
| cube | 386 | 46.08 | 1352 | 264 |
| octahedron | 402 | 46.08 | 1298 | 178 |
| tetrahedron | 394 | 46.08 | 1252 | 163 |
| torus | 374 | 46.08 | 1265 | 396 |

## 7. Renders (`src/demos/yogesh-thinking-orbs/orb/draw.ts`; per-point data from `simulate.ts` L393–424)

**No shaders, gradients, blurs or blend modes exist in the orb.** `draw.ts` only calls `Skia.Paint()`, `setAntiAlias(true)`, `setColor`, `setAlphaf`, `setStyle`, `setStrokeWidth`, `setStrokeCap`, `drawCircle`, `drawRect`, `drawLine` and `drawPath`. Nothing under `src/demos/yogesh-thinking-orbs/orb/` uses `RuntimeEffect`, `Shader`, `Gradient`, `BlendMode` or blur. The only per-mark "uniforms" are the radius `r` and alpha `a`, which `step()` computes each frame.

- **One base colour per orb** (L22–25): `const base = Skia.Color(Float32Array.of(r, g, b, a)); paint.setColor(base);`. The floats come from `colorToRgba` (§12).
- **Per-mark alpha:** `paint.setAlphaf(Math.min(1, a_mark) * rgba.a)` (L108). Marks with `a_mark < 0.005` are skipped (L107).
- `minR(r) = Math.max(0.45, r)` (L10–13).
- Per-point buffer layout: `dots[i*6 + 0..5] = [px, py, r, a, dx, dy]` (`simulate.ts` L395–401), where `dx = z1` and `dy = −(vx·sin pitch)` give the dash direction.

| Render | Flat | Drawing (draw.ts lines) |
|---|---|---|
| `dots` | no | Fill; `drawCircle(x, y, minR(r))` (L109–110) |
| `squares` | no | Fill; `h = minR(r)·0.9`; `drawRect(XYWHRect(x−h, y−h, 2h, 2h))` (L111–113) |
| `dashes` | no | Stroke + round cap (L93–96); `rr = minR(r)`; `(ux, uy) = (dx, dy)/hypot(dx, dy)·rr·1.8` (hypot 0 → 1); width `max(0.5, rr·0.9)`; line `(x−ux, y−uy) → (x+ux, y+uy)` (L114–122) |
| `crosses` | no | Stroke + round cap; `h = rr·1.4`; width `max(0.5, rr·0.7)`; one horizontal and one vertical line through (x, y) (L123–128) |
| `mesh` | no | Edges first, with a second paint: Stroke, width `max(0.35, input.rs·0.6)`, alpha `0.85·min(a_i, a_j)·rgba.a` (skipped below 0.005), one `drawLine` per pair (L76–91). Then joints: Fill, `drawCircle(x, y, minR(r)·0.4)` (L129–130). Pairs are the unique 3-nearest neighbours (`model.ts` L150–163). |
| `halftone` | yes | For each grid cell k of g×g: `rad = toneAt(local, k, cell)`; skip `rad < 0.3`; alpha `rgba.a`; `drawCircle(((k mod g)+0.5)·cell, (floor(k/g)+0.5)·cell, rad)` (L34–42) |
| `lines` | yes | One filled path per row j: `v = (j+0.5)·cell`; for k, `u = (k+0.5)·cell`, `h = 0.8·toneAt(j·g + k)`; `moveTo(0, v)`, then the top points `(u, v−h)`, `lineTo(size, v)`, the bottom points `(u, v+h)` in reverse, `close()`; Fill at alpha `rgba.a` (L44–72) |
| `verticalLines` | yes | The same transposed: tone index `k·g + j`, points `(v∓h, u)`, from `(v, 0)` to `(v, size)` (L44–72) |

**Tone grid** (flat renders only; `simulate.ts` L402–424, L428–433). Each projected point splats bilinearly into the 4 surrounding cells. With `fx = px/cell − 0.5`, `fy = py/cell − 0.5` and weight f:
- `ink[idx] += a·r·f·(0.4 + 0.6a) / rs`
- `hits[idx] += a·f`
- `toneAt(k) = hits ? 0.5·cell·min(1, ((ink/hits)·min(1, hits/0.3)) / 2.2) : 0`

Grid size `g = max(6, round(sqrt(count)·0.9))`, `cell = size/g` (`model.ts` L164, L181). Flat renders force the tilt term of pitch to 0 (`simulate.ts` L165), and the working ring uses `vy` as its coordinate on flat renders (`simulate.ts` L344).

## 8. Geometry and sizing (`buildInput`, `src/demos/yogesh-thinking-orbs/orb/model.ts` L117–184)

- `state = lookId(opts.state, opts.variant)` (L126). Since eef45fa `lookId` returns `resolveLook(state, variant)` (`model.ts` L112–115, `orbProps.ts` L82–89), so `state` is always one of the 15 known ids (§5).
- `dens = state === "background" ? 1 : 4` (L128). Only plain `background` gets the sparse density; `background-spiral` uses 4.
- `asked = max(8, round(size·dens·density))` (L129).
- `R = (size/2)·0.8·(form?.scale ?? 1)` (L131–132).
- `rs = (size/64)^0.6 · (0.72·sqrt(4/dens)) · dotSize` (L133). This is the base mark radius.
- `count = points.length`. Points go into a `Float64Array` (L134–141; the L99 comment: Float64 "so near-ties in the walker match the npm numbers").
- Reasoning looks (count > 1): 24 nearest neighbours per point (`REACH = 24`, L110), stored in a `Float32Array` with −1 in empty slots (L142–149).
- Mesh: unique 3-nearest pairs (L150–163).
- `g = max(6, round(sqrt(count)·0.9))`, `cell = size/g` (L164, L181).
- `key = "${state}|${shape}|${render}|${size}|${density}|${dotSize}"` (L166). The frame callback now keys the per-orb state with `${input.key}@${tune.speed}` (`OrbView.tsx` L278): a changed key, a changed speed or a changed point count re-creates the per-orb state with `makeLocal` (`OrbView.tsx` L277–283). (On 9bef3b1 the speed was not part of this key.)
- The input is memoised on `[state, variant, size, density, dotSize, shape, render]` (`OrbView.tsx` L230–233). **`speed`, `tilt` and `color` never rebuild geometry.**

**Computed sizing** (sphere, dots, density 1, dotSize 1; re-run with `npx tsx` against the eef45fa code, same values as 9bef3b1; cells are `count | rs | g`):

| look | size 20 | size 24 | size 96 | size 320 |
|---|---|---|---|---|
| every look except the two below | 80 / 0.3583 / 8 | 96 / 0.3997 / 9 | 384 / 0.9183 / 18 | 1280 / 1.8911 / 32 |
| `background` | 20 / 0.7166 / 6 | 24 / 0.7994 / 6 | 96 / 1.8366 / 9 | 320 / 3.7822 / 16 |
| `background-spiral` | 105 / 0.3583 / 9 | 117 / 0.3997 / 10 | 257 / 0.9183 / 14 | 486 / 1.8911 / 20 |

- R (sphere) is 8 / 9.6 / 38.4 / 128 at sizes 20 / 24 / 96 / 320.
- Mesh pairs (working, sphere): 675 at size 96, 2391 at size 320.
- Density at size 320: 0.25 gives 320 points; 3 gives 3840.

**Sizes the store hosts use at eef45fa** (host choices; reproduce them for the same visual contexts):
- Effects card (`Showcase.tsx`, the reference host in §15): one orb at the card's `size` field, default **320** (`Showcase.tsx` L19), changed by a Size slider 16–480, step 1 (L97).
- Orb Creator card (`Tuner.tsx`, covered by `AGENT_PROMPT_ORB_CREATOR.md`): stage orb `size={shown}` with `shown = min(size, wide ? maxOrb : min(maxOrb, max(96, width − 32)))`, `maxOrb = max(96, windowH − headerH − 120)`, `headerH = width ≥ 768 ? 48 : 72` (`Tuner.tsx` L73–75), default size 320 (L59); and a **24** px status orb (L400–412).

## 9. Time: the shared clock (`orb/clock.ts` L1–26; call site `OrbView.tsx` L269–285)

- `clocks = makeMutable<Record<string, Clock>>({})` (`clock.ts` L10). One global map, shared by every orb on the page.
- The key is `clockKey = \`${input.state}@${tune.speed}\`` (`OrbView.tsx` L274). Every orb with the same look id **and** the same speed shares one clock, so their phases stay in sync.
- `tick(look, now, speed)` (`clock.ts` L12–26):
  - first call: `{ t: 0, last: now }`;
  - then, if `now > last`: `t += min(now − last, 100) · speed`, and `last = now`.
  - So it is **forward-only, the frame gap is capped at 100 ms, and t is in milliseconds scaled by speed**. Several orbs calling in the same frame advance it only once.
- `now = frame.timestamp` from Reanimated `useFrameCallback` (`OrbView.tsx` L275).
- **Inactive or paused orbs don't tick.** The frame callback returns early when `activeSV` is false (L272), and the callback itself is deactivated with `frameCallback.setActive(running)` (L287–289), where `running = active && !paused && !reduced` (L220). `clock.ts` L6: "A paused orb must not call this." On resume the jump is capped at 100 ms × speed, unless another orb with the same key kept ticking.
- **Pause holds the frame at the clock's t.** On the render where `paused` turns true (and motion isn't reduced), `OrbCanvas` reads `clocks.value[\`${built.state}@${tune.speed}\`].t` into `heldT` and keeps the current picture (L251–259). Later prop edits while paused repaint one frame at that held t (L260–266; §13.3).
- **Speed changes switch clocks and reset per-orb state.** A new `speed` is a new clock key (start at t = 0 or resume that key's clock), and since eef45fa it is also part of the per-orb state key `${input.key}@${tune.speed}` (L278), so `makeLocal` runs again (reasoning walks restart). Whether live npm behaves the same on a speed change is **unmeasured**.
- **Loop behaviour.** No look has an end. Everything is periodic in t: yaw laps per `PERIOD` (or 6500 via `periodOf`), plus the per-effect cycles in §11. There is **no crossfade** when the look changes: the input is rebuilt and the local state reset (L235–238), and the next frame draws the new look.
- **Reduced motion** paints one frame at **t = 0** from props with a fresh `makeLocal` (L247–267), and repaints whenever a prop changes (§13.4).

## 10. Camera and projection (`src/demos/yogesh-thinking-orbs/orb/simulate.ts` L152–179, L296–311, L387–401)

### 10.1 Per-frame camera
- `yaw = yawOf(state, t)` (L163). By default that is `(t / periodOf(state)) · 2π` (L76), where `periodOf` returns `PERIOD[state]`, or **6500** when the id has no entry (L62–67, the NaN guard added in eef45fa): one full turn per PERIOD ms at speed 1.
- `gyro = state === "working-gyro" ? (t/5000)·2π : −1` (L164).
- `pitch = ((flat ? 0 : tilt) + input.tip + (gyro < 0 ? 0 : 10·cos(gyro))) · π/180` (L165).
  - `tip` is 35 for the torus and 0 otherwise (`model.ts` L170).
  - `flat` is true for halftone, lines and verticalLines.
- `roll = gyro < 0 ? 0 : 12·sin(gyro) · π/180` (L166).

### 10.2 working-gyro
Pitch wobbles ±10° and roll ±12° on a **5000 ms** cycle (L164–166). The twist is `tw = 0.5·sin((t/2600)·2π)` (L261–262, see §11.8).

### 10.3 Retrying yaw
- **`retrying`:** `yaw = rewind(2t, 2π/9000)` (L70; `rewind` at L42–60). It uses a 3200 ms cycle `P` in the doubled time `2t`, which is 1600 ms of real time at speed 1. With `u = t' mod 3200` and `w = 2π/9000`:
  - `u < 2000`: `a = u·w` (linear spin);
  - `2000 ≤ u < 2200`: `x = (u−2000)/200`, `a = (2000 + 200(x − x²/2))·w` (brake);
  - `2200 ≤ u < 3000`: `a = 2100w − back·spring((u−2200)/800)`, with `back = 0.6·2100·w` and `spring(x) = 1 − e^(−4.5x)·cos(3πx) − x·e^(−4.5)` (L19–22) (wind back 60%);
  - `u ≥ 3000`: `x = (u−3000)/200`, `a = 2100w − back + 100x²·w` (re-accelerate);
  - net advance per cycle: `fwd − back`, where `fwd = (2000+100+100)·w`; `yaw = k·(fwd − back) + a`.
- **`retrying-surge`:** `turns = t/3250`, `u = frac(turns)`, `yaw = (floor(turns) + (1 − (1−u)³))·2π` (L71–75). That is one turn per **3250 ms**, with a cubic ease-out on each turn.

### 10.4 Per-point transform (L296–311)
For model point (x, y, z):
- `turn = yaw + TWIST·tw·y`, with `TWIST = 1.4` (L86, L300). Use `ly = sin(turn)` and `lc = cos(turn)` when `tw ≠ 0`; otherwise use `sin(yaw)` and `cos(yaw)`.
- `z1 = −x·ly + z·lc`, `vx = x·lc + z·ly`, `vy = y·cos(pitch) − z1·sin(pitch)`, `vz = y·sin(pitch) + z1·cos(pitch)`.
- **Depth:** `d = (vz + 1)/2`, `r = (0.5 + 1.4d)·rs`, `a = max(0, (d − 0.3)/0.7)` (L309–311). Back-facing points fade out, and front points are up to 1.9× rs.
- Effects (§11) then modify vx, vy, r and a.
- Roll, when non-zero, rotates (vx, vy) by `roll` (L387–392).
- **Screen:** `px = c + vx·R`, `py = c − vy·R`, with `c = size/2` (L393–394).

## 11. Per-state animation (`src/demos/yogesh-thinking-orbs/orb/simulate.ts`)

Helpers: `ease(x) = (1 − cos πx)/2` (L10–13), `hash(n) = frac(sin(n·127.1)·43758.5453)` (L14–18), `spring(x)` (L19–22). The time **t is in clock ms** (§9), so at speed s every duration below is divided by s in real time. "Lit" means `r *= 1 + k·g` and `a += (1 − a)·g` for some weight g.

### 11.1 base
No effect beyond depth: a plain spin, one yaw lap per **6500 ms**.

### 11.2 searching: lens (L89–113, L260, L312–326)
- `LENS_MS = 1800`, `MOVE = 0.4`, `LENS = 0.6` rad.
- Every 1800 ms the lens hops from `spot(k)` to `spot(k+1)`. It moves during the first 40% of each hop with `e = (1 − cos(π·u/0.4))/2`, then holds.
- `spot(k)`: `phi = 2.45k + 1.5·hash(k)`, `theta = (15 + 30·hash(k+0.5))°`, giving the unit vector `[sin θ cos φ, sin θ sin φ, cos θ]`. The lens sits 15–45° off the view axis.
- Per point: `ang = acos(min(1, dot(v, lens)/|v|))`, `w = ang < 0.6 ? (1 − (ang/0.6)²)² : 0`.
  - `a *= 1 − 0.55·(1 − w)` dims everything outside the lens by 55%.
  - If `size ≤ 24`: `r *= 1 + 0.5w`.
  - If w > 0: `vx, vy *= 1 + 0.12w`; `vx += (vx − lens.x)·0.35w`, same for vy; `r *= 1 + 0.9w`; `a += (1 − a)·w`.
- Yaw lap 13000 ms.

### 11.3 compacting and compacting-fuse: sweep (L263–281, L327–340)
- Cycle **2800 ms**: `u = (t mod 2800)/2800`.
- The sweep line moves `sweepAt = −1.15 + 2.3·min(1, u/0.7)` across screen-x during the first 70%. `sweepHold = 1` for `u < 0.7`, otherwise `release(s)` with `s = (u − 0.7)/0.3`:
  - compacting: `s < 0.45 → 1 − 1.25·ease(s/0.45)`; `s < 0.7 → −0.25·(1 − (s−0.45)/0.25)²` (an undershoot past loose); after that 0;
  - fuse: `(1 − s)³` (no bounce).
- Per point, with `q = vx`: `w = clamp01((sweepAt − q)/0.2)·sweepHold`, `k = 1.5` for compacting and 1 for fuse.
  - `vx, vy *= 1 − 0.2k·w` (pull: 30% compacting, 20% fuse).
  - `r *= 1 − 0.3k·w` (shrink: 45% compacting, 30% fuse).
- Fuse only:
  - `a *= 1 − 0.5w`.
  - Burn line `gg = exp(−((q − sweepAt)/0.08)²)·max(0, sweepHold)·min(1, d/0.5)`, then `r *= 1 + 0.8gg`, `a += (1 − a)·gg`.
- Yaw lap 10000 ms.

### 11.4 working: ring (L79–85, L341–352)
- Cycle **1700 ms**: `u = t mod 1700`.
- The ring position is `at = 1.3 − 2.6·ease(min(1, u/1200))`. It travels down over **1200 ms**, then rests for 500 ms.
- Ring coordinate: `q = flat ? vy : dot(v, RING_AXIS)`.
  - `RING_AXIS = [−sin(10°)·cos(30°), cos(10°)·cos(30°), sin(30°)]`, i.e. RING_TIP 30° and RING_ROLL 10°.
- Lit band: `gg = u < 1200 ? exp(−((q − at)/0.2)²) : 0`, then `r *= 1 + 0.6gg`, `a += (1 − a)·gg`.
- Passed points: `w = clamp01((q − at)/0.2)·(u < 1200 ? 1 : 1 − min(1, 1.6·(u−1200)/800))`, then `vx, vy *= 1 − 0.08w`, `r *= 1 − 0.15w`.
- Yaw lap 3000 ms.

### 11.5 searching-lighthouse: beam (L87–88, L353–365)
- `a *= 0.5` (base dim).
- `LEAN = 30°`. `across = vx·cos(LEAN) − vy·sin(LEAN)`, `toward = −sin(pitch)·(vx·sin(LEAN) + vy·cos(LEAN)) + cos(pitch)·vz`.
- Beam angle: `off = atan2(across, toward) − ((t/2500 mod 1)·2π − π)`, a **2500 ms** lap. `dphi` is `off` wrapped to (−π, π].
- `beam = dphi < 0 ? max(0, 1 + dphi/TRAIL) : exp(−(dphi/0.45)²)`, with `TRAIL = π/2`: a linear trailing edge and a Gaussian front of 0.45 rad.
- `gg = beam·(0.25 + 0.75·clamp01((d − 0.4)/0.3))`, then `r *= 1 + 0.6gg`, `a += (1 − a)·gg`.
- Yaw lap 13000 ms.

### 11.6 reasoning and reasoning-twins: walking sparks (L92–94, L184–254, L366–373)
- `HOP = 220` ms per hop, `TAIL = 5`, `WALK = 16` (walk history length).
- **Start:** walk 0 begins at the point most facing the camera, `facing(k) = y·sin(pitch) + (−x·sin(yaw) + z·cos(yaw))·cos(pitch)`. Twins' walk 1 begins at the point maximising `facing + squared distance to walk 0's start`.
- **Each hop:** among the 24 precomputed nearest neighbours of the walk's head, skip any visited in the last 8 steps, and pick the one with the best score `facing(k) + 0.35·hash(hop·31 + j + w·977) + apart`. For twins, `apart = 1.2·min(dist to the other head, 0.8)`; for a single walk it is 0.
  - If nothing qualifies, take `near[base]`.
  - Walks keep at most 16 points.
  - `hops` catches up to `floor(t/220)` but never replays more than 16 hops (`local.hops = max(local.hops, n − WALK)`).
- **Spark intensity** (`f = frac(t/220)`): the head is `ease(min(1, 2f))`; tail position j = 1…4 is `1 − (j − 1 + f)/5`. The max value per point is kept in `lit`.
- Per point: `a *= 0.5`. If `spark > 0`: `r *= 1 + 0.8·spark`, `a += (1 − a)·spark`.
- Yaw lap 6500 ms.
- The walk state is per orb instance (`OrbLocal`) and depends on history, so two reasoning orbs mounted at different times can show different paths even when they share a clock.

### 11.7 waiting: comet (L256–259, L374–386)
- `head = (t/2000)·2π + yaw`: the head laps in **2000 ms** relative to the yaw.
- `ahead = 2π/2000 + 2π/PERIOD`.
- `headLat(tt) = 70°·(1 − 2·((tt mod 6000)/6000))`: the head drifts from 70° N to 70° S over **6000 ms**.
- `glow = min(1, 3·sin(π·(t mod 6000)/6000))`: fades in and out every 6000 ms.
- Per point: take model lat/lon. `off = atan2(sin(lon − head), cos(lon − head))`, `along = off·cos(lat)`.
  - `gg = exp(−((lat − headLat(t + off/ahead))/0.28)²) · exp(−(along/(off·ahead > 0 ? 0.12 : 1))²)`: a sharp head and a long tail.
  - `w = glow·gg^0.6`; `a = 0.5a + (1 − 0.5a)·w`; `r *= 1 + 1.1w`.
- Yaw lap 13000 ms.

### 11.8 Twist: working-gyro and compacting-squeeze (L261–262, L300–302)
- `tw = 0.5·sin((t/2600)·2π)` for working-gyro, and `sin((t/2600)·2π)` for compacting-squeeze, on a **2600 ms** cycle.
- Each point's yaw becomes `yaw + 1.4·tw·y`, so the top and bottom wring in opposite directions.
- compacting-squeeze has **no** sweep: `compacting` is only true for `compacting` and `compacting-fuse` (L263).

### 11.9 background and background-spiral
No per-frame effect. `background` uses `dens = 1`, giving fewer and bigger marks (§8). `background-spiral` uses spiral layouts (§6). Both have a yaw lap of 13000 ms.

### 11.10 Timing summary (clock ms at speed 1)

| Look | Yaw | Effect cycle(s) |
|---|---|---|
| base | 6500 lap | none |
| working | 3000 lap | ring 1700 (1200 sweep, ease `(1−cos πx)/2`) |
| working-gyro | 3000 lap | gyro 5000; twist 2600 |
| reasoning / twins | 6500 lap | hop 220; tail 5; history 16 |
| searching | 13000 lap | lens hop 1800 (move 40%, cosine ease) |
| searching-lighthouse | 13000 lap | beam 2500 |
| background / spiral | 13000 lap | none |
| retrying | rewind cycle 3200 in 2t (1600 real) | built into yaw |
| retrying-surge | 3250 per turn, cubic ease-out | built into yaw |
| compacting / fuse | 10000 lap | sweep 2800 (70% sweep, 30% release) |
| compacting-squeeze | 10000 lap | twist 2600 |
| waiting | 13000 lap | head 2000; latitude drift 6000; glow 6000 |

No Reanimated `withTiming`/`withSpring` or bezier easing is used anywhere in the orb. All motion is the closed-form maths above, evaluated per frame.

## 12. Colour (`color/color.ts`; `OrbView.tsx` L38–59)

### 12.1 What `color` accepts (`parseColor`, `color.ts` L175–231)
Input is trimmed and lower-cased, then matched against:
- `transparent` → `{l:0, c:0, h:0, a:0}`;
- hex `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (sRGB);
- `oklch(L C H [/ A])`, space-separated only. L may be a %; C may be a %, where 100% = 0.4; H accepts deg, rad, turn or grad;
- `rgb()` / `rgba()`, comma or space syntax; % channels must be all-or-none in comma syntax;
- `hsl()` / `hsla()`, with S and L required as %;
- `color(display-p3 R G B [/ A])`, space syntax only.

Anything else returns `null`, and **`OrbView` then paints opaque white** (`OrbView.tsx` L55–56). Internally colour is OKLCH `{l, c, h, a}` with l and a clamped to 0–1, c ≥ 0, h in 0–360.

### 12.2 Conversion to paint floats
- `toSrgb(c)` (`color.ts` L144–148): clamp chroma into the **sRGB** gamut (20-step bisection, `clampChroma` L90–100), convert OKLCH → gamma sRGB, clamp each channel to 0–1.
- `toExtendedSrgb(c)` (L150–154): clamp chroma into the **Display P3** gamut, then convert to gamma sRGB **without** clamping. Channels can fall outside 0–1.
- `colorToRgba` uses `toExtendedSrgb` only when `canUseExtendedColor()` is true; otherwise `toSrgb` (`OrbView.tsx` L54–59).
- Matrices: the OKLab values hard-coded in `color.ts` L30–59. The transfer function is the sRGB piecewise curve (L25–28).
- New exports at eef45fa, used only by the creator's colour field: `srgbGammaToDisplayP3` (L120–123, renamed from the private `srgbToDisplayP3`) and `displayP3GammaToSrgb` (L125–128). The orb doesn't call them.

### 12.3 Platform behaviour (`canUseExtendedColor`, `OrbView.tsx` L48–52)

| Platform | Surface | Paint input | Status at eef45fa |
|---|---|---|---|
| Web (desktop target) | stock `@shopify/react-native-skia` 2.6.2 WebGL surface (no patch; software surface if WebGL is missing, §3.3); the canvas is created with `colorSpace="p3"` (`OrbView.tsx` L155) | extended-sRGB floats, unclamped (`canUseExtendedColor()` is true) | **The P3 canvas look is unverified on a real GPU and Safari** (gap 5, §16). Which colour space the stock web surface uses is not established from this tree. |
| iOS native | `<Canvas colorSpace="p3">` | extended floats (true except Expo Go) | **Unverified.** The `OrbView.tsx` comment at L38–47 still says the iOS path relies on a postinstall patch to `cpp/api/JsiSkPaint.h` that calls `setColor4f`, but **that patch is not in eef45fa** (§3.1). The same comment says stock Skia packs `r*255` with no clamp, so a component above 1 paints black. Mobile is a known gap. |
| iOS Expo Go (`StoreClient`) | unpatched binary | `toSrgb` (clamped) | sRGB only; unverified |
| Android | GL surface | `toSrgb` (clamped) | sRGB only; unverified |

### 12.4 Light and dark
**The orb has no theme logic.** It paints exactly the `color` it's given, on a transparent canvas.
- The Effects card passes `color={colors.orb}` (`Showcase.tsx` L94): **`#ffffff`** in dark (`theme.tsx` L39), **`#171717`** in light (L60).
- The theme starts dark (`theme.tsx` L134) and **no component in eef45fa calls `toggle`** (L150–155), so the store cards are dark-only in practice. Light values are listed because they are in the code.
- Computed paint floats (re-run with `npx tsx` against eef45fa `color.ts`; identical to 9bef3b1):
  - `#ffffff` → (1, 1, 1); `#fafafa` → (0.98039, 0.98039, 0.98039); `#171717` → (0.0902, 0.0902, 0.0902);
  - `color(display-p3 1 0 0)` → toSrgb (1, 0.20346, 0.15875), toExtendedSrgb (1.09307, −0.22674, −0.15013);
  - `oklch(0.7 0.3 30)` → toSrgb (1, 0.39623, 0.3182), toExtendedSrgb (1.08422, 0.27728, 0.19679).

## 13. Render pipeline (`OrbView.tsx`)

### 13.1 Mount
1. `usePicture()` (L67–73) makes a blank 1×1 recorded picture (`blankPicture`, L61–65) the initial `SharedValue<SkPicture>`, plus `retire = useSharedValue<SkPicture | null>(null)`.
2. `OrbCanvas` (L198–296) creates `inputSV` and `localSV` (both null), `activeSV = useSharedValue(running)`, and `fallback = useSharedValue<OrbLive>({ size, speed, density, dotSize, tilt, ...colorToRgba(color) })` (L217–229).
3. `built = useMemo(() => buildInput({ state, variant, size, density, dotSize, shape, render }), [...same 7])` (L230–233). An effect writes `inputSV.value = built; localSV.value = null` (L235–238).
4. A layout effect writes `activeSV.value = running`, and, when there is no `live`, also `fallback.value = { size, speed, density, dotSize, tilt, ...colorToRgba(color) }` (L240–245).
5. The still-frame layout effect (L247–267) runs; see §13.3 and §13.4.
6. `frameCallback.setActive(running)` (L287–289).

### 13.2 Every running frame (UI-thread worklet, `useFrameCallback(…, running)` L269–285)
1. `input = inputSV.value`. Return if there's no input or `activeSV.value` is false (L271–272).
2. `tune = live ? live.value : fallback.value` (L273).
3. `t = tick(\`${input.state}@${tune.speed}\`, frame.timestamp, tune.speed)` (L274–276).
4. `speedKey = \`${input.key}@${tune.speed}\`` (L278). If `local` is missing, or `local.key !== speedKey`, or `local.dots.length !== input.count · 6`, then `local = makeLocal(input); local.key = speedKey; localSV.value = local` (L279–283). `makeLocal` is `simulate.ts` L125–142.
5. `paint(picture, retire, input, local, tune, t)` (L284; `paint` is L107–125):
   - `step(input, local, time, tune.tilt, 1)` fills the dots buffer and the tone grid;
   - `recorder = Skia.PictureRecorder()`; `canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, input.size, input.size))`;
   - `drawOrb(canvas, input, local, { r: tune.r, g: tune.g, b: tune.b, a: tune.a })`;
   - `next = recorder.finishRecordingAsPicture()`;
   - **Rotation:** `old = retire.value; retire.value = picture.value; picture.value = next; if (old) old.dispose()`.
6. `<Canvas>` (L155–157) draws `<Picture picture={picture} />`. Skia redraws when the shared value changes. **No React state changes per frame.**

### 13.3 Paused (`paused === true`, motion not reduced; L247–267)
- `wasPaused` and `heldT` are refs (L249–250).
- On the render where `paused` flips from false to true, it reads `clocks.value[\`${built.state}@${speed}\`]` and stores its `t` in `heldT` (or keeps the old `heldT` if there is no clock), then returns **without painting**. The last running frame stays on screen (L253–259).
- On later renders while paused, a change to `reduced`, `paused`, `built` (`state`, `variant`, `size`, `density`, `dotSize`, `shape`, `render`), `color`, `density`, `dotSize`, `size`, `speed` or `tilt` repaints **one** frame at `heldT`, using a fresh `makeLocal(input)` and the **props** (not `live`) (L260–266).
- An orb that **mounts** paused paints one frame at `heldT = 0` (`wasPaused` starts equal to `paused`, so there is no "entered pause" step).
- The frame callback is inactive (`running` false), so the shared clock isn't ticked by this orb (§9).

### 13.4 Reduced motion (live; L103–105, L220, L247–267)
- `reduced = useReduceMotion().reduceMotion` (L103–105, L300). `ReduceMotionProvider` (`ReduceMotionContext.tsx` L13–40) reads `AccessibilityInfo.isReduceMotionEnabled()` once on mount (L19–21) **and subscribes to `reduceMotionChanged`** (L22), so toggling the OS setting takes effect without a reload. `reduceMotion = systemReduceMotion || forceReduceMotion` (L31). `setForceReduceMotion` is the store's own override; nothing in this asset calls it.
- When `reduced` is true, `running` is false (L220): no frame callback, no clock tick. The layout effect paints **one** frame at **t = 0** from the props with a fresh `makeLocal` (L260–266), and repaints on every change of the dependencies above. **So the still orb follows the Size slider** (and any other prop).
- When `reduced` goes back to false and the orb is active and not paused, the callback is re-activated (L287–289), and the clock resumes where that key left off.
- On web, RNW's `AccessibilityInfo.isReduceMotionEnabled` / `reduceMotionChanged` follow the `prefers-reduced-motion` media query. That mechanism is react-native-web's; it isn't in this tree.

### 13.5 What is per-frame and what needs a rebuild
- **Per frame** (read from `tune`): `speed` (clock rate and clock key, plus the per-orb state key), `tilt` (pitch) and `r, g, b, a` (paint).
- **Rebuild via props** (memoised `buildInput`): `state`, `variant`, `size`, `density`, `dotSize`, `shape`, `render`.
- `tune.size`, `tune.density` and `tune.dotSize` exist in `OrbLive` but **are not read by `paint`/`step`**. Geometry always comes from `input`, so a `live` write of those fields has no visual effect until the props change. The `size` prop also sets the box and canvas size (L155, L180, L191).

### 13.6 Unmount, snapshot, focus and the host budget
- `CanvasHost` cleanup (L139–153): if `onFrame` is set, it calls `ref.current.makeImageSnapshot()`, `encodeToBase64()` and `dispose()`, then reports `data:image/png;base64,<b64>`. Errors are swallowed (L150: "The surface can already be gone while the view unmounts.").
- `OrbView` returns `null` when the route is unfocused (L303), which unmounts the canvas.
- **Host budget hook:** `OrbView` reads `useSkiaRuntime()` (L301). `mount: false` renders an empty placeholder `View` of `size × size` with no canvas (L304). `running: false` passes `active={false}` (L305): the canvas stays and holds its last frame. The default without a provider is `{ mount: true, running: true }` (`liveBudget.tsx` L22–28). In the store, `DeferredSkiaDemo` provides `{ mount: live, running: live && !hidden }` (store chrome). A standalone host can leave the default or provide its own `SkiaRuntimeContext` value (exported at `liveBudget.tsx` L24).

## 14. How props drive the orb (no host UI required)

The orb sees only props, plus the optional `live` SharedValue. Wire any controls you like.

### 14.1 What the Effects card drives (`Showcase.tsx`)
| Prop | Source | Values | Cite |
|---|---|---|---|
| `state`, `variant` | `PLAYGROUND[index]` | the 15 looks (§5); `index` default 1, in-memory card field `yogesh-thinking-orbs/index` | L18, L22, L94 |
| `size` | card field `yogesh-thinking-orbs/size` | default 320; Size slider 16–480, step 1, 0 decimals | L19, L94, L97 |
| `color` | `colors.orb` | `#ffffff` (dark; the only reachable mode in the store, §12.4) | L17, L94 |
| everything else | omitted | defaults from §4.1: speed 1, density 1, dotSize 1, tilt 20, shape sphere, render dots, active true, paused false; no label, so the orb box is `aria-hidden` | L94 |

The card's stage `View` is also hidden from assistive tech on web (`aria-hidden`, `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`; L87–93).

### 14.2 Value domains the creator uses (for reference, from `Tuner.tsx`)
These are the Orb Creator's control ranges. They're listed so a host that drives the other props passes the same domains. The creator itself is the other prompt.

| Prop | Range | Step | Default | Cite |
|---|---|---|---|---|
| `shape` | sphere, cube, octahedron, tetrahedron, torus | n/a | `"sphere"` | `Tuner.tsx` L27–33, L57 |
| `render` | the 8 renders (labels Dots, Crosses, Dashes, Halftone, Lines, Mesh, Squares, Vertical Lines) | n/a | `"dots"` | L35–44, L58 |
| `size` | 16–480 | 1 | 320 (the stage then clamps it to `shown`, §8) | L59, L180–193 |
| `speed` | 0.05–3 | 0.05 | 1 | L60, L194–207 |
| `density` | 0.25–3 | 0.05 | 1 | L61, L208–221 |
| `dotSize` | 0.25–3 | 0.05 | 1 | L62, L222–235 |
| `tilt` | −90–90 | 1 | 20; hidden on flat renders, reset to 20 when leaving a flat render | L63, L95–98, L236–251 |

Slider values snap to the step and are rounded with `toFixed(4)` (`SliderRow.tsx` L32–38).

### 14.3 Plain prop driving (what the Effects card does)
Hold each value in React state and pass it as a prop.
- Geometry props rebuild the input (§13.5).
- `speed`, `tilt` and `color` update `fallback` through the layout effect at L240–245 and apply on the next frame.
- During a Size drag on the Effects card, `SliderRow` (no `live`) publishes to JS at most every **32 ms** (`PUSH_MS`, `SliderRow.tsx` L28, L282–286) and on release (L288–300). Each publish changes `size` and rebuilds the input.

### 14.4 The `live` SharedValue (per-frame tuning during a drag; used by the creator)
- The host creates `useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba })` with `rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed)` (`Tuner.tsx` L79, L84).
- While a slider drags, a worklet writes one field at a time (`writeLive`, `SliderRow.tsx` L40–48), on every pan update (L281), on release (L297) and on tap (L312). Since eef45fa, keyboard and accessibility steps write it too (`publishNow`, L193–197).
- When not dragging, an effect rewrites the whole object from React state, skipped while `sliding.current` is true (`Tuner.tsx` L100–103).
- **Effect on the orb:** speed and tilt change on the very next frame, with no React render. Size, density and dotSize change the drawing only when the props catch up (§13.5). A paused or reduced-motion orb ignores `live` and repaints from props (§13.3–13.4).

## 15. Reference host: the Effects card (`Showcase.tsx`) and what a host must provide

### 15.1 Host requirements (from the code)
`Showcase` and `OrbView` need these above them. The store provides them in its shell (chrome, not inlined); a standalone host provides them itself.
1. **CanvasKit before Skia evaluates (web).** Await `ensureCanvasKit()` (Appendix 14), then load the module that imports `OrbView`/`Showcase`, for example with `React.lazy(() => ensureCanvasKit().then(() => import("./Showcase")).then((m) => ({ default: m.Showcase })))`. That one-liner is illustrative (it hasn't been compiled); the pattern is the store's `src/catalog.ts` L33–41.
2. **`GestureHandlerRootView`** from react-native-gesture-handler, around the tree. `SliderRow` uses `GestureDetector`.
3. **`ReduceMotionProvider`** (Appendix 11). `useReduceMotion` throws without it (L42–46).
4. **An expo-router navigator** (any `Stack`/`Slot` layout). `OrbView` calls `useIsFocused()` and `ThemeProvider` calls `usePathname()`.
5. **`ThemeProvider cardId="yogesh-thinking-orbs"`** (`theme.tsx` L116–162) around `Showcase`, which calls `useTheme()` (it throws without the provider, L164–168). The store wraps it exactly like that (`src/demos/yogesh-thinking-orbs/index.tsx` L29–31, chrome).
6. **Optional `SkiaRuntimeContext`** (§13.6). The default mounts and runs.
7. **A black frame of at least the host's height.** The store's card frame (`Stage`, chrome) renders the host on `#000000` with a transparent border, starting 520 px tall and growing to the host's measured height (`index.tsx` L9–27). A stand-in only needs a full-width `#000000` container whose height follows its content. Don't copy the store's card chrome.

### 15.2 Layout at desktop 1280 (`Showcase.tsx`)
`wide = useWindowDimensions().width >= 1280` (L15–16), so the **window** width decides the branch; at a 1280 px window it is wide.

| Element | Wide (≥ 1280) | Narrow (mobile: known gap) | Cite |
|---|---|---|---|
| Root `View` testID `yogesh-orb-tuner` | width 100%, bg `colors.page` (#000000), `flexDirection: row`, `alignItems: center`, paddingLeft **32**, paddingRight **42**, paddingVertical **24**, gap **24** | column; padding 16 / 16 | L25–37 |
| States wrapper testID `yogesh-orb-states` | `role="navigation"`, `accessibilityLabel="States"`, width **280**, `justifyContent: center` | width 100% | L38–43 |
| List | web `role="list"`; column, nowrap, columnGap 16, rowGap **8** | row, wrap | L44–52 |
| Item | web: `View role="listitem"` › `Pressable accessibilityRole="button"`, `aria-current="true"` when selected, `hitSlop {top:12,bottom:12}`, height **20**, `justifyContent: center` › `Text` `playground` label | same, without listitem wrappers on native | L53–78 |
| Item text | `fonts.regular`, **14/20**, `colors.fg` (#fafafa) when selected, else `colors.muted` (#a1a1a1) | same | L56 |
| Hint (wide only) | "↑ ↓ to switch", `fonts.regular` **12/16**, `colors.muted`, marginTop **24**, marginBottom **−8** | not rendered | L80–84 |
| Right column | `alignItems: center`, gap **16** | same | L86 |
| Stage testID `yogesh-orb-stage` | web: `aria-hidden`; native: label "Orb playground" | same | L87–93 |
| Orb | `<OrbView state variant size={size} color={colors.orb} />` | same | L94 |
| Size slider wrapper | width **256** › `SliderRow label="Size" min 16 max 480 step 1 decimals 0` | width 100% | L96–98 |

- No page-level scroll or header belongs to this asset.
- Text uses `fonts.regular` (web: `Geist_400Regular, Geist, "Geist Fallback", system-ui, sans-serif`, `theme.tsx` L81, L87).

### 15.3 Interaction
- **Click or tap** an item → `setIndex(i)` (L64). The orb's `state`/`variant` change; the input rebuilds; the next frame draws the new look. No transition (§9).
- **↑/↓** anywhere on the page (web) → previous/next look, wrapping (`useArrowKeys.web.ts` L4–23). It is ignored when the event target is inside `input, textarea, select, [contenteditable='true'], [role='slider'], [data-arrow-keys='own']` (L11), and it calls `preventDefault()` otherwise (L15). Native: no-op (`useArrowKeys.ts`).
- **Size slider** (`SliderRow`, Appendix 19). Row h **36**, radius **8**, bg `colors.row` (#141414), `overflow: hidden` (L390–399). Fill bg `colors.slider` (#3e3e3e) (L401). 9 tick marks at 10 %…90 %, 1 px `colors.fg`, top/bottom 8 (L402–404). Handle 3×20, radius 1, `colors.fg` (L405–408).
  - Hover/drag reaction (L143–164): handle opacity `withTiming` 150 ms to 0 (idle), 0.1 (near the label/value text), 0.9 (dragging) or 0.5 (hover); scaleX spring `HANDLE_X` to 1/0.25; scaleY spring `HANDLE_Y` to 0.75 near the text; marks opacity `withTiming` 200 ms to 0.35/0.
  - Fill spring `FILL {stiffness 300, damping 25, mass 0.8}` on external change and on tap/release (L181, L256, L296). Rubber-band overshoot up to ±18 px at 0.25× the overflow (L269–276), back with `BACK {224, 25.4, 1}` (L291).
  - Web text (L331–361): label `system-ui, -apple-system, "SF Pro Display", sans-serif` 13/500/19.5 at left 10, ink `rgba(255,255,255,0.7)` (dark), `translateY(-50%) translateY(-0.5px)`. Value `GeistMono_500Medium, ui-monospace, monospace` 13/500/19.5 at right 12, paddingBottom 1, 1 px transparent bottom border, same ink, `translateY(-50%) translateY(0.5px)`.
  - Keys when focused (web, L203–224): ←/↓ −1 step, →/↑ +1 step; with Shift ±10 steps; PageUp/PageDown ±10 steps; Home → min; End → max. Accessibility increment/decrement ±1 step (L370–374).
  - ARIA: `accessibilityRole="adjustable"`, label "Size", `tabIndex 0`, `aria-valuemin/max/now`, `aria-valuetext` = the displayed text (L366–380).
  - **Focus style on the Effects card: unmeasured.** The slider row sets no outline of its own; the only explicit slider focus ring in the tree is scoped to the creator panel (`ColorPicker.web.tsx` L144).
- `injectSmoothing()` adds one `<style id="orb-font-smoothing">` that sets `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale` on `[data-testid="yogesh-orb-tuner"]` and its descendants (and on the creator's `.orb-cp-pop`) (`SliderRow.tsx` L15–22, L77–79).

### 15.4 Fonts (web)
- **Geist 400** is loaded by `ThemeProvider` **after window `load`**: if `document.readyState === "complete"` it loads at once, else on `window.addEventListener("load", …, { once: true })`. It dynamically imports `@expo-google-fonts/geist/400Regular` and calls `expo-font` `loadAsync({ Geist_400Regular })` (`theme.tsx` L117–132). Until then the list text renders in the fallbacks of `fonts.regular`. **Measured** by the team: Geist swaps in about 150 ms after paint, about 870 ms on a slow connection (gap 9, §16).
- **Geist Mono 500** (the slider value) loads through `useFonts({ GeistMono_500Medium })` in `SliderRow` (L76) and renders as `GeistMono_500Medium, ui-monospace, monospace` (L13).
- The slider label uses the system stack (L12), not Geist.
- `fonts.mono` on web is `"Geist Mono", "Geist Mono Fallback"` (`theme.tsx` L82). The Effects card doesn't use it.

### 15.5 State and persistence
`index` and `size` live in `useCardField('yogesh-thinking-orbs', …)` (`cardState.ts` L72–78): a `globalThis` map read through `useSyncExternalStore`. Values survive an unmount/remount on the same page but **not a reload**. For the creator, the team measured that neither the live site nor this build keeps anything across a reload. That wasn't measured separately for the Effects card, but it uses the same mechanism.

## 16. Known gaps and unverified items (orb asset)

**Gates on the merged code** (from the PR #29 body, read through the GitHub connector): at head `c14c663`, which PR #29 merged as eef45fa, the team recorded Engineering **SHIP**, Design **FINAL PASS** and Beta **CLEAR** at desktop 1280. PR #29 excludes Motion's open-timing and hover-in fixes and Engineering's rAF-cancel fix; those are pending in PR #26, which touches only the creator's `SelectRow.tsx`. **Nothing in PR #26 changes the orb or the Effects card.**

### 16.1 Known gaps (desktop), the team's list, worded exactly
These are the gaps from the team's list that apply to this asset. The numbers are the list's own; gaps 1–4, 7 and 8 are about the creator's controls and are in `AGENT_PROMPT_ORB_CREATOR.md`.

5. P3 canvas look unverified on a real GPU and Safari.
6. Mobile not covered.
9. Font flash on first load: Geist swaps in ~150 ms after paint, ~870 ms on a slow connection.
10. 5 of 16 look-name labels are 1–4 px narrower.
11. Look-name hit area is the whole row, and the hint has an extra role=navigation wrapper.

Gaps 9–11 concern the look-name list. The Effects card's list (`Showcase.tsx` L38–85) is the same code as the creator's (`Tuner.tsx` L289–342), so they apply here too. The team's list doesn't say which card they were measured on. Reproduce the code as it is; don't "fix" these gaps.

### 16.2 Unverified or unmeasured (orb-specific)
- **No Skia patch at eef45fa** (§3.1, §12.3). The `OrbView.tsx` comment at L38–47 describes a `JsiSkPaint.h` patch that doesn't exist in this tree. On iOS, extended floats above 1 may clamp or paint black (the same comment says so for stock Skia). Unverified, and covered by gap 6.
- **Frame-by-frame parity with the live npm orb: unmeasured.** Live draws with SVG (npm 0.1.1); this port draws with Skia from the same maths.
- **A speed change restarts the clock phase and the per-orb state** (§9). Whether live does the same is unmeasured.
- **The Size slider's focus style on the Effects card: unmeasured** (§15.3).
- **`canvaskit.wasm` size at eef45fa: not re-measured.** 8,076,553 B was measured for canvaskit-wasm 0.41.0 on 9bef3b1; eef45fa resolves the same version (§3.2).
- **The store's light theme is unreachable.** Nothing calls `toggle` (§12.4). Light palette values are documented but never shown.
- **Native (iOS/Android) has not been run** for this build (gap 6).

### 16.3 Gaps from the 9bef3b1 prompt that eef45fa fixed (removed)
- "API differs from npm `<Orb>`": fixed. `state`/`size`/`color` are optional with npm defaults, and `paused`, `label` and `className` exist (§4).
- "Reduced motion is read once at launch": fixed. It's a live context, and the still frame follows props (§13.4).
- "Unknown look ids produce NaN yaw": fixed by `resolveLook` and `periodOf` (§5.1).
- The 9bef3b1 site-host items (12-canvas cap, `/` and `/playground` canvas counts, prod `DISPLAY_P3` string, CanvasKit message on load, wasm in native builds) were about the old site and the patched build. They don't apply to this tree. The store's own budget is 6 surfaces (chrome, §3.5).

## 17. Parity checklist (numbered; each line has a status)

Status key:
- **Code**: read in the eef45fa source.
- **Run**: I computed it by running the eef45fa files with `npx tsx` in a scratch copy.
- **M-gate**: covered by the team's gates on c14c663 = eef45fa (PR #29 body).
- **Gap**: a known gap (§16.1).
- **Unmeasured**: nobody has measured it; verify it yourself.

Install and serve:

1. `npm ls @shopify/react-native-skia` → **2.6.2**; `canvaskit-wasm` → **0.41.0**; `react-native-reanimated` → **4.5.1**; `react-native-worklets` → **0.10.1**; `expo` → **57.0.23**; `react-native-web` → **0.21.2**. *(Code: lockfile)*
2. There is no `patches/` folder; `npm ci` runs only `npx setup-skia-web public` as postinstall. *(Code: package.json L47)*
3. `public/canvaskit.wasm` exists after install and equals `node_modules/canvaskit-wasm/bin/full/canvaskit.wasm`. On 9bef3b1, that file was 8,076,553 B with sha256 `eb68c7a7…1f9dc4` (full value in §3.2). *(Unmeasured at eef45fa)*
4. After `npx expo export --platform web`, `dist/canvaskit.wasm` exists. *(Code: vercel.json L5–6; Unmeasured)*
5. Served: `GET /canvaskit.wasm` → 200 with `Content-Type: application/wasm`, never HTML. *(Code: vercel.json L7–15)*
6. No module importing Skia evaluates before `ensureCanvasKit()` resolves; the web entry doesn't load CanvasKit. *(Code: index.web.tsx L12–13, ensureCanvasKit.web.ts L13–21)*
7. `npx tsx src/demos/yogesh-thinking-orbs/orb/orbProps.check.ts` prints **`orb props ok`**. *(Run)*

API (§4):

8. `<OrbView />` with no props renders a **20×20** box, look `base`, colour `#ffffff`, speed 1, density 1, dotSize 1, tilt 20, sphere, dots, running. *(Code: OrbView L198–216, orbProps L65–72)*
9. `label="Thinking"` → web box `div` has `role="img"` and `aria-label="Thinking"`. No label → `aria-hidden="true"`. *(Code: L172–183)*
10. `className="x"` → the web box `div` has class `x`. *(Code: L176)*
11. `paused` → the frame callback is inactive. The frame on screen is the last running one, and a prop edit while paused repaints at the held t. An orb mounted paused shows t = 0. *(Code: L220, L247–267, L287–289)*
12. `active={false}` → frozen frame, no clock advance. Back to true → resumes with a jump of at most 100 ms × speed. *(Code: clock.ts L20–23)*
13. `state="working-gyro"` (combined id) → renders **base**. `state="working" variant="gyro"` → Working · Gyro. `state="nope"` → base, and no NaN. *(Run: orbProps.check L128–163)*

Reduced motion (§13.4):

14. Turning the OS reduced-motion setting on **while the page is open** stops every orb at a still frame at t = 0, with no reload. Turning it off resumes motion. *(Code: ReduceMotionContext L17–27; OrbView L220, L287–289. M-gate)*
15. With reduced motion on, dragging the Effects-card Size slider resizes the still orb, which repaints at t = 0 at the new size. *(Code: L260–267. M-gate)*

Colour (§12):

16. `color="nope"` paints white. `#ffffff` → (1, 1, 1); `#171717` → 0.0902 per channel; `#fafafa` → 0.98039. *(Run)*
17. `color(display-p3 1 0 0)` → (1.09307, −0.22674, −0.15013) on web; (1, 0.20346, 0.15875) on Android or Expo Go. *(Run for the floats; the on-screen P3 look is Gap 5)*

Geometry and motion (§6–§11; all computed with the eef45fa files, identical to 9bef3b1):

18. `buildInput` counts (sphere, dots, density 1, dotSize 1) at sizes 20 / 24 / 96 / 320: **80 / 96 / 384 / 1280**. `background`: **20 / 24 / 96 / 320**. `background-spiral`: **105 / 117 / 257 / 486**. *(Run)*
19. At size 96: `rs` **0.9183** (background **1.8366**); `g` **18** (background 9, background-spiral 14); sphere `R` **38.4**, other shapes **46.08**. *(Run)*
20. Shape counts for `working` at 96: cube **386**, octahedron **402**, tetrahedron **394**, torus **374**. Mesh pairs at 96: **675**. *(Run)*
21. Deterministic `step()` checkpoints (size 96, sphere, dots, tilt 20, fresh `makeLocal`; `dots[0..3]` = `[px, py, r, a]`; tolerance 1e-3). *(Run)*
    - base, t = 0: dot0 **[50.769, 12.01, 1.321, 0.529]**; dot100 **[59.115, 41.706, 1.708, 0.959]**
    - working, t = 0: dot0 **[50.769, 12.01, 1.365, 0.555]**
    - working, t = 1000: dot0 **[46.726, 14.134, 1.091, 0.487]**; dot100 **[68.284, 24.135, 0.684, 0]**
    - compacting, t = 1000: dot0 **[50.241, 11.453, 1.296, 0.501]**
    - waiting, t = 3000: dot0 **[48.334, 11.069, 1.278, 0.241]**
    - searching, t = 900: dot0 **[50.512, 11.611, 1.303, 0.229]**
    - retrying, t = 2500: dot0 **[47.071, 11.117, 1.28, 0.484]**
    - base, torus, t = 0: dot0 **[91.776, 48, 1.102, 0.286]**
    - halftone, working, t = 0: g 18, cell 5.3333, **204** cells drawn, sum of radii **311.117**
    These check your port against the tree, not against live.
22. Yaw lap at speed 1: base **6500 ms**; working **3000**; reasoning **6500**; searching, background, waiting and lighthouse **13000**; compacting **10000**. Retrying-surge makes 1 turn per **3250 ms**. *(Code: simulate.ts L24–40, L69–77)*
23. Effect cycles: working ring **1700 ms** (moving for 1200); compacting sweep **2800 ms**; lens hop **1800 ms**; lighthouse beam **2500 ms**; reasoning hop **220 ms**; waiting head **2000 ms**, latitude and glow **6000 ms**; gyro **5000 ms**; twist **2600 ms**. *(Code: §11.10)*
24. `speed={2}` halves every period above in real time; `speed={0.05}` makes them 20× longer. *(Code: clock.ts L21)*
25. `tilt` changes pitch on dots, crosses, dashes, squares and mesh, and has **no effect** on halftone, lines or verticalLines. Torus always adds **35°**. *(Code: §10)*
26. Two orbs with the same look and speed stay phase-locked. Changing one's speed puts it on a separate clock. *(Code: L274)*
27. Changing look, shape, render, size, density or dotSize swaps the geometry on the next frame, with **no crossfade**. *(Code: L230–238)*
28. Unmounting an orb that has `onFrame` delivers a `data:image/png;base64,…` string. *(Code: L139–153)*
29. When the route loses focus, the orb renders `null`. `SkiaRuntimeContext` `{mount:false}` renders an empty `size × size` View. *(Code: L303–304)*
30. With `live` set, `live.value = {...live.value, tilt: -90}` changes the pitch on the next frame without a React render. Writing only `size` through `live` doesn't change the drawing. *(Code: L273, §13.5)*

Effects card at 1280 (§15):

31. Window ≥ 1280 → row layout: padding 32 left / 42 right / 24 vertical, gap 24, list 280 wide, slider 256 wide, orb 320 by default, 15 labels in 14/20 type, "↑ ↓ to switch" hint in 12/16. *(Code: Showcase L25–98. M-gate)*
32. Working (index 1) is selected on load and is `#fafafa`; the others are `#a1a1a1`. ↑/↓ wraps through the 15 looks except while the slider is focused. *(Code: L18, L56; useArrowKeys.web L4–23)*
33. Size slider: drag → the orb resizes, with JS publishes at most every 32 ms. Keys ←/→ ±1, Shift ±10, PageUp/PageDown ±10, Home 16, End 480. *(Code: SliderRow L203–224, L282–286)*
34. Label and value text: system-ui 13/500 at left 10 and Geist Mono 500 13/500 at right 12, both `rgba(255,255,255,0.7)`. *(Code: SliderRow L331–361. M-gate)*
35. Geist 400 loads after window `load`, so the list repaints from the fallback ~150 ms after first paint. *(Gap 9)*
36. Look-name label widths: 5 of 16 look-name labels are 1–4 px narrower. *(Gap 10)*
37. Look-name hit area and the hint's `role=navigation` wrapper. *(Gap 11)*
38. P3 colour on a real GPU and Safari. *(Gap 5)*
39. Phone widths, iOS and Android. *(Gap 6)*
40. Pixel-for-pixel orb frames vs live npm. *(Unmeasured)*

## 18. Forbidden
- Browsing, fetching or opening any URL, or asking anyone to.
- Changing `@shopify/react-native-skia` from 2.6.2; adding a Skia patch or `WithSkiaWeb`; loading CanvasKit in the web entry; letting a Skia-importing module evaluate before `ensureCanvasKit()` resolves.
- `setState` per frame, or disposing a picture that's still on screen.
- Adding shaders, gradients, glow, blur, crossfades, easing curves or colours that aren't in §7–§12.
- Adding theme logic inside the orb, or props that aren't in §4.1.
- Copying store chrome (card frame, nav, Copy/prompt buttons, canvas budget, catalog) into the asset.
- Presenting PR #26 code as merged, or "fixing" the known gaps in §16.1.
- Claiming iOS, Android or phone widths work without running them.

## Appendix index

| # | Path | Lines | Bytes | sha256 |
|---|---|---|---|---|
| 1 | `src/demos/yogesh-thinking-orbs/orb/OrbView.tsx` | 306 | 9672 | `1c2599ee3b556f3637544706b7a9c88c72a80f9fdeb7aee99ffe9fef800464a8` |
| 2 | `src/demos/yogesh-thinking-orbs/orb/orbProps.ts` | 113 | 3081 | `8e990c10d0a2048898e8b2c85f34f08da51013414547372760116aaa1d5331e2` |
| 3 | `src/demos/yogesh-thinking-orbs/orb/orbProps.check.ts` | 58 | 2749 | `d09f070fa130141e39db1653d727df1ca973f2b8a938b72566db04de5d991aff` |
| 4 | `src/demos/yogesh-thinking-orbs/orb/model.ts` | 184 | 5316 | `c1bf18fc38db285f308997ff3e56bf7c32b2de27b4b15062be9a8b4470259339` |
| 5 | `src/demos/yogesh-thinking-orbs/orb/shapes.ts` | 152 | 5288 | `66a83710f294180c1a301f317747519f73d9c6c6314ad36e4d294c1edad35cce` |
| 6 | `src/demos/yogesh-thinking-orbs/orb/simulate.ts` | 433 | 13389 | `67a78f08b6da4412ac629e8c138d5ffd597f44b3b87db04ca5bf6c8e85b85a65` |
| 7 | `src/demos/yogesh-thinking-orbs/orb/draw.ts` | 133 | 4279 | `7d2285248fea2d544a6340d9a9e8d4454615766c765f243b639f0f3fd21cb788` |
| 8 | `src/demos/yogesh-thinking-orbs/orb/clock.ts` | 26 | 687 | `62b73101293bbd0c02a08a759b5ed80d0e1ba0654a4f9f2ae979d93d3fdf0973` |
| 9 | `src/demos/yogesh-thinking-orbs/orb/LICENSE` | 21 | 1063 | `1c87dcf3935109d8f8dfa2435aa71dfd28164a1f84d0b243030936fd2062ca57` |
| 10 | `src/demos/yogesh-thinking-orbs/color/color.ts` | 238 | 9689 | `c9fe5fa7acee4e033f4d4a36fd33cd92c34413aa155a92704ec4530226f517fe` |
| 11 | `src/context/ReduceMotionContext.tsx` | 46 | 1459 | `7c7229dc2d772ca05bf14db43cbe254e6b7d6de923e610ff19838c54c6a387c1` |
| 12 | `src/skia/liveBudget.tsx` | 168 | 4501 | `3cb58682fa7f4d40e3df65d472348d3d0c0f1f26b52cc52a6251188e2b0fce68` |
| 13 | `src/demos/yogesh-thinking-orbs/Showcase.tsx` | 102 | 3771 | `1f669afd30562b43a27f58b65c10a9deba47a6a5908c1e3aeb8cbdb44fbcfb03` |
| 14 | `src/skia/ensureCanvasKit.web.ts` | 21 | 736 | `78d0afa56535ca1025d52c986e3cd12b551c9369483affb2010e831ddcc1692f` |
| 15 | `src/skia/bootCanvasKit.ts` | 44 | 1391 | `06ab8d8cd787f4f04a357162920fbcb808b9cef899b255fa3af1bd97df9f8651` |
| 16 | `src/skia/ensureCanvasKit.ts` | 12 | 294 | `07c0c757607e412caf5d0e42f09ecdd3ca68a0bf0bf71b0b71489c90703206d4` |
| 17 | `src/skia/canvasKit.d.ts` | 5 | 69 | `05734e669eec654d047d9fe88ae1c10b6266742869373db3c1ea213f7a16e088` |
| 18 | `src/skia/cardState.ts` | 83 | 2710 | `47c0aeff952a1b0d3e2ea08eb1e18f1ddda119739985b8cab62b93309ce8bc0c` |
| 19 | `src/demos/yogesh-thinking-orbs/components/SliderRow.tsx` | 416 | 15362 | `9c00d8d535961dbba35c2aae7ef4ce31adc8aa81be665077352b9e1a2a0d3bf2` |
| 20 | `src/demos/yogesh-thinking-orbs/content/cards.ts` | 180 | 5117 | `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d` |
| 21a | `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.web.ts` | 23 | 925 | `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf` |
| 21b | `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.ts` | 2 | 186 | `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258` |
| 22 | `babel.config.js` | 7 | 155 | `b88376188d8e9c110ae64b58881df514fcbe30a5cf1257b7b2561ae18560cbfd` |
| 23 | `tsconfig.json` | 17 | 242 | `e8e9605c3b1a521e797d6d3a5fd271121fdfbd0aab0904be0873469bc0347a77` |
| 24 | `src/demos/yogesh-thinking-orbs/theme/theme.tsx` | 176 | 4677 | `3d08daedb8bb47fe858d867c5ebb60c3cd8b80b4382b20db3440f1cff1b6431f` |

`package.json`, `package-lock.json`, `vercel.json` and `metro.config.js` are cited in §3 but not inlined: they are mostly store configuration. The values the asset needs are copied into §3.

## Appendices: verbatim source at eef45fa

Every file is reproduced exactly as it is at `eef45fa9f0b5c60768756ee3e0b0f2e10de16d30`. The fence is longer than any backtick run inside the file. Line numbers in citations count from line 1 of each block.

### Appendix 1. `src/demos/yogesh-thinking-orbs/orb/OrbView.tsx`

306 lines, 9672 bytes, sha256 `1c2599ee3b556f3637544706b7a9c88c72a80f9fdeb7aee99ffe9fef800464a8`. Byte-for-byte from eef45fa.

```tsx
import { Canvas, Picture, Skia, useCanvasRef, type SkPicture } from "@shopify/react-native-skia";
import { createElement, memo, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Platform, View } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useIsFocused } from "expo-router";
import { useFrameCallback, useSharedValue, runOnUI, type SharedValue } from "react-native-reanimated";
import { useReduceMotion } from "@/src/context/ReduceMotionContext";
import {
  ORB_DEFAULT_COLOR,
  ORB_DEFAULT_DENSITY,
  ORB_DEFAULT_DOT_SIZE,
  ORB_DEFAULT_PAUSED,
  ORB_DEFAULT_SIZE,
  ORB_DEFAULT_SPEED,
  ORB_DEFAULT_STATE,
  ORB_DEFAULT_TILT,
} from "./orbProps";
import { useSkiaRuntime } from "@/src/skia/liveBudget";

import { parseColor, toExtendedSrgb, toSrgb } from "../color/color";
import { clocks, tick } from "./clock";
import { drawOrb } from "./draw";
import { buildInput, type OrbInput, type RenderName, type ShapeName } from "./model";
import { makeLocal, step, type OrbLocal } from "./simulate";

export type OrbLive = {
  size: number;
  speed: number;
  density: number;
  dotSize: number;
  tilt: number;
  r: number;
  g: number;
  b: number;
  a: number;
};

/**
 * Extended-sRGB floats can sit outside 0–1. Stock JsiSkColor::fromValue
 * (JsiSkColor.h) packs r*255 with no clamp, so a component above 1 paints
 * black. canUseExtendedColor() is the gate: true only where those floats
 * survive. Android's GL surface is sRGB, so it always clamps. iOS Expo Go
 * (ExecutionEnvironment.StoreClient) ships an unpatched Skia binary and
 * clamps too. Other iOS builds compile cpp/api/JsiSkPaint.h after
 * postinstall, and that patch calls setColor4f, so they keep the floats.
 * Web is unchanged.
 */
export function canUseExtendedColor(): boolean {
  if (Platform.OS === "android") return false;
  if (Platform.OS === "ios") return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
  return true;
}

export function colorToRgba(color: string): { r: number; g: number; b: number; a: number } {
  const parsed = parseColor(color);
  if (!parsed) return { r: 1, g: 1, b: 1, a: 1 };
  if (!canUseExtendedColor()) return toSrgb(parsed);
  return toExtendedSrgb(parsed);
}

function blankPicture(): SkPicture {
  const recorder = Skia.PictureRecorder();
  recorder.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
  return recorder.finishRecordingAsPicture();
}

function usePicture() {
  const initial = useRef<SkPicture | null>(null);
  if (initial.current === null) initial.current = blankPicture();
  const picture = useSharedValue<SkPicture>(initial.current);
  const retire = useSharedValue<SkPicture | null>(null);
  return { picture, retire };
}

export type OrbViewProps = {
  /** Omitted state is npm's `base`. Unknown ids resolve inside `buildInput`. */
  state?: string;
  variant?: string;
  /** npm default is 20. */
  size?: number;
  speed?: number;
  density?: number;
  dotSize?: number;
  tilt?: number;
  shape?: ShapeName;
  render?: RenderName;
  /** Omitted color paints the dark-store stand-in for npm `currentColor`. */
  color?: string;
  /** When false the canvas stays mounted but does not tick. */
  active?: boolean;
  /** npm `paused`: hold the frame and do not tick. */
  paused?: boolean;
  /** Screen-reader name. Without one the orb is hidden from assistive tech. */
  label?: string;
  /** Web className passthrough on the orb box. */
  className?: string;
  /** Playground sliders write here. Landing orbs leave it unset. */
  live?: SharedValue<OrbLive>;
  /** Last rasterized frame, for a card that has scrolled its canvas away. */
  onFrame?: (uri: string) => void;
};

function useOrbReduced(): boolean {
  return useReduceMotion().reduceMotion;
}

function paint(
  picture: SharedValue<SkPicture>,
  retire: SharedValue<SkPicture | null>,
  input: OrbInput,
  local: OrbLocal,
  tune: OrbLive,
  time: number,
) {
  "worklet";
  step(input, local, time, tune.tilt, 1);
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, input.size, input.size));
  drawOrb(canvas, input, local, { r: tune.r, g: tune.g, b: tune.b, a: tune.a });
  const next = recorder.finishRecordingAsPicture();
  const old = retire.value;
  retire.value = picture.value;
  picture.value = next;
  if (old) old.dispose();
}

function CanvasHost({
  size,
  picture,
  onFrame,
}: {
  size: number;
  picture: SharedValue<SkPicture>;
  onFrame?: (uri: string) => void;
}) {
  const ref = useCanvasRef();
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  useEffect(() => {
    return () => {
      const report = onFrameRef.current;
      const canvas = ref.current;
      if (!report || !canvas) return;
      try {
        const image = canvas.makeImageSnapshot();
        const b64 = image.encodeToBase64();
        image.dispose();
        if (b64) report(`data:image/png;base64,${b64}`);
      } catch {
        // The surface can already be gone while the view unmounts.
      }
    };
  }, [ref]);
  return (
    <Canvas ref={ref} style={{ width: size, height: size }} pointerEvents="none" colorSpace="p3">
      <Picture picture={picture} />
    </Canvas>
  );
}

function OrbFrame({
  size,
  label,
  className,
  children,
}: {
  size: number;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  if (Platform.OS === "web") {
    return createElement(
      "div",
      {
        className,
        role: label ? "img" : undefined,
        "aria-label": label,
        "aria-hidden": label ? undefined : true,
        style: { width: size, height: size, lineHeight: 0 },
      },
      children,
    );
  }
  return (
    <View
      accessibilityRole={label ? "image" : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={label ? undefined : true}
      importantForAccessibility={label ? "auto" : "no-hide-descendants"}
      style={{ width: size, height: size }}
    >
      {children}
    </View>
  );
}

function OrbCanvas({
  state = ORB_DEFAULT_STATE,
  variant,
  size = ORB_DEFAULT_SIZE,
  speed = ORB_DEFAULT_SPEED,
  density = ORB_DEFAULT_DENSITY,
  dotSize = ORB_DEFAULT_DOT_SIZE,
  tilt = ORB_DEFAULT_TILT,
  shape = "sphere",
  render = "dots",
  color = ORB_DEFAULT_COLOR,
  active = true,
  paused = ORB_DEFAULT_PAUSED,
  label,
  className,
  live,
  onFrame,
  reduced,
}: OrbViewProps & { reduced: boolean }) {
  const { picture, retire } = usePicture();
  const inputSV = useSharedValue<OrbInput | null>(null);
  const localSV = useSharedValue<OrbLocal | null>(null);
  const running = active && !paused && !reduced;
  const activeSV = useSharedValue(running);
  const fallback = useSharedValue<OrbLive>({
    size,
    speed,
    density,
    dotSize,
    tilt,
    ...colorToRgba(color),
  });
  const built = useMemo(
    () => buildInput({ state, variant, size, density, dotSize, shape, render }),
    [state, variant, size, density, dotSize, shape, render],
  );

  useEffect(() => {
    inputSV.value = built;
    localSV.value = null;
  }, [built, inputSV, localSV]);

  useLayoutEffect(() => {
    activeSV.value = running;
    if (!live) {
      fallback.value = { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    }
  }, [running, color, size, speed, density, dotSize, tilt, live, activeSV, fallback]);

  // Reduced motion paints from props at t=0. Entering pause holds the current picture.
  // A later state, size, or colour edit while paused repaints that same time.
  const wasPaused = useRef(paused);
  const heldT = useRef(0);
  useLayoutEffect(() => {
    const tune: OrbLive = { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    const enteredPause = paused && !wasPaused.current;
    wasPaused.current = paused;
    if (enteredPause && !reduced) {
      const clock = clocks.value[`${built.state}@${tune.speed}`];
      heldT.current = clock ? clock.t : heldT.current;
      return;
    }
    if (!reduced && !paused) return;
    const time = reduced ? 0 : heldT.current;
    const input = built;
    runOnUI(() => {
      "worklet";
      paint(picture, retire, input, makeLocal(input), tune, time);
    })();
  }, [reduced, paused, built, color, density, dotSize, picture, retire, size, speed, tilt]);

  const frameCallback = useFrameCallback((frame) => {
    "worklet";
    const input = inputSV.value;
    if (!input || !activeSV.value) return;
    const tune = live ? live.value : fallback.value;
    const clockKey = `${input.state}@${tune.speed}`;
    const now = frame.timestamp;
    const t = tick(clockKey, now, tune.speed);
    let local = localSV.value;
    const speedKey = `${input.key}@${tune.speed}`;
    if (!local || local.key !== speedKey || local.dots.length !== input.count * 6) {
      local = makeLocal(input);
      local.key = speedKey;
      localSV.value = local;
    }
    paint(picture, retire, input, local, tune, t);
  }, running);

  useLayoutEffect(() => {
    frameCallback.setActive(running);
  }, [running, frameCallback]);

  return (
    <OrbFrame size={size} label={label} className={className}>
      <CanvasHost size={size} picture={picture} onFrame={onFrame} />
    </OrbFrame>
  );
}

export const OrbView = memo(function OrbView(props: OrbViewProps) {
  const focused = useIsFocused();
  const reduced = useOrbReduced();
  const runtime = useSkiaRuntime();
  const size = props.size ?? ORB_DEFAULT_SIZE;
  if (!focused) return null;
  if (!runtime.mount) return <View style={{ width: size, height: size }} />;
  return <OrbCanvas {...props} reduced={reduced} active={props.active !== false && runtime.running} />;
});
```

### Appendix 2. `src/demos/yogesh-thinking-orbs/orb/orbProps.ts`

113 lines, 3081 bytes, sha256 `8e990c10d0a2048898e8b2c85f34f08da51013414547372760116aaa1d5331e2`. Byte-for-byte from eef45fa.

```ts
/**
 * Public orb props aligned with @yogesharc/thinking-orbs 0.1.1 `Orb` / `mountOrb`.
 * An unknown state falls back to `base`. A variant the state does not have falls back to that state's default.
 * `color` is not an npm prop (npm paints `currentColor`); the dark store default is `#ffffff`.
 */

export type OrbStateName =
  | "base"
  | "working"
  | "reasoning"
  | "searching"
  | "background"
  | "retrying"
  | "compacting"
  | "waiting";

export const VARIANTS: Record<OrbStateName, readonly string[]> = {
  base: ["default"],
  working: ["default", "gyro"],
  reasoning: ["default", "twins"],
  searching: ["default", "lighthouse"],
  background: ["default", "spiral"],
  retrying: ["default", "surge"],
  compacting: ["default", "squeeze", "fuse"],
  waiting: ["default"],
};

export type KnownLook =
  | "base"
  | "working"
  | "working-gyro"
  | "reasoning"
  | "reasoning-twins"
  | "searching"
  | "searching-lighthouse"
  | "background"
  | "background-spiral"
  | "retrying"
  | "retrying-surge"
  | "compacting"
  | "compacting-squeeze"
  | "compacting-fuse"
  | "waiting";

export const KNOWN_LOOKS: readonly KnownLook[] = [
  "base",
  "working",
  "working-gyro",
  "reasoning",
  "reasoning-twins",
  "searching",
  "searching-lighthouse",
  "background",
  "background-spiral",
  "retrying",
  "retrying-surge",
  "compacting",
  "compacting-squeeze",
  "compacting-fuse",
  "waiting",
];

const KNOWN = new Set<string>(KNOWN_LOOKS);

export const ORB_DEFAULT_STATE: OrbStateName = "base";
export const ORB_DEFAULT_SIZE = 20;
export const ORB_DEFAULT_COLOR = "#ffffff";
export const ORB_DEFAULT_SPEED = 1;
export const ORB_DEFAULT_DENSITY = 1;
export const ORB_DEFAULT_DOT_SIZE = 1;
export const ORB_DEFAULT_TILT = 20;
export const ORB_DEFAULT_PAUSED = false;

export function isOrbState(value: string): value is OrbStateName {
  return Object.prototype.hasOwnProperty.call(VARIANTS, value);
}

export function isKnownLook(value: string): value is KnownLook {
  return KNOWN.has(value);
}

export function resolveLook(state?: string, variant?: string): KnownLook {
  const which = state !== undefined && isOrbState(state) ? state : ORB_DEFAULT_STATE;
  const v: readonly string[] = VARIANTS[which];
  const own = variant !== undefined && variant !== "default" && v.includes(variant);
  const id = own ? `${which}-${variant}` : which;
  if (isKnownLook(id)) return id;
  return ORB_DEFAULT_STATE;
}

export type OrbPassProps = {
  state?: string;
  variant?: string;
  size?: number;
  speed?: number;
  color?: string;
  paused?: boolean;
  label?: string;
  className?: string;
};

/** Defaults npm applies when `state` / `size` / `paused` are omitted, plus the dark color stand-in. */
export function normalizeOrbProps(props: OrbPassProps = {}) {
  return {
    state: resolveLook(props.state, props.variant),
    size: props.size ?? ORB_DEFAULT_SIZE,
    speed: props.speed ?? ORB_DEFAULT_SPEED,
    color: props.color ?? ORB_DEFAULT_COLOR,
    paused: props.paused ?? ORB_DEFAULT_PAUSED,
    label: props.label,
    className: props.className,
  };
}
```

### Appendix 3. `src/demos/yogesh-thinking-orbs/orb/orbProps.check.ts`

58 lines, 2749 bytes, sha256 `d09f070fa130141e39db1653d727df1ca973f2b8a938b72566db04de5d991aff`. Byte-for-byte from eef45fa. Run it with `npx tsx src/demos/yogesh-thinking-orbs/orb/orbProps.check.ts`; it prints `orb props ok`

```ts
/**
 * Run: npx tsx src/demos/yogesh-thinking-orbs/orb/orbProps.check.ts
 * Unknown looks resolve to a known id, and a slipped id cannot produce NaN yaw.
 */
import { buildInput } from "./model";
import { KNOWN_LOOKS, normalizeOrbProps, resolveLook, type OrbStateName } from "./orbProps";
import { makeLocal, step } from "./simulate";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const known = new Set<string>(KNOWN_LOOKS);

assert(resolveLook() === "base", "omitted state");
assert(resolveLook("nope") === "base", "unknown state");
assert(resolveLook("working-gyro") === "base", "combined id is not a state");
assert(resolveLook("working", "gyro") === "working-gyro", "gyro");
assert(resolveLook("working", "nope") === "working", "unknown variant");
assert(resolveLook("working", "default") === "working", "default variant");
assert(resolveLook("compacting", "fuse") === "compacting-fuse", "fuse");
assert(resolveLook("compacting", "squeeze") === "compacting-squeeze", "squeeze");

const defaults = normalizeOrbProps();
assert(defaults.state === "base" && defaults.size === 20 && defaults.speed === 1, "defaults");
assert(defaults.color === "#ffffff" && defaults.paused === false, "color and paused defaults");
assert(normalizeOrbProps({ paused: true, label: "Thinking", className: "orb" }).paused === true, "paused");

const states: OrbStateName[] = ["base", "working", "reasoning", "searching", "background", "retrying", "compacting", "waiting"];
for (const state of states) {
  for (const variant of ["default", "gyro", "twins", "lighthouse", "spiral", "surge", "squeeze", "fuse", "nope"]) {
    const id = resolveLook(state, variant);
    assert(known.has(id), `resolved ${state}/${variant} -> ${id}`);
  }
}

function finiteLook(state: string, variant?: string) {
  const input = buildInput({ state, variant, size: 48, density: 1, dotSize: 1, shape: "sphere", render: "dots" });
  assert(known.has(input.state), `build ${state}`);
  const local = makeLocal(input);
  step(input, local, 120, 23, 1);
  for (let i = 0; i < local.dots.length; i++) {
    if (!Number.isFinite(local.dots[i])) throw new Error(`NaN dots for ${input.state}`);
  }
  const slipped = { ...input, state: "not-a-look" };
  const slippedLocal = makeLocal(slipped);
  step(slipped, slippedLocal, 80, 20, 1);
  for (let i = 0; i < slippedLocal.dots.length; i++) {
    if (!Number.isFinite(slippedLocal.dots[i])) throw new Error("slipped look produced NaN");
  }
}

finiteLook("nope");
finiteLook("working", "gyro");
finiteLook("reasoning", "twins");
for (const id of KNOWN_LOOKS) finiteLook(id.includes("-") ? id.split("-")[0] : id, id.includes("-") ? id.slice(id.indexOf("-") + 1) : "default");

console.log("orb props ok");
```

### Appendix 4. `src/demos/yogesh-thinking-orbs/orb/model.ts`

184 lines, 5316 bytes, sha256 `c1bf18fc38db285f308997ff3e56bf7c32b2de27b4b15062be9a8b4470259339`. Byte-for-byte from eef45fa.

```ts
/**
 * Point layout from @yogesharc/thinking-orbs 0.1.1 dist/orb-core.js and renders.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 */

import { resolveLook } from "./orbProps";
import { SHAPES, torus, type Pt, type ShapeName } from "./shapes";

export type { ShapeName };

export const RENDERS: readonly ["dots", "crosses", "dashes", "halftone", "lines", "mesh", "squares", "verticalLines"] = [
  "dots",
  "crosses",
  "dashes",
  "halftone",
  "lines",
  "mesh",
  "squares",
  "verticalLines",
];
export type RenderName = (typeof RENDERS)[number];

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const FLAT = new Set<RenderName>(["halftone", "lines", "verticalLines"]);

export function isFlat(render: RenderName): boolean {
  return FLAT.has(render);
}

function dist2(a: Pt, b: Pt): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/** The k points nearest pts[i], nearest first. */
export function nearest(pts: Pt[], i: number, k: number): number[] {
  const idx: number[] = [];
  const d: number[] = [];
  const p = pts[i];
  for (let j = 0; j < pts.length; j++) {
    if (j === i) continue;
    const e = dist2(p, pts[j]);
    let at = idx.length;
    if (at === k) {
      if (e >= d[k - 1]) continue;
      at--;
    }
    while (at > 0 && d[at - 1] > e) {
      idx[at] = idx[at - 1];
      d[at] = d[at - 1];
      at--;
    }
    idx[at] = j;
    d[at] = e;
  }
  return idx;
}

function arms(count: number): Pt[] {
  const at = (lat: number, lon: number): Pt => [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  const g = Math.sqrt((4 * Math.PI) / count);
  const n = 8;
  const along = 0.6 * g;
  const out: Pt[] = [];
  for (let m = 0; m < n; m++) {
    const room = m ? m & -m : n;
    const lim = Math.min((85 * Math.PI) / 180, Math.acos(Math.min(1, (g * n) / (TAU * room))));
    for (let lat = -lim + ((m * 0.618) % 1) * along; lat <= lim; lat += along / Math.sqrt(1 + Math.cos(lat) ** 2))
      out.push(at(lat, (m / n) * TAU - lat));
  }
  return out;
}

function distribute(state: string, count: number, shape: ShapeName): Pt[] {
  if (shape !== "sphere") return SHAPES[shape].points(count, state);
  if (state === "background-spiral") return arms(count);
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    const th = i * GOLDEN;
    out.push([r * Math.cos(th), y, r * Math.sin(th)]);
  }
  return out;
}

export type OrbInput = {
  key: string;
  state: string;
  size: number;
  flat: boolean;
  tip: number;
  count: number;
  R: number;
  rs: number;
  reasoning: boolean;
  twins: boolean;
  /** Model space. Float64 so near-ties in the walker match the npm numbers. */
  pts: Float64Array;
  /** Flat neighbor index buffer, `reach` entries per point, unused slots -1. */
  near: Float32Array;
  reach: number;
  pairs: Float32Array;
  g: number;
  cell: number;
  render: RenderName;
};

const REACH = 24;

/** A known look id. Unknown states become `base`; unknown variants drop to that state's default. */
export function lookId(state: string, variant?: string): string {
  return resolveLook(state, variant);
}

export function buildInput(opts: {
  state: string;
  variant?: string;
  size: number;
  density: number;
  dotSize: number;
  shape: ShapeName;
  render: RenderName;
}): OrbInput {
  const state = lookId(opts.state, opts.variant);
  const size = opts.size;
  const dens = state === "background" ? 1 : 4;
  const asked = Math.max(8, Math.round(size * dens * opts.density));
  const form = opts.shape === "sphere" ? null : SHAPES[opts.shape];
  const c = size / 2;
  const R = c * 0.8 * (form?.scale ?? 1);
  const rs = (size / 64) ** 0.6 * (0.72 * Math.sqrt(4 / dens)) * opts.dotSize;
  const points = distribute(state, asked, opts.shape);
  const count = points.length;
  const pts = new Float64Array(count * 3);
  for (let i = 0; i < count; i++) {
    pts[i * 3] = points[i][0];
    pts[i * 3 + 1] = points[i][1];
    pts[i * 3 + 2] = points[i][2];
  }
  const reasoning = (state === "reasoning" || state === "reasoning-twins") && count > 1;
  const near = new Float32Array(reasoning ? count * REACH : 0);
  if (reasoning) {
    for (let i = 0; i < count; i++) {
      const row = nearest(points, i, REACH);
      for (let j = 0; j < REACH; j++) near[i * REACH + j] = j < row.length ? row[j] : -1;
    }
  }
  const pairList: number[] = [];
  if (opts.render === "mesh" && count > 1) {
    const seen = new Set<number>();
    for (let i = 0; i < count; i++) {
      for (const j of nearest(points, i, 3)) {
        const key = Math.min(i, j) * count + Math.max(i, j);
        if (!seen.has(key)) {
          seen.add(key);
          pairList.push(i, j);
        }
      }
    }
  }
  const pairs = Float32Array.from(pairList);
  const g = Math.max(6, Math.round(Math.sqrt(count) * 0.9));
  return {
    key: `${state}|${opts.shape}|${opts.render}|${size}|${opts.density}|${opts.dotSize}`,
    state,
    size,
    flat: isFlat(opts.render),
    tip: opts.shape === "torus" ? torus.tip : 0,
    count,
    R,
    rs,
    reasoning,
    twins: state === "reasoning-twins",
    pts,
    near,
    reach: REACH,
    pairs,
    g,
    cell: size / g,
    render: opts.render,
  };
}
```

### Appendix 5. `src/demos/yogesh-thinking-orbs/orb/shapes.ts`

152 lines, 5288 bytes, sha256 `66a83710f294180c1a301f317747519f73d9c6c6314ad36e4d294c1edad35cce`. Byte-for-byte from eef45fa.

```ts
/**
 * Port of @yogesharc/thinking-orbs 0.1.1 dist/shapes.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 * Code wins over docs. Not part of the Jakub orbs library.
 */

const TAU = Math.PI * 2;
const TRI = Math.sqrt(8 / 9);

export type Pt = [number, number, number];

function pt(x: number, y: number, z: number): Pt {
  return [x, y, z];
}

function layers(solid: "cube" | "octahedron" | "tetrahedron", count: number): Pt[] {
  const gap = 0.6 * Math.sqrt((4 * Math.PI) / count);
  const n = 6;
  const out: Pt[] = [];
  const ring = (y: number, corners: [number, number][]) =>
    corners.forEach(([ax, az], k) => {
      const [bx, bz] = corners[(k + 1) % corners.length];
      const steps = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / gap));
      for (let q = 0; q < steps; q++) out.push([ax + ((bx - ax) * q) / steps, y, az + ((bz - az) * q) / steps]);
    });
  if (solid === "cube") {
    const h = 1 / Math.sqrt(3);
    for (let i = 0; i < n; i++) ring(h * ((2 * i) / (n - 1) - 1), [[h, h], [-h, h], [-h, -h], [h, -h]]);
    return out.map(([x, y, z]) => [y, x, z]);
  }
  out.push([0, 1, 0]);
  if (solid === "octahedron") {
    out.push([0, -1, 0]);
    for (let i = 1; i <= n; i++) {
      const y = (2 * i) / (n + 1) - 1;
      const w = 1 - Math.abs(y);
      ring(y, [[w, 0], [0, w], [-w, 0], [0, -w]]);
    }
  } else
    for (let i = 0; i < n; i++) {
      const y = -1 / 3 + (4 / 3) * (i / n);
      const w = TRI * (1 - y) * 0.75;
      ring(y, [0, 1, 2].map((k) => [w * Math.cos((k * TAU) / 3), w * Math.sin((k * TAU) / 3)]));
    }
  return out;
}

export const cube = {
  scale: 1.2,
  points(count: number, look: string): Pt[] {
    if (look === "background-spiral") return layers("cube", count);
    const n = Math.max(1, Math.round(Math.sqrt((count - 2) / 6)));
    const at = (i: number) => (2 * i) / n - 1;
    const out: Pt[] = [];
    for (let a = 0; a <= n; a++)
      for (let b = 0; b <= n; b++)
        for (let c = 0; c <= n; c++)
          if (a % n === 0 || b % n === 0 || c % n === 0) {
            const s = Math.sqrt(3);
            out.push(pt(at(a) / s, at(b) / s, at(c) / s));
          }
    return out;
  },
};

export const octahedron = {
  scale: 1.2,
  points(count: number, look: string): Pt[] {
    if (look === "background-spiral") return layers("octahedron", count);
    const n = Math.max(1, Math.round(Math.sqrt((count - 2) / 4)));
    const out: Pt[] = [];
    for (let i = -n; i <= n; i++)
      for (let j = Math.abs(i) - n; j <= n - Math.abs(i); j++) {
        const k = n - Math.abs(i) - Math.abs(j);
        out.push([i / n, j / n, k / n]);
        if (k) out.push([i / n, j / n, -k / n]);
      }
    return out;
  },
};

export const tetrahedron = {
  scale: 1.2,
  points(count: number, look: string): Pt[] {
    let out: Pt[];
    if (look === "background-spiral") out = layers("tetrahedron", count);
    else {
      const top = pt(0, 1, 0);
      const corner = (k: number): Pt => pt(TRI * Math.cos((k * TAU) / 3), -1 / 3, TRI * Math.sin((k * TAU) / 3));
      const base: [Pt, Pt, Pt] = [corner(0), corner(1), corner(2)];
      const n = Math.max(1, Math.round(Math.sqrt((count - 2) / 2)));
      const seen = new Map<string, Pt>();
      const faces: [Pt, Pt, Pt][] = [
        [top, base[0], base[1]],
        [top, base[1], base[2]],
        [top, base[2], base[0]],
        [base[0], base[1], base[2]],
      ];
      for (const [A, B, C] of faces)
        for (let i = 0; i <= n; i++)
          for (let j = 0; i + j <= n; j++) {
            const p = pt(
              A[0] + ((B[0] - A[0]) * i + (C[0] - A[0]) * j) / n,
              A[1] + ((B[1] - A[1]) * i + (C[1] - A[1]) * j) / n,
              A[2] + ((B[2] - A[2]) * i + (C[2] - A[2]) * j) / n,
            );
            seen.set(`${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)},${Math.round(p[2] * 1e4)}`, p);
          }
      out = [...seen.values()];
    }
    const s = Math.sqrt(3 / 4);
    return out.map(([x, y, z]): Pt => [x * s, (y - 1 / 3) * s, z * s]);
  },
};

const RING = 0.65;
const TUBE = 0.3;

export const torus = {
  scale: 1.2,
  tip: 35,
  points(count: number, look: string): Pt[] {
    const at = (u: number, v: number): Pt => {
      const w = RING + TUBE * Math.cos(v);
      return [w * Math.cos(u), TUBE * Math.sin(v), w * Math.sin(u)];
    };
    const out: Pt[] = [];
    if (look === "background-spiral") {
      const along = 0.6 * Math.sqrt((4 * Math.PI) / count);
      const strands = 6;
      const turns = 3;
      for (let k = 0; k < strands; k++)
        for (let u = 0; u < TAU; ) {
          const v = (k / strands) * TAU + turns * u;
          out.push(at(u, v));
          u += along / Math.hypot(RING + TUBE * Math.cos(v), TUBE * turns);
        }
      return out;
    }
    const gap = Math.sqrt((4 * Math.PI ** 2 * RING * TUBE) / count);
    const nv = Math.max(3, Math.round((TAU * TUBE) / gap));
    for (let j = 0; j < nv; j++) {
      const v = (j / nv) * TAU;
      const nu = Math.max(3, Math.round((TAU * (RING + TUBE * Math.cos(v))) / gap));
      for (let i = 0; i < nu; i++) out.push(at(((i + (j % 2) / 2) / nu) * TAU, v));
    }
    return out;
  },
};

export const SHAPES = { cube, octahedron, tetrahedron, torus };
export type ShapeName = "sphere" | keyof typeof SHAPES;
```

### Appendix 6. `src/demos/yogesh-thinking-orbs/orb/simulate.ts`

433 lines, 13389 bytes, sha256 `67a78f08b6da4412ac629e8c138d5ffd597f44b3b87db04ca5bf6c8e85b85a65`. Byte-for-byte from eef45fa.

```ts
/**
 * Per-frame orb motion, ported from @yogesharc/thinking-orbs 0.1.1 dist/orb-core.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 * If this file and MOTION_LOCK disagree, this code (the npm source) wins.
 */

import type { OrbInput } from "./model";

const TAU = Math.PI * 2;
const ease = (x: number) => {
  "worklet";
  return (1 - Math.cos(Math.PI * x)) / 2;
};
const hash = (n: number) => {
  "worklet";
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};
const spring = (x: number) => {
  "worklet";
  return 1 - Math.exp(-4.5 * x) * Math.cos(3 * Math.PI * x) - x * Math.exp(-4.5);
};

const PERIOD: Record<string, number> = {
  base: 6500,
  working: 3000,
  "working-gyro": 3000,
  reasoning: 6500,
  "reasoning-twins": 6500,
  searching: 13000,
  "searching-lighthouse": 13000,
  background: 13000,
  "background-spiral": 13000,
  retrying: 13000,
  "retrying-surge": 13000,
  compacting: 10000,
  "compacting-squeeze": 10000,
  "compacting-fuse": 10000,
  waiting: 13000,
};

function rewind(t: number, w: number) {
  "worklet";
  const P = 3200;
  const k = Math.floor(t / P);
  const u = t - k * P;
  const back = 0.6 * 2100 * w;
  const fwd = (2000 + 100 + 100) * w;
  let a: number;
  if (u < 2000) a = u * w;
  else if (u < 2200) {
    const x = (u - 2000) / 200;
    a = (2000 + 200 * (x - (x * x) / 2)) * w;
  } else if (u < 3000) a = 2100 * w - back * spring((u - 2200) / 800);
  else {
    const x = (u - 3000) / 200;
    a = 2100 * w - back + 100 * x * x * w;
  }
  return k * (fwd - back) + a;
}

function periodOf(state: string) {
  "worklet";
  const period = PERIOD[state];
  return period === undefined ? 6500 : period;
}

function yawOf(state: string, t: number) {
  "worklet";
  if (state === "retrying") return rewind(2 * t, TAU / 9000);
  if (state === "retrying-surge") {
    const turns = t / 3250;
    const u = turns - Math.floor(turns);
    return (Math.floor(turns) + (1 - (1 - u) ** 3)) * TAU;
  }
  return (t / periodOf(state)) * TAU;
}

const RING_TIP = (30 * Math.PI) / 180;
const RING_ROLL = (10 * Math.PI) / 180;
const RING_AXIS = [
  -Math.sin(RING_ROLL) * Math.cos(RING_TIP),
  Math.cos(RING_ROLL) * Math.cos(RING_TIP),
  Math.sin(RING_TIP),
];
const TWIST = 1.4;
const LEAN = (30 * Math.PI) / 180;
const TRAIL = Math.PI / 2;
const LENS_MS = 1800;
const MOVE = 0.4;
const LENS = 0.6;
const HOP = 220;
const TAIL = 5;
const WALK = 16;

function spot(k: number) {
  "worklet";
  const phi = k * 2.45 + hash(k) * 1.5;
  const theta = ((15 + 30 * hash(k + 0.5)) * Math.PI) / 180;
  return [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];
}

function lensAt(t: number) {
  "worklet";
  const k = Math.floor(t / LENS_MS);
  const u = t / LENS_MS - k;
  const e = u < MOVE ? (1 - Math.cos((u / MOVE) * Math.PI)) / 2 : 1;
  const a = spot(k);
  const b = spot(k + 1);
  const v = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
}

export type OrbLocal = {
  key: string;
  walks: number[][];
  hops: number;
  ink: Float32Array;
  hits: Float32Array;
  dots: Float32Array;
  lit: Float32Array;
};

export function makeLocal(input: OrbInput): OrbLocal {
  "worklet";
  const walks: number[][] = [];
  if (input.reasoning) {
    walks.push([]);
    if (input.twins) walks.push([]);
  }
  const g2 = input.g * input.g;
  return {
    key: input.key,
    walks,
    hops: 0,
    ink: new Float32Array(g2),
    hits: new Float32Array(g2),
    dots: new Float32Array(input.count * 6),
    lit: new Float32Array(input.count),
  };
}

function pdist(pts: Float64Array, i: number, j: number) {
  "worklet";
  const dx = pts[i * 3] - pts[j * 3];
  const dy = pts[i * 3 + 1] - pts[j * 3 + 1];
  const dz = pts[i * 3 + 2] - pts[j * 3 + 2];
  return dx * dx + dy * dy + dz * dz;
}

export function step(input: OrbInput, local: OrbLocal, t: number, tilt: number, dotScale: number) {
  "worklet";
  const state = input.state;
  const pts = input.pts;
  const count = input.count;
  const size = input.size;
  const flat = input.flat;
  const rs = input.rs * dotScale;
  const c = size / 2;
  const R = input.R;
  const period = periodOf(state);
  const yaw = yawOf(state, t);
  const gyro = state === "working-gyro" ? (t / 5000) * TAU : -1;
  const pitch = (((flat ? 0 : tilt) + input.tip + (gyro < 0 ? 0 : 10 * Math.cos(gyro))) * Math.PI) / 180;
  const roll = gyro < 0 ? 0 : ((12 * Math.sin(gyro)) * Math.PI) / 180;
  const sr = Math.sin(roll);
  const cr = Math.cos(roll);
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const st = Math.sin(pitch);
  const ct = Math.cos(pitch);

  const facing = (k: number) => {
    const x = pts[k * 3];
    const y = pts[k * 3 + 1];
    const z = pts[k * 3 + 2];
    return y * st + (-x * sy + z * cy) * ct;
  };

  if (local.lit.length !== count) local.lit = new Float32Array(count);
  else local.lit.fill(0);

  if (input.reasoning) {
    const s = t / HOP;
    const n = Math.floor(s);
    const f = s - n;
    const walks = local.walks;
    if (!walks[0].length) {
      let first = 0;
      let bestF = facing(0);
      for (let k = 1; k < count; k++) {
        const fk = facing(k);
        if (fk > bestF) {
          bestF = fk;
          first = k;
        }
      }
      for (let w = 0; w < walks.length; w++) {
        if (!w) walks[w].push(first);
        else {
          let best = 0;
          let score = -Infinity;
          for (let k = 0; k < count; k++) {
            const sc = facing(k) + pdist(pts, k, first);
            if (sc > score) {
              score = sc;
              best = k;
            }
          }
          walks[w].push(best);
        }
      }
    }
    local.hops = Math.max(local.hops, n - WALK);
    for (; local.hops < n; local.hops++) {
      const hop = local.hops;
      for (let w = 0; w < walks.length; w++) {
        const walk = walks[w];
        const from = walk[walk.length - 1];
        const recentStart = Math.max(0, walk.length - 8);
        const other = state === "reasoning-twins" ? walks[1 - w][walks[1 - w].length - 1] : -1;
        const span = input.reach;
        const base = from * span;
        let best = -1;
        let score = -Infinity;
        for (let j = 0; j < span; j++) {
          const k = input.near[base + j];
          if (k < 0) break;
          let seen = false;
          for (let r = recentStart; r < walk.length; r++) if (walk[r] === k) seen = true;
          if (seen) continue;
          const apart = other < 0 ? 0 : 1.2 * Math.min(Math.sqrt(pdist(pts, k, other)), 0.8);
          const sc = facing(k) + 0.35 * hash(hop * 31 + j + w * 977) + apart;
          if (sc > score) {
            score = sc;
            best = k;
          }
        }
        walk.push(best < 0 ? input.near[base] : best);
        if (walk.length > WALK) walk.shift();
      }
    }
    for (let w = 0; w < walks.length; w++) {
      const walk = walks[w];
      for (let j = TAIL - 1; j >= 0; j--) {
        const idx = walk.length - 1 - j;
        if (idx < 0) continue;
        const k = walk[idx];
        const v = j === 0 ? ease(Math.min(1, f * 2)) : 1 - (j - 1 + f) / TAIL;
        if (v > local.lit[k]) local.lit[k] = v;
      }
    }
  }

  const head = (t / 2000) * TAU + yaw;
  const ahead = TAU / 2000 + TAU / period;
  const headLat = (tt: number) => ((70 * Math.PI) / 180) * (1 - 2 * ((tt % 6000) / 6000));
  const glow = Math.min(1, 3 * Math.sin(Math.PI * ((t % 6000) / 6000)));
  const lens = state === "searching" ? lensAt(t) : null;
  const tw =
    state === "working-gyro" ? 0.5 * Math.sin((t / 2600) * TAU) : state === "compacting-squeeze" ? Math.sin((t / 2600) * TAU) : 0;
  const compacting = state === "compacting" || state === "compacting-fuse";
  let sweepAt = 0;
  let sweepHold = 0;
  let hasSweep = false;
  if (compacting) {
    const u = (t % 2800) / 2800;
    const s = (u - 0.7) / 0.3;
    const release =
      state === "compacting-fuse"
        ? (1 - s) ** 3
        : s < 0.45
          ? 1 - 1.25 * ease(s / 0.45)
          : s < 0.7
            ? -0.25 * (1 - (s - 0.45) / 0.25) ** 2
            : 0;
    sweepAt = -1.15 + 2.3 * Math.min(1, u / 0.7);
    sweepHold = u < 0.7 ? 1 : release;
    hasSweep = true;
  }

  const g = input.g;
  const cell = input.cell;
  const g2 = g * g;
  if (local.ink.length !== g2) {
    local.ink = new Float32Array(g2);
    local.hits = new Float32Array(g2);
  } else {
    local.ink.fill(0);
    local.hits.fill(0);
  }
  if (local.dots.length !== count * 6) local.dots = new Float32Array(count * 6);
  const flatRender = input.render === "halftone" || input.render === "lines" || input.render === "verticalLines";

  for (let i = 0; i < count; i++) {
    const x = pts[i * 3];
    const y = pts[i * 3 + 1];
    const z = pts[i * 3 + 2];
    const turn = yaw + TWIST * tw * y;
    const ly = tw ? Math.sin(turn) : sy;
    const lc = tw ? Math.cos(turn) : cy;
    const z1 = -x * ly + z * lc;
    let vx = x * lc + z * ly;
    let vy = y * ct - z1 * st;
    const sx = z1;
    const sy2 = vx * st;
    const vz = y * st + z1 * ct;
    const d = (vz + 1) / 2;
    let r = (0.5 + 1.4 * d) * rs;
    let a = Math.max(0, (d - 0.3) / 0.7);
    if (lens) {
      const hypot = Math.hypot(vx, vy, vz) || 1;
      const ang = Math.acos(Math.min(1, (vx * lens[0] + vy * lens[1] + vz * lens[2]) / hypot));
      const w = ang < LENS ? (1 - (ang / LENS) ** 2) ** 2 : 0;
      a *= 1 - 0.55 * (1 - w);
      if (size <= 24) r *= 1 + 0.5 * w;
      if (w) {
        vx *= 1 + 0.12 * w;
        vy *= 1 + 0.12 * w;
        vx += (vx - lens[0]) * 0.35 * w;
        vy += (vy - lens[1]) * 0.35 * w;
        r *= 1 + 0.9 * w;
        a += (1 - a) * w;
      }
    }
    if (hasSweep) {
      const q = vx;
      const w = Math.min(1, Math.max(0, (sweepAt - q) / 0.2)) * sweepHold;
      const k = state === "compacting" ? 1.5 : 1;
      vx *= 1 - 0.2 * k * w;
      vy *= 1 - 0.2 * k * w;
      r *= 1 - 0.3 * k * w;
      if (state === "compacting-fuse") {
        a *= 1 - 0.5 * w;
        const gg = Math.exp(-(((q - sweepAt) / 0.08) ** 2)) * Math.max(0, sweepHold) * Math.min(1, d / 0.5);
        r *= 1 + 0.8 * gg;
        a += (1 - a) * gg;
      }
    }
    if (state === "working") {
      const u = t % 1700;
      const at = 1.3 - 2.6 * ease(Math.min(1, u / 1200));
      const q = flat ? vy : vx * RING_AXIS[0] + vy * RING_AXIS[1] + vz * RING_AXIS[2];
      const gg = u < 1200 ? Math.exp(-(((q - at) / 0.2) ** 2)) : 0;
      r *= 1 + 0.6 * gg;
      a += (1 - a) * gg;
      const w = Math.min(1, Math.max(0, (q - at) / 0.2)) * (u < 1200 ? 1 : 1 - Math.min(1, 1.6 * ((u - 1200) / 800)));
      vx *= 1 - 0.08 * w;
      vy *= 1 - 0.08 * w;
      r *= 1 - 0.15 * w;
    }
    if (state === "searching-lighthouse") {
      a *= 0.5;
      const lr = Math.sin(LEAN);
      const lcy = Math.cos(LEAN);
      const across = vx * lcy - vy * lr;
      const toward = -st * (vx * lr + vy * lcy) + ct * vz;
      const off = Math.atan2(across, toward) - (((t / 2500) % 1) * TAU - Math.PI);
      const dphi = ((((off + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
      const beam = dphi < 0 ? Math.max(0, 1 + dphi / TRAIL) : Math.exp(-((dphi / 0.45) ** 2));
      const gg = beam * (0.25 + 0.75 * Math.min(1, Math.max(0, (d - 0.4) / 0.3)));
      r *= 1 + 0.6 * gg;
      a += (1 - a) * gg;
    }
    if (input.reasoning) {
      const spark = local.lit[i];
      a *= 0.5;
      if (spark) {
        r *= 1 + 0.8 * spark;
        a += (1 - a) * spark;
      }
    }
    if (state === "waiting") {
      const mag = Math.hypot(x, y, z) || 1;
      const lat = Math.asin(y / mag);
      const lon = Math.atan2(z, x);
      const off = Math.atan2(Math.sin(lon - head), Math.cos(lon - head));
      const along = off * Math.cos(lat);
      const gg =
        Math.exp(-(((lat - headLat(t + off / ahead)) / 0.28) ** 2)) *
        Math.exp(-((along / (off * ahead > 0 ? 0.12 : 1)) ** 2));
      const w = glow * gg ** 0.6;
      a = a * 0.5 + (1 - a * 0.5) * w;
      r *= 1 + 1.1 * w;
    }
    if (roll) {
      const nx = vx * cr - vy * sr;
      const ny = vx * sr + vy * cr;
      vx = nx;
      vy = ny;
    }
    const px = c + vx * R;
    const py = c - vy * R;
    const o = i * 6;
    local.dots[o] = px;
    local.dots[o + 1] = py;
    local.dots[o + 2] = r;
    local.dots[o + 3] = a;
    local.dots[o + 4] = sx;
    local.dots[o + 5] = -sy2;
    if (flatRender) {
      const fx = px / cell - 0.5;
      const fy = py / cell - 0.5;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = fx - ix;
      const ty = fy - iy;
      const weights = [
        [0, 0, (1 - tx) * (1 - ty)],
        [1, 0, tx * (1 - ty)],
        [0, 1, (1 - tx) * ty],
        [1, 1, tx * ty],
      ];
      for (let w = 0; w < 4; w++) {
        const gx = ix + weights[w][0];
        const gy = iy + weights[w][1];
        if (gx < 0 || gy < 0 || gx >= g || gy >= g) continue;
        const f = weights[w][2];
        const idx = gy * g + gx;
        local.ink[idx] += (a * r * f * (0.4 + 0.6 * a)) / rs;
        local.hits[idx] += a * f;
      }
    }
  }
}

export function toneAt(local: OrbLocal, k: number, cell: number) {
  "worklet";
  const hits = local.hits[k];
  if (!hits) return 0;
  return 0.5 * cell * Math.min(1, ((local.ink[k] / hits) * Math.min(1, hits / 0.3)) / 2.2);
}
```

### Appendix 7. `src/demos/yogesh-thinking-orbs/orb/draw.ts`

133 lines, 4279 bytes, sha256 `7d2285248fea2d544a6340d9a9e8d4454615766c765f243b639f0f3fd21cb788`. Byte-for-byte from eef45fa.

```ts
/**
 * Skia draw of the ported renders (renders.js math, Skia calls).
 * Copyright notice for the render math: MIT, Yogesh 2026. See ./LICENSE.
 */
import { PaintStyle, Skia, StrokeCap, type SkCanvas } from "@shopify/react-native-skia";

import type { OrbInput } from "./model";
import { toneAt, type OrbLocal } from "./simulate";

const minR = (r: number) => {
  "worklet";
  return Math.max(0.45, r);
};

export function drawOrb(
  canvas: SkCanvas,
  input: OrbInput,
  local: OrbLocal,
  rgba: { r: number; g: number; b: number; a: number },
) {
  "worklet";
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  const base = Skia.Color(Float32Array.of(rgba.r, rgba.g, rgba.b, rgba.a));
  paint.setColor(base);
  const count = input.count;
  const dots = local.dots;
  const render = input.render;

  if (render === "halftone" || render === "lines" || render === "verticalLines") {
    const g = input.g;
    const cell = input.cell;
    const vertical = render === "verticalLines";
    if (render === "halftone") {
      const n = g * g;
      for (let k = 0; k < n; k++) {
        const rad = toneAt(local, k, cell);
        if (rad < 0.3) continue;
        paint.setAlphaf(rgba.a);
        canvas.drawCircle(((k % g) + 0.5) * cell, (Math.floor(k / g) + 0.5) * cell, rad, paint);
      }
      return;
    }
    for (let j = 0; j < g; j++) {
      const v = (j + 0.5) * cell;
      const path = Skia.Path.Make();
      const top: number[] = [];
      const bot: number[] = [];
      for (let k = 0; k < g; k++) {
        const u = (k + 0.5) * cell;
        const h = 0.8 * toneAt(local, vertical ? k * g + j : j * g + k, cell);
        if (vertical) {
          top.push(v - h, u);
          bot.push(v + h, u);
        } else {
          top.push(u, v - h);
          bot.push(u, v + h);
        }
      }
      const startU = 0;
      const endU = input.size;
      if (vertical) path.moveTo(v, startU);
      else path.moveTo(startU, v);
      for (let k = 0; k < g; k++) path.lineTo(top[k * 2], top[k * 2 + 1]);
      if (vertical) path.lineTo(v, endU);
      else path.lineTo(endU, v);
      for (let k = g - 1; k >= 0; k--) path.lineTo(bot[k * 2], bot[k * 2 + 1]);
      path.close();
      paint.setStyle(PaintStyle.Fill);
      paint.setAlphaf(rgba.a);
      canvas.drawPath(path, paint);
    }
    return;
  }

  if (render === "mesh") {
    const edge = Skia.Paint();
    edge.setAntiAlias(true);
    edge.setColor(base);
    edge.setStyle(PaintStyle.Stroke);
    edge.setStrokeWidth(Math.max(0.35, input.rs * 0.6));
    const pairs = input.pairs;
    for (let e = 0; e < pairs.length; e += 2) {
      const i = pairs[e];
      const j = pairs[e + 1];
      const a = 0.85 * Math.min(dots[i * 6 + 3], dots[j * 6 + 3]);
      if (a < 0.005) continue;
      edge.setAlphaf(a * rgba.a);
      canvas.drawLine(dots[i * 6], dots[i * 6 + 1], dots[j * 6], dots[j * 6 + 1], edge);
    }
  }

  const stroke = render === "dashes" || render === "crosses";
  if (stroke) {
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeCap(StrokeCap.Round);
  } else {
    paint.setStyle(PaintStyle.Fill);
  }

  for (let i = 0; i < count; i++) {
    const o = i * 6;
    const x = dots[o];
    const y = dots[o + 1];
    const r = dots[o + 2];
    const a = dots[o + 3];
    if (a < 0.005) continue;
    paint.setAlphaf(Math.min(1, a) * rgba.a);
    if (render === "dots") {
      canvas.drawCircle(x, y, minR(r), paint);
    } else if (render === "squares") {
      const h = minR(r) * 0.9;
      canvas.drawRect(Skia.XYWHRect(x - h, y - h, 2 * h, 2 * h), paint);
    } else if (render === "dashes") {
      const rr = minR(r);
      const dx = dots[o + 4];
      const dy = dots[o + 5];
      const len = Math.hypot(dx, dy) || 1;
      const ux = (dx / len) * rr * 1.8;
      const uy = (dy / len) * rr * 1.8;
      paint.setStrokeWidth(Math.max(0.5, rr * 0.9));
      canvas.drawLine(x - ux, y - uy, x + ux, y + uy, paint);
    } else if (render === "crosses") {
      const rr = minR(r);
      const h = rr * 1.4;
      paint.setStrokeWidth(Math.max(0.5, rr * 0.7));
      canvas.drawLine(x - h, y, x + h, y, paint);
      canvas.drawLine(x, y - h, x, y + h, paint);
    } else if (render === "mesh") {
      canvas.drawCircle(x, y, minR(r) * 0.4, paint);
    }
  }
}
```

### Appendix 8. `src/demos/yogesh-thinking-orbs/orb/clock.ts`

26 lines, 687 bytes, sha256 `62b73101293bbd0c02a08a759b5ed80d0e1ba0654a4f9f2ae979d93d3fdf0973`. Byte-for-byte from eef45fa.

```ts
import { makeMutable } from "react-native-reanimated";

/**
 * One clock per look (`state@speed`), shared by every orb.
 * Forward-only, frame gap capped at 100ms. Port of orb-core.js `tick`.
 * A paused orb must not call this.
 */
export type Clock = { t: number; last: number };

export const clocks = makeMutable<Record<string, Clock>>({});

export function tick(look: string, now: number, speed: number): number {
  "worklet";
  const map = clocks.value;
  let c = map[look];
  if (c === undefined) {
    c = { t: 0, last: now };
    map[look] = c;
  }
  if (now > c.last) {
    c.t += Math.min(now - c.last, 100) * speed;
    c.last = now;
  }
  clocks.value = map;
  return c.t;
}
```

### Appendix 9. `src/demos/yogesh-thinking-orbs/orb/LICENSE`

21 lines, 1063 bytes, sha256 `1c87dcf3935109d8f8dfa2435aa71dfd28164a1f84d0b243030936fd2062ca57`. Byte-for-byte from eef45fa.

```text
MIT License

Copyright (c) 2026 Yogesh

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

### Appendix 10. `src/demos/yogesh-thinking-orbs/color/color.ts`

238 lines, 9689 bytes, sha256 `c9fe5fa7acee4e033f4d4a36fd33cd92c34413aa155a92704ec4530226f517fe`. Byte-for-byte from eef45fa. The orb uses `parseColor`, `toSrgb` and `toExtendedSrgb`; the rest serves the creator’s colour picker

```ts
/**
 * Color parsing and formatting ported from the live playground's picker
 * (OKLCH internally, Hex / OKLCH / Display P3 serialization).
 *
 * Paint channels:
 * - Web does not clamp. A patched Skia surface is Display P3 when
 *   matchMedia('(color-gamut: p3)') matches, and sRGB otherwise. Skia
 *   converts these extended-sRGB floats onto that surface.
 * - iOS: Canvas colorSpace "p3" (the library default). MetalWindowContext
 *   switches the layer to Display P3 on P3 screens and treats paint input
 *   as sRGB. Pass extended-sRGB floats, including components outside 0–1,
 *   via Float32Array / Color4f, only when canUseExtendedColor() is true
 *   (not Expo Go). Not 8-bit hex.
 * - Android: SkiaPictureViewManager.setColorSpace is a no-op and
 *   OpenGLWindowContext builds the on-screen GL surface with a null color
 *   space, so it is always sRGB. Clamp to sRGB.
 */

export type Oklch = { l: number; c: number; h: number; a: number };
export type ColorFormat = "hex" | "oklch" | "p3";

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const hue360 = (h: number) => ((h % 360) + 360) % 360;
const dot = (m: number[][], v: number[]) => m.map((row) => row.reduce((s, n, i) => s + n * v[i], 0));
const toLinear = (e: number) =>
  Math.abs(e) <= 0.04045 ? e / 12.92 : Math.sign(e) * ((Math.abs(e) + 0.055) / 1.055) ** 2.4;
const toGamma = (e: number) =>
  Math.abs(e) <= 0.0031308 ? 12.92 * e : Math.sign(e) * (1.055 * Math.abs(e) ** (1 / 2.4) - 0.055);

const M_SRGB = [
  [0.4123907993, 0.3575843394, 0.1804807884],
  [0.2126390059, 0.7151686788, 0.0721923154],
  [0.0193308187, 0.1191947798, 0.9505321522],
];
const M_P3 = [
  [0.4865709486, 0.2656676932, 0.1982172852],
  [0.2289745641, 0.6917385218, 0.0792869141],
  [0, 0.0451133819, 1.0439443689],
];
const M_SRGB_INV = [
  [3.2409699419, -1.5373831776, -0.4986107603],
  [-0.9692436363, 1.8759675015, 0.0415550574],
  [0.0556300797, -0.2039769589, 1.0569715142],
];
const M_P3_INV = [
  [2.4934969119, -0.9313836179, -0.4027107845],
  [-0.8294889696, 1.7626640603, 0.0236246858],
  [0.0358458302, -0.0761723893, 0.956884524],
];
const M_OK_LMS = [
  [0.819022438, 0.3619062601, -0.1288737815],
  [0.0329836539, 0.9292868616, 0.0361446664],
  [0.0481771894, 0.2642395318, 0.6335478285],
];
const M_LMS_OK = [
  [1.2268798734, -0.5578149966, 0.2813910502],
  [-0.0405757626, 1.1122868294, -0.0717110667],
  [-0.0763729497, -0.421493324, 1.5869240244],
];

export function rgbToOklch(rgb: number[], a = 1, space: "srgb" | "p3" = "srgb"): Oklch {
  const lin = dot(space === "p3" ? M_P3 : M_SRGB, rgb.map(toLinear));
  const [r, s, b] = dot(M_OK_LMS, lin).map(Math.cbrt);
  const o = 1.9779984951 * r - 2.428592205 * s + 0.4505937099 * b;
  const l = 0.0259040371 * r + 0.7827717662 * s - 0.808675766 * b;
  const u = Math.hypot(o, l);
  return {
    l: clamp(0.2104542553 * r + 0.793617785 * s - 0.0040720468 * b),
    c: u < 1e-7 ? 0 : u,
    h: u < 1e-7 ? 0 : hue360((180 * Math.atan2(l, o)) / Math.PI),
    a: clamp(a),
  };
}

export function oklchToRgb(color: Oklch, space: "srgb" | "p3" = "srgb"): number[] {
  const i = color.c * Math.cos((color.h * Math.PI) / 180);
  const n = color.c * Math.sin((color.h * Math.PI) / 180);
  const lms = dot(M_LMS_OK, [
    (color.l + 0.3963377774 * i + 0.2158037573 * n) ** 3,
    (color.l - 0.1055613458 * i - 0.0638541728 * n) ** 3,
    (color.l - 0.0894841775 * i - 1.291485548 * n) ** 3,
  ]);
  return dot(space === "p3" ? M_P3_INV : M_SRGB_INV, lms).map(toGamma);
}

export function inGamut(color: Oklch, space: "srgb" | "p3" = "srgb"): boolean {
  return oklchToRgb(color, space).every((v) => v >= -1e-5 && v <= 1.00001);
}

export function clampChroma(color: Oklch, space: "srgb" | "p3" = "srgb"): Oklch {
  if (inGamut(color, space)) return color;
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut({ ...color, c: mid }, space)) lo = mid;
    else hi = mid;
  }
  return { ...color, c: lo };
}

export function maxChroma(l: number, h: number, space: "srgb" | "p3" = "srgb"): number {
  if (l <= 0 || l >= 1) return 0;
  return clampChroma({ l, c: 0.5, h, a: 1 }, space).c;
}

const num = (v: number, digits = 4) => Number(v.toFixed(digits));

/**
 * linear-sRGB → linear-Display-P3. Product of the CSS Color 4 XYZ matrices
 * (inverse of display-p3-to-XYZ times sRGB-to-XYZ). The near-zero third
 * column terms are exactly 0 in that product.
 */
const M_SRGB_TO_P3 = [
  [0.8224619687140926, 0.1775380312859074, 0],
  [0.0331941988509757, 0.9668058011490243, 0],
  [0.0170826307211474, 0.0723974406639507, 0.9105199286149019],
];

/** Gamma sRGB floats → Display P3 floats. Round only at the call site. */
export function srgbGammaToDisplayP3(rgb: number[]): number[] {
  return dot(M_SRGB_TO_P3, rgb.map(toLinear)).map(toGamma);
}

/** Gamma Display P3 floats → sRGB floats. Round only at the call site. */
export function displayP3GammaToSrgb(rgb: number[]): number[] {
  return dot(M_SRGB_INV, dot(M_P3, rgb.map(toLinear))).map(toGamma);
}

export function formatColor(color: Oklch, format: ColorFormat): string {
  const alpha = color.a < 1 ? ` / ${num(color.a)}` : "";
  if (format === "oklch") return `oklch(${num(color.l)} ${num(color.c)} ${num(color.h, 2)}${alpha})`;
  if (format === "p3") {
    const srgb = oklchToRgb(clampChroma(color, "srgb"), "srgb").map((v) => clamp(v));
    const p3 = srgbGammaToDisplayP3(srgb);
    return `color(display-p3 ${p3.map((v) => num(v, 5)).join(" ")}${alpha})`;
  }
  const rgb = oklchToRgb(clampChroma(color, "srgb"), "srgb");
  const bytes = rgb.map((v) => Math.round(255 * clamp(v)));
  if (color.a < 1) bytes.push(Math.round(255 * color.a));
  return "#" + bytes.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function toSrgb(color: Oklch): { r: number; g: number; b: number; a: number } {
  const [r, g, b] = oklchToRgb(clampChroma(color, "srgb"), "srgb").map((v) => clamp(v));
  return { r, g, b, a: color.a };
}

/** sRGB floats that may lie outside 0–1. Chroma is limited to the P3 gamut first. */
export function toExtendedSrgb(color: Oklch): { r: number; g: number; b: number; a: number } {
  const [r, g, b] = oklchToRgb(clampChroma(color, "p3"), "srgb");
  return { r, g, b, a: color.a };
}

const UNIT = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(%|deg|grad|rad|turn)?$/i;

function parseNum(raw: string, scale = 1, angle = false): number | null {
  const m = raw.match(UNIT);
  if (!m) return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  const u = m[1]?.toLowerCase();
  if (angle) {
    if (u === "rad") return (180 * n) / Math.PI;
    if (u === "turn") return 360 * n;
    if (u === "grad") return 0.9 * n;
    if (u && u !== "deg") return null;
    return n;
  }
  if (u === "%") return (n * scale) / 100;
  if (u) return null;
  return n;
}

export function parseColor(input: string): Oklch | null {
  const t = input.trim().toLowerCase();
  if (t === "transparent") return { l: 0, c: 0, h: 0, a: 0 };
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(t)) {
    let hex = t.slice(1);
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
    const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16) / 255);
    return rgbToOklch(bytes.slice(0, 3), bytes[3] ?? 1);
  }
  const m = t.match(/^(oklch|rgb|rgba|hsl|hsla|color)\(([^()]*)\)$/);
  if (!m) return null;
  const kind = m[1];
  let body = m[2].trim();
  const isColor = kind === "color";
  if (isColor) {
    if (!body.startsWith("display-p3 ")) return null;
    body = body.slice(11).trim();
  }
  const commas = body.includes(",");
  if (commas && (isColor || kind === "oklch" || body.includes("/"))) return null;
  const parts = commas ? body.split(",").map((s) => s.trim()) : body.split(/\s*\/\s*/);
  if (!commas && parts.length > 2) return null;
  const channels = commas ? parts.slice(0, 3) : parts[0].split(/\s+/);
  if (channels.length !== 3) return null;
  if (commas && parts.length !== 3 && parts.length !== 4) return null;
  if (commas && kind.startsWith("rgb") && channels.some((c) => c.endsWith("%")) && !channels.every((c) => c.endsWith("%")))
    return null;
  const alphaRaw = commas ? parts[3] : parts[1];
  const alpha = alphaRaw === undefined ? 1 : parseNum(alphaRaw);
  if (alpha === null) return null;
  if (kind === "oklch") {
    const l = parseNum(channels[0]);
    const c = parseNum(channels[1], 0.4);
    const h = parseNum(channels[2], 1, true);
    if (l === null || c === null || h === null) return null;
    return { l: clamp(l), c: Math.max(0, c), h: hue360(h), a: clamp(alpha) };
  }
  if (kind.startsWith("hsl")) {
    const h = parseNum(channels[0], 1, true);
    const s = parseNum(channels[1]);
    const l = parseNum(channels[2]);
    if (h === null || s === null || l === null || !channels[1].endsWith("%") || !channels[2].endsWith("%")) return null;
    const S = clamp(s);
    const L = clamp(l);
    const span = S * Math.min(L, 1 - L);
    const f = (n: number) => {
      const k = (n + hue360(h) / 30) % 12;
      return L - span * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return rgbToOklch([f(0), f(8), f(4)], clamp(alpha));
  }
  const scale = isColor ? 1 : 255;
  const rgb = channels.map((c) => parseNum(c, scale));
  if (!rgb.every((v): v is number => v !== null)) return null;
  const mapped = rgb.map((v) => (isColor ? v : clamp(v / 255)));
  return rgbToOklch(mapped, clamp(alpha), isColor ? "p3" : "srgb");
}

export function detectFormat(value: string): ColorFormat {
  const t = value.trim();
  if (/^oklch\(/i.test(t)) return "oklch";
  if (/^color\(display-p3\s/i.test(t)) return "p3";
  return "hex";
}
```

### Appendix 11. `src/context/ReduceMotionContext.tsx`

46 lines, 1459 bytes, sha256 `7c7229dc2d772ca05bf14db43cbe254e6b7d6de923e610ff19838c54c6a387c1`. Byte-for-byte from eef45fa.

```tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

type MotionContextValue = {
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  forceReduceMotion: boolean;
  setForceReduceMotion: (value: boolean) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function ReduceMotionProvider({ children }: { children: ReactNode }) {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [forceReduceMotion, setForceReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setSystemReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      reduceMotion: systemReduceMotion || forceReduceMotion,
      systemReduceMotion,
      forceReduceMotion,
      setForceReduceMotion,
    }),
    [systemReduceMotion, forceReduceMotion],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useReduceMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useReduceMotion must be used inside ReduceMotionProvider');
  return ctx;
}
```

### Appendix 12. `src/skia/liveBudget.tsx`

168 lines, 4501 bytes, sha256 `3cb58682fa7f4d40e3df65d472348d3d0c0f1f26b52cc52a6251188e2b0fce68`. Byte-for-byte from eef45fa. The orb needs only L1–28 (`SkiaRuntime`, `SkiaRuntimeContext`, `useSkiaRuntime`); the registration half from L30 on is the store’s canvas budget (chrome), included so the file compiles as is

```tsx
import { createContext, useContext } from 'react';

/** Prefetch and mount a Skia card when it is within this many pixels of the viewport. */
export const SKIA_NEAR_MARGIN_PX = 200;

/** Live WebGL surfaces. Nearest visible cards win; a card that does not fit is skipped. */
export const SKIA_CANVAS_CAP = 6;

const CANVAS_WEIGHT: Record<string, number> = {
  'border-beam': 2,
  'liquid-metal': 2,
  'yogesh-orb-creator': 2,
};

export type SkiaRuntime = {
  /** This card may own a canvas. False unmounts it and frees the WebGL context. */
  mount: boolean;
  /** Clock and RAF may advance. False freezes the last frame. */
  running: boolean;
};

const defaultRuntime: SkiaRuntime = { mount: true, running: true };

export const SkiaRuntimeContext = createContext<SkiaRuntime>(defaultRuntime);

export function useSkiaRuntime(): SkiaRuntime {
  return useContext(SkiaRuntimeContext);
}

type Reg = {
  id: string;
  cardId: string;
  el: HTMLElement;
  onNear: () => void;
  armed: boolean;
  visible: boolean;
  distance: number;
};

type Snap = {
  hidden: boolean;
  live: ReadonlySet<string>;
};

const regs = new Map<string, Reg>();
const listeners = new Set<() => void>();
let snap: Snap = { hidden: false, live: new Set() };
let listening = false;
let scheduled = false;

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

function weight(cardId: string) {
  return CANVAS_WEIGHT[cardId] ?? 1;
}

function readRect(reg: Reg) {
  const rect = reg.el.getBoundingClientRect();
  const vh = window.innerHeight;
  reg.visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < vh;
  reg.distance = Math.abs(rect.top + rect.height / 2 - vh / 2);
  const near = rect.bottom > -SKIA_NEAR_MARGIN_PX && rect.top < vh + SKIA_NEAR_MARGIN_PX;
  if (near && !reg.armed) {
    reg.armed = true;
    reg.onNear();
  }
}

function computeLive() {
  const visible = [...regs.values()].filter((reg) => reg.visible);
  visible.sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  const live = new Set<string>();
  let used = 0;
  for (const reg of visible) {
    const cost = weight(reg.cardId);
    if (used + cost > SKIA_CANVAS_CAP) continue;
    used += cost;
    live.add(reg.id);
  }
  return live;
}

function publish() {
  const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  const live = hidden ? snap.live : computeLive();
  if (hidden === snap.hidden && sameSet(live, snap.live)) return;
  snap = { hidden, live: hidden ? snap.live : live };
  listeners.forEach((listener) => listener());
}

function measure() {
  if (typeof window === 'undefined') return;
  regs.forEach((reg) => readRect(reg));
  publish();
}

function ensureListening() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      measure();
    });
  };
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('visibilitychange', () => {
    publish();
    if (document.visibilityState === 'visible') measure();
  });
  const margin = `${SKIA_NEAR_MARGIN_PX}px`;
  const io = new IntersectionObserver(
    () => {
      measure();
    },
    { root: null, rootMargin: margin, threshold: [0, 0.01, 1] },
  );
  observeAll = (el) => io.observe(el);
  unobserveAll = (el) => io.unobserve(el);
  regs.forEach((reg) => io.observe(reg.el));
}

let observeAll: ((el: HTMLElement) => void) | null = null;
let unobserveAll: ((el: HTMLElement) => void) | null = null;

export function subscribeSkiaBudget(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSkiaBudget() {
  return snap;
}

export function registerSkiaCard(id: string, cardId: string, el: HTMLElement, onNear: () => void) {
  if (typeof IntersectionObserver !== 'function') {
    onNear();
    return () => {};
  }
  ensureListening();
  const reg: Reg = {
    id,
    cardId,
    el,
    onNear,
    armed: false,
    visible: false,
    distance: Number.POSITIVE_INFINITY,
  };
  regs.set(id, reg);
  observeAll?.(el);
  readRect(reg);
  publish();
  return () => {
    unobserveAll?.(el);
    regs.delete(id);
    publish();
  };
}
```

### Appendix 13. `src/demos/yogesh-thinking-orbs/Showcase.tsx`

102 lines, 3771 bytes, sha256 `1f669afd30562b43a27f58b65c10a9deba47a6a5908c1e3aeb8cbdb44fbcfb03`. Byte-for-byte from eef45fa. The Effects-card host (§15)

```tsx
import { useCallback } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useCardField } from '@/src/skia/cardState';
import { SliderRow } from './components/SliderRow';
import { PLAYGROUND } from './content/cards';
import { useArrowKeys } from './hooks/useArrowKeys';
import { OrbView } from './orb/OrbView';
import { fonts, useTheme } from './theme/theme';

/**
 * Effects showcase: one live orb, the 15 playground looks, and Size.
 * The Tools creator keeps Tuner.tsx; this host does not mount that panel.
 */
export function Showcase() {
  const { width } = useWindowDimensions();
  const wide = width >= 1280;
  const { colors } = useTheme();
  const [index, setIndex] = useCardField('yogesh-thinking-orbs', 'index', 1);
  const [size, setSize] = useCardField('yogesh-thinking-orbs', 'size', 320);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];

  return (
    <View
      testID="yogesh-orb-tuner"
      style={{
        width: '100%',
        backgroundColor: colors.page,
        flexDirection: wide ? 'row' : 'column',
        alignItems: 'center',
        paddingLeft: wide ? 32 : 16,
        paddingRight: wide ? 42 : 16,
        paddingVertical: 24,
        gap: 24,
      }}
    >
      <View
        testID="yogesh-orb-states"
        role="navigation"
        accessibilityLabel="States"
        style={{ width: wide ? 280 : '100%', justifyContent: 'center' }}
      >
        <View
          role={Platform.OS === 'web' ? 'list' : undefined}
          style={{
            flexDirection: wide ? 'column' : 'row',
            flexWrap: wide ? 'nowrap' : 'wrap',
            columnGap: 16,
            rowGap: 8,
          }}
        >
          {PLAYGROUND.map((item, i) => {
            const on = i === index;
            const itemText = (
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                {item.playground}
              </Text>
            );
            const press = (
              <Pressable
                accessibilityRole="button"
                aria-current={on ? 'true' : undefined}
                onPress={() => setIndex(i)}
                hitSlop={{ top: 12, bottom: 12 }}
                style={{ height: 20, justifyContent: 'center' }}
              >
                {itemText}
              </Pressable>
            );
            return Platform.OS === 'web' ? (
              <View key={item.id} role="listitem">
                {press}
              </View>
            ) : (
              <View key={item.id}>{press}</View>
            );
          })}
        </View>
        {wide ? (
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 24, marginBottom: -8 }}>
            ↑ ↓ to switch
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <View
          testID="yogesh-orb-stage"
          accessibilityLabel={Platform.OS === 'web' ? undefined : 'Orb playground'}
          accessibilityElementsHidden={Platform.OS === 'web' ? true : undefined}
          importantForAccessibility={Platform.OS === 'web' ? 'no-hide-descendants' : undefined}
          aria-hidden={Platform.OS === 'web' ? true : undefined}
        >
          <OrbView state={look.state} variant={look.variant} size={size} color={colors.orb} />
        </View>
        <View style={{ width: wide ? 256 : '100%' }}>
          <SliderRow label="Size" min={16} max={480} step={1} value={size} decimals={0} onChange={setSize} />
        </View>
      </View>
    </View>
  );
}
```

### Appendix 14. `src/skia/ensureCanvasKit.web.ts`

21 lines, 736 bytes, sha256 `78d0afa56535ca1025d52c986e3cd12b551c9369483affb2010e831ddcc1692f`. Byte-for-byte from eef45fa.

```ts
let pending: Promise<void> | null = null;

export function canvasKitReady(): boolean {
  return typeof globalThis.CanvasKit !== 'undefined';
}

/** True while LoadSkiaWeb is in flight and its WebGL context is not up yet. */
export function canvasKitPending(): boolean {
  return pending !== null && !canvasKitReady();
}

/** Shared LoadSkiaWeb. Later cards await the same promise. */
export function ensureCanvasKit(): Promise<void> {
  if (canvasKitReady()) return Promise.resolve();
  if (!pending) {
    // bootCanvasKit must finish before skiaCards evaluates Skia.web.js, which
    // snapshots globalThis.CanvasKit at module init.
    pending = import('./bootCanvasKit').then((mod) => mod.bootCanvasKit());
  }
  return pending;
}
```

### Appendix 15. `src/skia/bootCanvasKit.ts`

44 lines, 1391 bytes, sha256 `06ab8d8cd787f4f04a357162920fbcb808b9cef899b255fa3af1bd97df9f8651`. Byte-for-byte from eef45fa.

```ts
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

function canUseWebGL() {
  try {
    const el = document.createElement('canvas');
    const gl =
      el.getContext('webgl2') ||
      el.getContext('webgl') ||
      el.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    }
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * One CanvasKit load for the whole page. `LoadSkiaWeb` is a singleton; call
 * this from `ensureCanvasKit` only. CanvasKitInit uses
 * `WebAssembly.instantiateStreaming` when `/canvaskit.wasm` is
 * `application/wasm` (see `vercel.json`).
 */
export function bootCanvasKit(): Promise<void> {
  return LoadSkiaWeb({
    locateFile: (file) => `/${file}`,
  }).then(() => {
    const ck = (
      globalThis as {
        CanvasKit?: {
          MakeWebGLCanvasSurface: (canvas: unknown, ...args: unknown[]) => unknown;
          MakeSWCanvasSurface: (canvas: unknown) => unknown;
        };
      }
    ).CanvasKit;

    // Don't call WebGL on the real Skia canvas when the GPU is missing —
    // a failed getContext('webgl2') poisons the element for software surfaces.
    if (ck?.MakeSWCanvasSurface && !canUseWebGL()) {
      ck.MakeWebGLCanvasSurface = (canvas) => ck.MakeSWCanvasSurface(canvas);
    }
  });
}
```

### Appendix 16. `src/skia/ensureCanvasKit.ts`

12 lines, 294 bytes, sha256 `07c0c757607e412caf5d0e42f09ecdd3ca68a0bf0bf71b0b71489c90703206d4`. Byte-for-byte from eef45fa. Native stub

```ts
/** Native Skia is linked. Web replaces this module with `ensureCanvasKit.web.ts`. */
export function canvasKitReady(): boolean {
  return true;
}

export function canvasKitPending(): boolean {
  return false;
}

export function ensureCanvasKit(): Promise<void> {
  return Promise.resolve();
}
```

### Appendix 17. `src/skia/canvasKit.d.ts`

5 lines, 69 bytes, sha256 `05734e669eec654d047d9fe88ae1c10b6266742869373db3c1ea213f7a16e088`. Byte-for-byte from eef45fa.

```ts
export {};

declare global {
  var CanvasKit: unknown | undefined;
}
```

### Appendix 18. `src/skia/cardState.ts`

83 lines, 2710 bytes, sha256 `47c0aeff952a1b0d3e2ea08eb1e18f1ddda119739985b8cab62b93309ce8bc0c`. Byte-for-byte from eef45fa.

```ts
import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';

/**
 * User-set Skia card controls, keyed by card id.
 *
 * The canvas unmounts offscreen, and Suspense can remount the lazy demo with
 * it. This map lives on globalThis so a second copy of the module inside the
 * Skia chunk still sees the same values. The shell imports it, so the store
 * is created before that chunk loads. The first read during render returns
 * the stored value, which is what avoids a flash of the defaults.
 */

type Bag = Record<string, unknown>;

type Root = {
  bags: Map<string, Bag>;
  listeners: Map<string, Set<() => void>>;
};

const GLOBAL_KEY = '__applicationStoreCardState';

function root(): Root {
  const host = globalThis as typeof globalThis & { [GLOBAL_KEY]?: Root };
  if (!host[GLOBAL_KEY]) {
    host[GLOBAL_KEY] = { bags: new Map(), listeners: new Map() };
  }
  return host[GLOBAL_KEY];
}

function bag(cardId: string): Bag {
  const state = root();
  let value = state.bags.get(cardId);
  if (!value) {
    value = {};
    state.bags.set(cardId, value);
  }
  return value;
}

function emit(cardId: string) {
  root().listeners.get(cardId)?.forEach((listener) => listener());
}

export function readCardField<T>(cardId: string, field: string, initial: T): T {
  const value = bag(cardId);
  if (!Object.prototype.hasOwnProperty.call(value, field)) value[field] = initial;
  return value[field] as T;
}

export function writeCardField<T>(cardId: string, field: string, next: SetStateAction<T>) {
  const value = bag(cardId);
  const prev = value[field] as T;
  const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
  if (Object.is(prev, resolved)) return;
  value[field] = resolved;
  emit(cardId);
}

export function subscribeCard(cardId: string, listener: () => void) {
  const state = root();
  let set = state.listeners.get(cardId);
  if (!set) {
    set = new Set();
    state.listeners.set(cardId, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function useCardField<T>(cardId: string, field: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const subscribe = useCallback((listener: () => void) => subscribeCard(cardId, listener), [cardId]);
  const get = useCallback(() => readCardField(cardId, field, initial), [cardId, field, initial]);
  const value = useSyncExternalStore(subscribe, get, get);
  const set = useCallback((next: SetStateAction<T>) => writeCardField(cardId, field, next), [cardId, field]);
  return [value, set];
}

/** Touch the store from the shell so this module is not only inside the Skia chunk. */
export function retainCardState() {
  return root();
}
```

### Appendix 19. `src/demos/yogesh-thinking-orbs/components/SliderRow.tsx`

416 lines, 15362 bytes, sha256 `9c00d8d535961dbba35c2aae7ef4ce31adc8aa81be665077352b9e1a2a0d3bf2`. Byte-for-byte from eef45fa.

```tsx
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Platform, Text, View, type TextStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

import type { OrbLive } from "../orb/OrbView";
import { fonts, useTheme } from "../theme/theme";

const SLIDER_SANS = 'system-ui, -apple-system, "SF Pro Display", sans-serif';
const SLIDER_MONO = "GeistMono_500Medium, ui-monospace, monospace";

function injectSmoothing() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  if (document.getElementById("orb-font-smoothing")) return;
  const style = document.createElement("style");
  style.id = "orb-font-smoothing";
  style.textContent = `[data-testid="yogesh-orb-tuner"],[data-testid="yogesh-orb-tuner"] *,.orb-cp-pop,.orb-cp-pop *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`;
  document.head.appendChild(style);
}

const FILL = { stiffness: 300, damping: 25, mass: 0.8 };
const BACK = { stiffness: 224, damping: 25.4, mass: 1 };
const HANDLE_X = { stiffness: 439, damping: 35.6, mass: 1 };
const HANDLE_Y = { stiffness: 685, damping: 47.1, mass: 1 };
const PUSH_MS = 32;

export type SliderField = "size" | "speed" | "density" | "dotSize" | "tilt";

function snap(value: number, min: number, max: number, step: number) {
  "worklet";
  const clamped = Math.min(max, Math.max(min, value));
  const steps = Math.round((clamped - min) / step);
  const nearest = Math.min(max, Math.max(min, min + steps * step));
  return Number(nearest.toFixed(4));
}

function writeLive(live: SharedValue<OrbLive>, field: SliderField, next: number) {
  "worklet";
  const cur = live.value;
  if (field === "size") live.value = { ...cur, size: next };
  else if (field === "speed") live.value = { ...cur, speed: next };
  else if (field === "density") live.value = { ...cur, density: next };
  else if (field === "dotSize") live.value = { ...cur, dotSize: next };
  else live.value = { ...cur, tilt: next };
}

export function SliderRow({
  label,
  min,
  max,
  step,
  value,
  decimals,
  onChange,
  live,
  field,
  onDrag,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  decimals: number;
  onChange: (value: number) => void;
  /** Playground orb reads this every frame. Landing sliders omit it. */
  live?: SharedValue<OrbLive>;
  field?: SliderField;
  /** JS-thread drag flag so a state sync does not clobber the shared value. */
  onDrag?: (active: boolean) => void;
}) {
  const { colors, mode } = useTheme();
  useFonts({ GeistMono_500Medium });
  useLayoutEffect(() => {
    injectSmoothing();
  }, []);
  const [width, setWidth] = useState(1);
  const [focused, setFocused] = useState(false);
  const [labelText, setLabelText] = useState(value.toFixed(decimals));
  const fill = useSharedValue((value - min) / (max - min));
  const over = useSharedValue(0);
  const dragging = useSharedValue(false);
  const hover = useSharedValue(0);
  const handleOp = useSharedValue(0);
  const scaleX = useSharedValue(0.25);
  const scaleY = useSharedValue(1);
  const marksOp = useSharedValue(0);
  const cfg = useSharedValue({ min, max, step, width, decimals });
  const tapAnim = useSharedValue(false);
  const dragged = useSharedValue(false);
  const ended = useSharedValue(false);
  const savedFill = useSharedValue(0);
  const pending = useSharedValue(0);
  const panDone = useSharedValue(false);
  const tapDone = useSharedValue(false);
  const labelW = useSharedValue(0);
  const valueW = useSharedValue(0);
  const gen = useSharedValue(0);
  const lastPush = useSharedValue(0);
  const onChangeRef = useRef(onChange);
  const decimalsRef = useRef(decimals);
  const onDragRef = useRef(onDrag);
  const jsGen = useRef(0);
  const skipSync = useRef(false);
  onChangeRef.current = onChange;
  decimalsRef.current = decimals;
  onDragRef.current = onDrag;

  useEffect(() => {
    cfg.value = { min, max, step, width, decimals };
  }, [min, max, step, width, decimals, cfg]);

  const publish = useCallback((next: number, token: number) => {
    if (token !== jsGen.current) return;
    onDragRef.current?.(true);
    setLabelText(next.toFixed(decimalsRef.current));
    onChangeRef.current(next);
  }, []);

  const commit = useCallback((next: number, token: number) => {
    jsGen.current = token;
    skipSync.current = true;
    onDragRef.current?.(false);
    setLabelText(next.toFixed(decimalsRef.current));
    onChangeRef.current(next);
  }, []);

  const showRatio = useCallback((ratio: number) => {
    const bounds = cfg.value;
    const raw = bounds.min + ratio * (bounds.max - bounds.min);
    setLabelText(raw.toFixed(bounds.decimals));
  }, [cfg]);

  const revertLabel = useCallback((ratio: number) => {
    const bounds = cfg.value;
    const raw = bounds.min + ratio * (bounds.max - bounds.min);
    setLabelText(raw.toFixed(bounds.decimals));
  }, [cfg]);

  useAnimatedReaction(
    () => {
      const trackW = width;
      const O = fill.value * 100;
      const ee = labelW.value > 0 && trackW > 1 ? ((10 + labelW.value + 8) / trackW) * 100 : 30;
      const et = valueW.value > 0 && trackW > 1 ? ((trackW - 12 - valueW.value - 8) / trackW) * 100 : 78;
      const near = O < ee || O > et;
      const visible = dragging.value || hover.value > 0;
      return {
        op: !visible ? 0 : near ? 0.1 : dragging.value ? 0.9 : 0.5,
        sx: visible ? 1 : 0.25,
        sy: near && visible ? 0.75 : 1,
        marks: visible ? 0.35 : 0,
      };
    },
    (next) => {
      handleOp.value = withTiming(next.op, { duration: 150 });
      scaleX.value = withSpring(next.sx, HANDLE_X);
      scaleY.value = withSpring(next.sy, HANDLE_Y);
      marksOp.value = withTiming(next.marks, { duration: 200 });
    },
  );

  useEffect(() => {
    const target = (value - min) / (max - min);
    if (dragging.value || tapAnim.value) {
      skipSync.current = false;
      return;
    }
    if (skipSync.current) {
      skipSync.current = false;
      setLabelText(value.toFixed(decimals));
      return;
    }
    if (Math.abs(fill.value - target) < 0.0001) {
      setLabelText(value.toFixed(decimals));
      return;
    }
    fill.value = withSpring(target, FILL);
    setLabelText(value.toFixed(decimals));
  }, [value, min, max, decimals, fill, dragging, tapAnim]);

  useAnimatedReaction(
    () => (tapAnim.value ? fill.value : -1),
    (ratio) => {
      if (ratio < 0) return;
      runOnJS(showRatio)(ratio);
    },
  );

  const publishNow = (next: number) => {
    if (live && field) writeLive(live, field, next);
    setLabelText(next.toFixed(decimals));
    onChange(next);
  };

  const move = (steps: number) => {
    publishNow(snap(value + steps * step, min, max, step));
  };

  useEffect(() => {
    if (!focused || Platform.OS !== "web") return;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      let steps: number | null = null;
      const big = event.shiftKey ? 10 : 1;
      if (key === "ArrowRight" || key === "ArrowUp") steps = big;
      else if (key === "ArrowLeft" || key === "ArrowDown") steps = -big;
      else if (key === "PageUp") steps = 10;
      else if (key === "PageDown") steps = -10;
      else if (key === "Home") steps = 0;
      else if (key === "End") steps = 0;
      else return;
      event.preventDefault();
      event.stopPropagation();
      if (key === "Home") publishNow(min);
      else if (key === "End") publishNow(max);
      else if (steps !== null) move(steps);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decimals, field, focused, live, max, min, onChange, step, value]);

  const gesture = useMemo(() => {
    const revertIfAbandoned = () => {
      "worklet";
      if (!panDone.value || !tapDone.value || ended.value) return;
      const ratio = savedFill.value;
      tapAnim.value = false;
      dragging.value = false;
      over.value = withSpring(0, BACK);
      fill.value = withSpring(ratio, FILL);
      ended.value = false;
      panDone.value = false;
      tapDone.value = false;
      runOnJS(revertLabel)(ratio);
    };
    const pan = Gesture.Pan()
      .activeOffsetX([-4, 4])
      .failOffsetY([-6, 6])
      .onBegin((e) => {
        ended.value = false;
        panDone.value = false;
        tapDone.value = false;
        dragged.value = false;
        savedFill.value = fill.value;
        const bounds = cfg.value;
        const x = Math.min(bounds.width, Math.max(0, e.x));
        const raw = bounds.min + (x / Math.max(1, bounds.width)) * (bounds.max - bounds.min);
        const next = snap(raw, bounds.min, bounds.max, bounds.step);
        const ratio = (next - bounds.min) / (bounds.max - bounds.min);
        pending.value = next;
        tapAnim.value = true;
        fill.value = withSpring(ratio, FILL);
      })
      .onUpdate((e) => {
        if (!dragged.value) {
          if (Math.abs(e.translationX) < 4 && Math.abs(e.translationY) < 4) return;
          dragged.value = true;
          dragging.value = true;
          tapAnim.value = false;
        }
        const bounds = cfg.value;
        const x = e.x;
        let rubber = 0;
        let ratio = x / bounds.width;
        if (x < 0) {
          rubber = -Math.min(18, Math.abs(x) * 0.25);
          ratio = 0;
        } else if (x > bounds.width) {
          rubber = Math.min(18, (x - bounds.width) * 0.25);
          ratio = 1;
        }
        over.value = rubber;
        fill.value = ratio;
        const raw = bounds.min + ratio * (bounds.max - bounds.min);
        const next = snap(raw, bounds.min, bounds.max, bounds.step);
        pending.value = next;
        if (live && field) writeLive(live, field, next);
        const now = Date.now();
        if (now - lastPush.value >= PUSH_MS) {
          lastPush.value = now;
          runOnJS(publish)(next, gen.value);
        }
      })
      .onEnd((e) => {
        ended.value = true;
        dragging.value = false;
        over.value = withSpring(0, BACK);
        const bounds = cfg.value;
        const raw = bounds.min + (Math.min(bounds.width, Math.max(0, e.x)) / bounds.width) * (bounds.max - bounds.min);
        const next = snap(raw, bounds.min, bounds.max, bounds.step);
        pending.value = next;
        fill.value = withSpring((next - bounds.min) / (bounds.max - bounds.min), FILL);
        if (live && field) writeLive(live, field, next);
        gen.value = gen.value + 1;
        runOnJS(commit)(next, gen.value);
      })
      .onFinalize(() => {
        panDone.value = true;
        revertIfAbandoned();
      });
    const tap = Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onEnd(() => {
        ended.value = true;
        tapAnim.value = false;
        const next = pending.value;
        if (live && field) writeLive(live, field, next);
        gen.value = gen.value + 1;
        runOnJS(commit)(next, gen.value);
      })
      .onFinalize(() => {
        tapDone.value = true;
        revertIfAbandoned();
      });
    return Gesture.Race(pan, tap);
  }, [cfg, commit, dragged, dragging, ended, field, fill, gen, lastPush, live, over, panDone, pending, publish, revertLabel, savedFill, tapAnim, tapDone]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.min(100, Math.max(0, fill.value * 100))}%` }));
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: over.value }] }));
  const markStyle = useAnimatedStyle(() => ({ opacity: marksOp.value }));
  const handleStyle = useAnimatedStyle(() => ({
    opacity: handleOp.value,
    transform: [{ translateX: fill.value * width }, { scaleX: scaleX.value }, { scaleY: scaleY.value }],
  }));
  const marks = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const web = Platform.OS === "web";
  const ink = mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const sliderLabel: TextStyle = web
    ? {
        position: "absolute",
        top: "50%",
        left: 10,
        color: ink,
        fontFamily: SLIDER_SANS,
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 19.5,
        transform: [{ translateY: "-50%" }, { translateY: -0.5 }],
      }
    : { position: "absolute", top: 8, left: 10, color: colors.fg, fontFamily: fonts.regular, fontSize: 13 };
  const sliderValue: TextStyle = web
    ? {
        position: "absolute",
        top: "50%",
        right: 12,
        paddingBottom: 1,
        borderBottomWidth: 1,
        borderBottomColor: "transparent",
        color: ink,
        fontFamily: SLIDER_MONO,
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 19.5,
        transform: [{ translateY: "-50%" }, { translateY: 0.5 }],
      }
    : { position: "absolute", top: 8, right: 12, color: colors.fg, fontFamily: fonts.mono, fontSize: 13 };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: labelText }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") move(1);
          if (event.nativeEvent.actionName === "decrement") move(-1);
        }}
        focusable
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={labelText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onLayout={(e) => setWidth(Math.max(1, e.nativeEvent.layout.width))}
        onPointerEnter={() => {
          hover.value = 1;
        }}
        onPointerLeave={() => {
          hover.value = 0;
        }}
        style={[
          {
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.row,
            overflow: "hidden",
            justifyContent: "center",
          },
          rowStyle,
        ]}
      >
        <Animated.View style={[{ position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: colors.slider }, fillStyle]} />
        {marks.map((mark) => (
          <Animated.View key={mark} style={[{ position: "absolute", left: `${mark * 100}%`, top: 8, bottom: 8, width: 1, backgroundColor: colors.fg }, markStyle]} />
        ))}
        <Animated.View
          pointerEvents="none"
          style={[{ position: "absolute", top: 8, width: 3, height: 20, marginLeft: -1.5, borderRadius: 1, backgroundColor: colors.fg }, handleStyle]}
        />
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
          <Text onLayout={(e) => { labelW.value = e.nativeEvent.layout.width; }} style={sliderLabel}>{label}</Text>
          <Text onLayout={(e) => { valueW.value = e.nativeEvent.layout.width; }} style={sliderValue}>{labelText}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Appendix 20. `src/demos/yogesh-thinking-orbs/content/cards.ts`

180 lines, 5117 bytes, sha256 `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d`. Byte-for-byte from eef45fa.

```ts
export type ToolRow = { verb: string; target: string; add?: number; del?: number };
export type Done = ToolRow | "Thought" | { text: string };

export type Look = {
  id: string;
  state: string;
  variant?: string;
  /** Landing card label. Background says "Background Tasks". */
  landing: string;
  /** Playground list label. Background says "Background". */
  playground: string;
  status: string;
  thought?: string;
  done?: Done;
};

/** Landing order. Chat history walks this list. */
export const LANDING: Look[] = [
  { id: "working", state: "working", landing: "Working", playground: "Working", status: "Working", done: { verb: "Read", target: "login/page.tsx" } },
  {
    id: "reasoning",
    state: "reasoning",
    landing: "Reasoning",
    playground: "Reasoning",
    status: "Thinking",
    thought: "A redirect back to /login means the session looks missing. The cookie might be set too late…",
    done: "Thought",
  },
  {
    id: "searching",
    state: "searching",
    landing: "Searching",
    playground: "Searching",
    status: "Searching web",
    done: { verb: "Searched web", target: "cookie set after redirect" },
  },
  {
    id: "searching-lighthouse",
    state: "searching",
    variant: "lighthouse",
    landing: "Searching · Lighthouse",
    playground: "Searching · Lighthouse",
    status: "Searching files",
    done: { verb: "Searched", target: "setCookie" },
  },
  {
    id: "working-gyro",
    state: "working",
    variant: "gyro",
    landing: "Working · Gyro",
    playground: "Working · Gyro",
    status: "Working",
    done: { verb: "Edited", target: "session.ts", add: 4, del: 2 },
  },
  {
    id: "background",
    state: "background",
    landing: "Background Tasks",
    playground: "Background",
    status: "1 Background Task",
    done: { verb: "Bash", target: "pnpm test --watch" },
  },
  {
    id: "reasoning-twins",
    state: "reasoning",
    variant: "twins",
    landing: "Reasoning · Twins",
    playground: "Reasoning · Twins",
    status: "Thinking",
    thought: "Tests pass. Worth loading the page on the dev server to be sure…",
    done: "Thought",
  },
  {
    id: "background-spiral",
    state: "background",
    variant: "spiral",
    landing: "Background Tasks · Spiral",
    playground: "Background · Spiral",
    status: "2 Background Tasks",
    done: { verb: "Bash", target: "pnpm dev" },
  },
  {
    id: "retrying",
    state: "retrying",
    landing: "Retrying",
    playground: "Retrying",
    status: "Retrying — attempt 2 of 10",
  },
  {
    id: "compacting",
    state: "compacting",
    landing: "Compacting",
    playground: "Compacting",
    status: "Compacting context",
  },
  {
    id: "compacting-squeeze",
    state: "compacting",
    variant: "squeeze",
    landing: "Compacting · Squeeze",
    playground: "Compacting · Squeeze",
    status: "Compacting context",
  },
  {
    id: "compacting-fuse",
    state: "compacting",
    variant: "fuse",
    landing: "Compacting · Fuse",
    playground: "Compacting · Fuse",
    status: "Compacting context",
    done: { verb: "Compacted", target: "Saved 45k tokens" },
  },
  {
    id: "retrying-surge",
    state: "retrying",
    variant: "surge",
    landing: "Retrying · Surge",
    playground: "Retrying · Surge",
    status: "Retrying — attempt 3 of 10",
    done: {
      text: "Fixed. The session cookie was set after the redirect, so every visit looked logged out. It's set first now, before the redirect goes out.",
    },
  },
  {
    id: "waiting",
    state: "waiting",
    landing: "Waiting",
    playground: "Waiting",
    status: "Waiting for usage limit to reset",
  },
  { id: "base", state: "base", landing: "Base", playground: "Base", status: "Working" },
];

/** Playground order follows VARIANTS, default first, Working selected on load (index 1). */
export const PLAYGROUND: Look[] = [
  LANDING[14],
  LANDING[0],
  LANDING[4],
  LANDING[1],
  LANDING[6],
  LANDING[2],
  LANDING[3],
  LANDING[5],
  LANDING[7],
  LANDING[8],
  LANDING[12],
  LANDING[9],
  LANDING[10],
  LANDING[11],
  LANDING[13],
];

export const INITIAL_ROWS: ToolRow[] = [
  { verb: "Read", target: "middleware.ts" },
  { verb: "Edited", target: "middleware.ts", add: 3, del: 1 },
  { verb: "Bash", target: "pnpm test" },
];

export function chatFor(index: number) {
  const last = LANDING.length - 1;
  const safe = Number.isFinite(index) ? Math.min(last, Math.max(0, Math.floor(index))) : 0;
  const card = LANDING[safe];
  const rows: (ToolRow | "Thought" | { text: string })[] = [...INITIAL_ROWS];
  for (let i = 0; i < safe; i++) {
    const done = LANDING[i].done;
    if (done) rows.push(done);
  }
  const fuse = LANDING.findIndex((c) => c.landing === "Compacting · Fuse");
  let tasks: Look | undefined;
  if (safe <= fuse) {
    for (let i = safe; i >= 0; i--) if (LANDING[i].state === "background") {
      tasks = LANDING[i];
      break;
    }
  }
  const live = card.state === "background" ? undefined : card;
  return { card, rows, live, tasks };
}

export const USER_PROMPT = "The login page keeps redirecting to itself. Can you fix it?";
```

### Appendix 21a. `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.web.ts`

23 lines, 925 bytes, sha256 `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf`. Byte-for-byte from eef45fa.

```ts
import { useEffect } from "react";

/** ↑/↓ wrap the playground state list. Ignored while a field or slider is focused. */
export function useArrowKeys(count: number, index: number, onIndex: (index: number) => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true'], [role='slider'], [data-arrow-keys='own']")
      ) {
        return;
      }
      event.preventDefault();
      if (count <= 0) return;
      if (event.key === "ArrowDown") onIndex((index + 1) % count);
      else onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, index, onIndex]);
}
```

### Appendix 21b. `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.ts`

2 lines, 186 bytes, sha256 `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258`. Byte-for-byte from eef45fa. Native no-op

```ts
/** Native: hardware arrows are a no-op. Web implementation is useArrowKeys.web.ts. */
export function useArrowKeys(_count: number, _index: number, _onIndex: (index: number) => void) {}
```

### Appendix 22. `babel.config.js`

7 lines, 155 bytes, sha256 `b88376188d8e9c110ae64b58881df514fcbe30a5cf1257b7b2561ae18560cbfd`. Byte-for-byte from eef45fa.

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

### Appendix 23. `tsconfig.json`

17 lines, 242 bytes, sha256 `e8e9605c3b1a521e797d6d3a5fd271121fdfbd0aab0904be0873469bc0347a77`. Byte-for-byte from eef45fa.

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### Appendix 24. `src/demos/yogesh-thinking-orbs/theme/theme.tsx`

176 lines, 4677 bytes, sha256 `3d08daedb8bb47fe858d867c5ebb60c3cd8b80b4382b20db3440f1cff1b6431f`. Byte-for-byte from eef45fa.

```tsx
import { loadAsync } from "expo-font";
import { usePathname } from "expo-router";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { useCardField } from "@/src/skia/cardState";

export type Mode = "dark" | "light";

export type Palette = {
  page: string;
  fg: string;
  muted: string;
  card: string;
  well: string;
  row: string;
  slider: string;
  pop: string;
  orb: string;
  fill: string;
  bubble: string;
  ring: string;
  ringSoft: string;
  shadow: string;
  green: string;
  red: string;
  codeBg: string;
  pink: string;
};

const dark: Palette = {
  page: "#000000",
  fg: "#fafafa",
  muted: "#a1a1a1",
  card: "#0a0a0a",
  well: "#1a1a1a",
  row: "#141414",
  slider: "#3e3e3e",
  pop: "#212121",
  orb: "#ffffff",
  fill: "#181818",
  bubble: "#1c1c1c",
  ring: "rgba(250,250,250,0.3)",
  ringSoft: "rgba(250,250,250,0.12)",
  shadow: "transparent",
  green: "#09bb83",
  red: "#ff6467",
  codeBg: "#181818",
  pink: "#f6339a",
};

const light: Palette = {
  page: "#f9f9fa",
  fg: "#0a0a0a",
  muted: "#737373",
  card: "#ffffff",
  well: "#e6e6e6",
  row: "#efeff0",
  slider: "#d7d7d8",
  pop: "#ffffff",
  orb: "#171717",
  fill: "#efeff0",
  bubble: "#ececee",
  ring: "rgba(23,23,23,0.3)",
  ringSoft: "rgba(23,23,23,0.12)",
  shadow: "rgba(0,0,0,0.06)",
  green: "#09bb83",
  red: "#ff6467",
  codeBg: "#ffffff",
  pink: "#f6339a",
};

export function withAlpha(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const webSans = 'Geist, "Geist Fallback", system-ui, sans-serif';
const webRegular = 'Geist_400Regular, Geist, "Geist Fallback", system-ui, sans-serif';
const webMono = '"Geist Mono", "Geist Mono Fallback"';

export const fonts =
  Platform.OS === "web"
    ? {
        regular: webRegular,
        medium: webSans,
        semibold: webSans,
        italic: webSans,
        mono: webMono,
      }
    : {
        regular: "Geist_400Regular",
        medium: "Geist_500Medium",
        semibold: "Geist_600SemiBold",
        italic: "Geist_400Regular_Italic",
        mono: "GeistMono_400Regular",
      };

export function mediumWeight(): { fontWeight: "500" } | Record<string, never> {
  if (Platform.OS === "web") return { fontWeight: "500" };
  return {};
}

type ThemeValue = {
  mode: Mode;
  colors: Palette;
  toggle: () => void;
  playgroundColor: string;
  setPlaygroundColor: (v: string) => void;
};

const Ctx = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children, cardId }: { children: ReactNode; cardId: string }) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    let cancelled = false;
    const load = () => {
      void import("@expo-google-fonts/geist/400Regular").then((mod) => {
        if (cancelled) return;
        return loadAsync({ Geist_400Regular: mod.Geist_400Regular });
      });
    };
    if (document.readyState === "complete") load();
    else window.addEventListener("load", load, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", load);
    };
  }, []);
  const path = usePathname();
  const [mode, setMode] = useState<Mode>("dark");
  const [playgroundColor, setPlaygroundColor] = useCardField(cardId, "playgroundColor", dark.orb);
  const [route, setRoute] = useState(path);
  if (path !== route) {
    setRoute(path);
    setMode("dark");
    setPlaygroundColor((current) => {
      const c = current.toLowerCase();
      if (c === dark.orb.toLowerCase() || c === light.orb.toLowerCase()) return dark.orb;
      return current;
    });
  }
  const value = useMemo<ThemeValue>(
    () => ({
      mode,
      colors: mode === "dark" ? dark : light,
      toggle: () => {
        const prevDefault = mode === "dark" ? dark.orb : light.orb;
        const nextDefault = mode === "dark" ? light.orb : dark.orb;
        setPlaygroundColor((current) => (current.toLowerCase() === prevDefault.toLowerCase() ? nextDefault : current));
        setMode(mode === "dark" ? "light" : "dark");
      },
      playgroundColor,
      setPlaygroundColor,
    }),
    [mode, playgroundColor],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("theme");
  return v;
}

export const syntax = {
  comment: "#a1a1a1",
  string: "#4ab074",
  keyword: "#a17adf",
  tag: "#359bd9",
  attr: "#d8944d",
};
```
