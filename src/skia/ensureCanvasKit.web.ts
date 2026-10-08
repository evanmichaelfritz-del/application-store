let pending: Promise<void> | null = null;

export function canvasKitReady(): boolean {
  return typeof globalThis.CanvasKit !== 'undefined';
}

/** True while LoadSkiaWeb is in flight and its WebGL context is not up yet. */
export function canvasKitPending(): boolean {
  return pending !== null && !canvasKitReady();
}

/** Shared LoadSkiaWeb. Later cards await the same promise. */
export function ensureCanvasKit(): Promise<void> {
  if (canvasKitReady()) return Promise.resolve();
  if (!pending) {
    // bootCanvasKit must finish before skiaCards evaluates Skia.web.js, which
    // snapshots globalThis.CanvasKit at module init.
    pending = import('./bootCanvasKit').then((mod) => mod.bootCanvasKit());
  }
  return pending;
}
