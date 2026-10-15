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
@media (prefers-reduced-motion: reduce) {
  [data-focus-ring],
  [data-focus-ring] * {
    transition-duration: 0ms !important;
  }
  [data-preview-skeleton] { animation: none !important; }
}
html[data-reduce-motion="1"] [data-focus-ring],
html[data-reduce-motion="1"] [data-focus-ring] * {
  transition-duration: 0ms !important;
}
html[data-reduce-motion="1"] [data-preview-skeleton] {
  animation: none !important;
}
`;

/** Metro web ignores +html.tsx, so the gallery chrome CSS is injected once. */
export function installStoreChromeCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('store-chrome-css')) return;
  const style = document.createElement('style');
  style.id = 'store-chrome-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}
