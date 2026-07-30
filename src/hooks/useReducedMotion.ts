"use client";

import { useEffect, useState } from "react";

/**
 * Reactive `prefers-reduced-motion` hook.
 *
 * Framer Motion has its own `useReducedMotion`, but Three.js / R3F scenes and
 * imperative GSAP timelines need a plain boolean too. Use this to skip or
 * simplify heavy animations (particle fields, orbit loops, autoplay) so the
 * site stays accessible and cheap for users who ask for less motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default useReducedMotion;
