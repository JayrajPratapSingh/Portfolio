"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

const AuroraFlow = dynamic(() => import("./AuroraFlow"), { ssr: false });

/**
 * Navbar backdrop — a calm, professional 3D mesh-gradient (AuroraFlow) clipped to
 * the pill, over a static gradient base that also serves as the reduced-motion
 * fallback. Theme-aware (indigo/sky/violet by day, cyan/blue/violet at night).
 */
export default function NavBackground() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      {/* static gradient base (also the reduced-motion fallback) */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          isLight
            ? "bg-[radial-gradient(120%_150%_at_15%_0%,#eef1fb,transparent_70%),radial-gradient(120%_160%_at_90%_120%,#dfe6ff,transparent_70%)]"
            : "bg-[radial-gradient(120%_150%_at_15%_0%,#0a1030,transparent_70%),radial-gradient(120%_160%_at_90%_120%,#0a0820,transparent_70%)]",
        )}
      />

      {/* the 3D mesh-gradient */}
      {mounted && !reduced && (
        <div className="absolute inset-0 opacity-90">
          <AuroraFlow isLight={isLight} intensity={0.7} shapes={10} />
        </div>
      )}

      {/* soft glass gloss along the top edge */}
      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/20 to-transparent dark:from-white/[0.06]" />
    </div>
  );
}
