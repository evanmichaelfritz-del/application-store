import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { fonts } from '@/src/theme';
import { GUIDE, SAMPLE_CONTROLS, guideMarks, type Frame } from './marks';

export function SymmetryGridDemo() {
  const [on, setOn] = useState(false);
  const [row, setRow] = useState<Frame | null>(null);
  const [locals, setLocals] = useState<Partial<Record<string, Frame>>>({});

  const frames = row
    ? SAMPLE_CONTROLS.flatMap((control) => {
        const local = locals[control.id];
        if (!local) return [];
        return [
          {
            x: row.x + local.x,
            y: row.y + local.y,
            width: local.width,
            height: local.height,
          },
        ];
      })
    : [];

  const remember = (id: string) => (event: { nativeEvent: { layout: Frame } }) => {
    const next = roundFrame(event.nativeEvent.layout);
    setLocals((prev) => (sameFrame(prev[id], next) ? prev : { ...prev, [id]: next }));
  };

  return (
    <Stage>
      <View style={styles.field}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: on }}
          accessibilityLabel={on ? 'Hide symmetry guides' : 'Show symmetry guides'}
          testID="symmetry-grid-toggle"
          onPress={() => setOn((value) => !value)}
          style={[styles.toggle, on && styles.toggleOn]}
        >
          <Text style={[styles.toggleText, on && styles.toggleTextOn]}>Guides</Text>
        </Pressable>
        <View
          style={styles.row}
          onLayout={(event) => {
            const next = roundFrame(event.nativeEvent.layout);
            setRow((prev) => (sameFrame(prev, next) ? prev : next));
          }}
        >
          {SAMPLE_CONTROLS.map((control) => (
            <View
              key={control.id}
              onLayout={remember(control.id)}
              style={[
                styles.ctrl,
                control.kind === 'icon' && styles.icon,
                control.kind === 'short' && styles.short,
                control.kind === 'pill' && styles.pill,
                control.kind === 'send' && styles.send,
              ]}
            >
              <Text style={[styles.label, control.kind === 'send' && styles.sendLabel]}>
                {control.label}
              </Text>
            </View>
          ))}
        </View>
        {on && frames.length === SAMPLE_CONTROLS.length ? <GuideOverlay frames={frames} /> : null}
      </View>
    </Stage>
  );
}

function GuideOverlay({ frames }: { frames: Frame[] }) {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      {guideMarks(frames).map((mark) => {
        if (mark.kind === 'h') {
          return <View key={`h-${mark.y}`} style={[styles.h, { top: mark.y }]} />;
        }
        if (mark.kind === 'v') {
          return <View key={`v-${mark.x}`} style={[styles.v, { left: mark.x }]} />;
        }
        const frame = mark.frame;
        return (
          <View
            key={`b-${frame.x}-${frame.y}`}
            style={[styles.box, { left: frame.x, top: frame.y, width: frame.width, height: frame.height }]}
          />
        );
      })}
    </View>
  );
}

function roundFrame(frame: Frame): Frame {
  return {
    x: Math.round(frame.x),
    y: Math.round(frame.y),
    width: Math.round(frame.width),
    height: Math.round(frame.height),
  };
}

function sameFrame(prev: Frame | null | undefined, next: Frame): boolean {
  return !!prev && prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height;
}

const styles = StyleSheet.create({
  field: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  toggle: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    cursor: 'pointer',
  },
  toggleOn: { backgroundColor: '#17181c', borderColor: '#17181c' },
  toggleText: { fontFamily: fonts.medium, fontSize: 13, color: '#17181c' },
  toggleTextOn: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 1 },
  ctrl: {
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  icon: { width: 32, height: 32 },
  short: { height: 26, paddingHorizontal: 12 },
  pill: { height: 32, paddingHorizontal: 12 },
  send: { width: 32, height: 32, backgroundColor: '#17181c', borderColor: '#17181c' },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: '#17181c' },
  sendLabel: { color: '#fff' },
  overlay: { ...StyleSheet.absoluteFill, zIndex: 3 },
  h: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GUIDE,
  },
  v: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: GUIDE,
  },
  box: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: GUIDE,
  },
});
