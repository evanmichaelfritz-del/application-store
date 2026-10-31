import { Pressable, Text } from 'react-native';

/** Web replaces this with an anchor. Native has no zip download. */
export function SkillDownloadLink({
  label,
  testID,
}: {
  href: string;
  filename: string;
  label: string;
  testID: string;
  variant: 'card' | 'page';
}) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} testID={testID} disabled>
      <Text>{label}</Text>
    </Pressable>
  );
}
