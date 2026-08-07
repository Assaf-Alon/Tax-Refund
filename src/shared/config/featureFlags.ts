/**
 * Feature Flags Configuration
 */
export const FEATURE_FLAGS = {
  /**
   * Controls the visibility of the mobile mini debug terminal overlay.
   * Default: true (enabled for debugging). Can be configured via VITE_SHOW_DEBUG_TERMINAL.
   */
  SHOW_DEBUG_TERMINAL: import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'false' ? false : true,
} as const;

export const SHOW_DEBUG_TERMINAL = FEATURE_FLAGS.SHOW_DEBUG_TERMINAL;
