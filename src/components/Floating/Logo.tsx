"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Floating brand mark (bottom-right) → scrolls to top.
 * Premium, realistic feel: gentle bob, pulsing glow halo, a spinning
 * conic-gradient ring + counter-rotating dashed ring, a glass frame with soft
 * shadow + sheen, and a hover tooltip. All motion respects reduced-motion.
 */
export default function Logo() {
  const reduced = useReducedMotion();

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

  return (
    <motion.button
      onClick={toTop}
      aria-label="Back to top"
      className="group fixed bottom-6 right-6 z-50 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      initial={reduced ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.94 }}
    >
      {/* tooltip */}
      <span className="pointer-events-none absolute -top-9 right-0 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1 text-[10px] font-medium tracking-wide text-foreground/80 opacity-0 backdrop-blur transition-all duration-300 group-hover:-top-10 group-hover:opacity-100">
        Back to top
      </span>

      <motion.span
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid h-16 w-16 place-items-center"
      >
        {/* glow halo */}
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { opacity: [0.35, 0.75, 0.35], scale: [1, 1.18, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(34,211,238,0.55), rgba(168,85,247,0.25) 55%, transparent 72%)",
          }}
        />

        {/* spinning conic-gradient ring */}
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #22d3ee 90deg, transparent 200deg, #a855f7 300deg, transparent 360deg)",
            maskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
            WebkitMaskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
          }}
        />

        {/* counter-rotating dashed ring */}
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-full border border-dashed border-cyan-400/20"
        />

        {/* glass logo frame */}
        <span className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <Image
            src="/images/logo.png"
            alt="Jayraj logo"
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
          {/* sheen */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/25" />
        </span>
      </motion.span>
    </motion.button>
  );
}
