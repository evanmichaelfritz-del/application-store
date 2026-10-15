import { useEffect } from 'react';
import { ReduceMotion, ReducedMotionConfig } from 'react-native-reanimated';
import { useReduceMotion } from '../context/ReduceMotionContext';

export function ReducedMotionBridge() {
  const { reduceMotion, forceReduceMotion } = useReduceMotion();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.reduceMotion = reduceMotion ? '1' : '0';
  }, [reduceMotion]);
  // Off: Reanimated already follows AccessibilityInfo (system).
  // On: force-disable every Reanimated timing.
  if (!forceReduceMotion) return null;
  return <ReducedMotionConfig mode={ReduceMotion.Always} />;
}
