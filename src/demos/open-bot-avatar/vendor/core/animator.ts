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

/**
 * The per-avatar state a live renderer keeps between frames, independent of
 * any platform: the eased look toward a target (follow.ts) and the eased
 * change between states and moods (mood.ts). Feed it once per frame; it
 * returns the `gaze`, `motionBlend` and `stateAge` render options for that
 * frame and whether it is still easing.
 */
import { REST, followGaze, followStep, type FollowState } from './follow';
import { lookOf, stateDefinition, stateId, type AvatarStateDefinition } from './motion';
import { moodProgress, settleMood, type MoodState } from './mood';
import type { AvatarMood, AvatarMotion, AvatarMotionBlend, AvatarState } from './types';

export interface AnimatorInput {
  /** Wall clock, ms (e.g. performance.now()). Easing runs on it even when the animation clock stops. */
  now: number;
  state?: AvatarState | AvatarStateDefinition;
  mood?: AvatarMood;
  /** @deprecated Use `state` and `mood`; they win when given. */
  motion?: AvatarMotion;
  /** Look target, -1..1 per axis (x right, y down), e.g. from pointerGaze; null eases back to rest. */
  target: { x: number; y: number } | null;
  /** Keep the current look as it is (e.g. while the user drags the view). */
  hold?: boolean;
  /** Snap instead of easing. */
  reducedMotion: boolean;
}

export interface AnimatorStep {
  gaze?: { x: number; y: number; weight: number };
  motionBlend?: AvatarMotionBlend;
  /** Seconds since the state began (a change of mood alone does not restart it). */
  stateAge: number;
  /** True while the look or a change of state or mood is still easing. */
  moving: boolean;
}

export interface Animator {
  step(input: AnimatorInput): AnimatorStep;
  /** Back to rest with no history, e.g. when the avatar is remounted. */
  reset(): void;
}

export function createAnimator(): Animator {
  let follow: FollowState = REST;
  let last: number | null = null;
  // What is on screen, when its change began and when its state began.
  let shown: { state: AvatarState | AvatarStateDefinition; mood: AvatarMood; blend?: AvatarMotionBlend; since: number; began: number } | null = null;

  return {
    step({ now, target, hold = false, reducedMotion, ...given }) {
      const dt = last === null ? 0 : (now - last) / 1000;
      last = now;
      let moving = false;
      if (!hold) ({ state: follow, moving } = followStep(follow, target, dt, reducedMotion));

      // A new state or mood eases in from the pose on screen (a change under way included); reduced motion switches at once.
      const { state, mood } = lookOf(given);
      const same = shown !== null && stateId(state) === stateId(shown.state);
      // The same state given again may be a newer definition of it: that one is on screen from now on.
      if (shown && same) shown.state = state;
      if (shown && (!same || mood !== shown.mood)) {
        const before: MoodState = {
          state: shown.state,
          mood: shown.mood,
          age: (now - shown.began) / 1000,
          blend: shown.blend && { from: shown.blend.from, t: moodProgress(now - shown.since) },
        };
        shown = {
          state,
          mood,
          blend: reducedMotion ? undefined : { from: settleMood(before), t: 0 },
          since: now,
          began: same ? shown.began : now,
        };
      }
      // An avatar that mounts done starts it at rest, as if it had just finished celebrating; any
      // other state starts afresh (a working bot's first sweep comes a second or two in).
      const startAge = stateDefinition(state).startAge;
      shown ??= { state, mood, since: now, began: now - (Number.isFinite(startAge) ? Math.max(0, startAge as number) : 0) * 1000 };
      const t = reducedMotion ? 1 : moodProgress(now - shown.since);
      let motionBlend: AvatarMotionBlend | undefined;
      if (shown.blend && t < 1) motionBlend = { from: shown.blend.from, t };
      else shown.blend = undefined;

      return { gaze: followGaze(follow), motionBlend, stateAge: (now - shown.began) / 1000, moving: moving || motionBlend !== undefined };
    },
    reset() {
      follow = REST;
      last = null;
      shown = null;
    },
  };
}
