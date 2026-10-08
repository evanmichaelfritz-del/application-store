import { createElement, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Platform, Pressable, Text, useWindowDimensions, View, type TextStyle, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useTheme } from "../theme/theme";
import { Chevron } from "./icons";

type WebKeyEvent = {
  key?: string;
  repeat?: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
  nativeEvent?: {
    key?: string;
    repeat?: boolean;
    preventDefault?: () => void;
    stopPropagation?: () => void;
  };
};

declare module "react-native" {
  interface ViewProps {
    onKeyDown?: (event: WebKeyEvent) => void;
    onKeyDownCapture?: (event: WebKeyEvent) => void;
    onContextMenu?: () => void;
    onPointerCancel?: () => void;
    dataSet?: Record<string, string>;
  }
}

function pointerButton(event: { button?: number; nativeEvent?: object }): number {
  if (typeof event.button === "number") return event.button;
  const native = event.nativeEvent;
  if (native && "button" in native && typeof native.button === "number") return native.button;
  return 0;
}

function keyName(event: WebKeyEvent): string {
  return event.key ?? event.nativeEvent?.key ?? "";
}

const MENU_FONT = 'system-ui, -apple-system, "SF Pro Display", sans-serif';

/** Dark hover/focus is DialKit `--dial-surface-hover` (#ffffff1f) and `--dial-focus-ring` (#fff9). Selected stays `--dial-surface-active` (#ffffff2e). */
const OPTION_CSS = `[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]{background-color:transparent;color:#ffffffb3;font-family:${MENU_FONT};font-size:13px;font-weight:500;line-height:19.5px;transition:background-color .15s,color .15s}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-label"]{color:#ffffffb3;opacity:1}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:hover{background-color:#ffffff1f}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"][aria-selected="true"]{background-color:#ffffff2e;color:#fffffff2}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"][aria-selected="true"] [data-testid="orb-select-label"]{color:#fffffff2}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:focus-visible{background-color:#ffffff1f;color:#fff;outline:2px solid #fff9;outline-offset:-2px}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:focus-visible [data-testid="orb-select-label"]{color:#fff;opacity:1}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]{color:#0009}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-label"]{color:#0009}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:hover{background-color:#00000014}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"][aria-selected="true"]{background-color:#0000001a;color:#000000e6}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"][aria-selected="true"] [data-testid="orb-select-label"]{color:#000000e6}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:focus-visible{background-color:#00000014;color:#000;outline:2px solid #0000008c;outline-offset:-2px}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:focus-visible [data-testid="orb-select-label"]{color:#000}
[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]{transition:background-color .15s ease}
[data-testid="yogesh-orb-panel"] [data-orb-trigger="dark"][aria-expanded="false"]:hover{background-color:rgba(255,255,255,.12)!important}`;

function injectOptionStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("orb-select-option-css")) return;
  const style = document.createElement("style");
  style.id = "orb-select-option-css";
  style.textContent = OPTION_CSS;
  document.head.appendChild(style);
}

const MENU_TEXT: TextStyle = {
  fontFamily: MENU_FONT,
  fontSize: 13,
  fontWeight: "500",
  lineHeight: 19.5,
};
const OPTION_BOX: ViewStyle = {
  height: 36,
  borderRadius: 6,
  paddingVertical: 8,
  paddingHorizontal: 10,
};

const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
/** Web close only (dismissWeb, onEnd web close). Same stiffness, damping, and mass as MENU; energyThreshold is the only difference. Native close stays on MENU. */
const CLOSE_MENU = { stiffness: MENU.stiffness, damping: MENU.damping, mass: MENU.mass, energyThreshold: 1.8e-7 };

