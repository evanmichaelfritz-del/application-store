/*!
 * MIT License
 * Copyright (c) 2026 Dominik Scholz
 * https://github.com/DominikScholz/open-bot-avatar
 * 646793af2c86604539e02faa344e9793ab2aefe8
 */

export type { AvatarDefinition, AvatarEyes, AvatarMood, AvatarMotion, AvatarMotionBlend, AvatarState, RenderOptions, ValidationResult } from './types';
export { validateAvatar } from './validate';
export {
  avatarFrame,
  renderAvatarSvg,
  renderAvatarScene,
  sceneFrame,
  DEFAULT_COLOR,
  DEFAULT_DEPTH,
  DEFAULT_EYE_COLOR,
} from './render';
export type { AvatarFrame, EyeMark, FramePath, FrameShape, Matrix, SceneFrame, SurfaceEye } from './render';
export { BASE_PITCH, BASE_YAW, DONE_CYCLE_S, DONE_TURN_S, MOODS, STATES, blendPoses, computePose, isMood, isState, resolveLook, stateDefinition } from './motion';
export type { AvatarStateDefinition, EyeLook, Pose, PoseInput, StateContext } from './motion';
export type { AvatarMark, MarkContext, MarkPart, PoseMark } from './marks';
export { MOOD_MS, moodProgress, settleMood } from './mood';
export type { MoodState } from './mood';
export { REST, followGaze, followStep, pointerGaze } from './follow';
export type { FollowState } from './follow';
export { createAnimator } from './animator';
export type { Animator, AnimatorInput, AnimatorStep } from './animator';
export { examples, getExample } from './examples';
