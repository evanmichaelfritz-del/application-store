import { promptFor } from '@/src/agentPrompts';
import { mediaFillsStage, TRANSITIONS, type CatalogMedia } from '@/src/catalog';
import { composePreviewDocument, previewDocumentParts } from '@/src/closedNetwork/previewSources';
import { codeSlot, fullCopyDocument } from '@/src/library/assetCopy';
import { creditFor } from '@/src/library/credits';
import { previewControl } from '@/src/library/assetMeta';
import { facetLine } from '@/src/library/taxonomy';
import { showcaseLater } from '@/src/showcase/later';
import { SHOWCASE_FILE_LIMIT, SHOWCASE_OVER_LIMIT } from '@/src/showcase/limits';

export { SHOWCASE_FILE_LIMIT, SHOWCASE_OVER_LIMIT };

/** Public file, rooted at `/`. The browser fetches it; the checker reads the disk. */
export type ByteReader = (publicPath: string) => Promise<Uint8Array>;

const LAZY_PROMPT: Record<string, string> = {
  'border-beam': '/prompts/border-beam.md',
  'liquid-metal': '/prompts/liquid-metal.md',
  gooey: '/prompts/gooey.md',
  'drag-drop-physics': '/prompts/drag-drop-physics.md',
  'spacing-tuner': '/prompts/spacing-tuner.md',
  'image-generation-loader': '/prompts/image-generation-loader.md',
  stageshow: '/prompts/stageshow.md',
};

const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const INTER_WEIGHTS = [400, 500, 600] as const;
const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const PARITY_LOADER =
  /\(function \(\) \{\s*var s = document\.createElement\('script'\);\s*s\.src = location\.origin \+ '(\/parity\/[^']+)';\s*document\.body\.appendChild\(s\);\s*\}\)\(\);/;

const LOADER_URLS = "var urls = ['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png'];";
const LOADER_FETCH =
  'return fetch(src).then(function (res) { return res.blob(); }).then(function (blob) { return createImageBitmap(blob); });';

const BITMAP_HELPER = `function bitmapFromDataUri(uri) {
  var comma = uri.indexOf(',');
  var meta = uri.slice(0, comma);
  var body = uri.slice(comma + 1);
  var binary = atob(body);
  var bytes = new Uint8Array(binary.length);
  var i = 0;
  for (; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  var type = (meta.match(/^data:([^;,]+)/) || [])[1] || 'image/png';
  return createImageBitmap(new Blob([bytes], { type: type }));
}
`;

function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function dataUri(mime: string, bytes: Uint8Array): string {
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

function mimeFor(path: string): string {
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.mp4')) return 'video/mp4';
  if (path.endsWith('.woff2')) return 'font/woff2';
  throw new Error(`No media type for ${path}`);
}

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    return '&quot;';
  });
}

function jsString(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes);
}

/** Drop anchors so the stage cannot navigate. The card credit stays plain text. */
function dropLinks(html: string): string {
  return html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '<span>$1</span>');
}

function clipMaxWidth(aspect: string): number {
  const [w, h] = aspect.split('/').map((part) => Number(part.trim()));
  if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return 672;
  return Math.round((420 * w) / h);
}

function face(family: string, weight: string, src: string): string {
  return `@font-face {
  font-family: ${family};
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: ${src};
  unicode-range: ${LATIN_RANGE};
}`;
}

async function interFaces(read: ByteReader): Promise<string> {
  const [license, w400, w500, w600] = await Promise.all([
    read('/fonts/OFL.txt').then(decodeUtf8),
    read('/fonts/inter-latin-400.woff2').then((bytes) => dataUri('font/woff2', bytes)),
    read('/fonts/inter-latin-500.woff2').then((bytes) => dataUri('font/woff2', bytes)),
    read('/fonts/inter-latin-600.woff2').then((bytes) => dataUri('font/woff2', bytes)),
  ]);
  const comment = `/*\n${license.trim().replace(/\*\//g, '* /')}\n*/`;
  // Each weight's bytes appear once. The named aliases point at that same value.
  const root = `:root {
  --inter-400: url("${w400}");
  --inter-500: url("${w500}");
  --inter-600: url("${w600}");
}`;
  const faces = [
    face('Inter', '400', 'var(--inter-400)'),
    face('Inter', '500', 'var(--inter-500)'),
    face('Inter', '600', 'var(--inter-600)'),
    face('Inter_400Regular', '100 900', 'var(--inter-400)'),
    face('Inter_500Medium', '100 900', 'var(--inter-500)'),
  ];
  return `${comment}
${root}
${faces.join('\n')}`;
}

