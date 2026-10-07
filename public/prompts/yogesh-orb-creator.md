# AGENT_PROMPT_ORB_CREATOR: the Thinking Orbs creator (/playground builder), its own Tools card (closed network)

**Source of truth.** The FINAL tree **`9bef3b1e68b74186c5cc39b449873009fb8ec980`** (tip of main, Origin `evan-fritz/tmp-2bc1ba32f462905d`), tarball `yogesh-thinking-orbs-9bef3b1.tgz`, sha256 **`10a2ba47a1fb45d6f5878f575fd1a7c47a299d5f6e63f4ce43b2484d7217455c`**, plus the team's measured parity notes (Beta, Design, Motion) recorded in the 9bef3b1 handoff docs. A citation like `app/playground.tsx L183–211` points to that file in that tree, and every creator file is inlined verbatim in the appendices so you can check it.

**Closed network.** Do not browse, fetch, search or open any URL, and do not ask anyone to. URLs that appear inside code (the npm import paths in the Copy output, for example) are literal string data. "Live" in this document means the measurements the team recorded against the original site. You never open it yourself.

**Scope.** This card covers the **orb creator only**: the state list, the Shape and Render selects, the Color row and colour picker, the five sliders, the live preview (a big stage orb plus a 24-px status orb with shimmer text), and Copy and Reset.
- **The orb renderer itself is a separate card:** `AGENT_PROMPT_ORBS.md`, in the same folder. It has the full engine, Skia/CanvasKit setup and orb source. §15 here gives a compact summary of its API, so this prompt still works on its own.

