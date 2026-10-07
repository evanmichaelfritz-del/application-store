import { createContext, useContext } from 'react';

/** Prefetch and mount a Skia card when it is within this many pixels of the viewport. */
export const SKIA_NEAR_MARGIN_PX = 200;

/** Live WebGL surfaces. Nearest visible cards win; a card that does not fit is skipped. */
export const SKIA_CANVAS_CAP = 6;

const CANVAS_WEIGHT: Record<string, number> = {
  'border-beam': 2,
  'liquid-metal': 2,
  'yogesh-orb-creator': 2,
};

export type SkiaRuntime = {
  /** This card may own a canvas. False unmounts it and frees the WebGL context. */
  mount: boolean;
  /** Clock and RAF may advance. False freezes the last frame. */
  running: boolean;
};

const defaultRuntime: SkiaRuntime = { mount: true, running: true };

export const SkiaRuntimeContext = createContext<SkiaRuntime>(defaultRuntime);

export function useSkiaRuntime(): SkiaRuntime {
  return useContext(SkiaRuntimeContext);
}

type Reg = {
  id: string;
  cardId: string;
  el: HTMLElement;
  onNear: () => void;
  armed: boolean;
  visible: boolean;
  distance: number;
};

type Snap = {
  hidden: boolean;
  live: ReadonlySet<string>;
};

const regs = new Map<string, Reg>();
const listeners = new Set<() => void>();
let snap: Snap = { hidden: false, live: new Set() };
let listening = false;
let scheduled = false;

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

function weight(cardId: string) {
  return CANVAS_WEIGHT[cardId] ?? 1;
}

function readRect(reg: Reg) {
  const rect = reg.el.getBoundingClientRect();
  const vh = window.innerHeight;
  reg.visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < vh;
  reg.distance = Math.abs(rect.top + rect.height / 2 - vh / 2);
  const near = rect.bottom > -SKIA_NEAR_MARGIN_PX && rect.top < vh + SKIA_NEAR_MARGIN_PX;
  if (near && !reg.armed) {
    reg.armed = true;
    reg.onNear();
  }
}

function computeLive() {
  const visible = [...regs.values()].filter((reg) => reg.visible);
  visible.sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  const live = new Set<string>();
  let used = 0;
  for (const reg of visible) {
    const cost = weight(reg.cardId);
    if (used + cost > SKIA_CANVAS_CAP) continue;
    used += cost;
    live.add(reg.id);
  }
  return live;
}

function publish() {
  const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  const live = hidden ? snap.live : computeLive();
  if (hidden === snap.hidden && sameSet(live, snap.live)) return;
  snap = { hidden, live: hidden ? snap.live : live };
  listeners.forEach((listener) => listener());
}

function measure() {
  if (typeof window === 'undefined') return;
  regs.forEach((reg) => readRect(reg));
  publish();
}

function ensureListening() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      measure();
    });
  };
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('visibilitychange', () => {
    publish();
    if (document.visibilityState === 'visible') measure();
  });
  const margin = `${SKIA_NEAR_MARGIN_PX}px`;
  const io = new IntersectionObserver(
    () => {
      measure();
    },
    { root: null, rootMargin: margin, threshold: [0, 0.01, 1] },
  );
  observeAll = (el) => io.observe(el);
  unobserveAll = (el) => io.unobserve(el);
  regs.forEach((reg) => io.observe(reg.el));
}

let observeAll: ((el: HTMLElement) => void) | null = null;
let unobserveAll: ((el: HTMLElement) => void) | null = null;

export function subscribeSkiaBudget(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSkiaBudget() {
  return snap;
}

export function registerSkiaCard(id: string, cardId: string, el: HTMLElement, onNear: () => void) {
  if (typeof IntersectionObserver !== 'function') {
    onNear();
    return () => {};
  }
  ensureListening();
  const reg: Reg = {
    id,
    cardId,
    el,
    onNear,
    armed: false,
    visible: false,
    distance: Number.POSITIVE_INFINITY,
  };
  regs.set(id, reg);
  observeAll?.(el);
  readRect(reg);
  publish();
  return () => {
    unobserveAll?.(el);
    regs.delete(id);
    publish();
  };
}
