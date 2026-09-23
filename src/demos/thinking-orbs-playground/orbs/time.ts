/**
 * Shared wall clock for every orb.
 * t = nowSeconds * bakedSpeed * speedProp.
 * Paused keeps the last t. Reduced motion is a static t of 0.6.
 * State/size changes do not reset the clock — callers pass wall time, not mount elapsed.
 */
export function orbTime(input: {
  nowSeconds: number;
  bakedSpeed: number;
  speed: number;
  paused: boolean;
  reducedMotion: boolean;
  frozen: number | null;
}): { t: number; frozen: number | null } {
  if (input.reducedMotion) {
    return { t: 0.6, frozen: input.frozen };
  }
  if (input.paused) {
    const frozen = input.frozen ?? input.nowSeconds * input.bakedSpeed * input.speed;
    return { t: frozen, frozen };
  }
  return {
    t: input.nowSeconds * input.bakedSpeed * input.speed,
    frozen: null,
  };
}
