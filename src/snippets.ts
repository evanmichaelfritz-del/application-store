import { GOOEY_PLUS_COPY_SNIPPET } from '@/src/closedNetwork/gooeyPlusMenu';
import { TILT_COPY_SNIPPET } from '@/src/demos/tiltMotion';
import { ORB_GALLERY_SNIPPETS } from './demos/thinking-orbs-playground/galleryCopy';

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

  'number-pop-in': `@property --p { syntax: "<number>"; inherits: false; initial-value: 0; }
:root {
  /* mass 4, damping 20, stiffness 280. Sampled at 60 stops over 3782ms. */
  --digit-dur: 3782ms;
  --digit-stagger: 50ms;
  --digit-ease: linear(0, 0.1266, 0.4283, 0.7847, 1.0950, 1.2974, 1.3729, 1.3381, 1.2316, 1.0986, 0.9785, 0.8964, 0.8618, 0.8698, 0.9069, 0.9562, 1.0025, 1.0355, 1.0509, 1.0499, 1.0371, 1.0190, 1.0012, 0.9880, 0.9814, 0.9810, 0.9853, 0.9919, 0.9987, 1.0039, 1.0068, 1.0072, 1.0058, 1.0034, 1.0008, 0.9988, 0.9976, 0.9973, 0.9977, 0.9986, 0.9996, 1.0004, 1.0009, 1.0010, 1.0009, 1.0006, 1.0002, 0.9999, 0.9997, 0.9996, 0.9997, 0.9998, 0.9999, 1.0000, 1.0001, 1.0001, 1.0001, 1.0001, 1.0000, 1);
}
.t-digit {
  display: inline-block;
  opacity: var(--p);
  transform: perspective(400px) rotateX(calc((1 - var(--p)) * 80deg));
  filter: blur(max(0px, calc((1 - var(--p)) * 2px)));
  animation: digit-in var(--digit-dur) var(--digit-ease) both;
}
.t-digit:nth-child(2) { animation-delay: calc(var(--digit-stagger) * 1); }
.t-digit:nth-child(3) { animation-delay: calc(var(--digit-stagger) * 2); }
.t-digit:nth-child(4) { animation-delay: calc(var(--digit-stagger) * 3); }
.t-digit:nth-child(5) { animation-delay: calc(var(--digit-stagger) * 4); }
.t-digit:nth-child(6) { animation-delay: calc(var(--digit-stagger) * 5); }
.t-digit:nth-child(7) { animation-delay: calc(var(--digit-stagger) * 6); }
.t-digit:nth-child(8) { animation-delay: calc(var(--digit-stagger) * 7); }
@keyframes digit-in { from { --p: 0; } to { --p: 1; } }
@media (prefers-reduced-motion: reduce) {
  .t-digit {
    animation: none;
    animation-duration: 0ms;
    --p: 1;
    opacity: 1;
    filter: none;
    transform: none;
  }
}`,

  'notification-badge': `@property --pop { syntax: "<number>"; inherits: false; initial-value: 0; }
:root {
  /* springs.pop, mass 0.8, damping 12, stiffness 280. Sampled at 60 stops over 1242ms. */
  --pop-dur: 1242ms;
  --pop-ease: linear(0, 0.0691, 0.2417, 0.4672, 0.7015, 0.9116, 1.0764, 1.1865, 1.2424, 1.2513, 1.2248, 1.1759, 1.1172, 1.059, 1.0088, 0.9711, 0.9473, 0.9369, 0.9376, 0.9463, 0.9597, 0.9748, 0.9891, 1.0009, 1.0094, 1.0144, 1.0162, 1.0153, 1.0127, 1.0091, 1.0053, 1.0018, 0.999, 0.9972, 0.9961, 0.9959, 0.9963, 0.997, 0.998, 0.9989, 0.9998, 1.0004, 1.0008, 1.001, 1.001, 1.0009, 1.0007, 1.0004, 1.0002, 1, 0.9999, 0.9998, 0.9997, 0.9997, 0.9998, 0.9998, 0.9999, 1, 1, 1);
  --badge-fade: 180ms;
  --badge-fade-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-badge {
  transform: translate(calc((1 - var(--pop)) * -8.2px), calc((1 - var(--pop)) * 12.4px)) scale(calc(0.4 + var(--pop) * 0.6));
  opacity: 0;
}
.t-badge.is-on {
  animation:
    badge-pop var(--pop-dur) var(--pop-ease) both,
    badge-in var(--badge-fade) var(--badge-fade-ease) both;
}
.t-badge.is-off {
  animation:
    badge-out var(--pop-dur) var(--pop-ease) both,
    badge-fade-out var(--badge-fade) var(--badge-fade-ease) both;
}
@keyframes badge-pop { from { --pop: 0; } to { --pop: 1; } }
@keyframes badge-out { from { --pop: 1; } to { --pop: 0; } }
@keyframes badge-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes badge-fade-out { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .t-badge.is-on {
    animation: none;
    animation-duration: 0ms;
    --pop: 1;
    opacity: 1;
  }
  .t-badge.is-off {
    animation: none;
    animation-duration: 0ms;
    --pop: 0;
    opacity: 0;
  }
}`,

  'text-states-swap': `:root {
  --text-swap-dur: 250ms;
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
  --dropdown-open-dur: 180ms;
  --dropdown-close-dur: 180ms;
  --dropdown-pre-scale: 0.94;
  --dropdown-closing-scale: 0.94;
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

  'confetti-burst': `@property --bit-x { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --bit-y { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --bit-r { syntax: "<number>"; inherits: false; initial-value: 0; }
:root {
  /* Vertical rise is 180ms cubic-bezier(0.22, 1, 0.36, 1), then the snap spring. Downward travel is clamped. */
  --confetti-debounce: 80ms;
  --confetti-x-ease: linear(0, 0.0087, 0.0338, 0.0736, 0.1262, 0.1899, 0.2625, 0.3423, 0.4272, 0.5155, 0.6053, 0.695, 0.783, 0.868, 0.9487, 1.0242, 1.0933, 1.1556, 1.2104, 1.2574, 1.2963, 1.3272, 1.35, 1.3651, 1.3727, 1.3734, 1.3676, 1.3559, 1.3389, 1.3175, 1.2922, 1.2639, 1.2332, 1.2008, 1.1675, 1.1339, 1.1005, 1.068, 1.0368, 1.0074, 0.9801, 0.9553, 0.9331, 0.9138, 0.8974, 0.8841, 0.8738, 0.8665, 0.862, 0.8602, 0.861, 0.8641, 0.8693, 0.8763, 0.885, 0.8949, 0.9059, 0.9177, 0.93, 0.9425, 0.9551, 0.9674, 0.9794, 0.9908, 1.0015, 1.0113, 1.0202, 1.0281, 1.0349, 1.0405, 1.045, 1.0484, 1.0507, 1.052, 1.0523, 1.0516, 1.0501, 1.0479, 1.045, 1.0415, 1.0377, 1.0334, 1.0289, 1.0243, 1.0196, 1.0149, 1.0103, 1.0059, 1.0018, 0.9979, 0.9944, 0.9912, 0.9884, 0.986, 0.9841, 0.9826, 0.9815, 0.9808, 0.9805, 0.9805, 0.9809, 0.9816, 0.9825, 0.9837, 0.985, 0.9866, 0.9882, 0.9899, 0.9916, 0.9934, 0.9951, 0.9968, 0.9984, 0.9999, 1.0013, 1.0026, 1.0037, 1.0047, 1.0055, 1.0062, 1.0067, 1.007, 1.0072, 1.0073, 1.0072, 1.0071, 1.0068, 1.0064, 1.0059, 1.0054, 1);
  --confetti-y-ease: linear(0, 0.3625, 0.6245, 0.7896, 0.886, 0.9405, 0.9706, 0.9868, 0.9949, 0.9985, 0.9998, 1, 0.9947, 0.9719, 0.9328, 0.8791, 0.8129, 0.7362, 0.6513, 0.5602, 0.465, 0.3679, 0.2707, 0.1753, 0.0833, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0202, 0.0534, 0.0834, 0.1097, 0.1322, 0.1507, 0.1651, 0.1754, 0.1818, 0.1844, 0.1833, 0.179, 0.1717, 0.1617, 0.1494, 0.1351, 0.1194, 0.1026, 0.085, 0.0671, 0.0492, 0.0316, 0.0147, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.004, 0.0101, 0.0156, 0.0204, 0.0245, 0.0279, 0.0305, 0.0324, 0.0336, 0.034, 0.0338, 0.033, 0.0316, 0.0297, 0.0274, 0.0248, 0.0219, 0.0188, 0.0155, 0.0122, 0.0089, 0.0057, 0.0026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0008, 0.0019, 0.0029, 0.0038, 0.0046, 0.0052, 0.0056, 0.006, 0.0062, 0.0063, 0.0062, 0.0061, 0.0058, 0.0055, 0.005, 0.0046, 0.004, 0.0034, 0.0028, 0);
  --confetti-spin-ease: linear(0, 0.044, 0.0869, 0.1289, 0.1699, 0.2099, 0.2489, 0.2869, 0.324, 0.36, 0.3951, 0.4291, 0.4622, 0.4943, 0.5254, 0.5556, 0.5847, 0.6128, 0.64, 0.6662, 0.6914, 0.7156, 0.7388, 0.761, 0.7822, 0.8025, 0.8217, 0.84, 0.8573, 0.8736, 0.8889, 0.9032, 0.9165, 0.9289, 0.9402, 0.9506, 0.96, 0.9684, 0.9758, 0.9822, 0.9877, 0.9921, 0.9956, 0.998, 0.9995, 1);
}
.t-confetti-piece {
  position: absolute;
  width: 8px;
  height: 10px;
  border-radius: 1.5px;
  top: 83px;
  left: calc(50% - 4px);
  z-index: 4;
  pointer-events: none;
  opacity: 0;
  translate: calc(var(--bit-x) * var(--x) * 1px) calc(var(--bit-y) * var(--peak) * -1px);
  rotate: calc(var(--bit-r) * var(--rot) * 1deg);
}
.t-confetti-piece.is-on {
  opacity: 1;
  animation:
    bit-x 2080ms var(--confetti-x-ease) calc(var(--slot) * 18ms) both,
    bit-y 2592ms var(--confetti-y-ease) calc(var(--slot) * 18ms) both,
    bit-r 720ms var(--confetti-spin-ease) calc(var(--slot) * 18ms) both;
}
@keyframes bit-x { from { --bit-x: 0; } to { --bit-x: 1; } }
@keyframes bit-y { from { --bit-y: 0; } to { --bit-y: 1; } }
@keyframes bit-r { from { --bit-r: 0; } to { --bit-r: 1; } }
@media (prefers-reduced-motion: reduce) {
  .t-confetti-piece.is-on {
    animation: none;
    opacity: 1;
    --bit-x: 1;
    --bit-y: 0;
    --bit-r: 1;
  }
}`,

  'modal-open-close': `:root {
  --modal-open-dur: 200ms;
  --modal-close-dur: 200ms;
  --modal-scale: 0.94;
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
  --page-slide-dur: 300ms;
  --page-slide-distance: 24px;
  --page-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-page {
  transition: transform var(--page-slide-dur) var(--page-slide-ease),
    opacity var(--page-slide-dur) var(--page-slide-ease);
}
.t-page.is-exit { transform: translateX(calc(var(--page-slide-distance) * -1)); opacity: 0; }
.t-page.is-enter { transform: translateX(var(--page-slide-distance)); opacity: 0; }
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

  'success-check': `@property --t { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --dash { syntax: "<number>"; inherits: true; initial-value: 0; }
:root {
  /* springs.pop, mass 0.8, damping 12, stiffness 280. Sampled at 60 stops over 1242ms. */
  --pop-dur: 1242ms;
  --pop-ease: linear(0, 0.0691, 0.2417, 0.4672, 0.7015, 0.9116, 1.0764, 1.1865, 1.2424, 1.2513, 1.2248, 1.1759, 1.1172, 1.059, 1.0088, 0.9711, 0.9473, 0.9369, 0.9376, 0.9463, 0.9597, 0.9748, 0.9891, 1.0009, 1.0094, 1.0144, 1.0162, 1.0153, 1.0127, 1.0091, 1.0053, 1.0018, 0.999, 0.9972, 0.9961, 0.9959, 0.9963, 0.997, 0.998, 0.9989, 0.9998, 1.0004, 1.0008, 1.001, 1.001, 1.0009, 1.0007, 1.0004, 1.0002, 1, 0.9999, 0.9998, 0.9997, 0.9997, 0.9998, 0.9998, 0.9999, 1, 1, 1);
  --dash-delay: 80ms;
  --dash-hide: 120ms;
  --check-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.mark.is-on {
  animation:
    check-pop var(--pop-dur) var(--pop-ease) both,
    check-dash var(--pop-dur) var(--pop-ease) var(--dash-delay) both;
}
.mark.is-off {
  animation:
    check-pop-out var(--pop-dur) var(--pop-ease) both,
    check-dash-out var(--dash-hide) var(--check-ease) both;
}
@keyframes check-pop { from { --t: 0; } to { --t: 1; } }
@keyframes check-pop-out { from { --t: 1; } to { --t: 0; } }
@keyframes check-dash { from { --dash: 0; } to { --dash: 1; } }
@keyframes check-dash-out { from { --dash: 1; } to { --dash: 0; } }
@media (prefers-reduced-motion: reduce) {
  .mark.is-on {
    animation: none;
    animation-duration: 0ms;
    --t: 1;
    --dash: 1;
    opacity: 1;
  }
  .mark.is-off {
    animation: none;
    animation-duration: 0ms;
    --t: 0;
    --dash: 0;
    opacity: 0;
  }
}`,

  'avatar-group-hover': `:root {
  /* mass 4, damping 20, stiffness 280. The script steps this spring. */
  --avatar-lift: -8px;
  --avatar-scale: 0.06;
  --avatar-falloff: 0.45;
  --avatar-dur: 3782ms;
}
@media (prefers-reduced-motion: reduce) {
  .disc { transition: none; animation-duration: 0ms; }
}`,

  'card-stack-hover': `:root {
  /* mass 1, damping 20, stiffness 280. The script steps this spring. */
  --stack-dur: 984ms;
}
.card:nth-child(1) { --x: -28px; --y: 10px; --r: -8deg; z-index: 1; }
.card:nth-child(2) { --x: 0px; --y: -6px; --r: 0deg; z-index: 2; }
.card:nth-child(3) { --x: 28px; --y: 10px; --r: 8deg; z-index: 3; }
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; animation-duration: 0ms; }
}`,

  'error-state-shake': `:root {
  --shake-distance: 7px;
  --shake-dur: 400ms;
  --shake-ease: cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.t-shake.is-error { animation: t-shake var(--shake-dur) var(--shake-ease); }
@keyframes t-shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(var(--shake-distance)); }
  40% { transform: translateX(calc(var(--shake-distance) * -1)); }
  60% { transform: translateX(4.2px); }
  80% { transform: translateX(-2.45px); }
  100% { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .t-shake.is-error { animation: none !important; }
}`,

  'input-clear-dissolve': `:root {
  --clear-out-dur: 250ms;
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
  --reveal-dur: 250ms;
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
  --stagger-dur: 280ms;
  --stagger-distance: 12px;
  --stagger-stagger: 50ms;
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

  'drag-drop-physics': `/* The board runs from /parity/drag-drop-physics.js. */`,

  'spacing-tuner': `/* The stage runs from /parity/spacing-tuner.js. */`,

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
      cardBg="#f5f5f5"
      images={['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png']}
      autoReveal
      revealDelayRange={[2, 4]}
      revealHoldMs={2000}
      revealFadeOutMs={300}
      borderRadius={20}
    >
      <div className="t-img-fx-card" style={{ width: 168, height: 168, borderRadius: 20 }} />
    </ImageGeneration>
  )
}

/* Presets: pixels-organic | pixels-mechanic | sweep-gradient
 * Manual: ref.triggerReveal() / triggerHide() / triggerRegenerate()
 */
.t-img-fx-card { background: #f5f5f5; }`,

  'tooltip-open-close': `:root {
  --tt-in-dur: 180ms;
  --tt-out-dur: 0ms;
  --tt-scale: 0.98;
  --tt-delay: 400ms;
  --tt-slot: 44px;
  --tt-in-ease: ease-out;
}
.t-tt {
  left: var(--tt-x, 0px);
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

  'tilt-3d': TILT_COPY_SNIPPET,

  'orb-solving': ORB_GALLERY_SNIPPETS.solving,
  'orb-thinking': ORB_GALLERY_SNIPPETS.thinking,
  'orb-agent-listening': ORB_GALLERY_SNIPPETS['agent-listening'],
  'orb-searching': ORB_GALLERY_SNIPPETS.searching,
  'orb-agent-planning': ORB_GALLERY_SNIPPETS['agent-planning'],
  'orb-agent-thinking': ORB_GALLERY_SNIPPETS['agent-thinking'],
  'orb-working': ORB_GALLERY_SNIPPETS.working,
  'orb-agent-shaping': ORB_GALLERY_SNIPPETS['agent-shaping'],
  'orb-state-picker': ORB_GALLERY_SNIPPETS['state-picker'],

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
   Web uses Views (no Skia). */
.t-gooey-tile { width: var(--gooey-tile-w); height: var(--gooey-tile-h); border-radius: 28px; }
.t-gooey-neck { width: var(--gooey-neck); min-height: var(--gooey-neck); background: #ff4ad2; }
@media (prefers-reduced-motion: reduce) {
  .t-gooey-tile { transition: none !important; }
}`,

};
