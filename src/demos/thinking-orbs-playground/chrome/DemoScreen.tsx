import { useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { Header, type DemoTab } from "./Header";
import { InstallUsage } from "./InstallUsage";
import { MarketingStrip } from "./MarketingStrip";
import { Playground } from "./Playground";
import { PreviewGrid } from "./PreviewGrid";
import { colors } from "../theme";

export function DemoScreen({
  compact = false,
  style,
}: {
  /** Store stage is 220px — hug cards and scroll instead of the full-page padding. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [tab, setTab] = useState<DemoTab>("preview");
  const [layoutWidth, setLayoutWidth] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const width = layoutWidth || (compact ? 360 : windowWidth);
  const previewOn = tab === "preview";
  const showStrip = !compact && width >= 1280;

  return (
    <ScrollView
      style={[styles.screen, compact && styles.screenCompact, style]}
      contentContainerStyle={[styles.content, compact && styles.contentCompact]}
      onLayout={(event) => setLayoutWidth(event.nativeEvent.layout.width)}
      nestedScrollEnabled
    >
      <View style={[styles.column, compact && styles.columnCompact, showStrip && styles.columnWide]}>
        <Header tab={tab} onTab={setTab} active compact={compact} />
        {/* Both panels stay mounted. Opacity/height hides the inactive one so
            orb canvases are not remounted when the tab changes. */}
        <View
          style={previewOn ? [styles.shown, compact && styles.shownCompact] : styles.parked}
          pointerEvents={previewOn ? "auto" : "none"}
          accessibilityElementsHidden={!previewOn}
        >
          <View style={showStrip ? styles.previewRow : undefined}>
            <View style={styles.previewMain}>
              <PreviewGrid active={previewOn} layoutWidth={width} compact={compact} />
            </View>
            {showStrip ? <MarketingStrip active={previewOn} /> : null}
          </View>
          <Playground active={previewOn} layoutWidth={width} compact={compact} />
        </View>
        <View
          style={previewOn ? styles.parked : styles.shown}
          pointerEvents={previewOn ? "none" : "auto"}
          accessibilityElementsHidden={previewOn}
        >
          <InstallUsage />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  screenCompact: { backgroundColor: colors.canvas },
  content: { paddingTop: 28, paddingBottom: 48, paddingHorizontal: 24 },
  contentCompact: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 10, gap: 12 },
  column: { width: "100%", maxWidth: 1080, alignSelf: "center", gap: 24 },
  columnCompact: { gap: 12 },
  shownCompact: { gap: 12 },
  columnWide: { maxWidth: 1460 },
  previewRow: { flexDirection: "row", gap: 20, alignItems: "flex-start" },
  previewMain: { flex: 1, minWidth: 0 },
  shown: { gap: 24 },
  parked: { height: 0, overflow: "hidden", opacity: 0 },
});
