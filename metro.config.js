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
// Keep the Glisse MIT comment in the exported card chunk. A string literal
// escapes the quotation marks, so the guard would miss the disclaimer.
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  output: {
    ...(config.transformer.minifierConfig && config.transformer.minifierConfig.output),
    comments: /@preserve|@copyright|@lic|@cc_on|^\**!|Permission is hereby granted, free of charge/i,
  },
};

// img-fx is the only `three` importer. On web, route that import through a
// renderer wrapper that compiles the loader shader off the main thread.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes('.css?inline')) {
    const cssFile = path.resolve(path.dirname(context.originModulePath), moduleName.replace(/\?inline$/, ''));
    return { type: 'sourceFile', filePath: `${cssFile}.inline.ts` };
  }
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
