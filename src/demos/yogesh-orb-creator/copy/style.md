/* FILE src/theme/theme.tsx */
import { usePathname } from "expo-router";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";

export type Mode = "dark" | "light";

export type Palette = {
  page: string;
  fg: string;
  muted: string;
  card: string;
  well: string;
  row: string;
  slider: string;
  pop: string;
  orb: string;
  fill: string;
  bubble: string;
  ring: string;
  ringSoft: string;
  shadow: string;
  green: string;
  red: string;
  codeBg: string;
  pink: string;
};

const dark: Palette = {
  page: "#000000",
  fg: "#fafafa",
  muted: "#a1a1a1",
  card: "#0a0a0a",
  well: "#1a1a1a",
  row: "#141414",
  slider: "#3e3e3e",
  pop: "#212121",
  orb: "#ffffff",
  fill: "#181818",
  bubble: "#1c1c1c",
  ring: "rgba(250,250,250,0.3)",
  ringSoft: "rgba(250,250,250,0.12)",
  shadow: "transparent",
  green: "#09bb83",
  red: "#ff6467",
  codeBg: "#181818",
  pink: "#f6339a",
};

const light: Palette = {
  page: "#f9f9fa",
  fg: "#0a0a0a",
  muted: "#737373",
  card: "#ffffff",
  well: "#e6e6e6",
  row: "#efeff0",
  slider: "#d7d7d8",
  pop: "#ffffff",
  orb: "#171717",
  fill: "#efeff0",
  bubble: "#ececee",
  ring: "rgba(23,23,23,0.3)",
  ringSoft: "rgba(23,23,23,0.12)",
  shadow: "rgba(0,0,0,0.06)",
  green: "#09bb83",
  red: "#ff6467",
  codeBg: "#ffffff",
  pink: "#f6339a",
};

export function withAlpha(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const webSans = 'Geist, "Geist Fallback", system-ui, sans-serif';
const webMono = '"Geist Mono", "Geist Mono Fallback"';

export const fonts =
  Platform.OS === "web"
    ? {
        regular: webSans,
        medium: webSans,
        semibold: webSans,
        italic: webSans,
        mono: webMono,
      }
    : {
        regular: "Geist_400Regular",
        medium: "Geist_500Medium",
        semibold: "Geist_600SemiBold",
        italic: "Geist_400Regular_Italic",
        mono: "GeistMono_400Regular",
      };

export function mediumWeight(): { fontWeight: "500" } | Record<string, never> {
  if (Platform.OS === "web") return { fontWeight: "500" };
  return {};
}

type ThemeValue = {
  mode: Mode;
  colors: Palette;
  toggle: () => void;
  playgroundColor: string;
  setPlaygroundColor: (v: string) => void;
};

const Ctx = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [mode, setMode] = useState<Mode>("dark");
  const [playgroundColor, setPlaygroundColor] = useState(dark.orb);
  const [route, setRoute] = useState(path);
  if (path !== route) {
    setRoute(path);
    setMode("dark");
    setPlaygroundColor((current) => {
      const c = current.toLowerCase();
      if (c === dark.orb.toLowerCase() || c === light.orb.toLowerCase()) return dark.orb;
      return current;
    });
  }
  const value = useMemo<ThemeValue>(
    () => ({
      mode,
      colors: mode === "dark" ? dark : light,
      toggle: () => {
        const prevDefault = mode === "dark" ? dark.orb : light.orb;
        const nextDefault = mode === "dark" ? light.orb : dark.orb;
        setPlaygroundColor((current) => (current.toLowerCase() === prevDefault.toLowerCase() ? nextDefault : current));
        setMode(mode === "dark" ? "light" : "dark");
      },
      playgroundColor,
      setPlaygroundColor,
    }),
    [mode, playgroundColor],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("theme");
  return v;
}

export const syntax = {
  comment: "#a1a1a1",
  string: "#4ab074",
  keyword: "#a17adf",
  tag: "#359bd9",
  attr: "#d8944d",
};

