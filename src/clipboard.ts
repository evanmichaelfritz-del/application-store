import * as Clipboard from 'expo-clipboard';

/** Select the text and copy it. Restores focus so the press does not leave the page on the field. */
function execCommandCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const previous = document.activeElement;
  const host = document.querySelector('[aria-modal="true"]') ?? document.body;
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.top = '0';
  field.style.left = '0';
  field.style.opacity = '0';
  host.appendChild(field);
  field.focus();
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    host.removeChild(field);
    if (previous instanceof HTMLElement) previous.focus();
  }
  return ok;
}

function startWriteText(text: string): Promise<void> | null {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (nav?.writeText) return nav.writeText(text);
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Try clipboard.writeText first. The textarea fallback runs only when that write
 * is missing or rejects, so a successful write is not copied a second time.
 */
export function copyTextExact(text: string): Promise<boolean> {
  const pending = startWriteText(text);
  if (!pending) return Promise.resolve(execCommandCopy(text));
  return pending.then(
    () => true,
    () => execCommandCopy(text),
  );
}

export function writeClipboard(text: string) {
  const pending = startWriteText(text);
  if (!pending) {
    if (!execCommandCopy(text)) void Clipboard.setStringAsync(text).catch(() => undefined);
    return;
  }
  void pending.then(
    () => undefined,
    () => {
      if (!execCommandCopy(text)) void Clipboard.setStringAsync(text).catch(() => undefined);
    },
  );
}

/**
 * Write text while the click gesture is still active.
 * Safari drops user activation if the fetch is awaited before writeText, so the
 * ClipboardItem value is the pending text itself. Returns null when this
 * browser has no ClipboardItem write, and the caller falls back to writeText.
 * The textarea fallback runs only when that ClipboardItem write rejects.
 */
export function writeClipboardFromGesture(pending: Promise<string>): Promise<void> | null {
  if (typeof navigator === 'undefined' || typeof ClipboardItem === 'undefined') return null;
  const clipboard = navigator.clipboard;
  if (!clipboard?.write) return null;
  try {
    const item = new ClipboardItem({
      'text/plain': pending.then((text) => new Blob([text], { type: 'text/plain' })),
    });
    // A rejected write is already outside the gesture, so execCommand cannot run here.
    return clipboard.write([item]);
  } catch {
    return null;
  }
}

/** Resolve after the clipboard write. Reject so the caller can clear a false Copied state. */
export function writeClipboardAwait(text: string): Promise<void> {
  const pending = startWriteText(text);
  if (!pending) {
    if (execCommandCopy(text)) return Promise.resolve();
    return Clipboard.setStringAsync(text).then(() => undefined);
  }
  return pending.then(
    () => undefined,
    () => {
      if (execCommandCopy(text)) return undefined;
      return Clipboard.setStringAsync(text).then(() => undefined);
    },
  );
}

/** Copy during the press, including from inside a modal focus trap. */
export function writeClipboardNow(text: string) {
  const pending = startWriteText(text);
  if (!pending) {
    execCommandCopy(text);
    return;
  }
  void pending.catch(() => {
    execCommandCopy(text);
  });
}
