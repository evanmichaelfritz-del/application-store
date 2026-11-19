/** Copy on the tuner writes the snippet. No Expo native module. */
function clipboardWriteAllowed() {
  const policy = navigator.permissionsPolicy || document.permissionsPolicy || document.featurePolicy;
  if (policy && policy.allowsFeature && !policy.allowsFeature('clipboard-write')) return false;
  return true;
}

export async function setStringAsync(text) {
  const value = String(text);
  // A sandboxed frame logs a permissions-policy error as soon as writeText is called.
  if (clipboardWriteAllowed()) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      /* fall through */
    }
  }
  const previous = document.activeElement;
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.top = '0';
  field.style.left = '0';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.focus();
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  field.remove();
  if (previous && previous.focus) previous.focus();
  return ok;
}

export function getStringAsync() {
  return Promise.resolve('');
}
