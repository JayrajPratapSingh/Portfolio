"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.075,
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.1,
    });
    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    const tick = (time: number) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.off("scroll", update); lenis.destroy(); };
  }, []);
  return null;
}