export function SelectRow<T extends string>({
  label,
  value,
  options,
  open,
  onToggle,
  onPick,
  display,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  open: boolean;
  onToggle: () => void;
  onPick: (id: T) => void;
  display: string;
}) {
  const { colors, mode } = useTheme();
  const { height: windowH } = useWindowDimensions();
  const rowRef = useRef<View>(null);
  const menuRef = useRef<View>(null);
  const [above, setAbove] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((option) => option.id === value)));
  const focusOnOpen = useRef(false);
  const typed = useRef({ buf: "", at: 0 });
  const aboveSV = useSharedValue(0);
  const shown = useSharedValue(open ? 1 : 0);
  const chevron = useSharedValue(open ? 1 : 0);
  const openSV = useSharedValue(open ? 1 : 0);
  const goal = useSharedValue(open ? 1 : 0);
  const armed = useRef(false);
  const sawOpen = useRef(false);
  const primary = useSharedValue(0);
  const openRef = useRef(open);
  const committedOpen = useRef(open);
  const epoch = useRef(0);
  const appliedEpoch = useRef(0);
  const closeDelivered = useRef(false);
  const toggleRef = useRef(onToggle);
  const openFrame = useRef(0);
  const closeFrame = useRef(0);
  const requestClose = () => {
    epoch.current += 1;
    openRef.current = false;
  };
  const cancelOpenFrame = () => {
    if (openFrame.current === 0) return;
    cancelAnimationFrame(openFrame.current);
    openFrame.current = 0;
  };
  const cancelCloseFrame = () => {
    if (closeFrame.current === 0) return;
    cancelAnimationFrame(closeFrame.current);
    closeFrame.current = 0;
  };
  const commitRef = useRef((opening: boolean) => {
    if (opening) {
      if (!openRef.current) return;
      appliedEpoch.current = epoch.current;
      armed.current = true;
      onToggle();
      return;
    }
    const gen = epoch.current;
    startTransition(() => {
      if (gen !== epoch.current || openRef.current || !committedOpen.current) return;
      closeDelivered.current = true;
      appliedEpoch.current = gen;
      armed.current = true;
      onToggle();
    });
  });
  const commitJS = useCallback(() => {
    requestClose();
    commitRef.current(false);
  }, []);
  const web = Platform.OS === "web";
  useLayoutEffect(() => {
    if (web) injectOptionStyles();
  }, [web]);
  const optionsInRow = (): HTMLElement[] => {
    const host: unknown = rowRef.current;
    if (typeof host !== "object" || host === null || !("querySelectorAll" in host)) return [];
    const query = host.querySelectorAll;
    if (typeof query !== "function") return [];
    const raw: unknown = query.call(host, '[role="option"]');
    if (typeof raw !== "object" || raw === null || !("length" in raw) || typeof raw.length !== "number") return [];
    if (!("item" in raw) || typeof raw.item !== "function") return [];
    const nodes: HTMLElement[] = [];
    for (let i = 0; i < raw.length; i++) {
      const item: unknown = raw.item(i);
      if (item instanceof HTMLElement) nodes.push(item);
    }
    return nodes;
  };
  const focusTrigger = () => {
    const host: unknown = rowRef.current;
    if (typeof host !== "object" || host === null || !("querySelector" in host)) return;
    const query = host.querySelector;
    if (typeof query !== "function") return;
    const node: unknown = query.call(host, '[aria-haspopup="listbox"]');
    if (node instanceof HTMLElement) node.focus({ preventScroll: true });
  };
  const menuEl = (): HTMLElement | null => {
    const node: unknown = menuRef.current;
    return node instanceof HTMLElement ? node : null;
  };
  const sealClosed = () => {
    if (openRef.current) return;
    cancelOpenFrame();
    const menu = menuEl();
    if (!menu) return;
    if (typeof document !== "undefined" && document.activeElement instanceof Node && menu.contains(document.activeElement)) focusTrigger();
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    for (const node of optionsInRow()) node.tabIndex = -1;
  };
  const unseal = () => {
    const menu = menuEl();
    menu?.removeAttribute("inert");
    menu?.removeAttribute("aria-hidden");
  };
  const unsealForPointer = () => {
    unseal();
    focusOnOpen.current = true;
  };
  const sealRef = useRef(sealClosed);
  const unsealPtrRef = useRef(unsealForPointer);
  useLayoutEffect(() => {
    toggleRef.current = onToggle;
    commitRef.current = (opening: boolean) => {
      if (opening) {
        if (!openRef.current) return;
        appliedEpoch.current = epoch.current;
        armed.current = true;
        onToggle();
        return;
      }
      const gen = epoch.current;
      startTransition(() => {
        if (gen !== epoch.current || openRef.current || !committedOpen.current) return;
        closeDelivered.current = true;
        appliedEpoch.current = gen;
        armed.current = true;
        onToggle();
      });
    };
    sealRef.current = sealClosed;
    unsealPtrRef.current = unsealForPointer;
  });
  const sealJS = useCallback(() => {
    requestClose();
    sealRef.current();
  }, []);
  const unsealPtrJS = useCallback(() => unsealPtrRef.current(), []);
  const focusSelected = () => {
    focusOnOpen.current = false;
    const nodes = optionsInRow();
    const selected = nodes.find((node) => node.getAttribute("aria-selected") === "true");
    const target = selected ?? nodes[0];
    for (const node of nodes) node.tabIndex = node === target ? 0 : -1;
    target?.focus({ preventScroll: true });
  };
  const commitOpen = useCallback(() => {
    cancelCloseFrame();
    epoch.current += 1;
    openRef.current = true;
    const delivered = closeDelivered.current;
    let committed = false;
    if (delivered && committedOpen.current) {
      const gen = epoch.current;
      let countered = false;
      startTransition(() => {
        if (gen !== epoch.current || !openRef.current) return;
        closeDelivered.current = false;
        countered = true;
        toggleRef.current();
      });
      if (countered) armed.current = false;
    } else if (delivered || !committedOpen.current) {
      closeDelivered.current = false;
      flushSync(() => commitRef.current(true));
      committed = true;
    }
    if (committedOpen.current && !committed) focusSelected();
    openSV.value = 1;
    goal.value = 1;
    cancelOpenFrame();
    openFrame.current = requestAnimationFrame(() => {
      openFrame.current = 0;
      if (openSV.value !== 1) return;
      shown.value = withSpring(1, MENU);
      chevron.value = withSpring(1, CHEV);
    });
  }, [chevron, goal, openSV, shown]);
  const commitNextFrame = useCallback(() => {
    cancelCloseFrame();
    const gen = epoch.current;
    closeFrame.current = requestAnimationFrame(() => {
      closeFrame.current = 0;
      if (gen !== epoch.current || openRef.current) return;
      commitRef.current(false);
    });
  }, []);
  const dismissWeb = useCallback(() => {
    if (openSV.value !== 1) return;
    requestClose();
    cancelOpenFrame();
    sealClosed();
    openSV.value = 0;
    goal.value = 0;
    shown.value = withSpring(0, CLOSE_MENU);
    chevron.value = withSpring(0, CHEV);
    commitNextFrame();
  }, [chevron, commitNextFrame, goal, openSV, shown]);
  useEffect(() => {
    if (!web || !open || typeof document === "undefined") return;
    const inside = (target: EventTarget | null) => {
      const host: unknown = rowRef.current;
      if (typeof host !== "object" || host === null || !("contains" in host) || typeof host.contains !== "function") return false;
      return target instanceof Node && host.contains(target) === true;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissWeb();
      focusTrigger();
    };
    const onOutside = (event: Event) => {
      if (inside(event.target)) return;
      dismissWeb();
    };
    document.addEventListener("keydown", onKey, { passive: true });
    document.addEventListener(OUTSIDE_CLOSE_EVENT, onOutside, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener(OUTSIDE_CLOSE_EVENT, onOutside);
    };
  }, [dismissWeb, open, web]);
  useLayoutEffect(() => {
    committedOpen.current = open;
    if (open === openRef.current) {
      closeDelivered.current = false;
      appliedEpoch.current = epoch.current;
      return;
    }
    if (!open && closeDelivered.current && openRef.current) {
      closeDelivered.current = false;
      appliedEpoch.current = epoch.current;
      armed.current = true;
      onToggle();
      return;
    }
    if (!open && epoch.current === appliedEpoch.current && !closeDelivered.current) openRef.current = false;
  }, [open, onToggle]);
  useLayoutEffect(() => {
    if (!open && openRef.current) return;
    openSV.value = open ? 1 : 0;
  }, [open, openSV]);
  useLayoutEffect(() => {
    if (!sawOpen.current) {
      sawOpen.current = true;
      return;
    }
    if (armed.current) {
      armed.current = false;
      return;
    }
    goal.value = open ? 1 : 0;
    shown.value = withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU);
    chevron.value = withSpring(open ? 1 : 0, CHEV);
  }, [open, chevron, goal, shown, web]);
  useLayoutEffect(() => {
    if (open) return;
    setActive(Math.max(0, options.findIndex((option) => option.id === value)));
  }, [open, options, value]);
  useLayoutEffect(() => {
    if (!web || !open || !focusOnOpen.current) return;
    focusSelected();
  }, [open, options, value, web]);
  const place = () => {
    rowRef.current?.measureInWindow((_x, y, _w, h) => {
      const menuH = 8 + options.length * 36;
      const next = y + h + menuH + 8 > windowH;
      aboveSV.value = next ? 1 : 0;
      setAbove(next);
    });
  };
  useEffect(() => {
    place();
  }, [windowH, options.length]);
  useEffect(() => {
    return () => {
      if (openFrame.current !== 0) {
        cancelAnimationFrame(openFrame.current);
        openFrame.current = 0;
      }
      if (closeFrame.current !== 0) {
        cancelAnimationFrame(closeFrame.current);
        closeFrame.current = 0;
      }
    };
  }, []);
  const mountOnPress = (event: { button?: number; nativeEvent?: object }) => {
    primary.value = pointerButton(event) === 0 ? 1 : 0;
  };
  const cancelClosed = () => {
    primary.value = 0;
    if (openSV.value === 1) return;
    goal.value = 0;
    shown.value = 0;
  };
  const tap = useMemo(() => {
    const spring = (next: number) => {
      "worklet";
      goal.value = next;
      shown.value = withSpring(next, MENU);
      chevron.value = withSpring(next, CHEV);
    };
    return Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onEnd(() => {
        const next = openSV.value === 1 ? 0 : 1;
        if (web) {
          const fromPointer = primary.value === 1;
          primary.value = 0;
          if (!fromPointer) return;
          openSV.value = next;
          goal.value = next;
          if (next === 1) {
            runOnJS(unsealPtrJS)();
            runOnJS(commitOpen)();
            return;
          }
          runOnJS(sealJS)();
          shown.value = withSpring(0, CLOSE_MENU);
          chevron.value = withSpring(0, CHEV);
          runOnJS(commitNextFrame)();
          return;
        }
        spring(next);
        runOnJS(commitJS)();
      });
  }, [chevron, commitJS, commitNextFrame, commitOpen, goal, openSV, primary, sealJS, shown, unsealPtrJS, web]);
  const menuStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * (aboveSV.value ? 8 : -8) }, { scale: 0.95 + shown.value * 0.05 }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value * 180}deg` }] }));
  const openFromKeys = () => {
    const index = Math.max(0, options.findIndex((option) => option.id === value));
    setActive(index);
    focusOnOpen.current = true;
    unseal();
    commitOpen();
  };
  const moveTo = (index: number, nodes: HTMLElement[]) => {
    const next = Math.max(0, Math.min(nodes.length - 1, index));
    setActive(next);
    nodes[next]?.focus({ preventScroll: true });
  };
  const onKeyDownCapture = (event: WebKeyEvent) => {
    const key = keyName(event);
    if (key === "Tab") {
      if (openSV.value !== 1) return;
      sealClosed();
      dismissWeb();
      return;
    }
    if (key === "Escape") {
      if (openSV.value !== 1) return;
      event.preventDefault();
      event.nativeEvent?.preventDefault?.();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      event.nativeEvent?.preventDefault?.();
      event.stopPropagation();
      if (openSV.value === 1) {
        const nodes = optionsInRow();
        nodes[active]?.focus();
        return;
      }
      openFromKeys();
      return;
    }
    if (key !== "Enter" && key !== " " && key !== "Spacebar") return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
    event.stopPropagation();
    event.nativeEvent?.stopPropagation?.();
    if (event.repeat || event.nativeEvent?.repeat) return;
    if (openSV.value === 1) {
      dismissWeb();
      return;
    }
    openFromKeys();
  };
  const onOptionKey = (event: WebKeyEvent & { altKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }, index: number) => {
    if (!open) return;
    const nodes = optionsInRow();
    const key = keyName(event);
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      event.stopPropagation();
      if (key === "ArrowDown") moveTo(index + 1, nodes);
      else if (key === "ArrowUp") moveTo(index - 1, nodes);
      else if (key === "Home") moveTo(0, nodes);
      else moveTo(nodes.length - 1, nodes);
      return;
    }
    if (key === "Enter" || key === " " || key === "Spacebar") {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
      sealClosed();
      onPick(options[index].id);
      focusTrigger();
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key === "Tab") {
      event.stopPropagation();
      sealClosed();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key.length !== 1 || key === " " || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    const t = typed.current;
    t.buf = now - t.at < 700 ? t.buf + key.toLowerCase() : key.toLowerCase();
    t.at = now;
    const q = [...t.buf].every((c) => c === t.buf[0]) ? t.buf[0] : t.buf;
    for (let n = q.length > 1 ? 0 : 1; n <= options.length; n++) {
      const i = (index + n) % options.length;
      if (options[i].label.toLowerCase().startsWith(q)) {
        moveTo(i, nodes);
        return;
      }
    }
  };
  const menuInk = mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const triggerText: TextStyle = {
    ...MENU_TEXT,
    color: menuInk,
    transform: [{ translateY: -0.5 }],
  };
  return (
    <View ref={rowRef} onLayout={place} style={{ zIndex: open ? 20 : 1 }}>
      <GestureDetector gesture={tap} touchAction="pan-y">
        <View
          accessible
          accessibilityRole="button"
          aria-haspopup={web ? "listbox" : undefined}
          aria-expanded={web ? open : undefined}
          dataSet={{ orbTrigger: mode }}
          collapsable={false}
          onPointerDown={web ? mountOnPress : undefined}
          onContextMenu={web ? cancelClosed : undefined}
          onPointerCancel={web ? cancelClosed : undefined}
          onKeyDownCapture={Platform.OS === "web" ? onKeyDownCapture : undefined}
          style={{
            height: 36,
            borderRadius: 8,
            backgroundColor: open
              ? mode === "dark"
                ? "rgba(255,255,255,0.18)"
                : "rgba(0,0,0,0.10)"
              : mode === "dark"
                ? "rgba(255,255,255,0.08)"
                : colors.row,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={triggerText}>{label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={triggerText}>{display}</Text>
            <Animated.View style={chevronStyle}>
              <Chevron color={menuInk} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
      <Animated.View
          ref={menuRef}
          pointerEvents={open ? "auto" : "none"}
          focusable={false}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? "auto" : "no-hide-descendants"}
          aria-hidden={!open}
          style={[
            {
              position: "absolute",
              top: above ? undefined : 40,
              bottom: above ? 40 : undefined,
              left: 0,
              right: 0,
              backgroundColor: mode === "light" ? "#fafafa" : colors.pop,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: mode === "light" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.14)",
              padding: 4,
              zIndex: 30,
              boxShadow: mode === "dark" ? "0 8px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.08)",
            },
            menuStyle,
          ]}
        >
          {web
            ? createElement(
                "div",
                { role: "listbox", "aria-label": label, className: mode === "light" ? "orb-select-menu is-light" : "orb-select-menu", inert: open ? undefined : true },
                options.map((option, index) => {
                  const on = option.id === value;
                  const tabbable = open && index === active;
                  return (
                    <Pressable key={option.id} role="option" tabIndex={tabbable ? 0 : -1} focusable={tabbable} accessibilityState={{ selected: on }} aria-selected={on} testID="orb-select-option" onKeyDown={(event) => onOptionKey(event, index)} onPress={() => { requestClose(); sealClosed(); onPick(option.id); focusTrigger(); }} style={OPTION_BOX}>
                      <Text testID="orb-select-label" style={MENU_TEXT}>{option.label}</Text>
                    </Pressable>
                  );
                }),
              )
            : options.map((option) => {
                const on = option.id === value;
                return (
                  <Pressable key={option.id} accessibilityRole="menuitem" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={[OPTION_BOX, { backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }]}>
                    <Text style={{ ...MENU_TEXT, color: colors.fg, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                  </Pressable>
                );
              })}
        </Animated.View>
    </View>
  );
}
