import { StyleSheet } from 'react-native';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import { DemoScreen } from './chrome/DemoScreen';
import { OrbClockProvider } from './orbs/clock';

/**
 * Store card for the focused Preview / Playground / Install demo.
 * The baseball-card stage is 220px; the screen scrolls inside it.
 * Distinct from the Fibonacci / metallic `thinking-orbs` card.
 */
export function ThinkingOrbsPlaygroundDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <OrbClockProvider reducedMotion={reduceMotion}>
        <DemoScreen compact style={styles.fill} />
      </OrbClockProvider>
    </LibdevStage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignSelf: 'stretch', width: '100%', height: '100%' },
});
