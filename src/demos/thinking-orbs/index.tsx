import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import ThinkingOrbsInner from './ThinkingOrbsInner';

export function ThinkingOrbsDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <ThinkingOrbsInner reducedMotion={reduceMotion} />
    </LibdevStage>
  );
}
