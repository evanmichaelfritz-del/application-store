/** Types for the vendored thinking-orbs@0.3.1 engine build. */
import type { ModeFrame, ModeKey, ModeOpts, OrbFrame, OrbSize, OrbState, ResolvedPreset } from "../types";

export type { ModeFrame, ModeKey, ModeOpts, OrbFrame, OrbSize, OrbState, ResolvedPreset };

export interface EngineDot {
  x: number;
  y: number;
  z: number;
  r: number;
  white?: number;
  a?: number;
}

export interface EngineLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  white?: number;
  a?: number;
}

export interface EngineFrame {
  dots: EngineDot[];
  lines: EngineLine[];
}

export declare const MODE_FRAMES: Record<ModeKey, ModeFrame>;
export declare const STATE_TO_MODE: Record<OrbState, ModeKey>;

export declare function resolvePreset(state: OrbState, size: OrbSize): ResolvedPreset;
