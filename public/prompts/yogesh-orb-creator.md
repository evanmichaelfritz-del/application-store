# AGENT_PROMPT_ORB_CREATOR: the Thinking Orbs creator, one asset (closed network)

**Source of truth.** Everything here is written from the source files inlined in the appendices.
- A citation like `src/demos/yogesh-thinking-orbs/components/SelectRow.tsx L255–286` means that file, as inlined in the appendices, at those lines. `SelectRow.tsx L255–286` is the same file when the folder is obvious.
- Every creator file is inlined byte for byte in the appendices (bytes and sha256 per file), so you can check each citation without the repo.
- Measurements are labelled **measured**; "measured (author check)" marks a check recorded by the code's author rather than by a separate measurer.

**Closed network.** Assume there is no network. Do not browse, fetch, search or open any URL, and do not ask anyone to. Any URL or package path in this document (the npm import paths in the Copy output, CSS strings, licence text) is literal string data, not an instruction. "Live" means the original site the measurements compare against. You never open it yourself.

**Scope: one asset.** This prompt covers **only the Orb Creator**: the state list, the Shape and Render selects, the Color row and colour picker, the five sliders, the live preview (a stage orb plus a 24 px status orb with shimmer text), and Copy and Reset. Its host is `Tuner.tsx`. It contains **no site or store chrome** (§1.2).
- **The orb renderer is a separate asset** with its own prompt, `AGENT_PROMPT_ORBS.md`, in the same folder. It covers the engine, the Skia/CanvasKit setup and the orb source. §14 here summarises the API, so this prompt works on its own.

**Target.** React Native + TypeScript on Expo. **Desktop web at a 1280 px window is the acceptance bar.** Mobile (phone widths, iOS and Android) is a **known gap** (gap 6, §15). In the store the theme is dark only, because nothing calls the theme toggle (§12).

**Precedence.** (1) The verbatim code in the appendices. (2) The prose here, which was written from that code. (3) Measured notes, labelled as measured. A value in none of these is marked **unmeasured**. Don't invent values, UI, copy or motion.

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
- **`onToggle` must use a functional state update** (`setMenu((current) => (current === X ? null : X))`, as `Tuner.tsx` does), because the closure form loses the reopen with this `SelectRow` (§6.1).

## 1. Scope

