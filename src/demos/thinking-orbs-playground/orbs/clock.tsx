import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, type AppStateStatus } from "react-native";
import { runOnJS, useFrameCallback } from "react-native-reanimated";

const listeners = new Set<() => void>();

/** One shared frame pump. Orbs subscribe; they do not start their own clocks. */
export function subscribeOrbFrame(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function flushOrbFrames(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

export function nowSeconds(): number {
  const perf = globalThis.performance;
  return (perf?.now?.() ?? Date.now()) / 1000;
}

const ReducedMotionContext = createContext(false);

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}

function readMatchMediaReduced(): boolean {
  if (typeof matchMedia !== "function") return false;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotionFlag(): boolean {
  const [reduced, setReduced] = useState(readMatchMediaReduced);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduced(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);

    let media: MediaQueryList | undefined;
    const onMedia = () => setReduced(readMatchMediaReduced());
    if (typeof matchMedia === "function") {
      media = matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener?.("change", onMedia);
    }

    return () => {
      cancelled = true;
      subscription.remove();
      media?.removeEventListener?.("change", onMedia);
    };
  }, []);

  return reduced;
}

function useHostHidden(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      const docHidden =
        typeof document !== "undefined" && document.visibilityState === "hidden";
      setHidden(docHidden);
    };

    const onAppState = (status: AppStateStatus) => {
      if (status !== "active") {
        setHidden(true);
        return;
      }
      syncVisibility();
    };

    syncVisibility();
    const appSub = AppState.addEventListener("change", onAppState);
    document?.addEventListener?.("visibilitychange", syncVisibility);
    return () => {
      appSub.remove();
      document?.removeEventListener?.("visibilitychange", syncVisibility);
    };
  }, []);

  return hidden;
}

/**
 * Reanimated frame callback drives every orb on the JS thread.
 * Hidden tab / background stops the loop; resume reads the wall clock again.
 * Reduced motion stops the loop; orbs paint t = 0.6 once.
 */
export function OrbClockProvider({
  children,
  reducedMotion: reducedMotionProp = false,
}: {
  children: ReactNode;
  /** Store in-app toggle. ORed with system prefers-reduced-motion. */
  reducedMotion?: boolean;
}) {
  const systemReduced = useReducedMotionFlag();
  const reducedMotion = reducedMotionProp || systemReduced;
  const hidden = useHostHidden();
  const frame = useFrameCallback(() => {
    "worklet";
    runOnJS(flushOrbFrames)();
  }, false);

  useEffect(() => {
    frame.setActive(!reducedMotion && !hidden);
  }, [frame, hidden, reducedMotion]);

  return (
    <ReducedMotionContext.Provider value={reducedMotion}>{children}</ReducedMotionContext.Provider>
  );
}
