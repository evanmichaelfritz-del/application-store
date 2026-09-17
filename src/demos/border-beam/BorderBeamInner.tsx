import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

import { AutoPill, Magnifier, SendButton } from '@/src/libdev/Controls';
import type { DemoProps } from '@/src/libdev/tokens';
import { libdevColors as colors } from '@/src/libdev/tokens';
import { useLatchedLayout } from '@/src/libdev/useLatchedLayout';
import { useLoopProgress } from '@/src/libdev/useLoopProgress';

import { BorderBeamStroke } from './BorderBeamStroke';

const BEAM = ['#ff4d9a', '#c026d3', '#a855f7', '#fb7c3a'];
const SEARCH = ['#ff8ab8', '#ff5aa5', '#e879f9'];

export default function BorderBeamInner({ reducedMotion, clockRunning }: DemoProps) {
  const beam = useLoopProgress(2800, reducedMotion, 0.12, clockRunning);
  const search = useLoopProgress(5200, reducedMotion, 0.4, clockRunning);
  const chat = useLatchedLayout({ w: 0, h: 56 });
  const pill = useLatchedLayout({ w: 0, h: 44 });

  return (
    <View style={[styles.root, { pointerEvents: 'none' }]}>
      <View collapsable={false} style={styles.chat} onLayout={chat.onLayout}>
        {chat.ready ? (
          <Canvas collapsable={false} style={styles.canvasFill}>
            <BorderBeamStroke
              progress={beam}
              box={{ x: 1.5, y: 1.5, w: chat.box.w - 3, h: chat.box.h - 3, r: 22 }}
              colors={BEAM}
            />
          </Canvas>
        ) : null}
        <Text style={styles.brace}>{'}'}</Text>
        <Text style={styles.ellipsis}>…</Text>
        <View style={styles.spacer} />
        <AutoPill />
        <SendButton />
      </View>

      <View collapsable={false} style={styles.search} onLayout={pill.onLayout}>
        {pill.ready ? (
          <Canvas collapsable={false} style={styles.canvasFill}>
            <BorderBeamStroke
              progress={search}
              box={{ x: 1.5, y: 1.5, w: pill.box.w - 3, h: pill.box.h - 3, r: 20 }}
              colors={SEARCH}
              dim={0.55}
              alongBottom
            />
          </Canvas>
        ) : null}
        <Magnifier />
        <Text style={styles.searchText}>Search</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 18,
  },
  chat: {
    height: 56,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: '#0c0c0c',
  },
  brace: {
    color: colors.chromeDim,
    fontSize: 20,
    fontWeight: '500',
    marginTop: -2,
  },
  ellipsis: {
    color: colors.muted,
    fontSize: 18,
    letterSpacing: 1,
  },
  spacer: {
    flex: 1,
  },
  search: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#0c0c0c',
    minWidth: 148,
  },
  searchText: {
    color: colors.chrome,
    fontSize: 14,
    fontWeight: '500',
  },
  canvasFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});
