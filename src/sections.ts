export type NavSection =
  | 'transitions'
  | 'effects'
  | 'graphic-design'
  | 'ai-skills'
  | 'tools'
  | 'manual';

export const NAV_SECTIONS: { key: NavSection; label: string; hint: string }[] = [
  { key: 'transitions', label: 'Transitions', hint: 'Essential + text motion' },
  { key: 'effects', label: 'Effects', hint: 'Confetti, gooey, stacks, tilt' },
  { key: 'graphic-design', label: 'Graphic design', hint: 'Awaiting libraries.dev' },
  { key: 'ai-skills', label: 'AI skills', hint: 'Agent-facing pieces' },
  { key: 'tools', label: 'Tools', hint: 'Empty until next ingest' },
  { key: 'manual', label: 'Manual', hint: 'Hand-authored add slot' },
];

export const SECTION_COPY: Record<NavSection, { title: string; subtitle: string; empty: string }> = {
  transitions: {
    title: 'Transitions',
    subtitle:
      'Essential UI transitions for web apps. Preview the live stage, copy the portable CSS, or reveal the AGENT_PROMPT for your coding agent.',
    empty: 'No transition pieces in this slice.',
  },
  effects: {
    title: 'Effects',
    subtitle:
      'Motion effects from the transitions.dev catalog — confetti, gooey, stacks, dissolve, drag physics, and 3D tilt. Same baseball cards.',
    empty: 'No effect pieces in this slice.',
  },
  'graphic-design': {
    title: 'Graphic design',
    subtitle:
      'Design pieces land here after libraries.dev clears. Border Beam, Liquid metal, Thinking orbs, and related ingest are out of scope for this pass.',
    empty: 'Nothing in Graphic design yet. Libraries.dev pieces ingest after that catalog clears.',
  },
  'ai-skills': {
    title: 'AI skills',
    subtitle:
      'Agent-facing skills you can copy into a coding workspace. Shimmer text is seeded from the transitions catalog.',
    empty: 'No AI skills seeded in this section.',
  },
  tools: {
    title: 'Tools',
    subtitle: 'Store tools slot. Empty until the next ingest.',
    empty: 'No tools in the storefront yet. This section is reserved.',
  },
  manual: {
    title: 'Manual',
    subtitle: 'Hand-authored add slot. Drop a piece here later without waiting on a library ingest.',
    empty: 'Use the add slot below when you are ready to hand-author a store piece.',
  },
};
