const CSS = `
[data-focus-ring],
[data-focus-ring] * {
  transition-property: background-color, border-color, color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}
a[data-focus-ring] {
  color: inherit;
  text-decoration: none;
}
[data-focus-ring]:focus {
  outline: none;
}
[data-focus-ring]:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #fdfdfd, 0 0 0 4px #0d0d0d;
}
[data-clear-link] {
  text-underline-offset: 2px;
}
[data-store-search] {
  outline: none;
}
[data-store-sidebar="dock"] {
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  box-sizing: border-box;
}
[data-store-sidebar="dock"]::-webkit-scrollbar {
  width: 0;
  height: 0;
}
[data-store-sidebar="dock"]:hover {
  scrollbar-width: thin;
}
[data-store-sidebar="dock"]:hover::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
[data-store-sidebar="dock"]:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.22);
  border-radius: 8px;
}
[data-code-text] {
  white-space: pre;
  font-family: GeistMono_500Medium, monospace;
  font-size: 12.5px;
  line-height: 20px;
  color: #0d0d0d;
}
[data-inline-code] {
  font-family: GeistMono_500Medium, monospace;
  font-size: 12px;
  line-height: 18px;
  color: #0d0d0d;
  background-color: #f1f1f1;
  border-radius: 5px;
}
[data-preview-skeleton] {
  background-color: #eeeeef;
  animation: store-skeleton-pulse 1200ms ease-in-out infinite;
}
@keyframes store-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
[data-store-card] {
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}
[data-added-chevron] {
  transition: transform 150ms ease-out;
}
[data-added-chevron="open"] {
  transform: rotate(180deg);
}
[data-added-view]:hover [data-added-view-label] {
  color: #0d0d0d;
}
[data-added-strip] {
  overflow: hidden;
  transition: max-height 150ms ease-out;
}
[data-added-strip="closed"] {
  max-height: 260px;
}
[data-added-strip="open"] {
  max-height: 2400px;
}
[data-still-scale] {
  transform-origin: top left;
}
[data-still-scale="0.22"] {
  transform: scale(0.22);
}
[data-still-scale="0.14"] {
  transform: scale(0.14);
}
[data-gallery-skeleton] {
  background-color: #eeeeef;
  animation: store-gallery-pulse 1200ms ease-in-out infinite;
}
@keyframes store-gallery-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
[data-palette-overlay] {
  position: fixed !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 80;
}
[data-palette-scrim],
[data-palette-panel] {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
[data-palette-scrim][data-ease="in"],
[data-palette-panel][data-ease="in"] {
  transition-timing-function: ease-in;
}
[data-palette-row],
[data-palette-row] * {
  transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
  [data-focus-ring],
  [data-focus-ring] * {
    transition-duration: 0ms !important;
  }
  [data-preview-skeleton],
  [data-gallery-skeleton] { animation: none !important; }
  [data-store-card],
  [data-added-chevron],
  [data-added-strip],
  [data-palette-scrim],
  [data-palette-panel] {
    transition-duration: 0ms !important;
  }
  [data-palette-panel] { transform: none !important; }
}
html[data-reduce-motion="1"] [data-focus-ring],
html[data-reduce-motion="1"] [data-focus-ring] * {
  transition-duration: 0ms !important;
}
html[data-reduce-motion="1"] [data-preview-skeleton],
html[data-reduce-motion="1"] [data-gallery-skeleton] {
  animation: none !important;
}
html[data-reduce-motion="1"] [data-store-card],
html[data-reduce-motion="1"] [data-added-chevron],
html[data-reduce-motion="1"] [data-added-strip],
html[data-reduce-motion="1"] [data-palette-scrim],
html[data-reduce-motion="1"] [data-palette-panel] {
  transition-duration: 0ms !important;
}
html[data-reduce-motion="1"] [data-palette-panel] {
  transform: none !important;
}
`;

/** Metro web ignores +html.tsx, so the gallery chrome CSS is injected once. */
export function installStoreChromeCss() {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('store-chrome-css');
  if (existing) {
    if (existing.textContent !== CSS) existing.textContent = CSS;
    return;
  }
  const style = document.createElement('style');
  style.id = 'store-chrome-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}
