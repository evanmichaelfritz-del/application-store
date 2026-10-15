import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { promptFor } from '@/src/agentPrompts';
import {
  loadYogeshOrbCreatorPrompt,
  loadYogeshThinkingOrbsPrompt,
} from '@/src/demos/yogesh-thinking-orbs/loadPrompt';
import { writeClipboard, writeClipboardNow } from '@/src/clipboard';
import { copyTextFor } from '@/src/closedNetwork/previewSources';
import { StoreSheet } from '@/src/components/StoreSheet';
import { SkiaPoster } from '@/src/components/AssetStill';
import { DeferredSkiaDemo } from '@/src/skia/DeferredSkiaDemo';
import { useCopyToast } from '@/src/context/CopyToastContext';
import { StillMotion, useReduceMotion } from '@/src/context/ReduceMotionContext';
import { previewControl } from '@/src/library/assetMeta';
import { ASSET_META, assetHref, facetLine } from '@/src/library/taxonomy';
import { pressableWeb, textWeb, viewWeb } from '@/src/library/webProps';
import { warmSkiaDemo, type TransitionItem } from '../catalog';
import { colors, fonts, radii, shadows } from '../theme';

type CopyKind = 'html' | 'css' | 'script';

const COPY_LABEL: Record<CopyKind, string> = {
  html: 'Copy HTML',
  css: 'Copy CSS',
  script: 'Copy script',
};

