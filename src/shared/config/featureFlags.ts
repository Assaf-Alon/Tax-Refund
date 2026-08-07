/**
 * Feature Flags Configuration
 */
export const FEATURE_FLAGS = {
  /**
   * Controls the visibility of the mobile mini debug terminal overlay.
   * Default: false. Can be enabled via VITE_SHOW_DEBUG_TERMINAL=true in env.
   */
  SHOW_DEBUG_TERMINAL: import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'true' || false,
} as const;

export const SHOW_DEBUG_TERMINAL = FEATURE_FLAGS.SHOW_DEBUG_TERMINAL;
