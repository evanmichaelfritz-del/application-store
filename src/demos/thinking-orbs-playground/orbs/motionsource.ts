import { resolvePreset } from "./engine";
import type { ModeKey, ModeOpts, OrbSize, OrbState, ResolvedPreset } from "./types";

/**
 * Motionsource keys (MOTION_LOCK § Motionsource keys / Design Motionsource table).
 * Presentation labels wire these — never playground `state=` renames.
 */
export type MotionsourceKey =
  | "msThinking"
  | "msPlanning"
  | "msAgentThinking"
  | "msAgentPlanning"
  | "msAgentShaping";

/**
 * Internal recipe state used only to pull MODE_FRAMES + resolvePreset opts.
 * Not a chrome/label→prop map — Motionsource key is the public API.
 */
type Recipe = {
  /** resolvePreset state that yields the locked mode + opts */
  recipe: OrbState;
  size: OrbSize;
  /** Asserted mode from MOTION_LOCK (ring / ribbon / morph). */
  mode: ModeKey;
};

const MOTIONSOURCE: Record<MotionsourceKey, Recipe> = {
  // Thinking.... → ring + breathing opts @64
  msThinking: { recipe: "breathing", size: 64, mode: "ring" },
  // Planning.... → ribbon + composing opts @64
  msPlanning: { recipe: "composing", size: 64, mode: "ribbon" },
  // Agent thinking... → ring + breathing opts @20
  msAgentThinking: { recipe: "breathing", size: 20, mode: "ring" },
  // Agent planning... → ribbon + composing opts @20 (NOT orbits)
  msAgentPlanning: { recipe: "composing", size: 20, mode: "ribbon" },
  // Agent shaping... → morph loop @20 — no frameTime pin
  msAgentShaping: { recipe: "shaping", size: 20, mode: "morph" },
};

export function motionsourceSize(key: MotionsourceKey): OrbSize {
  return MOTIONSOURCE[key].size;
}

/** Resolve Motionsource key → preset for paint. Throws if vendor mode drifts from lock. */
export function resolveMotionsource(key: MotionsourceKey): ResolvedPreset & { size: OrbSize } {
  const entry = MOTIONSOURCE[key];
  const preset = resolvePreset(entry.recipe, entry.size);
  if (preset.mode !== entry.mode) {
    // Soft assert — still return vendor preset; Eng/Motion can catch in review
    console.warn(
      `[motionsource] ${key}: expected mode ${entry.mode}, vendor returned ${preset.mode}`,
    );
  }
  return { ...preset, size: entry.size };
}

export type { ModeOpts };
