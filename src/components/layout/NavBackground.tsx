"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

const NavScene = dynamic(() => import("./NavScene"), { ssr: false });

/**
 * Navbar backdrop — a Three.js waveform (points ribbon) layered under two
 * drifting aurora glows and a light sweep. Theme-aware (indigo/violet by day,
 * cyan/purple at night). The 3D layer is skipped for reduced-motion users.
 */
export default function NavBackground() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
    >
      {/* animated gradient wash — visible in BOTH themes */}
      <div
        className={cn(
          "gradient-pan absolute inset-0 rounded-full opacity-50 dark:opacity-60",
          "bg-[linear-gradient(110deg,rgba(99,102,241,0.28),rgba(168,85,247,0.18),rgba(56,189,248,0.24),rgba(99,102,241,0.28))]",
          "dark:bg-[linear-gradient(110deg,rgba(34,211,238,0.22),rgba(168,85,247,0.2),rgba(59,130,246,0.24),rgba(34,211,238,0.22))]",
        )}
      />

      {/* Three.js waveform */}
      {mounted && !reduced && (
        <div className="absolute inset-0 opacity-70">
          <NavScene isLight={isLight} />
        </div>
      )}

      {/* drifting aurora glow 1 */}
      <motion.div
        animate={{ x: ["-25%", "25%", "-25%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-y-6 -left-10 w-2/3 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.4),transparent_60%)] blur-lg dark:bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.42),transparent_60%)]"
      />
      {/* drifting aurora glow 2 */}
      <motion.div
        animate={{ x: ["20%", "-20%", "20%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-y-6 -right-10 w-2/3 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.32),transparent_60%)] blur-lg dark:bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.4),transparent_60%)]"
      />

      {/* soft sweep */}
      <div className="absolute left-[-30%] top-0 h-full w-[30%] rotate-12 animate-[beam_7s_linear_infinite] bg-gradient-to-r from-transparent via-white/12 to-transparent" />
    </div>
  );
}
