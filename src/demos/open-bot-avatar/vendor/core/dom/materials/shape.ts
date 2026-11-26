/*!
 * MIT License
 * Copyright (c) 2026 Dominik Scholz
 * https://github.com/DominikScholz/open-bot-avatar
 * 646793af2c86604539e02faa344e9793ab2aefe8
 */

import type { Bounds } from '../../path';
import type { Volume } from '../../volume';

/** A state mark: a vertical capsule centered at the origin. */
export interface Capsule {
  bounds: Bounds;
  radius: number;
}

export type MaterialShape = Volume | Capsule;

/** Front-to-back half extent of a body or state mark. */
export function halfDepth(shape: MaterialShape): number {
  return 'radius' in shape ? shape.radius : Math.max(0.5, ...shape.parts.map((part) => part.depth / 2));
}
