import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { promptFor } from '@/src/agentPrompts';
import { writeClipboard } from '@/src/clipboard';
import { StoreSheet } from '@/src/components/StoreSheet';
import { useCopyToast } from '@/src/context/CopyToastContext';
import type { TransitionItem } from '../catalog';
import { SNIPPETS } from '../snippets';
import { colors, fonts, radii, shadows } from '../theme';

function ActionButton({
  label,
  done,
  onPress,
}: {
  label: string;
  done?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.action, done && styles.actionDone, pressed && styles.actionPressed]}
    >
      <Text style={[styles.actionText, done && styles.actionDoneText]}>{label}</Text>
    </Pressable>
  );
}

export function TransitionCard({ item }: { item: TransitionItem }) {
  const { show } = useCopyToast();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showcase, setShowcase] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const hideBtn = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyCode = () => {
    setCopied(true);
    show();
    if (hideBtn.current) clearTimeout(hideBtn.current);
    hideBtn.current = setTimeout(() => setCopied(false), 1400);
    const text = SNIPPETS[item.id] ?? '';
    setTimeout(() => writeClipboard(text), 0);
  };

  const copyPrompt = () => {
    setPromptCopied(true);
    show();
    setTimeout(() => setPromptCopied(false), 1400);
    setTimeout(() => writeClipboard(promptFor(item.id)), 0);
  };

  return (
    <View style={styles.card}>
      <View style={styles.stageWrap}>
        <item.Demo />
        <View style={styles.live}>
          <Text style={styles.liveText}>Showcase</Text>
        </View>
        {item.pro ? (
          <View style={styles.pro}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
        <View style={styles.actions}>
          <ActionButton label="Showcase" onPress={() => setShowcase(true)} />
          <ActionButton label={copied ? 'Copied' : 'Copy code'} done={copied} onPress={copyCode} />
          <ActionButton label="AGENT_PROMPT" onPress={() => setPromptOpen(true)} />
        </View>
      </View>

      <StoreSheet
        visible={showcase}
        title={item.title}
        subtitle="Live showcase"
        onClose={() => setShowcase(false)}
      >
        <View style={styles.showcaseStage}>
          <item.Demo />
        </View>
      </StoreSheet>

      <StoreSheet
        visible={promptOpen}
        title="AGENT_PROMPT"
        subtitle={item.title}
        onClose={() => setPromptOpen(false)}
        footer={
          <View style={styles.promptFooter}>
            <ActionButton
              label="Open Playground"
              onPress={() => {
                setPromptOpen(false);
                router.push('/playground');
              }}
            />
            <ActionButton
              label={promptCopied ? 'Copied' : 'Copy prompt'}
              done={promptCopied}
              onPress={copyPrompt}
            />
          </View>
        }
      >
        <Text selectable style={styles.prompt}>
          {promptFor(item.id)}
        </Text>
      </StoreSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    ...shadows.card,
  },
  stageWrap: { position: 'relative' },
  live: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.card,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  liveText: { fontFamily: fonts.medium, fontSize: 10, color: colors.textMuted },
  pro: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.pro,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  proText: { fontFamily: fonts.medium, fontSize: 10, color: colors.proFg },
  meta: { paddingHorizontal: 8, paddingTop: 14, paddingBottom: 6, gap: 12 },
  titles: { minWidth: 0 },
  title: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.copyBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  actionPressed: { backgroundColor: '#f1f1f1' },
  actionDone: { backgroundColor: colors.text, borderColor: colors.text },
  actionText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  actionDoneText: { color: colors.proFg },
  showcaseStage: {
    borderRadius: radii.stage,
    overflow: 'hidden',
  },
  prompt: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
  },
  promptFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
});
