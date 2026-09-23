/** Documented `state` prop. Preview labels are not members of this union. */
export type OrbState =
  | "working"
  | "searching"
  | "solving"
  | "listening"
  | "connecting"
  | "weaving"
  | "composing"
  | "breathing"
  | "shaping";

/** Tuned size presets. Pro 32px is chrome-only and has no preset. */
export type OrbSize = 64 | 20;

export type ModeKey =
  | "orbits"
  | "globe"
  | "rubik"
  | "wave"
  | "web"
  | "braid"
  | "ribbon"
  | "ring"
  | "morph";

export interface OrbDot {
  x: number;
  y: number;
  z: number;
  r: number;
  white?: number;
  a?: number;
}

export interface OrbLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  white?: number;
  a?: number;
}

export interface OrbFrame {
  dots: OrbDot[];
  lines: OrbLine[];
}

/**
 * Named vendor mode options (thinking-orbs@0.3.1 Et defaults + At extras).
 * No open index — Eng HOLD soft-any ban.
 */
export interface ModeOpts {
  // orbits
  orbitN?: number;
  ghostN?: number;
  ghostR?: number;
  ghostA?: number;
  particles?: number;
  partR?: number;
  partRDepth?: number;
  // globe / rubik / wave
  latRings?: number;
  lonDensity?: number;
  rBase?: number;
  rDepth?: number;
  rBoost?: number;
  rActive?: number;
  moveCount?: number;
  inkFar?: number;
  inkSpan?: number;
  rings?: number;
  // web
  nodeN?: number;
  thr?: number;
  signals?: number;
  nodeR?: number;
  nodeRDepth?: number;
  lineW?: number;
  // braid
  strandN?: number;
  turns?: number;
  // ribbon / ring
  lanes?: number;
  segs?: number;
  faceOn?: number;
  // morph
  rDot?: number;
  iconD?: number;
  // shared
  rsPow?: number;
  rMin?: number;
  // At.extra overlays
  scanMul?: number;
  dimBase?: number;
  spin?: number;
  bandMul?: number;
  wobMul?: number;
  spread?: number;
}

export type ModeFrame = (size: number, t: number, opts: ModeOpts) => OrbFrame;

export interface ResolvedPreset {
  mode: ModeKey;
  speed: number;
  opts: ModeOpts;
}
