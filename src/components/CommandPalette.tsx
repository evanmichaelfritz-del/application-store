import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ThumbStill } from '@/src/components/AssetStill';
import { TRANSITIONS } from '@/src/catalog';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import { paletteGroups, type PaletteOption } from '@/src/library/paletteSearch';
import { readRecent, rememberRecent } from '@/src/library/recent';
import { pressableWeb, textInputWeb, viewWeb } from '@/src/library/webProps';
import { colors, fonts, radii, shadows } from '@/src/theme';

type Api = { openPalette: () => void };

const PaletteContext = createContext<Api | null>(null);

export function usePalette(): Api {
  const value = useContext(PaletteContext);
  if (!value) throw new Error('usePalette must be used inside PaletteProvider');
  return value;
}

function isFocusable(node: object | null): node is { focus: () => void } {
  return node !== null && 'focus' in node && typeof node.focus === 'function';
}

function activeElementId(): string {
  if (typeof document === 'undefined') return '';
  const node = document.activeElement;
  if (!node || !('id' in node)) return '';
  return typeof node.id === 'string' ? node.id : '';
}

function isAttrHost(node: object | null): node is { setAttribute: (name: string, value: string) => void } {
  return node !== null && 'setAttribute' in node && typeof node.setAttribute === 'function';
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  installStoreChromeCss();
  const { reduceMotion } = useReduceMotion();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const generation = useRef(0);
  const opener = useRef<{ focus: () => void } | null>(null);
  const inputRef = useRef<TextInput>(null);
  const clearRef = useRef<View>(null);
  const panelRef = useRef<View>(null);

  const groups = useMemo(() => paletteGroups(query, recent, showAll), [query, recent, showAll]);
  const options = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const live = useRef({
    query,
    options,
    active,
    visible,
    closing,
  });
  live.current = { query, options, active, visible, closing };

  const openPalette = () => {
    generation.current += 1;
    const current = typeof document === 'undefined' ? null : document.activeElement;
    opener.current = isFocusable(current) ? current : null;
    setRecent(readRecent());
    live.current.query = '';
    live.current.active = 0;
    setQuery('');
    setShowAll(false);
    setActive(0);
    setClosing(false);
    setVisible(true);
    setShown(false);
  };

  const finishClose = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('store-app')?.removeAttribute('inert');
      document.body.style.overflow = '';
    }
    setVisible(false);
    setShown(false);
    setClosing(false);
    const back = opener.current;
    opener.current = null;
    back?.focus();
  };

  const close = () => {
    const token = generation.current + 1;
    generation.current = token;
    setClosing(true);
    setShown(false);
    if (reduceMotion) finishClose();
    else setTimeout(() => {
      if (generation.current === token) finishClose();
    }, 150);
  };

  useEffect(() => {
    if (!visible || closing) return;
    const frame = requestAnimationFrame(() => setShown(true));
    const focus = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focus);
    };
  }, [closing, visible]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const app = document.getElementById('store-app');
    if (!visible) {
      app?.removeAttribute('inert');
      return;
    }
    app?.setAttribute('inert', '');
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      app?.removeAttribute('inert');
      document.body.style.overflow = previous;
    };
  }, [visible]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!visible) return;
    const panel = panelRef.current;
    if (isAttrHost(panel)) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', 'Search assets');
    }
    const input = inputRef.current;
    if (isAttrHost(input)) {
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-activedescendant', options.length ? `palette-opt-${active}` : '');
    }
    options.forEach((_, index) => {
      const option = document.getElementById(`palette-opt-${index}`);
      if (!isAttrHost(option)) return;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', index === active ? 'true' : 'false');
    });
    const node = document.getElementById(`palette-opt-${active}`);
    if (node && 'scrollIntoView' in node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ block: 'nearest' });
    }
  }, [active, options, query, showAll, visible]);

  const go = (option: PaletteOption, newTab: boolean) => {
    if (option.kind === 'more') {
      setShowAll(true);
      setActive(0);
      return;
    }
    const path =
      option.kind === 'asset'
        ? `/a/${option.id}`
        : option.kind === 'type'
          ? `/c/${option.slug}`
          : `/?source=${option.slug}`;
    if (option.kind === 'asset') rememberRecent(option.id);
    close();
    if (newTab && typeof window !== 'undefined') {
      window.open(path, '_blank', 'noopener');
      return;
    }
    if (option.kind === 'asset') router.push({ pathname: '/a/[slug]', params: { slug: option.id } });
    else if (option.kind === 'type') router.push({ pathname: '/c/[type]', params: { type: option.slug } });
    else router.push({ pathname: '/', params: { source: option.slug } });
  };

  const goRef = useRef(go);
  const closeRef = useRef(close);
  const openRef = useRef(openPalette);
  goRef.current = go;
  closeRef.current = close;
  openRef.current = openPalette;

  useEffect(() => {
    // Capture: the search field stops keydown before a bubble listener on window.
    const onKey = (event: KeyboardEvent) => {
      const snap = live.current;
      const command = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;
      if (command && event.key.toLowerCase() === 'k') {
        if (event.repeat) return;
        event.preventDefault();
        if (snap.visible && !snap.closing) closeRef.current();
        else if (!snap.visible) openRef.current();
        return;
      }
      if (!snap.visible || snap.closing) return;
      if (event.key === 'Escape') {
        if (event.repeat) return;
        event.preventDefault();
        if (snap.query.trim()) {
          snap.query = '';
          snap.active = 0;
          setQuery('');
          setActive(0);
          inputRef.current?.focus();
        } else closeRef.current();
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        const input = inputRef.current;
        const clear = clearRef.current;
        const clearHost = isFocusable(clear) ? clear : null;
        if (snap.query.trim() && clearHost && input) {
          if (event.shiftKey || activeElementId() === 'palette-clear') input.focus();
          else clearHost.focus();
        } else if (isFocusable(input)) input.focus();
        return;
      }
      const count = snap.options.length;
      if (count === 0) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActive((current) => {
          const next = (current + step + count) % count;
          snap.active = next;
          return next;
        });
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        snap.active = 0;
        setActive(0);
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        snap.active = count - 1;
        setActive(count - 1);
        return;
      }
      if (event.key === 'Enter') {
        if (event.repeat) return;
        event.preventDefault();
        const option = snap.options[snap.active];
        if (option) goRef.current(option, command);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const maxHeight = Math.min(480, Math.max(240, height - 240));
  let cursor = 0;

  return (
    <PaletteContext.Provider value={{ openPalette }}>
      {children}
      {visible ? (
        <View
          pointerEvents="box-none"
          {...viewWeb({ dataSet: { paletteOverlay: 'true' } })}
          style={styles.overlay}
        >
          <Pressable
            accessibilityLabel="Close search"
            tabIndex={-1}
            onPress={close}
            {...viewWeb({
              dataSet: { paletteScrim: 'true', shown: shown ? '1' : '0', ease: closing ? 'in' : 'out' },
            })}
            style={[styles.scrim, { opacity: shown ? 1 : 0 }]}
          />
          <View
            ref={panelRef}
            accessibilityRole="none"
            testID="palette-dialog"
            {...viewWeb({
              dataSet: {
                palettePanel: 'true',
                shown: shown ? '1' : '0',
                ease: closing ? 'in' : 'out',
              },
            })}
            style={[
              styles.panel,
              { maxHeight, opacity: shown ? 1 : 0 },
              reduceMotion ? null : { transform: [{ scale: shown ? 1 : 0.98 }] },
              shadows.material,
            ]}
          >
            <View
              accessibilityLabel="Search assets"
              {...viewWeb({ dataSet: { paletteDialog: 'true' } })}
              style={styles.dialog}
            >
              <View style={styles.inputRow}>
                <Ionicons name="search" size={16} color={colors.textFaint} />
                <TextInput
                  ref={inputRef}
                  value={query}
                  onChangeText={(next) => {
                    setQuery(next);
                    setShowAll(false);
                  }}
                  placeholder="Search assets, types, sources…"
                  placeholderTextColor={colors.textFaint}
                  autoCorrect={false}
                  autoCapitalize="none"
                  accessibilityLabel="Search assets"
                  testID="palette-input"
                  {...textInputWeb({ dataSet: { storeSearch: 'true', paletteInput: 'true' } })}
                  style={styles.input}
                />
                {query.trim() ? (
                  <Pressable
                    ref={clearRef}
                    nativeID="palette-clear"
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    testID="palette-clear"
                    onPress={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    {...pressableWeb({ dataSet: { focusRing: 'true' } })}
                    style={styles.clear}
                  >
                    <Text style={styles.clearGlyph}>×</Text>
                  </Pressable>
                ) : (
                  <View style={styles.keycap}>
                    <Text style={styles.keycapText}>Esc</Text>
                  </View>
                )}
              </View>
              {options.length === 0 ? (
                <View style={styles.empty} testID="palette-empty">
                  <Text style={styles.emptyTitle}>No results for "{query.trim()}"</Text>
                  <Text style={styles.emptyLine}>Try a name, tag, or author.</Text>
                </View>
              ) : (
                <ScrollView style={[styles.list, { maxHeight: maxHeight - 88 }]} keyboardShouldPersistTaps="handled">
                  <View
                    accessibilityRole="list"
                    {...viewWeb({ dataSet: { paletteList: 'true' } })}
                  >
                    {groups.map((group) => (
                      <View key={group.heading}>
                        <Text style={styles.group}>{group.heading}</Text>
                        {group.options.map((option) => {
                          const index = cursor;
                          cursor += 1;
                          const selected = index === active;
                          return (
                            <PaletteRow
                              key={optionKey(option, index)}
                              option={option}
                              index={index}
                              selected={selected}
                              onMove={() => setActive((current) => (current === index ? current : index))}
                              onOpen={(newTab) => go(option, newTab)}
                            />
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
              <View style={styles.footer}>
                <KeyHint label="↑↓" text="Navigate" />
                <KeyHint label="↵" text="Open" />
                <KeyHint label="Esc" text="Close" />
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </PaletteContext.Provider>
  );
}

function optionKey(option: PaletteOption, index: number): string {
  if (option.kind === 'asset') return option.id;
  if (option.kind === 'type') return `type-${option.slug}`;
  if (option.kind === 'source') return `source-${option.label}`;
  return `more-${index}`;
}

function PaletteRow({
  option,
  index,
  selected,
  onMove,
  onOpen,
}: {
  option: PaletteOption;
  index: number;
  selected: boolean;
  onMove: () => void;
  onOpen: (newTab: boolean) => void;
}) {
  const item = option.kind === 'asset' ? TRANSITIONS.find((entry) => entry.id === option.id) : null;
  return (
    <Pressable
      nativeID={`palette-opt-${index}`}
      testID={`palette-opt-${index}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      tabIndex={-1}
      onPointerMove={onMove}
      onPress={() => onOpen(false)}
      {...pressableWeb({ dataSet: { paletteRow: 'true' } })}
      style={[styles.row, selected && styles.rowOn]}
    >
      {option.kind === 'asset' && item ? <ThumbStill item={item} size={28} /> : null}
      {option.kind === 'type' ? <Ionicons name="folder-outline" size={16} color={colors.textMuted} /> : null}
      {option.kind === 'source' ? <Ionicons name="person-outline" size={16} color={colors.textMuted} /> : null}
      {option.kind === 'asset' ? (
        <View style={styles.assetCopy}>
          <AssetLabel option={option} />
          {option.typeLabel ? <Text style={styles.typeText}>{option.typeLabel}</Text> : null}
        </View>
      ) : null}
      {option.kind === 'type' || option.kind === 'source' ? (
        <Text style={styles.rowLabel}>{option.label}</Text>
      ) : null}
      {option.kind === 'more' ? <Text style={styles.rowLabel}>Show all {option.total}</Text> : null}
      <View style={styles.spacer} />
      {option.kind === 'asset' && option.hint ? <Text style={styles.hint}>{option.hint}</Text> : null}
      {option.kind === 'type' || option.kind === 'source' ? (
        <Text style={styles.count}>{option.count}</Text>
      ) : null}
    </Pressable>
  );
}

function AssetLabel({ option }: { option: Extract<PaletteOption, { kind: 'asset' }> }) {
  const mark = option.mark;
  if (!mark) return <Text style={styles.rowLabel}>{option.title}</Text>;
  return (
    <Text style={styles.rowLabel}>
      {option.title.slice(0, mark.start)}
      <Text style={styles.mark}>{option.title.slice(mark.start, mark.end)}</Text>
      {option.title.slice(mark.end)}
    </Text>
  );
}

function KeyHint({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.hintPair}>
      <View style={styles.keycap}>
        <Text style={styles.keycapText}>{label}</Text>
      </View>
      <Text style={styles.footerText}>{text}</Text>
    </View>
  );
}

export function macShortcut(): boolean {
  return isMac();
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 80, alignItems: 'center' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 13, 13, 0.24)' },
  panel: {
    marginTop: 120,
    width: 640,
    maxWidth: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.material,
    overflow: 'hidden',
  },
  dialog: { flexGrow: 1, minHeight: 0 },
  inputRow: {
    height: 52,
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
    padding: 0,
  },
  clear: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  clearGlyph: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 20, color: colors.textMuted },
  keycap: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 4,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keycapText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  list: { padding: 6, flexGrow: 0 },
  group: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textFaint,
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  row: {
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  rowOn: { backgroundColor: '#f1f1f1' },
  assetCopy: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minWidth: 0 },
  rowLabel: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
  mark: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text },
  typeText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.textFaint },
  spacer: { flex: 1 },
  hint: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
  count: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  empty: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyTitle: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
  emptyLine: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textSubtle },
  footer: {
    height: 36,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hintPair: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint },
});
