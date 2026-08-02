"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Day / night switch. A little sky in a pill: blue with drifting clouds by day,
 * deep indigo with stars by night, and a sun/moon knob that slides across on a
 * spring. Renders a neutral (day) state until mounted to avoid a hydration
 * mismatch. Works in both the light and cosmic-dark universes.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={
        !mounted
          ? "Toggle theme"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-9 w-16 shrink-0 overflow-hidden rounded-full border transition-colors duration-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        isDark
          ? "border-cyan-400/30 bg-gradient-to-b from-[#0b1026] to-[#050418]"
          : "border-amber-300/60 bg-gradient-to-b from-[#8ec5ff] to-[#dff0ff]",
        className,
      )}
    >
      {/* stars — night */}
      <span
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="absolute left-2 top-2 h-[2px] w-[2px] rounded-full bg-white" />
        <span className="absolute left-[18px] top-[22px] h-[2px] w-[2px] rounded-full bg-white/80" />
        <span className="absolute left-[26px] top-[9px] h-[3px] w-[3px] rounded-full bg-white" />
        <span className="absolute left-[9px] top-[24px] h-[2px] w-[2px] rounded-full bg-white/70" />
      </span>

      {/* clouds — day */}
      <span
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark ? "opacity-0" : "opacity-100",
        )}
      >
        <span className="absolute right-[8px] top-[7px] h-2 w-4 rounded-full bg-white/85 blur-[1px]" />
        <span className="absolute right-[18px] bottom-[6px] h-1.5 w-3 rounded-full bg-white/70 blur-[1px]" />
      </span>

      {/* sun / moon knob */}
      <motion.span
        initial={false}
        animate={{ x: isDark ? 32 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-1 left-0 grid h-7 w-7 place-items-center"
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.35 }}
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full",
            isDark
              ? "bg-gradient-to-b from-slate-100 to-slate-400 text-slate-700 shadow-[0_0_10px_rgba(226,232,240,0.5)]"
              : "bg-gradient-to-b from-amber-200 to-amber-500 text-amber-900 shadow-[0_0_14px_rgba(251,191,36,0.75)]",
          )}
        >
          {isDark ? <Moon size={14} /> : <Sun size={15} />}
        </motion.span>
      </motion.span>
    </button>
  );
}