**Target.** React Native + TypeScript on Expo. **Desktop web at 1280 px** (Beta's runs used a 1280×800 viewport at DPR 1) is the acceptance bar, light and dark. iOS and Android are lowest priority and **unverified**.

**Precedence.** (1) The verbatim code in the appendices. (2) The prose here, which was written from that code. (3) Measured notes, each labelled with the build it was measured on. Values in none of these are marked **unmeasured**. Don't invent values, UI or copy.

**Contents.**
1. Scope
2. Files and dependencies
3. State model
4. Layout
5. State list
6. Selects
7. Color row
8. Colour picker
9. Sliders
10. Control → orb mapping and live wiring
11. Status line
12. Copy and Reset (exact template)
13. Colours, light and dark
14. Motion and timing
15. Orb API summary
16. Known gaps
17. Parity checklist
18. Build steps and forbidden actions

Appendices 1–13: every creator file, verbatim.

## 1. Scope

### 1.1 In scope (creator files)
| File | Role |
|---|---|
| `app/playground.tsx` (365 lines) | the creator screen: state model, layout, wiring, Copy/Reset |
| `src/components/SelectRow.tsx` (293) | the Shape and Render selects |
| `src/components/SliderRow.tsx` (364) | the Size, Speed, Density, Dot Size and Tilt sliders; writes the live SharedValue |
| `src/components/ColorPicker.tsx` (391) | the colour picker popover (Hex / OKLCH / Display P3) |
| `src/components/Shimmer.web.tsx` (50) / `Shimmer.tsx` (69) | the status text beside the mini orb (web CSS / native Skia) |
| `src/components/icons.tsx` (29) | `Chevron` for the selects (the file also exports `GithubIcon` and `DrayIcon`, used only by the excluded Header) |
| `src/hooks/useArrowKeys.web.ts` (23) / `useArrowKeys.ts` (2) | ↑/↓ cycles the state list (web only) |
| `src/content/cards.ts` (180) | the `PLAYGROUND` look list, its labels and status text |
| `src/content/snippet.ts` (51) | the Copy output generator |
| `src/theme/theme.tsx` (157) | palette (light/dark), fonts, `playgroundColor` state and toggle/route rules |
| `src/color/color.ts` (233) | colour parsing/formatting for the input, picker and swatch (also used by the orb) |

### 1.2 Excluded
- **Site chrome:** header (`<Header active={null}/>` at `app/playground.tsx` L344), hero, pills, stars, docs, MIT link, and the page `<title>` (`app/playground.tsx` L330–334). Two header values are kept because the creator's own layout depends on them:
  - the header is **48 px** tall at ≥768 (`headerH = width >= 768 ? 48 : 72`, L84; the phone header actually renders at 80);
  - the theme toggle lives in the header; it flips the creator's light/dark mode (§13).
- **The orb engine** (`src/orb/*`) is in `AGENT_PROMPT_ORBS.md`; §15 summarises its API.
- The landing page, its chat, and the landing card grid.
- **Design's header right-group offset** (Beta: "header nav right group sits ~5–18px right") is a header item, so it belongs to the site card, not this one.

## 2. File structure and dependencies

```
app/playground.tsx                 route "/playground" (expo-router file route)        Appendix 1
src/components/SelectRow.tsx       select trigger + menu                                Appendix 2
src/components/SliderRow.tsx       slider row                                           Appendix 3
src/components/ColorPicker.tsx     picker popover                                       Appendix 4
src/components/Shimmer.web.tsx     status text, web (CSS gradient sweep)                Appendix 5
src/components/Shimmer.tsx         status text, native (Skia mask + gradient)           Appendix 6
src/components/icons.tsx           Chevron (+ unused header icons)                      Appendix 7
src/hooks/useArrowKeys.web.ts      ↑/↓ state cycling (web)                              Appendix 8
src/hooks/useArrowKeys.ts          native no-op                                         Appendix 9
src/content/cards.ts               PLAYGROUND looks + status text                       Appendix 10
src/content/snippet.ts             Copy output                                          Appendix 11
src/theme/theme.tsx                palette, fonts, playgroundColor                      Appendix 12
src/color/color.ts                 parseColor / formatColor / detectFormat / maxChroma… Appendix 13
src/orb/*                          orb renderer: see AGENT_PROMPT_ORBS.md (summary §15)
```

**Packages the creator uses**, beyond the orb's own (resolved versions from the 9bef3b1 lockfile):
- `react-native-gesture-handler` 2.32.0 (`Gesture.Tap`, `Gesture.Pan`, `Gesture.Race`, `GestureDetector`, and the `ScrollView` below 1280);
- `react-native-reanimated` 4.5.1 (`withSpring`, `withTiming`, `useAnimatedStyle`, `useAnimatedReaction`, `runOnJS`, `useReducedMotion`);
- `expo-clipboard` (`setStringAsync`; spec `~57.0.2` in package.json);
- `expo-linear-gradient` (native colour field only; `~57.0.2`);
- `react-native-svg` 15.15.4 (Chevron);
- `react-native-safe-area-context` `~5.7.0` (`useSafeAreaInsets`);
- `expo-router` 57.0.24 (`useFocusEffect`, `usePathname` in the theme, and `Head`, which only sets the excluded title);
- `@shopify/react-native-skia` 2.6.2 (native Shimmer only).

The web entry must load CanvasKit before rendering; see `AGENT_PROMPT_ORBS.md` §3.

**Fonts.** `fonts` in `theme.tsx` L78–97:
- web: `regular` = `Geist, "Geist Fallback", system-ui, sans-serif` and `mono` = `"Geist Mono", "Geist Mono Fallback"`;
- native: `Geist_400Regular` and `GeistMono_400Regular`.

The font files and the web `@font-face` loader are site-level assets (see the main `AGENT_PROMPT.md` "Binary assets"). They can't be inlined. If you don't have them, use same-name stand-ins and report it, because metrics change sizes.

## 3. State model (`app/playground.tsx` L58–119; `src/theme/theme.tsx` L113–143)

| State | Type | Initial | Owner | Cite |
|---|---|---|---|---|
| `index` | number (into `PLAYGROUND`, 15 items) | **1** (Working) | screen | L63 |
| `shape` | `ShapeName` | `"sphere"` | screen | L67 |
| `render` | `RenderName` | `"dots"` | screen | L68 |
| `size` | number | **320** | screen | L69 |
| `speed` | number | **1** | screen | L70 |
| `density` | number | **1** | screen | L71 |
| `dotSize` | number | **1** | screen | L72 |
| `tilt` | number | **20** | screen | L73 |
| `menu` | `null \| "shape" \| "render"` | `null` | screen | L74 |
| `picker` | boolean | `false` | screen | L75 |
| `copied` | boolean | `false` | screen | L76 |
| `draft` | string (Color row text) | `playgroundColor` | screen | L77; re-synced on every `playgroundColor` change, L96–98 |
| `playgroundColor` | string (CSS colour text) | `dark.orb` = **`#ffffff`** | **theme context** | `theme.tsx` L116 |
| `mode` | `"dark" \| "light"` | `"dark"` | theme context | `theme.tsx` L115 |

Refs:
- `timer` (Copied timeout), `alive` (unmount guard, set false at L100–103), `wasFlat` (Tilt reset), `sliding` (drag flag, L94);
- `exact` (L81): `{ color: Oklch, text }`, the picker's exact OKLCH for the current text. It keeps P3/OKLCH picks from being re-parsed lossily.

Derived values:
- `look = PLAYGROUND[index]` (L66); `flat = isFlat(render)` (L82); `wide = width >= 1280` (L61); `phone = width < 768` (L83);
- `headerH`, `maxOrb` and `shown` (L84–86);
- `parsed = exact (if its text === playgroundColor) ?? parseColor(playgroundColor) ?? { l:1, c:0, h:0, a:1 }` (L87);
- `rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed)` (L88).

Effects:
- **Tilt reset:** when `flat` goes from true to false, `setTilt(20)` (L111–114).
- **Live sync:** unless `sliding.current`, `live.value = { size: shown, speed, density, dotSize, tilt, ...rgba }` whenever any of those change (L116–119).
- **Copy timer** is cleared on unmount (L100–103) and on blur (`useFocusEffect`, L105–109).

Theme rules (`theme.tsx` L113–143):
- **Toggle** (from the header's Light/Dark control): if `playgroundColor` equals the current mode's default (`#ffffff` dark / `#171717` light, case-insensitive), it switches to the other default. A custom colour is kept. Then the mode flips.
- **Route change:** the mode resets to `"dark"`. If `playgroundColor` equals either default it becomes `#ffffff`; a custom colour survives.
- There is **no persistence**: a reload returns everything to the initial values above.

## 4. Layout (`app/playground.tsx` L83–86, L151–365)

### 4.1 Breakpoints
- `wide = width >= 1280` (L61): a three-column row. **This is the acceptance target.**
- `phone = width < 768` (L83).
- 768–1279 ("medium"): a stacked ScrollView.

### 4.2 Wide (≥1280): structure and values
Root (L329): `flex 1`, bg `colors.page`. Its children, in order:
1. the backdrop (only while a menu or the picker is open; §4.5);
2. `<Header/>`, 48 px tall (excluded chrome);
3. the row;
4. the status line (L362).

**Row** (L346): `flex 1, flexDirection row, alignItems stretch, paddingLeft 32, paddingRight 42, zIndex 5`. It holds:
- **List column** (L347): `alignSelf center, marginBottom 8`. The list is width 280 (L255).
- **Stage** (L276–300): `flex 1`, centred (`alignItems/justifyContent center`), `minHeight 0`, padding 0. Inner wrapper `marginRight 24` (L284). It holds `OrbView size={shown}`. Web: `aria-hidden`. Native: a11y label "Orb playground".
- **Panel column** (L349): `alignSelf center`. Panel width 256, `gap 6`, `zIndex 5`, web `role="complementary"` (L152).

**Status line** (L302–310, wide): `position absolute, left 0, right 0, bottom 22 + insets.bottom, zIndex 6, row, centred, gap 8, transform translateX −4.6`, pointerEvents none. It holds `OrbView size={24}` and `<Shimmer text={look.status}/>`.

**Orb size:**
- `maxOrb = max(96, windowH − headerH − 120)` (L85); `shown = min(size, maxOrb)` when wide (L86).
- At 1280×800: maxOrb = max(96, 800 − 48 − 120) = **632**, so the Size slider (16–480) is never clamped at that viewport. `shown = size`, default **320**.

### 4.3 Wide at 1280×800: geometry derived from the code (NOT measured; use these as a check, not as targets)
| Element | Derived box (x, y in CSS px) | Basis |
|---|---|---|
| Row | x 32–1238, y 48–800 (h 752) | header 48, padding 32/42 |
| List | x 32–312 | width 280 |
| Panel | x 982–1238 (w 256) | right padding 42 |
| Stage | x 312–982 (w 670) | flex 1 |
| Stage orb (320) | centre ≈ (635, 424) → x 475–795, y 264–584 | centred in 670 − 24 margin |
| Panel height, Tilt shown | 8 rows × 36 + 8 gaps × 6 + 10 + 20 = **366** → y ≈ 241–607 | L152, L183, L229–231; SelectRow/SliderRow h36 |
| Panel height, flat render | 7 × 36 + 7 × 6 + 10 + 20 = **324** → y ≈ 262–586 | Tilt row removed (L228) |
| Row pitch | 42 (36 + gap 6) | L152 |
| Status line | bottom edge y 778 (800 − 22); centred on x 640, then −4.6 | L307 |
| Wide picker | right edge = panel left − 12 ≈ x 970, width 280 → x ≈ 690–970; top = panel top; height 350 | L214, ColorPicker L240–242 |

- **Measured checks:** Design measured our Color swatch at **x 1225–1245** (live 1206–1226). That is right of the derived panel edge (1238), so the real row content is wider than the 256 box. The likely cause is the TextInput's intrinsic width under `flex: 1`; that cause is unverified. See gap G3.
- Picker vertical position: on 023ca9d (not re-measured since), ours opened **about 53 px higher than live**. See gap G7.

### 4.4 768–1279 and <768 (secondary; not the acceptance bar)
- **ScrollView** (L352): `zIndex 5`, paddingLeft and paddingRight 16. paddingTop is 24 on phone, else 0. paddingBottom is 24 + inset on phone, else 32 + inset.
- **Order:** list (full-width wrapping row, `columnGap 16, rowGap 8`, no hint), then stage, then the status line, then the panel (marginTop 24 on phone, 20 otherwise; panel width 100%).
- **Stage:** phone `minHeight 0.6·windowH, padding 32, marginTop 24`; medium `minHeight shown`.
  - `shown = min(size, min(maxOrb, max(96, width − 32)))`.
- **Status line:** medium puts it in flow (centred row, gap 8). Phone overlays it absolutely at `bottom 24` inside the stage wrapper (L356), with Shimmer `lineHeight 20`.
- **Measured at 390 (non-gating):** the phone header renders at 80 while `headerH` uses 72. The native state list wraps to 5 lines vs 6 on live web.

### 4.5 Backdrop (L335–343)
- While `menu || picker`: a full-window transparent `Pressable`, `position absolute, inset 0, zIndex 4`. On press: native → `setMenu(null)`; all platforms → `setPicker(false)`.
- **On web, menus are not closed by this backdrop.** SelectRow closes itself on any document `pointerdown` outside its row (§6.5).
- **Code-reading note (unverified):** the wide row (L346) and the medium ScrollView both have `zIndex 5`, which is above this backdrop's 4. Whether a click on the stage area reaches the backdrop and closes the picker at 1280 is **unmeasured**. Keep the code as written; don't "fix" it without a measurement.

## 5. State list (`app/playground.tsx` L254–274; `src/content/cards.ts` L135–151; `src/hooks/useArrowKeys.web.ts`)

**Order (`PLAYGROUND`, cards.ts L135–151; the `Look` type is at L4–15):**
| # | Label (`playground`) | state | variant | Status text (`status`, verbatim) | Source |
|---|---|---|---|---|---|
| 0 | Base | base | – | "Working" | LANDING[14] |
| 1 | Working **(default)** | working | – | "Working" | LANDING[0] |
| 2 | Working · Gyro | working | gyro | "Working" | LANDING[4] |
| 3 | Reasoning | reasoning | – | "Thinking" | LANDING[1] |
| 4 | Reasoning · Twins | reasoning | twins | "Thinking" | LANDING[6] |
| 5 | Searching | searching | – | "Searching web" | LANDING[2] |
| 6 | Searching · Lighthouse | searching | lighthouse | "Searching files" | LANDING[3] |
| 7 | Background | background | – | "1 Background Task" | LANDING[5] |
| 8 | Background · Spiral | background | spiral | "2 Background Tasks" | LANDING[7] |
| 9 | Retrying | retrying | – | "Retrying — attempt 2 of 10" | LANDING[8] |
| 10 | Retrying · Surge | retrying | surge | "Retrying — attempt 3 of 10" | LANDING[12] |
| 11 | Compacting | compacting | – | "Compacting context" | LANDING[9] |
| 12 | Compacting · Squeeze | compacting | squeeze | "Compacting context" | LANDING[10] |
| 13 | Compacting · Fuse | compacting | fuse | "Compacting context" | LANDING[11] |
| 14 | Waiting | waiting | – | "Waiting for usage limit to reset" | LANDING[13] |

(I evaluated this table from `cards.ts` with Node. The `—` in the Retrying rows is an em dash, U+2014.)

Appendix 10 has the full `cards.ts`. The other `LANDING` fields (landing, thought, done) belong to the landing page and the creator doesn't use them.

**Wrapper.** `role="navigation"`, label "States", on all platforms. Width 280 when wide, else 100%. `justifyContent center`.

**List.** Web `role="list"`. `flexDirection column` (wide) or `row` + `wrap`, with `columnGap 16, rowGap 8`. That gives a **28-px pitch** when wide (20 + 8).

**Item.** Web wraps each in `role="listitem"`. The Pressable has `accessibilityRole="button"`, `aria-current="true"` when selected, `hitSlop {top 12, bottom 12}`, height 20, `justifyContent center`. Its text is 14/20 `fonts.regular`: **fg when selected, muted otherwise**. A press does `setIndex(i)`. No transition: the colour swaps instantly.

**Hint.** Wide only: "↑ ↓ to switch", muted, 12 px, `marginTop 24, marginBottom −8` (L272). lineHeight isn't set, so it is the font default (unmeasured).

**Keyboard** (`useArrowKeys.web.ts`, web only). A `window` keydown listener:
- ArrowDown → `(i + 1) % n`; ArrowUp → `(i − 1 + n) % n`, both **wrapping**. Calls `preventDefault()`.
- It is ignored when `event.target.closest("input, textarea, select, [contenteditable='true'], [role='slider'], [data-arrow-keys='own']")` matches. So it doesn't fire in the Color text field, the CSS colour input, any slider (all have role slider), or the picker's colour field (`dataSet={{ arrowKeys: "own" }}`).
- Native `useArrowKeys.ts` is a no-op.

**Changing the look** changes `state`/`variant` on both orbs and the Shimmer text. The Shimmer re-fades from opacity 0 → 1 over 300 ms on every text change (Shimmer.web.tsx L20–24). The orb's own transition behaviour is in `AGENT_PROMPT_ORBS.md` §9 (the per-look clock keyed `state@speed`).

## 6. Selects: Shape and Render (`src/components/SelectRow.tsx`, Appendix 2; wired at `app/playground.tsx` L153–182)

### 6.1 Options
- **Shape** (playground L39–45): `sphere` Sphere, `cube` Cube, `octahedron` Octahedron, `tetrahedron` Tetrahedron, `torus` Torus. Default `sphere`. Five options, so the menu content height is `8 + 5·36 = 188` (`place()`, L156).
- **Render** (`RENDERS` from `src/orb/model.ts` L10, labels at playground L47–56): `dots` Dots, `crosses` Crosses, `dashes` Dashes, `halftone` Halftone, `lines` Lines, `mesh` Mesh, `squares` Squares, `verticalLines` Vertical Lines. Default `dots`. Eight options, so `8 + 8·36 = 296`.
- **Flat renders** (`isFlat`, model.ts L25–29): `halftone`, `lines` and `verticalLines`. They remove the Tilt row (playground L228) and drop `tilt` from Copy (§12).

### 6.2 Props and wiring
Props: `SelectRow<T>({ label, value, options, open, onToggle, onPick, display })` (L39–55).
- `open` is `menu === "shape"` or `menu === "render"`.
- `onToggle`: `setPicker(false); setMenu(menu === X ? null : X)`. So opening a select **closes the picker and the other select**.
- `onPick(id)`: `setX(id); setMenu(null)`.
- `display`: the label for the current id. Shape falls back to "Sphere" (L156).

### 6.3 Trigger (L214–243)
- **Outer wrapper:** `View ref=rowRef onLayout=place`, `zIndex open ? 20 : 1`.
- **Gesture:** `GestureDetector gesture={tap} touchAction="pan-y"` wraps a plain `View` (not a Pressable) with:
  - `accessible`, `accessibilityRole="button"`, `collapsable={false}`;
  - web only: `aria-haspopup="listbox"`, `aria-expanded={open}`, and the `onKeyDown`/`onKeyDownCapture` handlers.
- **Style:** height **36**, radius **8**, paddingH **12**, row, `alignItems center`, `space-between`.
  - Background: open → `rgba(255,255,255,0.18)` dark / `rgba(0,0,0,0.10)` light; closed → `colors.row` (`#141414` dark / `#efeff0` light).
  - The background swaps **instantly**, with no transition.
- **Left:** the label, `colors.fg`, `fonts.regular` 13/20.
- **Right:** a row with gap **6**:
  - the `display` text, fg 13/20;
  - the Chevron (`icons.tsx` L23–29): 14×14 SVG, viewBox 16, path `M4 6.5 L8 10.5 L12 6.5`, stroke `colors.muted` (`#a1a1a1` / `#737373`), width 1.4, round caps and joins, no fill. It sits in an `Animated.View` rotated `chevron·180deg`.

### 6.4 Menu (L244–290)
- **Mounted** while `present` is true. `present` goes true on open and false when a close spring **finishes** with `goal === 0` (`hideJS`).
- **While closed** (still mounted during the close spring): `pointerEvents "none"`, `aria-hidden`, `accessibilityElementsHidden`, `importantForAccessibility "no-hide-descendants"`.
- **Position:** absolute, `left 0, right 0`. It sits at `top 40` (4 px under the 36-px trigger), or at `bottom 40` when `above`.
  - `above` = `y + h + (8 + n·36) + 8 > windowH`, using `measureInWindow` on the row (L154–161).
  - It is re-measured on layout and whenever the window height or option count changes.
- **Style:** radius 8, border 1, padding 4, zIndex 30.

  | | dark | light |
  |---|---|---|
  | bg | `colors.pop` `#212121` | `#fafafa` |
  | border | `colors.ringSoft` `rgba(250,250,250,0.12)` | `rgba(0,0,0,0.10)` |
  | boxShadow | `0 8px 24px rgba(0,0,0,0.4)` | `0 4px 16px rgba(0,0,0,0.08)` |
- **Web content:** `createElement("div", { role: "listbox", "aria-label": label })`, holding one `Pressable role="option"` per item with `aria-selected` and `accessibilityState.selected`. Native uses `accessibilityRole="menuitem"`.
- **Option:** height **36**, radius **6**, paddingH **8**, `justifyContent center`.
  - Selected bg: `rgba(255,255,255,0.18)` dark / `rgba(0,0,0,0.10)` light; others are transparent.
  - Text: fg, `fonts.regular` **13** (no lineHeight set). Opacity:
    - dark: selected **0.95**, others **0.7**;
    - light: selected **0.9**, others **0.6**.
  - No hover style in code.
- **Option press:** `onPick(id)`. The parent sets `menu` to null, and the layout effect below closes the menu.

### 6.5 Open/close mechanics, verbatim constants (L33–37)
```ts
const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
const CLOSE_MENU = { stiffness: MENU.stiffness, damping: MENU.damping, mass: MENU.mass, energyThreshold: 7e-7 };
```
- **Shared values** (L61–65): `aboveSV`, `shown` (menu 0→1), `chevron` (0→1), `openSV` (the authoritative open state on the UI thread), `goal`.
- **Animated styles** (L195–199):
  - menu: `opacity = shown`, `translateY = (1 − shown)·(above ? 8 : −8)`, `scale = 0.95 + 0.05·shown`;
  - chevron: `rotate = chevron·180deg`.
  - On an open, the menu rises from 8 px above (or below, when it opens above) and from scale 0.95.
- **Pointer: opens and closes on RELEASE** (`Gesture.Tap().maxDistance(6).maxDuration(10000).onEnd`, L165–194):
  - `next = openSV === 1 ? 0 : 1`.
  - Web: set `openSV` and `goal`; if opening, `revealJS` (mount). Spring `shown` to `next` with **MENU when opening, CLOSE_MENU when closing**; spring `chevron` with CHEV. Then `commitNextFrame()`, which runs `requestAnimationFrame(() => { armed = true; startTransition(onToggle) })`.
  - Native: `withSpring(next, MENU)` and CHEV, then `commitJS` (immediate).
  - There is no `onFinalize` revert. A press that moves more than 6 px, or is held longer than 10 s, does nothing, and a held press shows no change until release.
- **`armed`** (L137–153): the parent's `open` prop flip that results from our own commit is swallowed (the springs are already running). Any other `open` change (an option pick, the other select opening) runs `withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU)` and CHEV. So **every web close uses CLOSE_MENU; native closes use MENU**.
- **Web outside press and Escape** (L103–124): while `open`, two passive document listeners are attached:
  - `keydown` (Escape);
  - `pointerdown` (`OUTSIDE_CLOSE_EVENT`), only when the target is outside `rowRef`. The trigger and the menu are inside it.

  Either one calls `dismissWeb()` (L93–102): if `openSV === 1`, set `openSV = goal = 0`, spring `shown` to 0 with CLOSE_MENU (hiding on finish), spring `chevron` to 0 with CHEV, then `commitNextFrame()`. The close starts on **press-down** (ruling: "Outside click closes on press-down").
- **Web keys on the focused trigger:**
  - `onKeyDownCapture` (L200–207): **Enter** calls stopPropagation; if it is not a key repeat, `driveWebSprings(openSV === 1 ? 0 : 1)` (L125–133: MENU to open, CLOSE_MENU to close) and then `commitNextFrame()`.
  - `onKeyDown` (L208–213): **Space / "Spacebar"** only calls `preventDefault()` (no page scroll). The Space toggle itself comes from RN-web's button-role key activation on the focused trigger.
  - Measured (Beta, 023ca9d and 9bef3b1): Space, Space, Enter, Enter toggles exactly like live (open, close, open, close; no scroll). "Space/Enter open exactly once."
- **Focus:** no code moves focus into the menu or back to the trigger. Live behaves differently (gap G9).
- **Native:** the menu is closed by the screen backdrop (§4.5) or by picking an option.

## 7. Color row: text input and swatch (`app/playground.tsx` L183–212, helpers L23–37)

### 7.1 Row
- Style: `View`, height **36**, radius **8**, bg `colors.row`, paddingLeft **12**, paddingRight **8**, row, `alignItems center`, gap **8**.
- **Border:** width **1** only while `picker` is open (0 otherwise), colour `colors.ring` (`rgba(250,250,250,0.3)` dark / `rgba(23,23,23,0.3)` light).
- The border adds 1 px inside the 36-px box, so the content shifts 1 px while the picker is open (RN-web uses border-box).

### 7.2 Children, left to right
1. **"Color" label:** `Text`, fg, `fonts.regular` **13**, no lineHeight. Design measured it **17 px tall vs live 20**, and **solid fg vs live alpha** (gap G4).
2. **Value TextInput:**
   - `flex 1`, fg, `fonts.mono` **13**, `textAlign right`, `paddingVertical 0`, `autoCapitalize none`, `autoCorrect false`, a11y label **"Color color value"**.
   - `ref={bindTitle(draft)}` sets the DOM `title` attribute to the current draft (web).
   - Measured **17 px tall vs live 25** (G4). The focus ring is the browser default (G5).
   - **Editing:** `onChangeText` only updates `draft`. Nothing applies until **Enter/submit** (`onSubmitEditing`). There is no blur handler, so blurring keeps the un-applied draft text.
   - **Submit** (L188–194):
     ```ts
     const next = parseColor(draft);
     if (next) { exact.current = null; setPlaygroundColor(draft.trim()); }
     else setDraft(playgroundColor);
     ```
     A valid input is applied as the trimmed **text exactly as typed**: the case and format are kept, and that text is what Copy emits in `className`. An invalid input reverts to the current colour text.
   - `draft` re-syncs whenever `playgroundColor` changes (L96–98), from the picker, Reset or the theme toggle.
3. **Swatch:** `Pressable`, **20×20**, radius **6**, border **1** `colors.ringSoft`, bg `swatchHexFrom(parsed, colors.fg)`. That is the **sRGB-clamped `#rrggbb`**: alpha is ignored and out-of-sRGB colours are chroma-clamped.
   - a11y: label **"Pick color color"**; web `role button`, `aria-haspopup="dialog"`, `aria-expanded={picker}`.
   - Press: `setMenu(null); setPicker(v => !v)`. It toggles the picker and closes any select. There is no pressed or hover style.
   - Measured position at 1280: **x 1225–1245 vs live x 1206–1226** (G3).

### 7.3 Input parsing and validation (`src/color/color.ts` L150–233, verbatim in Appendix 13)
`parseColor(input)` trims and lower-cases the input, then accepts:
- `transparent`;
- `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`;
- `oklch(L C H [/ A])`: space-separated only; L as a number or %, C as a number or % of 0.4, H in deg/rad/grad/turn;
- `rgb()`/`rgba()`: commas (3 or 4 parts; percentages all-or-none) or the space + `/` syntax;
- `hsl()`/`hsla()`: S and L must be %;
- `color(display-p3 r g b [/ A])`, space-separated only.

Everything else returns `null`: named colours, `color(srgb …)`, commas inside `oklch()` or `color()`, a wrong channel count.

Examples (evaluated with Node from the 9bef3b1 `color.ts`; output shown as hex | oklch | p3 formatting, then `detectFormat`):

| Input | Result |
|---|---|
| `#fff` | `#ffffff` \| `oklch(1 0 0)` \| `color(display-p3 1 1 1)`; hex |
| `#FFF8` | `#ffffff88` \| `oklch(1 0 0 / 0.5333)` \| `color(display-p3 1 1 1 / 0.5333)`; hex |
| `#f6339a` | `#f6339a` \| `oklch(0.6558 0.2404 354.32)` \| `color(display-p3 0.88798 0.27752 0.59468)`; hex |
| `rgb(246 51 154 / 0.5)` | `#f6339a80` \| `oklch(0.6558 0.2404 354.32 / 0.5)` \| `color(display-p3 0.88798 0.27752 0.59468 / 0.5)`; hex |
| `rgb(50%, 20%, 60%)` | `#803399` …; hex |
| `hsl(330 90% 58%)` | `#f43494` …; hex |
| `oklch(70% 0.3 30deg / 50%)` | `#ff655180` \| `oklch(0.7 0.3 30 / 0.5)` \| `color(display-p3 0.92879 0.43549 0.35204 / 0.5)`; oklch |
| `color(display-p3 1 0 0)` | `#ff3428` \| `oklch(0.6486 0.2995 28.96)` \| `color(display-p3 0.92047 0.28547 0.21888)`; p3 (P3 *output* is computed from the sRGB-clamped colour, `color.ts` L128–131) |
| `transparent` | `#00000000` …; hex |
| `#171717` | `#171717` \| `oklch(0.2046 0 0)` \| `color(display-p3 0.0902 0.0902 0.0902)`; hex |
| `red`, `rgb(50%, 20, 60%)`, `hsl(330, 90, 58)`, `oklch(0.7, 0.3, 30)`, `color(srgb 1 0 0)`, `#12345` | `null` (rejected, so the field reverts) |

### 7.4 Which colour reaches the orbs
- `parsed` (L87) is the picker's exact OKLCH if `exact.text === playgroundColor`. Otherwise it is `parseColor(playgroundColor)`, with white `{l 1, c 0, h 0, a 1}` as the last fallback.
- `rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed)` (L88) goes into `live` (§10).
- Both orbs also get `color={playgroundColor}` as a prop.
- On web, P3-capable displays keep out-of-sRGB colours (chroma limited to P3). Android and Expo Go clamp to sRGB (`AGENT_PROMPT_ORBS.md` §12).

## 8. Colour picker (`src/components/ColorPicker.tsx`, Appendix 4; mounted at `app/playground.tsx` L213–223)

### 8.1 Mounting and placement
- The picker is mounted only while `picker` is true. It **mounts fresh on every open**: the format resets to Hex and the entrance replays.
- **Wide (≥1280)** (L213–217): it sits in an absolute wrapper inside the panel, `right: "100%", top: 0, marginRight: 12, zIndex: 40`. It opens **to the left of the panel**, top-aligned with the panel's first row, and is passed `wide` (width 280).
  - Measured on 023ca9d (not re-measured): ours opened about **53 px higher** than live (G7).
- **Phone (<768)** (L218–222): absolute `left 0, top 40, width 280, zIndex 30`, `wide={false}` (width 100% of 280).
- **Medium** (L223): inline in the panel flow after the Color row, full width.
- **DOM/Tab order:** the picker is rendered immediately **after the Color row and before the sliders** (L213–223 sit between L212 and L224). So after the swatch, the next Tab stop is inside the picker. Measured (Beta 9bef3b1): the "1st Tab → Color field group (tabindex 0)" matches live.
- **Props:** `color={parsed}` (Oklch), `onChange={remember}`. `remember(color, text)` stores `exact = { color, text }` and calls `setPlaygroundColor(text)` (L89–92).

### 8.2 Container (L234–252)
- `Animated.View role="dialog"`, a11y label **"Color color picker"**.
- **Size:** width **280** (wide) or `100%`; **height 350**. Radius **14**, border **1** `colors.ringSoft`, padding **8**, gap **8**.

  | | dark | light |
  |---|---|---|
  | bg | `colors.pop` `#212121` | `#fafafa` |
  | border | `rgba(250,250,250,0.12)` | `rgba(23,23,23,0.12)` |
  | boxShadow | `0 8px 32px rgba(0,0,0,0.5)` | `0 4px 20px rgba(0,0,0,0.08)` |
- **Entrance** (L136–138, L227–230): `progress = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) })`, giving `opacity = p`, `translateY = (1 − p)·3`, `scale = 0.98 + 0.02·p`. **There is no exit animation**; it unmounts instantly.
- **Derived inner layout** (code arithmetic, not measured):
  - content box 262 × 332 (280 − 2 border − 16 padding; 350 − 2 − 16);
  - children: tabs 28 (24 + 2·2 padding), field **flex 1 = 332 − 4·8 − 28 − 36 − 36 − 32 = 168**, Hue 36, Opacity 36, input 32.

### 8.3 Format tabs (L253–276)
- **Track:** `accessibilityRole radiogroup`, label "Color format", row, bg `colors.row`, radius 8, padding 2.
- **Tabs** (`TABS`, L17–21): `hex` "Hex", `oklch` "OKLCH", `p3` "Display P3". Default `hex` (L120).
  - Each is a `Pressable` with `accessibilityRole radio`, `aria-checked`, `flex 1`, height **24**, radius **6**, centred.
  - Selected bg `#3a3a3a` dark / `#ffffff` light (L129); others transparent.
  - Text fg `fonts.regular` **11**.
- **Web:** `focusable={false}` and `tabIndex={-1}`. The tabs are **not in the Tab order**; pointer only.
- **Press:** `text = formatColor(color, tab.id)`, then `setFormat`, `setDraft(text)`, `onChange(color, text)`. The Color row text switches to that format straight away. The colour itself is unchanged, except that P3 and hex output are computed from the sRGB-clamped colour.

### 8.4 Colour field (L277–325)
- **Wrapper:** a `View` inside `GestureDetector(Pan)`, with `role="group"` and a11y label **"Color field; use arrow keys to adjust saturation and lightness"**. `flex 1`, radius **8**, `overflow hidden`.
  - Web only: `dataSet={{ arrowKeys: "own" }}` (so the state-list ↑/↓ ignores it), `focusable`, **`tabIndex 0`**, `onKeyDown={onFieldKey}`.
  - `onLayout` stores `box {w, h}`.
- **Web paint** (L80–102, L288–296): a `<canvas>` (`key=space`, so it remounts when the space changes) with a **252×160 backing store**, CSS-stretched to 100%×100%, `aria-hidden`, `pointerEvents none`.
  - `paintField` fills each pixel in **OKLCH** at the *current* hue `color.h`:
    - `l = 1 − y/(h−1)` (top = lightness 1);
    - `c = x/(w−1) · maxChroma(l, hue, space)` (left = grey, right = max in-gamut chroma);
    - converted with `oklchToRgb(…, space)` and clamped to bytes.
  - The context is `getContext("2d", { colorSpace: "display-p3" })` on the **Display P3** tab, `"srgb"` otherwise.
  - It repaints when `color.h` or `space` changes (L132–134).
- **Native paint** (L298–301): two `expo-linear-gradient` layers, white → `pureHue(hue)` horizontally, then transparent → black vertically (HSV square).
- **Handle** (L303–323): absolute, **16×16**, margins −8, radius 8, border **2 `#ffffff`**, fill `formatColor(color, "hex")`. Shadow is `#000` at opacity 0.45, radius 3, offset (0, 1), elevation 3.
  - Position: web `left = chromaRatio·100%`, `top = (1 − l)·100%`; native `left = s·100%`, `top = (1 − v)·100%`.
- **Pointer** (L152–163, L217–219): `Gesture.Pan().onBegin(fromSquare).onUpdate(fromSquare)`, so a press applies at once and a drag tracks.
  - Web: `l = clamp(1 − y/box.h)`, `ratio = clamp(x/box.w)`, `c = ratio · maxChroma(l, color.h, space)`, keeping `h` and `a`.
  - Native: `hsvToOklch(hue, x/w, 1 − y/h, a)`.
- **Keyboard (web, field focused)** (L164–184):
  - ↑/↓: lightness ± step; →/←: chroma ratio ± step.
  - **Step 0.01, or 0.1 with Shift.** Values are clamped to 0–1.
  - Calls preventDefault and stopPropagation. Other keys pass through.
- **Measured (Beta, 9bef3b1):** "3 click points" give **#914861 / #5e3d47 / #f3a3bb**, identical to live. Arrows change the value the same way (live f4a2bb…f8619a, ours f4a2bb…f7629a, ±1 hex rounding).

### 8.5 Hue row (L326–345)
- **Row:** a `View` inside `GestureDetector(Pan)`. Height **36**, radius 8, bg `colors.row`, row, centred, paddingH **12**, gap **10**.
  - Web: `accessibilityRole "adjustable"` (renders `role=slider`), label "Hue", `aria-valuemin 0`, `aria-valuemax 360`, `aria-valuenow = round(hue·10)/10`, **`aria-valuetext "${round(hue)} degrees"`**, `tabIndex 0`, `onKeyDown = onSliderKey("hue")`.
- **Children:**
  - "Hue" fg 13;
  - a track `flex 1`, height **8**, radius **4**, bg `colors.slider` (`#3e3e3e` / `#d7d7d8`);
  - a thumb, absolute `left = hue/360·100%`, **8×16**, marginLeft −4, radius 1, bg fg.
- **Hue source** (L123–125, L142–144): `hue = hsv.s > 0.01 ? hsv.h : heldHue`, where `heldHue` keeps the last hue while the colour is grey.
- **Pointer** (L185–189): `h = clamp((x / hueW)·360, 0, 360)` → `hsvToOklch(h, s, v, a)`.
  - **Code note:** `hueW` and `x` come from the **whole row** (`onLayout` on the row, L337), not the visible track. So a pointer x maps over the full 262-px row, including the label area, while the thumb is drawn within the track.
  - Measured on 023ca9d: a click at 0.437 of the track gave Hue 157 vs live 155; a drag to 0.6133 gave 220.8 vs live 225 (G8).
- **Keys** (L191–215): span 360, **step 0.1**, page `max(36, 0.1)` = **36**.
  - →/↑ +step, ←/↓ −step, PageUp/PageDown ±page, Home → 0, End → 360. Clamped; preventDefault.
  - Measured on 023ca9d: the sequence → → ← ↑ ↓ Shift+→ PageUp End Home ← matched live exactly.

### 8.6 Opacity row (L346–370)
- **Row:** the same as Hue, except label "Opacity", aria 0–100, `aria-valuenow = round(a·100)`, **`aria-valuetext "${round(a·100)} percent"`**.
- **Track:** `flex 1`, height **10**, radius **4**, `overflow hidden`, holding a **16-cell checkerboard** (one row, alternating `#d8d8d8` / `#ffffff`, starting `#d8d8d8`).
  - The track shows no colour gradient: it is the checkerboard only (code).
  - Thumb: **8×16** fg at `a·100%`.
- **Pointer:** `a = clamp(x / opW)` (full-row width, as above).
- **Keys:** span 1, **step 0.01** (1 aria unit), page **0.1**, Home 0, End 1.
- **Measured on 023ca9d:** a click at 0.437 gave 44 vs live 43; a drag to 0.6133 gave 61 vs live 63.

### 8.7 CSS value input (L371–388)
- `TextInput`, height **32**, radius 8, bg `colors.row`, fg, `fonts.mono` **12**, paddingH **8**, a11y **"CSS color"**, no autocapitalize or autocorrect.
- It shows `formatColor(color, format)`, re-synced on every colour or format change (L139–141).
- **Submit:** if `parseColor(draft)` fails, it reverts to the formatted current colour. Otherwise `detectFormat(draft)` (`oklch(` → oklch, `color(display-p3 ` → p3, else hex) **switches the active tab** and applies, writing back in that format.
- Focus ring: browser default (gap G5 is about the Color-row input; the same default applies here; live styling of this input is unmeasured).

### 8.8 Output text written back to the Color row
`formatColor` (`color.ts` L125–137):
- **hex:** `#rrggbb`, or `#rrggbbaa` when a < 1, from the sRGB-clamped colour.
- **oklch:** `oklch(L C H[ / A])`, with L and C to 4 decimals and H to 2 (trailing zeros dropped by `Number()`).
- **p3:** `color(display-p3 r g b[ / A])`, 5 decimals, from the sRGB-clamped colour mapped through the CSS Color 4 sRGB→P3 matrix (L114–123).

### 8.9 Focus and Tab sequence (web)
After the swatch opens the picker, Tab goes: **field (canvas group) → Hue → Opacity → CSS color input → Size slider …**.
- The three format tabs are skipped.
- No code moves focus into the picker on open, and there is no focus trap.
- **Escape does not close the picker.** No handler exists; the swatch or the backdrop closes it.
- The Hue/Opacity rows draw no focus style of their own (the browser default for a focused `div[tabindex]` applies; unmeasured vs live).

## 9. Sliders (`src/components/SliderRow.tsx`, Appendix 3; wired at `app/playground.tsx` L224–228)

### 9.1 The five sliders (playground L224–228)
| Label | min | max | step | default | decimals (value text) | default text | default fill ratio (`(v−min)/(max−min)`) | field → `live` | shown |
|---|---|---|---|---|---|---|---|---|---|
| Size | 16 | 480 | 1 | 320 | 0 | `320` | 0.6552 | `size` | always |
| Speed | 0.05 | 3 | 0.05 | 1 | 2 | `1.00` | 0.3220 | `speed` | always |
| Density | 0.25 | 3 | 0.05 | 1 | 2 | `1.00` | 0.2727 | `density` | always |
| Dot Size | 0.25 | 3 | 0.05 | 1 | 2 | `1.00` | 0.2727 | `dotSize` | always |
| Tilt | −90 | 90 | 1 | 20 | 0 | `20` | 0.6111 | `tilt` | **only when `!isFlat(render)`** (L228) |

- Each slider has `onChange = setX` and `live={live}`, plus `onDrag={(active) => { sliding.current = active; }}`.
- Default fill widths at a 256-px row (derived): Size 167.7 px, Speed 82.4, Density and Dot Size 69.8, Tilt 156.4.

### 9.2 Row anatomy (L308–361)
- **The whole row is the slider:** an `Animated.View` inside `GestureDetector(Race(pan, tap))`.
  - Height **36**, radius **8**, bg `colors.row`, `overflow hidden`, `justifyContent center`.
  - The whole row translates by `over` (rubber band).
- **Fill** (L349): absolute `left 0, top 0, bottom 0`, bg `colors.slider` (`#3e3e3e` dark / `#d7d7d8` light), width `clamp(fill)·100%`.
- **Hashmarks** (L350–352): **9** lines at **10, 20 … 90 %**, `top 8, bottom 8` (20 px tall), **width 1**, bg fg. Opacity is `marksOp`: **0.35** while visible, else 0, via `withTiming(…, 200)` (L144). The step count doesn't matter; there are always 9.
- **Handle** (L353–356):
  - absolute, `top 8`, **3×20**, marginLeft −1.5, radius 1, bg fg, pointerEvents none;
  - `translateX = fill·width`, plus `scaleX` and `scaleY`, plus opacity `handleOp`.
- **Text** (L357–360): a row, space-between, paddingH **12**, pointerEvents none.
  - Label: fg `fonts.regular` **13**.
  - Value: fg `fonts.mono` **13**, showing `labelText` (`value.toFixed(decimals)`). It updates live during drags and taps.
  - Both are measured via onLayout for the near-zone calculation.
- **Focus** (web): `focusable`, `tabIndex 0`. While focused it draws `outline: 2px solid fg; outline-offset: 2px` (L341–344).
- **Hover** (web): `onPointerEnter`/`onPointerLeave` set `hover` to 1/0.

### 9.3 Handle and marks reaction (L125–146)
```
trackW = width; O = fill·100
ee = labelW > 0 ? (10 + labelW + 8)/trackW·100 : 30
et = valueW > 0 ? (trackW − 12 − valueW − 8)/trackW·100 : 78
near = O < ee || O > et
visible = dragging || hover > 0
handleOp → withTiming(!visible ? 0 : near ? 0.1 : dragging ? 0.9 : 0.5, 150 ms)
scaleX   → withSpring(visible ? 1 : 0.25, HANDLE_X)
scaleY   → withSpring(near && visible ? 0.75 : 1, HANDLE_Y)
marksOp  → withTiming(visible ? 0.35 : 0, 200 ms)
```
- Hover shows the handle at 0.5 and the marks at 0.35; dragging shows the handle at 0.9.
- **Measured on 023ca9d** (hovering Size at 80 % at 1280): live handle x **1141**, w3, h20, opacity 0.5; ours x **1148**, w3, h20, opacity 0.5 (+7 px).
- **Live shows no hashmarks on hover** (G10).

### 9.4 Springs and timing (L10–14, verbatim)
```ts
const FILL = { stiffness: 300, damping: 25, mass: 0.8 };
const BACK = { stiffness: 224, damping: 25.4, mass: 1 };
const HANDLE_X = { stiffness: 439, damping: 35.6, mass: 1 };
const HANDLE_Y = { stiffness: 685, damping: 47.1, mass: 1 };
const PUSH_MS = 32;
```

### 9.5 Pointer gesture (L202–297)
**`Gesture.Race(pan, tap)`.**

**Pan.** `activeOffsetX [−4, 4]`, `failOffsetY [−6, 6]`, so a mostly vertical motion fails the pan and the page scrolls.
- `onBegin`, at press-down:
  - saves `savedFill`;
  - `x = clamp(e.x, 0, width)`, then `next = snap(min + x/width·(max−min))`;
  - sets `pending = next` and `tapAnim = true`;
  - **`fill → withSpring(ratio(next), FILL)`**: the fill jumps toward the press point immediately, on press-down;
  - the value text follows the animating fill while `tapAnim` (L167–173, `showRatio`).
- `onUpdate`: becomes a drag once |translation| ≥ 4 on either axis (`dragged = dragging = true`, `tapAnim = false`). Then each frame:
  - `ratio = x/width`, with the fill tracking **1:1, no spring**;
  - below 0 or past `width`: `over = ∓min(18, overshoot·0.25)` and the ratio is pinned at 0 or 1;
  - `pending = snap(…)`;
  - **`writeLive(live, field, next)` every frame** (the orb updates on the UI thread);
  - JS `publish(next)` at most every **32 ms**. That sets `sliding = true` (via `onDrag(true)`), updates the value text, and calls `onChange`.
- `onEnd`:
  - `over → withSpring(0, BACK)`;
  - `next = snap(clamp(e.x))`;
  - `fill → withSpring(ratio(next), FILL)`;
  - `writeLive`, then `commit(next)`, which calls `onDrag(false)`, updates the value text and calls `onChange`.

**Tap.** `maxDistance 6`, `maxDuration 10000`. `onEnd` sets `tapAnim = false`, writes `pending` to live, and commits it. So a click commits on release the value that was snapped at press-down.

**Abandoned gesture** (`revertIfAbandoned`, L203–215): if both pan and tap finalize without an `onEnd`, the slider springs `over` to 0 (BACK) and `fill` back to `savedFill` (FILL), and reverts the text.

**`snap`** (L18–24): clamp, round to the nearest step from `min`, clamp again, then `Number(toFixed(4))`. It always snaps.

**Ruling:** "Slider first move ≤ 50 ms." Measured on 023ca9d: the first paint after pointer input took 7.65 ms (Hue) and 8.25 ms (Opacity) on ours vs 4.25 ms on live, within the bar. These were picker rows; the panel slider value is **unmeasured** separately.

### 9.6 External value changes (L148–165)
- When `value` changes from outside (keyboard, Reset, a11y action), `fill → withSpring(target, FILL)` and the text updates.
- Skipped while dragging or tap-animating.
- The first sync after our own commit only updates the text (`skipSync`).

### 9.7 Keyboard and a11y (web) (L175–200, L310–327)
- While focused, a `window` keydown listener handles:
  - →/↑ **+1 step**, ←/↓ **−1 step**;
  - **PageUp/PageDown ±10 steps**;
  - **Home → min, End → max**.
- It calls preventDefault and stopPropagation, then `onChange(snap(value + n·step))`, so the fill springs with FILL.
- a11y: `accessibilityRole "adjustable"` (web `role=slider`), label = the row label, `accessibilityValue {min, max, now: value, text: labelText}`, `aria-valuemin/max/now`, increment/decrement actions (±1 step).

## 10. Control → orb mapping and live preview wiring

### 10.1 Mapping table (`app/playground.tsx`; orb prop names from `src/orb/OrbView.tsx`)
| Control | Screen state | Stage orb prop (L285–297) | Status orb prop (L311–323) | `live` field (L93, L116–119) | Copy (§12) |
|---|---|---|---|---|---|
| State list | `index` → `look` | `state={look.state}`, `variant={look.variant}` | same | – | `state`, `variant` |
| Shape select | `shape` | `shape` | `shape` | – | `shape={x}` + import |
| Render select | `render` | `render` | `render` | – | `render={x}` + import |
| Color row / picker | `playgroundColor` (+ `exact`) | `color={playgroundColor}` | same | `r, g, b, a` (from `rgba`, L88) | `className="text-[…]"` |
| Size | `size` | **`size={shown}`** (= min(size, maxOrb) when wide) | **`size={24}` (fixed)** | `size: shown` | `size={size}` (the slider value, **not** `shown`) |
| Speed | `speed` | `speed` | `speed` | `speed` | `speed` |
| Density | `density` | `density` | `density` | `density` | `density` |
| Dot Size | `dotSize` | `dotSize` | `dotSize` | `dotSize` | `dotSize` |
| Tilt | `tilt` | `tilt` | `tilt` | `tilt` | `tilt` (omitted when flat) |

### 10.2 The `live` SharedValue
- `live = useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba })` (L93). **Both orbs receive the same `live`.**
- **What the orb actually reads from `live` each frame** (`src/orb/OrbView.tsx` L180–196, L82–98): `tune.speed` (clock and look key), `tune.tilt` (`step`), and `tune.r/g/b/a` (paint). **`live.size`, `live.density` and `live.dotSize` are not read by the renderer.** Geometry comes from the `size`/`density`/`dotSize` props through `buildInput` (L165–166, `model.ts` L125–164).
  - So during a drag, Speed, Tilt (and colour) change on the next frame with no React render.
  - Size, Density and Dot Size change only when the throttled JS publish (≤ every 32 ms) re-renders the props.
  - That is also why the status orb stays 24 px even though `live.size === shown`. This matches `AGENT_PROMPT_ORBS.md` §14.3.
- **Who writes `live`:**
  1. The screen effect (L116–119), whenever `shown`, `speed`, `density`, `dotSize`, `tilt` or `rgba` changes, **unless `sliding.current`**.
  2. `SliderRow.writeLive` on the UI thread during a drag (every frame), on pan end and on tap end. It replaces only its own field (L26–34).
- **`sliding`** is set true on the first throttled publish of a drag and false on commit, so React re-renders during a drag don't overwrite the per-frame value.

### 10.3 Other side effects
- **Leaving a flat render** (Halftone, Lines or Vertical Lines → any other) sets `tilt` back to 20 (L111–114). Entering one hides the Tilt row but keeps `tilt` in state, and still passes it to the orbs, which ignore it for flat renders (see ORBS).
- **Shape and Render are not reset** by Reset (L235–243).
- **The orbs' animation clock** restarts on a state or speed change (`state@speed` key), per ORBS §9. A speed drag therefore restarts the clock phase on each new value (gap noted in ORBS; unmeasured vs live).

## 11. Status line: mini orb + shimmer (`app/playground.tsx` L302–326; `Shimmer.web.tsx`, `Shimmer.tsx`)

### 11.1 Structure
- A row (gap **8**, centred, pointerEvents none) holding:
  - `OrbView` **size 24**, with the same `state`/`variant`/`speed`/`density`/`dotSize`/`tilt`/`shape`/`render`/`color`/`live` as the stage;
  - `<Shimmer text={look.status} />`.
- **Wide** (L307): `position absolute, left 0, right 0, bottom 22 + insets.bottom, zIndex 6, transform translateX −4.6`. It is rendered at the root after the row (L362), so it is centred on the **whole window width**, not the stage.
- **Phone:** Shimmer gets `{ lineHeight: 20 }` (L324).

### 11.2 Shimmer, web (`Shimmer.web.tsx`, 50 lines)
- **Keyframes:** a one-time injected `<style>`: `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}` (L7–14).
- **Wrapper:** an `Animated.View`, opacity `withTiming(1, {duration: 300})`, reset to 0 and replayed **on every `text` change** (L19–25).
- **`<span>` style** (L29–46):
  - font `fonts.regular` (Geist stack), **14 px**, lineHeight **"1.65"** unless overridden (23.1 px), `display inline-block`;
  - `background-image: linear-gradient(90deg, muted 35%, fg 50%, muted 65%)`, `background-size: 200% 100%`, `background-clip: text` (with `-webkit-`), `color: transparent`;
  - `animation: orb-shimmer 2s linear infinite`.
- **Reduced motion** (`useReducedMotion()`): no gradient or animation; plain `color: muted`. The 300 ms fade still runs.
- Colours: dark muted `#a1a1a1` / fg `#fafafa`; light muted `#737373` / fg `#0a0a0a`.

### 11.3 Shimmer, native (`Shimmer.tsx`, 69 lines)
- A Skia `Canvas` (width = text width from `useFont(Geist-Regular.ttf, size)`, height `ceil(size·1.45)`).
- An alpha mask of the text over a `LinearGradient` rect: colours `[muted, muted, fg, muted, muted]` at positions `[0, 0.35, 0.5, 0.65, 1]`, `mode repeat`, start x = `shift`, end x = `shift + 2w`.
- `shift` runs `−2w → 2w` with `withRepeat(withTiming(…, {duration: 2000, easing: linear}), −1)`.
- The same 300 ms fade as web.
- With reduced motion, or before the font loads, it falls back to a plain RN `Text` in muted.
- It needs `assets/fonts/Geist-Regular.ttf`, a binary that isn't inlined.

## 12. Copy and Reset (`app/playground.tsx` L121–144, L229–250; `src/content/snippet.ts`)

### 12.1 Row (L229–250)
- `View`, `marginTop 10` (on top of the panel gap 6), row, centred, **gap 16**.
- **Copy:** a `Pressable` with `hitSlop 8` and web `role button`. Its text is muted, `fonts.regular` **14/20**: **"Copy"**, or **"Copied"** for 1500 ms after a successful write.
- **Reset:** a `Pressable` with `hitSlop 8` and a11y label "Reset" (no explicit role). Same muted 14/20 text, **"Reset"**.
- **Reset visibility** (L233): shown only when `playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase()` or `size !== 320 || speed !== 1 || density !== 1 || dotSize !== 1 || tilt !== 20`.
  - Shape, Render and the selected state **don't** make Reset appear, and Reset doesn't touch them.
- No hover or pressed styling in code.

### 12.2 Copy behaviour (L121–144)
1. `text = orbSnippet({ state: look.state, variant: look.variant, size, speed, density, dotSize, tilt, shape, render, color: playgroundColor, themeDefault: colors.orb, flat })`.
2. `setStringAsync(text)` (expo-clipboard). Then, if still mounted: `setCopied(true)`, clear any previous timer, and `setTimeout(() => setCopied(false), 1500)`.
   - A second Copy inside the window restarts the 1500 ms.
3. The timer is cleared on unmount and on screen blur.
4. **Measured on 023ca9d:** "Copied" reverts after a median of **1504.3 ms** vs live **1501.9 ms**.
5. There is no error path. If the clipboard write rejects, the label stays "Copy".

### 12.3 Reset behaviour (L234–243)
`setSize(320); setSpeed(1); setDensity(1); setDotSize(1); setTilt(20); exact.current = null; setPlaygroundColor(colors.orb)`.
- `colors.orb` is the *current mode's* default: `#ffffff` in dark, `#171717` in light.
- The sliders spring to their new fills with FILL (§9.6).

### 12.4 Exact output template (`src/content/snippet.ts`, full file in Appendix 11)
```ts
const DEFAULTS: Record<string, string | number> = { variant: "default", size: 20, speed: 1, density: 1, dotSize: 1, tilt: 20 };
…
const entries: [string, string | number | undefined][] = [
  ["state", opts.state],
  ["variant", opts.variant && opts.variant !== "default" ? opts.variant : "default"],
  ["speed", opts.speed],
  ["density", opts.density],
  ["dotSize", opts.dotSize],
  ["tilt", opts.flat ? undefined : opts.tilt],
  ["size", opts.size],
];
… props.push(typeof value === "string" ? `${key}="${value}"` : `${key}={${value}}`);   // skipped when undefined or === DEFAULTS[key]
const imports = ['import { Orb } from "@yogesharc/thinking-orbs";'];
if (opts.shape !== "sphere") { props.push(`shape={${opts.shape}}`); imports.push(`import { ${opts.shape} } from "@yogesharc/thinking-orbs/shapes";`); }
if (opts.render !== "dots") { props.push(`render={${opts.render}}`); imports.push(`import { ${opts.render} } from "@yogesharc/thinking-orbs/renders";`); }
if (opts.color.toLowerCase() !== opts.themeDefault.toLowerCase()) props.push(`className="text-[${opts.color}]"`);
return `${imports.join("\n")}\n\n<Orb ${props.join(" ")} />`;
```
**Rules:**
- **Prop order:** state, variant, speed, density, dotSize, tilt, size, then shape, render, className.
- `state` is always emitted (it has no default).
- `size` is the **slider value**, not the clamped `shown`. The npm default is 20, so `size={320}` appears at the creator default.
- `tilt` is omitted for flat renders even when it isn't 20.
- Numbers print with JS `String(number)`: `1.5`, `0.75`, `-30`.
- The colour text appears **exactly as stored** (as typed after trim, or the picker's formatted text) inside `text-[…]`, spaces included.
- The output is **web JSX for the npm `@yogesharc/thinking-orbs` package**, not the RN `OrbView`. That's intentional: it's the live site's format.

### 12.5 Evaluated examples (I ran the 9bef3b1 `orbSnippet` in Node; the exact strings follow, with `\n` shown as line breaks)
1. **Defaults (dark, Working):**
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
4. Compacting · Fuse, Halftone (flat), Tilt 45: `…\nimport { halftone } from "@yogesharc/thinking-orbs/renders";\n\n<Orb state="compacting" variant="fuse" size={320} render={halftone} />` (tilt dropped).
5. Light mode, colour `#171717` (= the light default): no className.
6. Colour `oklch(0.7 0.3 30)`: `<Orb state="working" size={320} className="text-[oklch(0.7 0.3 30)]" />`.

## 13. Creator colours, light and dark (`src/theme/theme.tsx` L28–68 plus the literals in the components)

The theme starts **dark** and resets to dark on route change. The header toggle flips it (§3).

| Token / literal | Dark | Light | Used by |
|---|---|---|---|
| `page` | `#000000` | `#f9f9fa` | screen bg (playground L329) |
| `fg` | `#fafafa` | `#0a0a0a` | labels, values, selected list item, handles, hashmarks, thumbs, slider focus outline |
| `muted` | `#a1a1a1` | `#737373` | unselected list items, hint, Copy/Reset, chevron, shimmer base |
| `row` | `#141414` | `#efeff0` | select trigger (closed), Color row, slider rows, picker tabs track, Hue/Opacity rows, CSS input |
| `slider` | `#3e3e3e` | `#d7d7d8` | slider fill, Hue track |
| `pop` | `#212121` | (`#ffffff`, not used here: light menus and picker use the `#fafafa` literal) | select menu bg, picker bg (dark) |
| literal `#fafafa` | – | `#fafafa` | select menu bg, picker bg (light) |
| `ring` | `rgba(250,250,250,0.3)` | `rgba(23,23,23,0.3)` | Color row border while picker open |
| `ringSoft` | `rgba(250,250,250,0.12)` | `rgba(23,23,23,0.12)` | swatch border, picker border, menu border (dark) |
| literal menu border | (ringSoft) | `rgba(0,0,0,0.10)` | SelectRow L260 |
| open trigger / selected option | `rgba(255,255,255,0.18)` | `rgba(0,0,0,0.10)` | SelectRow L228, L275 |
| option text opacity selected / other | 0.95 / 0.7 | 0.9 / 0.6 | SelectRow L276 |
| menu shadow | `0 8px 24px rgba(0,0,0,0.4)` | `0 4px 16px rgba(0,0,0,0.08)` | SelectRow L263 |
| picker shadow | `0 8px 32px rgba(0,0,0,0.5)` | `0 4px 20px rgba(0,0,0,0.08)` | ColorPicker L248 |
| selected format tab | `#3a3a3a` | `#ffffff` | ColorPicker L129 |
| checkerboard | `#d8d8d8` / `#ffffff` | same | ColorPicker L364 |
| field handle border | `#ffffff` | same | ColorPicker L315 |
| `orb` (default colour) | `#ffffff` | `#171717` | `playgroundColor` default, Reset, Copy `themeDefault` |

**Typography.** Every size in the creator, in one place:
- 14/20: list items, Copy/Reset.
- 12: hint; picker CSS input (mono).
- 13: select label/value (lineHeight 20), Color label, Color value (mono), slider label, slider value (mono), Hue/Opacity labels.
- 11: format tabs.
- 14 / lineHeight 1.65: shimmer.

Live Color-row text is alpha-tinted (G4). Ours is solid fg.

## 14. Motion and timing summary (all creator animations)

| What | Driver | Values | Cite |
|---|---|---|---|
| Select menu open | `withSpring(1, MENU)` | stiffness 1218, damping 69.8, mass 1; opacity = shown, translateY ∓8→0, scale 0.95→1 | SelectRow L33, L184, L195–198 |
| Select menu close (web) | `withSpring(0, CLOSE_MENU)` | MENU + `energyThreshold 7e-7`; unmount on finish | L37, L97, L129, L149, L184 |
| Select menu close (native) | `withSpring(0, MENU)` | | L149, L170 |
| Chevron | `withSpring(0↔1, CHEV)` | 685 / 44.5 / 1; rotate 0→180° | L34, L199 |
| Select trigger, option bg | instant | – | L228, L275 |
| Select commit to React | `requestAnimationFrame` → `startTransition(onToggle)` | one frame after the springs start (web) | L88–92 |
| Picker entrance | `withTiming(1, 160 ms, Easing.out(Easing.ease))` | opacity 0→1, translateY 3→0, scale 0.98→1; no exit | ColorPicker L136–138, L227–230 |
| Slider fill (press, key, external) | `withSpring(target, FILL)` | 300 / 25 / 0.8 | SliderRow L10, L163, L232, L272 |
| Slider drag | direct, 1:1 | rubber band `min(18, overshoot·0.25)` | L243–253 |
| Slider rubber-band return | `withSpring(0, BACK)` | 224 / 25.4 / 1 | L11, L267 |
| Slider handle opacity | `withTiming(·, 150 ms)` | 0 / 0.1 near / 0.5 hover / 0.9 drag | L141 |
| Slider handle scaleX | `withSpring(·, HANDLE_X)` | 0.25 ↔ 1; 439 / 35.6 / 1 | L142 |
| Slider handle scaleY | `withSpring(·, HANDLE_Y)` | 1 ↔ 0.75 near; 685 / 47.1 / 1 | L143 |
| Slider hashmarks | `withTiming(·, 200 ms)` | 0 ↔ 0.35 | L144 |
| Slider JS publish | throttle | ≥ 32 ms apart | L14, L258–262 |
| Copied label | `setTimeout` | 1500 ms | playground L140–142 |
| Shimmer fade-in | `withTiming(1, 300 ms)` | on every status text change | Shimmer.web L20–24 |
| Shimmer sweep (web) | CSS | `orb-shimmer 2s linear infinite`, background-position 200% → −200% | Shimmer.web L12, L43 |
| Shimmer sweep (native) | `withRepeat(withTiming(2w, 2000 ms, linear), −1)` | | Shimmer.tsx L32–36 (withRepeat at L35) |
| State list, Color row border, swatch | instant | – | playground L262, L183 |

**Measured motion** (Motion stamp PASS, carried from 8ba6306; no motion code changed after it):
- **Select early close:** row taps and outside presses close **16–19 ms earlier** than live; every close still lands while the press is held (G1). An earlier note on 023ca9d measured the option-row tap close at −18.5 ms.
- **Select open fade** (Beta 9bef3b1): peak opacity **0.70 vs live ≈ 1.0** (G2). Samples (ms after release → opacity):
  - live: 51 → 0.12, 80 → 0.518, 114 → 0.786, 164 → 0.946;
  - ours: 45 → 0.089, 77 → 0.372, 107 → 0.554, 157 → 0.663.
- **Ruling:** the select chevron open must land within **16.7 ms** of live. Treat the chevron as passing (Motion PASS); no separate number is recorded here.
- **Held press:** nothing moves over 28 rAF frames while a select press is held, on both live and ours (023ca9d).
- At 390 (non-gating): a select row tap closes at 291 ms vs live 319.5 ms.

## 15. The orb component: compact summary (the full renderer is in `AGENT_PROMPT_ORBS.md`)

**Hand off the renderer to the other card.** `AGENT_PROMPT_ORBS.md` (same folder) has the engine, every orb file verbatim (`src/orb/OrbView.tsx`, `model.ts`, `shapes.ts`, `simulate.ts`, `draw.ts`, `clock.ts`, `src/color/color.ts`), the web entry, the Skia patch and the setup. Build or copy it first. This summary is enough to wire the creator to it on a closed network.

**Imports the creator uses** (`app/playground.tsx` L18–20):
```ts
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from "../src/color/color";
import { canUseExtendedColor, OrbView, type OrbLive } from "../src/orb/OrbView";
import { isFlat, RENDERS, type RenderName, type ShapeName } from "../src/orb/model";
```

**`OrbView` props** (`src/orb/OrbView.tsx` L63–80, verbatim):
```ts
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
```

**`OrbLive`** (L14–24): `{ size, speed, density, dotSize, tilt, r, g, b, a }`, all numbers.
- r/g/b may be outside 0–1 (extended sRGB) where `canUseExtendedColor()` is true.
- **Only `speed`, `tilt` and `r/g/b/a` are read per frame.** Size, density and dotSize come from the props (§10.2).

**Other exports:**
- `canUseExtendedColor()` (L36–40): web → true; iOS → true except Expo Go (StoreClient); Android → false.
- `OrbView` (L234–240) is `memo`. It returns `null` when the route isn't focused (`useIsFocused`), and renders a still frame (`StillOrb`) under reduced motion, read once at launch.

**Model:**
- `RENDERS` (`model.ts` L10): `dots, crosses, dashes, halftone, lines, mesh, squares, verticalLines`.
- `isFlat` (L25–29): halftone, lines, verticalLines.
- `ShapeName`: `sphere | cube | octahedron | tetrahedron | torus`.
- **Valid looks** (`state`/`variant`): the 15 rows in §5. Any other combination gives a `NaN` yaw (ORBS §5).

**Setup facts the creator depends on** (details in ORBS §3):
- `@shopify/react-native-skia` **2.6.2** (exact) + `canvaskit-wasm` **0.41.0**, plus the patch-package patch `patches/@shopify+react-native-skia+2.6.2.patch` (P3 web surface, iOS `setColor4f`).
- Web entry `index.web.tsx` awaits `LoadSkiaWeb({ locateFile: () => "/canvaskit.wasm" })` **before** requiring expo-router.
- `canvaskit.wasm`: 8,076,553 B, sha256 `eb68c7a7f602d8cb89915352c4471a2d26edfd72000f78202cb1fe32ce1f9dc4`, served at the **site root**. `expo export -p web` puts it at the `dist/` root on 9bef3b1. Copying `node_modules/canvaskit-wasm/bin/full/canvaskit.wasm` into `dist/` is a **fallback only** if it's missing.
- `react-native-reanimated` 4.5.1 / `react-native-worklets` 0.10.1; Expo SDK 57, RN 0.86.3, react-native-web 0.21.3, expo-router 57.0.24, TypeScript 6.0.3.

## 16. Known gaps (creator-scoped; reproduce 9bef3b1 as-is unless told to fix)

Every item is **non-gating**. Gates on 9bef3b1: Beta **CLEAR** at 1280×800, Design **PASS** (1280, light and dark), Motion **PASS** (carried from 8ba6306; no motion code changed after it), Platform **CLEAR**.

| # | Gap | Ours (9bef3b1) | Live | Source / build measured |
|---|---|---|---|---|
| **G1** | Select early close | Row taps and outside presses close **16–19 ms early** (CLOSE_MENU `energyThreshold 7e-7`). **Every close still lands while the press is held.** | later by 16–19 ms | Motion crew note; option-row tap −18.5 ms on 023ca9d |
| **G2** | Select open fade | peaks at opacity **0.70**; samples 45 → 0.089, 77 → 0.372, 107 → 0.554, 157 → 0.663 | peaks **≈ 1.0**; 51 → 0.12, 80 → 0.518, 114 → 0.786, 164 → 0.946 | Beta 9bef3b1 (peak); samples carried from edb73ea. Fix target if asked: opacity ≈ 0.5 by 80 ms and ≈ 0.95 by 165 ms (drive opacity faster than the transform). |
| **G3** | Color swatch position | x **1225–1245** | x **1206–1226** | Design, 9bef3b1, 1280 |
| **G4** | Color row text | "Color" label and value text **solid fg**; label and input **17 px** tall | white @ **0.7** (dark) / black @ **0.6** (light); label **20**, input **25** px tall | Design, 9bef3b1 |
| **G5** | Color input focus ring | Chrome's default outline all round the input | no outline; `box-shadow: inset 0 -1px 0` in white @ **.6** (dark) / black @ **.55** (light) | Design, 9bef3b1 (cosmetic) |
| G6 | CLS on /playground | 0.00625 | 0.0013 | Beta 9bef3b1 (both < 0.1, PASS) |
| G7 | Wide picker vertical position | opens about **53 px higher** | about 53 px lower | 023ca9d INFO, not re-measured |
| G8 | Picker Hue/Opacity rows | 262-wide `div role=slider`, small 8×16 thumb; pointer x mapped over the full row; click at 0.437 → Hue **157** / Opacity **44**; drag to 0.6133 → **220.8** / **61**; AX valuetext "" | label + native range input about **170** wide with a tall white thumb; **155** / **43**; **225** / **63**; AX valuetext "0"/"100" | 023ca9d INFO; DOM `aria-valuetext` matches |
| G9 | Select focus management | focus stays on the trigger, then drops to `body` after a row click | moves focus to the selected option on open, then back to the trigger after a row click | 023ca9d INFO |
| G10 | Slider hover visuals | Size handle at 80 % hover: x **1148** (w3 h20 op 0.5); 9 hashmarks at 0.35 on hover | x **1141**; no hashmarks on hover | 023ca9d INFO |
| G11 | 390 / native (non-gating) | `headerH` 72 vs the 80-px phone header; native state list wraps to 5 lines; 390 select row-tap close at 291 ms; native `heldHue` re-renders during drags | 6 lines; 319.5 ms | crew notes |
| G12 | Native platforms | iOS never booted; Android last checked on an earlier build | – | **unverified** |
| G13 | Copy output | web JSX for the npm package (by design, matches live's format); no RN output | same format | snippet.ts doc comment |
| G14 | Persistence | none; reload resets everything; a route change resets the theme to dark (custom colour kept) | unmeasured | theme.tsx L118–126 |
| G15 | Picker dismissal | no Escape handler; closes via swatch or backdrop. Whether a click on the stage at 1280 reaches the backdrop (zIndex 4 under the zIndex-5 row) is **unmeasured** | unmeasured | code reading |
| G16 | Fonts | Geist / Geist Mono binaries aren't inlined (site assets) | – | substitute and report |

Excluded here, owned by the site card: the header right-group offset (+5–18 px), the page title, the `#orbs` scroll from /playground, and the star count.

## 17. Parity checklist (desktop web, 1280×800, DPR 1, light and dark)

**Status key.**
- **M-live:** measured against live and matching (build named).
- **M-gap:** measured and differs; reproduce as-is (§16).
- **Code:** a value from the 9bef3b1 code with no live measurement recorded.
- **Unmeasured:** no value is known for live.

| # | Check | Expected value | Status |
|---|---|---|---|
| 1 | Route `/playground` loads; 3 non-blank canvases (header orb, stage, status); 0 console errors | 3 / 0 | M-live (Beta 9bef3b1) |
| 2 | Landmarks | `nav` "States", `aside` (panel `role=complementary`) present; unlabeled images 2, like live | M-live (Beta 9bef3b1) |
| 3 | Initial state | Working selected (index 1), Sphere, Dots, colour `#ffffff` (dark), Size 320, Speed 1.00, Density 1.00, Dot Size 1.00, Tilt 20; no Reset shown | Code (L63–77, L233) |
| 4 | Wide layout | row paddingLeft 32 / paddingRight 42; list 280 wide; panel 256 wide; stage flex 1 with orb wrapper marginRight 24; stage orb 320 at 1280×800 (maxOrb 632) | Code |
| 5 | State list | 15 items in the §5 order; 14/20; selected fg, others muted; 28-px pitch; hint "↑ ↓ to switch" 12 px, marginTop 24 | Code (pitch 28 per ruling) |
| 6 | ↑/↓ on the page | cycles the list with wrap-around; ignored inside inputs, sliders and the colour field | Code (live wraps per lock v1.5) |
| 7 | Panel rhythm | rows 36 high, gap 6 (42 pitch); Copy row marginTop 10 | Code (ruling: gap 6) |
| 8 | Select trigger | h36 r8 padH12; label and value 13/20 fg; chevron 14 px muted; open bg `rgba(255,255,255,0.18)` dark / `rgba(0,0,0,0.10)` light | Code |
| 9 | Select opens on **release**, not press-down; a held press shows no change (28 rAF frames) | open after pointerup | M-live (023ca9d) |
| 10 | Select open motion | MENU spring 1218/69.8/1; translateY −8→0; scale 0.95→1; chevron 0→180° (CHEV 685/44.5/1) within 16.7 ms of live | M-live (Motion PASS); **fade peak 0.70 vs ≈ 1.0 → M-gap G2** |
| 11 | Select menu box | top 40 below the trigger (flips above if it would overflow), padding 4, r8, border 1, options h36 r6 padH8, text 13 at 0.95/0.7 (dark) or 0.9/0.6 (light); bg `#212121` / `#fafafa`; shadows per §13 | Code |
| 12 | Select closes on: option click, trigger click, Enter, Escape, outside pointer-**down** | all close; Space and Enter open exactly once; no page scroll | M-live (Beta 9bef3b1); close timing **M-gap G1 (16–19 ms early)** |
| 13 | Opening one select closes the other and the picker | yes | Code |
| 14 | Render → Halftone, Lines or Vertical Lines | Tilt row disappears (panel 324 high); returning to a 3-D render restores Tilt = 20 | Code |
| 15 | Color row | h36 r8 bg row, paddingLeft 12 / paddingRight 8, gap 8; "Color" 13; value mono 13 right-aligned; swatch 20×20 r6 border ringSoft; 1-px `ring` border while the picker is open | Code; **swatch x 1225–1245 vs 1206–1226 (G3); text alpha and heights (G4)** M-gap |
| 16 | Color text entry | Enter applies any valid `parseColor` input (trimmed, kept verbatim); invalid input reverts; no apply on blur | Code (live parsing rules unmeasured beyond the click/arrow checks) |
| 17 | Color input focus | default browser outline | **M-gap G5** (live: inset 0 −1px box-shadow, white .6 / black .55) |
| 18 | Swatch click | toggles the picker; `aria-expanded` follows; closes selects | Code |
| 19 | Picker box | 280×350, r14, border 1 ringSoft, padding 8, gap 8; bg `#212121` / `#fafafa`; shadow `0 8px 32px rgba(0,0,0,0.5)` / `0 4px 20px rgba(0,0,0,0.08)`; left of the panel with a 12-px gap | Code (280×350 r14 per lock v1.6); **vertical position about 53 px high (G7)** |
| 20 | Picker entrance | 160 ms ease-out, opacity 0→1, translateY 3→0, scale 0.98→1; no exit animation | Code; live entrance **unmeasured** |
| 21 | Picker Tab order | 1st Tab after the swatch lands on the colour field group (tabindex 0); format tabs skipped | M-live (Beta 9bef3b1) |
| 22 | Colour field clicks | 3 reference points give **#914861 / #5e3d47 / #f3a3bb** | M-live (Beta 9bef3b1) |
| 23 | Colour field arrows | ↑/↓ lightness, ←/→ chroma, 0.01 (Shift 0.1); live f4a2bb…f8619a vs ours f4a2bb…f7629a (±1 hex rounding) | M-live (Beta 9bef3b1) |
| 24 | Format tabs | Hex / OKLCH / Display P3, h24 r6, text 11; selected `#3a3a3a` / `#ffffff`; switching rewrites the Color row text | Code |
| 25 | Hue row keys | step 0.1°, Page 36°, Home 0, End 360; valuetext "N degrees"; key sequence → → ← ↑ ↓ Shift+→ PageUp End Home ← matches live | M-live (023ca9d) |
| 26 | Opacity row keys | step 0.01 (aria 1), Page 0.1, Home 0, End 1; valuetext "N percent" | M-live (023ca9d) |
| 27 | Hue/Opacity pointer | 0.437 → Hue 157 / Opacity 44 (live 155 / 43); first paint ≤ 50 ms (ours 7.65 / 8.25 ms, live 4.25) | first paint M-live; values **M-gap G8** |
| 28 | CSS colour input | h32 r8 mono 12 padH8; Enter applies and switches the tab to the detected format; invalid input reverts | Code |
| 29 | Slider row | h36 r8 bg row; fill `colors.slider`; label 13, value mono 13, padH 12; focus outline 2 px fg, offset 2 | Code |
| 30 | Slider press | fill springs (FILL 300/25/0.8) to the snapped press point on press-down; commits on release | Code; first move ≤ 50 ms per ruling (panel sliders not separately measured) |
| 31 | Slider drag | starts after 4 px; fill 1:1; rubber band ≤ 18 px at 0.25×, returns with BACK 224/25.4/1; value text ≤ every 32 ms; orb speed/tilt update every frame | Code |
| 32 | Slider hover | handle 3×20 at op 0.5 (0.1 near the label or value, 0.9 dragging); 9 marks at op 0.35 | **M-gap G10** (handle +7 px; live has no marks) |
| 33 | Slider keys | ←/→/↑/↓ ±1 step, PageUp/PageDown ±10, Home/End min/max | Code |
| 34 | Copy | the clipboard gets the exact §12 string; defaults give `import { Orb } from "@yogesharc/thinking-orbs";\n\n<Orb state="working" size={320} />` | Code (format from the live Copy button per snippet.ts comment) |
| 35 | "Copied" duration | ≈ 1500 ms (ours 1504.3 median, live 1501.9) | M-live (023ca9d) |
| 36 | Reset | appears only off-default (colour or any slider); restores 320 / 1 / 1 / 1 / 20 and the mode's default colour; Shape and Render untouched | Code |
| 37 | Status line | 24-px mini orb + shimmer status text, gap 8, bottom edge 22 px above the window bottom, translateX −4.6, centred on the window | Code (bottom 22 and −4.6 per ruling) |
| 38 | Shimmer | 14 px; gradient muted 35 % / fg 50 % / muted 65 %, 200 % size, 2 s linear infinite; 300 ms fade on each status change; plain muted text under reduced motion | Code; live sweep speed **unmeasured** in this record |
| 39 | Light mode (header toggle) | every §13 light value; a default colour `#ffffff` swaps to `#171717`; a custom colour is kept | Code; Design PASS in light |
| 40 | CLS on /playground | < 0.1 (ours 0.00625, live 0.0013) | M-gap G6 (passes) |
| 41 | Visual parity of the orb drawing itself | see `AGENT_PROMPT_ORBS.md` §16–17 | Unmeasured frame by frame |

## 18. Build steps and forbidden actions

**Steps:**
1. Build the orb renderer from `AGENT_PROMPT_ORBS.md`: the Skia setup, web entry, wasm at the site root, and the patch.
2. Create the files in §2 from the appendices **verbatim**, at the same paths. `app/playground.tsx` is an expo-router file route, so it serves `/playground`.
3. Provide `src/theme/theme.tsx` (Appendix 12), wrapped around the app as `<ThemeProvider>`.
   - The creator also needs `GestureHandlerRootView` and `SafeAreaProvider` at the root. The site's `app/_layout.tsx` provides them; that file is site chrome and isn't inlined here. Use any root that provides these three providers.
4. `app/playground.tsx` imports `../src/components/Header` (site chrome, not inlined). If the site card isn't part of your build, supply a component with that export that renders a 48-px-tall bar at ≥768. Report that you did, and don't invent its contents.
5. Typecheck with `tsc --noEmit`, then run `npx expo start --web` or `npx expo export -p web` + `node scripts/serve-dist.js` (see ORBS §3). Check §17 at 1280×800 in dark and light.

**Forbidden:**
- Do not browse, fetch, or open any URL, including the npm import paths in the Copy output.
- Do not invent values, copy, controls, animations or behaviours that aren't in this document or the appendices. Mark unknowns **unmeasured**.
- Do not "fix" §16 gaps unless explicitly told to. Reproduce 9bef3b1.
- Do not add site chrome (header contents, hero, docs, pills, stars, MIT link, title) under this card.
- Do not change the Copy format. It deliberately emits web JSX for `@yogesharc/thinking-orbs`.
- Do not message anyone, post anywhere, or publish anything.

## Appendices: creator files, verbatim from 9bef3b1

Each file is copied byte-for-byte from the tree. Bytes and sha256 refer to the file on disk. Recreate each one at the same path. `src/color/color.ts` is also in `AGENT_PROMPT_ORBS.md` Appendix 8 and is identical.

| # | Path | Lines | Bytes | sha256 |
|---|---|---|---|---|
| 1 | `app/playground.tsx` | 365 | 15,176 | `6aa1c0cf7852b5ddc3bc96c14ea8ff4012cbe412219e23d8a240cc7ea23a4c55` |
| 2 | `src/components/SelectRow.tsx` | 293 | 11,405 | `5363abb0c342d92b07f72212895f590b010b4a2a235d87ca26b6e1db0197768b` |
| 3 | `src/components/SliderRow.tsx` | 364 | 13,482 | `7ab6bbc715a44725e511ff13e736ba26379d10ccb4f4020b9cbfa646894ad1e6` |
| 4 | `src/components/ColorPicker.tsx` | 391 | 16,433 | `1ddf357dfbb97e8fce0ac0f65b80a99942b0c3aacd94e75a7db0d0f6b1d443f2` |
| 5 | `src/components/Shimmer.web.tsx` | 50 | 1,933 | `6657dabcca99a4d4ff09e6eaca45e377be7227fe7ccd2af51e443db13e8e95f2` |
| 6 | `src/components/Shimmer.tsx` | 69 | 2,466 | `b93d930a3f63e19c168b1a6620b6e9bcecc69c1d2fc06d09bc6130e3018f9cf2` |
| 7 | `src/components/icons.tsx` | 29 | 2,065 | `8327e16c1a3fd9562114844677763af53a07937f84f1e81a60b56ea1df833123` |
| 8 | `src/hooks/useArrowKeys.web.ts` | 23 | 925 | `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf` |
| 9 | `src/hooks/useArrowKeys.ts` | 2 | 186 | `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258` |
| 10 | `src/content/cards.ts` | 180 | 5,117 | `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d` |
| 11 | `src/content/snippet.ts` | 51 | 1,830 | `cd99059783d7aed96684cdec6994fa6230f109f8857ad53d3f34c36893938879` |
| 12 | `src/theme/theme.tsx` | 157 | 3,870 | `3b055d9194a3c09b6887f82d8cd473417b3849d2b033c9611adf2bd93530c8d0` |
| 13 | `src/color/color.ts` | 233 | 9,459 | `0994d34b4b4a6f4dab879febf1f2026b5900d3bd0558267235b59cb26741a1ac` |

### Appendix 1: `app/playground.tsx` (365 lines, 15,176 bytes, sha256 `6aa1c0cf7852b5ddc3bc96c14ea8ff4012cbe412219e23d8a240cc7ea23a4c55`)

````tsx
import { setStringAsync } from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";

import { ColorPicker } from "../src/components/ColorPicker";
import { Header } from "../src/components/Header";
import { SelectRow } from "../src/components/SelectRow";
import { Shimmer } from "../src/components/Shimmer";
import { SliderRow } from "../src/components/SliderRow";
import { PLAYGROUND } from "../src/content/cards";
import { orbSnippet } from "../src/content/snippet";
import { useArrowKeys } from "../src/hooks/useArrowKeys";
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from "../src/color/color";
import { canUseExtendedColor, OrbView, type OrbLive } from "../src/orb/OrbView";
import { isFlat, RENDERS, type RenderName, type ShapeName } from "../src/orb/model";
import { fonts, useTheme } from "../src/theme/theme";

function bindTitle(title: string) {
  return (node: object | null) => {
    if (!node || !("setAttribute" in node)) return;
    const set = node.setAttribute;
    if (typeof set !== "function") return;
    set.call(node, "title", title);
  };
}

function swatchHexFrom(color: Oklch, fallback: string): string {
  if (!color) return fallback;
  const { r, g, b } = toSrgb(color);
  const byte = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

const SHAPES: { id: ShapeName; label: string }[] = [
  { id: "sphere", label: "Sphere" },
  { id: "cube", label: "Cube" },
  { id: "octahedron", label: "Octahedron" },
  { id: "tetrahedron", label: "Tetrahedron" },
  { id: "torus", label: "Torus" },
];

const RENDER_LABEL: Record<RenderName, string> = {
  dots: "Dots",
  crosses: "Crosses",
  dashes: "Dashes",
  halftone: "Halftone",
  lines: "Lines",
  mesh: "Mesh",
  squares: "Squares",
  verticalLines: "Vertical Lines",
};

export default function PlaygroundScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1280;
  const { colors, playgroundColor, setPlaygroundColor } = useTheme();
  const [index, setIndex] = useState(1);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];
  const [shape, setShape] = useState<ShapeName>("sphere");
  const [render, setRender] = useState<RenderName>("dots");
  const [size, setSize] = useState(320);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(1);
  const [dotSize, setDotSize] = useState(1);
  const [tilt, setTilt] = useState(20);
  const [menu, setMenu] = useState<null | "shape" | "render">(null);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(playgroundColor);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const wasFlat = useRef(false);
  const exact = useRef<{ color: Oklch; text: string } | null>(null);
  const flat = isFlat(render);
  const phone = width < 768;
  const headerH = width >= 768 ? 48 : 72;
  const maxOrb = Math.max(96, height - headerH - 120);
  const shown = Math.min(size, wide ? maxOrb : Math.min(maxOrb, Math.max(96, width - 32)));
  const parsed: Oklch = (exact.current && exact.current.text === playgroundColor ? exact.current.color : null) ?? parseColor(playgroundColor) ?? { l: 1, c: 0, h: 0, a: 1 };
  const rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed);
  const remember = (color: Oklch, text: string) => {
    exact.current = { color, text };
    setPlaygroundColor(text);
  };
  const live = useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba });
  const sliding = useRef(false);

  useEffect(() => {
    setDraft(playgroundColor);
  }, [playgroundColor]);

  useEffect(() => () => {
    alive.current = false;
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useFocusEffect(useCallback(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []));

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

  const close = () => {
    setMenu(null);
    setPicker(false);
  };

  const panel = (
    <View role={Platform.OS === "web" ? "complementary" : undefined} style={{ width: wide ? 256 : "100%", gap: 6, zIndex: 5 }}>
      <SelectRow
        label="Shape"
        value={shape}
        display={SHAPES.find((item) => item.id === shape)?.label ?? "Sphere"}
        options={SHAPES}
        open={menu === "shape"}
        onToggle={() => {
          setPicker(false);
          setMenu(menu === "shape" ? null : "shape");
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
        open={menu === "render"}
        onToggle={() => {
          setPicker(false);
          setMenu(menu === "render" ? null : "render");
        }}
        onPick={(id) => {
          setRender(id);
          setMenu(null);
        }}
      />
      <View style={{ height: 36, borderRadius: 8, backgroundColor: colors.row, borderWidth: picker ? 1 : 0, borderColor: colors.ring, paddingLeft: 12, paddingRight: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Color</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => {
            const next = parseColor(draft);
            if (next) {
              exact.current = null;
              setPlaygroundColor(draft.trim());
            } else setDraft(playgroundColor);
          }}
          accessibilityLabel="Color color value"
          ref={bindTitle(draft)}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, color: colors.fg, fontFamily: fonts.mono, fontSize: 13, textAlign: "right", paddingVertical: 0 }}
        />
        <Pressable
          onPress={() => {
            setMenu(null);
            setPicker((v) => !v);
          }}
          accessibilityRole={Platform.OS === "web" ? "button" : undefined}
          accessibilityLabel="Pick color color"
          aria-haspopup={Platform.OS === "web" ? "dialog" : undefined}
          aria-expanded={Platform.OS === "web" ? picker : undefined}
          style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: swatchHexFrom(parsed, colors.fg), borderWidth: 1, borderColor: colors.ringSoft }}
        />
      </View>
      {picker && wide ? (
        <View style={{ position: "absolute", right: "100%", top: 0, marginRight: 12, zIndex: 40 }}>
          <ColorPicker wide color={parsed} onChange={remember} />
        </View>
      ) : null}
      {picker && phone ? (
        <View style={{ position: "absolute", left: 0, top: 40, width: 280, zIndex: 30 }}>
          <ColorPicker wide={false} color={parsed} onChange={remember} />
        </View>
      ) : null}
      {picker && !wide && !phone ? <ColorPicker wide={false} color={parsed} onChange={remember} /> : null}
      <SliderRow label="Size" min={16} max={480} step={1} value={size} decimals={0} onChange={setSize} live={live} field="size" onDrag={(active) => { sliding.current = active; }} />
      <SliderRow label="Speed" min={0.05} max={3} step={0.05} value={speed} decimals={2} onChange={setSpeed} live={live} field="speed" onDrag={(active) => { sliding.current = active; }} />
      <SliderRow label="Density" min={0.25} max={3} step={0.05} value={density} decimals={2} onChange={setDensity} live={live} field="density" onDrag={(active) => { sliding.current = active; }} />
      <SliderRow label="Dot Size" min={0.25} max={3} step={0.05} value={dotSize} decimals={2} onChange={setDotSize} live={live} field="dotSize" onDrag={(active) => { sliding.current = active; }} />
      {flat ? null : <SliderRow label="Tilt" min={-90} max={90} step={1} value={tilt} decimals={0} onChange={setTilt} live={live} field="tilt" onDrag={(active) => { sliding.current = active; }} />}
      <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable onPress={copy} hitSlop={8} accessibilityRole={Platform.OS === "web" ? "button" : undefined}>
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>{copied ? "Copied" : "Copy"}</Text>
        </Pressable>
        {playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase() || size !== 320 || speed !== 1 || density !== 1 || dotSize !== 1 || tilt !== 20 ? (
          <Pressable
            onPress={() => {
              setSize(320);
              setSpeed(1);
              setDensity(1);
              setDotSize(1);
              setTilt(20);
              exact.current = null;
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
    <View role="navigation" accessibilityLabel="States" style={{ width: wide ? 280 : "100%", justifyContent: "center" }}>
      <View role={Platform.OS === "web" ? "list" : undefined} style={{ flexDirection: wide ? "column" : "row", flexWrap: wide ? "nowrap" : "wrap", columnGap: 16, rowGap: 8 }}>
        {PLAYGROUND.map((item, i) => {
          const on = i === index;
          return Platform.OS === "web" ? (
            <View key={item.id} role="listitem">
              <Pressable accessibilityRole="button" aria-current={on ? "true" : undefined} onPress={() => setIndex(i)} hitSlop={{ top: 12, bottom: 12 }} style={{ height: 20, justifyContent: "center" }}>
                <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>{item.playground}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable key={item.id} accessibilityRole="button" aria-current={on ? "true" : undefined} onPress={() => setIndex(i)} hitSlop={{ top: 12, bottom: 12 }} style={{ height: 20, justifyContent: "center" }}>
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>{item.playground}</Text>
            </Pressable>
          );
        })}
      </View>
      {wide ? <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 24, marginBottom: -8 }}>↑ ↓ to switch</Text> : null}
    </View>
  );

  const stage = (
    <View
      accessibilityLabel={Platform.OS === "web" ? undefined : "Orb playground"}
      accessibilityElementsHidden={Platform.OS === "web" ? true : undefined}
      importantForAccessibility={Platform.OS === "web" ? "no-hide-descendants" : undefined}
      aria-hidden={Platform.OS === "web" ? true : undefined}
      style={{ flex: wide ? 1 : undefined, minHeight: phone ? height * 0.6 : wide ? 0 : shown, padding: phone ? 32 : 0, alignItems: "center", justifyContent: "center", marginTop: phone ? 24 : 0 }}
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
      pointerEvents="none"
      style={
        wide
          ? { position: "absolute", left: 0, right: 0, bottom: 22 + insets.bottom, zIndex: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, transform: [{ translateX: -4.6 }] }
          : { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "center" }
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
      <Shimmer text={look.status} style={phone ? { lineHeight: 20 } : undefined} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      {Platform.OS === "web" ? (
        <Head>
          <title>Playground - Thinking Orbs</title>
        </Head>
      ) : null}
      {(menu || picker) && (
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") setMenu(null);
            setPicker(false);
          }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 }}
        />
      )}
      <Header active={null} />
      {wide ? (
        <View style={{ flex: 1, flexDirection: "row", alignItems: "stretch", paddingLeft: 32, paddingRight: 42, zIndex: 5 }}>
          <View style={{ alignSelf: "center", marginBottom: 8 }}>{list}</View>
          {stage}
          <View style={{ alignSelf: "center" }}>{panel}</View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, paddingTop: width < 768 ? 24 : 0, paddingBottom: (width < 768 ? 24 : 32) + insets.bottom }} style={{ zIndex: 5 }}>
          {list}
          <View>
            {stage}
            {phone ? <View style={{ position: "absolute", left: 0, right: 0, bottom: 24 }}>{status}</View> : null}
          </View>
          {phone ? null : status}
          <View style={{ marginTop: phone ? 24 : 20 }}>{panel}</View>
        </ScrollView>
      )}
      {wide ? status : null}
    </View>
  );
}
````

