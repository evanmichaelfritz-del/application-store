---
name: spacing-audit
description: Audit and fix spacing in any UI (dashboards, admin panels, settings screens, marketing pages, mobile screens) using five spacing variables. Use when a layout "feels off", cramped, cluttered or unbalanced but nothing is obviously broken; when reviewing a screen before it ships; when tuning density; or when someone asks to "fix the spacing", "make it breathe" or "make it look more polished".
---

# Spacing audit

> Based on a spacing demo by @MichaelFilipiuk: "If the app feels off but you're not sure why, it's probably the spacing."

**Source labels.** Each rule below is marked with where it comes from:
- **[demo]** shown in the author's demo video.
- **[author]** said by the author in the thread.
- **[standard practice]** general design convention that the source does **not** state.

## The five variables [demo]

Nearly every app layout comes down to five spacing numbers. Find each one before you change anything.

| # | Variable | What it is | Where to look |
|---|---|---|---|
| 1 | **Sidebar width** | Width of the fixed navigation column. | The sidebar/nav container's `width` / `flex-basis` / grid column. |
| 2 | **Outer padding** | Space between the main content and the edges of its area (the sidebar edge and the window edges). | `padding` on the main/content wrapper. |
| 3 | **Row gap** | Vertical space between stacked blocks (header → section, section → section). | `gap` / `row-gap` on the vertical stack, or `margin-top` / `margin-bottom` between sections. |
| 4 | **Column gap** | Horizontal space between side-by-side cards. | `gap` / `column-gap` on the card row or grid. |
| 5 | **Card padding** | Space inside each card, between its edge and its content. | `padding` on the card component. |

### Worked example: the demo's before → after [demo]

| Variable | Before | After | Change |
|---|---|---|---|
| Sidebar width | 184 | 248 | wider nav (+64) |
| Outer padding | 20 | 40 | doubled |
| Row gap | 20 | 48 | more than doubled |
| Column gap | 20 | 12 | **reduced**: the only one that shrinks |
| Card padding | 12 | 24 | doubled |

The demo starts with every gap at 20 and padding at 12. That's uniform, and it looks flat. The "after" separates the levels:
- Sections get a lot of air (row gap 48).
- Related cards in a row sit closer together (column gap 12).
- Content inside cards and around the page breathes (padding 24 and 40).

## Checklist

Work through this in order. Each step names the variable it tunes.

1. **Inventory [demo].** Write down the current value of all five variables (see "Measuring" below). Note which values are identical. When everything shares one number, that's a common sign of "feels off".
2. **Row gap > column gap [demo].** Vertical space between sections should be clearly bigger than the horizontal gap between cards in the same row. In the demo the ratio goes from 1:1 to 4:1 (48 vs 12). Bigger row gaps make sections read as separate groups. Tighter column gaps make a row of cards read as one group.
3. **Generous card padding [demo].** If content inside a card nearly touches its edges, raise the padding. The demo doubles it, 12 → 24.
4. **Generous outer padding [demo].** Content shouldn't hug the window or sidebar edge. The demo doubles it, 20 → 40.
5. **Sidebar proportion [demo].** A sidebar that's too narrow makes the whole app feel cramped. The demo widens it 184 → 248. Check that nav labels have room and that the sidebar reads as its own zone.
6. **Card padding vs. gaps.** Compare card padding with the gap between cards.
   - In the demo's after state, card padding (24) is about double the column gap (12) **[demo]**.
   - Whether to lock padding and gap to one value is a judgement call. The author says: "eye by eye, at this point i feel like the fewer hard rules the better" **[author]**.
7. **Use a scale [standard practice].** Pick values from a consistent spacing scale. A common choice is an **8-pt scale** (4, 8, 12, 16, 24, 32, 40, 48, 64, with 4 for fine steps). The demo's after values (12, 24, 40, 48, 248) all sit on a 4/8 grid, but the source never prescribes a scale. The author says: "There's no one specific spacing scale to use" **[author]**. Treat the scale as a tool for consistency, not a rule.
8. **Tokens, not one-offs [author].** Put the five values in spacing tokens or constants so they can be tuned together, and a denser or roomier variant is just a different token set. When asked whether this should just be spacing tokens, the author replied: "Yeah it should be, and that's fair."
9. **Change one variable at a time [demo].** The demo changes the variables one after another, never all at once. Do the same, so you can see what each one does.
10. **Judge by eye last [author].** After the numbers, look at the whole screen. If it still feels off, adjust by eye. The source favours eye over hard rules.

## Measuring the current values

**Web (CSS).**
- In DevTools, select the element and read the Computed panel: `width`, `padding-*`, `gap`, `row-gap`, `column-gap`, `margin-*`. The box-model diagram shows padding and margin directly.
- Search the code for the container styles:
  - CSS/Tailwind: `w-`, `p-`, `px-`, `gap-`, `gap-x-`, `gap-y-`, `space-y-`.
  - CSS: `grid-template-columns`, `gap`, `padding`.
  - CSS-in-JS: theme spacing tokens.
- Watch for spacing that comes from margins on children rather than `gap` on the parent, from `space-*` utilities, or from fixed heights. These hide the real row gap.
- Tailwind's default spacing scale is 4 px per unit (`p-6` = 24 px), unless the theme overrides it.

**React Native / Expo.**
- Read the `StyleSheet` values for `width`, `padding*`, `gap`, `rowGap`, `columnGap` and `margin*` on the sidebar, screen wrapper, section stack, card row and card.
- Values are density-independent points.
- Note `flex` basis: with `flex: 1` siblings, a padding change also changes the free space each sibling gets.

**Native (SwiftUI / Compose / Android XML).** Look for `.padding()`, `spacing:` on stacks, `Arrangement.spacedBy()`, `Modifier.padding`, `android:padding` and `layout_margin`.

**Unknown codebase.** Screenshot at a fixed viewport (for example 1280x800 desktop) and measure pixel distances between element edges. Divide by the device pixel ratio.

## Proposing changes

Present a table with the variable, the current value, the proposed value and the reason. Example:

| Variable | Current | Proposed | Why |
|---|---|---|---|
| Row gap | 20 | 48 | Sections run together; separate them more than the cards inside a row. |
| Column gap | 20 | 12 | Related cards should read as one group. |

- Name the exact file and style key you will change for each row.
- Keep the change set to these five variables unless something else is clearly broken.

## Verifying visually

1. Take a **before** screenshot at a fixed viewport (desktop 1280x800 is a good default) and at one narrow width.
2. Apply **one variable at a time**, screenshot after each, and compare side by side. Tinting the changed area while you look (sidebar, padding frame, row gaps, column gaps, card padding rings) makes each change obvious.
3. Check for regressions:
   - text truncation in a wider sidebar or narrower cards;
   - charts and lists that no longer fit their cards;
   - overflow or new scrollbars from bigger padding;
   - wrapped rows at narrow widths.
4. Take an **after** screenshot of the whole screen and compare it with the before. Ask: do the sections read as separate groups, do cards in a row read as one group, and does content stop touching edges?
5. If something still feels off, nudge by eye **[author]** and record the final values as tokens.
