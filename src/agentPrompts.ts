import { TRANSITIONS } from './catalog';

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
    motion: 'Liquid split into a fan. Mid-stretch neck ≥12–20px. 350ms grow + 150ms snap (~500ms).',
    content: '`+` expands into a fan of actions with a visible mid-stretch neck.',
    rn: 'Skia metaball only in GooeySkia.tsx. Web: LoadSkiaWeb then WithSkiaWeb. Native: Skia blur+threshold. Copy emits `.t-gooey-action`.',
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
    motion: 'Looping translate mask, 1.2s linear (`tokens.shimmer`).',
    rn: 'Two text layers + sliding mask. No CSS @keyframes drive the live demo. Copy emits `.t-shimmer`. AI skill.',
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

function buildPrompt(id: string): string {
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
2. Copy code — portable CSS snippet + Copied toast
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
