import { StyleSheet, Text, View } from "react-native";
import { ThinkingOrb } from "../orbs/ThinkingOrb";
import {
  PREVIEW_CARDS,
  PREVIEW_LEFT,
  PREVIEW_RIGHT,
  type PreviewCard,
} from "../content/previewCards";
import { colors, font } from "../theme";

const byId = new Map(PREVIEW_CARDS.map((card) => [card.id, card]));

export function PreviewGrid({
  active,
  layoutWidth,
  compact = false,
}: {
  active: boolean;
  layoutWidth: number;
  compact?: boolean;
}) {
  const wide = layoutWidth >= (compact ? 520 : 860);
  const heroes = PREVIEW_CARDS.filter((card) => card.hero);

  return (
    <View style={styles.stack}>
      <View style={[styles.heroRow, !wide && styles.stackCol]}>
        {heroes.map((card) => (
          <View key={card.id} style={[styles.heroCell, compact && styles.heroCellCompact]}>
            <OrbCard card={card} active={active} />
          </View>
        ))}
      </View>
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.column}>
            {PREVIEW_LEFT.map((id) => (
              <GridCell key={id} card={byId.get(id)!} active={active} compact={compact} />
            ))}
          </View>
          <View style={styles.column}>
            {PREVIEW_RIGHT.map((id) => (
              <GridCell key={id} card={byId.get(id)!} active={active} compact={compact} />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.stackCol}>
          {PREVIEW_CARDS.filter((card) => !card.hero).map((card) => (
            <GridCell key={card.id} card={card} active={active} compact={compact} />
          ))}
        </View>
      )}
    </View>
  );
}

function GridCell({
  card,
  active,
  compact,
}: {
  card: PreviewCard;
  active: boolean;
  compact: boolean;
}) {
  const tall = card.size === 64;
  return (
    <View
      style={[
        styles.cell,
        tall ? styles.cellTall : styles.cellShort,
        compact && (tall ? styles.cellTallCompact : styles.cellShortCompact),
      ]}
    >
      <OrbCard card={card} active={active} />
    </View>
  );
}

function OrbCard({ card, active }: { card: PreviewCard; active: boolean }) {
  return (
    <View style={card.agent ? styles.chip : styles.pill}>
      {card.motionsource ? (
        <ThinkingOrb motionsource={card.motionsource} active={active} />
      ) : card.state ? (
        <ThinkingOrb state={card.state} size={card.size} active={active} />
      ) : (
        <View style={{ width: card.size, height: card.size }} />
      )}
      <CardLabel label={card.label} agent={card.agent} />
    </View>
  );
}

function CardLabel({ label, agent }: { label: string; agent: boolean }) {
  if (!agent) {
    return <Text style={styles.largeLabel}>{label}</Text>;
  }
  const action = label.startsWith("Agent ") ? label.slice("Agent ".length) : label;
  return (
    <Text style={styles.agentLine}>
      <Text style={styles.agentMuted}>Agent </Text>
      <Text style={styles.agentAction}>{action}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  heroRow: { flexDirection: "row", gap: 12 },
  stackCol: { flexDirection: "column", gap: 12 },
  heroCell: {
    flex: 1,
    minHeight: 314,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    overflow: "hidden",
  },
  heroCellCompact: { minHeight: 120, padding: 16 },
  cellTallCompact: { height: 120, padding: 12 },
  cellShortCompact: { height: 72, padding: 10 },
  columns: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  column: { flex: 1, gap: 12 },
  cell: {
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    overflow: "hidden",
  },
  cellTall: { height: 314 },
  cellShort: { height: 151 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 74,
    paddingLeft: 9,
    paddingRight: 28,
    borderRadius: 50,
    backgroundColor: colors.pill,
    borderWidth: 1,
    borderColor: colors.pillLine,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 36,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 50,
    backgroundColor: colors.pill,
    borderWidth: 1,
    borderColor: colors.pillLine,
  },
  largeLabel: {
    fontFamily: font,
    fontSize: 18,
    lineHeight: 24,
    color: colors.largeLabel,
  },
  agentLine: { fontFamily: font, fontSize: 13, lineHeight: 16 },
  agentMuted: { color: colors.agent },
  agentAction: { color: colors.action },
});
