const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Raw text imports for the Influencer Overview card assets only.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'html');
if (!config.resolver.sourceExts.includes('md')) config.resolver.sourceExts.push('md');
if (!config.resolver.sourceExts.includes('html')) config.resolver.sourceExts.push('html');
config.transformer.babelTransformerPath = require.resolve('./scripts/metro-raw-text-transformer.js');

module.exports = config;