### Appendix 2: `src/components/SelectRow.tsx` (293 lines, 11,405 bytes, sha256 `5363abb0c342d92b07f72212895f590b010b4a2a235d87ca26b6e1db0197768b`)

````tsx
import { createElement, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { fonts, useTheme } from "../theme/theme";
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
  }
}

function keyName(event: WebKeyEvent): string {
  return event.key ?? event.nativeEvent?.key ?? "";
}

const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
/** Web close only (dismissWeb, driveWebSprings close, onEnd web close). Same stiffness, damping, and mass as MENU; energyThreshold is the only difference. Native close stays on MENU. */
const CLOSE_MENU = { stiffness: MENU.stiffness, damping: MENU.damping, mass: MENU.mass, energyThreshold: 7e-7 };

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
  const [above, setAbove] = useState(false);
  const [present, setPresent] = useState(open);
  const aboveSV = useSharedValue(0);
  const shown = useSharedValue(open ? 1 : 0);
  const chevron = useSharedValue(open ? 1 : 0);
  const openSV = useSharedValue(open ? 1 : 0);
  const goal = useSharedValue(open ? 1 : 0);
  const armed = useRef(false);
  const sawOpen = useRef(false);
  const revealRef = useRef(() => setPresent(true));
  const hideRef = useRef(() => setPresent(false));
  const commitRef = useRef(() => {
    armed.current = true;
    startTransition(() => {
      onToggle();
    });
  });
  revealRef.current = () => setPresent(true);
  hideRef.current = () => setPresent(false);
  commitRef.current = () => {
    armed.current = true;
    startTransition(() => {
      onToggle();
    });
  };
  const revealJS = useCallback(() => revealRef.current(), []);
  const hideJS = useCallback(() => hideRef.current(), []);
  const commitJS = useCallback(() => commitRef.current(), []);
  const web = Platform.OS === "web";
  const commitNextFrame = useCallback(() => {
    requestAnimationFrame(() => {
      commitRef.current();
    });
  }, []);
  const dismissWeb = useCallback(() => {
    if (openSV.value !== 1) return;
    openSV.value = 0;
    goal.value = 0;
    shown.value = withSpring(0, CLOSE_MENU, (finished) => {
      if (finished && goal.value === 0) runOnJS(hideJS)();
    });
    chevron.value = withSpring(0, CHEV);
    commitNextFrame();
  }, [chevron, commitNextFrame, goal, hideJS, openSV, shown]);
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
  const driveWebSprings = useCallback((next: number) => {
    openSV.value = next;
    goal.value = next;
    if (next === 1) revealRef.current();
    shown.value = withSpring(next, next === 1 ? MENU : CLOSE_MENU, (finished) => {
      if (finished && goal.value === 0) hideJS();
    });
    chevron.value = withSpring(next, CHEV);
  }, [chevron, goal, hideJS, openSV, shown]);
  useLayoutEffect(() => {
    openSV.value = open ? 1 : 0;
  }, [open, openSV]);
  useLayoutEffect(() => {
    if (!sawOpen.current) {
      sawOpen.current = true;
      return;
    }
    if (armed.current) {
      armed.current = false;
      if (open) setPresent(true);
      return;
    }
    if (open) setPresent(true);
    goal.value = open ? 1 : 0;
    shown.value = withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU, (finished) => {
      if (finished && goal.value === 0) runOnJS(hideJS)();
    });
    chevron.value = withSpring(open ? 1 : 0, CHEV);
  }, [open, chevron, goal, hideJS, shown]);
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
  const tap = useMemo(() => {
    const spring = (next: number) => {
      "worklet";
      goal.value = next;
      if (next === 1) runOnJS(revealJS)();
      shown.value = withSpring(next, MENU, (finished) => {
        if (finished && goal.value === 0) runOnJS(hideJS)();
      });
      chevron.value = withSpring(next, CHEV);
    };
    return Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onEnd(() => {
        const next = openSV.value === 1 ? 0 : 1;
        if (web) {
          openSV.value = next;
          goal.value = next;
          if (next === 1) runOnJS(revealJS)();
          shown.value = withSpring(next, next === 1 ? MENU : CLOSE_MENU, (finished) => {
            if (finished && goal.value === 0) runOnJS(hideJS)();
          });
          chevron.value = withSpring(next, CHEV);
          runOnJS(commitNextFrame)();
          return;
        }
        spring(next);
        runOnJS(commitJS)();
      });
  }, [chevron, commitJS, commitNextFrame, goal, hideJS, openSV, revealJS, shown, web]);
  const menuStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * (aboveSV.value ? 8 : -8) }, { scale: 0.95 + shown.value * 0.05 }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value * 180}deg` }] }));
  const onKeyDownCapture = (event: WebKeyEvent) => {
    if (keyName(event) !== "Enter") return;
    event.stopPropagation();
    event.nativeEvent?.stopPropagation?.();
    if (event.repeat || event.nativeEvent?.repeat) return;
    driveWebSprings(openSV.value === 1 ? 0 : 1);
    commitNextFrame();
  };
  const onKeyDown = (event: WebKeyEvent) => {
    const key = keyName(event);
    if (key !== " " && key !== "Spacebar") return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
  };
  return (
    <View ref={rowRef} onLayout={place} style={{ zIndex: open ? 20 : 1 }}>
      <GestureDetector gesture={tap} touchAction="pan-y">
        <View
          accessible
          accessibilityRole="button"
          aria-haspopup={web ? "listbox" : undefined}
          aria-expanded={web ? open : undefined}
          collapsable={false}
          onKeyDown={Platform.OS === "web" ? onKeyDown : undefined}
          onKeyDownCapture={Platform.OS === "web" ? onKeyDownCapture : undefined}
          style={{
            height: 36,
            borderRadius: 8,
            backgroundColor: open ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : colors.row,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>{label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>{display}</Text>
            <Animated.View style={chevronStyle}>
              <Chevron color={colors.muted} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
      {present ? (
        <Animated.View
          pointerEvents={open ? "auto" : "none"}
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
              borderColor: mode === "light" ? "rgba(0,0,0,0.10)" : colors.ringSoft,
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
                { role: "listbox", "aria-label": label },
                options.map((option) => {
                  const on = option.id === value;
                  return (
                    <Pressable key={option.id} role="option" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={{ height: 36, borderRadius: 6, paddingHorizontal: 8, justifyContent: "center", backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }}>
                      <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                    </Pressable>
                  );
                }),
              )
            : options.map((option) => {
                const on = option.id === value;
                return (
                  <Pressable key={option.id} accessibilityRole="menuitem" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={{ height: 36, borderRadius: 6, paddingHorizontal: 8, justifyContent: "center", backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }}>
                    <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                  </Pressable>
                );
              })}
        </Animated.View>
      ) : null}
    </View>
  );
}
````

### Appendix 3: `src/components/SliderRow.tsx` (364 lines, 13,482 bytes, sha256 `7ab6bbc715a44725e511ff13e736ba26379d10ccb4f4020b9cbfa646894ad1e6`)

````tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

import type { OrbLive } from "../orb/OrbView";
import { fonts, useTheme } from "../theme/theme";

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
  const { colors } = useTheme();
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

  const move = (steps: number) => {
    const next = snap(value + steps * step, min, max, step);
    onChange(next);
  };

  useEffect(() => {
    if (!focused || Platform.OS !== "web") return;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      let steps: number | null = null;
      if (key === "ArrowRight" || key === "ArrowUp") steps = 1;
      else if (key === "ArrowLeft" || key === "ArrowDown") steps = -1;
      else if (key === "PageUp") steps = 10;
      else if (key === "PageDown") steps = -10;
      else if (key === "Home") steps = 0;
      else if (key === "End") steps = 0;
      else return;
      event.preventDefault();
      event.stopPropagation();
      if (key === "Home") onChange(min);
      else if (key === "End") onChange(max);
      else if (steps !== null) move(steps);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, value, min, max, step, onChange]);

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
            outlineStyle: focused ? "solid" : undefined,
            outlineWidth: focused ? 2 : 0,
            outlineColor: colors.fg,
            outlineOffset: 2,
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 }} pointerEvents="none">
          <Text onLayout={(e) => { labelW.value = e.nativeEvent.layout.width; }} style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>{label}</Text>
          <Text onLayout={(e) => { valueW.value = e.nativeEvent.layout.width; }} style={{ color: colors.fg, fontFamily: fonts.mono, fontSize: 13 }}>{labelText}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
````

### Appendix 4: `src/components/ColorPicker.tsx` (391 lines, 16,433 bytes, sha256 `1ddf357dfbb97e8fce0ac0f65b80a99942b0c3aacd94e75a7db0d0f6b1d443f2`)

````tsx
import { LinearGradient } from "expo-linear-gradient";
import { createElement, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

import { detectFormat, formatColor, maxChroma, oklchToRgb, parseColor, toSrgb, type ColorFormat, type Oklch } from "../color/color";
import { fonts, useTheme } from "../theme/theme";

declare module "react-native" {
  interface ViewProps {
    dataSet?: { arrowKeys?: string };
  }
}

const TABS: { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "oklch", label: "OKLCH" },
  { id: "p3", label: "Display P3" },
];

function hsvToOklch(h: number, s: number, v: number, a: number): Oklch {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const parsed = parseColor(`rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`);
  return { ...(parsed ?? { l: v, c: 0, h, a: 1 }), a };
}

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

type FieldSpace = "srgb" | "p3";

type FieldCanvas = {
  width: number;
  height: number;
  getContext: (kind: "2d", opts?: { colorSpace?: string }) => FieldContext | null;
};

type FieldContext = {
  createImageData: (w: number, h: number) => { data: Uint8ClampedArray };
  putImageData: (data: { data: Uint8ClampedArray }, x: number, y: number) => void;
};

function isFieldCanvas(node: object): node is FieldCanvas {
  return "getContext" in node && "width" in node && "height" in node;
}

function fieldSpace(format: ColorFormat): FieldSpace {
  return format === "p3" ? "p3" : "srgb";
}

function chromaRatio(color: Oklch, space: FieldSpace) {
  const cap = maxChroma(color.l, color.h, space);
  if (cap <= 0) return 0;
  return Math.min(1, Math.max(0, color.c / cap));
}

// Live paints the plane in OKLCH: x is chroma / max in-gamut chroma, y is lightness from 1 to 0.
function paintField(node: object | null, hue: number, space: FieldSpace) {
  if (!node || !isFieldCanvas(node)) return;
  const ctx = node.getContext("2d", { colorSpace: space === "p3" ? "display-p3" : "srgb" });
  if (!ctx) return;
  const w = node.width;
  const h = node.height;
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const l = h <= 1 ? 1 : 1 - y / (h - 1);
    const cap = maxChroma(l, hue, space);
    for (let x = 0; x < w; x++) {
      const c = (w <= 1 ? 0 : x / (w - 1)) * cap;
      const rgb = oklchToRgb({ l, c, h: hue, a: 1 }, space);
      const i = (y * w + x) * 4;
      image.data[i] = Math.round(255 * Math.min(1, Math.max(0, rgb[0])));
      image.data[i + 1] = Math.round(255 * Math.min(1, Math.max(0, rgb[1])));
      image.data[i + 2] = Math.round(255 * Math.min(1, Math.max(0, rgb[2])));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function pureHue(h: number) {
  const { r, g, b } = toSrgb(hsvToOklch(h, 1, 1, 1));
  const byte = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

export function ColorPicker({
  color,
  onChange,
  wide,
}: {
  color: Oklch;
  onChange: (color: Oklch, text: string) => void;
  wide: boolean;
}) {
  const { colors, mode } = useTheme();
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [draft, setDraft] = useState(formatColor(color, "hex"));
  const progress = useSharedValue(0);
  const [heldHue, setHeldHue] = useState(0);
  const hsv = rgbToHsv(toSrgb(color).r, toSrgb(color).g, toSrgb(color).b);
  const hue = hsv.s > 0.01 ? hsv.h : heldHue;
  const [box, setBox] = useState({ w: 1, h: 1 });
  const [hueW, setHueW] = useState(1);
  const [opW, setOpW] = useState(1);
  const tabOn = mode === "dark" ? "#3a3a3a" : "#ffffff";
  const space = fieldSpace(format);
  const fieldCanvas = useRef<FieldCanvas | null>(null);
  useEffect(() => {
    paintField(fieldCanvas.current, color.h, space);
  }, [color.h, space]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) });
  }, [progress]);
  useEffect(() => {
    setDraft(formatColor(color, format));
  }, [color, format]);
  useEffect(() => {
    if (hsv.s > 0.01) setHeldHue(hsv.h);
  }, [hsv.h, hsv.s]);

  const apply = (next: Oklch, nextFormat = format) => {
    const text = formatColor(next, nextFormat);
    setDraft(text);
    onChange(next, text);
  };

  const fromSquare = (x: number, y: number) => {
    if (Platform.OS === "web") {
      const space = fieldSpace(format);
      const l = Math.min(1, Math.max(0, 1 - y / box.h));
      const ratio = Math.min(1, Math.max(0, x / box.w));
      apply({ l, c: ratio * maxChroma(l, color.h, space), h: color.h, a: color.a });
      return;
    }
    const nx = Math.min(1, Math.max(0, x / box.w));
    const ny = Math.min(1, Math.max(0, y / box.h));
    apply(hsvToOklch(hue, nx, 1 - ny, color.a));
  };
  const onFieldKey = (event: { key?: string; shiftKey?: boolean; preventDefault: () => void; stopPropagation?: () => void; nativeEvent?: { key?: string; shiftKey?: boolean; preventDefault?: () => void; stopPropagation?: () => void } }) => {
    if (Platform.OS !== "web") return;
    const key = event.key ?? event.nativeEvent?.key ?? "";
    const shift = event.shiftKey ?? event.nativeEvent?.shiftKey ?? false;
    const step = shift ? 0.1 : 0.01;
    const space = fieldSpace(format);
    let l = color.l;
    let ratio = chromaRatio(color, space);
    if (key === "ArrowUp") l += step;
    else if (key === "ArrowDown") l -= step;
    else if (key === "ArrowRight") ratio += step;
    else if (key === "ArrowLeft") ratio -= step;
    else return;
    event.preventDefault();
    event.stopPropagation?.();
    event.nativeEvent?.preventDefault?.();
    event.nativeEvent?.stopPropagation?.();
    l = Math.min(1, Math.max(0, l));
    ratio = Math.min(1, Math.max(0, ratio));
    apply({ l, c: ratio * maxChroma(l, color.h, space), h: color.h, a: color.a });
  };
  const fromHue = (x: number) => {
    const h = Math.min(360, Math.max(0, (x / hueW) * 360));
    setHeldHue(h);
    apply(hsvToOklch(h, hsv.s, hsv.v, color.a));
  };
  const fromOp = (x: number) => apply({ ...color, a: Math.min(1, Math.max(0, x / opW)) });
  const onSliderKey = (which: "hue" | "opacity") => (event: { key?: string; preventDefault: () => void; nativeEvent?: { key?: string; preventDefault?: () => void } }) => {
    if (Platform.OS !== "web") return;
    const key = event.key ?? event.nativeEvent?.key ?? "";
    const span = which === "hue" ? 360 : 1;
    const step = which === "hue" ? 0.1 : 0.01;
    const page = Math.max(span / 10, step);
    const current = which === "hue" ? hue : color.a;
    let next = current;
    if (key === "ArrowRight" || key === "ArrowUp") next = current + step;
    else if (key === "ArrowLeft" || key === "ArrowDown") next = current - step;
    else if (key === "PageUp") next = current + page;
    else if (key === "PageDown") next = current - page;
    else if (key === "Home") next = 0;
    else if (key === "End") next = span;
    else return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
    next = Math.min(span, Math.max(0, next));
    if (which === "hue") {
      setHeldHue(next);
      apply(hsvToOklch(next, hsv.s, hsv.v, color.a));
      return;
    }
    apply({ ...color, a: next });
  };

  const square = Gesture.Pan()
    .onBegin((e) => runOnJS(fromSquare)(e.x, e.y))
    .onUpdate((e) => runOnJS(fromSquare)(e.x, e.y));
  const hueGesture = Gesture.Pan()
    .onBegin((e) => runOnJS(fromHue)(e.x))
    .onUpdate((e) => runOnJS(fromHue)(e.x));
  const opGesture = Gesture.Pan()
    .onBegin((e) => runOnJS(fromOp)(e.x))
    .onUpdate((e) => runOnJS(fromOp)(e.x));

  const pop = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 3 }, { scale: 0.98 + progress.value * 0.02 }],
  }));

  const swatch = formatColor(color, "hex");

  return (
    <Animated.View
      role="dialog"
      accessibilityLabel="Color color picker"
      style={[
        {
          width: wide ? 280 : "100%",
          height: 350,
          backgroundColor: mode === "light" ? "#fafafa" : colors.pop,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.ringSoft,
          padding: 8,
          gap: 8,
          boxShadow: mode === "light" ? "0 4px 20px rgba(0,0,0,0.08)" : "0 8px 32px rgba(0,0,0,0.5)",
        },
        pop,
      ]}
    >
      <View accessibilityRole="radiogroup" accessibilityLabel="Color format" style={{ flexDirection: "row", backgroundColor: colors.row, borderRadius: 8, padding: 2 }}>
        {TABS.map((tab) => {
          const on = tab.id === format;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              aria-checked={on}
              focusable={Platform.OS === "web" ? false : undefined}
              tabIndex={Platform.OS === "web" ? -1 : undefined}
              onPress={() => {
                const text = formatColor(color, tab.id);
                setFormat(tab.id);
                setDraft(text);
                onChange(color, text);
              }}
              style={{ flex: 1, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: on ? tabOn : "transparent" }}
            >
              <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 11 }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <GestureDetector gesture={square}>
        <View
          role="group"
          accessibilityLabel="Color field; use arrow keys to adjust saturation and lightness"
          dataSet={Platform.OS === "web" ? { arrowKeys: "own" } : undefined}
          focusable={Platform.OS === "web" ? true : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          onKeyDown={Platform.OS === "web" ? onFieldKey : undefined}
          onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          style={{ flex: 1, borderRadius: 8, overflow: "hidden" }}
        >
          {Platform.OS === "web" ? (
            createElement("canvas", {
              key: space,
              width: 252,
              height: 160,
              "aria-hidden": true,
              style: { width: "100%", height: "100%", display: "block", pointerEvents: "none" },
              ref: fieldCanvas,
            })
          ) : (
            <>
              <LinearGradient colors={[ "#ffffff", pureHue(hue) ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              <LinearGradient colors={[ "rgba(0,0,0,0)", "#000000" ]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
            </>
          )}
          <View
            style={{
              position: "absolute",
              ...(Platform.OS === "web"
                ? { left: `${chromaRatio(color, fieldSpace(format)) * 100}%`, top: `${(1 - color.l) * 100}%` }
                : { left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }),
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: "#ffffff",
              backgroundColor: swatch,
              shadowColor: "#000000",
              shadowOpacity: 0.45,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 3,
            }}
          />
        </View>
      </GestureDetector>
      <GestureDetector gesture={hueGesture}>
        <View
          accessibilityRole={Platform.OS === "web" ? "adjustable" : undefined}
          accessibilityLabel="Hue"
          accessibilityValue={Platform.OS === "web" ? { min: 0, max: 360, now: Math.round(hue * 10) / 10 } : undefined}
          aria-valuemin={Platform.OS === "web" ? 0 : undefined}
          aria-valuemax={Platform.OS === "web" ? 360 : undefined}
          aria-valuenow={Platform.OS === "web" ? Math.round(hue * 10) / 10 : undefined}
          aria-valuetext={Platform.OS === "web" ? `${Math.round(hue)} degrees` : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          onKeyDown={Platform.OS === "web" ? onSliderKey("hue") : undefined}
          onLayout={(e) => setHueW(Math.max(1, e.nativeEvent.layout.width))}
          style={{ height: 36, borderRadius: 8, backgroundColor: colors.row, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10 }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Hue</Text>
          <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.slider, justifyContent: "center" }}>
            <View style={{ position: "absolute", left: `${(hue / 360) * 100}%`, width: 8, height: 16, marginLeft: -4, borderRadius: 1, backgroundColor: colors.fg }} />
          </View>
        </View>
      </GestureDetector>
      <GestureDetector gesture={opGesture}>
        <View
          accessibilityRole={Platform.OS === "web" ? "adjustable" : undefined}
          accessibilityLabel="Opacity"
          accessibilityValue={Platform.OS === "web" ? { min: 0, max: 100, now: Math.round(color.a * 100) } : undefined}
          aria-valuemin={Platform.OS === "web" ? 0 : undefined}
          aria-valuemax={Platform.OS === "web" ? 100 : undefined}
          aria-valuenow={Platform.OS === "web" ? Math.round(color.a * 100) : undefined}
          aria-valuetext={Platform.OS === "web" ? `${Math.round(color.a * 100)} percent` : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          onKeyDown={Platform.OS === "web" ? onSliderKey("opacity") : undefined}
          onLayout={(e) => setOpW(Math.max(1, e.nativeEvent.layout.width))}
          style={{ height: 36, borderRadius: 8, backgroundColor: colors.row, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10 }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Opacity</Text>
          <View style={{ flex: 1, height: 10, borderRadius: 4, overflow: "hidden", justifyContent: "center" }}>
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, flexDirection: "row" }}>
              {Array.from({ length: 16 }, (_, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: i % 2 === 0 ? "#d8d8d8" : "#ffffff" }} />
              ))}
            </View>
            <View style={{ position: "absolute", left: `${color.a * 100}%`, width: 8, height: 16, marginLeft: -4, borderRadius: 1, backgroundColor: colors.fg }} />
          </View>
        </View>
      </GestureDetector>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => {
          const parsed = parseColor(draft);
          if (!parsed) {
            setDraft(formatColor(color, format));
            return;
          }
          const detected = detectFormat(draft);
          setFormat(detected);
          apply(parsed, detected);
        }}
        accessibilityLabel="CSS color"
        autoCapitalize="none"
        autoCorrect={false}
        style={{ height: 32, borderRadius: 8, backgroundColor: colors.row, color: colors.fg, fontFamily: fonts.mono, fontSize: 12, paddingHorizontal: 8 }}
      />
    </Animated.View>
  );
}
````

### Appendix 5: `src/components/Shimmer.web.tsx` (50 lines, 1,933 bytes, sha256 `6657dabcca99a4d4ff09e6eaca45e377be7227fe7ccd2af51e443db13e8e95f2`)

````tsx
import { useEffect } from "react";
import { Platform, type TextStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useTheme, fonts } from "../theme/theme";

let injected = false;
function injectKeyframes() {
  if (injected || Platform.OS !== "web" || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`;
  document.head.appendChild(style);
}

