"use client";

import { motion, type MotionValue } from "framer-motion";

/**
 * DARK "Evolution" hero backdrop — the preserved cosmic identity, refined:
 * portrait, layered black gradients, engineering grid, counter-rotating orbit
 * rings and a purple mouse glow. Motion loops disabled under reduced-motion.
 */
export default function CosmicBackdrop({
  mouseX,
  mouseY,
  reduced,
  photo,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  reduced: boolean;
  photo: string;
}) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* portrait */}
      <motion.div
        animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${photo}')` }}
      />

      {/* depth gradients */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

      {/* engineering grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:52px_52px]" />

      {/* orbit rings */}
      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute right-[-120px] top-1/2 h-[440px] w-[440px] -translate-y-1/2 rounded-full border border-cyan-500/20"
      />
      <motion.div
        animate={reduced ? undefined : { rotate: -360 }}
        transition={{ duration: 19, repeat: Infinity, ease: "linear" }}
        className="absolute right-[-90px] top-1/2 h-[330px] w-[330px] -translate-y-1/2 rounded-full border border-purple-500/20"
      />
      <div className="absolute right-[10%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_20px_6px_rgba(34,211,238,.6)]" />

      {/* mouse glow */}
      <motion.div
        style={{ left: mouseX, top: mouseY }}
        className="pointer-events-none absolute z-10 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[90px]"
      />
    </div>
  );
}
