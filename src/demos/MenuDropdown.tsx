import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { timed, tokens } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

const ITEMS = ['New file', 'Add image', 'New folder'];

export function MenuDropdownDemo() {
  const { reduceMotion } = useReduceMotion();
  const [open, setOpen] = useState(false);
  const progress = useDerivedValue(() => timed(open ? 1 : 0, tokens.menu, undefined, reduceMotion));
  const menu = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  return (
    <Stage>
      <View style={styles.anchor}>
        <Pressable onPress={() => setOpen((v) => !v)} style={styles.trigger}>
          <Text style={styles.triggerText}>{open ? 'Close menu' : 'Open menu'}</Text>
        </Pressable>
        <Animated.View style={[styles.menu, menu, { pointerEvents: open ? 'auto' : 'none' }]}>
          {ITEMS.map((item) => (
            <Pressable key={item} onPress={() => setOpen(false)} style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  anchor: { alignItems: 'flex-start', minWidth: 160 },
  trigger: {
    backgroundColor: colors.material,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 34,
    justifyContent: 'center',
    ...shadows.material,
  },
  triggerText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  menu: {
    marginTop: 8,
    backgroundColor: colors.material,
    borderRadius: 12,
    padding: 6,
    width: 160,
    transformOrigin: 'top left',
    ...shadows.material,
  },
  item: { height: 32, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 8 },
  itemText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
});
