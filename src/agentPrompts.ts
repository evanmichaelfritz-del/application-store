import abrarOverviewPrompt from './demos/abrar-overview/AGENT_PROMPT.md';
import { TRANSITIONS } from './catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import { HTML_CSS_ONLY_NOTE, previewDocumentParts } from '@/src/closedNetwork/previewSources';
import { ORB_LOCKS } from '@/src/closedNetwork/orbLocks';

export type PromptState = {
  name: string;
  trigger: string;
  from: string;
  to: string;
  duration: string;
  easing: string;
  delay: string;
};

export type PromptLock = {
  motion: string;
  content?: string;
  states?: readonly PromptState[];
  gotchas?: readonly string[];
  setup?: string;
  checklist?: readonly string[];
  geometry?: string;
  timing?: string;
  reducedMotion?: string;
  knownGaps?: string;
};

const LOCKS: Record<string, PromptLock> = {
  'card-resize': {
    motion:
      '`.t-resize` starts at width 148px and height 100px. Resize writes 88px by 64px, then 148px by 100px. Width and height transition over `--resize-dur: 300ms` with `--resize-ease: cubic-bezier(0.22, 1, 0.36, 1)`.',
    states: [
      {
        name: 'wide',
        trigger: 'Resize while the card is small',
        from: 'width 88px, height 64px',
        to: 'width 148px, height 100px',
        duration: '300ms (`--resize-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--resize-ease`)',
        delay: '',
      },
      {
        name: 'small',
        trigger: 'Resize while the card is wide',
        from: 'width 148px, height 100px',
        to: 'width 88px, height 64px',
        duration: '300ms (`--resize-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
    ],
    gotchas: [
      'Reduced motion sets the transition to none.',
      'The card keeps border-radius 14px and padding 14px. Each bar is height 8px. The short bar is width 62%.',
      'The button label is Resize.',
    ],
    setup:
      '`.t-resize` is width 148px and height 100px, background #fff, border-radius 14px, padding 14px. The Resize button toggles `card.style.width` and `card.style.height` between 148px/100px and 88px/64px.',
    checklist: [
      'Wide is 148px by 100px and small is 88px by 64px.',
      'Both axes use `--resize-dur: 300ms` and `--resize-ease: cubic-bezier(0.22, 1, 0.36, 1)`.',
      'Reduced motion sets the transition to none.',
    ],
  },
  'number-pop-in': {
    motion:
      'Animate advances the set. Each character springs in with mass 4, damping 20, stiffness 280: rotateX from 80deg to 0, opacity from 0 to 1, and blur from 2px to 0. The linear() is sampled from that spring over 3782ms. Delay is 50ms per character. The row also plays when the document loads.',
    content:
      '`6 5. 7 8`, then `1 4. 0 2`, then `9 3. 6 1`. A space is a 6px gap. The dot is the smaller glyph. The label is Animate. The row plays on load, and Animate mounts the next set.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The row is centered, aligned to the end of the line.
- Digit: 42px, line-height 46px, letter-spacing -1px, colour #0d0d0d, weight 600.
- Dot: 32px, margin-bottom 2px. It keeps the 46px line-height.
- Space: width 6px. It still takes the entrance.
- Entrance: perspective 400px, rotateX 80deg, opacity 0, blur 2px.
- Animate: height 28px, padding 0 10px, border-radius 8px, border 1px solid rgba(0, 0, 0, 0.08), background rgba(243, 243, 243, 0.94), colour #17181c, 12px, weight 500. It sits right 10px, bottom 10px. The accessible name is Animate.
- Hover paints the button #d9d9e2 with border rgba(0, 0, 0, 0.35). Pressed paints #b7b7c2 with border rgba(0, 0, 0, 0.5).`,
    timing: `Each character runs one spring, mass 4, damping 20, stiffness 280, from 0 to 1. The linear() is sampled from that spring over 3782ms. \`--digit-dur\` is 3782ms. Character n waits (n - 1) times 50ms. \`--digit-stagger\` is 50ms.

- rotateX = (1 - progress) * 80deg, with perspective 400px.
- opacity = progress, clamped to the 0 to 1 range when progress travels past 1.
- blur = max(0px, (1 - progress) * 2px). The blur does not go negative.

The spring passes the target by about 37%, then settles. 3782ms is when its energy falls through its stop.`,
    reducedMotion:
      'Reduced motion skips the entrance. The characters are upright, opaque, and sharp, and Animate still changes the set. The duration is 0ms.',
    states: [
      {
        name: 'enter',
        trigger: 'the document loads, and each Animate, which mounts the next set',
        from: 'perspective 400px, rotateX 80deg, opacity 0, blur 2px',
        to: 'rotateX 0, opacity 1, blur 0',
        duration: '3782ms',
        easing: 'sampled linear()',
        delay: '50ms times the character index',
      },
      {
        name: 'hover',
        trigger: 'pointer over Animate',
        from: 'background rgba(243, 243, 243, 0.94), border rgba(0, 0, 0, 0.08)',
        to: 'background #d9d9e2, border rgba(0, 0, 0, 0.35)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'pressed',
        trigger: 'pointer down on Animate',
        from: 'the hover paint',
        to: 'background #b7b7c2, border rgba(0, 0, 0, 0.5)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the entrance pose',
        to: 'rotateX 0, opacity 1, blur 0, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The label is Animate, and that is the accessible name. It is a button. The row has no separate accessible name.',
      'Spring mass is 4, damping 20, stiffness 280. The linear() is sampled from that spring.',
      'Progress peaks near 1.37, about 37% past the target, near 400ms. rotateX peaks near 30deg past 0. Opacity clamps at 1 during that overshoot, then shows the later dip under 1. Blur is 0 through the overshoot.',
      'Animate replaces the row. The next set starts at the entrance pose. It does not continue the previous characters, which is how the original mounts each set.',
      'The button is 10px from the stage padding edge. The stage border is 1px, so the button sits 11px from the outer edge.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script writes one character per span and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'The first set is `6 5. 7 8`, then `1 4. 0 2`, then `9 3. 6 1`. A space is 6px wide. The dot is 32px with margin-bottom 2px.',
      'Digits are 42px, line-height 46px, letter-spacing -1px, colour #0d0d0d. The stage is 289px by 200px, radius 14px, background #f9f9f9.',
      'rotateX, opacity, and blur follow the mass 4, damping 20, stiffness 280 spring, played over 3782ms, staggered by 50ms.',
      'The button label is Animate. Hover paints #d9d9e2. Pressed paints #b7b7c2.',
      'Reduced motion shows the settled row and the duration is 0ms.',
    ],
  },
  'notification-badge': {
    motion:
      'Animate toggles the badge. Horizontal position, vertical position, and scale share one spring: mass 0.8, damping 12, stiffness 280. Opacity is a separate 180ms timing. The linear() is sampled from that spring.',
    content:
      'Count `1`. The bell is not a button. The Animate button toggles the badge. The badge starts off, at the lower-left of the bell, and nothing plays when the document loads.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The bell is centered.
- Bell: 40px by 40px. Glyph 28px by 28px, stroke #0d0d0d, stroke-width 1.7px. The second path uses a round cap.
- Badge: top -4px, right -4px, min-width 18px, height 18px, padding 0 4px, border-radius 9px, background #e23d2d, colour #fff, 10px, weight 600.
- Off pose: translate -8.2px 12.4px, scale 0.4, opacity 0.
- Animate: height 28px, padding 0 10px, border-radius 8px, border 1px solid rgba(0, 0, 0, 0.08), background rgba(243, 243, 243, 0.94), colour #17181c, 12px, weight 500. It sits right 10px, bottom 10px.
- Hover paints the button #d9d9e2 with border rgba(0, 0, 0, 0.35). Pressed paints #b7b7c2 with border rgba(0, 0, 0, 0.5).`,
    timing: `The spring and the fade start together when Animate is pressed. There is no delay.

- Position and scale: spring, mass 0.8, damping 12, stiffness 280. On, it runs from 0 to 1. Off, from a rest at 1 back to 0. The Copy plays that curve as linear() over 1242ms. The curve passes the target by about 25%, then settles. 1242ms is when the spring energy falls through its stop and the value snaps to the target.
- Opacity: 180ms, cubic-bezier(0.22, 1, 0.36, 1), from 0 to 1 on the way in and from 1 to 0 on the way out. \`--badge-fade\` is 180ms.

x = -8.2px * (1 - progress). y = 12.4px * (1 - progress). scale = 0.4 + 0.6 * progress.`,
    reducedMotion:
      'Reduced motion skips both curves. Turning the badge on places it at translate 0, scale 1, opacity 1. Turning it off returns the off pose. The duration is 0ms.',
    states: [
      {
        name: 'off',
        trigger: 'Animate, while the badge is on and at rest',
        from: 'translate 0, scale 1, opacity 1',
        to: 'translate -8.2px 12.4px, scale 0.4, opacity 0',
        duration: '1242ms spring, 180ms opacity',
        easing: 'sampled linear(), opacity cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'on',
        trigger: 'Animate, while the badge is off',
        from: 'translate -8.2px 12.4px, scale 0.4, opacity 0',
        to: 'translate 0, scale 1, opacity 1',
        duration: '1242ms spring, 180ms opacity',
        easing: 'sampled linear(), opacity cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'hover',
        trigger: 'pointer over Animate',
        from: 'background rgba(243, 243, 243, 0.94), border rgba(0, 0, 0, 0.08)',
        to: 'background #d9d9e2, border rgba(0, 0, 0, 0.35)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'pressed',
        trigger: 'pointer down on Animate',
        from: 'the hover paint',
        to: 'background #b7b7c2, border rgba(0, 0, 0, 0.5)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the click',
        to: 'the on pose or the off pose, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The bell does not toggle the badge. Only Animate does. The count is the string `1`.',
      'Spring mass is 0.8, damping 12, stiffness 280. The linear() is sampled from that spring.',
      'The spring progress peaks near 1.25, about 25% past the target, near 200ms. Scale peaks near 1.15. x peaks near 2px to the right of the rest point and y peaks above it. Opacity does not overshoot.',
      'The button is 10px from the stage padding edge. The stage border is 1px, so the button sits 11px from the outer edge.',
      'A second click before the spring has rested retargets from the current value. The Copy restarts the sampled curve from the pose it encodes, which matches a toggle that starts at rest.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script toggles `.is-on` and `.is-off` on Animate and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'Before Animate the badge is translate -8.2px 12.4px, scale 0.4, opacity 0. The count is `1` on #e23d2d.',
      'The bell is 40px by 40px and the glyph is 28px, stroke #0d0d0d, stroke-width 1.7px. Clicking the bell does nothing.',
      'On and off, position and scale use the mass 0.8, damping 12, stiffness 280 spring, played over 1242ms. Opacity is 180ms, cubic-bezier(0.22, 1, 0.36, 1).',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Animate is height 28px, right 10px, bottom 10px, label Animate.',
      'Hover paints #d9d9e2. Pressed paints #b7b7c2.',
      'Reduced motion jumps to the target pose and the duration is 0ms.',
    ],
  },
  'text-states-swap': {
    motion:
      '`.t-text-swap` transitions transform, filter, and opacity over `--text-swap-dur: 250ms` with `--text-swap-ease: ease-in-out`. `.is-exit` is `translateY(calc(var(--text-swap-translate-y) * -1))` and `blur(var(--text-swap-blur))`. `.is-enter-start` is `translateY(var(--text-swap-translate-y))` and the same blur. `--text-swap-translate-y` is 4px and `--text-swap-blur` is 2px.',
    content: '`Transaction processing...` then `Transaction completed`.',
    states: [
      {
        name: 'exit',
        trigger: 'Swap adds `.is-exit`',
        from: 'translateY 0, opacity 1, blur 0',
        to: 'translateY(calc(var(--text-swap-translate-y) * -1)), --text-swap-translate-y 4px, opacity 0, blur(2px)',
        duration: '250ms (`--text-swap-dur`)',
        easing: 'ease-in-out (`--text-swap-ease`)',
        delay: '',
      },
      {
        name: 'enter',
        trigger: 'the timeout after the exit, which swaps the string and flashes `.is-enter-start`',
        from: 'translateY(4px), opacity 0, blur(2px)',
        to: 'translateY 0, opacity 1, blur 0',
        duration: '250ms (`--text-swap-dur`)',
        easing: 'ease-in-out',
        delay: '250ms, the setTimeout that also swaps the string',
      },
    ],
    gotchas: [
      'The timeout is `reduce ? 0 : 250`. Reduced motion sets the transition to none.',
      'The strings are `Transaction processing...` and `Transaction completed`.',
      'The line is font-size 16px inside a min-height 24px slot.',
    ],
    setup:
      'The line starts as `Transaction processing...`. Swap adds `.is-exit`, then after 250ms writes the next string, adds `.is-enter-start`, reads `offsetWidth`, and removes `.is-enter-start`.',
    checklist: [
      'Exit uses translateY(calc(var(--text-swap-translate-y) * -1)) with blur 2px and opacity 0 in 250ms. `--text-swap-translate-y` is 4px.',
      'The string swaps after that 250ms, and the enter starts at 4px.',
      'Reduced motion uses a 0 timeout and transition none.',
    ],
  },
  'menu-dropdown': {
    motion:
      'The menu scales from 0.94 to 1 and fades from opacity 0 to 1 over 180ms with cubic-bezier(0.22, 1, 0.36, 1). The origin is top left. Close is the same ease back. An item press closes it.',
    content:
      'The trigger reads `Open menu` while closed and `Close menu` while open. The items read `New file`, `Add image`, and `New folder`. It starts closed.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The column is centered.
- Column: min-width 160px, items aligned to the start.
- Trigger: height 34px, padding 0 12px, border-radius 10px, background #ffffff, colour #0d0d0d, 13px, weight 500. Shadow 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05).
- Menu: width 160px, margin-top 8px, padding 6px, border-radius 12px, background #ffffff, the same shadow. Origin is the top left. Closed scale is 0.94 and opacity is 0.
- Item: height 32px, padding 0 8px, border-radius 8px, colour #0d0d0d, 13px, weight 400. No hover colour.`,
    timing: `Open and close are both 180ms, cubic-bezier(0.22, 1, 0.36, 1), on opacity and on scale together. Scale is 0.94 when closed and 1 when open. A second click or Enter starts a new 180ms ease from the current opacity and scale. Reduced motion snaps. The duration is 0ms.`,
    reducedMotion: 'Reduced motion snaps the menu open or closed. The duration is 0ms.',
    states: [
      {
        name: 'closed',
        trigger: 'a click or Enter on the trigger while open, or a click or Enter on an item',
        from: 'opacity 1, scale 1',
        to: 'opacity 0, scale 0.94, pointer-events none',
        duration: '180ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'open',
        trigger: 'a click or Enter on the trigger while closed',
        from: 'opacity 0, scale 0.94',
        to: 'opacity 1, scale 1, pointer-events auto, width 160px',
        duration: '180ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the click or Enter',
        to: 'the open or closed pose, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Enter on the trigger toggles the menu. Enter on an item closes it. Space does not. The trigger and the items are in the tab order. They have no role. The accessible name is the label.',
      'An item press closes the menu. The items have no hover colour. They scale together from the top left. There is no stagger.',
      'Pointer events are none while the menu is closed, including through the close fade, and auto as soon as the open starts. The label changes on the click.',
      'An outside click does not close the menu. Only the trigger or an item press does.',
      'The open and the close are the same 180ms ease. The close eases out from opacity 1. Both are at rest by 200ms. On a rapid second click, for example a close about 80ms into an open, the Copy turns around immediately from the current opacity, while the original keeps rising for a short moment before it turns, so the Copy reaches zero sooner. The peak opacity difference is up to about 0.3 to 0.7 for 2 to 3 frames at 1280.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script toggles the menu and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'The trigger reads Open menu, then Close menu. The items are New file, Add image, and New folder.',
      'The menu is 160px wide, 8px below the trigger, radius 12px, padding 6px. Each item is 32px tall. There is no item hover colour.',
      'Open and close are 180ms, cubic-bezier(0.22, 1, 0.36, 1), from scale 0.94 at the top left. An item press closes the menu.',
      'Enter toggles the trigger and Enter on an item closes. Space does not.',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Reduced motion snaps and the duration is 0ms.',
    ],
  },
  'confetti-burst': {
    motion:
      'Celebrate spawns 18 bits. Horizontal travel is a spring of mass 4, damping 20, and stiffness 280. Vertical travel rises for 180ms, then a spring of mass 4, damping 18, and stiffness 300, clamped so it does not pass below the rest line. Spin is 720ms ease-out quad.',
    content:
      'Button label `Celebrate`. No bits until that click. Then 18 bits. The first accepted click uses seed 1. A second accepted click replaces them and increases the seed by 1.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden.
- Scene: height 220px, the bits and the button centered in it.
- Button: height 36px, padding 0 14px, border-radius 10px, background #ffffff, colour #0d0d0d, 13px, weight 500. Shadow \`0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05)\`.
- Bit: width 8px, height 10px, border-radius 1.5px. Rest top 83px. Horizontal origin \`calc(50% - 4px)\`. Colours #ff5a5f, #f5c518, #2ecc71, #4da3ff, #b07cff, #ff8a3d, repeating in that order.
- Placement, for index i and seed s: x = ((i % 9) - 4) * 9 + (i % 2) * 3. Peak = 46 + (i % 6) * 8. Delay slot = i % 6. Rotation = ((i * 37 + s * 11) % 200) - 100.`,
    timing: `Three clocks start together after the bit's delay.

- Horizontal: spring, mass 4, damping 20, stiffness 280, from 0 to that bit's x. The Copy plays the sampled curve as linear() over 2080ms. The curve overshoots, then settles on the target.
- Vertical: 180ms cubic-bezier(0.22, 1, 0.36, 1) from 0 to the negative peak, then a spring, mass 4, damping 18, stiffness 300, back to 0. Values below the rest line are clamped, so the downward overshoot stays hidden and the later upward bounce still shows. The Copy plays that clamped curve as linear() over 2592ms.
- Spin: 720ms ease-out quad from 0 to the target angle, sampled as linear().
- Delay: (index mod 6) * 18ms. Indexes that share a remainder start together.
- A Celebrate click closer than 80ms to the previous accepted click does not spawn.`,
    reducedMotion:
      'Reduced motion skips the curves. The 18 bits appear at their spread positions: x at the target, y on the rest line, rotation at the target. The duration is 0ms.',
    states: [
      {
        name: 'rest',
        trigger: 'before Celebrate',
        from: '',
        to: 'no bits',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'piece',
        trigger: '',
        from: '',
        to: 'width 8px, height 10px, border-radius 1.5px, colours #ff5a5f, #f5c518, #2ecc71, #4da3ff, #b07cff, #ff8a3d',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'burst',
        trigger: 'Celebrate',
        from: 'x 0, y 0, rotation 0',
        to: 'x at the spread target, y on the rest line, rotation at the target',
        duration: '2080ms horizontal, 2592ms vertical, 720ms spin',
        easing: 'sampled linear()',
        delay: '18ms times (index mod 6)',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the click',
        to: 'the 18 bits at their spread positions',
        duration: '0ms',
        easing: '',
        delay: '',
      },
      {
        name: 'debounce',
        trigger: 'a second Celebrate inside 80ms',
        from: 'the current burst',
        to: 'the same bits, seed unchanged',
        duration: '80ms',
        easing: '',
        delay: '',
      },
      {
        name: 'hover',
        trigger: 'pointer over Celebrate',
        from: 'the button paint',
        to: 'the same paint',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Nothing spawns when the document loads. The first accepted click uses seed 1. Each later accepted click removes the bits and spawns 18 new ones with the seed increased by 1.',
      'x = ((i % 9) - 4) * 9 + (i % 2) * 3. Peak = 46 + (i % 6) * 8. Rotation = ((i * 37 + seed * 11) % 200) - 100.',
      'The vertical value is clamped with min(lift, 0). The spring still travels past 0, and that part does not draw. The bounce back above the rest line does draw.',
      'The bits are pointer-events none, so Celebrate stays clickable while they overlap it.',
      'Horizontal spring mass is 4, damping 20, stiffness 280. Snap spring mass is 4, damping 18, stiffness 300.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script reads `--confetti-debounce` (80ms) and prefers-reduced-motion, then spawns on Celebrate. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'Before Celebrate there are no bits. The click spawns 18, coloured #ff5a5f, #f5c518, #2ecc71, #4da3ff, #b07cff, and #ff8a3d.',
      'Each bit is 8px by 10px, border-radius 1.5px, top 83px, left calc(50% - 4px).',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. The scene is 220px tall. The button is 36px tall, radius 10px, #ffffff, label 13px #0d0d0d.',
      'Horizontal motion is the mass 4, damping 20, stiffness 280 spring, played over 2080ms. Vertical motion is 180ms cubic-bezier(0.22, 1, 0.36, 1) then the mass 4, damping 18, stiffness 300 spring, played over 2592ms, clamped at the rest line. Spin is 720ms.',
      'Delay is 18ms times (index mod 6). A second click inside 80ms does not spawn.',
      'Reduced motion shows the bits at their spread positions and the duration is 0ms.',
      'Hover does not restyle Celebrate.',
    ],
  },
  'modal-open-close': {
    motion:
      'progress moves between 0 and 1 over 200ms with cubic-bezier(0.22, 1, 0.36, 1). Panel opacity equals progress. Panel scale is 0.94 + 0.06 * progress. The layer stays at opacity 1. The backdrop scrim is a sibling of the panel and its opacity is progress * 0.28.',
    content:
      'Title `New project`. Body `Scale from 0.94 with a 200ms fade.` Trigger label `Toggle modal`. The modal starts closed (invisible, not interactive).',
    geometry: `- Stage clip: height 200px. The layer fills that box and stays at opacity 1.
- Trigger: height 34px, padding 0 12px, border-radius 10px, background #ffffff, no border, colour #0d0d0d, 13px, face Inter_500Medium (font-weight 500). Shadow \`0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05)\`.
- Panel: width 210px, border-radius 14px, padding 16px, background #ffffff, the same shadow. Its opacity is its own.
- Backdrop scrim: a sibling of the panel, filling the layer, background #0d0d0d. Its own opacity runs from 0 to 0.28. It is not a parent of the panel.
- Title: 15px, colour #0d0d0d, face Inter_600SemiBold (font-weight 600), margin-bottom 6px.
- Body: 12px, line-height 17px, colour #6c6c6c, face Inter_400Regular (font-weight 400), margin-bottom 12px.
- Close: 13px, colour #0d0d0d, face Inter_500Medium (font-weight 500), aligned to the end of the panel. No fill, border, or padding.`,
    timing: `progress moves between 0 and 1 over 200ms with cubic-bezier(0.22, 1, 0.36, 1), opening or closing. No delay and no stagger.

- Panel opacity = progress.
- Panel scale = 0.94 + 0.06 * progress.
- Scrim opacity = progress * 0.28. The backdrop scrim is a sibling of the panel. The layer stays at opacity 1.

\`--modal-open-dur\` and \`--modal-close-dur\` are 200ms. \`--modal-scale\` is 0.94. \`--modal-ease\` is cubic-bezier(0.22, 1, 0.36, 1).`,
    reducedMotion:
      'Reduced motion uses duration 0. The panel and the scrim jump to the open or closed values. The stylesheet sets those transitions to none, and the script waits 0 before it clears the closing class.',
    states: [
      {
        name: 'closed',
        trigger: 'Close, or a press on the backdrop outside the panel',
        from: 'scale 1, opacity 1, scrim opacity 0.28',
        to: 'scale 0.94, opacity 0, scrim opacity 0, then not interactive',
        duration: '200ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'open',
        trigger: 'Toggle modal',
        from: 'scale 0.94, opacity 0, scrim opacity 0',
        to: 'scale 1, opacity 1, scrim opacity 0.28',
        duration: '200ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'hover',
        trigger: 'pointer over the trigger, the panel, or Close',
        from: 'the resting paint',
        to: 'no colour, shadow, or opacity change',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'panel',
        trigger: 'a press on the panel, not on Close',
        from: 'open',
        to: 'stays open',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Tapping the backdrop or Close closes the modal; the trigger only opens it. Both fade out over 200ms.',
      'A press on the panel does not close it.',
      'Hover does not restyle the trigger, the panel, or Close.',
      'The scrim must not be a parent of the panel\'s opacity. The backdrop wash and the panel are siblings. An ancestor opacity washes the white panel, the title, the body, Close, and the shadow.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script binds Toggle modal, Close, and the backdrop, and reads prefers-reduced-motion once. There is no install step and no run command.',
    knownGaps: 'None.',
    checklist: [
      'The stage clip is 200px tall. The layer fills it and stays at opacity 1. The backdrop scrim fills the layer.',
      'The trigger is 34px tall, padding 0 12px, radius 10px, #ffffff, with no border, and the label is 13px #0d0d0d.',
      'The panel is 210px wide, radius 14px, padding 16px, #ffffff, with shadow 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05).',
      'The layer stays at opacity 1. The backdrop scrim is a sibling of the panel, background #0d0d0d, and its opacity is progress * 0.28. The panel keeps its own opacity, so the title stays #0d0d0d and the body stays #6c6c6c.',
      'The title is 15px #0d0d0d with margin-bottom 6px. The body is 12px, line-height 17px, #6c6c6c, margin-bottom 12px. Close is 13px #0d0d0d at the end of the panel.',
      'Open and close last 200ms. Scale is 0.94 + 0.06 * progress. Easing is cubic-bezier(0.22, 1, 0.36, 1).',
      'Toggle modal only opens. Close and a backdrop press both close. A press on the panel does not.',
      'Hover does not restyle the trigger, the panel, or Close.',
      'Reduced motion duration is 0.',
    ],
  },
  'gooey-plus-menu': {
    motion: 'SVG goo plus menu. blur 6 / contrast 18 / fill #fff. Open 550ms, close 250ms. Stagger is the number 40 joined to ms.',
    content: '`+` hub + New file / Add image / New folder icons. White liquid surface; dark crisp icons.',
  },
  'page-side-by-side': {
    motion:
      '`.t-page` transitions transform and opacity over `--page-slide-dur: 300ms` with `--page-slide-ease: cubic-bezier(0.22, 1, 0.36, 1)`. `.is-exit` is `translateX(calc(var(--page-slide-distance) * -1))` and opacity 0. `.is-enter` is `translateX(var(--page-slide-distance))` and opacity 0. `--page-slide-distance` is 24px.',
    content:
      'First page is a row: a 32px #f3ba2f disc with `B`, title `BNB`, subtitle `BNB`, and `$66.11` at the end of the row. Second page is `$10` / `$66.11 available`. The second page starts with `.is-enter`.',
    states: [
      {
        name: 'exit',
        trigger: 'a click that adds `.is-exit` on the first page',
        from: 'translateX 0, opacity 1',
        to: 'translateX(calc(var(--page-slide-distance) * -1)), --page-slide-distance 24px, opacity 0',
        duration: '300ms (`--page-slide-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--page-slide-ease`)',
        delay: '',
      },
      {
        name: 'enter',
        trigger: 'a click that removes `.is-enter` on the second page',
        from: 'translateX(24px), opacity 0',
        to: 'translateX 0, opacity 1',
        duration: '300ms (`--page-slide-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'pager',
        trigger: '',
        from: '',
        to: '.pager width 210px, height 88px, border-radius 14px, background #fff',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'There is no blur and no separate timeout. A click toggles `.is-exit` on the first page and `.is-enter` on the second together.',
      'The disc is 32px, #f3ba2f, with `B` in #1a1200. The title and price are 14px #0d0d0d. The subtitle and the available line are 12px #767676. The amount is 28px.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      'The first page is the row with `B`, `BNB`, `BNB`, and `$66.11`. The second page is `$10` and `$66.11 available` and starts with `.is-enter`. `.pager` is 210px by 88px, border-radius 14px. A click toggles `.is-exit` and `.is-enter` together.',
    checklist: [
      'The push is 24px over 300ms with cubic-bezier(0.22, 1, 0.36, 1).',
      'The first page is the `B` disc, `BNB`, `BNB`, and `$66.11`. The second is `$10` and `$66.11 available`.',
      'Reduced motion sets the transition to none.',
    ],
  },
  'icon-swap': {
    motion:
      'Both `.t-icon` layers transition opacity, filter, and transform over `--icon-swap-dur: 250ms` with `--icon-swap-ease: ease-in-out`. `.is-out` is opacity 0, `blur(var(--icon-swap-blur))`, and `scale(var(--icon-swap-start-scale))`. `--icon-swap-blur` is 2px and `--icon-swap-start-scale` is 0.25.',
    content: 'Three-line icon swaps with an X. The X starts with `.is-out`.',
    states: [
      {
        name: 'shown',
        trigger: 'a click on the chip removes `.is-out`',
        from: 'opacity 0, blur(2px), scale(0.25)',
        to: 'opacity 1, blur 0, scale 1',
        duration: '250ms (`--icon-swap-dur`)',
        easing: 'ease-in-out (`--icon-swap-ease`)',
        delay: '',
      },
      {
        name: 'out',
        trigger: 'a click on the chip adds `.is-out`',
        from: 'opacity 1, scale 1, blur 0',
        to: 'opacity 0, blur(2px), scale(0.25)',
        duration: '250ms (`--icon-swap-dur`)',
        easing: 'ease-in-out',
        delay: '',
      },
    ],
    gotchas: [
      'The chip is 48px by 48px, border-radius 12px, background #fff. Each `.t-icon` is position absolute, 20px by 16px. The bars and the X are 2px tall and #0d0d0d.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      'The first `.t-icon` is the three-line mark. The second starts with `.is-out` and is the X. A click on the chip toggles `.is-out` on both. `--icon-swap-dur` is 250ms, `--icon-swap-blur` is 2px, and `--icon-swap-start-scale` is 0.25.',
    checklist: [
      'Opacity, blur, and scale share one 250ms ease-in-out.',
      'The resting icon is the three-line mark.',
      '`.is-out` ends at scale 0.25 and blur 2px.',
    ],
  },
  'success-check': {
    motion:
      'Animate toggles the check. One spring, mass 0.8, damping 12, stiffness 280, drives opacity, translateY, rotate, and scale. The dash follows that same spring after 80ms on the way in, and hides with a 120ms timing on the way out. The linear() is sampled from that spring.',
    content:
      'A green disc and a white check. The piece starts off, so the disc is not visible, and nothing plays when the document loads. The Animate button toggles it on, then off. The label stays Animate.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The badge is centered.
- Badge box: 56px by 56px. The svg is 36px by 36px, viewBox 0 0 36 36.
- Disc: circle cx 18, cy 18, r 16, fill #1f8a4c.
- Check: path \`M11 18.5 L16 23.5 L25 13.5\`, stroke #fff, stroke-width 2.4px, round caps and joins, stroke-dasharray 28px.
- Off pose: opacity 0, translateY 28px, rotate 80deg, scale 0.86. The dash offset is 28px.
- On pose: opacity 1, translateY 0, rotate 0, scale 1. The dash offset is 0.
- Animate: height 28px, padding 0 10px, border-radius 8px, border 1px solid rgba(0, 0, 0, 0.08), background rgba(243, 243, 243, 0.94), colour #17181c, 12px, weight 500. It sits right 10px, bottom 10px.
- Hover paints the button #d9d9e2 with border rgba(0, 0, 0, 0.35). Pressed paints #b7b7c2 with border rgba(0, 0, 0, 0.5).`,
    timing: `Progress t is a spring, mass 0.8, damping 12, stiffness 280. On, t runs from 0 to 1. Off, from a rest at 1 back to 0. The Copy plays that curve as linear() over 1242ms. It passes the target by about 25%, then settles. 1242ms is when the spring energy falls through its stop and the value snaps to the target.

- opacity = t, clamped to the 0 to 1 range when t travels past those ends.
- translateY = (1 - t) * 28px.
- rotate = (1 - t) * 80deg.
- scale = 0.86 + t * 0.14.
- Dash on: the same spring, delayed 80ms. stroke-dashoffset = (1 - dash) * 28px. \`--dash-delay\` is 80ms.
- Dash off: 120ms, cubic-bezier(0.22, 1, 0.36, 1), from the drawn stroke back to offset 28px. \`--dash-hide\` is 120ms. That hide does not use the spring.`,
    reducedMotion:
      'Reduced motion skips the spring and the 120ms hide. Turning it on shows the disc, the full check, and the identity transform. Turning it off returns the off pose, including the hidden dash. The duration is 0ms.',
    states: [
      {
        name: 'off',
        trigger: 'Animate, while the check is on and at rest',
        from: 'opacity 1, translateY 0, rotate 0, scale 1',
        to: 'opacity 0, translateY 28px, rotate 80deg, scale 0.86',
        duration: '1242ms',
        easing: 'sampled linear()',
        delay: '',
      },
      {
        name: 'on',
        trigger: 'Animate, while the check is off',
        from: 'opacity 0, translateY 28px, rotate 80deg, scale 0.86',
        to: 'opacity 1, translateY 0, rotate 0, scale 1',
        duration: '1242ms',
        easing: 'sampled linear()',
        delay: '',
      },
      {
        name: 'draw',
        trigger: 'the same Animate that turns the check on',
        from: 'stroke-dashoffset 28px',
        to: 'stroke-dashoffset 0',
        duration: '1242ms',
        easing: 'sampled linear()',
        delay: '80ms',
      },
      {
        name: 'hide',
        trigger: 'the same Animate that turns the check off',
        from: 'stroke-dashoffset 0',
        to: 'stroke-dashoffset 28px',
        duration: '120ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'hover',
        trigger: 'pointer over Animate',
        from: 'background rgba(243, 243, 243, 0.94), border rgba(0, 0, 0, 0.08)',
        to: 'background #d9d9e2, border rgba(0, 0, 0, 0.35)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'pressed',
        trigger: 'pointer down on Animate',
        from: 'the hover paint',
        to: 'background #b7b7c2, border rgba(0, 0, 0, 0.5)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the click',
        to: 'the on pose or the off pose, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The label is Animate. It toggles. It does not replay a one-way entrance, and the piece does not play when the document loads.',
      'Spring mass is 0.8, damping 12, stiffness 280. The linear() is sampled from that spring.',
      'On the way in, t peaks near 1.25. translateY peaks near 7px above the rest line, rotate peaks near 20deg past 0, and scale peaks near 1.035. Opacity clamps at 1 during that overshoot, then shows the later dip under 1. The dash uses the same overshoot, so the offset goes negative before it settles.',
      'On the way out the dash does not spring. It is a 120ms cubic-bezier(0.22, 1, 0.36, 1) back to offset 28px.',
      'The button is 10px from the stage padding edge. The stage border is 1px, so the button sits 11px from the outer edge.',
      'A second click within about 100 ms restarts the sampled curve from its start, so the pose jumps instead of continuing from its current value like the original; the end pose is the same.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script toggles `.is-on` and `.is-off` on Animate and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'Before Animate the disc is not visible. The off pose is opacity 0, translateY 28px, rotate 80deg, scale 0.86, dash offset 28px.',
      'Animate toggles on, then off. The label is Animate.',
      'Opacity, translateY, rotate, and scale follow the mass 0.8, damping 12, stiffness 280 spring, played over 1242ms.',
      'The dash waits 80ms, then uses that spring. Turning off hides the dash in 120ms with cubic-bezier(0.22, 1, 0.36, 1).',
      'The disc is #1f8a4c, 36px, inside a 56px box. The stroke is #fff at 2.4px. The stage is 289px by 200px, radius 14px, background #f9f9f9.',
      'Hover paints #d9d9e2. Pressed paints #b7b7c2. Reduced motion jumps and the duration is 0ms.',
    ],
  },
  'avatar-group-hover': {
    motion:
      'Each disc has its own lift and scale spring, mass 4, damping 20, stiffness 280. The script steps that spring from the current value. Lift is -8px times strength. Scale is 1 + 0.06 times strength. Strength is 1 at the hot disc and falls off by 0.45 per step, clamped at 0.',
    content:
      'Initials JC, AK, MR, SL, TW on `#d9b8a2`, `#b7c7d9`, `#d4c4a8`, `#c5b3d6`, `#a8c5b8`. The row starts at rest. Nothing plays when the document loads.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The row is centered.
- Disc: 40px by 40px, border-radius 20px, border 2px solid #fff, colour #2a2118, 11px, weight 500. Later discs use margin-left -10px. The first uses 0.
- Fills: #d9b8a2, #b7c7d9, #d4c4a8, #c5b3d6, #a8c5b8.
- Rest: translateY 0, scale 1. Hot: translateY -8px, and scale gains 0.06. \`--avatar-lift\` is -8px and \`--avatar-scale\` is 0.06.`,
    timing: `Lift and scale each follow a spring, mass 4, damping 20, stiffness 280. A full travel from rest settles by 3782ms. \`--avatar-dur\` is 3782ms. The script steps the spring from the current value instead of restarting a curve at 0.

- strength = 0 when nothing is hot, otherwise max(0, 1 - distance * 0.45). \`--avatar-falloff\` is 0.45.
- translateY = -8px * strength, along that spring.
- scale = 1 + 0.06 * strength, along that spring.
- z-index is 3 when strength is above 0.9, otherwise 1. The z-index changes with the hot disc and does not spring.

Moving to a neighbour retargets both springs. Velocity is kept only when it already points at the new target.`,
    reducedMotion:
      'Reduced motion places every disc on its target translate and scale with no travel. The duration is 0ms.',
    states: [
      {
        name: 'rest',
        trigger: 'pointer leaves the row, pointer up, or Enter up',
        from: 'the hot translateY and scale',
        to: 'translateY 0, scale 1, z-index 1',
        duration: '3782ms',
        easing: 'spring, mass 4, damping 20, stiffness 280',
        delay: '',
      },
      {
        name: 'hover',
        trigger: 'pointer enters a disc',
        from: 'translateY 0, scale 1',
        to: 'translateY -8px times strength, scale 1 + 0.06 times strength, z-index 3 on the hot disc',
        duration: '3782ms',
        easing: 'spring, mass 4, damping 20, stiffness 280',
        delay: '',
      },
      {
        name: 'press',
        trigger: 'pointer down, or Enter, on a disc',
        from: 'the current lift',
        to: 'the same pose as hover for that disc',
        duration: '3782ms',
        easing: 'spring, mass 4, damping 20, stiffness 280',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the pointer or Enter change',
        to: 'the target pose, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Each hit target is in the tab order. It has no role and no accessible name. Enter holds that disc’s lift until the key is released. Space does nothing.',
      'Pointer up clears the hot disc even while the pointer is still inside, so the row springs back. That matches the original.',
      'Spring mass is 4, damping 20, stiffness 280. The script steps that spring. A second change continues from the current value. Velocity that points away from the new target is dropped.',
      'On a full travel the lift passes -8px by about 37% and peaks near 11px above the rest line. Scale peaks near 1.08. Neighbours use the same progress at a smaller strength.',
      'The first disc has no negative margin. The others overlap it by 10px.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script reads the lift, scale, and falloff variables and prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'Discs are 40px, border 2px solid #fff, radius 20px, margin-left -10px after the first. Initials are 11px, colour #2a2118.',
      'Fills are JC #d9b8a2, AK #b7c7d9, MR #d4c4a8, SL #c5b3d6, TW #a8c5b8.',
      'The hot disc lifts by -8px and gains 0.06 scale. Falloff is 0.45. z-index is 3 only on that disc.',
      'The spring is mass 4, damping 20, stiffness 280, and a full travel settles by 3782ms.',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Reduced motion jumps and the duration is 0ms.',
    ],
  },
  'card-stack-hover': {
    motion:
      'One spring, mass 1, damping 20, stiffness 280, drives a shared progress from 0 to 1. The script steps that spring from the current value. Hover spreads the cards. Leaving stacks them. A click toggles. Enter toggles.',
    content:
      'Labels `Card 1`, `Card 2`, `Card 3`. The stack starts closed. Nothing plays when the document loads.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The hit target is centered.
- Hit target: 180px by 120px. It is in the tab order and has no role and no accessible name.
- Stack: 110px by 74px, left 35px, top 23px inside the hit target.
- Card: 110px by 74px, border-radius 12px, background #fff, colour #0d0d0d, 13px, weight 500. Shadow: 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05).
- Spread, at progress 1: card 1 translate -28px 10px rotate -8deg, card 2 translate 0px -6px rotate 0deg, card 3 translate 28px 10px rotate 8deg. z-index is 1, 2, then 3.`,
    timing: `Progress follows a spring, mass 1, damping 20, stiffness 280. A full travel from rest settles by 984ms. \`--stack-dur\` is 984ms. The script steps the spring from the current value.

- Card 1: x = -28px * progress, y = 10px * progress, rotate = -8deg * progress.
- Card 2: x = 0px, y = -6px * progress, rotate = 0deg.
- Card 3: x = 28px * progress, y = 10px * progress, rotate = 8deg * progress.

The spring passes the target by about 10%, then settles. Hover sets the target to 1. Leaving, or a toggle that closes, sets it to 0.`,
    reducedMotion:
      'Reduced motion places the cards on the stacked pose or the spread pose with no travel. The duration is 0ms.',
    states: [
      {
        name: 'stacked',
        trigger: 'pointer leaves the hit target, or a click or Enter that closes it',
        from: 'the spread translates and rotates',
        to: 'translate 0px, rotate 0deg',
        duration: '984ms',
        easing: 'spring, mass 1, damping 20, stiffness 280',
        delay: '',
      },
      {
        name: 'spread',
        trigger: 'pointer enters the hit target, or a click or Enter that opens it',
        from: 'translate 0px, rotate 0deg',
        to: 'translate -28px 10px rotate -8deg, translate 0px -6px, translate 28px 10px rotate 8deg',
        duration: '984ms',
        easing: 'spring, mass 1, damping 20, stiffness 280',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the pointer, click, or Enter change',
        to: 'the stacked pose or the spread pose, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The hit target is in the tab order. It has no role and no accessible name. Enter toggles the spread. Space does not.',
      'A click toggles while the pointer remains inside. Hover opens the stack, and leaving closes it. That matches the original.',
      'Spring mass is 1, damping 20, stiffness 280. The script steps that spring. A second change continues from the current value. Velocity that points away from the new target is dropped.',
      'On a full travel, progress peaks near 1.10. Card 1’s x passes -28px by a few pixels, and its rotate passes -8deg.',
      'The cards sit 35px from the hit target’s left and 23px from its top. That is the centered 110px by 74px stack inside the 180px by 120px target.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script reads each card’s --x, --y, and --r and prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'Labels are `Card 1`, `Card 2`, and `Card 3`. The stack starts closed.',
      'Spread is translate -28px 10px rotate -8deg, translate 0px -6px, and translate 28px 10px rotate 8deg.',
      'The spring is mass 1, damping 20, stiffness 280, and a full travel settles by 984ms.',
      'The hit target is 180px by 120px. Cards are 110px by 74px, radius 12px, background #fff, colour #0d0d0d, left 35px, top 23px.',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Enter toggles. Reduced motion jumps and the duration is 0ms.',
    ],
  },
  'error-state-shake': {
    motion:
      '`.t-shake.is-error` runs `t-shake` for `--shake-dur: 400ms` with `--shake-ease: cubic-bezier(0.36, 0.07, 0.19, 0.97)`. Keyframes: 0% translateX 0, 20% `translateX(var(--shake-distance))`, 40% `translateX(calc(var(--shake-distance) * -1))`, 60% translateX(4.2px), 80% translateX(-2.45px), 100% translateX 0. `--shake-distance` is 7px. `.is-error` also sets border-color #c43a31.',
    content: 'Input starts at `hello@`. Invalid submit shows `Please enter a valid email.` Border `#c43a31`.',
    states: [
      {
        name: 'idle',
        trigger: 'a Submit that matches `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`',
        from: 'border-color #c43a31 and the shake',
        to: 'border 1px solid rgba(0,0,0,.1), message hidden',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'invalid',
        trigger: 'Submit when that pattern fails',
        from: 'translateX 0',
        to: 'translateX(7px), then the negative of that distance, then translateX(4.2px), then translateX(-2.45px), then translateX 0',
        duration: '400ms (`--shake-dur`)',
        easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97) (`--shake-ease`)',
        delay: '',
      },
    ],
    gotchas: [
      'The script removes `.is-error`, reads offsetWidth, then adds `.is-error` so the animation restarts.',
      'The field is height 38px, border-radius 10px, padding 0 10px. The message is font-size 11px and colour #c43a31. The button label is Submit.',
      'Reduced motion sets `.t-shake.is-error` animation to none. The error border and message still show.',
    ],
    setup:
      'The input starts at `hello@`. Submit tests `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`. A miss shows `Please enter a valid email.` and adds `.is-error`. `--shake-distance` is 7px and `--shake-dur` is 400ms.',
    checklist: [
      'An invalid submit shows `Please enter a valid email.` and sets border-color #c43a31.',
      'The shake is 7px, the negative of that distance, 4.2px, -2.45px, then 0, over 400ms with cubic-bezier(0.36, 0.07, 0.19, 0.97).',
      'Reduced motion keeps the error and sets the animation to none.',
    ],
  },
  'input-clear-dissolve': {
    motion:
      'Clear and restore are linear over 250ms. search and recent travel from translateY 0 to -25px. files is at top -8.5px for the whole clear, and translateY still runs from 0 to -25px, so its visual offset runs from -8.5px to -33.5px. Opacity runs from 1 to 0. Restore travels translateY 25px to 0 and opacity 0 to 1. Delay is 45ms times the index. No blur. The words do not move sideways. A click during a fade keeps every word that is already leaving.',
    content:
      '`search`, `recent`, `files`. Cleared, the field reads `Search`. The control shows `×` while the words are showing and `+` when they are cleared. The entrance plays when the document loads.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The field is centered.
- Field: width 230px, height 40px, border-radius 12px, background #fff, border 1px solid rgba(0, 0, 0, 0.08), padding 0 12px.
- Row: flex 1, gap 4px, overflow hidden. Exiting words keep the left they had. files uses top -8.5px. search and recent use top 0px.
- Word: 14px, line-height 17px, weight 400, colour #0d0d0d.
- Placeholder: 14px, line-height 17px, weight 400, colour #8f8f8f. The string is Search.
- Control: 20px by 20px. It is in the tab order. It has no role and no accessible name. The glyph is 18px, line-height 20px, colour #6c6c6c, on the system stack.`,
    timing: `Clear and restore are linear over 250ms. There is no blur, and the words do not move sideways.

- search and recent on clear: top 0px, translateY from 0 to -25px, opacity from 1 to 0. Visual offset ends at -25px.
- files on clear: top -8.5px from the first frame through the end. translateY from 0 to -25px. Visual offset runs from -8.5px to -33.5px. Opacity from 1 to 0.
- Restore: top 0px, translateY from 25px to 0, opacity from 0 to 1.
- Word n waits n times 45ms. The first word waits 0ms.
- A click while words are leaving keeps those words on that fade and starts the entrance. A click while words are entering restarts those same words as a clear, from opacity 1 and translateY 0, with files at top -8.5px.
- Reduced motion swaps with no travel. The duration is 0ms.`,
    reducedMotion:
      'Reduced motion skips both fades. Clear shows Search and + at once. Restore shows the three words and × at once. Words that were still moving are removed. The duration is 0ms.',
    states: [
      {
        name: 'clear',
        trigger: 'a click or Enter on the control while the words are showing',
        from: 'opacity 1. search and recent at top 0px and translateY 0. files at top -8.5px and translateY 0',
        to: 'opacity 0. search and recent at translateY -25px. files at top -8.5px and translateY -25px, visual offset -33.5px',
        duration: '250ms',
        easing: 'linear',
        delay: '45ms times the index',
      },
      {
        name: 'restore',
        trigger: 'a click or Enter on the control while the field is cleared',
        from: 'top 0px, translateY 25px, opacity 0',
        to: 'top 0px, translateY 0, opacity 1',
        duration: '250ms',
        easing: 'linear',
        delay: '45ms times the index',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the click or Enter',
        to: 'the cleared field or the three words, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The control is in the tab order. It has no role and no accessible name. Enter toggles it. Space does not.',
      'Search appears in the first slot at once, while the words are still travelling up. Each exiting word keeps the left it had. files is at top -8.5px for the whole clear and ends at visual offset -33.5px. search and recent end at -25px. The row clips the travel.',
      'A click while words are leaving keeps those words on their own 250ms fade. The new words enter on top from opacity 0, so both sets overlap for about 250ms. Opacity of a word already leaving does not jump. The original paints the new words at opacity 1 for one frame before that entrance, and on that frame the opacities add up to about 5.1. A fast restore and clear keeps every earlier exit as well.',
      'A click that clears during an entrance turns those same words into an exit. That exit starts again at opacity 1 and translateY 0, files at top -8.5px, with the same 45ms stagger. It does not keep the entrance offset.',
      'The glyph is × or +, 18px, line-height 20px, colour #6c6c6c. The control is 20px wide.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script writes the words, reads prefers-reduced-motion, and toggles on click and Enter. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'The words are search, recent, and files. Cleared, the field reads Search. The glyph is ×, then +.',
      'search and recent clear to translateY -25px. files starts at top -8.5px and ends at visual offset -33.5px. Opacity ends at 0. Restore travels from translateY 25px to 0. Both are 250ms linear, with no blur.',
      'Word n waits n times 45ms. The first word waits 0ms. The words do not move sideways.',
      'A click during a fade keeps words that are already leaving, and a clear during an entrance restarts those words from opacity 1.',
      'The field is 230px by 40px, radius 12px, background #fff. The control is 20px by 20px. The stage is 289px by 200px, radius 14px, background #f9f9f9.',
      'Enter toggles. Space does not. Reduced motion swaps at once and the duration is 0ms.',
    ],
  },
  'skeleton-reveal': {
    motion:
      '`.t-skel` runs `t-pulse` for `--pulse-dur: 1000ms` linear infinite. The 50% frame is opacity 0.5. `.t-content` transitions opacity and filter over `--reveal-dur: 250ms` with `--reveal-ease: ease-in-out`. `.is-hidden` is opacity 0 and `blur(var(--reveal-blur))`. `--reveal-blur` is 2px.',
    content: '`Jane Cooper` / `jane.cooper@example.com`.',
    states: [
      {
        name: 'loading',
        trigger: 'on load `.t-content` already has `.is-hidden` and `.t-skel` runs `t-pulse`. Reveal while the content is showing calls reset(), which adds `.is-hidden`',
        from: '',
        to: '`.t-skel` opacity 0.5 at 50%. reset() sets `.t-content.is-hidden` to opacity 0 and blur(2px)',
        duration: 'pulse 1000ms (`--pulse-dur`) on load. reset() fades over 250ms (`--reveal-dur`)',
        easing: 'pulse linear. reset() uses ease-in-out (`--reveal-ease`)',
        delay: '',
      },
      {
        name: 'revealed',
        trigger: 'setTimeout(reveal, 900) and the Reveal button',
        from: 'opacity 0, blur(2px), class `is-hidden`',
        to: 'opacity 1, filter cleared, bars display none',
        duration: '250ms (`--reveal-dur`)',
        easing: 'ease-in-out',
        delay: '',
      },
    ],
    gotchas: [
      'The card is width 240px, min-height 78px, border-radius 14px, padding 16px. Bones are height 12px, border-radius 6px, background #ececec. The short bone is width 62%.',
      'The mail line is font-size 13px and colour #6c6c6c.',
      'Reduced motion sets the pulse and the content transition to none, and the timeout is 0.',
    ],
    setup:
      '`.t-content` starts with `.is-hidden`. `setTimeout(reveal, reduce ? 0 : 900)` hides the bones and removes `.is-hidden`. Reveal toggles back to the bones.',
    checklist: [
      'The skeleton pulse reaches opacity 0.5 over 1000ms and repeats.',
      'The reveal fades the content in over 250ms while a 2px blur clears.',
      'The loaded text is `Jane Cooper` and `jane.cooper@example.com`. Bones are #ececec.',
    ],
  },
  'texts-reveal': {
    motion:
      'Both lines rise linearly over 300ms, from translateY 25px and opacity 0 to rest and opacity 1. The subtitle waits 50ms. There is no blur. Animate removes the lines and mounts them again.',
    content:
      '`Pull request opened` and `Review requested from 3 teammates`. The label is Animate. The lines play when the document loads, and Animate mounts them again.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The column is centered.
- Column: width 230px.
- Title: 16px, line-height 20px, weight 500, colour #0d0d0d, margin 0 0 4px.
- Subtitle: 13px, line-height 16px, weight 400, colour #767676, margin 0.
- Entrance: translateY 25px, opacity 0. There is no blur.
- Animate: height 28px, padding 0 10px, border-radius 8px, border 1px solid rgba(0, 0, 0, 0.08), background rgba(243, 243, 243, 0.94), colour #17181c, 12px, weight 500. It sits right 10px, bottom 10px. The accessible name is Animate.
- Hover paints the button #d9d9e2 with border rgba(0, 0, 0, 0.35). Pressed paints #b7b7c2 with border rgba(0, 0, 0, 0.5).`,
    timing: `Each line runs one linear rise of 300ms. translateY goes from 25px to 0 and opacity goes from 0 to 1, together. There is no blur and no overshoot.

- The title starts at once.
- The subtitle waits 50ms and holds translateY 25px, opacity 0, through that delay.
- Reduced motion shows the settled lines. The duration is 0ms.`,
    reducedMotion:
      'Reduced motion skips the rise. Both lines are at rest and opaque, and Animate still mounts them again. The duration is 0ms.',
    states: [
      {
        name: 'enter',
        trigger: 'the document loads, and each Animate, which mounts the lines again',
        from: 'translateY 25px, opacity 0',
        to: 'translateY 0, opacity 1',
        duration: '300ms',
        easing: 'linear',
        delay: '50ms on the subtitle',
      },
      {
        name: 'hover',
        trigger: 'pointer over Animate',
        from: 'background rgba(243, 243, 243, 0.94), border rgba(0, 0, 0, 0.08)',
        to: 'background #d9d9e2, border rgba(0, 0, 0, 0.35)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'pressed',
        trigger: 'pointer down on Animate',
        from: 'the hover paint',
        to: 'background #b7b7c2, border rgba(0, 0, 0, 0.5)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the entrance pose',
        to: 'translateY 0, opacity 1, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The label is Animate, and that is the accessible name. It is a button. Enter and Space both activate it.',
      'The button is 10px from the stage padding edge. The stage border is 1px, so the button sits 11px from the outer edge.',
      'Animate removes the lines and mounts them again, so the rise starts over from translateY 25px and opacity 0. The old lines do not fade. The original removes them the same way.',
      'A second click during the rise starts a new rise. It does not continue the lines that were on screen.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script mounts the two lines again on Animate and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'The lines are `Pull request opened` and `Review requested from 3 teammates`.',
      'The title is 16px, line-height 20px, colour #0d0d0d. The subtitle is 13px, line-height 16px, colour #767676. The column is 230px wide.',
      'The rise is translateY 25px to 0 and opacity 0 to 1, linear, over 300ms. The subtitle waits 50ms. There is no blur.',
      'The button label is Animate. Hover paints #d9d9e2. Pressed paints #b7b7c2.',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Reduced motion shows the settled lines and the duration is 0ms.',
    ],
  },
  'tabs-sliding': {
    motion:
      'The pill x follows a spring, mass 1, damping 20, stiffness 280. The script steps that spring from the current position. Overview rests at 3px, Activity at 81px, Settings at 159px. A full travel is within half a pixel by 530ms.',
    content:
      'Labels `Overview`, `Activity`, `Settings`. Overview starts selected. The pill rests on Overview. Nothing else plays when the document loads.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The bar is centered.
- Bar: background #f1f1f1, border-radius 999px, padding 3px.
- Pill: width 78px, top 3px, bottom 3px, left 0, border-radius 999px, background #fff, shadow 0 1px 3px rgba(0, 0, 0, 0.04). It rests at translateX 3px.
- Tab: width 78px, height 30px, 12px, weight 500. Inactive colour rgba(15, 15, 15, 0.8). Active colour #0f0f0f.
- Rests: Overview 3px, Activity 81px, Settings 159px.`,
    timing: `The pill x follows a spring, mass 1, damping 20, stiffness 280. The script steps that spring from the current position. A full travel from rest is within half a pixel of the target by 530ms, and that is the visible settle. The step does not snap at 530ms. Each step uses the closed form and caps the interval at 64ms.

- Overview rests at 3px. Activity rests at 81px. Settings rests at 159px. The gap is 78px.
- A click or Enter on another tab sets that rest as the target.
- Velocity is kept when it already points at the new target. Velocity that points away is dropped.
- Reduced motion snaps. The duration is 0ms.`,
    reducedMotion:
      'Reduced motion places the pill on the selected rest with no travel. The duration is 0ms.',
    states: [
      {
        name: 'rest',
        trigger: 'the document loads, on Overview',
        from: '',
        to: 'translateX 3px, pill width 78px, background #fff, bar #f1f1f1',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'move',
        trigger: 'a click or Enter on a tab that is not the selected one',
        from: 'the current translateX',
        to: 'translateX 3px, 81px, or 159px',
        duration: '530ms visible settle',
        easing: 'spring, mass 1, damping 20, stiffness 280',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the click or Enter',
        to: 'the selected rest, with no travel',
        duration: '0ms',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Each tab is in the tab order. It has no role. The accessible name is its label. Enter selects it. Space does not.',
      'A click or Enter on the selected tab does nothing.',
      'Spring mass is 1, damping 20, stiffness 280. The script steps that spring. A second tab continues from the current position. Velocity that points away from the new target is dropped. Velocity that already points at the new target is kept.',
      'On a 78px travel the pill passes the rest by about 10% and peaks near 88.5px. The visible settle is 530ms. The step does not snap there.',
      'The pill starts on the click. The original waits one frame, so the first moments sit apart.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script steps the spring and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'Labels are Overview, Activity, and Settings. Overview starts selected and the pill rests at translateX 3px.',
      'The pill is 78px wide on a bar of #f1f1f1. The pill is #fff. Inactive labels are rgba(15, 15, 15, 0.8). The active label is #0f0f0f.',
      'The rests are 3px, 81px, and 159px. The spring is mass 1, damping 20, stiffness 280. A full travel is within half a pixel by 530ms.',
      'Enter selects a tab. Space does not. A click on the selected tab does nothing.',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Reduced motion snaps and the duration is 0ms.',
    ],
  },
  'drag-drop-physics': {
    motion:
      'Pointer drag follows 1:1. Scale eases to 1.05 over 150ms. On a 0.2 px/ms drag this card painted scale 1.036 at 35ms and 1.043 at 52ms. Gain is 27.9 (5.58/0.2). Speed is the last three move events; a gap above 100ms is a hold and the next move uses only the new intervals. That drag reads 0° at 18ms, -1.865° at 34.8ms, -3.241° at 51ms, -3.788° at 67.4ms, -4.174° at 84.4ms, -4.449° at 101.2ms, -4.700° at 117.1ms, -4.892° at 134.3ms, -5.039° at 151.2ms, -5.150° at 167.4ms, -5.312° at 200.5ms, -5.415° at 234.3ms, -5.493° at 267.3ms, -5.516° at 300.5ms, -5.560° at 351ms, -5.561° at 384ms, -5.565° at 400.3ms, and -5.580° at 700ms. It does not pass -5.58°. After a 250ms hold the same drag reads -5.546° at 700ms of motion and does not pass -5.58°. The 0.1 px/ms drag reads -2.351° at 117ms and -2.685° at 217ms and does not pass -2.80°. The 0.3 px/ms drag reads -5.836° at 101ms, -7.829° at 201ms, -8.244° at 301ms, and -8.341° at 400ms, and settles at -8.370°. An 80px drag over 1200ms in 36 equal steps reads -1.574° at 118.5ms and -1.863° at 1200ms, and does not pass -3.21°. A flick of 80px in three moves 5ms apart reaches the -10° clamp at 700ms. Reduced motion snaps: -5.580° at 400ms on that 0.2 px/ms drag, and -10° on a move past the clamp. Tilt holds while the pointer is idle. The chase waits 28ms, then 44% of the target up to ±5.58° uses a 6ms time constant and the rest 70ms; past ±5.58° it waits 58ms and uses 64ms. Puff blur is stdDeviation 5, stroke 36, colour rgba(132,132,132,0.48), noise baseFrequency 0.028, filterUnits userSpaceOnUse. A miss returns over 500ms with cubic-bezier(0.34, 1.56, 0.64, 1), ≈9.75% overshoot (7.8px on 80px), starting in the pointerup frame, and ignores re-grabs. A hit eases the chip out in 229ms with up to 2px blur (0.386 at 111ms) and eases the photo in over 430ms (0.132/0.507/0.774/0.942 at 111/210/277/344ms, 0.984 at 377ms). Squash reads 0.985/0.9729/0.9703 at 45/111/210ms, then 0.9748/0.9834/0.9889/0.9957 at 278/312/345/412ms, and 0.9997 by 460ms. The puff is opacity 0 at 279ms, 0.899 with drift 2.46px and scale 1.112 at 462ms, and opacity 0 with drift 9.94px and scale 1.573 at 1462ms. The photo fades from 1832ms over 211ms (opacity about 0.68/0.41/0.25/0.14/0.07 at 32/64/100/130/163ms, gone at 211ms, blur 4px). The chip respawns from 2268ms (0.512/0.951 at 30ms, 0.794/0.979 at 63ms, 0.923/0.992 at 96ms) and is fully visible at 2410ms.',
    content:
      'Board 213×192. Chip 72×72 photo at left 141, top 0, radius 12. Zone 104×104 at left 0, top 88, radius 12, 2px dashed rgba(0,0,0,0.1), background rgba(234,234,234,0.2). Chip and filled zone share shadow 0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12). While the chip centre is over the zone: border rgba(0,0,0,0.28), background rgba(234,234,234,0.55), label opacity 0.5. Label is 11px / 15px #767676, width 76, top 38 (text at 40 from the outer edge). Font stack starts with Inter, then system faces. No font download.',
    states: [
      {
        name: 'ready',
        trigger: 'mount, a finished return, or the end of the respawn',
        from: 'hidden chip or rest',
        to: 'chip at rest, scale 1, tilt 0, opacity 1',
        duration: 'respawn runs 2268ms to 2410ms after a hit',
        easing: 'cubic-bezier(0.24, 0.76, 0.5, 0.92) from scale 0.9 and opacity 0',
        delay: 'none',
      },
      {
        name: 'held',
        trigger: 'pointer down on the chip',
        from: 'rest',
        to: 'pointer translation, scale 1.05, tilt from horizontal velocity',
        duration: 'while the pointer is down',
        easing: '1:1 follow; scale eases over 150ms; tilt eases toward the clamped velocity and holds',
        delay: 'none',
      },
      {
        name: 'homing',
        trigger: 'pointer up with the chip centre outside the zone',
        from: 'release pose',
        to: 'rest',
        duration: '500ms',
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        delay: 're-grabs ignored until it finishes',
      },
      {
        name: 'sinking',
        trigger: 'pointer up with the chip centre inside the zone',
        from: 'release pose',
        to: 'chip opacity 0, zone photo opacity 1, puff running',
        duration: 'chip 229ms, photo 430ms, squash recovered by 460ms, puff from 279ms to 1462ms',
        easing: 'chip ease-out with 2px blur; photo cubic-bezier(0.433, 0.032, 0.516, 1.065); squash down to 0.97 over 226ms then back over 240ms',
        delay: 'none',
      },
      {
        name: 'clearing',
        trigger: '1832ms after the hit',
        from: 'filled zone',
        to: 'photo opacity 0 with a 4px blur',
        duration: '211ms, done at 2043ms',
        easing: 'cubic-bezier(0.12, 0.04, 0.08, 0.8)',
        delay: '1832ms from the hit',
      },
      {
        name: 'empty',
        trigger: '2043ms after the hit',
        from: 'fading photo',
        to: 'dashed zone and label, chip still hidden',
        duration: 'until 2268ms',
        easing: 'the photo fade is the exit; the chrome returns when it ends',
        delay: '2043ms from the hit',
      },
      {
        name: 'back',
        trigger: '2268ms after the hit',
        from: 'hidden chip',
        to: 'chip at scale 1 and opacity 1',
        duration: '142ms, done at 2410ms',
        easing: 'cubic-bezier(0.24, 0.76, 0.5, 0.92)',
        delay: '2268ms from the hit',
      },
    ],
    gotchas: [
      'Hit testing uses the chip centre, not a box overlap.',
      'There is no throw and no momentum. Velocity only tilts the chip. Tilt holds while the pointer is idle.',
      'Re-grabs during the return and the drop are ignored until the chip is ready again.',
      'The zone highlight is the drag-over state. There is no hover or focus style.',
      'Reduced motion follows the OS setting and html[data-reduce-motion="1"]. The tilt snaps to the clamped target (-5.580° at 400ms on the 0.2 px/ms drag, -10° past the clamp). Tweens and the puff are skipped. The zone empties at 1832ms and the chip respawns at 2268ms.',
      'The label font stack is Inter, then system faces. Do not add a font download or a CDN request.',
    ],
    setup:
      'photo.ts exports DROP_PHOTO, a 746×944 CC0 crop of Jez Timms’s rose (Unsplash https://unsplash.com/photos/ODANAGrc168, Wikimedia Commons https://commons.wikimedia.org/wiki/File:Blood-red_rose_up_close_(Unsplash).jpg, https://creativecommons.org/publicdomain/zero/1.0/). Any 746×944 image can replace it. The original demo uses a different 746×944 portrait. The copy bundle is public/parity/drag-drop-physics.js with the React LICENSE verbatim in a /*! */ header. Peer is React.',
    checklist: [
      'Board is 213×192. Chip is 72×72 at left 141 top 0 with radius 12. Zone is 104×104 at left 0 top 88 with radius 12.',
      'Scale eases to 1.05 in 150ms (1.036 at 35ms, 1.043 at 52ms). A 0.2 px/ms drag reads -1.865° at 34.8ms and -5.580° at 700ms and does not pass -5.58°. Idle tilt holds. Reduced motion snaps the tilt. Grabbing cursor is on the chip only.',
      'A miss returns in 500ms with cubic-bezier(0.34, 1.56, 0.64, 1), starting in the pointerup frame, and ignores re-grabs.',
      'A hit fades the chip by 229ms with up to 2px blur, the photo in by 430ms (0.132 at 111ms, 0.942 at 344ms), squashes to 0.970 at 210ms and back to 0.9997 by 460ms, and runs the puff from 279ms to 1462ms.',
      'The photo fades from 1832ms over 211ms to a 4px blur. The chip respawns from 2268ms and is fully visible at 2410ms.',
      'Live and Copy mount the same board. Copy makes no external request.',
    ],
  },
  'shimmer-text': {
    motion:
      '`.t-shimmer` paints a 90deg gradient of `--shimmer-base` #7c7c7c and `--shimmer-highlight` #0d0d0d, background-size 300% 100%, and runs `t-shimmer` for `--shimmer-dur: 1200ms` linear infinite. The keyframes move background-position from 100% 0 to 0% 0. Reduced motion sets animation none and paints `color` and `-webkit-text-fill-color` as `var(--shimmer-highlight)`.',
    content: '`Generating reply`.',
    states: [
      {
        name: 'sweep',
        trigger: 'the `t-shimmer` animation while motion is allowed',
        from: 'background-position 100% 0, gradient stops #7c7c7c and #0d0d0d',
        to: 'background-position 0% 0',
        duration: '1200ms (`--shimmer-dur`)',
        easing: 'linear',
        delay: '',
      },
      {
        name: 'held',
        trigger: 'prefers-reduced-motion',
        from: 'the running gradient',
        to: 'animation none, color var(--shimmer-highlight), -webkit-text-fill-color var(--shimmer-highlight), and `--shimmer-highlight` is #0d0d0d',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The type is font-size 32px and font-weight 600. The element is inline-block and width fit-content, with background-clip text and text-fill transparent while the animation runs.',
      'The reduced-motion colour is the highlight #0d0d0d. The running gradient uses both #7c7c7c and #0d0d0d.',
    ],
    setup:
      'The string is `Generating reply`. `--shimmer-dur` is 1200ms, `--shimmer-base` is #7c7c7c, and `--shimmer-highlight` is #0d0d0d. `t-shimmer` moves background-position from 100% 0 to 0% 0.',
    checklist: [
      'The sweep runs 1200ms linear and loops, from background-position 100% to 0%.',
      'The gradient uses #7c7c7c and #0d0d0d on a 300% background.',
      'Reduced motion stops the animation and paints #0d0d0d through `--shimmer-highlight`.',
    ],
  },
  'image-generation-loader': {
    motion:
      'pixels-organic light mosaic. `boot` sets `u_effect` 22 and `u_dotMode` 1. `CARD_BG` is `#f5f5f5`. `startAuto` waits `Math.random() * 1500`. `scheduleIdle` waits `(2 + Math.random() * 2) * 1000`. `paintReveal` uses `easeOutCubic` for `REVEAL_SEC` (3) and `PIX_SEC` (2.55). `finishReveal` holds `HOLD_MS` (2000) unless `holdMode` is `manual`. `beginHide` fades for `FADE_MS` (300). The Reveal button posts `reveal` or `hide`. img-fx 0.5.1 has no reduced-motion handling; autoReveal keeps cycling.',
    content:
      'Card is `168px` by `168px` with `border-radius: 20px` and `background: #f5f5f5`. Photos are `/img-fx/1.png`, `/img-fx/2.png`, `/img-fx/3.png`. Button label `Reveal`.',
    states: [
      {
        name: 'idle',
        trigger: '`scheduleIdle` and `startAuto`',
        from: 'shader opacity 1',
        to: 'overlay opacity 0',
        duration: '`Math.random() * 1500` on the first wait',
        easing: '',
        delay: '`(2 + Math.random() * 2) * 1000` after that',
      },
      {
        name: 'reveal',
        trigger: '`beginReveal`',
        from: 'mosaic',
        to: 'photo',
        duration: '`REVEAL_SEC` 3 and `PIX_SEC` 2.55',
        easing: '`easeOutCubic`',
        delay: '`SOFTNESS` 0.5 and `COLOR4`',
      },
      {
        name: 'visible',
        trigger: '`finishReveal`',
        from: 'reveal done',
        to: 'shader opacity 0',
        duration: '`HOLD_MS` 2000',
        easing: '',
        delay: 'no timer when `holdMode` is `manual`',
      },
      {
        name: 'hide',
        trigger: '`beginHide`',
        from: 'overlay opacity 1',
        to: 'overlay opacity 0',
        duration: '`FADE_MS` 300',
        easing: '`(now - hideStart) / FADE_MS`',
        delay: '`scheduleIdle` when `continueAuto`',
      },
    ],
    gotchas: [
      '`frameT0 = performance.now()` at boot. `const d = 100 - ((performance.now() - frameT0) % 100)` then `timer = setTimeout(present, d < 50 ? d + 100 : d)` schedules the next frame.',
      '`manualReveal` returns while `paused` is true.',
      'A hidden document or an offscreen card sets `var hold = !live` and posts `{ type: \'hold\', hold: hold }` plus `{ type: \'auto\', on: auto }`. `document.addEventListener(\'visibilitychange\', function () { cancelAnimationFrame(raf); sync(); })` posts that hold while the tab is hidden.',
      'Leaving pause during `visible`, when `holdMode` is not `manual`, waits `Math.min(HOLD_MS, 500)`.',
      'An empty photo list retries `beginReveal` after 500.',
      '`REF_DIM` is `320.0`. Host `cssW` falls back to 168.',
    ],
    setup:
      'The worker canvas is `OffscreenCanvas`. `getContext(\'webgl2\'` uses `alpha: true`, `premultipliedAlpha: false`, `antialias: false`, `powerPreference: \'high-performance\'`, and `preserveDrawingBuffer: true`. Photos use `fetch` and `createImageBitmap`. Shader `dpr` is `Math.min(window.devicePixelRatio || 1, 1.25)`. Display `canvasDpr` is `Math.min(window.devicePixelRatio || 1, 2)`.',
    checklist: [
      'Idle is the pixels-organic light field: `u_effect` 22, `u_dotMode` 1, `CARD_BG` `#f5f5f5`.',
      'Reveal resolves one pool photo through the `shaderColor4` mask.',
      'Hold is `HOLD_MS` 2000. Fade is `FADE_MS` 300.',
      'The Reveal button posts `reveal` for `manual` and `hide` when the phase is `reveal`, `visible`, or `hide`.',
    ],
  },
  'tooltip-open-close': {
    motion:
      'The bubble waits 400ms, then fades and scales from 0.98 to 1 over 180ms with cubic-bezier(0.22, 1, 0.36, 1). Leaving snaps it off. The slot x is a spring of mass 1, damping 20, stiffness 280, and it starts on the enter.',
    content:
      'Three hits read `Aa`, `↗`, and `···`. The bubble reads `Edit`, `Share`, or `More`. It starts hidden, over the first hit, reading Edit.',
    geometry: `- Stage: width 289px, height 200px, border 1px solid rgba(0, 0, 0, 0.04), border-radius 14px, background #f9f9f9, overflow hidden. The row is centered.
- Hit: 36px by 36px, border-radius 10px, border 1px solid rgba(0, 0, 0, 0.06), background #ffffff, colour #0d0d0d, 13px, weight 500. The row gap is 8px.
- Bubble: top -36px, left 0, height 28px, min-width 36px, padding 0 8px, border-radius 8px, background #ffffff, colour #2f2f2f, 12px, weight 500. Shadow 0 4px 42px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.05).
- Rests: Edit at translateX 0px, Share at 44px, More at 88px. Closed scale is 0.98.`,
    timing: `Opacity and scale wait 400ms, then run 180ms with cubic-bezier(0.22, 1, 0.36, 1), from scale 0.98 to 1. Leaving sets the duration and the delay to 0ms, so the bubble snaps off.

The slot x is a spring, mass 1, damping 20, stiffness 280. The script steps that spring from the current position. A 44px travel and an 88px travel come within half a pixel of the rest. Those are the visible settles. The step does not snap there. Each step uses the closed form and caps the interval at 64ms.

- Edit rests at 0px. Share rests at 44px. More rests at 88px.
- The spring starts when the pointer enters a hit. The fade waits 400ms.
- Velocity is kept when it already points at the new rest. Velocity that points away is dropped.
- Reduced motion snaps the slot and the fade. The duration is 0ms and the delay is 0ms.`,
    reducedMotion:
      'Reduced motion snaps the bubble on or off and snaps the slot onto the hit. The duration is 0ms and the delay is 0ms. There is no travel.',
    states: [
      {
        name: 'hidden',
        trigger: 'the document loads',
        from: '',
        to: 'opacity 0, scale 0.98, translateX 0px, label Edit, bubble top -36px',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'show',
        trigger: 'the pointer enters a hit',
        from: 'opacity 0, scale 0.98',
        to: 'opacity 1, scale 1, label Edit, Share, or More',
        duration: '180ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '400ms',
      },
      {
        name: 'hide',
        trigger: 'the pointer leaves a hit',
        from: 'the current opacity and scale',
        to: 'opacity 0, scale 0.98',
        duration: '0ms',
        easing: '',
        delay: '0ms',
      },
      {
        name: 'slot',
        trigger: 'the pointer enters a hit',
        from: 'the current translateX',
        to: 'translateX 0px, 44px, or 88px',
        duration: 'visible settle on 44px and on 88px',
        easing: 'spring, mass 1, damping 20, stiffness 280, step cap 64ms',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the pointer enter or leave',
        to: 'the hit rest, opacity 1 or 0, with no travel',
        duration: '0ms',
        easing: '',
        delay: '0ms',
      },
    ],
    gotchas: [
      'The hits are 8px apart. Moving from one to the next leaves the first, so the bubble snaps off, then enters the next, so the 400ms delay starts over. The slot spring starts on that enter, while the bubble is still transparent.',
      'Velocity that points away from the new rest is dropped. Velocity toward the new rest is kept. On a 44px travel the overshoot is about 4.2px. On an 88px travel the overshoot is about 8.4px. The visible settle is about 370ms on 44px and 536ms on 88px. The step does not snap there.',
      'A retarget can spike about 2.8px to 7.6px for a single frame, then converges in about 3 frames.',
      'The fade is opacity 0.805 at 450ms and 0.976 at 500ms. It is at 1 by 580ms.',
      'Leaving during the fade snaps opacity to 0 and scale to 0.98. Coming back restarts the 400ms delay. It does not resume the fade. A click while the pointer stays on a hit does not hide the bubble.',
      'Enter and Space do not show the bubble. The hits are in the tab order and have no role. The accessible name is the glyph.',
    ],
    setup:
      'Mount the HTML, the CSS, and the script in one document. The script steps the slot spring and reads prefers-reduced-motion. There is no install step and no run command.',
    knownGaps: 'Phone widths are a known gap.',
    checklist: [
      'The hits read Aa, ↗, and ···. The bubble reads Edit, Share, or More, and it starts hidden on Edit.',
      'Each hit is 36px, the gap is 8px, and the rests are 0px, 44px, and 88px. The bubble is top -36px, height 28px, scale 0.98 when hidden.',
      'Showing waits 400ms, then runs 180ms with cubic-bezier(0.22, 1, 0.36, 1). Leaving snaps off in 0ms.',
      'The slot spring is mass 1, damping 20, stiffness 280. A 44px travel is within half a pixel by about 370ms. An 88px travel is within half a pixel by 536ms. Opposing velocity is dropped.',
      'The stage is 289px by 200px, radius 14px, background #f9f9f9. Reduced motion snaps and the duration is 0ms.',
    ],
  },
  'tilt-3d': {
    motion:
      'Pointer move over `.t-tilt` eases rotateX and rotateY with `--tilt-follow: 120ms`. The script target is `(0.5 - ny) * 14` and `(nx - 0.5) * 18`. Perspective is `--tilt-perspective: 1000px`. On leave the same loop eases back with `--tilt-return: 520ms`. The glare uses `--tilt-glare-radius: 110px` and `--tilt-glare: 42ms`, and snaps onto the pointer on the frame the pointer enters. Position is clientX/clientY minus getBoundingClientRect.',
    content: 'Credit / `VISA` / `John Smith` / `4111 - 1111 - 1111 - 1111`. Dark card `#16171c`, 210×128, radius 16.',
    states: [
      {
        name: 'card',
        trigger: '',
        from: '',
        to: '.t-tilt width 210px, height 128px, perspective 1000px. .t-tilt-card background #16171c, border-radius 16px, padding 16px',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'follow',
        trigger: 'pointermove over the hit box',
        from: 'the current rotateX, rotateY, and glare',
        to: 'target (0.5 - ny) * 14 and (nx - 0.5) * 18, glare opacity 1 at the pointer',
        duration: '120ms (`--tilt-follow`) for tilt, 42ms (`--tilt-glare`) for the glare',
        easing: '1 - exp(-dt / tau)',
        delay: '',
      },
      {
        name: 'return',
        trigger: 'pointerleave',
        from: 'the current tilt and glare',
        to: 'rotateX 0deg, rotateY 0deg, glare opacity 0',
        duration: '520ms (`--tilt-return`)',
        easing: '1 - exp(-dt / tau)',
        delay: '',
      },
    ],
    gotchas: [
      'nx and ny come from clientX and clientY minus getBoundingClientRect, clamped to the 210px by 128px box. The script does not read offsetX or offsetY.',
      'The glare radius is `--tilt-glare-radius: 110px`. The stops are rgba(255,255,255,0.78), rgba(255,255,255,0.32), rgba(255,255,255,0.08), and rgba(255,255,255,0). Blend is screen.',
      'The loop stops once the pointer is gone and abs(rotateX) < 0.04, abs(rotateY) < 0.04, and glare opacity < 0.02. It then writes rotateX(0deg) rotateY(0deg).',
      'Reduced motion returns before aiming. The stylesheet sets `.t-tilt-card` transform to none and glare opacity to 0.',
    ],
    setup:
      '`.t-tilt` is 210px by 128px with `--tilt-perspective: 1000px`. The card is #16171c, border-radius 16px, padding 16px. `--tilt-follow` is 120ms, `--tilt-glare` is 42ms, and `--tilt-return` is 520ms.',
    checklist: [
      'The card is 210px by 128px, #16171c, radius 16px, perspective 1000px.',
      'Follow is 120ms. Glare is 42ms and snaps on enter. Return is 520ms.',
      'Pointer position is clientX/clientY minus getBoundingClientRect on `.t-tilt`.',
    ],
  },
  'thinking-orbs': {
    motion: 'Dotted Fibonacci sphere spin 9000ms linear; metallic orb swirl 7200ms linear. Reduced motion holds spin 0.4 / swirl 0.9.',
    content: '`Agent searching...` / `Agent listening...` / `Solving....` + dotted sphere / `Thinking....` + metallic orb. 56 dots.',
    states: [
      {
        name: 'spin',
        trigger: '`start()` when motion is allowed',
        from: 'shared value 0.4',
        to: '2π, then the repeat runs again',
        duration: '9000ms',
        easing: 'linear',
        delay: 'none',
      },
      {
        name: 'swirl',
        trigger: '`start()` when motion is allowed',
        from: 'shared value 0.9',
        to: '2π, then the repeat runs again',
        duration: '7200ms',
        easing: 'linear',
        delay: 'none',
      },
      {
        name: 'held',
        trigger: 'reduced motion, or `clockRunning` at 0',
        from: 'the running repeats',
        to: 'spin 0.4 and swirl 0.9 when reduced; both cancelled when the clock is 0',
        duration: 'cancelled with `cancelAnimation`',
        easing: '',
        delay: 'none',
      },
    ],
    gotchas: [
      'The dotted sphere is 56 Fibonacci points, radius 15, centered at 22,22. Dot radius is `1.05 + ((z + 1) / 2) * 1.55` and opacity is `0.18 + ((z + 1) / 2) * 0.82`, color `#f4f4f4`.',
      'The metallic orb radius is 16 on the same 44×44 canvas.',
      'Pills are `#161616` with a 1px `rgba(255,255,255,0.08)` border. Indents are 4, 22, 40, and 58. The two large pills use radius 18.',
      'A `clockRunning` change from 0 to 1 calls `start()` again. Cleanup cancels both animations.',
    ],
    setup:
      '`ThinkingOrbsInner` (`src/demos/thinking-orbs/ThinkingOrbsInner.tsx`) draws into two Skia canvases, 44×44. `spin` and `swirl` start at 0.4 and 0.9. `withRepeat(withTiming(Math.PI * 2, …), -1, false)` drives them.',
    checklist: [
      'Spin lasts 9000ms linear. Swirl lasts 7200ms linear. Both repeat.',
      'Reduced motion holds spin at 0.4 and swirl at 0.9.',
      'Labels are `Agent searching...`, `Agent listening...`, `Solving....`, and `Thinking....`, and the sphere uses 56 dots.',
    ],
  },
  gooey: {
    motion:
      'The page has no idle loop. Morph opens in 550ms with cubic-bezier(0.34, 1.56, 0.64, 1) and stagger 40ms, and closes in 250ms with cubic-bezier(0.22, 1, 0.36, 1). Move follows the thumb with springiness 0.5, wobble 0.5, stretch 0.6, trail 0.35. Bend drops home in 400ms with cubic-bezier(0.34, 1.40, 0.64, 1).',
    content:
      'Default is the closed morph plus menu: 200×140, buttons 40×40, fill #202020, blur 6, contrast 18, waviness 0. Move is the 240×80 slider with a 24×24 thumb at translateX 84px and fill #525252. Bend is the 261×46 card. Melt is two 84×84 photos. The original page uses different photos. These are CC0: warm sunset by W.carter, https://commons.wikimedia.org/wiki/File:Sunset_over_Trommekilen_from_Norrkila_6.jpg ; cool sea by Joselodos, https://commons.wikimedia.org/wiki/File:Calm_sea,_San_Antonio,_Ibiza,_panoramic.jpg . The Waviness row stays visible on melt and is Pro-locked, same as Fill, Bounce, and Stagger.',
    states: [
      {
        name: 'closed',
        trigger: 'mount',
        from: 'satellites stacked',
        to: 'plus menu',
        duration: 'held until click',
        easing: '',
        delay: 'useState(false) in MorphDemo',
      },
      {
        name: 'open',
        trigger: 'plus click',
        from: 'origin',
        to: 'satellite offsets',
        duration: '550ms',
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        delay: '40ms stagger',
      },
    ],
    gotchas: [
      'Morph, move, bend, and melt do not share props. Melt does not take the group blur, contrast, fill, or waviness. The Waviness row stays on screen for melt.',
      'Waviness, Fill, Bounce, and Stagger are Pro-locked on the original, stay visible on melt, and stay selectable.',
      'Bounce stays off the morph items. Shape would replace the x/y travel.',
      'The plus menu mounts closed. The playground starts on morph with the same group defaults.',
    ],
    setup:
      'Peer is React. The module is `liquid-gooey@0.2.2`. The MIT text and the React LICENSE sit in front of the bundle.',
    checklist: [
      'The default specimen is the closed morph plus menu, 200×140, fill #202020, blur 6, contrast 18.',
      'Move, bend, and melt keep their own props.',
      'The Waviness row stays visible on melt and is labelled Pro-locked on the original, same as Fill, Bounce, and Stagger.',
    ],
  },
  ...ORB_LOCKS,
  'preview-tools': {
    motion:
      'A cream pill 84px tall, radius 42px, gradient #fbfaf9 to #f1efec. Closed, `.pt-morph` is scale(0.667). Open, it widens and seats pencil, pen, fineliner, marker, highlighter, brush, fountain, and eraser. Each tool is a 30 by 88 shaded drawing, sunk with margin-bottom -20px and translateY(6px). The active tool uses translateY(-12px). A 26px conic colour wheel swaps those tools for 26px radius-8 swatches. Marks are filled outline rings. Pencil is size 1 graphite at 0.85 alpha. Pen is size 6 and thins with speed. Fineliner stays size 2. Marker is size 18. Highlighter is a flat size 28 #fff01f swipe at 0.75 alpha. Brush is size 14 and tapers at the lift. Fountain is size 8 with a 45 degree nib at 0.85 contrast. Eraser is size 28 destination-out. Alignment draws #9B5CFF boxes and lines with stroke-width 1, full-width lines at each control top, center, and bottom, and vertical lines across the row. Annotate lets a click on a control open a note card on that control. The note lists label, selector, note, and box.',
    content:
      'The stage is 520px tall and the card spans the grid. The sample row is centered: 32px plus disc, 26px pills Auto and 5.5, 32px pills Fast and Quality, 32px black send disc with an up arrow. The pill sits at the bottom. Guides and the note card stay hidden until the pill opens. Round chrome is 36px in #8a8a8e. Minimize is the four-corner collapse mark.',
    states: [
      {
        name: 'closed',
        trigger: 'the minimize control',
        from: 'the open pill',
        to: 'width 84px, height 84px, border-radius 42px, scale(0.667), gradient #fbfaf9 to #f1efec',
        duration: 'width 520ms, border-radius 440ms, transform 540ms',
        easing: 'cubic-bezier(0.22, 0.9, 0.16, 1)',
        delay: '',
      },
      {
        name: 'open',
        trigger: 'the peek press while closed',
        from: 'scale(0.667), width 84px',
        to: 'scale(1), width max-content, padding 0 32px, gap 8px, height 84px, border-radius 42px',
        duration: 'width 520ms, border-radius 440ms, transform 540ms',
        easing: 'cubic-bezier(0.22, 0.9, 0.16, 1)',
        delay: '',
      },
      {
        name: 'instrument',
        trigger: 'a tool press while open',
        from: 'translateY(6px), margin-bottom -20px',
        to: 'the active tool translateY(-12px); the others stay sunk',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'palette',
        trigger: 'the colour wheel while open',
        from: 'the tool drawings',
        to: 'swatches width 26px, height 26px, border-radius 8px; the active swatch scale(1.08) translateY(-1px). Switching this face eases the row width over 520ms',
        duration: 'width 520ms',
        easing: 'cubic-bezier(0.22, 0.9, 0.16, 1)',
        delay: '',
      },
      {
        name: 'annotate',
        trigger: 'the annotate control while open, then a press on a sample control',
        from: 'draw mode',
        to: 'a note card on that control listing label, selector, note, and box. Guides use #9B5CFF. Highlighter fill is #fff01f. Ink starts at #111111. Round controls are #8a8a8e',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Closing sets open false, face back to instruments, and clears the draft. Opening sets face to instruments.',
      '`.pt-morph` transitions width 520ms and transform 540ms, all cubic-bezier(0.22, 0.9, 0.16, 1). The border-radius stays 42px, so the 440ms leg has no visible effect.',
      'Open width is the measured max-content outer size, capped with calc(100% - 24px). The script writes that outer width in px so the 520ms width transition can interpolate. The peek and the tray swap with no fade.',
      'Reduced motion sets the `.pt-morph` transition to none.',
      'Guides draw only when the pill is open and guides are on. Stroke is #9B5CFF and stroke-width is 1.',
      'Pencil is size 1 graphite at alpha 0.85. Pen is size 6 and thins with speed. Fineliner stays size 2. Marker is size 18. Highlighter is size 28, fill #fff01f, alpha 0.75. Brush is size 14 and tapers at the lift. Fountain is size 8 with nibContrast 0.85. Eraser is size 28 and destination-out.',
      'The stage is height 520px. Sample controls use height 32px and 26px. `.pt-round` is 36px. The stage background controls use #17181c.',
    ],
    setup:
      'The pill starts closed: `.pt-morph` is 84px by 84px, border-radius 42px, scale(0.667), gradient #fbfaf9 to #f1efec. Colour starts at #111111. Guides use #9B5CFF. The note lists label, selector, note, and box.',
    checklist: [
      'Closed is an 84px by 84px pill at scale(0.667) and radius 42px.',
      'The open transition is width 520ms and transform 540ms, all cubic-bezier(0.22, 0.9, 0.16, 1). The border-radius stays 42px, so the 440ms leg has no visible effect.',
      'The active tool uses translateY(-12px). The other tools use translateY(6px) and margin-bottom -20px.',
      'A note lists label, selector, note, and box.',
    ],
  },
  'border-beam': {
    motion:
      'md and sm run beam-spin 1.96s linear and beam-fade-in 0.6s ease. Their ::before and ::after run beam-hue-shift 12s ease-in-out, filter brightness(1.3) saturate(1.2), bloom blur(8px). line runs beam-travel and beam-edge-fade 3.1s linear, beam-breathe 4s ease-in-out, beam-spike 4.1s ease-in-out, beam-spike2 5.3s ease-in-out, and beam-fade-in 0.6s ease. pulse-inner and pulse-outside fade in over 0.6s ease. The glow is unsynchronised multi-layer drift driven by JS oscillators with different periods and no single loop length. Inner layer periods are about 1.6 to 3.6s (for example --bop-br 3.0s and --bgh 2.4s). Outside opacity layers are about 1.9 to 3.6s (for example 2.3s, 3.0s, 1.9s, and 3.6s). Outside x/y position layers are about 3.3 to 4.3s. Outside width/height layers are slower, about 5.2 to 9.0s. Hue is a linear sweep, about 16s inner and 14s outer. Light theme differs and has the outside opacity layers off. Under reduced motion, pulse-inner and pulse-outside render no glow (opacity 0; the glow is hidden, not frozen). md, sm, and line have no reduced-motion rule and keep moving. Fades are 0.5s out and 0.6s in, ease. For pulse, 2.3 is the duration fallback, the normaliser (periods scale by duration/2.3), and one outside opacity layer\'s period. Strength starts at 1. pulse-outside sets `--sub-glow-offset-x: 1px`, `--sub-glow-offset-y: 0px`, `--sub-core-blur: 10px`, `--sub-bloom-blur: 19px`, `--sub-glow-opacity-mul: 1.71`.',
    content:
      'Build from the behaviour and values in this prompt; do not read or copy Pro/paid source or page source. Default size md wraps the chat, 348×122, radius 20, with a 28×28 send control (`box-sizing: border-box` on the inner row). sm is the 36×36 icon, labelled Pro-locked, and stays selectable. line wraps the 366×42 search and passes `borderRadius` 20. pulse-inner and pulse-outside wrap the 250×94 radius-16 demo card. ocean, sunset, forest, candy, ice, and gold are labelled Pro-locked. Light is a package option and paints the stage #f6f6f6. The card opens on #171717.',
    states: [
      {
        name: 'travel',
        trigger: '`size` md, sm, or line',
        from: 'beam offset 0',
        to: 'one lap',
        duration: '1.96s, or 3.1s for line',
        easing: 'package CSS animation',
        delay: 'none',
      },
      {
        name: 'pulse',
        trigger: '`pulse-inner` or `pulse-outside`',
        from: 'glow in',
        to: 'glow out',
        duration: 'multi-layer drift, no single loop length',
        easing: 'JS oscillators: inner about 1.6 to 3.6s; outside opacity about 1.9 to 3.6s; outside x/y about 3.3 to 4.3s; outside width/height about 5.2 to 9.0s',
        delay: 'pulse-outside uses the five `--sub-*` vars',
      },
    ],
    gotchas: [
      'The chat inner div uses `boxSizing: \'border-box\'` so the box stays 348×122 and the send control stays 28×28.',
      '`pulse-outside` passes `--sub-glow-offset-x`, `--sub-glow-offset-y`, `--sub-core-blur`, `--sub-bloom-blur`, and `--sub-glow-opacity-mul`.',
      'Small is labelled Pro-locked. The 36×36 icon example stays. ocean, sunset, forest, candy, ice, and gold are labelled Pro-locked. The card opens on #171717. mono ::before and ::after filters are none.',
    ],
    setup:
      'Peer is React. The module is `border-beam@1.4.1`. Strength starts at 1. The MIT text and the React LICENSE sit in front of the bundle.',
    checklist: [
      'Default size is md, color is colorful, theme is dark, strength is 1. The stage is #171717 and the host is width 100%.',
      'md beam-spin is 1.96s linear. beam-hue-shift is 12s ease-in-out. beam-fade-in is 0.6s ease. beam-fade-out is 0.5s ease.',
      'pulse-inner and pulse-outside wrap the 250×94 radius-16 demo card. The glow is unsynchronised multi-layer drift driven by JS oscillators with different periods and no single loop length. Inner layer periods are about 1.6 to 3.6s. Outside opacity layers are about 1.9 to 3.6s. Outside x/y position layers are about 3.3 to 4.3s. Outside width/height layers are slower, about 5.2 to 9.0s.',
      'The chat is 348×122 and the send control is 28×28.',
    ],
  },
  'liquid-metal': {
    motion:
      'The card opens on the v2 composer, which runs with `useMetalBend`. The Live mode New pill is a later row at 0.72. The playground circle starts paused (`metal.tsx` line 237, `useState(true)`). Pause freezes shader time on the current frame. Play resumes from that frame. Pause state is per specimen. The v2 circle and the playground receive strength 0.81.',
    content:
      'Default is the v2 composer: chromatic, 40×40 circle, Auto reflection, `innerShadow`, `useMetalBend`, strength 0.81, running (`metal.tsx` lines 233 and 258, `metal-examples-v2.tsx` line 59 and lines 87–94). The Live mode New pill is `MetalBadge` at 0.72. The playground is Search plus a 40×40 circle and starts paused. Pause on the mounted specimen holds the current frame and stops shader time. The label is Play while paused and Pause while running. The v1 gold row is `metal-fx@1.0.4` and is not rendered. The 140×40 strength-1 button is the package default. Light theme is a package option, not on the original. Child text stays `#f8f8f8`.',
    states: [
      {
        name: 'running',
        trigger: 'mount',
        from: 'v2 composer',
        to: 'shared rAF',
        duration: 'speed 1',
        easing: '',
        delay: 'useMetalBend on the send circle',
      },
      {
        name: 'paused',
        trigger: 'Pause',
        from: 'current frame',
        to: 'held frame',
        duration: 'until Play',
        easing: '',
        delay: 'Pause freezes shader time on the current frame. Play resumes from that frame. Pause state is per specimen.',
      },
    ],
    gotchas: [
      'v2 composer (`metal-examples-v2.tsx` line 59 and lines 87–94, opened by `metal.tsx` lines 233 and 258): chromatic, innerShadow, useMetalBend, reflection on Auto, running, strength 0.81.',
      'Live mode New pill (`metal-examples-v2.tsx` line 108): MetalBadge multiplies page strength 0.9 by metalOpacity 0.8, so the pill is 0.72. It is not the composer circle.',
      'Playground (`metal.tsx` CircleStageV2 lines 169 and 177–186, paused at line 237): Search reflection, innerShadow, useMetalBend, starts paused, strength 0.81. Pause freezes the mounted specimen, including the v2 composer and the package default. Shader time stops, and Play continues from the same frame.',
      'The v1 gold row is metal-fx@1.0.4 and is not rendered on this card.',
      'The 140×40 strength-1 button is the package default. Light theme is a package option, not on the original.',
      'Do not recolor the child to `#111111`.',
    ],
    setup:
      'Peer is React. The module is `metal-fx@2.0.11`. WebGL2 is probed inside `MetalFx`. `useMetalBend` is the package bend. The MIT text, the React LICENSE, and the package NOTICE sit in front of the bundle.',
    checklist: [
      'The default specimen is the v2 composer: chromatic, innerShadow, useMetalBend, reflection on Auto, running, strength 0.81.',
      'The Live mode New pill is 0.72. The playground circle is a separate row and starts paused. Pause freezes shader time on the current frame. Play resumes from that frame. Pause state is per specimen.',
      'The 140×40 strength-1 button is labelled package default. The v1 gold row is not rendered.',
    ],
  },
};

function buildGooeyPlusPrompt(): string {
  return `# AGENT_PROMPT — Gooey plus menu

## Goal

Recreate a **gooey plus menu**:

- Closed: one white circular hub with a dark \`+\` icon.
- Open: hub rotates to \`×\`; three satellite buttons fan out (New file, Add image, New folder) with dark outline icons.
- While discs are near each other, the white surfaces **melt / bridge** like liquid.
- Icons and labels stay **crisp** (never run the goo filter over the real UI).

## Visual tokens (exact)

| Token | Value |
| --- | --- |
| Stage background | \`#f9f9f9\` |
| Liquid fill | \`#ffffff\` |
| Icon / stroke color | \`#17181c\` |
| Button size | 40×40px, \`border-radius: 50%\`, **transparent background** |
| Group size | 200×140px |
| Slot rest position | \`left: 80px; top: 80px\` (all four stacked) |
| Open offsets | New file \`-54,-34\`; Add image \`0,-64\`; New folder \`54,-34\`; hub \`0,0\` |
| Goo blur | \`6\` (feGaussianBlur stdDeviation) |
| Goo contrast | \`18\` (feColorMatrix alpha slope) |
| Contrast intercept | \`-8.67\` (≈ \`-(contrast/2 - 0.5)\`) |
| Open motion | 550ms, \`cubic-bezier(0.34, 1.56, 0.64, 1)\`, stagger \`40\` then \`'ms'\` |
| Close motion | 250ms, \`cubic-bezier(0.22, 1, 0.36, 1)\`, stagger 0 |
| Plus rotate | 0° → 45° over 250ms ease-in-out when open |
| Icon reveal | opacity 0→1 + blur 2px→0; open delay \`(120 + i * stagger) + 'ms'\` |
| Shadow | \`0 0 0 1px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.05), 0 4px 42px rgba(0,0,0,.06)\` on the SVG layer |
| Reduced motion | all transitions duration 0 / none |

## Architecture (must follow)

You cannot blur+contrast the real buttons — that softens icons and breaks Safari when using CSS \`filter: url(#...)\` on HTML.

Use **two layers**:

1. **Silhouette (behind)** — SVG with one white circle (r=20) per item, all sharing a goo filter on the SVG \`<g>\`. Drop-shadow on the SVG element.
2. **Content (above)** — real \`<button>\`s with transparent backgrounds and crisp SVG icons.

Toggle open/close by applying the **same** \`translate(x,y)\` to each content slot **and** its matching SVG circle so the liquid and icons stay pixel-synced.

### Goo filter (copy exactly)

\`\`\`svg
<filter id="goo" filterUnits="userSpaceOnUse" x="-80" y="-80" width="360" height="300" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
  <feColorMatrix in="blur" type="matrix" values="
    1 0 0 0 0
    0 1 0 0 0
    0 0 1 0 0
    0 0 0 18 -8.67" result="goo" />
  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
</filter>
\`\`\`

If pieces that should merge look separate, raise blur or reduce gap — bridging starts roughly when blur ≳ gap between discs.

## Interaction

- Click hub: toggle open/closed; \`aria-expanded\` + \`aria-label\` (\`Open menu\` / \`Close menu\`).
- Satellite buttons: \`tabindex="-1"\` when closed, \`tabindex="0"\` when open; click closes menu.
- Prefer \`prefers-reduced-motion: reduce\` → instant snaps.

## Document

The asset is this HTML document:

\`\`\`html
${GOOEY_PLUS_CLOSED_NETWORK_HTML}
\`\`\`

## States

- **closed** — \`apply(false)\` on load. satellites stacked at left 80px, top 80px, offsets \`{ x: 0, y: 0 }\`. held until the hub click. 0ms when reduced motion is set
- **open** — hub click while closed. offsets \`{ x: -54, y: -34 }\`, \`{ x: 0, y: -64 }\`, \`{ x: 54, y: -34 }\`, hub \`{ x: 0, y: 0 }\`. 550ms. cubic-bezier(0.34, 1.56, 0.64, 1). delay \`(i * 40) + 'ms'\` for the first three
- **close** — hub click while open, or a satellite click. those offsets return to \`{ x: 0, y: 0 }\`. 250ms. cubic-bezier(0.22, 1, 0.36, 1). delay 0ms
- **plus** — \`.liquid.is-open .plus\` rotates to 45deg. 250ms. ease-in-out
- **icons** — opacity 0 and blur(2px) to opacity 1 and blur(0). the open rule is 180ms. the base rule is 120ms. open delay is \`(120 + i * stagger) + 'ms'\`, otherwise 0ms
- **surface** — stage #f9f9f9, fill #ffffff, icons #17181c. group 200px by 140px. buttons 40px. shadow rgba(0,0,0,.06), rgba(0,0,0,.05), and rgba(0,0,0,.06)

## Gotchas

- The goo filter stays on the SVG circles. The buttons are a second layer with transparent backgrounds, so the icons stay crisp.
- Reduced motion writes transition \`none\` and duration 0ms, and the stylesheet sets \`.slot\`, \`.plus\`, \`.sat-icon\`, and \`.blob\` to \`transition: none\`.
- Satellite buttons use \`tabindex="-1"\` while closed and \`tabindex="0"\` while open. A satellite click sets open false. The hub aria-label is \`Open menu\` or \`Close menu\`.
- Blob transform-origin is the literal \`100px 100px\`.

## Setup

Stage background \`#f9f9f9\`. Group 200px by 140px. Buttons 40px by 40px, transparent, border-radius 50%. Rest slot \`left: 80px; top: 80px\`. Filter id \`goo\`: feGaussianBlur stdDeviation 6, then a color matrix with alpha slope 18 and intercept -8.67. Icon colour \`#17181c\`. The SVG shadow is \`0 0 0 1px rgba(0,0,0,.06)\`, \`0 2px 6px rgba(0,0,0,.05)\`, and \`0 4px 42px rgba(0,0,0,.06)\`.

## Checklist

- [ ] Discs are 40px, fill #ffffff, icons #17181c, on a stage of #f9f9f9
- [ ] Rest slot is left 80px and top 80px inside a 200px by 140px group
- [ ] Open is 550ms with cubic-bezier(0.34, 1.56, 0.64, 1). Close is 250ms with cubic-bezier(0.22, 1, 0.36, 1)
- [ ] The plus rotates 45deg over 250ms ease-in-out
- [ ] Icons use 120ms and 180ms with blur 2px. The filter blur is stdDeviation 6 and the alpha slope is 18
- [ ] Reduced motion sets those transitions to none

## Out of scope

Do not invent a second menu or a different icon set.
`;
}

/** Full custom prompts that replace the short LOCK template. */
const FULL_PROMPTS: Record<string, () => string> = {
  'gooey-plus-menu': buildGooeyPlusPrompt,
  'abrar-overview': () => abrarOverviewPrompt,
};

function filled(value: string | undefined): string {
  return value?.trim() ?? '';
}

function statesTable(states: readonly PromptState[] | undefined): string {
  const rows = (states ?? []).filter((state) => filled(state.name));
  if (rows.length === 0) return '## States\n\nNone.';
  const header = '| State | Trigger | From | To | Duration | Easing | Delay |';
  const rule = '| --- | --- | --- | --- | --- | --- | --- |';
  const body = rows
    .map(
      (state) =>
        `| ${filled(state.name)} | ${filled(state.trigger)} | ${filled(state.from)} | ${filled(state.to)} | ${filled(state.duration)} | ${filled(state.easing)} | ${filled(state.delay)} |`,
    )
    .join('\n');
  return `## States\n\n${header}\n${rule}\n${body}`;
}

function statesSection(states: readonly PromptState[] | undefined): string {
  if (!states || states.length === 0) return '';
  const lines = states
    .filter((state) => filled(state.name))
    .map((state) => {
      const from = filled(state.from);
      const to = filled(state.to);
      const change = from && to ? `${from} → ${to}` : from || to;
      const bits = [filled(state.trigger), change, filled(state.duration), filled(state.easing), filled(state.delay)].filter(
        (bit) => bit.length > 0,
      );
      return bits.length ? `- **${filled(state.name)}** — ${bits.join('. ')}` : `- **${filled(state.name)}**`;
    });
  if (lines.length === 0) return '';
  return `## States\n\n${lines.join('\n')}`;
}

function listSection(title: string, items: readonly string[] | undefined, marker: string): string {
  if (!items || items.length === 0) return '';
  const lines = items.map((item) => item.trim()).filter((item) => item.length > 0);
  if (lines.length === 0) return '';
  return `## ${title}\n\n${lines.map((item) => `${marker}${item}`).join('\n')}`;
}

function setupSection(setup: string | undefined): string {
  const text = filled(setup);
  if (!text) return '';
  return `## Setup\n\n${text}`;
}

const ORB_PROMPT_IDS = new Set([
  'orb-agent-listening',
  'orb-agent-planning',
  'orb-agent-shaping',
  'orb-agent-thinking',
  'orb-searching',
  'orb-solving',
  'orb-state-picker',
  'orb-thinking',
  'orb-working',
]);

/** Generic cards whose prompt is the pasted Copy, not the shared rebuild brief. */
const COPY_PROMPT_IDS = new Set([
  'card-resize',
  'number-pop-in',
  'notification-badge',
  'text-states-swap',
  'menu-dropdown',
  'confetti-burst',
  'modal-open-close',
  'gooey-plus-menu',
  'page-side-by-side',
  'icon-swap',
  'success-check',
  'avatar-group-hover',
  'card-stack-hover',
  'error-state-shake',
  'input-clear-dissolve',
  'skeleton-reveal',
  'texts-reveal',
  'tabs-sliding',
  'shimmer-text',
  'tooltip-open-close',
  'tilt-3d',
  'preview-tools',
]);

/** Generic cards on the canonical section order. Grows one batch at a time. */
export const CANONICAL_IDS = new Set<string>([
  'modal-open-close',
  'confetti-burst',
  'notification-badge',
  'success-check',
  'number-pop-in',
  'avatar-group-hover',
  'card-stack-hover',
  'tabs-sliding',
  'texts-reveal',
  'input-clear-dissolve',
  'menu-dropdown',
  'tooltip-open-close',
]);

function buildPrompt(id: string): string {
  if (FULL_PROMPTS[id]) return FULL_PROMPTS[id]();

  const item = TRANSITIONS.find((entry) => entry.id === id);
  const lock = LOCKS[id];
  if (!item || !lock) return '';

  const parts = previewDocumentParts(id);
  const scriptText = parts.script || HTML_CSS_ONLY_NOTE;
  const stage = filled(lock.content);
  const orbPrompt = ORB_PROMPT_IDS.has(id);
  const copyPrompt = COPY_PROMPT_IDS.has(id);
  const subtitle = orbPrompt ? item.subtitle.replace(/ from the preview$/, '') : item.subtitle;
  const blocks = [
    `# AGENT_PROMPT — ${item.title}`,
    orbPrompt || copyPrompt
      ? ''
      : `Closed-network rebuild brief. This document is the source of truth.

- Do not fetch external pages, docs, or product sites.
- Do not invent demos beyond this piece.`,
    `## Piece

- id: \`${item.id}\`
- title: ${item.title}
- subtitle: ${subtitle}`,
    stage ? `## Stage content\n\n${stage}` : '',
    `## ${orbPrompt ? 'Animation spec' : 'Motion lock'}\n\n${lock.motion}`,
    statesSection(lock.states),
    listSection('Gotchas', lock.gotchas, '- '),
    setupSection(lock.setup),
    `## Copy HTML

\`\`\`html
${parts.html}
\`\`\``,
    `## Copy CSS

\`\`\`css
${parts.css}
\`\`\``,
    `## Copy script

\`\`\`js
${scriptText}
\`\`\``,
    listSection('Checklist', lock.checklist, '- [ ] '),
    `## Out of scope

Do not invent demos beyond this piece.`,
  ];
  return blocks.filter((block) => block.trim().length > 0).join('\n\n');
}

function buildCanonicalPrompt(id: string): string {
  const item = TRANSITIONS.find((entry) => entry.id === id);
  const lock = LOCKS[id];
  if (!item || !lock) return '';

  const parts = previewDocumentParts(id);
  const scriptText = parts.script || HTML_CSS_ONLY_NOTE;
  const blocks = [
    `# AGENT_PROMPT — ${item.title}`,
    `## Piece

- id: \`${item.id}\`
- title: ${item.title}
- subtitle: ${item.subtitle}`,
    `## Stage content\n\n${filled(lock.content)}`,
    `## Geometry and values\n\n${filled(lock.geometry)}`,
    statesTable(lock.states),
    `## Timing\n\n${filled(lock.timing)}`,
    `## Reduced motion\n\n${filled(lock.reducedMotion)}`,
    listSection('Gotchas', lock.gotchas, '- '),
    setupSection(lock.setup),
    `## Known gaps\n\n${filled(lock.knownGaps)}`,
    listSection('Checklist', lock.checklist, '- [ ] '),
    `## Code

### HTML

\`\`\`html
${parts.html}
\`\`\`

### CSS

\`\`\`css
${parts.css}
\`\`\`

### Script

\`\`\`js
${scriptText}
\`\`\``,
  ];
  return blocks.filter((block) => block.trim().length > 0).join('\n\n');
}

export const AGENT_PROMPTS: Record<string, string> = Object.fromEntries(
  TRANSITIONS.map((item) => [item.id, CANONICAL_IDS.has(item.id) ? buildCanonicalPrompt(item.id) : buildPrompt(item.id)]),
);

export function promptFor(id: string): string {
  return AGENT_PROMPTS[id] ?? '';
}
