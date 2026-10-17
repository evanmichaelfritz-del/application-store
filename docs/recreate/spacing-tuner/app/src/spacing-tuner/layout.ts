import { INNER, SIZES, VarKey } from './tokens';
import type { VarMap } from './timeline';

export interface Rect { x: number; y: number; w: number; h: number }

export interface StatCard extends Rect { index: number }
export interface Scene {
  S: number; P: number; R: number; G: number; C: number;
  /** Content box of the main area. */
  x0: number; y0: number; Wc: number;
  header: { title: Rect; lightPill: Rect; darkPill: Rect };
  sections: { label: Rect; right: Rect }[];
  stats: StatCard[];
  chart: Rect;
  list: Rect;
  overlays: VarMap<Rect[]>;
}

/** Pure layout: every rect in window-inner coordinates (origin = inside the window border). */
export function computeScene(v: VarMap<number>): Scene {
  const S = v.sidebar, P = v.padding, R = v.rowGap, G = v.colGap, C = v.cardPadding;
  const x0 = S + P;
  const y0 = P;
  const Wc = INNER.width - S - 2 * P;

  const header = {
    title: { x: x0, y: y0 + (SIZES.headerH - SIZES.titleBar.h) / 2, w: SIZES.titleBar.w, h: SIZES.titleBar.h },
    darkPill: { x: x0 + Wc - SIZES.darkPill.w, y: y0, w: SIZES.darkPill.w, h: SIZES.darkPill.h },
    lightPill: {
      x: x0 + Wc - SIZES.darkPill.w - SIZES.headerPillGap - SIZES.lightPill.w,
      y: y0, w: SIZES.lightPill.w, h: SIZES.lightPill.h,
    },
  };

  const section = (y: number, i: number) => ({
    label: { x: x0, y, w: SIZES.sectionLabelW[i], h: SIZES.sectionLabelH },
    right: { x: x0 + Wc - SIZES.sectionRight.w, y: y + 1, w: SIZES.sectionRight.w, h: SIZES.sectionRight.h },
  });

  const sec1Y = y0 + SIZES.headerH + R;
  const statTop = sec1Y + SIZES.sectionLabelH + SIZES.labelToCard;
  const statH = SIZES.statInnerH + 2 * C;
  const statW = (Wc - 3 * G) / 4;
  const stats: StatCard[] = [0, 1, 2, 3].map((index) => ({
    index, x: x0 + index * (statW + G), y: statTop, w: statW, h: statH,
  }));

  const sec2Y = statTop + statH + R;
  const bottomTop = sec2Y + SIZES.sectionLabelH + SIZES.labelToCard;
  const bottomH = INNER.height - P - bottomTop;
  // flex 2 : 1 with zero basis; padding is reserved before the free space is shared.
  const free = Wc - G - 4 * C;
  const chartW = 2 * C + (free * 2) / 3;
  const listW = 2 * C + free / 3;
  const chart = { x: x0, y: bottomTop, w: chartW, h: bottomH };
  const list = { x: x0 + chartW + G, y: bottomTop, w: listW, h: bottomH };

  const ring = (r: Rect, t: number): Rect[] => [
    { x: r.x, y: r.y, w: r.w, h: t },
    { x: r.x, y: r.y + r.h - t, w: r.w, h: t },
    { x: r.x, y: r.y + t, w: t, h: r.h - 2 * t },
    { x: r.x + r.w - t, y: r.y + t, w: t, h: r.h - 2 * t },
  ];

  const overlays: Record<VarKey, Rect[]> = {
    sidebar: [{ x: 0, y: 0, w: S, h: INNER.height }],
    padding: ring({ x: S, y: 0, w: INNER.width - S, h: INNER.height }, P),
    rowGap: [
      { x: x0, y: y0 + SIZES.headerH, w: Wc, h: R },
      { x: x0, y: statTop + statH, w: Wc, h: R },
    ],
    colGap: [
      ...stats.slice(0, 3).map((s) => ({ x: s.x + s.w, y: statTop, w: G, h: statH })),
      { x: x0 + chartW, y: bottomTop, w: G, h: bottomH },
    ],
    cardPadding: [...stats, chart, list].flatMap((r) => ring(r, C)),
  };

  return {
    S, P, R, G, C, x0, y0, Wc, header,
    sections: [section(sec1Y, 0), section(sec2Y, 1)],
    stats, chart, list, overlays,
  };
}
