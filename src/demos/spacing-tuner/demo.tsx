import { View } from 'react-native';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import SpacingTuner from './SpacingTuner';

/** Store mount. The asset is SpacingTuner; this wrapper only passes the store motion flag. */
export function SpacingTunerDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <View testID="spacing-tuner" style={{ width: '100%' }}>
      <SpacingTuner reducedMotion={reduceMotion} />
    </View>
  );
}
