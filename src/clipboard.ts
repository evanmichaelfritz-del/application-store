import * as Clipboard from 'expo-clipboard';

/** Select the text and copy it. Works inside a modal focus trap and on file://. */
function execCommandCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
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
  }
  host.removeChild(field);
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
 * Try clipboard.writeText first, then always select a textarea and execCommand.
 * Resolves when either write lands. Rejects when both fail.
 */
export function copyTextExact(text: string): Promise<boolean> {
  const pending = startWriteText(text);
  const commandOk = execCommandCopy(text);
  if (!pending) return Promise.resolve(commandOk);
  return pending.then(
    () => true,
    () => commandOk,
  );
}

export function writeClipboard(text: string) {
  startWriteText(text)?.catch(() => undefined);
  execCommandCopy(text);
  void Clipboard.setStringAsync(text).catch(() => undefined);
}

/**
 * Write text while the click gesture is still active.
 * Safari drops user activation if the fetch is awaited before writeText, so the
 * ClipboardItem value is the pending text itself. Returns null when this
 * browser has no ClipboardItem write, and the caller falls back to writeText.
 * The textarea fallback still runs once the text resolves.
 */
export function writeClipboardFromGesture(pending: Promise<string>): Promise<void> | null {
  if (typeof navigator === 'undefined' || typeof ClipboardItem === 'undefined') return null;
  const clipboard = navigator.clipboard;
  if (!clipboard?.write) return null;
  try {
    const item = new ClipboardItem({
      'text/plain': pending.then((text) => new Blob([text], { type: 'text/plain' })),
    });
    const written = clipboard.write([item]);
    return pending.then((text) => {
      const commandOk = execCommandCopy(text);
      return written.then(
        () => undefined,
        () => {
          if (!commandOk) throw new Error('copy failed');
        },
      );
    });
  } catch {
    return null;
  }
}

/** Resolve after the clipboard write. Reject so the caller can clear a false Copied state. */
export function writeClipboardAwait(text: string): Promise<void> {
  const pending = startWriteText(text);
  const commandOk = execCommandCopy(text);
  if (pending) {
    return pending.then(
      () => undefined,
      () => (commandOk ? undefined : Clipboard.setStringAsync(text).then(() => undefined)),
    );
  }
  if (commandOk) return Promise.resolve();
  return Clipboard.setStringAsync(text).then(() => undefined);
}

/** Copy during the press, including from inside a modal focus trap. */
export function writeClipboardNow(text: string) {
  startWriteText(text)?.catch(() => undefined);
  execCommandCopy(text);
}
