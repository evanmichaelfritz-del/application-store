import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { promptFor } from '@/src/agentPrompts';
import { writeClipboard, writeClipboardAwait, writeClipboardFromGesture, writeClipboardNow } from '@/src/clipboard';
import { copyTextFor } from '@/src/closedNetwork/previewSources';
import { CopyLabel } from '@/src/components/CopyLabel';
import { SkillDownloadLink } from '@/src/components/SkillDownloadLink';
import { loadAssetPrompt, loadCopyCss, loadCopyScript, loadSkill, prefetchCopyCss, promptIsLazy, reloadSkill, scriptIsLazy, skillFor } from '@/src/library/assetCopy';
import { installFor } from '@/src/library/assetMeta';
import { StoreSheet } from '@/src/components/StoreSheet';
import { DeferredSkiaDemo } from '@/src/skia/DeferredSkiaDemo';
import { useCopyToast } from '@/src/context/CopyToastContext';
import { assetHref, facetLine } from '@/src/library/taxonomy';
import { pressableWeb, textWeb } from '@/src/library/webProps';
import { isDownloadSkill, type TransitionItem } from '../catalog';
import { colors, fonts, radii, shadows } from '../theme';

type CopyKind = 'html' | 'css' | 'script';

const COPY_LABEL: Record<CopyKind, string> = {
  html: 'Copy HTML',
  css: 'Copy CSS',
  script: 'Copy script',
};

function ActionButton({
  label,
  reserve,
  done,
  disabled,
  busy,
  onPress,
  onWarm,
  style,
  testID,
}: {
  label: string;
  reserve?: string;
  done?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
  onWarm?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      aria-busy={busy === true}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      onHoverIn={onWarm}
      onFocus={onWarm}
      {...pressableWeb({ dataSet: { focusRing: 'true' } })}
      style={(state) => {
        const hover = 'hovered' in state && state.hovered === true;
        return [
          styles.action,
          disabled ? styles.actionDisabled : styles.pointer,
          style,
          done && styles.actionDone,
          hover && !done && !disabled && styles.actionHover,
          hover && done && styles.actionDoneHover,
          state.pressed && !done && !disabled && styles.actionPressed,
          state.pressed && done && styles.actionDonePressed,
        ];
      }}
    >
      <CopyLabel label={label} reserve={reserve} style={[styles.actionText, done && styles.actionDoneText]} />
    </Pressable>
  );
}