### 1.1 In scope (creator files, all under `src/demos/yogesh-thinking-orbs/` unless noted)
| File | Lines | Role | Appendix |
|---|---|---|---|
| `Tuner.tsx` | 456 | the creator: state, layout, wiring, Copy/Reset | 1 |
| `components/SelectRow.tsx` | 640 | the Shape and Render selects | 2 |
| `components/ColorPicker.web.tsx` | 637 | the Color row and picker popover (web) | 3 |
| `components/ColorPicker.tsx` | 101 | native stand-in (a stub; gap 2) | 4 |
| `components/SliderRow.tsx` | 416 | the five sliders; writes the `live` SharedValue | 5 |
| `components/Shimmer.web.tsx` / `Shimmer.tsx` | 46 / 59 | status text (web CSS sweep / native Skia mask) | 6 / 7 |
| `components/icons.tsx` | 46 | `Chevron` (also exports `GithubIcon` and `DrayIcon`, which the creator doesn't use) | 8 |
| `hooks/useArrowKeys.web.ts` / `useArrowKeys.ts` | 23 / 2 | ↑/↓ cycles the state list (web) / native no-op | 9a / 9b |
| `content/cards.ts` | 180 | `PLAYGROUND` looks, labels, status text | 10 |
| `content/snippet.ts` | 51 | the Copy output | 11 |
| `theme/theme.tsx` | 176 | palette, fonts, `ThemeProvider` (`playgroundColor`), Geist 400 web load | 12 |
| `color/color.ts` | 238 | parse/format/gamut helpers for the row, picker and orb | 13 |
| `src/skia/cardState.ts` | 83 | `useCardField`: in-memory card state | 14 |

`Shimmer.tsx` also needs the binary `assets/fonts/Geist-Regular.ttf` (126,048 B, sha256 `5c8968eafb98a4c4f47033daf29e38e284a6f2a82eb017d171ab040fe7c4b615`; native only, not inlined).

### 1.2 Excluded
- **Store chrome:**
  - the card frame `Stage` and the wrapper `src/demos/yogesh-orb-creator/index.tsx`;
  - the catalog, lazy Skia loader and canvas budget;
  - the card's Copy/prompt buttons (`copySlots.ts`, `copy/*.md`);
  - the store shell (nav, filters, toasts).
  - §17 says what a host must provide instead.
- **The orb renderer** (`orb/*`, plus `src/skia/ensureCanvasKit*`, `bootCanvasKit.ts`, `liveBudget.tsx`, `src/context/ReduceMotionContext.tsx`) is covered in `AGENT_PROMPT_ORBS.md`.
- **The Effects card** (`Showcase.tsx`) is covered in `AGENT_PROMPT_ORBS.md` §15.

## 2. Dependencies (spec from `package.json`, resolved from `package-lock.json`)

| Package | Resolved | Used for |
|---|---|---|
| `react-native-gesture-handler` (`~2.32.0`) | 2.32.0 | `Gesture.Tap/Pan/Race`, `GestureDetector` (selects, sliders); `ScrollView` below 1280 (`Tuner.tsx` L4) |
| `react-native-reanimated` (`4.5.1`) / `react-native-worklets` (`0.10.1`) | 4.5.1 / 0.10.1 | springs, timing, `useSharedValue`, `runOnJS`; `useReducedMotion` in the Shimmer |
| `expo-clipboard` (`~57.0.2`) | 57.0.2 | `setStringAsync` (Copy, `Tuner.tsx` L1, L120) |
| `react-native-safe-area-context` (`~5.7.0`) | 5.7.0 | `useSafeAreaInsets` (`Tuner.tsx` L5, L50) |
| `react-native-svg` (`15.15.4`) | 15.15.4 | native `Chevron` |
| `expo-font` (`~57.0.4`), `@expo-google-fonts/geist` (`^0.4.2`), `@expo-google-fonts/geist-mono` (`^0.4.3`) | 57.0.4 / 0.4.2 / 0.4.3 | Geist 400 (theme), Geist Mono 500 (`SliderRow.tsx` L76, `ColorPicker.web.tsx` L173) |
| `expo-router` (`~57.0.21`) | 57.0.21 | `usePathname` in the theme; `useIsFocused` in the orb |
| `react-dom` (`19.2.3`) | 19.2.3 | `createPortal`, `flushSync` (picker, `ColorPicker.web.tsx` L4) |
| `@shopify/react-native-skia` (`2.6.2`, exact) | 2.6.2 | orbs; native Shimmer |
| `expo` / `react-native` / `react-native-web` / `typescript` | 57.0.23 / 0.86.3 / 0.21.2 / 6.0.3 | |

The Skia/CanvasKit setup (lazy `ensureCanvasKit()`, `npx setup-skia-web public`, `/canvaskit.wasm` served as `application/wasm`, no patch) is in `AGENT_PROMPT_ORBS.md` §3.

## 3. State model (`Tuner.tsx` L48–103; `theme/theme.tsx` L116–162; `src/skia/cardState.ts`)

| State | Type | Initial | Store | Cite |
|---|---|---|---|---|
| `index` | number (into `PLAYGROUND`, 15 items) | **1** (Working) | card field `yogesh-orb-creator/index` | L53 |
| `shape` | `ShapeName` | `"sphere"` | card field | L57 |
| `render` | `RenderName` | `"dots"` | card field | L58 |
| `size` | number | **320** | card field | L59 |
| `speed` | number | **1** | card field | L60 |
| `density` | number | **1** | card field | L61 |
| `dotSize` | number | **1** | card field | L62 |
| `tilt` | number | **20** | card field | L63 |
| `exact` | `{ color: Oklch; text: string } \| null` | `null` | card field. The picker's exact OKLCH for the current text, so P3/OKLCH picks aren't re-parsed lossily | L64 |
| `menu` | `null \| 'shape' \| 'render'` | `null` | React `useState` | L65 |
| `picker` | boolean | `false` | React `useState` | L66 |
| `copied` | boolean | `false` | React `useState` | L67 |
| `playgroundColor` | string (CSS colour text) | `dark.orb` = **`#ffffff`** | theme context, card field `yogesh-orb-creator/playgroundColor` | `theme.tsx` L135 |
| `mode` | `"dark" \| "light"` | `"dark"` | theme `useState` | `theme.tsx` L134 |

- **Card fields** (`useCardField(cardId, field, initial)`, `cardState.ts` L72–78) live in a `globalThis` map read with `useSyncExternalStore`. They survive an unmount/remount of the card on the same page but **not a reload**. **Measured: neither live nor ours keeps anything across a reload.**
- `CREATOR = 'yogesh-orb-creator'` (L46). The host must wrap `Tuner` in `<ThemeProvider cardId="yogesh-orb-creator">` so `playgroundColor` uses the same card id (store wrapper `src/demos/yogesh-orb-creator/index.tsx` L32–34, chrome).
- **Select state** lives inside each `SelectRow`, not in `Tuner`: the shared values `shown`, `chevron`, `openSV`, `goal`, `aboveSV`, `primary` and the refs `openRef` (requested open state, written synchronously), `committedOpen`, `epoch` / `appliedEpoch` (open/close generations), `closeDelivered`, `armed`, `openFrame` / `closeFrame` (pending animation-frame ids), `focusOnOpen` and `typed`. `Tuner` only owns `menu`. See §6.4.1 for the full table (`SelectRow.tsx` L115–136).
- **Refs:** `timer` (the Copied timeout), `alive` (unmount guard, L68–69, cleared at L87–93), `wasFlat` (Tilt reset, L70), `sliding` (drag flag, L85).

**Derived values:**
- `look = PLAYGROUND[index]` (L56); `flat = isFlat(render)` (L71); `wide = width >= 1280`, with `width` = the **window** width (L49–51); `phone = width < 768` (L72).
- `headerH = width >= 768 ? 48 : 72`; `maxOrb = max(96, height − headerH − 120)`; `shown = min(size, wide ? maxOrb : min(maxOrb, max(96, width − 32)))` (L73–75).
- `parsed` = `exact.color` if `exact.text === playgroundColor`, else `parseColor(playgroundColor)`, else `{ l: 1, c: 0, h: 0, a: 1 }` (L76–78).
- `rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed)` (L79).
- `remember(color, text)` sets `exact` and `playgroundColor` together (L80–83). The picker uses it.

**Effects:**
- **Tilt reset:** when `flat` goes from true to false, `setTilt(20)` (L95–98).
- **Live sync:** unless `sliding.current`, `live.value = { size: shown, speed, density, dotSize, tilt, ...rgba }` on any change (L100–103).
- **Copy timer:** cleared on unmount (L87–93).

**Theme rules** (`theme.tsx` L133–160):
- **Route change** (`usePathname` differs from the stored route): mode becomes `"dark"`, and if `playgroundColor` equals either default (`#ffffff` / `#171717`, case-insensitive) it becomes `#ffffff`. A custom colour is kept.
- **`toggle`** (L150–155): swaps the default colour if the current colour is the current mode's default, then flips the mode. **No component in these files calls `toggle`**, so the creator is dark only in the store.
- **Note:** the `Tuner.tsx` doc comment (L21–25) says "Layout width is the card", but the code reads the window width (L49–51). Reproduce the code.

## 4. Layout (`Tuner.tsx` L130–456)

### 4.1 Branches
- `wide` (window width ≥ 1280): a three-column row. **This is the acceptance target.**
- Otherwise a `ScrollView` stack (768–1279 and phone < 768). **Mobile is a known gap** (gap 6). The narrow branch is described only so the code stays complete.

### 4.2 Wide (≥ 1280)
**Root** (L417–421): `testID="yogesh-orb-tuner"`, width 100%, bg `colors.page` (#000000), `minHeight: max(560, shown + 160)`. Children:
1. `menu && Platform.OS !== 'web'` → a full-size transparent `Pressable` (zIndex 4) that closes the menu. **Native only; web has no backdrop** (L422–427).
2. The **row** (L429): `minHeight max(520, shown + 120)`, `flexDirection row`, `alignItems stretch`, paddingLeft **32**, paddingRight **42**, zIndex **5**. It holds, in order:
   - **List column** (L430): `alignSelf center`, marginBottom **8**. The list is 280 wide (§5).
   - **Stage** (L345–377): `testID="yogesh-orb-stage"`, `flex 1`, `minHeight 0`, padding 0, centred. Inner wrapper `marginRight 24` (L361) › `OrbView size={shown}` with all the tuning plus `live` (L362–374). Web: `aria-hidden` (and hidden descendants). Native: label "Orb playground" (L348–351).
   - **Panel column** (L432): `alignSelf center` › panel (L130–135): `testID="yogesh-orb-panel"`, web `role="complementary"`, width **256**, gap **6**, zIndex **5**.
3. The **status line** (L453, defined L379–415): `testID="yogesh-orb-status"`, pointerEvents none, `position absolute`, `left 0`, `right 0`, `bottom 22 + insets.bottom`, zIndex **6**, row, centred, gap **8**, `transform translateX(−4.6)`. It is centred on the **root's** width.

**Orb size at a 1280×800 window:** `maxOrb = max(96, 800 − 48 − 120) = 632` (the formula keeps `headerH = 48` at ≥ 768 even though no header is rendered), so `shown = size` across the whole slider range 16–480. Default `shown` = **320**.

### 4.3 Derived geometry for a 1280 px wide host container at a 1280×800 window (computed from the code; NOT measured; a check, not a target)
| Element | Derived | Basis |
|---|---|---|
| Root height | `max(560, 320 + 160)` = **560** | L420 |
| Row height | at least `max(520, 440)` = **520** | L429 |
| List | x 32–312 | paddingLeft 32, width 280 |
| Panel | x 982–1238 (w 256) | paddingRight 42 |
| Stage | x 312–982 (w 670); orb wrapper marginRight 24 | flex 1 |
| Panel height, Tilt shown | 8 rows × 36 + 8 gaps × 6 + marginTop 10 + Copy row 20 = **366** | L134, L252; row heights 36 |
| Panel height, flat render | 7 × 36 + 7 × 6 + 10 + 20 = **324** | Tilt removed (L236) |
| Row pitch | **42** (36 + gap 6) | L134 |
| Status line | bottom edge 22 px above the root's bottom; centred, then −4.6 px | L389, L395 |

Inside the store the host container is the store's card, whose width is store chrome. If your container isn't 1280 wide, the x values shift; the paddings, widths and gaps don't.

### 4.4 Narrow (< 1280; mobile known gap) (L434–452)
- A `ScrollView` (react-native-gesture-handler), zIndex 5, paddingLeft and paddingRight 16. paddingTop is 24 under 768, else 0. paddingBottom is (24 under 768, else 32) + inset.
- Order: list (wrapping row, no hint), then stage, then the status line, then the panel (marginTop 24 on phone, 20 otherwise; panel width 100%).
- Stage: phone `minHeight 0.6·windowH`, padding 32, marginTop 24; 768–1279 `minHeight shown`.
- Status line: phone overlays it absolutely at `bottom 24` inside the stage wrapper (L447), with Shimmer `lineHeight 20` (L413); 768–1279 puts it in flow.

## 5. State list (`Tuner.tsx` L289–343; `content/cards.ts` L135–151; `hooks/useArrowKeys.web.ts`)

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

- **Wrapper** (L290–295): `testID="yogesh-orb-states"`, `role="navigation"`, `accessibilityLabel="States"`, width **280** (wide) or 100%, `justifyContent center`.
- **List** (L296–304): web `role="list"`; column + nowrap (wide) or row + wrap; columnGap 16, rowGap **8**, so the wide pitch is **28 px** (20 + 8).
- **Item, web** (L307–320): `View role="listitem"` › `Pressable accessibilityRole="button"`, `aria-current="true"` when selected, `onPress → setIndex(i)`, `hitSlop {top: 12, bottom: 12}`, height **20**, `justifyContent center` › `Text` in `fonts.regular` **14/20**, `colors.fg` (#fafafa) when selected, else `colors.muted` (#a1a1a1). The colour swaps instantly.
- **Item, native** (L321–334): the same Pressable, without the listitem wrapper.
- **Hint** (wide only, L337–341): "↑ ↓ to switch", `fonts.regular` **12/16**, muted, marginTop **24**, marginBottom **−8**.
- **Keyboard** (`useArrowKeys.web.ts` L4–23): a `window` keydown listener. ArrowDown → `(i + 1) % 15`, ArrowUp → `(i − 1 + 15) % 15`, wrapping, with `preventDefault()`. It is ignored when the target is inside `input, textarea, select, [contenteditable='true'], [role='slider'], [data-arrow-keys='own']` (L11): the Color value, the CSS input and the Hue/Opacity ranges are inputs, and the sliders have role slider.
  - **Code note:** a focused select trigger or option stops ArrowUp/ArrowDown propagation in its own handlers (`SelectRow.tsx` L469–472, L497–499). The page listener is on `window`, so those keys don't reach it while a select has focus.
- **Changing the look** changes `state`/`variant` on both orbs and remounts the Shimmer (`key={index}`, L413), which restarts its sweep. The orb's look change has no transition (`AGENT_PROMPT_ORBS.md` §9).
- Known gaps 9–11 apply to this list (§15).

## 6. Selects: Shape and Render (`components/SelectRow.tsx`, Appendix 2; wired at `Tuner.tsx` L136–165)

### 6.1 Options and wiring
- **Shape** (`Tuner.tsx` L27–33): `sphere` Sphere, `cube` Cube, `octahedron` Octahedron, `tetrahedron` Tetrahedron, `torus` Torus. Default sphere; `display` falls back to "Sphere" (L139). Five options, so `place()` uses a menu height of `8 + 5·36 = 188`.
- **Render** (`RENDERS` from `orb/model.ts` L11–20; labels `RENDER_LABEL` at `Tuner.tsx` L35–44): `dots` Dots, `crosses` Crosses, `dashes` Dashes, `halftone` Halftone, `lines` Lines, `mesh` Mesh, `squares` Squares, `verticalLines` Vertical Lines. Default dots. Eight options, so the menu height is `8 + 8·36 = 296`.
- **Flat renders** (`isFlat`, `model.ts` L28–30): halftone, lines and verticalLines. They remove the Tilt row (`Tuner.tsx` L236) and drop `tilt` from Copy.
- **Props:** `SelectRow<T>({ label, value, options, open, onToggle, onPick, display })` (L92–108).
  - `open` is `menu === 'shape'` or `menu === 'render'`.
  - `onToggle`: `setPicker(false); setMenu((current) => (current === X ? null : X))`, a functional update (L142–145, L157–160). Opening a select closes the picker and the other select. `onToggle` must use a functional state update, because the closure form (computing the next value from the `menu` captured at render) loses the reopen with the current `SelectRow`.
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
- **Background transition:** `[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]{transition:background-color .15s ease}` (L61). It applies to every trigger inside the panel in both modes, so rest ↔ hover ↔ open all fade over **.15s ease** on web. Native has no transition (inline swap). The rules only match inside an element with `data-testid="yogesh-orb-panel"`, which the panel gets from `testID="yogesh-orb-panel"` (`Tuner.tsx` L132; react-native-web renders `testID` as `data-testid`).
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

## 7. Color row and colour picker (web: `components/ColorPicker.web.tsx`, Appendix 3; wired at `Tuner.tsx` L166–179)

### 7.1 Wiring (`Tuner.tsx` L166–179)
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

## 8. Sliders (`components/SliderRow.tsx`, Appendix 5; wired at `Tuner.tsx` L180–251)

### 8.1 The five sliders
| Label | min | max | step | default | decimals | default text | default fill `(v−min)/(max−min)` | `live` field | shown |
|---|---|---|---|---|---|---|---|---|---|
| Size | 16 | 480 | 1 | 320 | 0 | `320` | 0.6552 | `size` | always (L180–193) |
| Speed | 0.05 | 3 | 0.05 | 1 | 2 | `1.00` | 0.3220 | `speed` | always (L194–207) |
| Density | 0.25 | 3 | 0.05 | 1 | 2 | `1.00` | 0.2727 | `density` | always (L208–221) |
| Dot Size | 0.25 | 3 | 0.05 | 1 | 2 | `1.00` | 0.2727 | `dotSize` | always (L222–235) |
| Tilt | −90 | 90 | 1 | 20 | 0 | `20` | 0.6111 | `tilt` | only when `!isFlat(render)` (L236–251) |

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

| Control | State | Stage orb (L362–374) | Status orb (L400–412) | `live` (L84, L100–103) | Copy (§11) |
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
  - the Tuner effect, unless `sliding` (L100–103);
  - `SliderRow.writeLive` on drag updates, pan end and tap end;
  - `publishNow` on keyboard/a11y steps.
- **Reduced motion** (OS setting, live): both orbs show one still frame at t = 0, repainted from **props** on every change, so the still orb follows the sliders, the colour and the look (`AGENT_PROMPT_ORBS.md` §13.4).
- **Flat renders:** leaving one resets `tilt` to 20 (L95–98). Entering one hides Tilt but keeps it in state; the orb ignores tilt on flat renders.
- **A speed change** is a new clock key (`state@speed`) and resets the per-orb state (`AGENT_PROMPT_ORBS.md` §9). Unmeasured vs live.

## 10. Status line: mini orb + shimmer (`Tuner.tsx` L379–415; `components/Shimmer.web.tsx`, `Shimmer.tsx`)

- **Structure:** a row (gap 8, centred, pointerEvents none, `testID="yogesh-orb-status"`) holding `OrbView` **size 24** (same tuning and `live` as the stage) and `<Shimmer key={index} text={look.status} style={phone ? { lineHeight: 20 } : undefined} />` (L400–413). For wide placement see §4.2.
- **Web Shimmer** (`Shimmer.web.tsx`, 46 lines):
  - A one-time injected `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}` (L7–14).
  - A `<span>` (L25–44) with `fontFamily: fonts.regular`, `fontSize 14`, `lineHeight "20px"` (or the passed number), `display: inline-block`, **`opacity: 1`**.
  - `backgroundImage: linear-gradient(90deg, muted 35%, fg 50%, muted 65%)`, `backgroundSize: 200% 100%`, `background-clip: text` (with `-webkit-`), `color: transparent`, `animation: orb-shimmer 2s linear infinite`.
  - **No fade-in.** Doc comment L16: "Full opacity on the first frame. Remount (key by look index) restarts the sweep."
  - **Reduced motion:** `useReducedMotion()` from Reanimated (L3, L19). No gradient or animation; plain `color: muted`. Whether this hook follows a live OS toggle is unmeasured (the orbs use the live context instead).
  - Colours: muted `#a1a1a1`, fg `#fafafa` (dark).
- **Native Shimmer** (`Shimmer.tsx`, 59 lines):
  - A Skia `Canvas`: width = the text width from `useFont(require("../assets/fonts/Geist-Regular.ttf"), size)`, height `ceil(size·1.45)`.
  - An alpha `Mask` of the text over a `LinearGradient` rect: colours `[muted, muted, fg, muted, muted]` at `[0, 0.35, 0.5, 0.65, 1]`, `mode repeat`.
  - `shift` runs −2w → 2w with `withRepeat(withTiming(…, {duration: 2000, easing: linear}), −1, false)`.
  - With reduced motion, or before the font loads, it falls back to a plain muted `Text`. No fade.

## 11. Copy and Reset (`Tuner.tsx` L105–128, L252–285; `content/snippet.ts`)

### 11.1 Row (L252–285)
- A `View` with `marginTop 10` (on top of the panel gap 6), row, centred, **gap 16**.
- **Copy:** `Pressable testID="yogesh-orb-export"`, `hitSlop 8`, web `accessibilityRole="button"`. Its text is `colors.muted`, `fonts.regular` **14/20**: **"Copy"**, or **"Copied"** for 1500 ms after a successful write.
- **Reset:** `Pressable` with `hitSlop 8` and `accessibilityLabel="Reset"` (no role). Same muted 14/20 text, **"Reset"**.
- **Reset is visible only when** `playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase() || size !== 320 || speed !== 1 || density !== 1 || dotSize !== 1 || tilt !== 20` (L263–268).
  - Shape, Render and the selected state don't make it appear, and Reset doesn't touch them.
- There is no hover or pressed styling.

### 11.2 Copy (L105–128)
1. `text = orbSnippet({ state: look.state, variant: look.variant, size, speed, density, dotSize, tilt, shape, render, color: playgroundColor, themeDefault: colors.orb, flat })`.
2. `void setStringAsync(text).then(() => { if (!alive.current) return; setCopied(true); clear the old timer; timer = setTimeout(() => alive && setCopied(false), 1500) })`. A second Copy restarts the 1500 ms.
3. The timer is cleared on unmount (L87–93). There is no error path: if the write rejects, the label stays "Copy".
4. **Measured (same 1500 ms code):** "Copied" reverted after a median of 1504.3 ms vs live 1501.9 ms.

### 11.3 Reset (L270–278)
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

## 12. Colours and typography (dark; the only mode reachable in the store)

The palette is `theme.tsx` L30–49 (dark) and L51–70 (light). The theme starts dark (L134), and nothing calls `toggle`. `SelectRow` and `SliderRow` have light branches in code; the picker CSS has none.

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
- `fonts.regular` = `Geist_400Regular, Geist, "Geist Fallback", system-ui, sans-serif` (`theme.tsx` L81, L87):
  - 14/20: list items, Copy/Reset, Shimmer (14, lineHeight 20px);
  - 12/16: hint.
- System stack `system-ui, -apple-system, "SF Pro Display", sans-serif`, **13/500/19.5**: select label and value, options, Color label, slider label, picker text, format buttons, track labels.
- `GeistMono_500Medium, ui-monospace, monospace`, **500 13**: Color value (h25), slider value (19.5), CSS input (19.5).
- **Font loading:** Geist 400 is loaded by `ThemeProvider` after window `load` (`theme.tsx` L117–132; gap 9). Geist Mono 500 is loaded by `useFonts` in `SliderRow` (L76) and `ColorPicker.web` (L173).

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
| Copied label | `setTimeout` | 1500 ms | Tuner L124–126 |
| Shimmer sweep (web) | CSS | `orb-shimmer 2s linear infinite`, background-position 200% → −200%; restarts on look change (remount) | Shimmer.web L12, L40; Tuner L413 |
| Shimmer sweep (native) | `withRepeat(withTiming(2w, 2000 ms, linear), −1, false)` | | Shimmer.tsx L25–29 |
| State list, Color text | instant | | |

**Measured motion gaps** (§15.1): 3 (pill early), 4 (close fade early), 7 (select open 0.99 tail ~1 frame late), 8 (closed-trigger hover ramp ~1 frame late), 12 (outside-dismiss low fade ~19 ms early).

## 14. The orb component: compact summary (the full renderer is in `AGENT_PROMPT_ORBS.md`)

**Imports the creator uses** (`Tuner.tsx` L16–18):
```ts
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from './color/color';
import { canUseExtendedColor, OrbView, type OrbLive } from './orb/OrbView';
import { isFlat, RENDERS, type RenderName, type ShapeName } from './orb/model';
```

**`OrbView` props** (`orb/OrbView.tsx` L75–101): every prop is optional.

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
| `paused` | `false` | holds the frame |
| `label` | none | `role="img"` + `aria-label`; otherwise `aria-hidden` |
| `className` | none | web box class |
| `live` | none | `SharedValue<OrbLive>` |
| `onFrame` | none | PNG data URI on unmount |

- **`OrbLive`** (L26–36): `{ size, speed, density, dotSize, tilt, r, g, b, a }`. Only `speed`, `tilt` and `r/g/b/a` are read per frame.
- `canUseExtendedColor()` (L48–52): web true; iOS true except Expo Go; Android false.
- `OrbView` (L298–306):
  - it returns `null` when the route is unfocused;
  - a `SkiaRuntimeContext` `{mount: false}` gives a size×size placeholder;
  - reduced motion (from `ReduceMotionProvider`, **live**) paints one still frame at t = 0 and repaints on prop changes.
- **Looks:** the 15 in §5. `resolveLook` maps any unknown id to `base`, and `periodOf` guards the yaw, so there is no NaN.
- The creator passes neither `label` nor `paused`. The stage `View` is `aria-hidden` on web. The status orb has no label, so its box is `aria-hidden`.

**Setup the creator depends on** (details in `AGENT_PROMPT_ORBS.md` §3 and §15.1):
- Skia 2.6.2 exact with canvaskit-wasm 0.41.0, and no patch;
- `npx setup-skia-web public` copies `canvaskit.wasm` to `public/`, and it must be served at `/canvaskit.wasm` as `application/wasm`;
- `ensureCanvasKit()` must resolve before any Skia-importing module (here `Tuner.tsx`) evaluates;
- providers: `GestureHandlerRootView`, `SafeAreaProvider` (for `useSafeAreaInsets`), `ReduceMotionProvider`, an expo-router navigator, and `ThemeProvider cardId="yogesh-orb-creator"`.

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
9. Font flash on first load: Geist swaps in ~150 ms after paint, ~870 ms on a slow connection.
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
- **Shimmer reduced motion** reads Reanimated's `useReducedMotion()`, not the live context the orbs use. Whether it follows a live OS toggle is unmeasured.
- **Light mode** exists in `SelectRow`/`SliderRow` code but can't be reached in the store (nothing calls `toggle`). The picker CSS is dark only, and the select's hover rule matches dark only.
- **A speed change restarts the orb's clock phase** (new `state@speed` key). Unmeasured vs live.
- **Persistence:** **measured: neither live nor ours keeps anything across a reload.** Card fields survive a remount on the same page.
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
- `tsc --noEmit`: only `EdgeFade.tsx:17` and `preview-tools/index.tsx:534`, both outside this asset.

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
| 1 | Initial state | Working selected, Sphere, Dots, colour `#ffffff`, Size 320, Speed 1.00, Density 1.00, Dot Size 1.00, Tilt 20; no Reset | Code (Tuner L53–64, L263–268) |
| 2 | Landmarks | `nav` "States" (list), `complementary` panel; stage `aria-hidden` | Code (L290–295, L133, L351) |
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
| 18 | Mutual exclusion | opening a select closes the other and the picker; opening the picker closes the selects | Code (Tuner L142–145, L157–160, L170–173) |
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
| 31 | Tilt | hidden on Halftone, Lines and Vertical Lines; reset to 20 when leaving them | Code (Tuner L95–98, L236) |
| 32 | Status line | 24 px orb + shimmer, gap 8, bottom 22, translateX −4.6; shimmer 14/20, 2s sweep, **no fade**, restarts on look change | Code |
| 33 | Copy | defaults → `import { Orb } from "@yogesharc/thinking-orbs";\n\n<Orb state="working" size={320} />`; "Copied" for 1500 ms | Run (snippet); Measured: 1504.3 vs 1501.9 ms |
| 34 | Reset | appears only for colour/size/speed/density/dotSize/tilt changes; restores those values, not shape, render or look | Code (L263–284) |
| 35 | Reduced motion (OS, live) | both orbs still at t = 0 and follow the sliders; picker animation and pill transition off | Code |
| 36 | Reload | nothing persists | Measured: neither live nor ours keeps anything across a reload |
| 37 | Fonts | Geist 400 arrives after window `load` | Gap 9 |
| 38 | Mobile, iOS, Android | not covered | Gap 6 |
| 39 | Native colour picker | stub | Gap 2 |
| 40 | Reopen race (as65o) | close then immediately reopen always ends open and consistent | **Measured** (author check): 0/108 inconsistent (108/108 open). Measured: pointer 18/18, queued 12/12, busy matrix 12/12, synthetic 9/9 open |
| 41 | Pointer reopen at 0/8/16/50/120 ms after a close | open, focus on the selected option | **Measured** (author check): 15/15 open, focus on Sphere |
| 42 | Escape, Enter, Escape | ends closed and sealed | **Measured** (author check): 28/28 closed and sealed. Measured: Esc → Enter 6/6 and queued 14/14 open |
| 43 | Stale open | a deferred open never lands after a close | **Measured** (author check): 0/32 stale opens |
| 44 | Early clicks at 12/16/32/50 ms (the exact sequence isn't recorded) | ends closed and sealed | **Measured** (author check): 12/12 closed and sealed. Related, measured: a close 21.8–30.2 ms after an open, 3/3 closed (sealed, never painted) |
| 45 | Shape-click first visible | time from the click to the first visible menu frame; no first paint at 0.32 | **Measured** (author check): median 23 ms (n = 8); 0/8 first paints at 0.32. Measured on an earlier revision that focused twice per open: click pooled 31.5 vs live 18.4 ms, 5/16 first paints at 0.32–0.33 (§15.2) |

## 17. Build steps and forbidden actions

**Steps:**
1. Build the orb renderer from `AGENT_PROMPT_ORBS.md`: dependencies, `npx setup-skia-web public`, the wasm served as `application/wasm`, and the lazy `ensureCanvasKit()`.
2. Create the files in §1.1 from the appendices **verbatim**, at the same paths. Keep the `@/` alias (`tsconfig.json` `"@/*": ["./*"]`).
3. Provide a host (not store chrome) that:
   - wraps the app in `GestureHandlerRootView`, `SafeAreaProvider`, `ReduceMotionProvider` and an expo-router navigator;
   - loads the module that imports `Tuner` only after `ensureCanvasKit()` resolves;
   - renders `<ThemeProvider cardId="yogesh-orb-creator"><Tuner /></ThemeProvider>` in a full-width `#000000` container whose height follows its content.
   - The store's frame starts at 640 px and grows to the measured height (`src/demos/yogesh-orb-creator/index.tsx` L12–30). Don't copy the store's card chrome.
4. Typecheck with `npx tsc --noEmit`. Run with `npm run web` (`expo start --web --port 43181`) or `npx expo export --platform web` plus a static server that serves `/canvaskit.wasm` as `application/wasm`. Check §16 at a 1280 px window.

**Forbidden:**
- Browsing, fetching or opening any URL (including the npm paths in the Copy output), or asking anyone to.
- Inventing values, copy, controls, animations or behaviours that aren't in this document or the appendices. Mark unknowns **unmeasured**.
- "Fixing" §15.1 gaps (including the native select open noted in §15.2) unless you're told to. Build the code exactly as inlined.
- Adding store or site chrome (nav, card frame, Copy/prompt buttons, headers) to the asset.
- Changing the Copy format. It deliberately emits web JSX for `@yogesharc/thinking-orbs`.
- Messaging anyone, posting anywhere or publishing anything.

## Appendix index

| # | Path | Lines | Bytes | sha256 |
|---|---|---|---|---|
| 1 | `src/demos/yogesh-thinking-orbs/Tuner.tsx` | 456 | 14451 | `138867090600b0326878fc3b7e630ecc312b47cd99ad4bbfa4b7b50382f91427` |
| 2 | `src/demos/yogesh-thinking-orbs/components/SelectRow.tsx` | 640 | 24399 | `e871d3156bf9e3c826d8a89b6aa8244d933c74bf2773dde4a9a464cf185ee6fd` |
| 3 | `src/demos/yogesh-thinking-orbs/components/ColorPicker.web.tsx` | 637 | 27020 | `0b47e54b1ceba2b64563b91df7b4e7fe979fbe828e1615efb6a85ef13a35a459` |
| 4 | `src/demos/yogesh-thinking-orbs/components/ColorPicker.tsx` | 101 | 3270 | `ab94d7f7842328d81476f516f3f8b2e981a6320e30a88a3a47159c1c10976dd2` |
| 5 | `src/demos/yogesh-thinking-orbs/components/SliderRow.tsx` | 416 | 15362 | `9c00d8d535961dbba35c2aae7ef4ce31adc8aa81be665077352b9e1a2a0d3bf2` |
| 6 | `src/demos/yogesh-thinking-orbs/components/Shimmer.web.tsx` | 46 | 1711 | `752c2cd00f74edbe4235d9ffb7c9ef62737e99c9b669652f1ef2b66bbdc06b32` |
| 7 | `src/demos/yogesh-thinking-orbs/components/Shimmer.tsx` | 59 | 2139 | `03bca8d1313316e7fbe4bcbeb1fdb0e273e71bd650d2c868e3293b3265e2f5ce` |
| 8 | `src/demos/yogesh-thinking-orbs/components/icons.tsx` | 46 | 2570 | `6febf676134a2fa64a74874f215306a5c18d804e830249d03b5e19b9ce06363d` |
| 9a | `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.web.ts` | 23 | 925 | `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf` |
| 9b | `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.ts` | 2 | 186 | `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258` |
| 10 | `src/demos/yogesh-thinking-orbs/content/cards.ts` | 180 | 5117 | `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d` |
| 11 | `src/demos/yogesh-thinking-orbs/content/snippet.ts` | 51 | 1830 | `cd99059783d7aed96684cdec6994fa6230f109f8857ad53d3f34c36893938879` |
| 12 | `src/demos/yogesh-thinking-orbs/theme/theme.tsx` | 176 | 4677 | `3d08daedb8bb47fe858d867c5ebb60c3cd8b80b4382b20db3440f1cff1b6431f` |
| 13 | `src/demos/yogesh-thinking-orbs/color/color.ts` | 238 | 9689 | `c9fe5fa7acee4e033f4d4a36fd33cd92c34413aa155a92704ec4530226f517fe` |
| 14 | `src/skia/cardState.ts` | 83 | 2710 | `47c0aeff952a1b0d3e2ea08eb1e18f1ddda119739985b8cab62b93309ce8bc0c` |

The orb files (`orb/*`, `src/skia/ensureCanvasKit*`, `bootCanvasKit.ts`, `liveBudget.tsx`, `src/context/ReduceMotionContext.tsx`) are inlined in `AGENT_PROMPT_ORBS.md`.

## Appendices: verbatim source

Every file is reproduced byte for byte. The fence is longer than any backtick run inside the file. Line numbers in citations count from line 1 of each block.

### Appendix 1. `src/demos/yogesh-thinking-orbs/Tuner.tsx`

456 lines, 14451 bytes, sha256 `138867090600b0326878fc3b7e630ecc312b47cd99ad4bbfa4b7b50382f91427`. Byte for byte. The creator host

```tsx
import { setStringAsync } from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';

import { useCardField } from '@/src/skia/cardState';
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

const CREATOR = 'yogesh-orb-creator';

export function Tuner() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1280;
  const { colors, playgroundColor, setPlaygroundColor } = useTheme();
  const [index, setIndex] = useCardField(CREATOR, 'index', 1);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];
  const [shape, setShape] = useCardField<ShapeName>(CREATOR, 'shape', 'sphere');
  const [render, setRender] = useCardField<RenderName>(CREATOR, 'render', 'dots');
  const [size, setSize] = useCardField(CREATOR, 'size', 320);
  const [speed, setSpeed] = useCardField(CREATOR, 'speed', 1);
  const [density, setDensity] = useCardField(CREATOR, 'density', 1);
  const [dotSize, setDotSize] = useCardField(CREATOR, 'dotSize', 1);
  const [tilt, setTilt] = useCardField(CREATOR, 'tilt', 20);
  const [exact, setExact] = useCardField<{ color: Oklch; text: string } | null>(CREATOR, 'exact', null);
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

### Appendix 2. `src/demos/yogesh-thinking-orbs/components/SelectRow.tsx`

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

### Appendix 3. `src/demos/yogesh-thinking-orbs/components/ColorPicker.web.tsx`

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

### Appendix 4. `src/demos/yogesh-thinking-orbs/components/ColorPicker.tsx`

101 lines, 3270 bytes, sha256 `ab94d7f7842328d81476f516f3f8b2e981a6320e30a88a3a47159c1c10976dd2`. Byte for byte. Native stand-in (gap 2)

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

### Appendix 5. `src/demos/yogesh-thinking-orbs/components/SliderRow.tsx`

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

### Appendix 6. `src/demos/yogesh-thinking-orbs/components/Shimmer.web.tsx`

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

### Appendix 7. `src/demos/yogesh-thinking-orbs/components/Shimmer.tsx`

59 lines, 2139 bytes, sha256 `03bca8d1313316e7fbe4bcbeb1fdb0e273e71bd650d2c868e3293b3265e2f5ce`. Byte for byte. Native; needs `../assets/fonts/Geist-Regular.ttf` (binary, not inlined; §1.1)

```tsx
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
  const font = useFont(require("../assets/fonts/Geist-Regular.ttf"), size);
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

### Appendix 8. `src/demos/yogesh-thinking-orbs/components/icons.tsx`

46 lines, 2570 bytes, sha256 `6febf676134a2fa64a74874f215306a5c18d804e830249d03b5e19b9ce06363d`. Byte for byte. The creator uses only `Chevron`

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

### Appendix 9a. `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.web.ts`

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

### Appendix 9b. `src/demos/yogesh-thinking-orbs/hooks/useArrowKeys.ts`

2 lines, 186 bytes, sha256 `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258`. Byte for byte. Native no-op

```ts
/** Native: hardware arrows are a no-op. Web implementation is useArrowKeys.web.ts. */
export function useArrowKeys(_count: number, _index: number, _onIndex: (index: number) => void) {}
```

### Appendix 10. `src/demos/yogesh-thinking-orbs/content/cards.ts`

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

### Appendix 11. `src/demos/yogesh-thinking-orbs/content/snippet.ts`

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

### Appendix 12. `src/demos/yogesh-thinking-orbs/theme/theme.tsx`

176 lines, 4677 bytes, sha256 `3d08daedb8bb47fe858d867c5ebb60c3cd8b80b4382b20db3440f1cff1b6431f`. Byte for byte.

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

### Appendix 13. `src/demos/yogesh-thinking-orbs/color/color.ts`

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

### Appendix 14. `src/skia/cardState.ts`

83 lines, 2710 bytes, sha256 `47c0aeff952a1b0d3e2ea08eb1e18f1ddda119739985b8cab62b93309ce8bc0c`. Byte for byte.

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
