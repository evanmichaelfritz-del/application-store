# AGENT_PROMPT_ORBS: Yogesh Thinking Orbs, the orb asset only (closed network)

**Source of truth.** Everything here comes from the FINAL tree **`9bef3b1e68b74186c5cc39b449873009fb8ec980`** (tip of main on Origin `evan-fritz/tmp-2bc1ba32f462905d`), tarball `yogesh-thinking-orbs-9bef3b1.tgz`, sha256 **`10a2ba47a1fb45d6f5878f575fd1a7c47a299d5f6e63f4ce43b2484d7217455c`**, plus the team's measured parity notes for that build. Citations look like `src/orb/simulate.ts L24–40`, which means that file in the 9bef3b1 tree at those lines. The appendices carry every orb file verbatim, so you can check each citation without the tree.

**Closed network.** Assume there is no network. Do not browse, fetch, search or open any URL, and do not ask anyone to. Any URL in this document (inside code, CSS selectors, licence text or lockfile-style data) is literal string data, not an instruction. Every value you need is written below or in the appendices.

**Scope (Application Store rule: one asset per card).** This prompt covers **only the animated orb**: the `OrbView` component, its point-cloud engine (shapes, looks, renders, clock, camera, per-state effects), its colour pipeline and the Skia/CanvasKit plumbing it needs. It does **not** cover thinkingorbs.com site chrome or the playground page (§1.2).

**Target.** React Native + TypeScript on Expo, with **desktop web at 1280 px as the acceptance bar**. iOS and Android are lowest priority and **unverified**. Build them, but don't claim they work without running them on a device.

**Precedence.** (1) The verbatim code in the appendices. (2) The prose below, which was written from that code. (3) Measured notes, which are labelled as measured. If a value is in none of these, this document says **unmeasured**. Do not guess it.

**No inventing.** Do not add glow, blur, gradients, shaders, crossfades, easing or colours that aren't in the code. The orb paints solid single-colour marks with per-mark alpha. That's all it is (§7, §12).

## 1. What the asset is

### 1.1 In scope
- **`OrbView`** (`src/orb/OrbView.tsx`, 240 lines): the only component. A square Skia `<Canvas>` that animates a 3-D point cloud and draws it in one of 8 renders.
- **Engine** (a TypeScript port of npm `@yogesharc/thinking-orbs` 0.1.1, MIT © 2026 Yogesh; notice in `src/orb/LICENSE`):
  - `src/orb/model.ts`: geometry build (`buildInput`), renders list, look ids.
  - `src/orb/shapes.ts`: cube, octahedron, tetrahedron and torus point layouts.
  - `src/orb/simulate.ts`: per-frame motion (`step`), camera, per-state effects, tone grid.
  - `src/orb/draw.ts`: Skia drawing of the 8 renders.
  - `src/orb/clock.ts`: the shared per-look clock.
- **Colour** (`src/color/color.ts`): `OrbView` imports `parseColor`, `toSrgb` and `toExtendedSrgb` from it (`src/orb/OrbView.tsx` L8). The whole file is inlined because it is a single module. Its other exports (`formatColor`, `detectFormat`, `maxChroma`, `rgbToOklch`, `oklchToRgb`, `inGamut`, `clampChroma`) are used by the site's colour picker or internally. The orb only needs the three above and their internal helpers.
- **Plumbing**: the Skia patch (`patches/@shopify+react-native-skia+2.6.2.patch`), the wasm copy (`scripts/copy-wasm.js`), the web entry that loads CanvasKit (`index.web.tsx`), the static server with the `.wasm` MIME type (`scripts/serve-dist.js`), `package.json` pins, `babel.config.js`, `tsconfig.json` and the native entry `index.ts`.

### 1.2 Excluded (site chrome or playground UI, not the asset)
- Header, hero, npm/installs pill, GitHub stars, MIT link, Sponsor, docs sections, Installation pill, landmarks and page titles, CodeBlock, the landing grid/chat layout and the playground page layout.
- **Shimmer** (`src/components/Shimmer*.tsx`): the gradient status text beside the playground's mini orb. It is text, not orb, and `OrbView` doesn't import it.
- **Copy-snippet generator** (`src/content/snippet.ts`): it emits npm `<Orb …/>` JSX for the site's Copy button and doesn't drive `OrbView`.
- **Select menu (`SelectRow`) and colour picker (`ColorPicker`): excluded.** Reason from the code: `OrbView.tsx` imports only Skia, React, `react-native` `Platform`, `expo-constants`, `expo-router` `useIsFocused`, Reanimated, `../color/color` and the `./clock`, `./draw`, `./model` and `./simulate` modules (`src/orb/OrbView.tsx` L1–12). Neither control is imported anywhere under `src/orb/`. They are generic playground controls that only set React state, which is then passed to `OrbView` as props (`app/playground.tsx` L285–297, L311–323). So the select-menu early-close timing and the ColorPicker layout/focus gaps don't apply to this asset. §14 tells you how to wire your own controls to the props.
- **`SliderRow`** is also excluded. The one contract it has with the orb is the `live` SharedValue write (`src/components/SliderRow.tsx` L26–34), which is documented in §14.3.

## 2. File structure (asset files only)

```
package.json                       pins (Appendix 14); postinstall = patch-package && node scripts/copy-wasm.js
babel.config.js                    babel-preset-expo only (Appendix 15)
tsconfig.json                      strict, extends expo/tsconfig.base (Appendix 16)
index.ts                           native entry: gesture-handler, then expo-router/entry (Appendix 10)
index.web.tsx                      web entry: awaits LoadSkiaWeb('/canvaskit.wasm') before rendering (Appendix 9)
patches/@shopify+react-native-skia+2.6.2.patch   P3 web surface + float setColor on iOS (Appendix 13)
scripts/copy-wasm.js               copies canvaskit.wasm into public/ (Appendix 11)
scripts/serve-dist.js              static server for dist/: SPA fallback, .wasm as application/wasm (Appendix 12)
src/orb/OrbView.tsx                the component (Appendix 1)
src/orb/model.ts                   buildInput, RENDERS, isFlat, lookId, nearest (Appendix 2)
src/orb/shapes.ts                  cube / octahedron / tetrahedron / torus (Appendix 3)
src/orb/simulate.ts                step(), makeLocal(), toneAt(), PERIOD, per-state motion (Appendix 4)
src/orb/draw.ts                    drawOrb(): Skia calls for the 8 renders (Appendix 5)
src/orb/clock.ts                   tick(): one forward-only clock per look@speed (Appendix 6)
src/orb/LICENSE                    MIT, © 2026 Yogesh (Appendix 7)
src/color/color.ts                 parseColor, toSrgb, toExtendedSrgb (+ picker helpers) (Appendix 8)
public/canvaskit.wasm              GENERATED by postinstall (8,076,553 B); gitignored, not in the tarball
```

There are no web/native file splits inside `src/orb/`. The same files run on every platform, and the platform differences are runtime branches in `canUseExtendedColor()` (`src/orb/OrbView.tsx` L36–40) and in the patched Skia web view. The web/native split happens at the entry level: `index.web.tsx` vs `index.ts`.

## 3. Dependencies, Skia/CanvasKit setup and wasm loading

### 3.1 Versions (from `package.json` and `package-lock.json` in 9bef3b1)

| Package | Spec in package.json | Resolved in lockfile | Why the orb needs it |
|---|---|---|---|
| `@shopify/react-native-skia` | `2.6.2` (**exact**) | 2.6.2 (MIT) | Canvas, Picture, PictureRecorder, Paint, Path |
| `canvaskit-wasm` | (transitive, Skia's `dependencies`) | **0.41.0** (BSD-3-Clause) | the web Skia runtime (`bin/full/canvaskit.wasm`) |
| `react-native-reanimated` | `4.5.1` | 4.5.1 | `useFrameCallback`, `useSharedValue`, `runOnUI`, `useReducedMotion`, `makeMutable` |
| `react-native-worklets` | `0.10.1` | 0.10.1 | worklet runtime for Reanimated 4 |
| `expo-constants` | `~57.0.20` | 57.0.20 | `ExecutionEnvironment.StoreClient` (Expo Go colour clamp) |
| `expo-router` | `~57.0.24` | 57.0.24 | `useIsFocused` (`OrbView` returns null when unfocused); the web entry `require`s its internals |
| `expo` | `~57.0.26` | 57.0.26 | SDK |
| `react-native` | `0.86.3` | 0.86.3 | `Platform` |
| `react-native-web` | `^0.21.2` | 0.21.3 | web |
| `react` / `react-dom` | `19.2.3` | 19.2.3 | |
| `react-native-gesture-handler` | `~2.32.0` | 2.32.0 | not used by the orb; imported by both entries (`index.ts` L1, `index.web.tsx` L5) |
| `patch-package` (dev) | `^8.0.1` | 8.0.1 | applies the Skia patch at postinstall |
| `typescript` (dev) | `~6.0.3` | 6.0.3 | |
| `babel-preset-expo` | `~57.0.0` | 57.0.13 | the only Babel preset (`babel.config.js`) |

Skia 2.6.2's own lockfile entry declares `canvaskit-wasm 0.41.0`, `react-native-skia-android / -apple-ios / -apple-macos / -apple-tvos 147.1.0` and `react-reconciler 0.31.0`, with peers `react >=19.0`, `react-native >=0.78` and `react-native-reanimated >=3.19.1`.

**Node:** React Native 0.86.3's `engines.node` is `^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0`. The app's `package.json` has no `engines` field.

**Install:** `npm ci` against the lockfile. Use an offline cache or internal mirror. If packages aren't available locally, stop and report it. **Do not change the Skia version**: the patch filename and contents are tied to 2.6.2.

### 3.2 postinstall: patch + wasm copy
`package.json` → `"postinstall": "patch-package && node scripts/copy-wasm.js"`.

1. **`patch-package`** applies `patches/@shopify+react-native-skia+2.6.2.patch` (7,164 B, sha256 `0c0ef5ac4749bbdf2dc66d69c953a73667eaba67a3f2db679df9ba14904468a6`; full text in Appendix 13). It changes two things:
   - **Web (`SkiaPictureView.web` in `src/views/*.tsx`, `lib/module/views/*.js` and `lib/commonjs/views/*.js`).** It adds `webglSurfaceColorSpace()`, which returns `CanvasKit.ColorSpace.DISPLAY_P3` when `window.matchMedia("(color-gamut: p3)").matches`, else `CanvasKit.ColorSpace.SRGB`. It passes that as the 2nd argument to **both** `CanvasKit.MakeWebGLCanvasSurface(...)` call sites: the live `WebGLRenderer` and the snapshot `StaticWebGLRenderer`. (The existing Skia code also sets `ctx.drawingBufferColorSpace = "display-p3"` on the webgl2 context. That line is context in the patch, not part of the change.)
   - **iOS C++ (`cpp/api/JsiSkPaint.h` `setColor`).** If the argument is a 4-element array, or an object with a `buffer` (a Float32Array), it reads 4 floats and calls `SkPaint::setColor4f(SkColor4f{r,g,b,a})`, so components outside 0–1 survive. Otherwise it falls back to the 8-bit `JsiSkColor::fromValue` path. This only takes effect in **native/dev builds**, because the podspec compiles `cpp/**` during `pod install`. Expo Go ships an unpatched binary.
2. **`scripts/copy-wasm.js`** (Appendix 11) resolves `canvaskit-wasm/bin/full/canvaskit.wasm` and copies it to `public/canvaskit.wasm`. If canvaskit-wasm isn't installed it logs `canvaskit-wasm not installed yet; skip wasm copy` and exits 0. The copied file is **8,076,553 B**, sha256 `eb68c7a7f602d8cb89915352c4471a2d26edfd72000f78202cb1fe32ce1f9dc4` (canvaskit-wasm 0.41.0; recorded in the 9bef3b1 BUILD doc and re-confirmed by Ship's prod smoke: 200, 8,076,553 B). `/public/*` is gitignored, so the wasm is never in the tarball.