export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  useEffect(() => {
    injectKeyframes();
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [text, opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sweep = !reduced;
  return (
    <Animated.View style={anim}>
      <span
        style={{
          fontFamily: typeof style?.fontFamily === "string" ? style.fontFamily : fonts.regular,
          fontSize: typeof style?.fontSize === "number" ? style.fontSize : 14,
          fontStyle: style?.fontStyle,
          lineHeight: typeof style?.lineHeight === "number" ? `${style.lineHeight}px` : "1.65",
          display: "inline-block",
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
    </Animated.View>
  );
}
````

### Appendix 6: `src/components/Shimmer.tsx` (69 lines, 2,466 bytes, sha256 `b93d930a3f63e19c168b1a6620b6e9bcecc69c1d2fc06d09bc6130e3018f9cf2`)

````tsx
import { Canvas, LinearGradient, Mask, Rect, Text, useFont, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Text as RNText, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
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
  const font = useFont(require("../../assets/fonts/Geist-Regular.ttf"), size);
  const opacity = useSharedValue(0);
  const shift = useSharedValue(0);
  const width = font ? Math.max(1, Math.ceil(font.getTextWidth(text))) : Math.max(1, Math.ceil(text.length * size * 0.56));
  const height = Math.ceil(size * 1.45);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [text, opacity]);

  useEffect(() => {
    if (reduced) return;
    shift.value = -width * 2;
    shift.value = withRepeat(withTiming(width * 2, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [reduced, shift, text, width]);

  const start = useDerivedValue(() => vec(shift.value, 0));
  const end = useDerivedValue(() => vec(shift.value + width * 2, 0));
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (reduced || !font) {
    return (
      <Animated.View style={fade}>
        <RNText style={[{ color: colors.muted, fontFamily: style?.fontFamily ?? fonts.regular, fontSize: size, fontStyle: style?.fontStyle }, style]}>
          {text}
        </RNText>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={fade}>
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
````

### Appendix 7: `src/components/icons.tsx` (29 lines, 2,065 bytes, sha256 `8327e16c1a3fd9562114844677763af53a07937f84f1e81a60b56ea1df833123`)

````tsx
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

export function Chevron({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M4 6.5 L8 10.5 L12 6.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
````

### Appendix 8: `src/hooks/useArrowKeys.web.ts` (23 lines, 925 bytes, sha256 `c094b70ccf222be52b1de76509c83bd003f4aa198c171617f8ff9c6e011e87cf`)

````ts
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
````

### Appendix 9: `src/hooks/useArrowKeys.ts` (2 lines, 186 bytes, sha256 `02fdb54b12d4d5301cbcac45f862b57b7e57e72a27b3fde1d986fec37eb62258`)

````ts
/** Native: hardware arrows are a no-op. Web implementation is useArrowKeys.web.ts. */
export function useArrowKeys(_count: number, _index: number, _onIndex: (index: number) => void) {}
````

### Appendix 10: `src/content/cards.ts` (180 lines, 5,117 bytes, sha256 `7b484e359e0f372a3380df5280aa4293b5816dbca3b1e279ab9448337b50436d`)

````ts
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
````

### Appendix 11: `src/content/snippet.ts` (51 lines, 1,830 bytes, sha256 `cd99059783d7aed96684cdec6994fa6230f109f8857ad53d3f34c36893938879`)

````ts
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
````

### Appendix 12: `src/theme/theme.tsx` (157 lines, 3,870 bytes, sha256 `3b055d9194a3c09b6887f82d8cd473417b3849d2b033c9611adf2bd93530c8d0`)

````tsx
import { usePathname } from "expo-router";
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
const webMono = '"Geist Mono", "Geist Mono Fallback"';

export const fonts =
  Platform.OS === "web"
    ? {
        regular: webSans,
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
  const path = usePathname();
  const [mode, setMode] = useState<Mode>("dark");
  const [playgroundColor, setPlaygroundColor] = useState(dark.orb);
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
````

### Appendix 13: `src/color/color.ts` (233 lines, 9,459 bytes, sha256 `0994d34b4b4a6f4dab879febf1f2026b5900d3bd0558267235b59cb26741a1ac`)

````ts
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
