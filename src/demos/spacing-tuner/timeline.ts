import { VARIABLES, VarKey } from './tokens';

/** Loop length in seconds. */
export const LOOP_S = 10;
/** Phase k (0..4) begins at PHASE0_S + k * PHASE_STEP_S. */
export const PHASE0_S = 0.8;
export const PHASE_STEP_S = 1.3;
/** Overlay + chip ring fade in (linear) from phase start. */
export const FADE_IN_S = 0.15;
/** The value starts moving this long after its phase starts. */
export const VALUE_DELAY_S = 0.2;
/** Overlay + chip ring fade out (linear) starting this long after phase start. */
export const FADE_OUT_AT_S = 1.0;
export const FADE_OUT_S = 0.25;
/** All five values spring back together at this time; no overlays. */
export const REVERT_S = 9.1;
/** Rest window: the picture is already the tuned pose, so the clock skips renders. */
export const REST_S = 7.25;
/** Reduced motion holds this frame: the settled tuned pose, overlays gone. */
export const REDUCED_HOLD_S = 7.5;

/**
 * Spring: mass 1, stiffness 202, damping 21.35 (zeta ≈ 0.751), zero initial velocity.
 * Peak overshoot is 2.80% at +0.335 s. On the 64 px sidebar move that is +1.8 px,
 * which rounds to +2 px and never +3. Card padding (12 px) peaks at +0.34 px.
 */
export const SPRING = { stiffness: 202, damping: 21.35, mass: 1 } as const;

const W0 = Math.sqrt(SPRING.stiffness / SPRING.mass);
const ZETA = SPRING.damping / (2 * Math.sqrt(SPRING.stiffness * SPRING.mass));
const WD = W0 * Math.sqrt(1 - ZETA * ZETA);

/** Normalised spring step response, 0 -> 1 with 2.80% overshoot at 0.335 s. */
export function spring(t: number): number {
  if (t <= 0) return 0;
  const decay = Math.exp(-ZETA * W0 * t);
  return 1 - decay * (Math.cos(WD * t) + ((ZETA * W0) / WD) * Math.sin(WD * t));
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const step = (t: number) => (t >= 0 ? 1 : 0);

function blankVars(): VarMap<number> {
  return { sidebar: 0, padding: 0, rowGap: 0, colGap: 0, cardPadding: 0 };
}

export type VarMap<T> = Record<VarKey, T>;

export interface Frame {
  /** Live layout values (may overshoot slightly). */
  values: VarMap<number>;
  /** Chip numbers: rounded, never past from/to. */
  display: VarMap<number>;
  /** Overlay and chip-ring opacity 0..1. */
  emphasis: VarMap<number>;
}

export function phaseStart(index: number): number {
  return PHASE0_S + index * PHASE_STEP_S;
}

/** Scene state at time t (seconds; wraps every LOOP_S). */
export function frameAt(tRaw: number, reducedMotion = false): Frame {
  const t = ((tRaw % LOOP_S) + LOOP_S) % LOOP_S;
  const values = blankVars();
  const display = blankVars();
  const emphasis = blankVars();
  VARIABLES.forEach((v, i) => {
    const start = phaseStart(i);
    const ease = reducedMotion ? step : spring;
    const p = ease(t - (start + VALUE_DELAY_S)) - ease(t - REVERT_S);
    values[v.key] = v.from + (v.to - v.from) * p;
    display[v.key] = Math.round(v.from + (v.to - v.from) * clamp01(p));
    if (reducedMotion) {
      emphasis[v.key] = t >= start && t < start + FADE_OUT_AT_S ? 1 : 0;
    } else {
      const fin = clamp01((t - start) / FADE_IN_S);
      const fout = clamp01((t - (start + FADE_OUT_AT_S)) / FADE_OUT_S);
      emphasis[v.key] = fin * (1 - fout);
    }
  });
  return { values, display, emphasis };
}