### 3.3 Web entry: CanvasKit must load before any Skia module evaluates
`index.web.tsx` (Appendix 9), as it is in the tree:
- L6 `import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";`
- L11–14 `void LoadSkiaWeb({ locateFile: () => "/canvaskit.wasm" }).then(() => { … })`. The wasm is fetched from the **site root** path `/canvaskit.wasm`.
- L15–18: only after the load resolves does it `require("expo-router/build/qualified-entry")` and `require("expo-router/build/renderRootComponent")`, then call `renderer.renderRootComponent(qualified.App)`. **Use `require`, not `import()`.** The tree's comment (L15): "a dynamic import splits a chunk this static export never loads."
- L2 `./src/headerLine.web` and L3 `./src/liveFaces.web` are **site chrome** (header CSS and site fonts). An orb-only host drops those two imports. L4 `@expo/metro-runtime` and L5 `react-native-gesture-handler` stay as in the tree.
- `WithSkiaWeb` is **not** used anywhere in the tree. Don't introduce it.

### 3.4 Static export and serving (desktop web)
1. `npx expo export -p web` produces `dist/`.
2. **Check that `dist/canvaskit.wasm` exists** (`ls -l dist/canvaskit.wasm` → 8,076,553 B). On 9bef3b1 the export already puts it at the root of the output, the file comes from `public/canvaskit.wasm` (Platform verified on 9bef3b1 that the export output has it at its root). **Fallback only, if it is missing:** `cp node_modules/canvaskit-wasm/bin/full/canvaskit.wasm dist/`. Without it the Skia orbs won't paint, and the web entry never renders, because `LoadSkiaWeb` never resolves.
3. Serve `dist/` with `.wasm` as **`application/wasm`**. The tree's `scripts/serve-dist.js` (Appendix 12) maps `".wasm": "application/wasm"` (L9–21). For a missing path **with a file extension** it returns **404**, not the SPA `index.html` (L37–42), so a missing wasm can never be answered with HTML. Extensionless paths fall back to `index.html` (SPA). PORT defaults to 4477 (L8). L5 `require("./check-llms")` is a site check (the llms.txt guard); an orb-only host drops that line.
4. Dev: `npx expo start --web`. `/canvaskit.wasm` must return 200 as `application/wasm` from `public/`. A crew note from Oct 7: a dev server that answered the wasm request with HTML ("wasm-as-HTML") broke the run. The fix was to serve the static export instead.

### 3.5 Gotchas (all from the tree or the measured notes)
- **WebGL context cap.** Every `OrbView` is its own Skia canvas with its own WebGL context. The host site never holds more than **12** Skia canvases on web (`app/index.tsx` L183–186: `fixed = 1 + live + tasks`, `budget = max(1, 12 − max(fixed, 3))`). The prose reason recorded in the handoff is that Chrome caps WebGL contexts at about 16. If you mount many orbs, enforce a cap the same way (§13.5).
- **Picture lifetime.** Never `dispose()` a picture that may still be on screen. `paint()` keeps the previous picture in `retire` for one frame and disposes the one before it (`src/orb/OrbView.tsx` L95–99).
- **Never `setState` per frame.** All per-frame work is in a Reanimated `useFrameCallback` worklet writing a `SharedValue<SkPicture>` (L181–195).
- **Reduced motion is read once.** `useReducedMotion()` (L236) is evaluated at launch. A live OS toggle only applies after a relaunch (handoff note).
- **CanvasKit logs a WebGL message on a fresh load** (handoff note; non-gating).
- **About 8 MB of wasm** (8,076,553 B) also ships in the native builds (handoff note; non-gating).
- **`useIsFocused` needs an expo-router navigator.** `OrbView` calls `useIsFocused()` (L235), so it must render inside an expo-router route tree. When the route is unfocused it returns `null`, which unmounts the canvas and frees its context.

## 4. Public API (exactly as the code exposes it)

### 4.1 `OrbView` props (`src/orb/OrbView.tsx` L63–80; defaults from `LiveOrb` L136–150 and `StillOrb` L200–213)

| Prop | Type | Required | Default | Effect |
|---|---|---|---|---|
| `state` | `string` | **yes** | none | Look family: `base`, `working`, `reasoning`, `searching`, `background`, `retrying`, `compacting`, `waiting` (§5). |
| `variant` | `string` | no | `undefined` | `lookId(state, variant)` = `variant && variant !== "default" ? \`${state}-${variant}\` : state` (`model.ts` L111–113). Valid pairs are in §5. |
| `size` | `number` | **yes** | none | Canvas is `size × size` px (L130). Also sets point count, radius and dot size (§8). |
| `speed` | `number` | no | `1` | Clock rate multiplier (§9). Also part of the clock key `state@speed`. |
| `density` | `number` | no | `1` | Point count multiplier (§8). |
| `dotSize` | `number` | no | `1` | Mark radius multiplier (§8). |
| `tilt` | `number` (degrees) | no | `20` | Camera pitch from above; **ignored on flat renders** (halftone, lines, verticalLines) (§10). |
| `shape` | `ShapeName` = `"sphere" \| "cube" \| "octahedron" \| "tetrahedron" \| "torus"` | no | `"sphere"` | Point layout (§6). |
| `render` | `RenderName` = `"dots" \| "crosses" \| "dashes" \| "halftone" \| "lines" \| "mesh" \| "squares" \| "verticalLines"` | no | `"dots"` | How points are drawn (§7). |
| `color` | `string` | **yes** | none | Any string `parseColor` accepts (§12). An unparseable string paints **white** `{r:1,g:1,b:1,a:1}` (L42–44). |
| `active` | `boolean` | no | `true` | `false` keeps the canvas mounted but stops ticking: no clock advance, no repaint, last frame stays (L74–75, L184). `StillOrb` ignores it. |
| `live` | `SharedValue<OrbLive>` | no | `undefined` | When set, each frame reads speed, tilt and colour from it on the UI thread instead of from props (L185; §14.3). |
| `onFrame` | `(uri: string) => void` | no | `undefined` | On **unmount**, receives the last frame as `data:image/png;base64,…` (L114–128). Used to show a still `<Image>` once a canvas is unmounted to save contexts. |

The component is exported as `export const OrbView = memo(function OrbView(props) {...})` (L234–240). Render logic:
1. `useIsFocused()` false → `null`.
2. `useReducedMotion() === true` → `<StillOrb>`, which paints one frame at t = 0 and registers no frame callback.
3. Otherwise → `<LiveOrb>`.

The canvas has no background: it is transparent, and the host's background shows through. It has no accessibility role or label of its own (L130: `<Canvas ref style={{width:size,height:size}} pointerEvents="none" colorSpace="p3">`).

### 4.2 Types and other exports
- `OrbLive` (L14–24): `{ size: number; speed: number; density: number; dotSize: number; tilt: number; r: number; g: number; b: number; a: number }`. Colour is float RGBA in sRGB (extended where allowed).
- `canUseExtendedColor(): boolean` (L36–40): `android` → false; `ios` → `Constants.executionEnvironment !== ExecutionEnvironment.StoreClient`; anything else (web) → true.
- `colorToRgba(color: string)` (L42–47): `parseColor` → null gives `{1,1,1,1}`; `!canUseExtendedColor()` gives `toSrgb(parsed)`; otherwise `toExtendedSrgb(parsed)`.
- From `model.ts`: `RENDERS` (L10–19, in this order: dots, crosses, dashes, halftone, lines, mesh, squares, verticalLines), `RenderName`, `ShapeName` (re-exported from shapes, L8), `isFlat(render)` (L25–29: true for `halftone`, `lines` and `verticalLines`), `lookId` (L111–113), `buildInput` (L115–182), `nearest` (L36–57), and the `OrbInput` type (L87–107).
- From `shapes.ts`: `cube`, `octahedron`, `tetrahedron`, `torus` (each `{ scale, points(count, look) }`, torus also has `tip: 35`), `SHAPES` and `Pt`.
- From `simulate.ts`: `makeLocal`, `step`, `toneAt` and the `OrbLocal` type. From `clock.ts`: `clocks` and `tick`. From `draw.ts`: `drawOrb`.

## 5. Every state and variant (15 looks)

A **look id** is `lookId(state, variant)` (`model.ts` L111–113). The engine only branches on the look id string. **Only use the 15 ids below.** Any other id has no `PERIOD` entry (`simulate.ts` L24–40), so the yaw becomes `NaN`.

The look list and labels come from `src/content/cards.ts` L18–132 (`LANDING`, in landing order). The one-line meanings are the library's own descriptions, carried verbatim in the tree at `src/content/prompt.ts` (`COPY_PROMPT`, "## States"). Periods are from `simulate.ts` L24–40.

