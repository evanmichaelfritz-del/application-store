import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Stage } from '../components/Stage';
import { useReduceMotion } from '../context/ReduceMotionContext';
import { ease, springs } from '../motion';
import { colors, fonts, shadows } from '../theme';

const COLORS = ['#ff5a5f', '#f5c518', '#2ecc71', '#4da3ff', '#b07cff', '#ff8a3d'];
const COUNT = 18;
const STAGE_H = 220;
const BTN_H = 36;
const BIT_W = 8;
const BIT_H = 10;
const FALLBACK_REST_Y = (STAGE_H - BTN_H) / 2 - BIT_H + 1;

type Piece = {
  id: number;
  x: number;
  peak: number;
  color: string;
  rot: number;
  delay: number;
};

function makePieces(seed: number): Piece[] {
  return Array.from({ length: COUNT }, (_, id) => ({
    id,
    x: ((id % 9) - 4) * 9 + (id % 2) * 3,
    peak: 46 + (id % 6) * 8,
    color: COLORS[id % COLORS.length],
    rot: ((id * 37 + seed * 11) % 200) - 100,
    delay: (id % 6) * 18,
  }));
}

function ConfettiBit({
  piece,
  burst,
  reduced,
  restY,
  originX,
}: {
  piece: Piece;
  burst: number;
  reduced: boolean;
  restY: number;
  originX: number;
}) {
  const lift = useSharedValue(0);
  const x = useSharedValue(0);
  const spin = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    if (!burst) return;
    op.value = 1;
    if (reduced) {
      lift.value = 0;
      x.value = piece.x;
      spin.value = piece.rot;
      return;
    }
    lift.value = 0;
    x.value = 0;
    spin.value = 0;
    x.value = withDelay(piece.delay, withSpring(piece.x, springs.default));
    lift.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(-piece.peak, { duration: 180, easing: ease.outEase }),
        withSpring(0, springs.snap),
      ),
    );
    spin.value = withDelay(
      piece.delay,
      withTiming(piece.rot, { duration: 720, easing: Easing.out(Easing.quad) }),
    );
  }, [burst, piece, reduced, lift, op, spin, x]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      { translateX: x.value },
      { translateY: Math.min(lift.value, 0) },
      { rotate: `${spin.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      testID="confetti-bit"
      style={[styles.bit, { top: restY, left: originX, backgroundColor: piece.color }, style]}
    />
  );
}

export function ConfettiBurstDemo() {
  const { reduceMotion } = useReduceMotion();
  const [burst, setBurst] = useState(0);
  const [restY] = useState(FALLBACK_REST_Y);
  const [originX, setOriginX] = useState(120);
  const lastSpawn = useRef(0);
  const pieces = useMemo(() => makePieces(burst), [burst]);

  const celebrate = () => {
    const now = Date.now();
    if (now - lastSpawn.current < 80) return;
    lastSpawn.current = now;
    setBurst((n) => n + 1);
  };

  return (
    <Stage>
      <View
        style={styles.scene}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setOriginX(w / 2 - BIT_W / 2);
        }}
      >
        {burst > 0
          ? pieces.map((p) => (
              <ConfettiBit
                key={`${burst}-${p.id}`}
                piece={p}
                burst={burst}
                reduced={reduceMotion}
                restY={restY}
                originX={originX}
              />
            ))
          : null}
        <Pressable
          onPress={celebrate}
          onPressIn={celebrate}
          accessibilityRole="button"
          accessibilityLabel="Celebrate"
          style={styles.btn}
        >
          <Text style={styles.btnText}>Celebrate</Text>
        </Pressable>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: '100%',
    height: STAGE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bit: {
    position: 'absolute',
    width: BIT_W,
    height: BIT_H,
    borderRadius: 1.5,
    zIndex: 4,
  },
  btn: {
    backgroundColor: colors.material,
    paddingHorizontal: 14,
    height: BTN_H,
    borderRadius: 10,
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.material,
  },
  btnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
});
