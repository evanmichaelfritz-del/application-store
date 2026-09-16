/** CanvasKit is installed on `globalThis` by `LoadSkiaWeb` in `index.web.tsx`. */
export function hasCanvasKit(): boolean {
  return typeof globalThis.CanvasKit !== 'undefined';
}
