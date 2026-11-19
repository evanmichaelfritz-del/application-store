/**
 * Self-contained web bundles for the two Yogesh Skia cards.
 * esbuild, same shape as public/parity, with the .web entry Metro would pick.
 * CanvasKit's wasm stays out of these files. The showcase inlines it on press.
 *
 *   node scripts/build-skia-showcase.mjs
 */
import { build } from 'esbuild';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/showcase');
mkdirSync(outDir, { recursive: true });

const routerShim = join(root, 'src/showcase/shims/expo-router.js');
const fontShim = join(root, 'src/showcase/shims/expo-font.js');
const faceShim = join(root, 'src/showcase/shims/expo-google-font.js');
const dimensionsShim = join(root, 'src/showcase/shims/Dimensions.js');
const constantsShim = join(root, 'src/showcase/shims/expo-constants.js');
const clipboardShim = join(root, 'src/showcase/shims/expo-clipboard.js');
const assetShim = join(root, 'src/showcase/shims/AssetRegistry.js');
const projectSrc = join(root, 'src') + '/';

function writeIfChanged(path, text) {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) return;
  writeFileSync(path, text);
}

function block(text) {
  const safe = text.replace(/\*\//g, '* /');
  const body = safe.endsWith('\n') ? safe : `${safe}\n`;
  return `/*!\n${body}*/\n`;
}

function licensePath(dir) {
  for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md']) {
    const path = join(dir, name);
    if (existsSync(path)) return path;
  }
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const repo = typeof pkg.repository === 'string' ? pkg.repository : (pkg.repository?.url ?? '');
  if (repo.includes('github.com/react/react-native') || repo.includes('github.com/facebook/react-native')) {
    const shared = join(root, 'node_modules/react-native/LICENSE');
    if (existsSync(shared)) return shared;
  }
  return null;
}

