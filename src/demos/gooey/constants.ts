export const TILE_W = 120;
export const TILE_H = 148;
export const TILE_RADIUS = 28;
/** Drag distance from rest before the lower tile snaps back. */
export const SNAP_DRAG = 168;

/** Rest offset of the lower tile relative to the upper tile. */
export const REST_X = 28;
export const REST_Y = 78;

/** Cap metaball samples — never more than this many neck dots. */
export const NECK_SAMPLES = 3;
/** Neck width/dot size floor. CoS: ≥12–20px mid-drag. */
export const NECK_MIN = 16;

/** Singleton goo filter — reused for the Canvas lifetime, never rebuilt on pan. */
export const BLUR_SIGMA = 8;
/** Web ladder 1: lower sigma so saveLayer raster stays cheaper than σ=16. */
export const BLUR_SIGMA_WEB = 4;
export const GOO_MATRIX = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 18, -7,
];

/**
 * Opaque red hit: set true. Drag proof does not need it — the lower tile
 * View translates. `[gooey] onBegin` stamps `window.__gooeyOnBegin` once
 * per gesture (not mid-drag).
 */
export const DEBUG_GOOEY_HIT = false;
