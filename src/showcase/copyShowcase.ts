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

/** The anchor exists before the handler returns, so the over-limit path is chosen inside the gesture. */
function startDownload(id: string, pending: Promise<string>): Promise<void> {
  const link = document.createElement('a');
  link.download = `${id}-showcase.html`;
  document.body.appendChild(link);
  return pending.then((html) => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    link.href = url;
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
}

/**
 * Build the showcase on press. The import starts during the gesture. The
 * clipboard-or-download choice is made before the handler returns.
 */
export function pressCopyShowcase(id: string): Promise<ShowcaseResult> {
  const pending = showcaseHtml(id);
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  const canWriteItem = typeof ClipboardItem !== 'undefined' && !!clipboard?.write;
  if (SHOWCASE_OVER_LIMIT.has(id)) {
    return startDownload(id, pending).then(() => 'saved');
  }
  if (!canWriteItem) {
    return pending.then(async (html) => {
      const copied = await copyTextExact(html);
      if (!copied) {
        downloadShowcase(id, html);
        return 'saved';
      }
      return 'copied';
    });
  }
  const gestured = writeClipboardFromGesture(pending);
  if (!gestured) {
    return pending.then((html) => {
      downloadShowcase(id, html);
      return 'saved';
    });
  }
  return gestured.then(
    () => 'copied',
    () =>
      pending.then((html) => {
        downloadShowcase(id, html);
        return 'saved';
      }),
  );
}
