import { StyleSheet, Text, View } from 'react-native';
import { libdevColors as colors } from './tokens';

export function AutoPill({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.auto, compact && styles.autoCompact]}>
      <Text style={styles.autoText}>Auto</Text>
      <Text style={styles.chevron}>▾</Text>
    </View>
  );
}

export function SendButton({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.send, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.arrow}>↑</Text>
    </View>
  );
}

export function Magnifier() {
  return (
    <View style={styles.mag}>
      <View style={styles.magCircle} />
      <View style={styles.magHandle} />
    </View>
  );
}

const styles = StyleSheet.create({
  auto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.pill,
    borderWidth: 1,
    borderColor: colors.pillBorder,
  },
  autoCompact: {
    height: 26,
    paddingHorizontal: 9,
  },
  autoText: {
    color: colors.chrome,
    fontSize: 12,
    fontWeight: '500',
  },
  chevron: {
    color: colors.chromeDim,
    fontSize: 10,
    marginTop: 1,
  },
  send: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f3',
  },
  arrow: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -1,
  },
  mag: {
    width: 14,
    height: 14,
    marginRight: 2,
  },
  magCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.4,
    borderColor: colors.chrome,
  },
  magHandle: {
    position: 'absolute',
    width: 6,
    height: 1.6,
    backgroundColor: colors.chrome,
    right: 0,
    bottom: 1,
    transform: [{ rotate: '42deg' }],
    borderRadius: 1,
  },
});