| # | look id (`state`, `variant`) | Label | Library description | PERIOD ms | Engine branch |
|---|---|---|---|---|---|
| 1 | `working` (working) | Working | "A ring of light runs down it." | 3000 | ring sweep §11.4 |
| 2 | `reasoning` (reasoning) | Reasoning | "One spark wanders over it." | 6500 | 1 walk §11.6 |
| 3 | `searching` (searching) | Searching | "A lens hops between spots." | 13000 | lens §11.2 |
| 4 | `searching-lighthouse` (searching, lighthouse) | Searching · Lighthouse | "A beam sweeps round, like a lighthouse." | 13000 | beam §11.5 |
| 5 | `working-gyro` (working, gyro) | Working · Gyro | "Wobbles like a spinning top." | 3000 | gyro camera §10.2 + twist §11.8 |
| 6 | `background` (background) | Background Tasks (landing) / Background (playground) | "Fewer, bigger dots." | 13000 | `dens = 1` §8 |
| 7 | `reasoning-twins` (reasoning, twins) | Reasoning · Twins | "Two sparks wander at once." | 6500 | 2 repelling walks §11.6 |
| 8 | `background-spiral` (background, spiral) | Background Tasks · Spiral / Background · Spiral | "The dots wound into spiral arms." | 13000 | spiral layouts §6 |
| 9 | `retrying` (retrying) | Retrying | "Spins, then winds back." | 13000 (yaw uses rewind) | §10.3 |
| 10 | `compacting` (compacting) | Compacting | "Packs tight, then springs back past loose." | 10000 | sweep k=1.5 §11.3 |
| 11 | `compacting-squeeze` (compacting, squeeze) | Compacting · Squeeze | "Packs while wringing the top against the bottom." | 10000 | twist only §11.8 |
| 12 | `compacting-fuse` (compacting, fuse) | Compacting · Fuse | "Packs along a burning fuse line, with no bounce." | 10000 | sweep k=1 + burn §11.3 |
| 13 | `retrying-surge` (retrying, surge) | Retrying · Surge | "Each turn launches fast and eases out." | 13000 (yaw uses surge) | §10.3 |
| 14 | `waiting` (waiting) | Waiting | "A comet spirals round it." | 13000 | comet §11.7 |
| 15 | `base` (base) | Base | "A plain spin." | 6500 | plain spin |

The host playground lists the looks in this order (`cards.ts` L135–151): Base, Working, Working · Gyro, Reasoning, Reasoning · Twins, Searching, Searching · Lighthouse, Background, Background · Spiral, Retrying, Retrying · Surge, Compacting, Compacting · Squeeze, Compacting · Fuse, Waiting. It selects index 1 (Working) on load (`app/playground.tsx` L63).

## 6. Shapes (`src/orb/shapes.ts`; sphere in `src/orb/model.ts` L59–85)

Every shape produces unit-scale model points `[x, y, z]`. `buildInput` asks for `asked = max(8, round(size · dens · density))` points (`model.ts` L127). Only the sphere returns exactly `asked`; the polyhedra and torus return whatever their lattice gives. The screen radius is `R = (size/2) · 0.8 · scale` (`model.ts` L129–130).

**sphere** (scale 1; `model.ts` L74–85)
- Default: a Fibonacci sphere. For i = 0…count−1: `y = 1 − 2(i+0.5)/count`, `r = sqrt(1 − y²)`, `θ = i·GOLDEN` with `GOLDEN = π(3 − √5)` (L23), point `[r·cos θ, y, r·sin θ]`.
- `background-spiral`: `arms(count)` (L59–72), 8 arms:
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

**Computed counts.** These were produced by transpiling and running the 9bef3b1 `buildInput` (code outputs, not live measurements). Look `working`, density 1, dotSize 1:

| Shape | count @ size 96 (asked 384) | R @ 96 | count @ size 320 (asked 1280) | background-spiral count @ 96 |
|---|---|---|---|---|
| sphere | 384 | 38.4 | 1280 | 257 |
| cube | 386 | 46.08 | 1352 | 264 |
| octahedron | 402 | 46.08 | 1298 | 178 |
| tetrahedron | 394 | 46.08 | 1252 | 163 |
| torus | 374 | 46.08 | 1265 | 396 |

## 7. Renders (`src/orb/draw.ts`; per-point data from `simulate.ts` L387–418)

**No shaders, gradients, blurs or blend modes exist in the orb.** `draw.ts` only calls `Skia.Paint()`, `setAntiAlias(true)`, `setColor`, `setAlphaf`, `setStyle`, `setStrokeWidth`, `setStrokeCap`, `drawCircle`, `drawRect`, `drawLine` and `drawPath`. Nothing under `src/orb/` uses `RuntimeEffect`, `Shader`, `Gradient`, `BlendMode` or blur. The only per-mark "uniforms" are the radius `r` and alpha `a`, which `step()` computes each frame.

- **One base colour per orb** (L22–25): `const base = Skia.Color(Float32Array.of(r, g, b, a)); paint.setColor(base);`. The floats come from `colorToRgba` (§12).
- **Per-mark alpha:** `paint.setAlphaf(Math.min(1, a_mark) * rgba.a)` (L108). Marks with `a_mark < 0.005` are skipped (L107).
- `minR(r) = Math.max(0.45, r)` (L10–13).
- Per-point buffer layout: `dots[i*6 + 0..5] = [px, py, r, a, dx, dy]` (`simulate.ts` L389–395), where `dx = z1` and `dy = −(vx·sin pitch)` give the dash direction.

| Render | Flat | Drawing (draw.ts lines) |
|---|---|---|
| `dots` | no | Fill; `drawCircle(x, y, minR(r))` (L109–110) |
| `squares` | no | Fill; `h = minR(r)·0.9`; `drawRect(XYWHRect(x−h, y−h, 2h, 2h))` (L111–113) |
| `dashes` | no | Stroke + round cap (L93–96); `rr = minR(r)`; `(ux, uy) = (dx, dy)/hypot(dx, dy)·rr·1.8` (hypot 0 → 1); width `max(0.5, rr·0.9)`; line `(x−ux, y−uy) → (x+ux, y+uy)` (L114–122) |
| `crosses` | no | Stroke + round cap; `h = rr·1.4`; width `max(0.5, rr·0.7)`; one horizontal and one vertical line through (x, y) (L123–128) |
| `mesh` | no | Edges first, with a second paint: Stroke, width `max(0.35, input.rs·0.6)`, alpha `0.85·min(a_i, a_j)·rgba.a` (skipped below 0.005), one `drawLine` per pair (L76–91). Then joints: Fill, `drawCircle(x, y, minR(r)·0.4)` (L129–130). Pairs are the unique 3-nearest neighbours (`model.ts` L148–161). |
| `halftone` | yes | For each grid cell k of g×g: `rad = toneAt(local, k, cell)`; skip `rad < 0.3`; alpha `rgba.a`; `drawCircle(((k mod g)+0.5)·cell, (floor(k/g)+0.5)·cell, rad)` (L34–42) |
| `lines` | yes | One filled path per row j: `v = (j+0.5)·cell`; for k, `u = (k+0.5)·cell`, `h = 0.8·toneAt(j·g + k)`; `moveTo(0, v)`, then the top points `(u, v−h)`, `lineTo(size, v)`, the bottom points `(u, v+h)` in reverse, `close()`; Fill at alpha `rgba.a` (L44–72) |
| `verticalLines` | yes | The same transposed: tone index `k·g + j`, points `(v∓h, u)`, from `(v, 0)` to `(v, size)` (L44–72) |

**Tone grid** (flat renders only; `simulate.ts` L396–418, L422–427). Each projected point splats bilinearly into the 4 surrounding cells. With `fx = px/cell − 0.5`, `fy = py/cell − 0.5` and weight f:
- `ink[idx] += a·r·f·(0.4 + 0.6a) / rs`
- `hits[idx] += a·f`
- `toneAt(k) = hits ? 0.5·cell·min(1, ((ink/hits)·min(1, hits/0.3)) / 2.2) : 0`

Grid size `g = max(6, round(sqrt(count)·0.9))`, `cell = size/g` (`model.ts` L162, L179). Flat renders force the tilt term of pitch to 0 (`simulate.ts` L159), and the working ring uses `vy` as its coordinate on flat renders (L338).

## 8. Geometry and sizing (`buildInput`, `src/orb/model.ts` L115–182)

- `state = lookId(opts.state, opts.variant)` (L124).
- `dens = state === "background" ? 1 : 4` (L126). Only plain `background` gets the sparse density; `background-spiral` uses 4.
- `asked = max(8, round(size·dens·density))` (L127).
- `R = (size/2)·0.8·(form?.scale ?? 1)` (L129–130).
- `rs = (size/64)^0.6 · (0.72·sqrt(4/dens)) · dotSize` (L131). This is the base mark radius.
- `count = points.length`. Points go into a `Float64Array` (L133–139; the L98 comment: Float64 "so near-ties in the walker match the npm numbers").
- Reasoning looks (count > 1): 24 nearest neighbours per point (`REACH = 24`, L109), stored in a `Float32Array` with −1 in empty slots (L140–147).
- Mesh: unique 3-nearest pairs (L148–161).
- `g = max(6, round(sqrt(count)·0.9))`, `cell = size/g` (L162, L179).
- `key = "${state}|${shape}|${render}|${size}|${density}|${dotSize}"` (L164). A changed key or point count re-creates the per-orb state (`OrbView.tsx` L189–193).
- The input is memoised on `[state, variant, size, density, dotSize, shape, render]` (`OrbView.tsx` L164–167, L215–218). **`speed`, `tilt` and `color` never rebuild geometry.**

**Computed sizing** (sphere, dots, density 1, dotSize 1; executed from the 9bef3b1 code; cells are `count | rs | g`):

| look | size 20 | size 24 | size 96 | size 320 |
|---|---|---|---|---|
| every look except the two below | 80 / 0.3583 / 8 | 96 / 0.3997 / 9 | 384 / 0.9183 / 18 | 1280 / 1.8911 / 32 |
| `background` | 20 / 0.7166 / 6 | 24 / 0.7994 / 6 | 96 / 1.8366 / 9 | 320 / 3.7822 / 16 |
| `background-spiral` | 105 / 0.3583 / 9 | 117 / 0.3997 / 10 | 257 / 0.9183 / 14 | 486 / 1.8911 / 20 |

- R (sphere) is 8 / 9.6 / 38.4 / 128 at sizes 20 / 24 / 96 / 320.
- Mesh pairs (working, sphere): 675 at size 96, 2391 at size 320.
- Density at size 320: 0.25 gives 320 points; 3 gives 3840.

**Sizes the host site uses** (host choices; reproduce them for the same visual contexts):
- Landing cards: **96** (`app/index.tsx` L415–422), centred in a 224-tall well (L413).
- Header brand orb: **20**, look `base` (`src/components/Header.tsx` L271).
- Chat status orbs: **20** (`src/components/Chat.tsx` L101, L115).
- Playground stage: `shown = min(size, wide ? maxOrb : min(maxOrb, max(96, width − 32)))`, with `maxOrb = max(96, height − headerH − 120)` and `headerH = width ≥ 768 ? 48 : 72` (`app/playground.tsx` L84–86); default size 320 (L69).
- Playground status mini-orb: **24** (`app/playground.tsx` L311–323).

## 9. Time: the shared clock (`src/orb/clock.ts` L1–26; call site `OrbView.tsx` L181–195)

