import abrarOverviewPrompt from './demos/abrar-overview/AGENT_PROMPT.md';
import { TRANSITIONS } from './catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import { HTML_CSS_ONLY_NOTE, previewDocumentParts } from '@/src/closedNetwork/previewSources';
import { ORB_LOCKS } from '@/src/closedNetwork/orbLocks';
import { TILT_MOTION, TILT_RN } from './demos/tiltMotion';

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
    motion: 'Width/height morph 300ms (`tokens.morph`) with `ease.outEase`. Wide is 148×100. Small is 88×64.',
    rn: 'Reanimated width/height timing in `CardResizeDemo`. Copy emits portable CSS `.t-resize`.',
    states: [
      {
        name: 'wide',
        trigger: 'mount, and Animate while the card is small',
        from: 'width 88, height 64',
        to: 'width 148, height 100',
        duration: '300ms (`tokens.morph`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`ease.outEase`, the `timed` default)',
        delay: 'none',
      },
      {
        name: 'small',
        trigger: 'Animate while the card is wide',
        from: 'width 148, height 100',
        to: 'width 88, height 64',
        duration: '300ms (`tokens.morph`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      'Reduced motion uses `withTiming` duration 0.',
      'The card keeps radius 14. The bars are 8px tall; the short bar is 62% width.',
      'Copy CSS uses the same 300ms and cubic-bezier(0.22, 1, 0.36, 1) on width and height (`--resize-dur`, `--resize-ease`).',
    ],
    setup:
      '`CardResizeDemo` (`src/demos/CardResize.tsx`). Shared values start at 148 and 100. `AnimateButton` toggles `small`, and the effect writes both axes with `timed`.',
    checklist: [
      'Wide is 148×100 and small is 88×64.',
      'Both axes use `tokens.morph` (300ms) and `ease.outEase`.',
      'Reduced motion snaps to the target size.',
    ],
  },
  'number-pop-in': {
    motion:
      'Per-digit perspective rotateX 80deg → 0, blur 2px → 0, stagger 50ms. Replay cycles three values. Rotate, opacity, and blur use `springs.default` (damping 20, stiffness 280).',
    content: '`6 5. 7 8`, then `1 4. 0 2`, then `9 3. 6 1`. Spaces are digits in the row.',
    rn: 'Reanimated per-digit rotateX. Copy HTML lists each character. Copy CSS is `.t-digit` / `t-digit-in`. Copy script cycles the three sets.',
    states: [
      {
        name: 'enter',
        trigger: 'mount and each Animate press (`FlipDigit` resets, then springs)',
        from: 'rotateX 80deg, opacity 0, blur 2px',
        to: 'rotateX 0, opacity 1, blur 0',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.default (damping 20, stiffness 280)',
        delay: 'character index × `tokens.digitStagger` (50ms), via `withDelay`',
      },
    ],
    gotchas: [
      'Perspective is 400. A space is a 6px gap. The dot is 32px with marginBottom 2. Other digits are 42px / line-height 46.',
      'Reduced motion writes rotateX 0, opacity 1, and blur 0 and skips the spring.',
      'The key includes the set index, so each replay remounts the row. There is no separate exit animation.',
      'Copy CSS runs `@keyframes t-digit-in` for `--digit-dur` 500ms with cubic-bezier(0.22, 1, 0.36, 1). The live card is the spring, not that 500ms timing.',
    ],
    setup:
      '`NumberPopInDemo` (`src/demos/NumberPopIn.tsx`). `SETS` is `6 5. 7 8`, `1 4. 0 2`, `9 3. 6 1`. Animate advances the index modulo 3.',
    checklist: [
      'The three sets play in that order, including the space characters.',
      'Each character waits index × 50ms, then springs rotateX, opacity, and blur with damping 20 and stiffness 280.',
      'Reduced motion shows the digits at rest.',
    ],
  },
  'notification-badge': {
    motion: 'Off state translate(-8.2px, 12.4px) scale(0.4) opacity 0. On state springs to rest (`springs.pop`: mass 0.8, damping 12, stiffness 280). Opacity timing is 180ms.',
    content: 'Count `1` on `#e23d2d`. Starts hidden. Click the bell toggles it.',
    rn: 'Shared-value translate + scale. Copy CSS is `.t-badge`. Copy script toggles `.is-on`.',
    states: [
      {
        name: 'off',
        trigger: 'mount (`on` is false) and Animate while the badge is on',
        from: 'translate(0, 0), scale 1, opacity 1',
        to: 'translate(-8.2px, 12.4px), scale 0.4, opacity 0',
        duration: 'translate and scale are withSpring; opacity is 180ms',
        easing: 'springs.pop (mass 0.8, damping 12, stiffness 280); opacity uses ease.outEase',
        delay: 'none',
      },
      {
        name: 'on',
        trigger: 'Animate while the badge is off',
        from: 'translate(-8.2px, 12.4px), scale 0.4, opacity 0',
        to: 'translate(0, 0), scale 1, opacity 1',
        duration: 'translate and scale are withSpring; opacity is 180ms',
        easing: 'springs.pop (mass 0.8, damping 12, stiffness 280); opacity uses cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      'The badge starts hidden. The count is the string `1`, fill `#e23d2d`, text `#fff`, box 18×18, radius 9, sitting at top -4 and right -4 on a 40×40 bell.',
      'Reduced motion snaps every channel with duration 0.',
      'Copy CSS approximates the spring with `--badge-slide-dur` 260ms and `--badge-pop-dur` 500ms. The live card does not use those durations. Opacity is the only 180ms channel.',
    ],
    setup:
      '`NotificationBadgeDemo` (`src/demos/NotificationBadge.tsx`). Shared values start at x -8.2, y 12.4, scale 0.4, opacity 0. Animate toggles `on`.',
    checklist: [
      'Off is translate(-8.2px, 12.4px), scale 0.4, opacity 0.',
      'On springs translate and scale with `springs.pop` and fades opacity over 180ms.',
      'The count stays `1` on `#e23d2d`.',
    ],
  },
  'text-states-swap': {
    motion: 'Exit up 4px with blur 2px and opacity 0 over 250ms, then enter from +4px over 250ms (`tokens.fade`, ease-in-out).',
    content: '`Transaction processing...` ↔ `Transaction completed`.',
    rn: 'Copy CSS is `.t-text-swap`. Copy script waits 250ms before swapping the string.',
    states: [
      {
        name: 'exit',
        trigger: 'Animate, dropped while `busy` is true',
        from: 'translateY 0, opacity 1, blur 0',
        to: 'translateY -4, opacity 0, blur 2px',
        duration: '250ms (`tokens.fade`)',
        easing: 'ease-in-out (`ease.inOut`)',
        delay: 'none',
      },
      {
        name: 'enter',
        trigger: 'the timeout that fires after the exit duration',
        from: 'translateY 4, opacity 0, blur 2px (written before the enter timing)',
        to: 'translateY 0, opacity 1, blur 0',
        duration: '250ms (`tokens.fade`)',
        easing: 'ease-in-out (`ease.inOut`)',
        delay: '250ms, the `setTimeout` that also swaps the string',
      },
    ],
    gotchas: [
      '`busy` clears when that timeout fires, so a second press can start during the enter.',
      'Reduced motion sets both durations to 0.',
      'The strings are exactly `Transaction processing...` and `Transaction completed`.',
    ],
    setup:
      '`TextStatesSwapDemo` (`src/demos/TextStatesSwap.tsx`). The index starts at 0. Animate runs `swap`.',
    checklist: [
      'Exit travels to -4px with blur 2px and opacity 0 in 250ms.',
      'The string swaps after that 250ms, and the enter starts at +4px.',
      'Presses during `busy` do nothing.',
    ],
  },
  'menu-dropdown': {
    motion: 'Origin top left. Closed scale 0.94 and opacity 0. Open and close are both 180ms (`tokens.menu`).',
    content: 'Trigger reads `Open menu` / `Close menu`. Items: `New file` / `Add image` / `New folder`. Starts closed.',
    rn: 'Copy CSS is `.t-dropdown`. Copy script toggles `.is-open` / `.is-closing` and the trigger label.',
    states: [
      {
        name: 'closed',
        trigger: 'mount, the trigger while open, or an item press',
        from: 'scale 1, opacity 1',
        to: 'scale 0.94, opacity 0, pointerEvents none',
        duration: '180ms (`tokens.menu`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
      {
        name: 'open',
        trigger: 'the trigger while closed',
        from: 'scale 0.94, opacity 0',
        to: 'scale 1, opacity 1, pointerEvents auto',
        duration: '180ms (`tokens.menu`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      '`transformOrigin` is `top left`. The menu is 160px wide, radius 12, padding 6, marginTop 8. Each item is 32px tall.',
      'The trigger label is `Open menu` while closed and `Close menu` while open.',
      'Reduced motion uses duration 0.',
    ],
    setup:
      '`MenuDropdownDemo` (`src/demos/MenuDropdown.tsx`). `open` starts false. One derived progress drives scale `0.94 + progress * 0.06` and opacity.',
    checklist: [
      'Closed scale is 0.94 and opacity is 0.',
      'Open and close are both 180ms with `ease.outEase`.',
      'Items are `New file`, `Add image`, and `New folder`, and an item press closes the menu.',
    ],
  },
  'confetti-burst': {
    motion:
      'Eighteen 8×10 bits. Horizontal travel springs from 0 to `piece.x` with `springs.default` (damping 20, stiffness 280). Lift times to `-peak` in 180ms (`ease.outEase`), then springs to 0 with `springs.snap` (damping 18, stiffness 300). Spin times to `piece.rot` in 720ms (`Easing.out(Easing.quad)`). `translateY` is `Math.min(lift, 0)`. A press inside 80ms of the last spawn is ignored.',
    content: 'Button label `Celebrate`. 18 bits. The vertical clamp keeps pieces on the rest line.',
    rn: 'Reanimated particles, not a full physics engine. Copy emits `.t-confetti-piece` tokens.',
    states: [
      {
        name: 'idle',
        trigger: 'mount, before the first Celebrate press',
        from: 'no bits',
        to: 'no bits',
        duration: 'held',
        easing: '',
        delay: 'none',
      },
      {
        name: 'burst',
        trigger: 'Celebrate press when 80ms have passed since the last spawn',
        from: 'lift 0, x 0, spin 0, opacity 1',
        to: 'x = piece.x, lift returns to 0 after peaking, spin = piece.rot',
        duration: 'rise 180ms, then withSpring; spin 720ms',
        easing: 'x uses springs.default; lift uses ease.outEase then springs.snap; spin uses Easing.out(Easing.quad)',
        delay: '(id % 6) × 18ms',
      },
    ],
    gotchas: [
      '`COUNT` is 18. There is no 1.5s settle constant in the component.',
      'Peaks are `46 + (id % 6) * 8`. Horizontal targets are `((id % 9) - 4) * 9 + (id % 2) * 3`. Rotation is `((id * 37 + seed * 11) % 200) - 100`, and `seed` is the burst count.',
      'Colors cycle `#ff5a5f`, `#f5c518`, `#2ecc71`, `#4da3ff`, `#b07cff`, `#ff8a3d`. Bits are 8×10 with radius 1.5.',
      'Reduced motion sets lift 0, x to `piece.x`, and spin to `piece.rot` with opacity 1.',
      'The copy script is a separate gravity loop (`--confetti-gravity` 1800, `--confetti-bounce` 0.35, `--confetti-spread` 46deg, floor at the button top minus 8). It is not this Reanimated sequence.',
      'Rest Y starts at `(220 - 36) / 2 - 10 + 1` (83) until layout. Origin X starts at 120, then becomes the scene width / 2 minus 4.',
    ],
    setup:
      '`ConfettiBurstDemo` (`src/demos/ConfettiBurst.tsx`). The scene is 220px tall. The button is 36px tall. `makePieces` rebuilds when `burst` increments.',
    checklist: [
      'A burst spawns 18 bits and ignores a second press inside 80ms.',
      'Horizontal motion is `springs.default`. The rise is 180ms, then `springs.snap` returns the lift. Spin lasts 720ms.',
      '`translateY` is `Math.min(lift, 0)`, so a bit does not travel below the rest line.',
    ],
  },
  'modal-open-close': {
    motion: 'Scale 0.94→1 and fade over 200ms (`tokens.modal`). Backdrop opacity peaks at 0.28. Close uses the same 200ms.',
    content: 'Title `New project`. Body `Scale from 0.94 with a 200ms fade.` Starts closed.',
    rn: 'Copy CSS is `.t-modal`. Copy script shows and hides the backdrop.',
    states: [
      {
        name: 'closed',
        trigger: 'mount, the backdrop press, or Close',
        from: 'scale 1, sheet opacity 1, backdrop opacity 0.28',
        to: 'scale 0.94, sheet opacity 0, backdrop opacity 0, pointerEvents none',
        duration: '200ms (`tokens.modal`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
      {
        name: 'open',
        trigger: 'Toggle modal',
        from: 'scale 0.94, sheet opacity 0, backdrop opacity 0',
        to: 'scale 1, sheet opacity 1, backdrop opacity 0.28, pointerEvents auto',
        duration: '200ms (`tokens.modal`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      'Scale is `0.94 + progress * 0.06`. Backdrop opacity is `progress * 0.28`. The backdrop fill is `#0d0d0d`.',
      'The dialog is 210px wide, radius 14, padding 16. The trigger label is `Toggle modal`.',
      'Reduced motion uses duration 0. The layer ignores pointer events while `open` is false.',
    ],
    setup:
      '`ModalDemo` (`src/demos/ModalOpenClose.tsx`). `open` starts false. One derived progress drives the sheet and the backdrop.',
    checklist: [
      'Open and close both last 200ms.',
      'The sheet scales from 0.94 to 1 and fades with that same progress.',
      'Backdrop opacity peaks at 0.28. The title is `New project`.',
    ],
  },
  'gooey-plus-menu': {
    motion: 'Closed-network SVG goo plus menu. blur 6 / contrast 18 / fill #fff. Open 550ms bouncy stagger 40ms; close 250ms snappy.',
    content: '`+` hub + New file / Add image / New folder icons. White liquid surface; dark crisp icons.',
    rn: 'Closed network: hand-rolled SVG filter (no npm). Live store web demo may use liquid-gooey. Copy HTML, Copy CSS, and Copy script split the zero-dependency document. None of them copies the whole file.',
  },
  'page-side-by-side': {
    motion: 'Forward/back page push, translateX 24px over 300ms (`tokens.page`). No blur.',
    content: 'List: token `B`, `BNB`, `BNB`, `$66.11`. Detail: `$10` and `$66.11 available`.',
    rn: 'Copy CSS is `.t-page`. Copy script swaps the two pages after 300ms.',
    states: [
      {
        name: 'list',
        trigger: 'mount, and a press while the detail page is showing',
        from: 'list opacity 0 and translateX -24; detail opacity 1 and translateX 0',
        to: 'list opacity 1 and translateX 0; detail opacity 0 and translateX 24',
        duration: '300ms (`tokens.page`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
      {
        name: 'detail',
        trigger: 'a press on the card while the list is showing',
        from: 'list opacity 1 and translateX 0; detail opacity 0 and translateX 24',
        to: 'list opacity 0 and translateX -24; detail opacity 1 and translateX 0',
        duration: '300ms (`tokens.page`)',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      'List translateX is `t * -24`. Detail translateX is `(1 - t) * 24`. Opacity is `1 - t` and `t`. There is no blur.',
      'The card is 210×88, radius 14. The token disc is 32×32 on `#f3ba2f`.',
      'Reduced motion uses duration 0.',
    ],
    setup:
      '`PageSideBySideDemo` (`src/demos/PageSideBySide.tsx`). `detail` starts false. Pressing the card toggles it. One derived value drives both pages.',
    checklist: [
      'The push is 24px over 300ms with `ease.outEase`.',
      'The list shows `BNB` and `$66.11`. The detail shows `$10` and `$66.11 available`.',
      'Reduced motion snaps between the two pages.',
    ],
  },
  'icon-swap': {
    motion: 'Scale from 0.25 and blur 2px, cross-fade 250ms, ease-in-out.',
    content: 'Hamburger (three lines) swaps with an X. Starts on the hamburger.',
    rn: 'Copy CSS is `.t-icon`. Copy script toggles `.is-out` on the two layers.',
    states: [
      {
        name: 'menu',
        trigger: 'mount (`menu` is true), and a press while the X is showing',
        from: 'hamburger opacity 0, scale 0.25, blur 2px; X opacity 1, scale 1, blur 0',
        to: 'hamburger opacity 1, scale 1, blur 0; X opacity 0, scale 0.25, blur 2px',
        duration: '250ms (`tokens.fade`)',
        easing: 'ease-in-out (`ease.inOut`)',
        delay: 'none',
      },
      {
        name: 'close',
        trigger: 'a press while the hamburger is showing',
        from: 'hamburger opacity 1, scale 1, blur 0; X opacity 0, scale 0.25, blur 2px',
        to: 'hamburger opacity 0, scale 0.25, blur 2px; X opacity 1, scale 1, blur 0',
        duration: '250ms (`tokens.fade`)',
        easing: 'ease-in-out (`ease.inOut`)',
        delay: 'none',
      },
    ],
    gotchas: [
      'Scale is `0.25 + (1 - t) * 0.75` on the hamburger and `0.25 + t * 0.75` on the X. Blur is `t * 2` and `(1 - t) * 2`.',
      'The hit target is 48×48, radius 12. Each hamburger line is 2px. Each X bar is 20×2 and rotated 45° or -45°.',
      'Reduced motion uses duration 0. `webFilter` only emits a CSS filter on web when the blur is above 0.',
    ],
    setup:
      '`IconSwapDemo` (`src/demos/IconSwap.tsx`). `menu` starts true. A press toggles it. One derived `t` drives both layers.',
    checklist: [
      'The cross-fade, scale, and blur share one 250ms ease-in-out.',
      'The resting icon is the three-line hamburger.',
      'The outgoing icon ends at scale 0.25 and blur 2px.',
    ],
  },
  'success-check': {
    motion:
      'Green disc `#1f8a4c`, white stroke. Opacity, translateY 28px, rotate 80deg, and scale 0.86→1 via `springs.pop` (mass 0.8, damping 12, stiffness 280). The check draws a 28px dash after an 80ms delay, on the same spring. Turning it off times the dash to 0 in 120ms.',
    rn: 'Copy CSS is `.t-check` and `.mark`. Copy script replays the animation.',
    states: [
      {
        name: 'off',
        trigger: 'mount (`on` is false) and Animate while the check is on',
        from: 'opacity 1, translateY 0, rotate 0, scale 1, dash 1',
        to: 'opacity 0, translateY 28, rotate 80deg, scale 0.86, dash 0',
        duration: 'the badge is withSpring; the dash times out in 120ms',
        easing: 'springs.pop (mass 0.8, damping 12, stiffness 280); dash uses the `timed` default curve',
        delay: 'none',
      },
      {
        name: 'on',
        trigger: 'Animate while the check is off',
        from: 'opacity 0, translateY 28, rotate 80deg, scale 0.86, dash 0',
        to: 'opacity 1, translateY 0, rotate 0, scale 1, dash 1',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.pop (mass 0.8, damping 12, stiffness 280)',
        delay: 'the dash waits 80ms (`withDelay`); the badge does not',
      },
    ],
    gotchas: [
      'The disc is a circle at cx 18, cy 18, r 16, fill `#1f8a4c`. The stroke is `#fff`, width 2.4, path `M11 18.5 L16 23.5 L25 13.5`, `strokeDasharray` 28. `strokeDashoffset` is `28 * (1 - dash)`.',
      'Reduced motion snaps `t` with duration 0 and times the dash with duration 0.',
      'Copy CSS plays `t-check-in` and `t-check-draw` for `--check-opacity-dur` 500ms with cubic-bezier(0.22, 1, 0.36, 1), and the draw delay is 80ms. The live card is `springs.pop`, and the hide dash is 120ms rather than that 500ms animation.',
      'The component starts at `t` 0, so the stage is empty until Animate. The copy stylesheet runs `t-check-in` on `.t-check` as soon as it is painted.',
    ],
    setup:
      '`SuccessCheckDemo` (`src/demos/SuccessCheck.tsx`). `on` starts false. Animate toggles it. The badge transform is opacity `t`, translateY `(1 - t) * 28`, rotate `(1 - t) * 80` degrees, scale `0.86 + t * 0.14`.',
    checklist: [
      'The badge uses `springs.pop` for opacity, translateY 28, rotate 80deg, and scale 0.86→1.',
      'The 28px dash waits 80ms, then uses the same spring. Hiding the dash takes 120ms.',
      'The disc is `#1f8a4c` and the stroke is white.',
    ],
  },
  'avatar-group-hover': {
    motion:
      'Strength is max(0, 1 − distance × 0.45). Lift is −8px × strength. Scale is 1 + 0.06 × strength. Lift and scale use `springs.default` (damping 20, stiffness 280).',
    content: 'Initials JC, AK, MR, SL, TW on `#d9b8a2`, `#b7c7d9`, `#d4c4a8`, `#c5b3d6`, `#a8c5b8`.',
    rn: 'Copy CSS sets the avatar tokens. Copy script writes the distance-weighted transform.',
    states: [
      {
        name: 'rest',
        trigger: 'mount (`hot` is null) and pointer leave',
        from: 'the hovered lift and scale',
        to: 'translateY 0, scale 1, zIndex 1',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.default (damping 20, stiffness 280)',
        delay: 'none',
      },
      {
        name: 'hover',
        trigger: 'hover or press on avatar index i',
        from: 'translateY 0, scale 1',
        to: 'translateY -8 × strength, scale 1 + 0.06 × strength, zIndex 3 when strength > 0.9',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.default (damping 20, stiffness 280)',
        delay: 'none',
      },
    ],
    gotchas: [
      'Strength is 0 when nothing is hot, otherwise `Math.max(0, 1 - Math.abs(hot - index) * 0.45)`.',
      'Avatars are 40×40, radius 20, border 2px `#fff`. Every avatar after the first has marginLeft -10. Initials are 11px `#2a2118`.',
      'Reduced motion snaps the spring with duration 0.',
      'Copy CSS transitions transform over `--avatar-dur` 320ms. The row uses `--avatar-ease-in` while hovered and `--avatar-ease-out` cubic-bezier(0.34, 3.85, 0.64, 1) otherwise. The live card has no 320ms duration.',
    ],
    setup:
      '`AvatarGroupDemo` (`src/demos/AvatarGroup.tsx`). One `hot` index is shared. Each avatar writes its own lift and scale from the distance to that index.',
    checklist: [
      'The hovered avatar lifts 8px and scales to 1.06. Neighbours fall off by 0.45 per step and clamp at 0.',
      'Lift and scale use `springs.default`.',
      'Initials and fills are JC `#d9b8a2`, AK `#b7c7d9`, MR `#d4c4a8`, SL `#c5b3d6`, TW `#a8c5b8`.',
    ],
  },
  'card-stack-hover': {
    motion:
      'Starts stacked. Spread fans to translate (−28, 10) / (0, −6) / (28, 10) and rotate −8 / 0 / 8 degrees. The spread uses `springs.layout` (damping 20, stiffness 280, mass 1).',
    content: 'Labels `Card 1`, `Card 2`, `Card 3`.',
    rn: 'Copy CSS is `.t-stack-card`. Copy script toggles `.is-spread` on hover and click.',
    states: [
      {
        name: 'stacked',
        trigger: 'mount, hover out, and a click while spread',
        from: 'the spread transforms',
        to: 'translate 0 and rotate 0 on every card',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.layout (damping 20, stiffness 280, mass 1)',
        delay: 'none',
      },
      {
        name: 'spread',
        trigger: 'hover in, and a click while stacked',
        from: 'translate 0, rotate 0',
        to: 'card 1 translate(-28, 10) rotate -8deg; card 2 translate(0, -6) rotate 0; card 3 translate(28, 10) rotate 8deg',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.layout (damping 20, stiffness 280, mass 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      'One shared progress multiplies those offsets. Cards are 110×74, radius 12, inside a 110×74 stack and a 180×120 hit target. zIndex is the card index plus 1.',
      'Reduced motion snaps the spring with duration 0.',
      'Copy CSS uses `--stack-dur` 420ms and cubic-bezier(0.34, 1.36, 0.64, 1) with the same three transforms. `--stack-fan` (18px) and `--stack-rot` (6deg) are not read by those rules.',
    ],
    setup:
      '`CardStackHoverDemo` (`src/demos/CardStackHover.tsx`). `spread` starts false. Hover sets it true or false. Click toggles it.',
    checklist: [
      'Rest is a stack. Spread is (−28, 10, −8°), (0, −6, 0°), (28, 10, 8°).',
      'The progress uses `springs.layout`.',
      'Labels are `Card 1`, `Card 2`, and `Card 3`.',
    ],
  },
  'error-state-shake': {
    motion: '`cubic-bezier(0.36, 0.07, 0.19, 0.97)`, 400ms, keyframes 0, +7px, −7px, +4.2px, −2.45px, 0.',
    content: 'Input starts at `hello@`. Invalid submit shows `Please enter a valid email.` Border `#c43a31`.',
    rn: 'Copy CSS is `.t-shake`. Copy script validates the email and replays `.is-error`.',
    states: [
      {
        name: 'idle',
        trigger: 'mount, a valid Submit, or typing while an error is showing',
        from: 'error border and the shake offset',
        to: 'translateX 0, border rgba(0,0,0,0.1), no message',
        duration: 'the border and message update on the next render; typing does not replay translateX',
        easing: '',
        delay: 'none',
      },
      {
        name: 'invalid',
        trigger: 'Submit when `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` fails',
        from: 'translateX 0',
        to: 'translateX +7, then -7, then +4.2, then -2.45, then 0',
        duration: '400ms (`tokens.shake`), five steps of 80ms',
        easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97) (`ease.shake`)',
        delay: 'none',
      },
    ],
    gotchas: [
      'Each step is `tokens.shake / 5`. The distances are `tokens.shakePx` (7), then `-7`, then `7 * 0.6` (4.2), then `-7 * 0.35` (-2.45), then 0.',
      'A valid submit clears the error and does not shake. Editing the field clears the error flag and does not reset `x`.',
      'Reduced motion sets the error and returns before the sequence.',
      'The input is 38px tall, radius 10. The message is 11px in `#c43a31` (`colors.danger`). The button label is `Submit`.',
    ],
    setup:
      '`ErrorShakeDemo` (`src/demos/ErrorShake.tsx`). The field starts at `hello@`. Submit runs `shake`.',
    checklist: [
      'An invalid submit shows `Please enter a valid email.` and turns the border `#c43a31`.',
      'The shake is +7, −7, +4.2, −2.45, 0, each step 80ms, easing cubic-bezier(0.36, 0.07, 0.19, 0.97).',
      'Reduced motion shows the error and does not move the field.',
    ],
  },
  'input-clear-dissolve': {
    motion:
      'Clear runs `FadeOutUp.duration(250).delay(index * 45)`: opacity 1→0 and translateY 0→-25. Restore runs `FadeInDown.duration(250).delay(index * 45)`: opacity 0→1 and translateY 25→0. Layout uses `layoutTransition` (`LinearTransition.springify().damping(20).stiffness(280)`).',
    content: '`search` `recent` `files`. The empty field shows `Search`. The button is `×` while words remain and `+` when they are gone.',
    rn: 'Copy CSS is `.t-word`. Copy script sets the stagger and toggles `.is-out`.',
    states: [
      {
        name: 'clear',
        trigger: 'the button press while any word is showing',
        from: 'opacity 1, translateY 0',
        to: 'opacity 0, translateY -25, then the word list is empty',
        duration: '250ms (`FadeOutUp.duration(250)`)',
        easing: 'FadeOutUp default',
        delay: 'word index × 45ms',
      },
      {
        name: 'restore',
        trigger: 'the button press while the word list is empty',
        from: 'opacity 0, translateY 25',
        to: 'opacity 1, translateY 0, words `search` `recent` `files`',
        duration: '250ms (`FadeInDown.duration(250)`)',
        easing: 'FadeInDown default',
        delay: 'word index × 45ms',
      },
    ],
    gotchas: [
      'Reanimated `FadeOutUp` travels to translateY -25 and `FadeInDown` starts at translateY 25. This component does not set a blur.',
      'The layout change on the row is `layoutTransition`: reduced motion uses `LinearTransition.duration(0)`, otherwise `LinearTransition.springify().damping(20).stiffness(280)`.',
      'Copy CSS `.t-word.is-out` uses blur 2px and translateY -12px (`--clear-out-fly`) with cubic-bezier(0.22, 1, 0.36, 1). The 45ms stagger matches. The live card does not use that 12px or that blur.',
      'Reduced motion passes `undefined` for entering and exiting.',
    ],
    setup:
      '`InputClearDemo` (`src/demos/InputClear.tsx`). The seed is `search recent files`. The field is 230×40, radius 12. The button label follows whether `words.length` is non-zero.',
    checklist: [
      'Clearing exits each word over 250ms with stagger 45ms, traveling to translateY -25.',
      'Restoring enters each word over 250ms from translateY 25, with the same stagger.',
      'The button reads `×` when words are present and `+` when the field is empty.',
    ],
  },
  'skeleton-reveal': {
    motion: 'Skeleton pulses to opacity 0.5 over 1000ms. Content fades in over 250ms with a 2px blur.',
    content: '`Jane Cooper` / `jane.cooper@example.com`. Initials `JC` on `#d9b8a2`.',
    rn: 'Copy CSS is `.t-skel` / `.t-content`. Copy script reveals after 900ms and toggles on click.',
    states: [
      {
        name: 'loading',
        trigger: 'mount, and Animate while the content is showing',
        from: 'content opacity 1, skeleton opacity 0',
        to: 'skeleton pulsing between opacity 1 and 0.5, content opacity 0 and blur 2px',
        duration: 'pulse 1000ms, repeating and reversing; reveal 250ms',
        easing: 'pulse is the default `withTiming` curve; reveal is ease-in-out (`ease.inOut`)',
        delay: 'none',
      },
      {
        name: 'revealed',
        trigger: 'Animate while the skeleton is showing',
        from: 'skeleton opacity at the pulse, content opacity 0 and blur 2px',
        to: 'skeleton opacity 0, content opacity 1 and blur 0',
        duration: '250ms',
        easing: 'ease-in-out (`ease.inOut`)',
        delay: 'none',
      },
    ],
    gotchas: [
      'Skeleton opacity is `(1 - reveal) * pulse`. Skeleton blur is `reveal * 2`. Content opacity is `reveal`. Content blur is `(1 - reveal) * 2`.',
      'While loading and motion is allowed, pulse is `withRepeat(withTiming(0.5, { duration: 1000 }), -1, true)`. Revealing or reduced motion sets pulse to 1 and stops the repeat.',
      'The component does not reveal on a timer. The copy script calls reveal after 900ms and also on the button.',
      'Bones use `#eeeeef` (`colors.skeleton`). The name line is 108×10 and the mail line is 150×10. The avatar slot is 40×40.',
    ],
    setup:
      '`SkeletonRevealDemo` (`src/demos/SkeletonReveal.tsx`). `loaded` starts false. Animate toggles it. `timed(loaded ? 1 : 0, 250, ease.inOut)` writes the reveal.',
    checklist: [
      'The skeleton pulse reaches opacity 0.5 over 1000ms and reverses.',
      'The reveal fades the content in over 250ms while a 2px blur clears.',
      'The loaded text is `Jane Cooper` and `jane.cooper@example.com`.',
    ],
  },
  'texts-reveal': {
    motion:
      'Each line enters with `FadeInDown.duration(280).springify().damping(20).stiffness(280)`. `FadeInDown` starts at opacity 0 and translateY 25. The second line delays 50ms. Replay remounts the column. The exit is `FadeOut.duration(120)`.',
    content: '`Pull request opened` / `Review requested from 3 teammates`.',
    rn: 'Copy CSS is `.t-line`. Copy script replays by rewriting the lines.',
    states: [
      {
        name: 'enter',
        trigger: 'mount and each Replay (`key` is `tick`)',
        from: 'opacity 0, translateY 25',
        to: 'opacity 1, translateY 0',
        duration: '`FadeInDown.duration(280).springify()`',
        easing: 'springify damping 20, stiffness 280',
        delay: 'the second line waits 50ms; the first line does not',
      },
      {
        name: 'exit',
        trigger: 'Replay, before the column remounts',
        from: 'opacity 1',
        to: 'opacity 0',
        duration: '120ms (`FadeOut.duration(120)`)',
        easing: 'FadeOut default',
        delay: 'none',
      },
    ],
    gotchas: [
      'The component does not set a 12px rise or a blur. The 25px offset is the `FadeInDown` default.',
      'Copy CSS `@keyframes t-rise` uses `--stagger-distance` 12px and `--stagger-blur` 3px over `--stagger-dur` 280ms, with cubic-bezier(0.22, 1, 0.36, 1). The second line still waits `--stagger-stagger` 50ms.',
      'Reduced motion skips `entering` and uses `FadeOut.duration(0)`.',
    ],
    setup:
      '`TextsRevealDemo` (`src/demos/TextsReveal.tsx`). Replay increments `tick`, which remounts the column. The title is 16px. The subtitle is 13px in `colors.textSubtle`.',
    checklist: [
      'Line one enters immediately and line two waits 50ms.',
      'The enter builder is `FadeInDown.duration(280).springify().damping(20).stiffness(280)`.',
      'The strings are `Pull request opened` and `Review requested from 3 teammates`.',
    ],
  },
  'tabs-sliding': {
    motion:
      'Pill `translateX` springs with `springs.layout` (damping 20, stiffness 280, mass 1). Width stays 78. Rest x is 3. Each tab adds 78.',
    content: 'Labels `Overview`, `Activity`, `Settings`.',
    rn: '`TabsSlidingDemo` springs `translateX` only. Copy CSS transitions `.t-tabs-pill` transform and width over 250ms, and the copy script measures `offsetWidth` and `offsetLeft`.',
    states: [
      {
        name: 'overview',
        trigger: 'mount and a press on Overview',
        from: 'the previous translateX',
        to: 'translateX 3',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.layout (damping 20, stiffness 280, mass 1)',
        delay: 'none',
      },
      {
        name: 'activity',
        trigger: 'a press on Activity',
        from: 'the previous translateX',
        to: 'translateX 81 (1 × 78 + 3)',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.layout (damping 20, stiffness 280, mass 1)',
        delay: 'none',
      },
      {
        name: 'settings',
        trigger: 'a press on Settings',
        from: 'the previous translateX',
        to: 'translateX 159 (2 × 78 + 3)',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.layout (damping 20, stiffness 280, mass 1)',
        delay: 'none',
      },
    ],
    gotchas: [
      'The live pill width is the constant `TAB_W` (78). The component does not measure the tabs.',
      'The bar is `#f1f1f1`, radius 999, padding 3. The pill is `#fff`. Each tab is 78×30. The active label is `#0f0f0f`. Inactive labels are `rgba(15,15,15,0.8)`.',
      'Copy CSS animates transform and width over `--tabs-dur` 250ms with cubic-bezier(0.22, 1, 0.36, 1). The copy script sets width from `offsetWidth` and translateX from `offsetLeft`. The extra rule starts the pill at width 86 and translateX 3px.',
      'Reduced motion snaps the spring with duration 0.',
    ],
    setup:
      '`TabsSlidingDemo` (`src/demos/TabsSliding.tsx`). `active` starts at 0. The shared x starts at 3 and becomes `active * 78 + 3`.',
    checklist: [
      'Overview, Activity, and Settings land the pill at translateX 3, 81, and 159.',
      'The spring is `springs.layout`. The live pill width stays 78.',
      'The active label is `#0f0f0f`.',
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
      'Masked highlight sweeps the entire string left to right in 1200ms linear (`tokens.shimmer`), then loops. The peak crosses every glyph in the phrase, including the end of "reply". Reduced motion holds the solid highlight color.',
    content: '`Generating reply`.',
    rn: 'Base line plus a duplicate highlight line. Measure the full string width and lay the highlight line out at that width (nowrap, flex-shrink 0). The ~72px window only clips that line and translates from -window to the measured width; the inner line counter-translates so the visible slice is that part of the phrase. A window-sized text box wraps to "Gene" and the sweep never reaches the rest of the phrase. Copy emits `.t-shimmer`: inline-block, fit-content, background-size 300%, no-repeat, background-position 100% → 0% over 1200ms so the 50% peak travels the whole line.',
    states: [
      {
        name: 'sweep',
        trigger: 'layout reports a text width above 0 and motion is allowed',
        from: 'window translateX -72',
        to: 'window translateX equal to the measured string width, then the repeat restarts at -72',
        duration: '1200ms (`tokens.shimmer`)',
        easing: 'linear (`Easing.linear`)',
        delay: 'none',
      },
      {
        name: 'held',
        trigger: 'reduced motion, or before the string has a width',
        from: 'the running sweep',
        to: 'translateX 0 and a single solid `#0d0d0d` line',
        duration: 'the animation is cancelled',
        easing: '',
        delay: 'none',
      },
    ],
    gotchas: [
      'The clip window is 72×26. The base color is `#7c7c7c`. The highlight is `#0d0d0d`. Type is 20px / line-height 26, medium.',
      'The mask on web is `linear-gradient(90deg, transparent 0%, #000 28%, #000 72%, transparent 100%)`. The inner line counter-translates by the same x.',
      'A width change of 1px or less does not restart the measurement.',
      'Copy CSS sweeps `background-position` from 100% to 0% over `--shimmer-dur` 1200ms on a 300% gradient. It is not the 72px mask. Reduced motion in that CSS holds `--shimmer-highlight`.',
    ],
    setup:
      '`ShimmerTextDemo` (`src/demos/ShimmerText.tsx`). The string is `Generating reply`. `onLayout` rounds the clip width and stores it. The effect cancels the shared value, then starts `withRepeat(withTiming(textW, { duration: 1200, easing: Easing.linear }), -1, false)` from -72.',
    checklist: [
      'The window starts at -72 and reaches the measured string width in 1200ms, linear, then loops.',
      'The highlight line is the full string width, nowrap, flex-shrink 0.',
      'Reduced motion shows the solid `#0d0d0d` phrase and no second line.',
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
      '400ms delay in, travel + fade; out instant. Travel uses `springs.layout` (damping 20, stiffness 280, mass 1).',
    rn: 'Three triggers: Aa/Edit, ↗/Share, ···/More. The bubble travels by 44px per slot with no delay. Fade-in waits 400ms and lasts 180ms. Hide is instant. Copy CSS is `.t-tt`. Copy script sets `--tt-x`.',
    states: [
      {
        name: 'travel',
        trigger: 'hover or press on a trigger',
        from: 'the previous slot',
        to: 'translateX = index × 44, and the label becomes Edit, Share, or More',
        duration: 'withSpring, no fixed duration',
        easing: 'springs.layout (damping 20, stiffness 280, mass 1)',
        delay: 'none',
      },
      {
        name: 'show',
        trigger: 'the same hover or press',
        from: 'opacity 0, scale 0.98',
        to: 'opacity 1, scale 1',
        duration: '180ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1) (`ease.outEase`)',
        delay: '400ms (`tokens.tooltipDelay`) via `withDelay`',
      },
      {
        name: 'hide',
        trigger: 'hover out or press out',
        from: 'opacity 1',
        to: 'opacity 0',
        duration: '0ms',
        easing: 'withTiming duration 0',
        delay: 'none',
      },
    ],
    gotchas: [
      'The slot spring is not delayed. Only the fade and scale wait 400ms. Hide does not move the slot back.',
      'Scale is `0.98 + shown * 0.02`. The bubble sits at top -36, height 28, radius 8, text 12px `#2f2f2f`. Each hit is 36×36, radius 10, gap 8.',
      'Reduced motion sets `shown` with duration 0 and snaps the slot spring.',
      'Copy CSS delays both transform and opacity by `--tt-delay` 400ms and places the bubble with `left: var(--tt-x)` instead of a spring. `--tt-out-dur` is 0ms. `--tt-in-dur` is 180ms.',
    ],
    setup:
      '`TooltipDemo` (`src/demos/Tooltip.tsx`). Triggers are Aa/Edit, ↗/Share, and ···/More. `shown` starts at 0 and `slot` starts at 0. The first label state is Edit.',
    checklist: [
      'Moving between triggers springs translateX by 44px per slot with `springs.layout` and no delay.',
      'Opacity and scale wait 400ms, then run for 180ms.',
      'Leaving a trigger hides the bubble in 0ms.',
    ],
  },
  'tilt-3d': {
    motion: TILT_MOTION,
    content: 'Credit / `VISA` / `John Smith` / `4111 - 1111 - 1111 - 1111`. Dark card `#16171c`, 210×128, radius 16.',
    rn: TILT_RN,
    states: [
      {
        name: 'follow',
        trigger: 'pointer move over the untransformed hit box',
        from: 'the current rotateX, rotateY, and glare',
        to: 'rotateX (0.5 - ny) × 14deg, rotateY (nx - 0.5) × 18deg, glare opacity 1 at the pointer',
        duration: 'exponential, time constant 120ms for tilt and 42ms for glare',
        easing: '1 - exp(-dt / tau)',
        delay: 'none; the glare position snaps to the pointer on the frame the pointer enters',
      },
      {
        name: 'return',
        trigger: 'pointer leave',
        from: 'the current tilt and glare',
        to: 'rotateX 0, rotateY 0, glare opacity 0, glare back toward the card center',
        duration: 'exponential, time constant 520ms, then the frame loop stops',
        easing: '1 - exp(-dt / 520)',
        delay: 'none',
      },
    ],
    gotchas: [
      'nx and ny come from clientX/clientY minus `getBoundingClientRect` on the hit box, clamped to the 210×128 card. Do not read offsetX or offsetY.',
      'Perspective is 1000. The glare disc is 220px (radius 110) with stops rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.32) 26%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,0) 68%, screen blend.',
      'The loop stops once the pointer is gone and abs(rotateX) < 0.04, abs(rotateY) < 0.04, and glare opacity < 0.02. It then writes exact zeros.',
      'Reduced motion returns before aiming. The copy stylesheet forces `transform: none` and glare opacity 0 under `prefers-reduced-motion`.',
      'Do not call `withTiming` or `withSpring` on every move, and do not spring the card home on pointer-up while the cursor is still inside.',
    ],
    setup:
      'The constants live in `src/demos/tiltMotion.ts` (`TILT`). The hit target is 210×128. The card is `#16171c`, radius 16, padding 16. Copy HTML, Copy CSS, and Copy script are the `.t-tilt` document built from those constants.',
    checklist: [
      'Max tilt is 14deg on X and 18deg on Y, perspective 1000.',
      'Follow time constant is 120ms. Glare time constant is 42ms and snaps on enter. Return time constant is 520ms.',
      'Pointer position is measured on the untransformed hit box.',
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
      'A cream pill 84px tall, radius 42, gradient #fbfaf9 to #f1efec. Closed, the same pill scales to 0.667 and the held tool peeks from the top at 42px wide. Open, it widens and seats pencil, pen, fineliner, marker, highlighter, brush, fountain, and eraser. Each tool is a 30 by 88 shaded drawing, sunk with margin-bottom -20px and translateY(6px). The active tool uses translateY(-12px). A 26px conic color wheel swaps those tools for 26px radius-8 swatches. Marks are filled outline rings. Pencil is size 1 graphite at 0.85 alpha. Pen is size 6 and thins with speed. Fineliner stays size 2. Marker is size 18. Highlighter is a flat size 28 #fff01f multiply swipe at 0.75 alpha. Brush is size 14 and tapers at the lift. Fountain is size 8 with a 45 degree nib at 0.85 contrast. Eraser is size 28 destination-out. Alignment draws 1px #9B5CFF boxes, full-width lines at each control top, center, and bottom, and vertical lines across the row. Annotate lets a click on a control open a note card on that control. Copy writes markdown with label, selector, note, and box.',
    content:
      'The stage is 520px tall and the card spans the grid. The sample row is centered: 32px plus disc, 26px pills Auto and 5.5, 32px pills Fast and Quality, 32px black send disc with an up arrow. The pill sits at the bottom. Guides and the note card stay hidden until the pill opens. Round chrome is 36px in #8a8a8e. Minimize is the four-corner collapse mark.',
    rn: 'Copy HTML, Copy CSS, and Copy script are this same pill. Guides measure data-guide controls. Draw replays stored strokes, including eraser strokes. Note markdown lists label, selector, note, and box. Do not add a second card. Do not render text chips labeled Pen, Marker, or Eraser.',
    states: [
      {
        name: 'closed',
        trigger: 'mount (`INITIAL_CHROME.open` is false) and the minimize control',
        from: 'the open pill',
        to: '84×84, scale 0.667, padding 0, gap 0, the held tool peeking from the top',
        duration: 'the React styles swap with no duration; Copy CSS transforms over 540ms',
        easing: 'Copy CSS uses cubic-bezier(0.22, 0.9, 0.16, 1)',
        delay: 'none',
      },
      {
        name: 'open',
        trigger: 'the peek press while closed (`toggleOpen`)',
        from: 'scale 0.667, width 84',
        to: 'scale 1, width max-content, padding 32, gap 8, height 84, radius 42',
        duration: 'Copy CSS: width 520ms, border-radius 440ms, transform 540ms',
        easing: 'cubic-bezier(0.22, 0.9, 0.16, 1)',
        delay: 'none',
      },
      {
        name: 'instrument',
        trigger: 'a tool press while open (`pickPen`)',
        from: 'translateY(6px), margin-bottom -20px',
        to: 'the active tool translateY(-12px); the others stay sunk',
        duration: 'style swap',
        easing: '',
        delay: 'none',
      },
      {
        name: 'palette',
        trigger: 'the color wheel while open (`toggleFace`)',
        from: 'the eight 30×88 tools',
        to: '26×26 radius-8 swatches; the active swatch scale 1.08 and translateY(-1px)',
        duration: 'style swap',
        easing: '',
        delay: 'none',
      },
      {
        name: 'annotate',
        trigger: 'the annotate control while open, then a press on a sample control',
        from: 'draw mode',
        to: 'a note card on that control; Copy writes markdown with label, selector, note, and box',
        duration: 'style swap',
        easing: '',
        delay: 'none',
      },
    ],
    gotchas: [
      'Closing sets `open` false, `face` back to instruments, and clears the draft. Opening forces `hand` draw and `face` instruments.',
      '`index.tsx` applies `morphClosed` (scale 0.667) in the same render as the open layout. It has no timing config. The 520ms, 440ms, and 540ms numbers are the Copy CSS transition on `.pt-morph`.',
      'Guides draw only when the pill is open, `guides` is true, and every sample control has a frame. Lines are 1px `#9B5CFF`.',
      'Pencil is size 1 graphite at 0.85 alpha. Pen is size 6 and thins with speed. Fineliner stays size 2. Marker is size 18. Highlighter is a flat size 28 `#fff01f` multiply swipe at 0.75 alpha. Brush is size 14 and tapers at the lift. Fountain is size 8 with a 45° nib at 0.85 contrast. Eraser is size 28 destination-out.',
      'The stage is 520px tall. The sample row is a 32px plus disc, 26px pills Auto and 5.5, 32px pills Fast and Quality, and a 32px black send disc.',
    ],
    setup:
      '`INITIAL_CHROME` in `src/demos/preview-tools/model.ts` starts closed, on instruments, in draw, with guides on, pen `pen`, and color `#111111`. The pill gradient is `#fbfaf9` to `#f1efec`. Copy HTML, Copy CSS, and Copy script are `src/demos/preview-tools/copy.ts`.',
    checklist: [
      'Closed is an 84×84 pill at scale 0.667.',
      'The Copy open transition is width 520ms, border-radius 440ms, and transform 540ms, all cubic-bezier(0.22, 0.9, 0.16, 1).',
      'The active tool uses translateY(-12px). The other tools use translateY(6px) and margin-bottom -20px.',
      'A note lists label, selector, note, and box. There is no second card and no text chips labeled Pen, Marker, or Eraser.',
    ],
  },
  'border-beam': {
    motion:
      'md and sm last 1.96s, line lasts 3.1s, pulse-inner and pulse-outside last 2.3s. libraries.dev passes no strength (package default 1). The 70% slider is from the separate border-beam site. pulse-outside sets `--sub-glow-offset-x: 1px`, `--sub-glow-offset-y: 0px`, `--sub-core-blur: 10px`, `--sub-bloom-blur: 19px`, `--sub-glow-opacity-mul: 1.71`.',
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
      'Small is Pro-locked in the playground (beam.tsx:57). The live 36×36 icon example stays. ocean, sunset, forest, candy, ice, and gold are Pro-locked on the original. Light is a package option, not on the original.',
    ],
    setup:
      'Peer is React. The module is `border-beam@1.4.1`. libraries.dev passes no strength (package default 1). The 70% slider is from the separate border-beam site. The MIT text and the React LICENSE sit in front of the bundle.',
    checklist: [
      'Default size is md, color is colorful, theme is dark, strength is 1.',
      'pulse-inner and pulse-outside wrap the 250×94 radius-16 demo card.',
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

Closed-network rebuild brief. This document is the **only** source of truth.

## Hard rules

- Do **not** fetch external pages, docs, npm registries, CDNs, or product sites.
- Do **not** \`npm install liquid-gooey\` or any other package for this piece.
- Do **not** invent demos beyond this piece.
- Output must run offline as a single HTML file (or equivalent inline HTML/CSS/JS).
- The portable recreation is plain HTML + CSS + JS with an SVG goo filter.

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
| Open motion | 550ms, \`cubic-bezier(0.34, 1.56, 0.64, 1)\`, stagger 40ms |
| Close motion | 250ms, \`cubic-bezier(0.22, 1, 0.36, 1)\`, stagger 0 |
| Plus rotate | 0° → 45° over 250ms ease-in-out when open |
| Icon reveal | opacity 0→1 + blur 2→0; delay 120ms + i×stagger on open |
| Shadow | \`0 0 0 1px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.05), 0 4px 42px rgba(0,0,0,.06)\` on the SVG layer |
| Reduced motion | all transitions duration 0 / none |

## Architecture (must follow)

You cannot blur+contrast the real buttons — that softens icons and breaks Safari when using CSS \`filter: url(#...)\` on HTML.

Use **two layers**:

1. **Silhouette (behind)** — SVG with one white circle (r=20) per item, all sharing a goo filter on the SVG \`<g>\`. Drop-shadow on the SVG element.
2. **Content (above)** — real \`<button>\`s with transparent backgrounds and crisp SVG icons. Hit targets stay interactive.

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
- Satellite buttons: \`tabIndex={-1}\` when closed, \`0\` when open; click closes menu.
- Prefer \`prefers-reduced-motion: reduce\` → instant snaps.

## Deliverable

Ship a **single self-contained HTML document** that matches the tokens above. No imports. No build step.

## Reference implementation (closed network)

Paste this into a file and open it:

\`\`\`html
${GOOEY_PLUS_CLOSED_NETWORK_HTML}
\`\`\`

## States

- **closed** — mount (\`useState(false)\`). satellite x/y 0,0 stacked at left 80px, top 80px → held. until the hub click. no travel. delay none
- **open** — hub click while closed. satellite offsets 0,0 → New file -54,-34, Add image 0,-64, New folder 54,-34. 550ms. cubic-bezier(0.34, 1.56, 0.64, 1). stagger 40ms (\`i * 40\`)
- **close** — hub click while open, or a satellite click. those offsets → 0,0. 250ms. cubic-bezier(0.22, 1, 0.36, 1). stagger 0
- **plus** — the same open flag. rotate 0° → 45° while \`.as-pm-open\` is set. 250ms. ease-in-out. delay none
- **icons** — the same open flag. opacity 0 and blur 2px → opacity 1 and blur 0. 180ms while open (120ms while closing). delay \`120 + i * 40\` ms on open, otherwise 0

## Gotchas

- The goo filter stays on the SVG circles. The buttons are a second layer with transparent backgrounds, so the icons stay crisp.
- Reduced motion sets the item transition to duration 0, the stagger to 0, and the icon delay to 0. The plus and icon CSS transitions are \`none\`.
- Satellite \`tabIndex\` is -1 while closed and 0 while open. A satellite click closes the menu. The hub \`aria-label\` is \`Open menu\` or \`Close menu\`.
- \`GooeyPlusMenu.web.tsx\` passes these same durations into \`liquid-gooey\`. This document is the SVG file and does not install that package.

## Setup

Stage \`#f9f9f9\`. Group 200×140. Buttons 40×40, transparent, radius 50%. Rest slot \`left: 80px; top: 80px\`. Filter id \`goo\`: \`feGaussianBlur\` stdDeviation 6, then a color matrix with alpha slope 18 and intercept -8.67. Icon color \`#17181c\`. The shadow on the SVG layer is \`0 0 0 1px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.05), 0 4px 42px rgba(0,0,0,.06)\`.

## Acceptance checklist

- [ ] No npm / CDN / network required to run
- [ ] White liquid discs with dark crisp icons
- [ ] Visible melt necks while opening/closing
- [ ] Offsets and timings match the table
- [ ] Safari works (filter is on SVG content, not CSS url() on HTML)
- [ ] Reduced-motion collapses transitions

## Out of scope

Do not pull liquid-gooey from npm.
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

function buildPrompt(id: string): string {
  if (FULL_PROMPTS[id]) return FULL_PROMPTS[id]();

  const item = TRANSITIONS.find((entry) => entry.id === id);
  const lock = LOCKS[id];
  if (!item || !lock) return '';

  const parts = previewDocumentParts(id);
  const scriptText = parts.script || HTML_CSS_ONLY_NOTE;
  const stage = filled(lock.content);
  const orbPrompt = ORB_PROMPT_IDS.has(id);
  const subtitle = orbPrompt ? item.subtitle.replace(/ from the preview$/, '') : item.subtitle;
  const blocks = [
    `# AGENT_PROMPT — ${item.title}`,
    orbPrompt
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
