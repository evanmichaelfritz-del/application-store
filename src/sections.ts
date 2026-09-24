export type NavSection =
  | 'transitions'
  | 'effects'
  | 'graphic-design'
  | 'ai-skills'
  | 'tools'
  | 'manual';

export const NAV_SECTIONS: { key: NavSection; label: string; hint: string }[] = [
  { key: 'transitions', label: 'Transitions', hint: 'Essential + text motion' },
  { key: 'effects', label: 'Effects', hint: 'Confetti, beam, gooey, metal, orbs' },
  { key: 'graphic-design', label: 'Graphic design', hint: 'Empty add slot' },
  { key: 'ai-skills', label: 'AI skills', hint: 'Agent-facing pieces' },
  { key: 'tools', label: 'Tools', hint: 'Empty until next ingest' },
  { key: 'manual', label: 'Manual', hint: 'Hand-authored add slot' },
];

export const SECTION_COPY: Record<NavSection, { title: string; subtitle: string; empty: string }> = {
  transitions: {
    title: 'Transitions',
    subtitle:
      'Essential UI transitions for web apps. Preview the live stage, copy HTML, CSS, and script separately, or reveal the AGENT_PROMPT for your coding agent.',
    empty: 'No transition pieces in this slice.',
  },
  effects: {
    title: 'Effects',
    subtitle:
      'Motion effects — confetti, stacks, tilt, plus libraries.dev Border Beam, Gooey, Liquid metal, and Thinking orbs. Same baseball cards.',
    empty: 'No effect pieces in this slice.',
  },
  'graphic-design': {
    title: 'Graphic design',
    subtitle:
      'Graphic design add slot. Libraries.dev CLEAR pieces landed in Effects (Border Beam, Gooey, Liquid metal, Thinking orbs).',
    empty: 'Nothing in Graphic design yet. Libraries.dev CLEAR pieces live under Effects.',
  },
  'ai-skills': {
    title: 'AI skills',
    subtitle:
      'Reserved for downloadable skills. None are listed yet.',
    empty: 'No AI skills seeded in this section.',
  },
  tools: {
    title: 'Tools',
    subtitle: 'Store tools. Use Playground (top nav) to paste closed-network HTML or AGENT_PROMPT recreations and preview them.',
    empty: 'No tools cards yet — open Playground from the top nav to test recreations.',
  },
  manual: {
    title: 'Manual',
    subtitle: 'Hand-authored add slot. Drop a piece here later without waiting on a library ingest.',
    empty: 'Use the add slot below when you are ready to hand-author a store piece.',
  },
};