- `clocks = makeMutable<Record<string, Clock>>({})` (L10). One global map, shared by every orb on the page.
- The key is `look = \`${input.state}@${tune.speed}\`` (`OrbView.tsx` L186). Every orb with the same look id **and** the same speed shares one clock, so their phases stay in sync.
- `tick(look, now, speed)` (L12–26):
  - first call: `{ t: 0, last: now }`;
  - then, if `now > last`: `t += min(now − last, 100) · speed`, and `last = now`.
  - So it is **forward-only, the frame gap is capped at 100 ms, and t is in milliseconds scaled by speed**. Several orbs calling in the same frame advance it only once, because `now` equals `last` after the first call.
- `now = frame.timestamp` from Reanimated `useFrameCallback` (`OrbView.tsx` L187).
- **Pause behaviour.** An inactive orb (`active = false`) returns before calling `tick` (L184), so the clock does not advance for it. When it resumes, the jump is capped at 100 ms × speed (unless another orb with the same key kept ticking). The tree's comment (`clock.ts` L6) says "A paused orb must not call this."
- **Speed changes switch clocks.** A new `speed` value is a new key, which starts a clock at t = 0 (or resumes an existing clock for that key). So changing speed jumps the animation phase. That is what the code does. Whether live behaves the same is **unmeasured**.
- **Loop behaviour.** No look has an end. Everything is periodic in t: yaw laps per `PERIOD`, plus the per-effect cycles in §11. There is **no crossfade** when the look changes: the input is rebuilt and the local state is reset (`OrbView.tsx` L169–172), and the next frame draws the new look (handoff motion summary: "no crossfade on look change").
- **Reduced motion.** `StillOrb` paints once at **t = 0**, with `makeLocal(input)` fresh, through `runOnUI` (`OrbView.tsx` L220–229). It has no frame callback and repaints only when its props change.

## 10. Camera and projection (`src/orb/simulate.ts` L146–173, L290–305, L381–395)

### 10.1 Per-frame camera
- `yaw = yawOf(state, t)` (L157). By default that is `(t / PERIOD[state]) · 2π` (L70): one full turn per PERIOD ms at speed 1.
- `gyro = state === "working-gyro" ? (t/5000)·2π : −1` (L158).
- `pitch = ((flat ? 0 : tilt) + input.tip + (gyro < 0 ? 0 : 10·cos(gyro))) · π/180` (L159).
  - `tip` is 35 for the torus and 0 otherwise (`model.ts` L168).
  - `flat` is true for halftone, lines and verticalLines.
- `roll = gyro < 0 ? 0 : 12·sin(gyro) · π/180` (L160).

### 10.2 working-gyro
Pitch wobbles ±10° and roll ±12° on a **5000 ms** cycle (L158–160). The twist is `tw = 0.5·sin((t/2600)·2π)` (L255–256, see §11.8).

### 10.3 Retrying yaw
- **`retrying`:** `yaw = rewind(2t, 2π/9000)` (L64; `rewind` at L42–60). It uses a 3200 ms cycle `P` in the doubled time `2t`, which is 1600 ms of real time at speed 1. With `u = t' mod 3200` and `w = 2π/9000`:
  - `u < 2000`: `a = u·w` (linear spin);
  - `2000 ≤ u < 2200`: `x = (u−2000)/200`, `a = (2000 + 200(x − x²/2))·w` (brake);
  - `2200 ≤ u < 3000`: `a = 2100w − back·spring((u−2200)/800)`, with `back = 0.6·2100·w` and `spring(x) = 1 − e^(−4.5x)·cos(3πx) − x·e^(−4.5)` (L19–22) (wind back 60%);
  - `u ≥ 3000`: `x = (u−3000)/200`, `a = 2100w − back + 100x²·w` (re-accelerate);
  - net advance per cycle: `fwd − back`, where `fwd = (2000+100+100)·w`; `yaw = k·(fwd − back) + a`.
- **`retrying-surge`:** `turns = t/3250`, `u = frac(turns)`, `yaw = (floor(turns) + (1 − (1−u)³))·2π` (L65–69). That is one turn per **3250 ms**, with a cubic ease-out on each turn.

### 10.4 Per-point transform (L290–305)
For model point (x, y, z):
- `turn = yaw + TWIST·tw·y`, with `TWIST = 1.4` (L80, L294). Use `ly = sin(turn)` and `lc = cos(turn)` when `tw ≠ 0`; otherwise use `sin(yaw)` and `cos(yaw)`.
- `z1 = −x·ly + z·lc`, `vx = x·lc + z·ly`, `vy = y·cos(pitch) − z1·sin(pitch)`, `vz = y·sin(pitch) + z1·cos(pitch)`.
- **Depth:** `d = (vz + 1)/2`, `r = (0.5 + 1.4d)·rs`, `a = max(0, (d − 0.3)/0.7)` (L303–305). Back-facing points fade out, and front points are up to 1.9× rs.
- Effects (§11) then modify vx, vy, r and a.
- Roll, when non-zero, rotates (vx, vy) by `roll` (L381–386).
- **Screen:** `px = c + vx·R`, `py = c − vy·R`, with `c = size/2` (L387–388).

## 11. Per-state animation (`src/orb/simulate.ts`)

Helpers: `ease(x) = (1 − cos πx)/2` (L10–13), `hash(n) = frac(sin(n·127.1)·43758.5453)` (L14–18), `spring(x)` (L19–22). The time **t is in clock ms** (§9), so at speed s every duration below is divided by s in real time. "Lit" means `r *= 1 + k·g` and `a += (1 − a)·g` for some weight g.

### 11.1 base
No effect beyond depth: a plain spin, one yaw lap per **6500 ms**.

### 11.2 searching: lens (L83–107, L254, L306–320)
- `LENS_MS = 1800`, `MOVE = 0.4`, `LENS = 0.6` rad.
- Every 1800 ms the lens hops from `spot(k)` to `spot(k+1)`. It moves during the first 40% of each hop with `e = (1 − cos(π·u/0.4))/2`, then holds.
- `spot(k)`: `phi = 2.45k + 1.5·hash(k)`, `theta = (15 + 30·hash(k+0.5))°`, giving the unit vector `[sin θ cos φ, sin θ sin φ, cos θ]`. The lens sits 15–45° off the view axis.
- Per point: `ang = acos(min(1, dot(v, lens)/|v|))`, `w = ang < 0.6 ? (1 − (ang/0.6)²)² : 0`.
  - `a *= 1 − 0.55·(1 − w)` dims everything outside the lens by 55%.
  - If `size ≤ 24`: `r *= 1 + 0.5w`.
  - If w > 0: `vx, vy *= 1 + 0.12w`; `vx += (vx − lens.x)·0.35w`, same for vy; `r *= 1 + 0.9w`; `a += (1 − a)·w`.
- Yaw lap 13000 ms.

### 11.3 compacting and compacting-fuse: sweep (L257–275, L321–334)
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

### 11.4 working: ring (L73–79, L335–346)
- Cycle **1700 ms**: `u = t mod 1700`.
- The ring position is `at = 1.3 − 2.6·ease(min(1, u/1200))`. It travels down over **1200 ms**, then rests for 500 ms.
- Ring coordinate: `q = flat ? vy : dot(v, RING_AXIS)`.
  - `RING_AXIS = [−sin(10°)·cos(30°), cos(10°)·cos(30°), sin(30°)]`, i.e. RING_TIP 30° and RING_ROLL 10°.
- Lit band: `gg = u < 1200 ? exp(−((q − at)/0.2)²) : 0`, then `r *= 1 + 0.6gg`, `a += (1 − a)·gg`.
- Passed points: `w = clamp01((q − at)/0.2)·(u < 1200 ? 1 : 1 − min(1, 1.6·(u−1200)/800))`, then `vx, vy *= 1 − 0.08w`, `r *= 1 − 0.15w`.
- Yaw lap 3000 ms.

### 11.5 searching-lighthouse: beam (L81–82, L347–359)
- `a *= 0.5` (base dim).
- `LEAN = 30°`. `across = vx·cos(LEAN) − vy·sin(LEAN)`, `toward = −sin(pitch)·(vx·sin(LEAN) + vy·cos(LEAN)) + cos(pitch)·vz`.
- Beam angle: `off = atan2(across, toward) − ((t/2500 mod 1)·2π − π)`, a **2500 ms** lap. `dphi` is `off` wrapped to (−π, π].
- `beam = dphi < 0 ? max(0, 1 + dphi/TRAIL) : exp(−(dphi/0.45)²)`, with `TRAIL = π/2`: a linear trailing edge and a Gaussian front of 0.45 rad.
- `gg = beam·(0.25 + 0.75·clamp01((d − 0.4)/0.3))`, then `r *= 1 + 0.6gg`, `a += (1 − a)·gg`.
- Yaw lap 13000 ms.

### 11.6 reasoning and reasoning-twins: walking sparks (L86–88, L178–248, L360–367)
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

### 11.7 waiting: comet (L250–253, L368–380)
- `head = (t/2000)·2π + yaw`: the head laps in **2000 ms** relative to the yaw.
- `ahead = 2π/2000 + 2π/PERIOD`.
- `headLat(tt) = 70°·(1 − 2·((tt mod 6000)/6000))`: the head drifts from 70° N to 70° S over **6000 ms**.
- `glow = min(1, 3·sin(π·(t mod 6000)/6000))`: fades in and out every 6000 ms.
- Per point: take model lat/lon. `off = atan2(sin(lon − head), cos(lon − head))`, `along = off·cos(lat)`.
  - `gg = exp(−((lat − headLat(t + off/ahead))/0.28)²) · exp(−(along/(off·ahead > 0 ? 0.12 : 1))²)`: a sharp head and a long tail.
  - `w = glow·gg^0.6`; `a = 0.5a + (1 − 0.5a)·w`; `r *= 1 + 1.1w`.
- Yaw lap 13000 ms.

### 11.8 Twist: working-gyro and compacting-squeeze (L255–256, L294–296)
- `tw = 0.5·sin((t/2600)·2π)` for working-gyro, and `sin((t/2600)·2π)` for compacting-squeeze, on a **2600 ms** cycle.
- Each point's yaw becomes `yaw + 1.4·tw·y`, so the top and bottom wring in opposite directions.
- compacting-squeeze has **no** sweep: `compacting` is only true for `compacting` and `compacting-fuse` (L257).

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

## 12. Colour (`src/color/color.ts`; `src/orb/OrbView.tsx` L26–47)

