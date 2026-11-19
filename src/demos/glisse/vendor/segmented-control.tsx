/*!
 * MIT License
 * Copyright (c) 2026 Kelvin Zhang
 * https://github.com/0kzh/glisse
 * Pinned at 4922c852a6866ee9991d2f8c715bb1cfbe7aa2b9
 */

import type { HTMLAttributes, JSX, ReactNode } from "react";

import { Segments } from "./internal/segments";

export interface SegmentedControlItem {
  value: string;
  label: ReactNode;
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  items: SegmentedControlItem[];
  /** The selected segment's `value`, or `null` for none. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}

/**
 * A choice between a few options, as iOS 26's segmented control: a thumb on a
 * track that, held or dragged, lifts into a lens over the labels.
 */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element {
  return <Segments kind="segmented" {...props} />;
}
