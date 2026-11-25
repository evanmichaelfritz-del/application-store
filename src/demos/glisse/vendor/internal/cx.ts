/*!
 * MIT License
 * Copyright (c) 2026 Kelvin Zhang
 * https://github.com/0kzh/glisse
 */

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