function ActionButton({
  label,
  done,
  onPress,
  style,
  testID,
}: {
  label: string;
  done?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      {...pressableWeb({ dataSet: { focusRing: 'true' } })}
      style={(state) => {
        const hover = Boolean((state as { hovered?: boolean }).hovered);
        return [
          styles.action,
          styles.pointer,
          style,
          done && styles.actionDone,
          hover && !done && styles.actionHover,
          hover && done && styles.actionDoneHover,
          state.pressed && !done && styles.actionPressed,
          state.pressed && done && styles.actionDonePressed,
        ];
      }}
    >
      <Text style={[styles.actionText, done && styles.actionDoneText]} {...textWeb({ dataSet: { focusRing: 'true' } })}>
        {label}
      </Text>
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
  const [lazyPrompt, setLazyPrompt] = useState<string | null>(null);
  const hideBtn = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadLazyPrompt =
    item.id === 'yogesh-thinking-orbs'
      ? loadYogeshThinkingOrbsPrompt
      : item.id === 'yogesh-orb-creator'
        ? loadYogeshOrbCreatorPrompt
        : null;

  useEffect(() => {
    if (!promptOpen || !loadLazyPrompt) return;
    let live = true;
    loadLazyPrompt().then((text) => {
      if (live) setLazyPrompt(text);
    });
    return () => {
      live = false;
    };
  }, [loadLazyPrompt, promptOpen]);

  const { reduceMotion } = useReduceMotion();
  const interactive = previewControl(item.id) === 'reset';
  const ambient = ASSET_META[item.id]?.motion === 'ambient-loop';
  const [cardHover, setCardHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<View>(null);
  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intending = cardHover || focused;
  const stageId = `card-stage-${item.id}`;

  useEffect(() => {
    if (!item.skia || interactive || reduceMotion || !intending) return;
    warmSkiaDemo(item.id);
  }, [intending, interactive, item.id, item.skia, reduceMotion]);

  useEffect(() => {
    if (!ambient || typeof IntersectionObserver !== 'function' || typeof document === 'undefined') return;
    const node = stageRef.current;
    const host =
      typeof HTMLElement !== 'undefined' && node instanceof HTMLElement ? node : document.getElementById(stageId);
    if (!host) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [ambient, stageId]);

  useEffect(() => {
    if (reduceMotion || interactive) {
      setPlaying(false);
      setPaused(false);
      return;
    }
    if (ambient) {
      setPlaying(inView);
      setPaused(false);
      return;
    }
    if (intending) {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
        setPaused(false);
      }
      if (playing) return;
      intentTimer.current = setTimeout(() => {
        setPaused(false);
        setPlaying(true);
      }, 300);
      return () => {
        if (intentTimer.current) clearTimeout(intentTimer.current);
      };
    }
    if (intentTimer.current) {
      clearTimeout(intentTimer.current);
      intentTimer.current = null;
    }
    if (!playing) return;
    setPaused(true);
    resetTimer.current = setTimeout(() => {
      setPlaying(false);
      setPaused(false);
    }, 150);
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [ambient, inView, intending, interactive, playing, reduceMotion]);

  const copyPart = (kind: CopyKind) => {
    setCopied(kind);
    show();
    if (hideBtn.current) clearTimeout(hideBtn.current);
    hideBtn.current = setTimeout(() => setCopied(null), 1400);
    const text = copyTextFor(item.id, kind);
    setTimeout(() => writeClipboard(text), 0);
  };

  const copyButton = (kind: CopyKind, style?: StyleProp<ViewStyle>) => (
    <ActionButton
      style={style}
      label={copied === kind ? 'Copied' : COPY_LABEL[kind]}
      done={copied === kind}
      onPress={() => copyPart(kind)}
      testID={`copy-${kind}-${item.id}`}
    />
  );

  const copyPrompt = () => {
    setPromptCopied(true);
    show();
    setTimeout(() => setPromptCopied(false), 1400);
    const ready = loadLazyPrompt ? lazyPrompt : promptFor(item.id);
    if (ready != null) {
      writeClipboardNow(ready);
      return;
    }
    if (!loadLazyPrompt) return;
    setTimeout(() => {
      void loadLazyPrompt().then((text) => writeClipboard(text));
    }, 0);
  };

  const live = playing && !reduceMotion && !interactive;
  const stage = (
    <View>
      <View
        ref={stageRef}
        nativeID={stageId}
        collapsable={false}
        style={[styles.stageWrap, styles.stageWrapCompact]}
      >
        {item.skia ? (
          live ? (
            <DeferredSkiaDemo item={item} gate="manual" paused={paused} />
          ) : (
            <View style={styles.poster}>
              <SkiaPoster id={item.id} box={120} />
            </View>
          )
        ) : live ? (
          <item.Demo />
        ) : (
          <StillMotion>
            <item.Demo />
          </StillMotion>
        )}
        {interactive ? (
          <Text style={styles.interactive} testID={`interactive-${item.id}`}>
            Interactive
          </Text>
        ) : null}
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
    <View
      {...viewWeb({ dataSet: { storeCard: 'true' } })}
      onPointerEnter={() => setCardHover(true)}
      onPointerLeave={() => setCardHover(false)}
      style={[styles.card, cardHover && styles.cardHover]}
    >
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
          <ActionButton style={styles.actionFull} label="Agent prompt" onPress={() => setPromptOpen(true)} />
        </View>
      ) : (
        <View style={styles.actions}>
          <ShowcaseLink id={item.id} style={touch ? styles.actionTouch : undefined} />
          {copyButton('html', touch ? styles.actionTouch : undefined)}
          {copyButton('css', touch ? styles.actionTouch : undefined)}
          {copyButton('script', touch ? styles.actionTouch : undefined)}
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
              done={promptCopied}
              onPress={copyPrompt}
              testID={loadLazyPrompt ? `copy-prompt-${item.id}` : undefined}
            />
          </View>
        }
      >
        <Text selectable testID={loadLazyPrompt ? `agent-prompt-${item.id}` : undefined} style={styles.prompt}>
          {loadLazyPrompt ? (lazyPrompt ?? '') : promptFor(item.id)}
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
  cardHover: {
    borderColor: 'rgba(0, 0, 0, 0.12)',
    ...shadows.material,
  },
  stageWrap: { position: 'relative', cursor: 'pointer' },
  stageWrapCompact: { height: 150, overflow: 'hidden', borderRadius: radii.stage },
  poster: { height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.stage },
  interactive: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    zIndex: 5,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSubtle,
  },
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
  titles: { minWidth: 0, paddingHorizontal: 8, paddingTop: 14, cursor: 'pointer' },
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
