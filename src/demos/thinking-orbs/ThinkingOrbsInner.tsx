import { Canvas } from '@shopify/react-native-skia';
import { useCallback, useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { DemoProps } from '@/src/libdev/tokens';
import { libdevColors as colors } from '@/src/libdev/tokens';

import { DottedSphere, MetallicOrb } from './Orbs';

function StatusPill({
  label,
  indent,
  large,
  children,
}: {
  label: string;
  indent: number;
  large?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={[styles.pill, large && styles.pillLarge, { marginLeft: indent }]}>
      <Text style={[styles.label, large && styles.labelLarge]} numberOfLines={1}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function ThinkingOrbsInner({ reducedMotion, clockRunning }: DemoProps) {
  const spin = useSharedValue(0.4);
  const swirl = useSharedValue(0.9);

  const stop = useCallback(() => {
    cancelAnimation(spin);
    cancelAnimation(swirl);
  }, [spin, swirl]);

  const start = useCallback(() => {
    stop();
    spin.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
    swirl.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 7200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [spin, stop, swirl]);

  useEffect(() => {
    if (reducedMotion) {
      stop();
      spin.value = 0.4;
      swirl.value = 0.9;
      return;
    }
    if (clockRunning && clockRunning.value === 0) {
      stop();
      return;
    }
    start();
    return stop;
  }, [clockRunning, reducedMotion, spin, start, stop, swirl]);

  useAnimatedReaction(
    () => (clockRunning ? clockRunning.value : 1),
    (run, prev) => {
      if (reducedMotion) return;
      if (prev === undefined || run === prev) return;
      if (!run) runOnJS(stop)();
      else runOnJS(start)();
    },
    [clockRunning, reducedMotion, start, stop],
  );

  return (
    <View style={[styles.root, { pointerEvents: 'none' }]}>
      <StatusPill label="Agent searching..." indent={4} />
      <StatusPill label="Agent listening..." indent={22} />
      <StatusPill label="Solving...." indent={40} large>
        <Canvas style={styles.orbCanvas}>
          <DottedSphere cx={22} cy={22} radius={15} rotation={spin} />
        </Canvas>
      </StatusPill>
      <StatusPill label="Thinking...." indent={58} large>
        <Canvas style={styles.orbCanvas}>
          <MetallicOrb cx={22} cy={22} radius={16} swirl={swirl} />
        </Canvas>
      </StatusPill>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pillLarge: {
    paddingVertical: 10,
    paddingRight: 8,
    borderRadius: 18,
  },
  label: {
    color: colors.chrome,
    fontSize: 13,
    fontWeight: '500',
  },
  labelLarge: {
    fontSize: 15,
  },
  orbCanvas: {
    width: 44,
    height: 44,
    pointerEvents: 'none',
  },
});
