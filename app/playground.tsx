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
import {
  playgroundPreviewButtons,
  splitPreviewDocument,
  type PreviewKind,
} from '@/src/closedNetwork/previewSources';
import { writeClipboard } from '@/src/clipboard';
import { useCopyToast } from '@/src/context/CopyToastContext';
import { colors, fonts, radii, shadows } from '@/src/theme';

type Mode = 'code' | 'prompt';

const GROUP_LABEL: Record<PreviewKind, string> = {
  transitions: 'Transitions',
  effects: 'Effects',
};

export default function PlaygroundScreen() {
  const buttons = useMemo(() => playgroundPreviewButtons(), []);
  const first = buttons.find((button) => button.id === 'gooey-plus-menu') ?? buttons[0];
  const [mode, setMode] = useState<Mode>('code');
  const [code, setCode] = useState(first?.code ?? '');
  const [prompt, setPrompt] = useState(first?.prompt ?? '');
  const [previewHtml, setPreviewHtml] = useState(first?.code ?? '');
  const [selectedKey, setSelectedKey] = useState(first?.key ?? '');
  const { width } = useWindowDimensions();
  const stacked = width < 960;
  const { show } = useCopyToast();
  const [backHover, setBackHover] = useState(false);
  const [backPressed, setBackPressed] = useState(false);
  const current = buttons.find((button) => button.key === selectedKey) ?? first;
  const parts = useMemo(() => splitPreviewDocument(code), [code]);

  const loadPreview = (key: string) => {
    const button = buttons.find((item) => item.key === key);
    if (!button) return;
    setSelectedKey(key);
    setCode(button.code);
    setPrompt(button.prompt);
    setPreviewHtml(button.code);
    setMode('code');
  };

  const runPreview = () => {
    setPreviewHtml(code);
    setMode('code');
  };

  const copyPart = (text: string) => {
    writeClipboard(text);
    show();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.bar}>
        <View style={styles.brandRow}>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Back to store"
              onHoverIn={() => setBackHover(true)}
              onHoverOut={() => {
                setBackHover(false);
                setBackPressed(false);
              }}
              onPressIn={() => setBackPressed(true)}
              onPressOut={() => setBackPressed(false)}
              style={StyleSheet.flatten([
                styles.backHit,
                styles.pointer,
                backHover && !backPressed && styles.hoverLight,
                backPressed && styles.pressLight,
              ])}
            >
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
                <Action label="Run preview" primary onPress={runPreview} testID="run-preview" />
              ) : (
                <Action
                  label="Load recreation"
                  primary
                  onPress={() => {
                    if (!current) return;
                    setCode(current.code);
                    setPreviewHtml(current.code);
                    setMode('code');
                  }}
                />
              )}
              {mode === 'code' ? (
                <>
                  <Action label="Copy HTML" onPress={() => copyPart(parts.html)} testID="copy-html" />
                  <Action label="Copy CSS" onPress={() => copyPart(parts.css)} testID="copy-css" />
                  {parts.script ? (
                    <Action label="Copy script" onPress={() => copyPart(parts.script)} testID="copy-script" />
                  ) : null}
                </>
              ) : (
                <Action label="Copy prompt" onPress={() => copyPart(prompt)} testID="copy-prompt" />
              )}
            </View>
          </View>

          <ScrollView
            testID="playground-source-scroll"
            style={styles.sourceScroll}
            contentContainerStyle={styles.sourceScrollContent}
          >
            {(['transitions', 'effects'] as const).map((kind) => {
              const group = buttons.filter((button) => button.kind === kind);
              if (!group.length) return null;
              return (
                <View key={kind} style={styles.group}>
                  <Text style={styles.groupLabel}>{GROUP_LABEL[kind]}</Text>
                  <View style={styles.seedWrap}>
                    {group.map((button) => {
                      const selected = selectedKey === button.key;
                      return (
                        <Pressable
                          key={button.key}
                          testID={`preview-${button.kind}-${button.id}`}
                          onPress={() => loadPreview(button.key)}
                          style={(state) => {
                            const hover = Boolean((state as { hovered?: boolean }).hovered);
                            return [
                              styles.seed,
                              styles.pointer,
                              selected && styles.seedOn,
                              hover && !selected && styles.hoverLight,
                              hover && selected && styles.seedOnHover,
                              state.pressed && !selected && styles.pressLight,
                              state.pressed && selected && styles.seedOnPressed,
                            ];
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`${GROUP_LABEL[kind]} preview: ${button.label}`}
                          accessibilityState={{ selected }}
                        >
                          <Text style={[styles.seedText, selected && styles.seedTextOn]}>{button.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <TextInput
              testID="playground-html-editor"
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
          </ScrollView>
        </View>

        <View style={[styles.pane, styles.previewPane, stacked && styles.paneStack]}>
          <View style={styles.previewHead}>
            <Text style={styles.previewTitle}>{current?.label ?? 'Preview'}</Text>
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
      style={(state) => {
        const hover = Boolean((state as { hovered?: boolean }).hovered);
        return [
          styles.chip,
          styles.pointer,
          active && styles.chipOn,
          hover && !active && styles.hoverLight,
          hover && active && styles.darkHover,
          state.pressed && !active && styles.pressLight,
          state.pressed && active && styles.darkPressed,
        ];
      }}
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
  testID,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={(state) => {
        const hover = Boolean((state as { hovered?: boolean }).hovered);
        return [
          styles.action,
          styles.pointer,
          primary && styles.actionPrimary,
          hover && !primary && styles.hoverLight,
          hover && primary && styles.darkHover,
          state.pressed && !primary && styles.pressLight,
          state.pressed && primary && styles.darkPressed,
        ];
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
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
  pointer: { cursor: 'pointer' },
  hoverLight: { backgroundColor: '#d9d9e2', borderColor: 'rgba(0,0,0,0.35)' },
  pressLight: { backgroundColor: '#b7b7c2', borderColor: 'rgba(0,0,0,0.5)' },
  darkHover: { backgroundColor: '#4a4a4a', borderColor: '#bdbdbd' },
  darkPressed: { backgroundColor: '#000000', borderColor: '#ffffff' },
  backHit: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
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
  actionText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  actionTextPrimary: { color: colors.proFg },
  sourceScroll: { flex: 1 },
  sourceScrollContent: { paddingBottom: 16 },
  group: { paddingHorizontal: 12, paddingTop: 12, gap: 8 },
  groupLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textFaint,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  seedWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  seedOnHover: { backgroundColor: '#c8c8d4', borderColor: 'rgba(0,0,0,0.45)' },
  seedOnPressed: { backgroundColor: '#a9a9b6', borderColor: 'rgba(0,0,0,0.6)' },
  seedText: { fontFamily: fonts.medium, fontSize: 12, color: colors.chipText },
  seedTextOn: { color: colors.chipTextActive },
  editor: {
    marginTop: 12,
    minHeight: 520,
    padding: 14,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  previewHead: { gap: 2 },
  previewTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  previewSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
});
