import abrarOverviewPrompt from './demos/abrar-overview/AGENT_PROMPT.md';
import { TRANSITIONS } from './catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import { HTML_CSS_ONLY_NOTE, previewDocumentParts } from '@/src/closedNetwork/previewSources';
import { ORB_LOCKS } from '@/src/closedNetwork/orbLocks';
import { TILT_RN } from './demos/tiltMotion';

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
  rn: string;
  states?: readonly PromptState[];
  gotchas?: readonly string[];
  setup?: string;
  checklist?: readonly string[];
};

const LOCKS: Record<string, PromptLock> = {
  'card-resize': {
    motion:
      '`.t-resize` starts at width 148px and height 100px. Resize writes 88px by 64px, then 148px by 100px. Width and height transition over `--resize-dur: 300ms` with `--resize-ease: cubic-bezier(0.22, 1, 0.36, 1)`.',
    rn: 'Reanimated width/height timing in `CardResizeDemo`. Copy emits portable CSS `.t-resize`.',
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
      'Each `.t-digit` runs `@keyframes t-digit-in` for `--digit-dur: 500ms` with `--digit-ease: cubic-bezier(0.22, 1, 0.36, 1)`. The from frame is `perspective(400px) rotateX(var(--digit-tilt))`, opacity 0, `blur(var(--digit-blur))`. `--digit-tilt` is 80deg and `--digit-blur` is 2px. Delay is `calc(var(--digit-stagger) * (n - 1))` and `--digit-stagger` is 50ms. Replay rewrites the row.',
    content: '`6 5. 7 8`, then `1 4. 0 2`, then `9 3. 6 1`. A space is a `.t-digit.gap`.',
    rn: 'Reanimated per-digit rotateX. Copy HTML lists each character. Copy CSS is `.t-digit` / `t-digit-in`. Copy script cycles the three sets.',
    states: [
      {
        name: 'enter',
        trigger: 'mount and each Replay, which rewrites the row and restarts `t-digit-in`',
        from: 'perspective(400px) rotateX(80deg), opacity 0, blur(2px)',
        to: 'opacity 1 and filter none',
        duration: '500ms (`--digit-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--digit-ease`)',
        delay: 'nth-child n waits calc(var(--digit-stagger) * (n - 1)), and `--digit-stagger` is 50ms',
      },
    ],
    gotchas: [
      'The row is font-size 42px. A space is `.t-digit.gap` with width 6px.',
      'Reduced motion sets the animation to none.',
      'Replay advances the set index modulo 3. There is no separate exit keyframe.',
    ],
    setup:
      'The sets are `6 5. 7 8`, `1 4. 0 2`, and `9 3. 6 1`. Replay writes one `.t-digit` per character. `@keyframes t-digit-in` uses `--digit-dur: 500ms`, `--digit-blur: 2px`, `--digit-tilt: 80deg`, and perspective 400px.',
    checklist: [
      'The three sets play in that order, and a space is a 6px gap.',
      'Each digit runs `t-digit-in` for 500ms with cubic-bezier(0.22, 1, 0.36, 1), delayed by 50ms steps.',
      'Reduced motion sets the animation to none.',
    ],
  },
  'notification-badge': {
    motion:
      '`.t-badge` rests at `translate(var(--badge-offset-x), var(--badge-offset-y)) scale(0.4)` and opacity 0. `--badge-offset-x` is -8.2px and `--badge-offset-y` is 12.4px. Leaving `.is-on` uses `--badge-slide-dur: 260ms`. `.is-on` moves to `translate(0, 0) scale(1)` over `--badge-pop-dur: 500ms`. Opacity is 180ms on both.',
    content: 'Count `1` on `#e23d2d`. Starts without `.is-on`. Click the bell toggles it.',
    rn: 'Shared-value translate + scale. Copy CSS is `.t-badge`. Copy script toggles `.is-on`.',
    states: [
      {
        name: 'off',
        trigger: 'a bell click that removes `.is-on`',
        from: 'translate(0, 0) scale(1), opacity 1',
        to: 'translate(-8.2px, 12.4px) scale(0.4), opacity 0',
        duration: 'transform `--badge-slide-dur: 260ms`, opacity 180ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--badge-slide-ease`)',
        delay: '',
      },
      {
        name: 'on',
        trigger: 'a bell click that adds `.is-on`',
        from: 'translate(-8.2px, 12.4px) scale(0.4), opacity 0',
        to: 'translate(0, 0) scale(1), opacity 1',
        duration: 'transform `--badge-pop-dur: 500ms`, opacity 180ms',
        easing: 'cubic-bezier(0.34, 1.36, 0.64, 1) (`--badge-pop-ease`); opacity uses cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'badge',
        trigger: '',
        from: '',
        to: 'min-width 18px, height 18px, padding 0 4px, border-radius 9px, background #e23d2d, color #fff, top -4px, right -4px',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The count is the string `1`. The bell button is 48px by 48px with border-radius 12px.',
      'Reduced motion sets the badge transition to none.',
    ],
    setup:
      '`.t-badge` is position absolute, top -4px, right -4px, min-width 18px, height 18px, padding 0 4px, border-radius 9px, background #e23d2d, color #fff. The bell click toggles `.is-on`.',
    checklist: [
      'Off is translate(-8.2px, 12.4px) scale(0.4) and opacity 0, over 260ms.',
      'On is translate(0, 0) scale(1) and opacity 1, transform over 500ms, opacity over 180ms.',
      'The badge is min-width 18px, height 18px, padding 0 4px, on #e23d2d.',
    ],
  },
  'text-states-swap': {
    motion:
      '`.t-text-swap` transitions transform, filter, and opacity over `--text-swap-dur: 250ms` with `--text-swap-ease: ease-in-out`. `.is-exit` is `translateY(calc(var(--text-swap-translate-y) * -1))` and `blur(var(--text-swap-blur))`. `.is-enter-start` is `translateY(var(--text-swap-translate-y))` and the same blur. `--text-swap-translate-y` is 4px and `--text-swap-blur` is 2px.',
    content: '`Transaction processing...` then `Transaction completed`.',
    rn: 'Copy CSS is `.t-text-swap`. Copy script waits 250ms before swapping the string.',
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
      '`.t-dropdown` starts at `scale(var(--dropdown-pre-scale))` and opacity 0. `--dropdown-pre-scale` and `--dropdown-closing-scale` are 0.94. `.is-open` scales to 1 and fades to opacity 1 over `--dropdown-open-dur: 180ms`. `.is-closing` returns to scale 0.94 over `--dropdown-close-dur: 180ms`. Easing is `--dropdown-ease: cubic-bezier(0.22, 1, 0.36, 1)`. Origin is `var(--dropdown-origin, top left)`.',
    content: 'Trigger reads `Open menu` / `Close menu`. Items: `New file` / `Add image` / `New folder`. Starts closed.',
    rn: 'Copy CSS is `.t-dropdown`. Copy script toggles `.is-open` / `.is-closing` and the trigger label.',
    states: [
      {
        name: 'closed',
        trigger: 'the trigger click while open',
        from: 'scale 1, opacity 1',
        to: 'scale(0.94), opacity 0, class `is-closing`',
        duration: '180ms (`--dropdown-close-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--dropdown-ease`)',
        delay: '',
      },
      {
        name: 'open',
        trigger: 'the trigger click while closed',
        from: 'scale(0.94), opacity 0',
        to: 'scale 1, opacity 1, class `is-open`',
        duration: '180ms (`--dropdown-open-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
      {
        name: 'menu',
        trigger: '',
        from: '',
        to: 'top 40px, left 0, min-width 168px, border-radius 12px, padding 6px, background #fff',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'transform-origin is `var(--dropdown-origin, top left)`. Item buttons are padding 8px 10px, border-radius 8px, and font 13px. Hover background is #f3f3f3.',
      'The trigger label is `Open menu` while closed and `Close menu` while open. `aria-expanded` follows that flag.',
      'The item buttons have no click listener. Only the trigger toggles the menu. Close removes `.is-open`, adds `.is-closing`, then removes `.is-closing` after `reduce ? 0 : 180`.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      '`.t-dropdown` is position absolute, top 40px, left 0, min-width 168px, background #fff, border-radius 12px, padding 6px. The trigger click toggles `.is-open` and `.is-closing` and the label.',
    checklist: [
      'Closed scale is 0.94 and opacity is 0.',
      'Open and close are both 180ms with cubic-bezier(0.22, 1, 0.36, 1).',
      'Items are `New file`, `Add image`, and `New folder`. Only the trigger toggles the menu.',
    ],
  },
  'confetti-burst': {
    motion:
      'Celebrate spawns 18 `.t-confetti-piece` bits, each 6px by 8px. The loop adds `--confetti-gravity` (1800) to vy, steps x and y, and when y passes the floor sets y to the floor and multiplies vy by `--confetti-bounce` (0.35). The floor is `rect.top - host.top - 8`. Spread is `--confetti-spread: 46deg`.',
    content: 'Button label `Celebrate`. 18 bits. The floor is `rect.top - host.top - 8`.',
    rn: 'Reanimated particles, not a full physics engine. Copy emits `.t-confetti-piece` tokens.',
    states: [
      {
        name: 'piece',
        trigger: '',
        from: '',
        to: 'each bit is width 6px, height 8px, border-radius 1px, colours #ff5a5f, #f5c518, #2ecc71, #4da3ff, #b07cff, #ff8a3d',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'burst',
        trigger: 'Celebrate, and also the launch on load',
        from: 'x at the button centre, y at rect.top - host.top - 8',
        to: 'y held on that floor after a bounce of 0.35, vx multiplied by 0.72',
        duration: 'requestAnimationFrame, gravity `--confetti-gravity` 1800',
        easing: '',
        delay: '',
      },
      {
        name: 'reduced',
        trigger: 'prefers-reduced-motion',
        from: 'the spawned bits',
        to: '`.t-confetti-piece` is display none, so the pieces stay hidden',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'The host is width 280px and height 220px. The button sits at bottom 28px.',
      'The floor expression is `rect.top - host.top - 8`. That 8 is a raw subtraction, not an 8px length.',
      'Angle is `-Math.PI / 2 + (i / 17 - 0.5) * spread`. Speed is `380 + (i % 5) * 50`. Rotation starts at `(i * 37) % 180` and adds `160 * dt`.',
      'Reduced motion writes the floor translate and returns. The stylesheet also sets `.t-confetti-piece` to display none.',
    ],
    setup:
      '`.burst` is 280px by 220px. Each piece is 6px by 8px with border-radius 1px. `--confetti-gravity` is 1800, `--confetti-bounce` is 0.35, and `--confetti-spread` is 46deg. The floor is `rect.top - host.top - 8`.',
    checklist: [
      'A burst spawns 18 bits coloured #ff5a5f, #f5c518, #2ecc71, #4da3ff, #b07cff, and #ff8a3d.',
      'Each bit is 6px by 8px. Gravity is 1800 and bounce is 0.35.',
      'The rest Y is `rect.top - host.top - 8` on every frame that crosses the floor.',
    ],
  },
  'modal-open-close': {
    motion:
      '`.t-modal` starts at `scale(var(--modal-scale))` and opacity 0. `--modal-scale` is 0.94. `.is-open` scales to 1 and fades in over `--modal-open-dur: 200ms`. `.is-closing` returns to that scale over `--modal-close-dur: 200ms`. Easing is `--modal-ease: cubic-bezier(0.22, 1, 0.36, 1)`. The backdrop background is rgba(0,0,0,.28).',
    content: 'Title `New project`. Body `Scale from 0.94 with a 200ms fade.` The backdrop starts `hidden`.',
    rn: 'Copy CSS is `.t-modal`. Copy script shows and hides the backdrop.',
    states: [
      {
        name: 'panel',
        trigger: '',
        from: '',
        to: '.panel width 280px, border-radius 16px, padding 20px, background #fff. .backdrop background rgba(0,0,0,.28)',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'closed',
        trigger: 'the Close button',
        from: 'scale 1, opacity 1, class `is-open`',
        to: 'scale(var(--modal-scale)) 0.94, opacity 0, class `is-closing`, then `hidden`',
        duration: '200ms (`--modal-close-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--modal-ease`)',
        delay: '',
      },
      {
        name: 'open',
        trigger: 'the Toggle modal button',
        from: 'scale(0.94), opacity 0',
        to: 'scale 1, opacity 1, class `is-open`',
        duration: '200ms (`--modal-open-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
    ],
    gotchas: [
      'Close does not listen on the backdrop. It adds `.is-closing` and sets `hidden` after `reduce ? 0 : 200`.',
      'The panel text colour on the paragraph is #6c6c6c. The title is `New project`.',
      'Reduced motion uses the 0 timeout. The stylesheet does not animate the backdrop background.',
    ],
    setup:
      '`.backdrop` is position fixed, inset 0, background rgba(0,0,0,.28), and starts `hidden`. `.panel` is width 280px, background #fff, border-radius 16px, padding 20px. Toggle modal calls paint(true). Close calls paint(false).',
    checklist: [
      'The panel is 280px wide, border-radius 16px, padding 20px.',
      'The backdrop background is rgba(0,0,0,.28).',
      'Open and close both last 200ms, scaling between 0.94 and 1 with cubic-bezier(0.22, 1, 0.36, 1).',
    ],
  },
  'gooey-plus-menu': {
    motion: 'SVG goo plus menu. blur 6 / contrast 18 / fill #fff. Open 550ms, close 250ms. Stagger is the number 40 joined to ms.',
    content: '`+` hub + New file / Add image / New folder icons. White liquid surface; dark crisp icons.',
    rn: 'Closed network: hand-rolled SVG filter (no npm). Live store web demo may use liquid-gooey. Copy HTML, Copy CSS, and Copy script split the zero-dependency document. None of them copies the whole file.',
  },
  'page-side-by-side': {
    motion:
      '`.t-page` transitions transform and opacity over `--page-slide-dur: 300ms` with `--page-slide-ease: cubic-bezier(0.22, 1, 0.36, 1)`. `.is-exit` is `translateX(calc(var(--page-slide-distance) * -1))` and opacity 0. `.is-enter` is `translateX(var(--page-slide-distance))` and opacity 0. `--page-slide-distance` is 24px.',
    content: 'First page `BNB` / `$66.11`. Second page `$10` / `$66.11 available`.',
    rn: 'Copy CSS is `.t-page`. Copy script swaps the two pages after 300ms.',
    states: [
      {
        name: 'exit',
        trigger: 'Next page adds `.is-exit`',
        from: 'translateX 0, opacity 1',
        to: 'translateX(calc(var(--page-slide-distance) * -1)), --page-slide-distance 24px, opacity 0',
        duration: '300ms (`--page-slide-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--page-slide-ease`)',
        delay: '',
      },
      {
        name: 'enter',
        trigger: 'the timeout, which writes the next pair and adds `.is-enter`, then removes it on the next frames',
        from: 'translateX(24px), opacity 0',
        to: 'translateX 0, opacity 1',
        duration: '300ms (`--page-slide-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '300ms, the setTimeout before the swap',
      },
      {
        name: 'pager',
        trigger: '',
        from: '',
        to: '.pager width 220px, height 120px, border-radius 14px, background #fff',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'There is no blur. The timeout is `reduce ? 0 : 300`.',
      'The page is font-size 18px. The second line is font-size 13px and colour #6c6c6c.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      'The pairs are `BNB` / `$66.11` and `$10` / `$66.11 available`. `.pager` is 220px by 120px, border-radius 14px. Next page adds `.is-exit`, waits 300ms, then swaps the pair through `.is-enter`.',
    checklist: [
      'The push is 24px over 300ms with cubic-bezier(0.22, 1, 0.36, 1).',
      'The first page is `BNB` and `$66.11`. The second is `$10` and `$66.11 available`.',
      'Reduced motion uses a 0 timeout and transition none.',
    ],
  },
  'icon-swap': {
    motion:
      'Both `.t-icon` layers transition opacity, filter, and transform over `--icon-swap-dur: 250ms` with `--icon-swap-ease: ease-in-out`. `.is-out` is opacity 0, `blur(var(--icon-swap-blur))`, and `scale(var(--icon-swap-start-scale))`. `--icon-swap-blur` is 2px and `--icon-swap-start-scale` is 0.25.',
    content: 'Three-line icon swaps with an X. The X starts with `.is-out`.',
    rn: 'Copy CSS is `.t-icon`. Copy script toggles `.is-out` on the two layers.',
    states: [
      {
        name: 'shown',
        trigger: 'Swap icon removes `.is-out`',
        from: 'opacity 0, blur(2px), scale(0.25)',
        to: 'opacity 1, blur 0, scale 1',
        duration: '250ms (`--icon-swap-dur`)',
        easing: 'ease-in-out (`--icon-swap-ease`)',
        delay: '',
      },
      {
        name: 'out',
        trigger: 'Swap icon adds `.is-out`',
        from: 'opacity 1, scale 1, blur 0',
        to: 'opacity 0, blur(2px), scale(0.25)',
        duration: '250ms (`--icon-swap-dur`)',
        easing: 'ease-in-out',
        delay: '',
      },
    ],
    gotchas: [
      'The slot is 48px by 48px. Each icon is position absolute, inset 0.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      'The first `.t-icon` is the three-line mark. The second starts with `.is-out` and is the X. Swap icon toggles `.is-out` on both. `--icon-swap-dur` is 250ms, `--icon-swap-blur` is 2px, and `--icon-swap-start-scale` is 0.25.',
    checklist: [
      'Opacity, blur, and scale share one 250ms ease-in-out.',
      'The resting icon is the three-line mark.',
      '`.is-out` ends at scale 0.25 and blur 2px.',
    ],
  },
  'success-check': {
    motion:
      '`.t-check` runs `t-check-in` for `--check-opacity-dur: 500ms` with `--check-ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. The from frame is opacity 0, `translateY(var(--check-y-amount)) rotate(var(--check-rotate-from)) scale(var(--check-scale-from))`. Those are 28px, 80deg, and 0.86. `.mark` draws `t-check-draw` for the same 500ms after `--check-draw-delay: 80ms`, from `stroke-dashoffset: var(--check-dash)` to 0. `--check-dash` is 28.',
    rn: 'Copy CSS is `.t-check` and `.mark`. Copy script replays the animation.',
    states: [
      {
        name: 'in',
        trigger: 'paint, and Replay which removes `.t-check`, reads offsetWidth, and adds `.t-check`',
        from: 'opacity 0, translateY(28px), rotate(80deg), scale(0.86)',
        to: 'opacity 1, translateY(0), rotate(0), scale(1)',
        duration: '500ms (`--check-opacity-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--check-ease-out`)',
        delay: '',
      },
      {
        name: 'draw',
        trigger: 'the same `.t-check` paint, on `.mark`',
        from: 'stroke-dashoffset var(--check-dash), `--check-dash` 28',
        to: 'stroke-dashoffset 0',
        duration: '500ms (`--check-opacity-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '80ms (`--check-draw-delay`)',
      },
    ],
    gotchas: [
      'The disc is circle cx 18, cy 18, r 16, fill #1f8a4c. The stroke is #fff, stroke-width 2.4, path `M11 18.5 L16 23.5 L25 13.5`.',
      'Reduced motion sets the `.t-check` animation to none.',
      'Replay restarts the animation by removing and re-adding `.t-check`. There is no separate hide duration.',
    ],
    setup:
      'The svg is `.t-check`, 36 by 36, viewBox 0 0 36 36. Fill is #1f8a4c. `--check-y-amount` is 28px, `--check-rotate-from` is 80deg, `--check-scale-from` is 0.86, `--check-dash` is 28, and `--check-draw-delay` is 80ms.',
    checklist: [
      'The badge enters over 500ms from translateY 28px, rotate 80deg, and scale 0.86.',
      'The dash is 28 and waits 80ms, then draws over the same 500ms.',
      'The disc is #1f8a4c and the stroke is #fff.',
    ],
  },
  'avatar-group-hover': {
    motion:
      '`.t-avatar` transitions transform over `--avatar-dur: 320ms`. While the row is hovered the timing is `--avatar-ease-in: cubic-bezier(0.22, 1, 0.36, 1)`. Otherwise it is `--avatar-ease-out: cubic-bezier(0.34, 3.85, 0.64, 1)`. The script sets `translateY(lift * strength)` and `scale(1 + (peak - 1) * strength)`. `--avatar-lift` is -8px, `--avatar-scale` is 1.06, and `--avatar-falloff` is 0.45.',
    content: 'Initials JC, AK, MR, SL, TW on `#d9b8a2`, `#b7c7d9`, `#d4c4a8`, `#c5b3d6`, `#a8c5b8`.',
    rn: 'Copy CSS sets the avatar tokens. Copy script writes the distance-weighted transform.',
    states: [
      {
        name: 'rest',
        trigger: 'mouseleave calls place(null)',
        from: 'the hovered translateY and scale',
        to: 'strength 0, scale 1, zIndex 1',
        duration: '320ms (`--avatar-dur`)',
        easing: 'cubic-bezier(0.34, 3.85, 0.64, 1) (`--avatar-ease-out`)',
        delay: '',
      },
      {
        name: 'hover',
        trigger: 'mouseenter on avatar index i',
        from: 'translateY 0, scale 1',
        to: 'translateY(--avatar-lift -8px times strength), scale toward --avatar-scale 1.06, zIndex 3 when strength > 0.9',
        duration: '320ms (`--avatar-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--avatar-ease-in`)',
        delay: '',
      },
      {
        name: 'disc',
        trigger: '',
        from: '',
        to: 'width 40px, height 40px, margin-left -10px, border 2px solid #fff, colour #2a2118',
        duration: '',
        easing: '',
        delay: '',
      },
    ],
    gotchas: [
      'Strength is 0 when hot is null, otherwise `Math.max(0, 1 - Math.abs(hot - j) * falloff)` with falloff `--avatar-falloff` 0.45.',
      'The first avatar has margin-left 0. Initials are font-size 11px.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      'Each `.t-avatar` is 40px by 40px with margin-left -10px, border 2px solid #fff, and colour #2a2118. mouseenter calls place(i). mouseleave calls place(null). `--avatar-lift` is -8px and `--avatar-dur` is 320ms.',
    checklist: [
      'The hovered avatar uses lift -8px and scale 1.06. Neighbours fall off by 0.45 per step and clamp at 0.',
      'The transform transition is 320ms, ease-in cubic-bezier(0.22, 1, 0.36, 1) while hovered and ease-out cubic-bezier(0.34, 3.85, 0.64, 1) otherwise.',
      'Initials and fills are JC #d9b8a2, AK #b7c7d9, MR #d4c4a8, SL #c5b3d6, TW #a8c5b8.',
    ],
  },
  'card-stack-hover': {
    motion:
      '`.t-stack-card` transitions transform over `--stack-dur: 420ms` with `--stack-ease: cubic-bezier(0.34, 1.36, 0.64, 1)`. `.is-spread` sets card 1 to `translate(-28px, 10px) rotate(-8deg)`, card 2 to `translate(0, -6px) rotate(0deg)`, and card 3 to `translate(28px, 10px) rotate(8deg)`.',
    content: 'Labels `Card 1`, `Card 2`, `Card 3`.',
    rn: 'Copy CSS is `.t-stack-card`. Copy script toggles `.is-spread` on hover and click.',
    states: [
      {
        name: 'stacked',
        trigger: 'mouseleave, and a click that removes `.is-spread`',
        from: 'the spread transforms',
        to: 'no transform on the cards',
        duration: '420ms (`--stack-dur`)',
        easing: 'cubic-bezier(0.34, 1.36, 0.64, 1) (`--stack-ease`)',
        delay: '',
      },
      {
        name: 'spread',
        trigger: 'mouseenter, and a click that adds `.is-spread`',
        from: 'no transform',
        to: 'translate(-28px, 10px) rotate(-8deg), translate(0, -6px) rotate(0deg), translate(28px, 10px) rotate(8deg)',
        duration: '420ms (`--stack-dur`)',
        easing: 'cubic-bezier(0.34, 1.36, 0.64, 1)',
        delay: '',
      },
    ],
    gotchas: [
      'The hit target is 180px by 120px. Each card is 110px by 74px, left 35px, top 23px, border-radius 12px, background #fff.',
      '`--stack-fan: 18px` and `--stack-rot: 6deg` are declared. The spread rules use the translate and rotate literals above and do not read those two variables.',
      'Reduced motion sets the transition to none.',
    ],
    setup:
      'mouseenter adds `.is-spread`. mouseleave removes it. Click toggles it. `--stack-dur` is 420ms and `--stack-ease` is cubic-bezier(0.34, 1.36, 0.64, 1).',
    checklist: [
      'Rest has no transform. Spread is translate(-28px, 10px) rotate(-8deg), translate(0, -6px), and translate(28px, 10px) rotate(8deg).',
      'The transition is 420ms with cubic-bezier(0.34, 1.36, 0.64, 1).',
      'Labels are `Card 1`, `Card 2`, and `Card 3`.',
    ],
  },
  'error-state-shake': {
    motion:
      '`.t-shake.is-error` runs `t-shake` for `--shake-dur: 400ms` with `--shake-ease: cubic-bezier(0.36, 0.07, 0.19, 0.97)`. Keyframes: 0% translateX 0, 20% `translateX(var(--shake-distance))`, 40% `translateX(calc(var(--shake-distance) * -1))`, 60% translateX(4.2px), 80% translateX(-2.45px), 100% translateX 0. `--shake-distance` is 7px. `.is-error` also sets border-color #c43a31.',
    content: 'Input starts at `hello@`. Invalid submit shows `Please enter a valid email.` Border `#c43a31`.',
    rn: 'Copy CSS is `.t-shake`. Copy script validates the email and replays `.is-error`.',
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
      '`.t-word.is-out` is `translateY(calc(var(--clear-out-fly) * -1))`, opacity 0, and `blur(var(--clear-blur))`. `--clear-out-fly` is 12px and `--clear-blur` is 2px. The transition is `--clear-out-dur: 250ms` with `--clear-out-ease: cubic-bezier(0.22, 1, 0.36, 1)`. Clear sets `transitionDelay` to `(i * 45) + \'ms\'`. Restore sets that delay to `0ms` and removes `.is-out`.',
    content: '`search` `recent` `files`. The button is `×` while the words are showing and `+` after they clear.',
    rn: 'Copy CSS is `.t-word`. Copy script sets the stagger and toggles `.is-out`.',
    states: [
      {
        name: 'clear',
        trigger: 'the button while the words are showing',
        from: 'opacity 1, translateY 0, blur 0',
        to: 'translateY(calc(var(--clear-out-fly) * -1)), --clear-out-fly 12px, opacity 0, blur(2px), class `is-out`',
        duration: '250ms (`--clear-out-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--clear-out-ease`)',
        delay: '`(i * 45) + \'ms\'`',
      },
      {
        name: 'restore',
        trigger: 'the button while the words are cleared',
        from: 'class `is-out`',
        to: '`.is-out` removed, words `search` `recent` `files`',
        duration: '250ms (`--clear-out-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '0ms',
      },
    ],
    gotchas: [
      'The delay is the number `i * 45` joined to the string `ms`.',
      'The field is width 230px, height 40px, border-radius 12px. The button is 22px by 22px.',
      'Reduced motion sets the word transition to none.',
    ],
    setup:
      'The words are `search`, `recent`, and `files`. The button starts as `×`. Clear adds `.is-out` with delay `(i * 45) + \'ms\'` and switches the label to `+`. The next click sets delay `0ms`, removes `.is-out`, and restores `×`.',
    checklist: [
      'Clearing sets `.is-out`: translateY of `--clear-out-fly` 12px upward, opacity 0, blur 2px, over 250ms.',
      'Each word delay is `(i * 45) + \'ms\'`. Restore uses `0ms`.',
      'The button reads `×` while the words are showing and `+` after they clear.',
    ],
  },
  'skeleton-reveal': {
    motion:
      '`.t-skel` runs `t-pulse` for `--pulse-dur: 1000ms` linear infinite. The 50% frame is opacity 0.5. `.t-content` transitions opacity and filter over `--reveal-dur: 250ms` with `--reveal-ease: ease-in-out`. `.is-hidden` is opacity 0 and `blur(var(--reveal-blur))`. `--reveal-blur` is 2px.',
    content: '`Jane Cooper` / `jane.cooper@example.com`.',
    rn: 'Copy CSS is `.t-skel` / `.t-content`. Copy script reveals after 900ms and toggles on click.',
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
      'Each `.t-line` runs `t-rise` for `--stagger-dur: 280ms` with `--stagger-ease: cubic-bezier(0.22, 1, 0.36, 1)`. The from frame is `translateY(var(--stagger-distance))`, opacity 0, `blur(var(--stagger-blur))`. `--stagger-distance` is 12px and `--stagger-blur` is 3px. The second line waits `--stagger-stagger: 50ms`. Replay assigns `innerHTML` to itself so the animation restarts.',
    content: '`Pull request opened` / `Review requested from 3 teammates`.',
    rn: 'Copy CSS is `.t-line`. Copy script replays by rewriting the lines.',
    states: [
      {
        name: 'enter',
        trigger: 'mount and Replay, which rewrites `innerHTML`',
        from: 'translateY(12px), opacity 0, blur(3px)',
        to: 'transform none, opacity 1, filter none',
        duration: '280ms (`--stagger-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`--stagger-ease`)',
        delay: 'the second `.t-line` waits 50ms (`--stagger-stagger`)',
      },
    ],
    gotchas: [
      'The title is font-size 18px. The second line is font-size 14px, font-weight 500, colour #6c6c6c.',
      'Reduced motion sets the line animation to none.',
    ],
    setup:
      'The lines are `Pull request opened` and `Review requested from 3 teammates`. `@keyframes t-rise` uses `--stagger-distance: 12px`, `--stagger-blur: 3px`, `--stagger-dur: 280ms`, and `--stagger-stagger: 50ms` on the second line.',
    checklist: [
      'Line one enters immediately and line two waits 50ms.',
      'The rise is 12px with blur 3px over 280ms and cubic-bezier(0.22, 1, 0.36, 1).',
      'The strings are `Pull request opened` and `Review requested from 3 teammates`.',
    ],
  },
  'tabs-sliding': {
    motion:
      '`.t-tabs-pill` transitions transform and width over `--tabs-dur: 250ms` with `--tabs-ease: cubic-bezier(0.22, 1, 0.36, 1)`. It starts at width 86px and `translateX(3px)`. A tab click sets `width` to `offsetWidth + \'px\'` and `transform` to `translateX(offsetLeft + \'px\')`. The bar background is `--tabs-bar-bg: #f1f1f1`. The pill background is `--tabs-pill-bg: #ffffff`.',
    content: 'Labels `Overview`, `Activity`, `Settings`.',
    rn: '`TabsSlidingDemo` springs `translateX` only. Copy CSS transitions `.t-tabs-pill` transform and width over 250ms, and the copy script measures `offsetWidth` and `offsetLeft`.',
    states: [
      {
        name: 'rest',
        trigger: 'the stylesheet before the script measures',
        from: '',
        to: 'width 86px, translateX(3px), background #ffffff on a bar of #f1f1f1',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'selected',
        trigger: 'a click on Overview, Activity, or Settings, and the initial select(0)',
        from: 'the previous width and translateX',
        to: 'width from offsetWidth, translateX from offsetLeft',
        duration: '250ms (`--tabs-dur`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: '',
      },
    ],
    gotchas: [
      'The bar is border-radius 999px with padding 3px. The pill is top 3px, bottom 3px, border-radius 999px. Each button is height 28px and padding 0 14px, colour #17181c.',
      'Reduced motion sets the pill transition to none.',
    ],
    setup:
      'The pill starts at width 86px and translateX(3px). select(i) writes `b.offsetWidth + \'px\'` and `translateX(\' + b.offsetLeft + \'px\')`, and sets `aria-selected`. `--tabs-dur` is 250ms.',
    checklist: [
      'The pill starts at width 86px and translateX(3px).',
      'A tab click sets width from offsetWidth and translateX from offsetLeft over 250ms with cubic-bezier(0.22, 1, 0.36, 1).',
      'Labels are Overview, Activity, and Settings. The bar is #f1f1f1 and the pill is #ffffff.',
    ],
  },
  'drag-drop-physics': {
    motion:
      'Pointer drag follows 1:1. Scale eases to 1.05 over 150ms. On a 0.2 px/ms drag this card painted scale 1.036 at 35ms and 1.043 at 52ms. Gain is 27.9 (5.58/0.2). Speed is the last three move events; a gap above 100ms is a hold and the next move uses only the new intervals. That drag reads 0° at 18ms, -1.865° at 34.8ms, -3.241° at 51ms, -3.788° at 67.4ms, -4.174° at 84.4ms, -4.449° at 101.2ms, -4.700° at 117.1ms, -4.892° at 134.3ms, -5.039° at 151.2ms, -5.150° at 167.4ms, -5.312° at 200.5ms, -5.415° at 234.3ms, -5.493° at 267.3ms, -5.516° at 300.5ms, -5.560° at 351ms, -5.561° at 384ms, -5.565° at 400.3ms, and -5.580° at 700ms. It does not pass -5.58°. After a 250ms hold the same drag reads -5.546° at 700ms of motion and does not pass -5.58°. The 0.1 px/ms drag reads -2.351° at 117ms and -2.685° at 217ms and does not pass -2.80°. The 0.3 px/ms drag reads -5.836° at 101ms, -7.829° at 201ms, -8.244° at 301ms, and -8.341° at 400ms, and settles at -8.370°. An 80px drag over 1200ms in 36 equal steps reads -1.574° at 118.5ms and -1.863° at 1200ms, and does not pass -3.21°. A flick of 80px in three moves 5ms apart reaches the -10° clamp at 700ms. Reduced motion snaps: -5.580° at 400ms on that 0.2 px/ms drag, and -10° on a move past the clamp. Tilt holds while the pointer is idle. The chase waits 28ms, then 44% of the target up to ±5.58° uses a 6ms time constant and the rest 70ms; past ±5.58° it waits 58ms and uses 64ms. Puff blur is stdDeviation 5, stroke 36, colour rgba(132,132,132,0.48), noise baseFrequency 0.028, filterUnits userSpaceOnUse. A miss returns over 500ms with cubic-bezier(0.34, 1.56, 0.64, 1), ≈9.75% overshoot (7.8px on 80px), starting in the pointerup frame, and ignores re-grabs. A hit eases the chip out in 229ms with up to 2px blur (0.386 at 111ms) and eases the photo in over 430ms (0.132/0.507/0.774/0.942 at 111/210/277/344ms, 0.984 at 377ms). Squash reads 0.985/0.9729/0.9703 at 45/111/210ms, then 0.9748/0.9834/0.9889/0.9957 at 278/312/345/412ms, and 0.9997 by 460ms. The puff is opacity 0 at 279ms, 0.899 with drift 2.46px and scale 1.112 at 462ms, and opacity 0 with drift 9.94px and scale 1.573 at 1462ms. The photo fades from 1832ms over 211ms (opacity about 0.68/0.41/0.25/0.14/0.07 at 32/64/100/130/163ms, gone at 211ms, blur 4px). The chip respawns from 2268ms (0.512/0.951 at 30ms, 0.794/0.979 at 63ms, 0.923/0.992 at 96ms) and is fully visible at 2410ms.',
    content:
      'Board 213×192. Chip 72×72 photo at left 141, top 0, radius 12. Zone 104×104 at left 0, top 88, radius 12, 2px dashed rgba(0,0,0,0.1), background rgba(234,234,234,0.2). Chip and filled zone share shadow 0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12). While the chip centre is over the zone: border rgba(0,0,0,0.28), background rgba(234,234,234,0.55), label opacity 0.5. Label is 11px / 15px #767676, width 76, top 38 (text at 40 from the outer edge). Font stack starts with Inter, then system faces. No font download.',
    rn: 'Web pointer events and CSS. Copy loads `/parity/drag-drop-physics.js`, the same board as the live card. Grabbing cursor is on the chip only. Native `src/demos/drag-drop/index.tsx` re-exports the gesture-handler scene in `src/demos/DragDrop.tsx`.',
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
    rn: 'Base line plus a duplicate highlight line. Measure the full string width and lay the highlight line out at that width (nowrap, flex-shrink 0). The ~72px window only clips that line and translates from -window to the measured width; the inner line counter-translates so the visible slice is that part of the phrase. A window-sized text box wraps to "Gene" and the sweep never reaches the rest of the phrase. Copy emits `.t-shimmer`: inline-block, fit-content, background-size 300%, no-repeat, background-position 100% → 0% over 1200ms so the 50% peak travels the whole line.',
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
    rn: 'Copy HTML, Copy CSS, and Copy script are this document. The script starts a Worker from `WORKER_SOURCE`, which is the pixels-organic program.',
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
      '`.tip-wrap` is padding-top 40px. `.t-tt` is position absolute, top 0, and `left: var(--tt-x, 0px)`. It starts at `scale(var(--tt-scale))` and opacity 0. `--tt-scale` is 0.98. `.is-on` scales to 1 and fades to opacity 1 over `--tt-in-dur: 180ms` after `--tt-delay: 400ms`, easing `--tt-in-ease: ease-out`. `.is-off` sets transition-duration to `--tt-out-dur: 0ms` and transition-delay to 0ms. The script writes `--tt-x` as `(slot * 44) + \'px\'`. `--tt-slot` is 44px.',
    rn: 'Three triggers: Aa/Edit, ↗/Share, ···/More. The bubble travels by 44px per slot with no delay. Fade-in waits 400ms and lasts 180ms. Hide is instant. Copy CSS is `.t-tt`. Copy script sets `--tt-x`.',
    states: [
      {
        name: 'anchor',
        trigger: '',
        from: '',
        to: '.tip-wrap padding-top: 40px. .t-tt position absolute, top: 0, left: var(--tt-x, 0px), height 28px, padding 0 8px',
        duration: '',
        easing: '',
        delay: '',
      },
      {
        name: 'show',
        trigger: 'mouseenter or focus, which adds `.is-on` and sets `--tt-x` to (slot * 44) + px',
        from: 'scale(var(--tt-scale)) 0.98, opacity 0',
        to: 'scale 1, opacity 1, label Edit, Share, or More',
        duration: '180ms (`--tt-in-dur`)',
        easing: 'ease-out (`--tt-in-ease`)',
        delay: '400ms (`--tt-delay`)',
      },
      {
        name: 'hide',
        trigger: 'mouseleave or blur, which adds `.is-off`',
        from: 'opacity 1, class `is-on`',
        to: 'opacity 0',
        duration: '0ms (`--tt-out-dur`)',
        easing: '',
        delay: '0ms',
      },
    ],
    gotchas: [
      'The slot step is `--tt-slot: 44px`. The script multiplies the data-slot by 44 and appends the string px.',
      'The bubble is border-radius 8px, background #fff, colour #2f2f2f, font-size 12px. Each button is 36px by 36px, border-radius 10px, and the row gap is 8px.',
      'Reduced motion sets the `.t-tt` transition to none.',
    ],
    setup:
      '`.tip-wrap` has padding-top 40px. `.t-tt` is top 0 and `left: var(--tt-x, 0px)`. Triggers are Aa/Edit, ↗/Share, and ···/More with data-slot 0, 1, and 2. `--tt-in-dur` is 180ms, `--tt-delay` is 400ms, and `--tt-out-dur` is 0ms.',
    checklist: [
      'The bubble sits in padding-top 40px, at top 0, with left var(--tt-x, 0px).',
      'Showing waits 400ms, then runs 180ms from scale 0.98 to 1.',
      'Leaving sets the transition duration to 0ms.',
    ],
  },
  'tilt-3d': {
    motion:
      'Pointer move over `.t-tilt` eases rotateX and rotateY with `--tilt-follow: 120ms`. The script target is `(0.5 - ny) * 14` and `(nx - 0.5) * 18`. Perspective is `--tilt-perspective: 1000px`. On leave the same loop eases back with `--tilt-return: 520ms`. The glare uses `--tilt-glare-radius: 110px` and `--tilt-glare: 42ms`, and snaps onto the pointer on the frame the pointer enters. Position is clientX/clientY minus getBoundingClientRect.',
    content: 'Credit / `VISA` / `John Smith` / `4111 - 1111 - 1111 - 1111`. Dark card `#16171c`, 210×128, radius 16.',
    rn: TILT_RN,
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
    rn: 'Skia Canvas 44×44 per orb. AI skills tag. Copy emits `.t-orb`.',
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
    rn: 'SVG filter from `liquid-gooey@0.2.2`. The page is dark. The public playground starts on morph. Goo blur and Contrast are the public sliders. There is no play/pause control. The native card still runs the old tile demo. Embeds Inter (400/500, latin) as a data URI under the SIL Open Font License.',
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
    rn: 'Copy HTML, Copy CSS, and Copy script are this same pill. Guides measure data-guide controls. Draw replays stored strokes, including eraser strokes. Note markdown lists label, selector, note, and box. Do not add a second card. Do not render text chips labeled Pen, Marker, or Eraser.',
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
        to: 'swatches width 26px, height 26px, border-radius 8px; the active swatch scale(1.08) translateY(-1px)',
        duration: '',
        easing: '',
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
      '`.pt-morph` transitions width 520ms, border-radius 440ms, and transform 540ms, all cubic-bezier(0.22, 0.9, 0.16, 1).',
      'Guides draw only when the pill is open and guides are on. Stroke is #9B5CFF and stroke-width is 1.',
      'Pencil is size 1 graphite at alpha 0.85. Pen is size 6 and thins with speed. Fineliner stays size 2. Marker is size 18. Highlighter is size 28, fill #fff01f, alpha 0.75. Brush is size 14 and tapers at the lift. Fountain is size 8 with nibContrast 0.85. Eraser is size 28 and destination-out.',
      'The stage is height 520px. Sample controls use height 32px and 26px. `.pt-round` is 36px. The stage background controls use #17181c.',
    ],
    setup:
      'The pill starts closed: `.pt-morph` is 84px by 84px, border-radius 42px, scale(0.667), gradient #fbfaf9 to #f1efec. Colour starts at #111111. Guides use #9B5CFF. The note lists label, selector, note, and box.',
    checklist: [
      'Closed is an 84px by 84px pill at scale(0.667) and radius 42px.',
      'The open transition is width 520ms, border-radius 440ms, and transform 540ms, all cubic-bezier(0.22, 0.9, 0.16, 1).',
      'The active tool uses translateY(-12px). The other tools use translateY(6px) and margin-bottom -20px.',
      'A note lists label, selector, note, and box.',
    ],
  },
  'border-beam': {
    motion:
      'md and sm run beam-spin 1.96s linear and beam-fade-in 0.6s ease. Their ::before and ::after run beam-hue-shift 12s ease-in-out, filter brightness(1.3) saturate(1.2), bloom blur(8px). line runs beam-travel and beam-edge-fade 3.1s linear, beam-breathe 4s ease-in-out, beam-spike 4.1s ease-in-out, beam-spike2 5.3s ease-in-out, and beam-fade-in 0.6s ease. pulse-inner and pulse-outside fade in over 0.6s ease and loop the glow every 2.3s. Pause plays beam-fade-out 0.5s ease. Strength starts at 1. pulse-outside sets `--sub-glow-offset-x: 1px`, `--sub-glow-offset-y: 0px`, `--sub-core-blur: 10px`, `--sub-bloom-blur: 19px`, `--sub-glow-opacity-mul: 1.71`.',
    content:
      'Default size md wraps the chat, 348×122, radius 20, with a 28×28 send control (`box-sizing: border-box` on the inner row). sm is the live 36×36 icon example and is Pro-locked in the playground. line wraps the 366×42 search and passes `borderRadius` 20. pulse-inner and pulse-outside wrap the 250×94 radius-16 demo card. ocean, sunset, forest, candy, ice, and gold are Pro-locked on the original. Light is a package option, not on the original.',
    rn: 'Web CSS from `border-beam@1.4.1`. Dark on the page; light is a package option. `active` starts true. Colorful and mono are the page colors. Small is Pro-locked in the playground and stays selectable.',
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
        duration: '2.3s',
        easing: 'shared frame loop',
        delay: 'pulse-outside uses the five `--sub-*` vars',
      },
    ],
    gotchas: [
      'The chat inner div uses `boxSizing: \'border-box\'` so the live box stays 348×122 and the send control stays 28×28.',
      '`pulse-outside` passes `--sub-glow-offset-x`, `--sub-glow-offset-y`, `--sub-core-blur`, `--sub-bloom-blur`, and `--sub-glow-opacity-mul`.',
      'Small is labelled Pro-locked. The 36×36 icon example stays. ocean, sunset, forest, candy, ice, and gold are labelled Pro-locked. Light is a package option and paints the stage #f6f6f6. The card opens on #171717.',
    ],
    setup:
      'Peer is React. The module is `border-beam@1.4.1`. Strength starts at 1. The 70% slider is from the separate border-beam site. The MIT text and the React LICENSE sit in front of the bundle.',
    checklist: [
      'Default size is md, color is colorful, theme is dark, strength is 1. The stage is #171717 and the host is width 100%.',
      'md beam-spin is 1.96s linear. beam-hue-shift is 12s ease-in-out. beam-fade-in is 0.6s ease. beam-fade-out is 0.5s ease.',
      'pulse-inner and pulse-outside wrap the 250×94 radius-16 demo card and loop every 2.3s.',
      'The chat measures 348×122 and the send control measures 28×28.',
    ],
  },
  'liquid-metal': {
    motion:
      'The card opens on the v2 composer, which runs with `useMetalBend`. The Live mode New pill is a later row at 0.72. The playground circle starts paused (`metal.tsx` line 237, `useState(true)`). The v2 circle and the playground receive strength 0.81.',
    content:
      'Default is the v2 composer: chromatic, 40×40 circle, Auto reflection, `innerShadow`, `useMetalBend`, strength 0.81, running (`metal.tsx` lines 233 and 258, `metal-examples-v2.tsx` line 59 and lines 87–94). The Live mode New pill is `MetalBadge` at 0.72. The playground is Search plus a 40×40 circle and starts paused. The v1 gold row is `metal-fx@1.0.4` and is not rendered. The 140×40 strength-1 button is the package default. Light theme is a package option, not on the original. Child text stays `#f8f8f8`.',
    rn: 'WebGL2 from `metal-fx@2.0.11`. Dark on the page; light is a package option. The v2 composer mounts running. The playground starts paused. The next specimen mounts only after the previous `MetalFx` unmounts.',
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
        trigger: 'playground',
        from: 'useState(true)',
        to: 'last frame held',
        duration: 'until Play',
        easing: '',
        delay: 'metal.tsx line 237; the v2 composer does not pass paused',
      },
    ],
    gotchas: [
      'v2 composer (`metal-examples-v2.tsx` line 59 and lines 87–94, opened by `metal.tsx` lines 233 and 258): chromatic, innerShadow, useMetalBend, reflection on Auto, running, strength 0.81.',
      'Live mode New pill (`metal-examples-v2.tsx` line 108): MetalBadge multiplies page strength 0.9 by metalOpacity 0.8, so the pill is 0.72. It is not the composer circle.',
      'Playground (`metal.tsx` CircleStageV2 lines 169 and 177–186, paused at line 237): Search reflection, innerShadow, useMetalBend, starts paused, strength 0.81.',
      'The v1 gold row is metal-fx@1.0.4 and is not rendered on this card.',
      'The 140×40 strength-1 button is the package default. Light theme is a package option, not on the original.',
      'Do not recolor the child to `#111111`.',
    ],
    setup:
      'Peer is React. The module is `metal-fx@2.0.11`. WebGL2 is probed inside `MetalFx`. `useMetalBend` is the package bend. The MIT text, the React LICENSE, and the package NOTICE sit in front of the bundle.',
    checklist: [
      'The default specimen is the v2 composer: chromatic, innerShadow, useMetalBend, reflection on Auto, running, strength 0.81.',
      'The Live mode New pill is 0.72. The playground circle is a separate row and starts paused.',
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

export const AGENT_PROMPTS: Record<string, string> = Object.fromEntries(
  TRANSITIONS.map((item) => [item.id, buildPrompt(item.id)]),
);

export function promptFor(id: string): string {
  return AGENT_PROMPTS[id] ?? '';
}
