"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import AuroraGradient from "./AuroraGradient";

/**
 * Navbar backdrop — a calm, professional mesh-gradient clipped to the pill,
 * over a static gradient base. Theme-aware (indigo/sky/violet by day,
 * cyan/blue/violet at night).
 *
 * This used to mount an `AuroraFlow` R3F canvas. Because the navbar renders on
 * every route, that pulled three.js and a live WebGL loop onto pages with no 3D
 * of their own. `AuroraGradient` reproduces the look in CSS at no main-thread
 * cost, and needs no reduced-motion gate of its own — the global
 * `prefers-reduced-motion` rule stops the drift while keeping the gradient.
 */
export default function NavBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      {/* static gradient base (renders before the theme resolves) */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          isLight
            ? "bg-[radial-gradient(120%_150%_at_15%_0%,#eef1fb,transparent_70%),radial-gradient(120%_160%_at_90%_120%,#dfe6ff,transparent_70%)]"
            : "bg-[radial-gradient(120%_150%_at_15%_0%,#0a1030,transparent_70%),radial-gradient(120%_160%_at_90%_120%,#0a0820,transparent_70%)]",
        )}
      />

      {/* the mesh-gradient */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-90">
          <AuroraGradient isLight={isLight} intensity={0.7} scale={0.85} blur={22} />
        </div>
      )}

      {/* soft glass gloss along the top edge */}
      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/20 to-transparent dark:from-white/[0.06]" />
    </div>
  );
}
