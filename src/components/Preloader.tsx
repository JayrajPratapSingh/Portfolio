"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Cinematic "portal" intro shown on app load — concentric rotating rings, a
 * spinning conic light, the name assembling, a progress read-out, then a
 * warp-through reveal. Click to skip; skipped entirely under reduced-motion.
 * Rendered in the initial HTML so there's no flash of un-introed content.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + Math.random() * 11 + 5);
      setProgress(Math.floor(p));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setDone(true), 550);
      }
    }, 140);
    return () => {
      clearInterval(id);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  const name = "JAYRAJ";

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          onClick={() => setDone(true)}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#04010f]"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 50% 50%, #0b0524 0%, #04010f 60%, #000 100%)",
          }}
        >
          {/* warp-through portal */}
          <motion.div
            exit={{ scale: 9, opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }}
            className="relative grid h-72 w-72 place-items-center"
          >
            {/* outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-cyan-400/30"
              style={{ boxShadow: "0 0 60px rgba(34,211,238,0.25) inset" }}
            />
            {/* mid ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-6 rounded-full border border-fuchsia-400/30 border-dashed"
            />
            {/* spinning conic light */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-10 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.9) 60deg, transparent 140deg, rgba(168,85,247,0.9) 220deg, transparent 320deg)",
                maskImage:
                  "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                WebkitMaskImage:
                  "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
              }}
            />
            {/* pulsing core */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-20 w-20 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #ffffff 0%, #67e8f9 35%, rgba(103,232,249,0) 70%)",
                filter: "blur(2px)",
              }}
            />
          </motion.div>

          {/* name */}
          <div className="mt-12 flex gap-1 text-3xl font-black tracking-[0.4em] text-white md:text-4xl">
            {name.split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease: "easeOut" }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-3 text-[10px] uppercase tracking-[0.5em] text-cyan-300/70"
          >
            entering the portal
          </motion.p>

          {/* progress */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px w-48 overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <span className="w-9 font-mono text-xs text-white/60">{progress}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
