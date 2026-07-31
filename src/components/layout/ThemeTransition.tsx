"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Smooths the light/dark swap. The theme change remounts several R3F scenes,
 * which can flash or briefly stall; this overlay fades in with a small spinner
 * to cover the swap, then fades out — so the transition reads as intentional
 * instead of stuck. Skipped under reduced-motion.
 */
export default function ThemeTransition() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const prev = useRef<string | undefined>(undefined);
  const [flash, setFlash] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    if (!resolvedTheme) return;
    if (prev.current && prev.current !== resolvedTheme && !reduced) {
      setFlash(resolvedTheme as "dark" | "light");
      const t = setTimeout(() => setFlash(null), 650);
      prev.current = resolvedTheme;
      return () => clearTimeout(t);
    }
    prev.current = resolvedTheme;
  }, [resolvedTheme, reduced]);

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key="theme-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="pointer-events-none fixed inset-0 z-[9998] grid place-items-center"
          style={{
            background:
              flash === "dark"
                ? "radial-gradient(circle at 50% 50%, #0b0620 0%, #05010f 70%)"
                : "radial-gradient(circle at 50% 50%, #ffffff 0%, #eef1fb 70%)",
          }}
        >
          <motion.span
            initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-9 w-9 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: flash === "dark" ? "#22d3ee" : "#6366f1",
              borderRightColor: flash === "dark" ? "#a855f7" : "#8b5cf6",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
