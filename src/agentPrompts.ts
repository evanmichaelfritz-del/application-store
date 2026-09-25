import abrarOverviewPrompt from './demos/abrar-overview/AGENT_PROMPT.md';
import { TRANSITIONS } from './catalog';
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from '@/src/closedNetwork/gooeyPlusMenu';
import { HTML_CSS_ONLY_NOTE, previewDocumentParts } from '@/src/closedNetwork/previewSources';
import { ORB_GALLERY_LOCKS } from './demos/thinking-orbs-playground/galleryCopy';
import { TILT_MOTION, TILT_RN } from './demos/tiltMotion';

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
    motion: 'Per-digit perspective rotateX 80deg → 0, blur 2px → 0, stagger 50ms. Replay cycles three values.',
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
    motion: 'Gravity-ish fall; particles settle on the Celebrate button top (~1.5s). `springs.snap` on rest.',
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
    motion: 'Green disc `#1f8a4c`, white stroke. Opacity, translateY 28px, rotate 80deg, and scale 0.86→1. The check draws a 28px dash after an 80ms delay.',
    rn: 'Copy CSS is `.t-check` and `.mark`. Copy script replays the animation.',
  },
  'avatar-group-hover': {
    motion: 'Strength is max(0, 1 − distance × 0.45). Lift is −8px × strength. Scale is 1 + 0.06 × strength.',
    content: 'Initials JC, AK, MR, SL, TW on `#d9b8a2`, `#b7c7d9`, `#d4c4a8`, `#c5b3d6`, `#a8c5b8`.',
    rn: 'Copy CSS sets the avatar tokens. Copy script writes the distance-weighted transform.',
  },
  'card-stack-hover': {
    motion: 'Starts stacked. Spread fans to translate (−28, 10) / (0, −6) / (28, 10) and rotate −8 / 0 / 8 degrees.',
    content: 'Labels `Card 1`, `Card 2`, `Card 3`.',
    rn: 'Copy CSS is `.t-stack-card`. Copy script toggles `.is-spread` on hover and click.',
  },
  'error-state-shake': {
    motion: '`cubic-bezier(0.36, 0.07, 0.19, 0.97)`, 400ms, keyframes 0, +7px, −7px, +4.2px, −2.45px, 0.',
    content: 'Input starts at `hello@`. Invalid submit shows `Please enter a valid email.` Border `#c43a31`.',
    rn: 'Copy CSS is `.t-shake`. Copy script validates the email and replays `.is-error`.',
  },
  'input-clear-dissolve': {
    motion: 'Each word leaves over 250ms, blur 2px, translateY −12px, stagger 45ms. Click again restores the words.',
    content: '`search` `recent` `files`.',
    rn: 'Copy CSS is `.t-word`. Copy script sets the stagger and toggles `.is-out`.',
  },
  'skeleton-reveal': {
    motion: 'Skeleton pulses to opacity 0.5 over 1000ms. Content fades in over 250ms with a 2px blur.',
    content: '`Jane Cooper` / `jane.cooper@example.com`.',
    rn: 'Copy CSS is `.t-skel` / `.t-content`. Copy script reveals after 900ms and toggles on click.',
  },
  'texts-reveal': {
    motion: 'Two lines rise 12px over 280ms. The second line waits 50ms.',
    content: '`Pull request opened` / `Review requested from 3 teammates`.',
    rn: 'Copy CSS is `.t-line`. Copy script replays by rewriting the lines.',
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
    rn: 'The gallery stage uses img-fx when that package is installed. Copy HTML, Copy CSS, and Copy script emit the closed-network canvas mosaic below, which is the preview document. They do not emit an npm install snippet.',
  },
  'tooltip-open-close': {
    motion: '400ms delay in, travel + fade; out instant.',
    rn: 'Three triggers: Aa/Edit, ↗/Share, ···/More. The bubble travels by 44px per slot with no delay. Fade-in waits 400ms and lasts 180ms. Hide is instant. Copy CSS is `.t-tt`. Copy script sets `--tt-x`.',
  },
  'tilt-3d': {
    motion: TILT_MOTION,
    content: 'Credit / `VISA` / `John Smith` / `4111 - 1111 - 1111 - 1111`. Dark card `#16171c`, 210×128, radius 16.',
    rn: TILT_RN,
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
  'orb-solving': ORB_GALLERY_LOCKS.solving,
  'orb-thinking': ORB_GALLERY_LOCKS.thinking,
  'orb-agent-listening': ORB_GALLERY_LOCKS['agent-listening'],
  'orb-searching': ORB_GALLERY_LOCKS.searching,
  'orb-agent-planning': ORB_GALLERY_LOCKS['agent-planning'],
  'orb-agent-thinking': ORB_GALLERY_LOCKS['agent-thinking'],
  'orb-working': ORB_GALLERY_LOCKS.working,
  'orb-agent-shaping': ORB_GALLERY_LOCKS['agent-shaping'],
  'orb-state-picker': ORB_GALLERY_LOCKS['state-picker'],
  'preview-tools': {
    motion:
      'A 48px white disc opens and closes the tray. Closed, the disc shows the pen in hand. Open, that disc sits at the end of a white instrument bar with pencil, pen, brush, fineliner, highlighter, fountain, and eraser glyphs. The color well swaps the glyphs for swatches. Pencil, pen, and brush thin as the pointer speeds up. Fineliner holds 1.35px. Highlighter holds 16px at 0.38 alpha. Fountain thickens on downward strokes. Eraser removes area with destination-out. Alignment draws 1px #9B5CFF boxes, full-width lines at each control top, center, and bottom, and vertical lines across the row. Annotate lets a click on a control open a note card on that control. Copy writes markdown with label, selector, note, and box.',
    content:
      'The stage is 460px tall. The sample row is centered: 32px plus disc, 26px pills Auto and 5.5, 32px pills Fast and Quality, 32px black send disc with an up arrow. The tray sits at the bottom. Guides and the note card stay hidden until the disc opens.',
    rn: 'Copy HTML, Copy CSS, and Copy script are this same tray. Guides measure data-guide controls. Draw replays stored strokes, including eraser strokes. Note markdown lists label, selector, note, and box. Do not add a second card. Do not render text chips labeled Pen, Marker, or Eraser.',
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

## Card copy buttons

Keep Showcase and AGENT_PROMPT. Replace a single Copy code button with Copy HTML, Copy CSS, and Copy script. Each button copies one piece of the reference document below (body markup, the style block, the script block). None of them copies the whole document.

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
  'abrar-overview': () => abrarOverviewPrompt,
};

function buildPrompt(id: string): string {
  if (FULL_PROMPTS[id]) return FULL_PROMPTS[id]();

  const item = TRANSITIONS.find((entry) => entry.id === id);
  const lock = LOCKS[id];
  if (!item || !lock) return '';

  const parts = previewDocumentParts(id);
  const scriptText = parts.script || HTML_CSS_ONLY_NOTE;

  return `# AGENT_PROMPT — ${item.title}

Closed-network rebuild brief for this Application Store piece. This document is the source of truth.

- Do not fetch external pages, docs, or product sites.
- Do not invent demos beyond this piece.
- Not Helix, not grok.me, not peptide / Publish product code.
- Stack: Expo + TypeScript + React Native for the gallery stage. The three copy buttons emit the closed-network HTML, CSS, and script that the preview document runs. Do not merge those three into one document.

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

## Copy HTML

\`\`\`html
${parts.html}
\`\`\`

## Copy CSS

\`\`\`css
${parts.css}
\`\`\`

## Copy script

\`\`\`js
${scriptText}
\`\`\`

## Card chrome (Application Store)

Baseball card: white card, border rgba(0,0,0,0.06), shadow 0 1px 3px rgba(0,0,0,0.04), radius 16. Stage #f9f9f9, radius 14, height ~220px. Page background #fdfdfd. Font Inter.

Each card must support:
1. Showcase — live demo on the stage
2. Copy HTML — the markup block above, alone
3. Copy CSS — the stylesheet block above, alone
4. Copy script — the script block above, alone. When the preview has no script, that button copies: ${HTML_CSS_ONLY_NOTE}
5. AGENT_PROMPT — this prompt, revealable and copyable

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
