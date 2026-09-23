import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme';

export function Stage({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.stage, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  stage: {
    height: 200,
    borderRadius: radii.stage,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.stageBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
