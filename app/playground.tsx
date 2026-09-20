import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlaygroundPreview } from '@/src/components/PlaygroundPreview';
import { playgroundSeeds } from '@/src/closedNetwork/seeds';
import { writeClipboard } from '@/src/clipboard';
import { useCopyToast } from '@/src/context/CopyToastContext';
import { colors, fonts, radii, shadows } from '@/src/theme';

type Mode = 'code' | 'prompt';

export default function PlaygroundScreen() {
  const seeds = useMemo(() => playgroundSeeds(), []);
  const first = seeds[0];
  const [mode, setMode] = useState<Mode>('code');
  const [code, setCode] = useState(first?.html ?? '');
  const [prompt, setPrompt] = useState(first?.prompt ?? '');
  const [previewHtml, setPreviewHtml] = useState(first?.html ?? '');
  const [seedId, setSeedId] = useState(first?.id ?? '');
  const { width } = useWindowDimensions();
  const stacked = width < 960;
  const { show } = useCopyToast();

  const loadSeed = (id: string) => {
    const seed = seeds.find((s) => s.id === id);
    if (!seed) return;
    setSeedId(id);
    setCode(seed.html);
    setPrompt(seed.prompt);
    setPreviewHtml(seed.html);
    setMode('code');
  };

  const runPreview = () => {
    setPreviewHtml(code);
    setMode('code');
  };

  const copyActive = () => {
    writeClipboard(mode === 'code' ? code : prompt);
    show();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.bar}>
        <View style={styles.brandRow}>
          <Link href="/" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Back to store">
              <Text style={styles.back}>← Store</Text>
            </Pressable>
          </Link>
          <Text style={styles.brand}>Playground</Text>
        </View>
        <Text style={styles.hint}>Closed-network HTML preview — no npm</Text>
      </View>

      <View style={[styles.body, stacked && styles.bodyStack]}>
        <View style={[styles.pane, stacked && styles.paneStack]}>
          <View style={styles.toolbar}>
            <View style={styles.modes}>
              <ModeChip label="Code" active={mode === 'code'} onPress={() => setMode('code')} />
              <ModeChip label="Agent prompt" active={mode === 'prompt'} onPress={() => setMode('prompt')} />
            </View>
            <View style={styles.toolbarActions}>
              {mode === 'code' ? (
                <Action label="Run preview" primary onPress={runPreview} />
              ) : (
                <Action
                  label="Load recreation"
                  primary
                  onPress={() => {
                    const seed = seeds.find((s) => s.id === seedId) ?? first;
                    if (!seed) return;
                    setCode(seed.html);
                    setPreviewHtml(seed.html);
                    setMode('code');
                  }}
                />
              )}
              <Action label="Copy" onPress={copyActive} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seeds}>
            {seeds.map((seed) => (
              <Pressable
                key={seed.id}
                onPress={() => loadSeed(seed.id)}
                style={[styles.seed, seedId === seed.id && styles.seedOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: seedId === seed.id }}
              >
                <Text style={[styles.seedText, seedId === seed.id && styles.seedTextOn]}>{seed.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            style={styles.editor}
            multiline
            value={mode === 'code' ? code : prompt}
            onChangeText={mode === 'code' ? setCode : setPrompt}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            accessibilityLabel={mode === 'code' ? 'HTML code editor' : 'Agent prompt editor'}
          />
        </View>

        <View style={[styles.pane, styles.previewPane, stacked && styles.paneStack]}>
          <View style={styles.previewHead}>
            <Text style={styles.previewTitle}>Preview</Text>
            <Text style={styles.previewSub}>iframe · sandboxed scripts</Text>
          </View>
          <PlaygroundPreview html={previewHtml} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ModeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipOn]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Action({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary && styles.actionPrimary,
        pressed && styles.actionPressed,
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 4,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  brand: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.3,
  },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
  body: { flex: 1, flexDirection: 'row', padding: 12, gap: 12 },
  bodyStack: { flexDirection: 'column' },
  pane: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
    overflow: 'hidden',
    minHeight: 360,
  },
  paneStack: { minHeight: 420 },
  previewPane: { padding: 12, gap: 10 },
  toolbar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modes: { flexDirection: 'row', gap: 8 },
  toolbarActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.copyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  chipTextOn: { color: colors.proFg },
  action: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.copyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: colors.text, borderColor: colors.text },
  actionPressed: { opacity: 0.88 },
  actionText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  actionTextPrimary: { color: colors.proFg },
  seeds: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  seed: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedOn: { backgroundColor: colors.chipActive, borderColor: colors.chipActive },
  seedText: { fontFamily: fonts.medium, fontSize: 12, color: colors.chipText },
  seedTextOn: { color: colors.chipTextActive },
  editor: {
    flex: 1,
    padding: 14,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
    minHeight: 280,
  },
  previewHead: { gap: 2 },
  previewTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  previewSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
});
