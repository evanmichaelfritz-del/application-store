const TOAST_ID = 'transitions-copy-toast';

const PILL: Record<string, string> = {
  position: 'fixed',
  left: '50%',
  bottom: '36px',
  transform: 'translateX(-50%) scale(1)',
  zIndex: '2147483647',
  opacity: '1',
  background: '#0d0d0d',
  color: '#ffffff',
  minWidth: '96px',
  height: '42px',
  padding: '0 18px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, sans-serif',
  fontSize: '13px',
  fontWeight: '500',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  pointerEvents: 'none',
};

/** Vanilla body mount — does not depend on React portals. */
export function paintCopiedToast() {
  if (typeof document === 'undefined') return;
  let node = document.getElementById(TOAST_ID);
  if (!node) {
    node = document.createElement('div');
    node.id = TOAST_ID;
    node.setAttribute('data-testid', 'copy-toast');
    node.setAttribute('role', 'alert');
    node.setAttribute('aria-live', 'polite');
    node.textContent = 'Copied';
    document.body.appendChild(node);
  }
  Object.assign(node.style, PILL);
}

export function hideCopiedToast() {
  if (typeof document === 'undefined') return;
  document.getElementById(TOAST_ID)?.remove();
}
