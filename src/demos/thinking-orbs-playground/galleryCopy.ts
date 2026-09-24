/**
 * Copy-code and motion locks for the split Thinking Orb gallery cards.
 * Each entry is one preview variant, or the playground state picker.
 * solving-2 in the preview grid repeats Solving and is not a separate card.
 */

export type OrbGalleryKey =
  | "solving"
  | "thinking"
  | "agent-listening"
  | "searching"
  | "agent-planning"
  | "agent-thinking"
  | "working"
  | "agent-shaping"
  | "state-picker";

function usage(note: string, state: string, size: number): string {
  return `import { ThinkingOrb } from 'thinking-orbs';

${note}
<ThinkingOrb state="${state}" size={${size}} />`;
}

export const ORB_GALLERY_SNIPPETS: Record<OrbGalleryKey, string> = {
  solving: usage("// Preview pill Solving.... — state solving at 64px.", "solving", 64),
  thinking: usage(
    "// Preview pill Thinking.... — motionsource msThinking (ring + breathing) at 64px.",
    "breathing",
    64,
  ),
  "agent-listening": usage(
    "// Preview chip Agent listening... — state listening at 20px.",
    "listening",
    20,
  ),
  searching: usage("// Preview pill Searching.... — state searching at 64px.", "searching", 64),
  "agent-planning": usage(
    "// Preview chip Agent planning... — motionsource msAgentPlanning (ribbon + composing) at 20px.",
    "composing",
    20,
  ),
  "agent-thinking": usage(
    "// Preview chip Agent thinking... — motionsource msAgentThinking (ring + breathing) at 20px.",
    "breathing",
    20,
  ),
  working: usage("// Preview pill Working.... — state working at 64px.", "working", 64),
  "agent-shaping": usage(
    "// Preview chip Agent shaping... — motionsource msAgentShaping (morph) at 20px.",
    "shaping",
    20,
  ),
  "state-picker": `import { ThinkingOrb } from 'thinking-orbs';

// Playground state picker. Swap state and size from the controls.
// This is the customizable picker, not a single preview orb.
<ThinkingOrb state="listening" size={64} />

// Free states: working | searching | solving | listening | connecting | composing | breathing
// Pro states (locked): weaving | shaping
// Free sizes: 64 | 20
// Pro size (locked): 32`,
};

export const ORB_GALLERY_LOCKS: Record<
  OrbGalleryKey,
  { motion: string; content: string; rn: string }
> = {
  solving: {
    motion:
      "Vendor solving preset at 64px on the shared orb clock. Reduced motion freezes the frame.",
    content: "Preview label `Solving....`. One 64px orb in a pill. Not the scrolling multi-orb gallery.",
    rn: "Skia ThinkingOrb state=\"solving\" size={64}. Copy emits only this orb.",
  },
  thinking: {
    motion:
      "Motionsource msThinking: ring mode with breathing opts at 64px. Do not rename the label to breathing.",
    content: "Preview label `Thinking....`. Hero pill, 64px. Distinct from Agent thinking (20px).",
    rn: "Paint msThinking. Portable copy uses state=\"breathing\" size={64} because that is the vendor preset behind the label.",
  },
  "agent-listening": {
    motion: "Vendor listening preset at 20px, inline agent chip. Reduced motion freezes the frame.",
    content: "Preview label `Agent listening...`. 20px orb plus muted Agent prefix. Not the state-picker Listening chip.",
    rn: "Skia ThinkingOrb state=\"listening\" size={20}.",
  },
  searching: {
    motion: "Vendor searching preset at 64px on the shared orb clock.",
    content: "Preview label `Searching....`. One 64px orb in a pill.",
    rn: "Skia ThinkingOrb state=\"searching\" size={64}.",
  },
  "agent-planning": {
    motion:
      "Motionsource msAgentPlanning: ribbon mode with composing opts at 20px. Not the orbits preset.",
    content: "Preview label `Agent planning...`. 20px agent chip.",
    rn: "Paint msAgentPlanning. Portable copy uses state=\"composing\" size={20}.",
  },
  "agent-thinking": {
    motion: "Motionsource msAgentThinking: ring mode with breathing opts at 20px.",
    content: "Preview label `Agent thinking...`. 20px agent chip. Distinct from the 64px Thinking pill.",
    rn: "Paint msAgentThinking. Portable copy uses state=\"breathing\" size={20}.",
  },
  working: {
    motion: "Vendor working preset at 64px on the shared orb clock.",
    content: "Preview label `Working....`. One 64px orb in a pill.",
    rn: "Skia ThinkingOrb state=\"working\" size={64}.",
  },
  "agent-shaping": {
    motion: "Motionsource msAgentShaping: morph loop at 20px. No pinned frame time.",
    content: "Preview label `Agent shaping...`. 20px agent chip. Shaping stays locked on the state picker.",
    rn: "Paint msAgentShaping. Portable copy uses state=\"shaping\" size={20}.",
  },
  "state-picker": {
    motion:
      "One canvas. State chips swap the preset in place. Pause freezes t without clearing the picture. Size 64 and 20 are free. Weaving, Shaping, and 32px stay Pro-locked.",
    content:
      "Playground State controls: Working, Searching, Solving, Listening, Connecting, Composing, Breathing, plus locked Weaving and Shaping. Default listening at 64px. Pause and Play sit on the stage. This card is the picker, not an individual preview orb.",
    rn: "Skia ThinkingOrb. Copy emits the picker snippet (state union, sizes, Pro locks), not the combined Preview plus Install document.",
  },
};
