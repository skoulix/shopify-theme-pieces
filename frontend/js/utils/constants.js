/**
 * Shared constants for animations, z-indexes, and timing
 * Centralizes magic numbers to ensure consistency across the theme
 */

// Animation durations (in milliseconds)
export const DURATION = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
};

// Z-index layers (ascending order)
export const Z_INDEX = {
  dropdown: 50,
  sticky: 60,
  drawer: 100,
  modal: 9999,
  toast: 10000,
};

// Debounce/throttle delays
export const DEBOUNCE = {
  input: 300,
  resize: 150,
  scroll: 100,
  search: 500,
  cartNote: 500,
};

// Timeouts for specific features
export const TIMEOUT = {
  announcement: 1000,
  cartFetch: 8000,
  toast: 3000,
  formSuccess: 3000,
};

// Breakpoints matching Tailwind defaults
export const BREAKPOINT = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Easing functions (CSS)
export const EASING = {
  default: 'ease-out',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export default {
  DURATION,
  Z_INDEX,
  DEBOUNCE,
  TIMEOUT,
  BREAKPOINT,
  EASING,
};
