/** Standalone showcase has no router. The live card is the focused screen. */
export function useIsFocused() {
  return true;
}

export function usePathname() {
  return '/';
}

export function useRouter() {
  return {
    push() {},
    replace() {},
    back() {},
    setParams() {},
  };
}

export function useSegments() {
  return [];
}

export function useLocalSearchParams() {
  return {};
}

export function useGlobalSearchParams() {
  return {};
}

export function Link({ children }) {
  return children ?? null;
}

export function Stack() {
  return null;
}

export function Redirect() {
  return null;
}

export default function ExpoRouter() {
  return null;
}
