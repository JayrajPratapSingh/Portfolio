"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide smooth scrolling via Lenis, driven from GSAP's ticker.
 *
 * Lenis and ScrollTrigger have to share a clock. Lenis smooths the scroll
 * position on its own loop, while ScrollTrigger updates from native scroll
 * events — so a pinned section (`Future`) was positioned a frame behind where
 * the page had actually scrolled to, which showed as a black band opening up
 * beneath it, worst when scrolling back up.
 *
 * Running Lenis off `gsap.ticker` and pushing every Lenis scroll into
 * `ScrollTrigger.update` puts both on the same frame. It also removes a second
 * rAF loop from the page.
 *
 * Disabled under reduced-motion so the accessibility preference always wins.
 */
export function useLenis() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // gsap.ticker reports seconds; Lenis expects milliseconds.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    // Without this, a stalled frame makes gsap skip time to "catch up", which
    // desynchronises the pinned sections from the scroll position.
    gsap.ticker.lagSmoothing(0);

    // Positions were measured before Lenis took over the scroll.
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // gsap's default
      lenis.destroy();
    };
  }, [reduced]);
}
