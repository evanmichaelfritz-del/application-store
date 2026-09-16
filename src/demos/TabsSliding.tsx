import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

const TABS = ['Overview', 'Activity', 'Settings'];
const TAB_W = 78;

export function TabsSlidingDemo() {
  const { reduceMotion } = useReduceMotion();
  const [active, setActive] = useState(0);
  const x = useSharedValue(3);

  useEffect(() => {
    x.value = sprung(active * TAB_W + 3, springs.layout, reduceMotion);
  }, [active, reduceMotion, x]);

  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Stage>
      <View style={styles.bar}>
        <Animated.View style={[styles.pill, pill]} />
        {TABS.map((tab, i) => (
          <Pressable key={tab} onPress={() => setActive(i)} style={styles.tab}>
            <Text style={[styles.label, i === active && styles.on]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 999,
    padding: 3,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    width: TAB_W,
    borderRadius: 999,
    backgroundColor: '#fff',
    ...shadows.card,
  },
  tab: { width: TAB_W, height: 30, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(15,15,15,0.8)' },
  on: { color: '#0f0f0f' },
});
