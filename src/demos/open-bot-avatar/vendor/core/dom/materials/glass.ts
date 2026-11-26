/*!
 * MIT License
 * Copyright (c) 2026 Dominik Scholz
 * https://github.com/DominikScholz/open-bot-avatar
 * 646793af2c86604539e02faa344e9793ab2aefe8
 */

import { renderGlass } from '../glass/renderer';
import type { CanvasMaterial } from './material';

/** Opt-in glass finish. No WebGL context is created until the first render. */
export const glass: CanvasMaterial = {
  id: 'glass',
  margin: 3,
  render: (...args) => renderGlass(...args),
};
