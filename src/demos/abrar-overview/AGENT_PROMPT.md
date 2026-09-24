# AGENT_PROMPT — Abrar influencer Overview (closed network)

This prompt matches build SHA `5a7e3b30f316185e405f8a56817d1f6d297bbb22`.

You are rebuilding the Abrar influencer Overview dashboard from scratch in Palantir Code Workspace. Assume the network is unavailable. Do not browse, fetch, or open any website. Do not instruct anyone to visit X, cal.com, grok.me, or any other URL. Every layout value, colour, label, KPI, chart recipe, icon name, and code pattern you need is inlined below. Do not invent UI or numbers past what is specified here. Do not rely on any source tree being present on disk — implement from this prompt alone.

## Mission and scope

Build **one** light-mode desktop Overview screen with a fixed left sidebar. This is a dense creator-marketing dashboard. Expo web targets a wide canvas; there is no phone or tablet reflow.

**Build:** Overview main + sidebar only.

**Do not build:** dark "Lumen" analytics, secondary light analytics variants, Influencify shell, Cal.com booking UI, any other route or screen. Non-Overview sidebar items are pressable, show the pressed state, and stay on Overview.

Project root is the folder containing `app.json`. All values needed to rebuild are inlined in this prompt (including full `src/theme.ts` and `src/data/overview.ts` appendices).

## Stack (locked)

