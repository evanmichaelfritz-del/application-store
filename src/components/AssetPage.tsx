import { Component, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type ComponentRef, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Link, type Href } from 'expo-router';
import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { LeftNav } from '@/src/components/LeftNav';
import { TopNav } from '@/src/components/TopNav';
import { TransitionCard } from '@/src/components/TransitionCard';
import { writeClipboard, writeClipboardNow } from '@/src/clipboard';
import { useCopyToast } from '@/src/context/CopyToastContext';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { codeSlot, loadAssetPrompt, loadCopyScript, promptIsLazy, readyPrompt, scriptIsLazy, type CodeKind } from '@/src/library/assetCopy';
import {
  addedOn,
  gapsFor,
  installFor,
  parityFor,
  previewControl,
  propsFor,
  relatedItems,
  type AssetInstall,
  type AssetParity,
  type AssetProp,
} from '@/src/library/assetMeta';
import { creditFor, type AssetCredit } from '@/src/library/credits';
import { galleryBackTarget, recallGalleryTarget } from '@/src/library/galleryMemory';
import { rememberRecent } from '@/src/library/recent';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import {
  ASSET_META,
  EMPTY_FILTERS,
  galleryHref,
  STACKS,
  typeLabel,
  type ComponentType,
} from '@/src/library/taxonomy';
import { pressableWeb, textWeb, viewWeb } from '@/src/library/webProps';
import { springs, sprung } from '@/src/motion';
import { DeferredSkiaDemo } from '@/src/skia/DeferredSkiaDemo';
import { colors, fonts, radii } from '@/src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const CODE_TABS = [
  { id: 'component', label: 'Component', kind: 'html' },
  { id: 'styles', label: 'Styles', kind: 'css' },
  { id: 'usage', label: 'Usage', kind: 'script' },
] as const;

type CodeTabId = (typeof CODE_TABS)[number]['id'];

type KeyEvent = { key: string; preventDefault: () => void };
type KeyTarget = {
  addEventListener: (type: 'keydown', listener: (event: KeyEvent) => void) => void;
  removeEventListener: (type: 'keydown', listener: (event: KeyEvent) => void) => void;
};

function isKeyTarget(node: object | null): node is KeyTarget {
  if (node === null || !('addEventListener' in node) || !('removeEventListener' in node)) return false;
  return typeof node.addEventListener === 'function' && typeof node.removeEventListener === 'function';
}

function canFocus(node: object | null): node is { focus: () => void } {
  return node !== null && 'focus' in node && typeof node.focus === 'function';
}

function hostElement(node: View | null, domId: string): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  if (typeof document === 'undefined') return null;
  return document.getElementById(domId);
}

function scheduleIdle(work: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => work(), { timeout: 400 });
    return () => window.cancelIdleCallback(id);
  }
  const timer = setTimeout(work, 16);
  return () => clearTimeout(timer);
}

function openExternal(url: string) {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function useCopied() {
  const { show } = useCopyToast();
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const mark = (key: string) => {
    setCopied(key);
    show();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1600);
  };
  return { copied, mark };
}

function cellStyle(columns: number): ViewStyle {
  if (columns <= 1) return { width: '100%' };
  const gaps = (columns - 1) * 16;
  const gridAt1280 = 976;
  const share = ((gridAt1280 - gaps) / columns / gridAt1280) * 100;
  return { width: `${share}%` };
}

export function AssetPage({ slug }: { slug: string }) {
  useFonts({ GeistMono_500Medium });
  installStoreChromeCss();
  const item = TRANSITIONS.find((entry) => entry.id === slug) ?? null;
  useEffect(() => {
    if (!item) return;
    rememberRecent(item.id);
    if (typeof document === 'undefined') return;
    document.title = `${item.title} · Application Store`;
  }, [item]);
  if (!item) return null;
  return <Found item={item} />;
}

