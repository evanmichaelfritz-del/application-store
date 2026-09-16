import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { fonts } from '@/src/theme';

const PEOPLE = [
  { initials: 'JC', color: '#d9b8a2' },
  { initials: 'AK', color: '#b7c7d9' },
  { initials: 'MR', color: '#d4c4a8' },
  { initials: 'SL', color: '#c5b3d6' },
  { initials: 'TW', color: '#a8c5b8' },
];

export function AvatarGroupDemo() {
  const { reduceMotion } = useReduceMotion();
  const [hot, setHot] = useState<number | null>(null);

  return (
    <Stage>
      <View style={styles.row}>
        {PEOPLE.map((person, i) => (
          <Avatar
            key={person.initials}
            person={person}
            index={i}
            hot={hot}
            reduceMotion={reduceMotion}
            onEnter={() => setHot(i)}
            onLeave={() => setHot(null)}
          />
        ))}
      </View>
    </Stage>
  );
}

function Avatar({
  person,
  index,
  hot,
  reduceMotion,
  onEnter,
  onLeave,
}: {
  person: (typeof PEOPLE)[number];
  index: number;
  hot: number | null;
  reduceMotion: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const dist = hot === null ? 0 : Math.abs(hot - index);
  const strength = hot === null ? 0 : Math.max(0, 1 - dist * 0.45);
  const lift = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    lift.value = sprung(-8 * strength, springs.default, reduceMotion);
    scale.value = sprung(1 + 0.06 * strength, springs.default, reduceMotion);
  }, [lift, reduceMotion, scale, strength]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: scale.value }],
    zIndex: strength > 0.9 ? 3 : 1,
  }));

  return (
    <Pressable onHoverIn={onEnter} onHoverOut={onLeave} onPressIn={onEnter} onPressOut={onLeave}>
      <Animated.View style={[styles.av, { backgroundColor: person.color, marginLeft: index === 0 ? 0 : -10 }, style]}>
        <Text style={styles.ini}>{person.initials}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  av: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ini: { fontFamily: fonts.medium, fontSize: 11, color: '#2a2118' },
});
