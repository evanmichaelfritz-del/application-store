import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { colors, font, mono } from "../theme";

export function CodeBlock({ code, label = "Copy" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    void Clipboard.setStringAsync(code).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <View style={styles.block}>
      <Text selectable style={styles.code}>
        {code}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onCopy}
        style={styles.copy}
      >
        <Text style={styles.copyText}>{copied ? "Copied" : "Copy"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.code,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 84,
    position: "relative",
  },
  code: {
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 20,
    color: colors.largeLabel,
  },
  copy: {
    position: "absolute",
    top: 10,
    right: 10,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  copyText: {
    fontFamily: font,
    fontSize: 12,
    fontWeight: "500",
    color: colors.text,
  },
});
