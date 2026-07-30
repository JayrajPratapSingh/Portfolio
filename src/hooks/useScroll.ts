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
 * Uses a single passive listener and ignores sub-threshold jitter.
 */
export function useScroll(threshold = 8): ScrollState {
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const [atTop, setAtTop] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 4);
      setScrolled(y > 24);

      if (Math.abs(y - last.current) < threshold) return;
      setDirection(y > last.current && y > 80 ? "down" : "up");
      last.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { direction, atTop, scrolled };
}

export default useScroll;
