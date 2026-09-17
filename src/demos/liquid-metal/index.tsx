import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import LiquidMetalInner from './LiquidMetalInner';

export function LiquidMetalDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <LiquidMetalInner reducedMotion={reduceMotion} />
    </LibdevStage>
  );
}
