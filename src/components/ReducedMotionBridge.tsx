import { ReduceMotion, ReducedMotionConfig } from 'react-native-reanimated';
import { useReduceMotion } from '../context/ReduceMotionContext';

export function ReducedMotionBridge() {
  const { forceReduceMotion } = useReduceMotion();
  // Off: Reanimated already follows AccessibilityInfo (system).
  // On: force-disable every Reanimated timing.
  if (!forceReduceMotion) return null;
  return <ReducedMotionConfig mode={ReduceMotion.Always} />;
}
