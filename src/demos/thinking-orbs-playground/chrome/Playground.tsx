import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThinkingOrb } from "../orbs/ThinkingOrb";
import { CodeBlock } from "./CodeBlock";
import { GRAVITY_NOTE, PRO_GATE, playgroundSnippet } from "../content/copy";
import type { OrbSize, OrbState } from "../orbs/types";
import { colors, font } from "../theme";

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

export function Playground({
  active,
  layoutWidth,
  compact = false,
}: {
  active: boolean;
  layoutWidth: number;
  compact?: boolean;
}) {
  const wide = layoutWidth >= 860 && !compact;
  const [state, setState] = useState<OrbState>("listening");
  const [size, setSize] = useState<OrbSize>(64);
  const [gravity, setGravity] = useState(false);
  const [paused, setPaused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Playground</Text>
      <View style={[styles.layout, !wide && styles.layoutStack]}>
        <View style={[styles.stage, compact && styles.stageCompact]}>
          <ThinkingOrb state={state} size={size} paused={paused} active={active} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? "Play" : "Pause"}
            onPress={() => setPaused((value) => !value)}
            style={styles.play}
          >
            <Text style={styles.playText}>{paused ? "Play" : "Pause"}</Text>
          </Pressable>
        </View>
        <View style={[styles.controls, !wide && styles.controlsFull]}>
          <ChipGroup label="State">
            {FREE_STATES.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                selected={state === item.value}
                onPress={() => setState(item.value)}
              />
            ))}
            {PRO_STATES.map((label) => (
              <Chip key={label} label={label} locked />
            ))}
          </ChipGroup>
          <Text style={styles.gate}>{PRO_GATE}</Text>
          <ChipGroup label="Size">
            {FREE_SIZES.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                selected={size === item.value}
                onPress={() => setSize(item.value)}
              />
            ))}
            <Chip label="32px" locked />
          </ChipGroup>
          <Text style={styles.gate}>{PRO_GATE}</Text>
          <View accessibilityRole="radiogroup">
            <Text style={styles.fieldLabel}>Cursor gravity</Text>
            <View style={styles.chips}>
              <Chip label="Off" selected={!gravity} onPress={() => setGravity(false)} />
              <Chip label="On" selected={gravity} onPress={() => setGravity(true)} />
            </View>
            {gravity ? <Text style={styles.note}>{GRAVITY_NOTE}</Text> : null}
          </View>
        </View>
        <View style={styles.snippet}>
          <CodeBlock code={playgroundSnippet(state, size)} label="Copy playground snippet" />
        </View>
      </View>
    </View>
  );
}

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View accessibilityRole="radiogroup" style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({
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
      accessibilityState={{ selected, disabled: locked }}
      accessibilityHint={locked ? PRO_GATE : undefined}
      disabled={locked}
      onPress={onPress}
      style={[styles.chip, selected && !locked && styles.chipOn, locked && styles.chipLocked]}
    >
      <Text style={[styles.chipText, selected && !locked && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 8 },
  heading: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 14,
    color: colors.text,
  },
  layout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "stretch",
  },
  layoutStack: { flexDirection: "column" },
  stage: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 420,
    minHeight: 380,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  stageCompact: { minHeight: 148, flexBasis: 148 },
  play: {
    position: "absolute",
    bottom: 20,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 36,
    backgroundColor: colors.idleChip,
    alignItems: "center",
    justifyContent: "center",
  },
  playText: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    color: colors.idleText,
  },
  controls: {
    width: 244,
    borderRadius: 16,
    backgroundColor: colors.panel,
    padding: 16,
    gap: 8,
  },
  controlsFull: { width: "100%" },
  snippet: { width: "100%" },
  field: { gap: 8 },
  fieldLabel: {
    fontFamily: font,
    fontSize: 13,
    lineHeight: 14,
    color: colors.muted,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 36,
    backgroundColor: colors.idleChip,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.activeChip },
  chipLocked: { opacity: 0.4 },
  chipText: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "500",
    color: colors.idleText,
  },
  chipTextOn: { color: colors.activeText },
  gate: {
    fontFamily: font,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
    marginBottom: 8,
  },
  note: {
    marginTop: 6,
    fontFamily: font,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
});