function StoreShell({
  selection,
  idle,
  children,
}: {
  selection: ComponentType | null;
  idle: boolean;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 880;
  const phone = width < 640;
  const [filters] = useState(() =>
    selection ? galleryBackTarget(selection).filters : (recallGalleryTarget()?.filters ?? EMPTY_FILTERS),
  );
  const nav = <LeftNav typeSlug={selection} filters={filters} compact={compact} idle={idle} />;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <TopNav />
      <View style={styles.body}>
        {compact ? null : nav}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.page, phone && styles.pagePhone]}
          showsVerticalScrollIndicator={false}
        >
          {compact ? nav : null}
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Found({ item }: { item: TransitionItem }) {
  const meta = ASSET_META[item.id];
  const credit = creditFor(item.id);
  const label = typeLabel(meta.type) ?? 'All assets';
  const { copied, mark } = useCopied();
  const [promptOpen, setPromptOpen] = useState(false);
  const [tab, setTab] = useState<CodeTabId>('component');
  const [codeReady, setCodeReady] = useState(false);
  const kind = CODE_TABS.find((entry) => entry.id === tab)?.kind ?? 'html';
  const tabs = useMemo(
    () => CODE_TABS.filter((entry) => entry.kind !== 'css' || codeSlot(item.id, 'css').trim().length > 0),
    [item.id],
  );
  const activeTab = tabs.some((entry) => entry.id === tab) ? tab : tabs[0].id;
  const activeKind = tabs.find((entry) => entry.id === activeTab)?.kind ?? kind;

  const copyCode = () => {
    mark('code');
    const write = (text: string) => {
      setTimeout(() => writeClipboard(text), 0);
    };
    if (activeKind === 'script' && scriptIsLazy(item.id)) {
      void loadCopyScript(item.id).then(write);
      return;
    }
    write(codeSlot(item.id, activeKind));
  };
  const copyPrompt = () => {
    mark('prompt');
    const ready = readyPrompt(item.id);
    if (ready != null) {
      writeClipboardNow(ready);
      return;
    }
    if (!promptIsLazy(item.id)) return;
    setTimeout(() => {
      void loadAssetPrompt(item.id).then((text) => writeClipboard(text));
    }, 0);
  };

  return (
    <StoreShell selection={meta.type} idle={false}>
      <BackLink type={meta.type} label={label} />
      <Text style={styles.title} accessibilityRole="header" testID="asset-title">
        {item.title}
      </Text>
      <Text style={[styles.subtitle, credit ? styles.subtitleTight : null]}>{item.subtitle}</Text>
      {credit ? <SourceChip credit={credit} /> : null}
      <AssetPreview item={item} />
      <View style={styles.actionRow}>
        <BarButton
          label={copied === 'code' ? 'Copied' : 'Copy code'}
          icon={copied === 'code' ? 'checkmark' : 'copy-outline'}
          tone="primary"
          done={copied === 'code'}
          onPress={copyCode}
          testID="copy-code"
        />
        <BarButton
          label={copied === 'prompt' ? 'Copied' : 'Agent Prompt'}
          icon={copied === 'prompt' ? 'checkmark' : 'sparkles-outline'}
          tone="secondary"
          done={copied === 'prompt'}
          onPress={copyPrompt}
          testID="agent-prompt"
        />
        {credit ? (
          <BarButton
            label="Open source"
            icon="open-outline"
            tone="secondary"
            onPress={() => openExternal(credit.url)}
            testID="open-source"
          />
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: promptOpen }}
        testID="view-prompt"
        onPress={() => setPromptOpen((open) => !open)}
        {...pressableWeb({ dataSet: { focusRing: 'true' } })}
        style={styles.disclosure}
      >
        {(state) => {
          const hover = Boolean((state as { hovered?: boolean }).hovered);
          return (
            <Text style={[styles.disclosureText, hover && styles.backTextHover]}>
              {promptOpen ? 'Hide prompt' : 'View prompt'}
            </Text>
          );
        }}
      </Pressable>
      {promptOpen ? <PromptBody id={item.id} /> : null}
      <Section title="Code">
        <InstallBlock
          install={installFor(item.id)}
          copied={copied === 'install'}
          onCopy={() => {
            const line = installFor(item.id);
            if (!line) return;
            mark('install');
            setTimeout(() => writeClipboard(line.line), 0);
          }}
        />
        <CodePanel
          id={item.id}
          tabs={tabs}
          active={activeTab}
          kind={activeKind}
          copied={copied === 'slot'}
          defer={!codeReady}
          onChange={(next) => {
            setCodeReady(true);
            setTab(next);
          }}
          onCopy={() => {
            mark('slot');
            const write = (text: string) => {
              setTimeout(() => writeClipboard(text), 0);
            };
            if (activeKind === 'script' && scriptIsLazy(item.id)) {
              void loadCopyScript(item.id).then(write);
              return;
            }
            write(codeSlot(item.id, activeKind));
          }}
        />
      </Section>
      <Section title="Props">
        <PropsBlock rows={propsFor(item.id)} />
      </Section>
      <Section title="Details">
        <Details item={item} credit={credit} />
      </Section>
      <Related id={item.id} />
    </StoreShell>
  );
}