- Expo + React Native + TypeScript (RN Web for gates).
- Drawing: `react-native-svg` only. **No** `@shopify/react-native-skia`, **no** `LoadSkiaWeb`, **no** Reanimated.
- Font: Inter via `@expo-google-fonts/inter` (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`) + `useFonts`; hold splash until loaded. Icons: `@expo/vector-icons` Ionicons.
- Single screen: plain `App.tsx` (or one expo-router route). No nav stack.
- Data: one `src/data/overview.ts` of constants. Flag inferred fields in comments.
- Layout: target **1440×900**, **minWidth 1280**. Outer horizontal `ScrollView` so widths under 1280 scroll, not reflow. Sidebar width **240**. Main = inset white panel, radius 16, 1px border `#EAEAEC`, inset 8 from top/right/bottom (and left — code uses margin 8 on all four sides).

## Colours (`src/theme.ts`)

```
page #F4F4F5 · text #111111 · nav #374151 · secondary #6B7280 · muted #9CA3AF
panelBorder #EAEAEC · cardBorder #EDEDEF · grey100 #F3F4F6 · grey200 #E5E7EB · grey300 #D1D5DB
white #FFFFFF · navy #1E3A8A · green #15803D · greenDot #16A34A · red #DC2626 · redDot #EF4444
orange #E9A566 · orangeDeep #E08A3C · blue #2F5DA8 · teal #2A9D8F · purple #8B7FE0 · pink #F27A86
tileBlue #3B6FD6 · tileOrange #E39B4A · headerStrip #F6F6F7 · legend #F9FAFB · black #111111
workspaceBlue #3B82F6   ← workspace switcher mark tile (literal in Sidebar styles; not a `colors.*` key in theme.ts)
```

Cards: white, 1px `#EDEDEF`, radius 12, soft shadow `0px 1px 2px rgba(0,0,0,0.04)`. No glass, no dark mode, no gradients except Finish-setup sky art.

## Typography

Inter only. Near-black primary; secondary `#6B7280`; muted section labels `#9CA3AF` at 12/500, sentence case (`Essentials`, `Work`, `Measure`, `Account`). Big KPI/action values 24/600; body nav 13/500; active nav 13/600.

## Motion / press (only feedback)

Nothing animates. No mount fades, stagger, count-up, bar grow-in, hex pop-in, or progress-ring sweep. Plain `Pressable` style callbacks.

- While pressed: **instant** style swap. Rows/chips → grey-100 fill (or one step darker than rest). Black pills (Connect, Next, Add funds) → opacity 0.85.
- On release: instant revert. No scale, no ripple (`android_ripple` off), no hover styles. Web `cursor: pointer` is fine.
- Filter chips: active white chip moves instantly; page numbers stay locked. Needs-action red 6px dot is static.
- Work chevron: default expanded; press toggles children and flips chevron instantly (no height/rotate tween). Measure/Account chevrons are static up (expanded).
- Connect / Skip / Next / View full report / switcher collapse: press then no-op stub. Setup "2 of 4" never changes.

## Sidebar (width 240, bg = page grey, no divider line to main)

1. Workspace switcher: **WorkspaceMark** (not a photo/initials avatar) — 32×32 tile, `borderRadius` 8, fill `#3B82F6`, centred white glyph = a `View` 14×10 with `borderRadius` 3 and `backgroundColor` white (rounded rectangle; not SVG, not an Ionicon) + **Creator** / **Brand workspace** (unblurred) + collapse control (press = no-op). Collapse is **not** an Ionicon: a 15×15 rounded square (`borderRadius` 3, `borderWidth` 1.5, `borderColor` nav `#374151`) with a left bar `width` 5, same nav colour at opacity 0.35.
2. Search: height 36, radius 8, grey-200 fill, `search-outline` size **15** colour muted `#9CA3AF` + "Search", trailing `/` key chip (white, 1px border).
3. **Essentials:** Overview (ACTIVE = white pill, radius 8, faint shadow `0px 1px 2px rgba(0,0,0,0.06)`, text 600), Messages + badge **3** (navy `#1E3A8A` filled circle, white 11/600), AI agent (`sparkles-outline`; label casing "AI agent").
4. **Work** (chevron up = expanded): Discover, Campaigns, Matching, Outreach. Groups separated by 1px hairline dividers. Measure and Account also show up-chevron (static).
5. **Measure:** **Performances** (source spelling).
6. **Account:** Creators trailing count **49** (grey 12), Brand settings.
7. Nav items: height 32, icon **16** outline Ionicons, text 13/500, gap 8, colour nav `#374151` (active → text `#111111`); inactive has no fill.
8. **Finish setup** card (pinned above footer): white radius 12; top art height **96** soft sky/cloud gradient (see Finish-setup sky art below) with centered white circle GA bars glyph + black **Connect** pill; body "Finish setup" 14/600, "Connect Google Analytics for web conversions." 12 grey; row: progress ring + **2 of 4** left, **Skip** + black **Next** right.
9. Footer: Appearance (`sunny-outline`), Help & support (`help-circle-outline`).
10. Profile: round **Image** avatar from bundled asset `assets/maria-bell.png` (see Profile avatar below), **Maria Bell** 13/600, **Plan & billing** 12 grey, vertical `ellipsis-vertical` size 16 colour muted.

## Ionicons catalog (verbatim from code)

Size and colour are exactly what the code passes to `<Ionicons … />`. Where colour follows active/inactive state, both are listed. Custom (non-Ionicon) marks are noted.

| Location | Label | Icon name | Size | Colour |
|----------|-------|-----------|------|--------|
| Sidebar · Essentials | Overview | `grid-outline` | 16 | active `#111111` (`colors.text`); inactive `#374151` (`colors.nav`) |
| Sidebar · Essentials | Messages | `chatbubble-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Essentials | AI agent | `sparkles-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Work | Discover | `compass-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Work | Campaigns | `megaphone-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Work | Matching | `people-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Work | Outreach | `paper-plane-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Measure | Performances | `bar-chart-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Account | Creators | `person-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · Account | Brand settings | `options-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · footer | Appearance | `sunny-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · footer | Help & support | `help-circle-outline` | 16 | `#374151` (`colors.nav`) |
| Sidebar · search | Search | `search-outline` | 15 | `#9CA3AF` (`colors.muted`) |
| Sidebar · Work header | Work chevron | `chevron-up` (open) / `chevron-down` (closed) | 14 | `#9CA3AF` (`colors.muted`) |
| Sidebar · Measure header | Measure chevron | `chevron-up` | 14 | `#9CA3AF` (`colors.muted`) |
| Sidebar · Account header | Account chevron | `chevron-up` | 14 | `#9CA3AF` (`colors.muted`) |
| Sidebar · profile | overflow menu | `ellipsis-vertical` | 16 | `#9CA3AF` (`colors.muted`) |
| Sidebar · workspace switcher | collapse | *(not Ionicons — custom Views; see Sidebar §1)* | — | — |
| Sidebar · workspace switcher | WorkspaceMark | *(not Ionicons — blue tile + white rect glyph; see Workspace mark)* | — | — |
| Main · header title | Overview | `grid-outline` | 16 | `#111111` (`colors.text`) |
| Main · header button | Refresh | `refresh-outline` | 16 | `#374151` (`colors.nav`) |
| Main · header button | Share | `share-outline` | 16 | `#374151` (`colors.nav`) |
| Main · filter | Last 30 days | `calendar-outline` | 14 | `#374151` (`colors.nav`) |
| Action card tile | Available to spend | `wallet-outline` | 14 | `#FFFFFF` (`colors.white`) on tile `#3B6FD6` |
| Action card tile | Content awaiting approval | `image-outline` | 14 | `#FFFFFF` (`colors.white`) on tile `#E39B4A` |
| Action card tile | Applications to review | `people-outline` | 14 | `#FFFFFF` (`colors.white`) on tile `#2A9D8F` |
| KPI card header | Attributed revenue | `trending-up-outline` | 14 | `#6B7280` (`colors.secondary`) |
| KPI card header | Return on spend | `swap-horizontal-outline` | 14 | `#6B7280` (`colors.secondary`) |
| KPI card header | Live posts | `radio-outline` | 14 | `#6B7280` (`colors.secondary`) |
| KPI card header | Cost per post | `pricetag-outline` | 14 | `#6B7280` (`colors.secondary`) |

## Workspace mark

Confirmed from `Sidebar.tsx` styles (literal `#3B82F6`, not in `colors` object):

- **Tile colour:** `#3B82F6`
- **Size:** 32 × 32
- **Border radius:** 8
- **White glyph:** a plain `View` (not SVG path, not Ionicon) — width **14**, height **10**, `borderRadius` **3**, `backgroundColor` `colors.white` (`#FFFFFF`). Centred in the tile via `alignItems: 'center'` / `justifyContent: 'center'`.

Component + styles (verbatim from `Sidebar.tsx`):

```tsx
function WorkspaceMark() {
  return (
    <View style={styles.workspaceMark}>
      <View style={styles.workspaceGlyph} />
    </View>
  );
}

// styles (from StyleSheet.create in Sidebar.tsx):
workspaceMark: {
  width: 32,
  height: 32,
  borderRadius: 8,
  backgroundColor: '#3B82F6',
  alignItems: 'center',
  justifyContent: 'center',
},
workspaceGlyph: {
  width: 14,
  height: 10,
  borderRadius: 3,
  backgroundColor: colors.white,
},
```

## Finish-setup card sky art

Container `setupArt` height **96**. SVG fills it with `viewBox="0 0 216 96"` and `preserveAspectRatio="none"`.

### Gradient

- `LinearGradient` id `setupSky`
- **Direction:** `x1="0" y1="1" x2="1" y2="0"` (bottom-left → top-right)
- **Stops:**
  - `offset="0"` → `#F8D2A8`
  - `offset="0.48"` → `#F6E6D4`
  - `offset="1"` → `#D5E4F6`
- Full-bleed `<Rect x="0" y="0" width="216" height="96" fill="url(#setupSky)" />`

### Cloud shapes (ellipses only — no SVG path `d` strings in code)

| Shape | cx | cy | rx | ry | fill | opacity |
|-------|----|----|----|----|------|----------|
| Ellipse | 54 | 38 | 36 | 14 | `#FFFFFF` | 0.78 |
| Ellipse | 78 | 34 | 22 | 12 | `#FFFFFF` | 0.55 |
| Ellipse | 158 | 42 | 30 | 13 | `#FFFFFF` | 0.7 |
| Ellipse | 132 | 30 | 16 | 8 | `#FFFFFF` | 0.45 |

### GA bars glyph (overlaid, centred)

- White circle `gaCircle`: 36 × 36, `borderRadius` 18, `backgroundColor` white.
- Three vertical bars (`colors.orange` `#E9A566`): each width 4, `borderRadius` 1; heights **8**, **14**, **11**; row `alignItems: 'flex-end'`, gap 2, container height 14.
- Black **Connect** pill absolutely positioned `bottom: 8`.

### Progress ring (`SetupRing`)

- **Size:** 16 × 16 SVG
- **Stroke width:** 2
- **Radius:** `r = (size - stroke) / 2` → 7
- **Circumference:** `c = 2 * Math.PI * r`
- **Progress:** `sidebar.setupStep / sidebar.setupTotal` → **2 / 4 = 0.5**
- **Dash:** `dash = c * progress`; `strokeDasharray={\`${dash} ${c - dash}\`}`
- **Track colour:** `colors.grey200` (`#E5E7EB`)
- **Progress colour:** `colors.text` (`#111111`)
- **Cap:** `strokeLinecap="round"`
- **Rotation:** `transform={\`rotate(-90 ${size/2} ${size/2})\`}` so the arc starts at 12 o’clock
- Label beside ring: **`2 of 4`** (from `sidebar.setupStep` / `sidebar.setupTotal`)

Sky SVG + ring (verbatim from `Sidebar.tsx`):

```tsx
<Svg width="100%" height="100%" viewBox="0 0 216 96" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
  <Defs>
    <LinearGradient id="setupSky" x1="0" y1="1" x2="1" y2="0">
      <Stop offset="0" stopColor="#F8D2A8" />
      <Stop offset="0.48" stopColor="#F6E6D4" />
      <Stop offset="1" stopColor="#D5E4F6" />
    </LinearGradient>
  </Defs>
  <Rect x="0" y="0" width="216" height="96" fill="url(#setupSky)" />
  <Ellipse cx="54" cy="38" rx="36" ry="14" fill="#FFFFFF" opacity={0.78} />
  <Ellipse cx="78" cy="34" rx="22" ry="12" fill="#FFFFFF" opacity={0.55} />
  <Ellipse cx="158" cy="42" rx="30" ry="13" fill="#FFFFFF" opacity={0.7} />
  <Ellipse cx="132" cy="30" rx="16" ry="8" fill="#FFFFFF" opacity={0.45} />
</Svg>
{/* Overlaid centred on setupArt (height 96): */}
{/* gaCircle: 36×36, borderRadius 18, backgroundColor white; contains gaBars */}
{/* gaBars: row, align flex-end, gap 2, height 14 */}
{/* gaBar: width 4, borderRadius 1, backgroundColor colors.orange (#E9A566); heights 8, 14, 11 */}
{/* Connect pill absolute bottom 8: black pill "Connect" */}

function SetupRing() {
  const size = 16;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = sidebar.setupStep / sidebar.setupTotal;
  const dash = c * progress;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.grey200} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={colors.text}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}
```

## Profile avatar treatment

From `Sidebar.tsx` profile row — what the code actually does:

- **Element:** `<Image source={require('../../assets/maria-bell.png')} style={styles.avatar} />`
- **Size:** 32 × 32
- **Shape:** circle — `borderRadius: 16`
- **Fill / image:** raster image asset `assets/maria-bell.png` (bundled photo). **No initials** are drawn in code.
- **Fallback fill behind image:** `backgroundColor: colors.grey200` (`#E5E7EB`)
- **Border:** none — the avatar style sets no `borderWidth` / `borderColor`.
- Beside it: name **Maria Bell** 13/600, subtitle **Plan & billing** 12 secondary, trailing `ellipsis-vertical` 16 muted.

For a closed-network rebuild, ship an equivalent `assets/maria-bell.png` (or the same bytes) and `require` it the same way. Do not substitute initials unless you lack the asset and document that deviation.

## Main — header & filters

- Title: `grid-outline` 16 + **Overview** 16/600. Right: two 32px outline icon buttons (`refresh-outline`, `share-outline`, each icon 16 colour nav).
- Filter row: **Last 30 days** pill with `calendar-outline` 14 | segmented chips **All campaigns** (ACTIVE: white, 1px border, 600) / **Active** / **Needs action** + red 6px dot. Chips height 28, radius 8, grey-100 track.

## Action cards (3 equal columns)

Header: small coloured icon tile (26×26, radius 7) + white Ionicon 14 + label 13/500; body big value 24/600 + unit 12 grey + note.

| Card | Tile | Icon | Value | Note | Action |
|------|------|------|-------|------|--------|
| Available to spend | blue `#3B6FD6` | `wallet-outline` | **$14.00** | Covers 0 of 22 pending approvals. | black **Add funds** |
| Content awaiting approval | orange `#E39B4A` | `image-outline` | **07** assets | 2 are due to post today | outline **Open queue** |
| Applications to review | teal `#2A9D8F` | `people-outline` | **22** creators | 4 have waited more than 3 days | outline **Open queue** |

## Performance KPIs (section label "Performance" 14/600; 4 equal tiles)

Tile = grey header strip (icon 14 secondary + label) over white body; value 24/600; delta row: 12px filled circle mark + coloured delta left, grey "vs …" baseline right when present.

| KPI | Header icon | Value | Delta | Baseline |
|-----|-------------|-------|-------|----------|
| Attributed revenue | `trending-up-outline` | **$18,420** | **+34%** green up | **none** |
| Return on spend | `swap-horizontal-outline` | **2.7×** | **−0.4** red down | **vs 3.1×** |
| Live posts | `radio-outline` | **59** | **+1** green up | **vs 58** |
| Cost per post | `pricetag-outline` | **$142** | **No change** grey minus | none |

**Inferred:** label "Cost per post" (truncated in every crop) — flag in a comment. Do not invent a baseline for Attributed revenue or Cost per post.

## Charts row (hex card flex ~55 / revenue card ~45, equal height)

### Hex / attributed revenue card

- Label "Attributed revenue", total **$6,750** 24/600, "View full report →" top-right (press stub).
- Hex cluster ~**70%** of card width (`DISPLAY_SCALE ≈ 0.75`). Pointy-top hex grid; empty cells **grey-200**; filled: blue `#2F5DA8`, orange `#E9A566`, teal `#2A9D8F`, purple `#8B7FE0`. Blue majority, orange right lobe, teal/purple core. Grey cells form a ~two-cell halo. One `<Path>` per colour (batch all subpaths of that fill).
- Row map (`.` = outside / not drawn, `g` = empty grey, `B/O/T/P` = fills):

```
........gggggg.........
......gggggggggg.......
....gggggBBBBggggg.....
...ggggBBBBBBBBgggg....
..gggBBBBBBOPOOBOggg...
.gggBBBBBBBOOOOOBBgg...
.ggBBBBBTTTPOOOOBOggg..
.ggBBBBTTOPPPPOOOBBgg..
..ggBBBTTPPPPPOOOBBgg..
..ggBBBTTTgPPPOOOBgg...
..ggBBTTTPPPTTOOBBgg...
..ggBBBBTTTPTOOBBBgg...
...ggBBBBBBBTTBBBBgg...
...gggBBBBBBBBBBBBgg...
....gggBBBBBBBOBgggg...
.....gggBBBBBBggggg....
......ggggggggggg......
.......gggggggg........
```

- Legend (grey-50 inset, row dividers): swatch + name + % chip + amount + up/down circle:
  - Stir in strength 51% $3,420 up
  - Healthier every day 28% $1,880 up
  - Iron boost Q3 12% $840 down (red)
  - Ambassador program (no % chip) $610 up

### Revenue over time card

- Title "Revenue over time"; **$18,420** + "$614 avg/day" grey.
- Y labels: `$1000` `$750` `$500` `$250` `$0`. X ticks: Jun 6 (day 0), Jul 13 (day 37), Jul 20 (day 44).
- **45** dense columns of stacked small orange squares (`#E9A566`), hairline gaps. Square 4px, gap 1px, pitch 5, 40 row slots. Shortest columns sit near a **$200** floor. Series is a fixed seeded trend + deterministic day noise — **never** `Math.random` at render. Sum of day values = **18420**.
- Locked day series:

```
222, 216, 200, 243, 238, 247, 225, 226, 245, 273, 296, 326, 308, 347, 294, 346,
308, 376, 395, 400, 345, 427, 369, 447, 460, 386, 439, 479, 491, 500, 435, 460,
481, 481, 551, 497, 567, 592, 605, 568, 621, 641, 658, 589, 600
```

- Background: faint **dot grid** via one SVG `<Pattern>` (single circle tiled) + one `<Rect fill="url(#…)">`. All orange squares → one `<Path>` of `M…h…v…h…Z` subpaths. Precompute squares once from the series.

## Table "Campaigns that need you"

Columns: Campaign | Waiting on you | Live posts | Budget used | Revenue. Row height ~56, 1px dividers.

1. **Stir in strength** — tile S teal `#2A9D8F`; Active · day 41; 22 creators / 4 waiting over 5 days; 40 / 12 this week; 96% used (orange bar >90%); $12,180 +18%.
2. **Healthier every day** — tile H pink `#F27A86`; Active · day 189; 4 creators / all within 48h target; 10 / 3 this week; 31% used (green); $4,120 +6%.
3. **Iron boost Q3** — tile I purple `#8B7FE0`; Stalled; waiting / live / budget / revenue all muted **"—"** (cells not visible in source — inferred placeholders).

Budget bar: orange if used > 90%, else green.

## Number conflicts that win

Messages **3** · Creators **49** · label **Performances** · 2 due today · 3 days · +34% · Live posts +1 / vs 58 · $142 "No change" · Attributed revenue no baseline · ROS −0.4 / vs 3.1× · Iron boost cells —.

## App shell sketch

```tsx
// App.tsx — horizontal ScrollView for <1280; fonts via useFonts; page bg #F4F4F5
<ScrollView horizontal /* … */>
  <ScrollView style={{ width: pageWidth, height }}>
    <View style={{ flexDirection: 'row', width: pageWidth, minHeight: height }}>
      <Sidebar />
      <OverviewMain />
    </View>
  </ScrollView>
</ScrollView>
```

## Data file shape (excerpt)

Full file is in Appendix B. Excerpt of locked KPI / sidebar / revenue constants:

```ts
// src/data/overview.ts — all locked numbers live here
export const kpis = [
  { id: 'revenue', label: 'Attributed revenue', value: '$18,420', delta: '+34%', tone: 'up' },
  { id: 'ros', label: 'Return on spend', value: '2.7×', delta: '−0.4', tone: 'down', baseline: 'vs 3.1×' },
  { id: 'live', label: 'Live posts', value: '59', delta: '+1', tone: 'up', baseline: 'vs 58' },
  // INFERRED label — truncated in every crop
  { id: 'cost', label: 'Cost per post', value: '$142', delta: 'No change', tone: 'flat' },
] as const;

export const sidebar = { messagesBadge: 3, creatorsCount: 49, setupStep: 2, setupTotal: 4 } as const;

export const revenueByDay: readonly number[] = [ /* 45 ints above; sum 18420 */ ];
export const REVENUE_SQUARE = 4;
export const REVENUE_GAP = 1;
export const REVENUE_ROWS = 40;
```

## SVG path-building (hex — one Path per colour)

```ts
function hexSubpath(cx: number, cy: number, size: number) {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = (cx + size * Math.cos(angle)).toFixed(2);
    const y = (cy + size * Math.sin(angle)).toFixed(2);
    d += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
  }
  return `${d}Z`;
}
// Group cells by fill key; join subpaths → <Path d={joined} fill={colour} /> once per colour.
```

## SVG revenue bars (one Path + one Pattern)

```tsx
<Defs>
  <Pattern id="revenueDotGrid" width={5} height={5} patternUnits="userSpaceOnUse">
    <Circle cx={2.5} cy={2.5} r={1.15} fill="#D5D5DC" />
  </Pattern>
</Defs>
<Rect width={plotW} height={plotH} fill="url(#revenueDotGrid)" />
<Path d={barPath /* all M x y h4 v4 h-4 Z joined */} fill="#E9A566" />
```

## Pressable pattern

```tsx
<Pressable
  style={({ pressed }) => [
    style,
    variant === 'black' ? { opacity: pressed ? 0.85 : 1 } : pressed ? { backgroundColor: '#F3F4F6' } : null,
  ]}
>
  {children}
</Pressable>
```

## Acceptance checklist

- [ ] Only Overview + sidebar; no Lumen / light-analytics / Influencify / Cal.com screens or routes.
- [ ] 1440 target / 1280 min; horizontal scroll under 1280; no phone stacking.
- [ ] Inter loaded; light mode only; page `#F4F4F5`; main white panel radius 16.
- [ ] Sidebar: Messages badge 3, Performances, Creators 49, Finish setup 2 of 4, Maria Bell; WorkspaceMark `#3B82F6` + white 14×10 glyph; profile Image 32 round from `maria-bell.png`.
- [ ] Action cards: $14.00 / 07 assets / 22 creators with locked notes and CTAs; icons `wallet-outline` / `image-outline` / `people-outline`.
- [ ] KPIs: $18,420 +34% (no baseline); 2.7× −0.4 vs 3.1×; 59 +1 vs 58; $142 No change (Cost per post flagged inferred); header icons as catalogued.
- [ ] Hex: grey-200 empty ring, B/O/T/P cluster, one Path per colour, legend matches locked rows, total $6,750.
- [ ] Revenue: 45 square-stack columns, hairline gaps, near-$200 floor, sum 18420, $614 avg/day, Pattern dot grid, one orange Path.
- [ ] Table three rows; Iron boost metrics all "—"; budget bars colour by >90%.
- [ ] Press = instant grey/opacity swap only; Work chevron snaps; no animation library.
- [ ] All display numbers from `src/data/overview.ts`; no `Math.random` during render.
- [ ] Finish-setup sky gradient stops / ellipses / SetupRing match the sky-art section.

## Forbidden

- No animation, springs, fades, layout transitions, or Reanimated.
- No hover menus or tooltips.
- No invented values, extra KPIs, or routes.
- No `Math.random` at render time.
- No Skia / CanvasKit / `LoadSkiaWeb`.
- No dark mode / Appearance theme switch that changes the product chrome.
- No new grok.me app.
- No out-of-scope screens (Lumen, secondary analytics, Influencify, Cal.com).
- Do not browse or fetch any website while building.
- Do not depend on an on-disk source tree; this prompt is the sole SoT.

## Corrections vs earlier prompt drafts

Fixed where prior wording contradicted SHA `5a7e3b30f316185e405f8a56817d1f6d297bbb22` code:

1. **Workspace mark colour** `#3B82F6` added to the palette block (was missing; only `tileBlue #3B6FD6` was listed).
2. **Workspace switcher** is WorkspaceMark (blue tile + white rounded-rect glyph), not a photo/initials "avatar".
3. **Profile avatar** is an `Image` of `assets/maria-bell.png` (32×32 circle, grey-200 backdrop, **no border**, **no initials**), not an initials glyph.
4. **Collapse control** is custom Views, not an Ionicon.
5. **Search** icon size is **15**, not 16.
6. **Main panel** insets are 8 on all four sides (including left), not only top/right/bottom.
7. Removed dependence on an on-disk reference tree; SHA is recorded for identity only; all rebuild values are inlined.

## Appendix A — full `src/theme.ts`

```ts
export const colors = {
  page: '#F4F4F5',
  text: '#111111',
  nav: '#374151',
  secondary: '#6B7280',
  muted: '#9CA3AF',
  panelBorder: '#EAEAEC',
  cardBorder: '#EDEDEF',
  grey100: '#F3F4F6',
  grey200: '#E5E7EB',
  grey300: '#D1D5DB',
  white: '#FFFFFF',
  navy: '#1E3A8A',
  green: '#15803D',
  greenDot: '#16A34A',
  red: '#DC2626',
  redDot: '#EF4444',
  orange: '#E9A566',
  orangeDeep: '#E08A3C',
  blue: '#2F5DA8',
  teal: '#2A9D8F',
  purple: '#8B7FE0',
  pink: '#F27A86',
  tileBlue: '#3B6FD6',
  tileOrange: '#E39B4A',
  headerStrip: '#F6F6F7',
  legend: '#F9FAFB',
  black: '#111111',
} as const;

export const MIN_PAGE_WIDTH = 1280;
export const TARGET_PAGE_WIDTH = 1440;
export const SIDEBAR_WIDTH = 240;
```

## Appendix B — full `src/data/overview.ts`

```ts
import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IonName = ComponentProps<typeof Ionicons>['name'];

/**
 * DESIGN_LOCK numbers and labels for the Overview screen.
 * Inferred values are marked on the field that introduces them.
 */

export type CampaignFilter = 'all' | 'active' | 'needs';

export const filters: { id: CampaignFilter; label: string; dot?: boolean }[] = [
  { id: 'all', label: 'All campaigns' },
  { id: 'active', label: 'Active' },
  { id: 'needs', label: 'Needs action', dot: true },
];

export const actionCards: {
  id: string;
  label: string;
  icon: IonName;
  tile: string;
  value: string;
  unit: string;
  note: string;
  action: string;
  actionKind: 'black' | 'outline';
}[] = [
  {
    id: 'spend',
    label: 'Available to spend',
    icon: 'wallet-outline',
    tile: '#3B6FD6',
    value: '$14.00',
    unit: '',
    note: 'Covers 0 of 22 pending approvals.',
    action: 'Add funds',
    actionKind: 'black',
  },
  {
    id: 'content',
    label: 'Content awaiting approval',
    icon: 'image-outline',
    tile: '#E39B4A',
    value: '07',
    unit: 'assets',
    note: '2 are due to post today',
    action: 'Open queue',
    actionKind: 'outline',
  },
  {
    id: 'applications',
    label: 'Applications to review',
    icon: 'people-outline',
    tile: '#2A9D8F',
    value: '22',
    unit: 'creators',
    note: '4 have waited more than 3 days',
    action: 'Open queue',
    actionKind: 'outline',
  },
];

export type DeltaTone = 'up' | 'down' | 'flat';

export const kpis: {
  id: string;
  label: string;
  icon: IonName;
  value: string;
  delta: string;
  tone: DeltaTone;
  /** Right-aligned "vs …" baseline. Attributed revenue and Cost per post have none. */
  baseline?: string;
}[] = [
  {
    id: 'revenue',
    label: 'Attributed revenue',
    icon: 'trending-up-outline',
    value: '$18,420',
    delta: '+34%',
    tone: 'up',
  },
  {
    id: 'ros',
    label: 'Return on spend',
    icon: 'swap-horizontal-outline',
    value: '2.7×',
    delta: '−0.4',
    tone: 'down',
    baseline: 'vs 3.1×',
  },
  {
    id: 'live',
    label: 'Live posts',
    icon: 'radio-outline',
    value: '59',
    delta: '+1',
    tone: 'up',
    baseline: 'vs 58',
  },
  {
    id: 'cost',
    // INFERRED: the label is truncated in every source crop.
    // DESIGN_LOCK names "Cost per post" as the only inferred word.
    label: 'Cost per post',
    icon: 'pricetag-outline',
    value: '$142',
    delta: 'No change',
    tone: 'flat',
  },
];

/**
 * Pointy-top hex rows. B blue, O orange, T teal, P purple.
 * g = empty grey-200 cell (DESIGN_LOCK). . = outside the field, not drawn.
 * Grey cells are the two-cell halo around the coloured cluster.
 */
export const hexRows = [
  '........gggggg.........',
  '......gggggggggg.......',
  '....gggggBBBBggggg.....',
  '...ggggBBBBBBBBgggg....',
  '..gggBBBBBBOPOOBOggg...',
  '.gggBBBBBBBOOOOOBBgg...',
  '.ggBBBBBTTTPOOOOBOggg..',
  '.ggBBBBTTOPPPPOOOBBgg..',
  '..ggBBBTTPPPPPOOOBBgg..',
  '..ggBBBTTTgPPPOOOBgg...',
  '..ggBBTTTPPPTTOOBBgg...',
  '..ggBBBBTTTPTOOBBBgg...',
  '...ggBBBBBBBTTBBBBgg...',
  '...gggBBBBBBBBBBBBgg...',
  '....gggBBBBBBBOBgggg...',
  '.....gggBBBBBBggggg....',
  '......ggggggggggg......',
  '.......gggggggg........',
];

export const hexLegend = [
  { name: 'Stir in strength', swatch: 'B' as const, percent: '51%', amount: '$3,420', direction: 'up' as const },
  { name: 'Healthier every day', swatch: 'O' as const, percent: '28%', amount: '$1,880', direction: 'up' as const },
  { name: 'Iron boost Q3', swatch: 'T' as const, percent: '12%', amount: '$840', direction: 'down' as const },
  // No percent chip — DESIGN_LOCK.
  { name: 'Ambassador program', swatch: 'P' as const, percent: null, amount: '$610', direction: 'up' as const },
];

export const hexTotal = '$6,750';

/**
 * Daily bar heights for Jun 6 through Jul 20 (45 columns).
 * Locked labels stay $18,420 and $614 avg/day. Day amounts are not printed
 * in the source, so this fixed series — built from a seeded trend plus
 * day-to-day noise, not Math.random at render — sums to 18420 and rises
 * from early June into late July. The same noise is scaled around a $200
 * floor so the shortest columns sit near that axis line.
 */
export const revenueByDay: readonly number[] = [
  222, 216, 200, 243, 238, 247, 225, 226, 245, 273, 296, 326, 308, 347, 294, 346,
  308, 376, 395, 400, 345, 427, 369, 447, 460, 386, 439, 479, 491, 500, 435, 460,
  481, 481, 551, 497, 567, 592, 605, 568, 621, 641, 658, 589, 600,
];

/** Only the tick labels that are legible in root-2 / root-card. */
export const revenueXTicks: { label: string; day: number }[] = [
  { label: 'Jun 6', day: 0 },
  { label: 'Jul 13', day: 37 },
  { label: 'Jul 20', day: 44 },
];
export const revenueYLabels = ['$1000', '$750', '$500', '$250', '$0'] as const;

/** Square fills about 80% of its cell; the remaining gap is a hairline between columns. */
export const REVENUE_SQUARE = 4;
export const REVENUE_GAP = 1;
export const REVENUE_PITCH = REVENUE_SQUARE + REVENUE_GAP;
export const REVENUE_ROWS = 40;

export type RevenueSquare = { x: number; y: number };

/** Precomputed once from the locked series. Not rebuilt during render. */
export const revenueSquares: RevenueSquare[] = revenueByDay.flatMap((value, day) => {
  const count = Math.max(1, Math.round((value / 1000) * REVENUE_ROWS));
  const squares: RevenueSquare[] = [];
  for (let i = 0; i < count; i += 1) {
    squares.push({
      x: day * REVENUE_PITCH + REVENUE_GAP / 2,
      y: (REVENUE_ROWS - 1 - i) * REVENUE_PITCH + REVENUE_GAP / 2,
    });
  }
  return squares;
});

export const revenuePlotWidth = revenueByDay.length * REVENUE_PITCH;
export const revenuePlotHeight = REVENUE_ROWS * REVENUE_PITCH;

export type CampaignRow = {
  id: string;
  letter: string;
  tile: string;
  name: string;
  status: string;
  statusTone: 'active' | 'stalled';
  waitingCount: string;
  waitingNote: string;
  livePosts: string;
  liveNote: string;
  budgetUsed: number | null;
  revenue: string;
  /** Legible crop delta. Iron boost has none. */
  revenueDelta: string | null;
};

export const campaigns: CampaignRow[] = [
  {
    id: 'stir',
    letter: 'S',
    tile: '#2A9D8F',
    name: 'Stir in strength',
    status: 'Active · day 41',
    statusTone: 'active',
    waitingCount: '22 creators',
    waitingNote: '4 waiting over 5 days',
    livePosts: '40',
    liveNote: '12 this week',
    budgetUsed: 96,
    revenue: '$12,180',
    revenueDelta: '+18%',
  },
  {
    id: 'healthier',
    letter: 'H',
    tile: '#F27A86',
    name: 'Healthier every day',
    status: 'Active · day 189',
    statusTone: 'active',
    waitingCount: '4 creators',
    waitingNote: 'all within 48h target',
    livePosts: '10',
    liveNote: '3 this week',
    budgetUsed: 31,
    revenue: '$4,120',
    // Legible in the root-2 crop (DESIGN_LOCK: use the delta that can be read).
    revenueDelta: '+6%',
  },
  {
    id: 'iron',
    letter: 'I',
    tile: '#8B7FE0',
    name: 'Iron boost Q3',
    status: 'Stalled',
    statusTone: 'stalled',
    // INFERRED: metric cells are not visible in the source. Muted em dashes.
    waitingCount: '—',
    waitingNote: '',
    livePosts: '—',
    liveNote: '',
    budgetUsed: null,
    revenue: '—',
    revenueDelta: null,
  },
];

export const sidebar = {
  workspace: 'Creator',
  workspaceSub: 'Brand workspace',
  messagesBadge: 3,
  creatorsCount: 49,
  setupStep: 2,
  setupTotal: 4,
} as const;
```
