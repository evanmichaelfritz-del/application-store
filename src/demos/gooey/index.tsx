import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import GooeyViews from './GooeyViews';

export function GooeyDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <GooeyViews reducedMotion={reduceMotion} />
    </LibdevStage>
  );
}
