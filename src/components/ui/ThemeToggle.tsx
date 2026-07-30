"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Accessible dark/light switch.
 * Renders a neutral placeholder until mounted to avoid a hydration mismatch
 * (server has no idea which theme resolved). Styled with design tokens so it
 * looks correct in both the cosmic-dark and the soft-light universes.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Before mount the server/client can't agree on the theme, so keep every
  // theme-derived value neutral until `mounted` to avoid a hydration mismatch.
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
        "relative grid h-10 w-10 place-items-center rounded-full",
        "border border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-xl",
        "text-foreground/80 transition-colors hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ y: 8, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -8, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
            className="grid place-items-center"
          >
            {isDark ? <Moon size={17} /> : <Sun size={17} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
