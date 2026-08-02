"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down";

export interface ScrollState {
  /** Last meaningful scroll direction. */
  direction: ScrollDirection;
  /** True while within a few px of the top of the page. */
  atTop: boolean;
  /** True once scrolled past a small threshold (for condensing chrome). */
  scrolled: boolean;
}

/**
 * Lightweight scroll observer for hide/show navbars and condensing chrome.
 * Polls `window.scrollY` on rAF so it stays correct under smooth-scroll libs
 * (Lenis) whose programmatic scrolls don't always emit native scroll events —
 * otherwise the navbar can get stuck hidden even at the top. React bails on
 * unchanged state, so this only re-renders when a value actually flips.
 */
export function useScroll(threshold = 8): ScrollState {
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const [atTop, setAtTop] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let raf = 0;

    const tick = () => {
      const y = window.scrollY;
      setAtTop(y < 4);
      setScrolled(y > 24);
      if (Math.abs(y - last.current) >= threshold) {
        setDirection(y > last.current && y > 80 ? "down" : "up");
        last.current = y;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [threshold]);

  return { direction, atTop, scrolled };
}

export default useScroll;
