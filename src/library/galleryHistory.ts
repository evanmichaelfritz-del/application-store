/**
 * Browser Back restores the gallery entry, then Expo Router resets to a saved
 * snapshot and issues a second history.go. Marking the restored URL so it no
 * longer matches that snapshot makes Expo read the URL instead, which keeps
 * the gallery and its query string.
 */
export function installGalleryBackFix(): () => void {
  if (typeof window === 'undefined') return () => {};
  const original = window.history.go.bind(window.history);
  let internal = 0;
  const go = (delta?: number) => {
    internal += 1;
    original(delta);
  };
  window.history.go = go;
  const onPop = () => {
    if (internal > 0) {
      internal -= 1;
      return;
    }
    const { pathname, search } = window.location;
    const gallery = pathname === '/' || pathname.startsWith('/c/');
    // A param Expo strips when it rebuilds the URL, so the snapshot misses
    // and the visible address does not keep the marker.
    const marker = '__internal_expo_router_no_animation=1';
    if (!gallery || search.includes(marker)) return;
    const marked = search ? `${pathname}${search}&${marker}` : `${pathname}?${marker}`;
    window.history.replaceState(window.history.state, '', marked);
  };
  window.addEventListener('popstate', onPop, true);
  return () => {
    window.removeEventListener('popstate', onPop, true);
    window.history.go = original;
  };
}
