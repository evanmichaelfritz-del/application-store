import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { ThinkingOrb } from "../orbs/ThinkingOrb";
import { AGENT_PROMPT, HEADER_SUBTITLE, HEADER_TITLE } from "../content/copy";
import { colors, font } from "../theme";

export type DemoTab = "preview" | "install";

export function Header({
  tab,
  onTab,
  active,
  compact = false,
}: {
  tab: DemoTab;
  onTab: (tab: DemoTab) => void;
  active: boolean;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    void Clipboard.setStringAsync(AGENT_PROMPT).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.titles, compact && styles.titlesCompact]}>
        <View style={[styles.tile, compact && styles.tileCompact]} accessibilityElementsHidden>
          <ThinkingOrb state="working" size={20} active={active} />
        </View>
        <Text style={[styles.title, compact && styles.titleCompact]}>{HEADER_TITLE}</Text>
        {compact ? null : <Text style={styles.sub}>{HEADER_SUBTITLE}</Text>}
      </View>
      <View style={styles.row}>
        <View style={styles.tabs} accessibilityRole="tablist">
          <TabButton label="Preview" selected={tab === "preview"} onPress={() => onTab("preview")} />
          <TabButton
            label="Install & Usage"
            selected={tab === "install"}
            onPress={() => onTab("install")}
          />
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" style={styles.studio}>
            <Text style={styles.studioText}>Tune in Studio</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy agent prompt"
            onPress={copyPrompt}
            style={styles.prompt}
          >
            <Text style={styles.promptText}>{copied ? "Copied" : "Copy prompt"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function TabButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tab, selected && styles.tabOn]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 21 },
  wrapCompact: { gap: 8 },
  titles: { gap: 12 },
  titlesCompact: { flexDirection: "row", alignItems: "center", gap: 8 },
  tileCompact: { width: 32, height: 32, borderRadius: 8 },
  titleCompact: { fontSize: 16, lineHeight: 20, flex: 1 },
  tile: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.tile,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: font,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "500",
    letterSpacing: -0.18,
    color: colors.text,
  },
  sub: {
    fontFamily: font,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    padding: 3,
    borderRadius: 48,
  },
  tab: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabText: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
  },
  tabTextOn: { color: colors.text },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  studio: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 50,
    backgroundColor: colors.studio,
    alignItems: "center",
    justifyContent: "center",
  },
  studioText: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    color: colors.studioText,
  },
  prompt: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 36,
    backgroundColor: colors.prompt,
    alignItems: "center",
    justifyContent: "center",
  },
  promptText: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
  },
});
