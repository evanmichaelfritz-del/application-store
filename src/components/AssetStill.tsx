import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StillMotion } from '@/src/context/ReduceMotionContext';
import { viewWeb } from '@/src/library/webProps';
import type { TransitionItem } from '@/src/catalog';
import { colors } from '@/src/theme';

function MissingIcon({ box }: { box: number }) {
  const glyph = box >= 40 ? 24 : 16;
  return (
    <View style={[styles.icon, { width: box, height: box }]}>
      <Ionicons name="image-outline" size={glyph} color={colors.textFaint} />
    </View>
  );
}

/**
 * Static Skia frame. Poster files are a later PR, so this does not request
 * `/posters/<id>.png` until those files exist.
 */
export function SkiaPoster({ box }: { id: string; box: number }) {
  return <MissingIcon box={box} />;
}

/** 44 or 28 still. Skia shows the poster placeholder. Everything else is the demo held at rest. */
export function ThumbStill({ item, size }: { item: TransitionItem; size: number }) {
  if (item.skia) return <SkiaPoster id={item.id} box={size} />;
  const scale = size / 200;
  return (
    <View
      style={[styles.clip, { width: size, height: size, borderRadius: size <= 28 ? 6 : 8 }]}
      pointerEvents="none"
    >
      <View
        {...viewWeb({ dataSet: { stillScale: String(scale) } })}
        style={[styles.scaled, { width: 200, height: 200 }]}
      >
        <StillMotion>
          <item.Demo />
        </StillMotion>
      </View>
    </View>
  );
}

export function HeldDemo({ item, children }: { item: TransitionItem; children?: ReactNode }) {
  if (children) return <StillMotion>{children}</StillMotion>;
  return (
    <StillMotion>
      <item.Demo />
    </StillMotion>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.stage,
  },
  clip: { overflow: 'hidden', backgroundColor: colors.stage },
  scaled: { overflow: 'hidden' },
});
