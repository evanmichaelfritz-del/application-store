import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Canvas, Picture, Skia, type SkPicture } from "@shopify/react-native-skia";
import {
  drawOrbAt,
  frameTimeForMotionsource,
  frameTimeForState,
} from "../orbs/ThinkingOrb";
import type { MotionsourceKey } from "../orbs/motionsource";
import { nowSeconds, subscribeOrbFrame, useReducedMotion } from "../orbs/clock";
import type { OrbSize, OrbState } from "../orbs/types";
import { colors, font } from "../theme";

/** One pill on a track crosses a fixed line about every 3s at the strip speed. */
const PITCH_SECONDS = 3;

type StripPill = {
  id: string;
  label: string;
  agent: boolean;
  /** Identity prop when label verb matches a free/Pro state. */
  state?: OrbState;
  size: OrbSize;
  /** MOTION_LOCK Motionsource key — paints recipe; never chrome state= rename. */
  motionsource?: MotionsourceKey;
};

/** Video Motionsource — identity state where verb matches; Motionsource keys for Thinking/Planning/Agent thinking|planning|shaping (MOTION_LOCK corrected). */
const LARGE: StripPill[] = [
  { id: "v-solving", label: "Solving....", agent: false, state: "solving", size: 64 },
  { id: "v-thinking", label: "Thinking....", agent: false, size: 64, motionsource: "msThinking" },
  { id: "v-working", label: "Working....", agent: false, state: "working", size: 64 },
  { id: "v-searching", label: "Searching....", agent: false, state: "searching", size: 64 },
  { id: "v-listening", label: "Listening....", agent: false, state: "listening", size: 64 },
  { id: "v-planning", label: "Planning....", agent: false, size: 64, motionsource: "msPlanning" },
];

const SMALL: StripPill[] = [
  { id: "v-a-searching", label: "Agent searching...", agent: true, state: "searching", size: 20 },
  { id: "v-a-solving", label: "Agent solving...", agent: true, state: "solving", size: 20 },
  { id: "v-a-thinking", label: "Agent thinking...", agent: true, size: 20, motionsource: "msAgentThinking" },
  { id: "v-a-working", label: "Agent working...", agent: true, state: "working", size: 20 },
  { id: "v-a-shaping", label: "Agent shaping...", agent: true, size: 20, motionsource: "msAgentShaping" },
  { id: "v-a-planning", label: "Agent planning...", agent: true, size: 20, motionsource: "msAgentPlanning" },
  { id: "v-a-listening", label: "Agent listening...", agent: true, state: "listening", size: 20 },
];

const STRIP_W = 360;

function wrap(value: number, loop: number): number {
  if (loop <= 0) return 0;
  const mod = value % loop;
  return mod < 0 ? mod + loop : mod;
}

/**
 * Optional video marketing column. Does not replace the Preview masonry.
 * translateY is linear (modulo track height). Orb `t` is the shared wall clock.
 */