function BackLink({ type, label }: { type: ComponentType; label: string }) {
  const [target] = useState(() => galleryBackTarget(type));
  const backType = target.type;
  const filters = target.filters;
  const backLabel = backType ? (typeLabel(backType) ?? label) : 'All assets';
  const [hover, setHover] = useState(false);
  return (
    <Link href={galleryHref(backType, filters)} asChild>
      <Pressable
        accessibilityRole="link"
        testID="asset-back"
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        {...pressableWeb({ dataSet: { focusRing: 'true' } })}
        style={StyleSheet.flatten([styles.back, styles.pointer])}
      >
        <Text style={[styles.backText, hover && styles.backTextHover]}>← {backLabel}</Text>
      </Pressable>
    </Link>
  );
}

function SourceChip({ credit }: { credit: AssetCredit }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={credit.label}
      testID="source-chip"
      onPress={() => openExternal(credit.url)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      {...pressableWeb({ dataSet: { focusRing: 'true' } })}
      style={StyleSheet.flatten([styles.chip, hover && styles.chipHover, styles.pointer])}
    >
      <Text style={styles.chipText}>{credit.label}</Text>
    </Pressable>
  );
}

function BarButton({
  label,
  icon,
  tone = 'secondary',
  done = false,
  onPress,
  href,
  testID,
  style,
}: {
  label: string;
  icon?: IconName;
  tone?: 'primary' | 'secondary';
  done?: boolean;
  onPress?: () => void;
  href?: Href;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const primary = tone === 'primary' || done;
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const control = (
    <Pressable
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => {
        setHover(false);
        setPressed(false);
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      {...pressableWeb({ dataSet: { focusRing: 'true' } })}
      style={StyleSheet.flatten([
        styles.button,
        styles.pointer,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        hover && !pressed && primary && styles.buttonPrimaryHover,
        hover && !pressed && !primary && styles.buttonSecondaryHover,
        pressed && primary && styles.buttonPrimaryPressed,
        pressed && !primary && styles.buttonSecondaryPressed,
        style,
      ])}
    >
      {icon ? <Ionicons name={icon} size={14} color={primary ? colors.proFg : colors.text} /> : null}
      <Text style={[styles.buttonText, primary && styles.buttonTextOn]}>{label}</Text>
    </Pressable>
  );
  if (!href) return control;
  return (
    <Link href={href} asChild>
      {control}
    </Link>
  );
}

const PREVIEW_LOAD_MS = 8000;

function MarkLive({ onLive }: { onLive: () => void }) {
  useEffect(() => {
    onLive();
  }, [onLive]);
  return null;
}

function AssetPreview({ item }: { item: TransitionItem }) {
  const [mount, setMount] = useState(0);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [live, setLive] = useState(false);
  const control = previewControl(item.id);
  const fail = useCallback(() => setFailed(true), []);
  const markLive = useCallback(() => setLive(true), []);
  const waiting = timedOut && !live;

  useEffect(() => {
    if (failed || live) return;
    const timer = setTimeout(() => setTimedOut(true), PREVIEW_LOAD_MS);
    return () => clearTimeout(timer);
  }, [failed, live, mount]);

  return (
    <View
      testID="asset-preview"
      style={[styles.frame, item.fullRow ? styles.frameFull : styles.frameFixed]}
    >
      {failed ? (
        <Unavailable />
      ) : (
        <>
          <PreviewBoundary resetKey={mount} onFail={fail}>
            <View key={mount} style={item.fullRow ? styles.demoFill : styles.demoCenter}>
              {item.skia ? (
                <DeferredSkiaDemo item={item} appearance="frame" onUnavailable={fail} onLive={markLive} />
              ) : (
                <>
                  <item.Demo />
                  <MarkLive onLive={markLive} />
                </>
              )}
            </View>
          </PreviewBoundary>
          {waiting ? <Unavailable /> : null}
        </>
      )}
      {control && !failed && !waiting ? (
        <View style={styles.replay}>
          <BarButton
            label={control === 'reset' ? 'Reset' : 'Replay'}
            icon="refresh-outline"
            onPress={() => {
              setFailed(false);
              setTimedOut(false);
              setLive(false);
              setMount((value) => value + 1);
            }}
            testID="asset-replay"
            style={styles.replayButton}
          />
        </View>
      ) : null}
    </View>
  );
}

function Unavailable() {
  return (
    <View style={styles.unavailable} testID="preview-unavailable">
      <Ionicons name="image-outline" size={24} color={colors.textFaint} />
      <Text style={styles.unavailableText}>Preview unavailable</Text>
    </View>
  );
}

class PreviewBoundary extends Component<
  { resetKey: number; onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  componentDidUpdate(prev: { resetKey: number }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.section} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function InstallBlock({
  install,
  copied,
  onCopy,
}: {
  install: AssetInstall | null;
  copied: boolean;
  onCopy: () => void;
}) {
  if (!install) return null;
  return (
    <View style={styles.installWrap}>
      <View style={styles.installLine}>
        <Text style={styles.installText} numberOfLines={1} {...textWeb({ dataSet: { inlineCode: 'true' } })}>
          {install.line}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied' : 'Copy install'}
          onPress={onCopy}
          {...pressableWeb({ dataSet: { focusRing: 'true' } })}
          style={styles.iconButton}
        >
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={colors.text} />
        </Pressable>
      </View>
      {install.deps.length ? (
        <View style={styles.depRow}>
          {install.deps.map((dep) => (
            <View key={dep} style={styles.dep}>
              <Text style={styles.depText}>{dep}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CodePanel({
  id,
  tabs,
  active,
  kind,
  copied,
  defer,
  onChange,
  onCopy,
}: {
  id: string;
  tabs: readonly { id: CodeTabId; label: string; kind: CodeKind }[];
  active: CodeTabId;
  kind: CodeKind;
  copied: boolean;
  defer: boolean;
  onChange: (id: CodeTabId) => void;
  onCopy: () => void;
}) {
  return (
    <View>
      <CodeTabs tabs={tabs} active={active} onChange={onChange} />
      <View style={styles.codeBlock}>
        <ScrollView style={styles.codeScroll} contentContainerStyle={styles.codePad}>
          <CodeBody key={kind} id={id} kind={kind} defer={defer} />
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied' : 'Copy code'}
          testID="copy-code-slot"
          onPress={onCopy}
          {...pressableWeb({ dataSet: { focusRing: 'true' } })}
          style={styles.codeCopy}
        >
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function CodeTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: CodeTabId; label: string; kind: CodeKind }[];
  active: CodeTabId;
  onChange: (id: CodeTabId) => void;
}) {
  const { reduceMotion } = useReduceMotion();
  const refs = useRef<Partial<Record<CodeTabId, ComponentRef<typeof Pressable> | null>>>({});
  const [boxes, setBoxes] = useState<Partial<Record<CodeTabId, { x: number; width: number }>>>({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    const box = boxes[active];
    if (!box) return;
    x.value = sprung(box.x, springs.layout, reduceMotion);
    width.value = sprung(box.width, springs.layout, reduceMotion);
  }, [active, boxes, reduceMotion, width, x]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    for (const tab of tabs) {
      const node = refs.current[tab.id] ?? null;
      if (!isKeyTarget(node)) continue;
      const onKey = (event: KeyEvent) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const index = tabs.findIndex((item) => item.id === tab.id);
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(index + delta + tabs.length) % tabs.length];
        onChange(next.id);
        const target = refs.current[next.id] ?? null;
        if (canFocus(target)) target.focus();
      };
      node.addEventListener('keydown', onKey);
      cleanups.push(() => node.removeEventListener('keydown', onKey));
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [onChange, tabs]);

  const indicator = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ translateX: x.value }],
  }));

  return (
    <View accessibilityRole="tablist" style={styles.tabRow}>
      <Animated.View pointerEvents="none" style={[styles.tabIndicator, indicator]} />
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            testID={`tab-${tab.id}`}
            onPress={() => onChange(tab.id)}
            onLayout={(event) => {
              const next = { x: event.nativeEvent.layout.x, width: event.nativeEvent.layout.width };
              setBoxes((prev) => {
                const last = prev[tab.id];
                if (last && last.x === next.x && last.width === next.width) return prev;
                return { ...prev, [tab.id]: next };
              });
            }}
            {...pressableWeb({ dataSet: { focusRing: 'true' } })}
            style={styles.tab}
          >
            {(state) => {
              const hover = Boolean((state as { hovered?: boolean }).hovered);
              return <Text style={[styles.tabLabel, (selected || hover) && styles.tabLabelOn]}>{tab.label}</Text>;
            }}
          </Pressable>
        );
      })}
    </View>
  );
}

