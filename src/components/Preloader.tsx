"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A frontend-developer boot log. A small terminal types out a realistic dev
 * build sequence tied to load progress, then fades away — no cinematic reveal.
 * Bulletproof dismissal (fixed timeout), click-to-skip, reduced-motion skip.
 */
type Line = { at: number; kind: "cmd" | "info" | "ok"; text: string };

const LINES: Line[] = [
  { at: 0, kind: "cmd", text: "npm run dev" },
  { at: 18, kind: "info", text: "▲ Next.js 16 · Turbopack" },
  { at: 40, kind: "ok", text: "compiled client and server successfully" },
  { at: 62, kind: "ok", text: "mounting 3D universe · shaders ready" },
  { at: 84, kind: "ok", text: "hydration complete" },
  { at: 100, kind: "info", text: "ready — launching portfolio ✦" },
];

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
      120,
    );
    const dismiss = setTimeout(() => setDone(true), 2500);
    return () => {
      clearInterval(iv);
      clearTimeout(dismiss);
      unlock();
    };
  }, [reduced]);

  useEffect(() => {
    if (done) unlock();
  }, [done]);

  const visible = LINES.filter((l) => progress >= l.at);
  const bg = "radial-gradient(120% 120% at 50% 20%, #0b1020 0%, #060913 55%, #030509 100%)";
  const reveal = { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          onClick={() => setDone(true)}
          className="fixed inset-0 z-[9999] grid cursor-pointer place-items-center overflow-hidden px-5"
        >
          {/* curtain — two halves part from the centre to open the site */}
          <motion.div
            aria-hidden
            exit={{ x: "-100%", transition: reveal }}
            className="absolute inset-y-0 left-0 w-1/2"
            style={{ background: bg, boxShadow: "24px 0 60px rgba(0,0,0,0.45)" }}
          />
          <motion.div
            aria-hidden
            exit={{ x: "100%", transition: reveal }}
            className="absolute inset-y-0 right-0 w-1/2"
            style={{ background: bg, boxShadow: "-24px 0 60px rgba(0,0,0,0.45)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e1a]/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {/* title bar */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-white/40">~/jayraj-portfolio</span>
            </div>

            {/* body */}
            <div className="space-y-1.5 px-5 py-5 font-mono text-[13px] leading-relaxed">
              {visible.map((l, i) => {
                const last = i === visible.length - 1;
                return (
                  <motion.div
                    key={l.text}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2"
                  >
                    {l.kind === "cmd" ? (
                      <span className="text-emerald-400">$</span>
                    ) : l.kind === "ok" ? (
                      <span className="text-emerald-400">✓</span>
                    ) : (
                      <span className="text-cyan-400">›</span>
                    )}
                    <span className={l.kind === "cmd" ? "text-white" : "text-white/70"}>
                      {l.text}
                      {last && progress < 100 && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity }}
                          className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-cyan-400"
                        />
                      )}
                    </span>
                  </motion.div>
                );
              })}

              {/* progress */}
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-150 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #22d3ee, #6366f1, #a855f7)",
                    }}
                  />
                </div>
                <span className="w-9 text-right text-xs text-white/50">{progress}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
