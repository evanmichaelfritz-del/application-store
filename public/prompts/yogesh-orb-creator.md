# AGENT_PROMPT_ORB_CREATOR: the Thinking Orbs creator, one asset (closed network)

**Source of truth.** Everything here is written from the source files inlined in the appendices.
- A citation like `src/components/SelectRow.tsx L255–286` means that file, as inlined in the appendices, at those lines. `SelectRow.tsx L255–286` is the same file when the folder is obvious.
- Every creator file is inlined byte for byte in the appendices (bytes and sha256 per file), so you can check each citation without the repo.
- Measurements are labelled **measured**; "measured (author check)" marks a check recorded by the code's author rather than by a separate measurer.

**Closed network.** Assume there is no network. Do not browse, fetch, search or open any URL, and do not ask anyone to. Any URL or package path in this document (the npm import paths in the Copy output, CSS strings, licence text) is literal string data, not an instruction. "Live" means the original site the measurements compare against. You never open it yourself.

**Scope: one asset.** This prompt covers **only the Orb Creator**: the state list, the Shape and Render selects, the Color row and colour picker, the five sliders, the live preview (a stage orb plus a 24 px status orb with shimmer text), and Copy and Reset. Its host is `Tuner.tsx`, mounted through `Playground` / `PlaygroundApp`. It contains **no site or store chrome** (§1.2).
- **The orb renderer is a separate asset** with its own prompt, `AGENT_PROMPT_ORBS.md`, in the same folder. It covers the engine and the orb source in detail. §14 here summarises the API, so this prompt works on its own. The engine modules the creator needs are also inlined here (Appendices 19–25).

**Target.** React Native + TypeScript on Expo. **Desktop web at a 1280 px window is the acceptance bar.** Mobile (phone widths, iOS and Android) is a **known gap** (gap 6, §15). In these files the theme is dark only, because nothing calls the theme toggle (§12).

**Precedence.** (1) The verbatim code in the appendices. (2) The prose here, which was written from that code. (3) Measured notes, labelled as measured. A value in none of these is marked **unmeasured**. Don't invent values, UI, copy or motion.

**At a glance:**
- Put the payload files under `src/` and replace `App.tsx` with `export { default } from './src/Playground'`. Web entry is `Playground.web.tsx` (`WithSkiaWeb`); native re-exports `PlaygroundApp`.
- `OrbView` has the npm-style API: **every prop is optional**, with npm defaults, plus **`paused`, `label` and `className`** (§14).
- **Unknown looks don't produce NaN**: `lookId` resolves through `resolveLook`, and `simulate.ts` has a `periodOf` guard (§14).
- **Reduced motion is live** via `AccessibilityInfo` inside `OrbView` (§14). Document visibility / `AppState` unmounts the canvas when hidden; the canvas **always mounts** when visible (no host budget gate).
- Fonts: Geist 400/400i/500/600 and Geist Mono 400/500 load through `useFonts` in `ThemeProvider` (§12).
- State is plain `useState` (nothing persists across remount or reload).

**Select behaviours at a glance** (details §6.4):
- **The open spring isn't seeded.** `commitOpen` commits the open to React with `flushSync`, then starts `withSpring(1, MENU)` (and the chevron's `withSpring(1, CHEV)`) in the next `requestAnimationFrame`, from whatever `shown` holds. There is no plateau. Measured (author check): first opacity write 0.069–0.099 at 21–24 ms, 0.99 at 204–207 ms (`SelectRow.tsx` L255–286).
- **Frame handles.** The open and close frame ids (`openFrame`, `closeFrame`) are cancelled on reopen, dismiss/seal and unmount; the open frame also checks `openSV === 1` (L131–146, L256, L279–285, L382–393).
- **`openRef` is written synchronously:** `true` in `commitOpen`, `false` as soon as a close is requested (`requestClose`) (L125, L133–136, L258).
- **Generations.** `epoch` is bumped on every open and on every `requestClose()` (outside dismiss, the Escape seal, a commit, an option pick). The deferred close is generation-checked, so a superseded close does nothing (L127–128, L155–162, L287–295).
- **Reopen.** If a close toggle was already delivered but React is still open, the reopen counters it; if React has already committed closed, the reopen toggles it open again (L259–275, L337–343).
- **Seal.** `unseal()` removes both `inert` and `aria-hidden` (L209–213). On the already-open branch, `focusSelected()` makes the selected option the only element with `tabIndex` 0 and focuses it (L247–254, L276).
- **Focus once:** `commitOpen` calls `focusSelected()` only when it didn't just `flushSync`, because the open layout effect already focuses (L276, L367–370).
- **Trigger hover** is CSS: a `.15s ease` background transition on every trigger and a dark closed-trigger `:hover` rule through `data-orb-trigger` (L61–62, L559). There is no hover state and no pointer-enter/leave handler.
- **Spring configs:** `MENU` 1218/69.8/1, `CHEV` 685/44.5/1, `CLOSE_MENU` (MENU + `energyThreshold 1.8e-7`), `OUTSIDE_CLOSE_EVENT` (L86–90).
- **`onToggle` must use a functional state update** (`setMenu((current) => (current === X ? null : X))`, as `Tuner.tsx` does at L139–142 and L154–157), because the closure form loses the reopen with this `SelectRow` (§6.1).

## 1. Scope

### 1.1 In scope (creator payload files, all under `src/`)
| File | Lines | Role | Appendix |
|---|---|---|---|
| `Playground.web.tsx` | 16 | web entry: side effects + `WithSkiaWeb` + `locateFile` | 1 |
| `Playground.tsx` | 2 | native re-export of `PlaygroundApp` | 2 |
| `PlaygroundApp.tsx` | 24 | `GestureHandlerRootView` › `SafeAreaProvider` › `ThemeProvider` › `Tuner` | 3 |
| `Tuner.tsx` | 453 | the creator: state, layout, wiring, Copy/Reset | 4 |
| `orb/OrbView.tsx` | 330 | the orb component (same text as the Thinking Orbs payload) | 5 |
| `components/ColorPicker.tsx` | 101 | native stand-in (a stub; gap 2) | 6 |
| `components/ColorPicker.web.tsx` | 637 | the Color row and picker popover (web) | 7 |
| `components/SelectRow.tsx` | 640 | the Shape and Render selects | 8 |
| `components/SliderRow.tsx` | 416 | the five sliders; writes the `live` SharedValue | 9 |
| `components/Shimmer.tsx` | 60 | native status text (Skia mask; per-weight Geist) | 10 |
| `components/Shimmer.web.tsx` | 46 | web status text (CSS sweep) | 11 |
| `components/icons.tsx` | 46 | `Chevron` (also exports unused icons) | 12 |
| `theme/theme.tsx` | 163 | palette, fonts, `ThemeProvider`, `useFonts` | 13 |
| `content/snippet.ts` | 51 | the Copy output | 14 |
| `content/cards.ts` | 180 | `PLAYGROUND` looks, labels, status text | 15 |
| `color/color.ts` | 238 | parse/format/gamut helpers | 16 |
| `hooks/useArrowKeys.ts` / `.web.ts` | 2 / 23 | ↑/↓ cycles the state list (web) / native no-op | 17 / 18 |
| `orb/clock.ts` … `orb/LICENSE` | | engine modules the creator imports | 19–25 |

Appendix 0 is the dependency header shared by all three payload files.

### 1.2 Excluded
- **Store chrome:** card frame, catalog, lazy Skia loader, canvas budget, Copy/prompt buttons, store shell. §17 says what the payload already provides instead.
- **Thinking Orbs host** (`Showcase.tsx`, `ThinkingOrbs*`) is covered in `AGENT_PROMPT_ORBS.md`.
- `orbProps.check.ts` is **not shipped**. The unknown-look / NaN guard lives in the inlined `orbProps.ts` / `simulate.ts`; an author check reports the pasted engine's unknown-look check prints `orb props ok`.

### 1.3 Standalone deviations (payload vs store asset)

Neutral asset terms only. Line numbers are the inlined payload module.

| Payload module | Byte-exact vs store | Deviations |
|---|---|---|
| `Playground.web.tsx` / `Playground.tsx` / `PlaygroundApp.tsx` | new | Web entry (`WithSkiaWeb`, `locateFile`); native re-export; providers around `Tuner`. |
| `Tuner.tsx` | no | No card-field helper. `Tuner.tsx` L50 and L54–61 are `useState` with the same defaults (index 1, sphere, dots, size 320, speed 1, density 1, dotSize 1, tilt 20, exact null). |
| `OrbView.tsx` | no | L2–3: no route-focus helper, no reduced-motion context, no host-budget hook. L99–117: document visibility / `AppState`. L118–132: `AccessibilityInfo` reduced motion (live-subscribed; initial `false` until the promise resolves). L326–329: returns `null` when not active; otherwise always mounts `OrbCanvas` with `active={props.active !== false}`. |
| `ColorPicker.tsx` / `.web.tsx`, `SelectRow.tsx`, `SliderRow.tsx`, `Shimmer.web.tsx`, `icons.tsx` | yes | |
| `Shimmer.tsx` | no | L1, L21: `Geist_400Regular` from `@expo-google-fonts/geist/400Regular` (no binary font file). |
| `theme.tsx` | no | L1–8: per-weight Geist / Geist Mono imports + `useFonts`. L120–130: registers faces including CSS names `Geist` and `Geist Mono`. L131–132: mode and playground colour in `useState`. No card id, no route reset. |
| Engine modules (snippet, cards, color, hooks, clock, model, shapes, simulate, draw, orbProps, LICENSE) | yes | |

`SelectRow.tsx` is 24399 bytes, sha256 prefix `e871d315`.

## 2. Dependencies and setup (the dependency header; Appendix 0)

### 2.1 The dependency header (verbatim)
Every payload file starts with this comment. It is the whole dependency specification:

```ts
/* Dependencies. Install only these, then run `npx setup-skia-web public`.
 * Web loads CanvasKit itself. No custom index.html.
 * locateFile: (file) => `/${file}` assumes the site root. A sub-path host must change that prefix.
 * Babel: plugins: ['react-native-worklets/plugin']
 * Mount: put these files under src/ and replace App.tsx with `export { default } from './src/Playground'`.
 * expo ~57.0.23
 * react 19.2.3
 * react-dom 19.2.3
 * react-native 0.86.3
 * react-native-web ~0.21.0
 * @shopify/react-native-skia 2.6.2
 * react-native-reanimated 4.5.1
 * react-native-worklets 0.10.1
 * react-native-gesture-handler ~2.32.0
 * react-native-svg 15.15.4
 * expo-constants ~57.0.18
 * expo-clipboard ~57.0.2
 * react-native-safe-area-context ~5.7.0
 * @expo-google-fonts/geist ^0.4.2
 * @expo-google-fonts/geist-mono ^0.4.3
 * @types/react-dom ~19.2.2 (dev)
 */
```

| Package (spec) | What the creator uses it for |
|---|---|
| `react-native-gesture-handler` `~2.32.0` | side-effect import first (`Playground.web.tsx` L1, `PlaygroundApp.tsx` L1); `GestureHandlerRootView` (`PlaygroundApp.tsx` L4, L12); `ScrollView` (`Tuner.tsx` L4); gestures in selects/sliders |
| `react-native-reanimated` `4.5.1` / `react-native-worklets` `0.10.1` | springs, `useSharedValue`, `useFrameCallback`, `useReducedMotion` in Shimmer; worklets Babel plugin |
| `@shopify/react-native-skia` `2.6.2` (exact) | orbs; native Shimmer; `WithSkiaWeb` (`Playground.web.tsx` L3) |
| `expo-clipboard` `~57.0.2` | `setStringAsync` (Copy, `Tuner.tsx` L1, L117) |
| `react-native-safe-area-context` `~5.7.0` | `SafeAreaProvider` (`PlaygroundApp.tsx` L5, L13); `useSafeAreaInsets` (`Tuner.tsx` L5, L47) |
| `react-native-svg` `15.15.4` | native `Chevron` (`icons.tsx`) |
| `expo-constants` `~57.0.18` | Expo Go colour clamp (`OrbView.tsx` L4, L44–48) |
| `@expo-google-fonts/geist` `^0.4.2` / `@expo-google-fonts/geist-mono` `^0.4.3` | per-weight faces in `theme.tsx` L1–6; native Shimmer L1; also `useFonts` in `SliderRow.tsx` L76 and `ColorPicker.web.tsx` L173 for Geist Mono 500 |
| `react-dom` `19.2.3` / `@types/react-dom` `~19.2.2` | `flushSync` / `createPortal` in SelectRow and ColorPicker.web; types for web |
| `expo` / `react` / `react-native` / `react-native-web` | SDK, React, web |

- **No expo-router.** No payload file imports it.
- **`expo-font`:** `theme.tsx` L7 imports `useFonts` from `expo-font`. It is **not** listed in the header. It resolves through `expo`'s own dependencies in a fresh blank Expo app (author check: `tsc` exited 0). Treat the header pins as the install list; flag `expo-font` as **unverified** if your install does not pull it.
- **Install:** put exactly the header packages at the header specs, then run `npx setup-skia-web public`. If a package isn't available locally, stop and report it. Don't change the Skia version.

### 2.2 Wasm and web boot
- `npx setup-skia-web public` copies `canvaskit-wasm`'s full wasm to `public/canvaskit.wasm`. An Expo web export places it at the dist root, `/canvaskit.wasm`. Serve it as **`application/wasm`**.
- For canvaskit-wasm 0.41.0 that file was recorded at **8,076,553 B**, sha256 `eb68c7a7f602d8cb89915352c4471a2d26edfd72000f78202cb1fe32ce1f9dc4`, on an earlier build with the same Skia package version. It has **not** been re-measured for these files.
- **Web entry** (`Playground.web.tsx` L1–16): gesture-handler and reanimated side effects, then `WithSkiaWeb` with `getComponent={() => import("./PlaygroundApp")}`, a black flex-1 fallback, and `opts={{ locateFile: (file) => \`/${file}\` }}`. That `locateFile` assumes the **site root**. A sub-path host must change that prefix (header note).
- **Native** (`Playground.tsx`): re-exports `PlaygroundScreen` and default from `PlaygroundApp`.
- **Providers** (`PlaygroundApp.tsx` L10–22): `GestureHandlerRootView` › `SafeAreaProvider` › black flex-1 `View` › `ThemeProvider` › `Tuner`. No reduced-motion provider and no router — `OrbView` reads those itself.

### 2.3 Mount
Replace `App.tsx` with:
```ts
export { default } from './src/Playground';
```

## 3. State model (`Tuner.tsx` L45–100; `theme/theme.tsx` L120–148)

| State | Type | Initial | Store | Cite |
|---|---|---|---|---|
| `index` | number (into `PLAYGROUND`, 15 items) | **1** (Working) | React `useState` | L50 |
| `shape` | `ShapeName` | `"sphere"` | React `useState` | L54 |
| `render` | `RenderName` | `"dots"` | React `useState` | L55 |
| `size` | number | **320** | React `useState` | L56 |
| `speed` | number | **1** | React `useState` | L57 |
| `density` | number | **1** | React `useState` | L58 |
| `dotSize` | number | **1** | React `useState` | L59 |
| `tilt` | number | **20** | React `useState` | L60 |
| `exact` | `{ color: Oklch; text: string } \| null` | `null` | React `useState`. The picker's exact OKLCH for the current text, so P3/OKLCH picks aren't re-parsed lossily | L61 |
| `menu` | `null \| 'shape' \| 'render'` | `null` | React `useState` | L62 |
| `picker` | boolean | `false` | React `useState` | L63 |
| `copied` | boolean | `false` | React `useState` | L64 |
| `playgroundColor` | string (CSS colour text) | `dark.orb` = **`#ffffff`** | theme context `useState` | `theme.tsx` L132 |
| `mode` | `"dark" \| "light"` | `"dark"` | theme `useState` | `theme.tsx` L131 |

- **Nothing persists.** All creator fields are plain `useState`. Remounting `Tuner` or reloading the page resets to the defaults above. **Measured: neither live nor ours keeps anything across a reload.**
- The host is `PlaygroundApp`, which wraps `Tuner` in `<ThemeProvider>` with no card id (`PlaygroundApp.tsx` L16–18).
- **Select state** lives inside each `SelectRow`, not in `Tuner`: the shared values `shown`, `chevron`, `openSV`, `goal`, `aboveSV`, `primary` and the refs `openRef` (requested open state, written synchronously), `committedOpen`, `epoch` / `appliedEpoch` (open/close generations), `closeDelivered`, `armed`, `openFrame` / `closeFrame` (pending animation-frame ids), `focusOnOpen` and `typed`. `Tuner` only owns `menu`. See §6.4.1 for the full table (`SelectRow.tsx` L115–136).
- **Refs:** `timer` (the Copied timeout), `alive` (unmount guard, L65–66, cleared at L84–90), `wasFlat` (Tilt reset, L67), `sliding` (drag flag, L82).

**Derived values:**
- `look = PLAYGROUND[index]` (L53); `flat = isFlat(render)` (L68); `wide = width >= 1280`, with `width` = the **window** width (L46–48); `phone = width < 768` (L69).
- `headerH = width >= 768 ? 48 : 72`; `maxOrb = max(96, height − headerH − 120)`; `shown = min(size, wide ? maxOrb : min(maxOrb, max(96, width − 32)))` (L70–72).
- `parsed` = `exact.color` if `exact.text === playgroundColor`, else `parseColor(playgroundColor)`, else `{ l: 1, c: 0, h: 0, a: 1 }` (L73–75).
- `rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed)` (L76).
- `remember(color, text)` sets `exact` and `playgroundColor` together (L77–80). The picker uses it.

**Effects:**
- **Tilt reset:** when `flat` goes from true to false, `setTilt(20)` (L92–95).
- **Live sync:** unless `sliding.current`, `live.value = { size: shown, speed, density, dotSize, tilt, ...rgba }` on any change (L97–100).
- **Copy timer:** cleared on unmount (L84–90).

**Theme rules** (`theme.tsx` L120–148):
- **No route reset.** Mode and playground colour are local `useState` only.
- **`toggle`** (L137–142): swaps the default colour if the current colour is the current mode's default, then flips the mode. **No component in these files calls `toggle`**, so the creator is dark only.
- **Note:** the `Tuner.tsx` doc comment (L20–24) says "Layout width is the card", but the code reads the window width (L46–48). Reproduce the code.

## 4. Layout (`Tuner.tsx` L127–453)

### 4.1 Branches
- `wide` (window width ≥ 1280): a three-column row. **This is the acceptance target.**
- Otherwise a `ScrollView` stack (768–1279 and phone < 768). **Mobile is a known gap** (gap 6). The narrow branch is described only so the code stays complete.