export function MarketingStrip({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();
  const viewH = Math.min(Math.max(windowHeight * 0.72, 480), 780);
  const speed = windowHeight / 9;
  const pitch = speed * PITCH_SECONDS;
  const leftLoop = LARGE.length * pitch;
  const rightLoop = SMALL.length * pitch;

  const [offset, setOffset] = useState(0);
  const [picture, setPicture] = useState<SkPicture | null>(null);
  const heldRef = useRef<SkPicture | null>(null);
  // No mid-flight dispose on web — ring-of-24 still raced Skia draw → BindingError.
  // Hold until unmount, then delay dispose.
  const recentRef = useRef<SkPicture[]>([]);

  useEffect(() => {
    return () => {
      const leftover = recentRef.current.slice();
      recentRef.current = [];
      heldRef.current = null;
      let n = 0;
      const tick = () => {
        n += 1;
        if (n < 3) {
          requestAnimationFrame(tick);
          return;
        }
        leftover.forEach((pic) => {
          try {
            pic.dispose();
          } catch {
            /* already gone */
          }
        });
      };
      requestAnimationFrame(tick);
    };
  }, []);

  useEffect(() => {
    const paint = Skia.Paint();
    let alive = true;

    const paintNow = () => {
      if (!alive) return;
      const nextOffset = reducedMotion ? 0 : nowSeconds() * speed;

      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, STRIP_W, viewH));
      const drawTrack = (items: StripPill[], loop: number, x: number, stagger: number) => {
        items.forEach((item, index) => {
          const top = wrap(index * pitch + stagger - nextOffset, loop);
          const pillH = item.size === 64 ? 74 : 36;
          const orbY = top + (pillH - item.size) / 2;
          if (orbY < -item.size || orbY > viewH) return;
          // MOTION_LOCK: RM → t=0.6 every pill. Else shared-clock loop. No frameTime pin on shaping.
          if (item.motionsource) {
            const frameTime = reducedMotion
              ? 0.6
              : frameTimeForMotionsource(item.motionsource, false);
            drawOrbAt(canvas, paint, {
              motionsource: item.motionsource,
              size: item.size,
              frameTime,
              x,
              y: orbY,
            });
            return;
          }
          if (!item.state) return;
          const frameTime = reducedMotion
            ? 0.6
            : frameTimeForState(item.state, item.size, false);
          drawOrbAt(canvas, paint, {
            state: item.state,
            size: item.size,
            frameTime,
            x,
            y: orbY,
          });
        });
      };
      drawTrack(LARGE, leftLoop, 0, 0);
      drawTrack(SMALL, rightLoop, 168, pitch / 2);

      const next = recorder.finishRecordingAsPicture();
      recentRef.current.push(next);
      heldRef.current = next;
      setPicture(next);
      setOffset(nextOffset);
    };

    paintNow();
    if (!active || reducedMotion) {
      return () => {
        alive = false;
        paint.dispose();
      };
    }
    const unsubscribe = subscribeOrbFrame(paintNow);
    return () => {
      alive = false;
      unsubscribe();
      paint.dispose();
    };
  }, [active, leftLoop, pitch, reducedMotion, rightLoop, speed, viewH]);

  const place = (items: StripPill[], loop: number, left: number, stagger: number) =>
    items.map((item, index) => {
      const top = wrap(index * pitch + stagger - offset, loop);
      return <Pill key={item.id} item={item} top={top} left={left} />;
    });

  return (
    <View style={[styles.clip, { height: viewH }]} accessibilityLabel="Marketing scroll" pointerEvents="none">
      {place(LARGE, leftLoop, 0, 0)}
      {place(SMALL, rightLoop, 168, pitch / 2)}
      <Canvas
        pointerEvents="none"
        style={{ position: "absolute", left: 0, top: 0, width: STRIP_W, height: viewH, zIndex: 1 }}
      >
        {picture ? <Picture picture={picture} /> : null}
      </Canvas>
      <Fade edge="top" />
      <Fade edge="bottom" />
    </View>
  );
}

function Pill({ item, top, left }: { item: StripPill; top: number; left: number }) {
  const tall = item.size === 64;
  return (
    <View
      style={[
        styles.pill,
        tall ? styles.pillLarge : styles.pillSmall,
        { top, left, width: tall ? 210 : 176 },
      ]}
      accessibilityElementsHidden
    >
      <View style={{ width: item.size, height: item.size }} />
      <StripLabel label={item.label} agent={item.agent} large={tall} />
    </View>
  );
}

function StripLabel({ label, agent, large }: { label: string; agent: boolean; large: boolean }) {
  if (!agent) return <Text style={large ? styles.largeLabel : styles.smallPlain}>{label}</Text>;
  const action = label.startsWith("Agent ") ? label.slice("Agent ".length) : label;
  return (
    <Text style={styles.agentLine}>
      <Text style={styles.agentMuted}>Agent </Text>
      <Text style={styles.agentAction}>{action}</Text>
    </Text>
  );
}

function Fade({ edge }: { edge: "top" | "bottom" }) {
  const bands = 8;
  return (
    <View style={[styles.fade, edge === "top" ? styles.fadeTop : styles.fadeBottom]} pointerEvents="none">
      {Array.from({ length: bands }, (_, index) => {
        const alpha = edge === "top" ? 1 - index / (bands - 1) : index / (bands - 1);
        return <View key={index} style={{ flex: 1, backgroundColor: `rgba(10,10,10,${alpha})` }} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    width: STRIP_W,
    overflow: "hidden",
    position: "relative",
    borderRadius: 16,
  },
  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: colors.pill,
    borderWidth: 1,
    borderColor: colors.pillLine,
  },
  pillLarge: { height: 74, paddingRight: 18, gap: 8 },
  pillSmall: { height: 36, paddingRight: 12, gap: 6 },
  largeLabel: { fontFamily: font, fontSize: 16, lineHeight: 22, color: colors.largeLabel },
  smallPlain: { fontFamily: font, fontSize: 13, lineHeight: 16, color: colors.largeLabel },
  agentLine: { fontFamily: font, fontSize: 13, lineHeight: 16 },
  agentMuted: { color: colors.agent },
  agentAction: { color: colors.action },
  fade: { position: "absolute", left: 0, right: 0, height: 72, zIndex: 2 },
  fadeTop: { top: 0 },
  fadeBottom: { bottom: 0 },
});
