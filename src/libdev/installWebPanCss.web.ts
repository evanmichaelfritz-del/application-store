const CSS = `
#gooey-drag, [data-testid="gooey-drag"] {
  touch-action: none !important;
  pointer-events: auto !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  z-index: 40 !important;
}
/* Skia <canvas> defaults to auto and steals artwork drags from Gesture.Pan.
   Parent pointer-events:none does not disable the inner canvas (not inherited). */
canvas {
  pointer-events: none !important;
}
`;

/** Metro web ignores +html.tsx, so lock touch-action on the live pan hosts here. */
export function installWebPanCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('web-pan-css')) return;
  const style = document.createElement('style');
  style.id = 'web-pan-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}
