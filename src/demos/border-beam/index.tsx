import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import BorderBeamInner from './BorderBeamInner';

export function BorderBeamDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <BorderBeamInner reducedMotion={reduceMotion} />
    </LibdevStage>
  );
}
