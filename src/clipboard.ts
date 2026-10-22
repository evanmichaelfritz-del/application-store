import * as Clipboard from 'expo-clipboard';

export function writeClipboard(text: string) {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (nav?.writeText) void nav.writeText(text).catch(() => undefined);
  } catch {
    /* ignore */
  }
  void Clipboard.setStringAsync(text).catch(() => undefined);
}

/**
 * Write text while the click gesture is still active.
 * Safari drops user activation if the fetch is awaited before writeText, so the
 * ClipboardItem value is the pending text itself. Returns null when this
 * browser has no ClipboardItem write, and the caller falls back to writeText.
 */
export function writeClipboardFromGesture(pending: Promise<string>): Promise<void> | null {
  if (typeof navigator === 'undefined' || typeof ClipboardItem === 'undefined') return null;
  const clipboard = navigator.clipboard;
  if (!clipboard?.write) return null;
  try {
    const item = new ClipboardItem({
      'text/plain': pending.then((text) => new Blob([text], { type: 'text/plain' })),
    });
    return clipboard.write([item]);
  } catch {
    return null;
  }
}

/** Resolve after the clipboard write. Reject so the caller can clear a false Copied state. */
export function writeClipboardAwait(text: string): Promise<void> {
  const nav = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (nav?.writeText) return nav.writeText(text);
  return Clipboard.setStringAsync(text).then(() => undefined);
}

/** Copy during the press, including from inside a modal focus trap. */
export function writeClipboardNow(text: string) {
  if (typeof document !== 'undefined') {
    const host = document.querySelector('[aria-modal="true"]') ?? document.body;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.left = '-9999px';
    host.appendChild(field);
    field.focus();
    field.select();
    try {
      document.execCommand('copy');
    } catch {
      /* ignore */
    }
    host.removeChild(field);
  }
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (nav?.writeText) void nav.writeText(text).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
