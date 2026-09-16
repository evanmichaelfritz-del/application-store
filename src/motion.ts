import { Platform } from 'react-native';
import {
  Easing,
  LinearTransition,
  withSpring,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

export const ease = {
  outEase: Easing.bezier(0.22, 1, 0.36, 1),
  smoothOut: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.inOut(Easing.ease),
  out: Easing.out(Easing.ease),
  linear: Easing.linear,
  shake: Easing.bezier(0.36, 0.07, 0.19, 0.97),
} as const;

export const springs = {
  layout: { damping: 20, stiffness: 280, mass: 1 } satisfies WithSpringConfig,
  default: { damping: 20, stiffness: 280 } satisfies WithSpringConfig,
  pop: { mass: 0.8, damping: 12, stiffness: 280 } satisfies WithSpringConfig,
  snap: { damping: 18, stiffness: 300 } satisfies WithSpringConfig,
} as const;

export const tokens = {
  morph: 300,
  page: 300,
  modal: 200,
  fade: 250,
  digitStagger: 50,
  menu: 180,
  toastIn: 180,
  toastOut: 120,
  shimmer: 1200,
  tooltipDelay: 400,
  shake: 400,
  shakePx: 7,
} as const;

export function timed(
  to: number,
  ms: number,
  easing: EasingFunction | EasingFunctionFactory = ease.outEase,
  reduced = false,
): number {
  'worklet';
  if (reduced) return withTiming(to, { duration: 0 });
  const cfg: WithTimingConfig = { duration: ms, easing };
  return withTiming(to, cfg);
}

export function sprung(
  to: number,
  config: WithSpringConfig = springs.default,
  reduced = false,
): number {
  'worklet';
  if (reduced) return withTiming(to, { duration: 0 });
  return withSpring(to, config);
}

export function layoutTransition(reduced: boolean) {
  if (reduced) return LinearTransition.duration(0);
  return LinearTransition.springify().damping(20).stiffness(280);
}

export function webFilter(blurPx: number): Record<string, string> | undefined {
  'worklet';
  if (Platform.OS !== 'web' || blurPx <= 0) return undefined;
  return { filter: `blur(${blurPx}px)` };
}