/** The dock credit keeps the handle. The raw URL stays out of the stage. */
function presentCredit(id: string, html: string): string {
  if (id !== 'arc-charge') return html;
  return html.replace(/<p class="credit">[\s\S]*?<\/p>/, '<p class="credit">Design by Sean Galt (@seanaiux)</p>');
}

function cached(read: ByteReader): ByteReader {
  const cache = new Map<string, Promise<Uint8Array>>();
  return (path) => {
    let pending = cache.get(path);
    if (!pending) {
      pending = read(path);
      cache.set(path, pending);
    }
    return pending;
  };
}

async function inlinePaths(source: string, read: ByteReader): Promise<string> {
  const quoted = [...source.matchAll(/(['"])(\/(?:media|img-fx)\/[^'"]+)\1/g)].map((match) => match[2] ?? '');
  const bare = [...source.matchAll(/url\(\s*(\/(?:media|img-fx)\/[^)]+)\)/g)].map((match) => match[1] ?? '');
  let next = source;
  const seen = new Set<string>();
  for (const path of [...quoted, ...bare]) {
    if (!path || seen.has(path) || path.endsWith('.js')) continue;
    seen.add(path);
    const uri = dataUri(mimeFor(path), await read(path));
    next = next.split(`"${path}"`).join(`"${uri}"`).split(`'${path}'`).join(`'${uri}'`);
    next = next.split(`url(${path})`).join(`url("${uri}")`);
  }
  return next;
}

async function inlineScript(script: string, read: ByteReader): Promise<string> {
  let next = script;
  const parity = PARITY_LOADER.exec(next);
  if (parity) {
    const file = decodeUtf8(await read(parity[1] ?? ''));
    next = next.replace(PARITY_LOADER, () => file);
  }
  if (next.includes(LOADER_URLS)) {
    if (!next.includes(LOADER_FETCH)) throw new Error('image-generation-loader photo fetch drifted');
    const photos = await Promise.all([1, 2, 3].map(async (n) => dataUri('image/png', await read(`/img-fx/${n}.png`))));
    const list = photos.map((uri) => JSON.stringify(uri)).join(', ');
    next = `${BITMAP_HELPER}${next.replace(LOADER_URLS, `var urls = [${list}];`).replace(LOADER_FETCH, 'return bitmapFromDataUri(src);')}`;
  }
  return next;
}

/** Bytes the card's Copy code button writes. A full document when that is the copy. */
export async function showcaseCode(id: string): Promise<string> {
  return fullCopyDocument(id) ?? codeSlot(id, 'html');
}

/** Bytes the card's Copy prompt button writes. */
export function showcaseIds(): string[] {
  return TRANSITIONS.map((item) => item.id).filter((id) => !showcaseLater(id));
}

export async function showcasePrompt(id: string, read: ByteReader): Promise<string> {
  const path = LAZY_PROMPT[id];
  if (path) return decodeUtf8(await read(path));
  return promptFor(id);
}

function walkthrough(media: CatalogMedia, video: string, poster: string): string {
  const width = clipMaxWidth(media.aspect);
  return `<figure class="clip" style="width:min(100%, ${width}px);aspect-ratio:${esc(media.aspect)}">
  <video src="${video}" poster="${poster}" muted loop autoplay playsinline></video>
  <img src="${poster}" alt="${esc(media.alt)}">
</figure>`;
}

/**
 * One self-contained HTML file of this card's showcase.
 * Built on press. Yogesh's two orb cards are refused here.
 */
export async function generateShowcase(id: string, read: ByteReader): Promise<string> {
  if (showcaseLater(id)) throw new Error(`${id} showcase is a later pull request`);
  const item = TRANSITIONS.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown asset ${id}`);
  const load = cached(read);
  const parts = previewDocumentParts(id);
  const [faces, code, prompt, script, htmlInlined, cssInlined] = await Promise.all([
    interFaces(load),
    showcaseCode(id),
    showcasePrompt(id, load),
    inlineScript(parts.script, load),
    inlinePaths(presentCredit(id, dropLinks(parts.html)), load),
    inlinePaths(parts.css, load),
  ]);
  const stageFit =
    id === 'arc-charge'
      ? `html, body { height: 100%; min-height: 100%; }
#arc-charge .readout { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }`
      : `html, body { height: auto; min-height: 0; }`;
  const loaderGrey =
    id === 'image-generation-loader'
      ? `#reveal, button.trigger { background: rgba(243, 243, 243, 0.94); border-color: rgba(0, 0, 0, 0.08); color: #17181c; }`
      : '';
  const css = `${faces}\n${cssInlined.replace(/@font-face\s*\{[^}]*data:font\/woff2;base64,\u2026[^}]*\}/g, '')}\n${stageFit}\n${loaderGrey}`;
  const stageScript = `${script}
window.addEventListener('load', function () {
  var send = function () {
    var h = Math.ceil(Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0));
    parent.postMessage({ showcaseStage: h }, '*');
  };
  send();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(send);
  var video = document.querySelector('video');
  if (video) video.addEventListener('loadedmetadata', send);
});`;
  const stage = composePreviewDocument(item.title, htmlInlined, css, stageScript);
  const facet = facetLine(id) ?? '';
  const credit = creditFor(id);
  const creditLine = credit ? `<p class="credit">${esc(credit.label)} ${esc(credit.url)}</p>` : '';
  const control = previewControl(id);
  const replay =
    control && id !== 'adam-sidebar-transitions'
      ? `<button type="button" class="reset" id="stage-reset">${control === 'reset' ? 'Reset' : 'Replay'}</button>`
      : '';
  let clip = '';
  if (item.media && !mediaFillsStage(item)) {
    const video = dataUri('video/mp4', await load(item.media.mp4));
    const poster = dataUri('image/jpeg', await load(item.media.poster));
    clip = walkthrough(item.media, video, poster);
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(item.title)}</title>
<link rel="icon" href="data:,">
<style>
${faces}
html, body { margin: 0; background: #fdfdfd; }
body { min-height: 100vh; }
/* Laid out for a 1280px viewport. The column matches the store detail width. */
.page { width: 1040px; max-width: calc(100% - 48px); margin: 40px auto 80px; }
.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 24px;
}
h1 {
  margin: 0;
  font: 600 32px/38px ${SANS};
  letter-spacing: -0.4px;
  color: #0d0d0d;
}
.facet { margin: 6px 0 0; font: 400 13px/18px ${SANS}; color: #767676; }
.credit { margin: 8px 0 0; font: 400 13px/18px ${SANS}; color: #6c6c6c; }
.stage-wrap {
  position: relative;
  margin-top: 20px;
  background: #f9f9f9;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 14px;
  overflow: hidden;
}
.stage { width: 100%; border: 0; display: block; background: #f9f9f9; }
.reset {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  box-sizing: border-box;
  width: 88px;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.94);
  color: #0d0d0d;
  font: 500 13px/1 ${SANS};
  cursor: pointer;
}
.reset:disabled { opacity: 0.45; cursor: auto; }
.reset:hover:not(:disabled) { background: #f1f1f1; border-color: rgba(0, 0, 0, 0.12); }
.actions { display: flex; gap: 8px; width: 248px; margin-top: 16px; }
.btn {
  box-sizing: border-box;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.94);
  color: #0d0d0d;
  font: 500 12px/1 ${SANS};
  cursor: pointer;
  flex: 0 0 auto;
}
.btn-code { width: 112px; }
.btn-prompt { width: 128px; }
.btn:hover { background: #d9d9e2; border-color: rgba(0, 0, 0, 0.35); }
.btn:active { background: #b7b7c2; border-color: rgba(0, 0, 0, 0.5); }
.btn.is-on { background: #0d0d0d; border-color: #0d0d0d; color: #ffffff; }
.btn.is-on:hover { background: #4a4a4a; border-color: #bdbdbd; }
.btn.is-on:active { background: #000000; border-color: #ffffff; }
.btn:focus { outline: none; }
.btn:focus-visible { box-shadow: 0 0 0 2px #fdfdfd, 0 0 0 4px #0d0d0d; }
.clip {
  position: relative;
  max-height: 420px;
  margin: 16px auto 0;
  border-radius: 14px;
  overflow: hidden;
  background: #f9f9f9;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}
.clip video, .clip img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.clip img { display: none; }
@media (prefers-reduced-motion: reduce) {
  .clip video { display: none; }
  .clip img { display: block; }
}
</style>
</head>
<body>
<main class="page">
  <article class="card" data-showcase="${esc(id)}">
    <h1>${esc(item.title)}</h1>
    <p class="facet">${esc(facet)}</p>
    ${creditLine}
    <div class="stage-wrap">
      <iframe class="stage" id="stage" title="${esc(item.title)}" data-stage="${esc(id)}" sandbox="allow-scripts"></iframe>
      ${replay}
    </div>
    ${clip}
    <div class="actions">
      <button type="button" class="btn btn-code" id="copy-code" data-copy="code">Copy code</button>
      <button type="button" class="btn btn-prompt" id="copy-prompt" data-copy="prompt">Copy prompt</button>
    </div>
  </article>
</main>
<script>
var STAGE = ${jsString(stage)};
var CODE = ${jsString(code)};
var PROMPT = ${jsString(prompt)};
var frame = document.getElementById('stage');
var stageId = frame.getAttribute('data-stage');
function sizeArc() {
  var w = frame.getBoundingClientRect().width || frame.clientWidth || 992;
  frame.style.height = Math.round(w * 9 / 16) + 'px';
}
if (stageId === 'arc-charge') sizeArc();
window.addEventListener('resize', function () {
  if (stageId === 'arc-charge') sizeArc();
});
window.addEventListener('message', function (event) {
  var data = event.data;
  if (!data || typeof data.showcaseStage !== 'number') return;
  if (stageId === 'arc-charge') return;
  if (event.source !== frame.contentWindow) return;
  frame.style.height = Math.max(1, data.showcaseStage) + 'px';
});
frame.srcdoc = STAGE;
var reset = document.getElementById('stage-reset');
if (reset) reset.addEventListener('click', function () { frame.srcdoc = STAGE; });
function fallbackCopy(text) {
  var previous = document.activeElement;
  var field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.top = '0';
  field.style.left = '0';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.focus();
  field.select();
  try {
    document.execCommand('copy');
  } catch (error) {
    /* writeText already failed */
  } finally {
    field.remove();
    if (previous && previous.focus) previous.focus();
  }
}
function writeExact(text) {
  var pending = null;
  var policy = navigator.permissionsPolicy || document.permissionsPolicy || document.featurePolicy;
  var allowed = !policy || !policy.allowsFeature || policy.allowsFeature('clipboard-write');
  try {
    if (allowed && navigator.clipboard && navigator.clipboard.writeText) pending = navigator.clipboard.writeText(text);
  } catch (error) {
    pending = null;
  }
  if (!pending) {
    fallbackCopy(text);
    return Promise.resolve(false);
  }
  return pending.then(function () { return true; }, function () {
    fallbackCopy(text);
    return false;
  });
}
function arm(button, resting) {
  button.addEventListener('click', function () {
    var text = button.getAttribute('data-copy') === 'prompt' ? PROMPT : CODE;
    writeExact(text);
    button.classList.add('is-on');
    button.textContent = 'Copied';
    window.clearTimeout(button._timer);
    button._timer = window.setTimeout(function () {
      button.classList.remove('is-on');
      button.textContent = resting;
    }, 1400);
  });
}
arm(document.getElementById('copy-code'), 'Copy code');
arm(document.getElementById('copy-prompt'), 'Copy prompt');
</script>
</body>
</html>
`;
}
