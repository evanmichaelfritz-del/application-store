# Agent Prompt: Spacing tuner

Build **one asset**, the *Spacing tuner*. It's an animated desktop-dashboard wireframe. Five spacing variables change one at a time, each with a translucent colour overlay on the area it affects and a status chip that counts its px value. Then everything springs back and the loop repeats every 10 s. Ship it as a self-contained React Native + TypeScript component that runs under react-native-web. The bar is **desktop web at 1280 px wide**; native is a known gap.

## 0. Credit

Based on a spacing demo by @MichaelFilipiuk ("If the app feels off but you're not sure why, it's probably the spacing."). Keep this credit in the asset's description, and link the post: https://x.com/MichaelFilipiuk/status/2111383736243859714.

**Source tags used below:**
- **[V t=…]**: a timestamp in seconds in the reference recording (1440x1080, 10.000 s, 60 fps).
- **[V f_NNN]**: a 10 fps frame of it, where t = (NNN−1)/10.
- **[T]**: the author's thread replies.
- **[M]**: a value derived by fitting measurements across many frames.
- **[I]**: an implementation choice that isn't visible in the source. You may keep or change these, but parity numbers assume them.

Units are **stage px**. The component draws a fixed 1440x1080 stage and scales it uniformly to fit its container. 1 stage px = 1 px of the reference recording, where the measured px equal the labelled chip values exactly [V: sidebar 184→248 measures +64 px].

## 1. Overview

- **Scene** [V f_001]: a #F3F3F3 page with one rounded white app window.
  - The window holds a sidebar (logo, brand line, 6 nav rows, footer avatar), a header (title bar, light pill, dark pill) and section 1 (label, 4 stat cards).
  - It also holds section 2 (label, a 12-bar chart card on the left and a 6-row list card on the right).
  - Under the window sit **5 white status chips**, each with an icon and a number.
- **Everything is a grey placeholder:** no words, no images. The only text is the chip numbers [V].
- **The chips are status indicators**, not controls. The reference shows no cursor, hover or press [V all frames].
  - The asset is **autoplay-only by default**.
  - A press-to-toggle mode exists as an optional prop and is clearly marked as an **addition**.
- **Sequence:** sidebar width → outer padding → row gap → column gap → card padding, left to right, 1.3 s apart.
  - Each step: overlay and chip ring fade in, the value springs, the overlay and ring fade out.
  - Rest, then all five spring back together at 9.1 s. 10 s loop.

## 2. Layout spec

All values are stage px.

