import { GOOEY_PLUS_COPY_SNIPPET } from '@/src/closedNetwork/gooeyPlusMenu';
import {
  INSTALL_NATIVE_INSTALL,
  INSTALL_NATIVE_NOTE,
  INSTALL_NATIVE_USAGE,
  INSTALL_REACT_INSTALL,
  INSTALL_REACT_USAGE,
  INSTALL_SWIFT_INSTALL,
  INSTALL_SWIFT_USAGE,
} from './demos/thinking-orbs-playground/content/copy';

const THINKING_ORBS_PLAYGROUND_SNIPPET = [
  'React',
  INSTALL_REACT_INSTALL,
  '',
  INSTALL_REACT_USAGE,
  '',
  'React Native',
  INSTALL_NATIVE_INSTALL,
  '',
  INSTALL_NATIVE_NOTE,
  '',
  INSTALL_NATIVE_USAGE,
  '',
  'Swift UI',
  INSTALL_SWIFT_INSTALL,
  '',
  INSTALL_SWIFT_USAGE,
].join('\n');

export const SNIPPETS: Record<string, string> = {
  'card-resize': `:root {
  --resize-dur: 300ms;
  --resize-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-resize {
  transition: width var(--resize-dur) var(--resize-ease),
    height var(--resize-dur) var(--resize-ease);
}
@media (prefers-reduced-motion: reduce) {
  .t-resize { transition: none !important; }
}`,

  'number-pop-in': `:root {
  --digit-dur: 500ms;
  --digit-distance: 8px;
  --digit-stagger: 70ms;
  --digit-blur: 2px;
  --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);
}
.t-digit {
  display: inline-block;
  animation: t-digit-in var(--digit-dur) var(--digit-ease) both;
}
.t-digit:nth-child(2) { animation-delay: calc(var(--digit-stagger) * 1); }
.t-digit:nth-child(3) { animation-delay: calc(var(--digit-stagger) * 2); }
.t-digit:nth-child(4) { animation-delay: calc(var(--digit-stagger) * 3); }
@keyframes t-digit-in {
  from { transform: translateY(var(--digit-distance)); opacity: 0; filter: blur(var(--digit-blur)); }
  to { transform: translateY(0); opacity: 1; filter: blur(0); }
}
@media (prefers-reduced-motion: reduce) {
  .t-digit { animation: none !important; }
}`,

  'notification-badge': `:root {
  --badge-slide-dur: 260ms;
  --badge-pop-dur: 500ms;
  --badge-offset-x: -8.2px;
  --badge-offset-y: 12.4px;
  --badge-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --badge-pop-ease: cubic-bezier(0.34, 1.36, 0.64, 1);
}
.t-badge {
  transform: translate(var(--badge-offset-x), var(--badge-offset-y)) scale(0.4);
  opacity: 0;
  transition:
    transform var(--badge-slide-dur) var(--badge-slide-ease),
    opacity 400ms var(--badge-slide-ease);
}
.t-badge.is-on {
  transform: translate(0, 0) scale(1);
  opacity: 1;
  transition:
    transform var(--badge-pop-dur) var(--badge-pop-ease),
    opacity 400ms var(--badge-slide-ease);
}
@media (prefers-reduced-motion: reduce) {
  .t-badge { transition: none !important; }
}`,

  'text-states-swap': `:root {
  --text-swap-dur: 150ms;
  --text-swap-translate-y: 4px;
  --text-swap-blur: 2px;
  --text-swap-ease: ease-in-out;
}
.t-text-swap {
  transition: transform var(--text-swap-dur) var(--text-swap-ease),
    filter var(--text-swap-dur) var(--text-swap-ease),
    opacity var(--text-swap-dur) var(--text-swap-ease);
}
.t-text-swap.is-exit {
  transform: translateY(calc(var(--text-swap-translate-y) * -1));
  filter: blur(var(--text-swap-blur));
  opacity: 0;
}
.t-text-swap.is-enter-start {
  transform: translateY(var(--text-swap-translate-y));
  filter: blur(var(--text-swap-blur));
  opacity: 0;
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .t-text-swap { transition: none !important; }
}`,

  'menu-dropdown': `:root {
  --dropdown-open-dur: 250ms;
  --dropdown-close-dur: 150ms;
  --dropdown-pre-scale: 0.97;
  --dropdown-closing-scale: 0.99;
  --dropdown-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-dropdown {
  transform-origin: var(--dropdown-origin, top left);
  transform: scale(var(--dropdown-pre-scale));
  opacity: 0;
  pointer-events: none;
  transition: transform var(--dropdown-open-dur) var(--dropdown-ease),
    opacity var(--dropdown-open-dur) var(--dropdown-ease);
}
.t-dropdown.is-open { transform: scale(1); opacity: 1; pointer-events: auto; }
.t-dropdown.is-closing {
  transform: scale(var(--dropdown-closing-scale));
  opacity: 0;
  transition-duration: var(--dropdown-close-dur);
}
@media (prefers-reduced-motion: reduce) {
  .t-dropdown { transition: none !important; }
}`,

  'confetti-burst': `:root {
  --confetti-gravity: 1800;
  --confetti-bounce: 0.35;
  --confetti-spread: 46deg;
}
/* RN: Reanimated particles with gravity + floor bounce.
   Web CSS cannot do this physics — keep the JS/Reanimated loop. */
.t-confetti-piece { position: absolute; width: 6px; height: 8px; border-radius: 1px; }
@media (prefers-reduced-motion: reduce) {
  .t-confetti-piece { display: none !important; }
}`,

  'modal-open-close': `:root {
  --modal-open-dur: 250ms;
  --modal-close-dur: 150ms;
  --modal-scale: 0.96;
  --modal-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-modal {
  transform: scale(var(--modal-scale));
  opacity: 0;
  transition: transform var(--modal-open-dur) var(--modal-ease),
    opacity var(--modal-open-dur) var(--modal-ease);
}
.t-modal.is-open { transform: scale(1); opacity: 1; }
.t-modal.is-closing {
  transform: scale(var(--modal-scale));
  opacity: 0;
  transition-duration: var(--modal-close-dur);
}
@media (prefers-reduced-motion: reduce) {
  .t-modal { transition: none !important; }
}`,

  'gooey-plus-menu': GOOEY_PLUS_COPY_SNIPPET,

  'page-side-by-side': `:root {
  --page-slide-dur: 250ms;
  --page-slide-distance: 8px;
  --page-blur: 3px;
  --page-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-page {
  transition: transform var(--page-slide-dur) var(--page-slide-ease),
    opacity var(--page-slide-dur) var(--page-slide-ease),
    filter var(--page-slide-dur) var(--page-slide-ease);
}
.t-page.is-exit { transform: translateX(calc(var(--page-slide-distance) * -1)); opacity: 0; filter: blur(var(--page-blur)); }
.t-page.is-enter { transform: translateX(var(--page-slide-distance)); opacity: 0; filter: blur(var(--page-blur)); }
@media (prefers-reduced-motion: reduce) {
  .t-page { transition: none !important; }
}`,

  'icon-swap': `:root {
  --icon-swap-dur: 250ms;
  --icon-swap-blur: 2px;
  --icon-swap-start-scale: 0.25;
  --icon-swap-ease: ease-in-out;
}
.t-icon {
  transition: opacity var(--icon-swap-dur) var(--icon-swap-ease),
    filter var(--icon-swap-dur) var(--icon-swap-ease),
    transform var(--icon-swap-dur) var(--icon-swap-ease);
}
.t-icon.is-out { opacity: 0; filter: blur(var(--icon-swap-blur)); transform: scale(var(--icon-swap-start-scale)); }
@media (prefers-reduced-motion: reduce) {
  .t-icon { transition: none !important; }
}`,

  'success-check': `:root {
  --check-opacity-dur: 500ms;
  --check-rotate-from: 80deg;
  --check-y-amount: 40px;
  --check-blur-from: 10px;
  --check-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --check-ease-bob: cubic-bezier(0.34, 1.35, 0.64, 1);
}
.t-check { animation: t-check-in 500ms var(--check-ease-out) both; }
@keyframes t-check-in {
  from { opacity: 0; transform: translateY(var(--check-y-amount)) rotate(var(--check-rotate-from)); filter: blur(var(--check-blur-from)); }
  to { opacity: 1; transform: translateY(0) rotate(0); filter: blur(0); }
}
@media (prefers-reduced-motion: reduce) {
  .t-check { animation: none !important; }
}`,

  'avatar-group-hover': `:root {
  --avatar-lift: -4px;
  --avatar-dur: 320ms;
  --avatar-scale: 1.05;
  --avatar-falloff: 0.45;
  --avatar-ease-in: cubic-bezier(0.22, 1, 0.36, 1);
  --avatar-ease-out: cubic-bezier(0.34, 3.85, 0.64, 1);
}
.t-avatar { transition: transform var(--avatar-dur) var(--avatar-ease-in); }
.t-avatar.is-hot { transform: translateY(var(--avatar-lift)) scale(var(--avatar-scale)); }
.t-avatars:not(:hover) .t-avatar { transition-timing-function: var(--avatar-ease-out); }
@media (prefers-reduced-motion: reduce) {
  .t-avatar { transition: none !important; }
}`,

  'card-stack-hover': `:root {
  --stack-fan: 18px;
  --stack-rot: 6deg;
  --stack-ease: cubic-bezier(0.34, 1.36, 0.64, 1);
  --stack-dur: 420ms;
}
.t-stack-card { transition: transform var(--stack-dur) var(--stack-ease); }
.t-stack.is-spread .t-stack-card:nth-child(1) { transform: translate(-28px, 10px) rotate(-8deg); }
.t-stack.is-spread .t-stack-card:nth-child(2) { transform: translate(0, -6px) rotate(0deg); }
.t-stack.is-spread .t-stack-card:nth-child(3) { transform: translate(28px, 10px) rotate(8deg); }
@media (prefers-reduced-motion: reduce) {
  .t-stack-card { transition: none !important; }
}`,

  'error-state-shake': `:root {
  --shake-distance: 6px;
  --shake-overshoot: 4px;
  --shake-dur-a: 80ms;
  --shake-dur-b: 60ms;
  --shake-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-shake.is-error { animation: t-shake 280ms var(--shake-ease); }
@keyframes t-shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(var(--shake-distance)); }
  40% { transform: translateX(calc(var(--shake-overshoot) * -1)); }
  60% { transform: translateX(4px); }
  80% { transform: translateX(-2px); }
  100% { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .t-shake.is-error { animation: none !important; }
}`,

  'input-clear-dissolve': `:root {
  --clear-out-dur: 400ms;
  --clear-out-fly: 12px;
  --clear-blur: 2px;
  --clear-out-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-word { display: inline-block; }
.t-word.is-out {
  transform: translateY(calc(var(--clear-out-fly) * -1));
  opacity: 0;
  filter: blur(var(--clear-blur));
  transition: transform var(--clear-out-dur) var(--clear-out-ease),
    opacity var(--clear-out-dur) var(--clear-out-ease),
    filter var(--clear-out-dur) var(--clear-out-ease);
}
@media (prefers-reduced-motion: reduce) {
  .t-word { transition: none !important; }
}`,

  'skeleton-reveal': `:root {
  --pulse-dur: 1000ms;
  --reveal-dur: 400ms;
  --reveal-blur: 2px;
  --reveal-ease: ease-in-out;
}
.t-skel { animation: t-pulse var(--pulse-dur) linear infinite; }
.t-content { transition: opacity var(--reveal-dur) var(--reveal-ease), filter var(--reveal-dur) var(--reveal-ease); }
.t-content.is-hidden { opacity: 0; filter: blur(var(--reveal-blur)); }
@keyframes t-pulse { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) {
  .t-skel { animation: none !important; }
  .t-content { transition: none !important; }
}`,

  'texts-reveal': `:root {
  --stagger-dur: 500ms;
  --stagger-distance: 12px;
  --stagger-stagger: 40ms;
  --stagger-blur: 3px;
  --stagger-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-line { animation: t-rise var(--stagger-dur) var(--stagger-ease) both; }
.t-line:nth-child(2) { animation-delay: var(--stagger-stagger); }
@keyframes t-rise {
  from { transform: translateY(var(--stagger-distance)); opacity: 0; filter: blur(var(--stagger-blur)); }
  to { transform: none; opacity: 1; filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .t-line { animation: none !important; }
}`,

  'tabs-sliding': `:root {
  --tabs-dur: 250ms;
  --tabs-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --tabs-bar-bg: #f1f1f1;
  --tabs-pill-bg: #ffffff;
}
.t-tabs { background: var(--tabs-bar-bg); border-radius: 999px; position: relative; }
.t-tabs-pill {
  position: absolute; top: 3px; bottom: 3px; border-radius: 999px;
  background: var(--tabs-pill-bg);
  transition: transform var(--tabs-dur) var(--tabs-ease), width var(--tabs-dur) var(--tabs-ease);
}
@media (prefers-reduced-motion: reduce) {
  .t-tabs-pill { transition: none !important; }
}`,

  'drag-drop-physics': `:root {
  --drop-snap: 520ms;
  --drop-ease: cubic-bezier(0.34, 1.36, 0.64, 1);
  --drop-morph: 300ms;
}
/* RN: gesture-handler pan + Reanimated spring snap.
   Live site uses pointer physics into a morphing image well. */
.t-drop { transition: border-radius var(--drop-morph) var(--drop-ease), transform var(--drop-snap) var(--drop-ease); }
@media (prefers-reduced-motion: reduce) {
  .t-drop { transition: none !important; }
}`,

  'shimmer-text': `:root {
  --shimmer-dur: 1200ms;
  --shimmer-base: #7c7c7c;
  --shimmer-highlight: #0d0d0d;
}
.t-shimmer {
  display: inline-block;
  width: fit-content;
  background-image: linear-gradient(
    90deg,
    var(--shimmer-base) 0%,
    var(--shimmer-base) 42%,
    var(--shimmer-highlight) 50%,
    var(--shimmer-base) 58%,
    var(--shimmer-base) 100%
  );
  background-size: 300% 100%;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: t-shimmer var(--shimmer-dur) linear infinite;
}
@keyframes t-shimmer {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .t-shimmer {
    animation: none !important;
    color: var(--shimmer-highlight);
    -webkit-text-fill-color: var(--shimmer-highlight);
  }
}`,

  'image-generation-loader': `/* npm install img-fx three
 * Peer: react, react-dom, three
 */
import { ImageGeneration } from 'img-fx'

export function Card() {
  return (
    <ImageGeneration
      preset="pixels-organic"
      theme="light"
      cardBg="#ffffff"
      images={['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png']}
      autoReveal
      revealDelayRange={[1.2, 2.4]}
      revealHoldMs={2200}
      borderRadius={20}
    >
      <div className="t-img-fx-card" style={{ width: 168, height: 168, borderRadius: 20 }} />
    </ImageGeneration>
  )
}

/* Presets: pixels-organic | pixels-mechanic | sweep-gradient
 * Manual: ref.triggerReveal() / triggerHide() / triggerRegenerate()
 */
.t-img-fx-card { background: #fff; }
@media (prefers-reduced-motion: reduce) {
  /* Pass paused / disable autoReveal in the React tree. */
}`,

  'tooltip-open-close': `:root {
  --tt-in-dur: 150ms;
  --tt-out-dur: 50ms;
  --tt-scale: 0.98;
  --tt-delay: 80ms;
  --tt-move-dur: 160ms;
  --tt-in-ease: ease-out;
}
.t-tt {
  transform: scale(var(--tt-scale));
  opacity: 0;
  transition: transform var(--tt-in-dur) var(--tt-in-ease) var(--tt-delay),
    opacity var(--tt-in-dur) var(--tt-in-ease) var(--tt-delay);
}
.t-tt.is-on { transform: scale(1); opacity: 1; }
.t-tt.is-off { transition-duration: var(--tt-out-dur); transition-delay: 0ms; }
@media (prefers-reduced-motion: reduce) {
  .t-tt { transition: none !important; }
}`,

  'tilt-3d': `:root {
  --tilt-perspective: 1000px;
  --tilt-return: 1000ms;
  --tilt-follow: 400ms;
  --tilt-glare-opacity: 0.32;
  --tilt-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-tilt { perspective: var(--tilt-perspective); }
.t-tilt-card { transform-style: preserve-3d; transition: transform var(--tilt-follow) var(--tilt-ease); }
.t-tilt-glare { pointer-events: none; mix-blend-mode: screen; }
@media (prefers-reduced-motion: reduce) {
  .t-tilt-card { transform: none !important; }
}`,

  'border-beam': `:root {
  --beam-loop: 2800ms;
  --search-loop: 5200ms;
  --beam-tail: 18;
  --beam-colors: #ff4d9a, #c026d3, #a855f7, #fb7c3a;
  --search-colors: #ff8ab8, #ff5aa5, #e879f9;
}
/* RN: Skia dots walk a rounded-rect perimeter (chat) or bottom stroke (Search).
   Copy is tokens — live demo is Reanimated + Skia, not CSS @keyframes. */
.t-beam { position: relative; }
@media (prefers-reduced-motion: reduce) {
  .t-beam { animation: none !important; }
}`,

  'thinking-orbs-playground': THINKING_ORBS_PLAYGROUND_SNIPPET,

  'thinking-orbs': `:root {
  --orb-spin: 9000ms;
  --orb-swirl: 7200ms;
  --orb-dots: 56;
}
/* RN: Skia Fibonacci dotted sphere + metallic swirl orb.
   Labels: Agent searching... / Agent listening... / Solving.... / Thinking.... */
.t-orb { display: inline-block; }
@media (prefers-reduced-motion: reduce) {
  .t-orb { animation: none !important; }
}`,

  gooey: `:root {
  --gooey-snap: 168px;
  --gooey-neck: 16px;
  --gooey-tile-w: 120px;
  --gooey-tile-h: 148px;
  --gooey-rest-x: 28px;
  --gooey-rest-y: 78px;
  --gooey-spring-d: 20;
  --gooey-spring-k: 280;
  --gooey-spring-m: 0.85;
}
/* RN: two Views + translate, pink neck bar ≥16px. Snap-back withSpring.
   Web SHA uses Views (no Skia). */
.t-gooey-tile { width: var(--gooey-tile-w); height: var(--gooey-tile-h); border-radius: 28px; }
.t-gooey-neck { width: var(--gooey-neck); min-height: var(--gooey-neck); background: #ff4ad2; }
@media (prefers-reduced-motion: reduce) {
  .t-gooey-tile { transition: none !important; }
}`,

  'liquid-metal': `:root {
  --metal-loop: 3400ms;
  --metal-auto-stroke: 4.5px;
  --metal-send-stroke: 5.5px;
  --metal-colors: #5CE1FF, #FF4ECD, #FFD166, #7CFFB2, #7AA2FF, #5CE1FF;
}
/* RN: Skia SweepGradient ring; stroke = thickness + sin(progress)*1.4.
   Wraps Auto pill + send button. */
.t-metal { position: relative; }
@media (prefers-reduced-motion: reduce) {
  .t-metal { animation: none !important; }
}`,
};
