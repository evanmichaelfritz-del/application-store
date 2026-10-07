/** Native Skia is linked. Web replaces this module with `ensureCanvasKit.web.ts`. */
export function canvasKitReady(): boolean {
  return true;
}

export function ensureCanvasKit(): Promise<void> {
  return Promise.resolve();
}
