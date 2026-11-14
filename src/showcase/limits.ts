/** Files at or under this size are copied. Larger ones are saved. */
export const SHOWCASE_FILE_LIMIT = 2 * 1024 * 1024;

/**
 * Known over-limit showcases. The press downloads these without waiting on
 * the clipboard, so Safari still has the user gesture for every other card.
 * check-showcase asserts this set matches the measured file sizes.
 */
export const SHOWCASE_OVER_LIMIT = new Set(['stageshow']);