### 12.1 What `color` accepts (`parseColor`, color.ts L170–226)
Input is trimmed and lower-cased, then matched against:
- `transparent` → `{l:0, c:0, h:0, a:0}`;
- hex `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (sRGB);
- `oklch(L C H [/ A])`, space-separated only. L may be a %; C may be a %, where 100% = 0.4; H accepts deg, rad, turn or grad;
- `rgb()` / `rgba()`, comma or space syntax; % channels must be all-or-none in comma syntax;
- `hsl()` / `hsla()`, with S and L required as %;
- `color(display-p3 R G B [/ A])`, space syntax only.

Anything else returns `null`. **`OrbView` then paints opaque white** (`OrbView.tsx` L43–44). Internally colour is held as OKLCH `{l, c, h, a}` with l and a clamped to 0–1, c ≥ 0, and h in 0–360.

### 12.2 Conversion to paint floats
- `toSrgb(c)` (L139–143): clamp chroma into the **sRGB** gamut (20-step bisection, `clampChroma` L90–100), convert OKLCH → gamma sRGB, and clamp each channel to 0–1.
- `toExtendedSrgb(c)` (L145–149): clamp chroma into the **Display P3** gamut, then convert to gamma sRGB **without** clamping. Channels can fall outside 0–1, which is how P3 colours are encoded on an sRGB-referenced paint.
- `colorToRgba` uses `toExtendedSrgb` only when `canUseExtendedColor()` is true; otherwise it uses `toSrgb` (OrbView L42–47).
- Matrices: OKLab per the CSS Color 4 values hard-coded in color.ts L30–59 (M_SRGB … M_LMS_OK). The transfer function is the sRGB piecewise curve (L25–28).

### 12.3 Platform behaviour (`canUseExtendedColor`, OrbView L36–40; patch §3.2)

| Platform | Surface | Paint input | Result |
|---|---|---|---|
| Web (desktop target) | WebGL surface in **DISPLAY_P3** when `matchMedia("(color-gamut: p3)")` matches, else **SRGB** (patched `webglSurfaceColorSpace()`) | extended-sRGB `Float32Array` floats, unclamped | P3 colours paint at full gamut on P3 displays; Skia converts sRGB-referenced floats onto the surface |
| iOS native/dev build | `<Canvas colorSpace="p3">` | floats via patched `JsiSkPaint::setColor` → `setColor4f` | extended colour kept. **Unverified: iOS was never booted.** |
| iOS Expo Go (`ExecutionEnvironment.StoreClient`) | unpatched binary | `toSrgb` (clamped) | sRGB only |
| Android | GL surface with null colour space; `setColorSpace` is a no-op in Skia 2.6.2 | `toSrgb` (clamped) | always sRGB. Unverified on 9bef3b1 (last checked on round 9.6/9.7) |

The prod bundle contains `DISPLAY_P3` (Ship smoke on 9bef3b1, bundle `index-f8b421c2`).

### 12.4 Light and dark
**The orb has no theme logic.** It paints exactly the `color` it's given, on a transparent canvas. The colours the host site passes are:

| Where | Dark | Light | Cite |
|---|---|---|---|
| Landing cards, header brand orb, chat orbs | `colors.fg` = **`#fafafa`** | `colors.fg` = **`#0a0a0a`** | `app/index.tsx` L260, L325 (`color={colors.fg}`); `Header.tsx` L271; `Chat.tsx` L101, L115; palette `src/theme/theme.tsx` L30 (dark fg), L51 (light fg) |
| Playground default orb colour (`colors.orb`) | **`#ffffff`** | **`#171717`** | `src/theme/theme.tsx` L37 (dark `orb`), L58 (light `orb`) |

Playground theme rule (`theme.tsx` L113–140):
- Toggling the theme swaps the playground colour between `#ffffff` and `#171717` only while it still equals the previous mode's default. A custom colour survives the toggle.
- A route change resets the mode to dark and maps either default back to `#ffffff`.

Computed paint floats (from the 9bef3b1 colour code):
- `#ffffff` → (1, 1, 1)
- `#fafafa` → (0.98039, 0.98039, 0.98039)
- `#171717` → (0.0902, 0.0902, 0.0902)
- `#0a0a0a` → 10/255 = 0.03922 per channel (derived; sRGB greys are exact)
- `color(display-p3 1 0 0)` → toSrgb (1, 0.20346, 0.15875), toExtendedSrgb (1.09307, −0.22674, −0.15013)
- `oklch(0.7 0.3 30)` → toSrgb (1, 0.39623, 0.3182), toExtendedSrgb (1.08422, 0.27728, 0.19679)

## 13. Render pipeline per frame (`src/orb/OrbView.tsx`)

### 13.1 Mount
1. `usePicture()` (L55–61) creates a blank 1×1 recorded picture (L49–53) as the initial `SharedValue<SkPicture>`, plus `retire = SharedValue<SkPicture|null>(null)`.
2. `LiveOrb` (L136–198) creates the shared values `inputSV`, `localSV`, `activeSV` and `fallback` (`OrbLive` from props, L155–162).
3. `built = useMemo(buildInput(...))` (L164–167). An effect writes `inputSV.value = built` and `localSV.value = null` (L169–172).
4. An effect writes `activeSV`, and, when there is no `live`, it also writes `fallback.value = { size, speed, density, dotSize, tilt, ...colorToRgba(color) }` (L174–179).

### 13.2 Every frame (UI thread worklet, `useFrameCallback(…, true)` L181–195)
1. Return early if there's no input or `activeSV` is false.
2. `tune = live ? live.value : fallback.value`.
3. `t = tick(\`${input.state}@${tune.speed}\`, frame.timestamp, tune.speed)`.
4. If `local` is missing, `local.key !== input.key`, or `local.dots.length !== input.count·6`, then `local = makeLocal(input)` (`simulate.ts` L119–136: walks, hops 0, ink/hits g², dots count·6, lit count).
5. `paint(picture, retire, input, local, tune, t)` (L82–100):
   - `step(input, local, t, tune.tilt, 1)` computes the dots buffer and tone grid;
   - `recorder = Skia.PictureRecorder()`; `canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, input.size, input.size))`;
   - `drawOrb(canvas, input, local, { r: tune.r, g: tune.g, b: tune.b, a: tune.a })`;
   - `next = recorder.finishRecordingAsPicture()`;
   - **Rotation:** `old = retire.value; retire.value = picture.value; picture.value = next; old?.dispose()`.
6. `<Canvas>` (L129–133) draws `<Picture picture={picture}/>`, re-rendered by Skia whenever the shared value changes. There is no React state per frame.

### 13.3 What is per-frame and what needs a rebuild
- **Per frame** (read from `tune` each frame): `speed` (clock rate and clock key), `tilt` (pitch), and `r, g, b, a` (paint).
- **Rebuild via props** (memoised `buildInput`): `state`, `variant`, `size`, `density`, `dotSize`, `shape`, `render`.
- `tune.size`, `tune.density` and `tune.dotSize` exist in `OrbLive` but **are not read by `paint`/`step`**. Geometry always comes from `input`. A `live` write of those fields has no visual effect until the props change. The `size` prop also sets the canvas style size (L130).

### 13.4 Unmount, snapshot and focus
- `CanvasHost` cleanup (L114–128): if `onFrame` is set, it calls `ref.current.makeImageSnapshot()`, `encodeToBase64()` and `dispose()`, then reports `data:image/png;base64,<b64>`. Errors are swallowed (the comment notes the surface may already be gone).
- `OrbView` returns `null` when the route is unfocused (L235–237), which unmounts the canvas.

### 13.5 Canvas budget pattern (host site, `app/index.tsx` L178–216)
- `fixed = 1 (header) + live chat orb + tasks chat orb`; `budget = max(1, 12 − max(fixed, 3))`, which comes to **9 card canvases**.
- Cards **mount** within 1 viewport of distance and **stay mounted** within 1.5 viewports. Cards sorted by distance fill the budget.
- Only cards on screen (`dist === 0`) get `active = true`.
- Unmounted cards show their last `onFrame` PNG as an `<Image>` of 96×96 (L423–424).
- Measured on 9bef3b1 (Beta, 1280×800): canvases non-blank, **6 on `/`** and **3 on `/playground`**; 0 console errors.

## 14. How controls drive the orb (prop mapping, without the site's UI)

Wire any controls you like (your own selects, sliders, inputs). The orb only sees props, plus the optional `live` SharedValue.

### 14.1 Value domains the host playground uses
These are host choices, recorded so the orb gets the same inputs as on the live site. Source: `app/playground.tsx`.

| Prop | Control in host | Range | Step | Default | Cite |
|---|---|---|---|---|---|
| `state` + `variant` | state list of 15 looks | the 15 look ids (§5) | n/a | Working (index 1) | L63, `cards.ts` L135–151 |
| `shape` | select | sphere, cube, octahedron, tetrahedron, torus | n/a | `"sphere"` | L39–45, L67 |
| `render` | select | dots, crosses, dashes, halftone, lines, mesh, squares, verticalLines (labels: Dots, Crosses, Dashes, Halftone, Lines, Mesh, Squares, Vertical Lines) | n/a | `"dots"` | L47–56, L68 |
| `color` | text/picker | any `parseColor` string (§12.1) | n/a | theme `orb` (`#ffffff` dark / `#171717` light) | `theme.tsx` L116 |
| `size` | slider | 16–480 | 1 | 320 | L69; slider row "Size" |
| `speed` | slider | 0.05–3 | 0.05 | 1 | L70; "Speed" |
| `density` | slider | 0.25–3 | 0.05 | 1 | L71; "Density" |
| `dotSize` | slider | 0.25–3 | 0.05 | 1 | L72; "Dot Size" |
| `tilt` | slider | −90–90 | 1 | 20 | L73; "Tilt" |

- **Tilt on flat renders:** the host hides the Tilt slider while `isFlat(render)` is true. When the render goes from flat back to non-flat it resets tilt to **20** (`app/playground.tsx` L111–114). The engine ignores tilt on flat renders anyway (`simulate.ts` L159).
- **Snapping:** host slider values snap to the step and are rounded with `toFixed(4)` (`SliderRow.tsx` L18–24).
- **Stage size:** the host passes `size = shown`, the clamped stage size (§8), to the big orb, and a fixed 24 to the status mini-orb. Both get the same look, shape, render, colour and tuning and share one `live` (L285–297, L311–323).

### 14.2 Plain prop driving (simplest; recommended for a standalone host)
Hold each value in React state and pass it as a prop. Every prop change re-renders `OrbView`:
- geometry props rebuild the input (§13.3);
- `speed`, `tilt` and `color` update `fallback` through the effect at L174–179 and take effect on the next frame.

### 14.3 The `live` SharedValue (per-frame tuning during a drag)
The host creates `const live = useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba })`, where `rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed)` (`app/playground.tsx` L88, L93).
- While a slider drags, a worklet writes one field at a time: `live.value = { ...live.value, [field]: next }` for size, speed, density, dotSize or tilt (`SliderRow.tsx` L26–34). JS state is published at most every **32 ms** (`PUSH_MS = 32`, L14).
- When not dragging, an effect rewrites the whole object from React state: `live.value = { size: shown, speed, density, dotSize, tilt, ...rgba }`, skipped while `sliding.current` is true (`app/playground.tsx` L116–119).
- **Effect on the orb:** speed and tilt change on the very next frame, with no React render. Size, density and dotSize only change the drawing when the props catch up (§13.3).

