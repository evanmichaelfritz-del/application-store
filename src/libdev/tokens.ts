/** Visual tokens from libraries.dev recreate @ 611f98e. Demo-only — not store chrome. */
export const libdevColors = {
  chrome: '#ececec',
  chromeDim: 'rgba(255, 255, 255, 0.55)',
  muted: '#6e6e6e',
  pill: '#1a1a1a',
  pillBorder: 'rgba(255, 255, 255, 0.12)',
  demo: '#0c0c0c',
} as const;

export const SNAP_SPRING = {
  damping: 20,
  stiffness: 280,
  mass: 0.85,
} as const;

export type DemoProps = {
  reducedMotion: boolean;
  /** 1 while this card is centered and gooey is not dragging; 0 freezes Skia clocks. */
  clockRunning?: { value: number };
};
