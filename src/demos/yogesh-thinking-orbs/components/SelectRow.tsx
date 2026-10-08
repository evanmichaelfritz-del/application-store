import { createElement, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { fonts, useTheme } from "../theme/theme";
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
  }
}

function keyName(event: WebKeyEvent): string {
  return event.key ?? event.nativeEvent?.key ?? "";
}

const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
/** Web close only (dismissWeb, driveWebSprings close, onEnd web close). Same stiffness, damping, and mass as MENU; energyThreshold is the only difference. Native close stays on MENU. */
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
  const [above, setAbove] = useState(false);
  const [present, setPresent] = useState(open);
  const aboveSV = useSharedValue(0);
  const shown = useSharedValue(open ? 1 : 0);
  const chevron = useSharedValue(open ? 1 : 0);
  const openSV = useSharedValue(open ? 1 : 0);
  const goal = useSharedValue(open ? 1 : 0);
  const armed = useRef(false);
  const sawOpen = useRef(false);
  const primed = useSharedValue(0);
  const revealRef = useRef(() => setPresent(true));
  const hideRef = useRef(() => setPresent(false));
  const commitRef = useRef(() => {
    armed.current = true;
    startTransition(() => {
      onToggle();
    });
  });
  revealRef.current = () => setPresent(true);
  hideRef.current = () => setPresent(false);
  commitRef.current = () => {
    armed.current = true;
    startTransition(() => {
      onToggle();
    });
  };
  const revealJS = useCallback(() => revealRef.current(), []);
  const hideJS = useCallback(() => hideRef.current(), []);
  const commitJS = useCallback(() => commitRef.current(), []);
  const web = Platform.OS === "web";
  const commitNextFrame = useCallback(() => {
    requestAnimationFrame(() => {
      commitRef.current();
    });
  }, []);
  const dismissWeb = useCallback(() => {
    if (openSV.value !== 1) return;
    openSV.value = 0;
    goal.value = 0;
    shown.value = withSpring(0, CLOSE_MENU, (finished) => {
      if (finished && goal.value === 0) runOnJS(hideJS)();
    });
    chevron.value = withSpring(0, CHEV);
    commitNextFrame();
  }, [chevron, commitNextFrame, goal, hideJS, openSV, shown]);
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
  const driveWebSprings = useCallback((next: number) => {
    openSV.value = next;
    goal.value = next;
    if (next === 1) revealRef.current();
    shown.value = withSpring(next, next === 1 ? MENU : CLOSE_MENU, (finished) => {
      if (finished && goal.value === 0) hideJS();
    });
    chevron.value = withSpring(next, CHEV);
  }, [chevron, goal, hideJS, openSV, shown]);
  useLayoutEffect(() => {
    openSV.value = open ? 1 : 0;
  }, [open, openSV]);
  useLayoutEffect(() => {
    if (!sawOpen.current) {
      sawOpen.current = true;
      return;
    }
    if (armed.current) {
      armed.current = false;
      if (open) setPresent(true);
      return;
    }
    if (open) setPresent(true);
    goal.value = open ? 1 : 0;
    shown.value = withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU, (finished) => {
      if (finished && goal.value === 0) runOnJS(hideJS)();
    });
    chevron.value = withSpring(open ? 1 : 0, CHEV);
  }, [open, chevron, goal, hideJS, shown]);
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
  const mountOnPress = () => {
    if (openSV.value === 1) return;
    primed.value = 1;
    if (web) {
      const { flushSync } = require("react-dom") as { flushSync: (fn: () => void) => void };
      flushSync(() => revealRef.current());
      return;
    }
    revealRef.current();
  };
  const tap = useMemo(() => {
    const spring = (next: number) => {
      "worklet";
      goal.value = next;
      if (next === 1) runOnJS(revealJS)();
      shown.value = withSpring(next, MENU, (finished) => {
        if (finished && goal.value === 0) runOnJS(hideJS)();
      });
      chevron.value = withSpring(next, CHEV);
    };
    return Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onBegin(() => {
        if (openSV.value !== 1) {
          primed.value = 1;
          runOnJS(revealJS)();
        }
      })
      .onEnd(() => {
        primed.value = 0;
        const next = openSV.value === 1 ? 0 : 1;
        if (web) {
          openSV.value = next;
          goal.value = next;
          if (next === 1) runOnJS(revealJS)();
          shown.value = withSpring(next, next === 1 ? MENU : CLOSE_MENU, (finished) => {
            if (finished && goal.value === 0) runOnJS(hideJS)();
          });
          chevron.value = withSpring(next, CHEV);
          runOnJS(commitNextFrame)();
          return;
        }
        spring(next);
        runOnJS(commitJS)();
      })
      .onFinalize((_event, success) => {
        if (success || primed.value !== 1 || openSV.value === 1) return;
        primed.value = 0;
        runOnJS(hideJS)();
      });
  }, [chevron, commitJS, commitNextFrame, goal, hideJS, openSV, primed, revealJS, shown, web]);
  const menuStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * (aboveSV.value ? 8 : -8) }, { scale: 0.95 + shown.value * 0.05 }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value * 180}deg` }] }));
  const onKeyDownCapture = (event: WebKeyEvent) => {
    if (keyName(event) !== "Enter") return;
    event.stopPropagation();
    event.nativeEvent?.stopPropagation?.();
    if (event.repeat || event.nativeEvent?.repeat) return;
    driveWebSprings(openSV.value === 1 ? 0 : 1);
    commitNextFrame();
  };
  const onKeyDown = (event: WebKeyEvent) => {
    const key = keyName(event);
    if (key !== " " && key !== "Spacebar") return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
  };
  return (
    <View ref={rowRef} onLayout={place} style={{ zIndex: open ? 20 : 1 }}>
      <GestureDetector gesture={tap} touchAction="pan-y">
        <View
          accessible
          accessibilityRole="button"
          aria-haspopup={web ? "listbox" : undefined}
          aria-expanded={web ? open : undefined}
          collapsable={false}
          onPointerDown={web ? mountOnPress : undefined}
          onKeyDown={Platform.OS === "web" ? onKeyDown : undefined}
          onKeyDownCapture={Platform.OS === "web" ? onKeyDownCapture : undefined}
          style={{
            height: 36,
            borderRadius: 8,
            backgroundColor: open ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : colors.row,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>{label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>{display}</Text>
            <Animated.View style={chevronStyle}>
              <Chevron color={colors.muted} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
      {present ? (
        <Animated.View
          pointerEvents={open ? "auto" : "none"}
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
              borderColor: mode === "light" ? "rgba(0,0,0,0.10)" : colors.ringSoft,
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
                { role: "listbox", "aria-label": label },
                options.map((option) => {
                  const on = option.id === value;
                  return (
                    <Pressable key={option.id} role="option" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={{ height: 36, borderRadius: 6, paddingHorizontal: 8, justifyContent: "center", backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }}>
                      <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                    </Pressable>
                  );
                }),
              )
            : options.map((option) => {
                const on = option.id === value;
                return (
                  <Pressable key={option.id} accessibilityRole="menuitem" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={{ height: 36, borderRadius: 6, paddingHorizontal: 8, justifyContent: "center", backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }}>
                    <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                  </Pressable>
                );
              })}
        </Animated.View>
      ) : null}
    </View>
  );
}
