/** Verbatim Install & Usage blocks from DESIGN_LOCK. */
export const INSTALL_REACT_INSTALL = "npm install thinking-orbs";

export const INSTALL_REACT_USAGE = `import { ThinkingOrb } from 'thinking-orbs';
<ThinkingOrb state="searching" size={64} />`;

export const INSTALL_NATIVE_INSTALL =
  "npm install thinking-orbs-native @shopify/react-native-skia react-native-reanimated";

export const INSTALL_NATIVE_NOTE =
  "thinking-orbs-native is not on npm yet — it lives in this repo at packages/thinking-orbs/ports/react-native/thinking-orbs-native. Expo needs expo run:ios / run:android (native modules).";

export const INSTALL_NATIVE_USAGE = `import { ThinkingOrb } from 'thinking-orbs-native';
<ThinkingOrb state="searching" size={64} />`;

export const INSTALL_SWIFT_INSTALL =
  '.package(path: "packages/thinking-orbs/ports/ios/ThinkingOrbsKit")';

export const INSTALL_SWIFT_USAGE = `import ThinkingOrbsKit
ThinkingOrb(state: .searching, size: .px64)`;

/** Live page #agent-prompt, decoded. */
export const AGENT_PROMPT = `Add the Orb effect from Libraries.dev to my React app.

Install:
npm install thinking-orbs

Usage:
import { ThinkingOrb } from 'thinking-orbs';

<ThinkingOrb state="searching" size={64} />

Props:
- state: "working" | "searching" | "solving" | "listening" | "connecting" | "weaving" | "composing" | "breathing" | "shaping"
- size: 64 (chat-avatar scale) or 20 (inline-text scale) — each is separately tuned
- speed: multiplies the animation clock, default 1
- dark: boolean, picks the light or dark tuning
- paused: boolean, freezes the animation

Orb replaces the spinner in an AI "thinking" state with nine hand-tuned animated
states. It ships zero runtime dependencies and needs React 18 or newer.
Docs: https://libraries.dev/orbs.html`;

export const PRO_GATE = "Available with Pro plan";

export const GRAVITY_NOTE = "Draws the macOS pointer, so it only shows on a Mac.";

export const HEADER_TITLE = "Thinking orbs";

export const HEADER_SUBTITLE =
  "Thought-orb loading indicators for AI interfaces, with nine hand-tuned animated states.";

export function playgroundSnippet(state: string, size: number): string {
  return `import { ThinkingOrb } from 'thinking-orbs';

<ThinkingOrb state="${state}" size={${size}} />`;
}
