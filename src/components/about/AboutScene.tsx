"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const AboutNebula = dynamic(() => import("./AboutNebula"), { ssr: false }); // night
const AboutIsland = dynamic(() => import("./AboutIsland"), { ssr: false }); // day

/**
 * About-page backdrop: a black hole at night, a sunlit tropical island by day.
 * Full-screen, pointer-safe, theme-swapped. Falls back to a static gradient
 * under reduced-motion.
 */
export default function AboutScene() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      {/* base wash + reduced-motion fallback */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#dff2fb,#bfe6f7_55%,#9fd6ee)] dark:bg-[radial-gradient(120%_120%_at_60%_30%,#0a1020,#020208_60%,#000)]" />

      {mounted && !reduced && (isLight ? <AboutIsland /> : <AboutNebula />)}

      {/* readability veil (kept light so the scene still shows) */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/25 to-transparent" />
      <div className="absolute inset-0 bg-white/5 dark:bg-black/25" />
    </div>
  );
}
