import { SNAP_DRAG } from '@/src/demos/gooey/constants';

/** Max |translation| written into drag SVs. */
export const DRAG_CAP = SNAP_DRAG * 1.25;

/** Skip SV/style writes closer than this (web mid-drag cap). */
export const DRAG_STEP = 3;

export function finite(n: number, fallback = 0) {
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

export function clampDrag(n: number) {
  'worklet';
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
  if (n > DRAG_CAP) return DRAG_CAP;
  if (n < -DRAG_CAP) return -DRAG_CAP;
  return n;
}

/** Once per gesture — not the move hot path. */
export function markGooeyOnBegin() {
  const g = globalThis as { __gooeyOnBegin?: number };
  g.__gooeyOnBegin = (g.__gooeyOnBegin ?? 0) + 1;
  if (typeof document !== 'undefined') {
    const el = document.getElementById('gooey-drag');
    if (el) el.setAttribute('data-onbegin', String(g.__gooeyOnBegin));
  }
}
