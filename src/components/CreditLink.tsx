import { Pressable, Text } from 'react-native';

/** Web replaces this with an anchor. */
export function CreditLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: 'chip' | 'inline';
}) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} testID={variant === 'chip' ? 'source-chip' : 'source-link'}>
      <Text>{label}</Text>
    </Pressable>
  );
}