**Window**
- Outer box at **(62, 74)**, **1316 x 828**, 2 px border **#DCDCDC**, outer radius **30** [V f_001 corner; radius fitted to the corner anti-alias, I], white, `overflow: hidden`.
- Inner origin (64, 76), inner size **1312 x 824**. Everything below is in inner coordinates.
- Shadow below: `0px 18px 40px rgba(0,0,0,0.07)` [I, approximates the measured falloff from #E3E3E3 at the edge to page colour about 75 px below; no shadow above] [V col x=500].

**Live variables:** S = sidebar width, P = outer padding, R = row gap, G = column gap, C = card padding.

Derived:
- x0 = S + P
- y0 = P
- Wc = 1312 − S − 2P

**Sidebar** [V f_001, f_081: the contents don't move except the active row, which stretches]

| Element | Rect / spec | Colour |
|---|---|---|
| Background | (0, 0, S, 824) | #FAFAFA |
| Right edge | 1 px line at x = S−1 | #EEEEEE |
| Logo | (20, 18) 28x28, r6 | #9F9F9F |
| Brand line | (58, 27) 72x10, r5 | #DADADA |
| Active-row background | (12, 72) (S−24)x38, r8 | #EDEDED |

- Nav rows i = 0…5 at y = 72 + 38i:
  - icon (20, y+10) 16x16, r4;
  - line (46, y+13) h10, r5, widths **92, 68, 84, 60, 76, 88**;
  - row 0 ink #D0D0D0, rows 1–5 ink #DADADA.
- Footer: avatar (20, 778) 28x28 circle #DADADA, line (58, 787) 80x10 #DADADA.

**Header** (height 36, top y0) [V f_001, f_081]
- Title bar: (x0, y0+10) 176x16, r8, #A0A0A0.
- Dark pill: right-aligned to x0+Wc, 112x36, r18, **#181818**.
- Light pill: 8 px left of the dark pill, 96x36, r18, #DFDFDF.
- There's no search field and no avatar [V].

**Section rows** [V]
- Section 1 label top = y0 + 36 + **R**. Section 2 label top = stat-card bottom + **R**.
- Labels: 104x12 (section 1) and 136x12 (section 2), r6, #A0A0A0.
- Right bar: 52x10, r5, #E0E0E0, at y+1, right-aligned.
- Label → card top = 12 + 12 (label height + 12 px gap).

**Cards**
- White, radius 10 [I estimate from anti-alias].
- A 2 px **#EEEEEE ring drawn outside** the layout box (outer radius 12). Card content offsets are measured from the box, not the ring [V: stat value bar at box x + C exactly].

**Stat cards** (4) [V f_001]
- Width w = (Wc − 3G) / 4, height **86 + 2C**, x_i = x0 + i(w+G).
- Label (x+C, y+C) h10, r5, #E0E0E0, widths **64, 80, 56, 72**.
- Value (x+C, y+C+22) h20, r10, #A0A0A0, widths **100, 116, 92, 108**.
- Mini chart: **8 bars**, each 8 wide at x + C + 12j, bottom-aligned at y + C + 86, r2, #E0E0E0.
  - Heights in px for card i are H[i…i+7], where H = **12, 17, 14, 21, 19, 24, 20, 26, 22, 28, 24**.
  - These heights are fixed and don't scale [V f_081].

**Bottom row** [V, 4 measured states]
- Top = section 2 label + 24. Bottom = 824 − P.
- Chart width = 2C + (2/3)(Wc − G − 4C). List width = 2C + (1/3)(Wc − G − 4C).
- This is flex 2 : 1 with zero basis, with padding reserved first. It matches 704/364, 661/343, 635/329 and 632/340 exactly.

**Chart card**
- Title (x+C, y+C+9) 120x10, r5, #A0A0A0.
- Pill: right-aligned, 80x28, r14, #DFDFDF, top y+C.
- Plot: inner width = w − 2C, plot height = h − 2C − 28 − 16, bottom = y + h − C.
- **12 bars** with gap 12, width (inner − 132)/12, r4, #DFDFDF.
- Heights = plot × **37.6, 51.6, 43.6, 65.3, 57.5, 73.3, 61.4, 80.2, 69.4, 87.2, 75.3, 93.1 %** [M: fits four states within 1 px].

**List card**
- Title (x+C, y+C) 96x10, #A0A0A0.
- **6 rows** at y + C + 26 + 44i:
  - avatar 28x28 circle #DFDFDF;
  - line at +40 px, h10, #E0E0E0, widths **96, 72, 108, 84, 64, 90**;
  - value bar 36x10 #E0E0E0, right-aligned at inner edge − C.
- Each row has **one** line, not two [V].

**Chips** [V f_001 row y=970]
- Row top **943**, height **58**, gap **24**, centred on the stage (span 341…1097 at t=0).
- Each chip: white, radius 29, padding-left 18, icon 36x36, gap 18, digits, padding-right 23, shadow `0px 1px 3px rgba(0,0,0,0.06)` [I].
- Digits: #181818, about 28 px system sans, regular.
  - Each digit sits in a fixed **17 px cell** [V digit pitch 414/431/448]. This makes chip widths independent of the font: 146/129/129/129/129 (computed) vs measured 148/128/130/128/129.
- **Active ring:** 3 px accent, drawn **outside** the chip (outer 3 px larger on every side). Its opacity equals the overlay's. The chip fill doesn't change [V t=1.5: interior stays #FDFDFD–#FFFFFF].

**Chip icons** (36x36 box) [V f_001 zoom]

| Chip | Icon |
|---|---|
| Sidebar | 36x28 outline rect (top 4), 2 px #DDDDDD, r6, with an accent ↔ arrow inside: 18 px shaft, 2.5 px stroke, chevron heads. |
| Outer padding | Square, 2.5 px accent border, r8, fill = accent at 35%, white 16x16 inner square r3 with 1 px rgba(0,0,0,0.12) border. Solid, not dashed. |
| Row gap | 3 horizontal bars 30 wide: grey 10 tall, accent 8 tall, grey 10 tall, 2 px apart, r2. |
| Column gap | 3 vertical bars 28 tall: grey 10 wide, accent 8 wide, grey 10 wide, 2 px apart, r2. |
| Card padding | Same as outer padding, in orange. |

Icon grey is #DFDFDF.

## 3. Colour tokens

sRGB, sampled from the recording ±2/255 for H.264. The source is sRGB video, so there are no P3 values.

| Token | Hex | Source |
|---|---|---|
| page | #F3F3F3 | [V f_001 (10,10)] |
| window / card / chip | #FFFFFF | [V] |
| window border | #DCDCDC | [V x=62–63] |
| sidebar | #FAFAFA | [V] |
| sidebar edge, card ring | #EEEEEE | [V] |
| active nav background | #EDEDED | [V] |
| nav ink / active ink | #DADADA / #D0D0D0 | [V] |
| logo | #9F9F9F | [V] |
| dark placeholder | #A0A0A0 | [V] |
| light placeholder | #E0E0E0 | [V] |
| chart bar, avatar, light pill | #DFDFDF | [V] |
| dark pill | #181818 | [V] |
| chip digits | #181818 | [V ~#141414–#1C1C1C] |
| accent: sidebar | **#F14E8F** | [V chip ring core t=1.5] |
| accent: padding | **#3F8CED** | [V ring t=2.6] |
| accent: row gap | **#A06EE8** | [V ring t=4.2] |
| accent: column gap | **#23B375** | [V ring t=5.2] |
| accent: card padding | **#EC8A28** | [V ring t=6.5] |
| overlay | accent at **0.32** opacity | [M: predicts the measured overlays #F7C3D8/#C2DAF9/#E0D0F8/#B9E7D3/#F9D8B8 vs measured #F8C2D9/#C2DAF9/#E0D0F8/#BAE7D2/#F7DAB7] |

## 4. The five variables

| # | Key | Chip | Before | After | Overlay area (follows the live value) |
|---|---|---|---|---|---|
| 1 | sidebar | pink | **184** | **248** | the whole sidebar (0, 0, S, 824) |
| 2 | padding | blue | **20** | **40** | the 4 bands of thickness P around the main area (x ≥ S) |
| 3 | rowGap | purple | **20** | **48** | 2 bands of height R across Wc: header bottom → section 1 label, and stat bottom → section 2 label |
| 4 | colGap | green | **20** | **12** | 3 gaps between stat cards (stat height) and 1 gap between chart and list (bottom-row height) |
| 5 | cardPadding | orange | **12** | **24** | inside each of the 6 cards, a ring of thickness C with the card radius |

- Values come from the chip numbers [V f_001, f_081].
- Column gap is the only variable that shrinks [V].

## 5. Timeline

Measured at 60 fps by tracking element edges and overlay colours across all 600 frames [V].

- Phase k = 0…4 starts at **t0 = 0.8 + 1.3k**.
- **Overlay and ring:** fade in linearly over **0.15 s** from t0, and fade out linearly over **0.25 s** from t0 + 1.0.
- **Value:** starts its spring at **t0 + 0.2**.
- **Spring:** mass 1, stiffness 202, damping 21.35 (ζ ≈ 0.751), zero initial velocity. Chosen to put the sidebar overshoot windows and the half-travel times within one frame of the original.
  - Half-travel (progress 0.5) is at **+0.103 s**: 1.103, 2.403, 3.703, 5.003, 6.303, and revert 9.203. Those sit within one frame of 1.093 / 2.400 / 3.689 / 5.003 / 6.295 / 9.200.
  - The sidebar chip first leaves 184 at **+0.009 s** (t = 1.009) and first reads 248 at **+0.250 s** (t = 1.250), not earlier.
  - Peak overshoot is **2.80% at +0.335 s**. On the 64 px sidebar move that is **+1.8 px**, which rounds to +2 px from 1.300 s to 1.383 s, then +1 px until 1.480 s, and is settled from 1.480 s. The revert mirrors that: −2 px from 9.400 s to 9.483 s, −1 px until 9.580 s.
  - Measured overshoot is about 1–4.8% across moves, and 3.1% on the 64 px sidebar move.
  - The sidebar edge holds +2 px from 1.283 s to 1.383 s and +1 px from 1.400 s to 1.467 s, settled from 1.483 s. The revert holds −2 px from 9.367 s to 9.500 s and −1 px from 9.517 s to 9.567 s, resting from 9.583 s.

| Phase | Overlay fade-in | Value spring start | Reaches target | Settled | Overlay fade-out | Evidence |
|---|---|---|---|---|---|---|
| 1 sidebar 184→248 | 0.80–0.95 | **1.00** | 1.24 | 1.50 | 1.80–2.05 | first move 1.000; fade 0.800→0.933, 1.783→2.050 |
| 2 padding 20→40 | 2.10–2.25 | **2.30** | 2.54 | 2.80 | 3.10–3.35 | first move 2.317; fade 2.100→2.267, 3.083→3.333 |
| 3 row gap 20→48 | 3.40–3.55 | **3.60** | 3.84 | 4.10 | 4.40–4.65 | first move 3.617; fade 3.400→3.567, 4.383→4.650 |
| 4 column gap 20→12 | 4.70–4.85 | **4.90** | 5.14 | 5.40 | 5.70–5.95 | first move ≈4.93; fade 4.700→4.850, 5.683→5.950 |
| 5 card padding 12→24 | 6.00–6.15 | **6.20** | 6.44 | 6.70 | 7.00–7.25 | first move 6.217; fade 6.000→6.133, 6.983→7.250 |
| Rest | — | — | — | — | — | 7.25–9.10: all after values, no overlays or rings |
| Revert, all 5 together | none | **9.10** | 9.34 | 9.60 | none | first move 9.100; chips 245/39/47/12/23 at 9.117, 204/26/29/17/16 at 9.233 |
| Hold | — | — | — | — | — | 9.60–10.00 → loop; then 0.00–0.80 before values |

**Chip numbers** = round(from + (to − from) · clamp(progress, 0, 1)).
- They count every frame with the layout spring.
- They never show the overshoot [V t=1.25–1.50: holds 248; t=9.33–9.67: holds 184].

Reading the timing: each value starts within one 60 fps frame of these times. Edges are within ±1 px at rest.

## 6. Loop behaviour

- The loop is 10.0 s and seamless: t wraps modulo 10, and at t = 10 the scene equals t = 0 (all before values, no overlays).
- The revert is one spring for all five at once, with no overlays. It is **not** a snap [V t=9.1–9.6].
- Driven by a requestAnimationFrame clock in seconds × `speed`.

## 7. Controls

- **Default: autoplay only.** The chips are status pills: not focusable, no hover, no cursor. This matches the reference [V].
- **Optional addition, `interactive` (default false).** This isn't in the reference [I].
  - The chips become buttons. A press toggles that one variable between its before and after value with the same spring.
  - It stops the autoplay loop and shows that variable's overlay and ring.
  - All other variables keep their nearest before/after value.

## 8. Props / API

```ts
interface SpacingTunerProps {
  autoPlay?: boolean;      // default true; ignored when `time` is set
  time?: number;           // freeze at loop time (s, 0..10) — deterministic render for tests/screenshots
  interactive?: boolean;   // ADDITION, default false (see Controls)
  reducedMotion?: boolean; // default: follow OS (AccessibilityInfo)
  speed?: number;          // default 1
  style?: StyleProp<ViewStyle>;
}
```

Also exported:
- `frameAt(t, reducedMotion?)` → `{ values, display, emphasis }`;
- `spring(t)`;
- `LOOP_S`;
- `VARIABLES`.

**Sizing:** the root is `width: '100%'` with a 4:3 aspect ratio. Put it in a sized box; the stage scales with `min(width/1440, height/1080)`.

## 9. Reduced motion [I]

When `reducedMotion` is true, or when the OS asks for reduced motion (`AccessibilityInfo`; on web that is `prefers-reduced-motion`):
- The clock does not run.
- The stage holds one frame, the settled tuned pose at **t = 7.5 s**: sidebar 248, outer padding 40, row gap 48, column gap 12, card padding 24, no overlays and no rings.

The clock also pauses while the stage is off screen (`IntersectionObserver`, and while the document is hidden). From 7.25 s to 9.1 s it keeps time but does not re-render, because that rest poses the same picture.

## 10. Gotchas

1. **Drive geometry from numbers, not measurement.** Every rect is computed in `computeScene()` from the five live values. Overlays must use the same rects every frame, so they never lag the layout.
2. **The card ring is outside the box.** Don't use an inset border that eats the padding, or the content offsets go wrong by 2 px.
3. **Bottom row split.** Use the 2 : 1 formula *with* padding reserved first. A plain 2/3 : 1/3 split is off by 8–12 px.
4. **Chart bars scale with height; mini bars don't.**
5. **Chip digits:** use fixed 17 px cells so the chips don't shift when the fallback font differs. Never set a width on a single `<Text>`, because it wraps.
6. **Clamp chip numbers, not layout values.** The layout overshoots by 2.8% on the 64 px sidebar move (+1.8 px); the numbers don't.
7. **The stage scales with `transform: scale`** around the centre of a 1440x1080 box. Keep `overflow: hidden` on the root and on the window (rounded clipping).
8. **`boxShadow` string styles** are used. They render on react-native-web and on the new React Native architecture; older native renderers ignore them (known gap).
9. The rAF clock drives about 150 views, but it does not run under reduced motion or while the stage is off screen, and it skips renders during the 7.25–9.1 s rest. Native performance is still a known gap.
10. Don't add text labels to the scene or chips. The reference has none; accessible names live in `accessibilityLabel` only.
11. **Phone widths are a known gap.** Desktop web at 1280 is the bar. The stage still scales, but phone layouts are not a parity target.

## Known gaps

- The card-padding edges (chart top and card bottom) paint +1 px from 6.495 to 6.595 s; the original peaks at +0.27 px.
- The revert dip runs −2 px from 9.400 to 9.480 s vs the original's 9.367–9.500 s, and the sidebar chip returns to 184 at about 9.355 s vs 9.333 s.
- The phase-1 counter's first change is one frame late (184 at 1.000 s, where the original shows 185).

## 11. File structure

```
App.tsx                         demo screen: fits the 4:3 stage into the viewport
index.ts                        registerRootComponent(App)
src/spacing-tuner/index.ts      public exports
src/spacing-tuner/tokens.ts     stage, colours, variables, sizes, chip geometry
src/spacing-tuner/timeline.ts   spring, schedule, frameAt()
src/spacing-tuner/layout.ts     computeScene(): every rect + overlay rects
src/spacing-tuner/Icons.tsx     the 5 chip icons (Views only, no SVG)
src/spacing-tuner/SpacingTuner.tsx  component
```

Dependencies (no others): `react`, `react-native`, and `react-native-web`. `tsconfig.json` uses `"strict": true`.

## Setup

Peer is React. The component also runs on react-native-web. The React LICENSE is:

```
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

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

## 12. Full code

### `src/spacing-tuner/tokens.ts`

```ts
// Spacing tuner — design tokens. Units are stage px: the stage is 1440 x 1080
// and 1 stage px equals 1 px of the 1440 x 1080 reference recording.

export const STAGE = { width: 1440, height: 1080 } as const;

/** Outer edge of the app window (border included). Inner area is 1312 x 824 at (64, 76). */
export const WINDOW = { x: 62, y: 74, width: 1316, height: 828, border: 2, radius: 30 } as const;
export const INNER = { width: 1312, height: 824 } as const;

export const COLORS = {
  page: '#F3F3F3',
  window: '#FFFFFF',
  windowBorder: '#DCDCDC',
  sidebar: '#FAFAFA',
  sidebarEdge: '#EEEEEE',
  navActiveBg: '#EDEDED',
  navInk: '#DADADA',
  navInkActive: '#D0D0D0',
  logo: '#9F9F9F',
  dark: '#A0A0A0',
  light: '#E0E0E0',
  bar: '#DFDFDF',
  card: '#FFFFFF',
  cardRing: '#EEEEEE',
  pillLight: '#DFDFDF',
  pillDark: '#181818',
  chip: '#FFFFFF',
  chipText: '#181818',
  iconGrey: '#DFDFDF',
  iconOutline: '#DDDDDD',
  iconInnerBorder: 'rgba(0,0,0,0.12)',
} as const;

export type VarKey = 'sidebar' | 'padding' | 'rowGap' | 'colGap' | 'cardPadding';

export interface SpacingVariable {
  key: VarKey;
  /** Accessible name only; the scene shows no text labels. */
  label: string;
  accent: string;
  from: number;
  to: number;
}

/** Order = animation order = chip order, left to right. */
export const VARIABLES: readonly SpacingVariable[] = [
  { key: 'sidebar', label: 'Sidebar width', accent: '#F14E8F', from: 184, to: 248 },
  { key: 'padding', label: 'Outer padding', accent: '#3F8CED', from: 20, to: 40 },
  { key: 'rowGap', label: 'Row gap', accent: '#A06EE8', from: 20, to: 48 },
  { key: 'colGap', label: 'Column gap', accent: '#23B375', from: 20, to: 12 },
  { key: 'cardPadding', label: 'Card padding', accent: '#EC8A28', from: 12, to: 24 },
] as const;

/** Overlay = accent colour at this opacity, drawn over the affected area. */
export const OVERLAY_ALPHA = 0.32;
/** Icon fill for the two "box" icons (padding, card padding). */
export const ICON_FILL_ALPHA = 0.35;

/** Fixed content sizes (stage px). */
export const SIZES = {
  headerH: 36,
  titleBar: { w: 176, h: 16 },
  lightPill: { w: 96, h: 36 },
  darkPill: { w: 112, h: 36 },
  headerPillGap: 8,
  sectionLabelW: [104, 136] as const,
  sectionLabelH: 12,
  sectionRight: { w: 52, h: 10 },
  labelToCard: 12,
  statLabelW: [64, 80, 56, 72] as const,
  statValueW: [100, 116, 92, 108] as const,
  statInnerH: 86,
  miniHeights: [12, 17, 14, 21, 19, 24, 20, 26, 22, 28, 24] as const,
  chartTitle: { w: 120, h: 10 },
  chartPill: { w: 80, h: 28 },
  chartHeadGap: 16,
  chartBarGap: 12,
  chartPct: [37.6, 51.6, 43.6, 65.3, 57.5, 73.3, 61.4, 80.2, 69.4, 87.2, 75.3, 93.1] as const,
  listTitleW: 96,
  listLineW: [96, 72, 108, 84, 64, 90] as const,
  navLineW: [92, 68, 84, 60, 76, 88] as const,
  cardRadius: 10,
  ring: 2,
} as const;

/** Chip (status pill) geometry. */
export const CHIPS = {
  top: 943,
  height: 58,
  gap: 24,
  padL: 18,
  padR: 23,
  icon: 36,
  iconGap: 18,
  fontSize: 28,
  /** Each digit sits in a fixed 17px cell so chip widths do not depend on the font. */
  digitW: 17,
  ring: 3,
} as const;
```

### `src/spacing-tuner/timeline.ts`

```ts
import { VARIABLES, VarKey } from './tokens';

/** Loop length in seconds. */
export const LOOP_S = 10;
/** Phase k (0..4) begins at PHASE0_S + k * PHASE_STEP_S. */
export const PHASE0_S = 0.8;
export const PHASE_STEP_S = 1.3;
/** Overlay + chip ring fade in (linear) from phase start. */
export const FADE_IN_S = 0.15;
/** The value starts moving this long after its phase starts. */
export const VALUE_DELAY_S = 0.2;
/** Overlay + chip ring fade out (linear) starting this long after phase start. */
export const FADE_OUT_AT_S = 1.0;
export const FADE_OUT_S = 0.25;
/** All five values spring back together at this time; no overlays. */
export const REVERT_S = 9.1;
/** Rest window: the picture is already the tuned pose, so the clock skips renders. */
export const REST_S = 7.25;
/** Reduced motion holds this frame: the settled tuned pose, overlays gone. */
export const REDUCED_HOLD_S = 7.5;

/**
 * Spring: mass 1, stiffness 202, damping 21.35 (zeta ≈ 0.751), zero initial velocity.
 * Peak overshoot is 2.80% at +0.335 s. On the 64 px sidebar move that is +1.8 px,
 * which rounds to +2 px and never +3. Card padding (12 px) peaks at +0.34 px.
 */
export const SPRING = { stiffness: 202, damping: 21.35, mass: 1 } as const;

const W0 = Math.sqrt(SPRING.stiffness / SPRING.mass);
const ZETA = SPRING.damping / (2 * Math.sqrt(SPRING.stiffness * SPRING.mass));
const WD = W0 * Math.sqrt(1 - ZETA * ZETA);

/** Normalised spring step response, 0 -> 1 with 2.80% overshoot at 0.335 s. */
export function spring(t: number): number {
  if (t <= 0) return 0;
  const decay = Math.exp(-ZETA * W0 * t);
  return 1 - decay * (Math.cos(WD * t) + ((ZETA * W0) / WD) * Math.sin(WD * t));
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const step = (t: number) => (t >= 0 ? 1 : 0);

function blankVars(): VarMap<number> {
  return { sidebar: 0, padding: 0, rowGap: 0, colGap: 0, cardPadding: 0 };
}

export type VarMap<T> = Record<VarKey, T>;

export interface Frame {
  /** Live layout values (may overshoot slightly). */
  values: VarMap<number>;
  /** Chip numbers: rounded, never past from/to. */
  display: VarMap<number>;
  /** Overlay and chip-ring opacity 0..1. */
  emphasis: VarMap<number>;
}

export function phaseStart(index: number): number {
  return PHASE0_S + index * PHASE_STEP_S;
}

/** Scene state at time t (seconds; wraps every LOOP_S). */
export function frameAt(tRaw: number, reducedMotion = false): Frame {
  const t = ((tRaw % LOOP_S) + LOOP_S) % LOOP_S;
  const values = blankVars();
  const display = blankVars();
  const emphasis = blankVars();
  VARIABLES.forEach((v, i) => {
    const start = phaseStart(i);
    const ease = reducedMotion ? step : spring;
    const p = ease(t - (start + VALUE_DELAY_S)) - ease(t - REVERT_S);
    values[v.key] = v.from + (v.to - v.from) * p;
    display[v.key] = Math.round(v.from + (v.to - v.from) * clamp01(p));
    if (reducedMotion) {
      emphasis[v.key] = t >= start && t < start + FADE_OUT_AT_S ? 1 : 0;
    } else {
      const fin = clamp01((t - start) / FADE_IN_S);
      const fout = clamp01((t - (start + FADE_OUT_AT_S)) / FADE_OUT_S);
      emphasis[v.key] = fin * (1 - fout);
    }
  });
  return { values, display, emphasis };
}
```

### `src/spacing-tuner/layout.ts`

```ts
import { INNER, SIZES, VarKey } from './tokens';
import type { VarMap } from './timeline';

export interface Rect { x: number; y: number; w: number; h: number }

export interface StatCard extends Rect { index: number }
export interface Scene {
  S: number; P: number; R: number; G: number; C: number;
  /** Content box of the main area. */
  x0: number; y0: number; Wc: number;
  header: { title: Rect; lightPill: Rect; darkPill: Rect };
  sections: { label: Rect; right: Rect }[];
  stats: StatCard[];
  chart: Rect;
  list: Rect;
  overlays: VarMap<Rect[]>;
}

/** Pure layout: every rect in window-inner coordinates (origin = inside the window border). */
export function computeScene(v: VarMap<number>): Scene {
  const S = v.sidebar, P = v.padding, R = v.rowGap, G = v.colGap, C = v.cardPadding;
  const x0 = S + P;
  const y0 = P;
  const Wc = INNER.width - S - 2 * P;

  const header = {
    title: { x: x0, y: y0 + (SIZES.headerH - SIZES.titleBar.h) / 2, w: SIZES.titleBar.w, h: SIZES.titleBar.h },
    darkPill: { x: x0 + Wc - SIZES.darkPill.w, y: y0, w: SIZES.darkPill.w, h: SIZES.darkPill.h },
    lightPill: {
      x: x0 + Wc - SIZES.darkPill.w - SIZES.headerPillGap - SIZES.lightPill.w,
      y: y0, w: SIZES.lightPill.w, h: SIZES.lightPill.h,
    },
  };

  const section = (y: number, i: number) => ({
    label: { x: x0, y, w: SIZES.sectionLabelW[i], h: SIZES.sectionLabelH },
    right: { x: x0 + Wc - SIZES.sectionRight.w, y: y + 1, w: SIZES.sectionRight.w, h: SIZES.sectionRight.h },
  });

  const sec1Y = y0 + SIZES.headerH + R;
  const statTop = sec1Y + SIZES.sectionLabelH + SIZES.labelToCard;
  const statH = SIZES.statInnerH + 2 * C;
  const statW = (Wc - 3 * G) / 4;
  const stats: StatCard[] = [0, 1, 2, 3].map((index) => ({
    index, x: x0 + index * (statW + G), y: statTop, w: statW, h: statH,
  }));

  const sec2Y = statTop + statH + R;
  const bottomTop = sec2Y + SIZES.sectionLabelH + SIZES.labelToCard;
  const bottomH = INNER.height - P - bottomTop;
  // flex 2 : 1 with zero basis; padding is reserved before the free space is shared.
  const free = Wc - G - 4 * C;
  const chartW = 2 * C + (free * 2) / 3;
  const listW = 2 * C + free / 3;
  const chart = { x: x0, y: bottomTop, w: chartW, h: bottomH };
  const list = { x: x0 + chartW + G, y: bottomTop, w: listW, h: bottomH };

  const ring = (r: Rect, t: number): Rect[] => [
    { x: r.x, y: r.y, w: r.w, h: t },
    { x: r.x, y: r.y + r.h - t, w: r.w, h: t },
    { x: r.x, y: r.y + t, w: t, h: r.h - 2 * t },
    { x: r.x + r.w - t, y: r.y + t, w: t, h: r.h - 2 * t },
  ];

  const overlays: Record<VarKey, Rect[]> = {
    sidebar: [{ x: 0, y: 0, w: S, h: INNER.height }],
    padding: ring({ x: S, y: 0, w: INNER.width - S, h: INNER.height }, P),
    rowGap: [
      { x: x0, y: y0 + SIZES.headerH, w: Wc, h: R },
      { x: x0, y: statTop + statH, w: Wc, h: R },
    ],
    colGap: [
      ...stats.slice(0, 3).map((s) => ({ x: s.x + s.w, y: statTop, w: G, h: statH })),
      { x: x0 + chartW, y: bottomTop, w: G, h: bottomH },
    ],
    cardPadding: [...stats, chart, list].flatMap((r) => ring(r, C)),
  };

  return {
    S, P, R, G, C, x0, y0, Wc, header,
    sections: [section(sec1Y, 0), section(sec2Y, 1)],
    stats, chart, list, overlays,
  };
}
```

### `src/spacing-tuner/Icons.tsx`

```tsx
import React from 'react';
import { View } from 'react-native';
import { COLORS, ICON_FILL_ALPHA, VarKey } from './tokens';

/** Hex '#RRGGBB' + alpha -> 'rgba(...)'. */
export function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const SIZE = 36;
const abs = { position: 'absolute' as const };

function Chevron({ x, y, dir, color }: { x: number; y: number; dir: 'left' | 'right'; color: string }) {
  // A 6x6 square showing two borders, rotated 45deg, reads as an arrow head.
  return (
    <View
      style={{
        ...abs, left: x - 3, top: y - 3, width: 6, height: 6,
        borderColor: color,
        borderLeftWidth: dir === 'left' ? 2.5 : 0,
        borderBottomWidth: dir === 'left' ? 2.5 : 0,
        borderRightWidth: dir === 'right' ? 2.5 : 0,
        borderTopWidth: dir === 'right' ? 2.5 : 0,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

function SidebarIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 0, top: 4, width: 36, height: 28, borderRadius: 6, borderWidth: 2, borderColor: COLORS.iconOutline }} />
      <View style={{ ...abs, left: 9, top: 16.75, width: 18, height: 2.5, borderRadius: 1.25, backgroundColor: accent }} />
      <Chevron x={10.5} y={18} dir="left" color={accent} />
      <Chevron x={25.5} y={18} dir="right" color={accent} />
    </View>
  );
}

function BoxIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 0, top: 0, width: 36, height: 36, borderRadius: 8, borderWidth: 2.5, borderColor: accent, backgroundColor: withAlpha(accent, ICON_FILL_ALPHA) }} />
      <View style={{ ...abs, left: 10, top: 10, width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: COLORS.iconInnerBorder, backgroundColor: '#FFFFFF' }} />
    </View>
  );
}

function RowGapIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 3, top: 2, width: 30, height: 10, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
      <View style={{ ...abs, left: 3, top: 14, width: 30, height: 8, borderRadius: 2, backgroundColor: accent }} />
      <View style={{ ...abs, left: 3, top: 24, width: 30, height: 10, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
    </View>
  );
}

function ColGapIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 2, top: 4, width: 10, height: 28, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
      <View style={{ ...abs, left: 14, top: 4, width: 8, height: 28, borderRadius: 2, backgroundColor: accent }} />
      <View style={{ ...abs, left: 24, top: 4, width: 10, height: 28, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
    </View>
  );
}

export function VariableIcon({ kind, accent }: { kind: VarKey; accent: string }) {
  switch (kind) {
    case 'sidebar': return <SidebarIcon accent={accent} />;
    case 'padding': return <BoxIcon accent={accent} />;
    case 'rowGap': return <RowGapIcon accent={accent} />;
    case 'colGap': return <ColGapIcon accent={accent} />;
    case 'cardPadding': return <BoxIcon accent={accent} />;
  }
}
```

## Component

### `src/spacing-tuner/SpacingTuner.tsx`

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, LayoutChangeEvent, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { CHIPS, COLORS, INNER, OVERLAY_ALPHA, SIZES, STAGE, VARIABLES, VarKey, WINDOW } from './tokens';
import { frameAt, spring, LOOP_S, REDUCED_HOLD_S, REST_S, REVERT_S, VarMap, Frame } from './timeline';
import { computeScene, Rect } from './layout';
import { VariableIcon, withAlpha } from './Icons';

export interface SpacingTunerProps {
  /** Run the 10 s loop. Default true. Ignored when `time` is set. */
  autoPlay?: boolean;
  /** Freeze the scene at this loop time in seconds (0..10). */
  time?: number;
  /** ADDITION (not in the reference): chips become buttons; a press toggles that one
   *  variable between its before/after value and stops the autoplay loop. Default false. */
  interactive?: boolean;
  /** Force reduced motion on/off. Default: follow the OS setting. */
  reducedMotion?: boolean;
  /** Playback speed multiplier. Default 1. */
  speed?: number;
  style?: StyleProp<ViewStyle>;
}

const abs = { position: 'absolute' as const };
const FONT = 'Inter, -apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

function Box({ r, color, radius = 0, style }: { r: Rect; color: string; radius?: number; style?: ViewStyle }) {
  return (
    <View
      pointerEvents="none"
      style={[{ ...abs, left: r.x, top: r.y, width: Math.max(0, r.w), height: Math.max(0, r.h), backgroundColor: color, borderRadius: radius }, style]}
    />
  );
}

/** Card: white box with a 2px ring drawn outside the layout box. */
function Card({ r }: { r: Rect }) {
  const k = SIZES.ring;
  return (
    <View
      pointerEvents="none"
      style={{
        ...abs, left: r.x - k, top: r.y - k, width: r.w + 2 * k, height: r.h + 2 * k,
        borderWidth: k, borderColor: COLORS.cardRing, borderRadius: SIZES.cardRadius + k, backgroundColor: COLORS.card,
      }}
    />
  );
}

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

function useReducedMotion(forced?: boolean): boolean {
  const [os, setOs] = useState(false);
  useEffect(() => {
    if (forced !== undefined) return;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setOs(v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setOs(v));
    return () => { alive = false; sub?.remove?.(); };
  }, [forced]);
  return forced ?? os;
}

/** True while the stage is on screen. Without IntersectionObserver, stay running. */
function useOnScreen(ref: React.RefObject<View | null>): boolean {
  const canObserve = typeof IntersectionObserver === 'function';
  const [onScreen, setOnScreen] = useState(!canObserve);
  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(ref.current);
    if (!el) {
      setOnScreen(true);
      return;
    }
    let intersecting = false;
    const publish = () => {
      const hidden = typeof document !== 'undefined' && document.hidden;
      const next = intersecting && !hidden;
      setOnScreen((current) => (current === next ? current : next));
    };
    const observer = new IntersectionObserver((entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting);
      publish();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', publish);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', publish);
    };
  }, [canObserve, ref]);
  return onScreen;
}

/** rAF clock in seconds. Skips React renders through the 7.25–9.1 s rest. */
function useClock(running: boolean, speed: number): number {
  const [t, setT] = useState(0);
  const base = useRef<{ start: number; offset: number } | null>(null);
  const tRef = useRef(0);
  useEffect(() => {
    if (!running) { base.current = null; return; }
    let raf = 0;
    const tick = (now: number) => {
      if (!base.current) base.current = { start: now, offset: tRef.current };
      const next = (base.current.offset + ((now - base.current.start) / 1000) * speed) % LOOP_S;
      const prev = tRef.current;
      tRef.current = next;
      const resting = prev >= REST_S && prev < REVERT_S && next >= REST_S && next < REVERT_S;
      if (!resting) setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);
  return t;
}

interface Manual { key: VarKey; target: VarMap<number>; from: VarMap<number>; at: number }

function blankVars(): VarMap<number> {
  return { sidebar: 0, padding: 0, rowGap: 0, colGap: 0, cardPadding: 0 };
}

/** Manual (interactive) mode frame: each variable springs from where it was to its target. */
function manualFrame(m: Manual, now: number, reduced: boolean): Frame {
  const dt = (now - m.at) / 1000;
  const p = reduced ? 1 : spring(dt);
  const values = blankVars(), display = blankVars(), emphasis = blankVars();
  VARIABLES.forEach((v) => {
    const a = m.from[v.key], b = m.target[v.key];
    values[v.key] = a + (b - a) * p;
    display[v.key] = Math.round(a + (b - a) * Math.min(1, Math.max(0, p)));
    emphasis[v.key] = v.key === m.key ? (reduced ? 1 : Math.min(1, dt / 0.15)) : 0;
  });
  return { values, display, emphasis };
}

export default function SpacingTuner({ autoPlay = true, time, interactive = false, reducedMotion, speed = 1, style }: SpacingTunerProps) {
  const reduced = useReducedMotion(reducedMotion);
  const rootRef = useRef<View>(null);
  const onScreen = useOnScreen(rootRef);
  const [manual, setManual] = useState<Manual | null>(null);
  const [now, setNow] = useState(0);
  const loopT = useClock(time === undefined && autoPlay && !manual && !reduced && onScreen, speed);
  const [scale, setScale] = useState(0);

  // Drive re-renders while a manual spring settles.
  useEffect(() => {
    if (!manual) return;
    let raf = 0;
    const tick = (n: number) => { setNow(n); if (n - manual.at < 1200) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [manual]);

  const shown = time ?? (reduced ? REDUCED_HOLD_S : loopT);
  const frame = manual ? manualFrame(manual, now || manual.at, reduced) : frameAt(shown, false);
  const scene = useMemo(() => computeScene(frame.values), [frame.values]);

  const onPress = (key: VarKey) => {
    if (!interactive) return;
    const v = VARIABLES.find((x) => x.key === key)!;
    const from = { ...frame.values };
    const target = manual ? { ...manual.target } : { ...frame.values };
    if (!manual) VARIABLES.forEach((x) => { target[x.key] = Math.abs(frame.values[x.key] - x.to) < Math.abs(frame.values[x.key] - x.from) ? x.to : x.from; });
    target[key] = Math.abs(target[key] - v.to) < 0.5 ? v.from : v.to;
    const at = typeof performance !== 'undefined' ? performance.now() : Date.now();
    setManual({ key, target, from, at });
    setNow(at);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const s = Math.min(width / STAGE.width, height > 0 ? height / STAGE.height : Infinity);
    if (Number.isFinite(s) && s > 0) setScale(s);
  };

  const { S, C } = scene;
  return (
    <View ref={rootRef} style={[{ width: '100%', aspectRatio: STAGE.width / STAGE.height, backgroundColor: COLORS.page, overflow: 'hidden' }, style]} onLayout={onLayout}>
      {scale > 0 && (
        <View
          style={{
            ...abs, left: '50%', top: '50%', width: STAGE.width, height: STAGE.height,
            marginLeft: -STAGE.width / 2, marginTop: -STAGE.height / 2,
            transform: [{ scale }],
          }}
        >
          {/* Window */}
          <View
            style={{
              ...abs, left: WINDOW.x, top: WINDOW.y, width: WINDOW.width, height: WINDOW.height,
              borderWidth: WINDOW.border, borderColor: COLORS.windowBorder, borderRadius: WINDOW.radius,
              backgroundColor: COLORS.window, overflow: 'hidden',
              boxShadow: '0px 18px 40px rgba(0,0,0,0.07)',
            }}
          >
            {/* Sidebar */}
            <Box r={{ x: 0, y: 0, w: S, h: INNER.height }} color={COLORS.sidebar} />
            <Box r={{ x: S - 1, y: 0, w: 1, h: INNER.height }} color={COLORS.sidebarEdge} />
            <Box r={{ x: 20, y: 18, w: 28, h: 28 }} color={COLORS.logo} radius={6} />
            <Box r={{ x: 58, y: 27, w: 72, h: 10 }} color={COLORS.navInk} radius={5} />
            <Box r={{ x: 12, y: 72, w: S - 24, h: 38 }} color={COLORS.navActiveBg} radius={8} />
            {SIZES.navLineW.map((w, i) => {
              const y = 72 + 38 * i;
              const ink = i === 0 ? COLORS.navInkActive : COLORS.navInk;
              return (
                <React.Fragment key={i}>
                  <Box r={{ x: 20, y: y + 10, w: 16, h: 16 }} color={ink} radius={4} />
                  <Box r={{ x: 46, y: y + 13, w, h: 10 }} color={ink} radius={5} />
                </React.Fragment>
              );
            })}
            <Box r={{ x: 20, y: 778, w: 28, h: 28 }} color={COLORS.navInk} radius={14} />
            <Box r={{ x: 58, y: 787, w: 80, h: 10 }} color={COLORS.navInk} radius={5} />

            {/* Header */}
            <Box r={scene.header.title} color={COLORS.dark} radius={8} />
            <Box r={scene.header.lightPill} color={COLORS.pillLight} radius={18} />
            <Box r={scene.header.darkPill} color={COLORS.pillDark} radius={18} />

            {/* Section labels */}
            {scene.sections.map((s, i) => (
              <React.Fragment key={i}>
                <Box r={s.label} color={COLORS.dark} radius={6} />
                <Box r={s.right} color={COLORS.light} radius={5} />
              </React.Fragment>
            ))}

            {/* Stat cards */}
            {scene.stats.map((c) => (
              <React.Fragment key={c.index}>
                <Card r={c} />
                <Box r={{ x: c.x + C, y: c.y + C, w: SIZES.statLabelW[c.index], h: 10 }} color={COLORS.light} radius={5} />
                <Box r={{ x: c.x + C, y: c.y + C + 22, w: SIZES.statValueW[c.index], h: 20 }} color={COLORS.dark} radius={10} />
                {Array.from({ length: 8 }, (_, j) => {
                  const h = SIZES.miniHeights[c.index + j];
                  return <Box key={j} r={{ x: c.x + C + 12 * j, y: c.y + C + SIZES.statInnerH - h, w: 8, h }} color={COLORS.light} radius={2} />;
                })}
              </React.Fragment>
            ))}

            {/* Bar chart card */}
            <Card r={scene.chart} />
            <Box r={{ x: scene.chart.x + C, y: scene.chart.y + C + 9, w: SIZES.chartTitle.w, h: SIZES.chartTitle.h }} color={COLORS.dark} radius={5} />
            <Box r={{ x: scene.chart.x + scene.chart.w - C - SIZES.chartPill.w, y: scene.chart.y + C, w: SIZES.chartPill.w, h: SIZES.chartPill.h }} color={COLORS.pillLight} radius={14} />
            {(() => {
              const inner = scene.chart.w - 2 * C;
              const bw = (inner - 11 * SIZES.chartBarGap) / 12;
              const plotH = scene.chart.h - 2 * C - SIZES.chartPill.h - SIZES.chartHeadGap;
              const bottom = scene.chart.y + scene.chart.h - C;
              return SIZES.chartPct.map((pct, i) => {
                const h = (plotH * pct) / 100;
                return <Box key={i} r={{ x: scene.chart.x + C + i * (bw + SIZES.chartBarGap), y: bottom - h, w: bw, h }} color={COLORS.bar} radius={4} />;
              });
            })()}

            {/* List card */}
            <Card r={scene.list} />
            <Box r={{ x: scene.list.x + C, y: scene.list.y + C, w: SIZES.listTitleW, h: 10 }} color={COLORS.dark} radius={5} />
            {SIZES.listLineW.map((w, i) => {
              const y = scene.list.y + C + 26 + 44 * i;
              return (
                <React.Fragment key={i}>
                  <Box r={{ x: scene.list.x + C, y, w: 28, h: 28 }} color={COLORS.bar} radius={14} />
                  <Box r={{ x: scene.list.x + C + 40, y: y + 9, w, h: 10 }} color={COLORS.light} radius={5} />
                  <Box r={{ x: scene.list.x + scene.list.w - C - 36, y: y + 9, w: 36, h: 10 }} color={COLORS.light} radius={5} />
                </React.Fragment>
              );
            })}

            {/* Overlays */}
            {VARIABLES.map((v) => {
              const e = frame.emphasis[v.key];
              if (e <= 0) return null;
              const fill = withAlpha(v.accent, OVERLAY_ALPHA);
              if (v.key === 'cardPadding') {
                // Padding ring follows the card's rounded corners.
                return [...scene.stats, scene.chart, scene.list].map((r, i) => (
                  <View
                    key={`${v.key}${i}`}
                    pointerEvents="none"
                    style={{
                      ...abs, left: r.x, top: r.y, width: r.w, height: r.h, opacity: e,
                      borderWidth: Math.max(0, C), borderColor: fill, borderRadius: SIZES.cardRadius,
                    }}
                  />
                ));
              }
              return scene.overlays[v.key].map((r, i) => (
                <Box key={`${v.key}${i}`} r={r} color={fill} style={{ opacity: e }} />
              ));
            })}
          </View>

          {/* Chips */}
          <View style={{ ...abs, left: 0, right: 0, top: CHIPS.top, height: CHIPS.height, flexDirection: 'row', justifyContent: 'center', gap: CHIPS.gap }}>
            {VARIABLES.map((v) => {
              const e = frame.emphasis[v.key];
              const Wrapper: React.ElementType = interactive ? Pressable : View;
              return (
                <Wrapper
                  key={v.key}
                  {...(interactive ? { onPress: () => onPress(v.key), accessibilityRole: 'button' } : {})}
                  accessibilityLabel={`${v.label} ${frame.display[v.key]}`}
                  style={{
                    height: CHIPS.height, borderRadius: CHIPS.height / 2, backgroundColor: COLORS.chip,
                    paddingLeft: CHIPS.padL, paddingRight: CHIPS.padR, flexDirection: 'row', alignItems: 'center',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
                    ...(interactive ? { cursor: 'pointer' } : null),
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      ...abs, left: -CHIPS.ring, top: -CHIPS.ring, right: -CHIPS.ring, bottom: -CHIPS.ring,
                      borderRadius: CHIPS.height / 2 + CHIPS.ring, borderWidth: CHIPS.ring, borderColor: v.accent, opacity: e,
                    }}
                  />
                  <VariableIcon kind={v.key} accent={v.accent} />
                  <View style={{ marginLeft: CHIPS.iconGap, flexDirection: 'row' }}>
                    {String(frame.display[v.key]).split('').map((d, i) => (
                      <Text
                        key={i}
                        style={{
                          width: CHIPS.digitW, textAlign: 'center', fontSize: CHIPS.fontSize, lineHeight: 34,
                          color: COLORS.chipText, fontFamily: FONT, fontVariant: ['tabular-nums'], fontWeight: '400',
                        }}
                      >
                        {d}
                      </Text>
                    ))}
                  </View>
                </Wrapper>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
```

### `src/spacing-tuner/index.ts`

```ts
export { default as SpacingTuner } from './SpacingTuner';
export type { SpacingTunerProps } from './SpacingTuner';
export { frameAt, spring, LOOP_S } from './timeline';
export { VARIABLES } from './tokens';
```

### `App.tsx`

```tsx
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SpacingTuner } from './src/spacing-tuner';

export default function App() {
  const { width, height } = useWindowDimensions();
  // Fit the 4:3 stage inside the viewport.
  const w = Math.min(width, (height * 4) / 3);
  return (
    <View style={styles.page}>
      <View style={{ width: w, height: (w * 3) / 4 }}>
        <SpacingTuner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' },
});
```

### `index.ts`

```ts
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
```


## 13. Parity checklist

Check at a 1280x800 viewport (stage scale 0.7407, centred) and at 1440x1080 (1:1) using `time`.

1. **t=0:**
   - Window outer (62, 74) 1316x828; inner (64, 76).
   - Sidebar 64→247; title bar at (268, 106) 176x16; dark pill (1244, 96) 112x36 #181818; light pill (1140, 96) 96x36.
   - Section 1 label (268, 152) 104x12. Stat value bars at x = 280 / 557 / 834 / 1111, y = 210 (absolute stage px).
2. **t=0:**
   - Stat card boxes 257x110 with a 2 px ring outside.
   - Chart card 704 wide, list card 364 wide, gap 20; bottom-row top 330, bottom 879.
   - Chart bar 12 height 449 px, bars bottom at 868.
3. **t=8.0 (all after):**
   - Title at (352, 126); section 1 label y = 200; stat value bars x = 376 / 625 / 874 / 1123, y = 270.
   - Section 2 label y = 406; chart 632 wide, list 340 wide, gap 12.
   - Chart bar 12 height ≈ 314 px; bars bottom 836.
4. **Counts:** 6 nav rows (row 0 active); 4 stat cards × 8 mini bars; 12 chart bars; 6 list rows (avatar + 1 line + value bar); 5 chips; no text besides the chip numbers.
5. **Chips at t=0:** 184 · 20 · 20 · 20 · 12. **At t=8:** 248 · 40 · 48 · 12 · 24. Chip row centred; first chip starts at x ≈ 341, height 58, gap 24.
6. **Overlay colour over white** = accent at 0.32: blue band ≈ #C2DAF9, purple ≈ #E0D0F8, green ≈ #B9E7D3, orange ≈ #F9D8B8; pink over #FAFAFA ≈ #F7C3D8.
7. **Overlay and ring opacity:** 0 at t=0.80, 1 at 0.95, 1 until 1.80, 0 at 2.05. Same shape at 2.10 / 3.40 / 4.70 / 6.00.
8. **Value starts:** 1.00 / 2.30 / 3.60 / 4.90 / 6.20. The spring is mass 1, stiffness 202, damping 21.35. Half-travel is +0.103 s (1.103, 2.403, 3.703, 5.003, 6.303, revert 9.203). The sidebar chip reads 248 at 1.250 s and not before. Peak overshoot is 2.80% at +0.335 s (+1.8 px on the 64 px sidebar move, rounding to +2 px) and the edge is settled from 1.480 s.
   - Sidebar chip at t=1.15 is 231. The reference video shows 234 at that sample.
9. **Rest 7.25–9.10:** no overlays or rings. **Revert starts at 9.10**, all five together. Chips at t=9.20 are 217 / 30 / 35 / 16 / 18; at 9.33 they are 186 / 21 / 21 / 20 / 12 (the sidebar chip is 186 here, not 184 — 184 returns once the spring is inside half a pixel of the target).
10. **The layout overshoots on revert** by the same 2.8% (sidebar briefly about 182 at the peak, t≈9.43), but the chip stays clamped at 184 once the rounded value gets there.
11. **Loop:** t=10 renders identically to t=0; there's no jump on wrap during autoplay.
12. **Padding overlay** is 4 bands of thickness P around x ≥ S. **Row-gap overlay** is 2 bands of height R spanning Wc. **Column-gap overlay** is 4 vertical gaps. **Card-padding overlay** is 6 rounded rings of thickness C.
13. **Active chip:** 3 px accent ring outside the chip at the overlay's opacity; fill stays white.
14. **`interactive` off:** chips aren't buttons. **`interactive` on:** pressing the row-gap chip makes it read 48 after about 0.5 s and stops the loop; pressing again returns it to 20.
15. **Reduced motion:** the clock is stopped and the stage holds t = 7.5 s (248 / 40 / 48 / 12 / 24, no overlays). It does not step through the five phases.
16. **The web export builds** and runs with no console errors; `tsc --noEmit` passes under strict.
