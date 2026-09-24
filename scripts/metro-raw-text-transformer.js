const upstream = require('@expo/metro-config/build/babel-transformer');

/** Card assets imported as exact file text. Swap the file; do not edit a template literal. */
const RAW_SUFFIXES = [
  '/src/demos/abrar-overview/AGENT_PROMPT.md',
  '/src/demos/abrar-overview/closed-network.html',
];

function transform(args) {
  const filename = String(args.filename || '').replace(/\\/g, '/');
  if (RAW_SUFFIXES.some((suffix) => filename.includes(suffix.slice(1)))) {
    return upstream.transform({
      ...args,
      src: `export default ${JSON.stringify(args.src)};\n`,
      filename: `${args.filename}.js`,
    });
  }
  return upstream.transform(args);
}

module.exports = {
  transform,
  getCacheKey: upstream.getCacheKey,
};