## 15. Minimal host (mount and drive the orb)

This host is **illustrative scaffolding**. Its layout isn't a parity target. It only uses values from the tree: page `#000000` (dark `page`, `theme.tsx` L29), orb colour `#ffffff` (dark `orb`, L37), sizes 96 and 320 (§8), the look list (§5), and the prop defaults (§4.1). The orb files under `src/orb/` and `src/color/color.ts` are copied **verbatim** from the appendices.

### 15.1 Files
```
package.json            same dependencies as Appendix 14 (orb needs: §3.1)
babel.config.js         Appendix 15 (babel-preset-expo)
tsconfig.json           Appendix 16
app.json                needs "plugins": ["expo-router", …] and "web": { "bundler": "metro", "output": "single" } (as in the tree's app.json)
index.ts                Appendix 10
index.web.tsx           Appendix 9 minus L2 and L3 (site CSS and fonts), see 15.2
patches/…2.6.2.patch    Appendix 13
scripts/copy-wasm.js    Appendix 11
scripts/serve-dist.js   Appendix 12 minus L5 (site llms check)
src/orb/*               Appendices 1–7
src/color/color.ts      Appendix 8
app/_layout.tsx         15.3
app/index.tsx           15.4
```

### 15.2 `index.web.tsx` for an orb-only host (the tree's file with the two site imports removed)
```tsx
import type { ComponentType } from "react";
import "@expo/metro-runtime";
import "react-native-gesture-handler";
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

type QualifiedEntry = { App: ComponentType };
type RootRenderer = { renderRootComponent: (app: ComponentType) => void };

// CanvasKit must exist before any Skia component module evaluates.
void LoadSkiaWeb({
  locateFile: () => "/canvaskit.wasm",
}).then(() => {
  // require, not import(): a dynamic import splits a chunk this static export never loads.
  const qualified: QualifiedEntry = require("expo-router/build/qualified-entry");
  const renderer: RootRenderer = require("expo-router/build/renderRootComponent");
  renderer.renderRootComponent(qualified.App);
});
```

### 15.3 `app/_layout.tsx` (minimal; `OrbView` needs an expo-router navigator for `useIsFocused`)
```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#000000" } }} />;
}
```

### 15.4 `app/index.tsx` (all 15 looks at 96, plus one driven orb at 320)
```tsx
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { OrbView } from "../src/orb/OrbView";
import { RENDERS, type RenderName, type ShapeName } from "../src/orb/model";

const LOOKS: { state: string; variant?: string; label: string }[] = [
  { state: "base", label: "Base" },
  { state: "working", label: "Working" },
  { state: "working", variant: "gyro", label: "Working · Gyro" },
  { state: "reasoning", label: "Reasoning" },
  { state: "reasoning", variant: "twins", label: "Reasoning · Twins" },
  { state: "searching", label: "Searching" },
  { state: "searching", variant: "lighthouse", label: "Searching · Lighthouse" },
  { state: "background", label: "Background" },
  { state: "background", variant: "spiral", label: "Background · Spiral" },
  { state: "retrying", label: "Retrying" },
  { state: "retrying", variant: "surge", label: "Retrying · Surge" },
  { state: "compacting", label: "Compacting" },
  { state: "compacting", variant: "squeeze", label: "Compacting · Squeeze" },
  { state: "compacting", variant: "fuse", label: "Compacting · Fuse" },
  { state: "waiting", label: "Waiting" },
];
const SHAPES: ShapeName[] = ["sphere", "cube", "octahedron", "tetrahedron", "torus"];

export default function OrbHost() {
  const [look, setLook] = useState(1); // Working, as the playground starts
  const [shape, setShape] = useState<ShapeName>("sphere");
  const [render, setRender] = useState<RenderName>("dots");
  const [speed, setSpeed] = useState(1);
  const [tilt, setTilt] = useState(20);
  const cur = LOOKS[look];
  const next = <T,>(list: readonly T[], v: T) => list[(list.indexOf(v) + 1) % list.length];
  return (
    <ScrollView contentContainerStyle={{ padding: 32, gap: 24 }}>
      <OrbView
        state={cur.state}
        variant={cur.variant}
        size={320}
        speed={speed}
        tilt={tilt}
        shape={shape}
        render={render}
        color="#ffffff"
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        <Pressable onPress={() => setLook((look + 1) % LOOKS.length)}><Text style={{ color: "#fafafa" }}>{cur.label}</Text></Pressable>
        <Pressable onPress={() => setShape(next(SHAPES, shape))}><Text style={{ color: "#fafafa" }}>{shape}</Text></Pressable>
        <Pressable onPress={() => setRender(next(RENDERS, render))}><Text style={{ color: "#fafafa" }}>{render}</Text></Pressable>
        <Pressable onPress={() => setSpeed(speed === 1 ? 3 : 1)}><Text style={{ color: "#fafafa" }}>speed {speed}</Text></Pressable>
        <Pressable onPress={() => setTilt(tilt === 20 ? -90 : 20)}><Text style={{ color: "#fafafa" }}>tilt {tilt}</Text></Pressable>
      </View>
      {/* 15 web canvases + 1 = 16; stay at or under the tree's 12-canvas cap on web (§3.5) by paging or by active/onFrame snapshots (§13.5). */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {LOOKS.slice(0, 11).map((l) => (
          <OrbView key={l.label} state={l.state} variant={l.variant} size={96} color="#fafafa" />
        ))}
      </View>
    </ScrollView>
  );
}
```
This shows the first 11 looks plus the driven orb, which is 12 canvases. The values used (3, −90, 20, 1) are the ends and defaults of the host ranges in §14.1. Copy the rest of the host site's UI only if another card asks for it.

Check: I extracted 15.2–15.4 together with the verbatim `src/orb/*` and `src/color/color.ts`, and ran `tsc --noEmit` (strict, `expo/tsconfig.base`) against the 9bef3b1 `node_modules`. It exits 0. The host has not been run in a browser.

## 16. Parity notes and known gaps (orb asset only)

Measured on 9bef3b1 (desktop web, 1280; Beta CLEAR; Ship smoke green 10:27 ET Oct 7, 2026):
- Canvases non-blank by screenshot pixels: **6 on `/`, 3 on `/playground`**. **0 console errors**.
- `/canvaskit.wasm` → **200, `application/wasm`, 8,076,553 B**. The prod web bundle `index-f8b421c2` contains `DISPLAY_P3`.
- Motion's PASS (carried from 8ba6306) covers the site's controls. No orb engine code changed between 023ca9d and 9bef3b1: none of the changed files are under `src/orb/` or in `src/color/color.ts`. The engine is the same port the earlier rounds gated.

