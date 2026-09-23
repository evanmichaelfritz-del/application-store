import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CodeBlock } from "./CodeBlock";
import {
  INSTALL_NATIVE_INSTALL,
  INSTALL_NATIVE_NOTE,
  INSTALL_NATIVE_USAGE,
  INSTALL_REACT_INSTALL,
  INSTALL_REACT_USAGE,
  INSTALL_SWIFT_INSTALL,
  INSTALL_SWIFT_USAGE,
} from "../content/copy";
import { colors, font } from "../theme";

const TABS = ["React", "React Native", "Swift UI"] as const;
type InstallTab = (typeof TABS)[number];

export function InstallUsage() {
  const [tab, setTab] = useState<InstallTab>("React");

  return (
    <View style={styles.panel}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((name) => {
          const selected = tab === name;
          return (
            <Pressable
              key={name}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setTab(name)}
              style={[styles.tab, selected && styles.tabOn]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextOn]}>{name}</Text>
            </Pressable>
          );
        })}
      </View>
      {tab === "React" ? (
        <PlatformBlocks install={INSTALL_REACT_INSTALL} usage={INSTALL_REACT_USAGE} />
      ) : null}
      {tab === "React Native" ? (
        <PlatformBlocks
          install={INSTALL_NATIVE_INSTALL}
          usage={INSTALL_NATIVE_USAGE}
          note={INSTALL_NATIVE_NOTE}
        />
      ) : null}
      {tab === "Swift UI" ? (
        <PlatformBlocks install={INSTALL_SWIFT_INSTALL} usage={INSTALL_SWIFT_USAGE} />
      ) : null}
    </View>
  );
}

function PlatformBlocks({
  install,
  usage,
  note,
}: {
  install: string;
  usage: string;
  note?: string;
}) {
  return (
    <View style={styles.groups}>
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Installation</Text>
        <CodeBlock code={install} label="Copy install command" />
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Usage</Text>
        <CodeBlock code={usage} label="Copy usage example" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 25,
  },
  tabs: { flexDirection: "row", alignItems: "center", gap: 3 },
  tab: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: { backgroundColor: "rgba(255,255,255,0.12)" },
  tabText: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
  },
  tabTextOn: { color: colors.text },
  groups: { gap: 17 },
  group: { gap: 10 },
  groupTitle: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 14,
    color: colors.text,
  },
  note: {
    fontFamily: font,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
    color: colors.muted,
  },
});
