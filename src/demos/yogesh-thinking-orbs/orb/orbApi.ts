import type { OrbViewProps } from "./OrbView";

/** `<Orb>` parity: every public prop is optional, including paused, label, and className. */
const empty: OrbViewProps = {};
const named: OrbViewProps = {
  paused: true,
  label: "Thinking",
  className: "orb",
  state: "working",
  variant: "gyro",
  size: 20,
  color: "#ffffff",
};

void empty;
void named;
