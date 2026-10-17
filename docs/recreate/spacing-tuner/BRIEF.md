# Spacing tuner: behaviour brief

Source tags: **[R]** root post · **[T]** the author's thread replies · **[V]** the video (1440x1080, 10.000 s, 60 fps; `t=` is seconds, `f_NNN` is a 10 fps frame where t = (NNN-1)/10) · **[I]** an implementation choice that isn't visible in the source. There are no linked pages: the post's only link is its own video **[R]**.

## Source
- **Root post** by @MichaelFilipiuk (Michael · Design Partner), 17 Oct 2026, 5:08 AM ET: "Design tip:\n\nIf the app feels off but you're not sure why, it's probably the spacing." **[R]**
- **Author replies** **[T]**:
  - To a question about locking card padding and card gap to one value or tuning each by eye: "eye by eye, at this point i feel like the fewer hard rules the better".
  - To "shouldn't this just be spacing tokens? maybe I want a denser UI": "Yeah it should be, and that's fair. There's no one specific spacing scale to use".

## Scene [V f_001]
- A light grey page (#F3F3F3) with one rounded app window. The window is 1316x828 at (62,74) with a 2px #DCDCDC border and a soft shadow underneath.
- Inside the window:
  - **Sidebar:** logo, brand line, 6 nav rows with the first one active, and a footer avatar plus line.
  - **Header:** a dark title bar, a light pill and a dark #181818 pill. No search box and no avatar.
  - **Section 1:** a label, then 4 stat cards (label bar, value bar, 8-bar mini chart).
  - **Section 2:** a label, then a 12-bar chart card (2/3) and a list card (1/3) with 6 rows of avatar, 1 line and a value bar.
- **Five status chips** sit centred under the window. Each is a white pill with an icon and a number. They aren't controls: there's no cursor and no press state **[V all frames]**.
- The only text in the scene is the chip numbers **[V]**.
- At 1440 px, measured px equal the labelled values (1:1). For example, sidebar 184 → 248 measures +64 px **[V track]**.

## Behaviour [V, 60 fps tracking]
- Five phases, 1.3 s apart, run left to right. Phase k starts at t0 = 0.8 + 1.3k s.
  - The accent overlay and the chip's 3px accent ring fade in linearly over 0.15 s.
  - At t0 + 0.2 the value springs from its before value to its after value, and the chip number counts with it.
  - At t0 + 1.0 the overlay and ring fade out linearly over 0.25 s.

| # | Variable | Chip accent | Before → after | Overlay covers |
|---|---|---|---|---|
| 1 | Sidebar width | #F14E8F | 184 → 248 | the whole sidebar |
| 2 | Outer padding | #3F8CED | 20 → 40 | the padding frame around the main area |
| 3 | Row gap | #A06EE8 | 20 → 48 | header → section 1, and stat cards → section 2 |
| 4 | Column gap | #23B375 | 20 → 12 | the gaps between stat cards, and between chart and list |
| 5 | Card padding | #EC8A28 | 12 → 24 | the padding ring inside all 6 cards |

- **Overlay colour:** the accent at 32% opacity. This fits all five measured overlay colours within 2/255 **[V, fit]**.
- **Motion:** every move is one spring: mass 1, stiffness 200, damping 20 **[V fit over 5 moves and the revert]**. It reaches the target about 0.24 s in, overshoots about 4% at about 0.31 s, and settles by about 0.5 s.
- **Chip numbers:** round(value), clamped so the overshoot never shows **[V t=1.25–1.5: 248 holds]**.
- **Rest:** from 7.25 s, with all after values and no overlays.
- **Revert:** at **9.1 s** all five values spring back together. It's animated, not a snap (for example 245/39/47/12/23 at 9.117 and 204/26/29/17/16 at 9.233). There are no overlays or rings. It settles by about 9.6 s, then holds until 10.0 s, and the loop restarts with a 0.8 s hold **[V]**.
- **Mini charts:** 8 bars at fixed px heights. **Big chart:** 12 bars whose heights are percentages of the plot height, so they shrink as cards get taller **[V states]**.

## Not in the source
- Interactivity is an **optional addition [I]**: pressing a chip toggles that one variable and stops the loop.
- The reduced-motion behaviour, the font family, the shadow parameters and the exact arrow drawing are all **[I]**.
