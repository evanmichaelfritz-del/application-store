import { Platform, Pressable, StyleSheet, Text, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '../theme';

const FAMILIES = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
} as const;

type TxProps = TextProps & {
  weight?: keyof typeof FAMILIES;
  size?: number;
  color?: string;
  numeric?: boolean;
};

export function Tx({ weight = 400, size = 13, color = colors.text, numeric, style, ...rest }: TxProps) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[
        {
          fontFamily: FAMILIES[weight],
          fontSize: size,
          color,
          fontVariant: numeric ? ['tabular-nums'] : undefined,
        } satisfies TextStyle,
        style,
      ]}
    />
  );
}

const webPointer: ViewStyle | null = Platform.OS === 'web' ? { cursor: 'pointer' } : null;

type TapProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'plain' | 'black';
  pressedColor?: string;
  accessibilityLabel?: string;
};

/** Instant press feedback. No scale, ripple, or transition. */
export function Tap({
  children,
  onPress,
  style,
  variant = 'plain',
  pressedColor = colors.grey100,
  accessibilityLabel,
}: TapProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        variant === 'black'
          ? { opacity: pressed ? 0.85 : 1 }
          : pressed
            ? { backgroundColor: pressedColor }
            : null,
        webPointer,
      ]}
    >
      {children}
    </Pressable>
  );
}

export const cardShadow = {
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04)',
} as const;

export const hairline = StyleSheet.hairlineWidth;
