"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Minimal, premium boot sequence: a softly-lit logo mark, the name revealing
 * letter by letter, and a slim determinate progress bar — then a clean fade
 * reveal. Bulletproof dismissal (fixed timeout, not coupled to the animation),
 * click-to-skip, and instant-skip under reduced-motion.
 */
const NAME = "JAYRAJ";
const ease = [0.22, 1, 0.36, 1] as const;

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
      () => setProgress((p) => Math.min(100, p + Math.floor(Math.random() * 7) + 3)),
      110,
    );
    const dismiss = setTimeout(() => setDone(true), 2400);
    return () => {
      clearInterval(iv);
      clearTimeout(dismiss);
      unlock();
    };
  }, [reduced]);

  useEffect(() => {
    if (done) unlock();
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, transition: { duration: 0.6, ease } }}
          onClick={() => setDone(true)}
          className="fixed inset-0 z-[9999] cursor-pointer overflow-hidden"
          style={{ background: "radial-gradient(120% 120% at 50% 30%, #0b0620 0%, #05010f 60%, #020008 100%)" }}
        >
          {/* faint aurora glows */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[110px]"
            />
            <motion.div
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[110px]"
            />
          </div>

          <motion.div
            exit={{ scale: 1.04, opacity: 0, transition: { duration: 0.5, ease } }}
            className="absolute inset-0 grid place-items-center"
          >
            <div className="flex w-[280px] max-w-[80vw] flex-col items-center">
              {/* logo mark with a thin sweeping arc */}
              <div className="relative grid h-24 w-24 place-items-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.9) 90deg, rgba(168,85,247,0.9) 180deg, transparent 260deg)",
                    maskImage:
                      "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
                    WebkitMaskImage:
                      "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
                  }}
                />
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease }}
                  className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_0_50px_rgba(34,211,238,0.25)] backdrop-blur-md"
                >
                  <Image src="/images/logo.png" alt="Jayraj" width={64} height={64} className="h-full w-full object-cover" />
                </motion.span>
              </div>

              {/* name */}
              <div className="mt-7 flex gap-[3px] text-lg font-bold tracking-[0.55em] text-white/90">
                {NAME.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 14, opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.5, ease }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/40"
              >
                Full Stack Engineer
              </motion.p>

              {/* slim progress */}
              <div className="mt-7 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #22d3ee, #6366f1, #a855f7)",
                  }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="mt-2 w-full text-right font-mono text-[10px] text-white/40">
                {progress}%
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
