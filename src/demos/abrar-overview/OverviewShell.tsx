import { View } from 'react-native';
import { OverviewMain } from './src/components/OverviewMain';
import { Sidebar } from './src/components/Sidebar';
import { colors } from './src/theme';

/** Inner 1440-wide Overview row from the source App shell. */
export function OverviewShell() {
  return (
    <View
      testID="abrar-overview-shell"
      style={{
        width: 1440,
        minHeight: 900,
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: colors.page,
      }}
    >
      <Sidebar />
      <OverviewMain />
    </View>
  );
}
