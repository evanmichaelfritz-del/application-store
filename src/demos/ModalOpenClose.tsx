import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { timed, tokens } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

export function ModalDemo() {
  const { reduceMotion } = useReduceMotion();
  const [open, setOpen] = useState(false);
  const progress = useDerivedValue(() => timed(open ? 1 : 0, tokens.modal, undefined, reduceMotion));
  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value * 0.28 }));
  const sheet = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  return (
    <Stage>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.triggerText}>Toggle modal</Text>
      </Pressable>
      <Animated.View style={[StyleSheet.absoluteFill, styles.layer, { pointerEvents: open ? 'auto' : 'none' }]}>
        <Animated.View style={[styles.backdrop, backdrop]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        <Animated.View style={[styles.modal, sheet]}>
          <Text style={styles.title}>New project</Text>
          <Text style={styles.body}>Scale from 0.94 with a 200ms fade.</Text>
          <Pressable onPress={() => setOpen(false)} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  layer: { alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#0d0d0d' },
  trigger: {
    backgroundColor: colors.material,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    ...shadows.material,
  },
  triggerText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  modal: {
    width: 210,
    backgroundColor: colors.material,
    borderRadius: 14,
    padding: 16,
    ...shadows.material,
  },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 6 },
  body: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textMuted, marginBottom: 12 },
  close: { alignSelf: 'flex-end' },
  closeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
});
