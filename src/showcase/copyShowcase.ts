import { copyTextExact, writeClipboardFromGesture } from '@/src/clipboard';
import { SHOWCASE_OVER_LIMIT } from '@/src/showcase/limits';

export type ShowcaseResult = 'copied' | 'saved';

function browserRead(path: string): Promise<Uint8Array> {
  return fetch(path).then(async (res) => {
    if (!res.ok) throw new Error(`Missing ${path}`);
    return new Uint8Array(await res.arrayBuffer());
  });
}

function downloadShowcase(id: string, html: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${id}-showcase.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function showcaseHtml(id: string): Promise<string> {
  return import('./generate').then(({ generateShowcase }) => generateShowcase(id, browserRead));
}

/**
 * Build the showcase on press. The import starts during the gesture and, for
 * files that fit, its promise is handed to the clipboard before any await.
 */
export function pressCopyShowcase(id: string): Promise<ShowcaseResult> {
  const pending = showcaseHtml(id);
  if (SHOWCASE_OVER_LIMIT.has(id)) {
    return pending.then((html) => {
      downloadShowcase(id, html);
      return 'saved';
    });
  }
  const gestured = writeClipboardFromGesture(pending);
  if (gestured) {
    return gestured.then(
      () => 'copied',
      () =>
        pending.then((html) => {
          downloadShowcase(id, html);
          return 'saved';
        }),
    );
  }
  return pending.then(async (html) => {
    const copied = await copyTextExact(html);
    if (!copied) {
      downloadShowcase(id, html);
      return 'saved';
    }
    return 'copied';
  });
}
