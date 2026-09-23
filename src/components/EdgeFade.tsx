import { useId } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/src/theme';

/** 16px right-edge fade so a horizontal chip row shows that it overflows. */
export function EdgeFade({ color = colors.bg }: { color?: string }) {
  const id = `edgeFade${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const rgb = hexToRgb(color);
  const webFade =
    Platform.OS === 'web'
      ? {
          backgroundImage: `linear-gradient(to right, rgba(${rgb},0), ${color})`,
        }
      : null;
  return (
    <View pointerEvents="none" style={[styles.fade, webFade]}>
      {Platform.OS === 'web' ? null : (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={color} stopOpacity="0" />
              <Stop offset="1" stopColor={color} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      )}
    </View>
  );
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 16,
    zIndex: 4,
  },
});
