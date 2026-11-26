/*!
646793af2c86604539e02faa344e9793ab2aefe8

MIT License

Copyright (c) 2026 Dominik Scholz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
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
