import { TRANSITIONS } from './catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import { THINKING_ORBS_PLAYGROUND_AGENT_PROMPT } from './demos/thinking-orbs-playground/agentPrompt';

type PromptLock = {
  motion: string;
  content?: string;
  rn: string;
};

const LOCKS: Record<string, PromptLock> = {
  'card-resize': {
    motion: 'Width/height morph 300ms (tokens.morph). Default spring for layout wrappers: damping 20, stiffness 280.',
    rn: 'Reanimated width/height timing. Copy emits portable CSS `.t-resize`.',
  },
  'number-pop-in': {
    motion: 'Per-digit rotateX + blur, stagger 50ms (45–60ms OK).',
    content: 'Digits like `6 5. 7 8`.',
    rn: 'Reanimated per-digit flip. Copy emits `.t-digit` + `@keyframes t-digit-in`.',
  },
  'notification-badge': {
    motion: 'Diagonal slide then spring pop-in (`springs.pop`: mass 0.8, damping 12, stiffness 280).',
    rn: 'Shared-value translate + scale. Copy emits `.t-badge`.',
  },
  'text-states-swap': {
    motion: 'Text swap with opacity + blur ~250ms (220–280ms).',
    content: '`Transaction processing...` ↔ `Transaction completed`.',
    rn: 'Cross-fade + blur approximation. Copy emits `.t-text-swap`.',
  },
  'menu-dropdown': {
    motion: 'Origin-aware open: scale from trigger + fade 180ms (`tokens.menu`).',
    content: '`New file` / `Add image` / `New folder`.',
    rn: 'Transform origin from the trigger. Copy emits `.t-dropdown`.',
  },
  'confetti-burst': {
    motion: 'Gravity-ish fall; particles settle on the Celebrate button top (~1.5s). `springs.snap` on rest.',
    content: 'Button label `Celebrate`. ~12–24 bits. Clamp so pieces do not fall through the button.',
    rn: 'Reanimated particles, not a full physics engine. Copy emits `.t-confetti-piece` tokens.',
  },
  'modal-open-close': {
    motion: 'Scale 0.94→1 + fade 200ms (`tokens.modal`).',
    rn: 'Centered overlay, no route change. Copy emits `.t-modal`.',
  },
  'gooey-plus-menu': {
    motion: 'Closed-network SVG goo plus menu. blur 6 / contrast 18 / fill #fff. Open 550ms bouncy stagger 40ms; close 250ms snappy.',
    content: '`+` hub + New file / Add image / New folder icons. White liquid surface; dark crisp icons.',
    rn: 'Closed network: hand-rolled SVG filter (no npm). Live store web demo may use liquid-gooey; Copy code + this prompt ship a zero-dependency HTML recreation.',
  },
  'page-side-by-side': {
    motion: 'Forward/back page push, translateX 300ms (`tokens.page`).',
    content: 'BNB row ↔ `$10` / `$66.11 available`.',
    rn: 'Shared-value page x. Copy emits `.t-page`.',
  },
  'icon-swap': {
    motion: 'Scale-blur cross-fade ~250ms.',
    rn: 'Two icon layers. Copy emits `.t-icon`.',
  },
  'success-check': {
    motion: 'Spring overshoot (`springs.pop`) with blur and rotate.',
    rn: 'SVG path via react-native-svg. Copy emits `.t-check`.',
  },
  'avatar-group-hover': {
    motion: 'Distance-weighted lift; bouncy return via `springs.default`.',
    rn: 'Hover on web; press in/out on native. No hover-only dead end. Copy emits `.t-avatar`.',
  },
  'card-stack-hover': {
    motion: 'Stack fans out with `withSpring` (damping 20, stiffness 280).',
    rn: 'Press toggle on native; hover on web. Copy emits `.t-stack-card`.',
  },
  'error-state-shake': {
    motion: '`cubic-bezier(0.36, 0.07, 0.19, 0.97)` ±7px, 400ms (`ease.shake`, `tokens.shake`).',
    content: '`Please enter a valid email.`',
    rn: 'TranslateX keyframes via Reanimated. Copy emits `.t-shake`.',
  },
  'input-clear-dissolve': {
    motion: 'Clear with per-word dissolve — opacity + blur ~250ms.',
    rn: 'Word-level shared values. Copy emits `.t-word`.',
  },
  'skeleton-reveal': {
    motion: 'Pulse to content cross-fade ~250ms.',
    content: '`Jane Cooper` / `jane.cooper@example.com`.',
    rn: 'Skeleton pulse then fade/blur reveal. Copy emits `.t-skel` / `.t-content`.',
  },
  'texts-reveal': {
    motion: 'Two lines rise with offset stagger.',
    content: '`Pull request opened` / `Review requested from 3 teammates`.',
    rn: 'Staggered translateY + blur. Copy emits `.t-line`.',
  },
  'tabs-sliding': {
    motion: 'Pill indicator: shared-value `translateX` + `width` via `withSpring` damping 20, stiffness 280.',
    rn: 'Measure each tab with onLayout. Same pattern as store section chips. Copy emits `.t-tabs-pill`.',
  },
  'drag-drop-physics': {
    motion: 'Gesture-handler pan + `springs.snap` (damping 18, stiffness 300). Zone radius/fill morph.',
    content: 'Zone label `Drag & drop it here`.',
    rn: 'Not a full physics engine. Copy emits `.t-drop`.',
  },
  'shimmer-text': {
    motion:
      'Masked highlight sweeps the entire string left to right in 1200ms linear (`tokens.shimmer`), then loops. The peak crosses every glyph in the phrase, including the end of "reply". Reduced motion holds the solid highlight color.',
    content: '`Generating reply`.',
    rn: 'Base line plus a duplicate highlight line. Measure the full string width and lay the highlight line out at that width (nowrap, flex-shrink 0). The ~72px window only clips that line and translates from -window to the measured width; the inner line counter-translates so the visible slice is that part of the phrase. A window-sized text box wraps to "Gene" and the sweep never reaches the rest of the phrase. Copy emits `.t-shimmer`: inline-block, fit-content, background-size 300%, no-repeat, background-position 100% → 0% over 1200ms so the 50% peak travels the whole line.',
  },
  'image-generation-loader': {
    motion: 'img-fx WebGL mosaic (`pixels-organic`). Auto-reveal loop: idle 1.2–2.4s → reveal → hold 2200ms → fade 320ms. Manual Reveal toggles hold:manual / hide. Reduced motion → paused, no autoReveal.',
    content: '168×168 card, radius 20, light theme, cardBg `#ffffff`. Image pool `/img-fx/1.png` `/img-fx/2.png` `/img-fx/3.png`. Label button `Reveal`.',
    rn: 'Install: `npm install img-fx three` (react/react-dom peers). Web: `<ImageGeneration preset="pixels-organic" autoReveal images={[…]}>` in ImageGenerationLoader.web.tsx. Native: static Generating… fallback (no WebGL). Copy emits install + usage. Presets: pixels-organic | pixels-mechanic | sweep-gradient. Imperative: triggerReveal / triggerHide / triggerRegenerate.',
  },
  'tooltip-open-close': {
    motion: '400ms delay in, travel + fade; out instant.',
    rn: 'Delay is a timer, not CSS. Copy emits `.t-tt`.',
  },
  'tilt-3d': {
    motion: '`Gesture.Pan` rotateX/Y + glare follow. Soft white disc tracks the pointer.',
    content: 'Credit / `VISA` / `John Smith` / `4111 - 1111 - 1111 - 1111`.',
    rn: 'Web mouse move without setPointerCapture. No hover-only dead end. Copy emits `.t-tilt`.',
  },
  'border-beam': {
    motion: 'Skia beam dots walk a rounded-rect perimeter. Chat loop 2800ms; Search bottom-stroke loop 5200ms, dim 0.55. Tail 18. Reduced motion freezes at 0.12 / 0.4.',
    content: 'Chat row: `}` + `…` + Auto pill + send. Search pill: magnifier + `Search`. Beam colors `#ff4d9a #c026d3 #a855f7 #fb7c3a`. Search colors `#ff8ab8 #ff5aa5 #e879f9`.',
    rn: 'LoadSkiaWeb once at the web root. Do not wrap WithSkiaWeb per card. Copy emits `.t-beam`.',
  },
  'thinking-orbs': {
    motion: 'Dotted Fibonacci sphere spin 9000ms linear; metallic orb swirl 7200ms linear. Reduced motion holds spin 0.4 / swirl 0.9.',
    content: '`Agent searching...` / `Agent listening...` / `Solving....` + dotted sphere / `Thinking....` + metallic orb. 56 dots.',
    rn: 'Skia Canvas 44×44 per orb. AI skills tag. Copy emits `.t-orb`.',
  },
  gooey: {
    motion: 'Lower tile Gesture.Pan translateX/Y. Snap-back `withSpring` damping 20, stiffness 280, mass 0.85 after SNAP_DRAG 168px. Pink neck ≥16px between tile centers.',
    content: 'Purple tile `#7c2bff` + rose tile `#e11d48` + neck `#ff4ad2`. Tiles 120×148, radius 28, rest offset 28 / 78.',
    rn: 'Web SHA: Views only (no Skia, no CSS filter). Hit overlay `#gooey-drag`. Copy emits `.t-gooey-tile`.',
  },
  'liquid-metal': {
    motion: 'SweepGradient metal ring 3400ms. Stroke = thickness + sin(progress)·1.4. Auto thickness 4.5; send 5.5. Blur 8 on the glow pass.',
    content: 'Auto pill + circular send `↑`. Metal colors `#5CE1FF #FF4ECD #FFD166 #7CFFB2 #7AA2FF`.',
    rn: 'Skia RoundedRect stroke + SweepGradient. Copy emits `.t-metal`.',
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
- Stack for Application Store hosting may be Expo/RN, but the **portable recreation** you produce is plain HTML + CSS + JS with an SVG goo filter.

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

Paste this into a file and open it, or load it in Application Store → Playground:

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

Do not recreate the whole Application Store. Do not pull liquid-gooey from npm. Not Helix, not grok.me.
`;
}

/** Full custom prompts that replace the short LOCK template. */
const FULL_PROMPTS: Record<string, () => string> = {
  'gooey-plus-menu': buildGooeyPlusPrompt,
  'thinking-orbs-playground': () => THINKING_ORBS_PLAYGROUND_AGENT_PROMPT,
};

function buildPrompt(id: string): string {
  if (FULL_PROMPTS[id]) return FULL_PROMPTS[id]();

  const item = TRANSITIONS.find((entry) => entry.id === id);
  const lock = LOCKS[id];
  if (!item || !lock) return '';

  return `# AGENT_PROMPT — ${item.title}

Closed-network rebuild brief for this Application Store piece. This document is the source of truth.

- Do not fetch external pages, docs, or product sites.
- Do not invent demos beyond this piece.
- Not Helix, not grok.me, not peptide / Publish product code.
- Stack: Expo + TypeScript + React Native. Motion is RN-native (Reanimated + Gesture Handler). Copy still emits portable CSS for paste-into-web — that snippet is not what runs the demo.

## Piece

- id: \`${item.id}\`
- title: ${item.title}
- subtitle: ${item.subtitle}
- categories: ${item.categories.join(', ')}
- sections: ${item.sections.join(', ')}
- pro: ${item.pro ? 'yes — same interactive demo, no paywall' : 'no'}

## Stage content

${lock.content ?? 'Use the live Application Store showcase as the stage content. Do not add extra chrome inside the 220px stage.'}

## Motion lock

${lock.motion}

Springs (do not churn):
- layout / default: damping 20, stiffness 280 (layout mass 1)
- pop: mass 0.8, damping 12, stiffness 280
- snap: damping 18, stiffness 300

Reduced motion: AccessibilityInfo + in-app toggle → duration 0 / skip springs.

## RN note

${lock.rn}

## Card chrome (Application Store)

Baseball card: white card, border rgba(0,0,0,0.06), shadow 0 1px 3px rgba(0,0,0,0.04), radius 16. Stage #f9f9f9, radius 14, height ~220px. Page background #fdfdfd. Font Inter.

Each card must support:
1. Showcase — live demo / preview on the stage
2. Copy code — portable closed-network snippet + Copied toast
3. AGENT_PROMPT — this prompt, revealable and copyable

## Out of scope

Do not invent demos beyond this piece. Not Helix, not grok.me.
`;
}

export const AGENT_PROMPTS: Record<string, string> = Object.fromEntries(
  TRANSITIONS.map((item) => [item.id, buildPrompt(item.id)]),
);

export function promptFor(id: string): string {
  return AGENT_PROMPTS[id] ?? '';
}
