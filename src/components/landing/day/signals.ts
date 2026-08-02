/**
 * High-frequency shared signals for the day-mode world. Updated from DOM
 * listeners / the scroll loop and read inside the R3F render loop each frame,
 * so we never trigger React re-renders for pointer/scroll motion.
 */
export const dayScroll = { progress: 0, velocity: 0 };

/** Normalized device coords of the pointer, in [-1, 1]. y is up. */
export const dayMouse = { nx: 0, ny: 0, strength: 0 };
