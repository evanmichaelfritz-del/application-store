import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { hideCopiedToast, paintCopiedToast } from '@/src/copyToastDom';

type CopyToastContextValue = {
  visible: boolean;
  nonce: number;
  show: () => void;
};

const CopyToastContext = createContext<CopyToastContextValue | null>(null);

export function CopyToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [nonce, setNonce] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (Platform.OS === 'web') paintCopiedToast();
    setNonce((n) => n + 1);
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      if (Platform.OS === 'web') hideCopiedToast();
    }, 1400);
  }, []);

  return (
    <CopyToastContext.Provider value={{ visible, nonce, show }}>{children}</CopyToastContext.Provider>
  );
}

export function useCopyToast() {
  const ctx = useContext(CopyToastContext);
  if (!ctx) throw new Error('useCopyToast must be used inside CopyToastProvider');
  return ctx;
}