const CodeBody = memo(function CodeBody({ id, kind, defer }: { id: string; kind: CodeKind; defer: boolean }) {
  const domId = `asset-code-${kind}`;
  const ref = useRef<View>(null);
  const [body, setBody] = useState('');
  useEffect(() => {
    let live = true;
    const apply = () => {
      const finish = (text: string) => {
        if (live) setBody(text);
      };
      if (kind === 'script' && scriptIsLazy(id)) {
        void loadCopyScript(id).then(finish).catch(() => finish(''));
        return;
      }
      try {
        finish(codeSlot(id, kind));
      } catch {
        finish('');
      }
    };
    if (!defer) {
      apply();
      return () => {
        live = false;
      };
    }
    const cancel = scheduleIdle(apply);
    return () => {
      live = false;
      cancel();
    };
  }, [defer, id, kind]);
  useLayoutEffect(() => {
    const node = hostElement(ref.current, domId);
    if (!node || !body) return;
    if (node.textContent !== body) node.textContent = body;
  }, [body, domId]);
  return (
    <View
      ref={ref}
      id={domId}
      nativeID={domId}
      collapsable={false}
      testID="code-body"
      {...viewWeb({ dataSet: { codeText: 'true', codeKind: kind } })}
    >
      {body ? null : <Text style={styles.loadingNote}>Loading code…</Text>}
    </View>
  );
});

