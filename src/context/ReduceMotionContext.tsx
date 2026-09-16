import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

type MotionContextValue = {
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  forceReduceMotion: boolean;
  setForceReduceMotion: (value: boolean) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function ReduceMotionProvider({ children }: { children: ReactNode }) {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [forceReduceMotion, setForceReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setSystemReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      reduceMotion: systemReduceMotion || forceReduceMotion,
      systemReduceMotion,
      forceReduceMotion,
      setForceReduceMotion,
    }),
    [systemReduceMotion, forceReduceMotion],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useReduceMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useReduceMotion must be used inside ReduceMotionProvider');
  return ctx;
}
