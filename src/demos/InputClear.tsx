import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { layoutTransition } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

const SEED = 'search recent files';

export function InputClearDemo() {
  const { reduceMotion } = useReduceMotion();
  const [words, setWords] = useState(SEED.split(' '));

  const clear = () => {
    if (!words.length) {
      setWords(SEED.split(' '));
      return;
    }
    setWords([]);
  };

  return (
    <Stage>
      <View style={styles.field}>
        <View style={styles.row}>
          {words.length === 0 ? (
            <Text style={styles.placeholder}>Search</Text>
          ) : (
            words.map((word, i) => (
              <Animated.Text
                key={`${word}-${i}`}
                entering={reduceMotion ? undefined : FadeInDown.duration(250).delay(i * 45)}
                exiting={reduceMotion ? undefined : FadeOutUp.duration(250).delay(i * 45)}
                layout={layoutTransition(reduceMotion)}
                style={styles.word}
              >
                {word}
              </Animated.Text>
            ))
          )}
        </View>
        <Pressable onPress={clear} style={styles.x} hitSlop={8}>
          <Text style={styles.xText}>{words.length ? '×' : '+'}</Text>
        </Pressable>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  field: {
    width: 230,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4, overflow: 'hidden' },
  word: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  placeholder: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint },
  x: { width: 20, alignItems: 'center' },
  xText: { fontSize: 18, color: colors.textMuted, lineHeight: 20 },
});
