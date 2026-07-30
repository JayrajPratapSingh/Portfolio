"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Projects-page backdrop — a "systems horizon": a perspective blueprint grid
 * receding to a glowing line, over a cosmic (dark) / aurora (light) wash.
 * Pure CSS — replaces the old always-on R3F islands scene.
 */
export default function ProjectsBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_-10%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_100%_at_50%_-10%,#0a1220,#030712_60%,#000)]" />

      {/* top glows */}
      <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-indigo-400/20 blur-[150px] dark:bg-cyan-500/12" />
      <div className="absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-violet-300/20 blur-[150px] dark:bg-purple-500/12" />

      {/* perspective horizon grid */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] [perspective:600px]">
        <motion.div
          animate={reduced ? undefined : { backgroundPositionY: ["0px", "44px"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 origin-bottom [transform:rotateX(70deg)] bg-[linear-gradient(rgba(99,102,241,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.25)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40 [mask-image:linear-gradient(to_top,black,transparent)] dark:bg-[linear-gradient(rgba(34,211,238,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.22)_1px,transparent_1px)]"
        />
      </div>

      {/* horizon line glow */}
      <div className="absolute inset-x-0 bottom-[45vh] h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-[1px] dark:via-cyan-400/50" />

      {/* readability veil */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/45" />
    </div>
  );
}
