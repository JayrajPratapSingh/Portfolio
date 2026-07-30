"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * About-page backdrop — a CSS "neural core": concentric rotating rings + glow,
 * over a cosmic (dark) / aurora (light) wash. Replaces the previous always-on
 * R3F canvas (12k stars + distort orb) — same identity, near-zero cost.
 */
export default function AboutBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_120%_at_50%_-10%,#0a1020,#020617_60%,#000)]" />

      {/* corner glows */}
      <div className="absolute -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-[140px] dark:bg-cyan-500/15" />
      <div className="absolute -bottom-52 -right-52 h-[700px] w-[700px] rounded-full bg-sky-300/20 blur-[160px] dark:bg-blue-500/15" />

      {/* neural core rings */}
      <div className="absolute right-[6%] top-1/2 hidden -translate-y-1/2 lg:block">
        {[420, 320, 220].map((size, i) => (
          <motion.div
            key={size}
            animate={reduced ? undefined : { rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 30 + i * 8, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-indigo-400/20 dark:border-cyan-400/20"
            style={{
              width: size,
              height: size,
              left: -size / 2,
              top: -size / 2,
              borderStyle: i === 1 ? "dashed" : "solid",
            }}
          />
        ))}
        {/* core */}
        <motion.div
          animate={reduced ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-indigo-500 blur-[2px] shadow-[0_0_40px_10px_rgba(99,102,241,0.6)] dark:bg-cyan-400 dark:shadow-[0_0_40px_10px_rgba(34,211,238,0.6)]"
        />
      </div>

      {/* starfield / dotted grid */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.14)_1px,transparent_0)] bg-[size:30px_30px] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)]" />

      {/* readability veil */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/40" />
    </div>
  );
}
