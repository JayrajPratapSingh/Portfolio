"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Contact-page backdrop — a glowing "portal" of concentric rings over a
 * cosmic (dark) / aurora (light) wash. Pure CSS; replaces the heavy R3F
 * transmission-portal scene (7k stars) for a big perf win.
 */
export default function ContactBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_20%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_120%_at_30%_20%,#0a1220,#030712_60%,#000)]" />

      <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-indigo-400/20 blur-[150px] dark:bg-cyan-500/12" />
      <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-violet-300/20 blur-[150px] dark:bg-purple-500/12" />

      {/* portal rings */}
      <div className="absolute left-[18%] top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        {[520, 400, 280, 160].map((size, i) => (
          <motion.div
            key={size}
            animate={reduced ? undefined : { rotate: i % 2 ? 360 : -360, scale: [1, 1.04, 1] }}
            transition={{
              rotate: { duration: 40 + i * 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute rounded-full border border-indigo-400/15 dark:border-cyan-400/15"
            style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
          />
        ))}
        <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-indigo-500 blur-[1px] shadow-[0_0_50px_14px_rgba(99,102,241,0.5)] dark:bg-cyan-400 dark:shadow-[0_0_50px_14px_rgba(34,211,238,0.5)]" />
      </div>

      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.14)_1px,transparent_0)] bg-[size:30px_30px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]" />
      <div className="absolute inset-0 bg-white/10 dark:bg-black/45" />
    </div>
  );
}
