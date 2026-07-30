"use client";

import { motion } from "framer-motion";

/**
 * Clean, dark-friendly navbar backdrop — smooth flowing light, no particles.
 * Two drifting aurora glows + a light orb travelling across + a soft sweep.
 * Theme-aware (indigo/violet by day, cyan/purple at night). CSS/transform only.
 */
export default function NavBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
    >
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

      {/* light orb travelling across */}
      <motion.div
        animate={{ x: ["-8%", "108%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-indigo-400/60 blur-md dark:bg-cyan-300/70"
      />

      {/* soft sweep */}
      <div className="absolute left-[-30%] top-0 h-full w-[30%] rotate-12 animate-[beam_7s_linear_infinite] bg-gradient-to-r from-transparent via-white/12 to-transparent" />
    </div>
  );
}