function PromptBody({ id }: { id: string }) {
  const domId = 'asset-prompt';
  const ref = useRef<View>(null);
  const [body, setBody] = useState('');
  useEffect(() => {
    let live = true;
    void loadAssetPrompt(id).then((text) => {
      if (live) setBody(text);
    });
    return () => {
      live = false;
    };
  }, [id]);
  useLayoutEffect(() => {
    const node = hostElement(ref.current, domId);
    if (!node || !body) return;
    if (node.textContent !== body) node.textContent = body;
  }, [body, domId]);
  return (
    <ScrollView style={styles.promptScroll} contentContainerStyle={styles.codePad}>
      <View
        ref={ref}
        id={domId}
        nativeID={domId}
        collapsable={false}
        testID="prompt-body"
        {...viewWeb({ dataSet: { codeText: 'true', promptBody: 'true' } })}
      >
        {body ? null : <Text style={styles.loadingNote}>Loading prompt…</Text>}
      </View>
    </ScrollView>
  );
}

function PropsBlock({ rows }: { rows: readonly AssetProp[] }) {
  if (!rows.length) return <Text style={styles.quiet}>Props not documented yet</Text>;
  return (
    <View style={styles.table}>
      <View style={styles.propHead}>
        <Text style={[styles.propHeadText, styles.colProp]}>Prop</Text>
        <Text style={[styles.propHeadText, styles.colType]}>Type</Text>
        <Text style={[styles.propHeadText, styles.colDefault]}>Default</Text>
        <Text style={[styles.propHeadText, styles.colDesc]}>Description</Text>
      </View>
      {rows.map((row, index) => (
        <View key={row.name} style={[styles.propRow, index < rows.length - 1 && styles.rule]}>
          <View style={styles.colProp}>
            <Text style={styles.inline} {...textWeb({ dataSet: { inlineCode: 'true' } })}>
              {row.name}
            </Text>
            {row.required ? <Text style={styles.required}>required</Text> : null}
          </View>
          <View style={styles.colType}>
            <Text style={styles.inline} {...textWeb({ dataSet: { inlineCode: 'true' } })}>
              {row.type}
            </Text>
          </View>
          <View style={styles.colDefault}>
            {row.fallback == null ? (
              <Text style={styles.faint}>—</Text>
            ) : (
              <Text style={styles.inline} {...textWeb({ dataSet: { inlineCode: 'true' } })}>
                {row.fallback}
              </Text>
            )}
          </View>
          <Text style={[styles.valueText, styles.colDesc]}>{row.description}</Text>
        </View>
      ))}
    </View>
  );
}