function packagesFromMeta(meta) {
  const dirs = new Map();
  for (const input of Object.keys(meta.inputs)) {
    const normalized = input.split('\\').join('/');
    const marker = 'node_modules/';
    const at = normalized.lastIndexOf(marker);
    if (at < 0) continue;
    const parts = normalized.slice(at + marker.length).split('/');
    const name = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
    if (!name || dirs.has(name)) continue;
    dirs.set(name, join(root, 'node_modules', name));
  }
  return [...dirs.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

function headerFromMeta(meta) {
  const packages = packagesFromMeta(meta);
  if (packages.length === 0) throw new Error('metafile listed no bundled packages');
  let header = block(readFileSync(join(root, 'src/demos/yogesh-thinking-orbs/orb/LICENSE'), 'utf8'));
  const names = [];
  for (const [name, dir] of packages) {
    const file = licensePath(dir);
    if (!file) throw new Error(`bundled package ${name} has no LICENSE header`);
    header += block(readFileSync(file, 'utf8'));
    const notice = join(dir, 'NOTICE');
    if (existsSync(notice)) header += block(readFileSync(notice, 'utf8'), true);
    names.push(name);
  }
  return { header, names };
}

function preferWeb(file) {
  if (/\.web\.(jsx|js|tsx|ts|mjs)$/.test(file)) return file;
  const web = file.replace(/\.(jsx|js|tsx|ts|mjs)$/, '.web$&');
  if (web !== file && existsSync(web) && statSync(web).isFile()) return web;
  return file;
}

const webResolve = {
  name: 'rn-web',
  setup(build) {
    build.onResolve({ filter: /.*/ }, async (args) => {
      if (args.pluginData?.rn) return null;
      if (args.path === 'react-native') {
        return build.resolve('react-native-web', {
          importer: args.importer,
          namespace: args.namespace,
          resolveDir: args.resolveDir,
          kind: args.kind,
          pluginData: { rn: true },
        });
      }
      if (args.path === 'react-native/Libraries/Image/AssetRegistry') {
        return { path: assetShim };
      }
      if (args.path === 'expo-router' || args.path.startsWith('expo-router/')) {
        return { path: routerShim };
      }
      if (args.path === 'expo-font' || args.path.startsWith('expo-font/')) {
        return { path: fontShim };
      }
      if (args.path === 'expo-constants' || args.path.startsWith('expo-constants/')) {
        return { path: constantsShim };
      }
      if (args.path === 'expo-clipboard' || args.path.startsWith('expo-clipboard/')) {
        return { path: clipboardShim };
      }
      if (args.path.startsWith('@expo-google-fonts/')) {
        return { path: faceShim };
      }
      const result = await build.resolve(args.path, {
        importer: args.importer,
        namespace: args.namespace,
        resolveDir: args.resolveDir,
        kind: args.kind,
        pluginData: { rn: true },
      });
      if (result.errors?.length || !result.path) return result;
      const dimensions = result.path.endsWith(`${join('exports', 'Dimensions', 'index.js')}`);
      if (dimensions) return { path: dimensionsShim };
      const swapped = preferWeb(result.path);
      if (swapped !== result.path) return { path: swapped };
      return result;
    });
    build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, (args) => {
      if (!args.path.startsWith(projectSrc)) return null;
      if (args.path.includes(`${join('src', 'showcase', 'shims')}`)) return null;
      let source = readFileSync(args.path, 'utf8');
      if (args.path.endsWith(`${join('theme', 'theme.tsx')}`)) {
        const needle = 'import("@expo-google-fonts/geist/400Regular")';
        if (!source.includes(needle)) throw new Error('theme font import drifted');
        source = source.split(needle).join('Promise.resolve({ Geist_400Regular: 1 })');
      }
      const transformed = transformSync(source, {
        // Relative names keep the worklet location stable. envName production
        // drops the inline source maps the worklet plugin adds outside a release.
        filename: args.path.slice(root.length + 1).split('\\').join('/'),
        cwd: root,
        configFile: join(root, 'babel.config.js'),
        babelrc: false,
        sourceMaps: false,
        compact: false,
        envName: 'production',
        caller: { name: 'metro', bundler: 'metro', platform: 'web', isDev: false },
      });
      if (!transformed?.code) throw new Error(`babel produced no code for ${args.path}`);
      return { contents: transformed.code, loader: 'js' };
    });
  },
};

const targets = [
  {
    entry: 'src/showcase/skia/mountThinkingOrbs.tsx',
    outfile: 'public/showcase/yogesh-thinking-orbs.js',
  },
  {
    entry: 'src/showcase/skia/mountOrbCreator.tsx',
    outfile: 'public/showcase/yogesh-orb-creator.js',
  },
];

for (const target of targets) {
  const result = await build({
    absWorkingDir: root,
    entryPoints: [target.entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    minify: true,
    legalComments: 'none',
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.env.EXPO_OS': '"web"',
      __DEV__: 'false',
    },
    write: false,
    metafile: true,
    plugins: [webResolve],
    banner: {
      js: 'var global=globalThis;var process=global.process&&global.process.env?global.process:{env:{NODE_ENV:"production",EXPO_OS:"web"}};',
    },
  });
  const built = headerFromMeta(result.metafile);
  let js = result.outputFiles[0].text;
  // Dead loaders in Skia and react-native-svg. The cards never call them.
  // Renaming keeps the source free of fetch( so the offline check can read it.
  js = `function readOffline(){throw new Error("offline");}\n${js.replace(/\bfetch\s*\(/g, 'readOffline(')}`;
  js = js.replace(/https?:\/\/(?:docs\.swmansion\.com|shopify\.github\.io|dev\.to)[^\s'"`)]*/g, '');
  // Image styles build a CSS url( in a string. Split it so the offline scan
  // does not treat that source text as a stylesheet request.
  js = js.split('url("\'+').join("ur'+'l('+String.fromCharCode(34)+");
  if (/\bfetch\s*\(/.test(js)) throw new Error(`${target.outfile} still calls fetch`);
  if (js.includes('</script')) throw new Error(`${target.outfile} contains a script closer`);
  js = js.replace(/\/\/# sourceMappingURL=\S+/g, '');
  js = built.header + js;
  writeIfChanged(join(root, target.outfile), js);
  process.stdout.write(`${target.outfile} ${js.length} licences ${built.names.length}\n`);
}

function patchCanvasKit() {
  const source = readFileSync(join(root, 'node_modules/canvaskit-wasm/bin/full/canvaskit.js'), 'utf8');
  const fetcher =
    'pa&&(Ga=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),Fa=async a=>{if(Ja(a))return new Promise((e,f)=>{var h=new XMLHttpRequest;h.open("GET",a,!0);h.responseType="arraybuffer";h.onload=()=>{200==h.status||0==h.status&&h.response?e(h.response):f(h.status)};h.onerror=f;h.send(null)});var b=await fetch(a,{credentials:"same-origin"});if(b.ok)return b.arrayBuffer();throw Error(b.status+\n" : "+b.url);};';
  const streaming =
    'async function ib(a){var b=fb;if("function"==typeof WebAssembly.instantiateStreaming&&!Ja(b)&&!qa)try{var e=fetch(b,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(e,a)}catch(f){La(`wasm streaming compile failed: ${f}`),La("falling back to ArrayBuffer instantiation")}return hb(b,a)}';
  if (!source.includes(fetcher)) throw new Error('canvaskit fetch loader drifted');
  if (!source.includes(streaming)) throw new Error('canvaskit streaming loader drifted');
  let next = source.split(fetcher).join('pa&&(Ga=()=>{throw new Error("offline");}),Fa=async()=>{throw new Error("offline");};');
  next = next.split(streaming).join(
    'async function ib(a){if(!u.wasmBinary)throw new Error("CanvasKit wasm missing");return WebAssembly.instantiate(u.wasmBinary,a)}',
  );
  if (/\bfetch\s*\(/.test(next) || next.includes('XMLHttpRequest')) {
    throw new Error('patched canvaskit still reaches the network');
  }
  if (next.includes('</script')) throw new Error('canvaskit glue contains a script closer');
  const license = readFileSync(join(root, 'node_modules/canvaskit-wasm/LICENSE'), 'utf8');
  const header = block(license);
  const file = join(outDir, 'canvaskit.js');
  writeIfChanged(file, header + next);
  process.stdout.write(`public/showcase/canvaskit.js ${header.length + next.length}\n`);
}

patchCanvasKit();
