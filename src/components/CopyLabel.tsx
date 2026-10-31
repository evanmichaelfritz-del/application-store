import { Text, View, type StyleProp, type TextStyle } from 'react-native';
import { textWeb, viewWeb } from '@/src/library/webProps';

/**
 * Resting and current labels share one grid cell.
 * The hidden label still sets the width, so Copied does not shrink the button.
 */
export function CopyLabel({
  label,
  reserve,
  style,
}: {
  label: string;
  reserve?: string;
  style?: StyleProp<TextStyle>;
}) {
  const resting = reserve ?? label;
  return (
    <View {...viewWeb({ dataSet: { copyLabel: 'stack' } })}>
      <Text style={style} {...textWeb({ dataSet: { copyLabel: label === resting ? 'shown' : 'idle' } })}>
        {resting}
      </Text>
      <Text style={style} {...textWeb({ dataSet: { copyLabel: label === resting ? 'idle' : 'shown' } })}>
        {label}
      </Text>
    </View>
  );
}
