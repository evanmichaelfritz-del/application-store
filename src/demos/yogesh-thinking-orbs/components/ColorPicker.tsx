import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { detectFormat, formatColor, parseColor, type Oklch } from "../color/color";
import { fonts, useTheme } from "../theme/theme";

const INVALID_TITLE = "Enter a hex, RGB, HSL, OKLCH, or Display P3 color";

export type ColorPickerProps = {
  text: string;
  color: Oklch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (text: string) => void;
  onChange: (color: Oklch, text: string) => void;
};

/**
 * Native stand-in. Desktop web uses ColorPicker.web.tsx.
 * Mobile layout is a known gap; this keeps the card from crashing.
 */
export function ColorPicker({ text, color, open, onOpenChange, onCommit, onChange }: ColorPickerProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(text);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setDraft(text);
    setInvalid(false);
  }, [text]);
  const commit = () => {
    const trimmed = draft.trim();
    const parsed = parseColor(trimmed);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onCommit(trimmed);
    onChange(parsed, formatColor(parsed, detectFormat(trimmed)));
  };
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          height: 36,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: fonts.regular, fontSize: 13 }}>Color</Text>
        <TextInput
          value={draft}
          onChangeText={(value) => {
            setDraft(value);
            setInvalid(false);
          }}
          onSubmitEditing={commit}
          accessibilityLabel="Color color value"
          aria-invalid={invalid}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            minWidth: 0,
            color: invalid ? "#ef7777" : "rgba(255,255,255,0.7)",
            fontFamily: fonts.mono,
            fontSize: 13,
            textAlign: "right",
            paddingVertical: 4,
          }}
        />
        <Pressable
          testID="yogesh-orb-color-swatch"
          accessibilityRole="button"
          accessibilityLabel="Pick color color"
          onPress={() => onOpenChange(!open)}
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            backgroundColor: formatColor(color, "hex"),
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.26)",
          }}
        />
      </View>
      {open ? (
        <View accessibilityLabel="Color color picker" style={{ borderRadius: 14, backgroundColor: colors.pop, padding: 10, gap: 8 }}>
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 13 }}>{INVALID_TITLE}</Text>
          <Pressable onPress={() => onOpenChange(false)} accessibilityRole="button">
            <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
