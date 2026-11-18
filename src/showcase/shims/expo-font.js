/** Faces are inlined in the showcase document. Loading a font file would hit the network. */
export function useFonts() {
  return [true, null];
}

export function loadAsync() {
  return Promise.resolve();
}

export function isLoaded() {
  return true;
}

export function isLoading() {
  return false;
}
