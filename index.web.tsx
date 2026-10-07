import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { installWebPanCss } from '@/src/libdev/installWebPanCss';

function WebRoot() {
  installWebPanCss();
  return <App />;
}

// CanvasKit stays out of boot. The first Skia card within 200px calls the
// shared LoadSkiaWeb in src/skia/ensureCanvasKit.web.ts.
renderRootComponent(WebRoot);
