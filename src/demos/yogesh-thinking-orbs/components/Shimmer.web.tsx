import { useEffect } from "react";
import { Platform, type TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useTheme, fonts } from "../theme/theme";

let injected = false;
function injectKeyframes() {
  if (injected || Platform.OS !== "web" || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`;
  document.head.appendChild(style);
}

/** Status label. Full opacity on the first frame. Remount (key by look index) restarts the sweep. */
export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    injectKeyframes();
  }, []);
  const sweep = !reduced;
  return (
    <span
      style={{
        fontFamily: typeof style?.fontFamily === "string" ? style.fontFamily : fonts.regular,
        fontSize: typeof style?.fontSize === "number" ? style.fontSize : 14,
        fontStyle: style?.fontStyle,
        lineHeight: typeof style?.lineHeight === "number" ? `${style.lineHeight}px` : "20px",
        display: "inline-block",
        opacity: 1,
        backgroundImage: sweep
          ? `linear-gradient(90deg, ${colors.muted} 35%, ${colors.fg} 50%, ${colors.muted} 65%)`
          : undefined,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: sweep ? "transparent" : colors.muted,
        animation: sweep ? "orb-shimmer 2s linear infinite" : undefined,
      }}
    >
      {text}
    </span>
  );
}