function Details({ item, credit }: { item: TransitionItem; credit: AssetCredit | null }) {
  const meta = ASSET_META[item.id];
  const stack = STACKS.find((entry) => entry.slug === meta.stack)?.label ?? '';
  const added = addedOn(item.id);
  return (
    <View style={styles.details}>
      <DetailRow label="Author" last={false}>
        {credit ? (
          <Text style={styles.valueText}>
            {credit.label}{' '}
            <Text
              style={styles.inlineLink}
              accessibilityRole="link"
              onPress={() => openExternal(credit.url)}
            >
              ↗
            </Text>
          </Text>
        ) : (
          <Text style={styles.faint}>—</Text>
        )}
      </DetailRow>
      <DetailRow label="Stack" last={false}>
        <Text style={styles.valueText}>{stack}</Text>
      </DetailRow>
      {added ? (
        <DetailRow label="Added" last={false}>
          <Text style={styles.valueText}>{added}</Text>
        </DetailRow>
      ) : null}
      <DetailRow label="Parity" last={false}>
        <ParityValue parity={parityFor(item.id)} />
      </DetailRow>
      <DetailRow label="Known gaps" last>
        <Gaps gaps={gapsFor(item.id)} />
      </DetailRow>
    </View>
  );
}

function DetailRow({ label, last, children }: { label: string; last: boolean; children: ReactNode }) {
  return (
    <View style={[styles.detailRow, !last && styles.rule]}>
      <Text style={styles.detailKey}>{label}</Text>
      <View style={styles.detailValue}>{children}</View>
    </View>
  );
}

function ParityValue({ parity }: { parity: AssetParity | null }) {
  if (!parity) return <Text style={styles.faint}>Not checked</Text>;
  return (
    <Text style={styles.valueText}>
      <Text style={styles.pass}>PASS</Text>
      <Text> · </Text>
      <Text style={styles.sha} accessibilityRole="link" onPress={() => openExternal(parity.href)}>
        {parity.sha}
      </Text>
      <Text> · 1280</Text>
    </Text>
  );
}

function Gaps({ gaps }: { gaps: readonly string[] }) {
  if (!gaps.length) return <Text style={styles.faint}>None logged</Text>;
  return (
    <View>
      {gaps.map((gap) => (
        <View key={gap} style={styles.gap}>
          <Text style={styles.valueText}>{gap}</Text>
        </View>
      ))}
    </View>
  );
}

