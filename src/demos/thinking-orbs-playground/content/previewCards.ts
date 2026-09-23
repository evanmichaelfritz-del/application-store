import type { MotionsourceKey } from "../orbs/motionsource";
import type { OrbSize, OrbState } from "../orbs/types";

/**
 * Live Preview grid from the hero shot.
 * Heroes sit side by side. The masonry columns underneath are the measured
 * card stack (short = 151, tall = 314), not a row-major reading of the label list.
 */
export type PreviewCard = {
  id: string;
  label: string;
  hero?: boolean;
  agent: boolean;
  size: OrbSize;
  state?: OrbState;
  motionsource?: MotionsourceKey;
};

export const PREVIEW_CARDS: PreviewCard[] = [
  {
    id: "solving-hero",
    label: "Solving....",
    hero: true,
    agent: false,
    size: 64,
    state: "solving",
  },
  {
    id: "thinking",
    label: "Thinking....",
    hero: true,
    agent: false,
    size: 64,
    motionsource: "msThinking",
  },
  {
    id: "agent-listening",
    label: "Agent listening...",
    agent: true,
    size: 20,
    state: "listening",
  },
  {
    id: "searching",
    label: "Searching....",
    agent: false,
    size: 64,
    state: "searching",
  },
  {
    id: "agent-planning",
    label: "Agent planning...",
    agent: true,
    size: 20,
    motionsource: "msAgentPlanning",
  },
  {
    id: "agent-thinking",
    label: "Agent thinking...",
    agent: true,
    size: 20,
    motionsource: "msAgentThinking",
  },
  {
    id: "working",
    label: "Working....",
    agent: false,
    size: 64,
    state: "working",
  },
  {
    id: "solving-2",
    label: "Solving....",
    agent: false,
    size: 64,
    state: "solving",
  },
  {
    id: "agent-shaping",
    label: "Agent shaping...",
    agent: true,
    size: 20,
    motionsource: "msAgentShaping",
  },
];

/** Left masonry column under the heroes. */
export const PREVIEW_LEFT = [
  "agent-listening",
  "searching",
  "agent-planning",
  "agent-thinking",
];

/** Right masonry column under the heroes. */
export const PREVIEW_RIGHT = ["working", "solving-2", "agent-shaping"];
