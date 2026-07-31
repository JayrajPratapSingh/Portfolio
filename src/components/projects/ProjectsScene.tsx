"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ProjectsNight = dynamic(() => import("./ProjectsNight"), { ssr: false }); // night
const ProjectsDay = dynamic(() => import("./ProjectsDay"), { ssr: false }); // day

/**
 * Projects-page backdrop: a synthwave neon grid at night, rolling sunlit hills
 * by day. Full-screen, pointer-safe, theme-swapped, reduced-motion fallback.
 */
export default function ProjectsScene() {
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
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#dff2fb,#bfe6f7_60%,#9fd6ee)] dark:bg-[radial-gradient(120%_120%_at_50%_80%,#1a0b3a,#0a0420_60%,#03010c)]" />

      {mounted && !reduced && (isLight ? <ProjectsDay /> : <ProjectsNight />)}

      {/* readability veil */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/60" />
    </div>
  );
}
