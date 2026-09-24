import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useReduceMotion } from "@/src/context/ReduceMotionContext";
import { LibdevStage } from "@/src/libdev/LibdevStage";
import { PREVIEW_CARDS, type PreviewCard } from "./content/previewCards";
import { OrbClockProvider } from "./orbs/clock";
import { ThinkingOrb } from "./orbs/ThinkingOrb";
import type { OrbSize, OrbState } from "./orbs/types";
import { colors, font } from "./theme";

const byId = new Map(PREVIEW_CARDS.map((card) => [card.id, card]));

const FREE_STATES: { value: OrbState; label: string }[] = [
  { value: "working", label: "Working" },
  { value: "searching", label: "Searching" },
  { value: "solving", label: "Solving" },
  { value: "listening", label: "Listening" },
  { value: "connecting", label: "Connecting" },
  { value: "composing", label: "Composing" },
  { value: "breathing", label: "Breathing" },
];

const PRO_STATES = ["Weaving", "Shaping"];
const FREE_SIZES: { value: OrbSize; label: string }[] = [
  { value: 64, label: "64px" },
  { value: 20, label: "20px" },
];

function VariantStage({ card }: { card: PreviewCard }) {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <OrbClockProvider reducedMotion={reduceMotion}>
        <View style={styles.fill}>
          <OrbPill card={card} />
        </View>
      </OrbClockProvider>
    </LibdevStage>
  );
}

function OrbPill({ card }: { card: PreviewCard }) {
  return (
    <View style={card.agent ? styles.chip : styles.pill} accessibilityLabel={card.label}>
      {card.motionsource ? (
        <ThinkingOrb motionsource={card.motionsource} />
      ) : card.state ? (
        <ThinkingOrb state={card.state} size={card.size} />
      ) : null}
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

function variant(id: string) {
  const card = byId.get(id);
  if (!card) {
    throw new Error(`Missing thinking-orb preview card ${id}`);
  }
  return function OrbVariantDemo() {
    return <VariantStage card={card} />;
  };
}

export const SolvingOrbDemo = variant("solving-hero");
export const ThinkingOrbDemo = variant("thinking");
export const AgentListeningOrbDemo = variant("agent-listening");
export const SearchingOrbDemo = variant("searching");
export const AgentPlanningOrbDemo = variant("agent-planning");
export const AgentThinkingOrbDemo = variant("agent-thinking");
export const WorkingOrbDemo = variant("working");
export const AgentShapingOrbDemo = variant("agent-shaping");

export function OrbStatePickerDemo() {
  const { reduceMotion } = useReduceMotion();
  return (
    <LibdevStage>
      <OrbClockProvider reducedMotion={reduceMotion}>
        <StatePicker />
      </OrbClockProvider>
    </LibdevStage>
  );
}

function StatePicker() {
  const [state, setState] = useState<OrbState>("listening");
  const [size, setSize] = useState<OrbSize>(64);
  const [paused, setPaused] = useState(false);

  return (
    <ScrollView
      style={styles.pickerScroll}
      contentContainerStyle={styles.picker}
      nestedScrollEnabled
    >
      <View style={styles.stageCol}>
        <ThinkingOrb state={state} size={size} paused={paused} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused ? "Play" : "Pause"}
          onPress={() => setPaused((value) => !value)}
          style={styles.play}
        >
          <Text style={styles.playText}>{paused ? "Play" : "Pause"}</Text>
        </Pressable>
        <View style={styles.chips}>
          {FREE_SIZES.map((item) => (
            <PickerChip
              key={item.value}
              label={item.label}
              selected={size === item.value}
              onPress={() => setSize(item.value)}
            />
          ))}
          <PickerChip label="32px" locked />
        </View>
      </View>
      <View style={styles.controls}>
        <Text style={styles.fieldLabel}>State</Text>
        <View style={styles.chips}>
          {FREE_STATES.map((item) => (
            <PickerChip
              key={item.value}
              label={item.label}
              selected={state === item.value}
              onPress={() => setState(item.value)}
            />
          ))}
          {PRO_STATES.map((label) => (
            <PickerChip key={label} label={label} locked />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function PickerChip({
  label,
  selected = false,
  locked = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  locked?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: locked }}
      disabled={locked}
      onPress={onPress}
      style={[styles.pickerChip, selected && !locked && styles.pickerChipOn, locked && styles.pickerChipLocked]}
    >
      <Text style={[styles.pickerChipText, selected && !locked && styles.pickerChipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
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
  pickerScroll: { flex: 1, width: "100%" },
  picker: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stageCol: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  play: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 36,
    backgroundColor: colors.idleChip,
    alignItems: "center",
    justifyContent: "center",
  },
  playText: {
    fontFamily: font,
    fontSize: 12,
    fontWeight: "500",
    color: colors.idleText,
  },
  controls: { flex: 1, gap: 4, justifyContent: "center" },
  fieldLabel: {
    fontFamily: font,
    fontSize: 11,
    lineHeight: 14,
    color: colors.muted,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  pickerChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 36,
    backgroundColor: colors.idleChip,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerChipOn: { backgroundColor: colors.activeChip },
  pickerChipLocked: { opacity: 0.4 },
  pickerChipText: {
    fontFamily: font,
    fontSize: 11,
    fontWeight: "500",
    color: colors.idleText,
  },
  pickerChipTextOn: { color: colors.activeText },
});
