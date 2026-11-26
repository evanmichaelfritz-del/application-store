/*!
 * MIT License
 * Copyright (c) 2026 Dominik Scholz
 * https://github.com/DominikScholz/open-bot-avatar
 * 646793af2c86604539e02faa344e9793ab2aefe8
 */

import { renderFluffy } from '../fluffy/renderer';
import type { CanvasMaterial } from './material';

/** Opt-in fluffy finish. No WebGL context is created until the first render. */
export const fluffy: CanvasMaterial = {
  id: 'fluffy',
  margin: 3,
  render: (...args) => renderFluffy(...args),
};