### 4.2 Wide (≥ 1280)
**Root** (L414–418): `testID="yogesh-orb-tuner"`, width 100%, bg `colors.page` (#000000), `minHeight: max(560, shown + 160)`. Children:
1. `menu && Platform.OS !== 'web'` → a full-size transparent `Pressable` (zIndex 4) that closes the menu. **Native only; web has no backdrop** (L419–424).
2. The **row** (L426): `minHeight max(520, shown + 120)`, `flexDirection row`, `alignItems stretch`, paddingLeft **32**, paddingRight **42**, zIndex **5**. It holds, in order:
   - **List column** (L427): `alignSelf center`, marginBottom **8**. The list is 280 wide (§5).
   - **Stage** (L342–374): `testID="yogesh-orb-stage"`, `flex 1`, `minHeight 0`, padding 0, centred. Inner wrapper `marginRight 24` (L358) › `OrbView size={shown}` with all the tuning plus `live` (L359–371). Web: `aria-hidden` (and hidden descendants). Native: label "Orb playground" (L345–348).
   - **Panel column** (L429): `alignSelf center` › panel (L127–132): `testID="yogesh-orb-panel"`, web `role="complementary"`, width **256**, gap **6**, zIndex **5**.
3. The **status line** (L450, defined L376–412): `testID="yogesh-orb-status"`, pointerEvents none, `position absolute`, `left 0`, `right 0`, `bottom 22 + insets.bottom`, zIndex **6**, row, centred, gap **8**, `transform translateX(−4.6)`. It is centred on the **root's** width.

**Orb size at a 1280×800 window:** `maxOrb = max(96, 800 − 48 − 120) = 632` (the formula keeps `headerH = 48` at ≥ 768 even though no header is rendered), so `shown = size` across the whole slider range 16–480. Default `shown` = **320**.

### 4.3 Derived geometry for a 1280 px wide host container at a 1280×800 window (computed from the code; NOT measured; a check, not a target)
| Element | Derived | Basis |
|---|---|---|
| Root height | `max(560, 320 + 160)` = **560** | L417 |
| Row height | at least `max(520, 440)` = **520** | L426 |
| List | x 32–312 | paddingLeft 32, width 280 |
| Panel | x 982–1238 (w 256) | paddingRight 42 |
| Stage | x 312–982 (w 670); orb wrapper marginRight 24 | flex 1 |
| Panel height, Tilt shown | 8 rows × 36 + 8 gaps × 6 + marginTop 10 + Copy row 20 = **366** | L131, L249; row heights 36 |
| Panel height, flat render | 7 × 36 + 7 × 6 + 10 + 20 = **324** | Tilt removed (L233) |
| Row pitch | **42** (36 + gap 6) | L131 |
| Status line | bottom edge 22 px above the root's bottom; centred, then −4.6 px | L386, L392 |

Inside the store the host container is the store's card, whose width is store chrome. If your container isn't 1280 wide, the x values shift; the paddings, widths and gaps don't.

### 4.4 Narrow (< 1280; mobile known gap) (L431–449)
- A `ScrollView` (react-native-gesture-handler), zIndex 5, paddingLeft and paddingRight 16. paddingTop is 24 under 768, else 0. paddingBottom is (24 under 768, else 32) + inset.
- Order: list (wrapping row, no hint), then stage, then the status line, then the panel (marginTop 24 on phone, 20 otherwise; panel width 100%).
- Stage: phone `minHeight 0.6·windowH`, padding 32, marginTop 24; 768–1279 `minHeight shown`.
- Status line: phone overlays it absolutely at `bottom 24` inside the stage wrapper (L444), with Shimmer `lineHeight 20` (L410); 768–1279 puts it in flow.

## 5. State list (`Tuner.tsx` L286–340; `content/cards.ts` L135–151; `hooks/useArrowKeys.web.ts`)

**Order** (`PLAYGROUND`, `cards.ts` L135–151; the `Look` type is L4–15).

| # | Label (`playground`) | state | variant | Status text (`status`, verbatim) |
|---|---|---|---|---|
| 0 | Base | base | – | "Working" |
| 1 | Working **(default)** | working | – | "Working" |
| 2 | Working · Gyro | working | gyro | "Working" |
| 3 | Reasoning | reasoning | – | "Thinking" |
| 4 | Reasoning · Twins | reasoning | twins | "Thinking" |
| 5 | Searching | searching | – | "Searching web" |
| 6 | Searching · Lighthouse | searching | lighthouse | "Searching files" |
| 7 | Background | background | – | "1 Background Task" |
| 8 | Background · Spiral | background | spiral | "2 Background Tasks" |
| 9 | Retrying | retrying | – | "Retrying — attempt 2 of 10" |
| 10 | Retrying · Surge | retrying | surge | "Retrying — attempt 3 of 10" |
| 11 | Compacting | compacting | – | "Compacting context" |
| 12 | Compacting · Squeeze | compacting | squeeze | "Compacting context" |
| 13 | Compacting · Fuse | compacting | fuse | "Compacting context" |
| 14 | Waiting | waiting | – | "Waiting for usage limit to reset" |

The `—` is an em dash (U+2014). The `·` is U+00B7.

- **Wrapper** (L287–292): `testID="yogesh-orb-states"`, `role="navigation"`, `accessibilityLabel="States"`, width **280** (wide) or 100%, `justifyContent center`.
- **List** (L293–301): web `role="list"`; column + nowrap (wide) or row + wrap; columnGap 16, rowGap **8**, so the wide pitch is **28 px** (20 + 8).
- **Item, web** (L304–317): `View role="listitem"` › `Pressable accessibilityRole="button"`, `aria-current="true"` when selected, `onPress → setIndex(i)`, `hitSlop {top: 12, bottom: 12}`, height **20**, `justifyContent center` › `Text` in `fonts.regular` **14/20**, `colors.fg` (#fafafa) when selected, else `colors.muted` (#a1a1a1). The colour swaps instantly.
- **Item, native** (L318–331): the same Pressable, without the listitem wrapper.
- **Hint** (wide only, L334–338): "↑ ↓ to switch", `fonts.regular` **12/16**, muted, marginTop **24**, marginBottom **−8**.
- **Keyboard** (`useArrowKeys.web.ts` L4–23): a `window` keydown listener. ArrowDown → `(i + 1) % 15`, ArrowUp → `(i − 1 + 15) % 15`, wrapping, with `preventDefault()`. It is ignored when the target is inside `input, textarea, select, [contenteditable='true'], [role='slider'], [data-arrow-keys='own']` (L11): the Color value, the CSS input and the Hue/Opacity ranges are inputs, and the sliders have role slider.
  - **Code note:** a focused select trigger or option stops ArrowUp/ArrowDown propagation in its own handlers (`SelectRow.tsx` L469–472, L497–499). The page listener is on `window`, so those keys don't reach it while a select has focus.
- **Changing the look** changes `state`/`variant` on both orbs and remounts the Shimmer (`key={index}`, L410), which restarts its sweep. The orb's look change has no transition (`AGENT_PROMPT_ORBS.md` §9).
- Known gaps 9–11 apply to this list (§15).

## 6. Selects: Shape and Render (`components/SelectRow.tsx`, Appendix 2; wired at `Tuner.tsx` L133–162)

### 6.1 Options and wiring
- **Shape** (`Tuner.tsx` L26–32): `sphere` Sphere, `cube` Cube, `octahedron` Octahedron, `tetrahedron` Tetrahedron, `torus` Torus. Default sphere; `display` falls back to "Sphere" (L136). Five options, so `place()` uses a menu height of `8 + 5·36 = 188`.
- **Render** (`RENDERS` from `orb/model.ts` L11–20; labels `RENDER_LABEL` at `Tuner.tsx` L34–43): `dots` Dots, `crosses` Crosses, `dashes` Dashes, `halftone` Halftone, `lines` Lines, `mesh` Mesh, `squares` Squares, `verticalLines` Vertical Lines. Default dots. Eight options, so the menu height is `8 + 8·36 = 296`.
- **Flat renders** (`isFlat`, `model.ts` L28–30): halftone, lines and verticalLines. They remove the Tilt row (`Tuner.tsx` L233) and drop `tilt` from Copy.
- **Props:** `SelectRow<T>({ label, value, options, open, onToggle, onPick, display })` (L92–108).
  - `open` is `menu === 'shape'` or `menu === 'render'`.
  - `onToggle`: `setPicker(false); setMenu((current) => (current === X ? null : X))`, a functional update (L139–142, L154–157). Opening a select closes the picker and the other select. `onToggle` must use a functional state update, because the closure form (computing the next value from the `menu` captured at render) loses the reopen with the current `SelectRow`.
  - `onPick(id)`: `setX(id); setMenu(null)`.

### 6.2 Trigger (L551–589)
- **Outer wrapper:** `View ref=rowRef onLayout=place`, `zIndex open ? 20 : 1` (L552).
- **Gesture and a11y:** `GestureDetector gesture={tap} touchAction="pan-y"` wraps a plain `View` with:
  - `accessible`, `accessibilityRole="button"`, `collapsable={false}`;
  - `dataSet={{ orbTrigger: mode }}` on every platform; on web it renders `data-orb-trigger="dark"` (or `"light"`) and is what the hover CSS targets (L559; the `dataSet` prop type is declared at L29);
  - web only: `aria-haspopup="listbox"`, `aria-expanded={open}`, `onPointerDown=mountOnPress`, `onContextMenu` and `onPointerCancel=cancelClosed`, and `onKeyDownCapture` (L557–564). **There are no pointer-enter/leave handlers and no hover state.**
- **Box:** height **36**, radius **8**, paddingH **12**, row, `alignItems center`, `space-between` (L565–579).
- **Background.** The inline style (L568–574) has only two cases per mode; the hover colour comes from the injected CSS (L61–62):

  | State | Dark | Light | Source |
  |---|---|---|---|
  | open | `rgba(255,255,255,0.18)` | `rgba(0,0,0,0.10)` | inline, L568–571 |
  | closed + hovered | `rgba(255,255,255,.12)` from `[data-testid="yogesh-orb-panel"] [data-orb-trigger="dark"][aria-expanded="false"]:hover{background-color:rgba(255,255,255,.12)!important}` (L62); `!important` beats the inline background | `colors.row` (the rule matches dark only, so light has no hover colour) | CSS, L62 |
  | closed | `rgba(255,255,255,0.08)` | `colors.row` `#efeff0` | inline, L572–574 |
- **Background transition:** `[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]{transition:background-color .15s ease}` (L61). It applies to every trigger inside the panel in both modes, so rest ↔ hover ↔ open all fade over **.15s ease** on web. Native has no transition (inline swap). The rules only match inside an element with `data-testid="yogesh-orb-panel"`, which the panel gets from `testID="yogesh-orb-panel"` (`Tuner.tsx` L129; react-native-web renders `testID` as `data-testid`).
- **Text** (`triggerText`, L546–550): `MENU_TEXT` = `system-ui, -apple-system, "SF Pro Display", sans-serif` **13 / 500 / 19.5** (L44, L73–78). Colour `menuInk` = `rgba(255,255,255,0.7)` dark / `rgba(0,0,0,0.6)` light (L545). `translateY −0.5`.
- **Children:** the label on the left. On the right, a row with gap **8** (L582) holding the `display` text and the chevron inside an `Animated.View` rotated `chevron·180deg` (L440, L584–586).
- **Chevron** (`icons.tsx` L70–92):
  - web: an `<svg>` with viewBox `0 0 24 24`, `fill none`, `stroke currentColor`, `strokeWidth 2.5`, round caps and joins, `aria-hidden`, style `{ width: 20, height: 20, padding: 2, opacity: 0.6, boxSizing: border-box, color: menuInk }`, path `M6 9.5L12 15.5L18 9.5`;
  - native: `react-native-svg` with the same path and stroke.

### 6.3 Menu (L590–637)
- **Always mounted.** While closed it is invisible (opacity 0 from `shown`), `pointerEvents "none"`, `aria-hidden`, `accessibilityElementsHidden`, `importantForAccessibility "no-hide-descendants"`, `focusable={false}` (L592–596). The web listbox `div` also gets `inert` while closed (L618).
- **Imperative seal on top of the props:** `sealClosed()` writes `inert` and `aria-hidden="true"` on the menu element directly, and `unseal()` removes **both** attributes (L199–213, §6.4). The props above catch up on the next React commit.
- **Position:** absolute, `left 0, right 0`, `top 40` (4 px under the 36 px trigger), or `bottom 40` when `above` (L599–603). `place()` (L371–378): `measureInWindow`; `above = y + h + (8 + n·36) + 8 > windowH`. It is re-run on layout and on window-height or option-count change (L379–381).
- **Box:** radius 8, border 1, padding 4, zIndex 30 (L597–611):

  | | Dark | Light |
  |---|---|---|
  | bg | `colors.pop` `#212121` | `#fafafa` |
  | border | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.10)` |
  | boxShadow | `0 8px 24px rgba(0,0,0,0.4)` | `0 4px 16px rgba(0,0,0,0.08)` |
- **Animated style** (L436–439): `opacity = shown`, `translateY = (1 − shown)·(above ? 8 : −8)`, `scale = 0.95 + 0.05·shown`.
- **Web content** (L615–628): `createElement("div", { role: "listbox", "aria-label": label, className: "orb-select-menu" (+ " is-light"), inert: open ? undefined : true })`. Each option is a `Pressable role="option"` (L623) with:
  - `tabIndex` 0 only for the roving `active` index while open, else −1 (L621). `focusSelected()` also rewrites `tabIndex` imperatively (selected option 0, the rest −1; L247–254);
  - `aria-selected`, `accessibilityState.selected`, `testID="orb-select-option"`;
  - `onKeyDown → onOptionKey`, `onPress → requestClose(); sealClosed(); onPick(id); focusTrigger()`;
  - style `OPTION_BOX` = height **36**, radius **6**, paddingV 8, paddingH **10** (L79–84).
  - The label is `Text testID="orb-select-label"` in `MENU_TEXT` (L624).
- **Injected CSS** (web; one `<style id="orb-select-option-css">` added once by `injectOptionStyles`, L64–71, from a layout effect at L169–171; text `OPTION_CSS`, L47–62). Lines L47–60 are scoped to `[data-testid="yogesh-orb-panel"] .orb-select-menu`:
  - option: transparent bg, colour `#ffffffb3`, system font 13px/500/19.5px, `transition: background-color .15s, color .15s`;
  - `:hover` bg `#ffffff1f`;
  - `[aria-selected=true]` bg `#ffffff2e`, colour `#fffffff2`;
  - `:focus-visible` bg `#ffffff1f`, colour `#fff`, `outline: 2px solid #fff9; outline-offset: -2px`;
  - light (`.is-light`): colour `#0009`, hover `#00000014`, selected `#0000001a` / `#000000e6`, focus `#00000014` / `#000` / outline `#0000008c`.
  - L61–62 are scoped to the panel only and style the **trigger** (transition and dark hover, §6.2).
- **Native options** (L629–636): `accessibilityRole="menuitem"`. Selected bg `rgba(255,255,255,0.18)` / `rgba(0,0,0,0.10)`. Text `colors.fg` with opacity 0.95/0.7 (dark) or 0.9/0.6 (light).

### 6.4 Open/close mechanics and select timing

**Constants, verbatim (L86–90).**
```ts
const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
/** Web close only (dismissWeb, onEnd web close). Same stiffness, damping, and mass as MENU; energyThreshold is the only difference. Native close stays on MENU. */
const CLOSE_MENU = { stiffness: MENU.stiffness, damping: MENU.damping, mass: MENU.mass, energyThreshold: 1.8e-7 };
```

#### 6.4.1 Select state (shared values and refs)
**Shared values** (L117–121, L124): `aboveSV` (menu placed above), `shown` (menu 0→1; drives opacity, translate and scale), `chevron` (0→1 = 0°→180°), `openSV` (the open state as the gesture and the frames see it), `goal` (the target of the current motion), `primary` (the last pointerdown was the primary button). `shown`, `chevron`, `openSV` and `goal` start at `open ? 1 : 0`.

**Refs** (L115–116, L122–132):

| Ref | Initial | Meaning | Written at |
|---|---|---|---|
| `focusOnOpen` | `false` | focus the selected option once the open commits | set by `unsealForPointer` (L216) and `openFromKeys` (L444); cleared by `focusSelected` (L248) |
| `typed` | `{ buf: "", at: 0 }` | typeahead buffer | L533–535 |
| `armed` | `false` | the next `open` prop change came from this component, so the spring-restart effect must not restart the springs | set when a toggle is delivered (L151, L160, L226, L235, L340); consumed at L355–357; cleared when a reopen counter runs (L270) |
| `sawOpen` | `false` | skips the spring-restart effect on mount | L351–353 |
| `openRef` | `open` | **the requested open state, written synchronously**: `true` in `commitOpen` (L258); `false` the moment a close is requested (`requestClose`, L133–136); also `false` when React closes the menu from outside (L344) | L135, L258, L344 |
| `committedOpen` | `open` | what React has committed (mirrors the `open` prop) | L331 |
| `epoch` | `0` | generation counter: **+1 on every open** (L257) **and every `requestClose()`** (L134) | L134, L257 |
| `appliedEpoch` | `0` | the generation the last delivered toggle belongs to | L150, L159, L225, L234, L334, L339 |
| `closeDelivered` | `false` | a close toggle was handed to React and hasn't been reconciled yet | set at L158/L233; cleared at L266, L272, L333, L338 |
| `toggleRef` | `onToggle` | latest `onToggle`, used by the reopen counter | L221 |
| `openFrame` | `0` | pending open `requestAnimationFrame` id (0 = none) | L280–281; cancelled by `cancelOpenFrame` (L137–141) |
| `closeFrame` | `0` | pending close `requestAnimationFrame` id (0 = none) | L290–291; cancelled by `cancelCloseFrame` (L142–146) |

**`requestClose()`** (L133–136) bumps `epoch` and sets `openRef = false`. It runs first on every close path: `commitJS` (L164–167), `sealJS` (pointer close, L242–245), `dismissWeb` (L298; this covers outside pointerdown, document and trigger Escape, Enter/Space on an open trigger, Tab, option Escape and option Tab), an option press (L623) and an option Enter/Space (L509).

#### 6.4.2 Commit to React (`commitRef`, L147–163; the same body is re-installed every render at L222–238)
- **Opening:** if `openRef` is no longer true, **do nothing** (a stale open is dropped). Otherwise `appliedEpoch = epoch`, `armed = true`, and **`onToggle()` synchronously**.
- **Closing:** capture `gen = epoch`, then `startTransition(() => { … })`. Inside, the close is dropped if `gen !== epoch` (a newer open or close happened), if `openRef` is true (a reopen was requested), or if React isn't committed open. Otherwise `closeDelivered = true`, `appliedEpoch = gen`, `armed = true`, `onToggle()`.

#### 6.4.3 Open (`commitOpen`, L255–286), used by pointer open and keyboard open
1. `cancelCloseFrame()`; `epoch += 1`; `openRef = true` (L256–258). A pending deferred close is cancelled, and any close already queued is now a stale generation.
2. Reconcile with React (L259–275):
   - **A close toggle was already delivered but React is still open** (`closeDelivered && committedOpen`): counter it. Inside `startTransition`, if the generation still matches and `openRef` is still true, clear `closeDelivered` and call `toggleRef.current()` again, so the two toggles cancel and the menu stays open. `startTransition` runs its callback synchronously, so `countered` is known immediately; when it ran, `armed` is cleared because no `open` change will arrive (L261–270).
   - **React is closed** (or a delivered close is pending, i.e. `closeDelivered || !committedOpen`): clear `closeDelivered`, then **`flushSync(() => commitRef.current(true))`**: React commits `open = true` (and runs the layout effects, including the focus effect) before the next line; `committed = true` (L271–275).
   - **React is already open with no close delivered** (a reopen during the close fade, before the deferred close committed): no React commit.
3. **Focus once** (L276): `if (committedOpen.current && !committed) focusSelected()`. Only the already-open branch calls it here. After a `flushSync`, the open layout effect (L367–370) has already focused, so `commitOpen` doesn't focus a second time.
4. `openSV = 1; goal = 1` (L277–278).
5. **Spring in the next frame** (L279–285): `cancelOpenFrame()`, then `openFrame = requestAnimationFrame(() => { openFrame = 0; if (openSV.value !== 1) return; shown = withSpring(1, MENU); chevron = withSpring(1, CHEV); })`. **The spring is not seeded:** it starts from whatever `shown` holds (0 for a closed menu, the current value during a close fade). There is no preload and no plateau. If a close happened before the frame (`openSV` back to 0), or the frame was cancelled, the open springs never start.

**Open timing (web, 1280):**
- Code: React commits synchronously in the event handler; the springs start one animation frame later with MENU 1218/69.8/1 and CHEV 685/44.5/1.
- **Measured (author check):** no plateau; first opacity write **0.069–0.099 at 21–24 ms**; **0.99 at 204–207 ms**; Shape-click first visible **median 23 ms (n = 8)**, 0/8 first paints at 0.32.
- **Measured (medians):** plateau none (PASS); live first painted value 0.036–0.153; 0.99 live 202.2 / 203.2 / 201.8 / 201.2 ms vs ours 211.9 / 218.8 / 217.2 / 213.7 ms (held A/B, click A/B), i.e. **+9.7 / +15.6 / +15.4 / +12.5 ms** (the known tail, gap 7 in §15.1).

#### 6.4.4 Close
- **Deferred commit** (`commitNextFrame`, L287–295): `cancelCloseFrame()`, capture `gen = epoch`, then `closeFrame = requestAnimationFrame(() => { closeFrame = 0; if (gen !== epoch || openRef) return; commitRef.current(false); })`. **The deferred close is generation-checked:** a close superseded by a reopen (or by a later close) does nothing, and the transition inside `commitRef` checks again.
- **`dismissWeb()`** (L296–306): if `openSV !== 1`, return. Otherwise `requestClose()`; `cancelOpenFrame()`; `sealClosed()`; `openSV = goal = 0`; `shown → withSpring(0, CLOSE_MENU)`; `chevron → withSpring(0, CHEV)`; `commitNextFrame()`.
- **Seal** (`sealClosed`, L199–208): if `openRef` is true, return (never seal a menu a reopen asked for). Otherwise `cancelOpenFrame()`; if focus is inside the menu, move it to the trigger; set `inert` and `aria-hidden="true"` on the menu element; set every option's `tabIndex` to −1.
- **Unseal** (`unseal`, L209–213) removes **both** `inert` and `aria-hidden`. `unsealForPointer` (L214–217) unseals and sets `focusOnOpen`.
- **`focusSelected()`** (L247–254): clears `focusOnOpen`; finds the option with `aria-selected="true"` (else the first option); gives it `tabIndex` 0 and every other option −1, so **the selected option is the only element with `tabIndex` 0**; focuses it with `preventScroll`.
- **Frames are cancelled** on reopen (`commitOpen` cancels the close frame at L256 and replaces the open frame at L279), on dismiss and seal (open frame, L201, L299), and **on unmount** (both, L382–393). The open frame also checks `openSV === 1` before starting the springs (L282), and the close frame checks `gen`/`openRef` (L292).

#### 6.4.5 Reconciling React's `open` prop (layout effects, L330–370)
1. **Commit bookkeeping** (L330–345): `committedOpen = open`.
   - If `open === openRef`: clear `closeDelivered`, `appliedEpoch = epoch`, done.
   - If React committed **closed** while a reopen is requested (`!open && closeDelivered && openRef`): clear `closeDelivered`, `appliedEpoch = epoch`, `armed = true`, and **`onToggle()` again**, so the reopen toggles it open again.
   - If React closed with no request pending from this component (`!open && epoch === appliedEpoch && !closeDelivered`, e.g. the other select or the picker opened): `openRef = false`.
2. **`openSV` mirror** (L346–349): `openSV = open ? 1 : 0`, **skipped while a reopen is pending** (`!open && openRef`).
3. **Spring restart** (L350–362): skipped on mount and when `armed` (which it clears). Otherwise (an external change: an option pick, the other select or the picker opening) `goal` follows `open`, `shown → withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU)`, `chevron → withSpring(·, CHEV)`. **Every web close uses CLOSE_MENU.**
4. **Roving reset** (L363–366): while closed, `active` follows the selected index.
5. **Focus on open** (L367–370): on web, when `open` turns true and `focusOnOpen` is set, `focusSelected()`. Both click-open and keyboard-open set the flag.

#### 6.4.6 Pointer and native input
- `onPointerDown` records `primary = button === 0` (L394–396).
- The tap gesture is `Gesture.Tap().maxDistance(6).maxDuration(10000).onEnd` (L403–435), so it toggles on **release**. On web it returns unless the press was primary (L416–418). Then `next = openSV === 1 ? 0 : 1`; `openSV = goal = next` (L414, L419–420).
  - **Opening:** `runOnJS(unsealPtrJS)()` then `runOnJS(commitOpen)()`, and return (L421–425). **No spring starts in the gesture**; `commitOpen` starts it in the next frame (§6.4.3).
  - **Closing:** `runOnJS(sealJS)()` (= `requestClose()` + `sealClosed()`), `shown → withSpring(0, CLOSE_MENU)`, `chevron → withSpring(0, CHEV)`, `runOnJS(commitNextFrame)()` (L426–430).
- A context menu or pointercancel runs `cancelClosed()`: `primary = 0`, and if not open, `goal = shown = 0` (L397–402).
- There is no `onFinalize` revert: a press that moves more than 6 px, or is held longer than 10 s, does nothing.
- **Native:** `spring(next)` (MENU for both directions), then `runOnJS(commitJS)()` (L404–409, L432–433), and `commitJS` = `requestClose()` + `commitRef.current(false)` (L164–167). Native has not been run (gap 6); see §15.2 for a code-reading note on native open.

#### 6.4.7 Reopen races (what the code guarantees)
- **Close requested, deferred close not yet run, then reopen:** `commitOpen` cancels the close frame and bumps `epoch`; React never sees the close; the open spring restarts from the current fade value in the next frame. The seal is undone by `unseal()` (pointer or keys) before `commitOpen`.
- **Close toggle delivered (inside the transition) but not committed, then reopen:** `commitOpen` counters with a second toggle in a transition (§6.4.3).
- **React already committed closed, then reopen:** `commitOpen` takes the `flushSync` branch; if a delivered close commits after the reopen, the layout effect toggles it open again (§6.4.5).
- **Stale open:** a deferred `commitRef(true)` after a close request does nothing (`openRef` false, L149/L224); a pending open frame is cancelled by dismiss and seal and checks `openSV`.
- **Document listeners while open (web)** (L307–329), both passive: `keydown` Escape → `dismissWeb(); focusTrigger()`; `pointerdown` outside `rowRef` → `dismissWeb()`. The trigger and menu are inside `rowRef`. **The outside close starts on press-down.**

### 6.5 Keyboard (web)
**On the trigger** (`onKeyDownCapture`, L453–492):

| Key | Closed | Open |
|---|---|---|
| ArrowDown / ArrowUp | `openFromKeys()` (L441–447): `active` = selected, `focusOnOpen = true`, `unseal()`, `commitOpen()`. **ArrowUp opens too.** The springs start in the next frame like a pointer open (there is no separate keyboard spring any more) | focus the `active` option |
| Enter / Space / "Spacebar" | `openFromKeys()` | `dismissWeb()` |
| Escape | nothing | `dismissWeb(); focusTrigger()` |
| Tab | nothing | `sealClosed(); dismissWeb()`; the Tab then moves focus normally |

- Enter and Space call `preventDefault` and `stopPropagation`, so there is no page scroll. Key repeats are ignored (L486).
- ArrowUp and ArrowDown call `preventDefault` and `stopPropagation` (L469–472).

**On an option** (`onOptionKey`, L493–544; only while open):

| Key | Action |
|---|---|
| ArrowDown / ArrowUp | move to the next/previous option, **clamped** (no wrap); focus it (`moveTo`, L448–452) |
| Home / End | first / last option |
| Enter / Space / "Spacebar" | `requestClose(); sealClosed(); onPick(id); focusTrigger()` (L506–514) |
| Escape | `dismissWeb(); focusTrigger()` |
| Tab | `sealClosed(); dismissWeb(); focusTrigger()`; the Tab then moves on from the trigger |
| a printable character (no Alt/Meta/Ctrl, not Space) | **typeahead:** keys typed within **700 ms** of the previous one append to a buffer, otherwise it restarts. A buffer of one repeated letter cycles through labels starting with that letter. Matching is case-insensitive `startsWith`, wrapping. A one-letter query searches from the next option; a longer query starts at the current option, so it stays put while it still matches (L529–543). |

**Measured:** the select checks are listed in §16 (rows 40–45) and §15.3. Remaining select differences from live are gaps 7, 8 and 12 (§15.1).

## 7. Color row and colour picker (web: `components/ColorPicker.web.tsx`, Appendix 3; wired at `Tuner.tsx` L163–176)

### 7.1 Wiring (`Tuner.tsx` L163–176)
`<ColorPicker text={playgroundColor} color={parsed} open={picker} onOpenChange={(next) => { if (next) setMenu(null); setPicker(next); }} onCommit={(next) => { setExact(null); setPlaygroundColor(next.trim()); }} onChange={remember} />`
- `onCommit` is called for typed text. The colour is stored as the **trimmed text exactly as typed**, case and format kept (the props doc, L158: "Uppercase hex stays uppercase.").
- `onChange(color, text)` is called by the picker controls. `remember` stores the exact OKLCH plus its formatted text (§3).

### 7.2 The row (L563–634; CSS L106–117)
DOM: `div.orb-cp-control[data-open][data-testid="yogesh-orb-color-row"]` › `span.orb-cp-label` "Color" + `div.orb-cp-inputs` › `input.orb-cp-value` + `button.orb-cp-swatch`. Then the popover, portalled to `document.body` (L635).

| Part | CSS (verbatim values) |
|---|---|
| `.orb-cp-control` | `box-sizing:border-box; height:36px; width:100%; background:rgba(255,255,255,.08); border-radius:8px; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 12px; transition:background .15s, box-shadow .15s; font-family: system-ui stack` |
| `[data-open=true]` | `background:rgba(255,255,255,.18); box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)`. The label and value turn `#fffffff2`. |
| `.orb-cp-label` | `color:rgba(255,255,255,.7); flex-shrink:0; font-size:13px; font-weight:500; line-height:19.5px; transform:translateY(-.5px)` |
| `.orb-cp-inputs` | `flex:1; min-width:0; display:flex; justify-content:flex-end; align-items:center; gap:8px` |
| `.orb-cp-value` | `width:100%; min-width:0; height:25px; color:rgba(255,255,255,.7); text-align:right; text-overflow:ellipsis; background:transparent; border:0; outline:none; padding:4px 0; font:500 13px GeistMono_500Medium, ui-monospace, monospace; caret-color:rgba(255,255,255,.7)` |
| `.orb-cp-value:focus` | `color:#fff; caret-color:#fff; outline:none; box-shadow:inset 0 -1px 0 0 rgba(255,255,255,.6)` |
| `[aria-invalid=true]` | `color:#ef7777; caret-color:#ef7777` |
| `.orb-cp-swatch` | `20×20; border:1px solid rgba(255,255,255,.26); border-radius:5px; flex:0 0 20px; padding:0; cursor:pointer; background-image: linear-gradient(var(--orb-cp-color), var(--orb-cp-color)), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%); background-size:auto, 8px 8px; background-position:0 0, 0 50%; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); transition:transform .15s` |
| `.orb-cp-swatch:hover` | `transform:scale(1.08)` |
| `.orb-cp-swatch:focus-visible` | `outline:2px solid rgba(255,255,255,.6); outline-offset:-2px` |

- **Value input** (L573–620): `type text`, `spellCheck false`, `autoComplete off`, `aria-label="Color color value"`, `aria-invalid` when invalid, `title = text`.
  - **Commit** happens on the DOM `change` event (blur after an edit) and on Enter (`bindChange`, L389–409; `commitRef`, L201–213). A valid value sets the format tab to `detectFormat(text)`, syncs both drafts and calls `onCommit(trimmed)`; Enter then blurs.
  - **Invalid** Enter → `aria-invalid` (red `#ef7777`) and focus stays. Blurring an invalid value reverts the draft to the current text (L588–595).
  - **Escape** → revert to the current text. If the picker is open, close it and focus the swatch; otherwise blur (L599–611).
  - Every keydown is `stopPropagation`'d (L597).
  - While the input isn't focused, external text changes (picker, Reset) re-sync it (L219–234).
- **Swatch** (L621–632): `button type=button`, `data-testid="yogesh-orb-color-swatch"`, `aria-label="Pick color color"`, `aria-haspopup="dialog"`, `aria-controls={popId}`, `aria-expanded={open}`. `--orb-cp-color` is the stored text if it parses, else `formatColor(color, "hex")` (L199), so the swatch shows the real CSS colour (P3 included where the browser supports it) over a checkerboard. Click → `onOpenChange(!open)`.

### 7.3 Opening, placement and dismissal
- **Place** (`place()`, L245–263), `position: fixed`:
  - `edge = vw < 768 ? 16 : 8`;
  - `top = row.top − 32`, clamped to `[edge, max(edge, vh − edge − 350)]`;
  - `left = row.left − 288`, clamped to `[edge, max(edge, vw − edge − 280)]`.
  - So at desktop the 280-wide popover sits **8 px left of the row** and starts 32 px above it.
- **On open** (layout effect, L270–304): `place()`. On the first open render, focus the checked format radio. Then, while open:
  - document `pointerdown` outside the row and the popover → close (`flushSync`);
  - document `focusin` outside both → close;
  - `resize` and capturing `scroll` → `place()`.
- **Inside the popover** (`onPopKey`, L354–370): every keydown is `stopPropagation`'d.
  - **Escape** → `closeToSwatch()`: close, then focus the swatch (L265–268).
  - **Tab** from the checked radio with Shift, or from the CSS input without Shift → focus the swatch, close, and let the browser move on from the swatch.
- **Opening a select** closes the picker (`setPicker(false)` in its `onToggle`). That `onToggle` must use a functional state update for `setMenu`, because the closure form loses the reopen with the current `SelectRow` (§6.1). Opening the picker closes any select (`setMenu(null)`). The select's own outside-pointerdown also fires.
- **Entrance:** CSS `animation: orb-cp-enter .16s ease-out` from `opacity:0; transform:translateY(3px) scale(.98)` to `opacity:1; transform:none` (L118, L120). **No exit animation:** the popover unmounts. `prefers-reduced-motion: reduce` removes the animation (L148).

### 7.4 The popover (L415–561; CSS L118–147)
`div.orb-cp-pop` with `role="dialog"`, `id={popId}`, `aria-label="Color color picker"`, `data-testid="yogesh-orb-color-popover"`. CSS: `box-sizing:border-box; width:280px; height:350px; z-index:10002; position:fixed; margin:0; padding:10px; display:grid; grid-template-rows:36px 160px auto 36px; gap:6px; border-radius:14px; border:1px solid rgba(255,255,255,.14); background:#212121; box-shadow:0 8px 32px rgba(0,0,0,.5); color:rgba(255,255,255,.7); font:500 13px/19.5px system-ui stack; overflow:hidden`.

Rows, top to bottom:
1. **Format tabs** (L427–459). `div.orb-cp-formats` (h36, `rgba(255,255,255,.08)`, r8, padding 2) › `div.orb-cp-seg[role=radiogroup][aria-label="Color format"]` (padding 2, r8) holding:
   - **Pill** `div.orb-cp-pill` (`aria-hidden`): absolute left/top/bottom 2, width `calc(33.3333% - 1.33333px)`, r6, bg `rgba(255,255,255,.18)`, `transform: translateX(index·100%)` with `transition: transform .2s cubic-bezier(.25,1,.5,1)`. Reduced motion removes the transition. Gap 3: the pill slide starts about 40 ms early.
   - **Buttons** "Hex", "OKLCH" and "Display P3" (`TABS`, L18–22): `button.orb-cp-format[role=radio]` with `aria-checked`, `data-active`, `tabIndex` 0 only on the checked one. CSS: flex 1, nowrap, padding 6px 8px, 13px/500/19.5px, colour `.7` → `#fffffff2` on hover or active (`transition: color .15s`); `:focus-visible` 2px `.6` outline at −2px.
   - **Click** → `setFormat(id); onChange(color, formatColor({...color, h: hue}, id))`, so the stored text is reformatted.
   - **Keys** (L372–387): →/↓ next, ←/↑ previous (both **wrap**), Home/End; each one focuses **and clicks** the target.
2. **Colour field** (L460–486). `div.orb-cp-plane[role=group]`, `aria-label="Color field; use arrow keys to adjust saturation and lightness"`, `tabIndex 0`; CSS h160, r8, `cursor:crosshair`, `touch-action:none`, inset 1px `rgba(0,0,0,.1)` ring, `:focus-visible` 2px `.6` outline.
   - **Canvas** 252×160 (`aria-hidden`), painted by `paintField` (L59–88). It asks for a `display-p3` 2D context. For each pixel, row y gives `l = 1 − y/(h−1)` and column x gives `c = x/(w−1) · maxChroma(l, hue, space)`. The colour is converted to the canvas's reported colour space and written as 8-bit.
   - `space` = `"p3"` on the Display P3 tab, else `"srgb"` (L49–51).
   - **Marker:** a 12 px circle with a 2px white border and a `0 2px 4px rgba(0,0,0,.3)` shadow, at `left: ratio·100%`, `top: (1 − l)·100%`, bg = the opaque colour (L477–485). `ratio = c / maxChroma(l, h, space)`.
   - **Pointer** (L310–336): primary button only. It calls preventDefault, focuses the field, captures the pointer, and on down and move sets `l` from y and `c` from x (chroma ratio × max chroma). It keeps the hue and alpha.
   - **Keys** (L338–352): ↑/↓ ±0.01 lightness, →/← ±0.01 chroma ratio; Shift = 0.1.
3. **Tracks** (L487–538). `div.orb-cp-tracks` (grid, gap 6) holding two `label.orb-cp-track-row`s: h36, r8, `rgba(255,255,255,.08)`, gap 12, padding 0 12px, 13px/500. The label `span` is `flex: 0 0 52px` at `.7`.
   - **Hue:** `input[type=range]` min 0, max 360, step 0.1, `value = hue`, `aria-label="Hue"`, `aria-valuetext="N degrees"`. The track is `hueTrack()`: 73 OKLCH stops (every 5°), `linear-gradient(to right in oklab, …)` at the current lightness and chroma ratio (L90–97). The thumb shows the opaque colour. `onInput` keeps the chroma ratio (L507–513). The hue is held through grey colours (`heldHue`, L181, L194, L236–238).
   - **Opacity:** min 0, max 100, step 1, `value = round(a·100)`, `aria-valuetext="N percent"`. The track is transparent → opaque colour over a checkerboard; the thumb is the colour with alpha over a checkerboard.
   - **Range CSS** (L135–141): track 16 px high, r4; thumb 16×24, `margin-top:-4px`, 2px white border, r5, `0 2px 4px rgba(0,0,0,.3)` shadow; `:focus-visible` 2px `.6` outline at −2px. **Gap 1:** the Hue/Opacity track has no keyboard focus ring (measured, even though the rule exists at L141).
4. **CSS input** (L539–559). `input.orb-cp-css`, `aria-label="CSS color"`, `title = text`; h36, r8, `.08` bg, padding 0 12px, `500 13px/19.5px` Geist Mono stack, `:focus` colour `#fff`, invalid `#ef7777`.
   - Enter commits (invalid → red). A `change` event also commits while open (L410–413).

- **Picker output text** is `formatColor(next, format)` (L306–308). Hex → `#rrggbb` (`#rrggbbaa` below alpha 1); OKLCH → `oklch(l c h[ / a])`; P3 → `color(display-p3 r g b[ / a])`, computed from the **sRGB-clamped** colour (`color.ts` L133–137).
- **Theme:** this CSS is **dark only**; there are no light rules.
- **Focus ring for the panel controls** (L144): `[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]:focus-visible, [data-testid="yogesh-orb-panel"] [role="slider"]:focus-visible { outline: 2px solid rgba(255,255,255,.6); outline-offset: -2px }`. That rule gives the select triggers and the five sliders their keyboard focus ring. It is injected the first time the ColorPicker mounts (L99–151, L215–217).

### 7.5 Parsing (`color.ts` `parseColor` L175–231; `detectFormat` L233–238)
It accepts `transparent`; `#rgb`, `#rgba`, `#rrggbb` and `#rrggbbaa`; `oklch(L C H [/ A])` (spaces only); `rgb()`/`rgba()` (commas with % all-or-none, or space + `/`); `hsl()`/`hsla()` (S and L must be %); and `color(display-p3 r g b [/ A])` (spaces only). Anything else is `null`.

Examples (re-run with `npx tsx` against the inlined `color.ts`; columns are hex | oklch | p3, then `detectFormat`):

| Input | Result |
|---|---|
| `#fff` | `#ffffff` \| `oklch(1 0 0)` \| `color(display-p3 1 1 1)`; hex |
| `#FFF8` | `#ffffff88` \| `oklch(1 0 0 / 0.5333)` \| `color(display-p3 1 1 1 / 0.5333)`; hex |
| `#f6339a` | `#f6339a` \| `oklch(0.6558 0.2404 354.32)` \| `color(display-p3 0.88798 0.27752 0.59468)`; hex |
| `rgb(246 51 154 / 0.5)` | `#f6339a80` \| `oklch(0.6558 0.2404 354.32 / 0.5)` \| `color(display-p3 0.88798 0.27752 0.59468 / 0.5)`; hex |
| `rgb(50%, 20%, 60%)` | `#803399` \| `oklch(0.4729 0.1687 316.59)` \| `color(display-p3 0.46364 0.21834 0.58035)`; hex |
| `hsl(330 90% 58%)` | `#f43494` \| `oklch(0.6512 0.2364 356.08)` \| `color(display-p3 0.88189 0.2778 0.57231)`; hex |
| `oklch(70% 0.3 30deg / 50%)` | `#ff655180` \| `oklch(0.7 0.3 30 / 0.5)` \| `color(display-p3 0.92879 0.43549 0.35204 / 0.5)`; oklch |
| `color(display-p3 1 0 0)` | `#ff3428` \| `oklch(0.6486 0.2995 28.96)` \| `color(display-p3 0.92047 0.28547 0.21888)`; p3 |
| `transparent` | `#00000000` \| `oklch(0 0 0 / 0)` \| `color(display-p3 0 0 0 / 0)`; hex |
| `#171717` | `#171717` \| `oklch(0.2046 0 0)` \| `color(display-p3 0.0902 0.0902 0.0902)`; hex |
| `red`, `rgb(50%, 20, 60%)`, `hsl(330, 90, 58)`, `oklch(0.7, 0.3, 30)`, `color(srgb 1 0 0)`, `#12345` | `null` (invalid; the field turns red, and blur reverts it) |

### 7.6 Native (`components/ColorPicker.tsx`, a stub; gap 2)
Doc comment (L18–21): "Native stand-in. Desktop web uses ColorPicker.web.tsx. Mobile layout is a known gap; this keeps the card from crashing."
- A 36-high row (r8, `rgba(255,255,255,0.08)`, paddingH 12, gap 12) holding the "Color" `Text`, a `TextInput` that commits on submit, and a 20×20 swatch `Pressable` (L42–90).
- When open, it shows a panel containing only the text "Enter a hex, RGB, HSL, OKLCH, or Display P3 color" and a "Close" button (L91–98). There is no field, no tracks and no tabs.

### 7.7 Which colour reaches the orbs
Both orbs get `color={playgroundColor}` as a prop, and `live` carries `rgba` from `parsed` (§3). On web, `toExtendedSrgb` keeps out-of-sRGB colour as extended floats. Whether the P3 canvas shows it correctly on a real GPU and in Safari is unverified (gap 5).

## 8. Sliders (`components/SliderRow.tsx`, Appendix 5; wired at `Tuner.tsx` L177–248)

### 8.1 The five sliders
| Label | min | max | step | default | decimals | default text | default fill `(v−min)/(max−min)` | `live` field | shown |
|---|---|---|---|---|---|---|---|---|---|
| Size | 16 | 480 | 1 | 320 | 0 | `320` | 0.6552 | `size` | always (L177–190) |
| Speed | 0.05 | 3 | 0.05 | 1 | 2 | `1.00` | 0.3220 | `speed` | always (L191–204) |
| Density | 0.25 | 3 | 0.05 | 1 | 2 | `1.00` | 0.2727 | `density` | always (L205–218) |
| Dot Size | 0.25 | 3 | 0.05 | 1 | 2 | `1.00` | 0.2727 | `dotSize` | always (L219–232) |
| Tilt | −90 | 90 | 1 | 20 | 0 | `20` | 0.6111 | `tilt` | only when `!isFlat(render)` (L233–248) |

Each one passes `onChange = setX`, `live={live}`, `field`, and `onDrag={(active) => { sliding.current = active; }}`.

### 8.2 Row anatomy (L363–415)
- **The whole row is the slider:** an `Animated.View` inside `GestureDetector(Gesture.Race(pan, tap))`. Height **36**, radius **8**, bg `colors.row` (#141414), `overflow hidden`, `justifyContent center`. It translates by `over` (rubber band, L324) (L390–399).
- **Fill** (L401): absolute left/top/bottom 0, bg `colors.slider` (#3e3e3e), width `clamp(fill)·100%`.
- **Marks** (L402–404): **9** lines at 10 %…90 %, top 8, bottom 8, width 1, bg `colors.fg`, opacity `marksOp`.
- **Handle** (L405–408): absolute, top 8, **3×20**, marginLeft −1.5, radius 1, bg fg, pointerEvents none; `translateX = fill·width`, plus `scaleX`, `scaleY` and opacity `handleOp`.
- **Text** (L409–412; styles L331–361, web):
  - label: `system-ui, -apple-system, "SF Pro Display", sans-serif` **13/500/19.5**, absolute `top 50%`, `left 10`, colour `rgba(255,255,255,0.7)` (dark) or `rgba(0,0,0,0.6)` (light), `translateY(-50%) translateY(-0.5px)`;
  - value: `GeistMono_500Medium, ui-monospace, monospace` **13/500/19.5**, absolute `top 50%`, `right 12`, paddingBottom 1, 1px transparent bottom border, same colour, `translateY(-50%) translateY(0.5px)`, showing `labelText` (`value.toFixed(decimals)`, live during drags).
  - Native uses `fonts.regular` / `fonts.mono` 13 in `colors.fg` at top 8.
- **Font smoothing:** `injectSmoothing()` adds `<style id="orb-font-smoothing">` with `-webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale` for `[data-testid="yogesh-orb-tuner"]`, its descendants and `.orb-cp-pop` (L15–22, L77–79).
- **Focus (web):** `focusable`, `tabIndex 0`. The row sets no outline itself. Its ring comes from the panel-scoped rule in `ColorPicker.web.tsx` L144 (2px `rgba(255,255,255,.6)`, offset −2px).
- **Hover (web):** `onPointerEnter`/`onPointerLeave` set `hover` to 1/0 (L384–389).

### 8.3 Handle and marks reaction (L143–164)
```
trackW = width; O = fill·100
ee = labelW > 0 && trackW > 1 ? (10 + labelW + 8)/trackW·100 : 30
et = valueW > 0 && trackW > 1 ? (trackW − 12 − valueW − 8)/trackW·100 : 78
near = O < ee || O > et; visible = dragging || hover > 0
handleOp → withTiming(!visible ? 0 : near ? 0.1 : dragging ? 0.9 : 0.5, 150 ms)
scaleX   → withSpring(visible ? 1 : 0.25, HANDLE_X)
scaleY   → withSpring(near && visible ? 0.75 : 1, HANDLE_Y)
marksOp  → withTiming(visible ? 0.35 : 0, 200 ms)
```

### 8.4 Constants (L24–28, verbatim)
```ts
const FILL = { stiffness: 300, damping: 25, mass: 0.8 };
const BACK = { stiffness: 224, damping: 25.4, mass: 1 };
const HANDLE_X = { stiffness: 439, damping: 35.6, mass: 1 };
const HANDLE_Y = { stiffness: 685, damping: 47.1, mass: 1 };
const PUSH_MS = 32;
```

### 8.5 Pointer (L226–321): `Gesture.Race(pan, tap)`
- **Pan:** `activeOffsetX [−4, 4]`, `failOffsetY [−6, 6]`.
  - `onBegin` (press-down): save `savedFill`; `next = snap(min + clamp(x)/width·(max−min))`; `pending = next`; `tapAnim = true`; `fill → withSpring(ratio(next), FILL)`. While `tapAnim`, the value text follows the animating fill (L185–191).
  - `onUpdate`: becomes a drag once |translation| ≥ 4 (`dragged = dragging = true`, `tapAnim = false`). Then the fill tracks x **1:1**. Below 0 or past the width: `over = ∓min(18, overshoot·0.25)` and the ratio is pinned. `pending = snap(…)`; `writeLive` every update; JS `publish` at most every 32 ms (sets `sliding` through `onDrag(true)`, the text and `onChange`).
  - `onEnd`: `over → withSpring(0, BACK)`; `next = snap(clamp(x))`; `fill → withSpring(ratio, FILL)`; `writeLive`; `commit(next)` (`onDrag(false)`, the text, `onChange`).
- **Tap:** `maxDistance 6`, `maxDuration 10000`. `onEnd`: `tapAnim = false`; write `pending` to live; commit. So a click commits on release the value that was snapped at press-down.
- **Abandoned gesture** (`revertIfAbandoned`, L227–239): when both finalize without an `onEnd`, `over → 0` (BACK), `fill → savedFill` (FILL) and the text reverts.
- **`snap`** (L32–38): clamp, round to the step from `min`, clamp again, `Number(toFixed(4))`.

### 8.6 External changes (L166–183)
When the value changes from outside (keys, Reset), `fill → withSpring(target, FILL)` and the text updates. This is skipped while dragging or tap-animating; the first sync after our own commit only updates the text.

### 8.7 Keyboard and a11y (L193–224, L363–383)
- While focused (web), a `window` keydown listener handles: →/↑ +1 step, ←/↓ −1 step; **Shift ×10**; PageUp/PageDown ±10 steps; Home → min; End → max. It calls `preventDefault` and `stopPropagation`.
- **Keyboard steps call `publishNow`, which writes `live` (when set), the text and `onChange`** (L193–201).
- a11y: `accessibilityRole="adjustable"` (`role=slider` on web), `accessibilityLabel={label}`, `accessibilityValue {min, max, now, text}`, `aria-valuemin/max/now`, `aria-valuetext = labelText`, increment/decrement actions ±1 step.

## 9. Control → orb mapping and live preview wiring (`Tuner.tsx`)

| Control | State | Stage orb (L359–371) | Status orb (L397–409) | `live` (L81, L97–100) | Copy (§11) |
|---|---|---|---|---|---|
| State list | `index` → `look` | `state`, `variant` | same | – | `state`, `variant` |
| Shape | `shape` | `shape` | same | – | `shape={x}` + import |
| Render | `render` | `render` | same | – | `render={x}` + import |
| Color row / picker | `playgroundColor` (+ `exact`) | `color={playgroundColor}` | same | `r, g, b, a` from `rgba` | `className="text-[…]"` |
| Size | `size` | **`size={shown}`** | **`size={24}`** | `size: shown` | `size={size}` (the slider value) |
| Speed | `speed` | `speed` | same | `speed` | `speed` |
| Density | `density` | `density` | same | `density` | `density` |
| Dot Size | `dotSize` | `dotSize` | same | `dotSize` | `dotSize` |
| Tilt | `tilt` | `tilt` | same | `tilt` | `tilt` (omitted when flat) |

- **Both orbs share one `live`.** The orb reads only `speed`, `tilt` and `r/g/b/a` from it each frame. Size, density and dotSize come from props (`AGENT_PROMPT_ORBS.md` §13.5). That's why the status orb stays 24 px.
- **Writers of `live`:**
  - the Tuner effect, unless `sliding` (L97–100);
  - `SliderRow.writeLive` on drag updates, pan end and tap end;
  - `publishNow` on keyboard/a11y steps.
- **Reduced motion** (OS setting, live): both orbs show one still frame at t = 0, repainted from **props** on every change, so the still orb follows the sliders, the colour and the look (`AGENT_PROMPT_ORBS.md` §13.4).
- **Flat renders:** leaving one resets `tilt` to 20 (L92–95). Entering one hides Tilt but keeps it in state; the orb ignores tilt on flat renders.
- **A speed change** is a new clock key (`state@speed`) and resets the per-orb state (`AGENT_PROMPT_ORBS.md` §9). Unmeasured vs live.

## 10. Status line: mini orb + shimmer (`Tuner.tsx` L376–412; `components/Shimmer.web.tsx`, `Shimmer.tsx`)

- **Structure:** a row (gap 8, centred, pointerEvents none, `testID="yogesh-orb-status"`) holding `OrbView` **size 24** (same tuning and `live` as the stage) and `<Shimmer key={index} text={look.status} style={phone ? { lineHeight: 20 } : undefined} />` (L397–410). For wide placement see §4.2.
- **Web Shimmer** (`Shimmer.web.tsx`, 46 lines):
  - A one-time injected `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}` (L7–14).
  - A `<span>` (L25–44) with `fontFamily: fonts.regular`, `fontSize 14`, `lineHeight "20px"` (or the passed number), `display: inline-block`, **`opacity: 1`**.
  - `backgroundImage: linear-gradient(90deg, muted 35%, fg 50%, muted 65%)`, `backgroundSize: 200% 100%`, `background-clip: text` (with `-webkit-`), `color: transparent`, `animation: orb-shimmer 2s linear infinite`.
  - **No fade-in.** Doc comment L16: "Full opacity on the first frame. Remount (key by look index) restarts the sweep."
  - **Reduced motion:** `useReducedMotion()` from Reanimated (L3, L19). No gradient or animation; plain `color: muted`. Whether this hook follows a live OS toggle is unmeasured (the orbs use `AccessibilityInfo` instead; §14).
  - Colours: muted `#a1a1a1`, fg `#fafafa` (dark).
- **Native Shimmer** (`Shimmer.tsx`, 59 lines):
  - A Skia `Canvas`: width = the text width from `useFont(Geist_400Regular, size)` (`Shimmer.tsx` L1, L21), height `ceil(size·1.45)`.
  - An alpha `Mask` of the text over a `LinearGradient` rect: colours `[muted, muted, fg, muted, muted]` at `[0, 0.35, 0.5, 0.65, 1]`, `mode repeat`.
  - `shift` runs −2w → 2w with `withRepeat(withTiming(…, {duration: 2000, easing: linear}), −1, false)`.
  - With reduced motion, or before the font loads, it falls back to a plain muted `Text`. No fade.

## 11. Copy and Reset (`Tuner.tsx` L102–125, L249–282; `content/snippet.ts`)

### 11.1 Row (L252–285)
- A `View` with `marginTop 10` (on top of the panel gap 6), row, centred, **gap 16**.
- **Copy:** `Pressable testID="yogesh-orb-export"`, `hitSlop 8`, web `accessibilityRole="button"`. Its text is `colors.muted`, `fonts.regular` **14/20**: **"Copy"**, or **"Copied"** for 1500 ms after a successful write.
- **Reset:** `Pressable` with `hitSlop 8` and `accessibilityLabel="Reset"` (no role). Same muted 14/20 text, **"Reset"**.
- **Reset is visible only when** `playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase() || size !== 320 || speed !== 1 || density !== 1 || dotSize !== 1 || tilt !== 20` (L260–265).
  - Shape, Render and the selected state don't make it appear, and Reset doesn't touch them.
- There is no hover or pressed styling.

### 11.2 Copy (L105–128)
1. `text = orbSnippet({ state: look.state, variant: look.variant, size, speed, density, dotSize, tilt, shape, render, color: playgroundColor, themeDefault: colors.orb, flat })`.
2. `void setStringAsync(text).then(() => { if (!alive.current) return; setCopied(true); clear the old timer; timer = setTimeout(() => alive && setCopied(false), 1500) })`. A second Copy restarts the 1500 ms.
3. The timer is cleared on unmount (L87–93). There is no error path: if the write rejects, the label stays "Copy".
4. **Measured (same 1500 ms code):** "Copied" reverted after a median of 1504.3 ms vs live 1501.9 ms.

### 11.3 Reset (L267–275)
`setSize(320); setSpeed(1); setDensity(1); setDotSize(1); setTilt(20); setExact(null); setPlaygroundColor(colors.orb)`. The sliders spring to their fills with FILL.

### 11.4 Output template (`content/snippet.ts`; full file in Appendix 11)
- **Prop order:** state, variant, speed, density, dotSize, tilt, size, then shape, render, className.
- A prop is skipped when it is `undefined` or equals `DEFAULTS` = `{ variant: "default", size: 20, speed: 1, density: 1, dotSize: 1, tilt: 20 }`. Strings print as `key="v"`, numbers as `key={v}` (JS `String`).
- `state` is always printed. `size` is the **slider value**, not `shown`. `tilt` is omitted for flat renders.
- A non-sphere shape adds `shape={x}` and `import { x } from "@yogesharc/thinking-orbs/shapes";`. A non-dots render adds `render={x}` and `import { x } from "@yogesharc/thinking-orbs/renders";`.
- A colour different (case-insensitive) from `themeDefault` adds `className="text-[<colour text exactly as stored>]"`.
- The output is web JSX for the npm `@yogesharc/thinking-orbs` package, by design (the live site's format).

### 11.5 Evaluated examples (re-run with `npx tsx` against the inlined `snippet.ts`; `\n` shown as line breaks)
1. Defaults (Working):
   ```
   import { Orb } from "@yogesharc/thinking-orbs";

   <Orb state="working" size={320} />
   ```
2. Base, Size 20: `import { Orb } from "@yogesharc/thinking-orbs";\n\n<Orb state="base" />`
3. Searching · Lighthouse, Speed 1.5, Density 0.75, Dot Size 2, Tilt −30, Size 240, Torus, Mesh, colour `#f6339a`:
   ```
   import { Orb } from "@yogesharc/thinking-orbs";
   import { torus } from "@yogesharc/thinking-orbs/shapes";
   import { mesh } from "@yogesharc/thinking-orbs/renders";

   <Orb state="searching" variant="lighthouse" speed={1.5} density={0.75} dotSize={2} tilt={-30} size={240} shape={torus} render={mesh} className="text-[#f6339a]" />
   ```
4. Compacting · Fuse, Halftone (flat), Tilt 45: `import { Orb } from "@yogesharc/thinking-orbs";\nimport { halftone } from "@yogesharc/thinking-orbs/renders";\n\n<Orb state="compacting" variant="fuse" size={320} render={halftone} />` (tilt dropped).
5. Colour `oklch(0.7 0.3 30)`: `import { Orb } from "@yogesharc/thinking-orbs";\n\n<Orb state="working" size={320} className="text-[oklch(0.7 0.3 30)]" />`.

## 12. Colours and typography (dark; the only mode reachable)

The palette is `theme.tsx` L34–53 (dark) and L55–74 (light). The theme starts dark (L131), and nothing calls `toggle`. `SelectRow` and `SliderRow` have light branches in code; the picker CSS has none.

| Token / literal | Dark value | Used by |
|---|---|---|
| `page` | `#000000` | root bg |
| `fg` | `#fafafa` | selected list item, slider handle and marks, shimmer highlight |
| `muted` | `#a1a1a1` | unselected list items, hint, Copy/Reset, shimmer base |
| `row` | `#141414` | slider rows |
| `slider` | `#3e3e3e` | slider fill |
| `pop` | `#212121` | select menu bg (the picker uses the literal `#212121`) |
| `orb` | `#ffffff` | default colour, Reset, Copy `themeDefault` |
| `rgba(255,255,255,0.08)` | | closed select trigger, Color row, picker tab track, track rows, CSS input |
| `rgba(255,255,255,0.12)` | | hovered closed trigger |
| `rgba(255,255,255,0.18)` | | open trigger, open Color row, format pill |
| `#ffffff1f` / `#ffffff2e` | | option hover and focus / selected option |
| `rgba(255,255,255,0.7)` = `#ffffffb3` | | trigger text and chevron ink, option text, Color label and value, slider label and value, picker text |
| `#fffffff2` | | selected option text, open Color row text, active format |
| `rgba(255,255,255,.6)` = `#fff9` | | focus rings (2px, offset −2px) and the Color value focus underline |
| `rgba(255,255,255,0.14)` | | menu and popover border |
| `rgba(255,255,255,.26)` | | swatch border, open Color row inset ring |
| `#ef7777` | | invalid colour text |
| `0 8px 24px rgba(0,0,0,0.4)` / `0 8px 32px rgba(0,0,0,.5)` | | menu shadow / popover shadow |

**Typography** (web):
- `fonts.regular` = `Geist_400Regular, Geist, "Geist Fallback", system-ui, sans-serif` (`theme.tsx` L85, L91):
  - 14/20: list items, Copy/Reset, Shimmer (14, lineHeight 20px);
  - 12/16: hint.
- System stack `system-ui, -apple-system, "SF Pro Display", sans-serif`, **13/500/19.5**: select label and value, options, Color label, slider label, picker text, format buttons, track labels.
- `GeistMono_500Medium, ui-monospace, monospace`, **500 13**: Color value (h25), slider value (19.5), CSS input (19.5).
- **Font loading:** `ThemeProvider` calls `useFonts` on mount with Geist 400, 400 italic, 500, 600 and Geist Mono 400 and 500, registering CSS names `Geist` and `Geist Mono` (`theme.tsx` L120–130). Geist Mono 500 is also loaded by `useFonts` in `SliderRow` (L76) and `ColorPicker.web` (L173). There is no deferred window-`load` loader. Gap 9 (font flash) was measured against the older deferred loader; with mount-time `useFonts` the flash timing is **unmeasured**.

## 13. Motion and timing (all creator animations)

| What | Driver | Values | Cite |
|---|---|---|---|
| Select menu open (pointer, release) | gesture `onEnd` → `unsealPtrJS`, `commitOpen`: React commit via `flushSync`, then `withSpring(1, MENU)` started in the next `requestAnimationFrame` from the current `shown` (no seed) | 1218 / 69.8 / 1; opacity = shown, translateY ∓8 → 0, scale 0.95 → 1. **Measured** (author check): no plateau, first opacity write 0.069–0.099 at 21–24 ms, 0.99 at 204–207 ms; Shape-click first visible median 23 ms (n = 8). 0.99 tail ~1 frame behind live = gap 7 | SelectRow L86, L255–286, L413–425, L436–439 |
| Select menu open (keys) | `openFromKeys()` → `unseal()`, `commitOpen()`: same path and same frame-delayed spring as pointer | same | L441–447, L255–286 |
| Open frame | `requestAnimationFrame`; cancelled on reopen, dismiss, seal and unmount; starts the springs only if `openSV === 1` | one frame after the open commit | L279–285, L201, L299, L382–393 |
| Select menu close (web) | `withSpring(0, CLOSE_MENU)` | MENU + `energyThreshold 1.8e-7`; menu stays mounted, sealed | L90, L303, L360, L427 |
| Select menu close (native) | `withSpring(0, MENU)` | | L360, L407 |
| Chevron | `withSpring(0↔1, CHEV)` | 685 / 44.5 / 1; rotate 0 → 180° | L87, L284, L304, L428, L440 |
| Close commit to React | `requestAnimationFrame` (generation-checked) → `startTransition(onToggle)` (checked again) | one frame after the close springs start; a close superseded by a reopen does nothing | L147–163, L287–295 |
| Trigger background | CSS `transition: background-color .15s ease` (web) | .08 → .12 hover (CSS `:hover`, dark closed only) → .18 open (dark); hover ramp ~1 frame late vs live = gap 8 | L61–62, L568–574 |
| Option bg and colour (web CSS) | CSS transition | `background-color .15s, color .15s` | L47 |
| Color row open | CSS transition | `background .15s, box-shadow .15s` | ColorPicker.web L106–107 |
| Swatch hover | CSS transition | `transform .15s` → scale 1.08 | L114–115 |
| Picker entrance | CSS keyframes | `orb-cp-enter .16s ease-out`: opacity 0 → 1, translateY 3px → 0, scale .98 → 1; no exit | L118, L120 |
| Format pill | CSS transition | `transform .2s cubic-bezier(.25,1,.5,1)` | L123 |
| Format text | CSS transition | `color .15s` | L124 |
| Reduced motion (CSS) | media query | picker animation and pill transition removed | L148 |
| Slider fill (press, key, external) | `withSpring(target, FILL)` | 300 / 25 / 0.8 | SliderRow L24, L181, L256, L296 |
| Slider drag | direct 1:1 | rubber band `min(18, overshoot·0.25)` | L265–277 |
| Slider rubber-band return | `withSpring(0, BACK)` | 224 / 25.4 / 1 | L25, L291 |
| Slider handle | `withTiming` 150 ms (opacity); springs `HANDLE_X` 439/35.6/1, `HANDLE_Y` 685/47.1/1 | | L159–161 |
| Slider marks | `withTiming(·, 200 ms)` | 0 ↔ 0.35 | L162 |
| Slider JS publish | throttle | ≥ 32 ms apart | L28, L282–286 |
| Copied label | `setTimeout` | 1500 ms | Tuner L121–123 |
| Shimmer sweep (web) | CSS | `orb-shimmer 2s linear infinite`, background-position 200% → −200%; restarts on look change (remount) | Shimmer.web L12, L40; Tuner L410 |
| Shimmer sweep (native) | `withRepeat(withTiming(2w, 2000 ms, linear), −1, false)` | | Shimmer.tsx L26–30 |
| State list, Color text | instant | | |

**Measured motion gaps** (§15.1): 3 (pill early), 4 (close fade early), 7 (select open 0.99 tail ~1 frame late), 8 (closed-trigger hover ramp ~1 frame late), 12 (outside-dismiss low fade ~19 ms early).

## 14. The orb component: compact summary (the full renderer is in `AGENT_PROMPT_ORBS.md`)

**Imports the creator uses** (`Tuner.tsx` L15–17):
```ts
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from './color/color';
import { canUseExtendedColor, OrbView, type OrbLive } from './orb/OrbView';
import { isFlat, RENDERS, type RenderName, type ShapeName } from './orb/model';
```

**`OrbView` props** (`orb/OrbView.tsx` L71–97): every prop is optional.

| Prop | Default | Notes |
|---|---|---|
| `state` | `"base"` | |
| `variant` | none | |
| `size` | 20 | |
| `speed` | 1 | |
| `density` | 1 | |
| `dotSize` | 1 | |
| `tilt` | 20 | |
| `shape` | `"sphere"` | |
| `render` | `"dots"` | |
| `color` | `"#ffffff"` | |
| `active` | `true` | |
| `paused` | `false` | holds the frame (L88; still-frame effect L274–294) |
| `label` | none | `role="img"` + `aria-label`; otherwise `aria-hidden` (L204–206) |
| `className` | none | web box class (L203) |
| `live` | none | `SharedValue<OrbLive>` |
| `onFrame` | none | PNG data URI on unmount |

- **`OrbLive`** (L22–32): `{ size, speed, density, dotSize, tilt, r, g, b, a }`. Only `speed`, `tilt` and `r/g/b/a` are read per frame.
- `canUseExtendedColor()` (L44–48): web true; iOS true except Expo Go; Android false.
- **`OrbView` render logic** (L325–330):
  1. `useDocumentActive()` (L99–117): web listens to `visibilitychange`; native listens to `AppState` `"change"`. Initial: web = document undefined or not hidden; native = `AppState.currentState === "active"`. When not active → return `null` (unmounts the canvas).
  2. `useOrbReduced()` (L118–132): starts `false`, then `AccessibilityInfo.isReduceMotionEnabled()` and subscribes to `reduceMotionChanged`, so it **follows the setting live**. The first frames may animate until the promise resolves. On web this depends on react-native-web's `AccessibilityInfo` (library code; unmeasured beyond the author check that reduced motion holds the canvas hash still).
  3. Otherwise → `<OrbCanvas {...props} reduced={reduced} active={props.active !== false} />`. There is **no host budget placeholder** and no `useSkiaRuntime`: when the document is active the canvas **always mounts**. Each `OrbView` is its own WebGL surface with no global cap in these files.
- Inside `OrbCanvas`, `running = active && !paused && !reduced` (L247). Reduced motion paints one still frame at t = 0 and repaints on prop changes (L274–294).
- **Looks:** the 15 in §5. `resolveLook` (`orbProps.ts`) maps any unknown id to `base`, and `periodOf` (`simulate.ts` L62) guards the yaw, so there is no NaN. Author check: the pasted engine's unknown-look check prints `orb props ok`.
- The creator passes neither `label` nor `paused`. The stage `View` is `aria-hidden` on web. The status orb has no label, so its box is `aria-hidden`.

**Setup the creator depends on** (details §2):
- Skia 2.6.2 exact; `npx setup-skia-web public`; `/canvaskit.wasm` as `application/wasm`;
- web boots through `WithSkiaWeb` in `Playground.web.tsx` (lazy `PlaygroundApp`);
- providers already in `PlaygroundApp`: `GestureHandlerRootView`, `SafeAreaProvider`, `ThemeProvider`.

## 15. Known gaps (desktop) and measured evidence

### 15.1 Known gaps
These are the gaps that belong to the creator. The numbers are shared with `AGENT_PROMPT_ORBS.md`; gap 5 belongs to the orb canvas (that prompt's §16) and also affects both orbs here. **Reproduce the code as it is; don't fix these unless you're told to.**

1. Hue/Opacity track has no keyboard focus ring.
2. Native colour picker is a stub.
3. Pill slide starts ~40 ms early.
4. Close fade starts on pointerup, so it reaches <0.001 ~15–20 ms early.
6. Mobile not covered.
7. **Select open: the 0.99 tail runs about one frame (+10 to +16 ms) behind the original.** Measured (medians): live 202.2 / 203.2 / 201.8 / 201.2 ms vs ours 211.9 / 218.8 / 217.2 / 213.7 ms (held A/B, click A/B) = **+9.7 / +15.6 / +15.4 / +12.5 ms**. Author check: 0.99 at 204–207 ms (no live column).
8. **Closed-trigger hover ramp is about one frame late (20 vs 16 ms).** The trigger fades with `background-color .15s ease` (`SelectRow.tsx` L61–62). Measured; the raw data isn't included here.
9. Font flash on first load: Geist swaps in ~150 ms after paint, ~870 ms on a slow connection. **Note:** that measurement used a deferred window-`load` Geist loader. These files load all weights via `useFonts` on `ThemeProvider` mount (`theme.tsx` L120–130); the flash timing under that path is unmeasured.
10. 5 of 16 look-name labels are 1–4 px narrower.
11. Look-name hit area is the whole row, and the hint has an extra role=navigation wrapper.
12. **Outside-dismiss low fade starts about 19 ms early (pre-existing).** Measured ("fade below 0.001", row / low / band probes): live 281.4 / 278.8 / 267.6 ms vs ours 271.5 / 259.4 / 265.8 ms = −9.9 / **−19.4** / −1.8 ms. The low lead is outside one frame.

(Gap 5, for reference: "P3 canvas look unverified on a real GPU and Safari.")

**Not present in this code** (don't reproduce these):
- The menu staying invisible on a back-to-back reopen. The deferred close is generation-checked and the reopen counters or re-toggles (§6.4.3–§6.4.7). Measured (author check): reopen race 0/108 inconsistent; pointer reopen at 0/8/16/50/120 ms 15/15 open. Measured: race tables all PASS (§15.3).
- `aria-hidden` staying stuck after a reopen. `unseal()` removes both `inert` and `aria-hidden` (L209–213).
- A seed plateau. There is no seed; the open spring starts from the current `shown` in the next frame (L279–285). Measured: plateau none (also in the author check).

### 15.2 Other unverified items
- **Open first-frame jump.** Measured on an earlier revision that focused twice per open: the first visible open frame painted at 0.3237–0.33 in 5/16 runs, under a 5-minute host load of 6–8; a regression couldn't be separated from load at n = 8. The current code focuses once (§6.4.3). Author check on the current code: 0/8 first paints at 0.32 (Shape-click, n = 8). No independent re-measurement.
- **Accessibility deviation (deliberate):** while open, the selected option is the only option with `tabIndex` 0 and takes focus (§6.4.4). Measured: live has 0 tabbable options.
- **Native select open (code reading only, not run):** the native tap path calls `spring(next)` and then `commitJS` = `requestClose()` + `commitRef.current(false)` for both directions (L164–167, L432–433). On a closed menu the close transition returns early (`openRef` is false and `committedOpen` is false, L157), so `onToggle` is never called and React's `open` stays false while `shown` springs to 1. Native has not been run (gap 6). Reproduce the code as it is; don't patch it.
- **Shimmer reduced motion** reads Reanimated's `useReducedMotion()`, not `AccessibilityInfo` the orbs use. Whether it follows a live OS toggle is unmeasured.
- **Light mode** exists in `SelectRow`/`SliderRow` code but can't be reached in the store (nothing calls `toggle`). The picker CSS is dark only, and the select's hover rule matches dark only.
- **A speed change restarts the orb's clock phase** (new `state@speed` key). Unmeasured vs live.
- **Persistence:** **measured: neither live nor ours keeps anything across a reload.** These files use plain `useState` only; nothing survives a remount either.
- **Native (iOS/Android) has not been run** (gap 6).

### 15.3 Measured evidence (select)
**Author checks** (at 1280):
- reopen race: 0/108 inconsistent (108/108 open, console empty);
- pointer reopen at 0/8/16/50/120 ms: 15/15 open, focus on Sphere (the selected option);
- Escape, then Enter, then Escape: 28/28 closed and sealed;
- stale open: 0/32;
- open/close a11y: 24/24 (Render's keyboard focus is the selected option, Dots);
- early clicks at 12/16/32/50 ms: 12/12 closed and sealed;
- open, no plateau: first opacity write 0.069–0.099 at 21–24 ms; 0.99 at 204–207 ms;
- Shape-click first visible, n = 8: median 23 ms; 0/8 first paints at 0.32;
- `tsc --noEmit` on a blank Expo app with the header packages: exited 0 (author check).

**Measured, live vs ours** (medians; host 5-minute load 6–8; the select open/close springs are the same as the current code, the focus path was the earlier double-focus one):
- open held, first visible: live 19.4 vs ours 34.9 ms pooled (n = 8); open click: 18.4 vs 31.5 ms pooled (both marked marginal);
- first painted value: live 0.036–0.153; ours 0.004–0.214 in 11/16 and 0.3237–0.33 in 5/16 (§15.2);
- plateau: none (PASS);
- 0.99: +9.7 / +15.6 / +15.4 / +12.5 ms (gap 7);
- close seal: PASS (both in the first frame);
- fade below 0.001, row / low / band: −9.9 / −19.4 / −1.8 ms (gap 12);
- reopen during the fade (~120–136 ms and ~266–296 ms, n = 3 each): open, opacity 1, unsealed, focus Sphere (PASS);
- races, all PASS for ours: pointer close → reopen 18/18, pointer queued 12/12, keyboard Esc → Enter 6/6, keyboard queued 14/14, busy matrix 12/12, synthetic windows 9/9 open (live isn't a valid reference for the synthetic windows);
- close 21.8–30.2 ms after open: 3/3 closed (sealed, never painted); no late close between 500 ms and 1 s.

## 16. Parity checklist (desktop web, 1280 px window, dark)

**Status key.**
- **Code:** read in the inlined source.
- **Run:** computed by running the inlined files with `npx tsx`.
- **Measured:** a specific measurement, quoted. "Author check" marks a check recorded by the code's author.
- **Gap n:** a known gap (§15.1); reproduce it as-is.
- **Unmeasured:** nobody has measured it.

| # | Check | Expected | Status |
|---|---|---|---|
| 1 | Initial state | Working selected, Sphere, Dots, colour `#ffffff`, Size 320, Speed 1.00, Density 1.00, Dot Size 1.00, Tilt 20; no Reset | Code (Tuner L53–64, L260–265) |
| 2 | Landmarks | `nav` "States" (list), `complementary` panel; stage `aria-hidden` | Code (L287–292, L129, L345–348) |
| 3 | Wide layout | paddingLeft 32 / paddingRight 42; list 280; panel 256, gap 6; stage flex 1, orb wrapper marginRight 24; orb 320 (maxOrb 632 at 800 high) | Code |
| 4 | State list | 15 items in the §5 order; 14/20 Geist 400; selected `#fafafa`, others `#a1a1a1`; 28 px pitch; hint "↑ ↓ to switch" 12/16, marginTop 24 | Code; label widths Gap 10; hit area and wrapper Gap 11 |
| 5 | ↑/↓ on the page | wraps through the 15 looks; ignored in inputs, ranges and sliders, and while a select has focus | Code (useArrowKeys.web L4–23) |
| 6 | Panel rhythm | rows 36 high, gap 6 (42 pitch); Copy row marginTop 10; panel 366 tall with Tilt, 324 without | Code |
| 7 | Select trigger | h36 r8 padH12; system 13/500/19.5 in `rgba(255,255,255,.7)`; chevron 20 px, stroke 2.5, opacity .6; gap 8 | Code |
| 8 | Trigger background | rest `.08`, hover `.12` (CSS, dark closed only), open `.18`; every change fades `background-color .15s ease` | Code (SelectRow L61–62, L568–574); hover ramp ~1 frame late (20 vs 16 ms) = Gap 8 |
| 9 | Select opens on pointer **release** (primary button only); React commits open with `flushSync` | menu committed open in the release handler; a right-click or pointercancel does nothing | Code (SelectRow L394–435, L255–275) |
| 10 | Select open motion | spring starts one frame after the commit, from the current `shown` (no seed, no plateau); MENU 1218/69.8/1: opacity 0 → 1, translateY −8 → 0, scale .95 → 1; chevron 0 → 180° CHEV 685/44.5/1 | Code (L279–285); Measured (author check): first opacity write 0.069–0.099 at 21–24 ms, 0.99 at 204–207 ms; measured: plateau none; 0.99 tail +10 to +16 ms = Gap 7 |
| 11 | Click-open focus | the **selected option** receives focus (`preventScroll`) **once**, and is the only option with `tabIndex` 0 | Code (L214–217, L247–254, L276, L367–370); Measured (author check): pointer reopen focus on Sphere 15/15 |
| 12 | Menu box | top 40 (flips above on overflow), padding 4, r8, border `rgba(255,255,255,.14)`, bg `#212121`, shadow `0 8px 24px rgba(0,0,0,.4)`; options h36 r6, pad 8/10, `#ffffffb3`; hover `#ffffff1f`; selected `#ffffff2e` / `#fffffff2` | Code |
| 13 | Keyboard open | ArrowDown, **ArrowUp**, Enter and Space open and focus the selected option; no page scroll; repeats ignored | Code (L441–447, L453–492) |
| 14 | Keyboard roving | ↑/↓ move without wrapping, Home/End, Enter/Space pick and return focus to the trigger; Escape closes to the trigger; Tab closes and moves on | Code (L493–528) |
| 15 | Typeahead | a letter jumps to the next label starting with it; letters within 700 ms build a prefix; repeated letters cycle | Code (L529–543) |
| 16 | Close seal | a closed menu has `inert` + `aria-hidden="true"`, options `tabIndex −1`; focus inside moves to the trigger; a reopen removes **both** attributes | Code (L199–213, L618); Measured: close seal PASS, first frame |
| 17 | Select close | option click, trigger click, Escape, Tab, outside pointer**down**; CLOSE_MENU (`energyThreshold 1.8e-7`); the React close commits one frame later and is dropped if a reopen superseded it | Code (L287–306); trigger-click close fade early = Gap 4; outside-dismiss low fade ~19 ms early = Gap 12 |
| 18 | Mutual exclusion | opening a select closes the other and the picker; opening the picker closes the selects | Code (Tuner L139–142, L154–157, L167–170) |
| 19 | Color row | h36 `.08` r8, gap 12, pad 0 12; "Color" system 13/500/19.5 `.7`; value Geist Mono 500 13, h25, right-aligned; swatch 20×20 r5 over a checkerboard | Code |
| 20 | Color value editing | Enter or blur commits a valid value as typed (trimmed); invalid → `#ef7777`, and blur reverts; Escape reverts (and closes the picker to the swatch) | Code (ColorPicker.web L573–620) |
| 21 | Picker open and placement | swatch click toggles; fixed 280×350 at `row.left − 288`, `row.top − 32`, clamped with an 8 px edge; focus on the checked format; entrance `.16s ease-out` | Code (L245–304, L118–120) |
| 22 | Picker dismissal | outside pointerdown, focus leaving, Escape (focus to the swatch), Tab out of the first or last control | Code (L281–304, L354–370) |
| 23 | Format tabs | Hex / OKLCH / Display P3 radiogroup; arrows wrap, Home/End; a click reformats the stored text; pill `.2s cubic-bezier(.25,1,.5,1)` | Code; pill early = Gap 3 |
| 24 | Field | 252×160 canvas, P3 context; x = chroma ratio, y = lightness; marker 12 px with a white border; arrows ±0.01, Shift 0.1 | Code; P3 look = Gap 5 |
| 25 | Hue / Opacity | native ranges 0–360 step 0.1 / 0–100 step 1; valuetext "N degrees" / "N percent"; track 16 px, thumb 16×24 | Code; no focus ring = Gap 1 |
| 26 | CSS input | Enter commits; invalid red | Code |
| 27 | Parsing examples | the §7.5 table | Run |
| 28 | Sliders | 5 rows per §8.1; label system 13/500 `.7` at left 10; value Geist Mono 500 at right 12; panel focus ring 2px `.6` at −2px | Code |
| 29 | Slider keys | ←/→ ±1 step, Shift ±10, PageUp/PageDown ±10, Home/End; keys update the orb through `live` and props | Code (SliderRow L193–224) |
| 30 | Slider drag | fill 1:1, rubber band ≤ 18 px, `live` every update, JS ≤ every 32 ms; release springs FILL | Code |
| 31 | Tilt | hidden on Halftone, Lines and Vertical Lines; reset to 20 when leaving them | Code (Tuner L92–95, L233) |
| 32 | Status line | 24 px orb + shimmer, gap 8, bottom 22, translateX −4.6; shimmer 14/20, 2s sweep, **no fade**, restarts on look change | Code |
| 33 | Copy | defaults → `import { Orb } from "@yogesharc/thinking-orbs";\n\n<Orb state="working" size={320} />`; "Copied" for 1500 ms | Run (snippet); Measured: 1504.3 vs 1501.9 ms |
| 34 | Reset | appears only for colour/size/speed/density/dotSize/tilt changes; restores those values, not shape, render or look | Code (L260–281) |
| 35 | Reduced motion (OS, live via `AccessibilityInfo`) | both orbs still at t = 0 and follow the sliders; picker animation and pill transition off | Code (OrbView L118–132, L247, L274–294); Measured (author check): canvas hash holds under prefers-reduced-motion |
| 36 | Reload | nothing persists | Measured: neither live nor ours keeps anything across a reload |
| 37 | Fonts | Geist 400/400i/500/600 and Geist Mono 400/500 via `useFonts` on mount | Gap 9 (flash timing unmeasured under mount-time load) |
| 38 | Mobile, iOS, Android | not covered | Gap 6 |
| 39 | Native colour picker | stub | Gap 2 |
| 40 | Reopen race (as65o) | close then immediately reopen always ends open and consistent | **Measured** (author check): 0/108 inconsistent (108/108 open). Measured: pointer 18/18, queued 12/12, busy matrix 12/12, synthetic 9/9 open |
| 41 | Pointer reopen at 0/8/16/50/120 ms after a close | open, focus on the selected option | **Measured** (author check): 15/15 open, focus on Sphere |
| 42 | Escape, Enter, Escape | ends closed and sealed | **Measured** (author check): 28/28 closed and sealed. Measured: Esc → Enter 6/6 and queued 14/14 open |
| 43 | Stale open | a deferred open never lands after a close | **Measured** (author check): 0/32 stale opens |
| 44 | Early clicks at 12/16/32/50 ms (the exact sequence isn't recorded) | ends closed and sealed | **Measured** (author check): 12/12 closed and sealed. Related, measured: a close 21.8–30.2 ms after an open, 3/3 closed (sealed, never painted) |
| 45 | Shape-click first visible | time from the click to the first visible menu frame; no first paint at 0.32 | **Measured** (author check): median 23 ms (n = 8); 0/8 first paints at 0.32. Measured on an earlier revision that focused twice per open: click pooled 31.5 vs live 18.4 ms, 5/16 first paints at 0.32–0.33 (§15.2) |
| 46 | Web boot | `WithSkiaWeb` loads `PlaygroundApp` async; wasm at `/canvaskit.wasm` as `application/wasm`; no custom index.html | Code (Playground.web L9–11); Measured (author check): export places wasm at dist root; JsiSkApi absent from entry, present in async chunk |
| 47 | No store chrome | no Shape/Render outside the panel; panel `testID` `yogesh-orb-panel`; functional `setMenu` toggle | Code (Tuner L129, L139–142, L154–157); Measured (author check): animates, no store chrome; reopen 0/30 Shape and 0/30 Render; format pill Hex/OKLCH/Display P3; Escape and outside click remove `.orb-cp-format`; Size `aria-valuetext` 320, Shift+ArrowRight → 330; SelectRow sha prefix `e871d315` |
| 48 | NaN / unknown look | unknown ids resolve to base; `periodOf` guards yaw | Code (orbProps `resolveLook`; simulate `periodOf`); Measured (author check): pasted engine unknown-look check prints `orb props ok` |

## 17. Build steps and forbidden actions

**Steps:**
1. Create a blank Expo TypeScript app. Install only the packages in the dependency header (Appendix 0) at those specs, then run `npx setup-skia-web public`.
2. Put every appendix file under `src/` at the path in its title (Appendix 0 is the header comment only — it is already the first lines of each payload file when you paste from the three Copy buttons; when building from these appendices, keep the source files as in Appendices 1–25).
3. Replace `App.tsx` with `export { default } from './src/Playground';`. Babel must include `plugins: ['react-native-worklets/plugin']`.
4. Web: `Playground.web.tsx` loads CanvasKit via `WithSkiaWeb` with `locateFile: (file) => \`/${file}\``. Serve `/canvaskit.wasm` as `application/wasm`. A sub-path host must change the `locateFile` prefix.
5. Typecheck with `npx tsc --noEmit` (author check: exited 0 on a blank Expo app with the header packages). Run with `npx expo start --web` or `npx expo export --platform web` plus a static server. Check §16 at a 1280 px window.

**Forbidden:**
- Browsing, fetching or opening any URL (including the npm paths in the Copy output), or asking anyone to.
- Inventing values, copy, controls, animations or behaviours that aren't in this document or the appendices. Mark unknowns **unmeasured**.
- "Fixing" §15.1 gaps (including the native select open noted in §15.2) unless you're told to. Build the code exactly as inlined.
- Adding store or site chrome (nav, card frame, Copy/prompt buttons, headers) to the asset.
- Changing the Copy format. It deliberately emits web JSX for `@yogesharc/thinking-orbs`.
- Messaging anyone, posting anywhere or publishing anything.

## Appendix index

| # | Path | Payload | Lines | Bytes | sha256 |
|---|---|---|---|---|---|
| 0 | dependency header | all three | 22 | 868 | `e773b272a9dc0aa081b673bb334a0985938008f0e89269800649cb1b852ea978` |
| 1 | `src/Playground.web.tsx` | View | 16 | 471 | `f90f9e994e460bc42276440a4dbc2a1a7218d3b153f068037589cbaa04ae78e9` |
| 2 | `src/Playground.tsx` | View | 2 | 95 | `3546d8ef64c4a7702449d0a5939205063df2ba2a9f7fd23be58cd8707aa12e04` |
| 3 | `src/PlaygroundApp.tsx` | View | 24 | 700 | `29784ea5170d3a0f8baf926a51d5bf7ec95fb8968cc01cbf803fa5d75e2fa9aa` |
| 4 | `src/Tuner.tsx` | View | 453 | 14158 | `b1a2b0656711ff7a567fc3d3f019da026ff0e9252997e6bbd81754abb2723fd4` |
| 5 | `src/orb/OrbView.tsx` | View | 330 | 10417 | `85fdeefcde4937959e03e4399263db908b238b91c19bb9f4af5e440a67b7f9a3` |
| 6 | `src/components/ColorPicker.tsx` | View | 101 | 3270 | `ab94d7f7842328d81476f516f3f8b2e981a6320e30a88a3a47159c1c10976dd2` |
| 7 | `src/components/ColorPicker.web.tsx` | View | 637 | 27020 | `0b47e54b1ceba2b64563b91df7b4e7fe979fbe828e1615efb6a85ef13a35a459` |
| 8 | `src/components/SelectRow.tsx` | View | 640 | 24399 | `e871d3156bf9e3c826d8a89b6aa8244d933c74bf2773dde4a9a464cf185ee6fd` |
| 9 | `src/components/SliderRow.tsx` | View | 416 | 15362 | `9c00d8d535961dbba35c2aae7ef4ce31adc8aa81be665077352b9e1a2a0d3bf2` |
| 10 | `src/components/Shimmer.tsx` | View | 60 | 2183 | `4797c8ef0c3c79ee04d16f50aa4bbbc20d6524db57149088c0d780a066d2904c` |
| 11 | `src/components/Shimmer.web.tsx` | View | 46 | 1711 | `752c2cd00f74edbe4235d9ffb7c9ef62737e99c9b669652f1ef2b66bbdc06b32` |
| 12 | `src/components/icons.tsx` | View | 46 | 2570 | `6febf676134a2fa64a74874f215306a5c18d804e830249d03b5e19b9ce06363d` |
| 13 | `src/theme/theme.tsx` | Style | 163 | 4311 | `45a41b07b8cb1a46e466048a0ed61aca5855c505365d9d75bd93751820e93017` |
| 14 | `src/content/snippet.ts` | Engine | 51 | 1830 | `cd99059783d7aed96684cdec6994fa6230f109f8857ad53d3f34c36893938879` |
| 15 | `src/content/cards.ts` | Engine | 180 | 5117 | `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d` |
| 16 | `src/color/color.ts` | Engine | 238 | 9689 | `c9fe5fa7acee4e033f4d4a36fd33cd92c34413aa155a92704ec4530226f517fe` |
| 17 | `src/hooks/useArrowKeys.ts` | Engine | 2 | 186 | `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258` |
| 18 | `src/hooks/useArrowKeys.web.ts` | Engine | 23 | 925 | `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf` |
| 19 | `src/orb/clock.ts` | Engine | 26 | 687 | `62b73101293bbd0c02a08a759b5ed80d0e1ba0654a4f9f2ae979d93d3fdf0973` |
| 20 | `src/orb/model.ts` | Engine | 184 | 5316 | `c1bf18fc38db285f308997ff3e56bf7c32b2de27b4b15062be9a8b4470259339` |
| 21 | `src/orb/shapes.ts` | Engine | 152 | 5288 | `66a83710f294180c1a301f317747519f73d9c6c6314ad36e4d294c1edad35cce` |
| 22 | `src/orb/simulate.ts` | Engine | 433 | 13389 | `67a78f08b6da4412ac629e8c138d5ffd597f44b3b87db04ca5bf6c8e85b85a65` |
| 23 | `src/orb/draw.ts` | Engine | 133 | 4279 | `7d2285248fea2d544a6340d9a9e8d4454615766c765f243b639f0f3fd21cb788` |
| 24 | `src/orb/orbProps.ts` | Engine | 113 | 3081 | `8e990c10d0a2048898e8b2c85f34f08da51013414547372760116aaa1d5331e2` |
| 25 | `src/orb/LICENSE` | Engine | 21 | 1063 | `1c87dcf3935109d8f8dfa2435aa71dfd28164a1f84d0b243030936fd2062ca57` |

## Appendices: verbatim source

Every file is reproduced byte for byte, in payload order. The fence is longer than any backtick run inside the file. Line numbers in citations count from line 1 of each block.

### Payload header

### Appendix 0. The dependency header (first lines of every payload file)

22 lines, 868 bytes, sha256 `e773b272a9dc0aa081b673bb334a0985938008f0e89269800649cb1b852ea978`. Byte for byte.

```ts
/* Dependencies. Install only these, then run `npx setup-skia-web public`.
 * Web loads CanvasKit itself. No custom index.html.
 * locateFile: (file) => `/${file}` assumes the site root. A sub-path host must change that prefix.
 * Babel: plugins: ['react-native-worklets/plugin']
 * Mount: put these files under src/ and replace App.tsx with `export { default } from './src/Playground'`.
 * expo ~57.0.23
 * react 19.2.3
 * react-dom 19.2.3
 * react-native 0.86.3
 * react-native-web ~0.21.0
 * @shopify/react-native-skia 2.6.2
 * react-native-reanimated 4.5.1
 * react-native-worklets 0.10.1
 * react-native-gesture-handler ~2.32.0
 * react-native-svg 15.15.4
 * expo-constants ~57.0.18
 * expo-clipboard ~57.0.2
 * react-native-safe-area-context ~5.7.0
 * @expo-google-fonts/geist ^0.4.2
 * @expo-google-fonts/geist-mono ^0.4.3
 * @types/react-dom ~19.2.2 (dev)
 */
```

### View payload

### Appendix 1. `src/Playground.web.tsx`

16 lines, 471 bytes, sha256 `f90f9e994e460bc42276440a4dbc2a1a7218d3b153f068037589cbaa04ae78e9`. Byte for byte.

```tsx
import "react-native-gesture-handler";
import "react-native-reanimated";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { View } from "react-native";

export function PlaygroundScreen() {
  return (
    <WithSkiaWeb
      getComponent={() => import("./PlaygroundApp")}
      fallback={<View style={{ flex: 1, backgroundColor: "#000" }} />}
      opts={{ locateFile: (file) => `/${file}` }}
    />
  );
}

export default PlaygroundScreen;
```

### Appendix 2. `src/Playground.tsx`

2 lines, 95 bytes, sha256 `3546d8ef64c4a7702449d0a5939205063df2ba2a9f7fd23be58cd8707aa12e04`. Byte for byte.

```tsx
export { PlaygroundScreen } from "./PlaygroundApp";
export { default } from "./PlaygroundApp";
```

### Appendix 3. `src/PlaygroundApp.tsx`

24 lines, 700 bytes, sha256 `29784ea5170d3a0f8baf926a51d5bf7ec95fb8968cc01cbf803fa5d75e2fa9aa`. Byte for byte.

```tsx
import "react-native-gesture-handler";
import "react-native-reanimated";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Tuner } from "./Tuner";
import { ThemeProvider } from "./theme/theme";

export function PlaygroundScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <ThemeProvider>
            <Tuner />
          </ThemeProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default PlaygroundScreen;
```

### Appendix 4. `src/Tuner.tsx`

453 lines, 14158 bytes, sha256 `b1a2b0656711ff7a567fc3d3f019da026ff0e9252997e6bbd81754abb2723fd4`. Byte for byte.

```tsx
import { setStringAsync } from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';

import { ColorPicker } from './components/ColorPicker';
import { SelectRow } from './components/SelectRow';
import { Shimmer } from './components/Shimmer';
import { SliderRow } from './components/SliderRow';
import { PLAYGROUND } from './content/cards';
import { orbSnippet } from './content/snippet';
import { useArrowKeys } from './hooks/useArrowKeys';
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from './color/color';
import { canUseExtendedColor, OrbView, type OrbLive } from './orb/OrbView';
import { isFlat, RENDERS, type RenderName, type ShapeName } from './orb/model';
import { fonts, useTheme } from './theme/theme';

/**
 * Playground tuner from 9bef3b1 `app/playground.tsx`, without the site header.
 * Layout width is the card, so the same wide / tablet / phone branches run in
 * the space the store actually gives the asset.
 */

const SHAPES: { id: ShapeName; label: string }[] = [
  { id: 'sphere', label: 'Sphere' },
  { id: 'cube', label: 'Cube' },
  { id: 'octahedron', label: 'Octahedron' },
  { id: 'tetrahedron', label: 'Tetrahedron' },
  { id: 'torus', label: 'Torus' },
];

const RENDER_LABEL: Record<RenderName, string> = {
  dots: 'Dots',
  crosses: 'Crosses',
  dashes: 'Dashes',
  halftone: 'Halftone',
  lines: 'Lines',
  mesh: 'Mesh',
  squares: 'Squares',
  verticalLines: 'Vertical Lines',
};

export function Tuner() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1280;
  const { colors, playgroundColor, setPlaygroundColor } = useTheme();
  const [index, setIndex] = useState(1);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];
  const [shape, setShape] = useState<ShapeName>('sphere');
  const [render, setRender] = useState<RenderName>('dots');
  const [size, setSize] = useState(320);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(1);
  const [dotSize, setDotSize] = useState(1);
  const [tilt, setTilt] = useState(20);
  const [exact, setExact] = useState<{ color: Oklch; text: string } | null>(null);
  const [menu, setMenu] = useState<null | 'shape' | 'render'>(null);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const wasFlat = useRef(false);
  const flat = isFlat(render);
  const phone = width < 768;
  const headerH = width >= 768 ? 48 : 72;
  const maxOrb = Math.max(96, height - headerH - 120);
  const shown = Math.min(size, wide ? maxOrb : Math.min(maxOrb, Math.max(96, width - 32)));
  const parsed: Oklch =
    (exact && exact.text === playgroundColor ? exact.color : null) ??
    parseColor(playgroundColor) ?? { l: 1, c: 0, h: 0, a: 1 };
  const rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed);
  const remember = (color: Oklch, text: string) => {
    setExact({ color, text });
    setPlaygroundColor(text);
  };
  const live = useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba });
  const sliding = useRef(false);

  useEffect(
    () => () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (wasFlat.current && !flat) setTilt(20);
    wasFlat.current = flat;
  }, [flat]);

  useEffect(() => {
    if (sliding.current) return;
    live.value = { size: shown, speed, density, dotSize, tilt, ...rgba };
  }, [shown, speed, density, dotSize, tilt, rgba.r, rgba.g, rgba.b, rgba.a, live]);

  const copy = () => {
    const text = orbSnippet({
      state: look.state,
      variant: look.variant,
      size,
      speed,
      density,
      dotSize,
      tilt,
      shape,
      render,
      color: playgroundColor,
      themeDefault: colors.orb,
      flat,
    });
    void setStringAsync(text).then(() => {
      if (!alive.current) return;
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (alive.current) setCopied(false);
      }, 1500);
    });
  };

  const panel = (
    <View
      testID="yogesh-orb-panel"
      role={Platform.OS === 'web' ? 'complementary' : undefined}
      style={{ width: wide ? 256 : '100%', gap: 6, zIndex: 5 }}
    >
      <SelectRow
        label="Shape"
        value={shape}
        display={SHAPES.find((item) => item.id === shape)?.label ?? 'Sphere'}
        options={SHAPES}
        open={menu === 'shape'}
        onToggle={() => {
          setPicker(false);
          setMenu((current) => (current === 'shape' ? null : 'shape'));
        }}
        onPick={(id) => {
          setShape(id);
          setMenu(null);
        }}
      />
      <SelectRow
        label="Render"
        value={render}
        display={RENDER_LABEL[render]}
        options={RENDERS.map((id) => ({ id, label: RENDER_LABEL[id] }))}
        open={menu === 'render'}
        onToggle={() => {
          setPicker(false);
          setMenu((current) => (current === 'render' ? null : 'render'));
        }}
        onPick={(id) => {
          setRender(id);
          setMenu(null);
        }}
      />
      <ColorPicker
        text={playgroundColor}
        color={parsed}
        open={picker}
        onOpenChange={(next) => {
          if (next) setMenu(null);
          setPicker(next);
        }}
        onCommit={(next) => {
          setExact(null);
          setPlaygroundColor(next.trim());
        }}
        onChange={remember}
      />
      <SliderRow
        label="Size"
        min={16}
        max={480}
        step={1}
        value={size}
        decimals={0}
        onChange={setSize}
        live={live}
        field="size"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      <SliderRow
        label="Speed"
        min={0.05}
        max={3}
        step={0.05}
        value={speed}
        decimals={2}
        onChange={setSpeed}
        live={live}
        field="speed"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      <SliderRow
        label="Density"
        min={0.25}
        max={3}
        step={0.05}
        value={density}
        decimals={2}
        onChange={setDensity}
        live={live}
        field="density"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      <SliderRow
        label="Dot Size"
        min={0.25}
        max={3}
        step={0.05}
        value={dotSize}
        decimals={2}
        onChange={setDotSize}
        live={live}
        field="dotSize"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      {flat ? null : (
        <SliderRow
          label="Tilt"
          min={-90}
          max={90}
          step={1}
          value={tilt}
          decimals={0}
          onChange={setTilt}
          live={live}
          field="tilt"
          onDrag={(active) => {
            sliding.current = active;
          }}
        />
      )}
      <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Pressable
          testID="yogesh-orb-export"
          onPress={copy}
          hitSlop={8}
          accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
        >
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
        {playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase() ||
        size !== 320 ||
        speed !== 1 ||
        density !== 1 ||
        dotSize !== 1 ||
        tilt !== 20 ? (
          <Pressable
            onPress={() => {
              setSize(320);
              setSpeed(1);
              setDensity(1);
              setDotSize(1);
              setTilt(20);
              setExact(null);
              setPlaygroundColor(colors.orb);
            }}
            hitSlop={8}
            accessibilityLabel="Reset"
          >
            <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>Reset</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const list = (
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
          return Platform.OS === 'web' ? (
            <View key={item.id} role="listitem">
              <Pressable
                accessibilityRole="button"
                aria-current={on ? 'true' : undefined}
                onPress={() => setIndex(i)}
                hitSlop={{ top: 12, bottom: 12 }}
                style={{ height: 20, justifyContent: 'center' }}
              >
                <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                  {item.playground}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              aria-current={on ? 'true' : undefined}
              onPress={() => setIndex(i)}
              hitSlop={{ top: 12, bottom: 12 }}
              style={{ height: 20, justifyContent: 'center' }}
            >
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                {item.playground}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {wide ? (
        <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 24, marginBottom: -8 }}>
          ↑ ↓ to switch
        </Text>
      ) : null}
    </View>
  );

  const stage = (
    <View
      testID="yogesh-orb-stage"
      accessibilityLabel={Platform.OS === 'web' ? undefined : 'Orb playground'}
      accessibilityElementsHidden={Platform.OS === 'web' ? true : undefined}
      importantForAccessibility={Platform.OS === 'web' ? 'no-hide-descendants' : undefined}
      aria-hidden={Platform.OS === 'web' ? true : undefined}
      style={{
        flex: wide ? 1 : undefined,
        minHeight: phone ? height * 0.6 : wide ? 0 : shown,
        padding: phone ? 32 : 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: phone ? 24 : 0,
      }}
    >
      <View style={wide ? { marginRight: 24 } : undefined}>
        <OrbView
          state={look.state}
          variant={look.variant}
          size={shown}
          speed={speed}
          density={density}
          dotSize={dotSize}
          tilt={tilt}
          shape={shape}
          render={render}
          color={playgroundColor}
          live={live}
        />
      </View>
    </View>
  );

  const status = (
    <View
      testID="yogesh-orb-status"
      pointerEvents="none"
      style={
        wide
          ? {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 22 + insets.bottom,
              zIndex: 6,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transform: [{ translateX: -4.6 }],
            }
          : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'center' }
      }
    >
      <OrbView
        state={look.state}
        variant={look.variant}
        size={24}
        speed={speed}
        density={density}
        dotSize={dotSize}
        tilt={tilt}
        shape={shape}
        render={render}
        color={playgroundColor}
        live={live}
      />
      <Shimmer key={index} text={look.status} style={phone ? { lineHeight: 20 } : undefined} />
    </View>
  );

  return (
    <View
      testID="yogesh-orb-tuner"
      style={{ width: '100%', backgroundColor: colors.page, minHeight: wide ? Math.max(560, shown + 160) : undefined }}
    >
      {menu && Platform.OS !== 'web' ? (
        <Pressable
          onPress={() => setMenu(null)}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 }}
        />
      ) : null}
      {wide ? (
        <View style={{ minHeight: Math.max(520, shown + 120), flexDirection: 'row', alignItems: 'stretch', paddingLeft: 32, paddingRight: 42, zIndex: 5 }}>
          <View style={{ alignSelf: 'center', marginBottom: 8 }}>{list}</View>
          {stage}
          <View style={{ alignSelf: 'center' }}>{panel}</View>
        </View>
      ) : (
        <ScrollView
          style={{ zIndex: 5 }}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: width < 768 ? 24 : 0,
            paddingBottom: (width < 768 ? 24 : 32) + insets.bottom,
          }}
        >
          {list}
          <View>
            {stage}
            {phone ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: 24 }}>{status}</View> : null}
          </View>
          {phone ? null : status}
          <View style={{ marginTop: phone ? 24 : 20 }}>{panel}</View>
        </ScrollView>
      )}
      {wide ? status : null}
    </View>
  );
}
```

### Appendix 5. `src/orb/OrbView.tsx`

330 lines, 10417 bytes, sha256 `85fdeefcde4937959e03e4399263db908b238b91c19bb9f4af5e440a67b7f9a3`. Byte for byte.

```tsx
import { Canvas, Picture, Skia, useCanvasRef, type SkPicture } from "@shopify/react-native-skia";
import { createElement, memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, Platform, View } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useFrameCallback, useSharedValue, runOnUI, type SharedValue } from "react-native-reanimated";
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

function useDocumentActive(): boolean {
  const [active, setActive] = useState(() => {
    if (Platform.OS === "web") {
      return typeof document === "undefined" || document.visibilityState !== "hidden";
    }
    return AppState.currentState === "active";
  });
  useEffect(() => {
    if (Platform.OS === "web") {
      const onChange = () => setActive(document.visibilityState !== "hidden");
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    }
    const sub = AppState.addEventListener("change", (next) => setActive(next === "active"));
    return () => sub.remove();
  }, []);
  return active;
}

function useOrbReduced(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
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
  const focused = useDocumentActive();
  const reduced = useOrbReduced();
  if (!focused) return null;
  return <OrbCanvas {...props} reduced={reduced} active={props.active !== false} />;
});
```

### Appendix 6. `src/components/ColorPicker.tsx`

101 lines, 3270 bytes, sha256 `ab94d7f7842328d81476f516f3f8b2e981a6320e30a88a3a47159c1c10976dd2`. Byte for byte.

```tsx
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { detectFormat, formatColor, parseColor, type Oklch } from "../color/color";
import { fonts, useTheme } from "../theme/theme";

const INVALID_TITLE = "Enter a hex, RGB, HSL, OKLCH, or Display P3 color";

export type ColorPickerProps = {
  text: string;
  color: Oklch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (text: string) => void;
  onChange: (color: Oklch, text: string) => void;
};

/**
 * Native stand-in. Desktop web uses ColorPicker.web.tsx.
 * Mobile layout is a known gap; this keeps the card from crashing.
 */
export function ColorPicker({ text, color, open, onOpenChange, onCommit, onChange }: ColorPickerProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(text);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setDraft(text);
    setInvalid(false);
  }, [text]);
  const commit = () => {
    const trimmed = draft.trim();
    const parsed = parseColor(trimmed);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onCommit(trimmed);
    onChange(parsed, formatColor(parsed, detectFormat(trimmed)));
  };
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          height: 36,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: fonts.regular, fontSize: 13 }}>Color</Text>
        <TextInput
          value={draft}
          onChangeText={(value) => {
            setDraft(value);
            setInvalid(false);
          }}
          onSubmitEditing={commit}
          accessibilityLabel="Color color value"
          aria-invalid={invalid}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            minWidth: 0,
            color: invalid ? "#ef7777" : "rgba(255,255,255,0.7)",
            fontFamily: fonts.mono,
            fontSize: 13,
            textAlign: "right",
            paddingVertical: 4,
          }}
        />
        <Pressable
          testID="yogesh-orb-color-swatch"
          accessibilityRole="button"
          accessibilityLabel="Pick color color"
          onPress={() => onOpenChange(!open)}
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            backgroundColor: formatColor(color, "hex"),
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.26)",
          }}
        />
      </View>
      {open ? (
        <View accessibilityLabel="Color color picker" style={{ borderRadius: 14, backgroundColor: colors.pop, padding: 10, gap: 8 }}>
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 13 }}>{INVALID_TITLE}</Text>
          <Pressable onPress={() => onOpenChange(false)} accessibilityRole="button">
            <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
```

### Appendix 7. `src/components/ColorPicker.web.tsx`

637 lines, 27020 bytes, sha256 `0b47e54b1ceba2b64563b91df7b4e7fe979fbe828e1615efb6a85ef13a35a459`. Byte for byte.

```tsx
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { useFonts } from "expo-font";
import React, { createElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";

import {
  detectFormat,
  displayP3GammaToSrgb,
  formatColor,
  maxChroma,
  oklchToRgb,
  parseColor,
  srgbGammaToDisplayP3,
  type ColorFormat,
  type Oklch,
} from "../color/color";

const TABS: { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "oklch", label: "OKLCH" },
  { id: "p3", label: "Display P3" },
];

const SANS = 'system-ui, -apple-system, "SF Pro Display", sans-serif';
const MONO = "GeistMono_500Medium, ui-monospace, monospace";

type FieldSpace = "srgb" | "p3";

type FieldCanvas = {
  width: number;
  height: number;
  getContext: (kind: "2d", opts?: { colorSpace?: string }) => FieldContext | null;
};

type FieldContext = {
  createImageData: (w: number, h: number) => { data: Uint8ClampedArray };
  putImageData: (data: { data: Uint8ClampedArray }, x: number, y: number) => void;
  getContextAttributes?: () => { colorSpace?: string };
};

type BitmapSpace = "srgb" | "display-p3";

const bitmapSpace = new WeakMap<object, BitmapSpace>();

function isFieldCanvas(node: object | null): node is FieldCanvas {
  return !!node && "getContext" in node && "width" in node && "height" in node;
}

function fieldSpace(format: ColorFormat): FieldSpace {
  return format === "p3" ? "p3" : "srgb";
}

function chromaRatio(color: Oklch, space: FieldSpace) {
  const cap = maxChroma(color.l, color.h, space);
  if (cap <= 0) return 0;
  return Math.min(1, Math.max(0, color.c / cap));
}

function paintField(node: object | null, hue: number, space: FieldSpace) {
  if (!isFieldCanvas(node)) return;
  const ctx = node.getContext("2d", { colorSpace: "display-p3" });
  if (!ctx) return;
  let bitmap = bitmapSpace.get(node);
  if (!bitmap) {
    const reported = ctx.getContextAttributes?.().colorSpace;
    bitmap = reported === "display-p3" ? "display-p3" : "srgb";
    bitmapSpace.set(node, bitmap);
  }
  const w = node.width;
  const h = node.height;
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const l = h <= 1 ? 1 : 1 - y / (h - 1);
    const cap = maxChroma(l, hue, space);
    for (let x = 0; x < w; x++) {
      const c = (w <= 1 ? 0 : x / (w - 1)) * cap;
      let rgb = oklchToRgb({ l, c, h: hue, a: 1 }, space);
      if (bitmap === "display-p3" && space === "srgb") rgb = srgbGammaToDisplayP3(rgb);
      else if (bitmap === "srgb" && space === "p3") rgb = displayP3GammaToSrgb(rgb);
      const i = (y * w + x) * 4;
      image.data[i] = Math.round(255 * Math.min(1, Math.max(0, rgb[0])));
      image.data[i + 1] = Math.round(255 * Math.min(1, Math.max(0, rgb[1])));
      image.data[i + 2] = Math.round(255 * Math.min(1, Math.max(0, rgb[2])));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function hueTrack(color: Oklch, ratio: number, space: FieldSpace) {
  const stops: string[] = [];
  for (let i = 0; i < 73; i++) {
    const h = i * 5;
    stops.push(formatColor({ l: color.l, c: ratio * maxChroma(color.l, h, space), h, a: 1 }, "oklch"));
  }
  return `linear-gradient(to right in oklab, ${stops.join(", ")})`;
}

let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.setAttribute("data-orb-color", "");
  style.textContent = `
.orb-cp-control{box-sizing:border-box;height:36px;width:100%;background:rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 12px;transition:background .15s,box-shadow .15s;font-family:${SANS}}
.orb-cp-control[data-open=true]{background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)}
.orb-cp-label{color:rgba(255,255,255,.7);flex-shrink:0;font-size:13px;font-weight:500;line-height:19.5px;transform:translateY(-.5px)}
.orb-cp-control[data-open=true] .orb-cp-label,.orb-cp-control[data-open=true] .orb-cp-value{color:#fffffff2}
.orb-cp-inputs{flex:1;min-width:0;display:flex;justify-content:flex-end;align-items:center;gap:8px}
.orb-cp-value{width:100%;min-width:0;height:25px;box-sizing:border-box;color:rgba(255,255,255,.7);text-align:right;text-overflow:ellipsis;background:transparent;border:0;outline:none;padding:4px 0;font:500 13px ${MONO};caret-color:rgba(255,255,255,.7)}
.orb-cp-value:focus,.orb-cp-control[data-open=true] .orb-cp-value:focus{color:#fff;caret-color:#fff;outline:none;box-shadow:inset 0 -1px 0 0 rgba(255,255,255,.6)}
.orb-cp-value[aria-invalid=true],.orb-cp-control[data-open=true] .orb-cp-value[aria-invalid=true]{color:#ef7777;caret-color:#ef7777}
.orb-cp-swatch{box-sizing:border-box;border:1px solid rgba(255,255,255,.26);background-color:transparent;background-image:linear-gradient(var(--orb-cp-color),var(--orb-cp-color)),repeating-conic-gradient(#aaa 0% 25%,#eee 0% 50%);background-size:auto,8px 8px;background-position:0 0,0 50%;cursor:pointer;border-radius:5px;flex:0 0 20px;width:20px;height:20px;padding:0;transition:transform .15s;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.orb-cp-swatch:hover{transform:scale(1.08)}
.orb-cp-swatch:focus{outline:none}
.orb-cp-swatch:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-pop{box-sizing:border-box;width:280px;height:350px;z-index:10002;position:fixed;margin:0;padding:10px;display:grid;grid-template-rows:36px 160px auto 36px;gap:6px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#212121;box-shadow:0 8px 32px rgba(0,0,0,.5);color:rgba(255,255,255,.7);font:500 13px/19.5px ${SANS};animation:orb-cp-enter .16s ease-out;overflow:hidden}
.orb-cp-pop *,.orb-cp-pop *::before,.orb-cp-pop *::after{box-sizing:border-box}
@keyframes orb-cp-enter{from{opacity:0;transform:translateY(3px) scale(.98)}to{opacity:1;transform:none}}
.orb-cp-formats{height:36px;background:rgba(255,255,255,.08);border-radius:8px;padding:2px;display:flex;align-items:center}
.orb-cp-seg{position:relative;display:flex;flex:1;min-width:0;padding:2px;border-radius:8px}
.orb-cp-pill{position:absolute;left:2px;top:2px;bottom:2px;width:calc(33.3333% - 1.33333px);border-radius:6px;background:rgba(255,255,255,.18);pointer-events:none;z-index:0;transition:transform .2s cubic-bezier(.25,1,.5,1)}
.orb-cp-format{position:relative;z-index:1;flex:1 1 0;min-width:0;white-space:nowrap;cursor:pointer;background:transparent;border:0;padding:6px 8px;font-family:inherit;font-size:13px;font-weight:500;line-height:19.5px;color:rgba(255,255,255,.7);transition:color .15s}
.orb-cp-format:hover,.orb-cp-format[data-active=true]{color:#fffffff2}
.orb-cp-plane{position:relative;height:160px;border-radius:8px;touch-action:none;cursor:crosshair;user-select:none}
.orb-cp-plane::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.orb-cp-plane:focus{outline:none}
.orb-cp-plane:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-canvas{width:100%;height:100%;display:block;border-radius:inherit;pointer-events:none}
.orb-cp-marker{position:absolute;z-index:1;width:12px;height:12px;margin:-6px;border:2px solid #fff;border-radius:50%;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-tracks{display:grid;gap:6px}
.orb-cp-track-row{height:36px;border-radius:8px;background:rgba(255,255,255,.08);display:flex;align-items:center;gap:12px;padding:0 12px;font-size:13px;font-weight:500}
.orb-cp-track-row>span{flex:0 0 52px;color:rgba(255,255,255,.7)}
.orb-cp-track{appearance:none;-webkit-appearance:none;background:transparent;border:0;flex:1;min-width:0;height:100%;margin:0;padding:0;cursor:pointer;touch-action:none}
.orb-cp-track::-webkit-slider-runnable-track{height:16px;border-radius:4px;background:var(--orb-cp-track)}
.orb-cp-track::-moz-range-track{height:16px;border:0;border-radius:4px;background:var(--orb-cp-track)}
.orb-cp-track::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;width:16px;height:24px;margin-top:-4px;border:2px solid #fff;border-radius:5px;background:var(--orb-cp-thumb);background-clip:padding-box;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-track::-moz-range-thumb{box-sizing:border-box;width:16px;height:24px;border:2px solid #fff;border-radius:5px;background:var(--orb-cp-thumb);background-clip:padding-box;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-track:focus{outline:none}
.orb-cp-track:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-format:focus{outline:none}
.orb-cp-format:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]:focus-visible,[data-testid="yogesh-orb-panel"] [role="slider"]:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-css{width:100%;height:36px;box-sizing:border-box;border:0;border-radius:8px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);padding:0 12px;font:500 13px/19.5px ${MONO};outline:none;caret-color:rgba(255,255,255,.7)}
.orb-cp-css:focus{color:#fff;caret-color:#fff;outline:none}
.orb-cp-css[aria-invalid=true]{color:#ef7777;caret-color:#ef7777}
@media (prefers-reduced-motion:reduce){.orb-cp-pop{animation:none}.orb-cp-pill{transition:none}}
`;
  document.head.appendChild(style);
}

export type ColorPickerProps = {
  text: string;
  color: Oklch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Commit the typed string unchanged. Uppercase hex stays uppercase. */
  onCommit: (text: string) => void;
  onChange: (color: Oklch, text: string) => void;
};

type DomInput = HTMLInputElement;
type DomButton = HTMLButtonElement;

function isFormatButton(node: Element): node is HTMLButtonElement {
  return node instanceof HTMLButtonElement;
}

type FieldPoint = { clientX: number; clientY: number };

export function ColorPicker({ text, color, open, onOpenChange, onCommit, onChange }: ColorPickerProps) {
  useFonts({ GeistMono_500Medium });
  const popId = useId();
  const [format, setFormat] = useState<ColorFormat>(() => detectFormat(text));
  const [rowDraft, setRowDraft] = useState(text);
  const [cssDraft, setCssDraft] = useState(text);
  const [rowInvalid, setRowInvalid] = useState(false);
  const [cssInvalid, setCssInvalid] = useState(false);
  const rowInvalidRef = useRef(false);
  const [heldHue, setHeldHue] = useState(color.h);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const rowInputRef = useRef<DomInput | null>(null);
  const cssInputRef = useRef<DomInput | null>(null);
  const swatchRef = useRef<DomButton | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<FieldCanvas | null>(null);
  const wasOpen = useRef(false);
  const commitRef = useRef<(raw: string) => boolean>(() => false);
  const textRef = useRef(text);
  const onOpenChangeRef = useRef(onOpenChange);
  textRef.current = text;
  onOpenChangeRef.current = onOpenChange;
  const hue = color.c > 1e-7 ? color.h : heldHue;
  const space = fieldSpace(format);
  const ratio = chromaRatio(color, space);
  const opaque = formatColor({ ...color, a: 1 }, "oklch");
  const withAlpha = formatColor(color, "oklch");
  const swatchColor = parseColor(text) ? text.trim() : formatColor(color, "hex");

  commitRef.current = (raw: string) => {
    const trimmed = raw.trim();
    const parsed = parseColor(trimmed);
    if (!parsed) return false;
    setFormat(detectFormat(trimmed));
    rowInvalidRef.current = false;
    setRowInvalid(false);
    setCssInvalid(false);
    setRowDraft(trimmed);
    setCssDraft(trimmed);
    onCommit(trimmed);
    return true;
  };

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const row = rowInputRef.current;
    const css = cssInputRef.current;
    if (document.activeElement !== row) {
      setRowDraft(text);
      rowInvalidRef.current = false;
      setRowInvalid(false);
    }
    if (document.activeElement !== css) {
      setCssDraft(text);
      setCssInvalid(false);
    }
    if (document.activeElement !== row && document.activeElement !== css && parseColor(text)) {
      setFormat(detectFormat(text));
    }
  }, [text]);

  useEffect(() => {
    if (color.c > 1e-7) setHeldHue(color.h);
  }, [color.c, color.h]);

  useLayoutEffect(() => {
    if (!open) return;
    paintField(canvasRef.current, hue, space);
  }, [open, hue, space]);

  const place = () => {
    const row = rowRef.current;
    const pop = popRef.current;
    if (!row || !pop) return;
    const rect = row.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const edge = vw < 768 ? 16 : 8;
    let top = rect.top - 32;
    const maxTop = Math.max(edge, vh - edge - 350);
    if (top < edge) top = edge;
    if (top > maxTop) top = maxTop;
    let left = rect.left - 288;
    const maxLeft = Math.max(edge, vw - edge - 280);
    if (left < edge) left = edge;
    if (left > maxLeft) left = maxLeft;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  };

  const closeToSwatch = () => {
    flushSync(() => onOpenChange(false));
    swatchRef.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    place();
    if (!wasOpen.current) {
      const checked = popRef.current?.querySelector('[role="radio"][aria-checked="true"]');
      if (checked && isFormatButton(checked)) checked.focus({ preventScroll: true });
    }
    wasOpen.current = true;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rowRef.current?.contains(target) || popRef.current?.contains(target)) return;
      flushSync(() => onOpenChangeRef.current(false));
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rowRef.current?.contains(target) || popRef.current?.contains(target)) return;
      flushSync(() => onOpenChangeRef.current(false));
    };
    const onMove = () => place();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onMove);
    document.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  const apply = (next: Oklch, nextFormat = format) => {
    onChange(next, formatColor(next, nextFormat));
  };

  const onFieldPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const node = event.currentTarget;
    event.preventDefault();
    node.focus({ preventScroll: true });
    if (node.setPointerCapture) node.setPointerCapture(event.pointerId);
    const read = (e: FieldPoint) => {
      const rect = node.getBoundingClientRect();
      const l = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)));
      const nextRatio = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width)));
      apply({ l, c: nextRatio * maxChroma(l, hue, space), h: hue, a: color.a });
    };
    read(event);
    const move = (e: globalThis.PointerEvent) => {
      if (!node.hasPointerCapture?.(e.pointerId)) return;
      read(e);
    };
    const end = (e: globalThis.PointerEvent) => {
      if (node.hasPointerCapture?.(e.pointerId)) node.releasePointerCapture(e.pointerId);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", end);
      node.removeEventListener("pointercancel", end);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  };

  const onFieldKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.shiftKey ? 0.1 : 0.01;
    let l = color.l;
    let nextRatio = ratio;
    if (key === "ArrowUp") l += step;
    else if (key === "ArrowDown") l -= step;
    else if (key === "ArrowRight") nextRatio += step;
    else nextRatio -= step;
    l = Math.min(1, Math.max(0, l));
    nextRatio = Math.min(1, Math.max(0, nextRatio));
    apply({ l, c: nextRatio * maxChroma(l, hue, space), h: hue, a: color.a });
  };

  const onPopKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      closeToSwatch();
      return;
    }
    if (event.key !== "Tab" || !popRef.current) return;
    const checked = popRef.current.querySelector('[role="radio"][aria-checked="true"]');
    const first = checked && isFormatButton(checked) ? checked : null;
    const last = cssInputRef.current;
    const leave = (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last);
    if (!leave) return;
    // Focus the swatch, then let the browser Tab onward. Preventing default is what stopped on the swatch.
    swatchRef.current?.focus({ preventScroll: true });
    flushSync(() => onOpenChange(false));
  };

  const onFormatKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.metaKey || event.ctrlKey || !popRef.current) return;
    const buttons = [...popRef.current.querySelectorAll(".orb-cp-format")].filter(isFormatButton);
    const index = buttons.findIndex((b) => b === document.activeElement);
    if (index < 0) return;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    buttons[next].focus({ preventScroll: true });
    buttons[next].click();
  };

  const bindChange = (node: DomInput | null, setInvalid: (invalid: boolean) => void) => {
    if (!node) return;
    const onChange = () => {
      if (node.value === textRef.current) {
        setInvalid(false);
        return;
      }
      if (!commitRef.current(node.value)) setInvalid(true);
    };
    node.addEventListener("change", onChange);
    return () => node.removeEventListener("change", onChange);
  };

  useEffect(
    () =>
      bindChange(rowInputRef.current, (invalid) => {
        rowInvalidRef.current = invalid;
        setRowInvalid(invalid);
      }),
    [text],
  );
  useEffect(() => {
    if (!open) return;
    return bindChange(cssInputRef.current, setCssInvalid);
  }, [open, text]);

  const pop = open
    ? createElement(
        "div",
        {
          ref: popRef,
          className: "orb-cp-pop",
          role: "dialog",
          id: popId,
          "aria-label": "Color color picker",
          "data-testid": "yogesh-orb-color-popover",
          onKeyDown: onPopKey,
        },
        createElement(
          "div",
          { className: "orb-cp-formats" },
          createElement(
            "div",
            { className: "orb-cp-seg", role: "radiogroup", "aria-label": "Color format", onKeyDown: onFormatKey },
            createElement("div", {
              className: "orb-cp-pill",
              "aria-hidden": true,
              style: { transform: `translateX(${TABS.findIndex((tab) => tab.id === format) * 100}%)` },
            }),
            ...TABS.map((tab) => {
              const on = tab.id === format;
              return createElement(
                "button",
                {
                  key: tab.id,
                  type: "button",
                  className: "orb-cp-format",
                  role: "radio",
                  "aria-checked": on,
                  "data-active": String(on),
                  tabIndex: on ? 0 : -1,
                  onClick: () => {
                    setFormat(tab.id);
                    onChange(color, formatColor({ ...color, h: hue }, tab.id));
                  },
                },
                tab.label,
              );
            }),
          ),
        ),
        createElement(
          "div",
          {
            className: "orb-cp-plane",
            role: "group",
            "aria-label": "Color field; use arrow keys to adjust saturation and lightness",
            tabIndex: 0,
            onPointerDown: onFieldPointer,
            onKeyDown: onFieldKey,
          },
          createElement("canvas", {
            ref: canvasRef,
            className: "orb-cp-canvas",
            width: 252,
            height: 160,
            "aria-hidden": true,
          }),
          createElement("span", {
            className: "orb-cp-marker",
            "aria-hidden": true,
            style: {
              left: `${ratio * 100}%`,
              top: `${(1 - color.l) * 100}%`,
              background: opaque,
            },
          }),
        ),
        createElement(
          "div",
          { className: "orb-cp-tracks" },
          createElement(
            "label",
            { className: "orb-cp-track-row" },
            createElement("span", null, "Hue"),
            createElement("input", {
              className: "orb-cp-track",
              type: "range",
              min: 0,
              max: 360,
              step: 0.1,
              value: hue,
              "aria-label": "Hue",
              "aria-valuetext": `${Math.round(hue)} degrees`,
              style: {
                "--orb-cp-track": hueTrack({ ...color, h: hue }, ratio, space),
                "--orb-cp-thumb": opaque,
              },
              onInput: (event: React.FormEvent<HTMLInputElement>) => {
                const h = Number(event.currentTarget.value);
                setHeldHue(h);
                const l = color.l;
                const nextRatio = chromaRatio(color, space);
                apply({ l, c: nextRatio * maxChroma(l, h, space), h, a: color.a });
              },
            }),
          ),
          createElement(
            "label",
            { className: "orb-cp-track-row" },
            createElement("span", null, "Opacity"),
            createElement("input", {
              className: "orb-cp-track orb-cp-op",
              type: "range",
              min: 0,
              max: 100,
              step: 1,
              value: Math.round(color.a * 100),
              "aria-label": "Opacity",
              "aria-valuetext": `${Math.round(color.a * 100)} percent`,
              style: {
                "--orb-cp-track": `linear-gradient(to right, transparent, ${opaque}), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 / 8px 8px`,
                "--orb-cp-thumb": `linear-gradient(${withAlpha}, ${withAlpha}), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 / 8px 8px`,
              },
              onInput: (event: React.FormEvent<HTMLInputElement>) => {
                apply({ l: color.l, c: color.c, h: hue, a: Number(event.currentTarget.value) / 100 });
              },
            }),
          ),
        ),
        createElement("input", {
          ref: cssInputRef,
          className: "orb-cp-css",
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": "CSS color",
          "aria-invalid": cssInvalid ? true : undefined,
          title: text,
          value: cssDraft,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            setCssDraft(event.currentTarget.value);
            setCssInvalid(false);
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const value = event.currentTarget.value;
            if (!commitRef.current(value)) setCssInvalid(true);
          },
        }),
      )
    : null;

  return createElement(
    "div",
    null,
    createElement(
      "div",
      { ref: rowRef, className: "orb-cp-control", "data-open": open ? "true" : "false", "data-testid": "yogesh-orb-color-row" },
      createElement("span", { className: "orb-cp-label" }, "Color"),
      createElement(
        "div",
        { className: "orb-cp-inputs" },
        createElement("input", {
          ref: rowInputRef,
          className: "orb-cp-value",
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": "Color color value",
          "aria-invalid": rowInvalid ? true : undefined,
          title: text,
          value: rowDraft,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            setRowDraft(event.currentTarget.value);
            rowInvalidRef.current = false;
            setRowInvalid(false);
          },
          onBlur: () => {
            if (!rowInvalidRef.current) return;
            rowInvalidRef.current = false;
            flushSync(() => {
              setRowDraft(textRef.current);
              setRowInvalid(false);
            });
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();
            const input = event.currentTarget;
            if (event.key === "Escape") {
              event.preventDefault();
              input.value = text;
              rowInvalidRef.current = false;
              setRowDraft(text);
              setRowInvalid(false);
              if (open) {
                closeToSwatch();
                return;
              }
              input.blur();
              return;
            }
            if (event.key === "Enter") {
              if (commitRef.current(input.value)) input.blur();
              else {
                rowInvalidRef.current = true;
                setRowInvalid(true);
              }
            }
          },
        }),
        createElement("button", {
          ref: swatchRef,
          type: "button",
          className: "orb-cp-swatch",
          "data-testid": "yogesh-orb-color-swatch",
          "aria-label": "Pick color color",
          "aria-haspopup": "dialog",
          "aria-controls": popId,
          "aria-expanded": open,
          style: { "--orb-cp-color": swatchColor },
          onClick: () => onOpenChange(!open),
        }),
      ),
    ),
    pop && typeof document !== "undefined" ? createPortal(pop, document.body) : null,
  );
}
```

### Appendix 8. `src/components/SelectRow.tsx`

640 lines, 24399 bytes, sha256 `e871d3156bf9e3c826d8a89b6aa8244d933c74bf2773dde4a9a464cf185ee6fd`. Byte for byte.

```tsx
import { createElement, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Platform, Pressable, Text, useWindowDimensions, View, type TextStyle, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useTheme } from "../theme/theme";
import { Chevron } from "./icons";

type WebKeyEvent = {
  key?: string;
  repeat?: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
  nativeEvent?: {
    key?: string;
    repeat?: boolean;
    preventDefault?: () => void;
    stopPropagation?: () => void;
  };
};

declare module "react-native" {
  interface ViewProps {
    onKeyDown?: (event: WebKeyEvent) => void;
    onKeyDownCapture?: (event: WebKeyEvent) => void;
    onContextMenu?: () => void;
    onPointerCancel?: () => void;
    dataSet?: Record<string, string>;
  }
}

function pointerButton(event: { button?: number; nativeEvent?: object }): number {
  if (typeof event.button === "number") return event.button;
  const native = event.nativeEvent;
  if (native && "button" in native && typeof native.button === "number") return native.button;
  return 0;
}

function keyName(event: WebKeyEvent): string {
  return event.key ?? event.nativeEvent?.key ?? "";
}

const MENU_FONT = 'system-ui, -apple-system, "SF Pro Display", sans-serif';

/** Dark hover/focus is DialKit `--dial-surface-hover` (#ffffff1f) and `--dial-focus-ring` (#fff9). Selected stays `--dial-surface-active` (#ffffff2e). */
const OPTION_CSS = `[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]{background-color:transparent;color:#ffffffb3;font-family:${MENU_FONT};font-size:13px;font-weight:500;line-height:19.5px;transition:background-color .15s,color .15s}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-label"]{color:#ffffffb3;opacity:1}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:hover{background-color:#ffffff1f}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"][aria-selected="true"]{background-color:#ffffff2e;color:#fffffff2}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"][aria-selected="true"] [data-testid="orb-select-label"]{color:#fffffff2}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:focus-visible{background-color:#ffffff1f;color:#fff;outline:2px solid #fff9;outline-offset:-2px}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:focus-visible [data-testid="orb-select-label"]{color:#fff;opacity:1}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]{color:#0009}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-label"]{color:#0009}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:hover{background-color:#00000014}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"][aria-selected="true"]{background-color:#0000001a;color:#000000e6}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"][aria-selected="true"] [data-testid="orb-select-label"]{color:#000000e6}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:focus-visible{background-color:#00000014;color:#000;outline:2px solid #0000008c;outline-offset:-2px}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:focus-visible [data-testid="orb-select-label"]{color:#000}
[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]{transition:background-color .15s ease}
[data-testid="yogesh-orb-panel"] [data-orb-trigger="dark"][aria-expanded="false"]:hover{background-color:rgba(255,255,255,.12)!important}`;

function injectOptionStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("orb-select-option-css")) return;
  const style = document.createElement("style");
  style.id = "orb-select-option-css";
  style.textContent = OPTION_CSS;
  document.head.appendChild(style);
}

const MENU_TEXT: TextStyle = {
  fontFamily: MENU_FONT,
  fontSize: 13,
  fontWeight: "500",
  lineHeight: 19.5,
};
const OPTION_BOX: ViewStyle = {
  height: 36,
  borderRadius: 6,
  paddingVertical: 8,
  paddingHorizontal: 10,
};

const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
/** Web close only (dismissWeb, onEnd web close). Same stiffness, damping, and mass as MENU; energyThreshold is the only difference. Native close stays on MENU. */
const CLOSE_MENU = { stiffness: MENU.stiffness, damping: MENU.damping, mass: MENU.mass, energyThreshold: 1.8e-7 };

export function SelectRow<T extends string>({
  label,
  value,
  options,
  open,
  onToggle,
  onPick,
  display,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  open: boolean;
  onToggle: () => void;
  onPick: (id: T) => void;
  display: string;
}) {
  const { colors, mode } = useTheme();
  const { height: windowH } = useWindowDimensions();
  const rowRef = useRef<View>(null);
  const menuRef = useRef<View>(null);
  const [above, setAbove] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((option) => option.id === value)));
  const focusOnOpen = useRef(false);
  const typed = useRef({ buf: "", at: 0 });
  const aboveSV = useSharedValue(0);
  const shown = useSharedValue(open ? 1 : 0);
  const chevron = useSharedValue(open ? 1 : 0);
  const openSV = useSharedValue(open ? 1 : 0);
  const goal = useSharedValue(open ? 1 : 0);
  const armed = useRef(false);
  const sawOpen = useRef(false);
  const primary = useSharedValue(0);
  const openRef = useRef(open);
  const committedOpen = useRef(open);
  const epoch = useRef(0);
  const appliedEpoch = useRef(0);
  const closeDelivered = useRef(false);
  const toggleRef = useRef(onToggle);
  const openFrame = useRef(0);
  const closeFrame = useRef(0);
  const requestClose = () => {
    epoch.current += 1;
    openRef.current = false;
  };
  const cancelOpenFrame = () => {
    if (openFrame.current === 0) return;
    cancelAnimationFrame(openFrame.current);
    openFrame.current = 0;
  };
  const cancelCloseFrame = () => {
    if (closeFrame.current === 0) return;
    cancelAnimationFrame(closeFrame.current);
    closeFrame.current = 0;
  };
  const commitRef = useRef((opening: boolean) => {
    if (opening) {
      if (!openRef.current) return;
      appliedEpoch.current = epoch.current;
      armed.current = true;
      onToggle();
      return;
    }
    const gen = epoch.current;
    startTransition(() => {
      if (gen !== epoch.current || openRef.current || !committedOpen.current) return;
      closeDelivered.current = true;
      appliedEpoch.current = gen;
      armed.current = true;
      onToggle();
    });
  });
  const commitJS = useCallback(() => {
    requestClose();
    commitRef.current(false);
  }, []);
  const web = Platform.OS === "web";
  useLayoutEffect(() => {
    if (web) injectOptionStyles();
  }, [web]);
  const optionsInRow = (): HTMLElement[] => {
    const host: unknown = rowRef.current;
    if (typeof host !== "object" || host === null || !("querySelectorAll" in host)) return [];
    const query = host.querySelectorAll;
    if (typeof query !== "function") return [];
    const raw: unknown = query.call(host, '[role="option"]');
    if (typeof raw !== "object" || raw === null || !("length" in raw) || typeof raw.length !== "number") return [];
    if (!("item" in raw) || typeof raw.item !== "function") return [];
    const nodes: HTMLElement[] = [];
    for (let i = 0; i < raw.length; i++) {
      const item: unknown = raw.item(i);
      if (item instanceof HTMLElement) nodes.push(item);
    }
    return nodes;
  };
  const focusTrigger = () => {
    const host: unknown = rowRef.current;
    if (typeof host !== "object" || host === null || !("querySelector" in host)) return;
    const query = host.querySelector;
    if (typeof query !== "function") return;
    const node: unknown = query.call(host, '[aria-haspopup="listbox"]');
    if (node instanceof HTMLElement) node.focus({ preventScroll: true });
  };
  const menuEl = (): HTMLElement | null => {
    const node: unknown = menuRef.current;
    return node instanceof HTMLElement ? node : null;
  };
  const sealClosed = () => {
    if (openRef.current) return;
    cancelOpenFrame();
    const menu = menuEl();
    if (!menu) return;
    if (typeof document !== "undefined" && document.activeElement instanceof Node && menu.contains(document.activeElement)) focusTrigger();
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    for (const node of optionsInRow()) node.tabIndex = -1;
  };
  const unseal = () => {
    const menu = menuEl();
    menu?.removeAttribute("inert");
    menu?.removeAttribute("aria-hidden");
  };
  const unsealForPointer = () => {
    unseal();
    focusOnOpen.current = true;
  };
  const sealRef = useRef(sealClosed);
  const unsealPtrRef = useRef(unsealForPointer);
  useLayoutEffect(() => {
    toggleRef.current = onToggle;
    commitRef.current = (opening: boolean) => {
      if (opening) {
        if (!openRef.current) return;
        appliedEpoch.current = epoch.current;
        armed.current = true;
        onToggle();
        return;
      }
      const gen = epoch.current;
      startTransition(() => {
        if (gen !== epoch.current || openRef.current || !committedOpen.current) return;
        closeDelivered.current = true;
        appliedEpoch.current = gen;
        armed.current = true;
        onToggle();
      });
    };
    sealRef.current = sealClosed;
    unsealPtrRef.current = unsealForPointer;
  });
  const sealJS = useCallback(() => {
    requestClose();
    sealRef.current();
  }, []);
  const unsealPtrJS = useCallback(() => unsealPtrRef.current(), []);
  const focusSelected = () => {
    focusOnOpen.current = false;
    const nodes = optionsInRow();
    const selected = nodes.find((node) => node.getAttribute("aria-selected") === "true");
    const target = selected ?? nodes[0];
    for (const node of nodes) node.tabIndex = node === target ? 0 : -1;
    target?.focus({ preventScroll: true });
  };
  const commitOpen = useCallback(() => {
    cancelCloseFrame();
    epoch.current += 1;
    openRef.current = true;
    const delivered = closeDelivered.current;
    let committed = false;
    if (delivered && committedOpen.current) {
      const gen = epoch.current;
      let countered = false;
      startTransition(() => {
        if (gen !== epoch.current || !openRef.current) return;
        closeDelivered.current = false;
        countered = true;
        toggleRef.current();
      });
      if (countered) armed.current = false;
    } else if (delivered || !committedOpen.current) {
      closeDelivered.current = false;
      flushSync(() => commitRef.current(true));
      committed = true;
    }
    if (committedOpen.current && !committed) focusSelected();
    openSV.value = 1;
    goal.value = 1;
    cancelOpenFrame();
    openFrame.current = requestAnimationFrame(() => {
      openFrame.current = 0;
      if (openSV.value !== 1) return;
      shown.value = withSpring(1, MENU);
      chevron.value = withSpring(1, CHEV);
    });
  }, [chevron, goal, openSV, shown]);
  const commitNextFrame = useCallback(() => {
    cancelCloseFrame();
    const gen = epoch.current;
    closeFrame.current = requestAnimationFrame(() => {
      closeFrame.current = 0;
      if (gen !== epoch.current || openRef.current) return;
      commitRef.current(false);
    });
  }, []);
  const dismissWeb = useCallback(() => {
    if (openSV.value !== 1) return;
    requestClose();
    cancelOpenFrame();
    sealClosed();
    openSV.value = 0;
    goal.value = 0;
    shown.value = withSpring(0, CLOSE_MENU);
    chevron.value = withSpring(0, CHEV);
    commitNextFrame();
  }, [chevron, commitNextFrame, goal, openSV, shown]);
  useEffect(() => {
    if (!web || !open || typeof document === "undefined") return;
    const inside = (target: EventTarget | null) => {
      const host: unknown = rowRef.current;
      if (typeof host !== "object" || host === null || !("contains" in host) || typeof host.contains !== "function") return false;
      return target instanceof Node && host.contains(target) === true;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissWeb();
      focusTrigger();
    };
    const onOutside = (event: Event) => {
      if (inside(event.target)) return;
      dismissWeb();
    };
    document.addEventListener("keydown", onKey, { passive: true });
    document.addEventListener(OUTSIDE_CLOSE_EVENT, onOutside, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener(OUTSIDE_CLOSE_EVENT, onOutside);
    };
  }, [dismissWeb, open, web]);
  useLayoutEffect(() => {
    committedOpen.current = open;
    if (open === openRef.current) {
      closeDelivered.current = false;
      appliedEpoch.current = epoch.current;
      return;
    }
    if (!open && closeDelivered.current && openRef.current) {
      closeDelivered.current = false;
      appliedEpoch.current = epoch.current;
      armed.current = true;
      onToggle();
      return;
    }
    if (!open && epoch.current === appliedEpoch.current && !closeDelivered.current) openRef.current = false;
  }, [open, onToggle]);
  useLayoutEffect(() => {
    if (!open && openRef.current) return;
    openSV.value = open ? 1 : 0;
  }, [open, openSV]);
  useLayoutEffect(() => {
    if (!sawOpen.current) {
      sawOpen.current = true;
      return;
    }
    if (armed.current) {
      armed.current = false;
      return;
    }
    goal.value = open ? 1 : 0;
    shown.value = withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU);
    chevron.value = withSpring(open ? 1 : 0, CHEV);
  }, [open, chevron, goal, shown, web]);
  useLayoutEffect(() => {
    if (open) return;
    setActive(Math.max(0, options.findIndex((option) => option.id === value)));
  }, [open, options, value]);
  useLayoutEffect(() => {
    if (!web || !open || !focusOnOpen.current) return;
    focusSelected();
  }, [open, options, value, web]);
  const place = () => {
    rowRef.current?.measureInWindow((_x, y, _w, h) => {
      const menuH = 8 + options.length * 36;
      const next = y + h + menuH + 8 > windowH;
      aboveSV.value = next ? 1 : 0;
      setAbove(next);
    });
  };
  useEffect(() => {
    place();
  }, [windowH, options.length]);
  useEffect(() => {
    return () => {
      if (openFrame.current !== 0) {
        cancelAnimationFrame(openFrame.current);
        openFrame.current = 0;
      }
      if (closeFrame.current !== 0) {
        cancelAnimationFrame(closeFrame.current);
        closeFrame.current = 0;
      }
    };
  }, []);
  const mountOnPress = (event: { button?: number; nativeEvent?: object }) => {
    primary.value = pointerButton(event) === 0 ? 1 : 0;
  };
  const cancelClosed = () => {
    primary.value = 0;
    if (openSV.value === 1) return;
    goal.value = 0;
    shown.value = 0;
  };
  const tap = useMemo(() => {
    const spring = (next: number) => {
      "worklet";
      goal.value = next;
      shown.value = withSpring(next, MENU);
      chevron.value = withSpring(next, CHEV);
    };
    return Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onEnd(() => {
        const next = openSV.value === 1 ? 0 : 1;
        if (web) {
          const fromPointer = primary.value === 1;
          primary.value = 0;
          if (!fromPointer) return;
          openSV.value = next;
          goal.value = next;
          if (next === 1) {
            runOnJS(unsealPtrJS)();
            runOnJS(commitOpen)();
            return;
          }
          runOnJS(sealJS)();
          shown.value = withSpring(0, CLOSE_MENU);
          chevron.value = withSpring(0, CHEV);
          runOnJS(commitNextFrame)();
          return;
        }
        spring(next);
        runOnJS(commitJS)();
      });
  }, [chevron, commitJS, commitNextFrame, commitOpen, goal, openSV, primary, sealJS, shown, unsealPtrJS, web]);
  const menuStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * (aboveSV.value ? 8 : -8) }, { scale: 0.95 + shown.value * 0.05 }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value * 180}deg` }] }));
  const openFromKeys = () => {
    const index = Math.max(0, options.findIndex((option) => option.id === value));
    setActive(index);
    focusOnOpen.current = true;
    unseal();
    commitOpen();
  };
  const moveTo = (index: number, nodes: HTMLElement[]) => {
    const next = Math.max(0, Math.min(nodes.length - 1, index));
    setActive(next);
    nodes[next]?.focus({ preventScroll: true });
  };
  const onKeyDownCapture = (event: WebKeyEvent) => {
    const key = keyName(event);
    if (key === "Tab") {
      if (openSV.value !== 1) return;
      sealClosed();
      dismissWeb();
      return;
    }
    if (key === "Escape") {
      if (openSV.value !== 1) return;
      event.preventDefault();
      event.nativeEvent?.preventDefault?.();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      event.nativeEvent?.preventDefault?.();
      event.stopPropagation();
      if (openSV.value === 1) {
        const nodes = optionsInRow();
        nodes[active]?.focus();
        return;
      }
      openFromKeys();
      return;
    }
    if (key !== "Enter" && key !== " " && key !== "Spacebar") return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
    event.stopPropagation();
    event.nativeEvent?.stopPropagation?.();
    if (event.repeat || event.nativeEvent?.repeat) return;
    if (openSV.value === 1) {
      dismissWeb();
      return;
    }
    openFromKeys();
  };
  const onOptionKey = (event: WebKeyEvent & { altKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }, index: number) => {
    if (!open) return;
    const nodes = optionsInRow();
    const key = keyName(event);
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      event.stopPropagation();
      if (key === "ArrowDown") moveTo(index + 1, nodes);
      else if (key === "ArrowUp") moveTo(index - 1, nodes);
      else if (key === "Home") moveTo(0, nodes);
      else moveTo(nodes.length - 1, nodes);
      return;
    }
    if (key === "Enter" || key === " " || key === "Spacebar") {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
      sealClosed();
      onPick(options[index].id);
      focusTrigger();
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key === "Tab") {
      event.stopPropagation();
      sealClosed();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key.length !== 1 || key === " " || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    const t = typed.current;
    t.buf = now - t.at < 700 ? t.buf + key.toLowerCase() : key.toLowerCase();
    t.at = now;
    const q = [...t.buf].every((c) => c === t.buf[0]) ? t.buf[0] : t.buf;
    for (let n = q.length > 1 ? 0 : 1; n <= options.length; n++) {
      const i = (index + n) % options.length;
      if (options[i].label.toLowerCase().startsWith(q)) {
        moveTo(i, nodes);
        return;
      }
    }
  };
  const menuInk = mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const triggerText: TextStyle = {
    ...MENU_TEXT,
    color: menuInk,
    transform: [{ translateY: -0.5 }],
  };
  return (
    <View ref={rowRef} onLayout={place} style={{ zIndex: open ? 20 : 1 }}>
      <GestureDetector gesture={tap} touchAction="pan-y">
        <View
          accessible
          accessibilityRole="button"
          aria-haspopup={web ? "listbox" : undefined}
          aria-expanded={web ? open : undefined}
          dataSet={{ orbTrigger: mode }}
          collapsable={false}
          onPointerDown={web ? mountOnPress : undefined}
          onContextMenu={web ? cancelClosed : undefined}
          onPointerCancel={web ? cancelClosed : undefined}
          onKeyDownCapture={Platform.OS === "web" ? onKeyDownCapture : undefined}
          style={{
            height: 36,
            borderRadius: 8,
            backgroundColor: open
              ? mode === "dark"
                ? "rgba(255,255,255,0.18)"
                : "rgba(0,0,0,0.10)"
              : mode === "dark"
                ? "rgba(255,255,255,0.08)"
                : colors.row,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={triggerText}>{label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={triggerText}>{display}</Text>
            <Animated.View style={chevronStyle}>
              <Chevron color={menuInk} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
      <Animated.View
          ref={menuRef}
          pointerEvents={open ? "auto" : "none"}
          focusable={false}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? "auto" : "no-hide-descendants"}
          aria-hidden={!open}
          style={[
            {
              position: "absolute",
              top: above ? undefined : 40,
              bottom: above ? 40 : undefined,
              left: 0,
              right: 0,
              backgroundColor: mode === "light" ? "#fafafa" : colors.pop,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: mode === "light" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.14)",
              padding: 4,
              zIndex: 30,
              boxShadow: mode === "dark" ? "0 8px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.08)",
            },
            menuStyle,
          ]}
        >
          {web
            ? createElement(
                "div",
                { role: "listbox", "aria-label": label, className: mode === "light" ? "orb-select-menu is-light" : "orb-select-menu", inert: open ? undefined : true },
                options.map((option, index) => {
                  const on = option.id === value;
                  const tabbable = open && index === active;
                  return (
                    <Pressable key={option.id} role="option" tabIndex={tabbable ? 0 : -1} focusable={tabbable} accessibilityState={{ selected: on }} aria-selected={on} testID="orb-select-option" onKeyDown={(event) => onOptionKey(event, index)} onPress={() => { requestClose(); sealClosed(); onPick(option.id); focusTrigger(); }} style={OPTION_BOX}>
                      <Text testID="orb-select-label" style={MENU_TEXT}>{option.label}</Text>
                    </Pressable>
                  );
                }),
              )
            : options.map((option) => {
                const on = option.id === value;
                return (
                  <Pressable key={option.id} accessibilityRole="menuitem" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={[OPTION_BOX, { backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }]}>
                    <Text style={{ ...MENU_TEXT, color: colors.fg, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                  </Pressable>
                );
              })}
        </Animated.View>
    </View>
  );
}
```

### Appendix 9. `src/components/SliderRow.tsx`

416 lines, 15362 bytes, sha256 `9c00d8d535961dbba35c2aae7ef4ce31adc8aa81be665077352b9e1a2a0d3bf2`. Byte for byte.

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

### Appendix 10. `src/components/Shimmer.tsx`

60 lines, 2183 bytes, sha256 `4797c8ef0c3c79ee04d16f50aa4bbbc20d6524db57149088c0d780a066d2904c`. Byte for byte.

```tsx
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Canvas, LinearGradient, Mask, Rect, Text, useFont, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Text as RNText, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { fonts, useTheme } from "../theme/theme";

/** Native sweep. Web keeps the CSS version in Shimmer.web.tsx. Not an orb canvas. */
export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const size = typeof style?.fontSize === "number" ? style.fontSize : 14;
  const font = useFont(Geist_400Regular, size);
  const shift = useSharedValue(0);
  const width = font ? Math.max(1, Math.ceil(font.getTextWidth(text))) : Math.max(1, Math.ceil(text.length * size * 0.56));
  const height = Math.ceil(size * 1.45);

  useEffect(() => {
    if (reduced) return;
    shift.value = -width * 2;
    shift.value = withRepeat(withTiming(width * 2, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [reduced, shift, text, width]);

  const start = useDerivedValue(() => vec(shift.value, 0));
  const end = useDerivedValue(() => vec(shift.value + width * 2, 0));

  if (reduced || !font) {
    return (
      <RNText style={[{ color: colors.muted, fontFamily: style?.fontFamily ?? fonts.regular, fontSize: size, fontStyle: style?.fontStyle }, style]}>
        {text}
      </RNText>
    );
  }

  return (
    <Animated.View>
      <Canvas style={{ width, height }}>
        <Mask mode="alpha" mask={<Text x={0} y={size} text={text} font={font} color="white" />}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={start}
              end={end}
              mode="repeat"
              colors={[colors.muted, colors.muted, colors.fg, colors.muted, colors.muted]}
              positions={[0, 0.35, 0.5, 0.65, 1]}
            />
          </Rect>
        </Mask>
      </Canvas>
    </Animated.View>
  );
}
```

### Appendix 11. `src/components/Shimmer.web.tsx`

46 lines, 1711 bytes, sha256 `752c2cd00f74edbe4235d9ffb7c9ef62737e99c9b669652f1ef2b66bbdc06b32`. Byte for byte.

```tsx
import { useEffect } from "react";
import { Platform, type TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useTheme, fonts } from "../theme/theme";

let injected = false;
function injectKeyframes() {
  if (injected || Platform.OS !== "web" || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`;
  document.head.appendChild(style);
}

/** Status label. Full opacity on the first frame. Remount (key by look index) restarts the sweep. */
export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    injectKeyframes();
  }, []);
  const sweep = !reduced;
  return (
    <span
      style={{
        fontFamily: typeof style?.fontFamily === "string" ? style.fontFamily : fonts.regular,
        fontSize: typeof style?.fontSize === "number" ? style.fontSize : 14,
        fontStyle: style?.fontStyle,
        lineHeight: typeof style?.lineHeight === "number" ? `${style.lineHeight}px` : "20px",
        display: "inline-block",
        opacity: 1,
        backgroundImage: sweep
          ? `linear-gradient(90deg, ${colors.muted} 35%, ${colors.fg} 50%, ${colors.muted} 65%)`
          : undefined,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: sweep ? "transparent" : colors.muted,
        animation: sweep ? "orb-shimmer 2s linear infinite" : undefined,
      }}
    >
      {text}
    </span>
  );
}
```

### Appendix 12. `src/components/icons.tsx`

46 lines, 2570 bytes, sha256 `6febf676134a2fa64a74874f215306a5c18d804e830249d03b5e19b9ce06363d`. Byte for byte.

```tsx
import { createElement } from "react";
import { Platform } from "react-native";
import Svg, { Path } from "react-native-svg";

const decorative = Platform.OS === "web" ? { "aria-hidden": true } : {};

export function GithubIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...decorative}>
      <Path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
    </Svg>
  );
}

export function DrayIcon({ color, height = 12 }: { color: string; height?: number }) {
  const width = (height * 76) / 96;
  return (
    <Svg width={width} height={height} viewBox="0 0 76 96" fill={color} {...decorative}>
      <Path d="M48.2787 0C49.9989 5.053e-08 51.3934 1.4046 51.3934 3.13726V8.78431C51.3934 17.4476 58.3661 24.4706 66.9672 24.4706H72.8852C74.6055 24.4706 76 25.8752 76 27.6078V68.3922C76 70.1248 74.6055 71.5294 72.8852 71.5294H66.9672C58.3661 71.5294 51.3934 78.5524 51.3934 87.2157V92.8627C51.3934 94.5954 49.9989 96 48.2787 96H0.155738C0.0697261 96 0 95.9298 0 95.8431V64.7843C0 64.6977 0.0697261 64.6275 0.155738 64.6275H29.2787C37.8798 64.6275 44.8525 57.6045 44.8525 48.9412V47.0588C44.8525 38.3955 37.8798 31.3726 29.2787 31.3726H0.155738C0.0697261 31.3726 0 31.3023 0 31.2157V0.156863C0 0.0702299 0.0697261 0 0.155738 0H48.2787Z" />
    </Svg>
  );
}

export function Chevron({ color, size = 20 }: { color: string; size?: number }) {
  if (Platform.OS === "web") {
    return createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        style: { width: size, height: size, padding: 2, opacity: 0.6, boxSizing: "border-box", color },
      },
      createElement("path", { d: "M6 9.5L12 15.5L18 9.5" }),
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9.5L12 15.5L18 9.5" />
    </Svg>
  );
}
```

### Style payload

### Appendix 13. `src/theme/theme.tsx`

163 lines, 4311 bytes, sha256 `45a41b07b8cb1a46e466048a0ed61aca5855c505365d9d75bd93751820e93017`. Byte for byte.

```tsx
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_400Regular_Italic } from "@expo-google-fonts/geist/400Regular_Italic";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono/400Regular";
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { useFonts } from "expo-font";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  useFonts({
    Geist: Geist_400Regular,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_400Regular_Italic,
    GeistMono_400Regular,
    GeistMono_500Medium,
    "Geist Mono": GeistMono_400Regular,
  });
  const [mode, setMode] = useState<Mode>("dark");
  const [playgroundColor, setPlaygroundColor] = useState(dark.orb);
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

### Engine payload

### Appendix 14. `src/content/snippet.ts`

51 lines, 1830 bytes, sha256 `cd99059783d7aed96684cdec6994fa6230f109f8857ad53d3f34c36893938879`. Byte for byte.

```ts
import type { RenderName, ShapeName } from "../orb/model";

const DEFAULTS: Record<string, string | number> = { variant: "default", size: 20, speed: 1, density: 1, dotSize: 1, tilt: 20 };

/**
 * Web JSX snippet, verbatim format from the live playground Copy button.
 * Non-default props only, plus shape/render imports and className for a custom color.
 */
export function orbSnippet(opts: {
  state: string;
  variant?: string;
  size: number;
  speed: number;
  density: number;
  dotSize: number;
  tilt: number;
  shape: ShapeName;
  render: RenderName;
  color: string;
  themeDefault: string;
  flat: boolean;
}): string {
  const entries: [string, string | number | undefined][] = [
    ["state", opts.state],
    ["variant", opts.variant && opts.variant !== "default" ? opts.variant : "default"],
    ["speed", opts.speed],
    ["density", opts.density],
    ["dotSize", opts.dotSize],
    ["tilt", opts.flat ? undefined : opts.tilt],
    ["size", opts.size],
  ];
  const props: string[] = [];
  for (const [key, value] of entries) {
    if (value === undefined) continue;
    if (key in DEFAULTS && value === DEFAULTS[key]) continue;
    props.push(typeof value === "string" ? `${key}="${value}"` : `${key}={${value}}`);
  }
  const imports = ['import { Orb } from "@yogesharc/thinking-orbs";'];
  if (opts.shape !== "sphere") {
    props.push(`shape={${opts.shape}}`);
    imports.push(`import { ${opts.shape} } from "@yogesharc/thinking-orbs/shapes";`);
  }
  if (opts.render !== "dots") {
    props.push(`render={${opts.render}}`);
    imports.push(`import { ${opts.render} } from "@yogesharc/thinking-orbs/renders";`);
  }
  if (opts.color.toLowerCase() !== opts.themeDefault.toLowerCase()) {
    props.push(`className="text-[${opts.color}]"`);
  }
  return `${imports.join("\n")}\n\n<Orb ${props.join(" ")} />`;
}
```

### Appendix 15. `src/content/cards.ts`

180 lines, 5117 bytes, sha256 `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d`. Byte for byte.

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

### Appendix 16. `src/color/color.ts`

238 lines, 9689 bytes, sha256 `c9fe5fa7acee4e033f4d4a36fd33cd92c34413aa155a92704ec4530226f517fe`. Byte for byte.

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

### Appendix 17. `src/hooks/useArrowKeys.ts`

2 lines, 186 bytes, sha256 `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258`. Byte for byte.

```ts
/** Native: hardware arrows are a no-op. Web implementation is useArrowKeys.web.ts. */
export function useArrowKeys(_count: number, _index: number, _onIndex: (index: number) => void) {}
```

### Appendix 18. `src/hooks/useArrowKeys.web.ts`

23 lines, 925 bytes, sha256 `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf`. Byte for byte.

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

### Appendix 19. `src/orb/clock.ts`

26 lines, 687 bytes, sha256 `62b73101293bbd0c02a08a759b5ed80d0e1ba0654a4f9f2ae979d93d3fdf0973`. Byte for byte.

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

### Appendix 20. `src/orb/model.ts`

184 lines, 5316 bytes, sha256 `c1bf18fc38db285f308997ff3e56bf7c32b2de27b4b15062be9a8b4470259339`. Byte for byte.

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

### Appendix 21. `src/orb/shapes.ts`

152 lines, 5288 bytes, sha256 `66a83710f294180c1a301f317747519f73d9c6c6314ad36e4d294c1edad35cce`. Byte for byte.

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

### Appendix 22. `src/orb/simulate.ts`

433 lines, 13389 bytes, sha256 `67a78f08b6da4412ac629e8c138d5ffd597f44b3b87db04ca5bf6c8e85b85a65`. Byte for byte.

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

### Appendix 23. `src/orb/draw.ts`

133 lines, 4279 bytes, sha256 `7d2285248fea2d544a6340d9a9e8d4454615766c765f243b639f0f3fd21cb788`. Byte for byte.

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

### Appendix 24. `src/orb/orbProps.ts`

113 lines, 3081 bytes, sha256 `8e990c10d0a2048898e8b2c85f34f08da51013414547372760116aaa1d5331e2`. Byte for byte.

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

### Appendix 25. `src/orb/LICENSE`

21 lines, 1063 bytes, sha256 `1c87dcf3935109d8f8dfa2435aa71dfd28164a1f84d0b243030936fd2062ca57`. Byte for byte.

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
