const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const threeShim = path.join(__dirname, 'src/shims/three.js');
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Raw text imports for the Influencer Overview card assets only.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'html');
if (!config.resolver.sourceExts.includes('md')) config.resolver.sourceExts.push('md');
if (!config.resolver.sourceExts.includes('html')) config.resolver.sourceExts.push('html');
config.transformer.babelTransformerPath = require.resolve('./scripts/metro-raw-text-transformer.js');

// img-fx is the only `three` importer. On web, route that import through a
// renderer wrapper that compiles the loader shader off the main thread.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    moduleName === 'three' &&
    !context.originModulePath.endsWith(`${path.sep}src${path.sep}shims${path.sep}three.js`)
  ) {
    return { type: 'sourceFile', filePath: threeShim };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
