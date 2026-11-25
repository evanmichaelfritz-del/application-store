/*!
 * MIT License
 * Copyright (c) 2026 Dominik Scholz
 * https://github.com/DominikScholz/open-bot-avatar
 */

export { mountAvatar } from './mount';
export type { AvatarOptions, MountedAvatar } from './mount';
export { requestFrame, setPointer, subscribeFrames } from './clock';
export type { FrameSubscriber, Pointer } from './clock';
export { trackPointer } from './pointer';
export { prefersReducedMotion } from './reduced';
