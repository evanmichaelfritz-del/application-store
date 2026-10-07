import { useEffect } from "react";
import { Platform, type TextStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useTheme, fonts } from "../theme/theme";

let injected = false;
function injectKeyframes() {
  if (injected || Platform.OS !== "web" || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`;
  document.head.appendChild(style);
}

export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  useEffect(() => {
    injectKeyframes();
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [text, opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sweep = !reduced;
  return (
    <Animated.View style={anim}>
      <span
        style={{
          fontFamily: typeof style?.fontFamily === "string" ? style.fontFamily : fonts.regular,
          fontSize: typeof style?.fontSize === "number" ? style.fontSize : 14,
          fontStyle: style?.fontStyle,
          lineHeight: typeof style?.lineHeight === "number" ? `${style.lineHeight}px` : "1.65",
          display: "inline-block",
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
    </Animated.View>
  );
}
