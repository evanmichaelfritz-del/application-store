/*!
 * MIT License
 * Copyright (c) 2026 Kelvin Zhang
 * https://github.com/0kzh/glisse
 * Pinned at 4922c852a6866ee9991d2f8c715bb1cfbe7aa2b9
 */

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
