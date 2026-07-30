"use client";

import Image from "next/image";
import { motion, type MotionValue } from "framer-motion";

/**
 * LIGHT "New Universe" hero backdrop — Aurora Glass.
 * Soft off-white canvas, drifting indigo/sky/lavender aurora blobs, a faint
 * indigo blueprint grid, subtle grain, and the portrait in a floating glass
 * frame. Deliberately NOT an inverted dark mode. Motion respects reduced-motion.
 */
export default function AuroraBackdrop({
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
      {/* base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_10%_0%,#ffffff_0%,#f5f6fb_45%,#eef1fb_100%)]" />

      {/* aurora blobs */}
      <motion.div
        animate={reduced ? undefined : { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-20 top-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-400/40 blur-[110px]"
      />
      <motion.div
        animate={reduced ? undefined : { x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-8%] top-[8%] h-[480px] w-[480px] rounded-full bg-sky-300/45 blur-[120px]"
      />
      <motion.div
        animate={reduced ? undefined : { x: [0, 30, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] left-1/3 h-[420px] w-[420px] rounded-full bg-violet-300/40 blur-[120px]"
      />

      {/* blueprint grid */}
      <div className="absolute inset-0 opacity-[0.5] bg-[linear-gradient(rgba(99,102,241,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.07)_1px,transparent_1px)] bg-[size:58px_58px] [mask-image:radial-gradient(120%_80%_at_50%_0%,black,transparent)]" />

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* floating glass portrait frame */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute right-[6%] top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[360px] w-[300px] overflow-hidden rounded-[28px] border border-white/70 bg-white/40 p-2 shadow-[0_30px_80px_-20px_rgba(79,70,229,0.35)] backdrop-blur-xl xl:h-[420px] xl:w-[340px]"
        >
          <Image
            src={photo}
            alt=""
            fill
            sizes="340px"
            className="rounded-[22px] object-cover"
            priority
          />
          {/* sheen */}
          <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
        </motion.div>
      </motion.div>

      {/* indigo mouse glow */}
      <motion.div
        style={{ left: mouseX, top: mouseY }}
        className="pointer-events-none absolute z-10 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-[100px]"
      />
    </div>
  );
}
