"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Cinematic boot sequence:
 *  - a dark aurora stage where the logo assembles inside rotating rings
 *  - a sci-fi status read-out + segmented progress
 *  - reveal: the screen splits open like blast doors to unveil the site
 *
 * Bulletproof dismissal (fixed timeout, not coupled to the animation),
 * click-to-skip, and instant-skip under reduced-motion.
 */
const STATUS = [
  { at: 0, label: "INITIALIZING SYSTEM" },
  { at: 30, label: "COMPILING SHADERS" },
  { at: 60, label: "LOADING SCENES" },
  { at: 90, label: "CALIBRATING PORTAL" },
  { at: 100, label: "READY" },
];

const door = [0.76, 0, 0.24, 1] as const;

export default function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const unlock = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  useEffect(() => {
    if (reduced) {
      setDone(true);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const iv = setInterval(
      () => setProgress((p) => Math.min(100, p + Math.floor(Math.random() * 8) + 4)),
      120,
    );
    const dismiss = setTimeout(() => setDone(true), 2900);
    return () => {
      clearInterval(iv);
      clearTimeout(dismiss);
      unlock();
    };
  }, [reduced]);

  useEffect(() => {
    if (done) unlock();
  }, [done]);

  const status = [...STATUS].reverse().find((s) => progress >= s.at)?.label ?? STATUS[0].label;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] cursor-pointer overflow-hidden"
          onClick={() => setDone(true)}
        >
          {/* blast doors */}
          <motion.div
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, delay: 0.3, ease: door }}
            className="absolute inset-x-0 top-0 h-1/2"
            style={{ background: "linear-gradient(180deg, #04010f 0%, #0b0524 100%)" }}
          />
          <motion.div
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, delay: 0.3, ease: door }}
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{ background: "linear-gradient(0deg, #04010f 0%, #0b0524 100%)" }}
          />

          {/* centre stage content */}
          <motion.div
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.35, ease: "easeInOut" } }}
            className="absolute inset-0 z-10 grid place-items-center"
          >
            {/* aurora glows */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <motion.div
                animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/3 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/25 blur-[90px]"
              />
              <motion.div
                animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-1/3 top-1/2 h-64 w-64 translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-[90px]"
              />
            </div>

            <div className="relative flex flex-col items-center">
              {/* assembling emblem */}
              <div className="relative grid h-40 w-40 place-items-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-cyan-400/25"
                />
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border border-dashed border-fuchsia-400/30"
                />
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(34,211,238,0.9) 70deg, transparent 150deg, rgba(168,85,247,0.9) 250deg, transparent 340deg)",
                    maskImage:
                      "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                    WebkitMaskImage:
                      "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                  }}
                />
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-[0_0_40px_rgba(34,211,238,0.4)] backdrop-blur-md"
                >
                  <Image src="/images/logo.png" alt="Jayraj logo" width={64} height={64} className="h-full w-full object-cover" />
                </motion.span>
              </div>

              {/* name */}
              <div className="mt-8 flex gap-1 text-2xl font-black tracking-[0.5em] text-white md:text-3xl">
                {"JAYRAJ".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>

              {/* status */}
              <div className="mt-4 h-4 font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={status}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {status}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* segmented progress */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-3 w-1 rounded-full transition-colors duration-200 ${
                        progress >= (i + 1) * 5 ? "bg-cyan-400" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-9 font-mono text-xs text-white/60">{progress}%</span>
              </div>
            </div>
          </motion.div>

          {/* seam flash */}
          <motion.div
            exit={{ opacity: [0, 1, 0], transition: { duration: 0.6, delay: 0.3 } }}
            className="absolute left-0 right-0 top-1/2 z-20 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