**Known gaps and unverified items (non-gating):**
1. **iOS and Android are unverified.** iOS has never been booted for this project. Android was last checked on round 9.6/9.7, not on 9bef3b1. The extended-colour iOS path (§12.3) is untested.
2. **Frame-by-frame visual parity with the live npm orb is unmeasured on 9bef3b1.** Design's 1280 crops masked the orb. Live draws with SVG (npm 0.1.1); this port draws with Skia from the same maths. Treat pixel-exact comparison as unmeasured.
3. **API differs from the npm `<Orb>` the live site documents** (from the tree's `src/content/prompt.ts` props table):
   - npm `state` defaults to `"base"`, `size` to `20`, and colour is the CSS `currentColor`;
   - npm has `paused`, `label` (screen-reader name) and `className`;
   - `OrbView` requires `state`, `size` and `color`, uses `active` instead of `paused`, and has **no label or a11y role**.
   - Reproduce `OrbView` as it is. Don't add npm props.
4. **Reduced motion is read once at launch.** A live OS toggle needs a relaunch (handoff note).
5. **The 12-canvas web cap is a host responsibility** (§3.5, §13.5). Exceeding about 16 WebGL contexts in Chrome loses contexts (handoff rationale).
6. **CanvasKit logs a WebGL message on a fresh load** (handoff note).
7. **About 8 MB of wasm ships in the native builds** (8,076,553 B; handoff note).
8. **A speed change restarts the clock phase** (new `state@speed` key, §9). Whether live does the same is **unmeasured**.
9. Unknown look ids produce `NaN` yaw (§5). The site never passes one.

## 17. Parity checklist (verify each; expected values are concrete)

Install and serve:
1. `npm ls @shopify/react-native-skia` → **2.6.2**; `npm ls canvaskit-wasm` → **0.41.0**; `npm ls react-native-reanimated` → **4.5.1**; `react-native-worklets` → **0.10.1**.
2. `npm ci` prints that patch-package applied `@shopify/react-native-skia@2.6.2`. The patch file sha256 is `0c0ef5ac4749bbdf2dc66d69c953a73667eaba67a3f2db679df9ba14904468a6` (7,164 B).
3. `public/canvaskit.wasm` is **8,076,553 B**, sha256 `eb68c7a7f602d8cb89915352c4471a2d26edfd72000f78202cb1fe32ce1f9dc4`.
4. After `npx expo export -p web`: `dist/canvaskit.wasm` exists at 8,076,553 B. Copy it from `node_modules/canvaskit-wasm/bin/full/` only if it's missing.
5. Served: `GET /canvaskit.wasm` → **200**, `Content-Type: application/wasm`. `GET /nope.js` → **404** (not HTML).
6. The built web bundle contains the string `DISPLAY_P3`. On a P3 display, `matchMedia("(color-gamut: p3)").matches` is true, and the surface is created with `CanvasKit.ColorSpace.DISPLAY_P3`.
7. `npx tsc --noEmit` exits 0.

Runtime at 1280:

8. Page load: **0 console errors** (a CanvasKit WebGL info message on a fresh load is known).
9. Every mounted orb canvas is non-blank, and no more than **12** Skia canvases are mounted at once.
10. A `size={96}` orb renders a 96×96 CSS-px canvas with a transparent background and `pointer-events: none`.
11. `color="nope"` paints white. `color="#ffffff"` paints (1, 1, 1). `#171717` → 0.0902 per channel. `#fafafa` → 0.98039. `color(display-p3 1 0 0)` → paint floats (1.09307, −0.22674, −0.15013) on web, and (1, 0.20346, 0.15875) on Android or Expo Go.
12. `buildInput` counts (sphere, dots, density 1, dotSize 1) at sizes 20 / 24 / 96 / 320: **80 / 96 / 384 / 1280**. For `background`: **20 / 24 / 96 / 320**. For `background-spiral`: **105 / 117 / 257 / 486**.
13. `rs` at 96 is **0.9183**; for `background` at 96 it is **1.8366**. `g` at 96 is **18** (background 9, background-spiral 14). Sphere `R` at 96 is **38.4**; other shapes at 96 are **46.08**.
14. Shape counts for `working` at 96: cube **386**, octahedron **402**, tetrahedron **394**, torus **374**. Mesh pairs at 96: **675**.
15. Deterministic `step()` checkpoints (size 96, sphere, dots, tilt 20, fresh `makeLocal`; `dots[0..3]` is `[px, py, r, a]`; tolerance 1e-3):
    - base, t = 0: dot0 **[50.769, 12.01, 1.321, 0.529]**; dot100 **[59.115, 41.706, 1.708, 0.959]**
    - working, t = 0: dot0 **[50.769, 12.01, 1.365, 0.555]**
    - working, t = 1000: dot0 **[46.726, 14.134, 1.091, 0.487]**; dot100 **[68.284, 24.135, 0.684, 0]**
    - compacting, t = 1000: dot0 **[50.241, 11.453, 1.296, 0.501]**
    - waiting, t = 3000: dot0 **[48.334, 11.069, 1.278, 0.241]**
    - searching, t = 900: dot0 **[50.512, 11.611, 1.303, 0.229]**
    - retrying, t = 2500: dot0 **[47.071, 11.117, 1.28, 0.484]**
    - base, torus, t = 0: dot0 **[91.776, 48, 1.102, 0.286]**
    - halftone, working, t = 0: g 18, cell 5.3333, **204** cells drawn, sum of radii **311.117**

    (These were computed by running the 9bef3b1 code itself. They check your port against the tree, not against live.)
16. Yaw lap at speed 1: base **6500 ms**; working **3000**; reasoning **6500**; searching, background, waiting and lighthouse **13000**; compacting **10000**. Retrying-surge makes 1 turn per **3250 ms**.
17. Effect cycles: working ring **1700 ms** (moving for 1200); compacting sweep **2800 ms**; lens hop **1800 ms**; lighthouse beam **2500 ms**; reasoning hop **220 ms**; waiting head **2000 ms**, latitude and glow **6000 ms**; gyro **5000 ms**; twist **2600 ms**.
18. `speed={2}` halves every period above in real time. `speed={0.05}` makes them 20× longer.
19. `tilt` changes the pitch on dots/crosses/dashes/squares/mesh, and has **no effect** on halftone, lines or verticalLines. Torus always adds **35°**.
20. `active={false}` freezes the last frame (no clock advance). Switching back resumes with a jump of at most 100 ms × speed.
21. Two orbs with the same look and speed stay phase-locked. Changing one's speed desyncs it (separate clock).
22. Changing look, shape, render, size, density or dotSize swaps the geometry on the next frame, with **no crossfade**.
23. With OS reduced motion on at launch, every orb is a still frame at t = 0, and no frame callback runs.
24. Unmounting an orb that has `onFrame` delivers a `data:image/png;base64,…` string.
25. When the route loses focus, the orb renders `null` and its canvas unmounts.
26. With `live` set, writing `live.value = {...live.value, tilt: -90}` changes the pitch on the next frame without a React render. Writing `size` through `live` alone does **not** change the drawing.

## 18. Forbidden
- Browsing, fetching or opening any URL, or asking anyone to.
- Changing `@shopify/react-native-skia` from 2.6.2, editing the patch so it no longer applies, or using `WithSkiaWeb` or a dynamic `import()` in the web entry.
- `setState` per frame; disposing a picture that's still on screen; more than 12 web canvases.
- Adding shaders, gradients, glow, blur, crossfades, easing curves or colours that aren't in §7–§12.
- Adding npm-only props (`paused`, `label`, `className`) or theme logic inside the orb.
- Claiming iOS or Android work without running them on a device.

## Appendices: verbatim source files from 9bef3b1e68b74186c5cc39b449873009fb8ec980

Every file below is byte-for-byte from the 9bef3b1 tree (bytes and sha256 given for each). Copy them exactly.

### Appendix 1: `src/orb/OrbView.tsx` (7132 B, sha256 `587e7464b61a7d9d7dba81f5c0ccde1036e2b2d73e0eac18900407a2ce74009d`)

````
import { Canvas, Picture, Skia, useCanvasRef, type SkPicture } from "@shopify/react-native-skia";
import { memo, useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useIsFocused } from "expo-router";
import { useFrameCallback, useReducedMotion, useSharedValue, runOnUI, type SharedValue } from "react-native-reanimated";

import { parseColor, toExtendedSrgb, toSrgb } from "../color/color";
import { tick } from "./clock";
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

type Props = {
  state: string;
  variant?: string;
  size: number;
  speed?: number;
  density?: number;
  dotSize?: number;
  tilt?: number;
  shape?: ShapeName;
  render?: RenderName;
  color: string;
  /** When false the canvas stays mounted but does not tick. */
  active?: boolean;
  /** Playground sliders write here. Landing orbs leave it unset. */
  live?: SharedValue<OrbLive>;
  /** Last rasterized frame, for a card that has scrolled its canvas away. */
  onFrame?: (uri: string) => void;
};

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

function LiveOrb({
  state,
  variant,
  size,
  speed = 1,
  density = 1,
  dotSize = 1,
  tilt = 20,
  shape = "sphere",
  render = "dots",
  color,
  active = true,
  live,
  onFrame,
}: Props) {
  const { picture, retire } = usePicture();
  const inputSV = useSharedValue<OrbInput | null>(null);
  const localSV = useSharedValue<OrbLocal | null>(null);
  const activeSV = useSharedValue(active);
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

  useEffect(() => {
    activeSV.value = active;
    if (!live) {
      fallback.value = { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    }
  }, [active, color, size, speed, density, dotSize, tilt, live, activeSV, fallback]);

  useFrameCallback((frame) => {
    "worklet";
    const input = inputSV.value;
    if (!input || !activeSV.value) return;
    const tune = live ? live.value : fallback.value;
    const look = `${input.state}@${tune.speed}`;
    const now = frame.timestamp;
    const t = tick(look, now, tune.speed);
    let local = localSV.value;
    if (!local || local.key !== input.key || local.dots.length !== input.count * 6) {
      local = makeLocal(input);
      localSV.value = local;
    }
    paint(picture, retire, input, local, tune, t);
  }, true);

  return <CanvasHost size={size} picture={picture} onFrame={onFrame} />;
}

function StillOrb({
  state,
  variant,
  size,
  speed = 1,
  density = 1,
  dotSize = 1,
  tilt = 20,
  shape = "sphere",
  render = "dots",
  color,
  live,
  onFrame,
}: Props) {
  const { picture, retire } = usePicture();
  const built = useMemo(
    () => buildInput({ state, variant, size, density, dotSize, shape, render }),
    [state, variant, size, density, dotSize, shape, render],
  );

  useEffect(() => {
    const tune: OrbLive = live
      ? live.value
      : { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    const input = built;
    runOnUI(() => {
      "worklet";
      paint(picture, retire, input, makeLocal(input), tune, 0);
    })();
  }, [built, color, density, dotSize, live, picture, retire, size, speed, tilt]);

  return <CanvasHost size={size} picture={picture} onFrame={onFrame} />;
}

export const OrbView = memo(function OrbView(props: Props) {
  const focused = useIsFocused();
  const reduced = useReducedMotion() === true;
  if (!focused) return null;
  if (reduced) return <StillOrb {...props} />;
  return <LiveOrb {...props} />;
});
````

### Appendix 2: `src/orb/model.ts` (5210 B, sha256 `9ef50c90d194eae6cf6da23048dd892589f135c114e6e3c40f0c2cbed74be7dd`)

````
/**
 * Point layout from @yogesharc/thinking-orbs 0.1.1 dist/orb-core.js and renders.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 */

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

export function lookId(state: string, variant?: string): string {
  return variant && variant !== "default" ? `${state}-${variant}` : state;
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
````

### Appendix 3: `src/orb/shapes.ts` (5288 B, sha256 `66a83710f294180c1a301f317747519f73d9c6c6314ad36e4d294c1edad35cce`)

````
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
````

### Appendix 4: `src/orb/simulate.ts` (13255 B, sha256 `1f0171b1fd26a776bcf4a5248b0b977c9257831c057007bf8076d4b81cc7e016`)

````
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

function yawOf(state: string, t: number) {
  "worklet";
  if (state === "retrying") return rewind(2 * t, TAU / 9000);
  if (state === "retrying-surge") {
    const turns = t / 3250;
    const u = turns - Math.floor(turns);
    return (Math.floor(turns) + (1 - (1 - u) ** 3)) * TAU;
  }
  return (t / PERIOD[state]) * TAU;
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
  const period = PERIOD[state];
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
````

### Appendix 5: `src/orb/draw.ts` (4279 B, sha256 `7d2285248fea2d544a6340d9a9e8d4454615766c765f243b639f0f3fd21cb788`)

````
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
````

### Appendix 6: `src/orb/clock.ts` (687 B, sha256 `62b73101293bbd0c02a08a759b5ed80d0e1ba0654a4f9f2ae979d93d3fdf0973`)

````
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
````

### Appendix 7: `src/orb/LICENSE` (1063 B, sha256 `1c87dcf3935109d8f8dfa2435aa71dfd28164a1f84d0b243030936fd2062ca57`)

````
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
````

### Appendix 8: `src/color/color.ts` (9459 B, sha256 `0994d34b4b4a6f4dab879febf1f2026b5900d3bd0558267235b59cb26741a1ac`)

````
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
function srgbToDisplayP3(rgb: number[]): number[] {
  return dot(M_SRGB_TO_P3, rgb.map(toLinear)).map(toGamma);
}

export function formatColor(color: Oklch, format: ColorFormat): string {
  const alpha = color.a < 1 ? ` / ${num(color.a)}` : "";
  if (format === "oklch") return `oklch(${num(color.l)} ${num(color.c)} ${num(color.h, 2)}${alpha})`;
  if (format === "p3") {
    const srgb = oklchToRgb(clampChroma(color, "srgb"), "srgb").map((v) => clamp(v));
    const p3 = srgbToDisplayP3(srgb);
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
````

### Appendix 9: `index.web.tsx` (820 B, sha256 `4868f56bb0d791a61f5c316d1f198f9d72b6008a0c63cfa2fdd03639e8b441e2`)

````
import type { ComponentType } from "react";
import "./src/headerLine.web";
import "./src/liveFaces.web";
import "@expo/metro-runtime";
import "react-native-gesture-handler";
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

type QualifiedEntry = { App: ComponentType };
type RootRenderer = { renderRootComponent: (app: ComponentType) => void };

// CanvasKit must exist before any Skia component module evaluates.
void LoadSkiaWeb({
  locateFile: () => "/canvaskit.wasm",
}).then(() => {
  // require, not import(): a dynamic import splits a chunk this static export never loads.
  const qualified: QualifiedEntry = require("expo-router/build/qualified-entry");
  const renderer: RootRenderer = require("expo-router/build/renderRootComponent");
  renderer.renderRootComponent(qualified.App);
});
````

### Appendix 10: `index.ts` (67 B, sha256 `7017161dc2899382015b20d9810a0d0804ef50b4bd532a6d1acff4b314ba44ba`)

````
import "react-native-gesture-handler";
import "expo-router/entry";
````

### Appendix 11: `scripts/copy-wasm.js` (449 B, sha256 `651caa1ff1b1cbef425c230e50ffb4a0c0b7902293911492cae08904b2ab7e1b`)

````
const fs = require("fs");
const path = require("path");

let src;
try {
  src = require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm");
} catch {
  console.log("canvaskit-wasm not installed yet; skip wasm copy");
  process.exit(0);
}
const destDir = path.join(__dirname, "..", "public");
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, "canvaskit.wasm"));
console.log("copied full canvaskit.wasm to public/");
````

### Appendix 12: `scripts/serve-dist.js` (1471 B, sha256 `f7fe30338757295102f502ae971b172ad885ec3d279ac985f2970566dbcefc47`)

````
const http = require("http");
const fs = require("fs");
const path = require("path");

require("./check-llms");

const root = path.join(__dirname, "..", "dist");
const port = Number(process.env.PORT || 4477);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  let file = path.normalize(path.join(root, decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  let stat = null;
  try {
    stat = fs.statSync(file);
  } catch {
    stat = null;
  }
  if (!stat || stat.isDirectory()) {
    if (path.extname(url.pathname)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    file = path.join(root, "index.html");
  }
  const ext = path.extname(file);
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`serving ${root} on http://127.0.0.1:${port}`);
});
````

### Appendix 13: `patches/@shopify+react-native-skia+2.6.2.patch` (7164 B, sha256 `0c0ef5ac4749bbdf2dc66d69c953a73667eaba67a3f2db679df9ba14904468a6`)

````
diff --git a/node_modules/@shopify/react-native-skia/cpp/api/JsiSkPaint.h b/node_modules/@shopify/react-native-skia/cpp/api/JsiSkPaint.h
index 61ad36a..b90fa44 100644
--- a/node_modules/@shopify/react-native-skia/cpp/api/JsiSkPaint.h
+++ b/node_modules/@shopify/react-native-skia/cpp/api/JsiSkPaint.h
@@ -73,6 +73,40 @@ public:
   }
 
   JSI_HOST_FUNCTION(setColor) {
+    // Float colours are extended-sRGB Color4f. Components outside 0–1 must
+    // survive so iOS can paint Display P3 picks; Skia converts sRGB onto a
+    // P3 surface. The 8-bit SkColor path turns any component above 1 black.
+    if (arguments[0].isObject()) {
+      const auto &object = arguments[0].asObject(runtime);
+      float r = 0, g = 0, b = 0, a = 1;
+      bool ok = false;
+      if (object.isArray(runtime)) {
+        auto array = object.asArray(runtime);
+        if (array.size(runtime) == 4) {
+          r = static_cast<float>(array.getValueAtIndex(runtime, 0).asNumber());
+          g = static_cast<float>(array.getValueAtIndex(runtime, 1).asNumber());
+          b = static_cast<float>(array.getValueAtIndex(runtime, 2).asNumber());
+          a = static_cast<float>(array.getValueAtIndex(runtime, 3).asNumber());
+          ok = true;
+        }
+      } else {
+        auto bufferValue = object.getProperty(
+            runtime, jsi::PropNameID::forAscii(runtime, "buffer"));
+        if (bufferValue.isObject()) {
+          auto buffer = bufferValue.asObject(runtime).getArrayBuffer(runtime);
+          auto bfrPtr = reinterpret_cast<const float *>(buffer.data(runtime));
+          r = bfrPtr[0];
+          g = bfrPtr[1];
+          b = bfrPtr[2];
+          a = bfrPtr[3];
+          ok = true;
+        }
+      }
+      if (ok) {
+        getObject()->setColor4f(SkColor4f{r, g, b, a}, nullptr);
+        return jsi::Value::undefined();
+      }
+    }
     SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
     getObject()->setColor(color);
     return jsi::Value::undefined();
diff --git a/node_modules/@shopify/react-native-skia/lib/commonjs/views/SkiaPictureView.web.js b/node_modules/@shopify/react-native-skia/lib/commonjs/views/SkiaPictureView.web.js
index 5626d78..e896b1f 100644
--- a/node_modules/@shopify/react-native-skia/lib/commonjs/views/SkiaPictureView.web.js
+++ b/node_modules/@shopify/react-native-skia/lib/commonjs/views/SkiaPictureView.web.js
@@ -24,6 +24,10 @@ const dp2Pixel = (pd, rect) => {
     height: rect.height * pd
   };
 };
+function webglSurfaceColorSpace() {
+  const p3 = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(color-gamut: p3)").matches;
+  return p3 ? CanvasKit.ColorSpace.DISPLAY_P3 : CanvasKit.ColorSpace.SRGB;
+}
 class WebGLRenderer {
   constructor(canvas, pd) {
     this.canvas = canvas;
@@ -48,7 +52,7 @@ class WebGLRenderer {
     } = this;
     canvas.width = canvas.clientWidth * pd;
     canvas.height = canvas.clientHeight * pd;
-    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
+    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas, webglSurfaceColorSpace());
     const ctx = canvas.getContext("webgl2");
     if (ctx) {
       ctx.drawingBufferColorSpace = "display-p3";
@@ -91,7 +95,7 @@ class StaticWebGLRenderer {
     const tempCanvas = new OffscreenCanvas(this.canvas.clientWidth * this.pd, this.canvas.clientHeight * this.pd);
     let surface = null;
     try {
-      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas);
+      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas, webglSurfaceColorSpace());
       const ctx = tempCanvas.getContext("webgl2");
       if (ctx) {
         ctx.drawingBufferColorSpace = "display-p3";
diff --git a/node_modules/@shopify/react-native-skia/lib/module/views/SkiaPictureView.web.js b/node_modules/@shopify/react-native-skia/lib/module/views/SkiaPictureView.web.js
index 7318000..614497a 100644
--- a/node_modules/@shopify/react-native-skia/lib/module/views/SkiaPictureView.web.js
+++ b/node_modules/@shopify/react-native-skia/lib/module/views/SkiaPictureView.web.js
@@ -18,6 +18,10 @@ const dp2Pixel = (pd, rect) => {
     height: rect.height * pd
   };
 };
+function webglSurfaceColorSpace() {
+  const p3 = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(color-gamut: p3)").matches;
+  return p3 ? CanvasKit.ColorSpace.DISPLAY_P3 : CanvasKit.ColorSpace.SRGB;
+}
 class WebGLRenderer {
   constructor(canvas, pd) {
     this.canvas = canvas;
@@ -42,7 +46,7 @@ class WebGLRenderer {
     } = this;
     canvas.width = canvas.clientWidth * pd;
     canvas.height = canvas.clientHeight * pd;
-    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
+    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas, webglSurfaceColorSpace());
     const ctx = canvas.getContext("webgl2");
     if (ctx) {
       ctx.drawingBufferColorSpace = "display-p3";
@@ -85,7 +89,7 @@ class StaticWebGLRenderer {
     const tempCanvas = new OffscreenCanvas(this.canvas.clientWidth * this.pd, this.canvas.clientHeight * this.pd);
     let surface = null;
     try {
-      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas);
+      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas, webglSurfaceColorSpace());
       const ctx = tempCanvas.getContext("webgl2");
       if (ctx) {
         ctx.drawingBufferColorSpace = "display-p3";
diff --git a/node_modules/@shopify/react-native-skia/src/views/SkiaPictureView.web.tsx b/node_modules/@shopify/react-native-skia/src/views/SkiaPictureView.web.tsx
index 919762a..d8b63d8 100644
--- a/node_modules/@shopify/react-native-skia/src/views/SkiaPictureView.web.tsx
+++ b/node_modules/@shopify/react-native-skia/src/views/SkiaPictureView.web.tsx
@@ -34,6 +34,15 @@ interface Renderer {
   dispose(): void;
 }
 
+/** P3 surface only when the display is P3, so Skia converts sRGB paints. */
+function webglSurfaceColorSpace() {
+  const p3 =
+    typeof window !== "undefined" &&
+    typeof window.matchMedia === "function" &&
+    window.matchMedia("(color-gamut: p3)").matches;
+  return p3 ? CanvasKit.ColorSpace.DISPLAY_P3 : CanvasKit.ColorSpace.SRGB;
+}
+
 class WebGLRenderer implements Renderer {
   private surface: JsiSkSurface | null = null;
 
@@ -59,7 +68,7 @@ class WebGLRenderer implements Renderer {
     const { canvas, pd } = this;
     canvas.width = canvas.clientWidth * pd;
     canvas.height = canvas.clientHeight * pd;
-    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
+    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas, webglSurfaceColorSpace());
     const ctx = canvas.getContext("webgl2");
     if (ctx) {
       ctx.drawingBufferColorSpace = "display-p3";
@@ -117,7 +126,7 @@ class StaticWebGLRenderer implements Renderer {
     let surface: JsiSkSurface | null = null;
 
     try {
-      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas);
+      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas, webglSurfaceColorSpace());
       const ctx = tempCanvas.getContext("webgl2");
       if (ctx) {
         ctx.drawingBufferColorSpace = "display-p3";
````

### Appendix 14: `package.json` (1262 B, sha256 `aba853970513ffb77ee1adb4d0349e83eccfe230f17e2484d48bbcf6e3a760f4`)

````
{
  "name": "thinking-orbs",
  "version": "1.0.0",
  "private": true,
  "main": "index",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "postinstall": "patch-package && node scripts/copy-wasm.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@expo-google-fonts/geist": "^0.4.2",
    "@expo-google-fonts/geist-mono": "^0.4.3",
    "@shopify/react-native-skia": "2.6.2",
    "babel-preset-expo": "~57.0.0",
    "expo": "~57.0.26",
    "expo-clipboard": "~57.0.2",
    "expo-constants": "~57.0.20",
    "expo-font": "~57.0.4",
    "expo-linear-gradient": "~57.0.2",
    "expo-linking": "~57.0.11",
    "expo-router": "~57.0.24",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-svg": "15.15.4",
    "react-native-web": "^0.21.2",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "patch-package": "^8.0.1",
    "typescript": "~6.0.3"
  }
}
````

### Appendix 15: `babel.config.js` (108 B, sha256 `08c3fbd0e55deb1e580dd631673c8e4f1d838836d4afd9daaf92c668dc7abee0`)

````
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
````

### Appendix 16: `tsconfig.json` (163 B, sha256 `235d4c6b3d7f937c006aa290f9cb1c3e10a0a6213ef9713482af8acebe4fb567`)

````
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
````