export function TransitionCard({ item, compact = false }: { item: TransitionItem; compact?: boolean }) {
  const { show } = useCopyToast();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const touch = width < 880;
  const [copied, setCopied] = useState<CopyKind | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [skillCopied, setSkillCopied] = useState(false);
  const [installCopied, setInstallCopied] = useState(false);
  const [skillText, setSkillText] = useState<string | null>(null);
  const [skillPhase, setSkillPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const skillGen = useRef(0);
  const skillLoad = useRef(0);
  const skill = skillFor(item.id);
  const skillDownload = skill && isDownloadSkill(skill) ? skill : null;
  const installLine = installFor(item.id)?.line ?? null;
  const [lazyPrompt, setLazyPrompt] = useState<string | null>(null);
  const hideBtn = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lazyPromptId = promptIsLazy(item.id) ? item.id : '';

  useEffect(() => {
    if (!skill || isDownloadSkill(skill)) return;
    let ignore = false;
    const token = skillLoad.current + 1;
    skillLoad.current = token;
    setSkillPhase('loading');
    setSkillText(null);
    setSkillCopied(false);
    void loadSkill(item.id).then(
      (text) => {
        if (ignore || skillLoad.current !== token) return;
        setSkillText(text);
        setSkillPhase('ready');
      },
      () => {
        if (ignore || skillLoad.current !== token) return;
        setSkillText(null);
        setSkillPhase('error');
      },
    );
    return () => {
      ignore = true;
    };
  }, [item.id, skill]);

  useEffect(() => {
    if (!promptOpen || !lazyPromptId) return;
    let live = true;
    void loadAssetPrompt(lazyPromptId).then((text) => {
      if (live) setLazyPrompt(text);
    });
    return () => {
      live = false;
    };
  }, [lazyPromptId, promptOpen]);

  const copyPart = (kind: CopyKind) => {
    setCopied(kind);
    show();
    if (hideBtn.current) clearTimeout(hideBtn.current);
    hideBtn.current = setTimeout(() => setCopied(null), 1400);
    const write = (text: string) => {
      setTimeout(() => writeClipboard(text), 0);
    };
    if (kind === 'script' && scriptIsLazy(item.id)) {
      void loadCopyScript(item.id).then(write);
      return;
    }
    if (kind === 'css') {
      void loadCopyCss(item.id).then(write);
      return;
    }
    write(copyTextFor(item.id, kind));
  };

  const copyButton = (kind: CopyKind, style?: StyleProp<ViewStyle>) => (
    <ActionButton
      style={style}
      label={copied === kind ? 'Copied' : COPY_LABEL[kind]}
      reserve={COPY_LABEL[kind]}
      done={copied === kind}
      onPress={() => copyPart(kind)}
      onWarm={kind === 'css' ? () => prefetchCopyCss(item.id) : undefined}
      testID={`copy-${kind}-${item.id}`}
    />
  );

  const finishSkillCopy = (text: string, token: number) => {
    void writeClipboardAwait(text).then(
      () => {
        if (skillGen.current !== token) return;
        setSkillCopied(true);
        show();
        if (hideBtn.current) clearTimeout(hideBtn.current);
        hideBtn.current = setTimeout(() => setSkillCopied(false), 1400);
      },
      () => {
        if (skillGen.current !== token) return;
        setSkillCopied(false);
      },
    );
  };

  const copySkill = () => {
    if (skillPhase === 'error') {
      const loadToken = skillLoad.current + 1;
      skillLoad.current = loadToken;
      const token = skillGen.current + 1;
      skillGen.current = token;
      setSkillPhase('loading');
      setSkillText(null);
      setSkillCopied(false);
      const pending = reloadSkill(item.id);
      const gestured = writeClipboardFromGesture(pending);
      const written = gestured ?? pending.then((text) => writeClipboardAwait(text));
      void pending.then(
        (text) => {
          if (skillLoad.current !== loadToken) return;
          setSkillText(text);
          setSkillPhase('ready');
        },
        () => {
          if (skillLoad.current !== loadToken) return;
          setSkillText(null);
          setSkillPhase('error');
        },
      );
      void written.then(
        () => {
          if (skillGen.current !== token) return;
          setSkillCopied(true);
          show();
          if (hideBtn.current) clearTimeout(hideBtn.current);
          hideBtn.current = setTimeout(() => setSkillCopied(false), 1400);
        },
        () => {
          if (skillGen.current !== token) return;
          setSkillCopied(false);
        },
      );
      return;
    }
    if (skillPhase !== 'ready' || skillText == null) return;
    const token = skillGen.current + 1;
    skillGen.current = token;
    setSkillCopied(false);
    finishSkillCopy(skillText, token);
  };

  const skillLabel = skillCopied
    ? 'Copied'
    : skillPhase === 'loading'
      ? 'Loading…'
      : skillPhase === 'error'
        ? 'Retry'
        : 'Copy skill';
  const copyInstall = () => {
    if (!installLine) return;
    setInstallCopied(true);
    show();
    if (hideBtn.current) clearTimeout(hideBtn.current);
    hideBtn.current = setTimeout(() => setInstallCopied(false), 1400);
    writeClipboardNow(installLine);
  };

  const skillButton = (style?: StyleProp<ViewStyle>) =>
    skillDownload ? (
      <SkillDownloadLink
        href={skillDownload.href}
        filename={skillDownload.filename}
        label="Copy skill"
        testID={`copy-skill-${item.id}`}
        variant="card"
      />
    ) : skill ? (
      <ActionButton
        style={style}
        label={skillLabel}
        reserve="Copy skill"
        done={skillCopied}
        disabled={skillPhase === 'loading'}
        busy={skillPhase === 'loading'}
        onPress={copySkill}
        testID={`copy-skill-${item.id}`}
      />
    ) : null;

  const installButton = (style?: StyleProp<ViewStyle>) =>
    installLine ? (
      <ActionButton
        style={style}
        label={installCopied ? 'Copied' : 'Copy install command'}
        reserve="Copy install command"
        done={installCopied}
        onPress={copyInstall}
        testID={`copy-install-${item.id}`}
      />
    ) : null;

  const copyPrompt = () => {
    setPromptCopied(true);
    show();
    setTimeout(() => setPromptCopied(false), 1400);
    const ready = lazyPromptId ? lazyPrompt : promptFor(item.id);
    if (ready != null) {
      writeClipboardNow(ready);
      return;
    }
    if (!lazyPromptId) return;
    setTimeout(() => {
      void loadAssetPrompt(lazyPromptId).then((text) => writeClipboard(text));
    }, 0);
  };

  const stage = (
    <View>
      <View style={[styles.stageWrap, compact && styles.stageWrapCompact]}>
        {item.skia ? <DeferredSkiaDemo item={item} /> : <item.Demo />}
        <View style={styles.live}>
          <Text style={styles.liveText}>Showcase</Text>
        </View>
        {item.pro ? (
          <View style={styles.pro}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        ) : null}
      </View>
      <Link href={assetHref(item.id)} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={item.title}
          testID={`card-link-${item.id}`}
          {...pressableWeb({ dataSet: { focusRing: 'true' } })}
          style={StyleSheet.flatten([styles.titles, compact && styles.titlesCompact])}
        >
          <Text style={[styles.title, phone && !compact && styles.titlePhone]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={phone && !compact ? 2 : 1}>
            {facetLine(item.id) ?? item.subtitle}
          </Text>
        </Pressable>
      </Link>
    </View>
  );

  return (
    <View style={styles.card}>
      {stage}
      {compact ? null : phone ? (
        <View style={styles.actionsPhone}>
          <View style={styles.actionsRow}>
            <ShowcaseLink id={item.id} style={styles.actionGrow} />
            {copyButton('html', styles.actionGrow)}
          </View>
          <View style={styles.actionsRow}>
            {copyButton('css', styles.actionGrow)}
            {copyButton('script', styles.actionGrow)}
          </View>
          {skillButton(styles.actionFull)}
          {installButton(styles.actionFull)}
          <ActionButton style={styles.actionFull} label="Agent prompt" onPress={() => setPromptOpen(true)} />
        </View>
      ) : (
        <View style={styles.actions}>
          <ShowcaseLink id={item.id} style={touch ? styles.actionTouch : undefined} />
          {copyButton('html', touch ? styles.actionTouch : undefined)}
          {copyButton('css', touch ? styles.actionTouch : undefined)}
          {copyButton('script', touch ? styles.actionTouch : undefined)}
          {skillButton(touch ? styles.actionTouch : undefined)}
          {installButton(touch ? styles.actionTouch : undefined)}
          <ActionButton
            style={touch ? styles.actionTouch : undefined}
            label="AGENT_PROMPT"
            onPress={() => setPromptOpen(true)}
          />
        </View>
      )}

      {compact ? null : (
      <StoreSheet
        visible={promptOpen}
        title="AGENT_PROMPT"
        subtitle={item.title}
        onClose={() => setPromptOpen(false)}
        footer={
          <View style={styles.promptFooter}>
            <ActionButton
              style={touch ? styles.actionTouch : undefined}
              label="Open Playground"
              onPress={() => {
                setPromptOpen(false);
                router.push('/playground');
              }}
            />
            <ActionButton
              style={touch ? styles.actionTouch : undefined}
              label={promptCopied ? 'Copied' : 'Copy prompt'}
              reserve="Copy prompt"
              done={promptCopied}
              onPress={copyPrompt}
              testID={lazyPromptId ? `copy-prompt-${item.id}` : undefined}
            />
          </View>
        }
      >
        <Text selectable testID={lazyPromptId ? `agent-prompt-${item.id}` : undefined} style={styles.prompt}>
          {lazyPromptId ? (lazyPrompt ?? '') : promptFor(item.id)}
        </Text>
      </StoreSheet>
      )}
    </View>
  );
}

function ShowcaseLink({ id, style }: { id: string; style?: StyleProp<ViewStyle> }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <Link href={assetHref(id)} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Showcase"
        onHoverIn={() => setHover(true)}
        onHoverOut={() => {
          setHover(false);
          setPressed(false);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        {...pressableWeb({ dataSet: { focusRing: 'true' } })}
        style={StyleSheet.flatten([
          styles.action,
          styles.pointer,
          style,
          hover && !pressed && styles.actionHover,
          pressed && styles.actionPressed,
        ])}
      >
        <Text style={styles.actionText} {...textWeb({ dataSet: { focusRing: 'true' } })}>
          Showcase
        </Text>
      </Pressable>
    </Link>
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
  stageWrapCompact: { height: 150, overflow: 'hidden', borderRadius: radii.stage },
  titlesCompact: { paddingBottom: 2 },
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
  titles: { minWidth: 0, paddingHorizontal: 8, paddingTop: 14 },
  title: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  titlePhone: {
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 8, paddingTop: 12, paddingBottom: 6 },
  actionsPhone: { gap: 8, paddingHorizontal: 8, paddingTop: 12, paddingBottom: 6 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionGrow: { flex: 1, height: 44, minWidth: 44 },
  actionFull: { height: 44, alignSelf: 'stretch' },
  actionTouch: { height: 44, minWidth: 44 },
  pointer: { cursor: 'pointer' },
  actionDisabled: { opacity: 0.45, cursor: 'auto' },
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
  actionHover: { backgroundColor: '#d9d9e2', borderColor: 'rgba(0,0,0,0.35)' },
  actionPressed: { backgroundColor: '#b7b7c2', borderColor: 'rgba(0,0,0,0.5)' },
  actionDoneHover: { backgroundColor: '#4a4a4a', borderColor: '#bdbdbd' },
  actionDonePressed: { backgroundColor: '#000000', borderColor: '#ffffff' },
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
