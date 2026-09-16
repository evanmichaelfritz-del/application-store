import 'react-native-gesture-handler';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { CopyToast } from '@/src/components/CopyToast';
import { ReducedMotionBridge } from '@/src/components/ReducedMotionBridge';
import { CopyToastProvider } from '@/src/context/CopyToastContext';
import { ReduceMotionProvider } from '@/src/context/ReduceMotionContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduceMotionProvider>
        <CopyToastProvider>
          <ReducedMotionBridge />
          <Stack screenOptions={{ headerShown: false }} />
          <CopyToast />
        </CopyToastProvider>
      </ReduceMotionProvider>
    </GestureHandlerRootView>
  );
}