function Related({ id }: { id: string }) {
  const items = relatedItems(id);
  const { width } = useWindowDimensions();
  const columns = width >= 1180 ? 3 : width >= 880 ? 2 : 1;
  const [show, setShow] = useState(false);
  useEffect(() => scheduleIdle(() => setShow(true)), []);
  if (!items.length) return null;
  return (
    <Section title="Related">
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={cellStyle(columns)}>
            {show ? <TransitionCard item={item} compact /> : <View style={styles.relatedShell} />}
          </View>
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  scroll: { flex: 1, minWidth: 0 },
  page: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 80,
    boxSizing: 'border-box',
  },
  pagePhone: { paddingHorizontal: 16, paddingTop: 16 },
  back: { height: 20, marginBottom: 8, alignSelf: 'flex-start', justifyContent: 'center' },
  backText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 20, color: colors.textSubtle },
  backTextHover: { color: colors.text },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
  },
  subtitleTight: { marginBottom: 10 },
  chip: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chipHover: { backgroundColor: '#e7e7e7' },
  chipText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  frame: {
    width: '100%',
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.stageBorder,
    borderRadius: radii.stage,
    overflow: 'hidden',
    position: 'relative',
  },
  frameFixed: { height: 420, alignItems: 'center', justifyContent: 'center' },
  frameFull: { minHeight: 420 },
  demoCenter: { width: '100%', minHeight: 420, alignItems: 'center', justifyContent: 'center' },
  demoFill: { width: '100%', minHeight: 420 },
  replay: { position: 'absolute', top: 12, right: 12, zIndex: 6 },
  replayButton: { height: 28 },
  unavailable: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.stage,
  },
  unavailableText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textSubtle },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  button: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  buttonPrimary: { backgroundColor: colors.text, borderColor: colors.text },
  buttonPrimaryHover: { backgroundColor: '#4a4a4a', borderColor: '#4a4a4a' },
  buttonPrimaryPressed: { backgroundColor: '#000000', borderColor: '#000000' },
  buttonSecondary: { backgroundColor: 'rgba(255,255,255,0.94)', borderColor: 'rgba(0,0,0,0.06)' },
  buttonSecondaryHover: { backgroundColor: '#f1f1f1', borderColor: 'rgba(0,0,0,0.12)' },
  buttonSecondaryPressed: { backgroundColor: '#e0e0e0', borderColor: 'rgba(0,0,0,0.12)' },
  buttonText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  buttonTextOn: { color: colors.proFg },
  pointer: { cursor: 'pointer' },
  disclosure: { alignSelf: 'flex-start', marginTop: 8, height: 20, justifyContent: 'center' },
  disclosureText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSubtle },
  section: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
    marginTop: 32,
    marginBottom: 12,
  },
  installWrap: { marginBottom: 12 },
  installLine: {
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingLeft: 16,
    paddingRight: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  installText: { fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 20, color: colors.text },
  iconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  depRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  dep: { height: 22, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#f1f1f1', justifyContent: 'center' },
  depText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  tabRow: {
    flexDirection: 'row',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  tab: { paddingVertical: 10 },
  tabLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSubtle },
  tabLabelOn: { color: colors.text },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.text,
  },
  codeBlock: {
    marginTop: 12,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  codeScroll: { maxHeight: 480 },
  codePad: { paddingTop: 14, paddingBottom: 14, paddingLeft: 16, paddingRight: 44, minHeight: 72 },
  codeCopy: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  promptScroll: {
    maxHeight: 320,
    marginTop: 8,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
  },
  loadingNote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textFaint },
  quiet: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textSubtle },
  table: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  propHead: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  propHeadText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.textSubtle },
  propRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, paddingHorizontal: 12 },
  colProp: { width: '22%', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingRight: 8 },
  colType: { width: '26%', paddingRight: 8 },
  colDefault: { width: '16%', paddingRight: 8 },
  colDesc: { width: '36%' },
  inline: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, color: colors.text, backgroundColor: '#f1f1f1', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' },
  required: { fontFamily: fonts.medium, fontSize: 11, color: colors.danger },
  rule: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  details: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start' },
  detailKey: {
    width: 160,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
  },
  detailValue: { flex: 1, paddingVertical: 10, paddingHorizontal: 14 },
  valueText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.text },
  faint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textFaint },
  inlineLink: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.text },
  pass: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.success },
  sha: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, color: colors.text, textDecorationLine: 'underline' },
  gap: {
    borderLeftWidth: 2,
    borderLeftColor: '#c99a2e',
    backgroundColor: '#fffaf0',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  relatedShell: {
    height: 214,
    borderRadius: radii.card,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
