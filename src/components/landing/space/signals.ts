/**
 * High-frequency shared signals for the night-mode voyage, mirroring the
 * day-mode `day/signals.ts`. Written from a scroll listener and read inside the
 * R3F render loop each frame, so pointer/scroll motion never triggers a React
 * re-render.
 */
export const spaceScroll = { progress: 0, velocity: 0 };

/** Normalized device coords of the pointer, in [-1, 1]. y is up. */
export const spaceMouse = { nx: 0, ny: 0 };

/* ------------------------------------------------------------------ */
/*  Scroll-window helpers — the same maths the sea section uses, so    */
/*  both worlds reveal their contents with one shared vocabulary.      */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Smooth 0→1 ramp between `a` and `b`. */
export function fadeIn(p: number, a: number, b: number): number {
  return clamp01((p - a) / Math.max(1e-6, b - a));
}

/**
 * Local 0→1 progress inside a window — an object's own timeline, used to move
 * it across the view over its stretch of the scroll.
 */
export function winU(p: number, start: number, end: number): number {
  return clamp01((p - start) / Math.max(1e-6, end - start));
}

/** Fade in over `a→b`, hold, then out over `c→d`. The "appear in turn" curve. */
export function zoneFade(
  p: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  return Math.min(fadeIn(p, a, b), 1 - fadeIn(p, c, d));
}

/** Smoothstep, for easing camera drift without importing three here. */
export function smooth(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/* ------------------------------------------------------------------ */
/*  The flight path.                                                   */
/*                                                                     */
/*  The corridor is a curve, not a straight line down -z. Everything    */
/*  — camera, worlds, gates, labels — is positioned relative to these   */
/*  two functions, so the route weaves as one piece and nothing drifts  */
/*  off the path when the shape is tuned.                              */
/* ------------------------------------------------------------------ */

export const PATH_AMP_X = 11;
export const PATH_AMP_Y = 6;

export function pathX(z: number): number {
  return Math.sin(-z * 0.0255) * PATH_AMP_X + Math.sin(-z * 0.011) * 4;
}

export function pathY(z: number): number {
  return Math.cos(-z * 0.019) * PATH_AMP_Y + Math.sin(-z * 0.0085) * 2.5;
}
