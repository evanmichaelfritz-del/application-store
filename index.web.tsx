import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

LoadSkiaWeb({
  locateFile: (file) => `/${file}`,
}).then(() => {
  renderRootComponent(App);
});
