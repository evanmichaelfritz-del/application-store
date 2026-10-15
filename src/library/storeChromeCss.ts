const CSS = `
[data-focus-ring],
[data-focus-ring] * {
  transition-property: background-color, border-color, color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
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
@media (prefers-reduced-motion: reduce) {
  [data-focus-ring],
  [data-focus-ring] * {
    transition-duration: 0ms !important;
  }
}
html[data-reduce-motion="1"] [data-focus-ring],
html[data-reduce-motion="1"] [data-focus-ring] * {
  transition-duration: 0ms !important;
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
