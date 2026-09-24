# AGENT_PROMPT — Abrar influencer Overview (closed network)

You are rebuilding the Abrar influencer Overview dashboard from scratch in Palantir Code Workspace. Assume the network is unavailable. Do not browse, fetch, or open any website. Do not instruct anyone to visit X, cal.com, grok.me, or any other URL. Every layout value, colour, label, KPI, chart recipe, and code pattern you need is inlined below. Do not invent UI or numbers past what is specified here.

## Mission and scope

Build **one** light-mode desktop Overview screen with a fixed left sidebar. This is a dense creator-marketing dashboard. Expo web targets a wide canvas; there is no phone or tablet reflow.

**Build:** Overview main + sidebar only.

**Do not build:** dark "Lumen" analytics, secondary light analytics variants, Influencify shell, Cal.com booking UI, any other route or screen. Non-Overview sidebar items are pressable, show the pressed state, and stay on Overview.

Project root is the folder containing `app.json`. Reference SoT (if present on disk): `/workspace/recreate-builds/abrar-overview-5a7e3b3` · tree SHA `5a7e3b30f316185e405f8a56817d1f6d297bbb22`. Prefer matching that tree; if absent, implement from this prompt alone.

## Stack (locked)

- Expo + React Native + TypeScript (RN Web for gates).
- Drawing: `react-native-svg` only. **No** `@shopify/react-native-skia`, **no** `LoadSkiaWeb`, **no** Reanimated.
- Font: Inter via `@expo-google-fonts/inter` (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`) + `useFonts`; hold splash until loaded. Icons: `@expo/vector-icons` Ionicons.
- Single screen: plain `App.tsx` (or one expo-router route). No nav stack.
- Data: one `src/data/overview.ts` of constants. Flag inferred fields in comments.
- Layout: target **1440×900**, **minWidth 1280**. Outer horizontal `ScrollView` so widths under 1280 scroll, not reflow. Sidebar width **240**. Main = inset white panel, radius 16, 1px border `#EAEAEC`, inset 8 from top/right/bottom.

## Colours (`src/theme.ts`)

```
page #F4F4F5 · text #111111 · nav #374151 · secondary #6B7280 · muted #9CA3AF
panelBorder #EAEAEC · cardBorder #EDEDEF · grey100 #F3F4F6 · grey200 #E5E7EB · grey300 #D1D5DB
white #FFFFFF · navy #1E3A8A · green #15803D · greenDot #16A34A · red #DC2626 · redDot #EF4444
orange #E9A566 · orangeDeep #E08A3C · blue #2F5DA8 · teal #2A9D8F · purple #8B7FE0 · pink #F27A86
tileBlue #3B6FD6 · tileOrange #E39B4A · headerStrip #F6F6F7 · legend #F9FAFB · black #111111
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

1. Workspace switcher: square rounded avatar + **Creator** / **Brand workspace** (unblurred) + collapse icon (press = no-op).
2. Search: height 36, radius 8, grey-200 fill, magnifier + "Search", trailing `/` key chip (white, 1px border).
3. **Essentials:** Overview (ACTIVE = white pill, radius 8, faint shadow, text 600), Messages + badge **3** (navy `#1E3A8A` filled circle, white 11/600), AI agent (sparkle; label casing "AI agent").
4. **Work** (chevron up = expanded): Discover, Campaigns, Matching, Outreach. Groups separated by 1px hairline dividers. Measure and Account also show up-chevron (static).
5. **Measure:** **Performances** (source spelling).
6. **Account:** Creators trailing count **49** (grey 12), Brand settings.
7. Nav items: height 32, icon 16 outline, text 13/500, gap 8, grey-700; inactive has no fill.
8. **Finish setup** card (pinned above footer): white radius 12; top art ~96 tall soft sky/cloud gradient with centered white circle GA bars glyph + black **Connect** pill; body "Finish setup" 14/600, "Connect Google Analytics for web conversions." 12 grey; row: progress ring + **2 of 4** left, **Skip** + black **Next** right.
9. Footer: Appearance (sun), Help & support (?circle).
10. Profile: round avatar, **Maria Bell** 13/600, **Plan & billing** 12 grey, vertical ⋮.

## Main — header & filters

- Title: grid icon + **Overview** 16/600. Right: two 32px outline icon buttons (refresh, share).
- Filter row: **Last 30 days** pill with calendar icon | segmented chips **All campaigns** (ACTIVE: white, 1px border, 600) / **Active** / **Needs action** + red 6px dot. Chips height 28, radius 8, grey-100 track.

## Action cards (3 equal columns)

Header: small coloured icon tile + label 13/500; body big value 24/600 + unit 12 grey + note.

| Card | Tile | Value | Note | Action |
|------|------|-------|------|--------|
| Available to spend | blue `#3B6FD6` | **$14.00** | Covers 0 of 22 pending approvals. | black **Add funds** |
| Content awaiting approval | orange `#E39B4A` | **07** assets | 2 are due to post today | outline **Open queue** |
| Applications to review | teal `#2A9D8F` | **22** creators | 4 have waited more than 3 days | outline **Open queue** |

## Performance KPIs (section label "Performance" 14/600; 4 equal tiles)

Tile = grey header strip (icon + label) over white body; value 24/600; delta row: 12px filled circle mark + coloured delta left, grey "vs …" baseline right when present.

| KPI | Value | Delta | Baseline |
|-----|-------|-------|----------|
| Attributed revenue | **$18,420** | **+34%** green up | **none** |
| Return on spend | **2.7×** | **−0.4** red down | **vs 3.1×** |
| Live posts | **59** | **+1** green up | **vs 58** |
| Cost per post | **$142** | **No change** grey minus | none |

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
- [ ] Sidebar: Messages badge 3, Performances, Creators 49, Finish setup 2 of 4, Maria Bell.
- [ ] Action cards: $14.00 / 07 assets / 22 creators with locked notes and CTAs.
- [ ] KPIs: $18,420 +34% (no baseline); 2.7× −0.4 vs 3.1×; 59 +1 vs 58; $142 No change (Cost per post flagged inferred).
- [ ] Hex: grey-200 empty ring, B/O/T/P cluster, one Path per colour, legend matches locked rows, total $6,750.
- [ ] Revenue: 45 square-stack columns, hairline gaps, near-$200 floor, sum 18420, $614 avg/day, Pattern dot grid, one orange Path.
- [ ] Table three rows; Iron boost metrics all "—"; budget bars colour by >90%.
- [ ] Press = instant grey/opacity swap only; Work chevron snaps; no animation library.
- [ ] All display numbers from `src/data/overview.ts`; no `Math.random` during render.

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
