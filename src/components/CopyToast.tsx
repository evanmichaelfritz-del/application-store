import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { paintCopiedToast } from '@/src/copyToastDom';
import { useCopyToast } from '@/src/context/CopyToastContext';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, tokens } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

const LAYER: Record<string, string | number> = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  paddingBottom: 36,
  zIndex: 2147483647,
  pointerEvents: 'none',
};

const PILL: Record<string, string | number> = {
  backgroundColor: colors.text,
  color: colors.proFg,
  minWidth: 96,
  height: 42,
  paddingLeft: 18,
  paddingRight: 18,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  opacity: 1,
  transform: 'scale(1)',
};

function WebCopiedToast({ visible, nonce }: { visible: boolean; nonce: number }) {
  useEffect(() => {
    if (visible) paintCopiedToast();
  }, [visible, nonce]);

  if (!visible || typeof document === 'undefined') return null;

  const portal = createPortal(
          <div key={nonce} data-testid="copy-toast-layer" style={LAYER}>
            <div data-testid="copy-toast" role="alert" aria-live="polite" style={PILL}>
              Copied
            </div>
          </div>,
          document.body,
        );

  return (
    <>
      {portal}
      <View pointerEvents="none" style={styles.backup}>
        <View testID="copy-toast" accessibilityRole="alert" style={styles.toast}>
          <Text style={styles.text}>Copied</Text>
        </View>
      </View>
    </>
  );
}

function NativeHost({ children }: { children: ReactNode }) {
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.layer} accessibilityLiveRegion="polite" accessibilityRole="alert">
        {children}
      </View>
    </Modal>
  );
}

export function CopyToast() {
  const { visible, nonce } = useCopyToast();
  const { reduceMotion } = useReduceMotion();
  const progress = useSharedValue(0);
  const [presented, setPresented] = useState(false);

  useEffect(() => {
    if (visible) {
      setPresented(true);
      progress.value = withTiming(1, {
        duration: reduceMotion ? 0 : tokens.toastIn,
        easing: ease.outEase,
      });
      return;
    }
    progress.value = withTiming(
      0,
      {
        duration: reduceMotion ? 0 : tokens.toastOut,
        easing: ease.outEase,
      },
      (finished) => {
        if (finished) runOnJS(setPresented)(false);
      },
    );
  }, [nonce, progress, reduceMotion, visible]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  if (Platform.OS === 'web') {
    return <WebCopiedToast key={nonce} visible={visible} nonce={nonce} />;
  }

  if (!presented && !visible) return null;

  return (
    <NativeHost>
      <Animated.View style={[styles.toast, style]} testID="copy-toast">
        <Text style={styles.text}>Copied</Text>
      </Animated.View>
    </NativeHost>
  );
}

const styles = StyleSheet.create({
  backup: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
    zIndex: 2147483647,
    elevation: 2147483647,
    pointerEvents: 'none',
  },
  layer: {
    ...StyleSheet.absoluteFill,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'none',
  },
  toast: {
    backgroundColor: colors.text,
    paddingHorizontal: 18,
    minWidth: 96,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.toast,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.proFg,
  },
});
