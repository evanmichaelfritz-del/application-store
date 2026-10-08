import { useCallback } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useCardField } from '@/src/skia/cardState';
import { SliderRow } from './components/SliderRow';
import { PLAYGROUND } from './content/cards';
import { useArrowKeys } from './hooks/useArrowKeys';
import { OrbView } from './orb/OrbView';
import { fonts, useTheme } from './theme/theme';

/**
 * Effects showcase: one live orb, the 15 playground looks, and Size.
 * The Tools creator keeps Tuner.tsx; this host does not mount that panel.
 */
export function Showcase() {
  const { width } = useWindowDimensions();
  const wide = width >= 1280;
  const { colors } = useTheme();
  const [index, setIndex] = useCardField('yogesh-thinking-orbs', 'index', 1);
  const [size, setSize] = useCardField('yogesh-thinking-orbs', 'size', 320);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];

  return (
    <View
      testID="yogesh-orb-tuner"
      style={{
        width: '100%',
        backgroundColor: colors.page,
        flexDirection: wide ? 'row' : 'column',
        alignItems: 'center',
        paddingLeft: wide ? 32 : 16,
        paddingRight: wide ? 42 : 16,
        paddingVertical: 24,
        gap: 24,
      }}
    >
      <View
        testID="yogesh-orb-states"
        role="navigation"
        accessibilityLabel="States"
        style={{ width: wide ? 280 : '100%', justifyContent: 'center' }}
      >
        <View
          role={Platform.OS === 'web' ? 'list' : undefined}
          style={{
            flexDirection: wide ? 'column' : 'row',
            flexWrap: wide ? 'nowrap' : 'wrap',
            columnGap: 16,
            rowGap: 8,
          }}
        >
          {PLAYGROUND.map((item, i) => {
            const on = i === index;
            const itemText = (
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                {item.playground}
              </Text>
            );
            const press = (
              <Pressable
                accessibilityRole="button"
                aria-current={on ? 'true' : undefined}
                onPress={() => setIndex(i)}
                hitSlop={{ top: 12, bottom: 12 }}
                style={{ height: 20, justifyContent: 'center' }}
              >
                {itemText}
              </Pressable>
            );
            return Platform.OS === 'web' ? (
              <View key={item.id} role="listitem">
                {press}
              </View>
            ) : (
              <View key={item.id}>{press}</View>
            );
          })}
        </View>
        {wide ? (
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 24, marginBottom: -8 }}>
            ↑ ↓ to switch
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <View
          testID="yogesh-orb-stage"
          accessibilityLabel={Platform.OS === 'web' ? undefined : 'Orb playground'}
          accessibilityElementsHidden={Platform.OS === 'web' ? true : undefined}
          importantForAccessibility={Platform.OS === 'web' ? 'no-hide-descendants' : undefined}
          aria-hidden={Platform.OS === 'web' ? true : undefined}
        >
          <OrbView state={look.state} variant={look.variant} size={size} color={colors.orb} />
        </View>
        <View style={{ width: wide ? 256 : '100%' }}>
          <SliderRow label="Size" min={16} max={480} step={1} value={size} decimals={0} onChange={setSize} />
        </View>
      </View>
    </View>
  );
}
