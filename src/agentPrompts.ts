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
    motion: 'Width/height morph 300ms (tokens.morph).',
    rn: 'Reanimated width/height timing. Copy emits portable CSS `.t-resize`.',
  },
  'number-pop-in': {
    motion:
      'Per-digit perspective rotateX 80deg → 0, blur 2px → 0, stagger 50ms. Replay cycles three values. Rotate, opacity, and blur use `springs.default` (damping 20, stiffness 280).',
    content: '`6 5. 7 8`, then `1 4. 0 2`, then `9 3. 6 1`. Spaces are digits in the row.',
    rn: 'Reanimated per-digit rotateX. Copy HTML lists each character. Copy CSS is `.t-digit` / `t-digit-in`. Copy script cycles the three sets.',
  },
  'notification-badge': {
    motion: 'Off state translate(-8.2px, 12.4px) scale(0.4) opacity 0. On state springs to rest (`springs.pop`: mass 0.8, damping 12, stiffness 280). Opacity timing is 180ms.',
    content: 'Count `1` on `#e23d2d`. Starts hidden. Click the bell toggles it.',
    rn: 'Shared-value translate + scale. Copy CSS is `.t-badge`. Copy script toggles `.is-on`.',
  },
  'text-states-swap': {
    motion: 'Exit up 4px with blur 2px and opacity 0 over 250ms, then enter from +4px over 250ms (`tokens.fade`, ease-in-out).',
    content: '`Transaction processing...` ↔ `Transaction completed`.',
    rn: 'Copy CSS is `.t-text-swap`. Copy script waits 250ms before swapping the string.',
  },
  'menu-dropdown': {
    motion: 'Origin top left. Closed scale 0.94 and opacity 0. Open and close are both 180ms (`tokens.menu`).',
    content: 'Trigger reads `Open menu` / `Close menu`. Items: `New file` / `Add image` / `New folder`. Starts closed.',
    rn: 'Copy CSS is `.t-dropdown`. Copy script toggles `.is-open` / `.is-closing` and the trigger label.',
  },
  'confetti-burst': {
    motion:
      'Gravity-ish fall; particles settle on the Celebrate button top (~1.5s). Horizontal travel uses `springs.default` (damping 20, stiffness 280). Rest uses `springs.snap` (damping 18, stiffness 300).',
    content: 'Button label `Celebrate`. ~12–24 bits. Clamp so pieces do not fall through the button.',
    rn: 'Reanimated particles, not a full physics engine. Copy emits `.t-confetti-piece` tokens.',
  },
  'modal-open-close': {
    motion: 'Scale 0.94→1 and fade over 200ms (`tokens.modal`). Backdrop opacity peaks at 0.28. Close uses the same 200ms.',
    content: 'Title `New project`. Body `Scale from 0.94 with a 200ms fade.` Starts closed.',
    rn: 'Copy CSS is `.t-modal`. Copy script shows and hides the backdrop.',
  },
  'gooey-plus-menu': {
    motion: 'Closed-network SVG goo plus menu. blur 6 / contrast 18 / fill #fff. Open 550ms bouncy stagger 40ms; close 250ms snappy.',
    content: '`+` hub + New file / Add image / New folder icons. White liquid surface; dark crisp icons.',
    rn: 'Closed network: hand-rolled SVG filter (no npm). Live store web demo may use liquid-gooey. Copy HTML, Copy CSS, and Copy script split the zero-dependency document. None of them copies the whole file.',
  },
  'page-side-by-side': {
    motion: 'Forward/back page push, translateX 24px over 300ms (`tokens.page`). No blur.',
    content: 'BNB / `$66.11` ↔ `$10` / `$66.11 available`.',
    rn: 'Copy CSS is `.t-page`. Copy script swaps the two pages after 300ms.',
  },
  'icon-swap': {
    motion: 'Scale from 0.25 and blur 2px, cross-fade 250ms, ease-in-out.',
    content: 'Hamburger (three lines) swaps with an X. Starts on the hamburger.',
    rn: 'Copy CSS is `.t-icon`. Copy script toggles `.is-out` on the two layers.',
  },
  'success-check': {
    motion:
      'Green disc `#1f8a4c`, white stroke. Opacity, translateY 28px, rotate 80deg, and scale 0.86→1 via `springs.pop` (mass 0.8, damping 12, stiffness 280). The check draws a 28px dash after an 80ms delay, on the same spring.',
    rn: 'Copy CSS is `.t-check` and `.mark`. Copy script replays the animation.',
  },
  'avatar-group-hover': {
    motion:
      'Strength is max(0, 1 − distance × 0.45). Lift is −8px × strength. Scale is 1 + 0.06 × strength. Lift and scale use `springs.default` (damping 20, stiffness 280).',
    content: 'Initials JC, AK, MR, SL, TW on `#d9b8a2`, `#b7c7d9`, `#d4c4a8`, `#c5b3d6`, `#a8c5b8`.',
    rn: 'Copy CSS sets the avatar tokens. Copy script writes the distance-weighted transform.',
  },
  'card-stack-hover': {
    motion:
      'Starts stacked. Spread fans to translate (−28, 10) / (0, −6) / (28, 10) and rotate −8 / 0 / 8 degrees. The spread uses `springs.layout` (damping 20, stiffness 280, mass 1).',
    content: 'Labels `Card 1`, `Card 2`, `Card 3`.',
    rn: 'Copy CSS is `.t-stack-card`. Copy script toggles `.is-spread` on hover and click.',
  },
  'error-state-shake': {
    motion: '`cubic-bezier(0.36, 0.07, 0.19, 0.97)`, 400ms, keyframes 0, +7px, −7px, +4.2px, −2.45px, 0.',
    content: 'Input starts at `hello@`. Invalid submit shows `Please enter a valid email.` Border `#c43a31`.',
    rn: 'Copy CSS is `.t-shake`. Copy script validates the email and replays `.is-error`.',
  },
  'input-clear-dissolve': {
    motion:
      'Each word leaves over 250ms, blur 2px, translateY −12px, stagger 45ms. Click again restores the words. The layout change uses `layoutTransition` (`springify` damping 20, stiffness 280).',
    content: '`search` `recent` `files`.',
    rn: 'Copy CSS is `.t-word`. Copy script sets the stagger and toggles `.is-out`.',
  },
  'skeleton-reveal': {
    motion: 'Skeleton pulses to opacity 0.5 over 1000ms. Content fades in over 250ms with a 2px blur.',
    content: '`Jane Cooper` / `jane.cooper@example.com`.',
    rn: 'Copy CSS is `.t-skel` / `.t-content`. Copy script reveals after 900ms and toggles on click.',
  },
  'texts-reveal': {
    motion:
      'Two lines rise 12px over 280ms. The second line waits 50ms. Each line enters with `springify` (damping 20, stiffness 280).',
    content: '`Pull request opened` / `Review requested from 3 teammates`.',
    rn: 'Copy CSS is `.t-line`. Copy script replays by rewriting the lines.',
  },
  'tabs-sliding': {
    motion: 'Pill indicator: shared-value `translateX` + `width` via `withSpring` damping 20, stiffness 280.',
    rn: 'Measure each tab with onLayout. Same pattern as store section chips. Copy emits `.t-tabs-pill`.',
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
  },
  'tilt-3d': {
    motion: TILT_MOTION,
    content: 'Credit / `VISA` / `John Smith` / `4111 - 1111 - 1111 - 1111`. Dark card `#16171c`, 210×128, radius 16.',
    rn: TILT_RN,
  },
  'thinking-orbs': {
    motion: 'Dotted Fibonacci sphere spin 9000ms linear; metallic orb swirl 7200ms linear. Reduced motion holds spin 0.4 / swirl 0.9.',
    content: '`Agent searching...` / `Agent listening...` / `Solving....` + dotted sphere / `Thinking....` + metallic orb. 56 dots.',
    rn: 'Skia Canvas 44×44 per orb. AI skills tag. Copy emits `.t-orb`.',
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

function buildPrompt(id: string): string {
  if (FULL_PROMPTS[id]) return FULL_PROMPTS[id]();

  const item = TRANSITIONS.find((entry) => entry.id === id);
  const lock = LOCKS[id];
  if (!item || !lock) return '';

  const parts = previewDocumentParts(id);
  const scriptText = parts.script || HTML_CSS_ONLY_NOTE;
  const stage = filled(lock.content);
  const blocks = [
    `# AGENT_PROMPT — ${item.title}`,
    `Closed-network rebuild brief. This document is the source of truth.

- Do not fetch external pages, docs, or product sites.
- Do not invent demos beyond this piece.`,
    `## Piece

- id: \`${item.id}\`
- title: ${item.title}
- subtitle: ${item.subtitle}`,
    stage ? `## Stage content\n\n${stage}` : '',
    `## Motion lock\n\n${lock.motion}`,
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
